import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Premium dark code theme
import html2pdf from 'html2pdf.js';
import { useDropzone } from 'react-dropzone';
import { Download, FileText, Code2, Loader2, PenTool, Sun, Moon, Maximize, Minimize, UploadCloud } from 'lucide-react';

// Configure Marked to use Highlight.js
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

export default function App() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown2PDF 🚀

Write your markdown here, and see the live rendered preview on the right. 

## Features
- **Real-time Preview**: Type on the left, see results instantly.
- **High-Quality PDF**: We use \`html2pdf.js\` for crisp, professional rendering.
- **Client-Side**: 100% private. No data sent to servers!

### Code Example
\`\`\`javascript
function greetings() {
  console.log("Hello, world!");
}
\`\`\`

### Tables
| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

> "The best way to predict the future is to invent it."
`);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedHtml, setParsedHtml] = useState('');
  const [pdfTheme, setPdfTheme] = useState('theme-default');
  
  // PDF Config State (Hardcoded for A4 Print)
  const margin = 15;
  const format = 'a4';
  const orientation = 'portrait';

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const printRef = useRef(null);

  // Apply dark mode class to body 
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Update parsed HTML when markdown changes
  useEffect(() => {
    // Config marked if needed (e.g. gfm, breaks)
    setParsedHtml(marked.parse(markdown));
  }, [markdown]);

  // File Drop Handler
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = () => {
        setMarkdown(reader.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .md file");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/markdown': ['.md'] },
    multiple: false
  });

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    
    const element = printRef.current;
    
    // PDF configuration options
    const options = {
      margin:       Number(margin),
      filename:     'markdown2pdf-document.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: format, orientation: orientation }
    };

    // Generate and download
    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => setIsGenerating(false))
      .catch((err) => {
        console.error("PDF generation failed:", err);
        setIsGenerating(false);
      });
  };

  return (
    <div className={`app-wrapper ${isFocusMode ? 'focus-mode' : ''}`}>
      {!isFocusMode && (
        <header className="app-header glass">
          <div className="app-title">
            <FileText size={28} color="var(--accent-color)" />
            <span>Markdown2PDF</span>
          </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            className="theme-select"
            value={pdfTheme} 
            onChange={(e) => setPdfTheme(e.target.value)}
            title="PDF Theme"
          >
            <option value="theme-default">Default Theme</option>
            <option value="theme-github">GitHub Style</option>
            <option value="theme-notion">Notion Style</option>
            <option value="theme-academic">Academic Paper</option>
          </select>

          <button 
            className="btn btn-primary"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="pulse" size={18} />
            ) : (
              <Download size={18} />
            )}
            {isGenerating ? 'Generating PDF...' : 'Download PDF'}
          </button>
          
          <div style={{ width: '1px', height: '30px', background: 'var(--surface-border)', margin: '0 5px' }}></div>
          
          <button 
            className="icon-btn" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            className="icon-btn" 
            onClick={() => setIsFocusMode(true)}
            title="Enter Focus Mode"
          >
            <Maximize size={20} />
          </button>
        </div>
      </header>
      )}

      {isFocusMode && (
        <button 
          className="exit-focus-btn glass"
          onClick={() => setIsFocusMode(false)}
          title="Exit Focus Mode"
        >
          <Minimize size={18} style={{ marginRight: '6px' }}/> Exit Focus Mode
        </button>
      )}

      <main className={`app-main ${isFocusMode ? 'focus-expanded' : ''}`}>
        {/* Editor Pane (With Dropzone) */}
        <div {...getRootProps()} className={`pane glass dropzone ${isDragActive ? 'drag-active' : ''}`}>
          <input {...getInputProps()} />
          <div className="pane-header">
            <PenTool size={16} />
            Editor
            {isDragActive && (
              <span className="drop-hint">
                <UploadCloud size={14} style={{ marginRight: '4px' }}/> 
                Drop .md file here
              </span>
            )}
          </div>
          <textarea
            className="markdown-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start typing your markdown here, or drag and drop a .md file..."
            spellCheck="false"
            style={{ paddingBottom: '25vh' }}
            onClick={(e) => e.stopPropagation()} // Prevent clicking textarea from opening file dialog
          />
        </div>

        {/* Live Preview Pane */}
        <div className="pane glass">
          <div className="pane-header" style={{ color: 'var(--accent-color)' }}>
            <Code2 size={16} />
            Live Preview
          </div>
          <div 
            className={`preview-content live-preview ${pdfTheme}`}
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        </div>
      </main>

      {/* Hidden container exclusively formatted for html2pdf.js generation */}
      <div className="sr-only">
        <div 
          ref={printRef} 
          className={`preview-content ${pdfTheme}`}
          style={{ 
            color: '#000', 
            background: '#fff', 
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            width: '800px', // Strict width matches A4 aspect closely, forcing tables to wrap
            maxWidth: '800px'
          }}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </div>
    </div>
  );
}

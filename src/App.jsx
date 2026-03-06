import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Premium dark code theme
import { Document, Page, pdf, StyleSheet, Font, Text, View } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
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


// Define base styles for the vector PDF
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11, // Standard body size for print
  },
});

// React-PDF HTML mapping styles (Fixes tables natively)
const pdfHtmlStyles = {
  body: {
    fontFamily: 'Helvetica',
    fontSize: 11, // 11pt body text
    lineHeight: 1.5,
    color: '#333333',
  },
  p: {
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 1.5,
  },
  ul: {
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 1.5,
  },
  ol: {
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 1.5,
  },
  li: {
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 1.5,
  },
  h1: { 
    fontSize: 20, 
    marginBottom: 12 
  },
  h2: { 
    fontSize: 16, 
    marginTop: 18, 
    marginBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#cccccc', 
    paddingBottom: 4 
  },
  h3: { 
    fontSize: 13, 
    marginTop: 12, 
    marginBottom: 6, 
    fontWeight: 'bold' 
  },
  table: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 9.5, // Slightly smaller for tables to fix squishing
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlign: 'left',
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 9.5, // Matches table size
  },
  '.pdf-pre': {
    backgroundColor: '#0d1117', // GitHub Dark Background
    color: '#c9d1d9',           // GitHub Dark Text
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  // highlight.js github-dark tokens
  '.hljs-keyword': { color: '#ff7b72' },
  '.hljs-function': { color: '#d2a8ff' },
  '.hljs-class': { color: '#d2a8ff' },
  '.hljs-title': { color: '#d2a8ff' },
  '.hljs-number': { color: '#79c0ff' },
  '.hljs-string': { color: '#a5d6ff' },
  '.hljs-comment': { color: '#8b949e' },
  '.hljs-built_in': { color: '#ffa657' },
  '.hljs-variable': { color: '#79c0ff' },
  '.hljs-attr': { color: '#79c0ff' },
  '.hljs-params': { color: '#c9d1d9' },
  '.hljs-type': { color: '#ff7b72' },
};

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
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

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

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    
    try {
      // Hack to fix react-pdf-html ignoring tags inside <pre> blocks
      // We convert <pre> to a generic <div> so the parser evaluates the inner syntax highlighting spans natively.
      // However, typical HTML collapses whitespace. To preserve the exact layout inside the PDF,
      // we manually convert all literal \n to <br/> and literal spaces to non-breaking spaces (\u00A0),
      // executing this ONLY on text nodes and stepping over the <span> tags injected by highlight.js.
      const pdfReadyHtml = parsedHtml.replace(
        /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
        (match, attrs, content) => {
          let formattedContent = content
            .replace(/\n/g, '<br/>')
            .split(/(<[^>]+>)/g)
            .map(part => {
              if (part.startsWith('<')) return part;
              return part.replace(/ /g, '\u00A0'); // Literal spaces to non-breaking spaces
            })
            .join('');
          return `<div class="pdf-pre"><code${attrs}>${formattedContent}</code></div>`;
        }
      );

      // Create the React-PDF Document component using the latest parsed HTML
      const MyDocument = (
        <Document>
          <Page size="A4" style={pdfStyles.page}>
            <Html 
              stylesheet={pdfHtmlStyles}
              components={{
                h1: (props) => <Text {...props} wrap={false} />,
                h2: (props) => <Text {...props} wrap={false} />,
                h3: (props) => <Text {...props} wrap={false} />,
                h4: (props) => <Text {...props} wrap={false} />
              }}
            >
              {pdfReadyHtml}
            </Html>
          </Page>
        </Document>
      );

      // Generate the PDF blob in memory
      const blob = await pdf(MyDocument).toBlob();
      
      // Trigger the browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'markdown2pdf-document.pdf';
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Vector PDF Generation failed:", error);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
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
            className="preview-content live-preview"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        </div>
      </main>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import { Download, FileText, Code2, Loader2, PenTool } from 'lucide-react';

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
  const printRef = useRef(null);

  // Update parsed HTML when markdown changes
  useEffect(() => {
    // Config marked if needed (e.g. gfm, breaks)
    setParsedHtml(marked.parse(markdown));
  }, [markdown]);

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    
    const element = printRef.current;
    
    // PDF configuration options
    const options = {
      margin:       15,
      filename:     'markdown2pdf-document.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
    <>
      <header className="app-header glass">
        <div className="app-title">
          <FileText size={28} color="var(--accent-color)" />
          <span>Markdown2PDF</span>
        </div>
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
      </header>

      <main className="app-main">
        {/* Editor Pane */}
        <div className="pane glass">
          <div className="pane-header">
            <PenTool size={16} />
            Editor
          </div>
          <textarea
            className="markdown-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start typing your markdown here..."
            spellCheck="false"
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

      {/* Hidden container exclusively formatted for html2pdf.js generation */}
      <div className="sr-only">
        <div 
          ref={printRef} 
          className="preview-content"
          style={{ 
            color: '#000', 
            background: '#fff', 
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            width: '800px', // Fixed width to ensure stable layout for A4 size canvas
            maxWidth: 'none'
          }}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </div>
    </>
  );
}

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
    paddingLeft: 15,
  },
  ol: {
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 1.5,
    paddingLeft: 15,
  },
  li: {
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 1.5,
  },
  h1: { 
    fontSize: 24, 
    marginBottom: 12,
    fontWeight: 'bold',
  },
  h2: { 
    fontSize: 20, 
    marginTop: 18, 
    marginBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#cccccc', 
    paddingBottom: 4,
    fontWeight: 'bold',
  },
  h3: { 
    fontSize: 16, 
    marginTop: 12, 
    marginBottom: 6, 
    fontWeight: 'bold' 
  },
  h4: { 
    fontSize: 14, 
    marginTop: 10, 
    marginBottom: 4, 
    fontWeight: 'bold' 
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#d0d0d0',
    paddingLeft: 12,
    color: '#555555',
    marginTop: 10,
    marginBottom: 10,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginTop: 20,
    marginBottom: 20,
  },
  a: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  table: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    fontSize: 9.5, // Slightly smaller for tables to fix squishing
  },
  th: {
    backgroundColor: '#f3f3f3',
    padding: '8px 10px',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  td: {
    padding: '8px 10px',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    textAlign: 'left',
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 9.5, // Matches table size
  },
  img: {
    maxWidth: '100%',
    marginTop: 12,
    marginBottom: 12,
    // react-pdf forces objectFit="contain" natively,
    // so maxWidth acts as a responsive boundary constraint.
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
  const [markdown, setMarkdown] = useState(`# Markdown Rendering Stress Test

This document checks whether a Markdown renderer and PDF exporter behave correctly under multiple formatting conditions.

---

# 1 Headings

## Heading Level 2
### Heading Level 3
#### Heading Level 4

Headings should maintain correct font size hierarchy.

---

# 2 Text Formatting

Normal text.

**Bold text**

*Italic text*

~~Strikethrough text~~

> This is a blockquote.
> It should appear visually separated from normal content.

Inline code example: \`const version = "1.0.0";\`

---

# 3 Links

External link
[OpenAI](https://openai.com)

Documentation link
[Markdown Guide](https://www.markdownguide.org)

---

# 4 Images

Small image:

![Small Placeholder](https://via.placeholder.com/200x120)

Medium image:

![Medium Placeholder](https://via.placeholder.com/500x250)

Images should maintain aspect ratio and not overflow page width.

---

# 5 Lists

## Unordered List

- Item 1
- Item 2
- Item 3
  - Nested Item A
  - Nested Item B
    - Deep Nested Item

## Ordered List

1. Step one
2. Step two
3. Step three

---

# 6 Table Test

| Name | Role | Experience | Location |
|-----|------|-----------|----------|
| Alice | Frontend Developer | 3 Years | London |
| Bob | Backend Developer | 5 Years | New York |
| Charlie | Full Stack Developer | 4 Years | Berlin |

---

# 7 Wide Table Stress Test

| Feature | Description | Expected Result |
|--------|-------------|----------------|
| Markdown Parsing | The renderer should correctly interpret all Markdown syntax | Works without formatting issues |
| Image Rendering | Images should scale automatically | Images fit within page width |
| Table Layout | Tables should maintain alignment and borders | Columns align correctly |
| Code Blocks | Code blocks should use monospace fonts | Code formatting preserved |

---

# 8 Code Block Rendering

Example JavaScript code:

\`\`\`javascript
function orderFood(item) {
  const order = {
    item: item,
    status: "pending",
    time: new Date()
  };

  console.log("Order created:", order);
}

orderFood("Sandwich");
\`\`\`

Example Python code:

\`\`\`python
def process_queue(queue):
    for user in queue:
        print("Allow ordering for:", user)

users = ["user1", "user2", "user3"]
process_queue(users)
\`\`\`

---

# 9 Mixed Content

Here is **bold text**, *italic text*, a \`code snippet\`, and a [link](https://example.com) in the same sentence.

---

# 10 Horizontal Rule Test

Below this line should appear a horizontal divider.

---

Content continues after the divider.

---

# 11 Long Paragraph Wrapping

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae sapien vel augue tempor tempor. Curabitur vehicula lectus in lorem dignissim, sed tempor erat elementum. Donec posuere, velit vel egestas elementum, mauris nisl vestibulum sapien, id tincidunt risus lorem id mi. This paragraph is intentionally long to verify proper text wrapping in both the browser renderer and exported PDF layout.

---

End of Markdown rendering test.
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
    // Hack: marked requires a blank line before a table to parse it as a table instead of a paragraph.
    // Users often paste tables without blank lines. 
    // This regex looks for a pipe `|` line following a non-blank, non-pipe line and injects a newline.
    const preProcessedMarkdown = markdown.replace(/([^|\n])\s*\n(\s*\|)/g, '$1\n\n$2');
    
    setParsedHtml(marked.parse(preProcessedMarkdown));
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


import React, { useMemo } from 'react';

interface PreviewerProps {
  content: string;
  className?: string;
  isMathOnly?: boolean;
}

const Previewer: React.FC<PreviewerProps> = ({ content, className = "", isMathOnly = false }) => {
  const renderedContent = useMemo(() => {
    if (!content) return "";
    
    // Hard strip of any technical characters that might leak
    const cleanContent = content.replace(/\$/g, '');

    // Check if KaTeX is available globally from index.html
    const katex = (window as any).katex;

    if (!katex) return cleanContent;

    try {
      if (isMathOnly || (cleanContent.includes('\\') && !cleanContent.includes(' '))) {
        // If it's purely a math formula, render it as a block
        return katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false
        });
      } else if (cleanContent.includes('\\')) {
        // Mixed text and math. We attempt to render it using the auto-render logic
        // but for reliability in React, we'll wrap identified LaTeX parts.
        // Simple heuristic: if a word starts with \, treat it as math context for the line.
        return katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false
        });
      }
    } catch (e) {
      console.error("Math rendering failed", e);
    }

    return cleanContent.replace(/\n/g, '<br/>');
  }, [content, isMathOnly]);

  return (
    <div 
      className={`math-rendered-container ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default Previewer;

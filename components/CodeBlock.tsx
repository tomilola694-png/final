
import React from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  title: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, title }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex flex-col rounded-lg border border-zinc-800 bg-black overflow-hidden my-4 shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs font-semibold text-pink-500 uppercase tracking-wider">{title} ({language})</span>
        <button 
          onClick={copyToClipboard}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-pink-400 px-2 py-1 rounded transition-colors"
        >
          Copy
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm text-pink-100 leading-relaxed whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;

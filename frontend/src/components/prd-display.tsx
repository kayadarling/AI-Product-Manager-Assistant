'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PRDDocument } from '@/types';

interface PRDDisplayProps {
  prd: PRDDocument;
}

export function PRDDisplay({ prd }: PRDDisplayProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-600 mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-600">{children}</li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-red-500 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 rounded-lg overflow-hidden">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-500 my-4">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-gray-200" />,
        }}
      >
        {prd.markdown}
      </ReactMarkdown>
    </div>
  );
}

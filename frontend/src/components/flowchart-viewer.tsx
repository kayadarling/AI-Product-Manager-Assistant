'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { GitBranch, Copy, Check, AlertCircle } from 'lucide-react';

interface FlowchartViewerProps {
  code: string;
  title?: string;
}

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#fff',
    primaryBorderColor: '#2563eb',
    lineColor: '#6b7280',
    secondaryColor: '#f3f4f6',
    tertiaryColor: '#f9fafb',
  },
});

export function FlowchartViewer({ code, title }: FlowchartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    if (!code) return;

    const renderDiagram = async () => {
      setError(null);
      
      try {
        // 生成唯一ID
        const id = `mermaid-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);
        setSvg(renderedSvg);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError(err.message || '渲染失败');
      }
    };

    renderDiagram();
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  if (!code) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3" />
          <p>暂无流程图</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">流程图渲染失败</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">{title}</h4>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制代码
              </>
            )}
          </button>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="bg-white rounded-lg border border-gray-200 p-4 overflow-x-auto flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {/* 代码预览 */}
      <details className="mt-3">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          查看Mermaid代码
        </summary>
        <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
          <code>{code}</code>
        </pre>
      </details>
    </div>
  );
}

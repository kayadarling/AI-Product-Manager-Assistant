'use client';

import { FileDown, FileText, File } from 'lucide-react';
import { PRDDocument } from '@/types';
import { downloadMarkdown, downloadBlob } from '@/lib/utils';
import { exportDocx } from '@/lib/api';

interface ExportPanelProps {
  prd: PRDDocument;
}

export function ExportPanel({ prd }: ExportPanelProps) {
  const handleExportMarkdown = () => {
    downloadMarkdown(prd.markdown, 'PRD.md');
  };

  const handleExportDocx = async () => {
    try {
      const blob = await exportDocx(prd);
      downloadBlob(blob, 'PRD.docx');
    } catch (error) {
      console.error('Failed to export docx:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExportMarkdown}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Markdown
      </button>

      <button
        onClick={handleExportDocx}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <File className="w-4 h-4" />
        Word
      </button>
    </div>
  );
}

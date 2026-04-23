import { PRDDocument } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export function exportToMarkdown(doc: PRDDocument): string {
  let markdown = doc.markdown;
  
  if (doc.flowchart) {
    markdown += `\n## 4. 流程图\n\n\`\`\`mermaid\n${doc.flowchart}\n\`\`\`\n`;
  }

  return markdown;
}

export function exportToDocx(doc: PRDDocument): Buffer {
  const markdown = exportToMarkdown(doc);
  
  const docxContent = generateSimpleDocx(markdown);
  return Buffer.from(docxContent, 'utf-8');
}

function generateSimpleDocx(markdown: string): string {
  const lines = markdown.split('\n');
  let content = '';
  let inCodeBlock = false;
  let inList = false;
  let listIndex = 0;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        content += `<w:p><w:r><w:t xml:space="preserve"></w:t></w:r></w:p>`;
      }
      continue;
    }

    if (inCodeBlock) {
      content += `<w:p><w:r><w:rPr><w:color w:val="FF6B6B"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
      continue;
    }

    if (line.startsWith('# ')) {
      content += `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escapeXml(line.substring(2))}</w:t></w:r></w:p>`;
      continue;
    }

    if (line.startsWith('## ')) {
      content += `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${escapeXml(line.substring(3))}</w:t></w:r></w:p>`;
      continue;
    }

    if (line.startsWith('### ')) {
      content += `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t>${escapeXml(line.substring(4))}</w:t></w:r></w:p>`;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        inList = true;
        listIndex = 0;
      }
      content += `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(line.substring(2))}</w:t></w:r></w:p>`;
      continue;
    } else if (inList && line.trim() === '') {
      inList = false;
      continue;
    }

    if (line.trim() === '') {
      content += `<w:p><w:r><w:t xml:space="preserve"></w:t></w:r></w:p>`;
      continue;
    }

    const processedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r>')
      .replace(/`([^`]+)`/g, '<w:r><w:rPr><w:color w:val="FF6B6B"/></w:rPr><w:t>$1</w:t></w:r>');

    content += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(processedLine)}</w:t></w:r></w:p>`;
  }

  return generateDocxXml(content);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateDocxXml(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${content}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

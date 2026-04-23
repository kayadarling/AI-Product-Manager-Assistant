import { 
  GenerateRequest, 
  GenerateResponse, 
  AnalyzeRequest, 
  AnalyzeResponse, 
  AnalyzeResult 
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PRDGenerationResponse {
  success: boolean;
  data?: {
    markdown: string;
    wordCount: number;
  };
  error?: string;
}

export interface FlowchartGenerationResponse {
  success: boolean;
  data?: {
    code: string;
    flows: string[];
  };
  error?: string;
}

export async function analyzeRequirement(
  requirement: string,
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<AnalyzeResponse> {
  const request: AnalyzeRequest = {
    requirement,
    apiKey,
    baseUrl,
    model,
  };

  const response = await fetch(`${API_BASE}/api/analyze/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '分析失败');
  }

  return response.json();
}

/**
 * 基于分析结果生成PRD文档
 */
export async function generatePRDFromAnalysis(
  analysis: AnalyzeResult,
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<PRDGenerationResponse> {
  const response = await fetch(`${API_BASE}/api/prd-generation/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      原始需求: '基于分析结果生成',
      用户角色: analysis.用户角色,
      核心功能: analysis.核心功能,
      用户流程: analysis.用户流程,
      apiKey,
      baseUrl,
      model,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成PRD失败');
  }

  return response.json();
}

/**
 * 生成流程图
 */
export async function generateFlowchart(
  产品名称: string,
  用户流程: AnalyzeResult['用户流程'],
  apiKey: string,
  baseUrl?: string,
  model?: string
): Promise<FlowchartGenerationResponse> {
  const response = await fetch(`${API_BASE}/api/flowchart/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      产品名称,
      用户流程,
      apiKey,
      baseUrl,
      model,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '生成流程图失败');
  }

  return response.json();
}

export async function generatePRD(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/api/prd/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate PRD');
  }

  return response.json();
}

export async function exportMarkdown(markdown: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/export/markdown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ markdown }),
  });

  if (!response.ok) {
    throw new Error('Failed to export markdown');
  }

  return response.blob();
}

export async function exportDocx(doc: any): Promise<Blob> {
  const response = await fetch(`${API_BASE}/api/export/docx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    throw new Error('Failed to export docx');
  }

  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

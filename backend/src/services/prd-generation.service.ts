import { LLMConfig } from '../types';
import { callLLM } from './llm.service';
import { PRDGenerationInput } from '../prompts/prd.prompt';

export async function generatePRDFromAnalysis(
  input: PRDGenerationInput,
  config: LLMConfig
): Promise<string> {
  const { PRD_SYSTEM_PROMPT, buildPRDUserPrompt } = await import('../prompts/prd.prompt');
  
  const userPrompt = buildPRDUserPrompt(input);
  const response = await callLLM(config, PRD_SYSTEM_PROMPT, userPrompt);
  
  // 清理响应，移除可能的markdown代码块标记
  let markdown = response.trim();
  markdown = markdown.replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  
  // 确保文档以标题开头
  if (!markdown.startsWith('#')) {
    throw new Error('生成的PRD格式不正确');
  }
  
  // 添加版本信息（如果没有的话）
  if (!markdown.includes('版本信息') && !markdown.includes('版本号')) {
    const today = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    markdown += `\n\n---\n\n## 文档信息\n\n| 项目 | 内容 |\n|------|------|\n| 版本 | v1.0 |\n| 日期 | ${today} |\n| 作者 | AI产品经理助手 |`;
  }
  
  return markdown;
}

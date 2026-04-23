import { LLMConfig, AnalyzeResult } from '../types';
import { callLLM } from './llm.service';
import { ANALYZE_SYSTEM_PROMPT } from '../prompts/analyze.prompt';

export async function analyzeRequirement(
  requirement: string,
  config: LLMConfig
): Promise<AnalyzeResult> {
  const userPrompt = `请分析以下产品需求：\n\n${requirement}`;
  
  const response = await callLLM(config, ANALYZE_SYSTEM_PROMPT, userPrompt);
  
  return parseAnalyzeResponse(response);
}

function parseAnalyzeResponse(response: string): AnalyzeResult {
  // 尝试多种方式提取JSON
  let jsonStr = response.trim();
  
  // 移除可能的markdown代码块标记
  jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  jsonStr = jsonStr.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  
  // 尝试找到JSON对象
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析AI返回结果，请重试');
  }
  
  jsonStr = jsonMatch[0];
  
  try {
    const result = JSON.parse(jsonStr);
    
    // 验证必要字段
    if (!Array.isArray(result['用户角色'])) {
      throw new Error('缺少用户角色字段');
    }
    if (!Array.isArray(result['核心功能'])) {
      throw new Error('缺少核心功能字段');
    }
    if (!Array.isArray(result['用户流程'])) {
      throw new Error('缺少用户流程字段');
    }
    
    return result as AnalyzeResult;
  } catch (error: any) {
    console.error('JSON parse error:', error);
    console.error('Raw response:', response);
    throw new Error(`解析失败: ${error.message}`);
  }
}

import { LLMConfig } from '../types';
import { callLLM } from './llm.service';
import { FlowchartGenerationInput, parseAndValidateMermaid } from '../prompts/flowchart.prompt';

export interface FlowchartResult {
  code: string;
  flows: string[];  // 各个流程的代码片段
}

export async function generateFlowchart(
  input: FlowchartGenerationInput,
  config: LLMConfig
): Promise<FlowchartResult> {
  const { FLOWCHART_SYSTEM_PROMPT, buildFlowchartUserPrompt } = await import('../prompts/flowchart.prompt');
  
  const userPrompt = buildFlowchartUserPrompt(input);
  const response = await callLLM(config, FLOWCHART_SYSTEM_PROMPT, userPrompt);
  
  const validation = parseAndValidateMermaid(response);
  
  if (!validation.valid) {
    console.warn('Flowchart validation failed:', validation.error);
    // 尝试修复常见问题
    const fixed = tryFixCommonIssues(validation.code);
    return {
      code: fixed,
      flows: extractFlowCodes(fixed, input.用户流程.length),
    };
  }
  
  return {
    code: validation.code,
    flows: extractFlowCodes(validation.code, input.用户流程.length),
  };
}

/**
 * 提取各个流程的代码片段
 */
function extractFlowCodes(code: string, flowCount: number): string[] {
  // 简单实现：按节点数量平均分配
  // 实际上Mermaid会把多个流程合并成一个图
  return [code];
}

/**
 * 尝试修复常见的Mermaid语法问题
 */
function tryFixCommonIssues(code: string): string {
  let fixed = code;
  
  // 确保有flowchart声明
  if (!fixed.includes('flowchart')) {
    fixed = 'flowchart TD\n' + fixed;
  }
  
  // 修复缺少的连接符
  fixed = fixed.replace(/([^\n])\s*([A-Z]\w*\[)/g, '$1 --> $2');
  
  // 修复多余的换行
  fixed = fixed.replace(/\n{3,}/g, '\n\n');
  
  return fixed;
}

/**
 * 单独为一个流程生成流程图
 */
export async function generateSingleFlowchart(
  flowName: string,
  steps: Array<{ 步骤序号: number; 用户动作: string; 系统响应: string }>,
  config: LLMConfig
): Promise<string> {
  const { FLOWCHART_SYSTEM_PROMPT, parseAndValidateMermaid } = await import('../prompts/flowchart.prompt');
  
  const userPrompt = `
请为以下用户流程生成Mermaid流程图：

流程名称：${flowName}

步骤：
${steps.map(s => `${s.步骤序号}. 用户：${s.用户动作} → 系统：${s.系统响应}`).join('\n')}

要求：
1. 只返回Mermaid代码，不要其他内容
2. 节点用中文，简洁明了
3. 包含开始和结束节点`;

  const response = await callLLM(config, FLOWCHART_SYSTEM_PROMPT, userPrompt);
  const validation = parseAndValidateMermaid(response);
  
  return validation.valid ? validation.code : tryFixCommonIssues(validation.code);
}

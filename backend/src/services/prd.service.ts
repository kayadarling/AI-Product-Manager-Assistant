import { v4 as uuidv4 } from 'uuid';
import { LLMConfig, PRDDocument } from '../types';
import { callLLM } from './llm.service';
import {
  PRD_SYSTEM_PROMPT,
  buildPRDUserPrompt,
} from '../prompts';

interface ParsedPRD {
  roles: Array<{ name: string; description: string; goals: string[] }>;
  features: Array<{ name: string; description: string; acceptanceCriteria: string[] }>;
  userFlows: Array<{ name: string; steps: Array<{ order: number; action: string; description: string }> }>;
}

export async function generatePRD(
  requirement: string,
  config: LLMConfig
): Promise<PRDDocument> {
  const userPrompt = buildPRDUserPrompt(requirement);
  const response = await callLLM(config, PRD_SYSTEM_PROMPT, userPrompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse PRD response');
  }

  const parsed: ParsedPRD = JSON.parse(jsonMatch[0]);
  
  const markdown = generateMarkdown(requirement, parsed);

  return {
    id: uuidv4(),
    requirementId: uuidv4(),
    roles: parsed.roles,
    features: parsed.features,
    userFlows: parsed.userFlows,
    flowchart: '',
    markdown,
  };
}

function generateMarkdown(requirement: string, parsed: ParsedPRD): string {
  let md = `# 产品需求文档\n\n`;
  md += `> **需求描述**: ${requirement}\n\n`;
  md += `---\n\n`;
  
  md += `## 1. 用户角色\n\n`;
  parsed.roles.forEach((role, idx) => {
    md += `### ${idx + 1}. ${role.name}\n`;
    md += `${role.description}\n\n`;
    md += `**目标**:\n`;
    role.goals.forEach(goal => md += `- ${goal}\n`);
    md += `\n`;
  });

  md += `## 2. 核心功能\n\n`;
  parsed.features.forEach((feature, idx) => {
    md += `### ${idx + 1}. ${feature.name}\n`;
    md += `${feature.description}\n\n`;
    md += `**验收标准**:\n`;
    feature.acceptanceCriteria.forEach(criteria => md += `- ${criteria}\n`);
    md += `\n`;
  });

  md += `## 3. 用户流程\n\n`;
  parsed.userFlows.forEach((flow, idx) => {
    md += `### ${idx + 1}. ${flow.name}\n`;
    flow.steps.forEach(step => {
      md += `${step.order}. **${step.action}**: ${step.description}\n`;
    });
    md += `\n`;
  });

  md += `---\n\n`;
  md += `*文档生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;

  return md;
}

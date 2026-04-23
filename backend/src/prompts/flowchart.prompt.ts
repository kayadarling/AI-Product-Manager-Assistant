/**
 * 流程图生成Prompt
 * 
 * 设计原则：
 * 1. 输出标准Mermaid语法
 * 2. 节点命名规范（中文、简洁）
 * 3. 流程清晰（开始→步骤→判断→结束）
 * 4. 支持并行分支和循环
 */

export interface FlowchartInput {
  流程名称: string;
  流程步骤: Array<{
    步骤序号: number;
    用户动作: string;
    系统响应: string;
  }>;
}

export interface FlowchartGenerationInput {
  产品名称: string;
  用户流程: FlowchartInput[];
}

export const FLOWCHART_SYSTEM_PROMPT = `你是一个产品流程设计专家，擅长将用户流程转换为标准Mermaid流程图代码。

请严格按以下要求输出：

1. **图表类型**：使用 flowchart TD（从上到下）或 flowchart LR（从左到右）
2. **节点ID规则**：
   - 使用单字母+数字，如 A, B, C, A1, B1
   - 同一分支连续编号
3. **节点形状**：
   - 开始/结束：[圆角矩形] 用 (文字) 或 ((圆圈))
   - 操作步骤：[矩形] 用 [文字]
   - 判断分支：[菱形] 用 {文字}
   - 子流程：[六边形] 用 {{文字}}
4. **连接线**：
   - 直线：-->
   - 带标签：-->|标签|
5. **命名规范**：
   - 每个节点文字不超过15个字
   - 使用动词开头（如：输入手机号、选择充电桩）
   - 判断节点用问句（如：是否登录？）

**示例格式**：
\`\`\`mermaid
flowchart TD
    A[开始] --> B[用户打开App]
    B --> C[/输入手机号/]
    C --> D{是否已注册?}
    D -->|是| E[输入密码]
    D -->|否| F[输入验证码]
    E --> G[登录成功]
    F --> G
    G --> H[进入首页]
    H --> I[结束]
\`\`\`

注意：
- 只返回Mermaid代码，不要有其他内容
- 不要用markdown代码块包裹
- 确保语法正确，可直接渲染`;

export function buildFlowchartUserPrompt(input: FlowchartGenerationInput): string {
  let prompt = `请为以下产品生成Mermaid流程图：\n\n`;
  prompt += `产品名称：${input.产品名称}\n\n`;
  
  prompt += `## 用户流程\n\n`;
  input.用户流程.forEach((flow, idx) => {
    prompt += `### 流程${idx + 1}：${flow.流程名称}\n`;
    flow.流程步骤.forEach(step => {
      prompt += `${step.步骤序号}. 用户动作：${step.用户动作} → 系统响应：${step.系统响应}\n`;
    });
    prompt += '\n';
  });
  
  prompt += `\n请生成标准Mermaid流程图代码，只返回代码。`;
  
  return prompt;
}

/**
 * 解析并验证Mermaid代码
 */
export function parseAndValidateMermaid(code: string): { valid: boolean; code: string; error?: string } {
  let cleaned = code.trim();
  
  // 移除markdown代码块标记
  cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  
  // 验证基本语法
  if (!cleaned.startsWith('flowchart')) {
    return { valid: false, code: cleaned, error: '缺少flowchart声明' };
  }
  
  // 验证括号匹配
  const openParens = (cleaned.match(/\[/g) || []).length;
  const closeParens = (cleaned.match(/\]/g) || []).length;
  if (openParens !== closeParens) {
    return { valid: false, code: cleaned, error: '方括号不匹配' };
  }
  
  return { valid: true, code: cleaned };
}

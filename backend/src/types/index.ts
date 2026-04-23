export interface UserRole {
  name: string;
  description: string;
  goals: string[];
}

export interface CoreFeature {
  name: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface FlowStep {
  order: number;
  action: string;
  description: string;
}

export interface UserFlow {
  name: string;
  steps: FlowStep[];
}

export interface PRDDocument {
  id: string;
  requirementId: string;
  roles: UserRole[];
  features: CoreFeature[];
  userFlows: UserFlow[];
  flowchart: string;
  markdown: string;
}

export interface GenerateRequest {
  requirement: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: PRDDocument;
  error?: string;
}

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// 需求分析结果
export interface AnalyzeRole {
  角色名称: string;
  角色描述: string;
  使用场景: string[];
}

export interface AnalyzeFeature {
  功能名称: string;
  功能描述: string;
  优先级: 'P0' | 'P1' | 'P2';
  子功能点: string[];
}

export interface AnalyzeFlowStep {
  步骤序号: number;
  用户动作: string;
  系统响应: string;
}

export interface AnalyzeFlow {
  流程名称: string;
  流程步骤: AnalyzeFlowStep[];
}

export interface AnalyzeResult {
  用户角色: AnalyzeRole[];
  核心功能: AnalyzeFeature[];
  用户流程: AnalyzeFlow[];
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalyzeResult;
  error?: string;
}

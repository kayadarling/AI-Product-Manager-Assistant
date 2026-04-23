import { Router, Request, Response } from 'express';
import { generatePRDFromAnalysis } from '../services/prd-generation.service';
import { LLMConfig } from '../types';

const router = Router();

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

interface GeneratePRDRequest {
  原始需求: string;
  用户角色: Array<{
    角色名称: string;
    角色描述: string;
    使用场景: string[];
  }>;
  核心功能: Array<{
    功能名称: string;
    功能描述: string;
    优先级: string;
    子功能点: string[];
  }>;
  用户流程: Array<{
    流程名称: string;
    流程步骤: Array<{
      步骤序号: number;
      用户动作: string;
      系统响应: string;
    }>;
  }>;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const body: GeneratePRDRequest = req.body;

    if (!body.原始需求) {
      res.status(400).json({
        success: false,
        error: '原始需求不能为空',
      });
      return;
    }

    if (!body.用户角色 || !body.核心功能 || !body.用户流程) {
      res.status(400).json({
        success: false,
        error: '缺少必要的分析数据（用户角色、核心功能、用户流程）',
      });
      return;
    }

    const config: LLMConfig = {
      apiKey: body.apiKey || DEFAULT_CONFIG.apiKey,
      baseUrl: body.baseUrl || DEFAULT_CONFIG.baseUrl,
      model: body.model || DEFAULT_CONFIG.model,
    };

    if (!config.apiKey) {
      res.status(400).json({
        success: false,
        error: '请提供API Key',
      });
      return;
    }

    const markdown = await generatePRDFromAnalysis(body, config);

    res.json({
      success: true,
      data: {
        markdown,
        wordCount: markdown.length,
      },
    });
  } catch (error: any) {
    console.error('Generate PRD error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成PRD失败，请重试',
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { generateFlowchart } from '../services/flowchart.service';
import { LLMConfig } from '../types';

const router = Router();

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

interface FlowchartRequest {
  产品名称: string;
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
    const body: FlowchartRequest = req.body;

    if (!body.产品名称) {
      res.status(400).json({
        success: false,
        error: '产品名称不能为空',
      });
      return;
    }

    if (!body.用户流程 || body.用户流程.length === 0) {
      res.status(400).json({
        success: false,
        error: '用户流程不能为空',
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

    const result = await generateFlowchart(
      {
        产品名称: body.产品名称,
        用户流程: body.用户流程,
      },
      config
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Generate flowchart error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成流程图失败',
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { GenerateRequest, GenerateResponse, LLMConfig } from '../types';

const router = Router();

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

// 旧的generate接口保留用于兼容，新功能使用/api/prd-generation/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { requirement, apiKey, baseUrl, model }: GenerateRequest = req.body;

    if (!requirement) {
      res.status(400).json({
        success: false,
        error: 'Requirement is required',
      } as GenerateResponse);
      return;
    }

    const config: LLMConfig = {
      apiKey: apiKey || DEFAULT_CONFIG.apiKey,
      baseUrl: baseUrl || DEFAULT_CONFIG.baseUrl,
      model: model || DEFAULT_CONFIG.model,
    };

    if (!config.apiKey) {
      res.status(400).json({
        success: false,
        error: 'API key is required. Please provide apiKey in request body or set OPENAI_API_KEY environment variable.',
      } as GenerateResponse);
      return;
    }

    // 返回提示使用新的API
    res.json({
      success: false,
      error: '请使用 /api/prd-generation/generate 接口生成PRD',
    } as GenerateResponse);
  } catch (error: any) {
    console.error('Generate PRD error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PRD',
    } as GenerateResponse);
  }
});

export default router;

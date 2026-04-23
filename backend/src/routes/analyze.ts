import { Router, Request, Response } from 'express';
import { analyzeRequirement } from '../services/analyze.service';
import { LLMConfig } from '../types';

const router = Router();

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
};

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { requirement, apiKey, baseUrl, model } = req.body;

    if (!requirement) {
      res.status(400).json({
        success: false,
        error: '需求描述不能为空',
      });
      return;
    }

    if (!requirement.trim() || requirement.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: '需求描述太短，请提供更详细的产品需求',
      });
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
        error: '请提供API Key',
      });
      return;
    }

    const result = await analyzeRequirement(requirement.trim(), config);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '分析失败，请重试',
    });
  }
});

export default router;

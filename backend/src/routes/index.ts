import { Router } from 'express';
import prdRoutes from './prd';
import prdGenerationRoutes from './prd-generation';
import exportRoutes from './export';
import analyzeRoutes from './analyze';
import flowchartRoutes from './flowchart';

const router = Router();

router.use('/prd', prdRoutes);
router.use('/prd-generation', prdGenerationRoutes);
router.use('/export', exportRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/flowchart', flowchartRoutes);

export default router;

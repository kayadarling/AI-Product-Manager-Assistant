import { Router, Request, Response } from 'express';
import { PRDDocument } from '../types';
import { exportToDocx } from '../services/export.service';

const router = Router();

router.post('/markdown', (req: Request, res: Response) => {
  try {
    const { markdown } = req.body;
    
    if (!markdown) {
      res.status(400).json({ error: 'Markdown content is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=PRD.md');
    res.send(markdown);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/docx', (req: Request, res: Response) => {
  try {
    const doc: PRDDocument = req.body;
    
    if (!doc) {
      res.status(400).json({ error: 'Document data is required' });
      return;
    }

    const docxBuffer = exportToDocx(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=PRD.docx');
    res.send(docxBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

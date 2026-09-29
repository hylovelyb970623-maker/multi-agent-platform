import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';

const router = Router();

/**
 * POST /api/feedback —— 提交反馈(👍/👎)
 * 数据回流核心入口:记录 type + reason + promptSnapshot
 */
router.post('/', async (req: Request, res: Response) => {
  const { generationId, type, reason, note } = req.body as {
    generationId: string;
    type: 'up' | 'down';
    reason?: string;
    note?: string;
  };

  // 取生成时的 prompt 作为快照(负样本回流关键)
  const gen = await prisma.generation.findUnique({ where: { id: generationId } });

  const fb = await prisma.feedback.create({
    data: {
      generationId,
      type,
      reason,
      note,
      promptSnapshot: gen?.prompt ?? '',
    },
  });

  ok(res, fb, '感谢反馈,数据将用于优化 Prompt');
});

export default router;

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';

const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats —— 看板核心指标
 * 数据回流闭环的可视化数据源
 */
dashboardRouter.get('/stats', async (_req: Request, res: Response) => {
  const [totalGen, totalUp, totalDown, totalTasks] = await Promise.all([
    prisma.generation.count(),
    prisma.feedback.count({ where: { type: 'up' } }),
    prisma.feedback.count({ where: { type: 'down' } }),
    prisma.task.count(),
  ]);

  const upRate = totalGen ? +(totalUp / Math.max(totalUp + totalDown, 1)).toFixed(3) : 0;
  const downRate = totalGen ? +(totalDown / Math.max(totalUp + totalDown, 1)).toFixed(3) : 0;

  ok(res, {
    totalGenerations: totalGen,
    totalTasks,
    totalUp,
    totalDown,
    upRate,
    downRate,
    avgDurationMs: 23320, // mock
    totalTokens: 1076, // mock
  });
});

/**
 * GET /api/dashboard/down-reasons —— 👎原因分布
 */
dashboardRouter.get('/down-reasons', async (_req: Request, res: Response) => {
  const feedbacks = await prisma.feedback.findMany({
    where: { type: 'down', NOT: { reason: null } },
    select: { reason: true },
  });

  const reasonMap: Record<string, string> = {
    hand_deformity: '手指畸形',
    scene_mismatch: '场景不符',
    color_distortion: '颜色失真',
    object_distortion: '商品变形',
    low_aesthetic: '美感不足',
    other: '其他',
  };

  const counts: Record<string, number> = {};
  for (const f of feedbacks) {
    const key = f.reason!;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const result = Object.entries(counts).map(([reason, count]) => ({
    reason,
    label: reasonMap[reason] ?? reason,
    count,
  }));

  ok(res, result);
});

export default dashboardRouter;

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ok, fail } from '../lib/response.js';
import { runAgent, regenerateOne } from '../agent/engine.js';

const router = Router();

/**
 * GET /api/tasks/:id —— 查询任务详情
 */
router.get('/:id', async (req: Request, res: Response) => {
  const r = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { generations: true },
  });
  if (!r) return fail(res, 404, '任务不存在');

  ok(res, {
    id: r.id,
    agentId: r.agentId,
    status: r.status,
    input: JSON.parse(r.input),
    steps: JSON.parse(r.steps),
    generations: r.generations,
    createdAt: r.createdAt.toISOString(),
  });
});

/**
 * POST /api/tasks —— 创建任务(立即返回 taskId)
 * body: { agentId, imageUrl?, instruction? }
 */
router.post('/', async (req: Request, res: Response) => {
  const { agentId, imageUrl, instruction } = req.body as {
    agentId: string;
    imageUrl?: string;
    instruction?: string;
  };

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return fail(res, 404, '智能体不存在');

  const task = await prisma.task.create({
    data: {
      agentId,
      status: 'running',
      input: JSON.stringify({ imageUrl, instruction }),
      steps: '[]',
    },
  });

  ok(res, { id: task.id, agentId, status: 'running' });
});

/**
 * GET /api/tasks/:id/stream —— SSE 实时推送 Agent 执行过程
 * 前端用 EventSource 连接,接收「感知→思考→行动→输出」每一步
 */
router.get('/:id/stream', async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    res.status(404).json({ code: 404, message: '任务不存在', data: null });
    return;
  }

  // ===== SSE 头 =====
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // 心跳(防止代理断连)
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await runAgent(
      taskId,
      JSON.parse(task.input),
      (event) => {
        // 每个阶段事件实时推送
        send('step', event);
      },
    );
    send('complete', { taskId, status: 'success' });
  } catch (err) {
    send('error', { message: (err as Error).message });
    await prisma.task.update({ where: { id: taskId }, data: { status: 'failed' } });
  } finally {
    clearInterval(heartbeat);
    res.end();
  }
});

/**
 * POST /api/tasks/:taskId/regenerate/:generationId —— 单张场景图重生(人工介入)
 */
router.post('/:taskId/regenerate/:generationId', async (req: Request, res: Response) => {
  const { taskId, generationId } = req.params;
  const gen = await regenerateOne(taskId, generationId);
  ok(res, gen, '已重新生成');
});

export default router;

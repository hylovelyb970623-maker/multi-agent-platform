import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ok, fail } from '../lib/response.js';
import type { Agent, AgentCategory, WorkflowSchema } from 'shared';

const router = Router();

/**
 * GET /api/agents —— Agent 市场列表
 * 支持 ?category=ecommerce&keyword=运动
 */
router.get('/', async (req: Request, res: Response) => {
  const { category, keyword } = req.query as {
    category?: AgentCategory | 'all';
    keyword?: string;
  };

  const where: { category?: string; OR?: object[] } = {};
  if (category && category !== 'all') where.category = category;
  if (keyword) {
    where.OR = [
      { name: { contains: keyword } },
      { description: { contains: keyword } },
    ];
  }

  const rows = await prisma.agent.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { usageCount: 'desc' }],
  });

  const agents: Agent[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category as AgentCategory,
    icon: r.icon,
    cover: r.cover ?? undefined,
    featured: r.featured,
    usageCount: r.usageCount,
    rating: r.rating,
    workflowJson: r.workflowJson ? (JSON.parse(r.workflowJson) as WorkflowSchema) : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  ok(res, agents);
});

/** GET /api/agents/:id —— Agent 详情 */
router.get('/:id', async (req: Request, res: Response) => {
  const r = await prisma.agent.findUnique({ where: { id: req.params.id } });
  if (!r) return fail(res, 404, '智能体不存在');

  const agent: Agent = {
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category as AgentCategory,
    icon: r.icon,
    cover: r.cover ?? undefined,
    featured: r.featured,
    usageCount: r.usageCount,
    rating: r.rating,
    workflowJson: r.workflowJson ? (JSON.parse(r.workflowJson) as WorkflowSchema) : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };

  ok(res, agent);
});

/**
 * PUT /api/agents/:id/workflow —— 保存编排的工作流
 * body: WorkflowSchema { nodes, edges }
 */
router.put('/:id/workflow', async (req: Request, res: Response) => {
  const { nodes, edges } = req.body as { nodes: unknown[]; edges: unknown[] };
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return fail(res, 400, '工作流数据格式错误:需要 nodes 和 edges 数组');
  }

  const exists = await prisma.agent.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!exists) return fail(res, 404, '智能体不存在');

  const updated = await prisma.agent.update({
    where: { id: req.params.id },
    data: { workflowJson: JSON.stringify({ nodes, edges }) },
  });

  ok(res, {
    id: updated.id,
    nodesCount: nodes.length,
    edgesCount: edges.length,
    updatedAt: updated.updatedAt.toISOString(),
  }, '工作流已保存');
});

/** POST /api/agents —— 创建新 Agent(从编排器「另存为」) */
router.post('/', async (req: Request, res: Response) => {
  const { name, description, category, icon, workflowJson } = req.body as {
    name: string;
    description?: string;
    category?: string;
    icon?: string;
    workflowJson?: object;
  };

  if (!name) return fail(res, 400, '智能体名称不能为空');

  const agent = await prisma.agent.create({
    data: {
      name,
      description: description ?? '新建智能体',
      category: category ?? 'ecommerce',
      icon: icon ?? '🤖',
      workflowJson: workflowJson ? JSON.stringify(workflowJson) : null,
    },
  });

  ok(res, { id: agent.id, name: agent.name }, '智能体已创建');
});

export default router;

import client from './client';
import type { Agent, AgentListQuery, AgentCategory, WorkflowSchema } from 'shared';

/** 获取 Agent 市场列表(支持分类筛选 + 关键词搜索) */
export async function fetchAgents(params?: AgentListQuery): Promise<Agent[]> {
  return client.get('/agents', { params });
}

/** 获取单个 Agent 详情 */
export async function fetchAgent(id: string): Promise<Agent> {
  return client.get(`/agents/${id}`);
}

/** 保存 Agent 工作流(编排器用) */
export async function saveWorkflow(
  agentId: string,
  workflow: WorkflowSchema,
): Promise<{ nodesCount: number; edgesCount: number }> {
  return client.put(`/agents/${agentId}/workflow`, workflow);
}

/** 创建新 Agent(编排器「另存为」) */
export async function createAgent(params: {
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  workflowJson?: WorkflowSchema;
}): Promise<{ id: string }> {
  return client.post('/agents', params);
}

/** 分类常量(供前端 UI 使用) */
export const CATEGORY_LABELS: Record<AgentCategory | 'all', string> = {
  all: '全部',
  ecommerce: '电商运营',
  content: '内容创作',
  data: '数据分析',
  service: '智能客服',
};

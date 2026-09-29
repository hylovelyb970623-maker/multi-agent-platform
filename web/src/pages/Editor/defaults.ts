import type { WorkflowSchema, NodeKind } from 'shared';
import { STAGE_COLORS } from '@/theme/token';

// ============================================================
// 编排器常量:节点类型定义、默认工作流模板
// ============================================================

/** 节点类型元信息(左侧面板 + 节点样式用) */
export interface NodeKindMeta {
  kind: NodeKind;
  label: string;
  desc: string;
  icon: string;
  color: string;
  /** 该类型节点可选的工具 */
  tools?: string[];
  /** 可选模型 */
  models?: string[];
}

export const NODE_KINDS: NodeKindMeta[] = [
  {
    kind: 'perceive',
    label: '感知',
    desc: '接收并理解输入(图片/文本)',
    icon: '👁️',
    color: STAGE_COLORS.perceive,
    tools: ['llm-vision', 'ocr'],
    models: ['gpt-4o', 'claude-3.5-sonnet'],
  },
  {
    kind: 'think',
    label: '思考',
    desc: 'LLM 推理与决策',
    icon: '💡',
    color: STAGE_COLORS.think,
    tools: ['llm'],
    models: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet'],
  },
  {
    kind: 'act',
    label: '行动',
    desc: '调用工具执行(生图/翻译/...) ',
    icon: '⚡',
    color: STAGE_COLORS.act,
    tools: ['image-gen', 'translate', 'search', 'code'],
    models: ['flux-pro', 'gpt-4o-mini', 'dall-e-3'],
  },
  {
    kind: 'output',
    label: '输出',
    desc: '组装并交付最终产物',
    icon: '📤',
    color: STAGE_COLORS.output,
    tools: ['composer'],
    models: [],
  },
];

export function getNodeMeta(kind: NodeKind): NodeKindMeta {
  return NODE_KINDS.find((n) => n.kind === kind) ?? NODE_KINDS[0];
}

/** 默认工作流:电商详情页生成的标准「感知→思考→行动→输出」 */
export const DEFAULT_WORKFLOW: WorkflowSchema = {
  nodes: [
    {
      id: 'n-perceive',
      kind: 'perceive',
      label: '商品识别',
      tool: 'llm-vision',
      model: 'gpt-4o',
      prompt: '识别图片中的商品类目(鞋/包/服饰)、主色调、风格标签',
      position: { x: 80, y: 200 },
    },
    {
      id: 'n-think',
      kind: 'think',
      label: '场景决策',
      tool: 'llm',
      model: 'gpt-4o',
      prompt: '根据商品类目,匹配合适的拍摄场景(运动鞋→街头/健身房/户外)',
      position: { x: 380, y: 200 },
    },
    {
      id: 'n-act-image',
      kind: 'act',
      label: '生成场景图 ×4',
      tool: 'image-gen',
      model: 'flux-pro',
      prompt: '为每个推荐场景生成 1 张高质量商品场景图',
      position: { x: 680, y: 100 },
    },
    {
      id: 'n-act-copy',
      kind: 'act',
      label: '生成文案',
      tool: 'translate',
      model: 'gpt-4o-mini',
      prompt: '为每个场景生成卖点文案,支持中/英/日',
      position: { x: 680, y: 320 },
    },
    {
      id: 'n-output',
      kind: 'output',
      label: '详情页拼装',
      tool: 'composer',
      prompt: '组合场景图 + 文案,输出可商用的商品详情页',
      position: { x: 980, y: 200 },
    },
  ],
  edges: [
    { id: 'e1', source: 'n-perceive', target: 'n-think' },
    { id: 'e2', source: 'n-think', target: 'n-act-image' },
    { id: 'e3', source: 'n-think', target: 'n-act-copy' },
    { id: 'e4', source: 'n-act-image', target: 'n-output' },
    { id: 'e5', source: 'n-act-copy', target: 'n-output' },
  ],
};

/** 把 React Flow 的 nodes/edges 转成持久化的 WorkflowSchema */
export function toWorkflowSchema(
  rfNodes: RFNode[],
  rfEdges: RFEdge[],
): WorkflowSchema {
  return {
    nodes: rfNodes.map((n) => ({
      id: n.id,
      kind: (n.data?.kind as NodeKind) ?? 'think',
      label: (n.data?.label as string) ?? '节点',
      tool: n.data?.tool as string | undefined,
      model: n.data?.model as string | undefined,
      prompt: n.data?.prompt as string | undefined,
      position: n.position,
    })),
    edges: rfEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}

// React Flow 类型简写(避免直接导入 RF 类型造成循环)
export interface RFNode {
  id: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  type?: string;
}
export interface RFEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

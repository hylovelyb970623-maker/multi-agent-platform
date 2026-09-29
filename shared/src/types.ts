// ============================================================
// shared/src/types.ts
// 前后端共享的类型定义 —— dsAgent 平台的"契约层"
// 修改这里,前后端同时生效,避免类型漂移
// ============================================================

/** Agent 分类 */
export type AgentCategory =
  | 'ecommerce' // 电商运营
  | 'content' // 内容创作
  | 'data' // 数据分析
  | 'service'; // 客服

/** Agent 实体(平台市场上的一个智能体) */
export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: string; // emoji 或图标名
  cover: string; // 封面图 URL(可为渐变色描述)
  /** 是否为主打/置顶 Agent */
  featured?: boolean;
  /** 累计使用次数 */
  usageCount: number;
  /** 评分 0-5 */
  rating: number;
  /** 编排工作流 JSON(React Flow 导出结构) */
  workflowJson?: WorkflowSchema | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Agent 工作流编排 —— 「感知→思考→行动→输出」四阶段
// ============================================================

export type NodeKind = 'perceive' | 'think' | 'act' | 'output';

/** 编排节点 */
export interface WorkflowNode {
  id: string;
  kind: NodeKind;
  label: string;
  /** 节点绑定的工具(行动阶段用):image-gen / translate / ... */
  tool?: string;
  /** 该节点使用的 Prompt 模板内容 */
  prompt?: string;
  /** 模型参数 */
  model?: string;
  /** 画布坐标(React Flow 用) */
  position: { x: number; y: number };
}

/** 编排连线 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

/** 完整工作流定义 */
export interface WorkflowSchema {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// ============================================================
// 任务执行 —— 一次 Agent 运行
// ============================================================

export type TaskStatus = 'pending' | 'running' | 'success' | 'failed';

/** 任务执行的四阶段步骤记录 */
export interface TaskStep {
  id: string;
  kind: NodeKind;
  title: string;
  /** 该步骤产出的文本描述(如"识别为:白色运动鞋,置信度94%") */
  detail: string;
  status: 'done' | 'running' | 'pending';
  /** 耗时 ms */
  durationMs?: number;
  /** Token 消耗 */
  tokens?: number;
  startedAt?: string;
  finishedAt?: string;
}

export interface Task {
  id: string;
  agentId: string;
  status: TaskStatus;
  /** 用户输入(上传的白底图 URL 等) */
  input: TaskInput;
  /** 各阶段步骤 */
  steps: TaskStep[];
  /** 关联的生图产物 */
  generations: Generation[];
  createdAt: string;
}

export interface TaskInput {
  /** 上传的商品白底图 URL */
  imageUrl?: string;
  /** 用户补充的文本指令(可选) */
  instruction?: string;
}

// ============================================================
// 生图产物 & 反馈 —— 数据回流闭环
// ============================================================

export type GenerationStatus = 'pending' | 'generating' | 'done' | 'failed' | 'flagged';

/** 一张 Agent 生成的场景图 */
export interface Generation {
  id: string;
  taskId: string;
  imageUrl: string;
  /** 生成时使用的 prompt */
  prompt: string;
  /** 对应的场景名(沙滩/办公室/街头...) */
  scene: string;
  status: GenerationStatus;
  /** 是否被标记为需要人工介入(如手指畸形) */
  needsReview?: boolean;
  createdAt: string;
}

export type FeedbackType = 'up' | 'down';

export type FeedbackReason =
  | 'hand_deformity' // 手指畸形
  | 'scene_mismatch' // 场景不符
  | 'color_distortion' // 颜色失真
  | 'object_distortion' // 商品变形
  | 'low_aesthetic' // 美感不足
  | 'other';

export interface Feedback {
  id: string;
  generationId: string;
  type: FeedbackType;
  reason?: FeedbackReason;
  note?: string;
  /** 反馈时的 prompt 快照(用于负样本回流) */
  promptSnapshot: string;
  createdAt: string;
}

// ============================================================
// API 通用响应
// ============================================================
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** Agent 市场列表查询参数 */
export interface AgentListQuery {
  category?: AgentCategory;
  keyword?: string;
}

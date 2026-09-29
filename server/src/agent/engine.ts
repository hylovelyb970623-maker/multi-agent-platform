// ============================================================
// Agent 执行引擎 —— 把"生图工具"执行成遵循
// 「感知(Perceive)→ 思考(Think)→ 行动(Act)→ 输出(Output)」的智能体
//
// 这是平台"段位拉满"的核心:
// 不是简单调用一次生图API,而是有自主决策(感知→匹配场景)、
// 多工具编排(文生图+翻译)、分阶段可观测的执行过程
// ============================================================
import type { TaskStep, NodeKind, Generation } from 'shared';
import { prisma } from '../lib/prisma.js';
import * as mock from '../providers/mock.js';

/** 阶段事件 —— 推送给前端(经 SSE) */
export interface StepEvent {
  step: TaskStep;
  /** 该阶段是否全部完成 */
  done: boolean;
}

/** 单步耗时/Token 统计 */
interface StepStat {
  durationMs: number;
  tokens: number;
}

/** 回调:每个阶段产出/完成时触发 */
export type OnStep = (event: StepEvent) => void | Promise<void>;

/**
 * 执行一次 Agent 任务
 * @param taskId      任务ID(持久化用)
 * @param input       用户输入(白底图URL等)
 * @param onStep      阶段事件回调(实时推送)
 */
export async function runAgent(
  taskId: string,
  input: { imageUrl?: string; instruction?: string },
  onStep: OnStep,
): Promise<void> {
  const steps: TaskStep[] = [];

  // ===== 阶段 1:感知 =====
  const perceiveStart = Date.now();
  await emitStep(onStep, { step: makeStep('perceive', '感知:商品识别', '正在用视觉模型识别商品类目...', 'running'), done: false });
  const perception = await mock.mockPerceive();
  const perceiveStat: StepStat = { durationMs: Date.now() - perceiveStart, tokens: 156 };
  const perceiveStep = makeStep(
    'perceive',
    '感知:商品识别',
    `识别为「${perception.subType}」,主色${perception.color},风格:${perception.styleTags.join('/')},置信度 ${(perception.confidence * 100).toFixed(0)}%`,
    'done',
    perceiveStat,
  );
  steps.push(perceiveStep);
  await emitStep(onStep, { step: perceiveStep, done: true });

  // ===== 阶段 2:思考 =====
  const thinkStart = Date.now();
  await emitStep(onStep, { step: makeStep('think', '思考:场景决策', '正在匹配最佳拍摄场景...', 'running'), done: false });
  const think = await mock.mockThink(perception);
  const thinkStat: StepStat = { durationMs: Date.now() - thinkStart, tokens: 280 };
  const sceneList = think.scenes.map((s) => s.name).join(' / ');
  const thinkStep = makeStep(
    'think',
    '思考:场景决策',
    `推荐 4 个差异化场景:${sceneList}。每个场景附文生图 prompt 与多语言文案`,
    'done',
    thinkStat,
  );
  steps.push(thinkStep);
  await emitStep(onStep, { step: thinkStep, done: true });

  // ===== 阶段 3:行动(生图 + 文案,可并行)=====
  const actStart = Date.now();
  await emitStep(onStep, { step: makeStep('act', '行动:生成场景图', '正在调用文生图模型,生成 4 张场景图(并行)...', 'running'), done: false });

  // 并行生成 4 张图
  const genResults = await Promise.all(
    think.scenes.map((plan, idx) => mock.mockImageGen(plan, idx)),
  );

  // 持久化生图产物
  const generations: Generation[] = [];
  for (let i = 0; i < genResults.length; i++) {
    const g = genResults[i];
    const plan = think.scenes[i];
    const row = await prisma.generation.create({
      data: {
        taskId,
        imageUrl: g.imageUrl,
        prompt: g.prompt,
        scene: g.scene,
        status: g.needsReview ? 'flagged' : 'done',
        needsReview: g.needsReview,
      },
    });
    generations.push({
      id: row.id,
      taskId,
      imageUrl: row.imageUrl,
      prompt: row.prompt,
      scene: row.scene,
      status: row.status as Generation['status'],
      needsReview: row.needsReview,
      createdAt: row.createdAt.toISOString(),
      // 附加文案(不入库,实时返回)
      ...({ copy: plan.copy } as object),
    });
  }

  const actStat: StepStat = { durationMs: Date.now() - actStart, tokens: 0 };
  const flaggedCount = generations.filter((g) => g.needsReview).length;
  const actStep = makeStep(
    'act',
    '行动:生成场景图 ×4',
    `4 张场景图生成完毕${flaggedCount ? `,其中 ${flaggedCount} 张检测到异常(需人工介入)` : ''}。同步生成中/英文案`,
    'done',
    actStat,
  );
  steps.push(actStep);
  await emitStep(onStep, { step: actStep, done: true, ...({ generations } as object) });

  // ===== 阶段 4:输出 =====
  const outputStep = makeStep(
    'output',
    '输出:详情页拼装',
    `组合 4 张场景图 + 多语言文案,详情页已就绪,可下载或一键发布`,
    'done',
    { durationMs: 320, tokens: 0 },
  );
  steps.push(outputStep);
  await emitStep(onStep, { step: outputStep, done: true });

  // ===== 持久化任务 =====
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'success',
      steps: JSON.stringify(steps),
    },
  });
}

/** 单张场景图重生(人工介入) */
export async function regenerateOne(
  taskId: string,
  generationId: string,
): Promise<Generation> {
  const gen = await prisma.generation.findUnique({ where: { id: generationId } });
  if (!gen) throw new Error('生成图不存在');

  // Mock:重新生成,这次不畸形
  await new Promise((r) => setTimeout(r, 2200));
  await prisma.generation.update({
    where: { id: generationId },
    data: {
      needsReview: false,
      status: 'done',
      imageUrl: `https://placehold.co/600x600/eef0f5/5B5FEF/png?text=${encodeURIComponent(gen.scene + '+修复')}`,
    },
  });

  return {
    id: gen.id,
    taskId,
    imageUrl: `https://placehold.co/600x600/eef0f5/5B5FEF/png?text=${encodeURIComponent(gen.scene + '+修复')}`,
    prompt: gen.prompt,
    scene: gen.scene,
    status: 'done',
    needsReview: false,
    createdAt: gen.createdAt.toISOString(),
  };
}

// ===== 工具函数 =====
function makeStep(
  kind: NodeKind,
  title: string,
  detail: string,
  status: TaskStep['status'],
  stat?: StepStat,
): TaskStep {
  return {
    id: `step-${kind}-${Date.now()}`,
    kind,
    title,
    detail,
    status,
    durationMs: stat?.durationMs,
    tokens: stat?.tokens,
    startedAt: new Date().toISOString(),
    ...(status === 'done' ? { finishedAt: new Date().toISOString() } : {}),
  };
}

async function emitStep(onStep: OnStep, event: StepEvent) {
  await onStep(event);
}

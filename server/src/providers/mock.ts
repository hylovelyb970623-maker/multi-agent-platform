// ============================================================
// Mock AI 适配层 —— 返回逼真的假数据
// 数据质量是作品集质感的关键,这里精心设计了真实的鞋类、prompt、文案
// 后续替换为真实模型时,只需新建 openai.ts / flux.ts 等同接口实现
// ============================================================
import type {
  PerceptionResult,
  ThinkResult,
  ImageGenResult,
  CopyResult,
  ScenePlan,
} from './types.js';

/**
 * 感知:商品识别(Mock)
 * 真实实现:调用 GPT-4o Vision,传入白底图,让它输出类目+风格
 */
export async function mockPerceive(): Promise<PerceptionResult> {
  await delay(800);
  return {
    category: '运动鞋',
    subType: '白色低帮休闲运动鞋',
    color: '纯白',
    styleTags: ['潮流', '极简', '百搭', '夏季'],
    confidence: 0.94,
  };
}

/**
 * 思考:场景决策(Mock)
 * 真实实现:把感知结果喂给 LLM,让它推荐 4 个差异化的拍摄场景
 */
export async function mockThink(perception: PerceptionResult): Promise<ThinkResult> {
  await delay(1100);
  const { subType, styleTags } = perception;

  const scenes: ScenePlan[] = [
    {
      name: '街头潮流',
      rationale: `「${subType}」契合街头潮流调性,都市街拍是年轻客群高转化场景`,
      imagePrompt: `${subType} placed on urban street, golden hour sunlight, trendy lifestyle, bokeh background, commercial photography, 8k`,
      copy: buildCopy(['轻盈如飞,全天候百搭', 'Step Into The Street']),
    },
    {
      name: '户外公园',
      rationale: '绿意自然环境光能突出白色鞋面质感,呼应夏季清凉卖点',
      imagePrompt: `${subType} held by model in green park, soft natural light, grass and trees background, lifestyle shot`,
      copy: buildCopy(['踩进自然,清爽一夏', 'Breathe With Nature']),
    },
    {
      name: '健身房',
      rationale: '运动场景强化"运动鞋"功能性,精准触达健身人群',
      imagePrompt: `${subType} in modern minimalist gym, dynamic lighting, athletic atmosphere, premium product shot`,
      copy: buildCopy(['每一次发力,都有支撑', 'Power Your Move']),
    },
    {
      name: '极简影棚',
      rationale: '纯净背景突出商品本身,适合主图位,与潮流场景形成对比',
      imagePrompt: `${subType} on minimalist studio background, soft shadow, premium e-commerce main image, clean`,
      copy: buildCopy(['极简不简单,质感立现', 'Less Is More']),
    },
  ];

  return { scenes };
}

/**
 * 行动:文生图(Mock)
 * 第 2 张故意标记 needsReview=true,模拟"模特手指畸形"的人工介入案例
 */
export async function mockImageGen(plan: ScenePlan, index: number): Promise<ImageGenResult> {
  await delay(2400 + Math.random() * 800);
  const needsReview = index === 1; // 第 2 张:手指畸形
  return {
    // 用占位图服务生成一张真实可看的图(白色鞋款/场景感)
    imageUrl: `https://placehold.co/600x600/f5f6fa/5B5FEF/png?text=${encodeURIComponent(plan.name)}`,
    prompt: plan.imagePrompt,
    scene: plan.name,
    needsReview,
  };
}

/** 文案生成(Mock) */
export function buildCopy(pairs: string[]): CopyResult[] {
  // pairs: [zh, en] 交替传入
  return [
    { lang: 'zh', headline: pairs[0], sellingPoints: [pairs[0], '透气网面', '防滑大底', '轻量化设计'] },
    { lang: 'en', headline: pairs[1] ?? pairs[0], sellingPoints: [pairs[1] ?? pairs[0], 'Breathable', 'Anti-slip', 'Lightweight'] },
  ];
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

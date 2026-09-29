// ============================================================
// seed.ts —— 预置 4 个 Agent + 示例数据
// 数据要"真实":真实的鞋类、真实的 prompt、真实的反馈原因
// 这是作品集质感的关键
// ============================================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** 电商详情页生成 Agent 的标准工作流(感知→思考→行动→输出) */
const detailPageWorkflow = JSON.stringify({
  nodes: [
    {
      id: 'n1',
      kind: 'perceive',
      label: '感知:商品识别',
      tool: 'llm-vision',
      prompt: '识别图片中的商品类目(鞋/包/服饰)、主色调、风格标签',
      model: 'gpt-4o',
      position: { x: 100, y: 100 },
    },
    {
      id: 'n2',
      kind: 'think',
      label: '思考:场景决策',
      tool: 'llm',
      prompt: '根据商品类目,匹配合适的拍摄场景(运动鞋→街头/健身房/户外)',
      model: 'gpt-4o',
      position: { x: 400, y: 100 },
    },
    {
      id: 'n3',
      kind: 'act',
      label: '行动:生成场景图 ×4',
      tool: 'image-gen',
      prompt: '为每个推荐场景生成 1 张高质量商品场景图',
      model: 'flux-pro',
      position: { x: 700, y: 100 },
    },
    {
      id: 'n4',
      kind: 'act',
      label: '行动:多语言文案',
      tool: 'translate',
      prompt: '为每个场景生成卖点文案,支持中/英/日',
      model: 'gpt-4o-mini',
      position: { x: 700, y: 300 },
    },
    {
      id: 'n5',
      kind: 'output',
      label: '输出:详情页拼装',
      tool: 'composer',
      prompt: '组合场景图 + 文案,输出可商用的商品详情页',
      position: { x: 1000, y: 200 },
    },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'n3' },
    { id: 'e3', source: 'n2', target: 'n4' },
    { id: 'e4', source: 'n3', target: 'n5' },
    { id: 'e5', source: 'n4', target: 'n5' },
  ],
});

async function main() {
  console.log('🌱 开始 seed 数据...');

  // 清空旧数据
  await prisma.feedback.deleteMany();
  await prisma.generation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.promptTemplate.deleteMany();
  await prisma.agent.deleteMany();

  // ===== Agent 1: 电商详情页生成(主打)=====
  const agent1 = await prisma.agent.create({
    data: {
      id: 'agent-detail-page', // 固定 id,便于作品集演示链接稳定
      name: '电商详情页智能生成 Agent',
      description:
        '上传商品白底图,AI 自动识别类目、匹配场景、生成 4 张高质量场景图与多语言文案,直接拼装成可商用的商品详情页。运营从「等设计排期」变成「3 分钟自助出图」。',
      category: 'ecommerce',
      icon: '🛍️',
      featured: true,
      usageCount: 12860,
      rating: 4.8,
      workflowJson: detailPageWorkflow,
    },
  });

  // ===== Agent 2: 多语言文案 =====
  await prisma.agent.create({
    data: {
      name: '多语言卖点文案 Agent',
      description:
        '输入商品名称和核心卖点,自动生成中/英/日/韩多语言营销文案,适配亚马逊、Shopee、独立站等不同平台语调。',
      category: 'content',
      icon: '✍️',
      usageCount: 8540,
      rating: 4.6,
    },
  });

  // ===== Agent 3: 商品主图增强 =====
  await prisma.agent.create({
    data: {
      name: '商品主图增强 Agent',
      description:
        '对已有商品图进行画质增强、背景去除、智能扩图、添加促销水印,输出符合各平台主图规范的成片。',
      category: 'ecommerce',
      icon: '🎨',
      usageCount: 6230,
      rating: 4.5,
    },
  });

  // ===== Agent 4: 竞品分析 =====
  await prisma.agent.create({
    data: {
      name: '竞品详情页分析 Agent',
      description:
        '输入竞品商品链接,自动抓取详情页,分析其场景策略、文案结构、价格卖点,输出可执行的优化建议。',
      category: 'data',
      icon: '📊',
      usageCount: 3120,
      rating: 4.3,
    },
  });

  // ===== 为主打 Agent 补充示例 Task + Generation + Feedback(数据回流看板用)=====
  const task = await prisma.task.create({
    data: {
      agentId: agent1.id,
      status: 'success',
      input: JSON.stringify({
        imageUrl: '/uploads/sample-sneaker-white.png',
        instruction: '白色运动鞋,夏季新款',
      }),
      steps: JSON.stringify([
        { kind: 'perceive', title: '商品识别', detail: '白色运动鞋,置信度 94%', status: 'done', durationMs: 820, tokens: 156 },
        { kind: 'think', title: '场景决策', detail: '匹配场景:街头潮流 / 健身房 / 户外公园 / 极简影棚', status: 'done', durationMs: 1200, tokens: 280 },
        { kind: 'act', title: '生成场景图 ×4', detail: '调用文生图模型生成 4 张场景图', status: 'done', durationMs: 18600, tokens: 0 },
        { kind: 'act', title: '生成文案', detail: '4 个场景的多语言卖点文案', status: 'done', durationMs: 2400, tokens: 640 },
        { kind: 'output', title: '详情页拼装', detail: '组合图+文,输出详情页', status: 'done', durationMs: 300 },
      ]),
    },
  });

  // 4 张场景图(第 2 张标记为需要人工介入 —— 手指畸形案例)
  const gens = await Promise.all(
    [
      { scene: '街头潮流', prompt: 'white sneaker on urban street, golden hour, trendy style', needsReview: false },
      { scene: '户外公园', prompt: 'white sneaker held by model in park, grass background', needsReview: true }, // ← 畸形
      { scene: '健身房', prompt: 'white sneaker in modern gym, dynamic lighting', needsReview: false },
      { scene: '极简影棚', prompt: 'white sneaker on minimalist studio background, soft shadow', needsReview: false },
    ].map((g) =>
      prisma.generation.create({
        data: {
          taskId: task.id,
          imageUrl: `/mock/scene-${g.scene}.jpg`,
          prompt: g.prompt,
          scene: g.scene,
          status: g.needsReview ? 'flagged' : 'done',
          needsReview: g.needsReview,
        },
      }),
    ),
  );

  // 示例反馈(数据回流看板的饼图数据)
  await prisma.feedback.createMany({
    data: [
      { generationId: gens[0].id, type: 'up', promptSnapshot: gens[0].prompt },
      { generationId: gens[1].id, type: 'down', reason: 'hand_deformity', note: '模特手指畸形,6根手指', promptSnapshot: gens[1].prompt },
      { generationId: gens[2].id, type: 'up', promptSnapshot: gens[2].prompt },
      { generationId: gens[3].id, type: 'up', promptSnapshot: gens[3].prompt },
    ],
  });

  // 再造一批反馈样本,让看板数据丰富些
  const reasons = ['hand_deformity', 'scene_mismatch', 'color_distortion', 'object_distortion', 'low_aesthetic'] as const;
  for (let i = 0; i < 40; i++) {
    const isDown = Math.random() < 0.32;
    const targetGen = gens[Math.floor(Math.random() * 4)];
    await prisma.feedback.create({
      data: {
        generationId: targetGen.id,
        type: isDown ? 'down' : 'up',
        reason: isDown ? reasons[Math.floor(Math.random() * reasons.length)] : null,
        promptSnapshot: targetGen.prompt,
      },
    });
  }

  console.log('✅ seed 完成:');
  console.log(`   - 4 个 Agent(主打: ${agent1.name})`);
  console.log(`   - 1 个示例 Task + 4 张 Generation(含 1 张人工介入案例)`);
  console.log(`   - 多条 Feedback(含👎原因分布样本)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import ComingSoon from '@/components/ComingSoon';

export default function Dashboard() {
  return (
    <ComingSoon
      title="数据回流与反馈看板"
      phase="P4"
      description="收集运营对生成结果的反馈,让系统越用越聪明。"
      bullets={[
        '核心指标卡:总生成数 / 👍率 / 👎率 / 平均耗时 / Token 消耗',
        '👎原因分布饼图(手指畸形 35% / 场景不符 28% ...)',
        'Prompt 模板 A/B 效果对比',
        '负样本表:可筛选、标注、导出,为后续优化做数据准备',
      ]}
    />
  );
}

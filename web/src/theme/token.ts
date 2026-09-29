/**
 * 设计 Token —— 全局配色与视觉常量集中定义
 *
 * 「去 AI 化」改版基线:
 *   主色采用墨绿 #0F766E(沉稳专业,替代原"AI 紫"#5B5FEF)
 *   四阶段配色降低饱和度,保留可区分性但不花哨
 *   封面色板改为低饱和的深色系纯色,替代高饱和渐变
 *
 * 修改这里,全站生效;禁止在各组件里再硬编码 #5B5FEF / #8B5CF6
 */

/** 主品牌色(墨绿) */
export const PRIMARY = '#0F766E';
/** 主品牌色 hover 态(略深) */
export const PRIMARY_HOVER = '#0B5D56';
/** 主品牌色浅底(用于 Tag/背景强调) */
export const PRIMARY_LIGHT = '#E6F4F2';

/** 四阶段节点配色(降低饱和,与墨绿主色和谐) */
export const STAGE_COLORS = {
  /** 感知 —— 墨绿(与主色一致,代表"输入/识别") */
  perceive: '#0F766E',
  /** 思考 —— 深琥珀(暖,代表"决策") */
  think: '#B45309',
  /** 行动 —— 橄榄绿(代表"执行") */
  act: '#4D7C0F',
  /** 输出 —— 石板蓝(代表"产出") */
  output: '#475569',
} as const;

/**
 * 卡片封面色板 —— 低饱和深色纯色,替代原来的高饱和渐变
 * 按 id 取稳定值,保证同一 Agent 颜色不变
 */
export const COVER_PALETTE = [
  '#0F766E', // 墨绿
  '#1E40AF', // 深靛
  '#9F1239', // 酒红
  '#854D0E', // 深棕
  '#3730A3', // 深紫蓝
  '#115E59', // 深青
] as const;

/** 中性色 */
export const NEUTRAL = {
  /** 页面背景 */
  bg: '#F7F8FA',
  /** 卡片边框 */
  border: '#E5E7EB',
  /** 分割线 */
  divider: '#F0F1F3',
  /** 主文字 */
  text: '#1F2937',
  /** 次级文字 */
  textSecondary: '#6B7280',
  /** 弱化文字/占位 */
  textTertiary: '#9CA3AF',
} as const;

/** Hero 区背景 —— 纯墨绿实色(不再用紫渐变) */
export const HERO_BG = '#0F766E';

/** 根据 id 取稳定的封面色 */
export function getCoverColor(id: string): string {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return COVER_PALETTE[sum % COVER_PALETTE.length];
}

import type { Generation, TaskStep } from 'shared';

/** 多语言文案 */
export interface CopyResult {
  lang: 'zh' | 'en' | 'ja';
  headline: string;
  sellingPoints: string[];
}

/** 工作台场景项 = 生图产物 + 文案 + 重生状态 */
export interface SceneItem {
  generation: Generation;
  copy?: CopyResult[];
  /** 是否正在重新生成 */
  regenerating?: boolean;
}

export type { Generation, TaskStep };

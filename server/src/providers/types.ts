// ============================================================
// AI 适配层类型 —— 所有 Provider 的统一接口
// 设计原则:接口与真实调用一致,实现先用 Mock,后续逐个替换为真实模型
// ============================================================

/** 视觉感知结果(商品识别) */
export interface PerceptionResult {
  category: string; // 商品类目:运动鞋/高跟鞋/凉鞋...
  subType: string; // 子类型:白色低帮运动鞋
  color: string; // 主色调
  styleTags: string[]; // 风格标签:潮流/运动/极简
  confidence: number; // 置信度 0-1
}

/** 思考结果(场景决策) */
export interface ThinkResult {
  scenes: ScenePlan[]; // 推荐的拍摄场景(4 个)
}

export interface ScenePlan {
  name: string; // 场景名:街头潮流
  rationale: string; // 为什么选这个场景
  imagePrompt: string; // 文生图 prompt
  copy: CopyResult[]; // 该场景的文案
}

/** 多语言文案 */
export interface CopyResult {
  lang: 'zh' | 'en' | 'ja';
  headline: string; // 主标题
  sellingPoints: string[]; // 卖点列表
}

/** 单张生图结果 */
export interface ImageGenResult {
  imageUrl: string;
  prompt: string;
  scene: string;
  /** 是否模拟出瑕疵(人工介入案例用) */
  needsReview: boolean;
}

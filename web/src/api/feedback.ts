import client from './client';
import type { FeedbackType, FeedbackReason } from 'shared';

interface SubmitFeedbackParams {
  generationId: string;
  type: FeedbackType;
  reason?: FeedbackReason;
  note?: string;
}

/** 提交反馈(👍/👎)—— 数据回流入口 */
export async function submitFeedback(params: SubmitFeedbackParams) {
  return client.post('/feedback', params);
}

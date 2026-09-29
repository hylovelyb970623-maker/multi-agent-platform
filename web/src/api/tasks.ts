import client from './client';
import type { Task, Generation } from 'shared';

/** 创建任务(返回 taskId) */
export async function createTask(params: {
  agentId: string;
  imageUrl?: string;
  instruction?: string;
}): Promise<{ id: string }> {
  return client.post('/tasks', params);
}

/** 查询任务详情 */
export async function fetchTask(id: string): Promise<Task> {
  return client.get(`/tasks/${id}`);
}

/** 单张场景图重生(人工介入) */
export async function regenerateImage(
  taskId: string,
  generationId: string,
): Promise<Generation> {
  return client.post(`/tasks/${taskId}/regenerate/${generationId}`);
}

// ============================================================
// SSE 客户端 —— 监听 Agent 执行过程
// 浏览器原生 EventSource 只支持 GET,正好我们的流接口就是 GET
// ============================================================
import type { TaskStep } from 'shared';

export interface StepEventData {
  step: TaskStep;
  done: boolean;
  generations?: (Generation & { copy?: unknown })[];
}

/** 建立 SSE 连接,返回 EventSource(供调用方关闭) */
export function subscribeTask(
  taskId: string,
  handlers: {
    onStep: (data: StepEventData) => void;
    onComplete?: (data: { taskId: string; status: string }) => void;
    onError?: (err: MessageEvent) => void;
  },
): EventSource {
  const es = new EventSource(`/api/tasks/${taskId}/stream`);

  es.addEventListener('step', (e) => {
    try {
      handlers.onStep(JSON.parse(e.data));
    } catch {}
  });

  es.addEventListener('complete', (e) => {
    try {
      handlers.onComplete?.(JSON.parse(e.data));
    } catch {}
    es.close();
  });

  es.addEventListener('error', (e) => {
    // 连接异常
    handlers.onError?.(e as MessageEvent);
  });

  return es;
}

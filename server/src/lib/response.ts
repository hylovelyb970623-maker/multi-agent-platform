import type { Response } from 'express';
import type { ApiResponse } from 'shared';

/** 统一成功响应 */
export function ok<T>(res: Response, data: T, message = 'success') {
  const body: ApiResponse<T> = { code: 0, message, data };
  return res.json(body);
}

/** 统一失败响应 */
export function fail(res: Response, code: number, message: string) {
  const body: ApiResponse<null> = { code, message, data: null };
  return res.status(code >= 100 && code < 600 ? code : 500).json(body);
}

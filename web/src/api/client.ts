import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { message } from 'antd';

/**
 * 全局 axios 实例
 * - baseURL: /api,开发期由 vite proxy 转发到后端 3001
 * - 统一拦截错误并 toast
 */
const client: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

client.interceptors.response.use(
  (resp) => {
    // 后端统一返回 { code, message, data }
    const body = resp.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) return body.data;
      message.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body;
  },
  (error) => {
    const msg = error?.response?.data?.message || error.message || '网络异常';
    message.error(msg);
    return Promise.reject(error);
  },
);

export default client;

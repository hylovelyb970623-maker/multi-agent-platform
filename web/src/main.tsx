import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { globalStyles } from './styles/global';

// React Query 客户端(全局一次)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 主题色:墨绿(沉稳专业,去 AI 化)
const themeToken = {
  colorPrimary: '#0F766E',
  colorInfo: '#0F766E',
  borderRadius: 8,
  fontSize: 14,
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{ token: themeToken }}>
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <style>{globalStyles}</style>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);

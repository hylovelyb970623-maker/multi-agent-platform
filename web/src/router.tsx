import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Market from './pages/Market';
import Workbench from './pages/Workbench';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> }, // 首页:美图风格
      { path: 'market', element: <Market /> }, // 智能体市场(原首页降级)
      { path: 'workbench/:agentId', element: <Workbench /> },
      { path: 'editor/:agentId', element: <Editor /> },
      { path: 'editor', element: <Editor /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 静态文件:上传的商品图 / mock 资源
app.use('/uploads', express.static('uploads'));
app.use('/mock', express.static('mock'));

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dsAgent-server', time: new Date().toISOString() });
});

// API 路由(统一 /api 前缀)
app.use('/api/agents', (await import('./routes/agents.js')).default);
app.use('/api/tasks', (await import('./routes/tasks.js')).default);
app.use('/api/feedback', (await import('./routes/feedback.js')).default);
app.use('/api/dashboard', (await import('./routes/dashboard.js')).default);

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ code: 500, message: err.message || '服务器内部错误', data: null });
});

app.listen(PORT, () => {
  console.log(`\n🚀 dsAgent 后端已启动: http://localhost:${PORT}`);
  console.log(`   健康检查: http://localhost:${PORT}/health\n`);
});

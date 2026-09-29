# dsAgent —— 多 Agent 智能体平台（电商详情页智能生成）

可视化编排「感知 → 思考 → 行动 → 输出」四阶段 Agent 工作流的演示平台，
以**电商详情页智能生成**为演示场景：上传商品图后，由多个 Agent 协作生成
场景图与多语言卖点文案。

> 内置 Agent 引擎使用 Mock Provider，无需任何 API Key 即可完整体验全部流程。

## 功能

- **市场（Market）**：浏览/选用预置 Agent（内含 4 个示例 Agent 与示例数据）
- **工作台（Workbench）**：执行 Agent，实时查看思考流、执行进度与结果预览
- **编辑器（Editor）**：可视化编排 Agent 工作流节点（感知/思考/行动/输出）
- **仪表盘（Dashboard）**：任务量、成功率、耗时等统计

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Ant Design |
| 后端 | Node.js (Express) + Prisma (SQLite) |
| 架构 | pnpm monorepo（`server` / `web` / `shared`） |

## 快速开始

要求：Node.js ≥ 18，pnpm。

```bash
# 1. 安装依赖
pnpm install

# 2. 初始化数据库并写入示例数据
pnpm db:push
pnpm db:seed

# 3. 启动（同时启动后端与前端）
pnpm dev
```

启动后：

- 前端：<http://localhost:5173>
- 后端：<http://localhost:3007>（健康检查 `/health`）

## 项目结构

```
dsAgent/
├── server/          # 后端：Express + Prisma，Agent 执行引擎
│   ├── src/agent/       # 感知→思考→行动→输出 执行引擎
│   ├── src/providers/   # Provider 抽象（内置 Mock 实现）
│   ├── src/routes/      # agents / tasks / feedback / dashboard API
│   └── prisma/          # schema + seed 数据
├── web/             # 前端：React + Vite + AntD
└── shared/          # 前后端共享类型
```

## 接入真实模型

`server/src/providers/` 中定义了 Provider 抽象，Mock 实现可直接替换为
任意 LLM / 图像生成服务（OpenAI、通义、智谱、ComfyUI 等），按同一接口
实现 `providers/types.ts` 即可。

## License

未指定开源协议前，默认保留所有权利；公开发布时请自行添加 LICENSE 文件
（如 MIT / Apache-2.0）。

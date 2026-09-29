import { useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Upload,
  Card,
  Space,
  Tag,
  App,
  Spin,
  Empty,
  Divider,
} from 'antd';
import type { UploadProps } from 'antd';
import {
  PlayCircleOutlined,
  InboxOutlined,
  EyeOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAgent } from '@/api/agents';
import { createTask, subscribeTask, regenerateImage } from '@/api/tasks';
import type { TaskStep, Generation } from 'shared';
import ThinkStream from './components/ThinkStream';
import SceneGrid from './components/SceneGrid';
import DetailPreview from './components/DetailPreview';
import { PRIMARY, STAGE_COLORS } from '@/theme/token';
import type { SceneItem } from './types';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const STAGES = [
  { key: 'perceive', label: '感知', icon: <EyeOutlined /> },
  { key: 'think', label: '思考', icon: <BulbOutlined /> },
  { key: 'act', label: '行动', icon: <ThunderboltOutlined /> },
  { key: 'output', label: '输出', icon: <CheckCircleOutlined /> },
];

/** 内置演示白底图(无上传时用,便于快速演示) */
const DEMO_PRODUCT_IMAGE =
  'https://placehold.co/600x600/ffffff/cccccc/png?text=%E5%95%86%E5%93%81%E7%99%BD%E5%BA%95%E5%9B%BE';

export default function Workbench() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgent(agentId!),
    enabled: !!agentId,
  });

  // 执行状态
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  // ===== 上传(本地预览,Mock)=====
  const uploadProps: UploadProps = {
    maxCount: 1,
    accept: 'image/*',
    beforeUpload: (file) => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      message.success('商品图已上传,点击「开始执行」启动 Agent');
      return false; // 阻止真实上传,P2 用 mock
    },
    onRemove: () => setImageUrl(undefined),
  };

  // ===== 开始执行 =====
  const handleRun = useCallback(async () => {
    console.log('[Workbench] handleRun clicked', { agentId, hasImage: !!imageUrl });
    if (!agentId) return;
    setSteps([]);
    setScenes([]);
    setFinished(false);
    setRunning(true);

    // 无图时使用内置 demo 白底图(便于演示)
    const effectiveImage = imageUrl ?? DEMO_PRODUCT_IMAGE;

    try {
      // 1. 创建任务
      const task = await createTask({ agentId, imageUrl: effectiveImage });
      console.log('[Workbench] task created', task);
      const taskId = task.id;

      // 2. 订阅 SSE 流
      subscribeTask(taskId, {
        onStep: (data) => {
          // 防御:确保 step 存在
          if (!data?.step) return;
          const incoming = data.step;
          // 更新思考流步骤
          setSteps((prev) => {
            const idx = prev.findIndex((s) => s.kind === incoming.kind);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = incoming;
              return next;
            }
            return [...prev, incoming];
          });

          // 行动阶段完成时,接收生成的场景图
          if (data.done && incoming.kind === 'act' && data.generations) {
            const newScenes: SceneItem[] = data.generations.map((g) => ({
              generation: g,
              copy: g.copy as SceneItem['copy'],
            }));
            setScenes(newScenes);
          }
        },
        onComplete: () => {
          setRunning(false);
          setFinished(true);
          message.success('Agent 执行完成,详情页已就绪 🎉');
        },
        onError: () => {
          setRunning(false);
          message.error('Agent 执行出错,请重试');
        },
      });
    } catch {
      setRunning(false);
      message.error('启动任务失败');
    }
  }, [agentId, imageUrl, message]);

  // ===== 单图重生(人工介入)=====
  const handleRegenerate = async (gen: Generation) => {
    const taskId = gen.taskId;
    setScenes((prev) =>
      prev.map((s) =>
        s.generation.id === gen.id ? { ...s, regenerating: true } : s,
      ),
    );
    try {
      const newGen = await regenerateImage(taskId, gen.id);
      setScenes((prev) =>
        prev.map((s) =>
          s.generation.id === gen.id
            ? { ...s, generation: { ...newGen, taskId }, regenerating: false }
            : s,
        ),
      );
      message.success({ content: `「${gen.scene}」已重新生成 ✅`, key: gen.id });
    } catch {
      setScenes((prev) =>
        prev.map((s) =>
          s.generation.id === gen.id ? { ...s, regenerating: false } : s,
        ),
      );
    }
  };

  if (agentLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px 32px' }}>
      {/* ===== 顶部:返回 + Agent 信息 + 阶段进度 ===== */}
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
          />
          <span style={{ fontSize: 24 }}>{agent?.icon}</span>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {agent?.name}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Agent 工作台
            </Text>
          </div>
        </Space>

        {/* 四阶段进度指示器 */}
        <StageProgress steps={steps} />
      </div>

      {/* ===== 三栏布局 ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 380px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* ----- 左:输入区 ----- */}
        <Card title="① 输入" size="small" style={{ position: 'sticky', top: 16 }}>
          <Dragger {...uploadProps} style={{ marginBottom: 12, padding: '8px 4px' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: PRIMARY }} />
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              点击或拖拽上传<span style={{ color: PRIMARY }}>商品白底图</span>
            </p>
          </Dragger>

          {imageUrl && (
            <div style={{ marginBottom: 12 }}>
              <img
                src={imageUrl}
                alt="商品图"
                style={{ width: '100%', borderRadius: 6, border: '1px solid #f0f0f5' }}
              />
            </div>
          )}

          <Button
            type="primary"
            block
            size="large"
            icon={<PlayCircleOutlined />}
            loading={running}
            onClick={handleRun}
          >
            {running ? 'Agent 执行中...' : imageUrl ? '开始执行' : '开始执行(演示)'}
          </Button>

          <Divider style={{ margin: '14px 0' }} />
          <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.7 }}>
            <ExperimentOutlined /> Agent 将自主完成:
            <br />
            识别商品 → 匹配场景 → 生成 4 图 + 文案 → 拼装详情页
          </Text>
        </Card>

        {/* ----- 中:思考流(核心)----- */}
        <Card
          title={
            <Space>
              <span>② Agent 思考流</span>
              {running && <Tag color="processing">运行中</Tag>}
              {finished && <Tag color="success">完成</Tag>}
            </Space>
          }
          size="small"
          style={{ minHeight: 480 }}
        >
          <ThinkStream steps={steps} running={running} />
        </Card>

        {/* ----- 右:场景图 + 反馈 ----- */}
        <div>
          <Card
            title={
              <Space>
                <span>③ 场景图</span>
                <Tag color="orange">Human-in-the-loop</Tag>
              </Space>
            }
            size="small"
            extra={scenes.length > 0 ? <Text type="secondary" style={{ fontSize: 12 }}>{scenes.length} 张</Text> : null}
          >
            <SceneGrid items={scenes} loading={running && scenes.length === 0} onRegenerate={handleRegenerate} />
            {scenes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Paragraph type="secondary" style={{ fontSize: 11, margin: 0, textAlign: 'center' }}>
                  💡 异常图片可单独重生;👍/👎 反馈将回流用于优化 Prompt
                </Paragraph>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ===== 底部:详情页拼装预览 ===== */}
      <div style={{ marginTop: 18 }}>
        <DetailPreview items={scenes} done={finished} />
      </div>
    </div>
  );
}

// ===== 四阶段进度指示器 =====
function StageProgress({ steps }: { steps: TaskStep[] }) {
  const doneKinds = new Set(steps.filter((s) => s.status === 'done').map((s) => s.kind));
  const runningKind = steps.find((s) => s.status === 'running')?.kind;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {STAGES.map((s, i) => {
        const isDone = doneKinds.has(s.key as TaskStep['kind']);
        const isRunning = runningKind === s.key;
        const color = isDone ? STAGE_COLORS.act : isRunning ? PRIMARY : '#d9d9d9';
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 12,
                background: isDone || isRunning ? `${color}15` : '#fafafa',
                border: `1px solid ${color}`,
                color,
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 11 }}>{i + 1}. {s.icon} {s.label}</span>
              {isDone && <CheckCircleOutlined style={{ fontSize: 11 }} />}
              {isRunning && <Spin size="small" />}
            </div>
            {i < STAGES.length - 1 && <span style={{ color: '#d9d9d9' }}>→</span>}
          </div>
        );
      })}
    </div>
  );
}

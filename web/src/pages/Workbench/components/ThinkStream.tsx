import { Typography, Tag, Timeline, Spin } from 'antd';
import {
  EyeOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { TaskStep, NodeKind } from 'shared';
import { STAGE_COLORS } from '@/theme/token';

const { Text } = Typography;

interface Props {
  steps: TaskStep[];
  running: boolean;
}

/** 四阶段元信息 */
const STAGE_META: Record<NodeKind, { label: string; icon: React.ReactNode; color: string }> = {
  perceive: { label: '感知', icon: <EyeOutlined />, color: STAGE_COLORS.perceive },
  think: { label: '思考', icon: <BulbOutlined />, color: STAGE_COLORS.think },
  act: { label: '行动', icon: <ThunderboltOutlined />, color: STAGE_COLORS.act },
  output: { label: '输出', icon: <CheckCircleOutlined />, color: STAGE_COLORS.output },
};

/** Agent 思考流 —— 实时展示「感知→思考→行动→输出」 */
export default function ThinkStream({ steps, running }: Props) {
  if (steps.length === 0 && !running) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#bfbfbf' }}>
        <EyeOutlined style={{ fontSize: 36, marginBottom: 12 }} />
        <div>上传商品图并点击「开始执行」</div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Agent 将自主完成 感知 → 思考 → 行动 → 输出
        </Text>
      </div>
    );
  }

  const items = steps.map((s) => {
    const meta = STAGE_META[s.kind];
    return {
      color: s.status === 'done' ? meta.color : '#d9d9d9',
      dot: s.status === 'running' ? <LoadingOutlined style={{ fontSize: 16 }} /> : undefined,
      children: (
        <div style={{ paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ color: meta.color }}>{meta.icon}</span>
            <Tag
              color={s.status === 'done' ? meta.color : 'default'}
              style={{ margin: 0, fontSize: 11 }}
            >
              {meta.label}
            </Tag>
            <Text strong style={{ fontSize: 13 }}>
              {s.title}
            </Text>
            {s.status === 'done' && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {s.durationMs ? `${(s.durationMs / 1000).toFixed(1)}s` : ''}
                {s.tokens ? ` · ${s.tokens} tokens` : ''}
              </Text>
            )}
          </div>
          {s.status === 'running' ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Spin size="small" style={{ marginRight: 6 }} />
              {s.detail}
            </Text>
          ) : (
            <Text style={{ fontSize: 12.5, color: '#595959', lineHeight: 1.6 }}>{s.detail}</Text>
          )}
        </div>
      ),
    };
  });

  return (
    <div style={{ padding: '8px 4px' }}>
      <Timeline items={items} />
    </div>
  );
}

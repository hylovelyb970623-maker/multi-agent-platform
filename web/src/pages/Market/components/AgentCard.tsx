import { Card, Tag, Space, Typography, Rate } from 'antd';
import { ThunderboltOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { Agent } from 'shared';
import { CATEGORY_LABELS } from '@/api/agents';
import { getCoverColor, NEUTRAL } from '@/theme/token';

const { Text } = Typography;

interface Props {
  agent: Agent;
  onEnter: () => void;
}

/** 普通智能体卡片(纯色封面,去 AI 化) */
export default function AgentCard({ agent, onEnter }: Props) {
  return (
    <Card
      className="ds-card-hover"
      hoverable
      style={{ borderRadius: 14, border: `1px solid ${NEUTRAL.border}`, height: '100%' }}
      bodyStyle={{ padding: 0 }}
      onClick={onEnter}
    >
      {/* 封面纯色 + 图标 */}
      <div
        style={{
          height: 120,
          background: getCoverColor(agent.id),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 50,
          color: 'rgba(255,255,255,0.92)',
          borderRadius: '14px 14px 0 0',
        }}
      >
        {agent.icon}
      </div>

      {/* 信息 */}
      <div style={{ padding: '16px 18px 18px' }}>
        <Space size={6} style={{ marginBottom: 8 }}>
          <Tag
            color="default"
            style={{ margin: 0, fontSize: 11, padding: '1px 8px' }}
          >
            {CATEGORY_LABELS[agent.category]}
          </Tag>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 16 }}>
            {agent.name}
          </Text>
        </div>

        <Text
          type="secondary"
          ellipsis={{ tooltip: agent.description }}
          style={{ fontSize: 12.5, display: 'block', marginTop: 6, lineHeight: 1.5, minHeight: 38 }}
        >
          {agent.description}
        </Text>

        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${NEUTRAL.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space size={14} style={{ fontSize: 12, color: NEUTRAL.textSecondary }}>
            <span>
              <ThunderboltOutlined style={{ color: NEUTRAL.textTertiary }} /> {formatCount(agent.usageCount)}
            </span>
            <Rate disabled allowHalf value={agent.rating} style={{ fontSize: 12 }} />
          </Space>
          <ArrowRightOutlined style={{ color: NEUTRAL.textSecondary, fontSize: 13 }} />
        </div>
      </div>
    </Card>
  );
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

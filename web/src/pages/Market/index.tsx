import { useState, useMemo } from 'react';
import {
  Typography,
  Input,
  Segmented,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Skeleton,
  Empty,
  Statistic,
  Space,
  Tooltip,
  Rate,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ArrowRightOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAgents, CATEGORY_LABELS } from '@/api/agents';
import { PRIMARY, getCoverColor, NEUTRAL } from '@/theme/token';
import type { Agent, AgentCategory } from 'shared';
import AgentCard from './components/AgentCard';

const { Title, Text } = Typography;

export default function Market() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<AgentCategory | 'all'>('all');

  // 拉取 Agent 列表
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', { category, keyword }],
    queryFn: () => fetchAgents({ category, keyword }),
  });

  // 置顶 Agent 单独取第一个(featured)
  const featured = agents.find((a) => a.featured);
  const rest = agents.filter((a) => !a.featured);

  return (
    <div style={{ padding: '28px 32px 40px' }}>
      {/* ===== Hero 区(纯墨绿实色)===== */}
      <div
        style={{
          background: PRIMARY,
          borderRadius: 20,
          padding: '36px 40px',
          marginBottom: 28,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 620 }}>
          <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: 8, fontWeight: 600 }}>
            智能体市场
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.7 }}>
            选择一个智能体,上传素材,自动产出可商用的运营物料。
            <br />
            感知 → 思考 → 行动 → 输出,全流程可视化。
          </Text>
          <div style={{ marginTop: 20, display: 'flex', gap: 32 }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.75)' }}>智能体</span>}
              value={agents.length}
              valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 500 }}
            />
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.75)' }}>累计执行</span>}
              value={agents.reduce((s, a) => s + a.usageCount, 0)}
              suffix="次"
              valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 500 }}
            />
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.75)' }}>平均评分</span>}
              value={
                agents.length
                  ? (agents.reduce((s, a) => s + a.rating, 0) / agents.length).toFixed(1)
                  : '0'
              }
              valueStyle={{ color: '#fff', fontSize: 24, fontWeight: 500 }}
            />
          </div>
        </div>
      </div>

      {/* ===== 筛选 & 搜索栏 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Segmented
          value={category}
          onChange={(v) => setCategory(v as AgentCategory | 'all')}
          options={[
            { label: CATEGORY_LABELS.all, value: 'all' },
            { label: CATEGORY_LABELS.ecommerce, value: 'ecommerce' },
            { label: CATEGORY_LABELS.content, value: 'content' },
            { label: CATEGORY_LABELS.data, value: 'data' },
            { label: CATEGORY_LABELS.service, value: 'service' },
          ]}
        />
        <Space>
          <Input
            placeholder="搜索智能体名称"
            allowClear
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 220 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/editor')}
          >
            创建新 Agent
          </Button>
        </Space>
      </div>

      {/* ===== 主打 Agent(大卡片,横排)===== */}
      {featured && (
        <FeaturedAgent agent={featured} onEnter={() => navigate(`/workbench/${featured.id}`)} />
      )}

      {/* ===== 普通卡片网格 ===== */}
      <Title level={5} style={{ marginTop: 32, marginBottom: 14 }}>
        {featured ? '更多智能体' : '全部智能体'}
      </Title>

      {isLoading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col key={i} xs={24} sm={12} lg={8} xl={6}>
              <Card>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : rest.length === 0 ? (
        <Empty description="暂无智能体" />
      ) : (
        <Row gutter={[20, 20]}>
          {rest.map((agent) => (
            <Col key={agent.id} xs={24} sm={12} lg={8} xl={6}>
              <AgentCard agent={agent} onEnter={() => navigate(`/workbench/${agent.id}`)} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

// ===== 主打 Agent 大卡片 =====
function FeaturedAgent({ agent, onEnter }: { agent: Agent; onEnter: () => void }) {
  return (
    <Card
      className="ds-card-hover"
      style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}
      bodyStyle={{ padding: 0 }}
    >
      <Row>
        {/* 左:封面(纯色) */}
        <Col xs={24} md={10}>
          <div
            style={{
              background: getCoverColor(agent.id),
              height: '100%',
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            {agent.icon}
          </div>
        </Col>
        {/* 右:信息 */}
        <Col xs={24} md={14} style={{ padding: 28 }}>
          <Space size={8} style={{ marginBottom: 10 }}>
            <Tag color="default" icon={<FireOutlined />}>
              主打
            </Tag>
            <Tag color="default">电商运营</Tag>
          </Space>
          <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
            {agent.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>
            {agent.description}
          </Text>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={24}>
              <span>
                <ThunderboltOutlined style={{ color: NEUTRAL.textTertiary }} /> {agent.usageCount.toLocaleString()} 次执行
              </span>
              <span>
                <StarFilled style={{ color: NEUTRAL.textTertiary }} /> {agent.rating}
              </span>
            </Space>
            <Button type="primary" icon={<ArrowRightOutlined />} onClick={onEnter} size="large">
              进入工作台
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

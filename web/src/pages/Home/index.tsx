import { useState } from 'react';
import {
  Typography,
  Input,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Skeleton,
  Empty,
  Statistic,
  Space,
  Carousel,
} from 'antd';
import {
  ArrowRightOutlined,
  LeftOutlined,
  RightOutlined,
  ThunderboltOutlined,
  StarFilled,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAgents, CATEGORY_LABELS } from '@/api/agents';
import { PRIMARY, getCoverColor, NEUTRAL } from '@/theme/token';
import type { Agent, AgentCategory } from 'shared';

const { Title, Text } = Typography;

/**
 * 首页 —— 去AI化版
 * 三块:① Hero 区(纯墨绿实色,简洁文案)  ② 推荐工具网格  ③ 一键同款案例轮播
 */
export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  // 拉取 Agent 列表(复用现有 API)
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => fetchAgents(),
  });

  // 主打 Agent 排第一
  const featured = agents.find((a) => a.featured);
  const ordered = featured
    ? [featured, ...agents.filter((a) => !a.featured)]
    : agents;

  return (
    <div style={{ padding: '28px 32px 56px' }}>
      {/* ===== ① Hero 区(纯墨绿实色,简洁)===== */}
      <div
        style={{
          background: PRIMARY,
          borderRadius: 20,
          padding: '44px 48px',
          marginBottom: 32,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 720 }}>
          <Title level={2} style={{ color: '#fff', margin: 0, marginBottom: 10, fontWeight: 600 }}>
            多 Agent 智能体平台
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.7 }}>
            上传素材,Agent 自动识别商品、匹配场景、生成场景图与多语言文案,拼装成可商用的详情页。
            <br />
            感知 → 思考 → 行动 → 输出,全流程可视化、可编排、可反馈优化。
          </Text>

          {/* 装饰性搜索框 */}
          <div style={{ marginTop: 24, maxWidth: 560 }}>
            <Input.Search
              size="large"
              enterButton={
                <span>
                  开始 <ArrowRightOutlined />
                </span>
              }
              placeholder="例如:给白色运动鞋生成 4 张场景图"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => navigate('/market')}
              style={{ borderRadius: 10 }}
            />
            {/* 快捷分类标签 */}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(['ecommerce', 'content', 'data', 'service'] as AgentCategory[]).map((c) => (
                <Tag
                  key={c}
                  style={{
                    margin: 0,
                    padding: '4px 14px',
                    fontSize: 13,
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/market?category=${c}`)}
                >
                  {CATEGORY_LABELS[c]}
                </Tag>
              ))}
            </div>
          </div>

          {/* 统计数据 */}
          <div style={{ marginTop: 28, display: 'flex', gap: 36 }}>
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

      {/* ===== ② 推荐工具网格 ===== */}
      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            推荐工具
          </Title>
          <Button type="link" onClick={() => navigate('/market')}>
            查看全部 <ArrowRightOutlined />
          </Button>
        </div>

        {isLoading ? (
          <Row gutter={[20, 20]}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Col key={i} xs={12} sm={12} md={8} lg={6}>
                <Card>
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : ordered.length === 0 ? (
          <Empty description="暂无工具" />
        ) : (
          <Row gutter={[20, 20]}>
            {ordered.map((agent) => (
              <Col key={agent.id} xs={12} sm={12} md={8} lg={6}>
                <ToolCard agent={agent} onEnter={() => navigate(`/workbench/${agent.id}`)} />
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ===== ③ 一键同款(案例轮播)===== */}
      <div>
        <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
          一键同款
        </Title>
        {isLoading || ordered.length === 0 ? (
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ) : (
          <Carousel
            arrows
            slidesToScroll={1}
            prevArrow={<SamplePrevArrow />}
            nextArrow={<SampleNextArrow />}
          >
            {ordered.map((agent) => (
              <CaseSlide
                key={agent.id}
                agent={agent}
                onUse={() => navigate(`/workbench/${agent.id}`)}
                onPreview={() => navigate(`/editor/${agent.id}`)}
              />
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
}

// ===== 推荐工具卡片(纯色封面,无渐变) =====
function ToolCard({ agent, onEnter }: { agent: Agent; onEnter: () => void }) {
  return (
    <Card
      className="ds-card-hover"
      hoverable
      style={{ borderRadius: 14, border: `1px solid ${NEUTRAL.border}`, height: '100%' }}
      bodyStyle={{ padding: 0 }}
      onClick={onEnter}
    >
      {/* 封面纯色 + emoji */}
      <div
        style={{
          height: 96,
          background: getCoverColor(agent.id),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          color: 'rgba(255,255,255,0.92)',
          borderRadius: '14px 14px 0 0',
        }}
      >
        {agent.icon}
      </div>
      {/* 信息 */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 14 }}>
            {agent.name}
          </Text>
          {agent.featured && (
            <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
              主打
            </Tag>
          )}
        </div>
        <Text
          type="secondary"
          ellipsis={{ tooltip: agent.description }}
          style={{ fontSize: 12, display: 'block', marginTop: 6, lineHeight: 1.5, minHeight: 36 }}
        >
          {agent.description}
        </Text>
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${NEUTRAL.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: NEUTRAL.textSecondary,
          }}
        >
          <span>
            <ThunderboltOutlined style={{ color: NEUTRAL.textTertiary }} /> {formatCount(agent.usageCount)}
          </span>
          <span>
            <StarFilled style={{ color: NEUTRAL.textTertiary }} /> {agent.rating}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ===== 一键同款案例 slide =====
function CaseSlide({
  agent,
  onUse,
  onPreview,
}: {
  agent: Agent;
  onUse: () => void;
  onPreview: () => void;
}) {
  return (
    <div>
      <Card
        style={{ borderRadius: 14, border: `1px solid ${NEUTRAL.border}`, margin: '0 6px' }}
        bodyStyle={{ padding: 0 }}
      >
        <Row>
          {/* 左:案例图区(纯色) */}
          <Col xs={24} md={10}>
            <div
              style={{
                background: getCoverColor(agent.id),
                height: '100%',
                minHeight: 176,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 60,
                color: 'rgba(255,255,255,0.92)',
                borderRadius: '14px 0 0 14px',
              }}
            >
              {agent.icon}
            </div>
          </Col>
          {/* 右:案例叙事 */}
          <Col xs={24} md={14} style={{ padding: '22px 24px' }}>
            <Tag color="default" style={{ marginBottom: 8 }}>
              {CATEGORY_LABELS[agent.category]}
            </Tag>
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {agent.name}
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: 13, lineHeight: 1.7, display: 'block', minHeight: 66 }}
              ellipsis={{ tooltip: agent.description }}
            >
              {agent.description}
            </Text>
            <Space size={16} style={{ fontSize: 12, color: NEUTRAL.textSecondary, marginTop: 8 }}>
              <span>
                <ThunderboltOutlined style={{ color: NEUTRAL.textTertiary }} /> {formatCount(agent.usageCount)} 次执行
              </span>
              <span>
                <StarFilled style={{ color: NEUTRAL.textTertiary }} /> {agent.rating}
              </span>
            </Space>
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              <Button icon={<EyeOutlined />} onClick={onPreview}>
                预览
              </Button>
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={onUse}>
                做同款
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

// ===== 自定义轮播箭头 =====
function SamplePrevArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: -8,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: NEUTRAL.textSecondary,
      }}
    >
      <LeftOutlined />
    </div>
  );
}

function SampleNextArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        right: -8,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: NEUTRAL.textSecondary,
      }}
    >
      <RightOutlined />
    </div>
  );
}

// ===== 工具函数 =====
function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

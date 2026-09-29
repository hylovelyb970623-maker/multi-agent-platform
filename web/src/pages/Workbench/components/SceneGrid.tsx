import { useState } from 'react';
import { Card, Tag, Button, Tooltip, Badge, Spin, Image, App } from 'antd';
import {
  ReloadOutlined,
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
  WarningFilled,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { Generation } from 'shared';
import { submitFeedback } from '@/api/feedback';
import type { SceneItem } from '../types';

interface Props {
  items: SceneItem[];
  loading: boolean;
  onRegenerate: (gen: Generation) => void;
}

/** 场景图宫格 + 人工介入 + 👍/👎 反馈 */
export default function SceneGrid({ items, loading, onRegenerate }: Props) {
  const { message } = App.useApp();

  if (loading && items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf' }}>
        <Spin tip="Agent 正在生成场景图..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#bfbfbf' }}>
        <ThunderboltIcon />
        <div>场景图将在此展示</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}
    >
      {items.map((item, idx) => (
        <SceneCard
          key={item.generation.id}
          index={idx}
          item={item}
          onRegenerate={onRegenerate}
          onFeedback={(type) => message.success(type === 'up' ? '感谢认可 👍 已记录为正样本' : '感谢反馈 👎 已作为负样本回流')}
        />
      ))}
    </div>
  );
}

function ThunderboltIcon() {
  return <ReloadOutlined style={{ fontSize: 28, marginBottom: 8, color: '#d9d9d9' }} />;
}

// ===== 单张场景卡片 =====
function SceneCard({
  index,
  item,
  onRegenerate,
  onFeedback,
}: {
  index: number;
  item: SceneItem;
  onRegenerate: (gen: Generation) => void;
  onFeedback: (type: 'up' | 'down') => void;
}) {
  const gen = item.generation;
  const regenerating = item.regenerating;
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const { message } = App.useApp();

  const flagged = gen.needsReview;

  const handleFeedback = async (type: 'up' | 'down') => {
    if (feedback) return;
    setFeedback(type);
    try {
      await submitFeedback({ generationId: gen.id, type });
      onFeedback(type);
    } catch {
      setFeedback(null);
    }
  };

  const handleRegenerate = () => {
    onRegenerate(gen);
    message.loading({ content: `正在重新生成「${gen.scene}」...`, key: gen.id, duration: 2 });
  };

  return (
    <Badge.Ribbon
      text={
        flagged ? (
          <span>
            <WarningFilled /> 需人工介入
          </span>
        ) : (
          <span>
            <CheckCircleFilled /> 已通过
          </span>
        )
      }
      color={flagged ? 'red' : 'green'}
      style={{ display: gen.status === 'done' || flagged ? 'block' : 'none' }}
    >
      <Card
        size="small"
        bodyStyle={{ padding: 0 }}
        style={{
          overflow: 'hidden',
          border: flagged ? '2px solid #ff4d4f' : '1px solid #eef0f5',
          opacity: regenerating ? 0.6 : 1,
        }}
      >
        {/* 图片区 */}
        <div
          style={{
            position: 'relative',
            height: 150,
            background: '#f5f6fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {regenerating ? (
            <Spin tip="重新生成中..." />
          ) : (
            <Image
              src={gen.imageUrl}
              alt={gen.scene}
              style={{ maxHeight: 150, objectFit: 'cover' }}
              preview={{ mask: '点击预览' }}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23F7F8FA'/%3E%3Ctext x='300' y='300' font-size='24' fill='%230F766E' text-anchor='middle'%3E%E5%9C%BA%E6%99%AF%E5%9B%BE%3C/text%3E%3C/svg%3E"
            />
          )}
          {/* 序号 */}
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              borderRadius: 10,
              width: 20,
              height: 20,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {index + 1}
          </div>
        </div>

        {/* 信息 + 操作区 */}
        <div style={{ padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Tag color="blue" style={{ margin: 0 }}>
              {gen.scene}
            </Tag>
            {flagged && (
              <Tooltip title="检测到异常(如手指畸形),建议重生">
                <Tag color="red" style={{ margin: 0, fontSize: 10 }}>
                  检测异常
                </Tag>
              </Tooltip>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRegenerate}
              disabled={regenerating}
              type={flagged ? 'primary' : 'text'}
              danger={flagged}
            >
              重新生成
            </Button>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                size="small"
                type="text"
                icon={feedback === 'up' ? <LikeFilled style={{ color: '#52c41a' }} /> : <LikeOutlined />}
                onClick={() => handleFeedback('up')}
                disabled={!!feedback}
              />
              <Button
                size="small"
                type="text"
                icon={feedback === 'down' ? <DislikeFilled style={{ color: '#ff4d4f' }} /> : <DislikeOutlined />}
                onClick={() => handleFeedback('down')}
                disabled={!!feedback}
              />
            </div>
          </div>
        </div>
      </Card>
    </Badge.Ribbon>
  );
}

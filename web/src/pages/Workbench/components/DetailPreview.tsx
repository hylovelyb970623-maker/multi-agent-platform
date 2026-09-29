import { Card, Button, Empty, Tag, Typography, Tooltip } from 'antd';
import { DownloadOutlined, GlobalOutlined } from '@ant-design/icons';
import type { SceneItem } from '../types';

const { Text, Title, Paragraph } = Typography;

interface Props {
  items: SceneItem[];
  done: boolean;
}

/** 详情页拼装预览 —— 把场景图 + 文案组合成商品详情页形态 */
export default function DetailPreview({ items, done }: Props) {
  const validItems = items.filter((i) => !i.generation.needsReview || i.regenerating === false);
  const showItems = items.filter((i) => !i.regenerating && !i.generation.needsReview);

  if (!done || showItems.length === 0) {
    return (
      <Card size="small" style={{ background: '#fafafa', borderStyle: 'dashed' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Agent 完成执行后,详情页将在此拼装预览"
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📄 详情页拼装预览</span>
          <Tag color="green" style={{ fontSize: 10 }}>
            已就绪
          </Tag>
        </div>
      }
      extra={
        <Tooltip title="导出为图片 / HTML">
          <Button size="small" type="primary" icon={<DownloadOutlined />}>
            导出
          </Button>
        </Tooltip>
      }
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f5',
          borderRadius: 8,
          overflow: 'hidden',
          maxHeight: 420,
          overflowY: 'auto',
        }}
      >
        {/* 详情页头图区 */}
        <div
          className="ds-gradient"
          style={{
            padding: '24px 20px',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
            DETAIL PAGE · 智能生成
          </div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            {showItems[0]?.copy?.find((c) => c.lang === 'zh')?.headline ?? '商品详情'}
          </div>
        </div>

        {/* 场景图 + 文案交错排列(模拟真实详情页结构)*/}
        {showItems.map((item, idx) => {
          const zhCopy = item.copy?.find((c) => c.lang === 'zh');
          return (
            <div
              key={item.generation.id}
              style={{
                display: 'flex',
                flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                borderBottom: '1px solid #f5f5f5',
              }}
            >
              <img
                src={item.generation.imageUrl}
                alt={item.generation.scene}
                style={{ width: '45%', objectFit: 'cover', minHeight: 120 }}
              />
              <div style={{ flex: 1, padding: '14px 16px' }}>
                <Tag color="blue" style={{ marginBottom: 6 }}>
                  {item.generation.scene}
                </Tag>
                {zhCopy && (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                      {zhCopy.headline}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#8c8c8c', fontSize: 12, lineHeight: 1.8 }}>
                      {zhCopy.sellingPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* 多语言切换提示 */}
        <div
          style={{
            padding: '10px 16px',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#8c8c8c',
            fontSize: 11,
          }}
        >
          <GlobalOutlined /> 已生成中 / 英双语版本,可一键切换发布到不同地区站点
        </div>
      </div>
    </Card>
  );
}

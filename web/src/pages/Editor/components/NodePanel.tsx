import { Typography } from 'antd';
import { NODE_KINDS } from '../defaults';
import type { NodeKindMeta } from '../defaults';

const { Text, Title } = Typography;

/** 左侧节点面板 —— 拖拽到画布新增节点 */
export default function NodePanel() {
  const onDragStart = (e: React.DragEvent, meta: NodeKindMeta) => {
    e.dataTransfer.setData('application/reactflow-kind', meta.kind);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ padding: '12px 10px' }}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4, fontSize: 14 }}>
        节点类型
      </Title>
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>
        拖拽到画布添加节点
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NODE_KINDS.map((meta) => (
          <div
            key={meta.kind}
            draggable
            onDragStart={(e) => onDragStart(e, meta)}
            style={{
              padding: '10px 12px',
              background: '#fff',
              border: '1px solid #e8e8ef',
              borderLeft: `3px solid ${meta.color}`,
              borderRadius: 8,
              cursor: 'grab',
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = meta.color;
              e.currentTarget.style.boxShadow = `0 2px 8px ${meta.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8ef';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{meta.icon}</span>
              <Text strong style={{ fontSize: 13 }}>
                {meta.label}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
              {meta.desc}
            </Text>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: '10px',
          background: '#f6f5ff',
          borderRadius: 8,
          fontSize: 11,
          color: '#8c8c8c',
          lineHeight: 1.6,
        }}
      >
        💡 <Text strong style={{ fontSize: 11 }}>编排提示</Text>
        <br />
        标准流程:感知 → 思考 → 行动 → 输出
        <br />
        拖拽节点右侧圆点可连线
      </div>
    </div>
  );
}

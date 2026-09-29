import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tag, Typography } from 'antd';
import { getNodeMeta } from '../defaults';
import type { NodeKind } from 'shared';

const { Text } = Typography;

export interface AgentNodeData {
  kind: NodeKind;
  label: string;
  tool?: string;
  model?: string;
  prompt?: string;
  [key: string]: unknown;
}

interface Props {
  data: AgentNodeData;
  selected?: boolean;
}

/** 编排画布上的自定义节点 */
function AgentNodeBase({ data, selected }: Props) {
  const meta = getNodeMeta(data.kind);

  return (
    <div
      style={{
        width: 200,
        background: '#fff',
        border: `2px solid ${selected ? meta.color : '#e8e8ef'}`,
        borderRadius: 12,
        boxShadow: selected
          ? `0 4px 16px ${meta.color}40`
          : '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* 头部:类型标识 */}
      <div
        style={{
          background: `${meta.color}12`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: `1px solid ${meta.color}20`,
        }}
      >
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <Tag
          color={meta.color}
          style={{ margin: 0, fontSize: 10, lineHeight: '16px', padding: '0 6px' }}
        >
          {meta.label}
        </Tag>
        <Text strong style={{ fontSize: 13, flex: 1 }}>
          {data.label}
        </Text>
      </div>

      {/* 内容:工具 + 模型 */}
      <div style={{ padding: '8px 12px', fontSize: 11, lineHeight: 1.7 }}>
        {data.tool && (
          <div style={{ color: '#8c8c8c' }}>
            🔧 工具:<span style={{ color: '#595959' }}>{data.tool}</span>
          </div>
        )}
        {data.model && (
          <div style={{ color: '#8c8c8c' }}>
            🤖 模型:<span style={{ color: '#595959' }}>{data.model}</span>
          </div>
        )}
        {data.prompt && (
          <div
            style={{
              color: '#8c8c8c',
              marginTop: 4,
              paddingTop: 4,
              borderTop: '1px dashed #f0f0f0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {data.prompt}
          </div>
        )}
      </div>

      {/* 连接点:输入(左)+ 输出(右) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: meta.color,
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: meta.color,
          width: 10,
          height: 10,
          border: '2px solid #fff',
        }}
      />
    </div>
  );
}

export default memo(AgentNodeBase);

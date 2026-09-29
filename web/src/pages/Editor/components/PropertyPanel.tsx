import { Form, Input, Select, Typography, Empty, Tag, Divider, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getNodeMeta } from '../defaults';
import type { AgentNodeData } from './AgentNode';
import type { NodeKind } from 'shared';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Props {
  data: AgentNodeData | null;
  onChange: (patch: Partial<AgentNodeData>) => void;
  onDelete: () => void;
}

/** 右侧属性面板 —— 编辑选中节点的 prompt / 模型 / 工具 */
export default function PropertyPanel({ data, onChange, onDelete }: Props) {
  if (!data) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="选中节点以编辑属性"
        />
      </div>
    );
  }

  const meta = getNodeMeta(data.kind);

  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{meta.icon}</span>
        <Title level={5} style={{ margin: 0, fontSize: 14 }}>
          节点属性
        </Title>
      </div>

      <Tag color={meta.color} style={{ marginBottom: 12 }}>
        {meta.label} · {meta.desc}
      </Tag>

      <Form layout="vertical" size="small">
        <Form.Item label="节点名称">
          <Input
            value={data.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="如:商品识别"
          />
        </Form.Item>

        {meta.tools && meta.tools.length > 0 && (
          <Form.Item label="绑定工具">
            <Select
              value={data.tool}
              onChange={(v) => onChange({ tool: v })}
              options={meta.tools.map((t) => ({ label: t, value: t }))}
              placeholder="选择工具"
            />
          </Form.Item>
        )}

        {meta.models && meta.models.length > 0 && (
          <Form.Item label="模型">
            <Select
              value={data.model}
              onChange={(v) => onChange({ model: v })}
              options={meta.models.map((m) => ({ label: m, value: m }))}
              placeholder="选择模型"
            />
          </Form.Item>
        )}

        <Form.Item label="Prompt 模板">
          <TextArea
            value={data.prompt}
            onChange={(e) => onChange({ prompt: e.target.value })}
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="该节点的提示词模板,可用 {{变量}} 引用上游输出"
          />
          <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>
            支持 {'{{perceive.output}}'} 等变量引用上游节点结果
          </Text>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '12px 0' }} />

      <Button
        danger
        block
        icon={<DeleteOutlined />}
        onClick={onDelete}
      >
        删除节点
      </Button>
    </div>
  );
}

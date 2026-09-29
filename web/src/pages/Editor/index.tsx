import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Typography,
  Button,
  Space,
  Tag,
  App,
  Card,
  Tooltip,
  Modal,
  Input,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  PlayCircleOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  ApartmentOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAgent, saveWorkflow, createAgent } from '@/api/agents';
import AgentNode, { type AgentNodeData } from './components/AgentNode';
import NodePanel from './components/NodePanel';
import PropertyPanel from './components/PropertyPanel';
import { DEFAULT_WORKFLOW, toWorkflowSchema, getNodeMeta, NODE_KINDS } from './defaults';
import { PRIMARY } from '@/theme/token';
import type { WorkflowSchema, NodeKind } from 'shared';

const { Title, Text } = Typography;

// 自定义节点类型映射
const nodeTypes = { agent: AgentNode };

// ===== 把持久化的 WorkflowSchema 转成 React Flow 的 nodes/edges =====
function schemaToRF(schema: WorkflowSchema | null | undefined): { nodes: Node[]; edges: Edge[] } {
  const wf = schema && schema.nodes?.length ? schema : DEFAULT_WORKFLOW;
  return {
    nodes: wf.nodes.map((n) => ({
      id: n.id,
      type: 'agent',
      position: n.position,
      data: {
        kind: n.kind,
        label: n.label,
        tool: n.tool,
        model: n.model,
        prompt: n.prompt,
      } as AgentNodeData,
    })),
    edges: wf.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: PRIMARY, strokeWidth: 2 },
    })),
  };
}

export default function Editor() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();

  // 是否为新建模式(无 agentId)
  const isNew = !agentId || agentId === 'new';

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => fetchAgent(agentId!),
    enabled: !isNew,
  });

  // 初始化 nodes/edges
  const initial = useMemo(() => schemaToRF(agent?.workflowJson), [agent?.workflowJson]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveAsModal, setSaveAsModal] = useState(false);
  const [newName, setNewName] = useState('');

  const rfWrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  // agent 数据加载后,如果 nodes 还是空的,初始化
  useEffect(() => {
    if (!isLoading) {
      const { nodes: ns, edges: es } = schemaToRF(agent?.workflowJson);
      setNodes(ns);
      setEdges(es);
      setDirty(false);
    }
  }, [agent, isLoading, setNodes, setEdges]);

  // ===== 选中节点 =====
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedData = (selectedNode?.data as AgentNodeData) ?? null;

  // 标记未保存
  const markDirty = useCallback(() => setDirty(true), []);

  // ===== 连线 =====
  const onConnect: OnConnect = useCallback(
    (conn: Connection) => {
      setEdges((eds: Edge[]) =>
        addEdge({ ...conn, animated: true, style: { stroke: PRIMARY, strokeWidth: 2 } }, eds),
      );
      markDirty();
    },
    [setEdges, markDirty],
  );

  // ===== 拖拽新增节点 =====
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData('application/reactflow-kind') as NodeKind;
      if (!kind || !rfInstance.current) return;

      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const meta = getNodeMeta(kind);
      const id = `n-${kind}-${Date.now()}`;
      const newNode: Node = {
        id,
        type: 'agent',
        position,
        data: {
          kind,
          label: `${meta.label}节点`,
          tool: meta.tools?.[0],
          model: meta.models?.[0],
          prompt: '',
        } as AgentNodeData,
      };
      setNodes((nds: Node[]) => nds.concat(newNode));
      setSelectedNodeId(id);
      markDirty();
    },
    [setNodes, markDirty],
  );

  // ===== 属性编辑 =====
  const handlePropertyChange = useCallback(
    (patch: Partial<AgentNodeData>) => {
      if (!selectedNodeId) return;
      setNodes((nds: Node[]) =>
        nds.map((n) =>
          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
      markDirty();
    },
    [selectedNodeId, setNodes, markDirty],
  );

  // ===== 删除节点 =====
  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds: Node[]) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds: Edge[]) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
    );
    setSelectedNodeId(null);
    markDirty();
  }, [selectedNodeId, setNodes, setEdges, markDirty]);

  // ===== 保存 =====
  const handleSave = async () => {
    if (!agentId || isNew) {
      setSaveAsModal(true);
      return;
    }
    await doSave(agentId);
  };

  const doSave = async (id: string) => {
    setSaving(true);
    try {
      const wf = toWorkflowSchema(nodes, edges);
      await saveWorkflow(id, wf);
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      message.success(`工作流已保存(${wf.nodes.length} 节点 / ${wf.edges.length} 连线)`);
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // ===== 另存为新 Agent =====
  const handleSaveAs = async () => {
    if (!newName.trim()) {
      message.warning('请输入智能体名称');
      return;
    }
    setSaving(true);
    try {
      const wf = toWorkflowSchema(nodes, edges);
      const { id } = await createAgent({
        name: newName.trim(),
        description: '通过编排器创建',
        category: 'ecommerce',
        workflowJson: wf,
      });
      message.success('智能体已创建');
      setSaveAsModal(false);
      setDirty(false);
      navigate(`/editor/${id}`);
    } catch {
      message.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  // ===== 加载中 =====
  if (!isNew && isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* ===== 顶部工具栏 ===== */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f5',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (dirty) {
                modal.confirm({
                  title: '有未保存的修改',
                  content: '离开将丢失当前编排,确定离开吗?',
                  okText: '离开',
                  cancelText: '继续编辑',
                  onOk: () => navigate('/'),
                });
              } else {
                navigate('/');
              }
            }}
          />
          <ApartmentOutlined style={{ color: PRIMARY }} />
          <Title level={5} style={{ margin: 0 }}>
            {isNew ? '新建智能体编排' : agent?.name ?? '编排工作流'}
          </Title>
          {dirty && <Tag color="orange">未保存</Tag>}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {nodes.length} 节点 · {edges.length} 连线
          </Text>
        </Space>

        <Space>
          <Tooltip title="重置为默认流程">
            <Button
              icon={<UndoOutlined />}
              onClick={() => {
                modal.confirm({
                  title: '重置编排',
                  content: '将恢复为默认的「感知→思考→行动→输出」流程,当前修改会丢失',
                  okText: '重置',
                  cancelText: '取消',
                  onOk: () => {
                    const { nodes: ns, edges: es } = schemaToRF(null);
                    setNodes(ns);
                    setEdges(es);
                    setSelectedNodeId(null);
                    setDirty(true);
                  },
                });
              }}
            >
              重置
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            {isNew ? '另存为 Agent' : '保存'}
          </Button>
          {!isNew && (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/workbench/${agentId}`)}
            >
              运行
            </Button>
          )}
        </Space>
      </div>

      {/* ===== 三栏:节点面板 | 画布 | 属性面板 ===== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 左:节点面板 */}
        <div
          style={{
            width: 220,
            background: '#fff',
            borderRight: '1px solid #f0f0f5',
            overflowY: 'auto',
          }}
        >
          <NodePanel />
        </div>

        {/* 中:画布 */}
        <div ref={rfWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange as OnNodesChange}
            onEdgesChange={onEdgesChange as OnEdgesChange}
            onConnect={onConnect}
            onInit={(inst) => {
              rfInstance.current = inst as ReactFlowInstance;
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            fitView
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: PRIMARY, strokeWidth: 2 },
            }}
            style={{ background: '#f5f6fa' }}
          >
            <Background color="#d9dce8" gap={20} size={1.5} />
            <Controls position="bottom-right" />
            <MiniMap
              nodeColor={(n) => {
                const kind = (n.data?.kind as NodeKind) ?? 'think';
                return getNodeMeta(kind).color;
              }}
              nodeStrokeWidth={3}
              maskColor="rgba(0,0,0,0.05)"
              style={{ borderRadius: 8 }}
            />
          </ReactFlow>
        </div>

        {/* 右:属性面板 */}
        <div
          style={{
            width: 300,
            background: '#fff',
            borderLeft: '1px solid #f0f0f5',
            overflowY: 'auto',
          }}
        >
          <PropertyPanel
            data={selectedData}
            onChange={handlePropertyChange}
            onDelete={handleDeleteNode}
          />
        </div>
      </div>

      {/* ===== 另存为弹窗 ===== */}
      <Modal
        title="另存为新 Agent"
        open={saveAsModal}
        onOk={handleSaveAs}
        onCancel={() => setSaveAsModal(false)}
        okText="创建"
        cancelText="取消"
        confirmLoading={saving}
      >
        <Input
          placeholder="输入智能体名称,如:家居详情页生成 Agent"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          prefix={<PlusOutlined />}
          onPressEnter={handleSaveAs}
        />
        <Text type="secondary" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
          将创建一个新的智能体并保存当前编排,可在工作台运行
        </Text>
      </Modal>
    </div>
  );
}

import { Layout, Menu, theme, Avatar, Badge, Typography } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  RobotOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PRIMARY } from '@/theme/token';

const { Header, Content } = Layout;
const { Text } = Typography;

/**
 * 顶部横向导航项
 * 注意:因为「只做真实能力」,不新建独立的 /tools 页面,「工具」导航指向 /market
 * (4 个真实 Agent 即当前唯一的"工具",避免出现一堆假卡片)
 */
const navItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/market', icon: <AppstoreOutlined />, label: '工具' },
  { key: '/market', icon: <RobotOutlined />, label: '智能体', hide: true },
  { key: '/dashboard', icon: <BarChartOutlined />, label: '数据回流' },
].filter((n) => !n.hide);

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 当前高亮的菜单项:按 pathname 前缀精确匹配
  // - /workbench /editor 归到「工具」(它们都是基于 Agent 的能力入口)
  const { pathname } = location;
  const selectedKey = (() => {
    if (pathname === '/') return '/';
    if (pathname.startsWith('/workbench') || pathname.startsWith('/editor')) return '/market';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    if (pathname.startsWith('/market')) return '/market';
    return '/';
  })();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部横向导航(高度保持 64px,与 Editor 的 calc(100vh - 64px) 兼容) */}
      <Header
        style={{
          background: colorBgContainer,
          height: 64,
          lineHeight: '64px',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f5',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {/* 左:Logo + 主导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* Logo 区 */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div
              className="ds-gradient"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              <RobotOutlined />
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <Text strong style={{ fontSize: 17 }}>
                ds<span className="ds-gradient-text">Agent</span>
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                多 Agent 智能体平台
              </Text>
            </div>
          </div>

          {/* 主导航 */}
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={navItems}
            onClick={({ key }) => navigate(key)}
            style={{
              flex: 1,
              minWidth: 0,
              borderBottom: 'none',
              lineHeight: '62px',
              background: 'transparent',
            }}
          />
        </div>

        {/* 右:通知 + 头像 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Badge count={3} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
            <Avatar style={{ backgroundColor: PRIMARY, cursor: 'pointer' }} size={32}>
              运
            </Avatar>
        </div>
      </Header>

      {/* 内容区 */}
      <Content
        style={{
          margin: 0,
          overflow: 'auto',
          background: '#f5f6fa',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}

import { Result, Typography, Tag, Space } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { PRIMARY } from '@/theme/token';

const { Text, Paragraph } = Typography;

interface Props {
  title: string;
  phase: string;
  description: string;
  bullets?: string[];
}

/** "开发中"占位页 —— 用于尚未实现的阶段页面 */
export default function ComingSoon({ title, phase, description, bullets = [] }: Props) {
  return (
    <div style={{ padding: '40px 32px' }}>
      <Result
        icon={<ToolOutlined style={{ color: PRIMARY, fontSize: 64 }} />}
        title={
          <Space>
            <span>{title}</span>
            <Tag color="default">{phase}</Tag>
          </Space>
        }
        subTitle={
          <div>
            <Paragraph type="secondary">{description}</Paragraph>
            {bullets.length > 0 && (
              <div style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto' }}>
                {bullets.map((b, i) => (
                  <Paragraph key={i} style={{ marginBottom: 6 }}>
                    <Text type="secondary">• {b}</Text>
                  </Paragraph>
                ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

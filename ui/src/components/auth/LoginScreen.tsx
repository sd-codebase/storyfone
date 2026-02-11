import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { login } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const { Title } = Typography;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const { access_token } = await login(values.username, values.password);
      setToken(access_token);
    } catch {
      message.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#141414',
      }}
    >
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Storyfone
        </Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: 'Enter username' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Enter password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

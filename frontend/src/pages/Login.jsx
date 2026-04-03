import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ExperimentOutlined } from '@ant-design/icons';
import { login as loginApi } from '../api/auth';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await loginApi({ studentId: values.studentId, password: values.password });
      setAuth(data.user, data.token);
      message.success('欢迎回来，' + data.user.name);
      navigate('/lab');
    } catch (err) {
      message.error(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: 40, borderRadius: 16,
        width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ExperimentOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>中北大学</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>ICT 实验室管理平台</p>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="studentId" rules={[{ required: true, message: '请输入学号/账号' }]}>
            <Input prefix={<UserOutlined />} placeholder="学号 / 账号" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ height: 44, fontWeight: 600 }}>
              登 录 系 统
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/register" style={{ color: '#2563eb', fontSize: 14 }}>
            没有账号？点击注册
          </Link>
        </div>
      </div>
    </div>
  );
}

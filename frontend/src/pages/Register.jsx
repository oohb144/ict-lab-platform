import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Select, Steps, message } from 'antd';
import { UserAddOutlined, IdcardOutlined } from '@ant-design/icons';
import { register as registerApi } from '../api/auth';

const colleges = [
  '信息与通信工程学院', '计算机科学与技术学院', '大数据学院',
  '电气与控制工程学院', '电子测试技术国防科技重点实验室', '其他学院',
];
const grades = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];

export default function Register() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const navigate = useNavigate();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const onStep1 = async () => {
    const values = await form1.validateFields();
    if (values.password !== values.password2) {
      return message.error('两次密码不一致');
    }
    setAccountData({ studentId: values.studentId, password: values.password });
    setStep(1);
  };

  const onStep2 = async () => {
    const values = await form2.validateFields();
    setLoading(true);
    try {
      await registerApi({ ...accountData, ...values });
      message.success('注册成功！请等待管理员审核后登录');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', padding: 40, borderRadius: 16,
        width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <Steps current={step} size="small" style={{ marginBottom: 24 }}
          items={[{ title: '账号注册', icon: <UserAddOutlined /> }, { title: '实名认证', icon: <IdcardOutlined /> }]} />

        {step === 0 && (
          <Form form={form1} size="large">
            <Form.Item name="studentId" rules={[{ required: true, message: '请输入学号' }]}>
              <Input placeholder="学号（作为登录账号）" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
              <Input.Password placeholder="设置密码（至少6位）" />
            </Form.Item>
            <Form.Item name="password2" rules={[{ required: true, message: '请确认密码' }]}>
              <Input.Password placeholder="确认密码" />
            </Form.Item>
            <Button type="primary" block onClick={onStep1} style={{ height: 44, fontWeight: 600, background: '#16a34a' }}>
              下一步：实名认证
            </Button>
          </Form>
        )}

        {step === 1 && (
          <Form form={form2} size="large" initialValues={{ college: colleges[0], grade: grades[0] }}>
            <Form.Item name="name" rules={[{ required: true, message: '请输入真实姓名' }]}>
              <Input placeholder="真实姓名" />
            </Form.Item>
            <Form.Item name="college">
              <Select options={colleges.map((c) => ({ label: c, value: c }))} />
            </Form.Item>
            <Form.Item name="grade">
              <Select options={grades.map((g) => ({ label: g, value: g }))} />
            </Form.Item>
            <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
              <Input placeholder="联系电话" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button block onClick={() => setStep(0)} style={{ height: 44 }}>上一步</Button>
              <Button type="primary" block loading={loading} onClick={onStep2} style={{ height: 44, fontWeight: 600 }}>
                提交注册
              </Button>
            </div>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: '#2563eb', fontSize: 14 }}>已有账号？返回登录</Link>
        </div>
      </div>
    </div>
  );
}

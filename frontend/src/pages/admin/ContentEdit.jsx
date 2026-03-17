import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { getSiteContent, updateSiteContent } from '../../api/admin';

export default function ContentEdit() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteContent().then(({ data }) => {
      form.setFieldsValue({
        introTitle: data.introTitle,
        introSubtitle: data.introSubtitle,
        introBox1: data.introBox1,
        introBox2: data.introBox2,
        introRules: data.introRules,
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await updateSiteContent(values);
      message.success('网页内容已保存');
    } catch (err) {
      message.error(err.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>网页内容编辑</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>在线修改首页展示内容</p>
        </div>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          保存所有修改
        </Button>
      </div>
      <Form form={form} layout="vertical">
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introTitle" label="主页标题">
            <Input placeholder="主页标题" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introSubtitle" label="副标题">
            <Input placeholder="副标题" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introBox1" label="研究方向介绍">
            <Input.TextArea rows={3} placeholder="研究方向介绍" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12, marginBottom: 16 }}>
          <Form.Item name="introBox2" label="核心赛事介绍">
            <Input.TextArea rows={3} placeholder="核心赛事介绍" />
          </Form.Item>
        </Card>
        <Card style={{ borderRadius: 12 }}>
          <Form.Item name="introRules" label="入驻须知">
            <Input.TextArea rows={6} placeholder="入驻须知" />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}

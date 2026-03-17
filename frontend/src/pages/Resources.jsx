import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, Row, Col, Tag, message, Spin, Upload } from 'antd';
import { UploadOutlined, FileTextOutlined, CodeOutlined, VideoCameraOutlined, FilePptOutlined, FileOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { getResources, createResource, uploadFile } from '../api/resources';
import { formatTime } from '../utils/formatTime';

const typeConfig = {
  pdf: { icon: <FileTextOutlined />, color: '#ef4444', bg: '#fef2f2', label: 'PDF 文档' },
  code: { icon: <CodeOutlined />, color: '#16a34a', bg: '#f0fdf4', label: '代码/源码' },
  video: { icon: <VideoCameraOutlined />, color: '#7c3aed', bg: '#f5f3ff', label: '视频教程' },
  ppt: { icon: <FilePptOutlined />, color: '#ea580c', bg: '#fff7ed', label: 'PPT 课件' },
  other: { icon: <FileOutlined />, color: '#64748b', bg: '#f8fafc', label: '其他' },
};

export default function Resources() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await getResources(); setList(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      await createResource({ ...values, fileUrl: fileUrl || undefined });
      message.success('资料上传成功');
      setModalOpen(false);
      form.resetFields();
      setFileUrl('');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || '上传失败');
    }
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>内部共享资料库</h2>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setModalOpen(true)}>上传资料</Button>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48 }}>暂无共享资料</div>
      ) : (
        <Row gutter={[20, 20]}>
          {list.map((r) => {
            const tc = typeConfig[r.type] || typeConfig.other;
            return (
              <Col xs={24} md={12} lg={8} key={r.id}>
                <Card hoverable style={{ borderRadius: 12 }}>
                  <div style={{ width: 44, height: 44, background: tc.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 20, color: tc.color }}>
                    {tc.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 4 }}>{r.name}</h3>
                  <p style={{ color: '#64748b', fontSize: 12, marginBottom: 12, minHeight: 36 }}>{r.description || '暂无简介'}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{r.uploader?.name} · {formatTime(r.createdAt)}</span>
                    {(r.fileUrl || r.link) ?
                      <Button type="primary" size="small" icon={<DownloadOutlined />} href={r.fileUrl || r.link} target="_blank" rel="noreferrer">下载</Button>
                      : <span style={{ fontSize: 12, color: '#cbd5e1' }}>暂无链接</span>}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal title="上传/添加资料" open={modalOpen} onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setFileUrl(''); }} okText="提交">
        <Form form={form} layout="vertical" initialValues={{ type: 'pdf' }}>
          <Form.Item name="name" label="资料名称" rules={[{ required: true, message: '请输入资料名称' }]}>
            <Input placeholder="资料名称" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={Object.entries(typeConfig).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} placeholder="资料简介" />
          </Form.Item>
          <Form.Item label="上传文件">
            <Upload.Dragger
              maxCount={1}
              showUploadList={true}
              disabled={uploading}
              customRequest={async ({ file, onSuccess, onError }) => {
                setUploading(true);
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  const { data } = await uploadFile(formData);
                  const url = data.url || data.fileUrl;
                  setFileUrl(url);
                  form.setFieldsValue({ link: url });
                  message.success('文件上传成功');
                  onSuccess(data);
                } catch (err) {
                  message.error(err.response?.data?.message || '文件上传失败');
                  onError(err);
                } finally {
                  setUploading(false);
                }
              }}
            >
              <p style={{ color: '#4096ff', fontSize: 24 }}><InboxOutlined /></p>
              <p style={{ color: '#64748b', fontSize: 13 }}>点击或拖拽文件到此区域上传（限 50MB）</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="link" label="下载链接">
            <Input placeholder="下载链接/网盘地址（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getEquipment } from '../../api/equipment';
import { addEquipment, updateEquipment, deleteEquipment } from '../../api/admin';

export default function Inventory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await getEquipment(); setList(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    form.setFieldsValue({ name: r.name, category: r.category, total: r.total });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editingId) {
        await updateEquipment(editingId, values);
        message.success('器材信息已更新');
      } else {
        await addEquipment(values);
        message.success('新器材已录入');
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    await deleteEquipment(id);
    message.success('器材已删除');
    load();
  };

  const columns = [
    { title: '器材名称', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{t}</span> },
    { title: '类别', dataIndex: 'category', key: 'category', render: (t) => <Tag>{t}</Tag> },
    { title: '总数 / 可借', key: 'stock', align: 'center', render: (_, r) => (
      <span style={{ fontWeight: 700 }}>{r.total} / <span style={{ color: r.available > 0 ? '#16a34a' : '#dc2626' }}>{r.available}</span></span>
    )},
    { title: '操作', key: 'action', align: 'right', render: (_, r) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Popconfirm title={`确定删除【${r.name}】？`} onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>器材库存维护</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>录入新器材</Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} pagination={false}
        style={{ background: '#fff', borderRadius: 12 }} />
      <Modal title={editingId ? '编辑器材信息' : '录入新器材'} open={modalOpen} onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }} okText="保存">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="器材名称" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="器材名称" />
          </Form.Item>
          <Form.Item name="category" label="类别">
            <Input placeholder="类别（如: stm32, 传感器）" />
          </Form.Item>
          <Form.Item name="total" label="总数量" rules={[{ required: true, message: '必填' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="总数量" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

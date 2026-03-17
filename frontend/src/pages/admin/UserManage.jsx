import { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, Modal, Form, message, Popconfirm, Space } from 'antd';
import { UserAddOutlined, SearchOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUsers, approveUser, addUser, deleteUser } from '../../api/admin';
import { formatTime } from '../../utils/formatTime';

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await getUsers(search); setUsers(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    await approveUser(id);
    message.success('已通过认证');
    load();
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    message.success('用户已删除');
    load();
  };

  const handleAdd = async () => {
    const values = await form.validateFields();
    try {
      await addUser(values);
      message.success('人员添加成功');
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err) {
      message.error(err.response?.data?.message || '添加失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 700 }}>{t}</span> },
    { title: '学号/账号', dataIndex: 'studentId', key: 'studentId' },
    { title: '学院', dataIndex: 'college', key: 'college', render: (t) => t || '暂无' },
    { title: '年级', dataIndex: 'grade', key: 'grade', render: (t) => t || '暂无' },
    { title: '联系方式', dataIndex: 'phone', key: 'phone', render: (t) => t || '暂无' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) =>
      s === 'approved' ? <Tag color="green">已认证</Tag> : <Tag color="gold">待审核</Tag> },
    { title: '操作', key: 'action', align: 'right', render: (_, r) => (
      <Space>
        {r.status === 'pending' && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
        )}
        <Popconfirm title={`确定删除用户【${r.name}】？`} onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>人员管理</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>查看所有用户、审核准入、增删人员</p>
        </div>
        <Space>
          <Input.Search placeholder="搜索姓名/学号..." value={search} onChange={(e) => setSearch(e.target.value)}
            onSearch={load} style={{ width: 200 }} enterButton={<SearchOutlined />} />
          <Button type="primary" icon={<UserAddOutlined />} style={{ background: '#16a34a' }}
            onClick={() => setModalOpen(true)}>添加人员</Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={false}
        style={{ background: '#fff', borderRadius: 12 }} />

      <Modal title="手动添加人员" open={modalOpen} onOk={handleAdd}
        onCancel={() => { setModalOpen(false); form.resetFields(); }} okText="保存添加">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item name="studentId" label="学号/账号" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="学号/账号" />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '必填' }]}>
            <Input.Password placeholder="初始密码" />
          </Form.Item>
          <Form.Item name="college" label="学院"><Input placeholder="学院" /></Form.Item>
          <Form.Item name="grade" label="年级"><Input placeholder="年级" /></Form.Item>
          <Form.Item name="phone" label="联系电话"><Input placeholder="联系电话" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Popconfirm, Space } from 'antd';
import { CheckOutlined, CloseOutlined, RollbackOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBorrows, updateBorrow, deleteBorrow } from '../../api/admin';
import { formatTime } from '../../utils/formatTime';

export default function BorrowApproval() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await getBorrows(); setList(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status, msg) => {
    await updateBorrow(id, { status });
    message.success(msg);
    load();
  };

  const handleDelete = async (id) => {
    await deleteBorrow(id);
    message.success('记录已删除');
    load();
  };

  const columns = [
    { title: '器材名称', key: 'eq', render: (_, r) => <span style={{ fontWeight: 600 }}>{r.equipment?.name}</span> },
    { title: '数量', dataIndex: 'count', key: 'count', align: 'center' },
    { title: '申请人', key: 'user', render: (_, r) => <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{r.user?.name}</span> },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', render: (t) => formatTime(t) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const map = { PENDING: { color: 'gold', text: '待审批' }, APPROVED: { color: 'blue', text: '出借中' },
        REJECTED: { color: 'red', text: '已拒绝' }, RETURNED: { color: 'green', text: '已归还' } };
      const m = map[s] || { color: 'default', text: s };
      return <Tag color={m.color}>{m.text}</Tag>;
    }},
    { title: '操作', key: 'action', align: 'right', render: (_, r) => (
      <Space>
        {r.status === 'PENDING' && <>
          <Button type="primary" size="small" icon={<CheckOutlined />}
            onClick={() => handleAction(r.id, 'APPROVED', '已批准借出')}>同意</Button>
          <Button danger size="small" icon={<CloseOutlined />}
            onClick={() => handleAction(r.id, 'REJECTED', '已拒绝，库存已恢复')}>拒绝</Button>
        </>}
        {r.status === 'APPROVED' && (
          <Button size="small" icon={<RollbackOutlined />} style={{ color: '#16a34a', borderColor: '#16a34a' }}
            onClick={() => handleAction(r.id, 'RETURNED', '已确认归还')}>确认归还</Button>
        )}
        {(r.status === 'REJECTED' || r.status === 'RETURNED') && (
          <Popconfirm title="确定删除此记录？" onConfirm={() => handleDelete(r.id)}>
            <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#94a3b8' }} />
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>借阅审批与归还</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>处理器材借出申请，登记归还</p>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} pagination={false}
        style={{ background: '#fff', borderRadius: 12 }} />
    </div>
  );
}

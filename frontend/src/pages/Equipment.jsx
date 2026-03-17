import { useEffect, useState } from 'react';
import { Table, Tag, Button, Input, InputNumber, Modal, message, Card } from 'antd';
import { SearchOutlined, HistoryOutlined } from '@ant-design/icons';
import { getEquipment } from '../api/equipment';
import { applyBorrow, getMyBorrows } from '../api/borrows';
import { formatTime } from '../utils/formatTime';

export default function Equipment() {
  const [list, setList] = useState([]);
  const [myBorrows, setMyBorrows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [borrowModal, setBorrowModal] = useState({ open: false, eq: null, count: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const [eqRes, brRes] = await Promise.all([getEquipment(search), getMyBorrows()]);
      setList(eqRes.data);
      setMyBorrows(brRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => load();

  const handleBorrow = async () => {
    const { eq, count } = borrowModal;
    try {
      await applyBorrow({ equipmentId: eq.id, count });
      message.success('借阅申请已提交，等待管理员审批');
      setBorrowModal({ open: false, eq: null, count: 1 });
      load();
    } catch (err) {
      message.error(err.response?.data?.message || '申请失败');
    }
  };

  const statusMap = { PENDING: { color: 'gold', text: '待审批' }, APPROVED: { color: 'blue', text: '出借中' },
    REJECTED: { color: 'red', text: '已拒绝' }, RETURNED: { color: 'green', text: '已归还' } };

  const eqColumns = [
    { title: '器材名称', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: '类别', dataIndex: 'category', key: 'category', render: (t) => <Tag>{t}</Tag> },
    { title: '总数量', dataIndex: 'total', key: 'total', align: 'center' },
    { title: '状态', dataIndex: 'available', key: 'available', render: (v) =>
      v > 0 ? <Tag color="green">可借 ({v})</Tag> : <Tag color="red">已借空</Tag> },
    { title: '操作', key: 'action', align: 'right', render: (_, r) =>
      r.available > 0
        ? <Button type="primary" size="small" onClick={() => setBorrowModal({ open: true, eq: r, count: 1 })}>申请借阅</Button>
        : <Button size="small" disabled>暂无库存</Button> },
  ];

  const brColumns = [
    { title: '器材名称', key: 'name', render: (_, r) => r.equipment?.name },
    { title: '数量', dataIndex: 'count', key: 'count', align: 'center' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s) => {
      const m = statusMap[s] || { color: 'default', text: s };
      return <Tag color={m.color}>{m.text}</Tag>;
    }},
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt', render: (t) => formatTime(t) },
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>公共器材借阅大厅</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>浏览库存并发起借阅申请</p>
        </div>
        <Input.Search placeholder="搜索器材..." value={search} onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch} style={{ width: 240 }} enterButton={<SearchOutlined />} />
      </div>

      <Card style={{ borderRadius: 12, marginBottom: 32 }}>
        <Table columns={eqColumns} dataSource={list} rowKey="id" loading={loading} pagination={false} size="middle" />
      </Card>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>
        <HistoryOutlined style={{ marginRight: 8, color: '#2563eb' }} />我的借阅记录
      </h3>
      <Card style={{ borderRadius: 12 }}>
        <Table columns={brColumns} dataSource={myBorrows} rowKey="id" loading={loading}
          pagination={false} size="middle" locale={{ emptyText: '暂无借阅记录' }} />
      </Card>

      <Modal title={`借阅 - ${borrowModal.eq?.name || ''}`} open={borrowModal.open}
        onOk={handleBorrow} onCancel={() => setBorrowModal({ open: false, eq: null, count: 1 })}>
        <p>可借数量：{borrowModal.eq?.available}</p>
        <InputNumber min={1} max={borrowModal.eq?.available || 1} value={borrowModal.count}
          onChange={(v) => setBorrowModal((s) => ({ ...s, count: v }))} style={{ width: '100%' }} />
      </Modal>
    </div>
  );
}

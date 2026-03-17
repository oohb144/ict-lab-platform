import { useEffect, useState } from 'react';
import { Table, Tag, Button, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getResources } from '../../api/resources';
import { deleteResource } from '../../api/admin';
import { formatTime } from '../../utils/formatTime';

const typeMap = { pdf: 'PDF文档', code: '代码/源码', video: '视频教程', ppt: 'PPT课件', other: '其他' };

export default function ResourceManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await getResources(); setList(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await deleteResource(id);
    message.success('资料已删除');
    load();
  };

  const columns = [
    { title: '资料名称', dataIndex: 'name', key: 'name', render: (t) => <span style={{ fontWeight: 600 }}>{t}</span> },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t) => <Tag>{typeMap[t] || t}</Tag> },
    { title: '上传者', key: 'uploader', render: (_, r) => r.uploader?.name || '未知' },
    { title: '上传时间', dataIndex: 'createdAt', key: 'createdAt', render: (t) => formatTime(t) },
    { title: '操作', key: 'action', align: 'right', render: (_, r) => (
      <Popconfirm title={`确定删除【${r.name}】？`} onConfirm={() => handleDelete(r.id)}>
        <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </Popconfirm>
    )},
  ];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>资料管理</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>管理共享资料库中的所有文件</p>
        </div>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} pagination={false}
        style={{ background: '#fff', borderRadius: 12 }} />
    </div>
  );
}

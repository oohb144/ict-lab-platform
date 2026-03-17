import { useEffect, useState } from 'react';
import { Card, Button, Modal, Input, message, Spin, Tag, Popconfirm } from 'antd';
import { EditOutlined, CommentOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getPosts, createPost, replyPost, deletePost } from '../api/posts';
import { formatTime } from '../utils/formatTime';
import useAuthStore from '../store/useAuthStore';

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postModal, setPostModal] = useState(false);
  const [replyModal, setReplyModal] = useState({ open: false, postId: null });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const user = useAuthStore((s) => s.user);

  const load = async () => {
    setLoading(true);
    try { const { data } = await getPosts(); setPosts(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!content.trim()) return message.error('内容不能为空');
    try {
      await createPost({ title, content });
      message.success('发帖成功');
      setPostModal(false);
      setTitle(''); setContent('');
      load();
    } catch (err) { message.error(err.response?.data?.message || '发帖失败'); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return message.error('回复内容不能为空');
    try {
      await replyPost(replyModal.postId, { content: replyContent });
      message.success('回复成功');
      setReplyModal({ open: false, postId: null });
      setReplyContent('');
      load();
    } catch (err) { message.error(err.response?.data?.message || '回复失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      message.success('帖子已删除');
      load();
    } catch (err) { message.error(err.response?.data?.message || '删除失败'); }
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>技术交流与讨论</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setPostModal(true)}>发帖</Button>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48 }}>暂无帖子，快来发第一帖吧</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((p) => {
            const canDel = user?.role === 'admin' || p.authorId === user?.id;
            return (
              <Card key={p.id} hoverable style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    {p.title || p.content.substring(0, 20) + '...'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatTime(p.createdAt)}</span>
                    {canDel && (
                      <Popconfirm title="确定删除？" onConfirm={() => handleDelete(p.id)}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    )}
                  </div>
                </div>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>{p.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                    <span style={{ fontWeight: 700, color: '#1d4ed8' }}><UserOutlined /> {p.author?.name}</span>
                    <span><CommentOutlined /> {p.replies?.length || 0} 条回复</span>
                  </div>
                  <Button type="link" size="small" onClick={() => { setReplyModal({ open: true, postId: p.id }); setReplyContent(''); }}>
                    回复
                  </Button>
                </div>
                {p.replies?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {p.replies.map((r) => (
                      <div key={r.id} style={{ borderLeft: '3px solid #e5e7eb', marginLeft: 20, paddingLeft: 16, paddingTop: 8, paddingBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}><UserOutlined /> {r.author?.name}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatTime(r.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal title="发布新帖" open={postModal} onOk={handlePost}
        onCancel={() => { setPostModal(false); setTitle(''); setContent(''); }} okText="发布">
        <Input placeholder="帖子标题（可选）" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <Input.TextArea rows={5} placeholder="请输入您想讨论的内容..." value={content} onChange={(e) => setContent(e.target.value)} />
      </Modal>

      <Modal title="回复帖子" open={replyModal.open} onOk={handleReply}
        onCancel={() => { setReplyModal({ open: false, postId: null }); setReplyContent(''); }} okText="回复">
        <Input.TextArea rows={3} placeholder="输入回复内容..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
      </Modal>
    </div>
  );
}

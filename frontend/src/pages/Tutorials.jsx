import { useEffect, useState, useRef } from 'react';
import { Card, Button, Modal, Input, message, Spin, Popconfirm, Segmented, Row, Col, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, ArrowLeftOutlined, EyeOutlined, FormOutlined, PictureOutlined, FilePdfOutlined, FileMarkdownOutlined, DownloadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getTutorials, createTutorial, deleteTutorial } from '../api/tutorials';
import { uploadFile } from '../api/resources';
import { formatTime } from '../utils/formatTime';
import useAuthStore from '../store/useAuthStore';

export default function Tutorials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState('编辑');
  const [importing, setImporting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const textAreaRef = useRef(null);
  const imgInputRef = useRef(null);
  const pendingMdText = useRef('');

/* -------- PLACEHOLDER_COMPONENTS -------- */

  // ReactMarkdown 自定义组件
  const markdownComponents = {
    a({ href, children }) {
      if (href && href.match(/\.pdf(\?|$)/i)) {
        return (
          <div style={{ margin: '12px 0', padding: '12px 16px', background: '#fef2f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
              <FilePdfOutlined style={{ fontSize: 20 }} />
              <span style={{ color: '#334155', fontSize: 14 }}>{children}</span>
            </span>
            <a href={href} target="_blank" rel="noreferrer" style={{ color: '#4096ff', fontSize: 13 }}>下载 PDF</a>
          </div>
        );
      }
      return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
    },
    'pdf-preview'({ src, title: pdfTitle }) {
      return (
        <div style={{ margin: '12px 0', padding: '12px 16px', background: '#fef2f2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444' }}>
            <FilePdfOutlined style={{ fontSize: 20 }} />
            <span style={{ color: '#334155', fontSize: 14 }}>{pdfTitle || 'PDF 文件'}</span>
          </span>
          <a href={src} target="_blank" rel="noreferrer" style={{ color: '#4096ff', fontSize: 13 }}>下载 PDF</a>
        </div>
      );
    },
    img({ src, alt }) {
      return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: 8, margin: '12px 0' }} />;
    },
  };

/* -------- PLACEHOLDER_HANDLERS -------- */

  const load = async () => {
    setLoading(true);
    try { const { data } = await getTutorials(); setList(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return message.error('标题不能为空');
    if (!content.trim()) return message.error('内容不能为空');
    try {
      await createTutorial({ title, content });
      message.success('发布成功');
      setModalOpen(false);
      setTitle(''); setContent(''); setPreviewMode('编辑');
      load();
    } catch (err) { message.error(err.response?.data?.message || '发布失败'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTutorial(id);
      message.success('已删除');
      load();
    } catch (err) { message.error(err.response?.data?.message || '删除失败'); }
  };

  // 上传图片并插入 Markdown 图片语法
  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await uploadFile(formData);
      const url = data.url || data.fileUrl;
      setContent((prev) => prev + `![${file.name}](${url})\n`);
      message.success('图片上传成功');
    } catch (err) {
      message.error(err.response?.data?.message || '图片上传失败');
    }
    return false;
  };

  // 导入 Markdown 文件
  const handleImportMd = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // 将图片路径中的反斜杠统一为正斜杠（兼容 Windows 路径）
      let mdText = e.target.result.replace(/(!\[.*?\]\()([^)]+)\)/g, (match, prefix, path) => {
        return prefix + path.replace(/\\/g, '/') + ')';
      });
      // 检查是否有本地图片引用（非 http 开头的）
      const imgRefs = mdText.match(/!\[.*?\]\((?!https?:\/\/)(.+?)\)/g);
      if (imgRefs && imgRefs.length > 0) {
        pendingMdText.current = mdText;
        if (!title.trim()) setTitle(file.name.replace(/\.md$/i, ''));
        message.info(`检测到 ${imgRefs.length} 张本地图片，请选择对应的图片文件`);
        setTimeout(() => imgInputRef.current?.click(), 300);
      } else {
        setContent(mdText);
        if (!title.trim()) setTitle(file.name.replace(/\.md$/i, ''));
        message.success('Markdown 文件已导入');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 批量上传图片并替换 MD 中的本地路径
  const handleBatchImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !pendingMdText.current) return;
    setImporting(true);
    let mdText = pendingMdText.current;
    let successCount = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const { data } = await uploadFile(formData);
        const url = data.url || data.fileUrl;
        // 用不含扩展名的文件名做模糊匹配，兼容各种路径写法
        const nameNoExt = file.name.replace(/\.[^.]+$/, '');
        const escaped = nameNoExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(!\\[.*?\\])\\(([^)]*${escaped}[^)]*?)\\)`, 'g');
        mdText = mdText.replace(regex, `$1(${url})`);
        successCount++;
      } catch (err) {
        message.error(`图片 ${file.name} 上传失败`);
      }
    }
    setContent(mdText);
    pendingMdText.current = '';
    setImporting(false);
    message.success(`已导入，${successCount}/${files.length} 张图片上传成功`);
    e.target.value = '';
  };

  // 导入 PDF 文件
  const handleImportPdf = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await uploadFile(formData);
      const url = data.url || data.fileUrl;
      const pdfMd = `<pdf-preview src="${url}" title="${file.name}" />\n`;
      setContent((prev) => prev + pdfMd);
      if (!title.trim()) setTitle(file.name.replace(/\.pdf$/i, ''));
      message.success('PDF 已上传，链接已插入');
    } catch (err) {
      message.error(err.response?.data?.message || 'PDF 上传失败');
    }
    return false;
  };

/* -------- PLACEHOLDER_RENDER -------- */

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><Spin size="large" /></div>;

  // 阅读视图
  if (viewing) {
    const canDel = user?.role === 'admin' || viewing.authorId === user?.id;
    return (
      <div style={{ padding: 32, maxWidth: 900 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setViewing(null)}
          style={{ marginBottom: 16, color: '#64748b' }}>返回列表</Button>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{viewing.title}</h2>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
          <UserOutlined /> {viewing.author?.name} · {formatTime(viewing.createdAt)}
          {canDel && (
            <Popconfirm title="确定删除这篇教程？" onConfirm={() => { handleDelete(viewing.id); setViewing(null); }}>
              <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ marginLeft: 12 }} />
            </Popconfirm>
          )}
        </div>
        <Card style={{ borderRadius: 12 }}>
          <div className="markdown-body" style={{ lineHeight: 1.8, color: '#334155' }}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{viewing.content}</ReactMarkdown>
          </div>
        </Card>
      </div>
    );
  }

  // 列表视图
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>教程笔记</h2>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setModalOpen(true)}>发布笔记</Button>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 48 }}>暂无教程笔记，快来发布第一篇吧</div>
      ) : (
        <Row gutter={[20, 20]}>
          {list.map((t) => {
            const canDel = user?.role === 'admin' || t.authorId === user?.id;
            const summary = t.content.length > 100 ? t.content.substring(0, 100) + '...' : t.content;
            return (
              <Col xs={24} md={12} lg={8} key={t.id}>
                <Card hoverable style={{ borderRadius: 12 }} onClick={() => setViewing(t)}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', marginBottom: 8 }}>{t.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, minHeight: 40 }}>{summary}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      <UserOutlined /> {t.author?.name} · {formatTime(t.createdAt)}
                    </span>
                    {canDel && (
                      <Popconfirm title="确定删除？" onConfirm={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                        onCancel={(e) => e.stopPropagation()}>
                        <Button type="text" size="small" danger icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* 隐藏的图片批量选择 input */}
      <input ref={imgInputRef} type="file" accept="image/*" multiple
        style={{ display: 'none' }} onChange={handleBatchImages} />

      <Modal title="发布教程笔记" open={modalOpen} onOk={handleSubmit} width={720}
        confirmLoading={importing}
        onCancel={() => { setModalOpen(false); setTitle(''); setContent(''); setPreviewMode('编辑'); }} okText="发布">
        <Input placeholder="教程标题" value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Segmented options={[
            { label: <span><FormOutlined /> 编辑</span>, value: '编辑' },
            { label: <span><EyeOutlined /> 预览</span>, value: '预览' },
          ]} value={previewMode} onChange={setPreviewMode} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Upload accept=".md" showUploadList={false} beforeUpload={handleImportMd}>
              <Button size="small" icon={<FileMarkdownOutlined />}>导入 MD</Button>
            </Upload>
            <Upload accept=".pdf" showUploadList={false} beforeUpload={handleImportPdf}>
              <Button size="small" icon={<FilePdfOutlined />}>导入 PDF</Button>
            </Upload>
            <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload}>
              <Button size="small" icon={<PictureOutlined />}>插入图片</Button>
            </Upload>
          </div>
        </div>
        {importing && <div style={{ textAlign: 'center', padding: 8, color: '#4096ff', fontSize: 13 }}>正在上传图片并替换路径，请稍候...</div>}
        {previewMode === '编辑' ? (
          <Input.TextArea ref={textAreaRef} rows={12} placeholder="请输入 Markdown 格式的教程内容..." value={content}
            onChange={(e) => setContent(e.target.value)} />
        ) : (
          <Card style={{ minHeight: 280, borderRadius: 8 }}>
            <div className="markdown-body" style={{ lineHeight: 1.8, color: '#334155' }}>
              {content ? <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{content}</ReactMarkdown> : <span style={{ color: '#94a3b8' }}>暂无内容</span>}
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
}

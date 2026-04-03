import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAuthStore from '../../store/useAuthStore';
import { createArticle } from '../../api/articles';

const mdStyles = `
.md-preview { color: #374151; line-height: 1.75; font-size: 0.875rem; }
.md-preview h1,.md-preview h2,.md-preview h3 { font-weight: 600; margin: 1em 0 0.4em; color: #111827; }
.md-preview h1 { font-size: 1.5rem; } .md-preview h2 { font-size: 1.2rem; } .md-preview h3 { font-size: 1rem; }
.md-preview p { margin: 0.5em 0; }
.md-preview ul,.md-preview ol { margin: 0.5em 0; padding-left: 1.5em; }
.md-preview code { background: #f3f4f6; border-radius: 3px; padding: 0.1em 0.3em; font-size: 0.8em; font-family: monospace; }
.md-preview pre { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1em; overflow-x: auto; margin: 0.75em 0; }
.md-preview pre code { background: none; padding: 0; }
.md-preview blockquote { border-left: 3px solid #e5e7eb; margin: 0.75em 0; padding: 0.3em 1em; color: #6b7280; background: #f9fafb; }
.md-preview a { color: #3b82f6; }
.md-preview table { border-collapse: collapse; width: 100%; font-size: 0.85rem; margin: 0.75em 0; }
.md-preview th,.md-preview td { border: 1px solid #e5e7eb; padding: 0.4em 0.75em; }
.md-preview th { background: #f9fafb; font-weight: 600; }
`;

export default function BlogWrite() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    tags: '',
    excerpt: '',
    content: '',
    published: false,
  });
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  // 未登录跳转
  if (!token || !user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">请先登录后再发布文章</p>
        <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline text-sm">
          去登录
        </button>
      </div>
    );
  }

  // 导入本地 .md 文件
  const handleImportMd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setError('请选择 .md 或 .markdown 文件');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setForm(prev => ({ ...prev, content }));

      // 自动提取标题（首个 # 行）
      const titleMatch = content.match(/^#\s+(.+)/m);
      if (titleMatch && !form.title) {
        setForm(prev => ({ ...prev, title: titleMatch[1].trim(), content }));
      }
    };
    reader.readAsText(file, 'utf-8');
    // 重置 input 以允许重复导入同一文件
    e.target.value = '';
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (publishNow) => {
    setError('');
    if (!form.title.trim()) { setError('请填写文章标题'); return; }
    if (!form.content.trim()) { setError('文章内容不能为空'); return; }
    if (!form.category.trim()) { setError('请填写文章分类'); return; }

    setSubmitting(true);
    try {
      const res = await createArticle({ ...form, published: publishNow });
      navigate(`/blog/post/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <style>{mdStyles}</style>

      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/blog')} className="text-sm text-gray-400 hover:text-gray-600">
          ← 返回博客
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreview(p => !p)}
            className={`text-sm px-3 py-1.5 rounded border transition-colors ${preview ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            {preview ? '编辑' : '预览'}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="text-sm px-4 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            存为草稿
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="text-sm px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '发布中...' : '发布文章'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100">
        {/* 标题输入 */}
        <div className="p-6 border-b border-gray-50">
          <input
            type="text"
            value={form.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="请输入文章标题..."
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none"
          />
        </div>

        {/* 元信息区 */}
        <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            placeholder="分类（如：技术、生活）"
            className="text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-300 w-36"
          />
          <input
            type="text"
            value={form.tags}
            onChange={e => handleChange('tags', e.target.value)}
            placeholder="标签（逗号分隔）"
            className="text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-300 w-48"
          />
          <input
            type="text"
            value={form.excerpt}
            onChange={e => handleChange('excerpt', e.target.value)}
            placeholder="摘要（可选）"
            className="text-sm border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-300 flex-1 min-w-[160px]"
          />

          {/* 导入 .md 文件按钮 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown"
            onChange={handleImportMd}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm px-3 py-1 rounded border border-dashed border-blue-300 text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <span>↑</span>
            {fileName ? `已导入: ${fileName}` : '导入 .md 文件'}
          </button>
        </div>

        {/* 编辑器 / 预览区 */}
        <div className="p-6">
          {preview ? (
            <div className="md-preview min-h-[400px]">
              {form.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
              ) : (
                <p className="text-gray-300 text-sm">暂无内容</p>
              )}
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
              placeholder={'在这里输入 Markdown 内容...\n\n# 一级标题\n## 二级标题\n\n正文内容，支持 **加粗**、*斜体*、`代码` 等格式。'}
              className="w-full min-h-[400px] text-sm text-gray-700 font-mono leading-relaxed outline-none resize-none placeholder-gray-300"
              spellCheck={false}
            />
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        支持 Markdown 格式 · 导入 .md 文件会自动识别首行标题
      </p>
    </div>
  );
}

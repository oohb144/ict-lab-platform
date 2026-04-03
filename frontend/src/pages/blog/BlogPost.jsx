import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { getArticle } from '../../api/articles';

const mdStyles = `
.md-content { color: #374151; line-height: 1.75; font-size: 0.9rem; }
.md-content h1, .md-content h2, .md-content h3, .md-content h4 {
  font-weight: 600; margin: 1.5em 0 0.5em; color: #111827;
}
.md-content h1 { font-size: 1.6rem; }
.md-content h2 { font-size: 1.3rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 0.3em; }
.md-content h3 { font-size: 1.1rem; }
.md-content p { margin: 0.75em 0; }
.md-content ul, .md-content ol { margin: 0.75em 0; padding-left: 1.5em; }
.md-content li { margin: 0.25em 0; }
.md-content a { color: #3b82f6; text-decoration: none; }
.md-content a:hover { text-decoration: underline; }
.md-content code { background: #f3f4f6; border-radius: 3px; padding: 0.1em 0.3em; font-size: 0.85em; font-family: 'Fira Code', monospace; }
.md-content pre { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1em; overflow-x: auto; margin: 1em 0; }
.md-content pre code { background: none; padding: 0; font-size: 0.85em; }
.md-content blockquote { border-left: 3px solid #e5e7eb; margin: 1em 0; padding: 0.5em 1em; color: #6b7280; background: #f9fafb; }
.md-content table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.875rem; }
.md-content th, .md-content td { border: 1px solid #e5e7eb; padding: 0.5em 0.75em; }
.md-content th { background: #f9fafb; font-weight: 600; }
.md-content img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
.md-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
`;

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getArticle(id)
      .then(res => setArticle(res.data))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 p-8 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4 mb-8"></div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${70 + i * 5}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg mb-4">文章不存在</p>
        <button onClick={() => navigate('/blog')} className="text-blue-500 hover:underline text-sm">
          返回博客首页
        </button>
      </div>
    );
  }

  const dateStr = new Date(article.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto">
      <style>{mdStyles}</style>
      <button
        onClick={() => navigate('/blog')}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 block"
      >
        ← 返回列表
      </button>

      <article className="bg-white rounded-lg border border-gray-100 p-8">
        <header className="mb-8 pb-6 border-b border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-white bg-blue-500 rounded px-2 py-0.5">{article.category}</span>
            {article.tags && article.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">{tag}</span>
            ))}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h1>
          <div className="text-sm text-gray-400 flex items-center gap-3">
            <span>{dateStr}</span>
            {article.viewCount > 0 && <span>{article.viewCount} 阅读</span>}
          </div>
        </header>

        <div className="md-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

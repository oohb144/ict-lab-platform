import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PostCard from '../../components/blog/PostCard';
import Sidebar from '../../components/blog/Sidebar';
import { getArticles } from '../../api/articles';

export default function BlogHome() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    getArticles({ page, limit: pageSize, published: true, category: category || undefined })
      .then(res => {
        setArticles(res.data?.articles || []);
        setTotal(res.data?.total || 0);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [page, category]);

  return (
    <div className="flex gap-6">
      {/* ── 文章列表 ── */}
      <div className="flex-1 min-w-0">

        {/* 分类筛选提示 */}
        {category && (
          <div
            className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: '#ede9fe', color: '#6d28d9' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            分类：<span className="font-semibold">{category}</span>
            <button
              onClick={() => navigate('/blog')}
              className="ml-auto text-xs px-2 py-0.5 rounded-lg transition-colors hover:bg-violet-200"
              style={{ color: '#7c3aed' }}
            >
              清除筛选 ×
            </button>
          </div>
        )}

        {/* 加载骨架屏 */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: '#fff', height: '120px' }}
              >
                <div className="flex h-full">
                  <div className="w-1" style={{ background: '#e0e7ff' }} />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-3 rounded-full w-1/4" style={{ background: '#f1f5f9' }} />
                    <div className="h-4 rounded-full w-3/4" style={{ background: '#f1f5f9' }} />
                    <div className="h-3 rounded-full w-full" style={{ background: '#f8fafc' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <div className="text-4xl mb-4">📭</div>
            <p style={{ color: '#94a3b8' }}>暂无文章</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <PostCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* ── 分页 ── */}
        {total > pageSize && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-xl font-medium transition-all disabled:opacity-40"
              style={{
                background: page === 1 ? '#f8fafc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: page === 1 ? '#94a3b8' : '#fff',
                border: 'none',
              }}
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm rounded-xl" style={{ background: '#f8fafc', color: '#64748b' }}>
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 text-sm rounded-xl font-medium transition-all disabled:opacity-40"
              style={{
                background: page >= Math.ceil(total / pageSize) ? '#f8fafc' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: page >= Math.ceil(total / pageSize) ? '#94a3b8' : '#fff',
                border: 'none',
              }}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* ── 侧边栏 ── */}
      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}

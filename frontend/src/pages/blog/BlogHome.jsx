import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../../components/blog/PostCard';
import Sidebar from '../../components/blog/Sidebar';
import { getArticles } from '../../api/articles';

export default function BlogHome() {
  const [searchParams] = useSearchParams();
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
    <div className="flex gap-8">
      {/* 文章列表 */}
      <div className="flex-1 min-w-0">
        {category && (
          <div className="mb-4 text-sm text-gray-500">
            分类：<span className="text-blue-600 font-medium">{category}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-5 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center text-gray-400">
            暂无文章
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(article => (
              <PostCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* 分页 */}
        {total > pageSize && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 侧边栏 */}
      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}

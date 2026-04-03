import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles } from '../../api/articles';

export default function Sidebar() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getArticles({ limit: 5, published: true }).then(res => {
      const articles = res.data?.articles || [];
      setRecent(articles);

      // 统计分类
      const catMap = {};
      articles.forEach(a => {
        catMap[a.category] = (catMap[a.category] || 0) + 1;
      });
      setCategories(Object.entries(catMap).map(([name, count]) => ({ name, count })));
    }).catch(() => {});
  }, []);

  return (
    <aside className="space-y-6">
      {/* 个人资料卡 */}
      <div className="bg-white rounded-lg border border-gray-100 p-5 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
          ICT
        </div>
        <h3 className="font-semibold text-gray-800">ICT Lab Blog</h3>
        <p className="text-xs text-gray-400 mt-1">技术笔记 · 项目记录 · 生活随笔</p>
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={() => navigate('/blog/about')}
            className="text-xs text-blue-500 hover:underline"
          >
            关于我
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => navigate('/blog/archive')}
            className="text-xs text-blue-500 hover:underline"
          >
            归档
          </button>
        </div>
      </div>

      {/* 文章分类 */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-50 pb-2">文章分类</h4>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat.name} className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/blog?category=${encodeURIComponent(cat.name)}`)}
                  className="text-sm text-gray-600 hover:text-blue-500 transition-colors"
                >
                  {cat.name}
                </button>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{cat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 最新文章 */}
      {recent.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b border-gray-50 pb-2">最新文章</h4>
          <ul className="space-y-3">
            {recent.map(article => (
              <li key={article.id}>
                <button
                  onClick={() => navigate(`/blog/post/${article.id}`)}
                  className="text-sm text-gray-600 hover:text-blue-500 transition-colors text-left line-clamp-2"
                >
                  {article.title}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 返回门户 */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
        >
          ← 返回门户首页
        </button>
      </div>
    </aside>
  );
}

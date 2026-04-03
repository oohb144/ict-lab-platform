import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArchive } from '../../api/articles';
import Sidebar from '../../components/blog/Sidebar';

export default function BlogArchive() {
  const navigate = useNavigate();
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArchive()
      .then(res => setArchive(res.data || []))
      .catch(() => setArchive([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">文章归档</h1>

          {loading ? (
            <div className="animate-pulse space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-100 rounded w-24 mb-3"></div>
                  <div className="space-y-2 ml-4">
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : archive.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无文章</p>
          ) : (
            <div className="space-y-8">
              {archive.map(group => (
                <div key={group.yearMonth}>
                  <h2 className="text-base font-semibold text-gray-700 mb-3">{group.yearMonth}</h2>
                  <ul className="space-y-2 ml-4">
                    {group.articles.map(article => (
                      <li key={article.id} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-10 shrink-0">
                          {new Date(article.createdAt).getDate()}日
                        </span>
                        <button
                          onClick={() => navigate(`/blog/post/${article.id}`)}
                          className="text-sm text-gray-700 hover:text-blue-500 transition-colors text-left"
                        >
                          {article.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}

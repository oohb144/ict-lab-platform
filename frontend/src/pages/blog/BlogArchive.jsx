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

  const totalArticles = archive.reduce((sum, g) => sum + (g.articles?.length || 0), 0);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
        >
          {/* 头部 */}
          <div
            className="px-8 py-6 flex items-center justify-between"
            style={{ borderBottom: '1px solid #f1f5f9' }}
          >
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>文章归档</h1>
              {!loading && totalArticles > 0 && (
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
                  共 {totalArticles} 篇文章
                </p>
              )}
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: '#ede9fe' }}
            >
              📚
            </div>
          </div>

          <div className="px-8 py-6">
            {loading ? (
              <div className="animate-pulse space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 rounded-full w-28 mb-4" style={{ background: '#f1f5f9' }} />
                    <div className="space-y-2 ml-6">
                      <div className="h-3 rounded-full w-2/3" style={{ background: '#f8fafc' }} />
                      <div className="h-3 rounded-full w-1/2" style={{ background: '#f8fafc' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : archive.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p style={{ color: '#94a3b8' }}>暂无文章</p>
              </div>
            ) : (
              <div className="space-y-8">
                {archive.map(group => (
                  <div key={group.yearMonth} className="relative">
                    {/* 年月标题 */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="px-3 py-1 rounded-lg text-sm font-semibold"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}
                      >
                        {group.yearMonth}
                      </div>
                      <div className="flex-1 h-px" style={{ background: '#f1f5f9' }} />
                      <span className="text-xs" style={{ color: '#cbd5e1' }}>
                        {group.articles.length} 篇
                      </span>
                    </div>

                    {/* 文章列表 */}
                    <ul className="space-y-2 ml-2">
                      {group.articles.map(article => (
                        <li key={article.id}>
                          <button
                            onClick={() => navigate(`/blog/post/${article.id}`)}
                            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                            style={{ background: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span
                              className="text-xs w-8 shrink-0 text-center font-mono font-medium"
                              style={{ color: '#a5b4fc' }}
                            >
                              {String(new Date(article.createdAt).getDate()).padStart(2, '0')}
                            </span>
                            <span className="w-px h-4 shrink-0" style={{ background: '#e0e7ff' }} />
                            <span
                              className="text-sm group-hover:text-indigo-600 transition-colors"
                              style={{ color: '#475569' }}
                            >
                              {article.title}
                            </span>
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
      </div>

      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}

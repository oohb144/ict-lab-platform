import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getArticles } from '../../api/articles';

// 社交链接配置（可按需修改）
const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    color: '#24292e',
  },
  {
    name: '邮箱',
    url: 'mailto:example@ict.edu',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: '#6366f1',
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    getArticles({ limit: 100, published: true }).then(res => {
      const articles = res.data?.articles || [];
      setTotalCount(res.data?.total || articles.length);
      setRecent(articles.slice(0, 5));

      const catMap = {};
      articles.forEach(a => {
        if (a.category) catMap[a.category] = (catMap[a.category] || 0) + 1;
      });
      setCategories(Object.entries(catMap).map(([name, count]) => ({ name, count })));
    }).catch(() => {});
  }, []);

  return (
    <aside className="space-y-4">

      {/* ── 个人资料卡 ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.10)', background: '#fff' }}
      >
        {/* 卡片顶部渐变条 */}
        <div className="h-16 w-full"
          style={{ background: 'linear-gradient(135deg,#312e81,#6d28d9,#8b5cf6)' }} />

        {/* 头像 */}
        <div className="flex flex-col items-center px-5 pb-5" style={{ marginTop: '-28px' }}>
          <div
            className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center text-white text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}
          >
            我
          </div>
          <h3 className="font-bold text-base mt-2" style={{ color: '#1e293b' }}>ICT Lab 博客</h3>
          <p className="text-xs mt-1 text-center leading-relaxed" style={{ color: '#94a3b8' }}>
            技术笔记 · 项目记录 · 生活随笔
          </p>

          {/* 社交链接 */}
          <div className="flex gap-2 mt-3">
            {socialLinks.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.name}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: '#f1f5f9', color: s.color }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* 文章统计 */}
          <div className="w-full mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-around text-center">
            <div>
              <div className="text-lg font-bold" style={{ color: '#6366f1' }}>{totalCount}</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>文章</div>
            </div>
            <div className="w-px" style={{ background: '#f1f5f9' }} />
            <div>
              <div className="text-lg font-bold" style={{ color: '#6366f1' }}>{categories.length}</div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>分类</div>
            </div>
          </div>

          {/* 快速导航按钮 */}
          <div className="flex gap-2 mt-4 w-full">
            <button
              onClick={() => navigate('/blog/about')}
              className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
            >
              关于我
            </button>
            <button
              onClick={() => navigate('/blog/archive')}
              className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all hover:opacity-90"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
            >
              归档
            </button>
          </div>
        </div>
      </div>

      {/* ── 文章分类 ── */}
      {categories.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: '#334155' }}
          >
            <span className="w-1 h-4 rounded-full inline-block"
              style={{ background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }} />
            文章分类
          </h4>
          <ul className="space-y-1.5">
            {categories.map(cat => (
              <li key={cat.name}>
                <button
                  onClick={() => navigate(`/blog?category=${encodeURIComponent(cat.name)}`)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-all hover:bg-indigo-50 group"
                  style={{ color: '#475569' }}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a5b4fc' }} />
                    <span className="group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: '#ede9fe', color: '#6366f1' }}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 最新文章 ── */}
      {recent.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: '#334155' }}
          >
            <span className="w-1 h-4 rounded-full inline-block"
              style={{ background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }} />
            最新文章
          </h4>
          <ul className="space-y-3">
            {recent.map(article => (
              <li key={article.id}>
                <button
                  onClick={() => navigate(`/blog/post/${article.id}`)}
                  className="w-full text-left group"
                >
                  <p className="text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2"
                    style={{ color: '#475569' }}>
                    {article.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                    {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── 返回门户 ── */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-xs transition-colors hover:text-indigo-500"
          style={{ color: '#94a3b8' }}
        >
          ← 返回实验室门户
        </button>
      </div>
    </aside>
  );
}

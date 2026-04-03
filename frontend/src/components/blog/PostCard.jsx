import { useNavigate } from 'react-router-dom';

// 根据分类返回不同颜色
const categoryColor = (category) => {
  const map = {
    '技术': { bg: '#ede9fe', text: '#7c3aed' },
    '生活': { bg: '#fce7f3', text: '#db2777' },
    '项目': { bg: '#dbeafe', text: '#2563eb' },
    '随笔': { bg: '#d1fae5', text: '#059669' },
    'AI': { bg: '#fef3c7', text: '#d97706' },
    '安全': { bg: '#fee2e2', text: '#dc2626' },
  };
  return map[category] || { bg: '#e0e7ff', text: '#4f46e5' };
};

export default function PostCard({ article }) {
  const navigate = useNavigate();
  const { id, title, excerpt, category, createdAt, viewCount } = article;

  const dateStr = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  const colors = categoryColor(category);

  return (
    <article
      onClick={() => navigate(`/blog/post/${id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)';
        e.currentTarget.style.borderColor = '#c7d2fe';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#f1f5f9';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 左侧高亮条 */}
      <div className="flex">
        <div
          className="w-1 shrink-0 transition-all duration-300 group-hover:w-1.5"
          style={{ background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }}
        />

        <div className="flex-1 p-5">
          {/* 顶部元信息 */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            {category && (
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: colors.bg, color: colors.text }}
              >
                {category}
              </span>
            )}
            <span className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateStr}
            </span>
            {viewCount > 0 && (
              <span className="text-xs ml-auto flex items-center gap-1" style={{ color: '#cbd5e1' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewCount}
              </span>
            )}
          </div>

          {/* 标题 */}
          <h2
            className="text-base font-semibold leading-snug mb-2 transition-colors duration-200 group-hover:text-indigo-600 line-clamp-2"
            style={{ color: '#1e293b' }}
          >
            {title}
          </h2>

          {/* 摘要 */}
          {excerpt && (
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#94a3b8' }}>
              {excerpt}
            </p>
          )}

          {/* 阅读更多 */}
          <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: '#6366f1' }}>
            阅读全文
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}

import { useNavigate } from 'react-router-dom';

export default function PostCard({ article }) {
  const navigate = useNavigate();
  const { id, title, excerpt, category, createdAt, viewCount } = article;

  const dateStr = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  return (
    <article
      onClick={() => navigate(`/blog/post/${id}`)}
      className="group cursor-pointer bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white bg-blue-500 rounded px-2 py-0.5">{category}</span>
          <span className="text-xs text-gray-400">{dateStr}</span>
          {viewCount > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{viewCount} 阅读</span>
          )}
        </div>
        <h2 className="text-base font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
          {title}
        </h2>
        {excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2">{excerpt}</p>
        )}
      </div>
    </article>
  );
}

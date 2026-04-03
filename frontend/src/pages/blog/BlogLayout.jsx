import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navLinks = [
  { path: '/blog', label: '首页' },
  { path: '/blog/about', label: '关于我' },
  { path: '/blog/archive', label: '归档' },
];

export default function BlogLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/blog')}
            className="font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            ICT Lab Blog
          </button>
          <nav className="flex items-center gap-6">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`text-sm transition-colors ${active ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-100 pl-6"
            >
              返回门户
            </button>
            {token && (
              <button
                onClick={() => navigate('/blog/write')}
                className="text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1 rounded"
              >
                + 写文章
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* 页脚 */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 mt-8">
        © ICT Lab · Built with React
      </footer>
    </div>
  );
}

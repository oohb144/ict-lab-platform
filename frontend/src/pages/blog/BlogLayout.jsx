import { useState, useEffect, useRef } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === '/blog';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--blog-bg, #f4f6f9)' }}>

      {/* ── 顶部导航栏 ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.92)'
            : isHome ? 'transparent' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 font-bold text-lg transition-colors"
            style={{ color: scrolled || !isHome ? '#1e293b' : '#fff' }}
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              B
            </span>
            <span>我的博客</span>
          </button>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200"
                  style={{
                    color: active
                      ? '#6366f1'
                      : scrolled || !isHome ? '#64748b' : 'rgba(255,255,255,0.85)',
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="w-px h-4 mx-2" style={{ background: scrolled || !isHome ? '#e2e8f0' : 'rgba(255,255,255,0.3)' }} />
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-sm rounded-lg transition-all"
              style={{ color: scrolled || !isHome ? '#94a3b8' : 'rgba(255,255,255,0.7)' }}
            >
              ← 门户
            </button>
            {token && (
              <button
                onClick={() => navigate('/blog/write')}
                className="ml-1 px-3 py-1.5 text-sm rounded-lg text-white font-medium transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                + 写文章
              </button>
            )}
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: scrolled || !isHome ? '#475569' : '#fff' }}
            onClick={() => setMobileMenuOpen(o => !o)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* 移动端展开菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    color: active ? '#6366f1' : '#475569',
                    background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 text-sm rounded-lg text-gray-400"
            >
              ← 返回门户
            </button>
            {token && (
              <button
                onClick={() => { navigate('/blog/write'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm rounded-lg text-white font-medium"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
              >
                + 写文章
              </button>
            )}
          </div>
        )}
      </header>

      {/* ── Banner 横幅（仅首页显示大 Banner，其他页面显示小横幅）── */}
      {isHome ? (
        <div
          className="relative w-full flex items-end"
          style={{
            height: '320px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6d28d9 100%)',
          }}
        >
          {/* 装饰圆圈 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />
            <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle,#818cf8,transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: 'linear-gradient(to top, #f4f6f9, transparent)' }} />
          </div>

          {/* Banner 文字 */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 pb-16 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              我的博客
            </h1>
            <p className="text-indigo-200 text-base">记录技术 · 分享思考 · 留存生活</p>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full flex items-end"
          style={{
            height: '120px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: 'linear-gradient(to top, #f4f6f9, transparent)' }} />
        </div>
      )}

      {/* ── 主内容区 ── */}
      <main
        className="max-w-5xl mx-auto px-4 pb-16"
        style={{ marginTop: isHome ? '-48px' : '-32px', position: 'relative', zIndex: 10 }}
      >
        <Outlet />
      </main>

      {/* ── 页脚 ── */}
      <footer
        className="text-center py-8 text-xs border-t"
        style={{ borderColor: '#e9ecef', color: '#94a3b8' }}
      >
        <p>© 2025 我的博客 · Built with React</p>
        <p className="mt-1 text-gray-300">
          <button onClick={() => navigate('/')} className="hover:text-indigo-400 transition-colors">
            返回实验室门户
          </button>
        </p>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Menu, Button, Tag } from 'antd';
import {
  HomeOutlined, EnvironmentOutlined, ToolOutlined, FolderOpenOutlined,
  CommentOutlined, TeamOutlined, InboxOutlined, AuditOutlined,
  EditOutlined, FileTextOutlined, LogoutOutlined, ExperimentOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import useAuthStore from '../store/useAuthStore';

const userMenuItems = [
  { key: '/', icon: <HomeOutlined />, label: '实验室介绍' },
  { key: '/office', icon: <EnvironmentOutlined />, label: '办公室规划' },
  { key: '/equipment', icon: <ToolOutlined />, label: '器材借阅大厅' },
  { key: '/resources', icon: <FolderOpenOutlined />, label: '共享资料' },
  { key: '/forum', icon: <CommentOutlined />, label: '讨论区' },
  { key: '/tutorials', icon: <ReadOutlined />, label: '教程笔记' },
];

const adminMenuItems = [
  { type: 'divider' },
  { key: 'admin-group', label: '管理员专区', type: 'group', children: [
    { key: '/admin/users', icon: <TeamOutlined />, label: '人员管理' },
    { key: '/admin/inventory', icon: <InboxOutlined />, label: '器材库存' },
    { key: '/admin/borrows', icon: <AuditOutlined />, label: '借阅审批' },
    { key: '/admin/content', icon: <EditOutlined />, label: '内容编辑' },
    { key: '/admin/resources', icon: <FileTextOutlined />, label: '资料管理' },
  ]},
];

/* 侧边栏入场动画的 CSS */
const SIDEBAR_STYLES = `
@keyframes sidebar-slide-in {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes sidebar-content-fade {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
.sidebar-enter {
  animation: sidebar-slide-in 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
.sidebar-content-enter {
  opacity: 0;
  animation: sidebar-content-fade 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s forwards;
}
.sidebar-wrapper {
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              min-width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 0.8s ease;
}
`;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  /* 侧边栏入场控制：首次加载 1.2s 后展开 */
  const [sidebarReady, setSidebarReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSidebarReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <style>{SIDEBAR_STYLES}</style>

      {/* ── 动画侧边栏 ── */}
      <aside
        className="sidebar-wrapper"
        style={{
          width: sidebarReady ? 240 : 0,
          minWidth: sidebarReady ? 240 : 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: '#0f172a',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: sidebarReady ? '4px 0 20px rgba(0,0,0,0.35)' : 'none',
        }}
      >
        <div
          className={sidebarReady ? 'sidebar-enter' : ''}
          style={{
            width: 240,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: sidebarReady ? undefined : 0,
          }}
        >
          {/* Logo */}
          <div
            className={sidebarReady ? 'sidebar-content-enter' : ''}
            style={{
              padding: '20px 16px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(37,99,235,0.4)',
              }}>
                <ExperimentOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
                ICT<span style={{ color: '#38bdf8' }}>Lab</span>
              </span>
            </div>
            <Tag color={isAdmin ? 'red' : 'blue'} style={{ marginTop: 4 }}>
              {isAdmin ? '管理员' : user?.name || '学生端'}
            </Tag>
          </div>

          {/* 导航菜单 */}
          <div
            className={sidebarReady ? 'sidebar-content-enter' : ''}
            style={{ flex: 1, overflow: 'auto', animationDelay: sidebarReady ? '0.6s' : undefined }}
          >
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              items={items}
              onClick={({ key }) => navigate(key)}
              style={{ background: '#0f172a', borderRight: 0 }}
            />
          </div>

          {/* 底部用户信息 */}
          <div
            className={sidebarReady ? 'sidebar-content-enter' : ''}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              flexShrink: 0,
              animationDelay: sidebarReady ? '0.7s' : undefined,
            }}
          >
            <div style={{
              color: '#64748b', fontSize: 12, textAlign: 'center',
              marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.studentId} ({user?.name})
            </div>
            <Button
              type="text" icon={<LogoutOutlined />}
              onClick={handleLogout} block
              style={{ color: '#94a3b8' }}
            >
              退出登录
            </Button>
          </div>
        </div>
      </aside>

      {/* ── 主内容区 ── */}
      <main style={{ flex: 1, height: '100vh', overflow: 'auto', background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Tag } from 'antd';
import {
  HomeOutlined, EnvironmentOutlined, ToolOutlined, FolderOpenOutlined,
  CommentOutlined, TeamOutlined, InboxOutlined, AuditOutlined,
  EditOutlined, FileTextOutlined, LogoutOutlined, ExperimentOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import useAuthStore from '../store/useAuthStore';

const { Sider, Content } = AntLayout;

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

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="dark" style={{ background: '#0f172a' }}>
        <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExperimentOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>ICT 管理平台</span>
          </div>
          <Tag color={isAdmin ? 'red' : 'blue'} style={{ marginTop: 4 }}>
            {isAdmin ? '管理员' : user?.name || '学生端'}
          </Tag>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#0f172a', borderRight: 0 }}
        />
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.studentId} ({user?.name})
          </div>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} block
            style={{ color: '#94a3b8' }}>
            退出登录
          </Button>
        </div>
      </Sider>
      <Content style={{ background: '#f8fafc', overflow: 'auto' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
}

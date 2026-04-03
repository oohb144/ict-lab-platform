import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Portal from './pages/Portal';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Office from './pages/Office';
import Equipment from './pages/Equipment';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Tutorials from './pages/Tutorials';
import UserManage from './pages/admin/UserManage';
import Inventory from './pages/admin/Inventory';
import BorrowApproval from './pages/admin/BorrowApproval';
import ContentEdit from './pages/admin/ContentEdit';
import ResourceManage from './pages/admin/ResourceManage';
import BlogLayout from './pages/blog/BlogLayout';
import BlogHome from './pages/blog/BlogHome';
import BlogPost from './pages/blog/BlogPost';
import BlogAbout from './pages/blog/BlogAbout';
import BlogArchive from './pages/blog/BlogArchive';
import BlogWrite from './pages/blog/BlogWrite';

export default function App() {
  return (
    <Routes>
      {/* 门户首页 */}
      <Route path="/" element={<Portal />} />

      {/* 认证页面 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 实验室系统（需要登录）*/}
      <Route path="/lab" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="office" element={<Office />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="resources" element={<Resources />} />
        <Route path="forum" element={<Forum />} />
        <Route path="tutorials" element={<Tutorials />} />
        <Route path="admin/users" element={<ProtectedRoute adminOnly><UserManage /></ProtectedRoute>} />
        <Route path="admin/inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
        <Route path="admin/borrows" element={<ProtectedRoute adminOnly><BorrowApproval /></ProtectedRoute>} />
        <Route path="admin/content" element={<ProtectedRoute adminOnly><ContentEdit /></ProtectedRoute>} />
        <Route path="admin/resources" element={<ProtectedRoute adminOnly><ResourceManage /></ProtectedRoute>} />
      </Route>

      {/* 个人博客（公开）*/}
      <Route path="/blog" element={<BlogLayout />}>
        <Route index element={<BlogHome />} />
        <Route path="post/:id" element={<BlogPost />} />
        <Route path="about" element={<BlogAbout />} />
        <Route path="archive" element={<BlogArchive />} />
        <Route path="write" element={<BlogWrite />} />
      </Route>

      {/* 404 重定向到门户 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

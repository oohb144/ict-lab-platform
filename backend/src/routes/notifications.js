import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = Router();
const prisma = new PrismaClient();

// 获取所有启用的通知（所有登录用户可见）
router.get('/', auth, async (req, res) => {
  try {
    const list = await prisma.notification.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取通知失败', error: err.message });
  }
});

// 管理员：获取全部通知（含禁用）
router.get('/all', auth, adminMiddleware, async (req, res) => {
  try {
    const list = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取通知失败', error: err.message });
  }
});

// 管理员：创建通知
router.post('/', auth, adminMiddleware, async (req, res) => {
  try {
    const { title, content, enabled } = req.body;
    if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });
    const n = await prisma.notification.create({
      data: { title, content, enabled: enabled !== false },
    });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: '创建通知失败', error: err.message });
  }
});

// 管理员：更新通知
router.put('/:id', auth, adminMiddleware, async (req, res) => {
  try {
    const { title, content, enabled } = req.body;
    const n = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { title, content, enabled },
    });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: '更新通知失败', error: err.message });
  }
});

// 管理员：删除通知
router.delete('/:id', auth, adminMiddleware, async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '通知已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

export default router;

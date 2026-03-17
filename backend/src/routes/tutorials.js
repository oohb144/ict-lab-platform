import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 教程列表
router.get('/', async (req, res) => {
  try {
    const list = await prisma.tutorial.findMany({
      include: {
        author: { select: { id: true, name: true, studentId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取教程列表失败', error: err.message });
  }
});

// 单篇教程详情
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tutorial = await prisma.tutorial.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, studentId: true } },
      },
    });
    if (!tutorial) return res.status(404).json({ message: '教程不存在' });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ message: '获取教程失败', error: err.message });
  }
});

// 创建教程
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });
    const tutorial = await prisma.tutorial.create({
      data: { title, content, authorId: req.user.id },
    });
    res.json(tutorial);
  } catch (err) {
    res.status(500).json({ message: '创建教程失败', error: err.message });
  }
});

// 删除教程（作者或管理员）
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tutorial = await prisma.tutorial.findUnique({ where: { id } });
    if (!tutorial) return res.status(404).json({ message: '教程不存在' });
    if (tutorial.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' });
    }
    await prisma.tutorial.delete({ where: { id } });
    res.json({ message: '已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

export default router;

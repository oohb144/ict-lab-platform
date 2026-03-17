import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 帖子列表
router.get('/', async (req, res) => {
  try {
    const list = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, studentId: true } },
        replies: {
          include: { author: { select: { id: true, name: true, studentId: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取帖子失败', error: err.message });
  }
});

// 发帖
router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ message: '内容不能为空' });
    const post = await prisma.post.create({
      data: { authorId: req.user.id, title: title || '', content },
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: '发帖失败', error: err.message });
  }
});

// 回复
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: '回复内容不能为空' });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: '帖子不存在' });
    const reply = await prisma.reply.create({
      data: { postId, authorId: req.user.id, content },
    });
    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: '回复失败', error: err.message });
  }
});

// 删帖（作者或管理员）
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: '帖子不存在' });
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' });
    }
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: '已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

export default router;

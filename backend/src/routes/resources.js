import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 资料列表
router.get('/', async (req, res) => {
  try {
    const list = await prisma.resource.findMany({
      include: { uploader: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取资料失败', error: err.message });
  }
});

// 上传资料
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, description, link, fileUrl } = req.body;
    if (!name) return res.status(400).json({ message: '资料名称不能为空' });
    const resource = await prisma.resource.create({
      data: {
        name,
        type: type || 'other',
        description: description || '',
        link: link || '',
        fileUrl: fileUrl || '',
        uploaderId: req.user.id,
      },
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: '上传资料失败', error: err.message });
  }
});

export default router;

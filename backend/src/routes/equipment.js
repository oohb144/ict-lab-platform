import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 器材列表（支持搜索）
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? { OR: [
          { name: { contains: search } },
          { category: { contains: search } },
        ] }
      : {};
    const list = await prisma.equipment.findMany({ where, orderBy: { id: 'asc' } });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取器材列表失败', error: err.message });
  }
});

export default router;

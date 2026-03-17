import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 申请借阅
router.post('/', auth, async (req, res) => {
  try {
    const { equipmentId, count } = req.body;
    const num = parseInt(count) || 1;
    const eq = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!eq) return res.status(404).json({ message: '器材不存在' });
    if (eq.available < num) return res.status(400).json({ message: '库存不足' });
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { available: eq.available - num },
    });
    const borrow = await prisma.borrow.create({
      data: { userId: req.user.id, equipmentId, count: num },
    });
    res.json(borrow);
  } catch (err) {
    res.status(500).json({ message: '借阅申请失败', error: err.message });
  }
});

// 我的借阅记录
router.get('/mine', auth, async (req, res) => {
  try {
    const list = await prisma.borrow.findMany({
      where: { userId: req.user.id },
      include: { equipment: { select: { name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取借阅记录失败', error: err.message });
  }
});

export default router;

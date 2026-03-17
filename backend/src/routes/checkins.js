import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 今日打卡（每人每天限一次）
router.post('/', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = await prisma.checkIn.findUnique({
      where: { userId_date: { userId: req.user.id, date: today } },
    });
    if (existing) return res.status(400).json({ message: '今日已打卡' });

    const checkIn = await prisma.checkIn.create({
      data: { userId: req.user.id, date: today },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(checkIn);
  } catch (err) {
    res.status(500).json({ message: '打卡失败', error: err.message });
  }
});

// 获取今日打卡列表
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const list = await prisma.checkIn.findMany({
      where: { date: today },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    // 检查当前用户是否已打卡
    const myCheckIn = list.find((c) => c.userId === req.user.id);
    res.json({ list, checkedIn: !!myCheckIn });
  } catch (err) {
    res.status(500).json({ message: '获取打卡列表失败', error: err.message });
  }
});

export default router;

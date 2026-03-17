import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 获取站点内容
router.get('/', async (req, res) => {
  try {
    let content = await prisma.siteContent.findUnique({ where: { id: 1 } });
    if (!content) {
      content = await prisma.siteContent.create({ data: { id: 1 } });
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: '获取站点内容失败', error: err.message });
  }
});

export default router;

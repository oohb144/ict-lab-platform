import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = Router();
const prisma = new PrismaClient();

// ========== 用户管理 ==========
// 用户列表（支持搜索）
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? { OR: [
          { name: { contains: search } },
          { studentId: { contains: search } },
        ] }
      : {};
    const users = await prisma.user.findMany({
      where,
      select: { id: true, studentId: true, name: true, college: true, grade: true, phone: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: '获取用户列表失败', error: err.message });
  }
});

// 审核通过
router.patch('/users/:id/approve', auth, admin, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'approved' },
    });
    res.json({ message: '已通过认证' });
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

// 手动添加用户
router.post('/users', auth, admin, async (req, res) => {
  try {
    const { studentId, name, password, college, grade, phone } = req.body;
    if (!studentId || !name || !password) {
      return res.status(400).json({ message: '学号、姓名和密码为必填项' });
    }
    const exists = await prisma.user.findUnique({ where: { studentId } });
    if (exists) return res.status(400).json({ message: '该学号已存在' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { studentId, name, password: hashed, college: college || '', grade: grade || '', phone: phone || '', status: 'approved' },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: '添加用户失败', error: err.message });
  }
});

// 删除用户
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '用户已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

// ========== 器材管理 ==========
router.post('/equipment', auth, admin, async (req, res) => {
  try {
    const { name, category, total } = req.body;
    if (!name || !total) return res.status(400).json({ message: '名称和数量必填' });
    const eq = await prisma.equipment.create({
      data: { name, category: category || '', total: parseInt(total), available: parseInt(total) },
    });
    res.json(eq);
  } catch (err) {
    res.status(500).json({ message: '添加器材失败', error: err.message });
  }
});

router.put('/equipment/:id', auth, admin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, total } = req.body;
    const old = await prisma.equipment.findUnique({ where: { id } });
    if (!old) return res.status(404).json({ message: '器材不存在' });
    const diff = parseInt(total) - old.total;
    const eq = await prisma.equipment.update({
      where: { id },
      data: { name, category, total: parseInt(total), available: Math.max(0, old.available + diff) },
    });
    res.json(eq);
  } catch (err) {
    res.status(500).json({ message: '更新器材失败', error: err.message });
  }
});

router.delete('/equipment/:id', auth, admin, async (req, res) => {
  try {
    await prisma.equipment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '器材已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

// ========== 借阅审批 ==========
router.get('/borrows', auth, admin, async (req, res) => {
  try {
    const list = await prisma.borrow.findMany({
      include: {
        user: { select: { id: true, name: true, studentId: true } },
        equipment: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: '获取借阅列表失败', error: err.message });
  }
});

// 审批（同意/拒绝）
router.patch('/borrows/:id', auth, admin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body; // APPROVED | REJECTED
    const borrow = await prisma.borrow.findUnique({ where: { id }, include: { equipment: true } });
    if (!borrow) return res.status(404).json({ message: '记录不存在' });

    if (status === 'REJECTED' && borrow.status === 'PENDING') {
      await prisma.equipment.update({
        where: { id: borrow.equipmentId },
        data: { available: borrow.equipment.available + borrow.count },
      });
    }
    if (status === 'RETURNED' && borrow.status === 'APPROVED') {
      await prisma.equipment.update({
        where: { id: borrow.equipmentId },
        data: { available: borrow.equipment.available + borrow.count },
      });
    }
    await prisma.borrow.update({ where: { id }, data: { status } });
    res.json({ message: '操作成功' });
  } catch (err) {
    res.status(500).json({ message: '操作失败', error: err.message });
  }
});

router.delete('/borrows/:id', auth, admin, async (req, res) => {
  try {
    await prisma.borrow.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '记录已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

// ========== 站点内容编辑 ==========
router.put('/site-content', auth, admin, async (req, res) => {
  try {
    const { introTitle, introSubtitle, introBox1, introBox2, introRules } = req.body;
    const content = await prisma.siteContent.upsert({
      where: { id: 1 },
      update: { introTitle, introSubtitle, introBox1, introBox2, introRules },
      create: { id: 1, introTitle, introSubtitle, introBox1, introBox2, introRules },
    });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: '保存失败', error: err.message });
  }
});

// ========== 资料管理 ==========
router.delete('/resources/:id', auth, admin, async (req, res) => {
  try {
    await prisma.resource.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '资料已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除失败', error: err.message });
  }
});

export default router;

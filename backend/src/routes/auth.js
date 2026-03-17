import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config.js';
import auth from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// 注册（含实名信息）
router.post('/register', async (req, res) => {
  try {
    const { studentId, password, name, college, grade, phone } = req.body;
    if (!studentId || !password || !name) {
      return res.status(400).json({ message: '学号、密码和姓名为必填项' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位' });
    }
    const exists = await prisma.user.findUnique({ where: { studentId } });
    if (exists) {
      return res.status(400).json({ message: '该学号已被注册' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        studentId,
        password: hashed,
        name,
        college: college || '',
        grade: grade || '',
        phone: phone || '',
      },
    });
    res.json({ message: '注册成功，请等待管理员审核' });
  } catch (err) {
    res.status(500).json({ message: '注册失败', error: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      return res.status(400).json({ message: '请输入账号和密码' });
    }
    const user = await prisma.user.findUnique({ where: { studentId } });
    if (!user) {
      return res.status(400).json({ message: '账号或密码错误' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: '账号或密码错误' });
    }
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
    const { password: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  } catch (err) {
    res.status(500).json({ message: '登录失败', error: err.message });
  }
});

// 获取当前用户信息
router.get('/me', auth, (req, res) => {
  const { password: _, ...userInfo } = req.user;
  res.json(userInfo);
});

export default router;

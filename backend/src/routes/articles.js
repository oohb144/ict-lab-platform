import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = Router();
const prisma = new PrismaClient();

// 生成 slug（简单实现）
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[\s\u4e00-\u9fa5]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') ||
    `article-${Date.now()}`;
}

// GET /api/articles/archive - 获取归档数据（必须在 /:id 前注册）
router.get('/archive', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // 按年月分组
    const grouped = {};
    articles.forEach(a => {
      const d = new Date(a.createdAt);
      const key = `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    });

    const result = Object.entries(grouped).map(([yearMonth, arts]) => ({ yearMonth, articles: arts }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '获取归档失败' });
  }
});

// GET /api/articles - 获取文章列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, published } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (published === 'true') where.published = true;
    if (category) where.category = category;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          category: true, tags: true, published: true,
          viewCount: true, createdAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    res.json({ articles, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: '获取文章列表失败' });
  }
});

// GET /api/articles/:id - 获取文章详情（同时支持 id 和 slug）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);

    const article = await prisma.article.findFirst({
      where: isNumeric
        ? { id: parseInt(id), published: true }
        : { slug: id, published: true },
      include: { author: { select: { name: true } } },
    });

    if (!article) return res.status(404).json({ message: '文章不存在' });

    // 增加阅读量
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ ...article, viewCount: article.viewCount + 1 });
  } catch (err) {
    res.status(500).json({ message: '获取文章失败' });
  }
});

// POST /api/articles - 创建文章（需要登录）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, published } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: '标题、内容、分类为必填项' });
    }

    // 生成唯一 slug
    let slug = generateSlug(title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        category,
        tags: tags || null,
        published: published ?? false,
        authorId: req.user.id,
      },
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: '创建文章失败' });
  }
});

// PUT /api/articles/:id - 更新文章（需要登录）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, category, tags, published } = req.body;

    const article = await prisma.article.findUnique({ where: { id: parseInt(id) } });
    if (!article) return res.status(404).json({ message: '文章不存在' });

    // 只有作者或管理员可以修改
    if (article.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权限修改此文章' });
    }

    const updated = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(category && { category }),
        ...(tags !== undefined && { tags }),
        ...(published !== undefined && { published }),
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: '更新文章失败' });
  }
});

// DELETE /api/articles/:id - 删除文章（需要管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id: parseInt(id) } });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '删除文章失败' });
  }
});

export default router;

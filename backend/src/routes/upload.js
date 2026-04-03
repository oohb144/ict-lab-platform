import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../middleware/auth.js';

const router = Router();

// 确保 uploads 目录存在
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 磁盘存储：文件保存到 /uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// POST /api/upload - 上传文件到服务器
router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请选择文件' });

  // 返回可访问的 URL 路径
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, fileName: req.file.originalname });
});

// DELETE /api/upload - 删除文件
router.delete('/', auth, (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ message: '缺少文件名' });

  // 安全校验：只允许删除 uploads 目录内的文件，防止路径穿越
  const filePath = path.resolve(uploadsDir, path.basename(filename));
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(400).json({ message: '非法路径' });
  }

  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '删除失败' });
  }
});

export default router;

import { Router } from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import { uploadToGitee } from '../utils/gitee.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// 文件上传到 Gitee 仓库
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '请选择文件' });

    const url = await uploadToGitee(req.file.buffer, req.file.originalname);
    res.json({ url, fileName: req.file.originalname });
  } catch (err) {
    res.status(500).json({ message: '上传失败', error: err.message });
  }
});

// 文件代理：解决 Gitee raw 链接被 iframe 拦截的问题
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: '缺少 url 参数' });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`远程文件获取失败: ${response.status}`);

    // 根据文件扩展名修正 content-type（Gitee 有时返回错误的类型）
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    const mimeMap = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
    };
    if (mimeMap[ext]) contentType = mimeMap[ext];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: '文件代理失败', error: err.message });
  }
});

export default router;

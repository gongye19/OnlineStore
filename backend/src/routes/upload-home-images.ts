import { Router, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 配置 multer（内存存储）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 上传主页图片
// 支持上传 hero.jpg, philosophy.jpg, founder.jpg
router.post('/home', authenticate, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = file.originalname.toLowerCase();
    
    // 验证文件名（必须是 hero.jpg, philosophy.jpg, 或 founder.jpg）
    const allowedFiles = ['hero.jpg', 'philosophy.jpg', 'founder.jpg'];
    if (!allowedFiles.includes(fileName)) {
      return res.status(400).json({ 
        error: `Invalid filename. Must be one of: ${allowedFiles.join(', ')}` 
      });
    }

    // 使用固定的文件名，路径为 home/文件名
    const filePath = `home/${fileName}`;

    // 上传到 Supabase Storage（使用 upsert: true 允许覆盖）
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true // 允许覆盖已存在的文件
      });

    if (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: error.message });
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    res.json({
      url: urlData.publicUrl,
      path: filePath,
      filename: fileName
    });
  } catch (error: any) {
    console.error('Upload home image error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

export default router;


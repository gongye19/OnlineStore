// 主页图片配置
// 支持两种方式：
// 1. Supabase Storage（推荐）：使用 CDN 加速，加载更快
// 2. 本地存储：放在 public/images/home/ 目录下

// ⚠️ 重要：如果使用 Supabase Storage，请将下面的 URL 替换为您的 Supabase Storage 公开 URL
// URL 格式：https://[project-id].supabase.co/storage/v1/object/public/product-images/home/[filename].jpg

// 获取 Supabase Storage URL 的方法：
// 1. 通过 Supabase Dashboard → Storage → product-images → home 文件夹
// 2. 点击图片，复制 "Public URL"
// 3. 或者使用后端 API：POST /api/upload/home 上传图片后获取 URL

export const homeImages = {
  // Hero 背景图（主页大图）
  // 方式 1：Supabase Storage（推荐，需要替换为实际 URL）
  hero: process.env.VITE_HOME_HERO_URL || '/images/home/hero.jpg',
  
  // 方式 2：本地存储（备用）
  // hero: '/images/home/hero.jpg',
  
  // 工艺哲学配图（右侧展示图）
  philosophy: process.env.VITE_HOME_PHILOSOPHY_URL || '/images/home/philosophy.jpg',
  
  // 主理人照片
  founder: process.env.VITE_HOME_FOUNDER_URL || '/images/home/founder.jpg',
};

// 使用说明：
// 
// === 方式 1：使用 Supabase Storage（推荐）===
// 1. 在 Supabase Dashboard → Storage → product-images bucket 中创建 home 文件夹
// 2. 上传 hero.jpg, philosophy.jpg, founder.jpg 到 home 文件夹
// 3. 获取每张图片的 Public URL
// 4. 在 Vercel 环境变量中设置：
//    - VITE_HOME_HERO_URL=https://[project-id].supabase.co/storage/v1/object/public/product-images/home/hero.jpg
//    - VITE_HOME_PHILOSOPHY_URL=https://[project-id].supabase.co/storage/v1/object/public/product-images/home/philosophy.jpg
//    - VITE_HOME_FOUNDER_URL=https://[project-id].supabase.co/storage/v1/object/public/product-images/home/founder.jpg
// 5. 或者直接修改上面的 URL（不推荐，因为代码中硬编码）
//
// === 方式 2：使用本地存储（备用）===
// 1. 将图片文件放在 frontend/public/images/home/ 目录下
// 2. 文件名必须为：hero.jpg, philosophy.jpg, founder.jpg
// 3. 图片会自动从本地加载
//
// === 图片优化建议 ===
// - 压缩图片：hero < 500KB, philosophy < 200KB, founder < 200KB
// - 使用 WebP 格式可以进一步减小文件大小
// - 建议使用工具：TinyPNG, ImageOptim, Squoosh


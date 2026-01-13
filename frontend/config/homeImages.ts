// 主页静态图片配置
// 可以直接修改这里的 URL 来更换图片
// 或者上传图片到 Supabase Storage 后使用 Storage URL

export const homeImages = {
  // Hero 背景图（主页大图）
  hero: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=2000',
  
  // 工艺哲学配图（右侧展示图）
  philosophy: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=1200',
  
  // 主理人照片
  founder: 'https://images.unsplash.com/photo-1581404917879-53e19259fdda?auto=format&fit=crop&q=80&w=800',
};

// 使用说明：
// 1. 直接修改上面的 URL（使用外部图片链接，如 Unsplash、Imgur 等）
// 2. 或者上传图片到 Supabase Storage，然后使用 Storage URL：
//    格式：https://cjbfjtbkxqwvmwxpzipd.supabase.co/storage/v1/object/public/home-images/xxx.jpg


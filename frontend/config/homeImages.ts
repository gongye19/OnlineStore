// 主页静态图片配置
// 图片存储在 public/images/home/ 目录下
// Vite 会自动处理 public 目录下的文件，可以直接通过 /images/home/xxx.jpg 访问

// 支持的图片格式：jpg, jpeg, png, webp
// 如果图片不存在，会显示加载失败提示

export const homeImages = {
  // Hero 背景图（主页大图）
  // 请将图片文件命名为：hero.jpg 或 hero.png，放在 public/images/home/ 目录下
  hero: '/images/home/hero.jpg',
  
  // 工艺哲学配图（右侧展示图）
  // 请将图片文件命名为：philosophy.jpg 或 philosophy.png，放在 public/images/home/ 目录下
  philosophy: '/images/home/philosophy.jpg',
  
  // 主理人照片
  // 请将图片文件命名为：founder.jpg 或 founder.png，放在 public/images/home/ 目录下
  founder: '/images/home/founder.jpg',
};

// 使用说明：
// 1. 将图片文件放在 frontend/public/images/home/ 目录下
// 2. 文件名必须为：hero.jpg, philosophy.jpg, founder.jpg（或对应的 .png/.webp 格式）
// 3. 如果使用不同格式，请修改上面的路径（如 .png 或 .webp）
// 4. 图片会自动从本地加载，无需外部 URL


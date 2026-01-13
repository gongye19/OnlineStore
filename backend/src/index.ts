import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import uploadHomeImagesRoutes from './routes/upload-home-images.js';

dotenv.config();

const app = express();
// Railway 会自动设置 PORT 环境变量，如果没有则使用默认值
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// CORS 配置 - 支持多个域名
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// 规范化 origin（处理 http/https 协议）
const normalizeOrigin = (origin: string): string[] => {
  if (origin.startsWith('http://')) {
    return [origin, origin.replace('http://', 'https://')];
  } else if (origin.startsWith('https://')) {
    return [origin, origin.replace('https://', 'http://')];
  }
  return [origin];
};

// 展开所有可能的 origin 变体（http 和 https）
const expandedOrigins = allowedOrigins.flatMap(normalizeOrigin);

// 中间件
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    // 检查是否在允许列表中（包括 http/https 变体）
    if (expandedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 允许 Vercel 预览域名（所有 *.vercel.app 域名）
      if (origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        // 开发环境允许所有来源（仅用于调试）
        if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}. Allowed: ${expandedOrigins.join(', ')}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', uploadHomeImagesRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 启动服务器
// Railway 需要监听 0.0.0.0 而不是 localhost
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 CORS enabled for: ${expandedOrigins.join(', ')}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
});


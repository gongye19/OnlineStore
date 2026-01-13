import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 配置 - 支持多个域名
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

// 中间件
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    // 检查是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 开发环境允许所有来源（仅用于调试）
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
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
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});


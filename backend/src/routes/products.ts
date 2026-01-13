import { Router, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 获取商品列表（支持分类筛选和分页）
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, featured, page = '1', limit = '10' } = req.query;
    
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // 分类筛选
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    // 精选筛选
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      products: data || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0
      }
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

// 获取单个商品详情
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch product' });
  }
});

// 创建商品（管理员）
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, category, description, image_url, images, stock, featured } = req.body;

    if (!name || !price || !category || !description || !image_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        price: parseFloat(price),
        category,
        description,
        image_url,
        images: images || [image_url],
        stock: parseInt(stock) || 0,
        featured: featured || false
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});

// 更新商品（管理员）
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, image_url, images, stock, featured } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (image_url) updateData.image_url = image_url;
    if (images) updateData.images = images;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (featured !== undefined) updateData.featured = featured;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
});

// 删除商品（管理员）
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete product' });
  }
});

export default router;


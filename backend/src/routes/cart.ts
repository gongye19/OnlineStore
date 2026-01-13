import { Router, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 获取购物车
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', req.userId!);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 格式化返回数据
    const cartItems = (data || []).map((item: any) => ({
      id: item.product_id,
      ...item.products,
      quantity: item.quantity
    }));

    res.json(cartItems);
  } catch (error: any) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch cart' });
  }
});

// 添加商品到购物车
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // 检查商品是否存在
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // 检查购物车中是否已有该商品
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', req.userId!)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select(`
          *,
          products (*)
        `)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({
        id: data.product_id,
        ...data.products,
        quantity: data.quantity
      });
    } else {
      // 创建新记录
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.userId!,
          product_id,
          quantity
        })
        .select(`
          *,
          products (*)
        `)
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({
        id: data.product_id,
        ...data.products,
        quantity: data.quantity
      });
    }
  } catch (error: any) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message || 'Failed to add to cart' });
  }
});

// 更新购物车项数量
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // product_id
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // 检查商品库存
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // 更新购物车项
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', req.userId!)
      .eq('product_id', id)
      .select(`
        *,
        products (*)
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      id: data.product_id,
      ...data.products,
      quantity: data.quantity
    });
  } catch (error: any) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: error.message || 'Failed to update cart' });
  }
});

// 删除购物车项
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // product_id

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.userId!)
      .eq('product_id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Cart item deleted successfully' });
  } catch (error: any) {
    console.error('Delete cart error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete cart item' });
  }
});

export default router;


import { Router, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// 获取订单列表（用户看自己的，管理员看全部）
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    // 如果不是管理员，只返回自己的订单
    if (!req.isAdmin) {
      query = query.eq('user_id', req.userId!);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 格式化订单数据
    const orders = (data || []).map((order: any) => ({
      id: order.id,
      customerName: order.customer_name,
      shippingPhone: order.shipping_phone,
      shippingAddress: order.shipping_address,
      total: parseFloat(order.total),
      status: order.status,
      date: order.created_at.split('T')[0],
      items: order.order_items.map((item: any) => ({
        id: item.products.id,
        ...item.products,
        quantity: item.quantity
      }))
    }));

    res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
});

// 获取单个订单详情
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', id);

    // 如果不是管理员，只能查看自己的订单
    if (!req.isAdmin) {
      query = query.eq('user_id', req.userId!);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 格式化订单数据
    const order = {
      id: data.id,
      customerName: data.customer_name,
      shippingPhone: data.shipping_phone,
      shippingAddress: data.shipping_address,
      total: parseFloat(data.total),
      status: data.status,
      date: data.created_at.split('T')[0],
      items: data.order_items.map((item: any) => ({
        id: item.products.id,
        ...item.products,
        quantity: item.quantity
      }))
    };

    res.json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch order' });
  }
});

// 创建订单（结算）
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, shippingPhone, shippingAddress } = req.body;

    if (!customerName || !shippingPhone || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required shipping information' });
    }

    // 获取购物车
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', req.userId!);

    if (cartError) {
      return res.status(500).json({ error: cartError.message });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 验证库存并计算总价
    let total = 0;
    const orderItems: any[] = [];

    for (const cartItem of cartItems) {
      const product = cartItem.products;
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}` 
        });
      }
      const itemTotal = parseFloat(product.price) * cartItem.quantity;
      total += itemTotal;
      orderItems.push({
        product_id: product.id,
        quantity: cartItem.quantity,
        price: product.price
      });
    }

    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.userId!,
        customer_name: customerName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        total
      })
      .select()
      .single();

    if (orderError || !order) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // 创建订单项
    const orderItemsData = orderItems.map(item => ({
      order_id: order.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      // 回滚：删除已创建的订单
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({ error: 'Failed to create order items' });
    }

    // 更新商品库存
    for (const cartItem of cartItems) {
      const product = cartItem.products;
      await supabase
        .from('products')
        .update({ stock: product.stock - cartItem.quantity })
        .eq('id', product.id);
    }

    // 清空购物车
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.userId!);

    // 返回订单数据
    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', order.id)
      .single();

    const formattedOrder = {
      id: fullOrder.id,
      customerName: fullOrder.customer_name,
      shippingPhone: fullOrder.shipping_phone,
      shippingAddress: fullOrder.shipping_address,
      total: parseFloat(fullOrder.total),
      status: fullOrder.status,
      date: fullOrder.created_at.split('T')[0],
      items: fullOrder.order_items.map((item: any) => ({
        id: item.products.id,
        ...item.products,
        quantity: item.quantity
      }))
    };

    res.status(201).json(formattedOrder);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// 更新订单状态（管理员）
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Exchange Requested'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const formattedOrder = {
      id: data.id,
      customerName: data.customer_name,
      shippingPhone: data.shipping_phone,
      shippingAddress: data.shipping_address,
      total: parseFloat(data.total),
      status: data.status,
      date: data.created_at.split('T')[0],
      items: data.order_items.map((item: any) => ({
        id: item.products.id,
        ...item.products,
        quantity: item.quantity
      }))
    };

    res.json(formattedOrder);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
});

export default router;


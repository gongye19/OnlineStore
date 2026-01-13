-- ============================================
-- 查询所有用户信息
-- 在 Supabase SQL Editor 中执行此查询
-- ============================================

-- 查询所有用户的基本信息
SELECT 
    id,
    phone,
    nickname,
    email,
    address,
    gender,
    is_admin,
    created_at,
    updated_at
FROM public.users
ORDER BY created_at DESC;

-- ============================================
-- 查询用户详细信息（包含统计信息）
-- ============================================

SELECT 
    u.id,
    u.phone,
    u.nickname,
    u.email,
    u.address,
    u.gender,
    u.is_admin,
    u.created_at,
    u.updated_at,
    -- 订单统计
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as total_spent,
    -- 购物车商品数量
    COUNT(DISTINCT c.product_id) as cart_items_count
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
LEFT JOIN public.cart_items c ON c.user_id = u.id
GROUP BY u.id, u.phone, u.nickname, u.email, u.address, u.gender, u.is_admin, u.created_at, u.updated_at
ORDER BY u.created_at DESC;

-- ============================================
-- 查询管理员用户
-- ============================================

SELECT 
    id,
    phone,
    nickname,
    email,
    is_admin,
    created_at
FROM public.users
WHERE is_admin = true
ORDER BY created_at DESC;

-- ============================================
-- 查询普通用户（非管理员）
-- ============================================

SELECT 
    id,
    phone,
    nickname,
    email,
    created_at
FROM public.users
WHERE is_admin = false
ORDER BY created_at DESC;

-- ============================================
-- 查询用户及其订单列表
-- ============================================

SELECT 
    u.id as user_id,
    u.phone,
    u.nickname,
    u.email,
    u.is_admin,
    o.id as order_id,
    o.customer_name,
    o.total,
    o.status,
    o.created_at as order_date
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
ORDER BY u.created_at DESC, o.created_at DESC;

-- ============================================
-- 统计用户数量
-- ============================================

SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_count,
    COUNT(*) FILTER (WHERE is_admin = false) as regular_user_count,
    COUNT(*) FILTER (WHERE email IS NOT NULL) as users_with_email,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_last_30_days
FROM public.users;


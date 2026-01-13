-- ============================================
-- 查看所有用户详细信息
-- 在 Supabase SQL Editor 中执行此查询
-- ============================================

-- ============================================
-- ⭐ 主要查询：每个用户的完整详细信息（执行这个查询）
-- ============================================
SELECT 
    u.id as 用户ID,
    u.phone as 手机号,
    u.nickname as 昵称,
    u.email as 邮箱,
    u.address as 地址,
    CASE 
        WHEN u.gender = 'male' THEN '男'
        WHEN u.gender = 'female' THEN '女'
        ELSE '保密'
    END as 性别,
    CASE 
        WHEN u.is_admin = true THEN '是'
        ELSE '否'
    END as 管理员,
    u.created_at as 注册时间,
    u.updated_at as 最后更新时间,
    -- 订单统计
    COUNT(DISTINCT o.id) as 订单总数,
    COALESCE(SUM(o.total), 0) as 总消费金额,
    COALESCE(AVG(o.total), 0) as 平均订单金额,
    -- 购物车统计
    COUNT(DISTINCT c.product_id) as 购物车商品种类数,
    COALESCE(SUM(c.quantity), 0) as 购物车商品总数,
    -- 最近活动
    MAX(o.created_at) as 最近订单时间,
    MAX(c.updated_at) as 最近购物车更新时间
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
LEFT JOIN public.cart_items c ON c.user_id = u.id
GROUP BY u.id, u.phone, u.nickname, u.email, u.address, u.gender, u.is_admin, u.created_at, u.updated_at
ORDER BY u.created_at DESC;

-- ============================================
-- 1. 用户基本信息概览
-- ============================================
SELECT 
    u.id,
    u.phone as 手机号,
    u.nickname as 昵称,
    u.email as 邮箱,
    u.address as 地址,
    CASE 
        WHEN u.gender = 'male' THEN '男'
        WHEN u.gender = 'female' THEN '女'
        ELSE '保密'
    END as 性别,
    CASE 
        WHEN u.is_admin = true THEN '是'
        ELSE '否'
    END as 管理员,
    u.created_at as 注册时间,
    u.updated_at as 更新时间
FROM public.users u
ORDER BY u.created_at DESC;

-- ============================================
-- 2. 用户详细信息（包含订单和购物车统计）
-- ============================================
SELECT 
    u.id as 用户ID,
    u.phone as 手机号,
    u.nickname as 昵称,
    u.email as 邮箱,
    u.address as 地址,
    CASE 
        WHEN u.gender = 'male' THEN '男'
        WHEN u.gender = 'female' THEN '女'
        ELSE '保密'
    END as 性别,
    CASE 
        WHEN u.is_admin = true THEN '是'
        ELSE '否'
    END as 管理员,
    -- 订单统计
    COUNT(DISTINCT o.id) as 订单总数,
    COALESCE(SUM(o.total), 0) as 总消费金额,
    COALESCE(AVG(o.total), 0) as 平均订单金额,
    -- 购物车统计
    COUNT(DISTINCT c.product_id) as 购物车商品数,
    COALESCE(SUM(c.quantity), 0) as 购物车总数量,
    -- 时间信息
    u.created_at as 注册时间,
    u.updated_at as 最后更新时间,
    -- 最近订单时间
    MAX(o.created_at) as 最近订单时间
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
LEFT JOIN public.cart_items c ON c.user_id = u.id
GROUP BY u.id, u.phone, u.nickname, u.email, u.address, u.gender, u.is_admin, u.created_at, u.updated_at
ORDER BY u.created_at DESC;

-- ============================================
-- 3. 用户订单详情列表
-- ============================================
SELECT 
    u.id as 用户ID,
    u.phone as 手机号,
    u.nickname as 昵称,
    o.id as 订单ID,
    o.customer_name as 收货人,
    o.shipping_phone as 收货电话,
    o.shipping_address as 收货地址,
    o.total as 订单金额,
    o.status as 订单状态,
    o.created_at as 下单时间,
    o.updated_at as 更新时间
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
ORDER BY u.created_at DESC, o.created_at DESC NULLS LAST;

-- ============================================
-- 4. 用户购物车详情
-- ============================================
SELECT 
    u.id as 用户ID,
    u.phone as 手机号,
    u.nickname as 昵称,
    c.id as 购物车项ID,
    p.name as 商品名称,
    p.price as 商品单价,
    c.quantity as 数量,
    (p.price * c.quantity) as 小计,
    c.created_at as 加入时间,
    c.updated_at as 更新时间
FROM public.users u
LEFT JOIN public.cart_items c ON c.user_id = u.id
LEFT JOIN public.products p ON p.id = c.product_id
ORDER BY u.created_at DESC, c.created_at DESC NULLS LAST;

-- ============================================
-- 5. 用户统计汇总
-- ============================================
SELECT 
    COUNT(*) as 总用户数,
    COUNT(*) FILTER (WHERE u.is_admin = true) as 管理员数量,
    COUNT(*) FILTER (WHERE u.is_admin = false) as 普通用户数量,
    COUNT(*) FILTER (WHERE u.email IS NOT NULL) as 有邮箱用户数,
    COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days') as 近7天新用户,
    COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days') as 近30天新用户,
    COUNT(DISTINCT o.user_id) as 有订单用户数,
    COUNT(DISTINCT c.user_id) as 有购物车用户数
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
LEFT JOIN public.cart_items c ON c.user_id = u.id;

-- ============================================
-- 6. 按条件查询特定用户（示例）
-- ============================================
-- 查询指定手机号的用户详细信息
-- SELECT 
--     u.id,
--     u.phone,
--     u.nickname,
--     u.email,
--     u.address,
--     u.is_admin,
--     COUNT(DISTINCT o.id) as order_count,
--     COALESCE(SUM(o.total), 0) as total_spent
-- FROM public.users u
-- LEFT JOIN public.orders o ON o.user_id = u.id
-- WHERE u.phone = '13800138000'  -- 替换为要查询的手机号
-- GROUP BY u.id, u.phone, u.nickname, u.email, u.address, u.is_admin;

-- 查询指定昵称的用户详细信息
-- SELECT 
--     u.id,
--     u.phone,
--     u.nickname,
--     u.email,
--     u.address,
--     u.is_admin,
--     COUNT(DISTINCT o.id) as order_count,
--     COALESCE(SUM(o.total), 0) as total_spent
-- FROM public.users u
-- LEFT JOIN public.orders o ON o.user_id = u.id
-- WHERE u.nickname = '管理员'  -- 替换为要查询的昵称
-- GROUP BY u.id, u.phone, u.nickname, u.email, u.address, u.is_admin;

-- ============================================
-- 7. 管理员用户列表
-- ============================================
SELECT 
    id as 用户ID,
    phone as 手机号,
    nickname as 昵称,
    email as 邮箱,
    address as 地址,
    created_at as 注册时间
FROM public.users
WHERE is_admin = true
ORDER BY created_at DESC;

-- ============================================
-- 8. 活跃用户排行（按订单数量）
-- ============================================
SELECT 
    u.id as 用户ID,
    u.phone as 手机号,
    u.nickname as 昵称,
    COUNT(DISTINCT o.id) as 订单数量,
    COALESCE(SUM(o.total), 0) as 总消费金额,
    MAX(o.created_at) as 最近订单时间
FROM public.users u
LEFT JOIN public.orders o ON o.user_id = u.id
GROUP BY u.id, u.phone, u.nickname
HAVING COUNT(DISTINCT o.id) > 0
ORDER BY 订单数量 DESC, 总消费金额 DESC
LIMIT 20;


-- ============================================
-- 删除所有用户信息（测试用）
-- ⚠️ 警告：此脚本会删除所有用户及其相关数据
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 注意：由于外键约束设置了 ON DELETE CASCADE，
-- 删除 users 表中的记录会自动删除相关的：
-- - cart_items（购物车项）
-- - orders（订单）
-- - order_items（订单项，通过 orders 级联删除）

-- 1. 查看删除前的用户数量（可选，用于确认）
SELECT 
    COUNT(*) as total_users_before_deletion,
    COUNT(*) FILTER (WHERE is_admin = true) as admin_count,
    COUNT(*) FILTER (WHERE is_admin = false) as regular_user_count
FROM public.users;

-- 2. 删除所有购物车项（可选，因为 CASCADE 会自动删除）
-- DELETE FROM public.cart_items;

-- 3. 删除所有订单项（可选，因为 CASCADE 会自动删除）
-- DELETE FROM public.order_items;

-- 4. 删除所有订单（可选，因为 CASCADE 会自动删除）
-- DELETE FROM public.orders;

-- 5. 删除所有用户（这会自动级联删除购物车、订单等）
DELETE FROM public.users;

-- 6. 删除 Supabase Auth 中的所有用户（auth.users）
-- ⚠️ 注意：这需要超级管理员权限，在某些 Supabase 实例中可能无法直接执行
-- 如果执行失败，请通过 Dashboard 手动删除：Authentication → Users
DELETE FROM auth.users;

-- 7. 查看删除后的结果（应该返回 0）
SELECT 
    COUNT(*) as total_users_after_deletion
FROM public.users;

-- 8. 查看 auth.users 删除后的结果（应该返回 0）
SELECT 
    COUNT(*) as total_auth_users_after_deletion
FROM auth.users;

-- ============================================
-- ⚠️ 重要提示：
-- ============================================
-- 如果步骤 6 删除 auth.users 失败（权限不足），请使用以下方法：
-- 
-- 方法 1：通过 Supabase Dashboard（推荐）
-- 1. 进入 Supabase Dashboard
-- 2. 点击左侧菜单 "Authentication" → "Users"
-- 3. 选择所有用户并删除
-- 
-- 方法 2：通过后端 API
-- 使用 Supabase Admin API 的 deleteUser 方法批量删除
-- 
-- ============================================
-- 验证删除结果
-- ============================================

-- 检查是否还有用户数据
SELECT 
    'users' as table_name,
    COUNT(*) as remaining_records
FROM public.users
UNION ALL
SELECT 
    'cart_items' as table_name,
    COUNT(*) as remaining_records
FROM public.cart_items
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as remaining_records
FROM public.orders
UNION ALL
SELECT 
    'order_items' as table_name,
    COUNT(*) as remaining_records
FROM public.order_items;

-- 完成提示
SELECT 'All user data deleted successfully! Remember to delete auth.users manually.' AS message;


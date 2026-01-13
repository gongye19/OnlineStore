-- ============================================
-- 创建管理员账号
-- ⚠️ 注意：此脚本需要在 Supabase SQL Editor 中执行
-- 执行前请修改以下变量：
-- - admin_email: 管理员邮箱
-- - admin_password: 管理员密码（将自动加密）
-- - admin_phone: 管理员手机号
-- - admin_nickname: 管理员昵称
-- ============================================

-- 配置变量（请修改这些值）
DO $$
DECLARE
    admin_email TEXT := 'admin@example.com';  -- ⚠️ 修改为您的管理员邮箱
    admin_password TEXT := 'admin123456';     -- ⚠️ 修改为您的管理员密码（至少6位）
    admin_phone TEXT := '13800138000';        -- ⚠️ 修改为您的管理员手机号
    admin_nickname TEXT := '管理员';          -- ⚠️ 修改为您的管理员昵称
    admin_address TEXT := '北京市朝阳区';     -- ⚠️ 修改为您的地址（可选）
    new_user_id UUID;
BEGIN
    -- 检查邮箱是否已存在
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RAISE EXCEPTION '邮箱 % 已被注册，请使用其他邮箱', admin_email;
    END IF;

    -- 检查手机号是否已存在
    IF EXISTS (SELECT 1 FROM public.users WHERE phone = admin_phone) THEN
        RAISE EXCEPTION '手机号 % 已被注册，请使用其他手机号', admin_phone;
    END IF;

    -- 1. 在 auth.users 中创建用户（使用 Supabase 的 auth 函数）
    -- 注意：由于 Supabase 的安全限制，直接插入 auth.users 可能不可行
    -- 建议使用 Supabase Dashboard 或 Admin API 创建用户，然后执行步骤 2
    
    -- 如果 auth.users 中已有该邮箱的用户，获取其 ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = admin_email LIMIT 1;
    
    -- 如果没有找到，提示用户先通过 Dashboard 或 API 创建
    IF new_user_id IS NULL THEN
        RAISE EXCEPTION '请先通过以下方式创建 auth 用户：
        
方法 1：通过 Supabase Dashboard
1. 进入 Supabase Dashboard
2. 点击 "Authentication" → "Users" → "Add user"
3. 输入邮箱和密码，创建用户
4. 然后重新执行此脚本（只执行步骤 2）

方法 2：通过后端 API（推荐）
使用注册接口创建用户，然后执行步骤 2 将用户设置为管理员';
    END IF;

    -- 2. 在 public.users 中创建或更新用户资料，设置为管理员
    INSERT INTO public.users (
        id,
        phone,
        nickname,
        email,
        address,
        gender,
        is_admin,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        admin_phone,
        admin_nickname,
        admin_email,
        admin_address,
        'other',
        true,  -- 设置为管理员
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        phone = EXCLUDED.phone,
        nickname = EXCLUDED.nickname,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        is_admin = true,  -- 确保设置为管理员
        updated_at = NOW();

    RAISE NOTICE '管理员账号创建成功！
邮箱: %
手机号: %
昵称: %
用户ID: %', admin_email, admin_phone, admin_nickname, new_user_id;
END $$;

-- ============================================
-- 方法 2：如果 auth.users 中已有用户，直接设置为管理员
-- ============================================
-- 如果您已经通过注册接口创建了用户，可以使用以下 SQL 将其设置为管理员：
-- 
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'your-email@example.com';  -- 替换为您的邮箱
-- 
-- 或者通过手机号：
-- 
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE phone = '13800138000';  -- 替换为您的手机号

-- ============================================
-- 验证管理员账号
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


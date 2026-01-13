-- ============================================
-- 将已注册用户设置为管理员
-- ⚠️ 注意：此脚本需要在 Supabase SQL Editor 中执行
-- 执行前请修改以下变量：
-- - admin_phone: 管理员手机号（推荐使用此方式）
-- - admin_nickname: 管理员昵称（可选，如果使用手机号则不需要）
-- ============================================

-- 配置变量（请修改这些值）
DO $$
DECLARE
    admin_phone TEXT := '13800138000';        -- ⚠️ 修改为您的管理员手机号（推荐）
    admin_nickname TEXT := NULL;               -- ⚠️ 可选：如果使用昵称查找，请填写昵称
    updated_count INTEGER;
BEGIN
    -- 如果提供了手机号，优先使用手机号查找
    IF admin_phone IS NOT NULL AND admin_phone != '' THEN
        UPDATE public.users 
        SET is_admin = true,
            updated_at = NOW()
        WHERE phone = admin_phone;
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
        IF updated_count = 0 THEN
            RAISE EXCEPTION '未找到手机号为 % 的用户，请先注册该用户', admin_phone;
        END IF;
        
        RAISE NOTICE '成功将手机号为 % 的用户设置为管理员', admin_phone;
    -- 如果只提供了昵称，使用昵称查找
    ELSIF admin_nickname IS NOT NULL AND admin_nickname != '' THEN
        UPDATE public.users 
        SET is_admin = true,
            updated_at = NOW()
        WHERE nickname = admin_nickname;
        
        GET DIAGNOSTICS updated_count = ROW_COUNT;
        
        IF updated_count = 0 THEN
            RAISE EXCEPTION '未找到昵称为 % 的用户，请先注册该用户', admin_nickname;
        ELSIF updated_count > 1 THEN
            RAISE EXCEPTION '找到多个昵称为 % 的用户，请使用手机号来精确指定', admin_nickname;
        END IF;
        
        RAISE NOTICE '成功将昵称为 % 的用户设置为管理员', admin_nickname;
    ELSE
        RAISE EXCEPTION '请至少提供手机号或昵称之一';
    END IF;
END $$;

-- ============================================
-- 方法 2：直接使用 SQL 更新（更简单的方式）
-- ============================================
-- 如果您想直接执行 SQL，可以使用以下命令：
-- 
-- 通过手机号设置管理员：
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE phone = '13800138000';  -- 替换为您的手机号
-- 
-- 通过昵称设置管理员（如果有多个同名用户，会全部设置为管理员）：
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE nickname = '管理员';  -- 替换为您的昵称
-- 
-- 通过邮箱设置管理员：
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE email = 'admin@example.com';  -- 替换为您的邮箱

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

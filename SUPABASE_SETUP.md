# Supabase 配置说明

## 必须启用的功能

### 1. Email 认证提供者（必须）

**位置：** Supabase Dashboard → Authentication → Providers → Email

**操作：**
1. 点击 "Email" 提供者
2. 确保 "Enable Email provider" 开关是 **ON**（启用）
3. 保存设置

**重要：** 如果不启用，注册功能会失败，错误信息：`Email signups are disabled`

### 2. 邮箱验证设置（可选，建议关闭）

**位置：** Supabase Dashboard → Authentication → Settings → Email Auth

**操作：**
1. 找到 "Confirm email" 设置
2. 建议设置为 **OFF**（关闭）
3. 这样注册后可以直接登录，无需验证邮箱

### 3. Storage Bucket（必须）

**位置：** Supabase Dashboard → Storage

**操作：**
1. 创建 bucket：`product-images`
2. 设置为 **Public**（公开访问）
3. 确保可以上传图片

## 检查清单

- [ ] Email 提供者已启用
- [ ] 邮箱验证已关闭（可选，但推荐）
- [ ] `product-images` bucket 已创建且为 Public
- [ ] Service Role Key 已配置到 Railway 环境变量
- [ ] CORS 已正确配置

## 常见错误

### `email_provider_disabled`
**原因：** Email 提供者未启用
**解决：** 在 Supabase Dashboard → Authentication → Providers → Email 中启用

### `phone_provider_disabled`
**原因：** Phone 提供者未启用（本项目不需要）
**解决：** 本项目使用邮箱注册，不需要启用 Phone 提供者

### `Email not confirmed`
**原因：** 邮箱验证已启用，但用户未验证
**解决：** 关闭邮箱验证，或让用户点击邮件中的验证链接


# 主页图片迁移到 Supabase Storage 指南

## 步骤 1：在 Supabase 创建 Bucket

### 选项 A：使用现有的 `product-images` bucket（推荐）
- 优点：不需要创建新 bucket，统一管理
- 路径：`product-images/home/hero.jpg`、`product-images/home/philosophy.jpg`、`product-images/home/founder.jpg`

### 选项 B：创建新的 `home-images` bucket
- 优点：主页图片和商品图片分离
- 步骤：
  1. 进入 Supabase Dashboard → Storage
  2. 点击 "New bucket"
  3. 名称：`home-images`
  4. 设置为 **Public**（公开访问）
  5. 点击 "Create bucket"

## 步骤 2：上传图片到 Supabase Storage

### 方法 1：通过 Supabase Dashboard（最简单）

1. 进入 Supabase Dashboard → Storage
2. 选择 bucket（`product-images` 或 `home-images`）
3. 如果使用 `product-images`，先创建 `home` 文件夹：
   - 点击 "New folder"
   - 名称：`home`
4. 上传三张图片：
   - 点击 "Upload file"
   - 上传 `hero.jpg`、`philosophy.jpg`、`founder.jpg`
   - 如果使用 `product-images`，上传到 `home/` 文件夹下

### 方法 2：通过后端 API（需要管理员权限）

使用现有的上传接口，但需要修改路径为 `home/` 目录。

## 步骤 3：获取图片的公开 URL

### 通过 Dashboard：
1. 点击上传的图片
2. 复制 "Public URL"
3. URL 格式类似：`https://[project-id].supabase.co/storage/v1/object/public/product-images/home/hero.jpg`

### 通过代码获取：
```typescript
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl('home/hero.jpg');
console.log(data.publicUrl);
```

## 步骤 4：更新配置文件

更新 `frontend/config/homeImages.ts`，将本地路径替换为 Supabase Storage URL。

## 步骤 5：测试

1. 清除浏览器缓存
2. 访问主页
3. 检查图片是否正常加载
4. 检查 Network 面板，确认图片从 Supabase CDN 加载

## 注意事项

- 确保 bucket 设置为 **Public**（公开访问）
- 图片文件名保持一致：`hero.jpg`、`philosophy.jpg`、`founder.jpg`
- 如果图片很大，建议先压缩（目标：hero < 500KB，其他 < 200KB）
- 上传后立即测试 URL 是否可以公开访问


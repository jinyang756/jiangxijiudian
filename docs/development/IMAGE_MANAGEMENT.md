# 图片资源管理指南

## 📸 菜品图片上传

### Supabase 存储桶配置

1. **创建存储桶**
   - 登录 [Supabase Dashboard](https://app.supabase.com/)
   - 进入 Storage 管理页面
   - 创建新存储桶：`dish-images`
   - 设置为 Public（公开访问）

2. **上传图片**
   ```
   dish-images/
   ├── dishes/          # 菜品图片
   │   ├── H1.jpg      # 对应菜品ID
   │   ├── H2.jpg
   │   └── ...
   ├── categories/      # 分类图片（可选）
   └── banners/         # 轮播图（可选）
   ```

3. **更新数据库**
   在 `dishes` 表中更新 `image_url` 字段：
   ```sql
   -- 完整URL方式
   UPDATE dishes 
   SET image_url = 'https://your-project.supabase.co/storage/v1/object/public/dish-images/dishes/H1.jpg'
   WHERE dish_id = 'H1';
   
   -- 或者使用相对路径（推荐）
   UPDATE dishes 
   SET image_url = 'dishes/H1.jpg'
   WHERE dish_id = 'H1';
   ```

### 环境变量配置

在 `.env.development` 和 `.env.production` 中添加：

```bash
# Supabase Storage URL（项目URL）
VITE_APP_SUPABASE_STORAGE_URL=https://your-project.supabase.co
```

## 🖼️ 本地占位图

如果暂时没有上传真实图片，应用会使用本地占位图。

### 创建占位图

1. **准备占位图文件**
   - 文件路径：`public/placeholder-dish.jpg`
   - 建议尺寸：800x600 px
   - 格式：JPG, PNG, 或 WebP
   - 文件大小：< 100KB

2. **占位图内容建议**
   - 使用通用的食物图标或图案
   - 简洁的背景色（如米白色）
   - 添加"暂无图片"文字
   - 使用项目主题色

3. **可选：使用在线工具生成**
   - [Placeholder.com](https://placeholder.com/)
   - [DummyImage](https://dummyimage.com/)
   - 示例URL: `https://via.placeholder.com/800x600/f5f5f0/9ca3af?text=暂无图片`

### 快速创建占位图（使用代码）

创建文件 `public/placeholder-dish.svg`：

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <rect fill="#f5f5f0" width="800" height="600"/>
  <text fill="#9ca3af" font-family="sans-serif" font-size="32" 
        x="50%" y="50%" text-anchor="middle" alignment-baseline="middle">
    暂无图片
  </text>
  <text fill="#9ca3af" font-family="sans-serif" font-size="16" 
        x="50%" y="60%" text-anchor="middle" alignment-baseline="middle">
    No Image Available
  </text>
</svg>
```

然后更新 `src/lib/imageUtils.ts` 中的 `LOCAL_PLACEHOLDER`：

```typescript
const LOCAL_PLACEHOLDER = '/placeholder-dish.svg';
```

## 📁 推荐的图片规格

### 菜品图片
- **尺寸**: 800x600 px (4:3 比例)
- **格式**: WebP（优先），JPG 次之
- **大小**: 100-300 KB
- **优化**: 使用 [TinyPNG](https://tinypng.com/) 压缩

### 详情页图片
- **尺寸**: 1200x800 px
- **格式**: WebP, JPG
- **大小**: 200-500 KB

### 搜索缩略图
- **尺寸**: 300x300 px
- **格式**: WebP, JPG
- **大小**: < 50 KB

## 🔧 图片优化工具

### 在线工具
1. [TinyPNG](https://tinypng.com/) - PNG/JPG 压缩
2. [Squoosh](https://squoosh.app/) - 格式转换和压缩
3. [ImageOptim](https://imageoptim.com/) - Mac 桌面工具

### 命令行工具
```bash
# 安装 imagemagick
brew install imagemagick  # macOS
sudo apt install imagemagick  # Ubuntu

# 批量转换为 WebP
for file in *.jpg; do
  convert "$file" -quality 80 -resize 800x600 "${file%.jpg}.webp"
done

# 批量压缩
for file in *.jpg; do
  convert "$file" -quality 75 -sampling-factor 4:2:0 "optimized-$file"
done
```

## 📊 图片加载策略

当前实现的加载策略：

1. **优先级**:
   ```
   数据库 image_url → 本地占位图 → SVG 默认占位图
   ```

2. **懒加载**: 使用 `loading="lazy"` 属性

3. **加载状态**: 显示加载动画

4. **错误处理**: 自动降级到占位图

5. **预加载**: 首屏图片提前加载

## 🚀 批量导入图片示例

### 使用 Supabase JavaScript Client

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.VITE_APP_DB_URL,
  process.env.VITE_APP_DB_POSTGRES_PASSWORD
);

async function uploadDishImages() {
  const imagesDir = './dish-images';
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(file, path.extname(file));
    
    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('dish-images')
      .upload(`dishes/${file}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`上传失败: ${file}`, error);
      continue;
    }
    
    // 更新数据库
    const { error: dbError } = await supabase
      .from('dishes')
      .update({ image_url: `dishes/${file}` })
      .eq('dish_id', fileName);
    
    if (dbError) {
      console.error(`更新数据库失败: ${fileName}`, dbError);
    } else {
      console.log(`✅ 成功上传: ${file}`);
    }
  }
}

uploadDishImages();
```

## ⚠️ 注意事项

1. **不要使用外部图片服务**
   - ❌ 禁止使用 loremflickr.com 等第三方服务
   - ❌ 依赖外部服务会导致加载不稳定
   - ✅ 使用 Supabase Storage 或本地图片

2. **图片命名规范**
   - 使用菜品ID作为文件名（如 `H1.jpg`）
   - 使用小写和连字符
   - 避免特殊字符和空格

3. **版权和授权**
   - 确保图片有使用权
   - 标注图片来源（如需要）
   - 避免使用有水印的图片

4. **性能考虑**
   - 控制图片大小（< 500KB）
   - 使用现代格式（WebP）
   - 启用 CDN 加速

## 📋 检查清单

部署前确认：

- [ ] 已创建 Supabase 存储桶 `dish-images`
- [ ] 已设置存储桶为 Public
- [ ] 已配置环境变量 `VITE_APP_SUPABASE_STORAGE_URL`
- [ ] 已上传占位图到 `public/placeholder-dish.jpg`
- [ ] 已优化图片大小和格式
- [ ] 已测试图片加载和降级策略
- [ ] 已验证生产环境图片可访问

## 🔗 相关资源

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [图片优化最佳实践](https://web.dev/fast/#optimize-your-images)
- [WebP 格式介绍](https://developers.google.com/speed/webp)

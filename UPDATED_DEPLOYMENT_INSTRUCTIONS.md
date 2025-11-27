# 江西酒店管理面板 Supabase 部署更新指南

## 重要通知

根据最新的 Supabase CLI 文档，`supabase deploy` 命令可能已不再支持静态网站托管功能。我们将使用替代方法来部署管理面板。

## 新的部署方法：使用 Supabase Dashboard 手动上传

### 步骤 1：准备部署文件
1. 确保您的 `admin-panel` 目录包含所有必要的文件：
   - `index.html` (主页面)
   - `src/` 目录中的所有文件
   - CSS 和 JavaScript 文件

### 步骤 2：通过 Supabase Dashboard 上传文件
1. 登录到 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的江西酒店项目
3. 在左侧菜单中选择 "Storage" (存储)
4. 创建一个新的存储桶，命名为 `admin-panel`
5. 进入存储桶并上传 `admin-panel` 目录中的所有文件

### 步骤 3：配置存储桶权限
1. 在 Storage 页面，选择您的 `admin-panel` 存储桶
2. 点击 "Settings" (设置) 标签
3. 在 "Public URLs" 部分，启用 "Public access" (公开访问)
4. 保存设置

### 步骤 4：访问部署的管理面板
部署完成后，您可以通过以下 URL 访问管理面板：
```
https://<PROJECT_REF>.supabase.co/storage/v1/object/public/admin-panel/index.html
```

将 `<PROJECT_REF>` 替换为您的实际项目引用，例如：`kdlhyzsihflwkwumxzfw`

## 配置环境变量

为了让管理面板能够正确连接到数据库，您需要在 Supabase 项目中设置环境变量：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的江西酒店项目
3. 在左侧菜单中选择 "Settings" (设置) -> "Configuration" (配置)
4. 在 "Environment Variables" (环境变量) 部分添加以下变量：

```
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8
```

## 故障排除

### 常见问题及解决方案

1. **文件上传问题**：
   - 确保所有文件都已正确上传到存储桶
   - 检查文件路径是否正确

2. **访问被拒绝**：
   - 确保存储桶已设置为公开访问
   - 确保使用正确的 URL 访问管理面板

3. **管理面板无法连接数据库**：
   - 检查环境变量是否正确设置
   - 确认 anon key 具有正确的权限
   - 验证网络连接是否正常

## 替代部署方案

如果您希望使用更专业的部署方式，可以考虑以下替代方案：

1. **Vercel**：
   - 将 `admin-panel` 目录作为一个独立的项目部署到 Vercel
   - Vercel 提供免费的静态网站托管服务

2. **Netlify**：
   - 将 `admin-panel` 目录部署到 Netlify
   - Netlify 也提供优秀的静态网站托管服务

3. **GitHub Pages**：
   - 如果您使用 GitHub，可以将 `admin-panel` 目录部署到 GitHub Pages

## 支持和帮助

如果您在部署过程中遇到任何问题，请参考以下资源：

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)

您也可以随时联系我获取进一步的帮助。
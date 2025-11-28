# 江西酒店管理面板部署指南

## 部署步骤

### 1. 登录 Supabase Dashboard
1. 打开浏览器并访问 [Supabase Dashboard](https://app.supabase.com)
2. 使用您的账户凭据登录
3. 选择您的"江西酒店"项目

### 2. 创建存储桶
1. 在左侧导航菜单中，点击 "Storage" (存储)
2. 点击 "Create bucket" (创建存储桶) 按钮
3. 输入存储桶名称: `admin-panel`
4. 点击 "Create" (创建)

### 3. 上传文件
1. 点击刚刚创建的 `admin-panel` 存储桶
2. 点击 "Upload" (上传) 按钮
3. 选择并上传以下文件和目录:
   - `index.html`
   - `set-env.html`
   - `connection-test.html`
   - `src/` 目录及其所有内容
   - `README.md`
   - `DEPLOYMENT.md`

### 4. 设置存储桶权限
1. 在存储桶页面，点击 "Settings" (设置) 标签
2. 在 "Public URLs" 部分，启用 "Public access" (公开访问)
3. 点击 "Save" (保存)

### 5. 访问管理面板
部署完成后，您可以通过以下 URL 访问管理面板:
```
YOUR_SUPABASE_URL/storage/v1/object/public/admin-panel/index.html
```

## 故障排除

### 如果无法访问管理面板
1. 确保存储桶已设置为公开访问
2. 检查文件是否已正确上传
3. 清除浏览器缓存后重新访问

### 如果管理面板无法连接数据库
1. 打开 `set-env.html` 页面设置环境变量
2. 确保 Supabase URL 和 Anon Key 正确
3. 保存环境变量后重新访问管理面板

## 安全建议

1. 定期更换 Supabase Anon Key
2. 限制对管理面板的访问
3. 使用 HTTPS 访问管理面板
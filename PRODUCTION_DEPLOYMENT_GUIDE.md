# 生产环境部署指南

本指南将帮助您将江西酒店菜单系统成功部署到生产环境。

## 部署前检查清单

- [ ] 前端项目已成功构建
- [ ] 管理面板文件已准备就绪
- [ ] Supabase 项目已创建
- [ ] Supabase 环境变量已配置
- [ ] Vercel 项目已创建（用于前端部署）

## 前端部署到 Vercel

### 1. 构建项目
```bash
npm run build
```

### 2. 部署到 Vercel
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择您的 GitHub 仓库
4. 配置项目设置：
   - Framework Preset: Vite
   - Root Directory: / (项目根目录)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. 配置环境变量
在 Vercel 项目设置中添加以下环境变量：
```
VITE_APP_DB_URL=YOUR_SUPABASE_URL
VITE_APP_DB_POSTGRES_PASSWORD=YOUR_SUPABASE_ANON_KEY
```

## 管理面板部署到 Supabase Storage

### 1. 创建存储桶
1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的"江西酒店"项目
3. 在左侧菜单中点击 "Storage"
4. 点击 "Create bucket" 按钮
5. 输入存储桶名称: `admin-panel`
6. 设置为公开访问
7. 点击 "Create bucket"

### 2. 上传文件
有两种方式上传文件：

#### 方式一：使用脚本上传（推荐）
在项目根目录打开终端，运行：
```bash
npm run deploy-admin-panel
```

#### 方式二：手动上传
1. 在 Supabase Dashboard 中点击刚刚创建的 "admin-panel" 存储桶
2. 点击 "Upload" 按钮
3. 选择并上传 `admin-panel` 目录中的所有文件和子目录

### 3. 验证部署
部署完成后，您可以通过以下 URL 访问管理面板：
```
YOUR_SUPABASE_URL/storage/v1/object/public/admin-panel/index.html
```

## 数据库初始化

### 1. 运行数据库初始化脚本
```bash
npm run init-db-optimized
```

### 2. 验证数据库连接
```bash
npm run verify-db
```

## 访问系统

### 前端展示页面
```
https://您的Vercel域名.vercel.app
```

### 后台管理面板
```
YOUR_SUPABASE_URL/storage/v1/object/public/admin-panel/index.html
```

默认登录账户:
- 管理员: admin / admin123
- 经理: manager / manager123
- 员工: staff / staff123

## 故障排除

### 常见问题

1. **页面空白**
   - 检查 Vercel 环境变量配置
   - 确认 Supabase URL 和 Anon Key 正确

2. **数据库连接失败**
   - 验证 Supabase 配置
   - 检查网络连接

3. **管理面板404**
   - 确认 Supabase Storage 部署完成
   - 检查存储桶是否设置为公开访问

4. **菜单数据不显示**
   - 验证 `menu_view` 视图是否存在
   - 检查数据库表是否已正确初始化

### 需要帮助？
如果在部署过程中遇到问题，请检查浏览器控制台的错误信息，或联系技术支持。
# 江西酒店管理面板 Supabase 部署详细步骤指南

## 部署前准备

### 第一步：登录 Supabase 账户
1. 打开终端并运行以下命令：
```bash
npx supabase login
```
2. 按回车键，系统会自动打开浏览器让您登录
3. 使用您的 Supabase 账户凭据登录
4. 登录成功后，终端会显示登录成功的消息

### 第二步：获取项目引用（Project Reference）
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的江西酒店项目
3. 在项目概览页面找到 "Project Ref"（项目引用），它看起来像这样：`kdlhyzsihflwkwumxzfw`

## 部署管理面板

### 方法一：使用 Supabase CLI 部署（推荐）

1. 打开终端并导航到项目目录：
```bash
cd "C:\Users\88903\Desktop\江西酒店\admin-panel"
```

2. 运行部署命令：
```bash
npx supabase deploy
```

3. 如果系统提示选择项目，请选择您的江西酒店项目

### 方法二：手动部署

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的江西酒店项目
3. 在左侧菜单中选择 "Static Site Hosting"（静态站点托管）
4. 点击 "Deploy"（部署）按钮
5. 选择 "Upload folder"（上传文件夹）
6. 上传 `admin-panel` 文件夹中的所有文件

## 配置环境变量

为了让管理面板能够正确连接到数据库，您需要在 Supabase 项目中设置环境变量：

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的江西酒店项目
3. 在左侧菜单中选择 "Settings"（设置）-> "Configuration"（配置）
4. 在 "Environment Variables"（环境变量）部分添加以下变量：

```
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8
```

## 访问部署的管理面板

部署完成后，您可以通过以下 URL 访问管理面板：
```
https://kdlhyzsihflwkwumxzfw.supabase.co/projects/kdlhyzsihflwkwumxzfw/static/admin-panel
```

## 故障排除

### 常见问题及解决方案

1. **登录问题**：
   - 确保您使用的是正确的 Supabase 账户凭据
   - 如果浏览器没有自动打开，请手动访问提供的登录 URL

2. **部署失败**：
   - 确保您选择了正确的项目
   - 检查网络连接是否正常
   - 确保 admin-panel 文件夹中的所有文件都存在且没有损坏

3. **管理面板无法连接数据库**：
   - 检查环境变量是否正确设置
   - 确认 anon key 具有正确的权限
   - 验证网络连接是否正常

4. **访问被拒绝**：
   - 确保您使用的是 HTTPS URL
   - 检查是否有防火墙或安全软件阻止访问

## 高级配置（可选）

### 自定义域名
如果您想使用自定义域名：

1. 在 Supabase Dashboard 中进入项目设置
2. 选择 "Custom Domains"（自定义域名）
3. 按照指示添加您的自定义域名
4. 在您的 DNS 提供商处添加相应的 DNS 记录

### 设置身份验证（推荐）
为了提高安全性，建议为管理面板设置身份验证：

1. 在 Supabase Dashboard 中启用身份验证功能
2. 配置适当的登录提供商（如电子邮件/密码、Google、GitHub 等）
3. 在管理面板中集成身份验证逻辑

## 支持和帮助

如果您在部署过程中遇到任何问题，请参考以下资源：

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)
- [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)

您也可以随时联系我获取进一步的帮助。
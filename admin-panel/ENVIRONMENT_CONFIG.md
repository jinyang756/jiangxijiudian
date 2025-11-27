# 江西酒店管理面板环境变量配置指南

## 当前部署情况分析

根据我们的部署方式，管理面板静态文件托管在 Supabase Storage（公共）并直接通过 Storage URL 服务，属于您提到的选项 A。

## 环境变量配置方案

### 方案一：前端浏览器端环境变量（已实现）

由于 Supabase Storage 静态主机不支持在浏览器端注入服务器环境变量，我们已经实现了以下解决方案：

1. **在管理面板中嵌入默认配置**：
   - Supabase URL: `YOUR_SUPABASE_URL`
   - Supabase Anon Key: `YOUR_SUPABASE_ANON_KEY`

2. **允许用户在浏览器中自定义配置**：
   - 通过 `set-env.html` 页面设置环境变量
   - 配置保存在浏览器的 localStorage 中
   - 管理面板从 localStorage 读取配置

### 方案二：使用支持环境变量的静态托管平台（推荐）

为了更安全和专业的部署，建议将管理面板迁移到支持环境变量的静态托管平台，如 Vercel、Netlify 或 Cloudflare Pages。

#### Vercel 部署配置步骤：

1. **创建 Vercel 项目**：
   - 登录 Vercel Dashboard
   - 点击 "New Project"
   - 导入管理面板代码仓库

2. **设置环境变量**：
   - 进入项目设置: Project → Settings → Environment Variables
   - 添加以下环境变量：
     ```
     NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     ```

3. **部署应用**：
   - Vercel 会自动检测并构建项目
   - 部署完成后获得专业域名

#### Netlify 部署配置步骤：

1. **创建 Netlify 项目**：
   - 登录 Netlify Dashboard
   - 点击 "New site from Git"
   - 连接代码仓库并选择管理面板目录

2. **设置环境变量**：
   - 进入站点设置: Site settings → Build & deploy → Environment
   - 添加以下环境变量：
     ```
     REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
     REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     ```

3. **部署应用**：
   - 配置构建设置: Build command: `npm run build`, Publish directory: `dist`
   - 触发部署

### 方案三：使用 Supabase Edge Function 作为代理（高级）

如果需要更高的安全性，可以创建一个 Edge Function 作为代理来处理敏感操作：

1. **创建 Edge Function**：
   ```bash
   supabase functions new admin-proxy
   ```

2. **在 Edge Function 中处理敏感操作**：
   ```javascript
   // supabase/functions/admin-proxy/index.js
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
   
   serve(async (req) => {
     const { action, data } = await req.json();
     
     // 使用服务角色密钥执行特权操作
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL'),
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
     );
     
     switch(action) {
       case 'get-sensitive-data':
         // 执行需要特权的操作
         break;
       default:
         return new Response('Invalid action', { status: 400 });
     }
   });
   ```

3. **设置 Edge Function 密钥**：
   ```bash
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **部署 Edge Function**：
   ```bash
   supabase functions deploy admin-proxy
   ```

## 安全最佳实践

### 1. 密钥管理
- ❌ 绝不在前端代码中暴露 `SUPABASE_SERVICE_ROLE_KEY`
- ✅ 仅在服务器端或 Edge Functions 中使用服务角色密钥
- ✅ 使用 Anon Key 用于前端公共访问

### 2. 环境变量保护
- ❌ 不要将 `.env` 文件提交到版本控制系统
- ✅ 在 `.gitignore` 中添加 `.env` 文件
- ✅ 使用平台提供的环境变量管理功能

### 3. 访问控制
- ✅ 为管理面板设置身份验证
- ✅ 限制对敏感操作的访问
- ✅ 定期轮换密钥

## 当前配置验证

### 已实现的配置：
1. ✅ Supabase URL 嵌入在管理面板代码中
2. ✅ Anon Key 嵌入在管理面板代码中
3. ✅ 允许用户通过浏览器界面自定义配置
4. ✅ 配置保存在 localStorage 中

### 建议的改进：
1. 🔄 迁移到 Vercel/Netlify 以获得更好的环境变量支持
2. 🔒 实现用户身份验证以保护管理面板
3. 🔄 定期轮换 Anon Key 以提高安全性

## 故障排除

### 常见问题：

1. **无法连接到数据库**：
   - 检查 Supabase URL 是否正确
   - 验证 Anon Key 是否有效
   - 确认网络连接正常

2. **环境变量未生效**：
   - 清除浏览器缓存和 localStorage
   - 重新设置环境变量
   - 检查管理面板代码中的环境变量读取逻辑

3. **管理面板无法访问**：
   - 确认 Supabase Storage 中的文件已正确上传
   - 验证存储桶已设置为公开访问
   - 检查 URL 是否正确

## 后续步骤建议

1. **短期**：继续使用当前的 localStorage 方案，确保功能正常
2. **中期**：考虑迁移到 Vercel 或 Netlify 以获得更好的环境变量支持
3. **长期**：实现完整的用户身份验证和授权机制
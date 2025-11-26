# Vercel 环境变量安全配置更新

## 重要安全提醒 ⚠️

根据您提供的环境变量信息，我们发现了一些**严重的安全隐患**：

1. **PostgreSQL连接字符串泄露** - 您的环境变量中包含了完整的PostgreSQL连接URL
2. **敏感密钥暴露** - 包含了不应该在前端代码中使用的数据库连接信息

## 正确的Vercel环境变量配置

### 应该设置的环境变量

```
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=J2nkgp0cGZYF8iHk
VITE_API_BASE_URL=https://154.221.19.68:8443/api
VITE_ADMIN_BASE_URL=https://154.221.19.68:8443/_
VITE_APP_SUPABASE_STORAGE_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
```

### 不应该设置的环境变量（安全风险）

以下环境变量**不应该**在Vercel中设置，因为它们包含敏感的PostgreSQL连接信息：

```
❌ VITE_APP_DB_POSTGRES_URL=postgres://...
❌ VITE_APP_DB_POSTGRES_PRISMA_URL=postgres://...
❌ VITE_APP_DB_POSTGRES_URL_NON_POOLING=postgres://...
```

## 为什么需要这样配置？

### 1. 安全考虑
- PostgreSQL连接字符串包含用户名和密码，不应该暴露给前端
- 前端代码可以被任何人查看，泄露这些信息会造成严重的安全风险

### 2. 正确的Supabase使用方式
- 前端应该只使用Supabase项目URL和anon key
- 项目URL格式：`https://[project-ref].supabase.co`
- anon key格式：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. API连接配置
- VITE_API_BASE_URL应该指向您的后端API地址
- 如果前后端部署在同一服务器，可以使用相对路径如`/api`

## 配置步骤

### 在Vercel Dashboard中更新环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. **删除**以下变量（如果存在）：
   - `VITE_APP_DB_POSTGRES_URL`
   - `VITE_APP_DB_POSTGRES_PRISMA_URL`
   - `VITE_APP_DB_POSTGRES_URL_NON_POOLING`
5. **添加或更新**以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_APP_DB_URL` | `https://kdlhyzsihflwkwumxzfw.supabase.co` | Production |
| `VITE_APP_DB_POSTGRES_PASSWORD` | `J2nkgp0cGZYF8iHk` | Production |
| `VITE_API_BASE_URL` | `https://154.221.19.68:8443/api` | Production |
| `VITE_ADMIN_BASE_URL` | `https://154.221.19.68:8443/_` | Production |
| `VITE_APP_SUPABASE_STORAGE_URL` | `https://kdlhyzsihflwkwumxzfw.supabase.co` | Production |

## 验证配置

配置更新后，您可以通过以下方式验证：

1. 重新部署项目
2. 打开应用并检查浏览器控制台是否有错误
3. 验证菜单数据是否能正常加载
4. 检查网络请求是否正确发送到配置的API地址

## 建议的安全措施

1. **立即轮换密钥**：
   - 登录Supabase控制台
   - 重新生成anon key
   - 使用新的密钥更新环境变量

2. **检查后端配置**：
   - 确保后端服务器已正确配置CORS策略
   - 验证SSL证书是否有效

3. **定期审查**：
   - 定期检查环境变量配置
   - 确保没有泄露敏感信息

通过以上配置，您的应用将更加安全，并且能够正确连接到Supabase和后端API服务。
# 环境变量配置指南

## 重要提示 ⚠️
敏感密钥已从代码库中移除。部署前需要配置以下环境变量。

## GitHub Secrets配置

为了保护敏感信息，项目使用GitHub Secrets来存储环境变量。

需要在GitHub仓库中配置以下Secrets:

```
VITE_APP_DB_URL=your_supabase_project_url
VITE_APP_DB_POSTGRES_PASSWORD=your_supabase_anon_key
VITE_APP_SUPABASE_STORAGE_URL=your_supabase_storage_url
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_SCOPE=your_vercel_scope
```

## 本地开发配置

1. 复制 `.env.example` 文件并重命名为 `.env.development`
```bash
cp .env.example .env.development
```

2. 填入您的 Supabase 项目信息：
```env
VITE_APP_DB_URL=https://your-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your_anon_key_here
```

## Vercel 部署配置

### 方式一：通过 Vercel Dashboard 配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_APP_DB_URL` | `https://kdlhyzsihflwkwumxzfw.supabase.co` | Production, Preview, Development |
| `VITE_APP_DB_POSTGRES_PASSWORD` | `your_supabase_anon_key` | Production, Preview, Development |

### 方式二：通过 Vercel CLI 配置

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add VITE_APP_DB_URL
vercel env add VITE_APP_DB_POSTGRES_PASSWORD

# 拉取环境变量到本地（开发时）
vercel env pull
```

## GitHub Actions 配置

如果使用 GitHub Actions 进行 CI/CD：

1. 进入 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 secrets：
   - `VITE_APP_DB_URL`
   - `VITE_APP_DB_POSTGRES_PASSWORD`

## 环境变量说明

### 必需变量

- **VITE_APP_DB_URL**: Supabase 项目 URL
  - 格式: `https://[project-ref].supabase.co`
  - 获取位置: Supabase Dashboard → Settings → API → Project URL

- **VITE_APP_DB_POSTGRES_PASSWORD**: Supabase anon key
  - 格式: `eyJhbGci...` (JWT token)
  - 获取位置: Supabase Dashboard → Settings → API → Project API keys → anon public

### 可选变量

- **VITE_API_BASE_URL**: API 基础路径 (默认: `/api`)
- **VITE_ADMIN_BASE_URL**: 管理端路径 (默认: `/_`)

## 安全注意事项 🔒

1. ❌ **绝对不要** 将 `.env.development` 或 `.env.production` 提交到 Git
2. ❌ **绝对不要** 在代码中硬编码敏感密钥
3. ❌ **绝对不要** 在前端环境变量中包含PostgreSQL连接字符串
4. ✅ **务必** 使用环境变量管理所有敏感信息
5. ✅ **定期** 轮换 API 密钥
6. ✅ 使用不同的密钥用于开发和生产环境
7. ✅ 前端只应使用Supabase项目URL和anon key，不应包含PostgreSQL连接信息

## 验证配置

运行以下命令验证环境变量是否正确配置：

```bash
npm run test-db
```

成功输出应显示数据库连接成功和表结构信息。

## 故障排除

### 问题：环境变量未生效

**解决方案：**
1. 确保文件名正确（`.env.development` 而不是 `.env`）
2. 重启开发服务器 `npm run dev`
3. 检查变量名是否以 `VITE_` 开头

### 问题：部署后无法连接数据库

**解决方案：**
1. 检查 Vercel 环境变量是否已正确设置
2. 确认 Supabase anon key 权限正确
3. 检查 Supabase 项目是否已暂停

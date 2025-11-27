# Vercel 部署配置指南

## 概述
本文档将指导您如何在 Vercel 平台上正确配置江西酒店中控系统的生产环境部署，确保与本地开发环境的一致性。

## 当前配置状态

### 本地开发环境配置
- API 基础地址: `http://localhost:8090/api`
- 管理端基础地址: `http://localhost:8090/_`

### Vercel 生产环境配置
需要在 Vercel 平台上设置以下环境变量以确保正确的 API 连接。

## Vercel 环境变量配置

### 必需的环境变量

1. **数据库配置**
   - `VITE_APP_DB_URL`: Supabase 项目 URL
   - `VITE_APP_DB_POSTGRES_PASSWORD`: Supabase anon key

2. **API 配置**
   - `VITE_API_BASE_URL`: API 基础地址（生产环境应设置为后端服务器地址）
   - `VITE_ADMIN_BASE_URL`: 管理端基础地址（生产环境应设置为后端管理界面地址）

3. **存储配置**
   - `VITE_APP_SUPABASE_STORAGE_URL`: Supabase 存储 URL（用于图片管理）

### 配置步骤

#### 方法一：通过 Vercel Dashboard 配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_APP_DB_URL` | `https://your-project.supabase.co` | Production |
| `VITE_APP_DB_POSTGRES_PASSWORD` | `your_supabase_anon_key` | Production |
| `VITE_API_BASE_URL` | `https://your-backend-domain.com/api` | Production |
| `VITE_ADMIN_BASE_URL` | `https://your-backend-domain.com/_` | Production |
| `VITE_APP_SUPABASE_STORAGE_URL` | `https://your-project.supabase.co` | Production |

#### 方法二：通过 Vercel CLI 配置

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add VITE_APP_DB_URL
vercel env add VITE_APP_DB_POSTGRES_PASSWORD
vercel env add VITE_API_BASE_URL
vercel env add VITE_ADMIN_BASE_URL
vercel env add VITE_APP_SUPABASE_STORAGE_URL

# 拉取环境变量到本地（开发时）
vercel env pull
```

## 生产环境配置示例

### 标准生产环境配置
```
VITE_APP_DB_URL=https://your-production-supabase-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your_production_supabase_anon_key
VITE_API_BASE_URL=https://your-production-backend.com/api
VITE_ADMIN_BASE_URL=https://your-production-backend.com/_
VITE_APP_SUPABASE_STORAGE_URL=https://your-production-supabase-project.supabase.co
```

### 如果使用相同的服务器托管前后端
```
VITE_APP_DB_URL=https://your-supabase-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your_supabase_anon_key
VITE_API_BASE_URL=/api
VITE_ADMIN_BASE_URL=/_ 
VITE_APP_SUPABASE_STORAGE_URL=https://your-supabase-project.supabase.co
```

## 常见问题和解决方案

### 1. API 连接失败
**问题**: 前端无法连接到后端 API
**解决方案**:
- 检查 `VITE_API_BASE_URL` 是否正确设置
- 确保后端服务器已正确部署并可访问
- 验证 CORS 配置是否允许前端域名访问

### 2. 数据库连接失败
**问题**: 无法连接到 Supabase 数据库
**解决方案**:
- 检查 `VITE_APP_DB_URL` 和 `VITE_APP_DB_POSTGRES_PASSWORD` 是否正确
- 确保 Supabase 项目已正确配置
- 验证网络连接和防火墙设置

### 3. 图片无法加载
**问题**: 菜品图片无法显示
**解决方案**:
- 检查 `VITE_APP_SUPABASE_STORAGE_URL` 是否正确设置
- 确保 Supabase 存储桶已正确配置并有适当的权限
- 验证图片 URL 格式是否正确

## 验证配置

### 本地验证
```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 生产环境验证
1. 部署到 Vercel 后访问应用
2. 打开浏览器开发者工具检查网络请求
3. 验证 API 请求是否正确发送到配置的地址
4. 检查控制台是否有错误信息

## 安全注意事项

1. **敏感信息保护**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理所有密钥和 URL
   - 定期轮换 API 密钥

2. **环境隔离**
   - 为开发、测试和生产环境使用不同的配置
   - 确保生产环境使用安全的 HTTPS 连接

3. **访问控制**
   - 配置适当的 CORS 策略
   - 限制对敏感 API 端点的访问

## 故障排除

### 检查环境变量是否正确加载
```javascript
// 在组件中添加以下代码检查环境变量
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('DB URL:', import.meta.env.VITE_APP_DB_URL);
```

### 网络请求调试
```javascript
// 在 api.ts 中添加更多日志信息
console.log('Making API request to:', url);
console.log('API Base URL:', API_BASE_URL);
```

通过正确配置 Vercel 环境变量，您可以确保生产环境与开发环境的一致性，避免因配置不同导致的问题。
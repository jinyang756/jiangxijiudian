# 环境配置最佳实践指南

本文档介绍了江西酒店菜单系统项目中环境配置的最佳实践。

## 环境文件结构

项目使用以下环境文件：

### `.env.example`
- **用途**：环境变量示例文件
- **版本控制**：✅ 提交到版本控制
- **内容**：包含所有必需环境变量的占位符，不包含真实凭据

### `.env`
- **用途**：本地开发环境变量
- **版本控制**：❌ 不提交到版本控制（被 `.gitignore` 忽略）
- **内容**：开发人员复制 `.env.example` 并替换为实际凭据

### `.env.development`
- **用途**：开发环境特定变量
- **版本控制**：❌ 不提交到版本控制（被 `.gitignore` 忽略）
- **内容**：开发环境特定的配置

### `.env.production`
- **用途**：生产环境特定变量
- **版本控制**：❌ 不提交到版本控制（被 `.gitignore` 忽略）
- **内容**：生产环境特定的配置

### `.env.local`
- **用途**：本地覆盖变量
- **版本控制**：❌ 不提交到版本控制（被 `.gitignore` 忽略）
- **内容**：本地机器特定的配置，优先级最高

## 环境变量优先级

环境变量的加载遵循以下优先级（从高到低）：

1. `.env.local` - 本地覆盖（如果存在）
2. `.env.${NODE_ENV}` - 特定环境文件（`.env.development`, `.env.production` 等）
3. `.env` - 默认环境文件

## 安全最佳实践

### 1. 凭据管理
- 永远不要在版本控制系统中提交包含真实凭据的环境文件
- 使用占位符值在 `.env.example` 中提供示例
- 定期轮换API密钥和访问令牌

### 2. 敏感信息处理
- 将敏感信息存储在 `.env.local` 文件中
- 确保 `.env.local` 被 `.gitignore` 正确忽略
- 避免在代码中硬编码凭据

### 3. 环境隔离
- 为不同环境使用不同的凭据
- 确保开发环境凭据不能访问生产数据
- 使用只读权限的凭据用于前端应用

## 配置示例

### `.env.example`
```env
# Supabase Configuration
VITE_APP_DB_URL=https://your-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your_supabase_anon_key
VITE_APP_SUPABASE_STORAGE_URL=https://your-project.supabase.co

# API Configuration (optional)
VITE_API_BASE_URL=/api
VITE_ADMIN_BASE_URL=/_
```

### `.env` (本地开发)
```env
# Supabase Configuration
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_SUPABASE_STORAGE_URL=https://kdlhyzsihflwkwumxzfw.supabase.co

# API Configuration (optional)
VITE_API_BASE_URL=/api
VITE_ADMIN_BASE_URL=/_
```

## 故障排除

### 常见问题

1. **环境变量未生效**
   - 确保在启动应用前设置环境变量
   - 检查文件名是否正确（`.env` 而不是 `env`）
   - 重启开发服务器以重新加载环境变量

2. **凭据错误**
   - 验证 Supabase URL 和 Anon Key 是否正确
   - 检查网络连接和防火墙设置
   - 确认 Supabase 项目配置正确

3. **权限问题**
   - 确保使用的凭据具有适当的权限
   - 检查 Supabase RLS（行级安全）策略
   - 验证数据库表和视图是否存在

### 验证配置

可以通过以下方式验证环境配置是否正确：

```bash
# 检查环境变量是否加载
npm run test:config

# 启动开发服务器并检查控制台输出
npm run dev
```

## 相关文档

- [生产环境部署指南](../../PRODUCTION_DEPLOYMENT_GUIDE.md)
- [数据库初始化指南](../database/COMPLETE_DATABASE_INITIALIZATION.md)
- [安全修复计划](reports/SECURITY_FIXES_PLAN.md)
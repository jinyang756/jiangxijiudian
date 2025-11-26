# 江西酒店中控系统部署说明

## 项目架构

### 前端部署
- **平台**: Vercel
- **源码**: GitHub仓库
- **域名**: jiangxijiudian.vercel.app
- **特性**: 全球CDN加速、自动HTTPS、自动部署

### 后端部署
- **服务器**: 154.221.19.68
- **服务**: Supabase (已替换PocketBase)
- **HTTP端口**: 8090
- **HTTPS端口**: 8443
- **证书**: Let's Encrypt SSL证书

## 开发日志

有关项目的完整开发历程和版本更新记录，请参考 [CHANGELOG.md](CHANGELOG.md)

## 部署状态

### 后端服务状态
- [x] Supabase服务已配置
- [x] SSL证书已配置
- [x] HTTPS服务正常运行
- [x] 数据库表结构已创建
- [x] CORS配置已完成

### 前端部署状态
- [x] 项目构建测试完成
- [x] API连接测试通过

## 部署计划

### 第一阶段：文档和清理
- [x] 创建项目自述文件
- [x] 清理根目录无关文件
- [x] 备份重要配置文件

### 第二阶段：前端部署
- [x] 将前端项目推送到GitHub
- [x] 从GitHub拉取项目
- [x] 项目构建测试
- [x] 配置环境变量
- [x] 更新GitHub仓库
- [x] 部署测试完成

详细部署计划请参考 [前端部署到Vercel计划.md](前端部署到Vercel计划.md)

### 第三阶段：后端优化
- [x] 完善CORS配置
- [x] 配置API访问规则
- [x] 测试前后端连接
- [x] 性能优化完成

### 第四阶段：安全加固
- [x] 配置防火墙规则
- [x] 设置API速率限制
- [x] 完善错误处理
- [x] 日志监控配置

### 第五阶段：移动端优化
- [x] 响应式布局优化
- [x] 触控交互优化
- [x] 屏幕适配测试
- [x] 性能调优完成

### 第六阶段：后端部署
- [x] Supabase服务配置
- [x] SSL证书配置
- [x] 前后端连接测试

### 第七阶段：后端服务检查
- [x] 服务状态检查
- [x] 配置文件验证
- [x] 连接测试完成

### 第八阶段：数据导入
- [x] 创建菜品数据导入脚本
- [ ] 导入示例菜品数据
- [ ] 验证数据导入结果

### 第九阶段：数据库设置
- [x] 创建数据库设置文档
- [ ] 创建数据库表结构
- [ ] 导入初始数据
- [ ] 验证数据完整性

## 重要配置信息

### 后端访问地址
- **管理面板**: https://154.221.19.68:8443/_/
- **API接口**: https://154.221.19.68:8443/api/
- **HTTP备用**: http://154.221.19.68:8090

### GitHub Secrets配置
为了保护敏感信息，项目使用GitHub Secrets来存储环境变量。

需要在GitHub仓库中配置以下Secrets:

```
VITE_APP_DB_URL=your_supabase_project_url
VITE_APP_DB_POSTGRES_PASSWORD=your_supabase_anon_key
VITE_APP_DB_POSTGRES_PRISMA_URL=your_postgres_prisma_url
VITE_APP_DB_POSTGRES_URL=your_postgres_url
VITE_APP_DB_POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
VITE_APP_SUPABASE_STORAGE_URL=your_supabase_storage_url
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_SCOPE=your_vercel_scope
```

### 环境变量
```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=https://154.221.19.68:8443/api
NEXT_PUBLIC_ADMIN_URL=https://154.221.19.68:8443/_

# Supabase环境变量
VITE_APP_DB_URL=postgres://postgres.kdlhyzsihflwkwumxzfw:J2nkgp0cGZYF8iHk@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
VITE_APP_DB_POSTGRES_PASSWORD=J2nkgp0cGZYF8iHk
```

## 维护命令

### 后端服务管理
```bash
# 查看服务状态
systemctl status pocketbase

# 重启服务
systemctl restart pocketbase

# 查看日志
journalctl -u pocketbase -f
```

### 证书更新
```bash
# 复制新证书
cp /etc/letsencrypt/live/jcstjj.top/fullchain.pem /opt/projects/jiangxijiudian/ssl/cert.pem
cp /etc/letsencrypt/live/jcstjj.top/privkey.pem /opt/projects/jiangxijiudian/ssl/key.pem

# 重启服务
systemctl restart pocketbase
```

### 数据库管理
```bash
# 初始化数据库（创建表结构并导入示例数据）
npm run init-db

# 导入菜品数据
npm run import-menu

# 测试数据库连接
npm run test-db
```

## 数据库设置
有关数据库设置和数据导入的详细说明，请参考以下文档：
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - 数据库表结构和数据导入
- [DATABASE_VIEW_SETUP.md](DATABASE_VIEW_SETUP.md) - **重要**: 数据库视图配置（部署前必读）
- [IMAGE_MANAGEMENT.md](IMAGE_MANAGEMENT.md) - 菜品图片上传和管理指南
- [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md) - 性能优化配置说明
- [ERROR_BOUNDARY_GUIDE.md](ERROR_BOUNDARY_GUIDE.md) - React 错误边界使用指南
- [NETWORK_DETECTION_GUIDE.md](NETWORK_DETECTION_GUIDE.md) - 网络检测系统使用指南
- [TYPESCRIPT_TYPE_SAFETY_GUIDE.md](TYPESCRIPT_TYPE_SAFETY_GUIDE.md) - TypeScript 类型安全最佳实践
- [ENV_SETUP.md](ENV_SETUP.md) - 环境变量配置指南
- [DATA_UPDATE_GUIDE.md](DATA_UPDATE_GUIDE.md) - 数据更新和修正指南
- [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 部署配置指南
- [VERCEL_ENV_UPDATE.md](VERCEL_ENV_UPDATE.md) - Vercel 环境变量安全配置更新
- [ENV_PLATFORM_GUIDE.md](ENV_PLATFORM_GUIDE.md) - 环境变量配置平台说明
- [VERCEL_SUPABASE_ARCH.md](VERCEL_SUPABASE_ARCH.md) - Vercel + Supabase 架构配置确认
- [SECURITY_ENV_UPDATE.md](SECURITY_ENV_UPDATE.md) - 环境变量安全配置更新说明
- [VERCEL_ENV_CONFIRM.md](VERCEL_ENV_CONFIRM.md) - Vercel 平台环境变量配置确认
- [ENV_SECURITY_PROTECTION.md](ENV_SECURITY_PROTECTION.md) - 环境变量文件安全保护说明
- [WORKFLOW_STATUS_CHECK.md](WORKFLOW_STATUS_CHECK.md) - GitHub Actions 工作流状态检查

### 快速验证
```bash
# 验证数据库视图是否已正确配置
npm run verify-views
```

## 联系信息
- **维护人员**: 技术支持团队
- **最后更新**: 2025年11月25日
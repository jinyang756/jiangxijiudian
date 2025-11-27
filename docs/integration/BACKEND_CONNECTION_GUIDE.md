# 前后端连接配置指南

## 概述

本文档详细说明了如何配置江西酒店中控系统的前后端连接，确保前端应用能够正确访问后端Supabase数据库。

## 配置要求

### 1. Supabase项目配置
- **项目URL**: `https://kdlhyzsihflwkwumxzfw.supabase.co`
- **Project Reference**: `kdlhyzsihflwkwumxzfw`
- **Anon Key**: 使用JWT格式的anon key（不是简单的字符串）

### 2. 环境变量配置

#### 开发环境 (.env.development)
```properties
# 数据库连接
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8

# 存储URL
VITE_APP_SUPABASE_STORAGE_URL=https://kdlhyzsihflwkwumxzfw.supabase.co

# VS Code MCP集成
# MCP现在通过VS Code扩展集成，无需在环境变量中配置
# 请参阅MCP_INTEGRATION_GUIDE.md了解详细信息

# API配置
VITE_API_BASE_URL=/api
VITE_ADMIN_BASE_URL=/_
```

#### 生产环境 (.env)
```properties
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkbGh5enNpaGZsd2t3dW14emZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjQxMjAsImV4cCI6MjA3NDAwMDEyMH0.wABs6L4Eiosksya2nUoO1i7doO7tYHcuz8WZA1kx6G8
```

## 数据库结构

### 主要表
1. **categories** - 菜品分类表
2. **dishes** - 菜品表
3. **orders** - 订单表
4. **service_requests** - 服务请求表

### 视图
1. **menu_view** - 菜单视图，聚合了分类和菜品信息，供前端API使用

## 连接验证

### 1. 测试数据库连接
```bash
npm run test-db
```

### 2. 查询测试
```bash
npm run test-db-query
```

### 3. 验证菜单视图
```bash
npm run verify-menu-view
```

## 常见问题及解决方案

### 1. "Invalid API key" 错误
**问题**: 数据库连接失败，显示"Invalid API key"错误
**解决方案**: 
- 确保使用JWT格式的anon key，而不是简单的字符串
- 检查环境变量是否正确配置
- 验证Supabase项目URL是否正确

### 2. 视图查询失败
**问题**: menu_view查询失败
**解决方案**:
- 确保menu_view视图已正确创建
- 在Supabase SQL编辑器中运行create-menu-view.sql脚本

### 3. 数据为空
**问题**: 查询成功但返回空数据
**解决方案**:
- 检查数据库表中是否有数据
- 运行数据导入脚本: `npm run import-menu`

## 安全注意事项

1. **密钥保护**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理密钥
   - 确保.env文件不被提交到版本控制系统

2. **生产环境**
   - 使用不同的密钥配置生产环境
   - 确保生产环境的安全设置

## 相关文档

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - 数据库设置详细说明
- [DATABASE_VIEW_SETUP.md](DATABASE_VIEW_SETUP.md) - 数据库视图配置
- [IMPORT_MENU_DATA.md](IMPORT_MENU_DATA.md) - 菜品数据导入指南
- [DATABASE_DEBUGGING_GUIDE.md](DATABASE_DEBUGGING_GUIDE.md) - 数据库调试指南

## 联系信息

如遇到前后端连接问题，请联系技术支持团队。
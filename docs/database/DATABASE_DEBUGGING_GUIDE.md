# 数据库管理与调试指南

## 概述

本文档介绍了如何直接访问和调试江西酒店项目的Supabase数据库。项目使用Supabase作为后端数据库服务，提供了多种方式进行数据库管理和调试。

## 数据库连接信息

- **Supabase URL**: `https://kdlhyzsihflwkwumxzfw.supabase.co`
- **Project Reference**: `kdlhyzsihflwkwumxzfw`
- **Anon Key**: `J2nkgp0cGZYF8iHk` (用于客户端访问)

## 数据库结构

### 主要表结构

1. **categories** - 菜品分类表
   - `id` (UUID): 分类唯一标识
   - `name` (TEXT): 分类名称
   - `name_norm` (TEXT): 标准化分类名称（用于唯一性约束）

2. **dishes** - 菜品表
   - `id` (UUID): 菜品唯一标识
   - `name` (TEXT): 菜品名称
   - `name_norm` (TEXT): 标准化菜品名称（用于唯一性约束）
   - `description` (TEXT): 菜品描述
   - `price` (NUMERIC): 价格
   - `category_id` (UUID): 关联的分类ID
   - `image_url` (TEXT): 图片URL
   - `is_available` (BOOLEAN): 是否可用

### 数据库视图

1. **menu_view** - 菜单视图
   - 聚合了分类和菜品信息，用于前端展示
   - 包含分类ID、分类名称和关联的菜品数组

## 调试方法

### 1. 命令行调试

#### 测试数据库连接
```bash
npm run test-db
```

#### 查询测试
```bash
npm run test-db-query
```

#### 使用自定义脚本
```bash
# PowerShell脚本
.\db-debug.ps1

# Bash脚本
./db-debug.sh
```

### 2. 浏览器调试

直接打开项目中的 `db-debug.html` 文件，使用图形界面进行以下操作：
- 测试数据库连接
- 查询Categories表数据
- 查询Dishes表数据
- 查询菜单视图数据

### 3. Node.js脚本调试

项目中包含多个可以直接运行的Node.js脚本：
- `test-db-query.js` - 数据库查询测试
- `scripts/check-database-structure.js` - 检查数据库结构
- `scripts/debug-menu-data.js` - 调试菜单数据

## 常见问题与解决方案

### 1. 连接失败
- 检查网络连接是否正常
- 验证Supabase URL和Anon Key是否正确
- 确认Supabase项目是否正常运行

### 2. 查询无数据
- 检查是否已导入初始数据
- 验证表结构是否正确创建
- 确认菜单视图是否已创建

### 3. 权限问题
- Supabase中检查RLS (Row Level Security) 设置
- 验证用户角色和权限配置

## 安全注意事项

1. **环境变量保护**
   - 不要在客户端代码中硬编码敏感信息
   - 使用环境变量管理密钥

2. **生产环境**
   - 确保调试工具仅在开发环境中可用
   - 生产环境中禁用调试接口

3. **数据操作**
   - 调试时避免修改生产数据
   - 重要操作前先备份数据

## 相关文档

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - 数据库设置详细说明
- [DATABASE_VIEW_SETUP.md](DATABASE_VIEW_SETUP.md) - 数据库视图配置
- [IMPORT_MENU_DATA.md](IMPORT_MENU_DATA.md) - 菜品数据导入指南
- [DATA_UPDATE_GUIDE.md](DATA_UPDATE_GUIDE.md) - 数据更新指南

## 联系信息

如遇到数据库相关问题，请联系技术支持团队。
# 完整数据导入指南

## 概述
本指南将帮助您使用完整的数据导入脚本，该脚本可以创建表结构并导入所有分类和菜品数据到 Supabase 数据库中。

## 准备工作

1. 确保您已经正确配置了环境变量：
   - `VITE_APP_DB_URL`：Supabase 项目 URL
   - `VITE_APP_DB_POSTGRES_PASSWORD`：Supabase anon key 或 service role key

2. 确保已经安装了项目依赖：
   ```bash
   npm install
   ```

## 使用方法

### 方法1：使用 npm 脚本（推荐）
```bash
npm run complete-import
```

### 方法2：直接使用 node 执行
```bash
node scripts/complete-data-import.js
```

## 脚本功能

### 1. 表结构创建
脚本包含创建以下表的 SQL 语句：
- `categories`：存储菜品分类
- `dishes`：存储具体菜品信息
- `orders`：存储订单信息
- `service_requests`：存储服务请求

注意：在 Supabase 中，表结构创建通常通过 SQL Editor 手动完成。

### 2. 数据导入
脚本将导入以下数据：

#### 分类
1. 开胃菜 (Appetizers)
2. 主菜 (Main Courses)
3. 汤类 (Soups)
4. 甜品 (Desserts)
5. 饮品 (Beverages)

#### 菜品
脚本将导入 12 道示例菜品，包括中英文名称、价格、辣味和素食标识等信息。

### 3. 数据验证
导入完成后，脚本会验证导入的数据是否正确。

## 故障排除

如果遇到问题，请检查以下几点：

1. **网络连接**：确保可以访问 Supabase 服务
2. **环境变量**：确保 `VITE_APP_DB_URL` 和 `VITE_APP_DB_POSTGRES_PASSWORD` 配置正确
3. **权限**：确保使用的 key 具有足够的权限执行数据库操作
4. **表结构**：确保数据库表已正确创建
5. **Supabase 配置**：确保 Supabase 项目已正确配置

## 注意事项

1. 该脚本使用 `upsert` 操作，如果数据已存在将会更新而不是报错
2. 脚本会自动处理分类和菜品之间的关联关系
3. 如果遇到权限问题，请使用具有足够权限的 service role key

## 相关命令

- `npm run init-db`：初始化数据库（创建表结构并导入示例数据）
- `npm run import-menu`：仅导入菜品数据
- `npm run test-db`：测试数据库连接
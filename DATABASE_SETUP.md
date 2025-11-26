# 数据库设置和数据导入指南

## 概述
本文档将指导您完成江西酒店中控系统的数据库设置和数据导入过程。系统使用Supabase作为后端数据库服务。

## 前置要求
1. 已创建Supabase项目
2. 已获取Supabase项目URL和anon key
3. 已正确配置环境变量

## 数据库设置步骤

### 1. 创建数据库表结构
首先，您需要在Supabase中创建必要的数据表。请按照以下步骤操作：

1. 登录到Supabase控制台
2. 选择您的项目
3. 进入"SQL Editor"
4. 运行以下SQL语句创建表：

```sql
-- 创建categories表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  sort INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建dishes表
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  dish_id TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price NUMERIC NOT NULL,
  is_spicy BOOLEAN DEFAULT FALSE,
  is_vegetarian BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建orders表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建service_requests表
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id TEXT NOT NULL,
  type TEXT NOT NULL,
  type_name TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 配置环境变量
确保您的环境变量已正确配置：

在 `.env.development` 和 `.env.production` 文件中添加：

```bash
VITE_APP_DB_URL=您的Supabase项目URL
VITE_APP_DB_POSTGRES_PASSWORD=您的Supabase anon key
```

### 3. 初始化数据库
运行数据库初始化脚本，该脚本将创建表结构并导入示例数据：

```bash
npm run init-db
```

或者直接执行脚本：

```bash
node scripts/init-database.js
```

### 4. 导入菜品数据
如果您只想导入菜品数据（假设表结构已存在）：

```bash
npm run import-menu
```

或者直接执行脚本：

```bash
node scripts/import-menu-data.js
```

### 5. 测试数据库连接
验证数据库连接是否正常：

```bash
npm run test-db
```

或者直接执行脚本：

```bash
node scripts/test-database-connection.js
```

## 脚本说明

### init-database.js
- 创建表结构（如果不存在）
- 导入示例分类和菜品数据
- 验证导入结果

### import-menu-data.js
- 仅导入菜品数据到已存在的表中
- 适用于更新或添加新的菜品数据

### test-database-connection.js
- 测试与Supabase数据库的连接
- 验证表结构是否正确
- 显示现有数据的统计信息

## 数据结构说明

### categories表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| key | TEXT | 分类键（唯一） |
| title_zh | TEXT | 中文标题 |
| title_en | TEXT | 英文标题 |
| sort | INTEGER | 排序 |
| created_at | TIMESTAMP | 创建时间 |

### dishes表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| category_id | UUID | 外键，关联categories表 |
| dish_id | TEXT | 菜品ID（唯一） |
| name_zh | TEXT | 中文名称 |
| name_en | TEXT | 英文名称 |
| price | NUMERIC | 价格 |
| is_spicy | BOOLEAN | 是否辣味 |
| is_vegetarian | BOOLEAN | 是否素食 |
| available | BOOLEAN | 是否可用 |
| image_url | TEXT | 图片URL |
| created_at | TIMESTAMP | 创建时间 |

## 故障排除

### 连接错误
如果出现连接错误，请检查：
1. 环境变量是否正确设置
2. Supabase项目URL和anon key是否正确
3. 网络连接是否正常

### 权限错误
如果出现权限错误，请检查：
1. Supabase项目中是否已启用匿名访问
2. 是否已正确配置RLS（行级安全策略）

### 数据导入错误
如果数据导入失败，请检查：
1. 表结构是否正确创建
2. 字段名称是否匹配
3. 数据类型是否正确

## 自定义数据

如果您想使用自己的菜品数据，可以修改以下文件：
1. `scripts/import-menu-data.js` - 修改categories和dishes数组
2. `scripts/init-database.js` - 修改categories和dishes数组

注意：
- 每个菜品必须关联一个分类（通过category_key字段）
- dish_id必须是唯一的
- 价格使用数值类型（如25.00）

## 后续步骤
1. 验证前端应用是否能正确显示菜品数据
2. 测试下单功能
3. 测试服务请求功能
4. 根据需要添加更多菜品数据
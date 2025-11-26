# SQL 脚本使用指南

## 概述
本指南将帮助您使用 SQL 脚本来创建数据库表结构并导入示例数据到 Supabase 数据库中。

## 文件说明

### 1. create-tables.sql
- **功能**：创建所有必要的数据库表结构和索引
- **包含**：表结构定义、索引创建、示例数据插入

### 2. insert-data.sql
- **功能**：仅插入示例数据到已存在的表中
- **包含**：分类和菜品数据的插入语句，使用 UPSERT 避免重复

## 使用方法

### 方法1：使用 Supabase SQL Editor（推荐）
1. 登录到 [Supabase 控制台](https://app.supabase.io/)
2. 选择您的项目
3. 进入 "SQL Editor" 部分
4. 复制并粘贴 SQL 脚本内容
5. 点击 "RUN" 执行脚本

### 方法2：使用 psql 命令行工具
```bash
# 连接到 Supabase 数据库
psql -h db.<your-project-ref>.supabase.co -p 5432 -d postgres -U <your-db-user>

# 执行 SQL 脚本
\i sql/create-tables.sql
```

### 方法3：使用 Supabase CLI
```bash
# 如果已安装 Supabase CLI
supabase db reset
supabase db push
```

## 脚本执行顺序

1. **create-tables.sql**：首先执行此脚本创建表结构
2. **insert-data.sql**：如果需要重新插入数据，可以单独执行此脚本

## 表结构说明

### categories 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键，自动生成 |
| key | TEXT | 分类键，唯一标识符 |
| title_zh | TEXT | 中文标题 |
| title_en | TEXT | 英文标题 |
| sort | INTEGER | 排序序号 |
| created_at | TIMESTAMP | 创建时间 |

### dishes 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键，自动生成 |
| category_id | UUID | 外键，关联 categories 表 |
| dish_id | TEXT | 菜品ID，唯一标识符 |
| name_zh | TEXT | 中文名称 |
| name_en | TEXT | 英文名称 |
| price | NUMERIC | 价格 |
| is_spicy | BOOLEAN | 是否辣味 |
| is_vegetarian | BOOLEAN | 是否素食 |
| available | BOOLEAN | 是否可用 |
| image_url | TEXT | 图片URL（可选） |
| created_at | TIMESTAMP | 创建时间 |

### orders 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键，自动生成 |
| table_id | TEXT | 桌号 |
| items_json | TEXT | 订单项JSON数据 |
| total_amount | NUMERIC | 总金额 |
| status | TEXT | 订单状态 |
| created_at | TIMESTAMP | 创建时间 |

### service_requests 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键，自动生成 |
| table_id | TEXT | 桌号 |
| type | TEXT | 服务类型 |
| type_name | TEXT | 服务类型名称 |
| details | TEXT | 详细信息 |
| status | TEXT | 请求状态 |
| created_at | TIMESTAMP | 创建时间 |

## 导入的数据

### 分类数据
1. 开胃菜 (Appetizers)
2. 主菜 (Main Courses)
3. 汤类 (Soups)
4. 甜品 (Desserts)
5. 饮品 (Beverages)

### 菜品数据
脚本将导入 12 道示例菜品，包括：
- 春卷 (Spring Rolls)
- 炸鸡翅 (Fried Chicken Wings)
- 宫保鸡丁 (Kung Pao Chicken)
- 麻婆豆腐 (Mapo Tofu)
- 红烧肉 (Braised Pork)
- 糖醋里脊 (Sweet and Sour Pork)
- 酸辣汤 (Hot and Sour Soup)
- 西红柿鸡蛋汤 (Tomato and Egg Soup)
- 红豆沙 (Red Bean Soup)
- 芒果布丁 (Mango Pudding)
- 绿茶 (Green Tea)
- 可乐 (Coca Cola)

## 注意事项

1. **外键约束**：dishes 表的 category_id 字段引用 categories 表的 id 字段
2. **唯一约束**：categories 表的 key 字段和 dishes 表的 dish_id 字段具有唯一约束
3. **级联删除**：当分类被删除时，关联的菜品也会被自动删除
4. **UPSERT 操作**：使用 ON CONFLICT 子句避免重复数据插入
5. **索引优化**：为常用查询字段创建了索引以提高性能

## 故障排除

如果遇到问题，请检查以下几点：

1. **权限问题**：确保使用的数据库用户具有创建表和插入数据的权限
2. **表已存在**：如果表已存在，脚本可能会报错，可以先删除现有表或修改脚本
3. **外键约束**：确保在插入菜品数据之前先插入分类数据
4. **连接问题**：确保可以正常连接到 Supabase 数据库
# 菜品数据导入指南

## 概述
本指南将帮助您将菜品数据导入到Supabase数据库中。我们已经创建了一个脚本，可以自动导入分类和菜品数据。

## 准备工作

1. 确保您已经正确配置了环境变量：
   - `VITE_APP_DB_URL`：Supabase项目URL
   - `VITE_APP_DB_POSTGRES_PASSWORD`：Supabase anon key

2. 确保已经创建了数据库表（如果您还没有创建）：
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
   ```

## 导入数据

### 方法1：使用npm脚本（推荐）
```bash
npm run import-menu
```

### 方法2：直接使用node执行
```bash
node scripts/import-menu-data.js
```

## 数据说明

脚本将导入以下数据：

### 分类
1. 开胃菜 (Appetizers)
2. 主菜 (Main Courses)
3. 汤类 (Soups)
4. 甜品 (Desserts)
5. 饮品 (Beverages)

### 菜品示例
- 春卷、炸鸡翅（开胃菜）
- 宫保鸡丁、麻婆豆腐、红烧肉、糖醋里脊（主菜）
- 酸辣汤、西红柿鸡蛋汤（汤类）
- 红豆沙、芒果布丁（甜品）
- 绿茶、可乐（饮品）

## 自定义数据

如果您想导入自己的菜品数据，可以修改 `scripts/import-menu-data.js` 文件中的以下部分：

1. `categories` 数组：修改分类数据
2. `dishes` 数组：修改菜品数据

注意：
- 每个菜品必须关联一个分类（通过 `category_key` 字段）
- `dish_id` 必须是唯一的
- 价格使用数值类型（如 25.00）

## 故障排除

如果导入失败，请检查：

1. 环境变量是否正确设置
2. 数据库连接是否正常
3. 是否已经创建了所需的表
4. Supabase项目是否有足够的权限

如有问题，请查看控制台输出的错误信息。
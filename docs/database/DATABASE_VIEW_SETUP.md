# 数据库视图部署指南

## ⚠️ 重要提示
应用依赖 `menu_view` 视图来加载菜单数据。首次部署前**必须**在Supabase中创建此视图，否则应用将降级使用本地静态数据。

## 📋 前置条件

1. 已创建Supabase项目
2. 已配置环境变量（参见 `ENV_SETUP.md`）
3. 已创建基础表结构：
   - `categories` 表
   - `dishes` 表

## 🚀 快速部署步骤

### 步骤1: 登录Supabase Dashboard

访问 [Supabase Dashboard](https://app.supabase.com/) 并选择您的项目

### 步骤2: 打开SQL编辑器

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New query** 创建新查询

### 步骤3: 执行视图创建脚本

复制以下SQL脚本并在SQL编辑器中执行：

```sql
-- =====================================================
-- 江西酒店菜单系统 - 数据库视图创建脚本
-- =====================================================
-- 版本: 1.0
-- 用途: 创建前端API所需的数据库视图
-- =====================================================

-- 1. 创建 dishes_with_category 视图
-- 用途: 包含分类信息的菜品视图，用于数据查询和调试
CREATE OR REPLACE VIEW dishes_with_category AS
SELECT 
    d.id,
    d.dish_id,
    d.name AS name_zh,
    d.en_title AS name_en,
    d.price,
    d.category_id,
    c.name AS category_name,
    d.created_at
FROM dishes d
JOIN categories c ON d.category_id = c.id
ORDER BY c.created_at, d.created_at;

-- 2. 创建 menu_view 视图 (核心视图)
-- 用途: 前端API查询菜单数据的主要视图
-- 格式: 返回分组后的菜单数据，items字段为JSON数组
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(
        json_agg(
            json_build_object(
                'id', d.dish_id,
                'zh', d.name,
                'en', d.en_title,
                'price', d.price,
                'spicy', COALESCE(d.spicy, FALSE),
                'vegetarian', COALESCE(d.vegetarian, FALSE),
                'available', COALESCE(d.available, TRUE),
                'imageUrl', d.image_url
            ) ORDER BY d.created_at
        ) FILTER (WHERE d.dish_id IS NOT NULL),
        '[]'::json
    ) AS items
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- 3. 设置视图权限
-- 允许匿名用户读取视图数据
GRANT SELECT ON menu_view TO anon;
GRANT SELECT ON dishes_with_category TO anon;

-- 4. 添加视图注释
COMMENT ON VIEW menu_view IS '前端菜单系统主视图 - 返回按分类分组的菜品数据';
COMMENT ON VIEW dishes_with_category IS '菜品详情视图 - 包含分类名称的菜品列表';
```

### 步骤4: 验证视图创建成功

在SQL编辑器中执行以下查询验证：

```sql
-- 检查 menu_view 是否返回数据
SELECT * FROM menu_view LIMIT 5;

-- 检查视图是否存在
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('menu_view', 'dishes_with_category');
```

预期结果：
- `menu_view` 应返回包含 `category_id`, `category_name`, `items` 的数据
- 第二个查询应返回2行，显示两个视图都存在

### 步骤5: 测试API连接

使用项目提供的测试脚本验证连接：

```bash
npm run test-db
```

或者手动测试：

```bash
node scripts/test-menu-view.js
```

## 📊 视图结构说明

### menu_view 视图

这是前端API使用的主要视图，返回格式如下：

```json
[
  {
    "category_id": "uuid",
    "category_name": "江湖小炒",
    "items": [
      {
        "id": "H1",
        "zh": "水煮牛肉",
        "en": "Boiled Beef in Spicy Broth",
        "price": 48,
        "spicy": true,
        "vegetarian": false,
        "available": true,
        "imageUrl": null
      }
    ]
  }
]
```

### dishes_with_category 视图

辅助视图，用于数据查询和调试：

```json
{
  "id": "uuid",
  "dish_id": "H1",
  "name_zh": "水煮牛肉",
  "name_en": "Boiled Beef in Spicy Broth",
  "price": 48,
  "category_id": "uuid",
  "category_name": "江湖小炒",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔍 故障排除

### 问题1: 视图创建失败 - 表不存在

**错误信息:**
```
relation "categories" does not exist
relation "dishes" does not exist
```

**解决方案:**
1. 确保已创建基础表结构
2. 执行表创建脚本：`sql/create-tables.sql`
3. 或运行初始化脚本：`npm run init-db`

### 问题2: 权限错误

**错误信息:**
```
permission denied for view menu_view
```

**解决方案:**
确保执行了权限设置SQL：
```sql
GRANT SELECT ON menu_view TO anon;
GRANT SELECT ON dishes_with_category TO anon;
```

### 问题3: 前端显示本地数据而非实时数据

**症状:**
- 应用可以访问，但菜单数据是硬编码的本地数据
- 浏览器控制台显示：`[API] Connection to Supabase failed. Using local fallback data.`

**解决方案:**
1. 检查视图是否已创建（参见步骤4）
2. 检查环境变量配置是否正确
3. 检查Supabase项目是否处于活动状态
4. 检查网络连接

### 问题4: items字段为空数组

**症状:**
`menu_view` 返回数据，但 `items` 字段全部为空 `[]`

**解决方案:**
1. 检查 `dishes` 表是否有数据：
   ```sql
   SELECT COUNT(*) FROM dishes;
   ```
2. 检查外键关联是否正确：
   ```sql
   SELECT d.*, c.name 
   FROM dishes d 
   LEFT JOIN categories c ON d.category_id = c.id 
   WHERE c.id IS NULL;
   ```
3. 如无数据，导入示例数据：`npm run import-menu`

## 🔄 视图更新和维护

### 更新视图定义

如果需要修改视图结构，使用 `CREATE OR REPLACE VIEW`：

```sql
CREATE OR REPLACE VIEW menu_view AS
SELECT 
    -- 新的字段定义
    ...
FROM categories c
LEFT JOIN dishes d ON c.id = d.category_id
GROUP BY c.id, c.name;
```

### 删除视图

如需删除并重建：

```sql
DROP VIEW IF EXISTS menu_view CASCADE;
DROP VIEW IF EXISTS dishes_with_category CASCADE;
```

## 📝 视图依赖检查清单

部署前检查：

- [ ] Supabase项目已创建
- [ ] 环境变量已配置（`VITE_APP_DB_URL`, `VITE_APP_DB_POSTGRES_PASSWORD`）
- [ ] `categories` 表已创建
- [ ] `dishes` 表已创建
- [ ] 表中已有示例数据
- [ ] `menu_view` 视图已创建
- [ ] `dishes_with_category` 视图已创建
- [ ] 视图权限已设置（anon用户可读）
- [ ] 已验证视图返回正确数据
- [ ] 已测试前端API连接

## 🚀 自动化部署（可选）

对于CI/CD流程，可以创建数据库迁移脚本：

1. 将 `scripts/create-views.sql` 添加到迁移流程
2. 在部署脚本中自动执行
3. 使用Supabase CLI进行版本控制

```bash
# 安装Supabase CLI
npm install -g supabase

# 初始化
supabase init

# 创建迁移
supabase migration new create_menu_views

# 应用迁移
supabase db push
```

## 📞 需要帮助？

如遇到问题：
1. 查看 `DATABASE_SETUP.md` 了解完整数据库配置
2. 查看 `ENV_SETUP.md` 了解环境变量配置
3. 运行 `npm run test-db` 进行诊断
4. 检查Supabase Dashboard中的日志

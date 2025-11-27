# 数据库初始化和数据导入指南

本文档说明如何初始化江西酒店菜单系统的数据库并导入菜单数据。

## 初始化数据库

### 方法1：使用完整SQL脚本初始化（推荐）

```bash
# 运行完整初始化脚本
npm run init-db-complete
```

这个脚本会：
1. 创建所有必要的表（categories, dishes, orders, service_requests）
2. 插入所有分类和菜品数据
3. 创建menu_view视图

### 方法2：分步初始化

```bash
# 1. 初始化数据库表结构
npm run init-db

# 2. 导入菜单数据
npm run import-menu-csv
```

## 验证数据库

```bash
# 验证menu_view视图是否正确创建
npm run verify-menu-view

# 测试数据库连接
npm run test-db

# 测试数据库查询
npm run test-db-query
```

## 数据库结构

### categories表
- id: UUID主键
- key: 分类唯一标识符
- title_zh: 中文分类名称
- title_en: 英文分类名称
- sort: 排序字段
- created_at: 创建时间

### dishes表
- id: UUID主键
- category_id: 外键，关联categories表
- dish_id: 菜品唯一标识符
- name_zh: 中文菜品名称
- name_en: 英文菜品名称
- price: 价格
- is_spicy: 是否辣
- is_vegetarian: 是否素食
- available: 是否可用
- image_url: 图片URL
- created_at: 创建时间

### menu_view视图
这是应用程序使用的视图，将分类和菜品数据组合在一起：
- category_id: 分类ID
- category_name: 分类名称
- items: 该分类下的所有菜品，以JSON数组形式存储

## 环境变量配置

确保在环境变量中设置以下配置：

```bash
VITE_APP_DB_URL=你的Supabase项目URL
VITE_APP_DB_POSTGRES_PASSWORD=你的Supabase项目anon key
```

## 常见问题

### 1. 如果导入数据时出现错误
- 检查环境变量是否正确设置
- 确保Supabase项目中已创建相应的表
- 验证网络连接是否正常

### 2. 如果menu_view视图未正确创建
- 运行 `npm run verify-menu-view` 检查视图状态
- 手动在Supabase SQL编辑器中运行create-menu-view.sql脚本

### 3. 如果菜品图片不显示
- 确保image_url字段包含正确的图片URL
- 检查图片文件是否可访问
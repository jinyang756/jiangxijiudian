# 数据更新和修正指南

## 概述
本文档将指导您如何更新和修正江西酒店中控系统中的数据。系统支持多种数据更新方式，包括通过脚本批量导入和通过API接口单独更新。

## 数据结构

### categories表（分类表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键（自动生成） |
| key | TEXT | 分类键（唯一标识） |
| title_zh | TEXT | 中文标题 |
| title_en | TEXT | 英文标题 |
| sort | INTEGER | 排序 |
| created_at | TIMESTAMP | 创建时间 |

### dishes表（菜品表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键（自动生成） |
| category_id | UUID | 外键，关联categories表 |
| dish_id | TEXT | 菜品ID（唯一标识） |
| name_zh | TEXT | 中文名称 |
| name_en | TEXT | 英文名称 |
| price | NUMERIC | 价格 |
| is_spicy | BOOLEAN | 是否辣味 |
| is_vegetarian | BOOLEAN | 是否素食 |
| available | BOOLEAN | 是否可用 |
| image_url | TEXT | 图片URL |
| created_at | TIMESTAMP | 创建时间 |

## 数据更新方式

### 1. 通过脚本批量更新

#### 更新所有数据（推荐用于初始化或大规模更新）
```bash
# 运行完整的数据导入脚本
npm run import-menu
```

此命令会执行 `scripts/import-menu-data.js` 脚本，该脚本会：
1. 更新或插入分类数据
2. 更新或插入菜品数据

#### 自定义数据更新
如果您需要更新特定数据，可以修改 `scripts/import-menu-data.js` 文件：

1. 打开 `scripts/import-menu-data.js`
2. 修改 `categories` 数组中的分类数据
3. 修改 `dishes` 数组中的菜品数据
4. 运行命令：
```bash
npm run import-menu
```

### 2. 通过API单独更新

#### 更新单个菜品
```javascript
import { updateRecord } from './src/lib/api';

// 更新菜品价格
await updateRecord('dishes', '菜品ID', {
  price: 55.00
});

// 更新菜品可用性
await updateRecord('dishes', '菜品ID', {
  available: false
});

// 更新菜品名称
await updateRecord('dishes', '菜品ID', {
  name_zh: '新中文名称',
  name_en: 'New English Name'
});
```

#### 更新单个分类
```javascript
import { updateRecord } from './src/lib/api';

// 更新分类标题
await updateRecord('categories', '分类ID', {
  title_zh: '新中文标题',
  title_en: 'New English Title'
});
```

## 常见数据更新场景

### 1. 修改菜品价格
```javascript
// 在scripts/import-menu-data.js中找到对应的菜品，修改price字段
{ dish_id: 'M001', name_zh: '宫保鸡丁', name_en: 'Kung Pao Chicken', price: 55.00, is_spicy: true, is_vegetarian: false, available: true, category_key: 'main_courses' }
```

### 2. 添加新菜品
```javascript
// 在scripts/import-menu-data.js的dishes数组中添加新菜品
{ dish_id: 'M005', name_zh: '新菜品', name_en: 'New Dish', price: 68.00, is_spicy: false, is_vegetarian: false, available: true, category_key: 'main_courses' }
```

### 3. 修改菜品可用性
```javascript
// 在scripts/import-menu-data.js中找到对应的菜品，修改available字段
{ dish_id: 'M001', name_zh: '宫保鸡丁', name_en: 'Kung Pao Chicken', price: 48.00, is_spicy: true, is_vegetarian: false, available: false, category_key: 'main_courses' }
```

### 4. 添加新分类
```javascript
// 在scripts/import-menu-data.js的categories数组中添加新分类
{ key: 'specials', title_zh: '特色菜', title_en: 'Specials', sort: 6 }
```

## 数据验证

### 验证数据更新结果
运行以下命令验证数据是否正确更新：

```bash
# 测试数据库连接和数据查询
npm run test-db
```

### 检查特定菜品
```javascript
// 创建一个简单的脚本来检查特定菜品
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_APP_DB_URL;
const supabaseKey = process.env.VITE_APP_DB_POSTGRES_PASSWORD;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDish(dishId) {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('dish_id', dishId)
    .single();
    
  if (error) {
    console.error('查询出错:', error);
  } else {
    console.log('菜品信息:', data);
  }
}

// 使用示例
checkDish('M001');
```

## 注意事项

1. **唯一性约束**：
   - `categories.key` 必须唯一
   - `dishes.dish_id` 必须唯一

2. **外键关联**：
   - `dishes.category_id` 必须关联到存在的分类

3. **数据类型**：
   - 价格使用 `NUMERIC` 类型（如 25.00）
   - 布尔值使用 `BOOLEAN` 类型（true/false）

4. **批量更新**：
   - 使用 `upsert` 操作，会自动处理插入和更新

5. **备份建议**：
   - 在大规模数据更新前，建议先导出当前数据作为备份

## 故障排除

### 数据未更新
1. 检查脚本是否正确执行
2. 验证环境变量是否正确设置
3. 检查控制台是否有错误信息

### 唯一性冲突
1. 确保 `dish_id` 和 `key` 字段值唯一
2. 如果需要替换数据，可以先删除再插入

### 外键错误
1. 确保分类数据已存在
2. 检查 `category_key` 是否与分类的 `key` 字段匹配

通过以上方法，您可以灵活地更新和修正系统中的数据，满足不同的业务需求。
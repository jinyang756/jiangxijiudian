# 数据库优化说明

本文档说明了对江西酒店菜单系统数据库结构的优化工作。

## 优化内容

### 1. 清理冗余文件
删除了以下不必要的SQL文件：
- `create-tables.sql` - 包含不正确的分类数据
- `insert-data.sql` - 包含不正确的菜品数据
- `complete-init.sql` - 文件过大且冗余
- `init-tables-only.sql` - 功能被优化版本替代

### 2. 创建优化脚本
创建了新的优化初始化脚本：
- `optimized-init.sql` - 包含表结构定义和江西酒店实际菜单数据

### 3. 更新脚本命令
在 `package.json` 中更新了数据库初始化命令：
- 删除了 `init-db-tables` 和 `init-db-complete`
- 添加了 `init-db-optimized` 命令

## 数据库结构

### 表结构
1. **categories** - 菜单分类表
2. **dishes** - 菜品表
3. **orders** - 订单表
4. **service_requests** - 服务请求表

### 江西酒店实际菜单分类
1. 江湖小炒 (Jianghu Stir-Fries)
2. 炖汤类 (Simmered Soups)
3. 卤料 (Braised Delicacies)
4. 粤菜 (Cantonese Cuisine)
5. 酒水/其他 (Beverages & Others)

## 使用方法

### 初始化数据库
```bash
# 使用优化脚本初始化数据库
npm run init-db-optimized
```

### 验证数据库
```bash
# 验证menu_view视图是否正确创建
npm run verify-menu-view

# 测试数据库连接
npm run test-db

# 测试数据库查询
npm run test-db-query
```

## 优化优势

1. **数据一致性** - 使用江西酒店实际菜单数据，确保前后端数据一致
2. **文件精简** - 删除冗余文件，保持项目结构清晰
3. **性能优化** - 合理的索引设计，提高查询性能
4. **易于维护** - 单一优化脚本，便于维护和部署

## 注意事项

1. 执行初始化脚本前请确保数据库连接配置正确
2. 脚本使用 UPSERT 操作，可安全重复执行
3. 如需重置数据，请先清空相关表再执行脚本
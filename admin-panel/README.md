# 江西酒店管理面板

这是一个用于管理江西酒店菜单系统数据库和内容的可视化管理面板。

## 目录结构

```
admin-panel/
├── index.html          # 主管理面板页面
├── src/
│   ├── components/     # 可复用的UI组件
│   ├── pages/          # 各个管理页面
│   │   └── menu-management.html  # 菜单管理页面
│   └── services/       # 数据库和服务相关代码
│       └── database.js # 数据库管理服务
└── README.md           # 本说明文件

## 功能特性

1. **仪表板** - 系统概览和统计信息
2. **菜单管理** - 添加、编辑、删除菜品
3. **分类管理** - 管理菜单分类
4. **订单管理** - 查看和处理订单
5. **服务请求** - 处理客户服务请求
6. **标签化订单** - 管理带标签的特殊订单
7. **数据库管理** - 数据库维护和管理

## 使用方法

1. 将admin-panel目录部署到Web服务器
2. 确保环境变量已正确配置：
   ```
   VITE_APP_DB_URL=你的Supabase项目URL
   VITE_APP_DB_POSTGRES_PASSWORD=你的Supabase项目anon key (JWT格式)
   ```
3. 通过浏览器访问管理面板

## 环境变量配置

管理面板支持多种环境变量配置方式，具体取决于部署平台：

### 1. Supabase Storage 部署（当前方式）
由于 Supabase Storage 静态主机不支持环境变量，我们提供了以下解决方案：
- 默认配置已嵌入在管理面板代码中
- 用户可通过 `set-env.html` 页面自定义配置
- 配置保存在浏览器的 localStorage 中

### 2. Vercel/Netlify 部署（推荐）
如果迁移到支持环境变量的平台，请使用以下配置：
```
# Vercel
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Netlify
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 本地开发
在本地开发时，可创建 `.env` 文件：
```
VITE_APP_DB_URL=https://your-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your-anon-key
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

### orders表
- id: UUID主键
- table_id: 桌号
- items_json: 订单项JSON
- total_amount: 总金额
- status: 状态
- created_at: 创建时间

### service_requests表
- id: UUID主键
- table_id: 桌号
- type: 服务类型
- type_name: 服务类型名称
- details: 详细信息
- status: 状态
- created_at: 创建时间

### tagged_orders表
- id: UUID主键
- table_id: 桌号
- tag: 标签
- items_json: 订单项JSON
- total_amount: 总金额
- status: 状态 (pending, printed, completed)
- created_at: 创建时间

## 开发说明

1. 管理面板使用纯HTML、CSS和JavaScript构建，无需编译步骤
2. 数据库操作通过Supabase JavaScript客户端完成
3. 所有页面都是独立的HTML文件，可以直接在浏览器中打开
4. 样式使用Tailwind CSS框架

## 注意事项

1. 确保Supabase项目已正确配置并可访问
2. 确保所有必要的表和视图已在数据库中创建
3. 管理面板应该部署在安全的环境中，避免公开访问
4. 环境变量中的anon key必须是JWT格式的完整token

## 更新日志

### v1.1.0 (2025-11-27)
- 新增标签化订单管理功能
- 支持生成带标签的二维码
- 添加标签化订单打印功能

### v1.0.0 (2025-11-27)
- 完善了数据库连接配置说明
- 更新了环境变量配置要求
- 优化了管理面板UI界面
- 增加了订单管理功能
- 改进了服务请求处理流程

### v0.9.0 (2025-11-25)
- 实现了基本的菜单管理功能
- 添加了分类管理模块
- 完成了数据库管理基础功能
- 优化了响应式布局

## 故障排除

### 连接问题
如果管理面板无法连接到Supabase数据库：
1. 检查环境变量是否正确配置
2. 验证Supabase项目URL和anon key是否正确
3. 确认网络连接正常
4. 检查Supabase项目是否处于活动状态

### 数据显示问题
如果数据无法正常显示：
1. 检查数据库表结构是否正确创建
2. 验证数据库视图是否已创建
3. 确认数据是否已正确导入
4. 检查API权限设置

## 安全建议

1. 不要在客户端代码中暴露敏感信息
2. 使用HTTPS协议保护数据传输
3. 定期更新Supabase anon key
4. 限制管理面板的访问权限
5. 启用Supabase行级安全策略

## 相关文档

有关更多详细信息，请参阅项目根目录下的文档：
- [数据库设置指南](../docs/database/DATABASE_SETUP.md)
- [部署配置说明](../docs/deployment/ENV_SETUP.md)
- [Supabase集成指南](../docs/integration/MCP_INTEGRATION_GUIDE.md)
- [环境变量配置指南](./ENVIRONMENT_CONFIG.md)
# 开发指南

本指南为江西酒店菜单系统的开发人员提供详细的开发流程、规范和最佳实践。

## 目录结构

```
江西酒店/
├── admin-panel/           # 后台管理面板
├── docs/                  # 文档目录
│   ├── database/          # 数据库相关文档
│   └── development/       # 开发相关文档
├── scripts/               # 自动化脚本
├── services/              # API服务
├── sql/                   # 数据库脚本
├── src/                   # 前端源代码
│   ├── components/        # React组件
│   ├── constants/         # 常量定义
│   ├── lib/               # 工具库
│   ├── styles/            # 样式文件
│   └── types/             # TypeScript类型定义
├── .env                   # 环境变量配置
├── .env.example           # 环境变量示例
├── .gitignore             # Git忽略文件
├── package.json           # 项目依赖和脚本
└── README.md              # 项目说明
```

## 开发环境搭建

### 1. 克隆项目
```bash
git clone <repository-url>
cd 江西酒店
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制 `.env.example` 文件为 `.env` 并填写正确的 Supabase 凭据：
```bash
cp .env.example .env
```

### 4. 启动开发服务器
```bash
npm run dev
```

## 数据库开发

### 数据库表结构
- `categories`: 菜品分类表
- `dishes`: 菜品表
- `orders`: 订单表
- `service_requests`: 服务请求表

### 数据库视图
- `menu_view`: 菜单视图，用于前端展示分类和菜品的嵌套结构

### 数据库脚本
所有数据库相关的SQL脚本都位于 `sql/` 目录下：
- `complete-database-init.sql`: 完整数据库初始化脚本
- `create-menu-view.sql`: 创建菜单视图脚本
- `index-optimization.sql`: 索引优化脚本
- `update-policies.sql`: 更新RLS策略脚本
- `enhanced-security-policies.sql`: 增强安全策略脚本

## 前端开发

### 技术栈
- React 18
- TypeScript
- Tailwind CSS
- Vite

### 组件结构
主要组件位于 `src/components/` 目录下：
- `App.tsx`: 主应用组件
- `Header.tsx`: 页面头部组件
- `MenuSection.tsx`: 菜单展示组件
- `CartItem.tsx`: 购物车项目组件
- `CartModal.tsx`: 购物车模态框组件
- `ServiceModal.tsx`: 服务请求模态框组件

### 状态管理
使用 React Hooks 进行状态管理：
- `useState`: 组件状态
- `useEffect`: 副作用处理
- `useMemo`: 记忆化计算
- `useRef`: 引用DOM元素或保存可变值

### API服务
API服务封装在 `services/api.ts` 文件中，提供以下方法：
- `getMenu()`: 获取菜单数据
- `submitOrder()`: 提交订单
- `callService()`: 发起服务请求

## 测试

### 单元测试
使用 Vitest 进行单元测试：
```bash
npm run test
```

### 配置测试
```bash
npm run test:config
```

### 数据库连接测试
```bash
npm run test:db
```

## 部署

### 构建项目
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

### 生产环境部署
参考 [PRODUCTION_DEPLOYMENT_GUIDE.md](../../PRODUCTION_DEPLOYMENT_GUIDE.md) 进行部署。

## 代码规范

### TypeScript规范
- 使用严格类型检查
- 避免使用 `any` 类型
- 为所有函数参数和返回值定义类型

### 命名规范
- 组件文件使用 PascalCase 命名
- 组件名称与文件名一致
- 变量和函数使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名

### 注释规范
- 为所有公共函数添加 JSDoc 注释
- 为复杂逻辑添加行内注释
- 为组件添加描述性注释

## 最佳实践

### 性能优化
1. 使用 `React.memo` 优化组件渲染
2. 使用 `useMemo` 和 `useCallback` 优化计算和回调函数
3. 懒加载非关键组件
4. 图片压缩和CDN加速

### 安全性
1. 不在代码中硬编码敏感信息
2. 使用环境变量管理配置
3. 实施适当的输入验证
4. 启用HTTPS

### 可维护性
1. 保持函数单一职责
2. 使用有意义的变量名
3. 避免深层嵌套
4. 定期重构代码

## 故障排除

### 常见问题

1. **TypeScript编译错误**
   - 检查类型定义是否正确
   - 确保所有必需的属性都有定义

2. **数据库连接问题**
   - 验证环境变量配置
   - 检查网络连接
   - 确认数据库服务是否正常运行

3. **组件不渲染**
   - 检查组件导入路径
   - 验证组件状态和属性
   - 查看浏览器控制台错误信息

4. **样式问题**
   - 检查Tailwind CSS类名拼写
   - 确认样式文件是否正确导入
   - 验证响应式设计断点

### 调试技巧
1. 使用浏览器开发者工具检查组件层次结构
2. 使用 `console.log` 输出调试信息
3. 使用 React DevTools 检查组件状态
4. 检查网络面板查看API请求和响应

## 贡献指南

### 提交代码
1. 创建功能分支
2. 编写清晰的提交信息
3. 确保通过所有测试
4. 发起Pull Request

### 代码审查
1. 至少一人审查后方可合并
2. 确保代码符合规范
3. 验证功能实现正确性
4. 检查潜在的安全问题

## 相关文档

- [环境配置最佳实践](ENVIRONMENT_CONFIGURATION_GUIDE.md)
- [数据库维护指南](../../database/DATABASE_MAINTENANCE_GUIDE.md)
- [生产环境部署指南](../../PRODUCTION_DEPLOYMENT_GUIDE.md)
- [API文档](API_DOCUMENTATION.md) *(待创建)*
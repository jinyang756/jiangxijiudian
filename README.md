# 江西酒店菜单系统

## 项目概述

江西酒店菜单系统是一个现代化的餐厅点餐应用，专为江西大酒店四楼会所设计。该系统提供多语言界面（中文/菲律宾语），响应式设计适配移动设备，支持桌位号识别、菜品搜索、购物车管理等功能。

## 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **状态管理**: React Hooks
- **打包优化**: 
  - Gzip/Brotli双重压缩
  - 代码分割和资源优化
  - 构建分析工具集成

### 后端技术栈
- **数据库**: Supabase (PostgreSQL)
- **API**: Supabase JavaScript客户端
- **部署平台**: Vercel (前端), Supabase (后端)

### 核心功能模块
1. **菜单浏览**: 分类展示菜品，支持左右滑动切换分类
2. **菜品搜索**: 支持按菜名或拼音搜索
3. **购物车系统**: 添加/删除菜品，数量管理
4. **服务呼叫**: 呼叫服务员、加水、结账等服务
5. **订单管理**: 提交订单，查看订单状态
6. **关于我们**: 酒店信息展示

## 项目结构

```
├── src/                    # 主应用源码
│   ├── components/         # UI组件
│   ├── services/           # API服务层
│   ├── lib/                # 工具库
│   ├── utils/              # 工具函数
│   ├── config/             # 配置文件
│   ├── types/              # TypeScript类型定义
│   ├── constants/          # 常量数据
│   ├── index.css           # 全局样式
│   └── vite-env.d.ts       # TypeScript环境声明
├── components/             # 可复用UI组件
├── services/               # API服务层
├── admin-panel/            # 管理面板
├── sql/                    # 数据库脚本
├── scripts/                # 工具脚本
│   ├── test/               # 测试脚本
│   ├── db/                 # 数据库脚本
│   ├── deploy/             # 部署脚本
│   └── debug/              # 调试工具
├── public/                 # 静态资源
├── assets/                 # 资源文件
│   ├── images/             # 图片资源
│   └── data/               # 数据文件
├── docs/                   # 项目文档
│   ├── database/           # 数据库相关文档
│   ├── deployment/         # 部署相关文档
│   ├── development/        # 开发相关文档
│   ├── features/           # 功能特性文档
│   └── integration/        # 集成相关文档
├── App.tsx                 # 主应用组件
├── index.tsx               # 应用入口
├── index.html              # HTML入口
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind配置
└── vercel.json             # Vercel部署配置
```

## 开发环境配置

### 环境变量配置
创建 `.env` 文件并配置以下变量：

```bash
# Supabase配置
VITE_APP_DB_URL=https://your-project.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=your-anon-key-jwt-token
```

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 文档目录说明

项目文档已按功能模块组织在 `docs/` 目录下：

- **database/** - 数据库相关文档，包括设置、初始化、优化和调试指南
- **deployment/** - 部署相关文档，涵盖环境配置、Vercel部署和安全设置
- **development/** - 开发相关文档，包括错误处理、性能优化和类型安全指南
- **features/** - 功能特性文档，如菜单数据导入等
- **integration/** - 集成相关文档，如MCP集成和后端连接配置

## 数据库设置

### 表结构
1. **categories**: 菜单分类
2. **dishes**: 菜品信息
3. **orders**: 订单记录
4. **service_requests**: 服务请求

### 数据库视图
- `menu_view`: 前端API查询菜单数据的主要视图
- `dishes_with_category`: 包含分类信息的菜品视图

### 初始化数据库
```bash
# 创建表结构并导入示例数据
npm run init-db

# 或使用优化的SQL脚本
npm run init-db-optimized
```

### 导入菜单数据
```bash
# 从CSV文件导入菜单数据
npm run import-menu-csv
```

## 部署配置

### Vercel部署
1. 将代码推送到GitHub仓库
2. 在Vercel中连接GitHub仓库
3. 配置环境变量
4. 触发部署

### Supabase配置
1. 创建Supabase项目
2. 执行数据库初始化脚本
3. 创建数据库视图
4. 配置API权限

## 管理面板

项目包含一个可视化管理面板，用于管理菜单、订单和服务请求。

### 功能特性
- 仪表板 - 系统概览和统计信息
- 菜单管理 - 添加、编辑、删除菜品
- 分类管理 - 管理菜单分类
- 订单管理 - 查看和处理订单
- 服务请求 - 处理客户服务请求
- 数据库管理 - 数据库维护和管理

## 测试和调试

### 数据库连接测试
```bash
npm run test-db
```

### 数据库查询测试
```bash
npm run test-db-query
```

### 浏览器数据库调试
直接在浏览器中打开 `db-debug.html` 文件，使用图形界面测试数据库连接和查询数据。

## 性能优化

1. **图片优化**: 图片预加载和懒加载
2. **代码分割**: 按功能模块分割代码
3. **资源压缩**: Gzip/Brotli压缩
4. **缓存策略**: 合理使用浏览器缓存
5. **响应式设计**: 移动端优化

## 安全措施

1. **环境变量保护**: 敏感信息通过GitHub Secrets管理
2. **API权限控制**: Supabase行级安全策略
3. **错误处理**: 完善的错误边界和异常处理
4. **输入验证**: 前后端数据验证

## 维护命令

```bash
# 构建项目
npm run build

# 启动开发服务器
npm run dev

# 预览构建结果
npm run preview

# 初始化数据库
npm run init-db

# 导入菜单数据
npm run import-menu-csv

# 测试数据库连接
npm run test-db

# 验证数据库视图
npm run verify-views
```

## 联系信息
- **维护人员**: 技术支持团队
- **最后更新**: 2025年11月27日
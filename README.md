# 江西酒店智能菜单系统

## 项目概述
江西酒店智能菜单系统是一个现代化的餐厅菜单展示和管理系统，包含前端展示页面和后台管理面板。

## 技术栈
- React + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- Supabase 作为后端数据库
- Vercel 用于部署

## 快速开始

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本
```bash
# 构建项目
npm run build
```

## 部署到 Vercel

### 前置条件
1. 安装 Node.js 和 npm
2. 安装 Vercel CLI: `npm install -g vercel`

### 部署步骤

#### 1. 登录 Vercel
```bash
vercel login
```

#### 2. 部署前端应用
```bash
# 构建并部署前端
npm run deploy
```

或者手动部署：
```bash
# 构建项目
npm run build

# 部署到 Vercel
vercel
```

#### 3. 部署管理面板
```bash
# 进入管理面板目录
cd admin-panel

# 部署到 Vercel
vercel
```

### 自动化部署
本项目配置了 GitHub Actions 工作流，可以自动部署到 Vercel：
1. 在 Vercel 账户中生成访问令牌
2. 在 GitHub 仓库的 Secrets 中添加 `VERCEL_TOKEN`
3. 推送代码到 main 分支即可自动触发部署

### 环境变量配置
在 Vercel 项目设置中添加以下环境变量：
- `VITE_APP_DB_URL` = 您的 Supabase 项目 URL
- `VITE_APP_DB_POSTGRES_PASSWORD` = 您的 Supabase anon key

## 项目结构
```
.
├── admin-panel/           # 后台管理面板
├── components/            # React 组件
├── services/             # API 服务
├── src/                  # 前端源代码
│   ├── lib/              # 工具库
│   └── types/            # TypeScript 类型定义
├── sql/                  # 数据库脚本
└── dist/                 # 构建输出目录
```

## 开发指南

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码规范
- 组件化开发，保持代码可维护性

### 测试
```bash
# 运行测试
npm run test

# 运行测试并查看 UI
npm run test:ui
```

## 常见问题

### 构建失败
- 检查 TypeScript 错误
- 确认环境变量配置正确
- 查看 Vercel 部署日志

### 数据库连接问题
- 验证 Supabase 凭据
- 检查网络连接
- 确认 Supabase 项目配置

## 许可证
MIT License
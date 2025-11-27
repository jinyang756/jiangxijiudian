# 江西酒店菜单系统

这是一个现代化的酒店菜单系统，包含前端展示页面和后台管理面板。

## 目录结构

```
jiangxijiudian/
├── admin-panel/           # 管理面板目录
├── src/                   # 前端源代码
├── public/                # 静态资源
├── scripts/               # 数据库脚本
├── sql/                   # SQL 文件
├── docs/                  # 文档
├── README.md              # 本说明文件
└── package.json           # 项目配置
```

## 功能特性

### 前端展示
1. **响应式设计** - 适配各种设备屏幕
2. **菜品展示** - 分类展示菜品信息
3. **购物车功能** - 添加、删除、修改菜品数量
4. **订单提交** - 提交订单到后台
5. **桌面二维码** - 每桌独立二维码点餐

### 后台管理
1. **仪表板** - 系统概览和统计信息
2. **菜单管理** - 添加、编辑、删除菜品
3. **分类管理** - 管理菜单分类
4. **订单管理** - 查看和处理订单
5. **服务请求** - 处理客户服务请求
6. **标签化订单** - 管理带标签的特殊订单

## 快速开始

### 前端部署
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 管理面板部署
管理面板需要单独部署到 Supabase Storage：

1. **创建存储桶**：
   - 登录 Supabase Dashboard
   - 选择项目并进入 Storage
   - 创建名为 `admin-panel` 的存储桶并设置为公开

2. **上传文件**：
   ```bash
   # 使用自动部署脚本
   node deploy-admin-panel.js
   ```

3. **访问管理面板**：
   ```
   https://kdlhyzsihflwkwumxzfw.supabase.co/storage/v1/object/public/admin-panel/index.html
   ```

## 环境变量配置

### 前端环境变量 (Vercel)
在 Vercel 项目设置中配置以下环境变量：

```
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=sb_publishable_kn0X93DL4ljLdimMM0TkEg_U6qATZ1I
```

详细配置步骤请参考 [Vercel 环境变量配置指南](VERCEL_ENV_SETUP.md)

### 管理面板环境变量
管理面板通过浏览器界面配置：
1. 访问 `set-env.html` 页面
2. 输入 Supabase URL 和 Anon Key
3. 保存配置

## 数据库设置

### 初始化数据库
```bash
# 创建数据库表和视图
npm run init-db-optimized
```

### 数据库结构
- `categories` - 菜单分类
- `dishes` - 菜品信息
- `orders` - 订单数据
- `service_requests` - 服务请求
- `tagged_orders` - 标签化订单

## 开发说明

### 技术栈
- **前端框架**: React + Vite
- **样式框架**: Tailwind CSS
- **数据库**: Supabase
- **状态管理**: React Hooks
- **构建工具**: Vite

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 规范
- 组件化开发，提高代码复用性

## 部署指南

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量（参考 [Vercel 环境变量配置指南](VERCEL_ENV_SETUP.md)）
3. 自动部署完成

### 手动部署
1. 构建项目：`npm run build`
2. 上传 `dist/` 目录到服务器
3. 配置 Web 服务器指向 `dist/` 目录

## 故障排除

### 常见问题
1. **页面空白**：检查环境变量配置
2. **数据库连接失败**：验证 Supabase 配置
3. **管理面板404**：确认 Supabase Storage 部署

### 调试工具
- 浏览器开发者工具
- Supabase Dashboard
- 项目根目录的调试脚本

## 相关文档

详细信息请参阅 `docs/` 目录下的文档：
- [部署说明](ADMIN_PANEL_DEPLOYMENT_GUIDE.html)
- [数据库设置](docs/database/DATABASE_SETUP.md)
- [环境变量配置](VERCEL_ENV_SETUP.md)
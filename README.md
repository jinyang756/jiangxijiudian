# 江西酒店菜单系统

这是一个现代化的酒店菜单系统，包含前端展示页面和后台管理面板。

## 目录结构

```
jiangxijiudian/
├── components/            # React组件目录
├── config/                # 配置文件目录
├── public/                # 静态资源目录
├── services/              # 服务层目录
├── sql/                   # SQL 文件目录
├── src/                   # 主要源代码目录
├── supabase/              # Supabase配置目录
├── docs/                  # 详细文档目录
├── README.md              # 本说明文件
└── package.json           # 项目配置文件
```

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

1. **自动部署**：
   ```bash
   # 使用自动部署脚本
   npm run deploy-admin-panel
   ```

2. **访问管理面板**：
   ```
   YOUR_SUPABASE_URL/storage/v1/object/public/admin-panel/index.html
   ```

## 核心功能

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
7. **用户认证** - 多角色用户登录和权限管理
8. **性能监控** - 实时监控应用性能和警报

## 环境变量配置

### 本地开发环境配置
1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，替换占位符为您的实际 Supabase 凭据：
   ```
   VITE_APP_DB_URL=https://your-project.supabase.co
   VITE_APP_DB_POSTGRES_PASSWORD=your_supabase_anon_key
   ```

### 生产环境配置
在 Vercel 项目设置中配置以下环境变量：
```
VITE_APP_DB_URL=YOUR_SUPABASE_URL
VITE_APP_DB_POSTGRES_PASSWORD=YOUR_SUPABASE_ANON_KEY
VITE_APP_SUPABASE_STORAGE_URL=YOUR_SUPABASE_STORAGE_URL
```

### 环境文件说明
- `.env` - 本地开发环境变量（不提交到版本控制）
- `.env.example` - 环境变量示例文件（提交到版本控制）
- `.env.development` - 开发环境特定变量（不提交到版本控制）
- `.env.production` - 生产环境特定变量（不提交到版本控制）
- `.env.local` - 本地覆盖变量（不提交到版本控制）

### 安全注意事项
- 永远不要在版本控制系统中提交包含真实凭据的环境文件
- 使用 `.env.local` 文件存储敏感信息
- 定期轮换API密钥和访问令牌

### 管理面板环境变量
管理面板通过浏览器界面配置：
1. 访问 `set-env.html` 页面
2. 输入 Supabase URL 和 Anon Key
3. 保存配置

## 更多信息

有关项目的详细信息，请参阅 [docs](docs/) 目录下的文档：

- [部署说明](docs/deployment/)
- [数据库设置](docs/database/)
- [开发文档](docs/development/)
- [功能特性](docs/features/)

---
*文档最后更新于 2025年11月27日*
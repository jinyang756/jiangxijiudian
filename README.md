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

### 环境变量配置

#### 前端环境变量 (VITE_* 前缀)
这些变量会被打包到前端代码中，必须是公开安全的：

1. 复制 `.env.example` 文件并重命名为 `.env`
2. 在 `.env` 文件中填入您的 Supabase 凭据：
   ```
   VITE_SUPABASE_URL=您的Supabase项目URL
   VITE_SUPABASE_ANON_KEY=您的Supabase anon key
   ```

#### 管理面板环境变量
管理面板需要额外的环境变量来连接Supabase：
```
VITE_SUPABASE_SERVICE_ROLE_KEY=您的Supabase service role key (仅用于管理面板)
```

### 部署步骤
1. 登录 Vercel: `vercel login`
2. 部署项目: `vercel --prod`

## 管理面板部署

管理面板通过 Supabase Storage 部署：

1. 登录到 Supabase Dashboard
2. 创建名为 "admin-panel" 的存储桶并设置为公共访问
3. 将 `admin-panel` 目录中的所有文件上传到存储桶
4. 通过以下URL访问管理面板：
   - 主页: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/admin-panel/index.html`
   - 设置页面: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/admin-panel/set-env.html`

详细信息请参考 [Supabase Storage 使用指南](./SUPABASE_STORAGE_GUIDE.md)

## Supabase Storage API 使用

项目中使用 Supabase Storage API 来访问管理面板文件。常用操作包括：

### 获取公共URL
```javascript
import { supabase } from '../src/lib/supabaseClient';

const { data } = supabase.storage
  .from('admin-panel')
  .getPublicUrl('index.html');

console.log(data.publicUrl);
```

### 列出存储桶中的文件
```javascript
const { data, error } = await supabase.storage
  .from('admin-panel')
  .list('', { limit: 100, offset: 0 });
```

更多详细信息请参考 [Supabase Storage 使用指南](./SUPABASE_STORAGE_GUIDE.md) 和 [React 组件示例](./components/StorageExample.tsx)。

## 数据库设置

### 创建数据库表
运行 `scripts/init-database.js` 脚本来初始化数据库表结构。

### 创建菜单视图
运行 `scripts/create-menu-view.js` 脚本来创建菜单视图。

## 测试

运行测试套件：
```bash
npm run test
```

## 故障排除

### 环境变量问题
如果遇到环境变量相关问题，请检查：
1. `.env` 文件是否存在且格式正确
2. 环境变量是否包含在 Vercel 项目设置中
3. 变量名是否符合 VITE_* 前缀要求（对于前端变量）

### 数据库连接问题
如果遇到数据库连接问题，请检查：
1. Supabase 项目URL和密钥是否正确
2. 数据库表和视图是否已创建
3. RLS（行级安全）策略是否正确配置

### 部署问题
如果部署失败，请检查：
1. Vercel 项目是否正确链接
2. 环境变量是否在 Vercel 中正确设置
3. 构建过程中是否有错误

## 许可证
MIT
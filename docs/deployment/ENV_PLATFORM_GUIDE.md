# 环境变量配置平台说明

## 概述
环境变量应该根据**Vercel平台**进行配置，因为这是您的前端应用部署和运行的平台。Supabase是后端服务提供商，Vercel是前端应用托管平台。

## 配置平台选择

### Vercel平台配置（正确方式）
- ✅ 前端应用在Vercel上运行
- ✅ 环境变量在Vercel Dashboard中设置
- ✅ 变量名以`VITE_`前缀开头（Vite构建工具要求）

### Supabase平台配置（不适用）
- ❌ Supabase不托管前端应用
- ❌ Supabase Dashboard中设置的是后端配置
- ❌ 前端无法直接访问Supabase的环境变量

## 正确的配置流程

### 1. 在Vercel中设置环境变量
登录 [Vercel Dashboard](https://vercel.com/dashboard) → 选择项目 → Settings → Environment Variables

添加以下变量：
```
VITE_APP_DB_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
VITE_APP_DB_POSTGRES_PASSWORD=J2nkgp0cGZYF8iHk
VITE_API_BASE_URL=https://154.221.19.68:8443/api
VITE_ADMIN_BASE_URL=https://154.221.19.68:8443/_
VITE_APP_SUPABASE_STORAGE_URL=https://kdlhyzsihflwkwumxzfw.supabase.co
```

### 2. Supabase中的配置（仅供后端使用）
在Supabase Dashboard中配置的是：
- 数据库表结构
- 行级安全策略(RLS)
- API密钥管理
- 存储桶权限

## 为什么是Vercel而不是Supabase？

### 1. 应用架构
```
用户浏览器 → Vercel托管的前端应用 → Supabase后端服务
              ↑                     ↑
         环境变量配置           数据库/API配置
```

### 2. 安全考虑
- 前端环境变量对用户可见，只能存储anon key
- Supabase服务端密钥在后端使用，不能暴露给前端

### 3. 技术要求
- Vite要求环境变量以`VITE_`前缀开头才能在前端代码中访问
- Supabase的配置在后端管理，通过API密钥进行认证

## 常见误区

### 误区1：在Supabase中设置前端环境变量
❌ 错误：试图在Supabase Dashboard中设置`VITE_`前缀的变量
✅ 正确：在Vercel Dashboard中设置前端环境变量

### 误区2：使用PostgreSQL连接字符串
❌ 错误：在前端环境变量中设置PostgreSQL连接URL
✅ 正确：只使用Supabase项目URL和anon key

### 误区3：混淆前后端配置
❌ 错误：将后端配置和前端配置混在一起
✅ 正确：前端配置在Vercel，后端配置在Supabase

## 验证配置

### 检查Vercel环境变量
1. 登录Vercel Dashboard
2. 进入项目Settings → Environment Variables
3. 确认变量已正确设置且没有敏感的PostgreSQL连接信息

### 测试前端应用
1. 重新部署应用
2. 打开浏览器开发者工具
3. 检查Network标签页，确认API请求正常发送
4. 检查Console标签页，确认没有环境变量相关的错误

通过在Vercel平台正确配置环境变量，您的前端应用将能够安全地连接到Supabase后端服务。
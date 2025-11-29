# Supabase Storage 使用指南

## 概述
本指南展示了如何在江西酒店菜单系统中使用 Supabase Storage API 来访问和管理文件。

## 常用 API 示例

### 1. 获取公共 URL
```javascript
import { supabase } from '../src/lib/supabaseClient';

// 获取管理面板中文件的公共URL
const { data } = supabase.storage
  .from('admin-panel')
  .getPublicUrl('index.html');

console.log(data.publicUrl);
// 输出: https://kdlhyzsihflwkwumxzfw.supabase.co/storage/v1/object/public/admin-panel/index.html

// 可以直接在 <img> 标签中使用
// <img src={data.publicUrl} alt="Preview" />
```

### 2. 列出存储桶中的文件
```javascript
const { data, error } = await supabase.storage
  .from('admin-panel')
  .list('', { limit: 100, offset: 0 });

if (error) {
  console.error(error);
} else {
  console.log(data); // 每项包含 name, id, updated_at 等信息
  // 对每项调用 getPublicUrl 或直接构造公开 URL（建议使用 getPublicUrl）
}
```

### 3. 获取签名 URL（后端实现）
```javascript
// 注意：此代码应在后端运行，使用 service_role_key
const { data, error } = await supabase.storage
  .from('admin-panel')
  .createSignedUrl('path/to/private-file.pdf', 60); // 60秒有效期

// 前端应通过 API 调用来获取签名 URL
```

## 管理面板访问 URL
管理面板可以通过以下 URL 访问：
- 主页: https://kdlhyzsihflwkwumxzfw.supabase.co/storage/v1/object/public/admin-panel/index.html
- 设置页面: https://kdlhyzsihflwkwumxzfw.supabase.co/storage/v1/object/public/admin-panel/set-env.html

## 最佳实践

### 1. 缓存策略
为避免浏览器缓存旧资源，请在文件名后添加版本参数：
```javascript
const { data } = supabase.storage
  .from('admin-panel')
  .getPublicUrl('index.html?v=' + Date.now());
```

### 2. 错误处理
始终检查 API 调用的错误：
```javascript
const { data, error } = await supabase.storage
  .from('admin-panel')
  .getPublicUrl('index.html');

if (error) {
  console.error('获取公共URL失败:', error.message);
  // 处理错误情况
} else {
  // 使用 data.publicUrl
}
```

### 3. 安全注意事项
- 前端只能使用匿名密钥 (anon key)
- 不要在前端代码中暴露服务角色密钥 (service_role_key)
- 敏感文件应使用签名 URL 方式访问
- 公共文件应谨慎设置存储桶权限

## 常见问题排查

1. **404 错误**: 检查文件路径是否正确，确认文件已上传到存储桶
2. **403 错误**: 检查存储桶权限设置，确认使用了正确的密钥
3. **缓存问题**: 强制刷新浏览器 (Ctrl+F5) 或在 URL 后添加版本参数
4. **跨域问题**: 确认 Supabase 项目已正确配置 CORS 策略

## 相关资源
- [Supabase Storage 官方文档](https://supabase.com/docs/guidelines-and-limitations/storage)
- [React 组件示例](./components/StorageExample.tsx)
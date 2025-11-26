# 网络检测系统使用指南

## 📡 概述

本项目的网络检测系统不依赖任何外部第三方服务（如 httpbin.org），而是使用浏览器原生 API 和自有服务进行网络质量检测。

## ⚠️ 问题背景

**之前的问题**：
- ❌ 依赖外部服务 `httpbin.org` 进行网络检测
- ❌ 在某些网络环境下可能被屏蔽（如中国大陆）
- ❌ 增加不必要的外部依赖
- ❌ 隐私和安全风险

**现在的解决方案**：
- ✅ 使用浏览器 Network Information API
- ✅ 使用自己的 API（Supabase）进行延迟测试
- ✅ 降级方案：加载本地资源（favicon）
- ✅ 完全不依赖外部服务

## 🔍 检测策略

### 多层检测机制

网络质量检测采用四层检测策略，按优先级依次尝试：

```
1. navigator.onLine 检查
   ↓ (offline → 返回 'offline')
   ↓ (online → 继续)
   
2. Network Information API
   ↓ (可用 → 分析网络类型和速度)
   ↓ (不可用 → 继续)
   
3. Supabase API 延迟测试
   ↓ (成功 → 根据响应时间判断)
   ↓ (失败 → 继续)
   
4. 本地资源加载测试
   ↓ (favicon.ico 加载时间)
   ↓
   返回结果: excellent | good | poor | offline
```

## 🚀 使用方法

### 基础使用

```typescript
import { NetworkMonitor } from './src/lib/network';

// 检查网络质量
const quality = await NetworkMonitor.checkConnectionQuality();
console.log('Network quality:', quality);
// 输出: 'excellent' | 'good' | 'poor' | 'offline'
```

### 监听网络状态变化

```typescript
const monitor = NetworkMonitor.getInstance();

// 添加监听器
monitor.addListener((online) => {
  console.log('Network status changed:', online ? 'online' : 'offline');
});

// 移除监听器
monitor.removeListener(listener);
```

### 获取详细网络信息

```typescript
const networkInfo = NetworkMonitor.getNetworkInfo();
console.log('Network info:', networkInfo);
// 输出:
// {
//   online: true,
//   effectiveType: '4g',
//   downlink: 10,      // Mbps
//   rtt: 50,           // ms
//   saveData: false
// }
```

### 监听网络信息变化

```typescript
const cleanup = NetworkMonitor.onNetworkChange((info) => {
  console.log('Network changed:', info);
  
  if (info.effectiveType === '2g') {
    // 降低图片质量
  } else if (info.effectiveType === '4g') {
    // 恢复高清图片
  }
});

// 清理监听器
cleanup();
```

## 📊 检测方法详解

### 1. Network Information API

**浏览器支持**：Chrome 61+, Edge 79+, Opera 48+

```typescript
const connection = navigator.connection;
```

**提供的信息**：
- `effectiveType`: 网络类型 ('slow-2g', '2g', '3g', '4g')
- `downlink`: 下行速度估计值（Mbps）
- `rtt`: 往返时间（毫秒）
- `saveData`: 是否启用省流量模式

**判断逻辑**：
```typescript
if (effectiveType === '4g' && downlink > 5 && rtt < 100) {
  return 'excellent';  // 4G 且速度快
}
if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1)) {
  return 'good';       // 4G 或快速 3G
}
if (effectiveType === '3g' || effectiveType === '2g') {
  return 'poor';       // 慢速网络
}
```

### 2. Supabase API 测试

**测试端点**：`${SUPABASE_URL}/rest/v1/`

```typescript
const response = await fetch(`${supabaseUrl}/rest/v1/`, {
  method: 'HEAD',      // 只获取头部，不下载内容
  signal: controller.signal,
  cache: 'no-cache'
});
```

**判断标准**：
- `< 200ms`: excellent（优秀）
- `< 500ms`: good（良好）
- `≥ 500ms`: poor（较差）
- 超时/错误: poor 或 offline

**优势**：
- ✅ 使用自己的服务器，可控
- ✅ HEAD 请求，流量消耗极小
- ✅ 5秒超时保护
- ✅ 接受 401/404 状态码（说明网络通但无权限）

### 3. 本地资源加载测试

**测试资源**：`/favicon.ico`

```typescript
const img = new Image();
img.src = `${window.location.origin}/favicon.ico?t=${Date.now()}`;
```

**特点**：
- ✅ 完全本地资源，不依赖外部
- ✅ 添加时间戳避免缓存
- ✅ 3秒超时保护
- ✅ 最小化的网络消耗

**判断标准**：
- `< 200ms`: excellent
- `< 500ms`: good
- `≥ 500ms`: poor
- 加载失败: poor

## 🎯 质量等级说明

| 等级 | 描述 | 条件 | 用户体验 |
|------|------|------|----------|
| **excellent** | 优秀 | 4G网络，低延迟 | 加载高清图片，启用动画 |
| **good** | 良好 | 4G或快速3G | 正常使用，适度压缩 |
| **poor** | 较差 | 慢速网络 | 降低图片质量，禁用动画 |
| **offline** | 离线 | 无网络连接 | 显示离线提示 |

## 💡 实际应用场景

### 场景1: 自适应图片质量

```typescript
const quality = await NetworkMonitor.checkConnectionQuality();

function getImageUrl(baseUrl: string) {
  switch (quality) {
    case 'excellent':
      return `${baseUrl}?quality=100&size=large`;
    case 'good':
      return `${baseUrl}?quality=75&size=medium`;
    case 'poor':
      return `${baseUrl}?quality=50&size=small`;
    default:
      return '/placeholder.svg';
  }
}
```

### 场景2: 智能预加载

```typescript
const quality = await NetworkMonitor.checkConnectionQuality();

if (quality === 'excellent' || quality === 'good') {
  // 预加载下一页的图片
  preloadNextPageImages();
} else {
  // 跳过预加载，节省流量
}
```

### 场景3: 动画控制

```typescript
const monitor = NetworkMonitor.getInstance();

monitor.addListener((online) => {
  if (!online) {
    // 禁用所有动画
    document.body.classList.add('reduce-motion');
  } else {
    document.body.classList.remove('reduce-motion');
  }
});
```

### 场景4: 数据同步策略

```typescript
const networkInfo = NetworkMonitor.getNetworkInfo();

if (networkInfo.saveData || networkInfo.effectiveType === '2g') {
  // 延迟同步，等待更好的网络
  queueSyncForLater();
} else {
  // 立即同步
  syncDataNow();
}
```

## 🔧 配置选项

### 环境变量

在 `.env.development` 或 `.env.production` 中配置：

```bash
# Supabase URL（用于网络测试）
VITE_APP_DB_URL=https://your-project.supabase.co
```

如果未配置，系统会自动降级到本地资源测试。

### 超时设置

可以在代码中调整超时时间：

```typescript
// Supabase API 测试超时（默认 5000ms）
const timeoutId = setTimeout(() => controller.abort(), 5000);

// 本地资源测试超时（默认 3000ms）
const timeout = setTimeout(() => {
  reject(new Error('Timeout'));
}, 3000);
```

## 📈 性能考虑

### 检测频率建议

```typescript
// ❌ 不要频繁检测
setInterval(async () => {
  await NetworkMonitor.checkConnectionQuality();
}, 1000); // 太频繁！

// ✅ 在关键时刻检测
async function loadPage() {
  const quality = await NetworkMonitor.checkConnectionQuality();
  // 根据网络质量加载资源
}

// ✅ 监听网络变化事件
NetworkMonitor.onNetworkChange((info) => {
  // 网络变化时才调整策略
});
```

### 性能开销

| 检测方法 | 网络请求 | 延迟 | 流量消耗 |
|---------|---------|------|---------|
| Network Information API | 无 | < 1ms | 0 |
| Supabase HEAD 请求 | 1个 | 50-500ms | < 1KB |
| 本地 favicon 加载 | 1个 | 10-200ms | < 5KB |

总计：**每次检测 < 1KB 流量，< 500ms 延迟**

## 🌍 浏览器兼容性

### Network Information API

| 浏览器 | 支持版本 |
|--------|---------|
| Chrome | 61+ ✅ |
| Edge | 79+ ✅ |
| Firefox | 部分支持 ⚠️ |
| Safari | 不支持 ❌ |
| Opera | 48+ ✅ |

**降级处理**：不支持的浏览器会自动使用其他检测方法

### navigator.onLine

所有现代浏览器都支持 ✅

### Fetch API with AbortController

所有现代浏览器都支持 ✅

## 🔒 隐私和安全

### 不收集的信息

- ✅ 不向第三方服务发送请求
- ✅ 不收集用户的精确位置
- ✅ 不收集用户的浏览历史

### 仅本地处理

所有网络检测都在本地完成，结果不会被发送到任何服务器。

### 日志记录

```typescript
// 开发环境：记录详细信息
logger.debug('Network info:', { effectiveType, downlink, rtt });

// 生产环境：仅记录关键事件
logger.info('Network status: online');
logger.warn('Network status: offline');
```

## 🧪 测试方法

### 模拟不同网络条件

在 Chrome DevTools 中：

1. 打开 DevTools（F12）
2. 切换到 Network 标签
3. 在 "No throttling" 下拉菜单中选择：
   - Fast 3G
   - Slow 3G
   - Offline

### 测试代码

```typescript
// 测试所有网络质量等级
async function testNetworkDetection() {
  console.log('Testing network detection...');
  
  const quality = await NetworkMonitor.checkConnectionQuality();
  console.log('Current quality:', quality);
  
  const info = NetworkMonitor.getNetworkInfo();
  console.log('Network info:', info);
  
  // 监听变化
  const cleanup = NetworkMonitor.onNetworkChange((newInfo) => {
    console.log('Network changed to:', newInfo);
  });
  
  // 5秒后清理
  setTimeout(cleanup, 5000);
}

testNetworkDetection();
```

## 📝 最佳实践

### 1. 缓存检测结果

```typescript
let cachedQuality: string | null = null;
let lastCheck = 0;
const CACHE_DURATION = 30000; // 30秒

async function getCachedNetworkQuality() {
  const now = Date.now();
  
  if (cachedQuality && now - lastCheck < CACHE_DURATION) {
    return cachedQuality;
  }
  
  cachedQuality = await NetworkMonitor.checkConnectionQuality();
  lastCheck = now;
  return cachedQuality;
}
```

### 2. 渐进增强

```typescript
// 基础功能总是可用
function loadContent() {
  // 加载基本内容
  loadBasicContent();
  
  // 根据网络质量增强
  NetworkMonitor.checkConnectionQuality().then(quality => {
    if (quality === 'excellent' || quality === 'good') {
      loadEnhancedContent();
    }
  });
}
```

### 3. 用户提示

```typescript
const monitor = NetworkMonitor.getInstance();

monitor.addListener((online) => {
  if (!online) {
    showNotification('网络连接已断开', 'warning');
  } else {
    showNotification('网络已恢复', 'success');
  }
});
```

## 🚨 故障排除

### 问题1: Network Information API 不可用

**症状**：`connection` 为 undefined

**解决**：系统会自动降级到其他检测方法

### 问题2: Supabase 请求失败

**症状**：所有 API 测试返回 poor 或 offline

**检查**：
1. 确认 `VITE_APP_DB_URL` 配置正确
2. 检查 Supabase 项目是否正常运行
3. 查看浏览器控制台的错误信息

### 问题3: favicon 加载失败

**症状**：降级测试也失败

**检查**：
1. 确认 `public/favicon.ico` 文件存在
2. 检查文件是否可访问
3. 查看浏览器控制台的网络错误

## 📊 对比：旧方案 vs 新方案

| 特性 | 旧方案（httpbin.org） | 新方案 |
|-----|---------------------|--------|
| 外部依赖 | ❌ 依赖 httpbin.org | ✅ 无外部依赖 |
| 网络屏蔽 | ❌ 可能被屏蔽 | ✅ 不会被屏蔽 |
| 隐私安全 | ⚠️ 第三方请求 | ✅ 完全本地/自有服务 |
| 可用性 | ⚠️ 依赖第三方稳定性 | ✅ 高可用 |
| 检测准确性 | ⚠️ 单一方法 | ✅ 多层检测 |
| 流量消耗 | ~10KB | < 1KB |
| 配置复杂度 | 简单 | 简单 |

## ✅ 总结

新的网络检测系统：

✅ **完全自主**：不依赖任何外部第三方服务  
✅ **高可用**：多层降级策略，总能返回结果  
✅ **高性能**：最小化流量消耗，快速检测  
✅ **隐私友好**：不向第三方发送任何信息  
✅ **跨平台**：支持所有现代浏览器  
✅ **易于使用**：简单的 API，丰富的功能  
✅ **可扩展**：易于集成到各种应用场景  

建议在以下场景使用：
- 🖼️ 自适应图片质量
- 📱 响应式资源加载
- 🎬 动画和特效控制
- 💾 数据同步策略
- 📡 离线功能提示

# React 错误边界使用指南

## 📚 什么是错误边界？

错误边界（Error Boundary）是 React 组件，可以捕获其子组件树中的 JavaScript 错误，记录这些错误，并显示降级 UI，而不是崩溃整个应用。

## ⚠️ 为什么需要错误边界？

**问题场景**：
- ❌ 单个组件错误导致整个应用白屏
- ❌ 用户看到难以理解的错误信息
- ❌ 难以追踪生产环境的错误
- ❌ 没有优雅的错误恢复机制

**有了错误边界后**：
- ✅ 组件错误被隔离，不影响其他部分
- ✅ 显示友好的错误提示
- ✅ 错误自动记录到日志系统
- ✅ 用户可以重试或返回首页

## 🚀 使用方法

### 方法 1: 直接使用 ErrorBoundary 组件（推荐）

```tsx
import ErrorBoundary from './src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 方法 2: 使用 HOC 包装器

```tsx
import { withErrorBoundary } from './src/components/ErrorBoundary';

const SafeComponent = withErrorBoundary(YourComponent);

// 使用
<SafeComponent />
```

### 方法 3: 自定义降级 UI

```tsx
<ErrorBoundary
  fallback={
    <div className="error-page">
      <h1>自定义错误页面</h1>
      <button onClick={() => window.location.reload()}>刷新</button>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

### 方法 4: 自定义错误处理

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // 发送错误到监控系统
    console.error('Error caught:', error);
    // 可以发送到 Sentry、LogRocket 等
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### 方法 5: 使用 resetKeys 自动恢复

```tsx
function ParentComponent() {
  const [userId, setUserId] = useState('user1');
  
  return (
    <ErrorBoundary resetKeys={[userId]}>
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );
}
```

当 `userId` 改变时，错误边界会自动重置。

## 📋 完整配置选项

```tsx
interface ErrorBoundaryProps {
  children: ReactNode;           // 必需：子组件
  fallback?: ReactNode;           // 可选：自定义降级 UI
  onError?: (error, errorInfo) => void; // 可选：错误回调
  resetKeys?: Array<string | number>;   // 可选：自动重置的键
}
```

## 🎨 默认降级 UI 特性

我们的默认错误页面包含：

1. **友好的错误提示**
   - 中英文双语显示
   - 清晰的错误图标
   - 简单易懂的说明

2. **操作按钮**
   - 重试按钮：尝试重新渲染组件
   - 返回首页：导航到安全页面

3. **开发环境调试信息**
   - 错误详情（仅开发环境可见）
   - 组件堆栈跟踪
   - 错误计数

4. **响应式设计**
   - 适配移动端和桌面端
   - 使用 Tailwind CSS 样式

## 🏗️ 项目中的实际应用

### 主应用包裹

```tsx
// App.tsx
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
```

### 关键组件包裹

```tsx
// 菜单页面
<ErrorBoundary
  onError={(error) => {
    logger.error('Menu component error:', error);
  }}
>
  <MenuPage />
</ErrorBoundary>

// 购物车
<ErrorBoundary fallback={<div>购物车加载失败</div>}>
  <CartModal />
</ErrorBoundary>

// 订单提交
<ErrorBoundary resetKeys={[orderId]}>
  <OrderForm orderId={orderId} />
</ErrorBoundary>
```

## 🔍 错误边界能捕获什么？

✅ **可以捕获**：
- 渲染期间的错误
- 生命周期方法中的错误
- 整个组件树的构造函数中的错误

❌ **不能捕获**：
- 事件处理器中的错误（使用 try-catch）
- 异步代码中的错误（使用 try-catch 或 Promise.catch）
- 服务端渲染的错误
- 错误边界自身的错误

## 📊 错误处理流程

```
组件抛出错误
    ↓
ErrorBoundary 捕获
    ↓
getDerivedStateFromError() - 更新状态
    ↓
componentDidCatch() - 记录错误
    ↓
调用 onError 回调（如果提供）
    ↓
记录到日志系统 (logger)
    ↓
显示降级 UI 或自定义 fallback
    ↓
等待用户操作（重试/返回首页）
```

## 🎯 最佳实践

### 1. 分层错误边界

```tsx
<ErrorBoundary>  {/* 顶层 */}
  <App>
    <ErrorBoundary>  {/* 页面级 */}
      <MenuPage>
        <ErrorBoundary>  {/* 组件级 */}
          <ComplexComponent />
        </ErrorBoundary>
      </MenuPage>
    </ErrorBoundary>
  </App>
</ErrorBoundary>
```

### 2. 关键路径保护

```tsx
// 保护关键业务流程
<ErrorBoundary
  onError={(error) => {
    // 记录关键错误
    analytics.track('checkout_error', { error });
  }}
  resetKeys={[checkoutStep]}
>
  <CheckoutProcess />
</ErrorBoundary>
```

### 3. 结合日志系统

```tsx
import { logger } from './lib/logger';

<ErrorBoundary
  onError={(error, errorInfo) => {
    logger.error('Component error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack
    });
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### 4. 生产环境监控

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    if (import.meta.env.PROD) {
      // 发送到错误监控服务
      // Sentry.captureException(error);
      // LogRocket.captureException(error);
    }
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## 🧪 测试错误边界

### 创建一个会崩溃的组件

```tsx
function BuggyComponent() {
  const [count, setCount] = useState(0);
  
  if (count === 5) {
    // 故意抛出错误
    throw new Error('I crashed!');
  }
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加计数
      </button>
    </div>
  );
}

// 测试
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

### 验证错误边界工作

1. 点击按钮5次
2. 应该看到错误边界的降级 UI
3. 点击"重试"按钮应该重新渲染组件
4. 开发环境下可以看到错误详情

## 📝 事件处理器中的错误

错误边界**不会**捕获事件处理器中的错误，需要使用 try-catch：

```tsx
function MyComponent() {
  const handleClick = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      // 手动处理错误
      logger.error('Click handler error:', error);
      // 可以设置状态显示错误
      setError(error.message);
    }
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

## 🔗 与日志系统集成

错误边界已经集成了我们的日志系统：

```tsx
// ErrorBoundary 内部
componentDidCatch(error, errorInfo) {
  logger.error('ErrorBoundary caught an error:', error);
  logger.error('Error details:', errorInfo.componentStack);
}
```

这意味着：
- ✅ 开发环境：错误会在控制台显示
- ✅ 生产环境：错误不会泄露敏感信息
- ✅ 所有错误都通过统一的 logger 系统

## 🎨 自定义样式

默认降级 UI 使用 Tailwind CSS，你可以轻松自定义：

```tsx
<ErrorBoundary
  fallback={
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          出错了！
        </h1>
        <p className="text-gray-600 mb-6">
          我们正在处理这个问题...
        </p>
        <button 
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          刷新页面
        </button>
      </div>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

## 📈 监控和分析

### 推荐的错误监控服务

1. **Sentry** (推荐)
```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-dsn',
  environment: import.meta.env.MODE,
});

<Sentry.ErrorBoundary fallback={<ErrorPage />}>
  <App />
</Sentry.ErrorBoundary>
```

2. **LogRocket**
```tsx
import LogRocket from 'logrocket';

LogRocket.init('your-app-id');

<ErrorBoundary
  onError={(error) => {
    LogRocket.captureException(error);
  }}
>
  <App />
</ErrorBoundary>
```

## 🚨 常见问题

### Q: 为什么事件处理器中的错误没被捕获？

A: 错误边界只捕获渲染期间的错误。事件处理器需要使用 try-catch。

### Q: 如何在错误边界外捕获全局错误？

A: 使用 `window.onerror` 或 `window.addEventListener('error')`：

```tsx
window.addEventListener('error', (event) => {
  logger.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', event.reason);
});
```

### Q: 错误边界的性能影响？

A: 几乎没有性能影响。只在错误发生时才会有额外开销。

### Q: 可以嵌套多个错误边界吗？

A: 可以！这是推荐的做法。内层错误边界捕获不到的错误会冒泡到外层。

## ✅ 检查清单

部署前确认：

- [ ] 主应用已用 ErrorBoundary 包裹
- [ ] 关键组件有独立的错误边界
- [ ] 已配置 onError 回调记录错误
- [ ] 已测试错误边界功能正常
- [ ] 已集成错误监控服务（可选）
- [ ] 降级 UI 符合设计规范
- [ ] 开发环境可以看到错误详情
- [ ] 生产环境不会泄露敏感信息

## 🔗 相关资源

- [React 官方文档 - 错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React](https://react.dev/learn/error-boundaries)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)

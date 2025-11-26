import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示降级 UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新状态以在下次渲染时显示降级 UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到日志系统
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error details:', errorInfo.componentStack);

    // 更新错误计数
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境中，将错误发送到控制台
    if (import.meta.env.DEV) {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // 如果 resetKeys 改变，重置错误状态
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys !== prevProps.resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const currentResetKeys = resetKeys || [];

      const keysChanged = currentResetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (keysChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // 如果提供了自定义降级 UI，使用它
      if (fallback) {
        return fallback;
      }

      // 默认降级 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-gray-900">
                  抱歉，出现了一些问题
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Something went wrong
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                应用遇到了一个错误，我们正在努力修复。请尝试以下操作：
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                <li>刷新页面</li>
                <li>清除浏览器缓存</li>
                <li>稍后再试</li>
              </ul>
            </div>

            {/* 开发环境显示错误详情 */}
            {import.meta.env.DEV && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  🔍 错误详情 (仅开发环境可见)
                </summary>
                <div className="mt-2 p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-xs font-mono text-red-800 mb-2">
                    <strong>错误:</strong> {error.toString()}
                  </p>
                  {errorInfo && (
                    <pre className="text-xs font-mono text-red-700 overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                  <p className="text-xs text-red-600 mt-2">
                    错误次数: {errorCount}
                  </p>
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.reset}
                className="flex-1 bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-900 transition-colors text-sm font-medium"
              >
                重试 Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                返回首页 Home
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                如果问题持续存在，请联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// 便捷的函数式包装器
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

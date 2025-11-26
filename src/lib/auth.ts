// 用户认证和权限管理模块
import { supabase } from './supabaseClient';

// 用户角色定义
export type UserRole = 'admin' | 'staff' | 'readonly' | 'anonymous';

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

// 认证状态接口
export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  role: UserRole;
  loading: boolean;
}

// 默认认证状态
const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  role: 'anonymous',
  loading: true
};

// 认证管理类
class AuthManager {
  private authState: AuthState = DEFAULT_AUTH_STATE;
  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // 监听认证状态变化
    this.initAuthListener();
  }

  // 初始化认证监听器
  private initAuthListener() {
    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          this.updateAuthState({
            user: session?.user ? {
              id: session.user.id,
              email: session.user.email || '',
              role: this.determineUserRole(session.user),
              name: session.user.user_metadata?.name
            } : null,
            isAuthenticated: !!session?.user,
            role: session?.user ? this.determineUserRole(session.user) : 'anonymous',
            loading: false
          });
          break;
        case 'SIGNED_OUT':
          this.updateAuthState(DEFAULT_AUTH_STATE);
          break;
        default:
          // 其他事件不处理
          break;
      }
    });
  }

  // 确定用户角色
  private determineUserRole(user: any): UserRole {
    // 这里应该根据实际的用户数据或配置来确定角色
    // 目前简化处理，后续可以从用户元数据或外部配置获取
    const email = user.email || '';
    
    // 管理员邮箱判断（示例）
    if (email.endsWith('@admin.com')) {
      return 'admin';
    }
    
    // 员工邮箱判断（示例）
    if (email.endsWith('@staff.com')) {
      return 'staff';
    }
    
    // 默认为只读角色
    return 'readonly';
  }

  // 更新认证状态
  private updateAuthState(newState: AuthState) {
    this.authState = { ...this.authState, ...newState };
    // 通知所有监听器
    this.notifyListeners();
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // 添加状态监听器
  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // 立即发送当前状态
    listener(this.authState);
    
    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 获取当前认证状态
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  // 用户登录
  public async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 用户注册
  public async signUp(email: string, password: string, name?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 用户登出
  public async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // 检查用户权限
  public hasPermission(requiredRole: UserRole): boolean {
    // 角色层级定义
    const roleHierarchy: Record<UserRole, number> = {
      'admin': 3,
      'staff': 2,
      'readonly': 1,
      'anonymous': 0
    };

    return roleHierarchy[this.authState.role] >= roleHierarchy[requiredRole];
  }

  // 获取用户信息
  public getUserInfo(): UserInfo | null {
    return this.authState.user ? { ...this.authState.user } : null;
  }
}

// 创建并导出认证管理实例
export const authManager = new AuthManager();

// 简化的认证钩子（模拟React hook）
export const useAuth = () => {
  return authManager.getAuthState();
};
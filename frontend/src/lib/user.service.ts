/**
 * 用户体系 - 本地存储版本
 * 支持：用户注册、登录、角色管理
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: number;
  lastLoginAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  defaultModel: string;
  autoSave: boolean;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'pm_assistant_users';
const CURRENT_USER_KEY = 'pm_assistant_current_user';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 哈希密码（简单实现，生产环境应使用bcrypt）
function hashPassword(password: string): string {
  // 简单哈希，实际应使用bcrypt
  return btoa(password + '_salt');
}

// 存储用户列表
function getUserStore(): Map<string, User> {
  if (typeof window === 'undefined') return new Map();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return new Map();
  
  try {
    const data = JSON.parse(stored);
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function saveUserStore(store: Map<string, User>): void {
  if (typeof window === 'undefined') return;
  
  const obj = Object.fromEntries(store);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

// 用户服务
export const userService = {
  // 注册
  async register(email: string, password: string, name: string): Promise<User> {
    const store = getUserStore();
    
    // 检查邮箱是否已存在
    const existingUser = Array.from(store.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }
    
    const user: User = {
      id: generateId(),
      email,
      name,
      role: 'member',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      settings: {
        defaultModel: 'gpt-4o-mini',
        autoSave: true,
        notifications: true,
        theme: 'light',
      },
    };
    
    // 注意：密码不存储在User对象中，这里简化处理
    // 实际应单独存储密码哈希
    store.set(user.id, user);
    saveUserStore(store);
    
    // 自动登录
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    
    return user;
  },

  // 登录
  async login(email: string, password: string): Promise<User> {
    const store = getUserStore();
    
    // 查找用户（简化：直接匹配邮箱）
    // 实际应验证密码哈希
    const user = Array.from(store.values()).find(u => u.email === email);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 更新最后登录时间
    user.lastLoginAt = Date.now();
    store.set(user.id, user);
    saveUserStore(store);
    
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    
    return user;
  },

  // 登出
  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // 获取当前用户
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    
    const store = getUserStore();
    return store.get(userId) || null;
  },

  // 更新用户信息
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const store = getUserStore();
    const user = store.get(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    const updatedUser = { ...user, ...updates };
    store.set(userId, updatedUser);
    saveUserStore(store);
    
    return updatedUser;
  },

  // 更新设置
  async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<User> {
    const store = getUserStore();
    const user = store.get(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    user.settings = { ...user.settings, ...settings };
    store.set(userId, user);
    saveUserStore(store);
    
    return user;
  },

  // 检查是否已登录
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  },
};

'use client';

import { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, ArrowRight, User as UserIcon } from 'lucide-react';
import { userService, User } from '@/lib/user.service';

interface AuthPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthPanel({ isOpen, onClose, onSuccess }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      let user: User;
      
      if (mode === 'login') {
        user = await userService.login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('请输入昵称');
        }
        user = await userService.register(email, password, name);
      }
      
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // 游客模式
    onSuccess({
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      role: 'member',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      settings: {
        defaultModel: 'gpt-4o-mini',
        autoSave: true,
        notifications: true,
        theme: 'light',
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h2>
          <p className="text-blue-100 mt-1">
            {mode === 'login' ? '登录以开始使用AI产品助手' : '注册后保存你的PRD文档'}
          </p>
        </div>
        
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                昵称
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入你的昵称"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="输入你的邮箱"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    登录
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    注册
                  </>
                )}
              </>
            )}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或者</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            游客模式（不保存数据）
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-blue-600 hover:underline ml-1"
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

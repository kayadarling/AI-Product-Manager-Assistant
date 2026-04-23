'use client';

import { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';

interface RequirementInputProps {
  onSubmit: (requirement: string) => Promise<void>;
}

export function RequirementInput({ onSubmit }: RequirementInputProps) {
  const [input, setInput] = useState('');
  const { isLoading, apiConfig } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await onSubmit(input.trim());
  };

  const isDisabled = !input.trim() || isLoading || !apiConfig.apiKey;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述你的产品需求，例如：&#10;我需要一个用户注册登录功能，支持邮箱和手机号登录，包含忘记密码功能"
          disabled={isLoading}
          className="w-full h-40 p-4 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>AI将自动分析并生成PRD</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {apiConfig.apiKey ? (
            <span className="text-green-600">
              API已配置 ({apiConfig.model})
            </span>
          ) : (
            <span className="text-amber-600">
              请先在设置中配置API Key
            </span>
          )}
        </p>

        <button
          type="submit"
          disabled={isDisabled}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              生成PRD
            </>
          )}
        </button>
      </div>
    </form>
  );
}

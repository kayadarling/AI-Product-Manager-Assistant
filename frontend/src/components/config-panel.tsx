'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff, Check } from 'lucide-react';
import { useAppStore } from '@/store';
import { APIConfig } from '@/types';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const { apiConfig, setApiConfig } = useAppStore();
  const [localConfig, setLocalConfig] = useState<APIConfig>(apiConfig);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    setApiConfig(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">API配置</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              支持OpenAI及任意兼容接口
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={localConfig.baseUrl}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, baseUrl: e.target.value })
              }
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              OpenAI兼容接口地址
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型
            </label>
            <input
              type="text"
              value={localConfig.model}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, model: e.target.value })
              }
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              使用的AI模型名称
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Briefcase, Zap, Heart, GraduationCap, CreditCard, Users, Wrench, Package } from 'lucide-react';
import { templateService, Template, Industry } from '@/lib/project.service';
import { analytics } from '@/lib/analytics.service';

interface TemplatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const industryConfig: Record<Industry, { label: string; icon: React.ReactNode; color: string }> = {
  ecommerce: { 
    label: '电商', 
    icon: <Package className="w-4 h-4" />, 
    color: 'bg-orange-100 text-orange-600' 
  },
  '新能源': { 
    label: '新能源', 
    icon: <Zap className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-600' 
  },
  '医疗': { 
    label: '医疗', 
    icon: <Heart className="w-4 h-4" />, 
    color: 'bg-red-100 text-red-600' 
  },
  '教育': { 
    label: '教育', 
    icon: <GraduationCap className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-600' 
  },
  '金融': { 
    label: '金融', 
    icon: <CreditCard className="w-4 h-4" />, 
    color: 'bg-purple-100 text-purple-600' 
  },
  '社交': { 
    label: '社交', 
    icon: <Users className="w-4 h-4" />, 
    color: 'bg-pink-100 text-pink-600' 
  },
  '工具': { 
    label: '工具', 
    icon: <Wrench className="w-4 h-4" />, 
    color: 'bg-gray-100 text-gray-600' 
  },
  '其他': { 
    label: '其他', 
    icon: <Briefcase className="w-4 h-4" />, 
    color: 'bg-slate-100 text-slate-600' 
  },
};

export function TemplatePanel({ isOpen, onClose, onSelect }: TemplatePanelProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | 'all'>('all');
  
  useEffect(() => {
    if (isOpen) {
      setTemplates(templateService.getAll());
    }
  }, [isOpen]);
  
  const filteredTemplates = selectedIndustry === 'all' 
    ? templates 
    : templates.filter(t => t.industry === selectedIndustry);
  
  const handleSelect = (template: Template) => {
    analytics.click('template_select', { templateId: template.id });
    analytics.click('industry_select', { industry: template.industry });
    onSelect(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col animate-scale-in">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">需求模板</h2>
              <p className="text-sm text-gray-500">选择一个模板快速开始</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 行业筛选 */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedIndustry('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedIndustry === 'all' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部行业
            </button>
            {Object.entries(industryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedIndustry(key as Industry)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedIndustry === key 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 模板列表 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const config = industryConfig[template.industry];
              return (
                <div
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h3>
                        {template.isBuiltIn && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                            内置
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        已使用 {template.usageCount} 次
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

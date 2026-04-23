'use client';

import { useState, useEffect } from 'react';
import { X, Clock, FileText, Trash2, ChevronRight, Search } from 'lucide-react';
import { projectService, Project, Industry } from '@/lib/project.service';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (project: Project) => void;
}

const industryLabels: Record<Industry, string> = {
  ecommerce: '电商',
  '新能源': '新能源',
  '医疗': '医疗',
  '教育': '教育',
  '金融': '金融',
  '社交': '社交',
  '工具': '工具',
  '其他': '其他',
};

export function HistoryPanel({ isOpen, onClose, onSelect }: HistoryPanelProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<Industry | 'all'>('all');
  
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);
  
  const loadProjects = () => {
    const allProjects = projectService.getAll();
    setProjects(allProjects.sort((a, b) => b.updatedAt - a.updatedAt));
  };
  
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这个项目吗？')) {
      await projectService.delete(id);
      loadProjects();
    }
  };
  
  const filteredProjects = projects.filter(p => {
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requirement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchIndustry = filterIndustry === 'all' || p.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 遮罩 */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">历史记录</h2>
              <p className="text-sm text-gray-500">{projects.length} 个项目</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索项目..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterIndustry('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterIndustry === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {Object.entries(industryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterIndustry(key as Industry)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  filterIndustry === key 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 项目列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="font-medium">暂无项目</p>
              <p className="text-sm mt-1">开始创建你的第一个项目吧</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelect(project);
                    onClose();
                  }}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {industryLabels[project.industry]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.requirement}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{formatDate(project.updatedAt)}</span>
                        {project.prdMarkdown && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            PRD
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

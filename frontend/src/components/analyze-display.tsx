'use client';

import { AnalyzeResult } from '@/types';
import { Users, Layers, GitBranch } from 'lucide-react';

interface AnalyzeDisplayProps {
  result: AnalyzeResult;
}

const priorityColors = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-amber-100 text-amber-700 border-amber-200',
  P2: 'bg-green-100 text-green-700 border-green-200',
};

export function AnalyzeDisplay({ result }: AnalyzeDisplayProps) {
  return (
    <div className="space-y-6">
      {/* 用户角色 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">用户角色</h3>
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
            {result.用户角色.length} 个角色
          </span>
        </div>
        
        <div className="space-y-3">
          {result.用户角色.map((role, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{role.角色名称}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.角色描述}</p>
              <div className="flex flex-wrap gap-2">
                {role.使用场景.map((scene, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 核心功能 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">核心功能</h3>
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
            {result.核心功能.length} 个功能
          </span>
        </div>
        
        <div className="space-y-3">
          {result.核心功能.map((feature, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{feature.功能名称}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded border ${priorityColors[feature.优先级]}`}>
                  {feature.优先级}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{feature.功能描述}</p>
              {feature.子功能点.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">子功能点:</span>
                  <ul className="mt-1 space-y-1">
                    {feature.子功能点.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-purple-500 mt-1">-</span>
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 用户流程 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">用户流程</h3>
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
            {result.用户流程.length} 个流程
          </span>
        </div>
        
        <div className="space-y-4">
          {result.用户流程.map((flow, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <h4 className="font-medium text-gray-900 mb-3">{flow.流程名称}</h4>
              <div className="relative">
                {flow.流程步骤.map((step, sIdx) => (
                  <div key={sIdx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-medium">
                        {step.步骤序号}
                      </div>
                      {sIdx < flow.流程步骤.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 min-w-[60px]">用户动作:</span>
                          <span className="text-gray-900">{step.用户动作}</span>
                        </div>
                        <div className="flex items-start gap-2 mt-1">
                          <span className="text-gray-500 min-w-[60px]">系统响应:</span>
                          <span className="text-gray-600">{step.系统响应}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

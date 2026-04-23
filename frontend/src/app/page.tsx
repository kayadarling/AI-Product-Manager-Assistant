'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  FileDown, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  GitBranch,
  Users,
  FileText,
  Clock,
  LogOut,
  BookOpen,
  User as UserIcon,
  LogIn,
  UserPlus
} from 'lucide-react';
import { ConfigPanel } from '@/components/config-panel';
import { AuthPanel } from '@/components/auth-panel';
import { HistoryPanel } from '@/components/history-panel';
import { TemplatePanel } from '@/components/template-panel';
import { AnalyzeDisplay } from '@/components/analyze-display';
import { FlowchartViewer } from '@/components/flowchart-viewer';
import { useAppStore } from '@/store';
import { analyzeRequirement, generatePRDFromAnalysis, generateFlowchart } from '@/lib/api';
import { projectService, Project, Template, Industry } from '@/lib/project.service';
import { userService, User } from '@/lib/user.service';
import { analytics } from '@/lib/analytics.service';
import { AnalyzeResult } from '@/types';

type TabType = 'analyze' | 'prd' | 'flowchart';
type WorkflowStep = 'input' | 'analyzing' | 'analyzed' | 'generating';

export default function Home() {
  const [configOpen, setConfigOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  
  const [requirement, setRequirement] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('其他');
  const [activeTab, setActiveTab] = useState<TabType>('analyze');
  
  // 状态
  const [step, setStep] = useState<WorkflowStep>('input');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);
  const [prdMarkdown, setPrdMarkdown] = useState<string | null>(null);
  const [flowchartCode, setFlowchartCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 用户状态
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const { apiConfig } = useAppStore();

  // 初始化：检查登录状态
  useEffect(() => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    analytics.view('page_load');
  }, []);

  // 主工作流程
  const handleStartAnalyze = async () => {
    if (!requirement.trim() || !apiConfig.apiKey) return;
    
    setStep('analyzing');
    setIsLoading(true);
    setLoadingText('正在分析需求...');
    setError(null);
    
    analytics.click('start_analyze', { industry: selectedIndustry });
    
    try {
      // 分析需求
      const analyzeRes = await analyzeRequirement(
        requirement,
        apiConfig.apiKey,
        apiConfig.baseUrl,
        apiConfig.model
      );
      
      if (!analyzeRes.success || !analyzeRes.data) {
        throw new Error(analyzeRes.error || '分析失败');
      }
      
      setAnalyzeResult(analyzeRes.data);
      setStep('analyzed');
      setActiveTab('analyze');
      analytics.generate('analyze_complete');
      
      // 并行生成PRD和流程图
      setLoadingText('正在生成PRD和流程图...');
      
      const [prdRes, flowchartRes] = await Promise.all([
        generatePRDFromAnalysis(
          analyzeRes.data,
          apiConfig.apiKey,
          apiConfig.baseUrl,
          apiConfig.model
        ),
        generateFlowchart(
          projectName || '产品流程',
          analyzeRes.data.用户流程,
          apiConfig.apiKey,
          apiConfig.baseUrl,
          apiConfig.model
        )
      ]);
      
      if (prdRes.success && prdRes.data) {
        setPrdMarkdown(prdRes.data.markdown);
        analytics.generate('prd_complete');
      }
      
      if (flowchartRes.success && flowchartRes.data) {
        setFlowchartCode(flowchartRes.data.code);
        analytics.generate('flowchart_complete');
      }
      
      setStep('generating');
      
      // 保存项目
      if (currentUser) {
        await projectService.create({
          userId: currentUser.id,
          name: projectName || `项目-${Date.now()}`,
          industry: selectedIndustry,
          requirement,
          analyzeResult: analyzeRes.data,
          prdMarkdown: prdRes.data?.markdown,
          flowchartCode: flowchartRes.data?.code,
        });
        analytics.click('save');
      }
    } catch (err: any) {
      setError(err.message || '处理失败');
      analytics.error('api_error', err);
      setStep('analyzed');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理模板选择
  const handleTemplateSelect = (template: Template) => {
    setRequirement(template.content);
    setSelectedIndustry(template.industry);
    analytics.click('template_use', { templateId: template.id, industry: template.industry });
  };

  // 处理历史项目选择
  const handleProjectSelect = (project: Project) => {
    setRequirement(project.requirement);
    setProjectName(project.name);
    setSelectedIndustry(project.industry);
    if (project.analyzeResult) {
      setAnalyzeResult(project.analyzeResult);
    }
    if (project.prdMarkdown) {
      setPrdMarkdown(project.prdMarkdown);
    }
    if (project.flowchartCode) {
      setFlowchartCode(project.flowchartCode);
    }
    if (project.prdMarkdown) {
      setStep('generating');
      setActiveTab('prd');
    } else if (project.analyzeResult) {
      setStep('analyzed');
      setActiveTab('analyze');
    }
  };

  const handleDownload = () => {
    if (!prdMarkdown) return;
    const blob = new Blob([prdMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'PRD'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    analytics.download({ format: 'markdown' });
  };

  const handleReset = () => {
    setRequirement('');
    setProjectName('');
    setStep('input');
    setAnalyzeResult(null);
    setPrdMarkdown(null);
    setFlowchartCode(null);
    setError(null);
    setActiveTab('analyze');
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI产品经理助手</h1>
                <p className="text-xs text-gray-500">智能生成PRD文档</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 历史记录 */}
              <button
                onClick={() => setHistoryOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">历史</span>
              </button>
              
              {/* 模板 */}
              <button
                onClick={() => setTemplateOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">模板</span>
              </button>
              
              {/* 用户 */}
              {currentUser ? (
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:inline">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">登录</span>
                </button>
              )}
              
              {/* 设置 */}
              <button
                onClick={() => setConfigOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入区域 */}
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-gray-900">基本信息</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">项目名称</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="给你的项目起个名字"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">行业领域</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['电商', '新能源', '医疗', '教育', '金融', '社交', '工具', '其他'] as Industry[]).map((industry) => (
                      <button
                        key={industry}
                        onClick={() => setSelectedIndustry(industry)}
                        disabled={isLoading}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          selectedIndustry === industry
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 需求输入 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="font-semibold text-gray-900">需求描述</h2>
                </div>
                <button
                  onClick={() => setTemplateOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <BookOpen className="w-4 h-4" />
                  使用模板
                </button>
              </div>
              
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="描述你的产品需求，例如：&#10;&#10;做一个新能源充电桩预约系统，支持车主预约充电桩、查看充电状态、在线支付等功能"
                disabled={isLoading}
                className="w-full h-48 p-4 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 placeholder:text-gray-400"
              />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {apiConfig.apiKey ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      API已配置 · {apiConfig.model}
                    </span>
                  ) : (
                    <span className="text-amber-600">请先配置API Key</span>
                  )}
                </p>
                
                {step === 'input' ? (
                  <button
                    onClick={handleStartAnalyze}
                    disabled={!requirement.trim() || !apiConfig.apiKey || isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    开始生成
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    新建项目
                  </button>
                )}
              </div>
            </div>

            {/* 进度卡片 */}
            {step !== 'input' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">生成进度</h3>
                <div className="space-y-4">
                  <ProgressItem 
                    icon={<Users className="w-4 h-4" />}
                    title="需求拆解"
                    status={step === 'analyzing' ? 'loading' : analyzeResult ? 'done' : 'pending'}
                    text={step === 'analyzing' ? '分析中...' : '已完成'}
                  />
                  <ProgressItem 
                    icon={<FileText className="w-4 h-4" />}
                    title="PRD文档"
                    status={isLoading && !prdMarkdown ? 'loading' : prdMarkdown ? 'done' : 'pending'}
                    text={isLoading && !prdMarkdown ? '生成中...' : prdMarkdown ? '已生成' : '等待生成'}
                  />
                  <ProgressItem 
                    icon={<GitBranch className="w-4 h-4" />}
                    title="流程图"
                    status={isLoading && !flowchartCode ? 'loading' : flowchartCode ? 'done' : 'pending'}
                    text={isLoading && !flowchartCode ? '生成中...' : flowchartCode ? '已生成' : '等待生成'}
                  />
                </div>
              </div>
            )}

            {/* 导出 */}
            {prdMarkdown && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">导出文档</h3>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  下载PRD.md
                </button>
              </div>
            )}
          </div>

          {/* 右侧：结果展示 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab导航 */}
            <div className="border-b border-gray-200 bg-gray-50/50">
              <div className="flex">
                <TabButton 
                  active={activeTab === 'analyze'} 
                  onClick={() => { setActiveTab('analyze'); analytics.click('tab_switch', { tab: 'analyze' }); }}
                  icon={<Users className="w-4 h-4" />}
                >
                  需求拆解
                </TabButton>
                <TabButton 
                  active={activeTab === 'prd'} 
                  onClick={() => { setActiveTab('prd'); analytics.click('tab_switch', { tab: 'prd' }); }}
                  icon={<FileText className="w-4 h-4" />}
                  badge={prdMarkdown ? 'NEW' : undefined}
                >
                  PRD文档
                </TabButton>
                <TabButton 
                  active={activeTab === 'flowchart'} 
                  onClick={() => { setActiveTab('flowchart'); analytics.click('tab_switch', { tab: 'flowchart' }); }}
                  icon={<GitBranch className="w-4 h-4" />}
                  badge={flowchartCode ? 'NEW' : undefined}
                >
                  流程图
                </TabButton>
              </div>
            </div>

            {/* 内容区 */}
            <div className="p-6 min-h-[600px] overflow-auto">
              {/* 加载 */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">{loadingText}</p>
                  <p className="mt-2 text-sm text-gray-400">预计需要10-20秒</p>
                </div>
              )}

              {/* 空状态 */}
              {!isLoading && !analyzeResult && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">输入产品需求开始</p>
                  <p className="mt-2 text-sm text-center">系统将自动完成需求拆解、PRD生成和流程图绘制</p>
                  <button
                    onClick={() => setTemplateOpen(true)}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    或选择需求模板
                  </button>
                </div>
              )}

              {/* 需求拆解 */}
              {!isLoading && analyzeResult && activeTab === 'analyze' && (
                <AnalyzeDisplay result={analyzeResult} />
              )}

              {/* PRD */}
              {!isLoading && activeTab === 'prd' && (
                prdMarkdown ? (
                  <PRDView markdown={prdMarkdown} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <FileText className="w-12 h-12 mb-4" />
                    <p>PRD文档生成中...</p>
                  </div>
                )
              )}

              {/* 流程图 */}
              {!isLoading && activeTab === 'flowchart' && (
                flowchartCode ? (
                  <FlowchartViewer code={flowchartCode} title="用户流程图" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <GitBranch className="w-12 h-12 mb-4" />
                    <p>流程图生成中...</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 弹窗 */}
      <ConfigPanel isOpen={configOpen} onClose={() => setConfigOpen(false)} />
      <AuthPanel 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onSuccess={handleUserLogin} 
      />
      <HistoryPanel 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        onSelect={handleProjectSelect} 
      />
      <TemplatePanel 
        isOpen={templateOpen} 
        onClose={() => setTemplateOpen(false)} 
        onSelect={handleTemplateSelect} 
      />
    </div>
  );
}

// 组件定义...
function ProgressItem({ icon, title, status, text }: { icon: React.ReactNode; title: string; status: 'pending' | 'loading' | 'done'; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        status === 'done' ? 'bg-green-100 text-green-600' :
        status === 'loading' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
      {status === 'done' && (
        <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

function TabButton({ children, active, onClick, icon, badge }: { children: React.ReactNode; active: boolean; onClick: () => void; icon?: React.ReactNode; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${
        active 
          ? 'border-blue-500 text-blue-600 bg-white' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {children}
      {badge && (
        <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-600">
          {badge}
        </span>
      )}
    </button>
  );
}

function PRDView({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <style jsx>{`
        :global(.prd-doc h1) { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
        :global(.prd-doc h2) { font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; }
        :global(.prd-doc h3) { font-size: 1.1rem; font-weight: 600; color: #374151; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        :global(.prd-doc p) { color: #4b5563; line-height: 1.8; margin-bottom: 0.75rem; }
        :global(.prd-doc ul, .prd-doc ol) { padding-left: 1.5rem; margin-bottom: 0.75rem; }
        :global(.prd-doc li) { color: #4b5563; margin-bottom: 0.375rem; line-height: 1.7; }
        :global(.prd-doc table) { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
        :global(.prd-doc th, .prd-doc td) { border: 1px solid #e5e7eb; padding: 0.625rem 0.875rem; text-align: left; }
        :global(.prd-doc th) { background: #f9fafb; font-weight: 600; color: #374151; }
        :global(.prd-doc td) { color: #4b5563; }
        :global(.prd-doc strong) { color: #111827; font-weight: 600; }
        :global(.prd-doc hr) { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
        :global(.prd-doc code) { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; color: #dc2626; }
        :global(.prd-doc pre) { background: #1f2937; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        :global(.prd-doc pre code) { background: transparent; color: #10b981; padding: 0; }
      `}</style>
      <div className="prd-doc" dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(markdown) }} />
    </div>
  );
}

function parseMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => c.trim().match(/^-+$/))) return '';
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  
  html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');
  html = html.replace(/(<tr>.*<\/tr>)+/g, '<table>$&</table>');
  if (!html.startsWith('<')) html = '<p>' + html + '</p>';
  
  return html;
}

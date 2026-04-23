/**
 * 埋点分析服务
 * 用于追踪用户行为和产品指标
 */

export type EventType = 'click' | 'view' | 'generate' | 'download' | 'save' | 'error';
export type EventName = 
  | 'start_analyze'
  | 'click_generate'
  | 'click_flowchart'
  | 'click_download'
  | 'click_save'
  | 'save'
  | 'tab_switch'
  | 'template_select'
  | 'industry_select'
  | 'api_error'
  | 'render_error'
  | 'page_load'
  | 'analyze_complete'
  | 'prd_complete'
  | 'flowchart_complete'
  | 'template_use'
  | 'login'
  | 'register';

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  name: EventName;
  data: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  duration: number;
}

export interface DailyMetrics {
  date: string;
  pageViews: number;
  uniqueUsers: number;
  generations: number;
  downloads: number;
  avgGenerationTime: number;
  successRate: number;
  topTemplates: { id: string; count: number }[];
  topIndustries: { id: string; count: number }[];
}

const EVENTS_KEY = 'pm_analytics_events';
const SESSION_KEY = 'pm_analytics_session';
const METRICS_KEY = 'pm_analytics_metrics';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 获取当前会话ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// 事件服务
export const analytics = {
  // 记录事件
  track(type: EventType, name: EventName, data: Record<string, any> = {}) {
    if (typeof window === 'undefined') return;
    
    const event: AnalyticsEvent = {
      id: generateId(),
      type,
      name,
      data,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: getSessionId(),
    };
    
    // 存储事件
    const events = this.getEvents();
    events.push(event);
    
    // 只保留最近1000条事件
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    
    // 更新会话统计
    this.updateSessionStats(event);
  },

  // 便捷方法
  click(name: EventName, data?: Record<string, any>) {
    this.track('click', name, data);
  },
  
  view(name: EventName, data?: Record<string, any>) {
    this.track('view', name, data);
  },
  
  generate(name: EventName, data?: Record<string, any>) {
    this.track('generate', name, data);
  },
  
  download(data?: Record<string, any>) {
    this.track('download', 'click_download', data);
  },
  
  error(name: EventName, error: Error) {
    this.track('error', name, {
      message: error.message,
      stack: error.stack,
    });
  },

  // 获取所有事件
  getEvents(): AnalyticsEvent[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(EVENTS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  // 获取当前用户ID
  getCurrentUserId(): string | undefined {
    // 可以从用户服务获取
    return undefined;
  },

  // 更新会话统计
  updateSessionStats(event: AnalyticsEvent) {
    const sessionStats = this.getSessionStats();
    
    // 更新事件计数
    if (!sessionStats.counts[event.name]) {
      sessionStats.counts[event.name] = 0;
    }
    sessionStats.counts[event.name]++;
    
    // 更新类型计数
    if (!sessionStats.typeCounts[event.type]) {
      sessionStats.typeCounts[event.type] = 0;
    }
    sessionStats.typeCounts[event.type]++;
    
    sessionStorage.setItem('pm_session_stats', JSON.stringify(sessionStats));
  },

  // 获取会话统计
  getSessionStats() {
    if (typeof window === 'undefined') {
      return { counts: {}, typeCounts: {}, startTime: Date.now() };
    }
    
    const stored = sessionStorage.getItem('pm_session_stats');
    if (!stored) {
      return { counts: {}, typeCounts: {}, startTime: Date.now() };
    }
    
    try {
      return JSON.parse(stored);
    } catch {
      return { counts: {}, typeCounts: {}, startTime: Date.now() };
    }
  },

  // 计算核心指标
  calculateMetrics(): {
    totalGenerations: number;
    totalDownloads: number;
    successRate: number;
    avgGenerationTime: number;
    topTemplates: { id: string; count: number }[];
    topIndustries: { id: string; count: number }[];
    funnel: {
      visitors: number;
      startedInput: number;
      completedAnalyze: number;
      completedPrd: number;
      downloaded: number;
      rates: {
        inputRate: number;
        analyzeRate: number;
        prdRate: number;
        downloadRate: number;
        overallRate: number;
      };
    };
  } {
    const events = this.getEvents();
    const sessionStats = this.getSessionStats();
    
    // 计算漏斗
    const visitors = new Set(events.filter(e => e.name === 'start_analyze').map(e => e.sessionId)).size;
    const startedInput = sessionStats.counts['start_analyze'] || 0;
    const completedAnalyze = sessionStats.counts['generate'] || 0;
    const completedPrd = events.filter(e => e.name === 'click_generate').length;
    const downloaded = sessionStats.counts['click_download'] || 0;
    
    const rates = {
      inputRate: visitors > 0 ? startedInput / visitors : 0,
      analyzeRate: startedInput > 0 ? completedAnalyze / startedInput : 0,
      prdRate: completedAnalyze > 0 ? completedPrd / completedAnalyze : 0,
      downloadRate: completedPrd > 0 ? downloaded / completedPrd : 0,
      overallRate: visitors > 0 ? downloaded / visitors : 0,
    };
    
    // 统计模板和行业使用
    const templateCounts: Record<string, number> = {};
    const industryCounts: Record<string, number> = {};
    
    events.forEach(e => {
      if (e.data.templateId) {
        templateCounts[e.data.templateId] = (templateCounts[e.data.templateId] || 0) + 1;
      }
      if (e.data.industry) {
        industryCounts[e.data.industry] = (industryCounts[e.data.industry] || 0) + 1;
      }
    });
    
    return {
      totalGenerations: completedPrd,
      totalDownloads: downloaded,
      successRate: 1 - (events.filter(e => e.type === 'error').length / events.length || 0),
      avgGenerationTime: 15000, // 简化，实际应记录每次生成时间
      topTemplates: Object.entries(templateCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topIndustries: Object.entries(industryCounts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      funnel: {
        visitors,
        startedInput,
        completedAnalyze,
        completedPrd,
        downloaded,
        rates,
      },
    };
  },

  // 导出数据（供分析使用）
  exportData() {
    return {
      events: this.getEvents(),
      metrics: this.calculateMetrics(),
      exportedAt: new Date().toISOString(),
    };
  },

  // 清除历史数据
  clearHistory() {
    localStorage.removeItem(EVENTS_KEY);
    sessionStorage.removeItem('pm_session_stats');
  },
};

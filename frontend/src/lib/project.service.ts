/**
 * 需求项目 - 管理和存储PRD项目
 */

export type Industry = 'ecommerce' | '新能源' | '医疗' | '教育' | '金融' | '社交' | '工具' | '其他';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  industry: Industry;
  requirement: string;
  analyzeResult?: any;
  prdMarkdown?: string;
  flowchartCode?: string;
  status: ProjectStatus;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  industry: Industry;
  content: string;
  usageCount: number;
  isBuiltIn: boolean;
  createdAt: number;
}

const PROJECTS_KEY = 'pm_assistant_projects';
const TEMPLATES_KEY = 'pm_assistant_templates';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 项目服务
export const projectService = {
  // 创建项目
  async create(data: Partial<Project>): Promise<Project> {
    const projects = this.getAll();
    
    const project: Project = {
      id: generateId(),
      userId: data.userId || '',
      name: data.name || '未命名项目',
      description: data.description,
      industry: data.industry || '其他',
      requirement: data.requirement || '',
      analyzeResult: data.analyzeResult,
      prdMarkdown: data.prdMarkdown,
      flowchartCode: data.flowchartCode,
      status: 'active',
      tags: data.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    projects.unshift(project);
    this.saveAll(projects);
    
    return project;
  },

  // 更新项目
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = this.getAll();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('项目不存在');
    }
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.saveAll(projects);
    return projects[index];
  },

  // 获取用户所有项目
  getAll(userId?: string): Project[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(PROJECTS_KEY);
    if (!stored) return [];
    
    try {
      const projects: Project[] = JSON.parse(stored);
      if (userId) {
        return projects.filter(p => p.userId === userId);
      }
      return projects;
    } catch {
      return [];
    }
  },

  // 获取单个项目
  getById(id: string): Project | null {
    const projects = this.getAll();
    return projects.find(p => p.id === id) || null;
  },

  // 删除项目
  async delete(id: string): Promise<void> {
    const projects = this.getAll();
    const filtered = projects.filter(p => p.id !== id);
    this.saveAll(filtered);
  },

  // 保存所有项目
  saveAll(projects: Project[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  // 获取最近项目
  getRecent(userId?: string, limit = 5): Project[] {
    return this.getAll(userId)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
};

// 模板服务
export const templateService = {
  // 内置模板
  getBuiltInTemplates(): Template[] {
    return [
      {
        id: 'tpl-ecommerce',
        name: '电商平台',
        description: '适用于各类电商平台产品需求',
        industry: 'ecommerce',
        content: '做一个电商平台，包含商品展示、购物车、订单管理、支付等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-charging',
        name: '新能源充电桩',
        description: '新能源充电桩预约与管理',
        industry: '新能源',
        content: '做一个新能源充电桩预约系统，支持车主预约充电桩、查看充电状态、在线支付等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-healthcare',
        name: '在线问诊',
        description: '医疗健康在线问诊平台',
        industry: '医疗',
        content: '做一个在线问诊平台，支持患者预约挂号、图文/视频问诊、处方开具、药品配送等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-education',
        name: '在线教育',
        description: '在线学习平台',
        industry: '教育',
        content: '做一个在线教育平台，支持课程展示、直播上课、作业批改、学习数据分析等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-fintech',
        name: '金融理财',
        description: '金融理财应用',
        industry: '金融',
        content: '做一个金融理财应用，支持账户管理、理财产品、智能投顾、风险评估等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-social',
        name: '社交应用',
        description: '社交网络应用',
        industry: '社交',
        content: '做一个社交应用，支持动态发布、好友关系、即时通讯、兴趣推荐等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-saas',
        name: 'B2B SaaS',
        description: '企业级SaaS产品',
        industry: '工具',
        content: '做一个B2B SaaS产品，支持多角色权限、数据看板、团队协作、API集成等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
      {
        id: 'tpl-miniapp',
        name: '小程序应用',
        description: '微信/支付宝小程序',
        industry: '工具',
        content: '做一个小程序应用，包含核心业务功能、轻量化交互、微信支付、分享传播等功能',
        usageCount: 0,
        isBuiltIn: true,
        createdAt: 0,
      },
    ];
  },

  // 获取所有模板
  getAll(): Template[] {
    if (typeof window === 'undefined') return this.getBuiltInTemplates();
    
    const stored = localStorage.getItem(TEMPLATES_KEY);
    const builtIn = this.getBuiltInTemplates();
    
    if (!stored) return builtIn;
    
    try {
      const custom: Template[] = JSON.parse(stored);
      return [...builtIn, ...custom];
    } catch {
      return builtIn;
    }
  },

  // 按行业筛选
  getByIndustry(industry: Industry): Template[] {
    return this.getAll().filter(t => t.industry === industry);
  },

  // 使用模板
  async useTemplate(id: string): Promise<Template | null> {
    const templates = this.getAll();
    const template = templates.find(t => t.id === id);
    
    if (template) {
      template.usageCount++;
      // 保存使用统计
      this.saveAll(templates);
    }
    
    return template || null;
  },

  // 保存自定义模板
  async saveCustomTemplate(template: Omit<Template, 'id' | 'usageCount' | 'isBuiltIn' | 'createdAt'>): Promise<Template> {
    const customTemplates = this.getCustom();
    
    const newTemplate: Template = {
      ...template,
      id: generateId(),
      usageCount: 0,
      isBuiltIn: false,
      createdAt: Date.now(),
    };
    
    customTemplates.push(newTemplate);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(customTemplates));
    
    return newTemplate;
  },

  // 获取自定义模板
  getCustom(): Template[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  // 保存所有模板（包含自定义）
  saveAll(templates: Template[]): void {
    if (typeof window === 'undefined') return;
    
    const custom = templates.filter(t => !t.isBuiltIn);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(custom));
  },
};

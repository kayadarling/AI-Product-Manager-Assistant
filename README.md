# AI产品经理助手

一个帮助产品经理快速生成结构化PRD文档和流程图的智能工具。

## 功能特性

- 输入自然语言产品需求
- 自动拆解：用户角色、核心功能、用户流程
- 生成结构化PRD文档（Markdown格式）
- 自动生成Mermaid流程图
- 支持导出：Markdown、Word（.docx）
- 支持任意OpenAI兼容API接口

## 技术栈

### 前端
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- mermaid (流程图渲染)
- react-markdown (Markdown渲染)

### 后端
- Node.js
- Express
- TypeScript
- OpenAI SDK

## 项目结构

```
ai-product-manager/
├── frontend/          # Next.js 前端项目
│   ├── src/
│   │   ├── app/           # 页面
│   │   ├── components/    # React组件
│   │   ├── lib/          # 工具函数
│   │   ├── store/        # 状态管理
│   │   └── types/        # 类型定义
│   └── package.json
│
├── backend/           # Express 后端项目
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── services/      # 业务服务
│   │   ├── prompts/      # AI提示词
│   │   ├── types/        # 类型定义
│   │   └── middleware/   # 中间件
│   └── package.json
│
└── README.md
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd ai-product-manager
```

### 2. 配置后端

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入你的 API Key
```

### 3. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端服务将运行在 http://localhost:3001

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端应用将运行在 http://localhost:3000

### 5. 配置API

1. 打开前端应用
2. 点击右上角「设置」
3. 输入你的 OpenAI API Key
4. 可选择自定义 Base URL 和模型

### 6. 开始使用

1. 在左侧输入产品需求描述
2. 点击「生成PRD」按钮
3. 等待AI分析并生成结果
4. 在右侧查看PRD文档和流程图
5. 使用导出功能下载文档

## 环境变量

### 后端 (.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| OPENAI_API_KEY | OpenAI API Key | - |
| OPENAI_BASE_URL | API地址 | https://api.openai.com/v1 |
| OPENAI_MODEL | 模型名称 | gpt-4o-mini |
| PORT | 服务端口 | 3001 |
| CORS_ORIGIN | 允许的源 | http://localhost:3000 |

### 前端 (.env.local)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| NEXT_PUBLIC_API_URL | 后端API地址 | http://localhost:3001 |

## API接口

### 生成PRD

```
POST /api/prd/generate

Request:
{
  "requirement": "产品需求描述",
  "apiKey": "sk-xxx",
  "baseUrl": "[https://api.openai.com/v1](https://api.deepseek.com/v1)",
  "model": "deepseek-chat"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "roles": [...],
    "features": [...],
    "userFlows": [...],
    "flowchart": "mermaid代码",
    "markdown": "# PRD文档..."
  }
}
```

### 导出Markdown

```
POST /api/export/markdown
Body: { "markdown": "# PRD..." }
```

### 导出Word

```
POST /api/export/docx
Body: PRD文档JSON对象
```

## 开发说明

### 前端开发

```bash
cd frontend
npm run dev     # 开发模式
npm run build   # 生产构建
```

### 后端开发

```bash
cd backend
npm run dev     # 开发模式 (tsx watch)
npm run build   # TypeScript编译
npm start       # 生产运行
```

## License

MIT

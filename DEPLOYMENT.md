# 部署指南

本项目支持 Vercel 和腾讯 EdgePages 双平台部署。

## 项目结构

```
CBThelper/
├── api/
│   └── llm-proxy.js         # Vercel 函数
├── functions/
│   └── api/
│       └── llm-proxy.js     # EdgePages 函数
├── dist/                    # 构建输出目录
└── ...
```

## Vercel 部署

### 1. 环境变量配置
在 Vercel 控制台设置以下环境变量：
```
LLM_API_KEY=你的API密钥
LLM_API_URL=你的API地址（可选，默认为OpenAI）
LLM_MODEL_NAME=模型名称（可选，默认为gpt-3.5-turbo）
```

### 2. 部署步骤
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

Vercel 会自动识别 `/api` 目录下的函数。

## 腾讯 EdgePages 部署

### 1. 环境变量配置
在 EdgePages 控制台的"环境变量"设置中添加：
```
LLM_API_KEY=你的API密钥
LLM_API_URL=你的API地址（可选）
LLM_MODEL_NAME=模型名称（可选）
```

### 2. 部署步骤

1. **登录 EdgePages 控制台**
   - 访问 [EdgePages 控制台](https://edgeone.ai/)
   - 创建新项目或选择现有项目

2. **连接 Git 仓库**
   - 选择 GitHub/GitLab/Gitee 仓库
   - 授权并选择本项目

3. **配置构建设置**
   - 构建命令：`npm run build`
   - 构建输出目录：`dist`
   - 函数目录：`functions`（EdgePages 会自动识别）

4. **设置环境变量**
   - 在"环境变量"页面添加上述变量

5. **部署**
   - 点击"部署"按钮
   - 等待构建完成

### EdgePages 函数说明

EdgePages 使用 `/functions` 目录下的文件作为边缘函数：
- 文件路径映射到 URL 路径
- `/functions/api/llm-proxy.js` → `/api/llm-proxy`
- 使用 `onRequestPost`、`onRequestGet` 等导出函数处理不同 HTTP 方法

## 本地开发

### 启动开发服务器
```bash
# 安装依赖
npm install

# 运行完整开发环境（包括 API 代理）
npm run dev:full

# 或分别运行
npm run serve      # Vue 开发服务器
npm run dev:proxy  # API 代理服务器
```

### 测试 API
本地开发时，API 代理运行在 `http://localhost:3001/api/llm-proxy`

## 平台差异

### Vercel
- 使用 Node.js Runtime
- 函数格式：`export default function(req, res)`
- 环境变量：`process.env.VARIABLE_NAME`

### EdgePages
- 使用 Edge Runtime (类似 CloudFlare Workers)
- 函数格式：`export function onRequestPost(context)`
- 环境变量：`context.env.VARIABLE_NAME`
- 自动处理 CORS

## 故障排查

### 常见问题

1. **本地开发 ES 模块错误**
   - 确保 `api/llm-proxy.js` 同时导出 CommonJS 和 ES 模块格式
   - 已在文件中添加兼容代码

2. **EdgePages 函数未识别**
   - 检查函数是否在 `/functions` 目录下
   - 确保使用正确的导出格式（`onRequestPost` 等）

3. **CORS 错误**
   - Vercel：需要在 `vercel.json` 配置 CORS
   - EdgePages：函数中已包含 CORS 头

4. **环境变量未生效**
   - 重新部署项目
   - 检查变量名是否正确

## 安全建议

1. **API 密钥管理**
   - 使用环境变量，不要硬编码
   - 定期轮换密钥
   - 不同环境使用不同密钥

2. **请求验证**
   - 验证所有输入参数
   - 实施速率限制
   - 记录异常请求

3. **错误处理**
   - 不暴露敏感信息
   - 返回友好的错误提示
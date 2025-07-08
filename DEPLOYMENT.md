# 部署指南

本项目现已支持 Vercel 和腾讯 EdgePages 双平台部署。

## 架构说明

项目使用了统一的适配器模式，自动检测运行环境并使用相应的处理方式：
- `api/llm-proxy-universal.js` - 通用适配器，同时支持两个平台
- `api/llm-proxy.js` - 导出通用适配器（保持向后兼容）
- `api/llm-proxy-edge.js` - EdgePages 专用版本（可选）

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

## 腾讯 EdgePages 部署

### 1. 环境变量配置
在 EdgePages 控制台的"环境变量"设置中添加：
```
LLM_API_KEY=你的API密钥
LLM_API_URL=你的API地址（可选）
LLM_MODEL_NAME=模型名称（可选）
```

### 2. 部署配置
项目已包含 `edgepages.config.js` 和 `wrangler.toml` 配置文件。

### 3. 部署步骤

#### 方法一：通过 EdgePages 控制台
1. 登录腾讯云 EdgePages 控制台
2. 创建新应用，选择 Git 仓库
3. 设置构建命令：`npm run build`
4. 设置输出目录：`dist`
5. 添加环境变量
6. 部署

#### 方法二：使用 CLI
```bash
# 安装 EdgePages CLI
npm i -g @cloudbase/cli

# 登录
tcb login

# 部署
tcb deploy
```

## 本地测试

### 测试 Vercel 环境
```bash
# 安装依赖
npm install

# 运行 Vercel 开发服务器
vercel dev
```

### 测试 EdgePages 环境
```bash
# 安装 Wrangler
npm i -g wrangler

# 运行本地 Workers 环境
wrangler dev
```

## 环境差异说明

### 主要区别
1. **运行时环境**
   - Vercel: Node.js Runtime
   - EdgePages: CloudFlare Workers (Edge Runtime)

2. **环境变量访问**
   - Vercel: `process.env.VARIABLE_NAME`
   - EdgePages: `env.VARIABLE_NAME`

3. **请求/响应处理**
   - Vercel: 使用 `(request, response)` 模式
   - EdgePages: 使用 `fetch(request, env, ctx)` 模式

### 通用适配器如何工作
`llm-proxy-universal.js` 会自动检测运行环境：
```javascript
const isEdgeRuntime = typeof Response !== 'undefined' && typeof addEventListener !== 'undefined';
```

根据环境自动选择合适的处理方式，确保在两个平台上都能正常工作。

## 故障排查

### Vercel 相关问题
1. **函数超时**：检查 `vercel.json` 中的 `maxDuration` 设置
2. **环境变量未生效**：确保在控制台正确设置并重新部署

### EdgePages 相关问题
1. **CORS 错误**：检查响应头是否包含正确的 CORS 配置
2. **环境变量未找到**：确保在 EdgePages 控制台设置了环境变量
3. **函数未触发**：检查 `edgepages.config.js` 中的路由配置

## 性能优化建议

1. **使用边缘节点**：EdgePages 会自动使用最近的边缘节点
2. **启用缓存**：对于相似请求可以考虑添加缓存逻辑
3. **压缩响应**：两个平台都支持自动压缩

## 安全建议

1. **API 密钥管理**：
   - 永远不要在代码中硬编码 API 密钥
   - 使用环境变量存储敏感信息
   - 定期轮换 API 密钥

2. **请求验证**：
   - 验证所有输入参数
   - 限制请求大小
   - 实施速率限制

3. **错误处理**：
   - 不要在错误消息中暴露敏感信息
   - 记录错误但不返回详细的系统信息
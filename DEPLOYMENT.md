# CBT Helper 云端部署指南

## 🚀 Vercel 部署配置

### 环境变量设置
在 Vercel 部署时，需要设置以下环境变量：

```bash
# LLM API 配置 (云端环境变量，优先级更高)
LLM_API_KEY=你的_OpenAI_API_密钥
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL_NAME=gpt-3.5-turbo

# 兼容性环境变量 (如果上述变量不工作，可以尝试这些)
VUE_APP_LLM_API_KEY=你的_OpenAI_API_密钥
VUE_APP_LLM_API_URL=https://api.openai.com/v1/chat/completions
VUE_APP_LLM_MODEL_NAME=gpt-3.5-turbo
```

### 📋 部署步骤

1. **克隆代码到 Vercel**
   ```bash
   git clone https://github.com/ChenM0M/CBThelper.git
   ```

2. **在 Vercel Dashboard 中导入项目**
   - 选择 Git 仓库
   - 选择 CBThelper 项目

3. **配置环境变量**
   - 进入项目设置 → Environment Variables
   - 添加上述所有环境变量
   - 确保 LLM_API_KEY 包含有效的 OpenAI API 密钥

4. **触发部署**
   - Vercel 会自动检测 Vue.js 项目
   - 构建命令：`npm run build`
   - 输出目录：`dist`

### 🔧 修复内容

#### 1. API 认证错误修复
- **问题**: 云端部署时出现 401 认证错误
- **原因**: 环境变量名称不匹配，API 代理无法读取正确的配置
- **解决方案**: 
  - 修改 `api/llm-proxy.js` 支持多种环境变量名称
  - 优先使用 `LLM_API_KEY`，如果不存在则使用 `VUE_APP_LLM_API_KEY`
  - 增强错误日志和调试信息

#### 2. UI 隐藏功能
- **功能**: 详细页面的返回按钮和智能对话在无滑动时自动隐藏
- **实现**: 
  - 添加滑动检测逻辑
  - 支持鼠标滚轮和触摸手势
  - 滑动停止后 3 秒自动隐藏控制元素
  - 平滑的淡入淡出动画效果

### 🐛 故障排除

#### API 连接问题
1. 检查环境变量是否正确设置
2. 验证 API 密钥是否有效
3. 查看 Vercel 函数日志 (`/api/llm-proxy`)
4. 使用应用内的"测试云端连接"功能

#### 环境变量优先级
```
LLM_API_KEY > VUE_APP_LLM_API_KEY
LLM_API_URL > VUE_APP_LLM_API_URL
LLM_MODEL_NAME > VUE_APP_LLM_MODEL_NAME
```

### 📱 功能特性

- ✅ 云端 LLM API 调用
- ✅ 自适应滑动隐藏 UI
- ✅ 移动端触摸支持
- ✅ 详细的错误报告和调试
- ✅ 环境变量兼容性检查

### 🔗 相关文件

- `api/llm-proxy.js` - API 代理和认证逻辑
- `services/llm.service.js` - LLM 服务封装
- `components/CognitiveAnalysis.vue` - 主要 UI 组件
- `components/GardenConfig.vue` - 设置和测试功能

### 💡 使用建议

1. **首次部署后**，立即使用"测试云端连接"功能验证配置
2. **如果遇到 401 错误**，检查环境变量设置是否正确
3. **移动端使用**时，通过滑动手势显示/隐藏控制按钮
4. **桌面端使用**时，通过鼠标滚轮或键盘方向键触发滑动检测

---

🌸 **心灵花园助手** - 让技术为心理健康服务
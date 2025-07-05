# CBT Helper - 心灵花园

> 一个基于认知行为疗法(CBT)原理的Vue.js自助心理健康工具

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## 🌟 项目简介

CBT Helper是一个为学生设计的心理健康自助工具，结合了认知行为疗法(CBT)的核心原理和大语言模型(LLM)的智能分析能力。通过温暖、个性化的界面，帮助用户识别、挑战并重塑不健康的思维模式。

### ✨ 核心特性

- 🧠 **智能思维分析** - 使用LLM识别认知偏差和不健康思维模式
- 💭 **个性化指导** - 基于用户输入生成定制化的重构建议
- 📊 **情绪追踪** - 可视化情绪变化趋势和成长进展
- 🌱 **花园主题** - 采用心灵花园的隐喻，让心理健康变得生动有趣
- 🔒 **隐私保护** - 所有数据存储在本地，保护用户隐私
- 📱 **响应式设计** - 支持桌面端和移动端的良好体验

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/your-username/CBThelper.git
cd CBThelper

# 安装依赖
npm install

# 启动开发服务器
npm run serve

# 构建生产版本
npm run build
```

### 配置LLM服务

1. 打开应用后，点击设置按钮进入花园配置
2. 配置你的LLM API信息：
   - API地址 (如: https://api.openai.com/v1/chat/completions)
   - API密钥
   - 选择或自定义模型名称
3. 测试连接确保配置正确
4. 开始你的心理健康之旅！

## 📁 项目结构

```
CBThelper/
├── README.md                   # 项目文档
├── package.json               # 依赖配置
├── public/                    # 静态资源
│   ├── index.html            # HTML入口
│   └── assets/               # 公共资源
│       └── images/           # 图片资源
├── src/                      # 源代码
│   ├── main.js              # 应用入口
│   └── assets/              # 源代码资源
│       ├── css/             # 样式文件
│       └── images/          # 图片资源
├── components/               # Vue组件
│   ├── MindGarden.vue       # 主页花园界面
│   ├── ThoughtRecord.vue    # 思维记录组件
│   ├── CognitiveAnalysis.vue # 认知分析组件
│   ├── Dashboard.vue        # 成长仪表板
│   ├── GardenConfig.vue     # 花园设置
│   └── ApiConfig.vue        # API配置
├── services/                # 服务层
│   ├── llm.service.js       # LLM交互服务
│   └── ApiError.js          # 错误处理
├── config/                  # 配置文件
│   └── app.config.js        # 应用配置
├── api/                     # API代理
│   └── llm-proxy.js         # LLM代理服务
└── docs/                    # 文档
    ├── README.md            # 技术文档
    ├── CBT_principles.md    # CBT原理说明
    └── test_cases.md        # 测试用例
```

## 🎯 功能模块

### 🏡 心灵花园 (主页)
- 欢迎界面和快速入口
- 成长进度概览
- 直观的导航设计

### 🌱 思维记录
- 情绪状态选择
- 情境描述
- 自动思维记录
- 身体感受追踪

### 🔍 认知分析
- 智能识别认知偏差
- 个性化引导问题
- 思维重构建议
- 深度对话功能

### 📊 成长仪表板
- 情绪变化趋势
- 分析完成进度
- 成长里程碑
- 鼓励性反馈

### ⚙️ 花园设置
- LLM API配置
- 数据导入导出
- 隐私设置管理

## 🧠 CBT原理应用

本应用基于以下CBT核心概念：

- **认知三角形** - 思维、情绪、行为的相互关系
- **自动思维识别** - 识别消极和不准确的思维模式
- **认知重构** - 挑战和替换不健康的思维
- **行为实验** - 通过行动验证新的思维方式

详细原理说明请参考 [CBT原理文档](docs/CBT_principles.md)

## 🛡️ 隐私和安全

- 所有用户数据默认存储在浏览器本地
- 不会向服务器发送个人敏感信息
- 支持数据导出和备份
- 用户完全控制自己的数据

### 开发规范

- 遵循 Vue.js 最佳实践
- 使用语义化的组件和变量命名
- 添加适当的注释和文档
- 确保响应式设计兼容性

## 📄 许可证

本项目采用 Apache License 2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

如果你有任何问题、建议或想要贡献代码，请通过以下方式联系：

- 📧 邮箱: 2895521977@qq.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/ChenM0M/CBThelper/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/ChenM0M/CBThelper/discussions)

---

💚 **让我们一起为心理健康贡献力量，创造一个更温暖的世界！**
# CBT助手 - 项目实施计划

## 项目概述

**项目名称**: CBT助手（CBThelper）  
**目标用户**: 心理上有困扰的学生  
**应用目的**: 提供自我帮助工具，应用认知行为疗法原理  
**开发阶段**: MVP（最小可行产品）  

## 应用核心功能

### 1. 用户思想记录与分析
- 提供界面让用户记录消极想法和情绪
- 使用LLM识别记录中的认知偏差
- 提供CBT框架指导用户挑战不合理想法

### 2. CBT认知重构辅助
- 基于识别的认知偏差，生成个性化问题引导用户质疑和重新评估想法
- 协助用户生成更平衡、更有建设性的替代性想法

### 3. 情绪追踪
- 简单的情绪评分系统，帮助用户跟踪情绪变化
- 可视化情绪变化趋势

### 4. 教育资源
- 提供CBT核心概念和技巧的简明解释
- 情境化的例子说明CBT方法如何应用

### 5. LLM API配置灵活性
- 支持自定义API URL
- 可配置API密钥
- 支持选择不同模型
- 本地保存配置，避免重复输入

### 6. 人性化设计元素
- 虚拟助手/伙伴元素
- 进度与成就系统
- 安心功能（呼吸练习、紧急资源）

## 技术架构

### 前端
- **HTML5/CSS3/JavaScript**: 基础网页技术
- **框架**: Vue.js (轻量级、易于学习)
- **UI组件库**: Bootstrap-Vue 或 Tailwind CSS (美观且响应式)
- **图表库**: Chart.js (用于情绪变化可视化)

### 后端/API集成
- 客户端JavaScript与OpenAI API直接交互
- 支持自定义API配置

### 数据存储
- 使用浏览器的**localStorage**存储用户数据
- 简化MVP阶段的开发流程

## 人性化设计原则

### 视觉设计
- **色彩方案**: 温暖、舒缓的色调
  - 主色：温暖的蓝色（#4A90E2）或柔和的绿色（#5EC57E）
  - 点缀：温暖的橙色（#F5A623）或紫色（#9B6EDD）
  - 背景：柔和的米色（#F9F7F2）
- **字体选择**: 圆润、易读的无衬线字体
- **界面元素**: 圆角设计，避免锐角
- **动画效果**: 轻柔的过渡动画增加活力
- **插图和角色**: 友好、支持性的视觉元素

### 交互设计
- **支持性语言**: 鼓励性文字提示
- **对话式交互**: 非正式、友好的用户界面文案
- **反馈机制**: 积极的反馈和肯定
- **个性化**: 支持用户自定义应用昵称和视觉主题

## 用户流程

1. **初次使用**
   - 欢迎和简短介绍
   - API配置设置
   - 个性化选项（可选）

2. **日常使用流程**
   - 记录思想和情绪
   - 接收认知偏差分析
   - 通过引导问题进行认知重构
   - 追踪情绪变化

## 用户界面设计

### 主要页面

1. **欢迎页/配置页**
   - 温暖的欢迎信息
   - API配置选项
   - 快速入门指南

2. **主仪表板**
   - 个性化问候
   - 快捷访问按钮
   - 情绪追踪简报
   - 成就和进度指标

3. **思想记录页面**
   - 友好的引导提示
   - 表单用于记录情境、想法和情绪
   - 情绪强度评分
   - 支持性引导文字

4. **分析与重构页面**
   - 显示识别的认知偏差
   - 生成个性化引导性问题
   - 鼓励性提示
   - 替代性想法建议

5. **历史记录与进展页面**
   - 过往记录列表
   - 情绪变化图表
   - 积极的进展强调

6. **资源中心**
   - CBT基础知识
   - 常见认知偏差解释
   - 学生特定情境指导

7. **放松角落**
   - 简单的呼吸练习
   - 积极引言
   - 紧急资源链接

## CBT与LLM整合

### LLM功能应用
1. **认知偏差识别**
   - 分析用户输入文本
   - 识别常见认知偏差（如灾难化思维、非黑即白思维等）

2. **苏格拉底式问题生成**
   - 基于识别的偏差生成个性化问题
   - 帮助用户挑战自动化思想

3. **替代性想法建议**
   - 生成更平衡的思考方式
   - 提供符合CBT原则的重构建议

4. **支持性反馈**
   - 生成鼓励性和支持性的反馈
   - 调整语言以增强人情味

### API配置管理
- API URL、Key和模型选择
- 本地安全存储
- 测试连接功能

## 开发阶段计划

### 阶段1：项目搭建（1-2天）
- 设置项目目录结构
- 安装必要依赖
- 配置前端框架
- 创建基础布局

### 阶段2：核心UI开发（3-4天）
- 实现主要页面布局
- 设计风格确定
- 实现响应式设计
- 开发API配置界面

### 阶段3：LLM集成（2-3天）
- 设置API连接
- 实现提示词设计
- 测试LLM响应质量
- 完成配置的安全存储

### 阶段4：功能实现（4-5天）
- 思想记录功能
- 分析与重构功能
- 情绪追踪功能
- 本地数据存储

### 阶段5：情感化元素整合（2-3天）
- 实现虚拟助手角色
- 开发简单成就系统
- 设计并实现反馈机制
- 增加安心功能

### 阶段6：美化与优化（2-3天）
- UI/UX改进
- 性能优化
- 用户反馈调整
- 最终测试

## 文件结构规划

```
CBThelper/
├── index.html                  # 主HTML入口
├── README.md                   # 项目说明
├── assets/                     # 静态资源
│   ├── css/                    # 样式文件
│   ├── js/                     # JavaScript文件
│   └── images/                 # 图片和图标
├── components/                 # Vue组件
│   ├── AppHeader.vue           # 应用头部
│   ├── EmotionTracker.vue      # 情绪追踪组件
│   ├── ThoughtRecord.vue       # 思想记录组件
│   ├── CognitiveRestructuring.vue  # 认知重构组件
│   ├── ApiConfig.vue           # API配置组件
│   └── ...
├── pages/                      # 页面组件
│   ├── Dashboard.vue           # 主仪表盘
│   ├── ThoughtEntry.vue        # 思想记录页面
│   ├── AnalysisPage.vue        # 分析页面
│   ├── HistoryPage.vue         # 历史记录页面
│   ├── ResourcePage.vue        # 资源页面
│   └── RelaxCorner.vue         # 放松角落页面
├── services/                   # 服务
│   ├── apiService.js           # API交互
│   ├── storageService.js       # 本地存储
│   └── llmService.js           # LLM提示词和处理
└── utils/                      # 工具函数
    ├── cbtHelpers.js           # CBT相关辅助函数
    ├── dateUtils.js            # 日期处理
    └── uiHelpers.js            # UI辅助函数
```

## 评估指标

在MVP阶段，我们关注以下指标评估应用成效：
- 用户的参与度（访问频率）
- 情绪评分的变化趋势
- 用户对LLM分析和建议的反馈
- 完成CBT练习的比例

## 后续发展规划

MVP成功后可考虑的扩展方向：
- 用户账户系统
- 云端数据存储
- 更高级的数据分析
- 进阶CBT练习与技巧
- 专业版本供心理健康专家使用
- 社区支持功能
- 多语言支持
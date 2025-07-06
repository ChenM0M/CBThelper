/**
 * 心灵花园 - 应用配置
 * 统一管理环境变量和应用设置
 */

export default {
  // LLM 服务配置
  llm: {
    apiUrl: process.env.LLM_API_URL || process.env.VUE_APP_LLM_API_URL || '',
    apiKey: process.env.LLM_API_KEY || process.env.VUE_APP_LLM_API_KEY || '',
    modelName: process.env.LLM_MODEL_NAME || process.env.VUE_APP_LLM_MODEL_NAME || '',
    maxTokens: 1000,
    temperature: 0.7
  },

  // 功能开关
  features: {
    wisdomCompanionEnabled: process.env.VUE_APP_WISDOM_COMPANION_ENABLED === 'true',
    autoAnalysisEnabled: process.env.VUE_APP_AUTO_ANALYSIS_ENABLED === 'true',
    emotionMultiSelectEnabled: process.env.VUE_APP_EMOTION_MULTI_SELECT_ENABLED === 'true'
  },

  // 界面限制
  limits: {
    maxThoughtLength: parseInt(process.env.VUE_APP_MAX_THOUGHT_LENGTH) || 500,
    maxAnalysisRetries: parseInt(process.env.VUE_APP_MAX_ANALYSIS_RETRIES) || 3
  },

  // 调试配置
  debug: {
    enabled: process.env.VUE_APP_DEBUG_MODE === 'true',
    logLevel: 'info'
  },

  // 温馨提示配置
  messages: {
    companionDisabled: [
      "智慧伙伴暂时在花园里休息，请稍后再来 🌙",
      "温室的花朵依然为你绽放，静待智慧伙伴归来 ✨",
      "花园正在为智慧伙伴准备更舒适的环境 🌸",
      "智慧伙伴去采集新的花朵智慧，很快就会回来 🌻"
    ],
    analysisUnavailable: [
      "分析功能暂时不可用，但你依然可以记录美好的想法 💭",
      "种子已播下，静待花朵绽放的时刻 🌱"
    ]
  },

  // 认知偏差类型配置
  cognitiveDistortions: [
    { 
      type: '灾难化思维', 
      label: '🌪️ 风暴放大镜', 
      description: '把小雨看成了暴风雨' 
    },
    { 
      type: '非黑即白', 
      label: '⚫⚪ 单色眼镜', 
      description: '世界其实有很多美丽的色彩' 
    },
    { 
      type: '过度概括', 
      label: '🔄 单例循环', 
      description: '一朵花不代表整个花园' 
    },
    { 
      type: '情绪推理', 
      label: '💭 感受判官', 
      description: '心情会给思维戴上有色眼镜' 
    },
    { 
      type: '心理过滤', 
      label: '🔍 负面放大镜', 
      description: '只看到了凋谢，错过了新芽' 
    },
    { 
      type: '读心术', 
      label: '🔮 心灵解读', 
      description: '别人的想法比你想象的更复杂' 
    },
    { 
      type: '标签化', 
      label: '🏷️ 固定标签', 
      description: '人比标签更立体更丰富' 
    }
  ]
}
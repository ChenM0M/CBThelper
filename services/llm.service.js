// services/llm.service.js
import { ApiError } from './ApiError';

class LLMService {
  constructor() {
    // 根据环境选择API路径
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/llm-proxy' 
      : 'http://localhost:3001/api/llm-proxy';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1秒
    this.vueInstance = null; // 存储Vue实例引用
  }

  /**
   * 设置Vue实例引用
   * @param {Object} vueInstance Vue组件实例
   */
  setVueInstance(vueInstance) {
    this.vueInstance = vueInstance;
  }

  /**
   * 获取当前的API配置
   * @param {Object} vueInstance Vue组件实例，可选
   * @returns {Object} API配置
   */
  getApiConfig(vueInstance = null) {
    let store = null;
    
    // 尝试多种方式访问store
    if (vueInstance && vueInstance.$store) {
      store = vueInstance.$store.state;
    } else if (window.$store) {
      store = window.$store.state;
    } else if (window.vueApp && window.vueApp.config.globalProperties.$store) {
      store = window.vueApp.config.globalProperties.$store.state;
    }
    
    if (!store) {
      console.warn('[LLM] 无法访问store，使用默认配置');
      return {
        apiKey: '',
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-turbo'
      };
    }

    // 安全地获取配置，确保默认值有效
    const apiKey = store.apiConfig?.apiKey || '';
    const apiUrl = store.apiConfig?.endpoint || store.apiConfig?.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    const model = store.apiConfig?.model || 'qwen-turbo';

    // 验证模型名是否有效 - 排除无效值如 '0', 'undefined', 'null' 等
    const validModel = model && 
                      typeof model === 'string' && 
                      model.length > 0 && 
                      model !== '0' && 
                      model !== 'undefined' && 
                      model !== 'null' && 
                      !model.match(/^\d+$/) ? model : 'qwen-turbo';

    console.log('[LLM] 获取API配置:', {
      hasApiKey: !!apiKey,
      apiUrl,
      model: validModel,
      rawModel: model
    });

    return {
      apiKey,
      apiUrl,
      model: validModel
    };
  }

  /**
   * 发送请求到LLM服务
   * @param {Object} options 请求选项
   * @param {number} retryCount 当前重试次数
   * @returns {Promise<Object>} 响应数据
   */
  async sendRequest(options, retryCount = 0) {
    try {
      const config = this.getApiConfig(this.vueInstance);
      
      console.log(`[LLM] 发送请求 (尝试 ${retryCount + 1}/${this.maxRetries + 1})`, {
        messageCount: options.messages?.length,
        firstMessage: options.messages?.[0]?.content?.substring(0, 50) + '...',
        hasApiKey: !!config.apiKey,
        apiUrl: config.apiUrl,
        baseUrl: this.baseUrl
      });

      // 在生产环境或开发环境都使用代理
      const requestUrl = this.baseUrl;
      const requestHeaders = {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey || '',
        'X-API-URL': config.apiUrl || '',
        'X-Model-Name': config.model || 'qwen-turbo'
      };

      // 确保请求体包含模型信息
      const requestBody = JSON.stringify({
        ...options,
        model: config.model || 'qwen-turbo'
      });

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
      });

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('[LLM] 收到非JSON响应:', {
          status: response.status,
          contentType,
          text: text.substring(0, 200)
        });
        throw new ApiError(
          '服务器返回了非JSON响应',
          'INVALID_RESPONSE_TYPE',
          { contentType, preview: text.substring(0, 100) },
          response.status
        );
      }

      // 解析响应
      const data = await response.json();

      // 处理错误响应
      if (!response.ok) {
        throw ApiError.fromResponse(response, data);
      }

      // 验证响应格式
      if (!data.content && !data.choices?.[0]?.message?.content) {
        throw new ApiError(
          '无效的响应格式',
          'INVALID_RESPONSE_FORMAT',
          {
            received: Object.keys(data),
            expected: ['content', 'choices[0].message.content']
          },
          response.status
        );
      }

      return {
        content: data.content || data.choices[0].message.content,
        usage: data.usage,
        model: data.model
      };

    } catch (error) {
      // 记录错误
      console.error('[LLM] 请求失败:', {
        attempt: retryCount + 1,
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.status
        }
      });

      // 特殊处理404错误（API路径不存在）
      if (error.message?.includes('404') || error.status === 404) {
        throw new ApiError(
          '智慧伙伴服务暂时不可用，请稍后再试，或检查网络连接',
          'API_ENDPOINT_NOT_FOUND',
          {
            baseUrl: this.baseUrl,
            suggestion: '请确认服务器配置正确'
          },
          404
        );
      }

      // 对于某些错误类型进行重试
      const shouldRetry = this.shouldRetryError(error) && retryCount < this.maxRetries;
      
      if (shouldRetry) {
        console.log(`[LLM] 等待 ${this.retryDelay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.sendRequest(options, retryCount + 1);
      }

      // 转换为ApiError
      throw error instanceof ApiError ? error : ApiError.fromError(error);
    }
  }

  /**
   * 判断是否应该重试请求
   * @param {Error} error 错误对象
   * @returns {boolean}
   */
  shouldRetryError(error) {
    // 网络错误、超时等临时性错误
    if (!error.status || error.status >= 500) return true;
    
    // 特定的错误代码不重试
    const nonRetryableCodes = [
      'INVALID_API_KEY',
      'INVALID_REQUEST',
      'INVALID_RESPONSE_FORMAT'
    ];
    
    return !nonRetryableCodes.includes(error.code);
  }

  /**
   * 分析用户想法
   * @param {Object} thoughtRecord 思想记录
   * @returns {Promise<string>} 分析结果
   */
  async analyzeThought(thoughtRecord) {
    const systemPrompt = {
      role: "system",
      content: `你是一位温柔、专业的心理咨询师，专注于认知行为疗法(CBT)。
你的任务是帮助用户分析他们的想法，识别认知偏差，并引导他们发展更健康的思维方式。

请严格按照以下格式回复：

共情理解：
[用温暖的语气写2-3句话，表达对用户情况的理解和共情]

认知偏差：
1. [偏差类型]: [简短解释这种思维方式如何体现在用户的想法中]
2. [偏差类型]: [简短解释]
(识别1-3个主要的认知偏差)

引导问题：
1. [一个探索性问题，帮助用户深入理解自己的想法]
2. [一个挑战性问题，帮助用户看到不同的视角]
3. [一个行动导向的问题，引导用户采取积极的步骤]

鼓励：
[写一段温暖有力的话，肯定用户的勇气，给出具体的前进方向，同时表达对用户成长的信心]

请使用温暖友善的语气，避免说教或批评。每个部分要简洁有力。`
    };

    const userMessage = {
      role: "user",
      content: `我现在的心情是：${thoughtRecord.emotions.join('、')}
我遇到的情况是：${thoughtRecord.situation || '(未描述具体情境)'}
我的想法是：${thoughtRecord.automaticThought}`
    };

    try {
      console.log('[LLM] 开始分析思想记录:', {
        emotions: thoughtRecord.emotions,
        hasThought: !!thoughtRecord.automaticThought,
        hasSituation: !!thoughtRecord.situation
      });

      const response = await this.sendRequest({
        messages: [systemPrompt, userMessage],
        temperature: 0.7,
        max_tokens: 1000
      });

      return response.content;

    } catch (error) {
      console.error('[LLM] 分析失败:', error);
      throw new ApiError(
        '很抱歉，分析过程中遇到了问题。请稍后再试。',
        'ANALYSIS_FAILED',
        error.details,
        error.status
      );
    }
  }

  /**
   * 继续对话
   * @param {Array} chatHistory 对话历史
   * @param {string} userMessage 用户消息
   * @param {Object} context 对话上下文
   * @returns {Promise<string>} 助手回复
   */
  async continueChat(chatHistory, userMessage, context = {}) {
    // 构建更详细的系统提示
    const analysisContext = context.analysis ? this.formatAnalysisContext(context.analysis) : '';
    const emotionalContext = this.buildEmotionalContext(context);
    
    const systemPrompt = {
      role: "system",
      content: `你是一位温柔、专业的心理咨询师，专注于认知行为疗法(CBT)。
你正在与一位用户进行深入对话。以下是用户的完整背景信息：

## 用户情况概览
${emotionalContext}

## 思维分析结果
${analysisContext}

## 对话指导原则
1. **温暖共情**: 用温暖的语气回应，表达理解和支持
2. **循序渐进**: 不要一次提供太多建议，专注于当前话题
3. **启发引导**: 多用开放性问题帮助用户自我探索
4. **具体实用**: 提供具体可行的建议和练习
5. **简洁有力**: 回复控制在2-3句话，避免冗长说教
6. **CBT技巧**: 适时运用认知重构、行为实验等CBT技巧

请基于用户的具体情况和当前对话内容，提供个性化的回应。`
    };

    const messages = [
      systemPrompt,
      ...chatHistory,
      { role: "user", content: userMessage }
    ];

    try {
      console.log('[LLM] 继续对话:', {
        historyLength: chatHistory.length,
        newMessage: userMessage.substring(0, 50) + '...',
        context: {
          emotions: context.emotions,
          hasThought: !!context.thought,
          hasSituation: !!context.situation,
          biasCount: context.analysis?.cognitiveBiases?.length
        }
      });

      const response = await this.sendRequest({
        messages,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.content;

    } catch (error) {
      console.error('[LLM] 对话失败:', error);
      throw new ApiError(
        '很抱歉，我现在遇到了一些问题。让我们稍后再继续对话。',
        'CHAT_FAILED',
        error.details,
        error.status
      );
    }
  }

  /**
   * 格式化分析上下文
   * @param {Object} analysis 分析结果
   * @returns {string} 格式化的分析上下文
   */
  formatAnalysisContext(analysis) {
    if (!analysis) return '暂无分析结果';
    
    const parts = [];
    
    // 共情理解
    if (analysis.empathy) {
      parts.push(`**共情理解**: ${analysis.empathy}`);
    }
    
    // 认知偏差
    if (analysis.cognitiveBiases && analysis.cognitiveBiases.length > 0) {
      const biases = analysis.cognitiveBiases.map(bias => 
        `  - ${bias.label}: ${bias.description}`
      ).join('\n');
      parts.push(`**识别的认知偏差**:\n${biases}`);
    }
    
    // 引导问题
    if (analysis.guidingQuestions && analysis.guidingQuestions.length > 0) {
      const questions = analysis.guidingQuestions.map((q, index) => 
        `  ${index + 1}. ${q.text}`
      ).join('\n');
      parts.push(`**建议的探索方向**:\n${questions}`);
    }
    
    return parts.join('\n\n') || '暂无分析结果';
  }

  /**
   * 构建情感上下文
   * @param {Object} context 对话上下文
   * @returns {string} 格式化的情感上下文
   */
  buildEmotionalContext(context) {
    const parts = [];
    
    // 情绪状态
    if (context.emotions && context.emotions.length > 0) {
      parts.push(`**当前情绪**: ${context.emotions.join('、')}`);
    }
    
    // 具体情境
    if (context.situation) {
      parts.push(`**遇到的情况**: ${context.situation}`);
    }
    
    // 主要想法
    if (context.thought) {
      parts.push(`**内心想法**: "${context.thought}"`);
    }
    
    // 记录时间（如果有的话）
    if (context.timestamp) {
      const timeStr = new Date(context.timestamp).toLocaleString('zh-CN');
      parts.push(`**记录时间**: ${timeStr}`);
    }
    
    return parts.join('\n') || '用户暂未提供详细情况描述';
  }
}

// 导出单例实例
export default new LLMService(); 
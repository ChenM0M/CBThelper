// api/llm-proxy.js

// Use dynamic import for node-fetch if needed, but Vercel's runtime might have fetch globally
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(request, response) {
  // 详细的请求日志
  console.log('收到API请求:', {
    method: request.method,
    headers: {
      'content-type': request.headers['content-type'],
      'user-agent': request.headers['user-agent']
    },
    body: request.body ? {
      model: request.body.model,
      messages: request.body.messages?.length
    } : null
  });

  // 只允许POST请求
  if (request.method !== 'POST') {
    console.error(`请求方法错误: ${request.method}`);
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: `不支持 ${request.method} 方法，只接受 POST 请求`,
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  const { prompt, messages, model, temperature, max_tokens } = request.body;

  // 验证请求体
  if (!prompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
    console.error('请求缺少必要参数:', request.body);
    return response.status(400).json({
      error: 'Bad Request',
      message: '请求必须包含 prompt 或 messages 参数',
      code: 'MISSING_REQUIRED_PARAMS',
      details: {
        required: ['prompt 或 messages'],
        received: Object.keys(request.body)
      }
    });
  }

  // 获取环境变量和请求配置
  // 优先使用直接的环境变量，然后是VUE_APP_前缀的变量
  const envApiKey = process.env.LLM_API_KEY || process.env.VUE_APP_LLM_API_KEY;
  const envApiUrl = process.env.LLM_API_URL || process.env.VUE_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const envDefaultModel = process.env.LLM_MODEL_NAME || process.env.VUE_APP_LLM_MODEL_NAME || 'gpt-3.5-turbo';

  // 从请求头中获取配置
  const configApiKey = request.headers['x-api-key'];
  const configApiUrl = request.headers['x-api-url'];
  const configModel = request.headers['x-model-name'];

  // 优先使用请求中的配置
  const apiKey = configApiKey || envApiKey;
  const apiUrl = configApiUrl || envApiUrl;
  const defaultModel = configModel || envDefaultModel;

  // 验证API配置
  if (!apiKey) {
    console.error('缺少API密钥配置:', {
      envApiKey: !!envApiKey,
      configApiKey: !!configApiKey,
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('LLM') || key.includes('API'))
    });
    return response.status(401).json({
      error: 'Authentication Error',
      message: '未配置API密钥或密钥无效',
      code: 'MISSING_API_KEY',
      details: {
        required: ['API密钥'],
        help: '请在环境变量中设置 LLM_API_KEY 或在花园设置中配置API密钥',
        envCheck: {
          hasLLM_API_KEY: !!process.env.LLM_API_KEY,
          hasVUE_APP_LLM_API_KEY: !!process.env.VUE_APP_LLM_API_KEY
        }
      }
    });
  }

  try {
    console.log('准备调用LLM API:', {
      url: apiUrl,
      model: model || defaultModel,
      messageCount: messages?.length,
      hasApiKey: !!apiKey,
      apiKeySource: configApiKey ? 'request-header' : 'environment',
      environment: process.env.NODE_ENV || 'unknown'
    });

    // 验证请求格式
    if (messages && !Array.isArray(messages)) {
      throw new Error('messages必须是数组格式');
    }

    // 构建请求选项
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || defaultModel,
        messages: messages || [{ role: 'user', content: prompt }],
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.2
      }),
    };

    // 发送请求到LLM API
    const llmResponse = await fetch(apiUrl, requestOptions);
    const contentType = llmResponse.headers.get('content-type');
    
    // 详细的响应日志
    console.log('LLM API响应:', {
      status: llmResponse.status,
      statusText: llmResponse.statusText,
      contentType,
      headers: Object.fromEntries([...llmResponse.headers])
    });

    // 处理非JSON响应
    if (!contentType?.includes('application/json')) {
      const text = await llmResponse.text();
      console.error('收到非JSON响应:', {
        status: llmResponse.status,
        contentType,
        responseText: text.substring(0, 200)
      });

      // 检查是否是HTML错误页面
      if (text.includes('<!DOCTYPE html>')) {
        return response.status(502).json({
          error: 'Invalid Response',
          message: '上游服务返回了HTML页面，可能是网络或代理问题',
          code: 'HTML_RESPONSE',
          details: {
            status: llmResponse.status,
            contentType,
            preview: text.substring(0, 100) + '...',
            suggestion: '请检查网络连接和代理设置'
          }
        });
      }

      return response.status(502).json({
        error: 'Invalid Response',
        message: '上游服务返回了非JSON响应',
        code: 'INVALID_UPSTREAM_RESPONSE',
        details: {
          status: llmResponse.status,
          contentType,
          preview: text.substring(0, 100) + '...'
        }
      });
    }

    const data = await llmResponse.json();

    // 处理API错误
    if (!llmResponse.ok) {
      console.error('LLM API错误:', data);
      
      // 处理常见错误
      if (data.error?.code === 'invalid_api_key' || data.error?.type === 'invalid_request_error') {
        return response.status(401).json({
          error: 'Authentication Error',
          message: 'API密钥无效或已过期',
          code: 'INVALID_API_KEY',
          details: {
            originalError: data.error,
            suggestion: '请检查API密钥是否正确，或者尝试重新生成密钥',
            apiKeySource: configApiKey ? 'request-header' : 'environment'
          }
        });
      }
      
      // 处理401认证错误
      if (llmResponse.status === 401) {
        return response.status(401).json({
          error: 'Authentication Error',
          message: '认证失败：API密钥无效',
          code: 'AUTHENTICATION_FAILED',
          details: {
            status: llmResponse.status,
            originalError: data.error,
            suggestion: '请检查API密钥是否正确配置'
          }
        });
      }

      if (llmResponse.status === 429) {
        return response.status(429).json({
          error: 'Rate Limit',
          message: '已达到API调用限制',
          code: 'RATE_LIMIT',
          details: {
            retryAfter: llmResponse.headers.get('retry-after'),
            suggestion: '请稍后再试，或检查API使用配额'
          }
        });
      }

      return response.status(llmResponse.status).json({
        error: 'Upstream API Error',
        message: data.error?.message || '与LLM服务通信时发生错误',
        code: 'UPSTREAM_API_ERROR',
        details: {
          ...data.error,
          suggestion: '如果问题持续，请联系技术支持'
        }
      });
    }

    // 验证响应格式
    if (!data.choices?.[0]?.message?.content && !data.content) {
      console.error('无效的API响应格式:', data);
      return response.status(502).json({
        error: 'Invalid Response Format',
        message: 'LLM服务返回了无效的响应格式',
        code: 'INVALID_RESPONSE_FORMAT',
        details: {
          expected: ['choices[0].message.content', 'content'],
          received: Object.keys(data),
          suggestion: '请确保API返回了正确的响应格式'
        }
      });
    }

    // 返回成功响应
    return response.status(200).json({
      content: data.choices?.[0]?.message?.content || data.content,
      model: data.model || model || defaultModel,
      usage: data.usage
    });

  } catch (error) {
    // 详细的错误日志
    console.error('处理请求时发生错误:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // 网络错误处理
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return response.status(503).json({
        error: 'Network Error',
        message: '无法连接到LLM服务',
        code: 'NETWORK_ERROR',
        details: {
          type: error.name,
          message: error.message,
          suggestion: '请检查网络连接和API地址配置'
        }
      });
    }

    // 返回友好的错误响应
    return response.status(500).json({
      error: 'Internal Server Error',
      message: '处理请求时发生意外错误',
      code: 'INTERNAL_SERVER_ERROR',
      details: {
        type: error.name,
        message: error.message,
        suggestion: '如果问题持续，请检查服务器日志或联系技术支持',
        // 在开发环境下包含更多调试信息
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack
        })
      }
    });
  }
} 
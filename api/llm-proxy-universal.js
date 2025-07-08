// api/llm-proxy-universal.js
// Universal adapter for both Vercel and EdgePages deployments

// Detect runtime environment
const isEdgeRuntime = typeof Response !== 'undefined' && typeof addEventListener !== 'undefined';

// Shared business logic
async function handleLLMRequest(requestData, headers, env) {
  const { messages, temperature, max_tokens } = requestData;

  // 验证请求体
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      status: 400,
      body: {
        error: 'Bad Request',
        message: '请求必须包含 messages 参数',
        code: 'MISSING_REQUIRED_PARAMS',
        details: {
          required: ['messages'],
          received: Object.keys(requestData)
        }
      }
    };
  }

  // 配置优先级：请求头 > 环境变量
  const apiKey = headers['x-api-key'] || env.LLM_API_KEY || env.VUE_APP_LLM_API_KEY;
  const apiUrl = headers['x-api-url'] || env.LLM_API_URL || env.VUE_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const modelName = headers['x-model-name'] || env.LLM_MODEL_NAME || env.VUE_APP_LLM_MODEL_NAME || 'gpt-3.5-turbo';

  // 记录配置
  console.log('使用配置:', {
    apiUrl,
    modelName,
    hasApiKey: !!apiKey,
    runtime: isEdgeRuntime ? 'edge' : 'node'
  });

  // 验证API配置
  if (!apiKey) {
    return {
      status: 401,
      body: {
        error: 'Authentication Error',
        message: '未配置API密钥',
        code: 'MISSING_API_KEY',
        details: {
          help: '请在环境变量中设置 LLM_API_KEY 或在请求头中提供 X-API-Key'
        }
      }
    };
  }

  try {
    // 调用LLM API
    const llmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.2
      }),
    });

    const contentType = llmResponse.headers.get('content-type');
    
    // 处理非JSON响应
    if (!contentType?.includes('application/json')) {
      const text = await llmResponse.text();
      return {
        status: 502,
        body: {
          error: 'Invalid Response',
          message: '上游服务返回了非JSON响应',
          code: 'INVALID_UPSTREAM_RESPONSE',
          details: {
            status: llmResponse.status,
            contentType,
            preview: text.substring(0, 100) + '...'
          }
        }
      };
    }

    const data = await llmResponse.json();

    // 处理API错误
    if (!llmResponse.ok) {
      return {
        status: llmResponse.status,
        body: {
          error: data.error?.type || 'API Error',
          message: data.error?.message || '调用LLM服务时发生错误',
          code: data.error?.code || 'API_ERROR',
          details: data.error
        }
      };
    }

    // 验证响应格式
    if (!data.choices?.[0]?.message?.content) {
      return {
        status: 502,
        body: {
          error: 'Invalid Response Format',
          message: 'LLM服务返回了无效的响应格式',
          code: 'INVALID_RESPONSE_FORMAT',
          details: {
            expected: ['choices[0].message.content'],
            received: Object.keys(data)
          }
        }
      };
    }

    // 返回成功响应
    return {
      status: 200,
      body: {
        content: data.choices[0].message.content,
        model: data.model || modelName,
        usage: data.usage
      }
    };

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return {
      status: 500,
      body: {
        error: 'Internal Server Error',
        message: '处理请求时发生意外错误',
        code: 'INTERNAL_SERVER_ERROR',
        details: {
          type: error.name,
          message: error.message
        }
      }
    };
  }
}

// Vercel handler
async function vercelHandler(request, response) {
  console.log('Vercel runtime detected');

  // 只允许POST请求
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: `不支持 ${request.method} 方法，只接受 POST 请求`,
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  const headers = {
    'x-api-key': request.headers['x-api-key'],
    'x-api-url': request.headers['x-api-url'],
    'x-model-name': request.headers['x-model-name']
  };

  const result = await handleLLMRequest(request.body, headers, process.env);
  return response.status(result.status).json(result.body);
}

// EdgePages handler
async function edgeHandler(request, env, ctx) {
  console.log('Edge runtime detected');

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-API-URL, X-Model-Name',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 只允许POST请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method Not Allowed',
      message: `不支持 ${request.method} 方法，只接受 POST 请求`,
      code: 'METHOD_NOT_ALLOWED'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Allow': 'POST'
      }
    });
  }

  try {
    const requestData = await request.json();
    const headers = {
      'x-api-key': request.headers.get('x-api-key'),
      'x-api-url': request.headers.get('x-api-url'),
      'x-model-name': request.headers.get('x-model-name')
    };

    const result = await handleLLMRequest(requestData, headers, env);
    
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Bad Request',
      message: '无效的JSON请求体',
      code: 'INVALID_JSON',
      details: { error: error.message }
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

// Export for both environments
if (isEdgeRuntime) {
  // EdgePages export
  export default {
    fetch: edgeHandler
  };
} else {
  // Vercel export
  export default vercelHandler;
}
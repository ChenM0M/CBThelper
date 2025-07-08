// functions/api/llm-proxy.js
// EdgePages function following the official format

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-API-URL, X-Model-Name',
  };

  try {
    // Parse request body
    const requestBody = await request.json();
    const { messages, temperature, max_tokens } = requestBody;

    // 验证请求体
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({
        error: 'Bad Request',
        message: '请求必须包含 messages 参数',
        code: 'MISSING_REQUIRED_PARAMS',
        details: {
          required: ['messages'],
          received: Object.keys(requestBody)
        }
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 配置优先级：请求头 > 环境变量
    const apiKey = request.headers.get('x-api-key') || env.LLM_API_KEY || env.VUE_APP_LLM_API_KEY;
    const apiUrl = request.headers.get('x-api-url') || env.LLM_API_URL || env.VUE_APP_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    const modelName = request.headers.get('x-model-name') || env.LLM_MODEL_NAME || env.VUE_APP_LLM_MODEL_NAME || 'gpt-3.5-turbo';

    // 记录配置
    console.log('使用配置:', {
      apiUrl,
      modelName,
      hasApiKey: !!apiKey,
      runtime: 'EdgePages'
    });

    // 验证API配置
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Authentication Error',
        message: '未配置API密钥',
        code: 'MISSING_API_KEY',
        details: {
          help: '请在环境变量中设置 LLM_API_KEY 或在请求头中提供 X-API-Key'
        }
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

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
      return new Response(JSON.stringify({
        error: 'Invalid Response',
        message: '上游服务返回了非JSON响应',
        code: 'INVALID_UPSTREAM_RESPONSE',
        details: {
          status: llmResponse.status,
          contentType,
          preview: text.substring(0, 100) + '...'
        }
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const data = await llmResponse.json();

    // 处理API错误
    if (!llmResponse.ok) {
      return new Response(JSON.stringify({
        error: data.error?.type || 'API Error',
        message: data.error?.message || '调用LLM服务时发生错误',
        code: data.error?.code || 'API_ERROR',
        details: data.error
      }), {
        status: llmResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 验证响应格式
    if (!data.choices?.[0]?.message?.content) {
      return new Response(JSON.stringify({
        error: 'Invalid Response Format',
        message: 'LLM服务返回了无效的响应格式',
        code: 'INVALID_RESPONSE_FORMAT',
        details: {
          expected: ['choices[0].message.content'],
          received: Object.keys(data)
        }
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // 返回成功响应
    return new Response(JSON.stringify({
      content: data.choices[0].message.content,
      model: data.model || modelName,
      usage: data.usage
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: '处理请求时发生意外错误',
      code: 'INTERNAL_SERVER_ERROR',
      details: {
        type: error.name,
        message: error.message
      }
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-API-URL, X-Model-Name',
    }
  });
}
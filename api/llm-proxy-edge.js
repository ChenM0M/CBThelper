// api/llm-proxy-edge.js
// EdgePages (CloudFlare Workers) compatible version

export default {
  async fetch(request, env, ctx) {
    // 详细的请求日志
    console.log('收到API请求:', {
      method: request.method,
      headers: {
        'content-type': request.headers.get('content-type'),
        'x-api-key': request.headers.get('x-api-key') ? '已设置' : '未设置',
        'x-api-url': request.headers.get('x-api-url'),
        'x-model-name': request.headers.get('x-model-name')
      },
      url: request.url,
      env: {
        hasLLM_API_KEY: !!env.LLM_API_KEY,
        hasVUE_APP_LLM_API_KEY: !!env.VUE_APP_LLM_API_KEY,
        LLM_API_URL: env.LLM_API_URL,
        VUE_APP_LLM_API_URL: env.VUE_APP_LLM_API_URL
      }
    });

    // CORS headers for EdgePages
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-API-URL, X-Model-Name',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 只允许POST请求
    if (request.method !== 'POST') {
      console.error(`请求方法错误: ${request.method}`);
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

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('解析请求体失败:', error);
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

    const { messages, temperature, max_tokens } = requestBody;

    // 验证请求体
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('请求缺少必要参数:', requestBody);
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

    // 记录最终使用的配置（不包含敏感信息）
    console.log('使用配置:', {
      apiUrl,
      modelName,
      hasApiKey: !!apiKey,
      source: {
        apiKey: request.headers.get('x-api-key') ? 'header' : env.LLM_API_KEY ? 'env' : 'vue_env',
        apiUrl: request.headers.get('x-api-url') ? 'header' : env.LLM_API_URL ? 'env' : 'vue_env',
        modelName: request.headers.get('x-model-name') ? 'header' : env.LLM_MODEL_NAME ? 'env' : 'vue_env'
      }
    });

    // 验证API配置
    if (!apiKey) {
      console.error('缺少API密钥配置');
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

    try {
      // 构建请求选项
      const requestOptions = {
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
        console.error('LLM API错误:', data);
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
        console.error('无效的API响应格式:', data);
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
};
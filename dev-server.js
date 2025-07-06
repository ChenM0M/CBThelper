// 首先加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态资源服务 - 为开发环境提供静态资源
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// 日志环境变量状态
console.log('🔍 环境变量检查:');
console.log('LLM_API_KEY:', process.env.LLM_API_KEY ? '已设置' : '未设置');
console.log('VUE_APP_LLM_API_KEY:', process.env.VUE_APP_LLM_API_KEY ? '已设置' : '未设置');
console.log('LLM_API_URL:', process.env.LLM_API_URL || '未设置');
console.log('VUE_APP_LLM_API_URL:', process.env.VUE_APP_LLM_API_URL || '未设置');

// 动态导入 llm-proxy 模块
async function loadLLMProxy() {
  try {
    const llmProxyPath = path.join(__dirname, 'api', 'llm-proxy.js');
    delete require.cache[require.resolve(llmProxyPath)];
    const module = await import('file://' + llmProxyPath);
    return module.default;
  } catch (error) {
    console.error('无法加载 llm-proxy 模块:', error);
    return null;
  }
}

// 模拟 Vercel 的请求格式
app.post('/api/llm-proxy', async (req, res) => {
  try {
    const llmProxyHandler = await loadLLMProxy();
    
    if (!llmProxyHandler) {
      return res.status(500).json({
        error: 'Service Unavailable',
        message: 'LLM代理服务不可用'
      });
    }

    // 模拟 Vercel 的 request/response 对象
    const mockRequest = {
      method: 'POST',
      headers: req.headers,
      body: req.body
    };

    const mockResponse = {
      status: (code) => {
        res.status(code);
        return mockResponse;
      },
      json: (data) => {
        res.json(data);
        return mockResponse;
      },
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return mockResponse;
      }
    };

    await llmProxyHandler(mockRequest, mockResponse);
  } catch (error) {
    console.error('代理服务器错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '本地代理服务器错误',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 本地API代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API端点: http://localhost:${PORT}/api/llm-proxy`);
  console.log(`💡 现在可以在应用中测试云端连接功能了！`);
});
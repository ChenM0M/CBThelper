// edgepages.config.js
// Tencent EdgePages deployment configuration

module.exports = {
  // 指定部署目标目录
  output: 'dist',
  
  // 函数配置
  functions: {
    // API路由配置
    '/api/llm-proxy': {
      handler: './api/llm-proxy-universal.js',
      runtime: 'edge', // 使用Edge Runtime
      environment: {
        // 环境变量会在部署时从 EdgePages 控制台设置
        // LLM_API_KEY: process.env.LLM_API_KEY,
        // LLM_API_URL: process.env.LLM_API_URL,
        // LLM_MODEL_NAME: process.env.LLM_MODEL_NAME
      }
    }
  },

  // 路由配置
  routes: [
    // API路由
    {
      path: '/api/llm-proxy',
      function: '/api/llm-proxy'
    },
    // SPA路由 - 所有其他路由都返回index.html
    {
      path: '/*',
      fallback: '/index.html'
    }
  ],

  // 头部配置
  headers: {
    '/*': {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    },
    '/api/*': {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    },
    '/assets/*': {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },

  // 重定向配置
  redirects: [],

  // 构建配置
  build: {
    command: 'npm run build',
    environment: {
      NODE_VERSION: '18'
    }
  }
};
<!-- 花园设置 -->
<template>
  <div class="garden-config">
    <!-- 背景层 -->
    <div class="garden-background">
      <div class="sky-gradient"></div>
      <div class="floating-particles">
        <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 顶部导航 -->
    <header class="garden-header">
      <button @click="goBack" class="back-button">
        <span class="back-icon">🏡</span>
        回到花园
      </button>
      <div class="header-title">
        <span class="header-icon">⚙️</span>
        <h1>花园设置</h1>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="garden-content">
      <!-- LLM设置卡片 -->
      <section class="config-card llm-settings">
        <h2 class="section-title">
          <span class="title-icon">🤖</span>
          智慧伙伴设置
        </h2>
        
        <div class="form-group">
          <label for="endpoint">API 地址</label>
          <input
            id="endpoint"
            v-model="apiConfig.endpoint"
            type="text"
            placeholder="例如: https://api.openai.com/v1/chat/completions"
          >
        </div>

        <div class="form-group">
          <label for="apiKey">API 密钥</label>
          <input
            id="apiKey"
            v-model="apiConfig.apiKey"
            type="password"
            placeholder="输入你的API密钥"
          >
        </div>

        <div class="form-group">
          <label for="modelSelect">选择模型</label>
          <select
            id="modelSelect"
            v-model="selectedModelOption"
            @change="handleModelChange"
          >
            <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4-Turbo</option>
            <option value="custom">自定义模型</option>
          </select>
          
          <input
            v-if="selectedModelOption === 'custom'"
            v-model="customModelName"
            type="text"
            placeholder="输入自定义模型名称"
            class="custom-model-input"
          >
        </div>

        <div class="button-group">
          <button
            class="test-button"
            @click="testConnection"
            :disabled="!isFormValid || isTesting"
          >
            {{ isTesting ? '测试中...' : '测试连接' }}
          </button>
          
          <button
            class="save-button"
            @click="saveConfig"
            :disabled="!isFormValid"
          >
            保存设置
          </button>
        </div>

        <!-- 测试状态显示 -->
        <div v-if="testStatus" class="test-status" :class="{ 'success': testStatus.includes('成功') }">
          {{ testStatus }}
        </div>

        <!-- 保存成功提示 -->
        <div v-if="showSuccess" class="success-message">
          ✨ 设置已保存
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import appConfig from '../config/app.config'

export default {
  name: 'GardenConfig',
  
  data() {
    return {
      apiConfig: { ...this.$store.state.apiConfig },
      showSuccess: false,
      selectedModelOption: '',
      customModelName: '',
      testStatus: '',
      isTesting: false
    }
  },

  created() {
    // 初始化时设置selectedModelOption
    const predefinedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
    if (predefinedModels.includes(this.apiConfig.model)) {
      this.selectedModelOption = this.apiConfig.model
    } else {
      this.selectedModelOption = 'custom'
      this.customModelName = this.apiConfig.model
    }
  },

  computed: {
    isFormValid() {
      const hasRequiredFields = this.apiConfig.endpoint && this.apiConfig.apiKey
      
      if (this.selectedModelOption === 'custom') {
        return hasRequiredFields && this.customModelName
      } else {
        return hasRequiredFields && this.selectedModelOption
      }
    }
  },

  methods: {
    goBack() {
      this.$router.push('/')
    },

    getParticleStyle(index) {
      const randomDelay = Math.random() * 5
      const randomDuration = 5 + Math.random() * 5
      const randomLeft = Math.random() * 100
      
      return {
        left: `${randomLeft}%`,
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`
      }
    },

    handleModelChange() {
      if (this.selectedModelOption !== 'custom') {
        this.apiConfig.model = this.selectedModelOption
      } else {
        if (!this.customModelName) {
          this.customModelName = this.apiConfig.model
        }
      }
    },

    async testConnection() {
      this.isTesting = true
      this.testStatus = '正在测试连接...'
      
      try {
        const response = await fetch(this.apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiConfig.apiKey}`
          },
          body: JSON.stringify({
            model: this.selectedModelOption === 'custom' ? this.customModelName : this.selectedModelOption,
            messages: [
              {
                role: "user",
                content: "你好，这是一条测试消息。请回复：连接测试成功！"
              }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || '连接测试失败')
        }

        const data = await response.json()
        if (data.choices && data.choices[0]?.message?.content) {
          this.testStatus = '✅ 连接测试成功！'
        } else {
          throw new Error('API返回格式异常')
        }
      } catch (error) {
        this.testStatus = `❌ 连接失败: ${error.message}`
        console.error('连接测试失败:', error)
      } finally {
        this.isTesting = false
      }
    },

    saveConfig() {
      if (this.selectedModelOption === 'custom') {
        this.apiConfig.model = this.customModelName;
      }
      
      // 使用store的updateApiConfig方法
      this.$store.updateApiConfig({
        endpoint: this.apiConfig.endpoint,
        apiKey: this.apiConfig.apiKey,
        model: this.apiConfig.model
      });
      
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 2000);
    }
  },

  mounted() {
    // 从本地存储加载配置
    const savedConfig = localStorage.getItem('llmConfig')
    if (savedConfig) {
      this.apiConfig = { ...JSON.parse(savedConfig) }
    }
  }
}
</script>

<style scoped>
.garden-config {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 背景层 */
.garden-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.garden-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #E8F4F8 0%, #F0E5D8 30%, #CAD2C5 100%);
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, rgba(132, 169, 140, 0.6), rgba(132, 169, 140, 0));
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

/* 顶部导航 */
.garden-header {
  position: relative;
  z-index: 10;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(132, 169, 140, 0.2);
}

.back-button {
  background: var(--secondary-gradient);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(132, 169, 140, 0.3);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.header-icon {
  font-size: 2rem;
  animation: gentle-spin 3s ease-in-out infinite;
}

@keyframes gentle-spin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
}

.header-title h1 {
  color: var(--life-moss);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

/* 主内容区 */
.garden-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 配置卡片 */
.config-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section-title {
  color: var(--life-moss);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.title-icon {
  font-size: 1.8rem;
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--life-moss);
  font-weight: 500;
  font-size: 1rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(132, 169, 140, 0.3);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--life-moss);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--life-moss);
  box-shadow: 0 0 15px rgba(132, 169, 140, 0.2);
}

.custom-model-input {
  margin-top: 1rem;
}

/* 按钮样式 */
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.test-button,
.save-button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-button {
  background: var(--secondary-gradient);
  color: white;
}

.save-button {
  background: var(--primary-gradient);
  color: white;
}

.test-button:hover,
.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(132, 169, 140, 0.3);
}

.test-button:disabled,
.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 测试状态显示 */
.test-status {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  text-align: center;
}

.test-status.success {
  background: rgba(76, 175, 80, 0.1);
  color: #388e3c;
}

/* 保存成功提示 */
.success-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border-radius: 20px;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .garden-content {
    padding: 1rem;
  }
  
  .config-card {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .test-button,
  .save-button {
    width: 100%;
  }
}
</style> 
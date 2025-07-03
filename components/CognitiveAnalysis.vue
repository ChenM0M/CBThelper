<template>
  <div class="mind-greenhouse">
    <!-- 温室背景 -->
    <div class="greenhouse-background">
      <div class="greenhouse-glass"></div>
      <div class="floating-pollen">
        <div v-for="i in 8" :key="i" class="pollen-particle" :style="getPollenStyle(i)"></div>
      </div>
    </div>

    <!-- 浮动返回按钮 -->
    <button @click="goBack" class="floating-back-btn">
      <span>🏡</span>
    </button>

    <!-- 主温室区域 -->
    <div class="greenhouse-main">
      
      <!-- 选择种子界面 -->
      <div v-if="!selectedRecord" class="seed-selector">
        <div class="selector-card">
          <div class="greenhouse-title">
            <h2>🏡 心灵温室</h2>
            <p>选择一颗想法种子，看它如何在智慧中绽放</p>
          </div>
          
          <div class="seed-garden">
            <h3>花园中的种子</h3>
            <div class="seed-grid">
              <div 
                v-for="(record, index) in $store.state.thoughtRecords" 
                :key="record.id || index"
                @click="selectSeed(index)"
                class="seed-item"
                :class="{ 'fresh': index === 0 }"
              >
                <div class="seed-emotion">
                  <span class="emotion-bubble" v-if="record.emotions">
                    {{ Array.isArray(record.emotions) ? record.emotions[0] : record.emotions.split(',')[0] }}
                  </span>
                </div>
                <div class="seed-content">
                  <div class="seed-time">{{ formatTime(record.timestamp) }}</div>
                  <div class="seed-thought">{{ truncateText(record.automaticThought, 60) }}</div>
                </div>
                <div class="seed-status">
                  <span v-if="record.completed" class="status-bloomed">🌸</span>
                  <span v-else class="status-budding">🌱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 温室花朵界面 -->
      <div v-else class="greenhouse-flower">
        
        <!-- 中心花朵区域 -->
        <div class="flower-center">
          <div class="flower-container" @click="triggerAnalysis">
            <!-- 花朵本体 -->
            <div class="flower-bloom" :style="flowerStyle" :class="{ 'analyzing': isAnalyzing, 'bloomed': hasAnalysis }">
              <div class="flower-petals">
                <div v-for="i in 8" :key="i" class="petal" :style="getPetalStyle(i)"></div>
              </div>
              <div class="flower-center-dot"></div>
            </div>
            
            <!-- 情绪思索气泡 -->
            <div class="emotion-bubbles">
              <div 
                v-for="(emotion, index) in getRecordEmotions(selectedRecord)" 
                :key="index"
                class="emotion-bubble floating"
                :style="getBubblePosition(index)"
              >
                {{ emotion }}
              </div>
            </div>
          </div>
          
          <div class="flower-hint" v-if="!hasAnalysis">
            <p>轻触花朵，让智慧伙伴为你分析...</p>
          </div>
        </div>

        <!-- 分析结果展示区 -->
        <div v-if="analysisResult" class="analysis-display">
          <div class="analysis-tags">
            <div 
              v-for="(bias, index) in analysisResult.cognitiveBiases" 
              :key="index"
              class="bias-tag"
            >
              <span class="bias-label">{{ bias.label }}</span>
              <p class="bias-description">{{ bias.description }}</p>
            </div>
          </div>
          
          <div class="guiding-questions" v-if="analysisResult.guidingQuestions">
            <h4>💭 温柔的探索</h4>
            <div class="question-list">
              <div 
                v-for="(question, index) in analysisResult.guidingQuestions" 
                :key="index"
                class="question-bubble"
              >
                <span class="question-mark">?</span>
                <p>{{ question }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部对话触发器 -->
        <div class="chat-trigger" v-if="isWisdomCompanionEnabled">
          <div class="chat-hint" @click="openChatDialog">
            <span class="chat-icon">💬</span>
            <span class="chat-text">与智慧伙伴深度对话</span>
          </div>
        </div>
        
        <!-- 智慧伙伴关闭提示 -->
        <div v-else class="companion-disabled-hint">
          <div class="disabled-message">
            <span class="rest-icon">🌙</span>
            <p>{{ getDisabledMessage() }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- 对话弹窗 -->
    <div v-if="showChatDialog" class="chat-dialog-overlay" @click="closeChatDialog">
      <div class="chat-dialog" @click.stop>
        <div class="dialog-header">
          <h3>🤖 智慧伙伴对话</h3>
          <button @click="closeChatDialog" class="close-btn">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="chat-messages">
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              class="chat-message"
              :class="message.type"
            >
              <div class="message-content">{{ message.content }}</div>
            </div>
          </div>
          
          <div class="chat-input-area">
            <input 
              v-model="userInput"
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="分享你的想法..."
              class="chat-input"
            >
            <button @click="sendMessage" class="send-btn" :disabled="!userInput.trim()">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CognitiveAnalysis',
  data() {
    return {
      selectedRecord: null,
      isAnalyzing: false,
      analysisResult: null,
      showChatDialog: false,
      userInput: '',
      chatMessages: [],
      randomFlowerColor: this.generateRandomFlowerColor()
    }
  },
  computed: {
    hasAnalysis() {
      return !!this.analysisResult
    },
    
    flowerStyle() {
      return {
        '--flower-color': this.randomFlowerColor,
        '--flower-secondary': this.adjustColorBrightness(this.randomFlowerColor, -20)
      }
    },
    
    isWisdomCompanionEnabled() {
      return this.$store.state.appConfig?.features?.wisdomCompanionEnabled ?? true
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    
    selectSeed(index) {
      this.selectedRecord = this.$store.state.thoughtRecords[index]
      this.$store.state.selectedRecordIndex = index
      this.analysisResult = null
      this.randomFlowerColor = this.generateRandomFlowerColor()
    },
    
    async triggerAnalysis() {
      if (this.isAnalyzing || this.hasAnalysis) return
      
      this.isAnalyzing = true
      
      try {
        // 模拟分析过程
        await this.sleep(2000)
        
        // 调用LLM分析API
        this.analysisResult = await this.performCBTAnalysis()
        
      } catch (error) {
        console.error('分析过程出错:', error)
        this.showError('分析时遇到了小问题，请稍后再试')
      } finally {
        this.isAnalyzing = false
      }
    },
    
    async performCBTAnalysis() {
      const config = this.$store.state.appConfig
      
      if (!config?.features?.autoAnalysisEnabled) {
        throw new Error('自动分析功能已关闭')
      }
      
      // 构建分析请求
      const prompt = this.buildAnalysisPrompt()
      
      try {
        const response = await fetch('/api/llm-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.llm.modelName,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.llm.maxTokens,
            temperature: config.llm.temperature
          })
        })
        
        const data = await response.json()
        return this.parseAnalysisResponse(data.choices[0].message.content)
        
      } catch (error) {
        // 返回默认分析结果
        return this.getDefaultAnalysis()
      }
    },
    
    buildAnalysisPrompt() {
      const record = this.selectedRecord
      const emotions = this.getRecordEmotions(record).join(', ')
      
      return `作为心灵花园的智慧伙伴，请分析以下思维记录，用温暖、希望的语言：

情况: ${record.situation || '未详细描述'}
想法: ${record.automaticThought}
情绪: ${emotions}

请识别可能的认知偏差类型，并提供3-4个温和的引导性问题。
格式要求：JSON格式，包含cognitiveBiases数组和guidingQuestions数组。`
    },
    
    // 获取记录的情绪列表，兼容多种格式
    getRecordEmotions(record) {
      if (!record) return []
      
      // 如果是数组格式
      if (Array.isArray(record.emotions)) {
        return record.emotions
      }
      
      // 如果是字符串格式（逗号分隔）
      if (typeof record.emotions === 'string') {
        return record.emotions.split(',').map(e => e.trim()).filter(e => e)
      }
      
      // 如果有单个情绪对象
      if (record.emotion && record.emotion.name) {
        return [record.emotion.name]
      }
      
      return []
    },
    
    parseAnalysisResponse(content) {
      try {
        const parsed = JSON.parse(content)
        return {
          cognitiveBiases: parsed.cognitiveBiases || this.getDefaultBiases(),
          guidingQuestions: parsed.guidingQuestions || this.getDefaultQuestions()
        }
      } catch {
        return this.getDefaultAnalysis()
      }
    },
    
    getDefaultAnalysis() {
      const biases = this.$store.state.appConfig?.cognitiveDistortions || []
      return {
        cognitiveBiases: [biases[Math.floor(Math.random() * biases.length)] || {
          label: '💭 思维迷雾',
          description: '想法中可能藏着一些小小的偏差'
        }],
        guidingQuestions: [
          '有没有其他的角度来看待这件事？',
          '如果朋友遇到同样的情况，你会怎么安慰TA？',
          '这个想法对你有帮助吗？'
        ]
      }
    },
    
    getDefaultBiases() {
      return [{
        label: '💭 思维迷雾',
        description: '想法中可能藏着一些小小的偏差'
      }]
    },
    
    getDefaultQuestions() {
      return [
        '有没有其他的角度来看待这件事？',
        '如果朋友遇到同样的情况，你会怎么安慰TA？',
        '这个想法对你有帮助吗？'
      ]
    },
    
    openChatDialog() {
      if (!this.isWisdomCompanionEnabled) return
      
      this.showChatDialog = true
      
      // 初始化对话
      if (this.chatMessages.length === 0) {
        this.chatMessages.push({
          type: 'companion',
          content: '你好！我是你的智慧伙伴。关于刚才的想法，你还有什么想聊的吗？'
        })
      }
    },
    
    closeChatDialog() {
      this.showChatDialog = false
    },
    
    async sendMessage() {
      if (!this.userInput.trim()) return
      
      const userMessage = this.userInput.trim()
      this.chatMessages.push({
        type: 'user',
        content: userMessage
      })
      
      this.userInput = ''
      
      // 模拟AI回复
      setTimeout(() => {
        this.chatMessages.push({
          type: 'companion',
          content: '谢谢你的分享。' + this.generateCompanionResponse(userMessage)
        })
      }, 1000)
    },
    
    generateCompanionResponse(userMessage) {
      const responses = [
        '我能理解你的感受。',
        '这听起来确实不容易。',
        '你的想法很有道理。',
        '换个角度看，可能会有不同的感受。'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    },
    
    getDisabledMessage() {
      const messages = this.$store.state.appConfig?.messages?.companionDisabled || [
        "智慧伙伴暂时在花园里休息，请稍后再来 🌙"
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    },
    
    generateRandomFlowerColor() {
      const colors = ['#FF9B85', '#FFC857', '#84A98C', '#7B9BB3', '#9384A8', '#FF6B6B']
      return colors[Math.floor(Math.random() * colors.length)]
    },
    
    adjustColorBrightness(hex, percent) {
      const num = parseInt(hex.replace("#",""), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + 
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1)
    },
    
    getPetalStyle(index) {
      return {
        transform: `rotate(${index * 45}deg)`,
        animationDelay: `${index * 0.1}s`
      }
    },
    
    getBubblePosition(index) {
      const angle = (index * 60) - 30
      const distance = 120 + (index * 20)
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`
      }
    },
    
    getPollenStyle(index) {
      const angle = index * 45
      const distance = 100 + Math.random() * 300
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${6 + Math.random() * 4}s`
      }
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    truncateText(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    showError(message) {
      // 简单的错误提示
      alert(message)
    }
  },
  
  mounted() {
    // 如果有预选的记录索引，自动加载
    if (this.$store.state.selectedRecordIndex !== undefined) {
      const index = this.$store.state.selectedRecordIndex
      if (this.$store.state.thoughtRecords[index]) {
        this.selectSeed(index)
      }
    }
  }
}
</script>

<style scoped>
.mind-greenhouse {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #E8F4F8 0%, #F0E5D8 50%, #CAD2C5 100%);
}

/* 温室背景 */
.greenhouse-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.greenhouse-glass {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  backdrop-filter: blur(1px);
}

.floating-pollen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.pollen-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, #FFC857 0%, #E6B84A 70%, transparent 100%);
  border-radius: 50%;
  opacity: 0.6;
  animation: pollenFloat 8s ease-in-out infinite;
}

@keyframes pollenFloat {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.8;
  }
}

/* 浮动返回按钮 */
.floating-back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
}

.floating-back-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

/* 主温室区域 */
.greenhouse-main {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* 种子选择界面 */
.seed-selector {
  max-width: 600px;
  width: 100%;
}

.selector-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
}

.greenhouse-title h2 {
  color: var(--life-moss);
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.greenhouse-title p {
  color: var(--life-olive);
  font-style: italic;
  margin-bottom: 2rem;
}

.seed-garden h3 {
  color: var(--life-moss);
  margin-bottom: 1rem;
}

.seed-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.seed-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.seed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: var(--life-olive);
}

.seed-item.fresh {
  border-color: var(--bloom-coral);
  background: rgba(255, 155, 133, 0.1);
}

.seed-emotion {
  flex-shrink: 0;
}

.emotion-bubble {
  background: var(--secondary-gradient);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.seed-content {
  flex-grow: 1;
  text-align: left;
}

.seed-time {
  font-size: 0.8rem;
  color: var(--earth-clay);
  margin-bottom: 0.3rem;
}

.seed-thought {
  color: var(--life-moss);
  font-weight: 500;
}

.seed-status {
  flex-shrink: 0;
  font-size: 1.2rem;
}

/* 温室花朵界面 */
.greenhouse-flower {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 中心花朵区域 */
.flower-center {
  position: relative;
  margin-bottom: 2rem;
}

.flower-container {
  position: relative;
  width: 300px;
  height: 300px;
  cursor: pointer;
}

.flower-bloom {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  transition: all 0.5s ease;
}

.flower-bloom.analyzing {
  animation: analyzing-pulse 2s ease-in-out infinite;
}

.flower-bloom.bloomed {
  transform: translate(-50%, -50%) scale(1.2);
}

@keyframes analyzing-pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1); 
    filter: brightness(1);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.1); 
    filter: brightness(1.2);
  }
}

.flower-petals {
  position: relative;
  width: 100%;
  height: 100%;
}

.petal {
  position: absolute;
  width: 40px;
  height: 80px;
  background: var(--flower-color, #FF9B85);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  top: 50%;
  left: 50%;
  transform-origin: 50% 90%;
  animation: petalGrow 0.8s ease-out forwards;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

@keyframes petalGrow {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.flower-center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, #FFC857, #E6B84A);
  border-radius: 50%;
  z-index: 10;
}

/* 情绪气泡 */
.emotion-bubbles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.emotion-bubble.floating {
  position: absolute;
  background: rgba(132, 169, 140, 0.9);
  color: white;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  animation: bubbleFloat 3s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.flower-hint {
  text-align: center;
  margin-top: 2rem;
  color: var(--life-olive);
  font-style: italic;
}

/* 分析结果展示 */
.analysis-display {
  max-width: 600px;
  width: 100%;
  margin-bottom: 2rem;
}

.analysis-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.bias-tag {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  max-width: 200px;
}

.bias-label {
  display: block;
  font-weight: 600;
  color: var(--life-moss);
  margin-bottom: 0.5rem;
}

.bias-description {
  color: var(--life-olive);
  font-size: 0.9rem;
  margin: 0;
}

.guiding-questions {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.guiding-questions h4 {
  color: var(--life-moss);
  text-align: center;
  margin-bottom: 1rem;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.question-bubble {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.8rem;
  background: rgba(132, 169, 140, 0.1);
  border-radius: 12px;
}

.question-mark {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--secondary-gradient);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.question-bubble p {
  color: var(--life-moss);
  margin: 0;
  font-weight: 500;
}

/* 对话触发器 */
.chat-trigger, .companion-disabled-hint {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
}

.chat-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-gradient);
  color: white;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
}

.chat-hint:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

.disabled-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--life-olive);
  padding: 1rem 2rem;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* 对话弹窗 */
.chat-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.chat-dialog {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  height: 70%;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  color: var(--life-moss);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--life-moss);
}

.dialog-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message {
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 15px;
  word-wrap: break-word;
}

.chat-message.user {
  background: var(--primary-gradient);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.chat-message.companion {
  background: var(--background-light);
  color: var(--life-moss);
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.chat-input {
  flex-grow: 1;
  padding: 0.8rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 15px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: var(--life-olive);
}

.send-btn {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(84, 169, 140, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .greenhouse-main {
    padding: 1rem;
  }
  
  .flower-container {
    width: 250px;
    height: 250px;
  }
  
  .flower-bloom {
    width: 120px;
    height: 120px;
  }
  
  .chat-dialog {
    width: 95%;
    height: 80%;
  }
  
  .floating-back-btn {
    top: 15px;
    left: 15px;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .analysis-tags {
    flex-direction: column;
    align-items: center;
  }
  
  .bias-tag {
    max-width: 100%;
  }
}
</style>
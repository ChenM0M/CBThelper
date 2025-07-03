<template>
  <div class="growth-journey">
    <!-- 背景层 -->
    <div class="journey-background">
      <div class="growing-garden">
        <div v-for="i in 8" :key="i" class="garden-element" :style="getGardenElementStyle(i)"></div>
      </div>
    </div>

    <!-- 顶部导航 -->
    <div class="journey-header">
      <button @click="goBack" class="back-button">
        <span class="back-icon">🏡</span>
        回到花园
      </button>
      <div class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span class="progress-text">{{ currentStepName }} ({{ currentStep }}/{{ totalSteps }})</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="journey-content">
      
      <!-- 欢迎介绍 -->
      <div v-if="currentStep === 0" class="welcome-step">
        <div class="step-card">
          <div class="step-icon">🌱</div>
          <h2 class="step-title">开始今天的成长之旅</h2>
          <div class="current-mood" v-if="selectedEmotion">
            <p class="mood-display">
              <span class="mood-icon" :style="{ background: selectedEmotion.gradient }">
                {{ selectedEmotion.emoji || '💭' }}
              </span>
              今天的感受：{{ selectedEmotion.name }}
            </p>
          </div>
          <p class="step-description">
            让我们一起轻柔地探索内心的想法，每一个想法都是珍贵的种子，值得被温柔对待。
          </p>
          <button @click="nextStep" class="journey-button primary">
            <span class="button-icon">🌿</span>
            开始种植想法的种子
          </button>
        </div>
      </div>

      <!-- 步骤1: 情境描述(可选) -->
      <div v-if="currentStep === 1" class="situation-step">
        <div class="step-card">
          <div class="step-icon">🌍</div>
          <h2 class="step-title">发生了什么让你有这样的感受？</h2>
          <p class="step-description">可以描述一下当时的环境、时间、人物... 当然，如果不想说也完全可以跳过。</p>
          
          <div class="input-garden">
            <div class="growing-plant" :class="{ 'has-content': record.situation }">
              <div class="soil-base"></div>
              <div class="plant-sprout" v-if="record.situation"></div>
            </div>
            <textarea
              v-model="record.situation"
              class="garden-input"
              placeholder="那一刻，你在哪里？发生了什么？（可以跳过）"
              rows="4"
              @input="onSituationInput"
            ></textarea>
          </div>

          <div class="step-actions">
            <button @click="skipStep" class="journey-button secondary">
              暂时跳过，直接说想法
            </button>
            <button @click="nextStep" class="journey-button primary" :disabled="!canProceed">
              <span class="button-icon">💭</span>
              继续探索内心
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤2: 内心声音(核心) -->
      <div v-if="currentStep === 2" class="thoughts-step">
        <div class="step-card">
          <div class="step-icon">💭</div>
          <h2 class="step-title">那一刻，内心冒出了什么想法？</h2>
          <p class="step-description">
            这是最重要的部分。请诚实地记录下当时脑海中的想法，无论它是什么样的。
          </p>
          
          <div class="input-garden">
            <div class="growing-plant" :class="{ 'has-content': record.automaticThought, 'thorny': record.automaticThought }">
              <div class="soil-base"></div>
              <div class="plant-sprout dark" v-if="record.automaticThought">
                <div class="thorns" v-if="isNegativeThought"></div>
              </div>
            </div>
            <textarea
              v-model="record.automaticThought"
              class="garden-input required"
              placeholder="我当时想... / 我觉得... / 这让我感到..."
              rows="4"
              @input="onThoughtInput"
              required
            ></textarea>
          </div>

          <div class="gentle-reminder" v-if="record.automaticThought">
            <p>
              <span class="reminder-icon">💚</span>
              你很勇敢地面对了内心的声音，这就是成长的开始。
            </p>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="journey-button secondary">
              ← 回到上一步
            </button>
            <button @click="nextStep" class="journey-button primary" :disabled="!record.automaticThought.trim()">
              <span class="button-icon">✨</span>
              寻找新的视角
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤3: 情绪评估 -->
      <div v-if="currentStep === 3" class="emotion-step">
        <div class="step-card">
          <h2 class="step-title">现在的感觉和刚才比，有什么不同？</h2>
          <p class="step-description">请选择最贴近你现在感受的情绪和强度。</p>
          
          <!-- 情绪选择 -->
          <div class="emotion-selection">
            <h4>此刻的感受：</h4>
            <div class="emotion-grid">
              <div 
                v-for="emotion in emotionOptions" 
                :key="emotion.name"
                @click="selectCurrentEmotion(emotion)"
                class="emotion-option"
                :class="{ 'selected': record.emotions.includes(emotion.name) }"
              >
                <div class="emotion-icon" :style="{ background: emotion.gradient }">
                  {{ emotion.emoji }}
                </div>
                <span class="emotion-label">{{ emotion.name }}</span>
              </div>
            </div>
          </div>

          <!-- 强度滑块 -->
          <div class="intensity-control" v-if="record.emotions.length > 0">
            <label class="intensity-label">感受的强度：{{ record.intensity }}%</label>
            <div class="intensity-slider-container">
              <input 
                type="range" 
                min="10" 
                max="100" 
                v-model="record.intensity"
                class="intensity-slider"
                @input="updateEmotionIntensity"
              >
              <div class="slider-labels">
                <span>轻微</span>
                <span>强烈</span>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button @click="prevStep" class="journey-button secondary">
              ← 继续探索想法
            </button>
            <button @click="proceedToAnalysis" class="journey-button primary" :disabled="record.emotions.length === 0">
              <span class="button-icon">🤖</span>
              和智慧伙伴聊聊
            </button>
          </div>
        </div>
      </div>

      <!-- 保存成功提示 -->
      <div v-if="showSuccessMessage" class="success-message">
        <div class="success-card">
          <div class="success-icon">🌸</div>
          <h3>记录已保存</h3>
          <p>你的想法已经安全地保存在心灵花园中</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ThoughtRecord',
  data() {
    return {
      currentStep: 0,
      totalSteps: 3,
      
      record: {
        situation: '',
        automaticThought: '',
        emotions: [],
        intensity: 70,
        timestamp: null
      },
      
      selectedEmotion: null, // 从主页传来的初始情绪
      showSuccessMessage: false,

      // 情绪选项
      emotionOptions: [
        { name: '愉悦阳光', emoji: '😊', color: '#FFC857', gradient: 'linear-gradient(135deg, #FFC857, #FFD700)' },
        { name: '平静如水', emoji: '😌', color: '#84A98C', gradient: 'linear-gradient(135deg, #84A98C, #7B9BB3)' },
        { name: '有些低落', emoji: '😔', color: '#A0826D', gradient: 'linear-gradient(135deg, #A0826D, #8B7355)' },
        { name: '焦虑不安', emoji: '😰', color: '#9384A8', gradient: 'linear-gradient(135deg, #9384A8, #7A6B8A)' },
        { name: '充满希望', emoji: '🌟', color: '#FF9B85', gradient: 'linear-gradient(135deg, #FF9B85, #FFA07A)' },
        { name: '疲惫倦怠', emoji: '😴', color: '#CAD2C5', gradient: 'linear-gradient(135deg, #CAD2C5, #B8C5B8)' },
        { name: '愤怒', emoji: '😡', color: '#C87777', gradient: 'linear-gradient(135deg, #C87777, #B66666)' },
        { name: '困惑', emoji: '🤔', color: '#9384A8', gradient: 'linear-gradient(135deg, #9384A8, #8A7B9B)' }
      ]
    }
  },
  computed: {
    progressPercentage() {
      return Math.round((this.currentStep / this.totalSteps) * 100)
    },

    currentStepName() {
      const names = ['准备开始', '环境背景', '内心声音', '感受此刻']
      return names[this.currentStep] || '探索中'
    },

    canProceed() {
      // 情境描述是可选的，所以总是可以继续
      if (this.currentStep === 1) return true
      // 其他步骤根据内容判断
      if (this.currentStep === 2) return this.record.automaticThought.trim().length > 0
      return true
    },

    isNegativeThought() {
      const thought = this.record.automaticThought.toLowerCase()
      const negativeWords = ['糟糕', '失败', '不行', '完了', '没用', '害怕', '担心', '焦虑', '难过', '绝望']
      return negativeWords.some(word => thought.includes(word))
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    skipStep() {
      // 跳过当前步骤
      this.nextStep()
    },

    onSituationInput() {
      // 情境输入时的反馈
    },

    onThoughtInput() {
      // 想法输入时的反馈
    },

    selectCurrentEmotion(emotion) {
      if (this.record.emotions.includes(emotion.name)) {
        // 取消选择
        this.record.emotions = this.record.emotions.filter(e => e !== emotion.name)
      } else {
        // 选择新情绪（可以多选）
        this.record.emotions.push(emotion.name)
      }
    },

    updateEmotionIntensity() {
      // 强度变化时的反馈
    },

    async proceedToAnalysis() {
      // 保存记录并跳转到AI分析
      await this.saveRecord()
      
      // 将当前记录设为选中状态，供分析页面使用
      this.$store.state.selectedRecordIndex = 0 // 最新的记录
      
      // 跳转到认知分析页面
      this.$router.push('/analysis')
    },

    async saveRecord() {
      try {
        // 准备记录数据
        const recordData = {
          situation: this.record.situation,
          automaticThought: this.record.automaticThought,
          emotions: this.record.emotions,
          intensity: this.record.intensity,
          timestamp: new Date(),
          id: Date.now(),
          completed: false, // 标记为未完成，需要进行AI分析
          // 保留初始情绪选择信息
          initialEmotion: this.selectedEmotion
        }

        // 保存到store
        this.$store.state.thoughtRecords.unshift(recordData)
        this.$store.saveState()

        // 显示成功消息
        this.showSuccessMessage = true
        setTimeout(() => {
          this.showSuccessMessage = false
        }, 2000)

        return recordData
      } catch (error) {
        console.error('保存记录失败:', error)
        alert('保存失败，请稍后重试')
      }
    },

    getGardenElementStyle(index) {
      const angle = (index * 45) + Math.random() * 30
      const distance = 100 + Math.random() * 150
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      const delay = Math.random() * 3
      const duration = 4 + Math.random() * 2
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    },

    loadInitialEmotion() {
      // 从store加载初始情绪选择，兼容新的多情绪格式
      if (this.$store.state.currentSession) {
        const session = this.$store.state.currentSession
        
        // 兼容新格式：多情绪数组
        if (session.emotions && Array.isArray(session.emotions) && session.emotions.length > 0) {
          this.selectedEmotion = session.emotions[0] // 取第一个情绪作为主要情绪
          // 将所有情绪添加到记录中
          this.record.emotions = session.emotions.map(e => e.name)
        }
        // 兼容旧格式：单个情绪
        else if (session.emotion) {
          this.selectedEmotion = session.emotion
          this.record.emotions = [session.emotion.name]
        }
      }
    }
  },
  mounted() {
    this.loadInitialEmotion()
    this.record.timestamp = new Date()
  }
}
</script>

<style scoped>
.growth-journey {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #F0E5D8 0%, #E8F4F8 50%, #CAD2C5 100%);
}

/* 背景层 */
.journey-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.growing-garden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.garden-element {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, rgba(132, 169, 140, 0.4), transparent);
  border-radius: 50%;
  animation: gentle-float 5s ease-in-out infinite;
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-15px) rotate(180deg); opacity: 0.7; }
}

/* 顶部导航 */
.journey-header {
  position: relative;
  z-index: 10;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
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

.back-icon {
  font-size: 1.2rem;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(132, 169, 140, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.5s ease;
  border-radius: 4px;
}

.progress-text {
  color: var(--life-moss);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* 主内容 */
.journey-content {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

/* 步骤卡片 */
.step-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 3rem 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  text-align: center;
  animation: slide-up 0.6s ease-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: gentle-bounce 3s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.step-title {
  color: var(--life-moss);
  font-size: 1.8rem;
  margin-bottom: 1rem;
  font-weight: 500;
  line-height: 1.3;
}

.step-description {
  color: var(--life-olive);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* 当前情绪显示 */
.current-mood {
  margin: 1.5rem 0;
}

.mood-display {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(132, 169, 140, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  border: 2px solid rgba(132, 169, 140, 0.2);
  font-size: 1.1rem;
  color: var(--life-moss);
  font-weight: 500;
}

.mood-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* 输入花园 */
.input-garden {
  position: relative;
  margin: 2rem 0;
  text-align: left;
}

.growing-plant {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 80px;
  z-index: 2;
  pointer-events: none;
}

.soil-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 10px;
  background: var(--earth-clay);
  border-radius: 5px;
}

.plant-sprout {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 30px;
  background: var(--life-olive);
  border-radius: 10px 10px 50% 50%;
  transition: all 0.5s ease;
  transform-origin: bottom center;
}

.plant-sprout.dark {
  background: var(--earth-clay);
  position: relative;
}

.thorns {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(200, 119, 119, 0.3), transparent);
  border-radius: inherit;
}

.growing-plant.has-content .plant-sprout {
  animation: grow-up 0.8s ease-out;
}

@keyframes grow-up {
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 30px;
    opacity: 1;
  }
}

.garden-input {
  width: 100%;
  border: 2px solid var(--earth-clay);
  border-radius: 20px;
  padding: 1.5rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--life-moss);
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  line-height: 1.6;
  min-height: 120px;
}

.garden-input:focus {
  outline: none;
  border-color: var(--life-olive);
  box-shadow: 0 0 25px rgba(132, 169, 140, 0.2);
  background: rgba(255, 255, 255, 1);
}

.garden-input.required {
  border-color: var(--life-olive);
}

.garden-input::placeholder {
  color: var(--earth-clay);
  opacity: 0.8;
}

/* 温柔提醒 */
.gentle-reminder {
  margin: 1.5rem 0;
  text-align: center;
}

.gentle-reminder p {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.1), rgba(255, 155, 133, 0.1));
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 1px solid rgba(132, 169, 140, 0.2);
  color: var(--life-olive);
  font-style: italic;
  margin: 0;
}

.reminder-icon {
  font-size: 1.2rem;
}

/* 情绪选择 */
.emotion-selection {
  margin: 2rem 0;
  text-align: left;
}

.emotion-selection h4 {
  color: var(--life-moss);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.emotion-option {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 1rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.emotion-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: var(--life-olive);
}

.emotion-option.selected {
  border-color: var(--life-moss);
  background: rgba(132, 169, 140, 0.1);
  transform: translateY(-3px) scale(1.02);
}

.emotion-option .emotion-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin: 0 auto 0.5rem;
}

.emotion-label {
  display: block;
  color: var(--life-moss);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 强度控制 */
.intensity-control {
  margin: 2rem 0;
}

.intensity-label {
  display: block;
  color: var(--life-moss);
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.intensity-slider-container {
  position: relative;
}

.intensity-slider {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: rgba(211, 184, 165, 0.3);
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 0.5rem;
}

.intensity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--primary-gradient);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(132, 169, 140, 0.4);
  transition: all 0.3s ease;
}

.intensity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--earth-clay);
}

/* 步骤操作按钮 */
.step-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.journey-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 160px;
  justify-content: center;
}

.journey-button.primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
}

.journey-button.primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

.journey-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.journey-button.secondary {
  background: rgba(211, 184, 165, 0.8);
  color: var(--life-moss);
}

.journey-button.secondary:hover {
  background: var(--earth-clay);
  transform: translateY(-2px);
}

.button-icon {
  font-size: 1.2rem;
}

/* 成功消息 */
.success-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  animation: success-appear 0.5s ease-out;
}

@keyframes success-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.success-card {
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid var(--life-olive);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  backdrop-filter: blur(15px);
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-card h3 {
  color: var(--life-moss);
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.success-card p {
  color: var(--life-olive);
  margin: 0;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .journey-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-indicator {
    width: 100%;
    justify-content: center;
  }
  
  .progress-bar {
    width: 150px;
  }
  
  .journey-content {
    padding: 1rem;
  }
  
  .step-card {
    padding: 2rem 1.5rem;
  }
  
  .step-title {
    font-size: 1.5rem;
  }
  
  .emotion-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .step-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .journey-button {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .step-icon {
    font-size: 3rem;
  }
  
  .step-title {
    font-size: 1.3rem;
  }
  
  .step-description {
    font-size: 1rem;
  }
  
  .garden-input {
    font-size: 1rem;
    padding: 1.2rem;
  }
  
  .emotion-grid {
    grid-template-columns: 1fr;
  }
}
</style>
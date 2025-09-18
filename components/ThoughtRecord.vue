<template>
  <div class="growth-journey">
    <!-- 背景层 -->
    <div class="garden-background">
      <div class="sky-gradient"></div>
      <div class="soil-texture"></div>
      <div class="garden-elements">
        <div v-for="i in 8" :key="i" class="garden-element" :style="getGardenElementStyle(i)"></div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="journey-content">
      <!-- 进度指示器 -->
      <div class="journey-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="step-indicator">
          <div class="seed-icon">
            <img src="/assets/images/seed.png" alt="种子" class="seed-image" />
          </div>
          <span class="step-name">{{ currentStepName }}</span>
          <span class="step-count">{{ currentStep }}/{{ totalSteps }}</span>
        </div>
      </div>

      <!-- 欢迎介绍 -->
      <div v-if="currentStep === 0" class="welcome-step">
        <div class="step-card">
          <div class="step-icon">🌱</div>
          <h2 class="step-title">{{ $t('thoughtRecord.welcome.title') }}</h2>
          <div class="current-mood" v-if="selectedEmotion || record.emotions.length > 0">
            <p class="mood-display" v-if="selectedEmotion">
              <span class="mood-icon" :style="{ background: selectedEmotion.gradient }">
                {{ selectedEmotion.emoji || '💭' }}
              </span>
              今天的感受：{{ selectedEmotion.name }}
            </p>
            <!-- 显示所有选中的情绪 -->
            <div class="selected-emotions-preview" v-if="record.emotions.length > 1">
              <p class="emotions-text">
                还有其他感受：{{ record.emotions.filter(e => e !== selectedEmotion?.name).join('、') }}
              </p>
            </div>
          </div>
          <p class="step-description">
            {{ $t('thoughtRecord.welcome.description') }}
          </p>
          <button @click="nextStep" class="journey-button primary">
            <span class="button-icon">🌿</span>
            {{ $t('thoughtRecord.welcome.startButton') }}
          </button>
        </div>
      </div>

      <!-- 步骤1: 情境描述(可选) -->
      <div v-if="currentStep === 1" class="situation-step">
        <div class="step-card">
          <div class="step-icon">🌍</div>
          <h2 class="step-title">发生了什么让你有这样的感受？</h2>
          <p class="step-description">可以描述一下当时的环境、时间、人物... 当然，如果不想说也完全可以跳过。</p>
          
          <div class="input-container">
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
          
          <div class="input-container">
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
          <p class="step-description">
            请确认或调整你的情绪选择。即使之前选择过情绪，你也可以在这里重新评估和调整。
          </p>
          
          <!-- 显示之前选择的情绪（如果有的话） -->
          <div v-if="selectedEmotion && record.emotions.length > 0" class="initial-emotions-display">
            <p class="initial-emotions-text">
              <span class="reminder-icon">💚</span>
              之前选择的感受：{{ record.emotions.join('、') }}
            </p>
            <p class="adjustment-hint">你可以保持这些选择，或者重新调整</p>
          </div>
          
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
                <span class="emotion-label">{{ $t(`emotions.${emotion.key}`) }}</span>
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
        { key: 'pleasant', emoji: '😊', color: '#FFC857', gradient: 'linear-gradient(135deg, #FFC857, #FFD700)' },
        { key: 'calm', emoji: '😌', color: '#84A98C', gradient: 'linear-gradient(135deg, #84A98C, #7B9BB3)' },
        { key: 'sad', emoji: '😔', color: '#A0826D', gradient: 'linear-gradient(135deg, #A0826D, #8B7355)' },
        { key: 'anxious', emoji: '😰', color: '#9384A8', gradient: 'linear-gradient(135deg, #9384A8, #7A6B8A)' },
        { key: 'hopeful', emoji: '🌟', color: '#FF9B85', gradient: 'linear-gradient(135deg, #FF9B85, #FFA07A)' },
        { key: 'tired', emoji: '😴', color: '#CAD2C5', gradient: 'linear-gradient(135deg, #CAD2C5, #B8C5B8)' },
        { key: 'angry', emoji: '😡', color: '#C87777', gradient: 'linear-gradient(135deg, #C87777, #B66666)' },
        { key: 'confused', emoji: '🤔', color: '#9384A8', gradient: 'linear-gradient(135deg, #9384A8, #8A7B9B)' }
      ]
    }
  },
  computed: {
    progressPercentage() {
      return Math.round((this.currentStep / this.totalSteps) * 100)
    },

    currentStepName() {
      const names = [
        this.$t('thoughtRecord.progress.preparing'),
        this.$t('thoughtRecord.progress.situation'),
        this.$t('thoughtRecord.progress.thoughts'),
        this.$t('thoughtRecord.progress.emotions')
      ]
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
        // 选择新情绪（支持多选）
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
          // 将所有情绪添加到记录中，但不跳过步骤3的情绪评估
          this.record.emotions = session.emotions.map(e => e.name)
        }
        // 兼容旧格式：单个情绪
        else if (session.emotion) {
          this.selectedEmotion = session.emotion
          this.record.emotions = [session.emotion.name]
        }
      }
      
      // 重要：清除currentSession，避免重复使用
      this.$store.state.currentSession = null
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
  background: transparent;
}

/* 背景层样式 */
.garden-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: url('/public/assets/images/sky-gradient.png') center/cover;
  background-size: cover;
  background-position: center;
  opacity: 0.8;
}

.soil-texture {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30%;
  background: url('/public/assets/images/soil-texture.png') center/cover;
  background-size: cover;
  background-position: center bottom;
  opacity: 0.9;
}

/* 种子图标样式 */
.seed-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.seed-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  animation: seedFloat 3s ease-in-out infinite;
}

@keyframes seedFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 进度指示器样式 */
.journey-progress {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.progress-bar {
  height: 8px;
  background: rgba(132, 169, 140, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-indicator {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 1rem;
  gap: 0.8rem; /* 添加间距避免挤压 */
  flex-wrap: nowrap; /* 确保水平排列 */
  justify-content: center; /* 居中对齐 */
}

.step-name {
  flex: 1;
  font-weight: 500;
  text-align: center; /* 居中对齐 */
  white-space: nowrap; /* 防止换行 */
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* 允许flex收缩 */
}

.step-count {
  font-size: 0.9rem;
  opacity: 0.8;
  flex-shrink: 0; /* 防止被压缩 */
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
  color: var(--text-primary);
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
  color: var(--text-primary);
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

.selected-emotions-preview {
  margin-top: 0.8rem;
}

.emotions-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
  background: var(--bg-muted);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

/* 输入容器 */
.input-container {
  margin: 2rem 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.growing-plant {
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 70px;
  height: 90px;
  z-index: 2;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.soil-base {
  position: relative;
  width: 50px;
  height: 15px;
  background: linear-gradient(135deg, #A0826D, #8B7355);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.soil-emoji {
  font-size: 1.2rem;
  animation: gentle-pulse 2s ease-in-out infinite;
}

.plant-growth {
  position: relative;
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: grow-in 0.8s ease-out;
}

.plant-sprout {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: plant-sway 3s ease-in-out infinite;
}

.plant-emoji {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  transition: all 0.3s ease;
}

.plant-sprout.negative .plant-emoji {
  animation: wilt 1s ease-in-out;
}

.growth-sparkles {
  position: absolute;
  top: -10px;
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.sparkle {
  font-size: 0.8rem;
  animation: sparkle-twinkle 2s ease-in-out infinite;
}

.sparkle:nth-child(2) {
  animation-delay: 0.5s;
}

.writing-indicator {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.waiting-emoji {
  font-size: 1.5rem;
  animation: float-waiting 2s ease-in-out infinite;
}

.typing-dots {
  display: flex;
  gap: 3px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  background: var(--primary-color);
  border-radius: var(--radius-full);
  animation: typing-animation 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes grow-in {
  0% {
    height: 0;
    opacity: 0;
  }
  100% {
    height: 60px;
    opacity: 1;
  }
}

@keyframes plant-sway {
  0%, 100% { 
    transform: rotate(-2deg); 
  }
  50% { 
    transform: rotate(2deg); 
  }
}

@keyframes wilt {
  0% { 
    transform: scale(1) rotate(0deg); 
  }
  50% { 
    transform: scale(0.9) rotate(-5deg); 
  }
  100% { 
    transform: scale(1) rotate(0deg); 
  }
}

@keyframes sparkle-twinkle {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(0.8); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

@keyframes float-waiting {
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-5px); 
  }
}

@keyframes typing-animation {
  0%, 80%, 100% { 
    transform: scale(1); 
    opacity: 0.5; 
  }
  40% { 
    transform: scale(1.3); 
    opacity: 1; 
  }
}

.garden-input {
  width: 100%;
  border: 2px solid var(--border-light);
  border-radius: 20px;
  padding: 1.5rem;
  font-size: 1.1rem;
  background: url('/public/assets/images/input-bg.png'), rgba(255, 255, 255, 0.9);
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  color: var(--text-primary);
  resize: vertical;
  transition: all 0.3s ease;
  font-family: inherit;
  line-height: 1.6;
  min-height: 120px;
}

.garden-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 25px rgba(132, 169, 140, 0.2);
  background: rgba(255, 255, 255, 1);
}

.garden-input.required {
  border-color: var(--primary-color);
}

.garden-input::placeholder {
  color: var(--text-muted);
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
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, var(--bg-muted), rgba(255, 155, 133, 0.1));
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
}

.reminder-icon {
  font-size: 1.2rem;
}

/* 初始情绪显示 */
.initial-emotions-display {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.08), rgba(132, 169, 140, 0.05));
  border-radius: 20px;
  border: 2px solid rgba(132, 169, 140, 0.2);
  text-align: center;
}

.initial-emotions-text {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 0.8rem 0;
}

.adjustment-hint {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-style: italic;
  margin: 0;
  opacity: 0.9; /* 提高对比度 */
}

/* 情绪选择 */
.emotion-selection {
  margin: 2rem 0;
  text-align: left;
}

.emotion-selection h4 {
  color: var(--text-primary);
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
  border-color: var(--primary-color);
}

.emotion-option.selected {
  border-color: var(--primary-color);
  background: var(--bg-muted);
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
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 强度控制 */
.intensity-control {
  margin: 2rem 0;
}

.intensity-label {
  display: block;
  color: var(--text-primary);
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
  border-radius: var(--radius-sm);
  background: var(--border-light);
  outline: none;
  -webkit-appearance: none;
  margin-bottom: var(--spacing-sm);
}

.intensity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 25px;
  height: 25px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  cursor: pointer;
  box-shadow: var(--shadow-primary);
  transition: all var(--transition-base);
}

.intensity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
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
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.journey-button.secondary:hover {
  background: var(--bg-muted);
  border-color: var(--primary-color);
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
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  text-align: center;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(15px);
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-card h3 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.success-card p {
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .growth-journey {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .step-card {
    background: rgba(20, 25, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }
  
  .step-title {
    color: #ffffff;
  }
  
  .step-description {
    color: #b0b0b0;
  }
  
  .garden-input {
    background: rgba(30, 35, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
    color: #e0e0e0;
  }
  
  .garden-input::placeholder {
    color: #888888;
  }
  
  .emotion-option {
    background: rgba(30, 35, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .emotion-option:hover {
    border-color: #84A98C;
  }
  
  .emotion-option.selected {
    background: rgba(132, 169, 140, 0.2);
    border-color: #84A98C;
  }
  
  .emotion-label {
    color: #e0e0e0;
  }
  
  .journey-progress {
    background: rgba(20, 25, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .nav-menu {
    background: rgba(20, 25, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
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
  
  /* 修复移动端字体大小和触摸友好性 */
  .step-indicator {
    font-size: 1rem; /* 保持可读性 */
    padding: 0.5rem; /* 增加触摸区域 */
  }
  
  .step-count {
    font-size: 1rem; /* 从0.9rem改为1rem */
  }
  
  .emotions-text {
    font-size: 1rem; /* 从var(--font-size-sm)改为1rem */
  }
  
  .emotion-label {
    font-size: 1rem; /* 从0.9rem改为1rem */
  }
  
  .slider-labels {
    font-size: 1rem; /* 从0.85rem改为1rem */
  }
  
  /* 确保进度指示器在移动端正确显示 */
  .journey-progress {
    margin-bottom: 1.5rem; /* 增加间距 */
    padding: 1rem; /* 增加内边距 */
  }
  
  .step-indicator {
    min-height: 44px; /* 确保触摸友好 */
    flex-wrap: nowrap; /* 强制水平排列 */
    gap: 0.5rem; /* 适当减少间距以适应小屏幕 */
  }
  
  .step-name {
    font-size: 0.9rem; /* 稍微减小以适应小屏幕 */
    max-width: 60%; /* 限制最大宽度 */
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
  
  /* 增大触摸目标 */
  .emotion-option {
    padding: 1.2rem 0.8rem; /* 增加内边距 */
    min-height: 48px; /* 确保最小触摸目标 */
  }
  
  .emotion-option .emotion-icon {
    width: 48px;
    height: 48px;
  }
  
  .intensity-slider {
    height: 12px; /* 增加滑块高度 */
  }
  
  .intensity-slider::-webkit-slider-thumb {
    width: 28px;
    height: 28px;
  }
  
  /* 进一步优化进度指示器 */
  .step-indicator {
    flex-direction: column; /* 在极小屏幕上垂直排列 */
    gap: 0.3rem;
    text-align: center;
    padding: 0.8rem;
  }
  
  .step-name {
    font-size: 0.9rem;
    max-width: 100%; /* 允许全宽 */
    order: 1; /* 调整顺序 */
  }
  
  .step-count {
    font-size: 0.8rem;
    order: 2;
  }
  
  .seed-icon {
    order: 0; /* 图标在最上方 */
    margin-bottom: 0.3rem;
  }
}
</style>
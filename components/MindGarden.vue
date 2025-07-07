<template>
  <div class="mind-garden">
    <!-- 背景层 -->
    <div class="garden-background">
      <div class="sky-gradient"></div>
      <div class="floating-particles">
        <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="garden-content">
      
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-card">
          <h1 class="garden-title">
            <span class="title-icon">🌱</span>
            欢迎回到你的心灵花园
          </h1>
          <p class="garden-subtitle">每一次探索，都是成长的见证</p>
          
          <!-- 今日感受询问 -->
          <div class="mood-check">
            <h3 class="mood-title">今天的心情，像什么颜色？</h3>
            
            <!-- 情绪选择网格 - 支持多选 -->
            <div class="emotion-grid">
              <div 
                v-for="emotion in emotionOptions" 
                :key="emotion.name"
                @click="toggleEmotion(emotion)"
                class="emotion-card"
                :class="{ 'selected': isEmotionSelected(emotion) }"
              >
                <div class="emotion-icon" :style="{ background: emotion.gradient }">
                  {{ emotion.emoji }}
                </div>
                <span class="emotion-name">{{ emotion.name }}</span>
                <div class="selection-indicator" v-if="isEmotionSelected(emotion)">✓</div>
              </div>
            </div>

            <!-- 选中的情绪标签 -->
            <div class="selected-emotions" v-if="selectedEmotions.length > 0">
              <div class="emotion-tags">
                <span 
                  v-for="emotion in selectedEmotions" 
                  :key="emotion.name" 
                  class="emotion-tag"
                  :style="{ background: emotion.gradient }"
                  @click="removeEmotion(emotion)"
                >
                  {{ emotion.emoji }} {{ emotion.name }}
                  <span class="remove-tag">×</span>
                </span>
              </div>
            </div>

            <!-- 自定义情绪输入 -->
            <div class="custom-emotion">
              <input 
                v-model="customEmotion"
                type="text" 
                placeholder="或者用自己的话描述..."
                class="custom-input"
                @focus="onCustomEmotionFocus"
                @blur="onCustomEmotionBlur"
                @keyup.enter.prevent="addCustomEmotion"
                @keydown.tab.prevent="addCustomEmotion"
                ref="customEmotionInput"
              >
              <button 
                v-if="customEmotion.trim()" 
                @click="addCustomEmotion"
                class="add-emotion-btn"
                type="button"
              >
                添加
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <button 
                @click="skipMoodSelection" 
                class="btn btn-secondary skip-btn"
              >
                暂时不想说，直接开始
              </button>
              <button 
                @click="startGrowthJourney" 
                class="btn btn-primary start-btn"
                :disabled="!canStart"
              >
                <span class="btn-icon">🌿</span>
                开始今天的成长之旅
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速访问区域 -->
      <div class="quick-access">
        <h3 class="section-title">探索你的花园</h3>
        <div class="access-grid">
          
          <!-- 成长足迹 -->
          <router-link to="/dashboard" class="access-card growth-card">
            <div class="card-icon">🌸</div>
            <div class="card-content">
              <h4>成长足迹</h4>
              <p>回顾你的心灵成长历程</p>
              <div class="card-stats" v-if="stats">
                <span>已记录 {{ stats.total }} 次成长</span>
              </div>
            </div>
          </router-link>

          <!-- 智慧伙伴 -->
          <router-link to="/analysis" class="access-card wisdom-card">
            <div class="card-icon">🤖</div>
            <div class="card-content">
              <h4>智慧伙伴</h4>
              <p>与AI伙伴进行深度对话</p>
              <div class="card-hint">
                <span>24小时陪伴</span>
              </div>
            </div>
          </router-link>

          <!-- 花园设置 -->
          <router-link to="/config" class="access-card settings-card">
            <div class="card-icon">⚙️</div>
            <div class="card-content">
              <h4>花园设置</h4>
              <p>个性化你的体验</p>
            </div>
          </router-link>

        </div>
      </div>

      <!-- 每日灵感 -->
      <div class="daily-inspiration" v-if="dailyInspiration">
        <div class="inspiration-card">
          <div class="inspiration-icon">💝</div>
          <div class="inspiration-content">
            <h4>今日小提醒</h4>
            <p>{{ dailyInspiration }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'MindGarden',
  data() {
    return {
      selectedEmotions: [], // 改为数组支持多选
      customEmotion: '',
      isCustomEmotionFocused: false,
      customEmotionHistory: [], // 新增：记录历史输入
      customEmotionHistoryIndex: -1, // 新增：历史记录索引
      
      // 预设情绪选项
      emotionOptions: [
        { 
          name: '愉悦阳光', 
          emoji: '😊', 
          color: '#FFC857',
          gradient: 'linear-gradient(135deg, #FFC857, #FFD700)',
          flower: 'sunflower'
        },
        { 
          name: '平静如水', 
          emoji: '😌', 
          color: '#84A98C',
          gradient: 'linear-gradient(135deg, #84A98C, #7B9BB3)',
          flower: 'lavender'
        },
        { 
          name: '有些低落', 
          emoji: '😔', 
          color: '#A0826D',
          gradient: 'linear-gradient(135deg, #A0826D, #8B7355)',
          flower: 'wilted'
        },
        { 
          name: '焦虑不安', 
          emoji: '😰', 
          color: '#9384A8',
          gradient: 'linear-gradient(135deg, #9384A8, #7A6B8A)',
          flower: 'thorny'
        },
        { 
          name: '充满希望', 
          emoji: '🌟', 
          color: '#FF9B85',
          gradient: 'linear-gradient(135deg, #FF9B85, #FFA07A)',
          flower: 'cherry'
        },
        { 
          name: '疲惫倦怠', 
          emoji: '😴', 
          color: '#CAD2C5',
          gradient: 'linear-gradient(135deg, #CAD2C5, #B8C5B8)',
          flower: 'droopy'
        }
      ],

      // 每日灵感语录
      dailyInspiration: '',
      
      // 统计数据
      stats: null
    }
  },
  computed: {
    canStart() {
      return this.selectedEmotions.length > 0 || this.customEmotion.trim().length > 0
    }
  },
  methods: {
    // 切换情绪选择状态（多选模式）
    toggleEmotion(emotion) {
      const index = this.selectedEmotions.findIndex(e => e.name === emotion.name)
      if (index > -1) {
        this.selectedEmotions.splice(index, 1)
      } else {
        this.selectedEmotions.push(emotion)
      }
    },

    // 检查情绪是否被选中
    isEmotionSelected(emotion) {
      return this.selectedEmotions.some(e => e.name === emotion.name)
    },

    // 移除选中的情绪
    removeEmotion(emotion) {
      const index = this.selectedEmotions.findIndex(e => e.name === emotion.name)
      if (index > -1) {
        this.selectedEmotions.splice(index, 1)
      }
    },

    onCustomEmotionFocus() {
      this.isCustomEmotionFocused = true
      this.customEmotionHistoryIndex = -1
    },

    onCustomEmotionBlur() {
      setTimeout(() => {
        this.isCustomEmotionFocused = false
      }, 200)
    },

    // 添加自定义情绪为标签
    addCustomEmotion() {
      const emotionText = this.customEmotion.trim()
      if (!emotionText) return
      
      // 检查是否已存在相同的自定义情绪
      const exists = this.selectedEmotions.some(emotion => 
        emotion.name === emotionText && emotion.isCustom
      )
      
      if (!exists) {
        // 生成渐变色
        const gradients = [
          'linear-gradient(135deg, #84A98C, #7B9BB3)',
          'linear-gradient(135deg, #A0826D, #8B7355)',
          'linear-gradient(135deg, #9384A8, #7A6B8A)',
          'linear-gradient(135deg, #FF9B85, #FFA07A)',
        ]
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)]
        
        const customEmotionObj = {
          name: emotionText,
          isCustom: true,
          emoji: '💭',
          color: '#84A98C',
          gradient: randomGradient,
          flower: 'custom'
        }
        
        this.selectedEmotions.push(customEmotionObj)
        
        // 添加到历史记录
        if (!this.customEmotionHistory.includes(emotionText)) {
          this.customEmotionHistory.unshift(emotionText)
          if (this.customEmotionHistory.length > 5) {
            this.customEmotionHistory.pop()
          }
        }
        
        this.customEmotion = '' // 清空输入框
        this.$nextTick(() => {
          this.$refs.customEmotionInput.focus() // 保持输入框焦点
        })
      }
    },

    skipMoodSelection() {
      // 跳过情绪选择，清除所有选中的情绪和自定义输入
      this.selectedEmotions = []
      this.customEmotion = ''
      
      // 清除store中的当前会话数据
      this.$store.state.currentSession = null
      
      // 直接进入记录流程，不传递任何情绪数据
      this.$router.push('/record')
    },

    startGrowthJourney() {
      // 将选择的情绪传递到记录流程
      let emotions = [...this.selectedEmotions]
      
      // 如果输入框还有未添加的自定义情绪，自动添加
      if (this.customEmotion.trim()) {
        this.addCustomEmotion()
        emotions = [...this.selectedEmotions] // 获取更新后的列表
      }
      
      const emotionData = {
        emotions: emotions, // 现在是多个情绪的数组
        timestamp: new Date()
      }
      
      // 存储当前情绪选择
      this.$store.state.currentSession = emotionData
      
      // 进入思维记录流程
      this.$router.push('/record')
    },

    getParticleStyle(index) {
      const angle = (index * 30) + Math.random() * 30
      const distance = 100 + Math.random() * 200
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      const delay = Math.random() * 4
      const duration = 6 + Math.random() * 4
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    },

    loadStats() {
      // 从store加载统计数据
      if (this.$store && this.$store.state.thoughtRecords) {
        this.stats = {
          total: this.$store.state.thoughtRecords.length,
          thisWeek: this.$store.state.thoughtRecords.filter(record => {
            const recordDate = new Date(record.timestamp)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return recordDate > weekAgo
          }).length
        }
      }
    },

    loadDailyInspiration() {
      const inspirations = [
        "每一个想法都值得被温柔对待",
        "成长不是一蹴而就，而是每天的小小进步",
        "你比想象中更坚强，也比想象中更值得被爱",
        "今天的困难，是明天智慧的种子",
        "允许自己不完美，这就是成长的开始",
        "每一次深呼吸，都是给心灵的温柔拥抱",
        "你的感受都是真实有效的，不需要评判",
        "在心的花园里，每一朵花都有绽放的时候"
      ]
      
      const today = new Date()
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
      this.dailyInspiration = inspirations[dayOfYear % inspirations.length]
    }
  },
  mounted() {
    this.loadStats()
    this.loadDailyInspiration()
  }
}
</script>

<style scoped>
.mind-garden {
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

/* 主内容 */
.garden-content {
  position: relative;
  z-index: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 3rem 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.garden-title {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 3rem;
  animation: gentle-bounce 3s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.garden-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-style: italic;
  line-height: 1.6;
}

/* 情绪选择 */
.mood-check {
  margin-top: 2rem;
}

.mood-title {
  color: var(--text-primary);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.emotion-card {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 1rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
}

.emotion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: var(--primary-color);
}

.emotion-card.selected {
  border-color: var(--primary-color);
  background: rgba(132, 169, 140, 0.2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
}

.selection-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0); }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.emotion-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 0.5rem;
  transition: all 0.3s ease;
}

.emotion-name {
  display: block;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 自定义情绪输入样式优化 */
.custom-emotion {
  margin-bottom: 2rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
}

.custom-input {
  flex: 1;
  max-width: 300px;
  padding: 1rem 1.2rem;
  border: 2px solid var(--border-light);
  border-radius: 15px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  transition: all 0.3s ease;
  text-align: center;
}

.custom-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 20px rgba(132, 169, 140, 0.3);
  background: rgba(255, 255, 255, 1);
}

.custom-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.add-emotion-btn {
  padding: 1rem 1.5rem;
  background: var(--secondary-gradient);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  opacity: 0;
  transform: translateX(-10px);
  animation: fadeInRight 0.3s ease forwards;
}

.add-emotion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

@keyframes fadeInRight {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 选中情绪标签样式优化 */
.selected-emotions {
  margin-bottom: 1.5rem;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  padding: 0.5rem;
}

.emotion-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: tagPop 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.emotion-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.remove-tag {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  margin-left: 0.3rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.emotion-tag:hover .remove-tag {
  background: rgba(255, 255, 255, 0.3);
}

@keyframes tagPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
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
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--border-medium);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:hover {
  background: var(--bg-muted);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

/* 快速访问区域 */
.quick-access {
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.access-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.access-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  text-decoration: none;
  color: inherit;
}

.card-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-gradient);
  border-radius: 15px;
  color: white;
  flex-shrink: 0;
}

.card-content h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-content p {
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.card-stats, .card-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* 每日灵感 */
.daily-inspiration {
  text-align: center;
}

.inspiration-card {
  background: linear-gradient(135deg, rgba(255, 155, 133, 0.1), rgba(255, 200, 87, 0.1));
  border: 2px solid rgba(255, 155, 133, 0.3);
  border-radius: 20px;
  padding: 2rem;
  max-width: fit-content;
  min-width: 300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.inspiration-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.inspiration-content h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.inspiration-content p {
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .garden-content {
    padding: 1rem;
  }
  
  .welcome-card {
    padding: 2rem 1.5rem;
  }
  
  .garden-title {
    font-size: 2rem;
  }
  
  .emotion-grid {
    grid-template-columns: repeat(3, 1fr); /* 改为3列优化布局 */
    gap: 0.8rem;
  }
  
  .emotion-card {
    padding: 0.8rem 0.5rem;
  }
  
  .emotion-icon {
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }
  
  .emotion-name {
    font-size: 0.85rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .access-grid {
    grid-template-columns: 1fr;
  }
  
  .access-card {
    flex-direction: column;
    text-align: center;
  }
  
  .inspiration-card {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .garden-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .title-icon {
    font-size: 2.5rem;
  }
  
  .emotion-grid {
    grid-template-columns: repeat(3, 1fr); /* 小屏幕保持3列 */
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  
  .emotion-card {
    padding: 0.6rem 0.4rem;
  }
  
  .emotion-icon {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
  }
  
  .emotion-name {
    font-size: 0.8rem;
  }
  
  .custom-emotion {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .custom-input {
    width: 100%;
    max-width: none;
    padding: 1rem;
    font-size: 1rem;
    text-align: left; /* 移动端左对齐更自然 */
  }
  
  .add-emotion-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1rem;
  }
  
  /* 优化移动端情绪标签显示 */
  .emotion-tags {
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .emotion-tag {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    border-radius: 15px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .mind-garden {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .garden-background::before {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 30%, #1f2e2e 100%);
  }
  
  .welcome-card {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .garden-title {
    color: #ffffff;
  }
  
  .garden-subtitle {
    color: #d0d0d0;
  }
  
  .emotion-card {
    background: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }
  
  .emotion-card:hover {
    background: rgba(50, 50, 50, 0.9);
    border-color: #84A98C;
  }
  
  .emotion-card.selected {
    background: rgba(132, 169, 140, 0.3);
    border-color: #84A98C;
  }
  
  .emotion-name {
    color: #ffffff;
  }
  
  .custom-input {
    background: rgba(40, 40, 40, 0.8);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .custom-input:focus {
    background: rgba(50, 50, 50, 0.9);
    border-color: #84A98C;
    color: #ffffff;
  }
  
  .custom-input::placeholder {
    color: #b0b0b0;
  }
  
  .add-emotion-btn {
    background: linear-gradient(135deg, #84A98C, #52796F);
    color: #ffffff;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #84A98C, #52796F);
    color: #ffffff;
  }
  
  .btn-secondary {
    background: rgba(40, 40, 40, 0.8);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .emotion-tag {
    background: rgba(132, 169, 140, 0.3);
    color: #e0e0e0;
    border-color: rgba(132, 169, 140, 0.5);
  }
  
  .remove-tag {
    background: rgba(255, 99, 71, 0.3);
    color: #ff6347;
  }
  
  .access-card {
    background: rgba(30, 30, 30, 0.9);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .access-card:hover {
    background: rgba(50, 50, 50, 0.95);
    border-color: #84A98C;
  }
  
  .access-title {
    color: #ffffff;
  }
  
  .access-description {
    color: #d0d0d0;
  }
  
  .inspiration-card {
    background: rgba(30, 30, 30, 0.9);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .inspiration-text {
    color: #ffffff;
  }
  
  .inspiration-author {
    color: #84A98C;
  }
}

/* 触摸友好性优化 */
@media (hover: none) and (pointer: coarse) {
  .emotion-card {
    min-height: 80px; /* 确保足够的触摸区域 */
  }
  
  .emotion-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  .remove-tag {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
  
  .selection-indicator {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
  
  .add-emotion-btn:active,
  .btn:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
}

/* 改善移动端字体大小和可读性 */
@media (max-width: 768px) {
  .emotion-name {
    font-size: max(0.9rem, 16px); /* 防止iOS缩放，确保可读性 */
    line-height: 1.4;
  }
  
  .custom-input {
    font-size: max(1rem, 16px); /* 防止iOS缩放 */
  }
}

@media (max-width: 480px) {
  .emotion-grid {
    grid-template-columns: repeat(2, 1fr); /* 改为2列，避免过于拥挤 */
    gap: 1rem;
  }
  
  .emotion-card {
    padding: 1rem 0.6rem;
    min-height: 90px; /* 增大触摸区域 */
  }
  
  .emotion-icon {
    width: 44px; /* 符合最小触摸目标 */
    height: 44px;
    font-size: 1.4rem;
  }
  
  .emotion-name {
    font-size: max(0.9rem, 16px);
    margin-top: 0.5rem;
  }
  
  .emotion-tag {
    padding: 0.8rem 1.2rem; /* 增大触摸区域 */
    font-size: max(0.9rem, 16px);
    border-radius: 18px;
    min-height: 44px; /* 最小触摸目标 */
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-buttons {
    gap: 1.5rem; /* 增大按钮间距 */
  }
  
  .btn {
    min-height: 48px; /* 增大按钮高度 */
    font-size: max(1rem, 16px);
  }
}
</style>
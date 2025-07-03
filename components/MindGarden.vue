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
                @keyup.enter="addCustomEmotion"
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
    },

    onCustomEmotionBlur() {
      this.isCustomEmotionFocused = false
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
        const customEmotionObj = {
          name: emotionText,
          isCustom: true,
          emoji: '💭',
          color: '#84A98C',
          gradient: 'linear-gradient(135deg, #84A98C, #7B9BB3)',
          flower: 'custom'
        }
        
        this.selectedEmotions.push(customEmotionObj)
        this.customEmotion = '' // 清空输入框
      }
    },

    skipMoodSelection() {
      // 跳过情绪选择，直接进入记录流程
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
}

.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, 
    #E8F4F8 0%, 
    #F0E5D8 30%, 
    #CAD2C5 100%);
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
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
  color: var(--life-moss);
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
  color: var(--life-olive);
  margin-bottom: 2rem;
  font-style: italic;
  line-height: 1.6;
}

/* 情绪选择 */
.mood-check {
  margin-top: 2rem;
}

.mood-title {
  color: var(--life-moss);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
  border-color: var(--life-olive);
}

.emotion-card.selected {
  border-color: var(--life-moss);
  background: rgba(132, 169, 140, 0.2);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
}

.selection-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--life-moss);
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
  color: var(--life-moss);
  font-size: 0.9rem;
  font-weight: 500;
}

/* 自定义情绪输入 */
.custom-emotion {
  margin-bottom: 2rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.custom-input {
  flex: 1;
  max-width: 300px;
  padding: 1rem;
  border: 2px solid var(--earth-clay);
  border-radius: 15px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--life-moss);
  transition: all 0.3s ease;
  text-align: center;
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
}

.add-emotion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

.custom-input:focus {
  outline: none;
  border-color: var(--life-olive);
  box-shadow: 0 0 20px rgba(132, 169, 140, 0.3);
  background: rgba(255, 255, 255, 1);
}

.custom-input::placeholder {
  color: var(--earth-clay);
  opacity: 0.7;
}

/* 选中情绪标签样式 */
.selected-emotions {
  margin-bottom: 1.5rem;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.emotion-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
}

.emotion-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.remove-tag {
  margin-left: 0.3rem;
  font-size: 1.1rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.emotion-tag:hover .remove-tag {
  opacity: 1;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
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
  background: rgba(211, 184, 165, 0.8);
  color: var(--life-moss);
}

.btn-secondary:hover {
  background: var(--earth-clay);
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
  color: var(--life-moss);
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
  color: var(--life-moss);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-content p {
  color: var(--life-olive);
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

.card-stats, .card-hint {
  font-size: 0.85rem;
  color: var(--earth-clay);
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
  max-width: 500px;
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
  color: var(--life-moss);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.inspiration-content p {
  color: var(--life-olive);
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
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }
  
  .emotion-card {
    padding: 0.8rem 0.4rem;
  }
  
  .emotion-icon {
    width: 40px;
    height: 40px;
  }
  
  .emotion-name {
    font-size: 0.8rem;
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
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }
  
  .emotion-card {
    padding: 0.8rem 0.4rem;
  }
  
  .emotion-icon {
    width: 35px;
    height: 35px;
  }
  
  .emotion-name {
    font-size: 0.75rem;
  }
  
  .custom-emotion {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .custom-input {
    max-width: 100%;
  }
}
</style>
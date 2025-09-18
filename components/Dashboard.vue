<template>
  <div class="growth-garden">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-icon">🌱</div>
        <div class="loading-text">花园正在绽放...</div>
      </div>
    </div>

    <!-- 背景层 -->
    <div class="garden-background">
      <div class="blooming-particles">
        <div v-for="i in 15" :key="i" class="bloom-particle" :style="getBloomParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <button @click="goBack" class="floating-back-btn" aria-label="返回主页">
      <span>🏡</span>
    </button>

    <!-- 主内容区 -->
    <div class="garden-content">
      
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <h1 class="page-title">
          <span class="title-icon">🌸</span>
          {{ $t('dashboard.title') }}
        </h1>
        <p class="page-subtitle" v-if="latestRecord">
          {{ $t('dashboard.recentRecord', { time: formatRelativeTime(latestRecord.timestamp) }) }}
        </p>
        <p class="page-subtitle" v-else>
          {{ $t('dashboard.welcomeMessage') }}
        </p>
      </div>

      <!-- 成长统计花园 -->
      <div class="stats-garden">
        <h3 class="section-title">🌿 {{ $t('dashboard.stats.title') }}</h3>
        <div class="stats-grid">
          
          <!-- 种子播种数 -->
          <div class="stat-bloom total-seeds">
            <div class="bloom-icon seeds">🌱</div>
            <div class="bloom-content">
              <div class="bloom-number">{{ $store.state.thoughtRecords.length }}</div>
              <div class="bloom-label">{{ $t('dashboard.stats.seeds') }}</div>
            </div>
          </div>
          
          <!-- 花朵绽放数 -->
          <div class="stat-bloom bloomed-flowers">
            <div class="bloom-icon flowers">🌸</div>
            <div class="bloom-content">
              <div class="bloom-number">{{ analyzedRecordsCount }}</div>
              <div class="bloom-label">{{ $t('dashboard.stats.flowers') }}</div>
            </div>
          </div>
          
          <!-- 情绪花园状态 -->
          <div class="stat-bloom garden-health">
            <div class="bloom-icon health">{{ moodTrend.emoji }}</div>
            <div class="bloom-content">
              <div class="bloom-status" :class="moodTrend.class">{{ moodTrend.label }}</div>
              <div class="bloom-label">{{ $t('dashboard.stats.gardenHealth') }}</div>
            </div>
          </div>

        </div>
      </div>

      <!-- 快速行动花园 -->
      <div class="action-garden">
        <h3 class="section-title">🌿 继续培育心灵</h3>
        <div class="action-grid">
          
          <!-- 播种新想法 -->
          <router-link to="/record" class="action-bloom plant-seed">
            <div class="action-icon">🌱</div>
            <div class="action-content">
              <h4>播种新的想法</h4>
              <p>记录今天心中萌芽的思绪</p>
            </div>
          </router-link>

          <!-- 与智慧伙伴聊天 -->
          <router-link 
            to="/analysis" 
            class="action-bloom wise-companion"
            :class="{ 'action-disabled': !hasRecords }"
          >
            <div class="action-icon">🤖</div>
            <div class="action-content">
              <h4>与智慧伙伴对话</h4>
              <p v-if="hasRecords">探索{{ pendingAnalysisCount }}个待分析的想法</p>
              <p v-else>先播下一些想法的种子吧</p>
            </div>
          </router-link>

        </div>
      </div>

      <!-- 成长记录花园 -->
      <div class="records-garden" v-if="hasRecords">
        <h3 class="section-title">🌸 {{ $t('dashboard.records.title') }}</h3>
        <div class="records-grid">
          <div 
            v-for="(record, index) in recentRecords" 
            :key="index"
            class="record-bloom"
            @click="goToAnalysis(index)"
          >
            <div class="record-header">
              <div class="record-time">{{ formatRelativeTime(record.timestamp) }}</div>
              <div class="record-growth-stage" :class="getGrowthStageClass(record)">
                {{ getGrowthStage(record) }}
              </div>
            </div>
            
            <div class="record-emotion-garden" v-if="record.initialEmotion">
              <div class="initial-emotion" :style="{ background: record.initialEmotion.gradient }">
                {{ record.initialEmotion.emoji || '💭' }}
              </div>
              <div class="emotion-label">{{ record.initialEmotion.name }}</div>
            </div>
            
            <div class="record-thought-snippet">
              "{{ truncateText(record.automaticThought, 60) }}"
            </div>
            
            <div class="record-growth-indicator">
              <div class="growth-progress" :class="getGrowthProgressClass(record)">
                <span class="progress-icon">{{ getGrowthIcon(record) }}</span>
                <span class="progress-text">{{ getGrowthProgressText(record) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 心灵花园洞察 -->
      <div class="insights-garden">
        <h3 class="section-title">🌻 花园的智慧洞察</h3>
        <div class="insights-grid">
          
          <!-- 情绪花朵分布 -->
          <div class="insight-bloom emotion-distribution">
            <div class="insight-header">
              <h4>💐 情绪花朵的色彩</h4>
              <div class="insight-badge" v-if="hasRecords">
                {{ Object.keys(emotionDistribution).length }}种色彩
              </div>
            </div>
            
            <div class="insight-content" v-if="Object.keys(emotionDistribution).length > 0">
              <div class="emotion-flowers">
                <div 
                  v-for="([emotion, count], index) in Object.entries(sortedEmotions).slice(0, 5)"
                  :key="emotion"
                  class="emotion-flower"
                >
                  <div class="flower-icon">{{ getEmotionEmoji(emotion) }}</div>
                  <div class="flower-info">
                    <div class="flower-name">{{ emotion }}</div>
                    <div class="flower-count">绽放了{{ count }}次</div>
                  </div>
                  <div class="flower-bloom-bar">
                    <div 
                      class="bloom-progress"
                      :style="{ width: `${(count / maxEmotionCount) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="insight-empty" v-else>
              <div class="empty-icon">🌱</div>
              <p>还没有情绪记录，开始播种你的感受吧</p>
            </div>
          </div>

          <!-- 成长智慧总结 -->
          <div class="insight-bloom growth-wisdom">
            <div class="insight-header">
              <h4>✨ 智慧伙伴的发现</h4>
              <div class="insight-badge" v-if="analyzedRecordsCount > 0">
                {{ analyzedRecordsCount }}次深度对话
              </div>
            </div>
            
            <div class="insight-content" v-if="analyzedRecordsCount > 0">
              <div class="wisdom-summary">
                <div class="wisdom-stat">
                  <div class="stat-icon">🔍</div>
                  <div class="stat-text">
                    <span class="stat-number">{{ getCommonBiasesCount() }}</span>
                    <span class="stat-label">个思维模式被发现</span>
                  </div>
                </div>
                <div class="wisdom-stat">
                  <div class="stat-icon">🌟</div>
                  <div class="stat-text">
                    <span class="stat-number">{{ getAlternativeThoughtsCount() }}</span>
                    <span class="stat-label">个新视角被采纳</span>
                  </div>
                </div>
                <div class="wisdom-encouragement">
                  <p>{{ getEncouragementMessage() }}</p>
                </div>
              </div>
            </div>
            
            <div class="insight-empty" v-else>
              <div class="empty-icon">🤖</div>
              <p>开始与智慧伙伴对话，发现内心的智慧</p>
            </div>
          </div>

        </div>
      </div>

      <!-- 每日鼓励 -->
      <div class="daily-encouragement" v-if="dailyEncouragement">
        <div class="encouragement-card">
          <div class="encouragement-icon">🌈</div>
          <div class="encouragement-content">
            <h4>今日的花园寄语</h4>
            <p>{{ dailyEncouragement }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      dailyEncouragement: '',
      isLoading: true
    }
  },
  computed: {
    latestRecord() {
      return this.$store.state.thoughtRecords[0];
    },
    hasRecords() {
      return this.$store.state.thoughtRecords && this.$store.state.thoughtRecords.length > 0;
    },
    recentRecords() {
      if (!this.$store.state.thoughtRecords || !Array.isArray(this.$store.state.thoughtRecords)) {
        return [];
      }
      return this.$store.state.thoughtRecords.slice(0, 6);
    },
    analyzedRecordsCount() {
      if (!this.$store.state.thoughtRecords) return 0
      return this.$store.state.thoughtRecords.filter(
        record => record.completed || record.alternativeThought
      ).length;
    },
    pendingAnalysisCount() {
      if (!this.$store.state.thoughtRecords) return 0
      return this.$store.state.thoughtRecords.filter(
        record => !record.completed && !record.alternativeThought
      ).length;
    },
    emotionDistribution() {
      if (!this.$store.state.thoughtRecords || !Array.isArray(this.$store.state.thoughtRecords)) {
        return {}
      }
      const emotions = this.$store.state.thoughtRecords
        .flatMap(record => record.emotions || []);
      return emotions.reduce((acc, emotion) => {
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
      }, {});
    },
    maxEmotionCount() {
      return Math.max(...Object.values(this.emotionDistribution || {}), 1);
    },
    sortedEmotions() {
      return Object.entries(this.emotionDistribution)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    },
    moodTrend() {
      if (!this.$store.state.thoughtRecords || !Array.isArray(this.$store.state.thoughtRecords)) {
        return { 
          label: '刚刚起步', 
          class: 'neutral',
          emoji: '🌱'
        };
      }
      const records = this.$store.state.thoughtRecords.slice(0, 5);
      if (records.length < 2) {
        return { 
          label: '刚刚起步', 
          class: 'neutral',
          emoji: '🌱'
        };
      }
      const recentAvg = records.slice(0, Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.ceil(records.length/2);
      const earlierAvg = records.slice(Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.floor(records.length/2);
      const diff = recentAvg - earlierAvg;
      
      if (diff < -10) return { 
        label: '蓬勃向上', 
        class: 'positive',
        emoji: '🌸'
      };
      if (diff < -5) return { 
        label: '温和成长', 
        class: 'positive',
        emoji: '🌿'
      };
      if (diff > 10) return { 
        label: '需要关注', 
        class: 'attention',
        emoji: '🌧️'
      };
      if (diff > 5) return { 
        label: '略有波动', 
        class: 'neutral',
        emoji: '🌤️'
      };
      return { 
        label: '平静如水', 
        class: 'stable',
        emoji: '🌊'
      };
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },

    formatRelativeTime(timestamp) {
      if (!timestamp) return '未知时间'
      const now = new Date()
      const date = new Date(timestamp)
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffHours < 1) return '刚刚'
      if (diffHours < 24) return `${diffHours}小时前`
      if (diffDays < 7) return `${diffDays}天前`
      return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      })
    },

    truncateText(text, length) {
      if (!text) return ''
      return text.length > length ? text.slice(0, length) + '...' : text
    },

    getGrowthStage(record) {
      if (record.completed) return this.$t('dashboard.records.stageCompleted')
      if (record.alternativeThought) return this.$t('dashboard.records.stageBlooming')
      return this.$t('dashboard.records.stageGrowing')
    },

    getGrowthStageClass(record) {
      if (record.completed) return 'stage-completed'
      if (record.alternativeThought) return 'stage-blooming'
      return 'stage-growing'
    },

    getGrowthIcon(record) {
      if (record.completed) return '🌸'
      if (record.alternativeThought) return '🌿'
      return '🌱'
    },

    getGrowthProgressClass(record) {
      if (record.completed) return 'progress-completed'
      if (record.alternativeThought) return 'progress-blooming'
      return 'progress-growing'
    },

    getGrowthProgressText(record) {
      if (record.completed) return this.$t('dashboard.records.progressCompleted')
      if (record.alternativeThought) return this.$t('dashboard.records.progressBlooming')
      return this.$t('dashboard.records.progressGrowing')
    },

    goToAnalysis(index) {
      this.$store.state.selectedRecordIndex = index
      this.$router.push('/analysis')
    },

    getEmotionEmoji(emotion) {
      const emojiMap = {
        '愉悦阳光': '😊',
        '平静如水': '😌', 
        '有些低落': '😔',
        '焦虑不安': '😰',
        '充满希望': '🌟',
        '疲惫倦怠': '😴',
        '愤怒': '😡',
        '困惑': '🤔',
        // 其他可能的情绪
        '开心': '😊',
        '难过': '😢',
        '紧张': '😟',
        '兴奋': '😆',
        '担心': '😰',
        '失望': '😞'
      }
      return emojiMap[emotion] || '💭'
    },

    getCommonBiasesCount() {
      const biases = this.$store.state.thoughtRecords
        .filter(record => record.completed)
        .flatMap(record => record.biases || [])
      return new Set(biases.map(bias => bias.type)).size
    },

    getAlternativeThoughtsCount() {
      return this.$store.state.thoughtRecords
        .filter(record => record.alternativeThought).length
    },

    getEncouragementMessage() {
      const messages = [
        '每一次探索都让你更了解自己',
        '你正在成为更智慧的自己',
        '成长的路上，你从不孤单',
        '你的勇敢让内心的花园更加美丽',
        '每个想法都值得被温柔对待'
      ]
      const completed = this.analyzedRecordsCount
      return messages[Math.min(completed, messages.length - 1)]
    },

    loadDailyEncouragement() {
      const encouragements = [
        '你的心灵花园正在悄悄绽放，每一天都有新的可能',
        '成长不是一蹴而就，而是每个当下的温柔坚持',
        '允许自己慢慢来，花朵都有自己的绽放时节',
        '今天的勇敢，就是明天智慧的种子',
        '在心的花园里，每一份情绪都有它的意义',
        '你比想象中更坚强，也比想象中更值得被爱',
        '每一次深呼吸，都是给心灵的温柔拥抱',
        '成长路上的每一步，都在为更好的自己铺路'
      ]
      
      const today = new Date()
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
      this.dailyEncouragement = encouragements[dayOfYear % encouragements.length]
    },

    getBloomParticleStyle(index) {
      const angle = (index * 24) + Math.random() * 24
      const distance = 150 + Math.random() * 200
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      const delay = Math.random() * 5
      const duration = 8 + Math.random() * 4
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }
    },

    async initializeDashboard() {
      try {
        this.isLoading = true;
        // 确保数据已加载
        if (!this.$store.state.thoughtRecords) {
          await this.$store.dispatch('loadThoughtRecords');
        }
        this.loadDailyEncouragement();
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },

  mounted() {
    this.initializeDashboard();
  }
}
</script>

<style scoped>
.growth-garden {
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

.blooming-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bloom-particle {
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
  background: linear-gradient(135deg, #84A98C, #52796F);
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
  animation: gentle-sway 3s ease-in-out infinite;
}

@keyframes gentle-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.header-title h1 {
  color: #2D3E40;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

/* 主内容 */
.garden-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem 2rem; /* 增加顶部内边距避免菜单遮挡 */
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 3rem;
  text-align: center;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2.5rem 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.welcome-avatar {
  margin-bottom: 1.5rem;
}

.avatar-bloom {
  font-size: 4rem;
  animation: gentle-pulse 2s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.welcome-title {
  color: #2D3E40;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.welcome-title .title-icon {
  font-size: 2.5rem;
  animation: gentle-sway 3s ease-in-out infinite;
}

@keyframes gentle-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.welcome-subtitle {
  color: #52796F;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  font-style: italic;
}

/* 统计花园 */
.stats-garden {
  margin-bottom: 3rem;
}

.section-title {
  color: #2D3E40;
  font-size: 1.6rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-bloom {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(132, 169, 140, 0.2);
}

.stat-bloom:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  border-color: #84A98C;
}

.bloom-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.bloom-icon.seeds { animation: gentle-bounce 2s ease-in-out infinite; }
.bloom-icon.flowers { animation: gentle-sway 3s ease-in-out infinite; }
.bloom-icon.health { animation: gentle-pulse 2.5s ease-in-out infinite; }

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.bloom-content {
  color: #2D3E40;
}

.bloom-number {
  font-size: 2.5rem;
  font-weight: 600;
  color: #84A98C;
  background: linear-gradient(135deg, #84A98C, #52796F);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.bloom-label {
  font-size: 1rem;
  color: #52796F;
  font-weight: 500;
}

.bloom-status {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  margin-bottom: 0.5rem;
}

.bloom-status.positive { background: rgba(132, 169, 140, 0.2); color: #2D3E40; }
.bloom-status.stable { background: rgba(255, 155, 133, 0.2); color: #FF9B85; }
.bloom-status.neutral { background: rgba(202, 210, 197, 0.3); color: #A0826D; }
.bloom-status.attention { background: rgba(160, 130, 109, 0.2); color: #A0826D; }

/* 快速行动花园 */
.action-garden {
  margin-bottom: 3rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-bloom {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 2px solid rgba(132, 169, 140, 0.2);
}

.action-bloom:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: inherit;
  border-color: #84A98C;
}

.action-bloom.plant-seed:hover {
  border-color: #52796F;
}

.action-bloom.wise-companion:hover {
  border-color: #FF9B85;
}

.action-bloom.action-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.action-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: gentle-pulse 2s ease-in-out infinite;
}

.action-content h4 {
  color: #2D3E40;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.action-content p {
  color: #52796F;
  margin: 0;
  line-height: 1.4;
}

/* 成长记录花园 */
.records-garden {
  margin-bottom: 3rem;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.record-bloom {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(132, 169, 140, 0.2);
}

.record-bloom:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-color: #84A98C;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.record-time {
  font-size: 0.85rem;
  color: #A0826D;
  background: rgba(132, 169, 140, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
}

.record-growth-stage {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-weight: 500;
}

.stage-completed { background: rgba(132, 169, 140, 0.2); color: #2D3E40; }
.stage-blooming { background: rgba(255, 155, 133, 0.2); color: #FF9B85; }
.stage-growing { background: rgba(202, 210, 197, 0.2); color: #A0826D; }

.record-emotion-garden {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.initial-emotion {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.emotion-label {
  color: #2D3E40;
  font-size: 0.9rem;
  font-weight: 500;
}

.record-thought-snippet {
  color: #52796F;
  font-style: italic;
  line-height: 1.4;
  margin-bottom: 1rem;
  min-height: 2.8em;
}

.record-growth-indicator {
  display: flex;
  justify-content: center;
}

.growth-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
}

.progress-completed { background: rgba(132, 169, 140, 0.2); color: #2D3E40; }
.progress-blooming { background: rgba(255, 155, 133, 0.2); color: #FF9B85; }
.progress-growing { background: rgba(202, 210, 197, 0.2); color: #A0826D; }

/* 洞察花园 */
.insights-garden {
  margin-bottom: 3rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.insight-bloom {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(132, 169, 140, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.insight-bloom:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.15);
  border-color: #84A98C;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.insight-header h4 {
  color: #2D3E40;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.insight-badge {
  background: rgba(132, 169, 140, 0.2);
  color: #2D3E40;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.emotion-flowers {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.emotion-flower {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.flower-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.flower-info {
  flex-grow: 1;
}

.flower-name {
  color: #2D3E40;
  font-weight: 500;
  margin-bottom: 0.2rem;
}

.flower-count {
  color: #52796F;
  font-size: 0.85rem;
}

.flower-bloom-bar {
  flex: 0 0 100px;
  height: 8px;
  background: rgba(132, 169, 140, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.bloom-progress {
  height: 100%;
  background: linear-gradient(135deg, #84A98C, #52796F);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.wisdom-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wisdom-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(132, 169, 140, 0.1);
  border-radius: 15px;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3E40;
}

.stat-label {
  color: #52796F;
  font-size: 0.9rem;
}

.wisdom-encouragement {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 155, 133, 0.1), rgba(255, 200, 87, 0.1));
  border-radius: 15px;
  border: 1px solid rgba(255, 155, 133, 0.2);
}

.wisdom-encouragement p {
  color: #2D3E40;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}

.insight-empty {
  text-align: center;
  padding: 2rem;
  color: #52796F;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

/* 每日鼓励 */
.daily-encouragement {
  text-align: center;
}

.encouragement-card {
  background: linear-gradient(135deg, rgba(255, 155, 133, 0.1), rgba(255, 200, 87, 0.1));
  border: 2px solid rgba(255, 155, 133, 0.3);
  border-radius: 30px;
  padding: 2.5rem;
  min-width: 400px; /* 最小宽度 */
  max-width: 700px; /* 最大宽度 */
  width: fit-content; /* 适应内容宽度 */
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(255, 155, 133, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.encouragement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(255, 155, 133, 0.15);
  border-color: rgba(255, 155, 133, 0.5);
}

.encouragement-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  animation: gentle-pulse 3s ease-in-out infinite;
}

.encouragement-content h4 {
  color: #2D3E40;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.encouragement-content p {
  color: #52796F;
  margin: 0;
  font-style: italic;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .garden-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .garden-content {
    padding: 1rem;
  }
  
  .welcome-card {
    padding: 2rem 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .action-bloom {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .records-grid {
    grid-template-columns: 1fr;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
  }
  
  .encouragement-card {
    flex-direction: column;
    text-align: center;
    min-width: auto; /* 移除最小宽度限制 */
    width: 100%; /* 在移动端占满宽度 */
    max-width: 100%; /* 确保不超出容器 */
    padding: 1.5rem; /* 减少内边距 */
    margin: 0; /* 移除自动边距 */
  }
  
  .encouragement-icon {
    font-size: 2rem; /* 减小图标大小 */
  }
  
  .encouragement-content h4 {
    font-size: 1.1rem; /* 减小标题字体 */
  }
  
  .encouragement-content p {
    font-size: 0.9rem; /* 减小文字字体 */
  }
  
  .daily-encouragement {
    padding: 0 1rem; /* 添加左右内边距，确保内容不贴边 */
  }
}

@media (max-width: 480px) {
  .header-title h1 {
    font-size: 1.2rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .stat-bloom,
  .action-bloom,
  .record-bloom,
  .insight-bloom {
    padding: 1.5rem;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.5s ease-out;
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.loading-text {
  font-size: 1.2rem;
  color: #2D3E40;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* 深色模式支持 - 完全优化版本 */
@media (prefers-color-scheme: dark) {
  .growth-garden {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .garden-background::before {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 30%, #1f2e2e 100%);
  }
  
  .loading-overlay {
    background: rgba(20, 25, 30, 0.9);
  }
  
  .loading-text {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 600; /* 增加字重提高可读性 */
  }
  
  .page-title,
  .welcome-title {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 700; /* 增加字重 */
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
  }
  
  .page-subtitle,
  .welcome-subtitle {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500; /* 增加字重 */
  }
  
  .section-title {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 700; /* 增加字重 */
  }
  
  .stat-bloom,
  .action-bloom,
  .record-bloom,
  .insight-bloom {
    background: rgba(20, 25, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); /* 增强阴影 */
  }
  
  .stat-bloom:hover,
  .action-bloom:hover,
  .record-bloom:hover,
  .insight-bloom:hover {
    border-color: #84A98C;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4); /* 增强悬浮阴影 */
  }
  
  .bloom-content,
  .action-content h4,
  .record-time,
  .flower-name,
  .stat-number,
  .wisdom-stat .stat-number,
  .insight-header h4 {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 600; /* 增加字重 */
  }
  
  .bloom-label,
  .action-content p,
  .flower-count,
  .stat-label,
  .wisdom-stat .stat-text .stat-label,
  .record-thought-snippet,
  .emotion-label {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500; /* 增加字重 */
  }
  
  .bloom-status.positive {
    background: rgba(132, 169, 140, 0.4); /* 增强背景不透明度 */
    color: #ffffff !important;
    border: 1px solid rgba(132, 169, 140, 0.6);
    font-weight: 700;
  }
  
  .bloom-status.stable {
    background: rgba(255, 155, 133, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(255, 155, 133, 0.6);
    font-weight: 700;
  }
  
  .bloom-status.neutral {
    background: rgba(202, 210, 197, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(202, 210, 197, 0.6);
    font-weight: 700;
  }
  
  .bloom-status.attention {
    background: rgba(160, 130, 109, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(160, 130, 109, 0.6);
    font-weight: 700;
  }
  
  .record-growth-stage {
    color: #ffffff !important;
    font-weight: 600;
  }
  
  .stage-completed {
    background: rgba(132, 169, 140, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(132, 169, 140, 0.6);
    font-weight: 700;
  }
  
  .stage-blooming {
    background: rgba(255, 155, 133, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(255, 155, 133, 0.6);
    font-weight: 700;
  }
  
  .stage-growing {
    background: rgba(202, 210, 197, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(202, 210, 197, 0.6);
    font-weight: 700;
  }
  
  .progress-completed {
    background: rgba(132, 169, 140, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(132, 169, 140, 0.6);
    font-weight: 700;
  }
  
  .progress-blooming {
    background: rgba(255, 155, 133, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(255, 155, 133, 0.6);
    font-weight: 700;
  }
  
  .progress-growing {
    background: rgba(202, 210, 197, 0.4);
    color: #ffffff !important;
    border: 1px solid rgba(202, 210, 197, 0.6);
    font-weight: 700;
  }
  
  .wisdom-stat {
    background: rgba(132, 169, 140, 0.2);
    border: 1px solid rgba(132, 169, 140, 0.4);
  }
  
  .wisdom-encouragement {
    background: linear-gradient(135deg, rgba(255, 155, 133, 0.2), rgba(255, 200, 87, 0.2));
    border: 2px solid rgba(255, 155, 133, 0.4);
  }
  
  .wisdom-encouragement p {
    color: #ffffff !important;
    font-weight: 600;
  }
  
  .insight-empty {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500;
  }
  
  .encouragement-card {
    background: linear-gradient(135deg, rgba(255, 155, 133, 0.3), rgba(255, 200, 87, 0.3));
    border: 2px solid rgba(255, 155, 133, 0.5);
  }
  
  .encouragement-content h4 {
    color: #ffffff !important;
    font-weight: 700;
  }
  
  .encouragement-content p {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500;
  }
  
  .insight-badge {
    background: rgba(132, 169, 140, 0.4);
    color: #ffffff !important;
    font-weight: 700;
    border: 1px solid rgba(132, 169, 140, 0.6);
  }
  
  /* 浮动按钮在深色模式下的优化 */
  .floating-back-btn {
    background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }
  
  .floating-back-btn:hover {
    box-shadow: 0 12px 35px rgba(132, 169, 140, 0.5);
  }
}
</style>
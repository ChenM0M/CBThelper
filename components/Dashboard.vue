<template>
  <div class="dashboard fade-in-up">
    <header class="welcome-header">
      <h1 class="gradient-text float-animation">✨ 欢迎回来，心理健康伙伴！</h1>
      <p class="last-record fade-in-scale" v-if="latestRecord">
        💫 上次记录：{{ formatDate(latestRecord.timestamp) }}
      </p>
    </header>

    <section class="dashboard-grid stats-section">
      <div class="stat-card total-records breathing-light fade-in-scale" style="animation-delay: 0.1s">
        <div class="stat-icon pulse-animation">📊</div>
        <div class="stat-content">
          <h4>已记录思想</h4>
          <div class="stat-number gradient-text">{{ $store.state.thoughtRecords.length }}</div>
        </div>
      </div>
      
      <div class="stat-card analyzed-records breathing-light fade-in-scale" style="animation-delay: 0.2s">
        <div class="stat-icon pulse-animation">🧠</div>
        <div class="stat-content">
          <h4>完成分析</h4>
          <div class="stat-number gradient-text">{{ analyzedRecordsCount }}</div>
        </div>
      </div>
      
      <div class="stat-card mood-trend breathing-light fade-in-scale" style="animation-delay: 0.3s">
        <div class="stat-icon pulse-animation">😊</div>
        <div class="stat-content">
          <h4>情绪趋势</h4>
          <div class="trend-indicator" :class="moodTrend.class">
            {{ moodTrend.label }}
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid actions-section">
      <router-link 
        to="/record" 
        class="action-card new-record interactive-card fade-in-scale"
        style="animation-delay: 0.4s"
      >
        <div class="action-content">
          <span class="icon float-animation">✍️</span>
          <h3>新建记录</h3>
          <p class="action-desc">记录你的自动思维和情绪体验</p>
        </div>
      </router-link>

      <router-link 
        to="/analysis" 
        class="action-card view-analysis interactive-card fade-in-scale"
        :class="{ disabled: !hasRecords }"
        style="animation-delay: 0.5s"
      >
        <div class="action-content">
          <span class="icon float-animation">🔍</span>
          <h3>查看分析</h3>
          <p class="action-desc" v-if="hasRecords">{{ analysisSummary }}</p>
          <p class="action-desc" v-else>请先记录你的想法</p>
        </div>
      </router-link>
    </section>

    <section class="recent-records" v-if="hasRecords">
      <h2 class="section-title">🕒 最近记录</h2>
      <div class="dashboard-grid records-section">
        <div 
          v-for="(record, index) in recentRecords" 
          :key="index"
          class="record-card interactive-card fade-in-scale"
          :style="{ animationDelay: `${0.6 + index * 0.1}s` }"
          @click="goToAnalysis(index)"
        >
          <div class="record-header">
            <div class="record-date">{{ formatDate(record.timestamp) }}</div>
            <div class="record-emotions">
              <span 
                v-for="(emotion, idx) in record.emotions.slice(0, 2)" 
                :key="idx"
                class="emotion-tag"
              >
                {{ emotion }}
              </span>
              <span v-if="record.emotions.length > 2" class="emotion-more">+{{ record.emotions.length - 2 }}</span>
            </div>
          </div>
          <div class="record-thought">{{ truncateText(record.automaticThought, 80) }}</div>
          <div class="record-status" :class="getRecordStatusClass(record)">
            {{ getRecordStatus(record) }}
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid charts-section">
      <div class="chart-card emotion-stats">
        <div class="chart-card-header">
          <h5><span class="stat-icon-small">📊</span> 情绪分布</h5>
          <div class="stat-card-actions" v-if="hasRecords">
            <div class="emotion-count-badge">{{ Object.keys(emotionDistribution).length }}种情绪</div>
          </div>
    </div>

        <div class="chart-content emotion-chart" v-if="Object.keys(emotionDistribution).length > 0">
          <div 
            v-for="(count, emotion) in sortedEmotions"
            :key="emotion"
            class="chart-item"
          >
            <div class="chart-label">
              <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
              <span class="emotion-name">{{ emotion }}</span>
            </div>
            <div class="chart-bar-container">
              <div 
                class="chart-bar"
                :style="{ width: `${(count / maxEmotionCount) * 100}%` }"
              ></div>
              <span class="chart-value">{{ count }}</span>
            </div>
          </div>
        </div>
        
        <div class="no-data" v-else>
          暂无情绪数据，请记录你的情绪体验
        </div>
      </div>

      <div class="chart-card bias-stats">
        <div class="chart-card-header">
          <h5><span class="stat-icon-small">⚠️</span> 常见认知偏差</h5>
          <div class="stat-card-actions" v-if="topBiases.length > 0">
            <div class="bias-count-badge">共{{ getBiasesTotal() }}次</div>
          </div>
        </div>
        
        <div class="chart-content bias-chart" v-if="topBiases.length > 0">
          <div 
            v-for="(bias, index) in topBiases" 
            :key="index"
            class="chart-item"
          >
            <div class="chart-label">
              <span class="bias-icon" :style="{ backgroundColor: getBiasColor(bias.type) }"></span>
              <span class="bias-name">{{ bias.type }}</span>
            </div>
            <div class="chart-bar-container">
              <div 
                class="chart-bar bias-bar"
                :style="{ 
                  width: `${(bias.count / maxBiasCount) * 100}%`,
                  background: `linear-gradient(to right, ${getBiasColorLight(bias.type)}, ${getBiasColor(bias.type)})`
                }"
              ></div>
              <span class="chart-value">{{ bias.count }}</span>
            </div>
          </div>
        </div>
        
        <div class="no-data" v-else>
          暂无认知偏差数据，请完成分析
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  computed: {
    latestRecord() {
      return this.$store.state.thoughtRecords[0];
    },
    hasRecords() {
      return this.$store.state.thoughtRecords.length > 0;
    },
    analysisSummary() {
      const count = this.$store.state.thoughtRecords.length;
      return count ? `已有${count}条记录` : '暂无记录';
    },
    recentRecords() {
      return this.$store.state.thoughtRecords.slice(0, 3);
    },
    emotionDistribution() {
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
    topBiases() {
      const biases = this.$store.state.thoughtRecords
        .flatMap(record => 
          (record.analysisResult || {}).cognitiveBiases || []
        )
        .map(bias => bias.type);
      
      return Object.entries(
        biases.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
    },
    maxBiasCount() {
      return this.topBiases.length > 0 
        ? Math.max(...this.topBiases.map(b => b.count), 1) 
        : 1;
    },
    analyzedRecordsCount() {
      return this.$store.state.thoughtRecords.filter(
        record => record.alternativeThought
      ).length;
    },
    moodTrend() {
      const records = this.$store.state.thoughtRecords.slice(0, 5);
      if (records.length < 2) {
        return { label: '数据不足', class: 'neutral' };
      }
      const recentAvg = records.slice(0, Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.ceil(records.length/2);
      const earlierAvg = records.slice(Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.floor(records.length/2);
      const diff = recentAvg - earlierAvg;
      if (diff < -5) return { label: '向好发展', class: 'positive' };
      if (diff > 5) return { label: '略有波动', class: 'negative' };
      return { label: '保持稳定', class: 'neutral' };
    },
    sortedEmotions() {
      return Object.entries(this.emotionDistribution)
        .sort((a, b) => b[1] - a[1])
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    }
  },
  methods: {
    formatDate(isoString) {
      if (!isoString) return '未知时间';
      return new Date(isoString).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.slice(0, length) + '...' : text;
    },
    getRecordStatus(record) {
      if (record.alternativeThought) {
        return '已完成分析';
      } else if (record.analysisResult && 
                ((record.analysisResult.cognitiveBiases && record.analysisResult.cognitiveBiases.length > 0) || 
                 (record.analysisResult.guidingQuestions && record.analysisResult.guidingQuestions.length > 0))) {
        return '分析进行中';
      } else {
        return '待分析';
      }
    },
    getRecordStatusClass(record) {
      if (record.alternativeThought) {
        return 'status-completed';
      } else if (record.analysisResult && 
                ((record.analysisResult.cognitiveBiases && record.analysisResult.cognitiveBiases.length > 0) || 
                 (record.analysisResult.guidingQuestions && record.analysisResult.guidingQuestions.length > 0))) {
        return 'status-progress';
      } else {
        return 'status-pending';
      }
    },
    goToAnalysis(index) {
      this.$router.push('/analysis');
      this.$store.selectedRecordIndex = index;
    },
    getEmotionEmoji(emotion) {
      const emojis = {
        '焦虑': '😰', '沮丧': '😔', '愤怒': '😠', '悲伤': '😢', '羞愧': '😳', 
        '兴奋': '😃', '平静': '😌', '恐惧': '😨', '失落': '😞', '担忧': '😟',
        '自责': '😓', '困惑': '🤔', '无助': '🥺'
      };
      return emojis[emotion] || '😶';
    },
    getBiasColor(biasType) {
      const colors = {
        '灾难化': '#ff6b6b', '非黑即白': '#4ecdc4', '过度概括': '#45b7d1', 
        '情绪推理': '#96ceb4', '应该陈述': '#ffeead', '心理过滤': '#ffb347', 
        '个人化': '#c06c84', '控制谬误': '#7579e7', '贴标签': '#84b1ed', '读心术': '#d183c9'
      };
      return colors[biasType] || '#6c757d';
    },
    getBiasColorLight(biasType) {
      const color = this.getBiasColor(biasType);
      return color.replace(')', ', 0.3)').replace('rgb', 'rgba');
    },
    getBiasesTotal() {
      return this.topBiases.reduce((sum, bias) => sum + bias.count, 0);
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  /* Max width and centering handled by .app-content in App.vue */
}

.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.welcome-header h1 {
  margin-bottom: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  position: relative;
}

.last-record {
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: var(--secondary-gradient);
  color: white;
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
}

.dashboard-grid {
  display: grid;
  gap: 1rem;
}

/* Grid column setup */
.stats-section,
.actions-section,
.records-section,
.charts-section {
  grid-template-columns: 1fr; /* Mobile default: single column */
}

/* Styles for individual cards - 增强视觉层次 */
.action-card, .stat-card, .record-card, .chart-card {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: var(--transition-default);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.action-card::before, .stat-card::before, .record-card::before, .chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  opacity: 0.8;
  transition: var(--transition-default);
}

.action-card:hover, .record-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  border-color: var(--primary-color);
}

.action-card:hover::before, .record-card:hover::before {
  height: 5px;
  opacity: 1;
}

/* Specific styling for action cards - keep radius, revert background */
.action-card {
  align-items: center;
  text-align: center;
  text-decoration: none;
  /* color: var(--text-primary); Reverted below for specific cards */
  border-radius: 16px; /* Keep increased border radius */
  /* background-color: var(--background-medium); /* Removed light gray background */
  padding: 1.5rem 1rem; /* Restore original padding */
}

/* 增强的渐变背景 */
.new-record {
  background: var(--primary-gradient);
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
}

.new-record:hover {
  background: linear-gradient(135deg, #5a7bc8 0%, #667eea 100%);
  box-shadow: var(--shadow-glow);
}

.view-analysis {
  background: var(--secondary-gradient);
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
}

.view-analysis:hover {
  background: linear-gradient(135deg, #4bb3a0 0%, #7fdbda 100%);
  box-shadow: 0 0 25px rgba(127, 219, 218, 0.5);
}

.action-card.disabled,
.view-analysis.disabled { /* Ensure disabled style is specific enough */
  opacity: 0.7; /* Use opacity for disabled state */
  cursor: not-allowed;
  transform: none; /* Reset hover transform */
  box-shadow: var(--box-shadow-sm);
  background: linear-gradient(135deg, #a0a0a0, #b0b0b0); /* Keep disabled background */
  color: #e0e0e0; /* Lighter text for disabled */
  pointer-events: none; /* Prevent clicks */
}

/* Stat Cards Specifics - Adjust padding and gap */
.stat-card {
  display: flex;
  align-items: flex-start; /* Align icon top-left for mobile */
  gap: 1rem; /* Increased gap */
  border-left: 4px solid transparent; /* Colored border indicator */
  padding: 1.2rem; /* Increased padding */
}
.total-records { border-left-color: var(--secondary-color); }
.analyzed-records { border-left-color: var(--primary-color); }
.mood-trend { border-left-color: var(--accent-color); }

.stat-icon {
  font-size: 1.8rem; /* Adjust icon size */
  opacity: 0.7;
  line-height: 1; /* Better alignment */
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow content to shrink if needed */
}

.stat-content h4 {
  /* Use h4 styles from main.css */
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500; /* Slightly less emphasis */
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

.trend-indicator {
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  display: inline-block;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}
.trend-indicator.positive { background: rgba(66, 184, 131, 0.15); color: #2a9d62; }
.trend-indicator.negative { background: rgba(255, 107, 107, 0.15); color: #e35555; }
.trend-indicator.neutral { background: rgba(44, 62, 80, 0.1); color: var(--text-secondary); }

/* Action Cards Specifics */
.action-content .icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
  /* Icon color will inherit from .action-card color (white) */
}

.action-content h3 {
  /* Use h3 styles from main.css */
  color: inherit; /* Inherit color (white) from .action-card */
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem; /* Adjust size */
}

.action-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
  color: inherit; /* Inherit color (white) */
}

/* Recent Records Section Title */
.section-title {
  /* Use h2 styles from main.css */
  margin: 1.5rem 0 1rem 0;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

/* Record Card Specifics */
.record-card {
  cursor: pointer;
  /* Base styles from .card */
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.record-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--background-medium);
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
}

.record-emotions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.emotion-tag, .emotion-more {
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
}
.emotion-tag { background: rgba(66, 184, 131, 0.1); color: var(--secondary-color); }
.emotion-more { background: var(--background-medium); color: var(--text-secondary); }

.record-thought {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: var(--text-primary);
  font-size: 0.95rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  /* Removed min-height */
}

.record-status {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}
/* Status colors same as CognitiveAnalysis */
.status-completed { background: rgba(66, 184, 131, 0.15); color: #2a9d62; }
.status-progress { background: rgba(255, 193, 7, 0.15); color: #b98900; }
.status-pending { background: rgba(44, 62, 80, 0.1); color: var(--text-secondary); }

/* Chart Cards Specifics */
.chart-card {
  display: flex;
  flex-direction: column;
  /* Base styles from .card */
}

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.chart-card-header h5 {
  /* Use h5 styles from main.css */
  display: flex;
  align-items: center;
  margin: 0;
}

.stat-icon-small {
  margin-right: 0.5rem;
  font-size: 1.1rem;
  opacity: 0.7;
}

.stat-card-actions {
  display: flex;
  gap: 0.5rem;
}

.emotion-count-badge, .bias-count-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background-color: rgba(58, 110, 165, 0.1);
  color: var(--primary-color);
  white-space: nowrap;
}

.chart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.chart-label {
  flex: 0 0 80px; /* Fixed width for labels */
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emotion-emoji {
  font-size: 1rem;
  line-height: 1;
}

.bias-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.emotion-name, .bias-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-bar-container {
  flex: 1;
  position: relative;
  height: 18px;
  background-color: var(--background-medium);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.chart-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: var(--border-radius-sm);
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  transition: width 0.5s ease-out;
}

.chart-bar.bias-bar {
  background: none; /* Handled by inline style */
}

.chart-value {
  position: absolute;
  right: 5px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  /* Mix blend mode can make text visible on dark bars, but might need adjustment */
  /* mix-blend-mode: difference; */
  /* color: white; */
}

.no-data {
  /* Use .alert styles? Or keep specific */
  text-align: center;
  padding: 1.5rem;
  background-color: var(--background-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

/* Tablet and Desktop Grid Adjustments */
@media (min-width: 600px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr); /* Restore equal fractions */
  }
  .actions-section {
    grid-template-columns: repeat(2, 1fr);
}
  .charts-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-card {
    align-items: center; /* Align icon center on larger screens */
    padding: 1.5rem; /* Slightly more padding on larger screens */
  }
}

@media (min-width: 768px) {
  .dashboard {
    padding: 1.5rem;
    gap: 2rem;
  }
  .dashboard-grid {
    gap: 1.5rem;
  }
  .records-section {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (min-width: 1024px) {
  .records-section {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
}

/* Remove old specific media query styles if covered */
</style>
<template>
  <div class="dashboard">
    <header class="welcome-header">
      <h1>👋 欢迎回来，心理健康伙伴！</h1>
      <p class="last-record" v-if="latestRecord">
        上次记录：{{ formatDate(latestRecord.timestamp) }}
      </p>
    </header>

    <div class="dashboard-stats">
      <div class="stat-card total-records">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h4>已记录思想</h4>
          <div class="stat-number">{{ $store.state.thoughtRecords.length }}</div>
        </div>
      </div>
      
      <div class="stat-card analyzed-records">
        <div class="stat-icon">🧠</div>
        <div class="stat-content">
          <h4>完成分析</h4>
          <div class="stat-number">{{ analyzedRecordsCount }}</div>
        </div>
      </div>
      
      <div class="stat-card mood-trend">
        <div class="stat-icon">😊</div>
        <div class="stat-content">
          <h4>情绪趋势</h4>
          <div class="trend-indicator" :class="moodTrend.class">
            {{ moodTrend.label }}
          </div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <router-link 
        to="/record" 
        class="action-card new-record"
      >
        <div class="action-content">
          <span class="icon">📝</span>
          <h3>新建记录</h3>
          <p class="action-desc">记录你的自动思维和情绪体验</p>
        </div>
      </router-link>

      <router-link 
        to="/analysis" 
        class="action-card view-analysis"
        :class="{ disabled: !hasRecords }"
      >
        <div class="action-content">
          <span class="icon">🔍</span>
          <h3>查看分析</h3>
          <p class="action-desc" v-if="hasRecords">{{ analysisSummary }}</p>
          <p class="action-desc" v-else>请先记录你的想法</p>
        </div>
      </router-link>
    </div>

    <div class="recent-records" v-if="hasRecords">
      <h2 class="section-title">🕒 最近记录</h2>
      <div class="records-list">
        <div 
          v-for="(record, index) in recentRecords" 
          :key="index"
          class="record-card"
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
    </div>

    <div class="stats-grid">
      <div class="stat-card emotion-stats">
        <div class="stat-card-header">
          <h5><span class="stat-icon-small">📊</span> 情绪分布</h5>
          <div class="stat-card-actions" v-if="hasRecords">
            <div class="emotion-count-badge">{{ Object.keys(emotionDistribution).length }}种情绪</div>
          </div>
        </div>
        
        <div class="emotion-chart" v-if="Object.keys(emotionDistribution).length > 0">
          <div 
            v-for="(count, emotion) in sortedEmotions"
            :key="emotion"
            class="chart-item"
          >
            <div class="chart-label">
              <span class="emotion-emoji">{{ getEmotionEmoji(emotion) }}</span>
              <span class="emotion-label">{{ emotion }}</span>
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

      <div class="stat-card bias-stats">
        <div class="stat-card-header">
          <h5><span class="stat-icon-small">⚠️</span> 常见认知偏差</h5>
          <div class="stat-card-actions" v-if="topBiases.length > 0">
            <div class="bias-count-badge">共{{ getBiasesTotal() }}次</div>
          </div>
        </div>
        
        <div class="bias-chart" v-if="topBiases.length > 0">
          <div 
            v-for="(bias, index) in topBiases" 
            :key="index"
            class="chart-item"
          >
            <div class="chart-label">
              <span class="bias-icon" :style="{ backgroundColor: getBiasColor(bias.type) }"></span>
              <span class="bias-label">{{ bias.type }}</span>
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
    </div>
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
      // 简单的情绪趋势计算
      const records = this.$store.state.thoughtRecords.slice(0, 5);
      if (records.length < 2) {
        return { label: '数据不足', class: 'neutral' };
      }
      
      // 计算近期记录的平均情绪强度
      const recentAvg = records.slice(0, Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.ceil(records.length/2);
      
      // 计算较早记录的平均情绪强度
      const earlierAvg = records.slice(Math.ceil(records.length/2))
        .reduce((sum, r) => sum + (r.intensity || 50), 0) / Math.floor(records.length/2);
      
      const diff = recentAvg - earlierAvg;
      
      if (diff < -5) return { label: '向好发展', class: 'positive' };
      if (diff > 5) return { label: '略有波动', class: 'negative' };
      return { label: '保持稳定', class: 'neutral' };
    },
    sortedEmotions() {
      // 按出现次数排序情绪
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
      // 需要传递所选记录的索引，这里将记录索引存储在store中
      this.$store.selectedRecordIndex = index;
    },
    getEmotionEmoji(emotion) {
      const emojis = {
        '焦虑': '😰',
        '沮丧': '😔',
        '愤怒': '😠',
        '悲伤': '😢',
        '羞愧': '😳',
        '兴奋': '😃',
        '平静': '😌',
        '恐惧': '😨',
        '失落': '😞',
        '担忧': '😟',
        '自责': '😓',
        '困惑': '🤔',
        '无助': '🥺'
      };
      return emojis[emotion] || '😶';
    },
    getBiasColor(biasType) {
      const colors = {
        '灾难化': '#ff6b6b',
        '非黑即白': '#4ecdc4',
        '过度概括': '#45b7d1',
        '情绪推理': '#96ceb4',
        '应该陈述': '#ffeead',
        '心理过滤': '#ffb347',
        '个人化': '#c06c84',
        '控制谬误': '#7579e7',
        '贴标签': '#84b1ed',
        '读心术': '#d183c9'
      };
      return colors[biasType] || '#6c757d';
    },
    getBiasColorLight(biasType) {
      const color = this.getBiasColor(biasType);
      // 添加透明度来创建浅色版本
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
  padding: 2rem 15px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: hidden;
}

.welcome-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.welcome-header h1 {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.last-record {
  color: var(--text-secondary);
  font-size: 0.9rem;
  background: rgba(66, 184, 131, 0.1);
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.total-records {
  border-left: 4px solid #42b883;
}

.analyzed-records {
  border-left: 4px solid #2c3e50;
}

.mood-trend {
  border-left: 4px solid #ff6b6b;
}

.stat-card {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-content h4 {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 5px;
  color: var(--primary-color);
}

.trend-indicator {
  margin-top: 5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.9rem;
}

.trend-indicator.positive {
  background: rgba(66, 184, 131, 0.15);
  color: #2a9d62;
}

.trend-indicator.negative {
  background: rgba(255, 107, 107, 0.15);
  color: #e35555;
}

.trend-indicator.neutral {
  background: rgba(44, 62, 80, 0.1);
  color: #2c3e50;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 3rem;
}

.action-card {
  display: block;
  padding: 2rem;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.new-record {
  background: linear-gradient(135deg, var(--primary-color), #3a546b);
}

.view-analysis {
  background: linear-gradient(135deg, var(--secondary-color), #349e70);
}

.view-analysis.disabled {
  background: linear-gradient(135deg, #a0a0a0, #c0c0c0);
  pointer-events: none;
}

.action-content {
  text-align: center;
}

.action-content .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.action-content h3 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.action-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

.section-title {
  margin: 2rem 0 1.5rem;
  font-size: 1.5rem;
  color: var(--primary-color);
  border-bottom: 2px solid rgba(44, 62, 80, 0.1);
  padding-bottom: 10px;
}

.recent-records {
  margin-bottom: 3rem;
}

.records-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.record-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.record-date {
  font-size: 0.85rem;
  color: #666;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
}

.record-emotions {
  display: flex;
  gap: 5px;
}

.emotion-tag {
  background: rgba(66, 184, 131, 0.1);
  color: var(--secondary-color);
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.emotion-more {
  background: #f0f0f0;
  color: #666;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.record-thought {
  margin-bottom: 1rem;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
  overflow-wrap: anywhere;
}

.record-status {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-completed {
  background: rgba(66, 184, 131, 0.15);
  color: #2a9d62;
}

.status-progress {
  background: rgba(255, 193, 7, 0.15);
  color: #cc9900;
}

.status-pending {
  background: rgba(44, 62, 80, 0.1);
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 2rem;
}

.emotion-chart {
  margin-top: 1.5rem;
}

.chart-bar {
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  margin: 8px 0;
  padding: 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  min-width: 40px;
  transition: width 0.5s ease;
}

.bias-list {
  list-style: none;
  padding-left: 0;
  margin-top: 1.5rem;
}

.bias-list li {
  padding: 12px;
  margin: 10px 0;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
}

.bias-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(66, 184, 131, 0.15);
  z-index: -1;
  border-radius: 8px;
  transition: width 0.5s ease;
}

.bias-type {
  font-weight: 500;
}

.bias-count {
  color: var(--secondary-color);
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.stat-card-header h5 {
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.stat-icon-small {
  margin-right: 8px;
  font-size: 1.2rem;
}

.stat-card-actions {
  display: flex;
  gap: 10px;
}

.emotion-count-badge, .bias-count-badge {
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 20px;
  background-color: rgba(58, 110, 165, 0.1);
  color: var(--primary-color);
}

.emotion-stats, .bias-stats {
  display: flex;
  flex-direction: column;
}

.emotion-chart, .bias-chart {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 100%;
  overflow: hidden;
}

.chart-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emotion-emoji {
  font-size: 1.1rem;
}

.bias-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-bar-container {
  position: relative;
  height: 22px;
  background-color: #f2f2f2;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.chart-bar {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.chart-value {
  position: absolute;
  right: 8px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.no-data {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .dashboard-stats,
  .quick-actions,
  .records-list,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    font-size: 2rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .record-emotions {
    margin-top: 5px;
  }
  
  .chart-bar {
    padding: 8px;
    font-size: 0.9rem;
  }
  
  .action-card {
    padding: 1.5rem;
  }
  
  .record-thought, 
  .emotion-label, 
  .bias-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1rem 10px;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .action-content .icon {
    font-size: 2.5rem;
  }
  
  .action-content h3 {
    font-size: 1.2rem;
  }
  
  .record-card {
    padding: 1rem;
  }
  
  .record-thought {
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard {
    padding: 1.5rem 10px;
  }
  
  .dashboard-stats {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .records-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-bar-container {
    width: 100%;
    max-width: 100%;
  }
}
</style>
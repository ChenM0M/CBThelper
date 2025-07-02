<template>
  <div class="record-container fade-in-up">
    <h2 class="section-title gradient-text">✨ 记录你的想法</h2>
    
    <div class="card thought-form glass-effect fade-in-scale">
      <form @submit.prevent="saveRecord">
        <div class="form-group fade-in-scale" style="animation-delay: 0.1s">
          <label class="form-label">🔍 情境描述</label>
          <div class="input-icon-wrapper">
            <span class="input-icon pulse-animation">🔍</span>
          <textarea
            class="form-control"
            rows="3"
            v-model="newRecord.situation"
            placeholder="发生了什么？在哪里？什么时候？"
          ></textarea>
          </div>
        </div>

        <div class="form-group fade-in-scale" style="animation-delay: 0.2s">
          <label class="form-label">💭 自动思维 <span class="required">*</span></label>
          <div class="input-icon-wrapper">
            <span class="input-icon pulse-animation">💭</span>
          <textarea
            class="form-control"
            rows="3"
            v-model="newRecord.automaticThought"
            placeholder="你当时想到了什么？有什么样的想法闪过脑海？"
            required
          ></textarea>
          </div>
        </div>

        <div class="form-group fade-in-scale" style="animation-delay: 0.3s">
          <label class="form-label">🎭 情绪体验</label>
          <div class="emotion-tags">
            <button
              type="button"
              class="emotion-tag-btn"
              v-for="emotion in commonEmotions"
              :key="emotion"
              @click="toggleEmotion(emotion)"
              :class="{ active: newRecord.emotions.includes(emotion) }"
            >
              {{ getEmotionEmoji(emotion) }} {{ emotion }}
            </button>
          </div>
          <div class="custom-emotion">
            <div class="emotion-tag-input-container">
              <div class="selected-emotions" v-if="customEmotions.length > 0">
                <span 
                  v-for="(emotion, idx) in customEmotions" 
                  :key="idx"
                  class="custom-emotion-tag"
                >
                  {{ emotion }}
                  <span class="remove-emotion" @click="removeCustomEmotion(idx)">&times;</span>
                </span>
          </div>
          <input
            type="text"
                class="form-control emotion-input"
                v-model="currentEmotion"
                placeholder="输入其他情绪并按Enter添加..."
                @keydown.enter.prevent="addCustomEmotion"
              >
            </div>
          </div>
        </div>

        <div class="form-group fade-in-scale" style="animation-delay: 0.4s">
          <label class="form-label">📊 情绪强度 <span class="intensity-value gradient-text">{{ newRecord.intensity }}%</span></label>
          <div class="intensity-slider">
            <span class="intensity-min">😌 轻微</span>
          <input
            type="range"
            class="custom-range"
            min="0"
            max="100"
              step="5"
            v-model.number="newRecord.intensity"
          >
            <span class="intensity-max">😫 强烈</span>
          </div>
        </div>

        <div class="form-actions fade-in-scale" style="animation-delay: 0.5s">
        <button 
          type="submit" 
            class="btn btn-primary submit-btn breathing-light"
          :disabled="!isFormValid"
        >
            <span class="btn-icon">💾</span>
            保存记录
        </button>

          <button 
            type="button" 
            class="btn btn-outline-secondary"
            @click="resetForm"
          >
            <span class="btn-icon">🔄</span>
            重置
          </button>
        </div>

        <div class="alert alert-success mt-3 fade-transition" v-if="showSuccess">
          ✅ 记录保存成功！快去<router-link to="/analysis">分析页面</router-link>看看吧
        </div>
      </form>
    </div>
    
    <div class="recent-thoughts" v-if="$store.state.thoughtRecords.length > 0">
      <h3 class="subsection-title">最近记录</h3>
      <div class="thoughts-list">
        <div 
          class="thought-card" 
          v-for="(record, index) in recentThoughts" 
          :key="index"
          @click="goToAnalysis(index)"
        >
          <div class="thought-card-header">
            <span class="thought-date">{{ formatDate(record.timestamp) }}</span>
            <div class="thought-emotions">
              <span 
                v-for="(emotion, idx) in record.emotions.slice(0, 2)" 
                :key="idx"
                class="emotion-badge"
              >
                {{ emotion }}
              </span>
              <span v-if="record.emotions.length > 2" class="emotion-more">+{{ record.emotions.length - 2 }}</span>
            </div>
          </div>
          
          <div class="thought-content">{{ truncateText(record.automaticThought, 100) }}</div>
          
          <div class="thought-card-footer">
            <div class="thought-intensity">
              强度: <span class="intensity-badge">{{ record.intensity }}%</span>
            </div>
            <span class="view-analysis">查看分析 →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newRecord: {
        situation: '',
        automaticThought: '',
        emotions: [],
        customEmotion: '',
        intensity: 50,
        timestamp: null
      },
      commonEmotions: ['焦虑', '沮丧', '愤怒', '悲伤', '羞愧', '兴奋', '平静', '恐惧', '失落', '担忧'],
      showSuccess: false,
      currentEmotion: '',
      customEmotions: []
    };
  },
  computed: {
    isFormValid() {
      return this.newRecord.automaticThought.trim() &&
             this.newRecord.intensity > 0;
    },
    recentThoughts() {
      return this.$store.state.thoughtRecords.slice(0, 3);
    }
  },
  methods: {
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
        '担忧': '😟'
      };
      return emojis[emotion] || '😶';
    },
    toggleEmotion(emotion) {
      const index = this.newRecord.emotions.indexOf(emotion);
      if (index === -1) {
        this.newRecord.emotions.push(emotion);
      } else {
        this.newRecord.emotions.splice(index, 1);
      }
    },
    addCustomEmotion() {
      const emotion = this.currentEmotion.trim();
      if (emotion && !this.customEmotions.includes(emotion)) {
        this.customEmotions.push(emotion);
        this.currentEmotion = '';
      }
    },
    removeCustomEmotion(index) {
      this.customEmotions.splice(index, 1);
    },
    saveRecord() {
      const record = {
        ...this.newRecord,
        timestamp: new Date().toISOString(),
        emotions: [
          ...this.newRecord.emotions,
          ...this.customEmotions
        ]
      };
      
      this.$store.state.thoughtRecords.unshift(record);
      this.$store.saveState();
      
      // 通知分析页面有新记录添加
      if (this.$store.selectedRecordIndex !== undefined) {
        this.$store.selectedRecordIndex = 0; // 选择最新添加的记录
      }
      
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        // 提示消失后重置表单
        this.resetForm();
      }, 3000);
    },
    resetForm() {
      this.newRecord = {
        situation: '',
        automaticThought: '',
        emotions: [],
        customEmotion: '',
        intensity: 50,
        timestamp: null
      };
      this.currentEmotion = '';
      this.customEmotions = [];
    },
    formatDate(timestamp) {
      if (!timestamp) return '未知时间';
      return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    goToAnalysis(index) {
      this.$router.push('/analysis');
      // 需要通过store传递选中的记录索引
      this.$store.selectedRecordIndex = index;
    }
  }
};
</script>

<style scoped>
.record-container {
  max-width: 800px;
  margin: 1rem auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.thought-form {
  /* Uses .card base styles from main.css */
  padding: 1.5rem;
  margin-bottom: 2rem;
}

/* Remove redundant form-group, form-label, form-control styles, handled globally */

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.1rem;
  pointer-events: none;
}

textarea.form-control,
input.form-control {
  padding-left: 2.5rem; /* Make space for icon */
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.emotion-tag-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--background-primary);
  cursor: pointer;
  transition: var(--transition-bounce);
  font-size: 0.85rem;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
}

.emotion-tag-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--secondary-gradient);
  transition: var(--transition-default);
  z-index: -1;
}

.emotion-tag-btn:hover {
  background: var(--background-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-sm);
}

.emotion-tag-btn.active {
  background: var(--secondary-gradient);
  border-color: var(--secondary-color);
  color: white;
  font-weight: 600;
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.emotion-tag-btn.active::before {
  left: 0;
}

.custom-emotion {
  margin-top: 1rem;
}

.emotion-tag-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem; /* Add space below selected tags */
}

.custom-emotion-tag {
  background-color: var(--primary-color);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
}

.remove-emotion {
  margin-left: 0.4rem;
  cursor: pointer;
  font-weight: bold;
}

.emotion-input {
  /* Uses .form-control base styles */
  flex-grow: 1;
}

.intensity-slider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.intensity-value {
  font-weight: bold;
  color: var(--primary-color);
  margin-left: 0.5rem;
  min-width: 40px; /* Prevent layout shift */
  text-align: right;
}

.intensity-min,
.intensity-max {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.custom-range {
  flex-grow: 1;
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: var(--background-medium);
  outline: none;
  opacity: 0.9;
  transition: opacity .15s ease-in-out;
  border-radius: 4px;
  cursor: pointer;
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
}

.custom-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.custom-range:hover {
  opacity: 1;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Reuse .btn styles from main.css */
.submit-btn {
  /* specific styles if needed */
}

/* Alert styles from main.css are used */
.fade-transition {
  transition: opacity 0.5s ease;
}

.recent-thoughts {
  margin-top: 2.5rem;
}

.subsection-title {
  margin-bottom: 1rem;
  font-size: 1.3rem;
  border-bottom: 2px solid var(--background-medium);
  padding-bottom: 0.5rem;
}

.thoughts-list {
  display: grid;
  gap: 1rem;
}

.thought-card {
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  cursor: pointer;
  transition: var(--transition-default);
  box-shadow: var(--box-shadow-sm);
}

.thought-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--box-shadow-md);
  border-left: 4px solid var(--primary-color);
}

.thought-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.thought-date {
  font-weight: 500;
}

.thought-emotions {
  display: flex;
  gap: 0.4rem;
}

.emotion-badge {
  background-color: var(--background-medium);
  color: var(--text-secondary);
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}

.emotion-more {
  background-color: var(--background-dark);
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
}

.thought-content {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.thought-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.thought-intensity .intensity-badge {
  font-weight: bold;
  color: var(--primary-color);
  background-color: rgba(58, 110, 165, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

.view-analysis {
  color: var(--primary-color);
  font-weight: 500;
}

.required {
  color: var(--accent-color);
  font-weight: bold;
  margin-left: 0.2rem;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .thought-form {
    padding: 2rem;
  }

  .form-actions {
    justify-content: flex-start; /* Align buttons left on larger screens */
  }
  
  .thoughts-list {
     /* Adjust grid layout for larger screens if needed */
     /* e.g., grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); */
  }
}
</style>
<template>
  <div class="record-container">
    <h2 class="section-title">📝 记录你的想法</h2>
    
    <div class="card thought-form">
      <form @submit.prevent="saveRecord">
        <div class="form-group">
          <label class="form-label">情境描述</label>
          <div class="input-icon-wrapper">
            <span class="input-icon">🔍</span>
            <textarea
              class="form-control"
              rows="3"
              v-model="newRecord.situation"
              placeholder="发生了什么？在哪里？什么时候？"
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">自动思维 <span class="required">*</span></label>
          <div class="input-icon-wrapper">
            <span class="input-icon">💭</span>
            <textarea
              class="form-control"
              rows="3"
              v-model="newRecord.automaticThought"
              placeholder="你当时想到了什么？有什么样的想法闪过脑海？"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">情绪体验</label>
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

        <div class="form-group">
          <label class="form-label">情绪强度 <span class="intensity-value">{{ newRecord.intensity }}%</span></label>
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

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary submit-btn"
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
  margin: 2rem auto;
  padding: 0 15px;
}

.section-title {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.subsection-title {
  color: var(--text-primary);
  margin: 2rem 0 1rem;
  font-size: 1.4rem;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  padding-bottom: 0.5rem;
}

.thought-form {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label .required {
  color: var(--accent-color);
  margin-left: 3px;
}

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 10px;
  top: 10px;
  font-size: 1.2rem;
  opacity: 0.6;
}

.form-control {
  padding-left: 2.5rem;
  transition: var(--transition-default);
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1rem;
  max-width: 100%;
}

.emotion-tag-btn {
  background: white;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.8rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.emotion-tag-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.emotion-tag-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.emotion-tag-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.custom-emotion-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  background-color: rgba(66, 184, 131, 0.1);
  color: var(--secondary-color);
  border-radius: 20px;
  font-size: 0.85rem;
  user-select: none;
}

.remove-emotion {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.1);
  font-size: 0.8rem;
  cursor: pointer;
}

.remove-emotion:hover {
  background-color: rgba(0,0,0,0.2);
}

.emotion-input {
  flex: 1;
}

.intensity-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.intensity-value {
  background: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-left: 5px;
}

.intensity-min, .intensity-max {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.custom-range {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #ccc, var(--primary-color));
  border-radius: 5px;
  outline: none;
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.custom-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 2rem;
}

.submit-btn {
  flex: 1;
}

.btn-icon {
  margin-right: 8px;
}

.fade-transition {
  transition: opacity 0.3s;
}

.thoughts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 1rem;
}

.thought-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  transition: var(--transition-default);
  cursor: pointer;
}

.thought-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.thought-card-header {
  padding: 1rem;
  background: rgba(44, 62, 80, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.thought-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.thought-emotions {
  display: flex;
  gap: 5px;
}

.emotion-badge {
  background-color: rgba(66, 184, 131, 0.1);
  color: var(--secondary-color);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.emotion-more {
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.thought-content {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-primary);
  min-height: 80px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.thought-card-footer {
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.thought-intensity {
  color: var(--text-secondary);
}

.intensity-badge {
  display: inline-block;
  background: rgba(58, 110, 165, 0.1);
  color: var(--primary-color);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.view-analysis {
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.2s;
}

.thought-card:hover .view-analysis {
  color: var(--secondary-color);
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .thought-form {
    padding: 1.5rem;
  }
  
  .emotion-tags {
    gap: 8px;
  }
  
  .emotion-tag-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .thoughts-list {
    grid-template-columns: 1fr;
  }
  
  .intensity-slider {
    flex-direction: column;
    align-items: stretch;
  }
  
  .intensity-min, .intensity-max {
    margin-bottom: 5px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .record-container {
    padding: 0 10px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .form-label {
    font-size: 0.95rem;
  }
  
  .thought-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .thought-emotions {
    margin-top: 8px;
  }
  
  .thought-card-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .view-analysis {
    align-self: flex-end;
  }
  
  .input-icon {
    top: 12px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .thoughts-list {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .emotion-tag-btn {
    padding: 0.4rem 0.7rem;
  }
}
</style>
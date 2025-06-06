<template>
  <div class="analysis-container">
    <h2 class="section-title">🔍 认知分析</h2>
    
    <!-- 历史记录选择器 -->
    <div class="history-selector mb-4">
      <div class="history-header">
        <label for="recordSelect">选择记录:</label>
        <button class="btn btn-sm btn-outline-secondary" @click="showHistoryManager = true">
          <span class="btn-icon">📋</span> 管理历史记录
        </button>
      </div>
      <select id="recordSelect" class="form-select" v-model="selectedRecordIndex" @change="loadSelectedRecord">
        <option v-for="(record, index) in $store.state.thoughtRecords" :key="index" :value="index">
          {{ formatTimestamp(record.timestamp) }} - {{ truncateText(record.automaticThought, 30) }}
        </option>
      </select>
    </div>
    
    <!-- 历史记录管理器弹窗 -->
    <div class="history-manager" v-if="showHistoryManager">
      <div class="history-manager-content">
        <div class="history-manager-header">
          <h3>管理历史记录</h3>
          <button class="btn-close" @click="showHistoryManager = false">&times;</button>
        </div>
        <div class="history-manager-body">
          <div class="history-list">
            <div 
              v-for="(record, index) in $store.state.thoughtRecords" 
              :key="index"
              class="history-item"
            >
              <div class="history-item-content">
                <div class="history-item-date">{{ formatTimestamp(record.timestamp) }}</div>
                <div class="history-item-thought">{{ truncateText(record.automaticThought, 60) }}</div>
                <div class="history-item-status" :class="getRecordStatusClass(record)">
                  {{ getRecordStatus(record) }}
                </div>
              </div>
              <div class="history-item-actions">
                <button 
                  class="btn btn-sm btn-outline-danger" 
                  @click="deleteRecord(index)"
                  title="删除记录"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="no-records" v-if="$store.state.thoughtRecords.length === 0">
              暂无历史记录
            </div>
          </div>
        </div>
        <div class="history-manager-footer">
          <button class="btn btn-outline-secondary" @click="showHistoryManager = false">关闭</button>
        </div>
      </div>
    </div>
    
    <div class="card" v-if="currentRecord">
      <!-- 自动思维展示 -->
      <div class="analysis-section">
        <h5>📌 你的自动思维</h5>
        <p class="thought-text">"{{ currentRecord.automaticThought }}"</p>
        
        <!-- 添加情境描述显示 -->
        <div class="situation-box" v-if="currentRecord.situation">
          <h6>🔍 情境描述</h6>
          <p class="situation-text">{{ currentRecord.situation }}</p>
        </div>
        
        <div class="meta-info">
          <span class="date-tag">{{ formatTimestamp(currentRecord.timestamp) }}</span>
          <div class="emotion-badges">
            <span v-for="(emotion, idx) in currentRecord.emotions" :key="idx" 
                  class="emotion-badge">{{ emotion }}</span>
          </div>
        </div>
      </div>

      <!-- 认知偏差分析 -->
      <div class="analysis-section">
        <h5>🧠 识别到的认知偏差</h5>
        <div class="bias-tags" v-if="analysisResult.cognitiveBiases && analysisResult.cognitiveBiases.length > 0">
          <span 
            class="badge badge-pill"
            v-for="bias in analysisResult.cognitiveBiases"
            :key="bias.type"
            :style="{ backgroundColor: getBiasColor(bias.type) }"
            @click="selectBias(bias)"
          >
            {{ bias.type }} <span class="confidence">({{ bias.confidence }}%)</span>
          </span>
        </div>
        <div class="no-biases" v-else>
          <p v-if="analyzedOnce">系统未检测到明显的认知偏差，但这并不意味着思维完全没有问题。
          请继续浏览下方的引导性问题，思考自己的想法是否存在这些情况：</p>
          <ul v-if="analyzedOnce" class="bias-tips">
            <li>你是否在考虑最糟糕的可能性？</li>
            <li>你是否在用"非黑即白"的方式看待情况？</li>
            <li>你是否从单一事件得出了普遍性结论？</li>
            <li>你是否用情绪而非事实在做判断？</li>
            <li>你是否给自己或他人设置了过高标准？</li>
          </ul>
          <p v-else>暂未识别到认知偏差，请点击"开始分析"进行分析。</p>
        </div>
        <div class="bias-evidence" v-if="selectedBias">
          <div class="evidence-header">
            <h6>{{ selectedBias.type }} 的识别依据：</h6>
          </div>
          <p class="evidence-text">{{ selectedBias.evidence }}</p>
        </div>
      </div>

      <!-- 引导性问题 -->
      <div class="analysis-section">
        <h5>💡 引导性问题</h5>
        <ul class="question-list">
          <li v-for="(question, index) in analysisResult.guidingQuestions" :key="index">
            {{ question }}
          </li>
        </ul>
        <div class="no-questions" v-if="!analysisResult.guidingQuestions || analysisResult.guidingQuestions.length === 0">
          暂无引导性问题，请点击"开始分析"生成问题。
        </div>
      </div>

      <!-- 用户回答输入 -->
      <div class="analysis-section">
        <h5>📝 你的思考记录</h5>
        <textarea
          class="form-control"
          rows="4"
          v-model="userResponse"
          placeholder="请写下你对这些问题的思考..."
        ></textarea>
      </div>

      <!-- 替代想法生成 -->
      <div class="analysis-section" v-if="alternativeThought">
        <h5>🌈 建议的替代想法</h5>
        <p class="alternative-thought">"{{ alternativeThought }}"</p>
        <div class="feedback-buttons">
          <button 
            class="btn btn-success mr-2"
            @click="saveAlternativeThought"
          >
            👍 保存这个想法
          </button>
          <button 
            class="btn btn-outline-secondary"
            @click="generateAlternativeThought"
          >
            🔄 重新生成
          </button>
        </div>
      </div>

      <!-- 分析操作按钮 -->
      <div class="action-buttons" v-if="!isLoading">
        <button class="btn btn-primary" @click="analyzeThought">
          <span class="icon">🧠</span> 开始分析
        </button>
      </div>

      <!-- 加载进度条 -->
      <div class="loading-container" v-if="isLoading">
        <div class="progress">
          <div class="progress-bar" 
               :style="{ width: `${loadingProgress}%` }" 
               :class="{'progress-bar-animated': isLoading}">
            {{ loadingStage }}
          </div>
        </div>
        <p class="loading-text">{{ loadingStage }} ({{ loadingProgress }}%)</p>
        <p class="loading-tips" v-if="loadingTip">{{ loadingTip }}</p>
      </div>
      
      <!-- 显示API错误信息 -->
      <div class="api-error alert alert-danger" v-if="apiError">
        <p><strong>分析过程中发生错误</strong></p>
        <p>{{ apiError }}</p>
        <p class="mt-2">
          <button class="btn btn-sm btn-outline-danger" @click="apiError = null">关闭</button>
          <router-link to="/config" class="btn btn-sm btn-primary ml-2">检查API设置</router-link>
        </p>
      </div>
    </div>

    <div class="alert alert-warning" v-else>
      ⚠️ 请先完成至少一条思想记录
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedRecordIndex: 0,
      currentRecord: null,
      analysisResult: {
        cognitiveBiases: [],
        guidingQuestions: []
      },
      userResponse: '',
      alternativeThought: '',
      isLoading: false,
      loadingProgress: 0,
      loadingStage: '准备分析',
      loadingTip: '',
      apiError: null,
      showHistoryManager: false,
      selectedBias: null,
      analyzedOnce: false,
      loadingTips: [
        '认知偏差是我们思维中的盲点，识别它们是治疗的第一步...',
        '苏格拉底式提问帮助我们挑战自己的想法，促进更深入的思考...',
        '替代性思维不是简单地积极思考，而是寻找更平衡的视角...',
        '认知行为疗法强调思维、情绪和行为之间的联系...',
        '改变想法不是一蹴而就的，需要持续的练习和耐心...'
      ]
    };
  },
  computed: {
    apiConfig() {
      return this.$store.state.apiConfig;
    }
  },
  mounted() {
    // 检查是否有从store传递过来的记录索引
    if (this.$store.selectedRecordIndex !== undefined) {
      this.selectedRecordIndex = this.$store.selectedRecordIndex;
      // 使用完后清除，避免影响后续操作
      this.$store.selectedRecordIndex = undefined;
    } else if (this.$store.state.thoughtRecords.length > 0) {
      this.selectedRecordIndex = 0;
    }
    
    this.loadSelectedRecord();
  },
  methods: {
    formatTimestamp(timestamp) {
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
    
    loadSelectedRecord() {
      if (this.$store.state.thoughtRecords.length === 0) {
        this.currentRecord = null;
        return;
      }
      
      const record = this.$store.state.thoughtRecords[this.selectedRecordIndex];
      this.currentRecord = record;
      
      // 如果记录中已经有分析结果和替代想法，则加载它们
      if (record.analysisResult) {
        this.analysisResult = record.analysisResult;
      } else {
        this.analysisResult = {
          cognitiveBiases: [],
          guidingQuestions: []
        };
      }
      
      if (record.userResponse) {
        this.userResponse = record.userResponse;
      } else {
        this.userResponse = '';
      }
      
      this.alternativeThought = record.alternativeThought || '';
      this.selectedBias = null;
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
    
    selectBias(bias) {
      if (this.selectedBias === bias) {
        this.selectedBias = null;
      } else {
        this.selectedBias = bias;
      }
    },
    
    getRecordStatus(record) {
      if (record.alternativeThought) {
        return '已完成分析';
      } else if (record.analysisResult && record.analysisResult.cognitiveBiases) {
        return '分析进行中';
      } else {
        return '待分析';
      }
    },
    
    getRecordStatusClass(record) {
      if (record.alternativeThought) {
        return 'status-completed';
      } else if (record.analysisResult && record.analysisResult.cognitiveBiases) {
        return 'status-progress';
      } else {
        return 'status-pending';
      }
    },
    
    deleteRecord(index) {
      if (confirm('确定要删除这条记录吗？删除后无法恢复。')) {
        this.$store.state.thoughtRecords.splice(index, 1);
        this.$store.saveState();
        
        // 如果删除的是当前选中的记录，重新加载
        if (this.selectedRecordIndex === index) {
          this.selectedRecordIndex = 0;
          this.loadSelectedRecord();
        } 
        // 如果删除的记录索引小于当前选中的索引，需要调整选中索引
        else if (this.selectedRecordIndex > index) {
          this.selectedRecordIndex--;
        }
      }
    },

    async analyzeThought() {
      this.isLoading = true;
      this.loadingProgress = 0;
      this.loadingStage = '初始化分析';
      this.apiError = null;
      this.loadingTip = this.getRandomTip();
      
      try {
        // 第一步：识别认知偏差
        this.loadingStage = '识别认知偏差';
        this.loadingProgress = 25;
        this.loadingTip = this.getRandomTip();
        const biasResponse = await this.callLLM(this.getBiasPrompt());
        this.analysisResult.cognitiveBiases = this.parseBiasResponse(biasResponse);
        this.analyzedOnce = true;

        // 第二步：生成引导问题
        this.loadingStage = '生成引导问题';
        this.loadingProgress = 50;
        this.loadingTip = this.getRandomTip();
        const questionsResponse = await this.callLLM(this.getQuestionPrompt());
        this.analysisResult.guidingQuestions = this.parseQuestionResponse(questionsResponse);

        // 保存用户回应
        this.$store.state.thoughtRecords[this.selectedRecordIndex].userResponse = this.userResponse;
        
        // 保存分析结果
        this.$store.state.thoughtRecords[this.selectedRecordIndex].analysisResult = this.analysisResult;
        this.$store.saveState();

        // 第三步：生成初始替代想法
        this.loadingStage = '生成替代想法';
        this.loadingProgress = 75;
        this.loadingTip = this.getRandomTip();
        await this.generateAlternativeThought();
        
      } catch (error) {
        console.error('分析失败:', error);
        this.apiError = error.message || '分析过程中发生未知错误，请重试';
      } finally {
        this.loadingProgress = 100;
        this.loadingStage = '分析完成';
        this.loadingTip = null;
        setTimeout(() => {
        this.isLoading = false;
        }, 500);
      }
    },

    async generateAlternativeThought() {
      if (!this.isLoading) {
      this.isLoading = true;
        this.loadingProgress = 0;
        this.loadingStage = '生成替代想法';
      }
      
      try {
        this.loadingProgress = 50;
        const response = await this.callLLM(this.getAlternativeThoughtPrompt());
        this.alternativeThought = response.choices[0].message.content;
        this.loadingProgress = 100;
      } catch (error) {
        console.error('生成替代想法失败:', error);
      } finally {
        setTimeout(() => {
        this.isLoading = false;
        }, 500);
      }
    },

    async callLLM(prompt) {
      try {
        // 不再需要 Authorization header，由代理处理
      const headers = {
        'Content-Type': 'application/json'
      };

        // 请求代理服务的端点
        const proxyEndpoint = '/api/llm-proxy'; 

        // 数据只包含 prompt
      const data = {
          prompt: prompt
        };

        console.log(`正在调用代理服务: ${proxyEndpoint}`);
        
        // 调用代理服务
        const response = await axios.post(proxyEndpoint, data, { 
          headers,
          timeout: 45000 // 可以适当增加超时时间，因为涉及两次网络请求
        });
        
        return response.data; // 代理会直接返回 LLM API 的原始响应数据结构

      } catch (error) {
        console.error('调用代理服务失败:', error);
        if (error.response) {
          console.error('代理服务响应:', error.response.data);
          // 尝试从代理的错误响应中提取更具体的信息
          const errorMessage = error.response.data?.error || 
                              (error.response.data?.details ? `代理错误: ${error.response.data.details}` : 
                              `代理服务返回错误: ${error.response.status}`);
          throw new Error(errorMessage);
        } else if (error.request) {
          throw new Error('未收到代理服务响应，请检查网络连接或稍后重试');
        } else {
          throw new Error(`请求配置错误: ${error.message}`);
        }
      }
    },

    getBiasPrompt() {
      // 构建提示词，包含情境描述（如果有）
      let prompt = `请作为一名专业的认知行为治疗师，仔细分析以下内容中可能存在的认知偏差。
  
认知偏差是人们在思考过程中出现的系统性错误或模式，往往导致非理性判断和决策。`;

      if (this.currentRecord.situation) {
        prompt += `\n\n情境描述：${this.currentRecord.situation}`;
      }
      
      prompt += `\n\n自动思维："${this.currentRecord.automaticThought}"`;
      
      if (this.currentRecord.emotions && this.currentRecord.emotions.length > 0) {
        prompt += `\n\n伴随情绪：${this.currentRecord.emotions.join('、')}（强度：${this.currentRecord.intensity}%）`;
      }
      
      prompt += `\n\n请识别出上述内容中存在的认知偏差，并严格按照以下JSON格式返回（不要有任何额外文字）：
{
  "biases": [
    {
      "type": "偏差类型名称",
      "confidence": 置信度百分比（例如85，不要带%符号）,
      "evidence": "详细说明为什么这属于该种偏差的文本依据"
    }
  ]
}

常见的认知偏差类型包括：
1. 灾难化：过分夸大负面事件的后果
2. 非黑即白：将事物简化为两个极端类别
3. 过度概括：从单一事件中得出普遍结论
4. 情绪推理：根据情绪状态而非客观事实做判断
5. 应该陈述：用刚性的规则要求自己或他人
6. 心理过滤：只关注负面细节而忽视积极方面
7. 个人化：不合理地将外部事件归因于自己
8. 控制谬误：认为应当能控制所有事情
9. 贴标签：用简单标签概括复杂情况
10. 读心术：假设知道他人的想法或感受

如果没有发现明显的认知偏差，请返回空数组：{"biases": []}`;

      return prompt;
    },

    getQuestionPrompt() {
      // 构建提示词，包含情境描述（如果有）
      let prompt = `作为一名专业的认知行为治疗师，请针对以下内容设计3个有效的苏格拉底式引导问题，帮助当事人质疑和挑战自己的思维模式。`;
      
      if (this.currentRecord.situation) {
        prompt += `\n\n情境描述：${this.currentRecord.situation}`;
      }
      
      prompt += `\n\n自动思维："${this.currentRecord.automaticThought}"`;
      
      if (this.currentRecord.emotions && this.currentRecord.emotions.length > 0) {
        prompt += `\n\n伴随情绪：${this.currentRecord.emotions.join('、')}`;
      }
      
      // 如果有分析结果，将偏差信息也包含进来
      if (this.analysisResult.cognitiveBiases && this.analysisResult.cognitiveBiases.length > 0) {
        prompt += `\n\n识别到的认知偏差：${this.analysisResult.cognitiveBiases.map(b => b.type).join('、')}`;
      }
      
      prompt += `\n\n请设计3个开放式的苏格拉底式问题，这些问题应该：
1. 鼓励深度思考而非简单的是/否回答
2. 帮助挑战非理性信念
3. 引导探索替代性解释
4. 使用温和而尊重的语气
5. 针对当事人的具体情况而非泛泛而谈

请只返回问题本身的JSON数组格式（不要有任何额外说明）：
["问题1", "问题2", "问题3"]`;

      return prompt;
    },

    getAlternativeThoughtPrompt() {
      // 构建提示词，包含情境描述（如果有）
      let prompt = `作为一名认知行为治疗师，请根据以下信息，生成一个更加平衡、理性的替代思维。`;
      
      if (this.currentRecord.situation) {
        prompt += `\n\n情境描述：${this.currentRecord.situation}`;
      }
      
      prompt += `\n\n原始自动思维："${this.currentRecord.automaticThought}"`;
      
      if (this.currentRecord.emotions && this.currentRecord.emotions.length > 0) {
        prompt += `\n\n伴随情绪：${this.currentRecord.emotions.join('、')}`;
      }
      
      // 如果有分析结果，将偏差信息也包含进来
      if (this.analysisResult.cognitiveBiases && this.analysisResult.cognitiveBiases.length > 0) {
        prompt += `\n\n识别到的认知偏差：${this.analysisResult.cognitiveBiases.map(b => b.type).join('、')}`;
      }
      
      prompt += `\n\n用户对引导问题的思考：${this.userResponse || '(用户尚未填写)'}`;
      
      prompt += `\n\n请生成一个更加平衡和理性的替代思维，应该：
1. 用第一人称表达，就像当事人自己在说话
2. 使用口语化、自然的中文表达
3. 保持温暖、支持和鼓励的语气
4. 承认事实，但提供更加平衡和有建设性的视角
5. 长度适中，通常为2-4句话

请直接返回替代思维内容，不要包含任何额外的解释或说明。`;

      return prompt;
    },

    parseBiasResponse(response) {
      try {
        const content = response.choices[0].message.content;
        // 尝试解析JSON格式
        try {
          const parsed = JSON.parse(content);
          if (parsed && parsed.biases) {
            return parsed.biases;
          }
        } catch (jsonError) {
          console.error('解析偏差JSON失败:', jsonError);
          // 如果解析失败，尝试使用正则表达式提取JSON部分
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const extractedJson = JSON.parse(jsonMatch[0]);
              if (extractedJson && extractedJson.biases) {
                return extractedJson.biases;
              }
      } catch (e) {
              console.error('提取JSON后解析仍然失败:', e);
            }
          }
        }
        
        // 如果上述方法都失败，返回空数组
        console.warn('无法从LLM响应中解析出认知偏差数据，原始响应:', content);
        return [];
      } catch (error) {
        console.error('解析偏差响应失败:', error);
        return [];
      }
    },

    parseQuestionResponse(response) {
      try {
        const content = response.choices[0].message.content;
        // 尝试直接解析JSON
        try {
          const questions = JSON.parse(content);
          if (Array.isArray(questions)) {
            return questions;
          }
        } catch (jsonError) {
          console.error('解析问题JSON失败:', jsonError);
          // 尝试提取JSON数组部分
          const arrayMatch = content.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            try {
              const extractedArray = JSON.parse(arrayMatch[0]);
              if (Array.isArray(extractedArray)) {
                return extractedArray;
              }
      } catch (e) {
              console.error('提取数组后解析仍然失败:', e);
            }
          }
        }
        
        // 如果无法解析为JSON，尝试基于行分割
        if (content.includes('\n')) {
          const lines = content.split('\n').filter(line => 
            line.trim() && !line.startsWith('[') && !line.startsWith(']') && !line.startsWith('```')
          );
          if (lines.length > 0) {
            return lines.map(line => line.replace(/^[0-9]+[\.\)]\s*/, '').trim()).filter(q => q);
          }
        }
        
        console.warn('无法从LLM响应中解析出问题数据，原始响应:', content);
        return [];
      } catch (error) {
        console.error('解析问题响应失败:', error);
        return [];
      }
    },

    saveAlternativeThought() {
      this.$store.state.thoughtRecords[this.selectedRecordIndex].alternativeThought = this.alternativeThought;
      this.$store.state.thoughtRecords[this.selectedRecordIndex].userResponse = this.userResponse;
      this.$store.saveState();
      alert('替代想法已保存！');
    },

    getRandomTip() {
      return this.loadingTips[Math.floor(Math.random() * this.loadingTips.length)];
    }
  }
};
</script>

<style scoped>
.analysis-container {
  max-width: 800px;
  margin: 1rem auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  margin-bottom: 1.5rem;
  /* Use heading styles from main.css */
}

.history-selector {
  background: white;
  padding: 1rem;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  margin-bottom: 1.5rem; /* Use utility mb-3 or mb-4 if preferred */
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap; /* Allow wrap on small screens */
  gap: 0.5rem;
}

.history-header label {
  font-weight: 600;
  color: var(--text-primary);
}

/* form-select is handled globally */

/* History Manager Modal Styles */
.history-manager {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001; /* Ensure above header */
  padding: 1rem;
}

.history-manager-content {
  background: white;
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--box-shadow-md);
  overflow: hidden;
}

.history-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.history-manager-header h3 {
  margin: 0;
  color: var(--primary-color);
  /* Use h3 styles from main.css */
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.2rem 0.5rem;
  line-height: 1;
}
.btn-close:hover {
  color: var(--text-primary);
}

.history-manager-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--background-light);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  transition: var(--transition-default);
}

.history-item:hover {
  background: var(--background-medium);
  border-color: var(--primary-color);
}

.history-item-content {
  flex: 1;
  overflow: hidden; /* Prevent long text pushing out button */
}

.history-item-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.history-item-thought {
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.history-item-status {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.status-completed {
  background: rgba(66, 184, 131, 0.15);
  color: #2a9d62;
}

.status-progress {
  background: rgba(255, 193, 7, 0.15);
  color: #b98900;
}

.status-pending {
  background: rgba(44, 62, 80, 0.1);
  color: var(--text-secondary);
}

.history-item-actions {
  display: flex;
}

/* btn-sm, btn-outline-danger handled globally */

.no-records {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}

.history-manager-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

/* Use .card base styles for the main analysis area */
.card {
  margin-bottom: 1.5rem;
}

.analysis-section {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  /* Remove redundant background, shadow, border - handled by .card */
  /* Keep specific margin/padding if needed, or remove if .card padding is sufficient */
}
.analysis-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0; /* Adjust if buttons inside need padding */
}

.analysis-section h5 {
  margin-bottom: 1rem;
  /* Use h5 styles from main.css */
}

.thought-text {
  font-size: 1.1rem; /* Base size, adjusted by media query in main.css */
  font-style: italic;
  margin-bottom: 0.5rem;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.situation-box {
  background-color: rgba(58, 110, 165, 0.05);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1rem;
  margin: 1rem 0;
  border-left: 3px solid var(--primary-color);
}

.situation-box h6 {
  /* Use h6 styles from main.css */
  color: var(--primary-color);
  margin-bottom: 0.4rem;
}

.situation-text {
  font-size: 0.95rem; /* Base size */
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.date-tag {
  background-color: var(--background-medium);
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
}

.emotion-badges {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.emotion-badge {
  background-color: var(--background-medium);
  color: var(--text-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

.bias-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}

.badge {
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 15px;
  box-shadow: var(--box-shadow-sm);
  cursor: pointer;
  transition: var(--transition-default);
}

.badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}

.confidence {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-left: 0.2rem;
}

.no-biases,
.no-questions {
  /* Consider using .alert .alert-info from main.css */
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  background-color: var(--background-light);
  border: 1px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  margin-top: 1rem;
  font-style: italic;
  font-size: 0.9rem;
}
.no-biases ul.bias-tips {
  list-style: inside;
  padding-left: 0;
  margin-top: 0.5rem;
  text-align: left;
  font-style: normal;
}
.no-biases ul.bias-tips li {
  margin-bottom: 0.3rem;
}

.bias-evidence {
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--background-light);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--secondary-color);
}

.evidence-header h6 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  /* Use h6 styles from main.css */
}

.evidence-text {
  margin: 0;
  font-style: italic;
  color: var(--text-secondary);
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

.question-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.question-list li {
  padding: 0.8rem 1rem;
  margin-bottom: 0.75rem;
  background-color: var(--background-light);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--secondary-color);
  transition: var(--transition-default);
  overflow-wrap: break-word;
  word-break: break-word;
}

.question-list li:hover {
  background-color: var(--background-medium);
}

/* form-control for textarea handled globally */

.alternative-thought {
  font-size: 1.1rem; /* Base size */
  color: var(--secondary-color);
  font-weight: 500;
  padding: 1rem;
  background: rgba(66, 184, 131, 0.05);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--secondary-color);
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  margin-bottom: 1rem; /* Add space before feedback buttons */
}

.feedback-buttons {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap; /* Allow wrap on small screens */
  gap: 0.75rem;
}

/* .btn, .btn-success, .btn-outline-secondary handled globally */

.action-buttons {
  text-align: center;
  margin: 1.5rem 0;
}

/* Loading Indicator */
.loading-container {
  margin: 2rem 0;
  text-align: center;
}

.progress {
  height: 1rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--background-medium);
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.progress-bar {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
  text-align: center;
  font-size: 0.75rem;
  line-height: 1rem;
  transition: width 0.6s ease;
  white-space: nowrap;
}

.progress-bar-animated {
  animation: pulse 1.5s ease-in-out infinite;
  background-size: 200% 200%;
  background-image: linear-gradient(
    45deg,
    var(--primary-color) 0%,
    var(--secondary-color) 25%,
    var(--primary-color) 50%,
    var(--secondary-color) 75%,
    var(--primary-color) 100%
  );
}

@keyframes pulse {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.loading-tips {
  font-style: italic;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* .api-error uses .alert .alert-danger from main.css */
.api-error p {
  margin-bottom: 0.5rem;
}
.api-error p:last-child {
  margin-bottom: 0;
}
.api-error .btn-sm {
  margin-right: 0.5rem;
}

.ml-2 { /* Replaced with gap or specific margins */
  /* margin-left: 0.5rem; */
}

/* Remove old media queries, rely on base responsive styles + component flex/grid wrap */
</style>
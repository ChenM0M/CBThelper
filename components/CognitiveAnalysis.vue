<template>
  <div class="mind-greenhouse">
    <!-- 背景装饰 -->
    <div class="greenhouse-background">
      <div class="greenhouse-glass"></div>
      <div class="floating-pollen">
        <div 
          v-for="i in 8" 
          :key="i" 
          class="pollen-particle" 
          :style="getPollenStyle(i)"
        ></div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <button @click="goBack" class="floating-back-btn" aria-label="返回主页">
      <span>🏡</span>
    </button>

    <!-- 主内容区 -->
    <main class="greenhouse-main">
      <!-- 加载状态 -->
      <transition name="fade">
        <div v-if="!isDataLoaded" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p class="loading-text">正在准备温室...</p>
        </div>
        <!-- 种子选择界面 -->
        <section v-else-if="!selectedRecord" class="seed-selector">
        <div class="greenhouse-container">
            <header class="greenhouse-header">
              <h1>🌿 心灵温室</h1>
            <p>在这个温暖的温室里，每个想法都在等待绽放</p>
            </header>
          
          <div class="greenhouse-garden">
              <h2>温室中的花盆</h2>
            <div class="flowerpot-grid">
                <article 
                v-for="(record, index) in $store.state.thoughtRecords" 
                :key="record.id || index"
                @click="selectSeed(index)"
                class="flowerpot-item"
                :class="{ 'fresh': index === 0, 'bloomed': record.completed }"
              >
                <!-- 花盆造型 -->
                <div class="flowerpot-container">
                  <!-- 植物部分 -->
                  <div class="plant-section">
                    <div class="plant-icon" :class="getPlantStageClass(record)">
                      {{ getPlantIcon(record) }}
                    </div>
                    <!-- 话题标题 -->
                    <div class="topic-title" v-if="record.topicTitle">
                      {{ record.topicTitle }}
                    </div>
                    <div class="topic-title auto-generated" v-else>
                      {{ generateTopicTitle(record) }}
                    </div>
                  </div>
                  
                  <!-- 花盆本体 -->
                  <div class="pot-body">
                    <!-- 多情绪标签显示 -->
                    <div class="emotions-display">
                      <div class="emotion-tags" v-if="getRecordEmotions(record).length > 0">
                        <span 
                          v-for="emotion in getRecordEmotions(record).slice(0, 3)" 
                          :key="emotion"
                          class="emotion-tag"
                          :style="getEmotionTagStyle(emotion)"
                        >
                          {{ emotion }}
                        </span>
                        <span v-if="getRecordEmotions(record).length > 3" class="emotion-more">
                          +{{ getRecordEmotions(record).length - 3 }}
                        </span>
                      </div>
                      <span v-else class="no-emotions">未记录情绪</span>
                    </div>
                    
                    <!-- 想法预览 -->
                    <div class="thought-preview">
                      "{{ truncateText(record.automaticThought, 45) }}"
                    </div>
                    
                    <!-- 底部信息 -->
                    <div class="pot-footer">
                      <time class="record-time">{{ formatTime(record.timestamp) }}</time>
                      <div class="growth-indicator">
                        <span class="growth-stage">{{ getGrowthStageText(record) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 对话次数常驻显示 -->
                <div class="chat-count-persistent" v-if="getChatCount(record) > 0">
                  💬 {{ getChatCount(record) }}次对话
                </div>
                </article>
              </div>
            </div>
          </div>
        </section>
        
        <!-- 花朵分析界面 -->
        <section v-else-if="selectedRecord && !showAnalysisDetail" class="topic-overview">
          <!-- 主题标题区 -->
          <div class="topic-header">
            <button @click="backToSelection" class="back-to-selection-btn">
              <span>← 返回选择</span>
            </button>
            <h2 class="topic-title-main">
              {{ selectedRecord.topicTitle || generateTopicTitle(selectedRecord) }}
            </h2>
          </div>
          
          <!-- 全屏花朵预览区 -->
          <div class="fullscreen-flower-area" @click="showAnalysisDetail = true">
            <div class="flower-container-fullscreen">
              <div class="flower-stage-fullscreen" :class="getFlowerStageClass()">
                <img 
                  :src="getFlowerImage()" 
                  :alt="getFlowerAlt()"
                  class="flower-image-fullscreen"
                />
              </div>
              
              <!-- 情绪气泡预览 -->
              <div class="emotion-bubbles-fullscreen">
                <div 
                  v-for="(emotion, index) in getRecordEmotions(selectedRecord).slice(0, 5)" 
                  :key="index"
                  class="emotion-bubble-fullscreen"
                  :style="{ animationDelay: `${index * 0.3}s` }"
                >
                  {{ emotion }}
                </div>
              </div>
            </div>
            
            <div class="interaction-hint">
              <p class="click-hint">点击花朵开始深入分析...</p>
              <div class="hint-indicator">💫</div>
            </div>
          </div>
        </section>
        
        <!-- 详细分析界面 -->
        <section v-else-if="selectedRecord && showAnalysisDetail" class="greenhouse-flower">
          <!-- 返回总览按钮 -->
          <div class="back-to-overview-container">
            <button @click="showAnalysisDetail = false" class="back-to-overview-btn">
              <span>← 返回温室总览</span>
            </button>
          </div>
          
          <!-- 花朵展示区 -->
          <div class="flower-display">
          <div class="flower-container" @click="triggerAnalysis">
              <div class="flower-stage" :class="getFlowerStageClass()">
                <img 
                  :src="getFlowerImage()" 
                  :alt="getFlowerAlt()"
                  class="flower-image"
                  :class="{ 'analyzing': isAnalyzing, 'bloomed': hasAnalysis }"
                />
                
                <!-- 添加进度环 -->
                <svg v-if="isAnalyzing" class="progress-ring" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#84A98C;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#52796F;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#FF9B85;stop-opacity:1" />
                    </linearGradient>
                    <filter id="progressGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle class="progress-bg" cx="50" cy="50" r="45" />
                  <circle 
                    class="progress-bar" 
                    cx="50" 
                    cy="50" 
                    r="45"
                    :stroke-dasharray="progressCircumference"
                    :stroke-dashoffset="progressOffset"
                    filter="url(#progressGlow)"
                  />
                </svg>
                
                <!-- 分析阶段提示 -->
                <div v-if="isAnalyzing" class="analysis-stage">
                  {{ currentAnalysisStage }}
              </div>
            </div>
            
              <!-- 情绪气泡 -->
              <div class="emotion-bubbles-container" v-if="selectedRecord">
                <div 
                  v-for="(bubble, index) in emotionBubbles" 
                  :key="`bubble-${index}`"
                  class="emotion-bubble"
                  :style="bubble.style"
                  :class="bubble.class"
                >
                  {{ bubble.emotion }}
                </div>
              </div>
          </div>
          
            <p class="flower-hint" v-if="!hasAnalysis && !analysisError">
              轻触花朵，让智慧伙伴为你分析...
            </p>
            
            <!-- 错误提示 -->
            <div v-if="analysisError" class="error-message">
              <div class="error-content">
                <span class="error-icon">⚠️</span>
                <div class="error-text">
                  <p class="error-title">分析遇到小问题</p>
                  <p class="error-description">{{ analysisError }}</p>
                  <div class="error-actions">
                    <button @click="triggerAnalysis" class="retry-btn">重试</button>
                    <button @click="analysisError = null" class="dismiss-btn">知道了</button>
                  </div>
                </div>
              </div>
            </div>
        </div>

          <!-- 分析结果展示 -->
          <transition name="fade-slide">
            <div class="analysis-results" v-if="hasAnalysis">
              <!-- 原始内容查看按钮 -->
              <div class="view-original-section">
                <button @click="showOriginalContent = true" class="view-original-btn">
                  📋 查看原始记录
                </button>
              </div>
              
              <div class="results-grid">
                <!-- 共情理解卡片 -->
                <section class="empathy-card">
                  <h3 class="card-title">
                    <span class="title-icon">💝</span>
                    <span>温暖理解</span>
                  </h3>
                  <p class="empathy-text">{{ analysisResult.empathy }}</p>
                </section>

                <!-- 认知分析卡片 -->
                <section class="analysis-card">
                  <h3 class="card-title">
                    <span class="title-icon">🔮</span>
                    <span>心灵解读</span>
                  </h3>
                  <div class="bias-list">
                    <article 
              v-for="(bias, index) in analysisResult.cognitiveBiases" 
              :key="index"
                      class="bias-item"
                      :class="{ 'active': activeBiasIndex === index }"
                      @click="activeBiasIndex = index"
            >
                      <header class="bias-header">
                        <span class="bias-icon">{{ bias.icon }}</span>
                        <h4 class="bias-title">{{ bias.label }}</h4>
                      </header>
              <p class="bias-description">{{ bias.description }}</p>
                    </article>
            </div>
                </section>

                <!-- 引导探索卡片 -->
                <section class="exploration-card">
                  <h3 class="card-title">
                    <span class="title-icon">💭</span>
                    <span>温柔探索</span>
                  </h3>
                  <div class="questions-list">
              <div 
                v-for="(question, index) in analysisResult.guidingQuestions" 
                :key="index"
                      class="question-item"
              >
                      <span class="question-icon">{{ question.icon }}</span>
                      <p class="question-text">{{ question.text }}</p>
              </div>
            </div>
                </section>

                <!-- 鼓励卡片 -->
                <section class="encouragement-card">
                  <div class="encouragement-content">
                    <span class="encouragement-icon">✨</span>
                    <p class="encouragement-text">{{ analysisResult.encouragement }}</p>
          </div>
                </section>
        </div>
        
              <!-- 底部提示 -->
              <div class="bottom-hint" v-if="hasAnalysis">
                <div v-if="isWisdomCompanionEnabled" class="companion-hint" @click="openChatDialog">
                  <span class="hint-icon">💬</span>
                  <span class="hint-text">与智慧伙伴深度对话</span>
                </div>
                <div v-else class="companion-disabled">
            <span class="rest-icon">🌙</span>
            <p>{{ getDisabledMessage() }}</p>
          </div>
        </div>
      </div>
          </transition>
        </section>
      </transition>
    </main>

    <!-- 原始内容查看弹窗 -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showOriginalContent" class="modal-overlay" @click="showOriginalContent = false">
          <div class="modal-dialog original-content-dialog" @click.stop>
            <header class="modal-header">
              <h3>📋 原始记录详情</h3>
              <button @click="showOriginalContent = false" class="modal-close" aria-label="关闭">
                ×
              </button>
            </header>
            
            <div class="modal-body original-content-body">
              <div class="original-sections">
                <!-- 基本信息 -->
                <section class="original-section">
                  <h4 class="section-title">⏰ 记录信息</h4>
                  <div class="info-grid">
                    <div class="info-item">
                      <label>记录时间:</label>
                      <span>{{ formatDetailedTime(selectedRecord?.timestamp) }}</span>
                    </div>
                    <div class="info-item" v-if="selectedRecord?.intensity">
                      <label>情绪强度:</label>
                      <span>{{ selectedRecord.intensity }}/10</span>
                    </div>
                  </div>
                </section>
                
                <!-- 情绪状态 -->
                <section class="original-section">
                  <h4 class="section-title">💭 情绪状态</h4>
                  <div class="emotions-display">
                    <div v-if="getRecordEmotions(selectedRecord).length > 0" class="emotion-tags">
                      <span 
                        v-for="emotion in getRecordEmotions(selectedRecord)" 
                        :key="emotion"
                        class="emotion-tag original"
                      >
                        {{ emotion }}
                      </span>
                    </div>
                    <p v-else class="no-data">未记录情绪</p>
                  </div>
                </section>
                
                <!-- 情境描述 -->
                <section class="original-section">
                  <h4 class="section-title">🎬 遇到的情况</h4>
                  <div class="content-text">
                    <p v-if="selectedRecord?.situation">{{ selectedRecord.situation }}</p>
                    <p v-else class="no-data">未描述具体情境</p>
                  </div>
                </section>
                
                <!-- 自动思维 -->
                <section class="original-section">
                  <h4 class="section-title">🧠 内心想法</h4>
                  <div class="content-text">
                    <p v-if="selectedRecord?.automaticThought">"{{ selectedRecord.automaticThought }}"</p>
                    <p v-else class="no-data">未记录具体想法</p>
                  </div>
                </section>
                
                <!-- 身体感受 -->
                <section class="original-section" v-if="selectedRecord?.physicalSensations || selectedRecord?.bodyLocation">
                  <h4 class="section-title">🫀 身体感受</h4>
                  <div class="content-text">
                    <p v-if="selectedRecord.physicalSensations">{{ selectedRecord.physicalSensations }}</p>
                    <p v-if="selectedRecord.bodyLocation">位置: {{ selectedRecord.bodyLocation }}</p>
                  </div>
                </section>
                
                <!-- 分析状态 -->
                <section class="original-section">
                  <h4 class="section-title">📊 分析状态</h4>
                  <div class="analysis-status">
                    <div class="status-item">
                      <span class="status-label">完成状态:</span>
                      <span :class="{ 'completed': selectedRecord?.completed, 'pending': !selectedRecord?.completed }">
                        {{ selectedRecord?.completed ? '✅ 已完成分析' : '⏳ 待分析' }}
                      </span>
                    </div>
                    <div class="status-item" v-if="selectedRecord?.analysisCompleteTime">
                      <span class="status-label">分析时间:</span>
                      <span>{{ formatDetailedTime(selectedRecord.analysisCompleteTime) }}</span>
                    </div>
                    <div class="status-item" v-if="getChatCount(selectedRecord) > 0">
                      <span class="status-label">对话次数:</span>
                      <span>{{ getChatCount(selectedRecord) }}次</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- 深度对话弹窗 -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showChatDialog" class="modal-overlay" @click="closeChatDialog">
          <div class="modal-dialog" @click.stop>
            <header class="modal-header">
          <h3>🤖 智慧伙伴对话</h3>
              <button @click="closeChatDialog" class="modal-close" aria-label="关闭">
                ×
              </button>
            </header>
            
            <div class="modal-body">
              <div class="modal-messages">
                <div 
                  v-for="(message, index) in deepChatMessages" 
                  :key="`deep-${index}`"
                  class="modal-message"
              :class="message.type"
            >
                  {{ message.content }}
            </div>
            
            <!-- 智慧伙伴正在输入指示器 -->
            <div v-if="isTyping" class="typing-indicator">
              <div class="typing-message">
                <div class="typing-avatar">🤖</div>
                <div class="typing-content">
                  <span class="typing-text">智慧伙伴正在思考...</span>
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
              <form class="modal-form" @submit.prevent="sendMessage">
            <input 
                  v-model="deepChatInput"
              type="text" 
              placeholder="分享你的想法..."
                  class="modal-input"
                />
                <button type="submit" class="modal-send" :disabled="!deepChatInput.trim() || isTyping">
              <span v-if="isTyping" class="btn-loading">
                <span class="btn-spinner"></span>
                发送中...
              </span>
              <span v-else>发送</span>
            </button>
              </form>
          </div>
        </div>
      </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import llmService from '../services/llm.service';

export default {
  name: 'CognitiveAnalysis',
  
  data() {
    return {
      selectedRecord: null,
      isAnalyzing: false,
      isTyping: false, // 智慧伙伴正在回复状态
      analysisResult: null,
      showChatDialog: false,
      deepChatInput: '',
      deepChatMessages: [],
      randomFlowerColor: this.generateRandomFlowerColor(),
      activeBiasIndex: null,
      analysisStage: 0,
      analysisStages: [
        '正在理解你的想法...',
        '寻找认知模式...',
        '准备温暖建议...',
        '编织鼓励话语...',
        '整理分析结果...',
        '完善细节内容...'
      ],
      hasExistingAnalysis: false,
      chatTopics: [], // 存储对话主题
      currentChatTopic: null, // 当前对话主题
      isInitialized: false,
      analysisError: null,
      showOriginalContent: false, // 控制原始内容弹窗显示
      isDataLoaded: false, // 防止闪烁的加载状态
      emotionBubbles: [], // 新的气泡数据结构
      resizeTimeout: null, // 防抖用的timeout
      showAnalysisDetail: false // 控制是否显示详细分析界面
    }
  },
  
  computed: {
    hasAnalysis() {
      return !!this.analysisResult
    },
    
    isWisdomCompanionEnabled() {
      return this.$store.state.appConfig?.features?.wisdomCompanionEnabled ?? true
    },

    progressCircumference() {
      return 2 * Math.PI * 45
    },

    progressOffset() {
      const progress = Math.min(this.analysisStage / (this.analysisStages.length - 1), 1)
      return this.progressCircumference * (1 - progress)
    },

    currentAnalysisStage() {
      return this.analysisStages[this.analysisStage]
    }
  },
  
  methods: {
    // 导航方法
    goBack() {
      this.$router.push('/')
    },
    
    // 返回选择界面
    backToSelection() {
      this.selectedRecord = null
      this.showAnalysisDetail = false
      this.$store.state.selectedRecordIndex = undefined
    },
    
    // 种子选择
    selectSeed(index) {
      // 确保索引有效和数据存在
      if (!this.$store.state.thoughtRecords || !this.$store.state.thoughtRecords[index]) {
        console.warn('[CognitiveAnalysis] 尝试选择无效的记录索引:', index)
        return
      }
      
      this.selectedRecord = this.$store.state.thoughtRecords[index]
      this.$store.state.selectedRecordIndex = index
      
      // 检查并恢复已保存的分析结果
      if (this.selectedRecord.analysisData) {
        console.log('[CognitiveAnalysis] 恢复已保存的分析结果', this.selectedRecord.analysisData)
        this.analysisResult = this.selectedRecord.analysisData
        
        // 已解析的主题直接显示详细内容
        this.showAnalysisDetail = true
        
        // 恢复对话消息
        if (this.selectedRecord.chatTopics && this.selectedRecord.chatTopics.length > 0) {
          const latestTopic = this.selectedRecord.chatTopics[this.selectedRecord.chatTopics.length - 1]
          this.deepChatMessages = latestTopic.messages || []
          this.currentChatTopic = latestTopic
        } else {
          this.deepChatMessages = [{
            type: 'companion',
            content: '我已经分析了你的想法，有什么想深入探讨的吗？'
          }]
        }
      } else {
        // 没有保存的分析结果，显示总览页面等待用户点击
        this.showAnalysisDetail = false
        this.analysisResult = null
        this.deepChatMessages = []
        this.currentChatTopic = null
      }
      
      this.randomFlowerColor = this.generateRandomFlowerColor()
      
      // 使用nextTick确保DOM更新后再初始化气泡
      this.$nextTick(() => {
        // 延迟生成气泡，确保DOM完全渲染
        setTimeout(() => {
          this.generateEmotionBubbles()
        }, 100)
      })
    },
    
    // 获取第一个情绪
    getFirstEmotion(record) {
      const emotions = this.getRecordEmotions(record)
      return emotions[0] || '平静'
    },
    
    // 获取记录的情绪列表
    getRecordEmotions(record) {
      if (!record) return []
      
      if (Array.isArray(record.emotions)) {
        return record.emotions
      }
      
      if (typeof record.emotions === 'string') {
        return record.emotions.split(',').map(e => e.trim()).filter(e => e)
      }
      
      if (record.emotion?.name) {
        return [record.emotion.name]
      }
      
      return []
    },
    
    // 触发分析
    async triggerAnalysis() {
      if (this.isAnalyzing) return
      
      if (this.hasAnalysis) {
        if (!confirm('已经有分析结果了，确定要重新分析吗？')) {
          return
        }
      }
      
      this.isAnalyzing = true
      this.analysisStage = 0
      
      try {
        // 模拟各个分析阶段
        for (let i = 0; i < this.analysisStages.length - 1; i++) {
          await this.sleep(1000)
          this.analysisStage = i + 1
        }
        
        await this.startAnalysis()
        
        const analysisText = this.selectedRecord.analysis
        this.analysisResult = this.parseAnalysisResult(analysisText)
        
        // 添加初始对话消息
        this.deepChatMessages = [{
          type: 'companion',
          content: '我已经分析了你的想法，有什么想深入探讨的吗？'
        }]
        
        // 创建新的对话主题
        this.currentChatTopic = {
          id: Date.now(),
          title: this.selectedRecord.topicTitle || this.generateTopicTitle(this.selectedRecord),
          messages: this.deepChatMessages,
          created: Date.now(),
          lastUpdated: Date.now(),
          context: {
            emotions: this.getRecordEmotions(this.selectedRecord),
            situation: this.selectedRecord.situation,
            thought: this.selectedRecord.automaticThought,
            analysis: this.analysisResult
          }
        }
        
        // 保存初始对话主题
        this.saveChatTopic()
        
        // 自动保存分析结果
        this.selectedRecord.completed = true;
        this.selectedRecord.analysisCompleteTime = Date.now();
        
        // 保存解析后的结果到记录中
        this.selectedRecord.analysisData = this.analysisResult;
        
        // 强制保存状态
        this.$store.saveState();
        
        console.log('[CognitiveAnalysis] 分析结果已保存', {
          recordId: this.selectedRecord.id,
          hasAnalysis: !!this.selectedRecord.analysis,
          hasParsedData: !!this.selectedRecord.analysisData
        });
        
      } catch (error) {
        console.error('分析出错:', error)
        this.showError(error.message || '分析时遇到了小问题，请稍后再试')
      } finally {
        this.isAnalyzing = false
        this.analysisStage = 0
      }
    },
    
    // 解析分析结果 - 移除默认信息替代逻辑
    parseAnalysisResult(analysisText) {
      try {
        // 更智能的文本清理
        const cleanText = analysisText
          .replace(/\*\*/g, '') // 移除粗体标记
          .replace(/\n{3,}/g, '\n\n') // 规范化换行
          .trim();
        
        console.log('[Parse] 开始解析分析结果:', {
          originalLength: analysisText.length,
          cleanLength: cleanText.length
        });
        
        // 如果文本太短或为空，直接抛出错误
        if (cleanText.length < 50) {
          throw new Error('分析结果内容过短或为空');
        }
        
        // 提取共情理解部分 - 更灵活的匹配
        const empathyPatterns = [
          /共情理解[：:]\s*\n([\s\S]*?)(?=\n\s*认知偏差|$)/i,
          /共情[：:]\s*\n([\s\S]*?)(?=\n\s*认知|$)/i,
          /理解[：:]\s*\n([\s\S]*?)(?=\n\s*认知|$)/i
        ];
        
        let empathy = null;
        for (const pattern of empathyPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1].trim()) {
            empathy = this.cleanTextContent(match[1]);
            break;
          }
        }

        // 提取认知偏差部分 - 改进解析逻辑
        const biasPatterns = [
          /认知偏差[：:]\s*\n([\s\S]*?)(?=\n\s*引导问题|$)/i,
          /认知[：:]\s*\n([\s\S]*?)(?=\n\s*引导|问题|$)/i,
          /偏差[：:]\s*\n([\s\S]*?)(?=\n\s*引导|问题|$)/i
        ];
        
        let biases = [];
        for (const pattern of biasPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1].trim()) {
            biases = this.parseBiasContent(match[1]);
            if (biases.length > 0) break;
          }
        }

        // 提取引导问题部分 - 更精确的问题提取
        const questionPatterns = [
          /引导问题[：:]\s*\n([\s\S]*?)(?=\n\s*鼓励|$)/i,
          /引导[：:]\s*\n([\s\S]*?)(?=\n\s*鼓励|$)/i,
          /问题[：:]\s*\n([\s\S]*?)(?=\n\s*鼓励|$)/i
        ];
        
        let questions = [];
        for (const pattern of questionPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1].trim()) {
            questions = this.parseQuestionContent(match[1]);
            if (questions.length > 0) break;
          }
        }

        // 提取鼓励部分 - 多种格式支持
        const encouragementPatterns = [
          /鼓励[：:]\s*\n([\s\S]*?)$/i,
          /总结[：:]\s*\n([\s\S]*?)$/i,
          /建议[：:]\s*\n([\s\S]*?)$/i
        ];
        
        let encouragement = null;
        for (const pattern of encouragementPatterns) {
          const match = cleanText.match(pattern);
          if (match && match[1].trim()) {
            encouragement = this.cleanTextContent(match[1]);
            break;
          }
        }

        // 验证解析结果，如果关键内容缺失则抛出错误
        if (!empathy && biases.length === 0 && questions.length === 0 && !encouragement) {
          throw new Error('无法解析分析结果的关键内容');
        }

        const result = {
          empathy: empathy || '分析结果解析出现问题，无法提取共情内容',
          cognitiveBiases: biases.length > 0 ? biases : [],
          guidingQuestions: questions.length > 0 ? questions : [],
          encouragement: encouragement || '分析结果解析出现问题，无法提取鼓励内容'
        };
        
        console.log('[Parse] 解析完成:', {
          empathyLength: result.empathy.length,
          biasCount: result.cognitiveBiases.length,
          questionCount: result.guidingQuestions.length,
          encouragementLength: result.encouragement.length
        });
        
        return result;
      } catch (error) {
        console.error('解析分析结果出错:', error);
        throw error; // 直接抛出错误，不返回默认值
      }
    },
    
    // 清理文本内容
    cleanTextContent(text) {
      return text
        .trim()
        .replace(/^\s*[-•]\s*/gm, '') // 移除列表标记
        .replace(/\s+/g, ' ') // 规范化空格
        .replace(/[""]/g, '"') // 统一引号
        .replace(/['']/g, "'"); // 统一撇号
    },
    
    // 解析认知偏差内容
    parseBiasContent(biasText) {
      const items = [];
      
      // 尝试按编号分割
      let parts = biasText.split(/\d+[\.\)]\s*/);
      
      // 如果按编号分割失败，尝试按换行分割
      if (parts.length <= 2) {
        parts = biasText.split(/\n+/).filter(line => line.trim());
      }
      
      for (const part of parts) {
        if (!part.trim()) continue;
        
        let label = '';
        let description = '';
        
        // 尝试冒号分割
        if (part.includes(':') || part.includes('：')) {
          const [labelPart, ...descParts] = part.split(/[：:]/);
          label = this.cleanTextContent(labelPart);
          description = this.cleanTextContent(descParts.join(':'));
        } else {
          // 如果没有冒号，尝试句号分割
          const sentences = part.split(/[。\.]/);
          if (sentences.length >= 2) {
            label = this.cleanTextContent(sentences[0]);
            description = this.cleanTextContent(sentences.slice(1).join('。'));
          } else {
            label = this.cleanTextContent(part);
            description = '需要进一步探索';
          }
        }
        
        if (label && label.length > 0) {
          items.push({
            icon: this.getBiasIcon(label),
            label: label,
            description: description || '让我们一起深入了解这种思维模式'
          });
        }
      }
      
      return items.length > 0 ? items : [{
        icon: '🤔',
        label: this.cleanTextContent(biasText.substring(0, 20)) + '...',
        description: this.cleanTextContent(biasText)
      }];
    },
    
    // 解析引导问题内容
    parseQuestionContent(questionText) {
      const items = [];
      
      // 尝试按编号分割
      let parts = questionText.split(/\d+[\.\)]\s*/);
      
      // 如果按编号分割失败，尝试按问号分割
      if (parts.length <= 2) {
        parts = questionText.split(/[？?]/);
      }
      
      // 如果还是失败，按换行分割
      if (parts.length <= 2) {
        parts = questionText.split(/\n+/).filter(line => line.trim());
      }
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.trim()) continue;
        
        let questionText = this.cleanTextContent(part);
        
        // 确保问题以问号结尾
        if (!questionText.endsWith('?') && !questionText.endsWith('？')) {
          questionText += '？';
        }
        
        if (questionText.length > 5) { // 过滤太短的内容
          items.push({
            icon: this.getQuestionIcon(i),
            text: questionText
          });
        }
      }
      
      return items.length > 0 ? items : [{
        icon: '🌱',
        text: this.cleanTextContent(questionText) + (questionText.endsWith('?') || questionText.endsWith('？') ? '' : '？')
      }];
    },
    
    // 获取认知偏差的图标
    getBiasIcon(biasLabel) {
      const iconMap = {
        '全或无思维': '⚫️',
        '过度概括': '🔄',
        '心理过滤': '🔍',
        '否定正面': '❌',
        '跳跃结论': '🦘',
        '读心术': '🔮',
        '灾难化': '🌋',
        '情绪化推理': '💭',
        '应该陈述': '📜',
        '标签化': '🏷️',
        '个人化': '👤',
        '完美主义': '✨',
        '比较思维': '⚖️'
      }
      
      // 尝试匹配标签中的关键词
      const matchedKey = Object.keys(iconMap).find(key => biasLabel.includes(key))
      return matchedKey ? iconMap[matchedKey] : '💡'
    },

    // 获取引导问题的图标
    getQuestionIcon(index) {
      const icons = ['🤔', '💭', '🎯', '🌱', '💫']
      return icons[index % icons.length]
    },
    
    // 打开深度对话
    openChatDialog() {
      if (!this.isWisdomCompanionEnabled) return
      
      this.showChatDialog = true
      
      // 如果是新对话，创建新主题
      if (this.deepChatMessages.length === 0) {
        this.currentChatTopic = {
          id: Date.now(),
          title: '新的对话',
          messages: [], // 初始为空，将在发送消息时同步
          created: Date.now(),
          lastUpdated: Date.now(),
          context: {
            emotions: this.getRecordEmotions(this.selectedRecord),
            situation: this.selectedRecord.situation,
            thought: this.selectedRecord.automaticThought,
            analysis: this.analysisResult
          }
        }
        
        // 添加系统消息 - 增强的上下文信息
        const emotions = this.getRecordEmotions(this.selectedRecord);
        const contextMessage = this.buildContextMessage(emotions);
        
        this.deepChatMessages = [{
          type: 'companion',
          content: contextMessage
        }]
      }
    },
    
    // 关闭深度对话
    closeChatDialog() {
      this.showChatDialog = false
    },
    
    // 发送深度对话消息
    async sendMessage() {
      if (!this.deepChatInput.trim()) return;
      
      const userMessage = this.deepChatInput.trim();
      this.deepChatMessages.push({
        type: 'user',
        content: userMessage
      });
      
      this.deepChatInput = '';
      this.isTyping = true;
      
      try {
        // 设置Vue实例给LLM服务使用
        llmService.setVueInstance(this);
        
        // 准备对话上下文 - 增强版本
        const context = {
          emotions: this.getRecordEmotions(this.selectedRecord),
          situation: this.selectedRecord.situation,
          thought: this.selectedRecord.automaticThought,
          timestamp: this.selectedRecord.timestamp,
          analysis: this.analysisResult,
          // 添加完整的记录信息
          recordDetails: {
            id: this.selectedRecord.id,
            intensity: this.selectedRecord.intensity,
            bodyLocation: this.selectedRecord.bodyLocation,
            physicalSensations: this.selectedRecord.physicalSensations,
            completed: this.selectedRecord.completed
          }
        };

        // 调用LLM服务继续对话
        const response = await llmService.continueChat(
          this.deepChatMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          userMessage,
          context
        );
        
        // 添加助手回复
        this.deepChatMessages.push({
          type: 'companion',
          content: response
        });

        // 保存对话记录
        if (this.currentChatTopic) {
          this.currentChatTopic.messages = this.deepChatMessages;
          this.currentChatTopic.lastUpdated = Date.now();
          this.saveChatTopic();
        }
        
        // 强制保存状态以确保对话记录持久化
        this.$store.saveState();

      } catch (error) {
        console.error('对话出错:', error);
        
        // 添加错误提示到对话
        this.deepChatMessages.push({
          type: 'companion',
          content: error.message
        });
        
        // 发送错误事件
        this.$emit('chat-error', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // 如果是API密钥相关错误，提示配置
        if (error.code === 'INVALID_API_KEY') {
          this.$emit('show-config-dialog');
        }
      } finally {
        this.isTyping = false;
      }
    },
    
    // 保存对话主题
    saveChatTopic() {
      if (!this.currentChatTopic) return
      
      // 更新或添加主题
      const existingIndex = this.chatTopics.findIndex(t => t.id === this.currentChatTopic.id)
      if (existingIndex >= 0) {
        this.chatTopics[existingIndex] = this.currentChatTopic
      } else {
        this.chatTopics.push(this.currentChatTopic)
      }

      // 保存到本地存储
      if (!this.selectedRecord.chatTopics) {
        this.selectedRecord.chatTopics = []
      }
      
      const topicIndex = this.selectedRecord.chatTopics.findIndex(t => t.id === this.currentChatTopic.id)
      if (topicIndex >= 0) {
        this.selectedRecord.chatTopics[topicIndex] = this.currentChatTopic
      } else {
        this.selectedRecord.chatTopics.push(this.currentChatTopic)
      }

      this.$store.saveState()
    },

    // 加载对话主题
    loadChatTopic(topicId) {
      const topic = this.chatTopics.find(t => t.id === topicId)
      if (topic) {
        this.currentChatTopic = topic
        this.deepChatMessages = topic.messages
      }
    },
    
    // 获取禁用消息
    getDisabledMessage() {
      const messages = this.$store.state.appConfig?.messages?.companionDisabled || [
        "智慧伙伴暂时在花园里休息，请稍后再来 🌙"
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    },
    
    // 生成随机花朵颜色
    generateRandomFlowerColor() {
      const colors = ['#FF9B85', '#FFC857', '#84A98C', '#7B9BB3', '#9384A8', '#FF6B6B']
      return colors[Math.floor(Math.random() * colors.length)]
    },
    
    // 获取花朵阶段类名
    getFlowerStageClass() {
      if (this.isAnalyzing) return 'stage-analyzing'
      if (this.hasAnalysis) return 'stage-bloomed'
      return 'stage-bud'
    },
    
    // 获取花朵图片
    getFlowerImage() {
      const emotion = this.selectedRecord?.initialEmotion?.name || '平静如水'
      const stage = this.hasAnalysis ? 'bloom' : 'bud'
      let color = 'blue'

      if (['愉悦阳光', '充满希望', '开心'].includes(emotion)) {
        color = 'yellow'
      } else if (['焦虑不安', '愤怒', '有些低落'].includes(emotion)) {
        color = 'red'
      }

      // 返回花朵图片路径，如果图片不存在会显示占位符
      return `/assets/images/${color}-flower-${stage}.png`
    },
    
    // 获取花朵替代文本
    getFlowerAlt() {
      return this.hasAnalysis ? '绽放的花朵' : '含苞待放'
    },
    
    // 全新的气泡生成系统 - 优化版本
    // 重构后的气泡生成系统 - 修复定位和遮挡问题
    generateEmotionBubbles() {
      if (!this.selectedRecord) {
        this.emotionBubbles = []
        return
      }

      const emotions = this.getRecordEmotions(this.selectedRecord)
      if (emotions.length === 0) {
        this.emotionBubbles = []
        return
      }

      const bubbles = []
      const maxBubbles = Math.min(emotions.length, 8) // 最多8个气泡
      
      // 智能避让算法 - 同一层级但避开花朵核心区域
      // 检测是否为移动设备
      const isMobile = window.innerWidth <= 480
      
      // 定义花朵核心禁区（中心120x120像素）
      const flowerCoreSize = isMobile ? 80 : 120
      const safeBoundary = flowerCoreSize / 2 + 20 // 增加20px安全边距
      
      // 生成候选位置的函数
      const generateSafePosition = () => {
        const maxDistance = isMobile ? 180 : 250
        const minDistance = safeBoundary + 30
        
        let attempts = 0
        let position
        
        do {
          // 随机角度和距离
          const angle = Math.random() * 2 * Math.PI
          const distance = minDistance + Math.random() * (maxDistance - minDistance)
          
          position = {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
          }
          
          attempts++
        } while (
          // 检查是否在花朵核心区域内
          (Math.abs(position.x) < safeBoundary && Math.abs(position.y) < safeBoundary) &&
          attempts < 10 // 最多尝试10次
        )
        
        return position
      }
      
      for (let i = 0; i < maxBubbles; i++) {
        const emotion = emotions[i]
        const position = generateSafePosition()
        
        // 气泡样式
        const bubble = {
          emotion: emotion,
          x: position.x,
          y: position.y,
          style: {
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            '--random-offset': `${Math.random() * 360}deg`,
            '--delay': `${i * 0.3}s`,
            '--hue': `${(i * 45) % 360}deg`, // 彩虹颜色，间隔更小
            zIndex: 1, // 设置为1，确保可见但不会太高
            animationDelay: `${i * 0.2}s`,
            position: 'absolute'
          },
          class: `bubble-${i % 4}`,
          index: i
        }
        
        bubbles.push(bubble)
      }

      this.emotionBubbles = bubbles
    },
    
    
    // 获取花粉粒子样式
    getPollenStyle(index) {
      const angle = index * 45
      const distance = 100 + Math.random() * 300
      const x = Math.cos(angle * Math.PI / 180) * distance
      const y = Math.sin(angle * Math.PI / 180) * distance
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${6 + Math.random() * 4}s`
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // 格式化详细时间
    formatDetailedTime(timestamp) {
      if (!timestamp) return '未知时间';
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    
    // 截断文本
    truncateText(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text
    },
    
    // 延迟函数
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    
    // 显示错误
    showError(message) {
      // 创建友好的错误提示
      this.analysisError = message
      
      // 3秒后自动隐藏错误
      setTimeout(() => {
        this.analysisError = null
      }, 5000)
    },
    
    // 生成回复
    generateResponse(userMessage) {
      const responses = [
        '这是一个很有趣的想法，让我们继续探索...',
        '你说得对，这确实值得深入思考。',
        '从另一个角度来看，也许我们可以...',
        '这让我想起了一个重要的观点...',
        '让我们一起来分析这个想法...'
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    },
    
    async startAnalysis() {
      if (!this.selectedRecord) return;
      
      this.isAnalyzing = true;
      this.analysisError = null;
      this.analysisStage = 0;
      
      // 设置Vue实例给LLM服务使用
      llmService.setVueInstance(this);
      
      let currentStage = 0;
      
      // 启动智能进度条动画
      const stageInterval = setInterval(() => {
        if (currentStage < this.analysisStages.length - 2) { // 保留最后两个阶段手动控制
          currentStage++;
          this.analysisStage = currentStage;
        }
      }, Math.random() * 400 + 600); // 随机间隔600-1000ms

      try {
        // 调用LLM服务进行分析
        const analysis = await llmService.analyzeThought(this.selectedRecord);
        
        // 进入倒数第二阶段：整理分析结果
        clearInterval(stageInterval);
        this.analysisStage = this.analysisStages.length - 2;
        
        // 模拟整理过程
        await this.sleep(800);
        
        // 更新记录
        this.selectedRecord.analysis = analysis;
        
        // 进入最后阶段：完善细节内容
        this.analysisStage = this.analysisStages.length - 1;
        
        // 模拟完善过程
        await this.sleep(600);
        
        // 标记完成
        this.selectedRecord.completed = true;
        this.$store.saveState();

        // 显示100%完整进度
        this.analysisStage = this.analysisStages.length;
        
        // 短暂延迟，让用户看到完成状态
        await this.sleep(300);
        
      } catch (error) {
        console.error('分析过程出错:', error);
        
        // 停止进度条动画
        clearInterval(stageInterval);
        
        // 显示友好的错误消息
        this.analysisError = error.message;
        
        // 发送错误事件
        this.$emit('analysis-error', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // 如果是API密钥相关错误，提示配置
        if (error.code === 'INVALID_API_KEY') {
          this.$emit('show-config-dialog');
        }
        
      } finally {
        // 确保停止进度条动画
        clearInterval(stageInterval);
        this.isAnalyzing = false;
        this.analysisStage = 0; // 重置进度
      }
    },

    
    // 窗口尺寸变化时重新生成气泡
    handleResize() {
      if (this.selectedRecord && this.getRecordEmotions(this.selectedRecord).length > 0) {
        // 延迟重新生成，避免频繁调用
        clearTimeout(this.resizeTimeout)
        this.resizeTimeout = setTimeout(() => {
          this.generateEmotionBubbles()
        }, 200)
      }
    },
    
    // 构建增强的上下文消息
    buildContextMessage(emotions) {
      const record = this.selectedRecord;
      
      // 格式化时间
      const timeStr = new Date(record.timestamp).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // 构建完整的上下文信息
      let contextParts = [
        '🌟 让我们开始深入探讨吧！我已经了解了你的情况：',
        '',
        `⏰ **记录时间**: ${timeStr}`,
        '',
        `💭 **你的心情**: ${emotions.length > 0 ? emotions.join('、') : '未描述具体心情'}`,
        ''
      ];
      
      // 添加情境描述
      if (record.situation && record.situation.trim()) {
        contextParts.push(`🎬 **遇到的情况**: ${record.situation}`);
        contextParts.push('');
      }
      
      // 添加自动思维
      if (record.automaticThought && record.automaticThought.trim()) {
        contextParts.push(`🧠 **内心想法**: "${record.automaticThought}"`);
        contextParts.push('');
      }
      
      // 如果有分析结果，添加关键发现
      if (this.analysisResult) {
        if (this.analysisResult.cognitiveBiases && this.analysisResult.cognitiveBiases.length > 0) {
          const biasNames = this.analysisResult.cognitiveBiases.map(bias => bias.label).slice(0, 2);
          contextParts.push(`🔍 **发现的思维模式**: ${biasNames.join('、')}${this.analysisResult.cognitiveBiases.length > 2 ? '等' : ''}`);
          contextParts.push('');
        }
      }
      
      contextParts.push('💬 现在，让我们深入聊聊。你想从哪里开始，或者有什么特别想探讨的吗？');
      
      return contextParts.join('\n');
    },
    
    // 花盆界面相关方法
    generateTopicTitle(record) {
      // 基于情绪和想法生成话题标题
      const emotion = this.getFirstEmotion(record);
      const thought = record.automaticThought || '';
      
      // 简单的标题生成逻辑
      if (thought.includes('工作') || thought.includes('上班')) {
        return `💼 关于工作的${emotion}`;
      } else if (thought.includes('学习') || thought.includes('考试')) {
        return `📚 学习中的${emotion}`;
      } else if (thought.includes('关系') || thought.includes('朋友') || thought.includes('家人')) {
        return `👥 人际关系的思考`;
      } else if (thought.includes('未来') || thought.includes('将来')) {
        return `🔮 对未来的担忧`;
      } else {
        return `💭 ${emotion}的内心独白`;
      }
    },
    
    getPlantIcon(record) {
      if (record.completed) {
        return '🌸'; // 已分析完成
      } else if (record.analysis) {
        return '🌿'; // 有分析但未完成
      } else {
        return '🌱'; // 新种子
      }
    },
    
    getPlantStageClass(record) {
      if (record.completed) return 'stage-bloomed';
      if (record.analysis) return 'stage-growing';
      return 'stage-seed';
    },
    
    getEmotionColor(record) {
      const emotion = this.getFirstEmotion(record);
      const colorMap = {
        '愉悦阳光': 'background: linear-gradient(45deg, #FFD700, #FFA500)',
        '平静如水': 'background: linear-gradient(45deg, #87CEEB, #4682B4)',
        '有些低落': 'background: linear-gradient(45deg, #A0A0A0, #696969)',
        '焦虑不安': 'background: linear-gradient(45deg, #FF6B6B, #FF4757)',
        '充满希望': 'background: linear-gradient(45deg, #98FB98, #32CD32)',
        '疲惫倦怠': 'background: linear-gradient(45deg, #DEB887, #D2B48C)',
        '愤怒': 'background: linear-gradient(45deg, #DC143C, #B22222)',
        '困惑': 'background: linear-gradient(45deg, #DDA0DD, #9370DB)'
      };
      
      return colorMap[emotion] || 'background: linear-gradient(45deg, #84A98C, #52796F)';
    },

    getEmotionTagStyle(emotion) {
      const colorMap = {
        '愉悦阳光': { background: '#FFF3CD', color: '#856404', border: '#FFD700' },
        '平静如水': { background: '#E7F3FF', color: '#1C4E80', border: '#87CEEB' },
        '有些低落': { background: '#F8F9FA', color: '#495057', border: '#A0A0A0' },
        '焦虑不安': { background: '#FFEBEE', color: '#C62828', border: '#FF6B6B' },
        '充满希望': { background: '#E8F5E8', color: '#2E7D32', border: '#98FB98' },
        '疲惫倦怠': { background: '#FFF8E1', color: '#8D6E63', border: '#DEB887' },
        '愤怒': { background: '#FFEBEE', color: '#B71C1C', border: '#DC143C' },
        '困惑': { background: '#F3E5F5', color: '#6A1B9A', border: '#DDA0DD' },
        '开心': { background: '#FFF3CD', color: '#856404', border: '#FFD700' },
        '难过': { background: '#F8F9FA', color: '#495057', border: '#A0A0A0' },
        '紧张': { background: '#FFEBEE', color: '#C62828', border: '#FF6B6B' },
        '兴奋': { background: '#FFF3CD', color: '#856404', border: '#FFD700' },
        '担心': { background: '#FFEBEE', color: '#C62828', border: '#FF6B6B' },
        '失望': { background: '#F8F9FA', color: '#495057', border: '#A0A0A0' }
      };
      
      const style = colorMap[emotion] || { background: '#E8F4F8', color: '#2D3E40', border: '#84A98C' };
      
      return {
        backgroundColor: style.background,
        color: style.color,
        borderColor: style.border
      };
    },
    
    getGrowthStageText(record) {
      if (record.completed) return '已绽放';
      if (record.analysis) return '成长中';
      return '待培育';
    },
    
    getChatCount(record) {
      if (!record.chatTopics) return 0;
      return record.chatTopics.reduce((count, topic) => {
        if (!topic.messages) return count;
        // 只统计用户输入的消息数量
        const userMessages = topic.messages.filter(msg => msg.type === 'user');
        return count + userMessages.length;
      }, 0);
    }
  },
  
  watch: {
    selectedRecord: {
      handler() {
        // 当选择的记录改变时，重新生成气泡
        this.$nextTick(() => {
          this.generateEmotionBubbles()
        })
      },
      immediate: true
    }
  },
  
  mounted() {
    // 使用 nextTick 确保 store 状态已经完全加载
    this.$nextTick(() => {
      setTimeout(() => {
        // 检查是否从菜单进入且要求显示总览页面
        if (this.$route.query.view === 'overview') {
          // 直接显示总览页面，不选择任何记录
          this.selectedRecord = null
          this.isDataLoaded = true
          return
        }
        
        // 如果有预选的记录索引，自动加载
        if (this.$store.state.selectedRecordIndex !== undefined) {
          const index = this.$store.state.selectedRecordIndex
          if (this.$store.state.thoughtRecords && this.$store.state.thoughtRecords[index]) {
            this.selectSeed(index)
          }
        }
        
        // 标记数据已加载，避免闪烁
        this.isDataLoaded = true
      }, 50) // 给一个小的延迟确保所有异步操作完成
    })
    
    // 添加窗口尺寸变化监听
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeUnmount() {
    // 移除窗口尺寸变化监听
    window.removeEventListener('resize', this.handleResize)
    
    // 清理防抖定时器
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }
  }
}
</script>

<style scoped>
/* ===== 基础布局 ===== */
.mind-greenhouse {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== 背景装饰 ===== */
.greenhouse-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.greenhouse-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #E8F4F8 0%, #F0E5D8 30%, #CAD2C5 100%);
}

.greenhouse-glass {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at top, rgba(255,255,255,0.1) 0%, transparent 70%),
    radial-gradient(ellipse at bottom, rgba(132,169,140,0.05) 0%, transparent 70%);
}

.floating-pollen {
  position: absolute;
  width: 100%;
  height: 100%;
}

.pollen-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: pollenFloat 10s infinite ease-in-out;
}

@keyframes pollenFloat {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-50px) translateX(30px) scale(1.2);
    opacity: 1;
  }
}

/* ===== 返回按钮 ===== */
.floating-back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-back-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

.floating-back-btn:active {
  transform: scale(0.95);
}

/* ===== 主内容区 ===== */
.greenhouse-main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  position: relative;
  z-index: 1;
}

/* ===== 加载状态 ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(132, 169, 140, 0.2);
  border-left: 4px solid #84A98C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #52796F;
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
}

/* ===== 种子选择界面（花盆风格） ===== */
.seed-selector {
  width: 100%;
  max-width: 1200px; /* PC端增大尺寸 */
  margin: 0 auto;
}

.greenhouse-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 4rem 3rem; /* PC端增加内边距 */
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(132, 169, 140, 0.2);
}

.greenhouse-header {
  text-align: center;
  margin-bottom: 3rem;
}

.greenhouse-header h1 {
  color: #2D3E40;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.greenhouse-header p {
  color: #52796F;
  font-size: 1.1rem;
  font-style: italic;
}

.greenhouse-garden h2 {
  color: #2D3E40;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  text-align: center;
}

.flowerpot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem;
}

.flowerpot-grid::-webkit-scrollbar {
  width: 8px;
}

.flowerpot-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.flowerpot-grid::-webkit-scrollbar-thumb {
  background: rgba(132, 169, 140, 0.3);
  border-radius: 4px;
}

/* 花盆项目样式 */
.flowerpot-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.flowerpot-item:hover {
  transform: translateY(-5px);
}

.flowerpot-item:hover .hover-info {
  opacity: 1;
  transform: translateY(-10px);
}

.flowerpot-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(132, 169, 140, 0.2);
  transition: all 0.3s ease;
}

.flowerpot-item:hover .flowerpot-container {
  border-color: #84A98C;
  box-shadow: 0 12px 35px rgba(132, 169, 140, 0.2);
}

.flowerpot-item.fresh .flowerpot-container {
  border-color: #FF9B85;
  background: linear-gradient(135deg, rgba(255, 155, 133, 0.05), rgba(255, 155, 133, 0.1));
}

.flowerpot-item.bloomed .flowerpot-container {
  border-color: #84A98C;
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.05), rgba(132, 169, 140, 0.1));
}

/* 植物部分样式 */
.plant-section {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.1), rgba(132, 169, 140, 0.05));
}

.plant-icon {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  transition: all 0.3s ease;
}

.plant-icon.stage-seed {
  animation: gentle-sway 3s ease-in-out infinite;
}

.plant-icon.stage-growing {
  animation: gentle-pulse 2s ease-in-out infinite;
}

.plant-icon.stage-bloomed {
  animation: gentle-sparkle 4s ease-in-out infinite;
}

@keyframes gentle-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.05) rotate(2deg); }
  50% { transform: scale(1) rotate(0deg); }
  75% { transform: scale(1.05) rotate(-2deg); }
}

.topic-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2D3E40;
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.topic-title.auto-generated {
  font-style: italic;
  opacity: 0.8;
}

/* 花盆本体样式 */
.pot-body {
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9));
}

.emotions-display {
  margin-bottom: 1rem;
  text-align: center;
}

.emotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
  align-items: center;
}

.emotion-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.emotion-tag:hover {
  transform: scale(1.05);
}

.emotion-more {
  padding: 0.2rem 0.4rem;
  background: #f0f0f0;
  color: #666;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
}

.no-emotions {
  color: #999;
  font-size: 0.8rem;
  font-style: italic;
}

.thought-preview {
  color: #52796F;
  font-style: italic;
  line-height: 1.4;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
  min-height: 2.5em;
}

.pot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.record-time {
  color: #8B9A9B;
}

.growth-stage {
  background: rgba(132, 169, 140, 0.2);
  color: #52796F;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-weight: 500;
}

/* 悬浮信息 */
/* 对话次数常驻显示 */
.chat-count-persistent {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(132, 169, 140, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hover-info {
  position: absolute;
  top: -15px;
  right: -10px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
}

.chat-count {
  background: #84A98C;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(132, 169, 140, 0.3);
}

/* 返回总览按钮 */
.back-to-overview-container {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.back-to-overview-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #2D3E40;
  border: 1px solid rgba(132, 169, 140, 0.3);
  border-radius: 25px;
  padding: 0.8rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.back-to-overview-btn:hover {
  background: rgba(132, 169, 140, 0.9);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(132, 169, 140, 0.3);
}

/* ===== 查看原始内容功能 ===== */
.view-original-section {
  text-align: center;
  margin-bottom: 2rem;
}

.view-original-btn {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

.view-original-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(132, 169, 140, 0.4);
}

/* 原始内容弹窗样式 */
.original-content-dialog {
  max-width: 700px;
  max-height: 85vh;
}

.original-content-body {
  padding: 0;
}

.original-sections {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.original-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(132, 169, 140, 0.05);
  border-radius: 15px;
  border-left: 4px solid #84A98C;
}

.original-section .section-title {
  color: #2D3E40;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-item label {
  font-weight: 500;
  color: #52796F;
  font-size: 0.9rem;
}

.info-item span {
  color: #2D3E40;
  font-size: 1rem;
}

.emotions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.emotion-tag.original {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.content-text {
  color: #2D3E40;
  line-height: 1.6;
  font-size: 1rem;
}

.content-text p {
  margin: 0;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 10px;
  font-style: italic;
}

.no-data {
  color: #8B9A9B;
  font-style: italic;
  opacity: 0.8;
}

.analysis-status {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.status-label {
  font-weight: 600;
  color: #2D3E40; /* 更深的颜色提高对比度 */
  min-width: 80px;
}

.status-item .completed {
  color: #1B5E20; /* 更深的绿色提高对比度 */
  font-weight: 700;
}

.status-item .pending {
  color: #E65100; /* 更深的橙色提高对比度 */
  font-weight: 700;
}

/* 增强状态项的文字对比度 */
.status-item span:not(.status-label) {
  color: #2D3E40; /* 使用更深的颜色提高对比度 */
  font-weight: 600; /* 增加字重 */
}

/* ===== 花朵展示区 ===== */
.greenhouse-flower {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.flower-display {
  text-align: center;
}

/* ===== 主题概览界面 - 全屏风格 ===== */
.topic-overview {
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
}

.topic-header {
  position: relative;
  margin-bottom: 2rem;
  z-index: 10;
}

/* 返回选择按钮 */
.back-to-selection-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
  z-index: 10;
}

.back-to-selection-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(132, 169, 140, 0.4);
}

.topic-title-main {
  color: #2D3E40;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  padding-top: 1rem;
}

/* 全屏花朵预览区 */
.fullscreen-flower-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  padding: 2rem;
}

.fullscreen-flower-area:hover {
  transform: scale(1.02);
}

.flower-container-fullscreen {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower-stage-fullscreen {
  position: relative;
  z-index: 1;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.flower-image-fullscreen {
  width: 250px;
  height: 250px;
  object-fit: contain;
  filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}

.fullscreen-flower-area:hover .flower-image-fullscreen {
  transform: scale(1.1);
}

/* 全屏情绪气泡 */
.emotion-bubbles-fullscreen {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.emotion-bubble-fullscreen {
  position: absolute;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  font-weight: 500;
  color: #2D3E40;
  border: 1px solid rgba(132, 169, 140, 0.3);
  animation: fullscreenBubbleFloat 4s ease-in-out infinite;
  backdrop-filter: blur(15px);
}

.emotion-bubble-fullscreen:nth-child(1) {
  top: 10%;
  right: 15%;
  animation-delay: 0s;
}

.emotion-bubble-fullscreen:nth-child(2) {
  bottom: 20%;
  left: 10%;
  animation-delay: 0.5s;
}

.emotion-bubble-fullscreen:nth-child(3) {
  top: 30%;
  right: 5%;
  animation-delay: 1s;
}

.emotion-bubble-fullscreen:nth-child(4) {
  bottom: 40%;
  right: 25%;
  animation-delay: 1.5s;
}

.emotion-bubble-fullscreen:nth-child(5) {
  top: 60%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes fullscreenBubbleFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-15px) scale(1.05);
    opacity: 1;
  }
  50% {
    transform: translateY(-8px) scale(1);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-20px) scale(1.02);
    opacity: 0.95;
  }
}

/* 交互提示 */
.interaction-hint {
  text-align: center;
  margin-top: 2rem;
}

.click-hint {
  color: #52796F;
  font-size: 1.2rem;
  font-style: italic;
  margin: 0 0 1rem 0;
  transition: all 0.3s ease;
}

.fullscreen-flower-area:hover .click-hint {
  color: #84A98C;
  font-size: 1.3rem;
}

.hint-indicator {
  font-size: 2rem;
  animation: gentle-pulse 2s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes gentle-pulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.7; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 1; 
  }
}

.flower-container {
  position: relative;
  z-index: 1;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flower-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2; /* 确保花朵在气泡之上 */
}

.flower-image {
  position: relative;
  z-index: 1;
  width: 160px;
  height: 160px;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  z-index: 0;
}

.progress-ring circle {
  fill: none;
  stroke-width: 3;
}

.progress-ring .progress-bg {
  stroke: rgba(0, 0, 0, 0.1);
}

.progress-ring .progress-bar {
  stroke: url(#progressGradient);
  transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  stroke-linecap: round;
  filter: drop-shadow(0 2px 4px rgba(132, 169, 140, 0.3));
}

/* 为进度条添加渐变定义 */
.progress-ring defs {
  position: absolute;
}

/* 如果浏览器不支持SVG渐变，回退到纯色 */
.no-svg-gradient .progress-ring .progress-bar {
  stroke: #84A98C;
}

/* ===== 全新情绪气泡系统 ===== */
/* ===== 重构后的气泡样式 - 更简洁更美观 ===== */
.emotion-bubbles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2; /* 调整到与花朵同一层级 */
  overflow: visible;
}

.emotion-bubble {
  position: absolute;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, 
    hsl(var(--hue, 200), 70%, 85%), 
    hsl(var(--hue, 200), 60%, 75%)
  );
  color: hsl(var(--hue, 200), 40%, 30%);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 
    0 4px 15px hsla(var(--hue, 200), 50%, 50%, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid hsla(var(--hue, 200), 50%, 80%, 0.5);
  
  /* 简化的动画 */
  animation: 
    bubbleFloat 6s ease-in-out infinite,
    bubbleAppear 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  
  /* 响应式调整 */
  transform-origin: center;
  transition: all 0.3s ease;
}

.emotion-bubble:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 25px hsla(var(--hue, 200), 50%, 50%, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.15);
}

/* 不同的气泡类型 - 使用CSS变量设置颜色 */
.emotion-bubble.bubble-0 {
  --hue: 200deg; /* 蓝色 */
}

.emotion-bubble.bubble-1 {
  --hue: 280deg; /* 紫色 */
}

.emotion-bubble.bubble-2 {
  --hue: 120deg; /* 绿色 */
}

.emotion-bubble.bubble-3 {
  --hue: 40deg; /* 黄色 */
}

/* 简化的动画 */
@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(-4px);
  }
  75% {
    transform: translateY(-12px);
  }
}

@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  60% {
    opacity: 0.8;
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0px);
  }
}

/* 气泡浮动动画 */
@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0px) rotate(var(--random-offset, 0deg)) scale(1);
  }
  25% {
    transform: translateY(-8px) rotate(calc(var(--random-offset, 0deg) + 2deg)) scale(1.02);
  }
  50% {
    transform: translateY(0px) rotate(var(--random-offset, 0deg)) scale(1);
  }
  75% {
    transform: translateY(-4px) rotate(calc(var(--random-offset, 0deg) - 2deg)) scale(0.98);
  }
}

/* 气泡光晕效果 */
@keyframes bubbleGlow {
  0% {
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(132, 169, 140, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 0.5);
  }
  100% {
    box-shadow: 
      0 12px 35px rgba(0, 0, 0, 0.2),
      0 4px 15px rgba(132, 169, 140, 0.4),
      inset 0 1px 3px rgba(255, 255, 255, 0.7);
  }
}

/* 气泡出现动画 */
@keyframes bubbleAppear {
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(var(--random-offset, 0deg)) scale(0.3);
  }
  60% {
    opacity: 1;
    transform: translateY(-5px) rotate(var(--random-offset, 0deg)) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0px) rotate(var(--random-offset, 0deg)) scale(1);
  }
}

/* 不同的气泡变体 */
.emotion-bubble.bubble-0 {
  animation-duration: 4s, 3s, 0.8s;
  --bubble-hue: 0deg;
}

.emotion-bubble.bubble-1 {
  animation-duration: 4.5s, 3.2s, 1s;
  animation-delay: 0.2s, 0.1s, var(--delay, 0s);
  --bubble-hue: 60deg;
}

.emotion-bubble.bubble-2 {
  animation-duration: 3.8s, 2.8s, 1.2s;
  animation-delay: 0.4s, 0.3s, var(--delay, 0s);
  --bubble-hue: 120deg;
}

.emotion-bubble.bubble-3 {
  animation-duration: 4.2s, 3.5s, 0.9s;
  animation-delay: 0.6s, 0.2s, var(--delay, 0s);
  --bubble-hue: 240deg;
}

/* 悬停效果 */
.emotion-bubble:hover {
  animation-play-state: paused;
  transform: scale(1.15) rotate(var(--random-offset, 0deg));
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.15), rgba(132, 169, 140, 0.1));
  border-color: rgba(132, 169, 140, 0.6);
  box-shadow: 
    0 15px 40px rgba(132, 169, 140, 0.3),
    0 5px 20px rgba(132, 169, 140, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
  z-index: 15;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.flower-hint {
  margin-top: 2rem;
  color: #52796F;
  font-style: italic;
  font-size: 1.1rem;
}

/* ===== 错误提示样式 ===== */
.error-message {
  margin-top: 2rem;
  animation: slideInUp 0.5s ease-out;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(255, 99, 71, 0.1), rgba(255, 160, 122, 0.1));
  border: 2px solid rgba(255, 99, 71, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(255, 99, 71, 0.15);
}

.error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  animation: bounce 2s infinite;
}

.error-text {
  flex: 1;
}

.error-title {
  color: #2D3E40;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-description {
  color: #52796F;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.error-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.retry-btn, .dismiss-btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.retry-btn {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(132, 169, 140, 0.4);
}

.dismiss-btn {
  background: rgba(132, 169, 140, 0.1);
  color: #52796F;
  border: 1px solid rgba(132, 169, 140, 0.3);
}

.dismiss-btn:hover {
  background: rgba(132, 169, 140, 0.2);
  transform: translateY(-1px);
}

@keyframes slideInUp {
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
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* ===== 分析结果展示 ===== */
.analysis-results {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.empathy-card,
.analysis-card,
.exploration-card,
.encouragement-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 2.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #2D3E40;
  font-size: 1.6rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.title-icon {
  font-size: 1.8rem;
}

/* 认知偏差列表 */
.bias-list {
  display: grid;
  gap: 1rem;
}

.bias-item {
  background: rgba(132, 169, 140, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.bias-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border-color: #84A98C;
  background: rgba(132, 169, 140, 0.08);
}

.bias-item.active {
  border-color: #52796F;
  background: rgba(132, 169, 140, 0.12);
}

.bias-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.bias-icon {
  font-size: 1.5rem;
}

.bias-title {
  color: #2D3E40;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
}

.bias-description {
  color: #2D3E40; /* 更深的颜色提高对比度 */
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500; /* 增加字重 */
}

/* 引导问题列表 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.question-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.2rem;
  background: rgba(255, 155, 133, 0.05);
  border-radius: 20px;
  border-left: 4px solid #FF9B85;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-item:hover {
  transform: translateX(5px);
  background: rgba(255, 155, 133, 0.08);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.question-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.question-text {
  color: #2D3E40; /* 更深的颜色提高对比度 */
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500; /* 增加字重 */
}

/* ===== 底部提示 ===== */
.bottom-hint {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.companion-hint {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.98); /* 改为白色背景 */
  color: #000000; /* 纯黑色文字 */
  padding: 1rem 2rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  font-weight: 700; /* 黑体字 */
}

.companion-hint:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(84, 169, 140, 0.4);
}

.companion-disabled {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.98); /* 增加不透明度 */
  color: #2D3E40; /* 使用更深的颜色提高对比度 */
  padding: 1rem 2rem;
  border-radius: 30px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15); /* 增加阴影对比度 */
  border: 1px solid rgba(132, 169, 140, 0.3); /* 添加边框提高可见性 */
}

.companion-disabled p {
  margin: 0;
  font-weight: 700; /* 改为黑色粗体 */
  color: #000000; /* 纯黑色 */
}

/* ===== 模态对话框 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.modal-dialog {
  background: white;
  border-radius: 30px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h3 {
  color: #2D3E40;
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #8B9A9B;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2D3E40;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-message {
  max-width: 80%;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.modal-message.user {
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.modal-message.companion {
  background: rgba(0, 0, 0, 0.05);
  color: #2D3E40;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

/* 打字指示器样式 */
.typing-indicator {
  align-self: flex-start;
  margin-bottom: 1rem;
}

.typing-message {
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
  animation: fadeIn 0.3s ease;
}

.typing-avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.typing-content {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  border-bottom-left-radius: 5px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.typing-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: var(--radius-full);
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.modal-form {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid rgba(132, 169, 140, 0.2);
  border-radius: 25px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.modal-input:focus {
  outline: none;
  border-color: #84A98C;
}

.modal-send {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(84, 169, 140, 0.3);
}

.modal-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮加载状态 */
.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== 过渡动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  transform: scale(0.9) translateY(20px);
}

/* ===== 响应式设计 ===== */
@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .empathy-card {
    grid-column: span 2;
  }
  
  .encouragement-card {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .greenhouse-main {
    padding: 60px 15px 30px;
  }
  
  .greenhouse-header h1 {
    font-size: 2rem;
  }
  
  .greenhouse-header p {
    font-size: 1rem;
  }
  
  .greenhouse-container {
    padding: 2rem 1.5rem;
    border-radius: 25px;
  }
  
  .flowerpot-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
  }
  
  .plant-icon {
    font-size: 2rem;
  }
  
  .topic-title {
    font-size: 0.9rem;
  }
  
  .pot-body {
    padding: 1.2rem;
  }
  
  .thought-preview {
    font-size: 0.85rem;
  }
  
  .flower-container {
    width: 180px;
    height: 180px;
  }
  
  .flower-stage {
    width: 140px;
    height: 140px;
  }
  
  .flower-image {
    width: 140px;
    height: 140px;
  }
  
  .emotion-bubble {
    padding: 6px 10px;
    font-size: 10px;
    min-width: 30px;
    min-height: 24px;
    max-width: 55px;
    border-radius: 15px;
  }
  
  .progress-ring {
    width: 160px;
    height: 160px;
  }
  
  .floating-back-btn {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
  
  .back-to-selection-btn {
    position: fixed;
    top: 15px;
    left: 15px;
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
    z-index: 100;
  }
  
  .topic-title-main {
    font-size: 1.5rem;
    padding-top: 60px;
  }
  
  .fullscreen-flower-area {
    min-height: calc(100vh - 150px);
    padding: 1rem;
  }
  
  .flower-container-fullscreen {
    width: 250px;
    height: 250px;
    margin: 0 auto 2rem;
  }
  
  .flower-image-fullscreen {
    width: 200px;
    height: 200px;
  }
  
  .emotion-bubble-fullscreen {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .click-hint {
    font-size: 1rem;
  }
  
  .hint-indicator {
    font-size: 1.5rem;
  }
  
  .analysis-card,
  .exploration-card {
    padding: 2rem 1.5rem;
    border-radius: 25px;
  }
  
  .card-title {
    font-size: 1.4rem;
  }
  
  .bias-item {
    padding: 1.2rem;
  }
  
  .bias-title {
    font-size: 1.1rem;
  }
  
  .bias-description {
    font-size: 0.9rem;
  }
  
  .question-item {
    padding: 1rem;
  }
  
  .question-text {
    font-size: 0.95rem;
  }
  
  .bottom-hint {
    bottom: 20px;
  }
  
  .companion-hint,
  .companion-disabled {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .modal-dialog {
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 1.2rem 1.5rem;
  }
  
  .modal-header h3 {
    font-size: 1.2rem;
  }
  
  .modal-messages {
    padding: 1.5rem;
  }
  
  .modal-form {
    padding: 1rem 1.5rem;
  }
  
  /* 移动端情绪标签优化 */
  .emotion-tags {
    gap: 0.2rem;
    flex-wrap: wrap;
  }
  
  .emotion-tag {
    padding: 0.15rem 0.4rem;
    font-size: 0.7rem;
    border-radius: 6px;
  }
  
  .emotion-more {
    padding: 0.15rem 0.3rem;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .greenhouse-main {
    padding: 50px 10px 20px;
  }
  
  .greenhouse-header h1 {
    font-size: 1.8rem;
  }
  
  .greenhouse-header p {
    font-size: 0.95rem;
  }
  
  .greenhouse-container {
    padding: 1.5rem 1rem;
  }
  
  .greenhouse-garden h2 {
    font-size: 1.3rem;
  }
  
  .flowerpot-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .plant-icon {
    font-size: 1.8rem;
  }
  
  .topic-title {
    font-size: 0.85rem;
  }
  
  .pot-body {
    padding: 1rem;
  }
  
  .thought-preview {
    font-size: 0.8rem;
    min-height: 2em;
  }
  
  .seed-item {
    padding: 1rem;
    gap: 0.8rem;
  }
  
  .emotion-tag {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .seed-time {
    font-size: 0.8rem;
  }
  
  .seed-thought {
    font-size: 0.9rem;
  }
  
  .flower-container {
    width: 180px;
    height: 180px;
  }
  
  .flower-stage {
    width: 110px;
    height: 110px;
  }
  
  .flower-image {
    width: 110px;
    height: 110px;
  }
  
  .emotion-bubble {
    padding: 4px 8px;
    font-size: 10px;
    min-width: 35px;
    min-height: 24px;
    max-width: 55px;
    border-radius: 12px;
    /* 移动端四角定位法调整 */
    transform: scale(0.9); /* 稍微缩小避免超出边界 */
  }
  
  .progress-ring {
    width: 140px;
    height: 140px;
  }
  
  .analysis-stage {
    bottom: -30px;
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .flower-hint {
    font-size: 1rem;
  }
  
  /* 改进加载文字显示 */
  .loading-text {
    font-size: 1rem;
    line-height: 1.4;
    text-align: center;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  
  /* 改进点击提示文字显示 */
  .click-hint {
    font-size: 1rem;
    line-height: 1.4;
    text-align: center;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
    padding: 0 1rem;
  }
  
  /* 确保主题标题在移动端正确显示 */
  .topic-title-main {
    font-size: 1.5rem;
    padding-top: 60px;
    line-height: 1.3;
    word-break: break-word;
    overflow-wrap: break-word;
    text-align: center;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* 返回总览按钮移动端调整 */
  .back-to-overview-container {
    top: 60px;
  }
  
  .back-to-overview-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
  
  .floating-back-btn {
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .analysis-card,
  .exploration-card {
    padding: 1.5rem 1rem;
  }
  
  .card-title {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .bias-item {
    padding: 1rem;
  }
  
  .bias-icon {
    font-size: 1.3rem;
  }
  
  .bias-title {
    font-size: 1rem;
  }
  
  .bias-description {
    font-size: 0.85rem;
  }
  
  .question-item {
    padding: 0.8rem;
    gap: 0.8rem;
  }
  
  .question-number {
    width: 25px;
    height: 25px;
    font-size: 0.85rem;
  }
  
  .question-text {
    font-size: 0.9rem;
  }
  
  .chat-wrapper {
    border-radius: 20px;
  }
  
  .chat-messages {
    max-height: 250px;
    padding: 1rem;
  }
  
  .message-item {
    margin-bottom: 1rem;
  }
  
  .message-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
  
  .message-bubble {
    max-width: 80%;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    border-radius: 15px;
  }
  
  .chat-form {
    padding: 0.8rem;
    gap: 0.5rem;
  }
  
  .chat-input {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  .send-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  .bottom-hint {
    bottom: 15px;
  }
  
  .companion-hint,
  .companion-disabled {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
    border-radius: 25px;
  }
  
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-dialog {
    border-radius: 20px;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-close {
    width: 35px;
    height: 35px;
    font-size: 1.5rem;
  }
  
  .modal-messages {
    padding: 1rem;
  }
  
  .modal-message {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
    border-radius: 15px;
  }
  
  .modal-form {
    padding: 0.8rem 1rem;
    gap: 0.5rem;
  }
  
  .modal-input {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  .modal-send {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
}

/* ===== 特殊屏幕适配 ===== */
@media (min-width: 1200px) {
  .greenhouse-main {
    padding: 100px 40px 60px;
  }
  
  .seed-selector {
    max-width: 800px;
  }
  
  .analysis-results {
    max-width: 1100px;
  }
  
  .chat-section {
    max-width: 900px;
  }
}

/* 横屏手机适配 */
@media (max-height: 500px) and (orientation: landscape) {
  .greenhouse-main {
    padding: 40px 20px 20px;
  }
  
  .flower-container {
    width: 180px;
    height: 180px;
  }
  
  .flower-stage {
    width: 100px;
    height: 100px;
  }
  
  .chat-messages {
    max-height: 200px;
  }
  
  .modal-dialog {
    max-height: 90vh;
  }
}

/* ===== 打印样式 ===== */
@media print {
  .greenhouse-background,
  .floating-back-btn,
  .bottom-hint,
  .chat-form,
  .modal-form {
    display: none;
  }
  
  .mind-greenhouse {
    background: white;
  }
  
  .analysis-card,
  .exploration-card {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }
}

/* ===== 辅助功能 ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .mind-greenhouse {
    background: white;
  }
  
  .selector-card,
  .analysis-card,
  .exploration-card,
  .chat-wrapper,
  .modal-dialog {
    background: white;
    border: 2px solid black;
  }
  
  .emotion-tag,
  .send-button,
  .companion-hint,
  .modal-send {
    background: black;
    color: white;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .mind-greenhouse {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .selector-card,
  .analysis-card,
  .exploration-card,
  .chat-wrapper,
  .modal-dialog {
    background: rgba(30, 30, 30, 0.95);
    color: #e0e0e0;
  }
  
  .greenhouse-header h1,
  .card-title,
  .bias-title,
  .question-text,
  .message-bubble {
    color: #e0e0e0;
  }
  
  .greenhouse-header p,
  .seed-time,
  .bias-description {
    color: #b0b0b0;
  }
  
  .seed-item {
    background: rgba(40, 40, 40, 0.8);
  }
  
  .seed-item:hover {
    background: rgba(50, 50, 50, 0.95);
  }
  
  .emotion-bubble,
  .message-bubble {
    background: rgba(60, 60, 60, 0.95);
    color: #e0e0e0;
  }
  
  .chat-input,
  .modal-input {
    background: rgba(40, 40, 40, 0.8);
    color: #e0e0e0;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .chat-input:focus,
  .modal-input:focus {
    background: rgba(50, 50, 50, 0.9);
    border-color: #84A98C;
  }
}

.empathy-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 2.5rem;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  border-left: 4px solid #FF9B85;
}

.empathy-text {
  color: #1A2B2E; /* 更深的颜色提高对比度 */
  font-size: 1.1rem;
  line-height: 1.8;
  font-style: italic;
  margin: 0;
  font-weight: 500; /* 增加字重 */
}

.encouragement-card {
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  border-radius: 30px;
  padding: 2rem;
  margin-top: 2rem;
}

.encouragement-content {
  display: flex;
    align-items: center;
  gap: 1.5rem;
  color: white;
}

.encouragement-icon {
  font-size: 2rem;
}

.encouragement-text {
  font-size: 1.2rem;
  margin: 0;
  line-height: 1.6;
  font-weight: 600; /* 增加字重提高对比度 */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* 添加文字阴影提高可读性 */
}

.analysis-stage {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #52796F;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  animation: fadeInUp 0.3s ease-out;
  max-width: 90vw; /* 限制最大宽度 */
}

/* 手机端修复文字超出问题 */
@media (max-width: 480px) {
  .analysis-stage {
    white-space: normal; /* 允许换行 */
    text-align: center;
    max-width: 80vw;
    line-height: 1.3;
    bottom: -30px; /* 调整位置避免遮挡 */
    left: 50%;
    transform: translateX(-50%);
    word-break: break-word; /* 确保长单词正确换行 */
    overflow-wrap: break-word; /* 兼容性更好的换行 */
  }
}
</style>

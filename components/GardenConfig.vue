<!-- 花园设置 -->
<template>
  <div class="garden-config">
    <!-- 背景层 -->
    <div class="garden-background">
      <div class="sky-gradient"></div>
      <div class="floating-particles">
        <div v-for="i in 12" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <button @click="goBack" class="floating-back-btn" aria-label="返回主页">
      <span>🏡</span>
    </button>

    <!-- 主内容区 -->
    <main class="garden-content">
      <!-- 页面标题 -->
      <header class="page-header">
        <h1 class="page-title">
          <span class="title-icon">⚙️</span>
          花园设置
        </h1>
        <p class="page-subtitle">管理你的心灵花园配置</p>
      </header>
      <!-- LLM设置卡片 -->
      <section class="config-card llm-settings">
        <h2 class="section-title">
          <span class="title-icon">🤖</span>
          智慧伙伴设置
        </h2>
        
        <!-- 配置模式选择 -->
        <div class="config-mode-selector">
          <div class="mode-toggle">
            <input 
              type="radio" 
              id="cloud-default" 
              value="cloud" 
              v-model="configMode"
              @change="handleConfigModeChange"
            >
            <label for="cloud-default" class="mode-option">
              <span class="mode-icon">☁️</span>
              <span class="mode-text">云端默认</span>
            </label>
            
            <input 
              type="radio" 
              id="local-config" 
              value="local" 
              v-model="configMode"
              @change="handleConfigModeChange"
            >
            <label for="local-config" class="mode-option">
              <span class="mode-icon">⚙️</span>
              <span class="mode-text">本地配置</span>
            </label>
          </div>
          <p class="mode-description">
            <span v-if="configMode === 'cloud'">使用预设的云端配置，无需手动设置</span>
            <span v-else>使用自定义的本地LLM配置</span>
          </p>
        </div>
        
        <!-- 本地配置表单，仅在本地模式下显示 -->
        <div v-show="configMode === 'local'" class="local-config-form">
        <div class="form-group">
          <label for="endpoint">API 地址</label>
          <input
            id="endpoint"
            v-model="apiConfig.endpoint"
            type="text"
            placeholder="例如: https://api.openai.com/v1/chat/completions"
          >
        </div>

        <div class="form-group">
          <label for="apiKey">API 密钥</label>
          <input
            id="apiKey"
            v-model="apiConfig.apiKey"
            type="password"
            placeholder="输入你的API密钥"
          >
        </div>

        <div class="form-group">
          <label for="modelSelect">选择模型</label>
          <select
            id="modelSelect"
            v-model="selectedModelOption"
            @change="handleModelChange"
          >
            <option value="custom">自定义模型</option>
          </select>
          
          <input
            v-model="customModelName"
            type="text"
            placeholder="输入模型名称（如：qwen-turbo）"
            class="custom-model-input"
          >
        </div>

        <div class="button-group">
          <button
            class="test-button"
            @click="testConnection"
            :disabled="!isFormValid || isTesting"
          >
            {{ isTesting ? '测试中...' : '测试连接' }}
          </button>
          
          <button
            class="save-button"
            @click="saveConfig"
            :disabled="!isFormValid"
          >
            保存设置
          </button>
        </div>

        <!-- 测试状态显示 -->
        <div v-if="testStatus" class="test-status" :class="{ 'success': testStatus.includes('成功') }">
          {{ testStatus }}
        </div>

        <!-- 保存成功提示 -->
        <div v-if="showSuccess" class="success-message">
          ✨ 设置已保存
        </div>
        </div>
        
        <!-- 云端配置状态显示 -->
        <div v-show="configMode === 'cloud'" class="cloud-config-status">
          <div class="cloud-info">
            <span class="info-icon">✅</span>
            <div class="info-content">
              <h4>云端配置已启用</h4>
              <p>系统将使用预配置的云端LLM服务，您无需进行额外设置。</p>
            </div>
          </div>
          
          <div class="button-group">
            <button
              class="test-button"
              @click="testCloudConnection"
              :disabled="isTestingCloud"
            >
              {{ isTestingCloud ? '测试中...' : '测试云端连接' }}
            </button>
          </div>
          
          <!-- 云端测试状态显示 -->
          <div v-if="cloudTestStatus" class="test-status" :class="{ 'success': cloudTestStatus.includes('成功') }">
            {{ cloudTestStatus }}
          </div>
        </div>
      </section>

      <!-- 数据管理卡片 -->
      <section class="config-card data-management">
        <h2 class="section-title">
          <span class="title-icon">💾</span>
          数据管理
        </h2>
        
        <div class="data-controls">
          <div class="control-group">
            <h3>导出数据</h3>
            <p class="control-description">
              将你的心灵花园数据导出为JSON文件，可用于备份或迁移到其他设备
            </p>
            <button @click="exportData" class="export-button">
              <span class="button-icon">📤</span>
              导出数据
            </button>
          </div>

          <div class="control-group">
            <h3>导入数据</h3>
            <p class="control-description">
              从备份文件中恢复数据，新数据将与现有数据合并
            </p>
            <div class="import-controls">
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                @change="handleFileSelect"
                style="display: none"
              >
              <button @click="triggerFileSelect" class="import-button">
                <span class="button-icon">📥</span>
                选择文件
              </button>
              <button
                v-if="selectedFile"
                @click="importData"
                class="confirm-import-button"
                :disabled="isImporting"
              >
                {{ isImporting ? '导入中...' : '确认导入' }}
              </button>
            </div>
            <div v-if="selectedFile" class="file-info">
              已选择: {{ selectedFile.name }}
            </div>
          </div>

          <div class="control-group danger-zone">
            <h3>危险操作</h3>
            <p class="control-description warning">
              ⚠️ 以下操作将永久删除所有数据，请谨慎操作
            </p>
            <button @click="confirmClearAll" class="clear-button">
              <span class="button-icon">🗑️</span>
              清空所有数据
            </button>
          </div>
        </div>

        <!-- 导入导出状态提示 -->
        <div v-if="dataOperationStatus" class="operation-status" :class="dataOperationStatus.type">
          {{ dataOperationStatus.message }}
        </div>
      </section>
    </main>

    <!-- 确认清空对话框 -->
    <teleport to="body">
      <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
        <div class="modal-dialog" @click.stop>
          <div class="modal-header">
            <h3>⚠️ 确认清空数据</h3>
          </div>
          <div class="modal-body">
            <p>此操作将永久删除所有心灵花园数据，包括：</p>
            <ul>
              <li>所有思维记录</li>
              <li>分析结果</li>
              <li>对话历史</li>
            </ul>
            <p><strong>此操作无法撤销！</strong></p>
          </div>
          <div class="modal-footer">
            <button @click="showClearConfirm = false" class="cancel-button">取消</button>
            <button @click="clearAllData" class="confirm-button">确认清空</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import appConfig from '../config/app.config'

export default {
  name: 'GardenConfig',
  
  data() {
    return {
      apiConfig: { ...this.$store.state.apiConfig },
      showSuccess: false,
      selectedModelOption: '',
      customModelName: '',
      testStatus: '',
      isTesting: false,
      // 配置模式相关
      configMode: 'cloud', // 'cloud' 或 'local'
      cloudTestStatus: '',
      isTestingCloud: false,
      // 数据管理相关
      selectedFile: null,
      isImporting: false,
      dataOperationStatus: null,
      showClearConfirm: false
    }
  },

  created() {
    // 初始化时设置selectedModelOption
    this.selectedModelOption = 'custom'
    this.customModelName = this.apiConfig.model || ''
    
    // 恢复配置模式选择
    const savedConfigMode = localStorage.getItem('configMode');
    if (savedConfigMode) {
      this.configMode = savedConfigMode;
    }
    
    // 如果是云端模式，应用云端配置
    if (this.configMode === 'cloud') {
      this.applyCloudConfig();
    }
    
    console.log('[Config] 初始化完成，当前模式:', this.configMode);
  },

  computed: {
    isFormValid() {
      const hasRequiredFields = this.apiConfig.endpoint && this.apiConfig.apiKey
      return hasRequiredFields && this.customModelName
    }
  },

  methods: {
    goBack() {
      this.$router.push('/')
    },

    getParticleStyle(index) {
      const randomDelay = Math.random() * 5
      const randomDuration = 5 + Math.random() * 5
      const randomLeft = Math.random() * 100
      const randomTop = Math.random() * 100 // 添加垂直位置
      
      return {
        left: `${randomLeft}%`,
        top: `${randomTop}%`, // 设置垂直位置
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`
      }
    },

    handleModelChange() {
      this.apiConfig.model = this.customModelName
    },
    
    // 配置模式切换
    handleConfigModeChange() {
      if (this.configMode === 'cloud') {
        // 切换到云端模式
        console.log('[Config] 切换到云端模式');
        this.testStatus = '';
        this.cloudTestStatus = '';
        
        // 应用云端默认配置
        this.applyCloudConfig();
      } else {
        // 切换到本地模式
        console.log('[Config] 切换到本地模式');
        this.cloudTestStatus = '';
        // 本地模式下保持当前配置不变
      }
      
      // 保存配置模式选择
      localStorage.setItem('configMode', this.configMode);
    },
    
    // 应用云端配置
    applyCloudConfig() {
      // 使用预设的云端默认配置
      const cloudConfig = {
        endpoint: appConfig.llm.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        apiKey: appConfig.llm.apiKey || '', // 云端配置应该在环境变量中设置
        model: appConfig.llm.modelName || 'qwen-turbo'
      };
      
      console.log('[Config] 应用云端配置:', {
        endpoint: cloudConfig.endpoint,
        hasApiKey: !!cloudConfig.apiKey,
        model: cloudConfig.model
      });
      
      // 更新到store
      this.$store.updateApiConfig(cloudConfig);
      
      // 更新本地数据用于UI显示
      this.apiConfig = { ...cloudConfig };
      this.customModelName = cloudConfig.model;
      
      // 清除本地存储的配置，确保使用云端配置
      localStorage.removeItem('llmConfig');
      
      console.log('[Config] 云端配置已应用');
    },
    
    // 测试云端连接
    async testCloudConnection() {
      this.isTestingCloud = true;
      this.cloudTestStatus = '正在测试云端连接...';
      
      try {
        // 使用与 LLM 服务相同的代理路径
        const proxyUrl = process.env.NODE_ENV === 'production' 
          ? '/api/llm-proxy' 
          : 'http://localhost:3001/api/llm-proxy';

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: '请回复"连接测试成功"'
              }
            ],
            max_tokens: 50,
            temperature: 0.1
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            this.cloudTestStatus = '✅ 云端连接测试成功！API响应正常';
          } else {
            this.cloudTestStatus = '⚠️ 云端连接成功，但响应格式异常';
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          this.cloudTestStatus = `❌ 云端连接失败: ${errorData.message || response.statusText}`;
          console.error('云端连接测试失败:', errorData);
        }
      } catch (error) {
        console.error('云端连接测试失败:', error);
        this.cloudTestStatus = '❌ 云端连接测试失败，请检查网络连接或API配置';
      } finally {
        this.isTestingCloud = false;
        
        // 5秒后清除状态
        setTimeout(() => {
          this.cloudTestStatus = '';
        }, 5000);
      }
    },

    async testConnection() {
      this.isTesting = true;
      this.testStatus = '正在测试连接...';
      
      try {
        // 使用与 LLM 服务相同的代理路径
        const proxyUrl = process.env.NODE_ENV === 'production' 
          ? '/api/llm-proxy' 
          : 'http://localhost:3001/api/llm-proxy';

        const response = await fetch(proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiConfig.apiKey,
            'X-API-URL': this.apiConfig.endpoint,
            'X-Model-Name': this.apiConfig.model
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: "你好，这是一条测试消息。请回复：连接测试成功！"
              }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '连接测试失败');
        }

        const data = await response.json();
        if (data.content && data.content.includes('连接测试成功')) {
          this.testStatus = '✅ 连接测试成功！';
        } else {
          this.testStatus = '⚠️ 连接成功，但响应异常';
          console.warn('意外的响应内容:', data);
        }
      } catch (error) {
        console.error('连接测试失败:', error);
        this.testStatus = `❌ 连接测试失败: ${error.message}`;
      } finally {
        this.isTesting = false;
        
        // 5秒后清除状态
        setTimeout(() => {
          this.testStatus = '';
        }, 5000);
      }
    },

    saveConfig() {
      this.apiConfig.model = this.customModelName;
      
      // 使用store的updateApiConfig方法
      this.$store.updateApiConfig({
        endpoint: this.apiConfig.endpoint,
        apiKey: this.apiConfig.apiKey,
        model: this.apiConfig.model
      });
      
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 2000);
    },

    // 数据管理方法
    exportData() {
      try {
        const success = this.$store.exportData();
        if (success) {
          this.showOperationStatus('success', '✅ 数据导出成功！文件已下载');
        } else {
          this.showOperationStatus('error', '❌ 数据导出失败');
        }
      } catch (error) {
        console.error('导出数据失败:', error);
        this.showOperationStatus('error', '❌ 数据导出失败');
      }
    },

    triggerFileSelect() {
      this.$refs.fileInput.click();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          this.selectedFile = file;
          this.dataOperationStatus = null;
        } else {
          this.showOperationStatus('error', '❌ 请选择JSON格式的文件');
          this.selectedFile = null;
        }
      }
    },

    async importData() {
      if (!this.selectedFile) return;

      this.isImporting = true;
      try {
        const fileContent = await this.readFileAsText(this.selectedFile);
        const result = this.$store.importData(fileContent);
        
        if (result.success) {
          this.showOperationStatus('success', 
            `✅ 数据导入成功！导入了${result.imported}条新记录，当前共有${result.total}条记录`);
          this.selectedFile = null;
          // 重置文件输入
          this.$refs.fileInput.value = '';
        } else {
          this.showOperationStatus('error', `❌ 数据导入失败: ${result.error}`);
        }
      } catch (error) {
        console.error('导入数据失败:', error);
        this.showOperationStatus('error', '❌ 文件读取失败，请检查文件格式');
      } finally {
        this.isImporting = false;
      }
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    },

    confirmClearAll() {
      this.showClearConfirm = true;
    },

    clearAllData() {
      try {
        this.$store.clearAll();
        this.showOperationStatus('success', '✅ 所有数据已清空');
        this.showClearConfirm = false;
      } catch (error) {
        console.error('清空数据失败:', error);
        this.showOperationStatus('error', '❌ 清空数据失败');
      }
    },

    showOperationStatus(type, message) {
      this.dataOperationStatus = { type, message };
      // 5秒后自动隐藏
      setTimeout(() => {
        this.dataOperationStatus = null;
      }, 5000);
    }
  },

  mounted() {
    // 从本地存储加载配置
    const savedConfig = localStorage.getItem('llmConfig')
    if (savedConfig) {
      this.apiConfig = { ...JSON.parse(savedConfig) }
    }
  }
}
</script>

<style scoped>
.garden-config {
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

/* 返回按钮 */
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

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  color: #2D3E40;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.title-icon {
  font-size: 2.5rem;
  animation: gentle-spin 4s ease-in-out infinite;
}

@keyframes gentle-spin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(360deg); }
}

.page-subtitle {
  color: #52796F;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  font-style: italic;
}

/* 主内容区 */
.garden-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 配置卡片 */
.config-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section-title {
  color: #2D3E40;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.title-icon {
  font-size: 1.8rem;
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #2D3E40;
  font-weight: 500;
  font-size: 1rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid rgba(132, 169, 140, 0.3);
  border-radius: 10px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2D3E40;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #84A98C;
  box-shadow: 0 0 15px rgba(132, 169, 140, 0.2);
}

.custom-model-input {
  margin-top: 1rem;
}

/* 按钮样式 */
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.test-button,
.save-button {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-button {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
}

.save-button {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
}

.test-button:hover,
.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(132, 169, 140, 0.3);
}

.test-button:disabled,
.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 测试状态显示 */
.test-status {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: rgba(255, 0, 0, 0.1);
  color: #d32f2f;
  text-align: center;
}

.test-status.success {
  background: rgba(76, 175, 80, 0.1);
  color: #388e3c;
}

/* 保存成功提示 */
.success-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border-radius: 20px;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .floating-back-btn {
    width: 50px;
    height: 50px;
    top: 15px;
    left: 15px;
  }

  .garden-content {
    padding: 1rem;
  }
  
  .config-card {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .test-button,
  .save-button {
    width: 100%;
  }
}

/* 数据管理样式 */
.data-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.control-group {
  padding: 1.5rem;
  background: rgba(132, 169, 140, 0.05);
  border-radius: 15px;
  border-left: 4px solid #84A98C;
}

.control-group h3 {
  color: #2D3E40;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.control-description {
  color: #52796F;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.control-description.warning {
  color: #e57373;
  font-weight: 500;
}

.import-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-button,
.import-button,
.confirm-import-button,
.clear-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
}

.export-button {
  background: linear-gradient(135deg, #84A98C, #52796F);
  color: white;
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

.import-button {
  background: linear-gradient(135deg, #FF9B85, #FF7961);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 155, 133, 0.3);
}

.confirm-import-button {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.clear-button {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.export-button:hover,
.import-button:hover,
.confirm-import-button:hover,
.clear-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.confirm-import-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
}

.button-icon {
  font-size: 1.1rem;
}

.file-info {
  margin-top: 1rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  color: #2D3E40;
  font-size: 0.9rem;
  font-style: italic;
}

.danger-zone {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.operation-status {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 15px;
  text-align: center;
  font-weight: 500;
  animation: slideInUp 0.3s ease-out;
}

.operation-status.success {
  background: rgba(76, 175, 80, 0.1);
  color: #388e3c;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.operation-status.error {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

/* 模态对话框样式 */
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
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-header h3 {
  margin: 0;
  color: #d32f2f;
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
  color: #2D3E40;
  line-height: 1.6;
}

.modal-body ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.modal-body li {
  margin-bottom: 0.3rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-button,
.confirm-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: rgba(132, 169, 140, 0.1);
  color: #52796F;
  border: 1px solid rgba(132, 169, 140, 0.3);
}

.cancel-button:hover {
  background: rgba(132, 169, 140, 0.2);
  transform: translateY(-1px);
}

.confirm-button {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
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

/* 移动端响应式 */
@media (max-width: 768px) {
  .import-controls {
    flex-direction: column;
  }
  
  .modal-dialog {
    margin: 1rem;
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
  
  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}

/* 移动端480px断点 - 与App.vue保持一致 */
@media (max-width: 480px) {
  .floating-back-btn {
    width: 45px;
    height: 45px;
    top: 10px;
    left: 10px;
    font-size: 1.2rem;
  }
}

/* 深色模式支持 - 完全优化版本 */
@media (prefers-color-scheme: dark) {
  .garden-config {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .garden-background::before {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 30%, #1f2e2e 100%);
  }
  
  .page-title,
  .section-title {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 700 !important; /* 增加字重 */
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
  }
  
  .page-subtitle {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500 !important;
  }
  
  .config-card {
    background: rgba(20, 25, 30, 0.95) !important;
    border: 2px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  }
  
  .config-mode-selector {
    background: rgba(30, 35, 40, 0.9) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  .mode-option {
    background: rgba(40, 45, 50, 0.9) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    color: #e0e0e0 !important;
    font-weight: 600 !important;
  }
  
  .mode-toggle input[type="radio"]:checked + .mode-option {
    background: linear-gradient(135deg, #84A98C 0%, #52796F 100%) !important;
    color: #ffffff !important;
    border-color: #52796F !important;
    font-weight: 700 !important;
  }
  
  .mode-description {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500 !important;
  }
  
  .cloud-config-status {
    background: linear-gradient(135deg, rgba(132, 169, 140, 0.2) 0%, rgba(82, 121, 111, 0.1) 100%) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  .info-content h4 {
    color: #ffffff !important;
    font-weight: 700 !important;
  }
  
  .info-content p {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500 !important;
  }
  
  .form-group label {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 600 !important;
  }
  
  .form-group input,
  .form-group select {
    background: rgba(30, 35, 40, 0.9) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    color: #e0e0e0 !important;
    font-weight: 500 !important;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    border-color: #84A98C !important;
    box-shadow: 0 0 15px rgba(132, 169, 140, 0.4) !important;
    background: rgba(40, 45, 50, 0.95) !important;
    color: #ffffff !important;
  }
  
  .form-group input::placeholder {
    color: #a0a0a0 !important; /* 提高占位符对比度 */
  }
  
  .test-status {
    background: rgba(244, 67, 54, 0.2) !important;
    color: #ff8a80 !important; /* 提高错误文字对比度 */
    border: 1px solid rgba(244, 67, 54, 0.4) !important;
    font-weight: 600 !important;
  }
  
  .test-status.success {
    background: rgba(76, 175, 80, 0.2) !important;
    color: #81c784 !important; /* 提高成功文字对比度 */
    border: 1px solid rgba(76, 175, 80, 0.4) !important;
  }
  
  .control-group {
    background: rgba(132, 169, 140, 0.15) !important; /* 增加背景不透明度 */
    border-left: 4px solid #84A98C !important;
  }
  
  .control-group h3 {
    color: #ffffff !important;
    font-weight: 700 !important;
  }
  
  .control-description {
    color: #e0e0e0 !important; /* 提高对比度 */
    font-weight: 500 !important;
  }
  
  .control-description.warning {
    color: #ff8a80 !important; /* 提高警告文字对比度 */
    font-weight: 600 !important;
  }
  
  .file-info {
    background: rgba(30, 35, 40, 0.9) !important;
    color: #e0e0e0 !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    font-weight: 500 !important;
  }
  
  .danger-zone {
    background: rgba(244, 67, 54, 0.1) !important;
    border-left: 4px solid #f44336 !important;
  }
  
  .operation-status.success {
    background: rgba(76, 175, 80, 0.2) !important;
    color: #81c784 !important;
    border: 2px solid rgba(76, 175, 80, 0.4) !important;
    font-weight: 600 !important;
  }
  
  .operation-status.error {
    background: rgba(244, 67, 54, 0.2) !important;
    color: #ff8a80 !important;
    border: 2px solid rgba(244, 67, 54, 0.4) !important;
    font-weight: 600 !important;
  }
  
  .modal-dialog {
    background: rgba(20, 25, 30, 0.95) !important;
    border: 2px solid rgba(255, 255, 255, 0.1) !important;
  }
  
  .modal-header h3 {
    color: #ff8a80 !important; /* 提高错误标题对比度 */
    font-weight: 700 !important;
  }
  
  .modal-body {
    color: #e0e0e0 !important;
    font-weight: 500 !important;
  }
  
  .modal-body ul {
    color: #e0e0e0 !important;
  }
  
  .modal-body li {
    color: #e0e0e0 !important;
  }
  
  .modal-body strong {
    color: #ffffff !important;
    font-weight: 700 !important;
  }
  
  .cancel-button {
    background: rgba(132, 169, 140, 0.2) !important;
    color: #84A98C !important;
    border: 2px solid rgba(132, 169, 140, 0.4) !important;
    font-weight: 600 !important;
  }
  
  .cancel-button:hover {
    background: rgba(132, 169, 140, 0.3) !important;
    color: #ffffff !important;
  }
  
  /* 浮动按钮在深色模式下的优化 */
  .floating-back-btn {
    background: linear-gradient(135deg, #84A98C 0%, #52796F 100%) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
  }
  
  .floating-back-btn:hover {
    box-shadow: 0 12px 35px rgba(132, 169, 140, 0.5) !important;
  }
  
  /* 按钮样式优化 */
  .test-button,
  .save-button,
  .export-button,
  .import-button,
  .confirm-import-button,
  .clear-button {
    font-weight: 600 !important;
  }
}

/* 配置模式选择器样式 */
.config-mode-selector {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 15px;
  border: 1px solid rgba(132, 169, 140, 0.2);
}

.mode-toggle {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mode-toggle input[type="radio"] {
  display: none;
}

.mode-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(132, 169, 140, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.mode-toggle input[type="radio"]:checked + .mode-option {
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  color: white;
  border-color: #52796F;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
}

.mode-icon {
  font-size: 1.2rem;
}

.mode-text {
  font-size: 1rem;
}

.mode-description {
  text-align: center;
  color: #52796F;
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

/* 云端配置状态样式 */
.cloud-config-status {
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(132, 169, 140, 0.1) 0%, rgba(82, 121, 111, 0.05) 100%);
  border-radius: 15px;
  border: 1px solid rgba(132, 169, 140, 0.2);
}

.cloud-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-icon {
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.info-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2D3E40;
  font-size: 1.1rem;
}

.info-content p {
  margin: 0;
  color: #52796F;
  line-height: 1.5;
}

/* 移动端配置模式样式 */
@media (max-width: 768px) {
  .mode-toggle {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .mode-option {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
  
  .cloud-info {
    flex-direction: column;
    gap: 0.8rem;
    text-align: center;
  }
}
</style> 
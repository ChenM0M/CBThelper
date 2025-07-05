<template>
  <div class="config-container">
    <h2 class="mb-4">🔧 API 设置</h2>
    
    <div class="card">
      <div class="form-group">
        <label>API 端点</label>
        <input 
          type="text" 
          class="form-control"
          v-model="apiConfig.endpoint"
          placeholder="https://api.openai.com/v1/chat/completions"
        >
      </div>

      <div class="form-group">
        <label>API 密钥</label>
        <input
          type="password"
          class="form-control"
          v-model="apiConfig.apiKey"
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        >
      </div>

      <div class="form-group">
        <label>模型选择</label>
        <select class="form-control" v-model="selectedModelOption" @change="handleModelChange">
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
          <option value="custom">自定义...</option>
        </select>
      </div>
      
      <div class="form-group" v-if="selectedModelOption === 'custom'">
        <label>自定义模型名称</label>
        <input
          type="text"
          class="form-control"
          v-model="customModelName"
          placeholder="输入自定义模型名称"
        >
      </div>

      <button 
        class="btn btn-primary"
        @click="saveConfig"
        :disabled="!isFormValid"
      >
        💾 保存设置
      </button>

      <div class="alert alert-success mt-3" v-if="showSuccess">
        ✅ 设置保存成功！
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiConfig: { ...this.$store.state.apiConfig },
      showSuccess: false,
      selectedModelOption: '',
      customModelName: ''
    };
  },
  created() {
    // 初始化时设置selectedModelOption
    const predefinedModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
    if (predefinedModels.includes(this.apiConfig.model)) {
      this.selectedModelOption = this.apiConfig.model;
    } else {
      this.selectedModelOption = 'custom';
      this.customModelName = this.apiConfig.model;
    }
  },
  computed: {
    isFormValid() {
      const hasRequiredFields = this.apiConfig.endpoint && this.apiConfig.apiKey;
      
      if (this.selectedModelOption === 'custom') {
        return hasRequiredFields && this.customModelName;
      } else {
        return hasRequiredFields && this.selectedModelOption;
      }
    }
  },
  methods: {
    handleModelChange() {
      if (this.selectedModelOption !== 'custom') {
        // 如果选择的是预定义模型，直接更新apiConfig.model
        this.apiConfig.model = this.selectedModelOption;
      } else {
        // 如果选择的是自定义，将customModelName设为当前值（如果为空）
        if (!this.customModelName) {
          this.customModelName = this.apiConfig.model;
        }
      }
    },
    saveConfig() {
      // 如果选择的是自定义模型，使用customModelName
      if (this.selectedModelOption === 'custom') {
        this.apiConfig.model = this.customModelName;
      }
      
      this.$store.state.apiConfig = this.apiConfig;
      this.$store.saveState();
      this.showSuccess = true;
      setTimeout(() => this.showSuccess = false, 2000);
    }
  }
};
</script>

<style scoped>
.config-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 15px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
}
</style>
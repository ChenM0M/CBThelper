import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { inject } from '@vercel/analytics';
import { SpeedInsights } from '@vercel/speed-insights/vue';

// Import global styles
import '@/assets/css/main.css';
import '@/assets/css/components.css';
import '@/assets/css/responsive.css';

// Import app config
import appConfig from '../config/app.config.js';

import App from '../App.vue'
import GardenConfig from '../components/GardenConfig.vue'
import ThoughtRecord from '../components/ThoughtRecord.vue'
import CognitiveAnalysis from '../components/CognitiveAnalysis.vue'
import Dashboard from '../components/Dashboard.vue'
import MindGarden from '../components/MindGarden.vue'
import AboutPage from '../components/AboutPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MindGarden },
    { path: '/dashboard', component: Dashboard },
    { path: '/config', component: GardenConfig },
    { path: '/record', component: ThoughtRecord },
    { path: '/analysis', component: CognitiveAnalysis },
    { path: '/about', component: AboutPage }
  ]
})

const store = {
  state: {
    // 使用配置文件中的默认值
    apiConfig: {
      endpoint: appConfig.llm.apiUrl,
      apiKey: appConfig.llm.apiKey,
      model: appConfig.llm.modelName
    },
    thoughtRecords: [],
    selectedRecordIndex: undefined,
    currentSession: null, // 当前会话的情绪选择和数据
    appConfig: appConfig // 将配置暴露给组件使用
  },
  
  updateApiConfig(newConfig) {
    // 更新store中的配置
    this.state.apiConfig = { ...this.state.apiConfig, ...newConfig };
    
    // 更新localStorage
    localStorage.setItem('llmConfig', JSON.stringify(this.state.apiConfig));
    
    // 保存整个状态
    this.saveState();
  },
  
  saveState() {
    try {
      // 创建深度克隆以避免引用问题
      const stateToSave = JSON.parse(JSON.stringify(this.state));
      
      // 添加版本信息用于数据迁移
      stateToSave._version = '2.0';
      stateToSave._timestamp = Date.now();
      
      localStorage.setItem('cbtHelperState', JSON.stringify(stateToSave));
      console.log('[Store] 状态已保存', {
        recordCount: this.state.thoughtRecords.length,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('[Store] 保存状态失败:', e);
    }
  },
  
  restoreState() {
    const saved = localStorage.getItem('cbtHelperState');
    const savedLlmConfig = localStorage.getItem('llmConfig');
    
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        
        // 数据版本检查和迁移
        if (!parsedState._version || parsedState._version < '2.0') {
          console.log('[Store] 检测到旧版本数据，开始迁移...');
          this.migrateOldData(parsedState);
        }
        
        // 确保合并所有字段，防止旧版本数据缺少新增字段
        this.state = {
          ...this.state,
          ...parsedState,
          // 优先使用独立存储的API配置
          apiConfig: savedLlmConfig ? JSON.parse(savedLlmConfig) : { ...this.state.apiConfig, ...parsedState.apiConfig }
        };
        
        console.log('[Store] 状态已恢复', {
          recordCount: this.state.thoughtRecords.length,
          version: parsedState._version
        });
      } catch (e) {
        console.error('[Store] 恢复状态失败:', e);
      }
    }
  },
  
  // 数据迁移方法
  migrateOldData(oldState) {
    if (oldState.thoughtRecords && Array.isArray(oldState.thoughtRecords)) {
      oldState.thoughtRecords = oldState.thoughtRecords.map(record => {
        // 确保每个记录都有必要的字段
        return {
          id: record.id || Date.now() + Math.random(),
          timestamp: record.timestamp || Date.now(),
          emotions: record.emotions || [],
          situation: record.situation || '',
          automaticThought: record.automaticThought || '',
          intensity: record.intensity || 5,
          bodyLocation: record.bodyLocation || '',
          physicalSensations: record.physicalSensations || '',
          completed: record.completed || false,
          analysis: record.analysis || null,
          chatTopics: record.chatTopics || [],
          topicTitle: record.topicTitle || null,
          ...record
        };
      });
    }
    
    // 标记为新版本
    oldState._version = '2.0';
    oldState._migrated = true;
  },
  
  // 清除所有记录数据
  clearAll() {
    this.state.thoughtRecords = [];
    this.saveState();
  },
  
  // 导出数据
  exportData() {
    try {
      const dataToExport = {
        version: '2.0',
        exportTime: new Date().toISOString(),
        appName: 'CBT Helper',
        data: {
          thoughtRecords: this.state.thoughtRecords, // 包含了智慧伙伴的聊天记录（chatTopics）
          // 不导出API配置以保护隐私
          settings: {
            features: this.state.appConfig?.features || {}
          }
        }
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cbt-helper-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('[Store] 数据导出成功');
      return true;
    } catch (e) {
      console.error('[Store] 数据导出失败:', e);
      return false;
    }
  },
  
  // 导入数据
  importData(jsonData) {
    try {
      const importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // 验证数据格式
      if (!importedData.data || !importedData.data.thoughtRecords) {
        throw new Error('无效的数据格式');
      }
      
      // 备份当前数据
      const backup = JSON.parse(JSON.stringify(this.state));
      
      // 合并导入的记录（避免重复）
      const existingIds = new Set(this.state.thoughtRecords.map(r => r.id));
      const newRecords = importedData.data.thoughtRecords.filter(r => !existingIds.has(r.id));
      
      this.state.thoughtRecords = [...this.state.thoughtRecords, ...newRecords];
      
      // 保存状态
      this.saveState();
      
      console.log('[Store] 数据导入成功', {
        imported: newRecords.length,
        total: this.state.thoughtRecords.length
      });
      
      return {
        success: true,
        imported: newRecords.length,
        total: this.state.thoughtRecords.length
      };
    } catch (e) {
      console.error('[Store] 数据导入失败:', e);
      return {
        success: false,
        error: e.message
      };
    }
  }
}

store.restoreState()

inject();

const app = createApp(App)
app.use(router)
app.config.globalProperties.$store = store
app.component('SpeedInsights', SpeedInsights)

// 将store和app实例挂载到window对象以便服务访问
window.$store = store
window.vueApp = app

app.mount('#app')
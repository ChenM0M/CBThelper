import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { inject } from '@vercel/analytics';
import { SpeedInsights } from '@vercel/speed-insights/vue';

// Import global styles
import '../assets/css/main.css';

// Import app config
import appConfig from '../config/app.config.js';

import App from '../App.vue'
import ApiConfig from '../components/ApiConfig.vue'
import ThoughtRecord from '../components/ThoughtRecord.vue'
import CognitiveAnalysis from '../components/CognitiveAnalysis.vue'
import Dashboard from '../components/Dashboard.vue'
import MindGarden from '../components/MindGarden.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MindGarden },
    { path: '/dashboard', component: Dashboard },
    { path: '/config', component: ApiConfig },
    { path: '/record', component: ThoughtRecord },
    { path: '/analysis', component: CognitiveAnalysis }
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
  saveState() {
    localStorage.setItem('cbtHelperState', JSON.stringify(this.state))
  },
  restoreState() {
    const saved = localStorage.getItem('cbtHelperState')
    if (saved) {
      try {
        const parsedState = JSON.parse(saved)
        // 确保合并所有字段，防止旧版本数据缺少新增字段
        this.state = {
          ...this.state,
          ...parsedState,
          apiConfig: { ...this.state.apiConfig, ...parsedState.apiConfig }
        }
      } catch (e) {
        console.error('恢复状态失败:', e)
      }
    }
  },
  // 清除所有记录数据
  clearAll() {
    this.state.thoughtRecords = []
    this.saveState()
  }
}

store.restoreState()

inject();

const app = createApp(App)
app.use(router)
app.config.globalProperties.$store = store
app.component('SpeedInsights', SpeedInsights)
app.mount('#app')
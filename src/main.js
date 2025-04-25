import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

// Import global styles
import '../assets/css/main.css';

import App from '../App.vue'
import ApiConfig from '../components/ApiConfig.vue'
import ThoughtRecord from '../components/ThoughtRecord.vue'
import CognitiveAnalysis from '../components/CognitiveAnalysis.vue'
import Dashboard from '../components/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/config', component: ApiConfig },
    { path: '/record', component: ThoughtRecord },
    { path: '/analysis', component: CognitiveAnalysis }
  ]
})

const store = {
  state: {
    apiConfig: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-3.5-turbo'
    },
    thoughtRecords: [],
    selectedRecordIndex: undefined
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

const app = createApp(App)
app.use(router)
app.config.globalProperties.$store = store
app.mount('#app')
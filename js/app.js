import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import ApiConfig from '../components/ApiConfig.vue'
import ThoughtRecord from '../components/ThoughtRecord.vue'
import CognitiveAnalysis from '../components/CognitiveAnalysis.vue'
import Dashboard from '../components/Dashboard.vue'

Vue.use(VueRouter)

const router = new VueRouter({
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
    thoughtRecords: []
  },
  saveState() {
    localStorage.setItem('cbtHelperState', JSON.stringify(this.state))
  },
  restoreState() {
    const saved = localStorage.getItem('cbtHelperState')
    if (saved) {
      this.state = JSON.parse(saved)
    }
  }
}

store.restoreState()

new Vue({
  router,
  data: { store },
  render: h => h(App)
}).$mount('#app')
<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-brand">🧠 CBT助手</router-link>
      <div class="nav-links">
        <router-link to="/record" class="nav-link">📝 记录想法</router-link>
        <router-link to="/analysis" class="nav-link">🔍 认知分析</router-link>
        <router-link to="/config" class="nav-link">⚙️ API设置</router-link>
      </div>
    </nav>
    
    <div class="app-content">
      <router-view></router-view>
    </div>
    
    <footer class="app-footer">
      <p>心理健康支持系统-尘末ChenM0M © 2025 - 基于LLM的认知行为疗法助手</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import './assets/css/main.css';

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  background-image: linear-gradient(120deg, rgba(240,240,240,0.3) 0%, rgba(230,230,230,0.3) 100%);
}

.main-nav {
  background: linear-gradient(135deg, var(--primary-color), #2c5a89);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  transition: var(--transition-default);
}

.nav-brand:hover {
  transform: scale(1.05);
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  transition: var(--transition-default);
  padding: 0.5rem 0;
  position: relative;
  font-weight: 500;
}

.nav-link:hover {
  color: white;
}

.app-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  background: var(--background-dark);
  color: rgba(255,255,255,0.8);
  text-align: center;
  padding: 1.5rem;
  margin-top: auto;
  font-size: 0.9rem;
}

/* 适配移动设备 */
@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    padding: 1rem;
  }
  
  .nav-brand {
    margin-bottom: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-around;
    gap: 0.5rem;
  }
  
  .app-content {
    padding: 1rem;
  }
}
</style>
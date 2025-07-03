<template>
  <div id="app" class="app-container">
    <!-- 浮动导航 -->
    <div class="floating-nav" :class="{ 'nav-open': isNavOpen }">
      <button 
        class="nav-toggle" 
        @click="toggleNav"
        :class="{ 'active': isNavOpen }"
      >
        <span class="nav-icon">🌸</span>
      </button>
      <div class="nav-menu" v-show="isNavOpen">
        <router-link to="/" class="nav-item" @click="closeNav">
          <span class="nav-emoji">🌱</span>
          <span class="nav-text">心灵花园</span>
        </router-link>
        <router-link to="/dashboard" class="nav-item" @click="closeNav">
          <span class="nav-emoji">🌸</span>
          <span class="nav-text">成长足迹</span>
        </router-link>
        <router-link to="/analysis" class="nav-item" @click="closeNav">
          <span class="nav-emoji">🏡</span>
          <span class="nav-text">心灵温室</span>
        </router-link>
        <router-link to="/config" class="nav-item" @click="closeNav">
          <span class="nav-emoji">⚙️</span>
          <span class="nav-text">花园设置</span>
        </router-link>
      </div>
    </div>

    <!-- 主内容区域 - 全屏沉浸式 -->
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <SpeedInsights />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isNavOpen = ref(false)

function toggleNav() {
  isNavOpen.value = !isNavOpen.value
}

function closeNav() {
  isNavOpen.value = false
}

// 页面初始化
onMounted(() => {
  // Set document title
  document.title = '心灵花园 - 温暖的CBT自助工具'
  
  // Set favicon dynamically
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.type = 'image/png'
  link.rel = 'icon'
  link.href = '/logo.png'
  document.head.appendChild(link)
})
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 浮动导航样式 */
.floating-nav {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.nav-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-gradient);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

.nav-toggle.active {
  transform: rotate(180deg);
}

.nav-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.nav-menu {
  position: absolute;
  top: 70px;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  min-width: 200px;
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  text-decoration: none;
  color: var(--life-moss);
  border-radius: 15px;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.nav-item:last-child {
  margin-bottom: 0;
}

.nav-item:hover {
  background: var(--secondary-gradient);
  color: white;
  transform: translateX(5px);
}

.nav-item.router-link-active {
  background: var(--primary-gradient);
  color: white;
}

.nav-emoji {
  font-size: 1.2rem;
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
}

/* 主内容区域 - 全屏 */
.app-main {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* 页面过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-nav {
    top: 15px;
    right: 15px;
  }
  
  .nav-toggle {
    width: 50px;
    height: 50px;
  }
  
  .nav-icon {
    font-size: 1.3rem;
  }
  
  .nav-menu {
    top: 60px;
    min-width: 180px;
    padding: 0.8rem;
  }
  
  .nav-item {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .floating-nav {
    top: 10px;
    right: 10px;
  }
  
  .nav-toggle {
    width: 45px;
    height: 45px;
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
}
</style>
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
        <router-link to="/analysis?view=overview" class="nav-item" @click="closeNav">
          <span class="nav-emoji">🏡</span>
          <span class="nav-text">心灵温室</span>
        </router-link>
        <router-link to="/config" class="nav-item" @click="closeNav">
          <span class="nav-emoji">⚙️</span>
          <span class="nav-text">花园设置</span>
        </router-link>
        <router-link to="/about" class="nav-item" @click="closeNav">
          <span class="nav-emoji">ℹ️</span>
          <span class="nav-text">关于</span>
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
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 确保菜单右对齐 */
}

.nav-toggle {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--primary-gradient);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
  transition: all var(--transition-base);
}

.nav-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(132, 169, 140, 0.4);
}

.nav-toggle.active {
  transform: rotate(180deg);
  transform-origin: center center; /* 确保围绕花朵的几何中心旋转 */
}

.nav-icon {
  font-size: var(--font-size-xl);
  transition: transform var(--transition-base);
}

.nav-menu {
  position: absolute;
  top: 70px;
  right: 0;
  background: var(--bg-primary);
  backdrop-filter: blur(15px);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  width: auto; /* 自动宽度 */
  min-width: 140px; /* 增加最小宽度确保文字完整显示 */
  max-width: none; /* 移除最大宽度限制 */
  white-space: nowrap; /* 防止文字换行 */
  animation: slideInFromTop var(--transition-base);
  transform-origin: top right; /* 确保动画从右上角开始 */
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
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  text-decoration: none;
  color: var(--text-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  margin-bottom: var(--spacing-sm);
  min-width: fit-content; /* 确保宽度足够容纳内容 */
}

.nav-item:last-child {
  margin-bottom: 0;
}

.nav-item:hover {
  background: var(--secondary-gradient);
  color: var(--text-white);
  transform: translateX(5px);
}

.nav-item.router-link-active {
  background: var(--primary-gradient);
  color: var(--text-white);
}

.nav-emoji {
  font-size: var(--font-size-lg);
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
  overflow: visible; /* 允许文字完整显示 */
  text-overflow: clip; /* 移除省略号 */
  flex-shrink: 0; /* 防止文字被压缩 */
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
    min-width: 130px; /* 移动端适当调整最小宽度 */
    max-width: none; /* 确保没有最大宽度限制 */
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

/* 深色模式支持 - 完全优化版本 */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: linear-gradient(180deg, #1a2f3a 0%, #2d3e40 50%, #1f2e2e 100%);
  }
  
  .nav-menu {
    background: rgba(15, 20, 25, 0.98) !important; /* 更深的背景 */
    border: 2px solid rgba(255, 255, 255, 0.15) !important; /* 增强边框 */
    backdrop-filter: blur(25px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important; /* 增强阴影 */
    min-width: 140px; /* 确保深色模式下也有足够宽度 */
    max-width: none; /* 移除最大宽度限制 */
  }
  
  .nav-item {
    color: #ffffff !important; /* 强制优先级确保纯白 */
    font-weight: 600 !important; /* 增加字重 */
  }
  
  .nav-item:hover {
    background: linear-gradient(135deg, #84A98C, #52796F) !important;
    color: #ffffff !important;
    transform: translateX(5px); /* 添加位移效果 */
    box-shadow: 0 4px 15px rgba(132, 169, 140, 0.3);
  }
  
  .nav-item.router-link-active {
    background: linear-gradient(135deg, #84A98C, #52796F) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 15px rgba(132, 169, 140, 0.4);
  }
  
  .nav-text {
    color: inherit !important;
    font-weight: inherit !important;
  }
  
  .nav-emoji {
    filter: brightness(1.2); /* 增亮表情符号 */
  }
  
  /* 导航按钮优化 */
  .nav-toggle {
    background: linear-gradient(135deg, #84A98C, #52796F) !important;
    border: 2px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 6px 20px rgba(132, 169, 140, 0.3) !important;
    transform-origin: center center; /* 确保暗色模式下也有正确的旋转中心 */
  }
  
  .nav-toggle:hover {
    box-shadow: 0 8px 25px rgba(132, 169, 140, 0.4) !important;
    transform: scale(1.05);
    transform-origin: center center; /* 悬停时也保持正确的中心 */
  }
  
  .nav-toggle.active {
    background: linear-gradient(135deg, #52796F, #2d3e40) !important;
    box-shadow: 0 8px 25px rgba(82, 121, 111, 0.4) !important;
    transform: rotate(180deg);
    transform-origin: center center; /* 确保旋转围绕中心进行 */
  }
}
</style>
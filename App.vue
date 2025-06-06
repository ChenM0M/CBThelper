<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <img :src="logoPath" alt="CBThelper Logo" class="logo-image">
            <span class="logo-text">CBThelper</span>
          </router-link>
        </div>
        <!-- Basic nav for larger screens -->
        <nav class="nav-links-desktop">
          <router-link to="/" class="nav-link" active-class="router-link-active">首页</router-link>
          <router-link to="/record" class="nav-link" active-class="router-link-active">记录想法</router-link>
          <router-link to="/analysis" class="nav-link" active-class="router-link-active">认知分析</router-link>
          <router-link to="/config" class="nav-link" active-class="router-link-active">设置</router-link>
        </nav>
        <!-- Mobile nav toggle -->
        <button
          class="nav-toggle-mobile"
          :class="{ 'is-active': isMobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="Toggle navigation"
          aria-expanded="isMobileMenuOpen"
        >
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>
      <!-- Mobile nav menu - shown when isMobileMenuOpen is true -->
      <nav class="nav-links-mobile" :class="{ 'is-active': isMobileMenuOpen }">
        <router-link to="/" class="nav-link" active-class="router-link-active" @click="toggleMobileMenu">首页</router-link>
        <router-link to="/record" class="nav-link" active-class="router-link-active" @click="toggleMobileMenu">记录想法</router-link>
        <router-link to="/analysis" class="nav-link" active-class="router-link-active" @click="toggleMobileMenu">认知分析</router-link>
        <router-link to="/config" class="nav-link" active-class="router-link-active" @click="toggleMobileMenu">设置</router-link>
      </nav>
    </header>

    <main class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} CBT Helper. All rights reserved.</p>
      <p class="disclaimer">本工具仅供信息参考和自我辅助，不能替代专业的心理咨询或治疗。如有严重心理困扰，请寻求专业帮助。</p>
    </footer>
    
    <SpeedInsights />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import logoPath from '/assets/images/logo.png'

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Add direct DOM manipulation to set title and favicon
onMounted(() => {
  // Set document title
  document.title = 'CBThelper'
  
  // Set favicon dynamically
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.type = 'image/png'
  link.rel = 'icon'
  link.href = '/logo.png' // This should point to the logo.png in the public folder
  document.head.appendChild(link)
  
  console.log('Title and favicon set by App.vue onMounted hook')
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1rem; /* Base padding */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-image {
  height: 40px;
  width: auto;
  display: block;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.nav-links-desktop {
  display: none; /* Hidden on mobile by default */
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding-bottom: 5px;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--secondary-color);
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--secondary-color);
  transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* Mobile Navigation Styles */
.nav-toggle-mobile {
  display: block; /* Show toggle on mobile */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1010; /* Ensure toggle is above mobile menu */
  position: relative; /* Needed for z-index */
}

.nav-toggle-mobile .icon-bar {
  display: block;
  width: 22px;
  height: 2px;
  background-color: white;
  margin: 4px 0;
  transition: var(--transition-default);
}

/* Animate hamburger icon */
.nav-toggle-mobile.is-active .icon-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.nav-toggle-mobile.is-active .icon-bar:nth-child(2) {
  opacity: 0;
}
.nav-toggle-mobile.is-active .icon-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.nav-links-mobile {
  display: none; /* Hidden by default */
  flex-direction: column;
  background-color: var(--primary-color);
  padding: 1rem 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-10px); /* Start slightly above */
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: none; /* Prevent interaction when hidden */
}

.nav-links-mobile.is-active {
  display: flex; /* Show when active */
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto; /* Allow interaction when shown */
}

.nav-links-mobile .nav-link {
  padding: 0.8rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.nav-links-mobile .nav-link:last-child {
  border-bottom: none;
}

.app-content {
  flex-grow: 1; /* Takes up remaining vertical space */
  padding: 1rem; /* Base padding for mobile */
  max-width: 1200px; /* Limit content width */
  width: 100%;
  margin: 0 auto; /* Center content area */
  box-sizing: border-box;
}

.app-footer {
  background-color: var(--background-dark);
  color: var(--background-light);
  text-align: center;
  padding: 0.8rem 1rem;
  font-size: 0.85rem;
  margin-top: auto; /* Pushes footer to bottom */
}

.disclaimer {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  white-space: normal;
  padding: 0 1rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Medium screens and up (tablets, desktops) */
@media (min-width: 768px) {
  .app-header {
    padding: 1rem 1.5rem;
  }

  .nav-links-desktop {
    display: flex; /* Show desktop nav */
  }

  .nav-toggle-mobile,
  .nav-links-mobile {
    display: none; /* Hide mobile nav elements */
  }

  .app-content {
    padding: 1.5rem; /* Increase padding for larger screens */
  }

  .app-footer {
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
  }

  .disclaimer {
    font-size: 0.8rem;
  }

  .logo-image {
    height: 45px;
  }
}
</style>
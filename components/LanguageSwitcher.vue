<template>
  <div class="language-switcher">
    <div class="current-language" @click="toggleDropdown" :class="{ 'active': showDropdown }">
      <span class="language-flag">{{ currentLanguage.flag }}</span>
      <span class="language-name">{{ currentLanguage.name }}</span>
      <span class="dropdown-icon">{{ showDropdown ? '▲' : '▼' }}</span>
    </div>
    
    <transition name="dropdown">
      <div v-if="showDropdown" class="language-dropdown">
        <div 
          v-for="language in supportedLanguages" 
          :key="language.code"
          @click="selectLanguage(language.code)"
          class="language-option"
          :class="{ 'selected': language.code === currentLocale }"
        >
          <span class="language-flag">{{ language.flag }}</span>
          <span class="language-name">{{ language.name }}</span>
          <span v-if="language.code === currentLocale" class="check-icon">✓</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale, getSupportedLocales } from '@/i18n/index.js'

const { locale } = useI18n()
const showDropdown = ref(false)
const supportedLanguages = getSupportedLocales()

const currentLocale = computed(() => getCurrentLocale())

const currentLanguage = computed(() => {
  return supportedLanguages.find(lang => lang.code === currentLocale.value) || supportedLanguages[0]
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectLanguage = (languageCode) => {
  if (languageCode !== currentLocale.value) {
    setLocale(languageCode)
    // 更新页面标题
    updatePageTitle()
  }
  showDropdown.value = false
}

const updatePageTitle = () => {
  const titles = {
    'zh-CN': '心灵花园 - 温暖的CBT自助工具',
    'zh-TW': '心靈花園 - 溫暖的CBT自助工具',
    'en': 'Mind Garden - A warm CBT self-help tool'
  }
  document.title = titles[currentLocale.value] || titles['zh-CN']
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.language-switcher')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  updatePageTitle()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.current-language {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(132, 169, 140, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 120px;
  justify-content: space-between;
}

.current-language:hover {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(132, 169, 140, 0.2);
}

.current-language.active {
  border-color: var(--primary-color);
  background: rgba(132, 169, 140, 0.1);
}

.language-flag {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.language-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.current-language.active .dropdown-icon {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid rgba(132, 169, 140, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(132, 169, 140, 0.1);
}

.language-option:last-child {
  border-bottom: none;
}

.language-option:hover {
  background: rgba(132, 169, 140, 0.1);
}

.language-option.selected {
  background: rgba(132, 169, 140, 0.15);
  font-weight: 600;
}

.language-option .language-name {
  flex: 1;
}

.check-icon {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 0.9rem;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .current-language {
    min-width: 100px;
    padding: 0.6rem 0.8rem;
  }
  
  .language-name {
    font-size: 0.85rem;
  }
  
  .language-dropdown {
    left: auto;
    right: 0;
    min-width: 140px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .current-language {
    background: rgba(30, 35, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }
  
  .current-language:hover {
    background: rgba(40, 45, 50, 0.95);
    border-color: #84A98C;
  }
  
  .current-language.active {
    background: rgba(132, 169, 140, 0.2);
    border-color: #84A98C;
  }
  
  .language-name {
    color: #ffffff;
  }
  
  .dropdown-icon {
    color: #b0b0b0;
  }
  
  .language-dropdown {
    background: rgba(20, 25, 30, 0.98);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .language-option {
    border-bottom-color: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
  }
  
  .language-option:hover {
    background: rgba(132, 169, 140, 0.2);
  }
  
  .language-option.selected {
    background: rgba(132, 169, 140, 0.3);
    color: #ffffff;
  }
  
  .check-icon {
    color: #84A98C;
  }
}
</style>
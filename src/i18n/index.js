import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'

// 获取浏览器语言
function getBrowserLocale() {
  const language = navigator.language || navigator.userLanguage
  
  // 简化语言代码映射
  if (language.startsWith('zh')) {
    if (language.includes('TW') || language.includes('HK') || language.includes('MO')) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }
  
  return 'en'
}

// 从localStorage获取用户设置的语言，如果没有则使用浏览器语言
function getDefaultLocale() {
  const saved = localStorage.getItem('cbt-helper-locale')
  return saved || getBrowserLocale()
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN', // 默认回退到简体中文
  globalInjection: true, // 允许在模板中直接使用$t
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en': en
  }
})

// 语言切换函数
export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('cbt-helper-locale', locale)
  document.documentElement.lang = locale
}

// 获取当前语言
export function getCurrentLocale() {
  return i18n.global.locale.value
}

// 获取支持的语言列表
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]
}

export default i18n
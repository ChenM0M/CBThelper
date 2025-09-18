# CBT Helper 国际化 (i18n) 系统

## 概述

本项目已集成完整的国际化支持，使用 Vue I18n 9.x 版本，支持简体中文、繁体中文和英文三种语言。

## 支持的语言

- **简体中文** (`zh-CN`) - 默认语言
- **繁体中文** (`zh-TW`)
- **英文** (`en`)

## 技术架构

### 核心文件

- `src/i18n/index.js` - i18n 配置和初始化
- `src/i18n/locales/zh-CN.json` - 简体中文语言包
- `src/i18n/locales/zh-TW.json` - 繁体中文语言包
- `src/i18n/locales/en.json` - 英文语言包
- `components/LanguageSwitcher.vue` - 语言切换组件

### 配置特性

1. **自动语言检测**：根据浏览器语言自动选择合适的语言
2. **本地存储**：用户选择的语言会保存到 localStorage
3. **回退机制**：如果选定语言缺少某个翻译，会回退到简体中文
4. **Composition API**：使用现代 Vue 3 Composition API 模式

## 使用方法

### 在模板中使用

```vue
<template>
  <!-- 基本翻译 -->
  <h1>{{ $t('mindGarden.title') }}</h1>
  
  <!-- 带参数的翻译 -->
  <p>{{ $t('dashboard.recentRecord', { time: formatTime() }) }}</p>
  
  <!-- 复数形式 -->
  <span>{{ $t('dashboard.stats.count', { count: records.length }) }}</span>
</template>
```

### 在脚本中使用

```javascript
// Composition API
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    
    const message = t('common.loading')
    return { message }
  }
}

// Options API
export default {
  methods: {
    getMessage() {
      return this.$t('common.loading')
    }
  }
}
```

### 语言切换

使用 `LanguageSwitcher` 组件或编程方式切换：

```javascript
import { setLocale } from '@/i18n/index.js'

// 切换到英文
setLocale('en')
```

## 添加新的翻译

### 1. 添加新的键值对

在所有语言文件中添加相同的键：

```json
// zh-CN.json
{
  "newFeature": {
    "title": "新功能",
    "description": "这是一个新功能的描述"
  }
}

// zh-TW.json
{
  "newFeature": {
    "title": "新功能",
    "description": "這是一個新功能的描述"
  }
}

// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a description of the new feature"
  }
}
```

### 2. 在组件中使用

```vue
<template>
  <div>
    <h2>{{ $t('newFeature.title') }}</h2>
    <p>{{ $t('newFeature.description') }}</p>
  </div>
</template>
```

## 命名约定

### 键名结构

采用分层结构，使用小驼峰命名：

```
common.loading
navigation.mindGarden
mindGarden.moodCheck.title
dashboard.stats.seeds
```

### 文件组织

- `common` - 通用词汇（保存、取消、加载等）
- `navigation` - 导航菜单项
- `mindGarden` - 心灵花园页面
- `thoughtRecord` - 思维记录页面
- `dashboard` - 仪表板页面
- `emotions` - 情绪相关
- `config` - 设置页面
- `about` - 关于页面

## 参数化翻译

### 变量插值

```json
{
  "welcome": "欢迎 {name}！",
  "count": "共有 {count} 条记录"
}
```

```vue
<template>
  <p>{{ $t('welcome', { name: userName }) }}</p>
  <p>{{ $t('count', { count: records.length }) }}</p>
</template>
```

### 复数处理

```json
{
  "items": "没有项目 | 1 个项目 | {count} 个项目"
}
```

## 性能优化

### 懒加载语言包

当前实现已支持按需加载，语言包只有在用户切换时才会加载。

### 缓存策略

- 用户选择的语言存储在 localStorage
- 浏览器会缓存语言资源文件
- 开发环境下支持热重载

## 测试

### 语言切换测试

1. 打开应用
2. 点击右上角的语言切换器
3. 选择不同语言
4. 验证页面内容是否正确切换
5. 刷新页面，确认语言设置持久化

### 浏览器语言检测测试

1. 清除 localStorage 中的语言设置
2. 修改浏览器语言设置
3. 重新加载页面
4. 验证应用是否自动选择合适的语言

## 故障排除

### 常见问题

1. **翻译键不存在**：检查所有语言文件是否包含相同的键
2. **语言切换不生效**：确认 localStorage 权限和 setLocale 调用
3. **参数未替换**：检查参数名是否与模板中的变量名匹配

### 调试技巧

```javascript
// 获取当前语言
console.log(getCurrentLocale())

// 获取当前所有消息
console.log(i18n.global.messages.value)

// 检查特定键是否存在
console.log(i18n.global.te('path.to.key'))
```

## 扩展语言支持

要添加新语言（如日文）：

1. 创建 `src/i18n/locales/ja.json`
2. 在 `src/i18n/index.js` 中导入并添加到 messages
3. 在 `getSupportedLocales()` 函数中添加语言选项
4. 更新 `getBrowserLocale()` 函数的检测逻辑
5. 在 `LanguageSwitcher.vue` 中更新页面标题映射

## 最佳实践

1. **保持键名一致**：确保所有语言文件的键结构相同
2. **使用描述性键名**：键名应该反映内容的含义而非显示位置
3. **避免过长的文本**：将长文本分解为较小的片段
4. **考虑文化差异**：不同语言可能需要不同的表达方式
5. **定期审查**：确保翻译的准确性和一致性

## 未来改进

- [ ] 添加更多语言支持（日文、韩文等）
- [ ] 实现翻译管理界面
- [ ] 集成专业翻译服务
- [ ] 添加 RTL 语言支持
- [ ] 实现动态语言包加载
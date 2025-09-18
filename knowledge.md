# CBT Helper 项目知识

## 国际化 (i18n) 系统

### 已实现的功能

本项目已成功实现完整的国际化支持，技术栈：

- **Vue I18n 9.x** - 使用Composition API模式
- **支持语言**：简体中文 (zh-CN)、繁体中文 (zh-TW)、英文 (en)
- **自动语言检测**：根据浏览器语言自动选择
- **持久化存储**：用户选择保存在localStorage
- **语言切换器**：集成在导航菜单中

### 核心文件结构

```
src/i18n/
├── index.js                # i18n配置和工具函数
└── locales/
    ├── zh-CN.json          # 简体中文语言包
    ├── zh-TW.json          # 繁体中文语言包
    └── en.json             # 英文语言包

components/
└── LanguageSwitcher.vue    # 语言切换组件
```

### 最佳实践

1. **使用描述性键名**：如 `mindGarden.moodCheck.title` 而非 `page1.section2.text1`
2. **保持键结构一致**：所有语言文件必须有相同的键结构
3. **情绪数据结构**：使用 `key` 字段引用翻译，而非硬编码名称
4. **参数化翻译**：使用 `{variable}` 语法传递动态内容

### 组件国际化模式

**模板中使用：**
```vue
<h1>{{ $t('mindGarden.title') }}</h1>
<p>{{ $t('dashboard.recentRecord', { time: formatTime() }) }}</p>
```

**脚本中使用：**
```javascript
// 方法中
getGrowthStage(record) {
  return this.$t('dashboard.records.stageCompleted')
}

// Composition API
const { t } = useI18n()
const message = t('common.loading')
```

### 情绪数据标准化

情绪选项统一使用以下结构：
```javascript
{
  key: 'pleasant',      // 用于翻译键 emotions.pleasant
  emoji: '😊',
  color: '#FFC857',
  gradient: 'linear-gradient(...)'
}
```

避免硬编码名称，确保多语言一致性。

### 语言切换实现

- 导航菜单集成语言切换器
- 支持键盘和鼠标操作
- 自动更新页面标题
- 点击外部区域关闭下拉菜单
- 响应式设计和深色模式支持

### 性能考虑

- 语言包在应用初始化时全部加载（项目规模较小）
- 可扩展为懒加载模式（大型应用）
- 使用localStorage避免重复设置
- Composition API提供更好的tree-shaking

## 技术债务和改进建议

1. **图片优化**：当前图片文件较大（1-1.7MB），建议压缩
2. **懒加载语言包**：随着翻译内容增加，考虑按需加载
3. **翻译管理**：考虑集成翻译管理平台
4. **RTL支持**：未来可能需要支持阿拉伯语等RTL语言

## 开发规范

### 添加新翻译
1. 在所有三个语言文件中添加相同键
2. 使用描述性键名反映内容含义
3. 保持键结构的层次化组织
4. 更新组件使用 `$t()` 函数

### 测试清单
- [ ] 语言切换功能正常
- [ ] 刷新页面保持语言选择
- [ ] 所有可见文本都已翻译
- [ ] 参数化翻译正确显示
- [ ] 响应式设计在各语言下正常

### 注意事项

- 确保App.vue中导入路径正确：`./components/LanguageSwitcher.vue`
- MindGarden和ThoughtRecord组件的情绪数据结构需保持一致
- 翻译键缺失时会显示键名，便于调试
- 深色模式下语言切换器样式需特别处理
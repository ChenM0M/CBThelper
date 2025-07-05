<template>
  <div class="about-page">
    <!-- 背景层 -->
    <div class="about-background">
      <div class="sky-gradient"></div>
      <div class="floating-petals">
        <div v-for="i in 12" :key="i" class="petal" :style="getPetalStyle(i)"></div>
      </div>
    </div>

    <!-- 返回按钮 -->
    <button @click="goBack" class="floating-back-btn" aria-label="返回主页">
      <span>🏡</span>
    </button>

    <!-- 主内容区 -->
    <main class="about-content">
      <!-- 页面标题 -->
      <header class="page-header">
        <h1 class="page-title">
          <span class="title-icon">ℹ️</span>
          关于心灵花园
        </h1>
        <p class="page-subtitle">一个温暖的CBT自助心理健康工具</p>
      </header>

      <!-- 项目信息卡片 -->
      <section class="info-card project-info">
        <h2 class="section-title">
          <span class="title-icon">🌟</span>
          项目简介
        </h2>
        <div class="info-content">
          <p class="project-description">
            CBT Helper（心灵花园）是一个基于认知行为疗法(CBT)原理的Vue.js自助心理健康工具。
            通过温暖、个性化的界面，结合大语言模型(LLM)的智能分析能力，
            帮助用户识别、挑战并重塑不健康的思维模式。
          </p>
          
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🧠</div>
              <div class="feature-text">智能思维分析</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💭</div>
              <div class="feature-text">个性化指导</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-text">情绪追踪</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">隐私保护</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 版本信息 -->
      <section class="info-card version-info">
        <h2 class="section-title">
          <span class="title-icon">📱</span>
          版本信息
        </h2>
        <div class="info-content">
          <div class="version-details">
            <div class="version-item">
              <span class="version-label">当前版本:</span>
              <span class="version-value">v2.0.0</span>
            </div>
            <div class="version-item">
              <span class="version-label">技术栈:</span>
              <span class="version-value">Vue.js 3.x + JavaScript</span>
            </div>
            <div class="version-item">
              <span class="version-label">许可证:</span>
              <span class="version-value">Apache License 2.0</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系信息 -->
      <section class="info-card contact-info">
        <h2 class="section-title">
          <span class="title-icon">📞</span>
          联系方式
        </h2>
        <div class="info-content">
          <div class="contact-grid">
            <a href="https://github.com/ChenM0M" target="_blank" class="contact-item">
              <div class="contact-icon">🐙</div>
              <div class="contact-text">
                <div class="contact-label">开发者主页</div>
                <div class="contact-value">github.com/ChenM0M</div>
              </div>
            </a>
            
            <a href="https://github.com/ChenM0M/CBThelper" target="_blank" class="contact-item">
              <div class="contact-icon">📦</div>
              <div class="contact-text">
                <div class="contact-label">项目仓库</div>
                <div class="contact-value">github.com/ChenM0M/CBThelper</div>
              </div>
            </a>
            
            <a href="mailto:2895521977@qq.com" class="contact-item">
              <div class="contact-icon">📧</div>
              <div class="contact-text">
                <div class="contact-label">联系邮箱</div>
                <div class="contact-value">2895521977@qq.com</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- 免责声明 -->
      <section class="info-card disclaimer">
        <h2 class="section-title">
          <span class="title-icon">⚠️</span>
          免责声明
        </h2>
        <div class="info-content">
          <div class="disclaimer-content">
            <p class="disclaimer-text">
              <strong>重要提醒：</strong>本应用仅作为心理健康自助工具使用，不能替代专业的心理咨询或医疗治疗。
            </p>
            
            <ul class="disclaimer-list">
              <li>本工具基于认知行为疗法(CBT)原理设计，旨在帮助用户进行自我反思和情绪管理</li>
              <li>如您正在经历严重的心理健康问题，请及时寻求专业心理咨询师或医生的帮助</li>
              <li>用户使用本应用时产生的任何结果和后果，开发者不承担任何责任</li>
              <li>所有用户数据仅存储在本地浏览器中，开发者无法访问您的个人信息</li>
              <li>本应用完全免费开源，不收集任何个人隐私数据</li>
            </ul>
            
            <p class="emergency-notice">
              <span class="emergency-icon">🚨</span>
              <strong>紧急情况：</strong>如果您有自伤或自杀倾向，请立即拨打当地心理危机干预热线或前往最近的医疗机构寻求帮助。
            </p>
          </div>
        </div>
      </section>
      
      <!-- 致谢 -->
      <section class="info-card acknowledgments">
        <h2 class="section-title">
          <span class="title-icon">🙏</span>
          致谢
        </h2>
        <div class="info-content">
          <p class="acknowledgment-text">
            感谢Vue.js团队提供优秀的前端框架，感谢CBT研究者们为心理健康领域做出的贡献，感谢ClaudeCode提供的技术支持，
            感谢所有测试用户提供的宝贵反馈。让我们一起为心理健康贡献力量，创造一个更温暖的世界！
          </p>
        </div>
      </section>

    </main>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  
  methods: {
    goBack() {
      this.$router.push('/')
    },

    getPetalStyle(index) {
      const randomDelay = Math.random() * 8
      const randomDuration = 8 + Math.random() * 6
      const randomLeft = Math.random() * 100
      const randomTop = Math.random() * 100
      
      return {
        left: `${randomLeft}%`,
        top: `${randomTop}%`,
        animationDelay: `${randomDelay}s`,
        animationDuration: `${randomDuration}s`
      }
    }
  }
}
</script>

<style scoped>
/* 基础布局 */
.about-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.about-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.sky-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #E8F4F8 0%, #B8D4E3 50%, #A4C2D4 100%);
  opacity: 0.8;
}

.floating-petals {
  position: absolute;
  width: 100%;
  height: 100%;
}

.petal {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #FF9B85, #FFD1DC);
  border-radius: 50% 10px 50% 10px;
  animation: float-petals linear infinite;
  opacity: 0.6;
}

@keyframes float-petals {
  0% {
    transform: translateY(-10px) rotateZ(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) rotateZ(360deg);
    opacity: 0;
  }
}

/* 返回按钮 */
.floating-back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #84A98C 0%, #52796F 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(84, 169, 140, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-back-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(84, 169, 140, 0.4);
}

/* 主内容区 */
.about-content {
  padding: 4rem 2rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2D3E40;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 600;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #52796F;
  margin: 0;
  font-weight: 500;
}

/* 信息卡片 */
.info-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(132, 169, 140, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(132, 169, 140, 0.2);
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(132, 169, 140, 0.15);
}

.section-title {
  font-size: 1.5rem;
  color: #2D3E40;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
}

.info-content {
  color: #52796F;
  line-height: 1.7;
}

/* 项目描述 */
.project-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.8;
}

/* 特性网格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(132, 169, 140, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(132, 169, 140, 0.2);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-weight: 500;
  color: #2D3E40;
}

/* 版本信息 */
.version-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(132, 169, 140, 0.05);
  border-radius: 8px;
}

.version-label {
  font-weight: 500;
  color: #2D3E40;
}

.version-value {
  font-weight: 600;
  color: #52796F;
}

/* 联系信息 */
.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  background: rgba(132, 169, 140, 0.05);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 1px solid rgba(132, 169, 140, 0.1);
}

.contact-item:hover {
  background: rgba(132, 169, 140, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(132, 169, 140, 0.2);
}

.contact-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.contact-text {
  flex: 1;
}

.contact-label {
  font-weight: 600;
  color: #2D3E40;
  margin-bottom: 0.2rem;
}

.contact-value {
  color: #52796F;
  font-size: 0.9rem;
}

/* 免责声明 */
.disclaimer {
  border-left: 4px solid #FF9B85;
}

.disclaimer-content {
  font-size: 0.95rem;
}

.disclaimer-text {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.disclaimer-list {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
}

.disclaimer-list li {
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

.emergency-notice {
  background: rgba(255, 155, 133, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 155, 133, 0.3);
  margin-top: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.emergency-icon {
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

/* 致谢 */
.acknowledgment-text {
  font-style: italic;
  font-size: 1.05rem;
  text-align: center;
  color: #2D3E40;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-content {
    padding: 3rem 1rem 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-card {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .version-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .floating-back-btn {
    width: 45px;
    height: 45px;
    top: 15px;
    left: 15px;
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .about-content {
    padding: 2rem 0.8rem 1rem;
  }
  
  .floating-back-btn {
    width: 40px;
    height: 40px;
    top: 10px;
    left: 10px;
    font-size: 1.2rem;
  }
}
</style>
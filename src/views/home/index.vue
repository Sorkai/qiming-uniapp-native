<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo" @click="router.push('/home')">
          <img :src="logo" alt="Logo" class="app-logo-img" />
          <div class="logo-text-group">
            <span class="logo-text">云创优学</span>
          </div>
        </div>
        <nav class="nav-links">
          <a href="#features" class="nav-link">平台特色</a>
          <a href="#ai-power" class="nav-link">AI 赋能</a>
          <a href="#services" class="nav-link">核心服务</a>
          <a href="#tech" class="nav-link">技术实力</a>
        </nav>
        <div class="header-right">
          <template v-if="userInfo">
            <el-dropdown trigger="hover" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar" />
                <span class="nickname">{{
                  userInfo.nickname || userInfo.username
                }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="hasAdminAccess" command="space">
                    <el-icon><User /></el-icon>
                    进入空间
                  </el-dropdown-item>
                  <el-dropdown-item command="account">
                    <el-icon><Setting /></el-icon>
                    账号管理
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <el-button
            v-else
            type="primary"
            class="login-btn"
            @click="handleEntry"
            >登录</el-button
          >
        </div>
      </div>
    </div>

    <!-- 英雄区域 - 星空背景 -->
    <div class="banner">
      <el-carousel
        height="100vh"
        :interval="5000"
        :duration="1000"
        :indicator-position="'none'"
        :arrow="'never'"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div
            class="carousel-content"
            :style="{ backgroundImage: `url(${item.background})` }"
          >
            <!-- 背景效果移入内容层，确保层级正确且不干扰交互 -->
            <div class="starfield">
              <div v-for="i in 40" :key="'star-'+i" class="star" :style="getStarStyle(i)"></div>
              <div v-for="i in 3" :key="'shooting-'+i" class="shooting-star" :style="getShootingStarStyle(i)"></div>
            </div>
            <div class="hero-particles">
              <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>
            </div>

            <div class="carousel-text">
              <div class="hero-badge">AI 深度融合的智慧教育平台</div>
              <h2 class="main-title">{{ item.title }}</h2>
              <p class="sub-title">{{ item.subtitle }}</p>
              <p class="hero-desc">{{ item.description }}</p>
              <div class="hero-buttons">
                <el-button 
                  type="primary" 
                  size="large" 
                  class="hero-btn primary" 
                  @click="handleEntry"
                >
                  立即体验
                </el-button>
                <el-button 
                  size="large" 
                  class="hero-btn secondary" 
                  @click="scrollToSection('features')"
                >
                  了解更多
                </el-button>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 下滑提示 -->
      <div class="scroll-hint">
        <span>下滑查看更多</span>
        <div class="scroll-arrow">
          <el-icon class="animated"><ArrowDown /></el-icon>
        </div>
      </div>
    </div>

    <!-- 过渡波浪 -->
    <div class="wave-transition">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z" fill="#0a0a1a"></path>
      </svg>
    </div>

    <!-- 数据统计区域 -->
    <div id="stats" class="stats-section">
      <div class="stats-container">
        <div v-for="(stat, index) in statsData" :key="index" class="stat-card">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- AI 赋能区域 -->
    <div id="ai-power" class="ai-power-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">AI POWERED</span>
          <h2 class="section-title">AI 深度赋能教育</h2>
          <p class="section-desc">人工智能与教育的完美融合，开启智慧学习新时代</p>
        </div>
        <div class="ai-features-grid">
          <div v-for="(item, index) in aiFeatures" :key="index" class="ai-feature-card">
            <div class="ai-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="ai-glow"></div>
          </div>
        </div>
      </div>
      <!-- 装饰性元素 -->
      <div class="ai-decoration">
        <div class="orbit orbit-1"></div>
        <div class="orbit orbit-2"></div>
        <div class="orbit orbit-3"></div>
      </div>
    </div>

    <!-- 过渡图片区域 -->
    <div class="transition-image-section">
      <div class="transition-content">
        <div class="transition-text">
          <h2>让每一位学习者<br/>都能发光发亮</h2>
          <p>基于 AI 技术的个性化学习路径规划，因材施教，让知识触手可及</p>
        </div>
        <div class="transition-visual">
          <div class="floating-cards">
            <div class="float-card card-1">📚</div>
            <div class="float-card card-2">🎯</div>
            <div class="float-card card-3">💡</div>
            <div class="float-card card-4">🚀</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 平台介绍部分 -->
    <div id="features" class="platform-intro">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">FEATURES</span>
          <h2 class="section-title">平台特色</h2>
          <p class="section-desc">为教育者和学习者提供全方位的智能化解决方案</p>
        </div>
        <div class="feature-list">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-item"
          >
            <a href="javascript:;">
              <div class="feature-image">
                <img
                  :src="feature.image"
                  :alt="feature.title"
                  draggable="false"
                />
              </div>
              <div class="feature-overlay">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 过渡区域2 -->
    <div class="transition-section-2">
      <div class="parallax-bg"></div>
      <div class="transition-overlay">
        <div class="big-quote">
          <span class="quote-mark">"</span>
          <p>教育的本质是点燃火焰，而非填满容器</p>
          <span class="quote-author">—— 苏格拉底</span>
        </div>
      </div>
    </div>

    <!-- 核心服务区域 -->
    <div id="services" class="services-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">SERVICES</span>
          <h2 class="section-title">核心服务</h2>
          <p class="section-desc">专业团队为教育场景提供全方位的智能化服务支持</p>
        </div>
        <div class="services-grid">
          <div v-for="(service, index) in services" :key="index" class="service-card">
            <div class="service-icon">{{ service.icon }}</div>
            <h3 class="service-title">{{ service.title }}</h3>
            <p class="service-desc">{{ service.description }}</p>
            <ul class="service-features">
              <li v-for="(item, idx) in service.features" :key="idx">
                <el-icon><Check /></el-icon>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术架构区域 -->
    <div id="tech" class="tech-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">TECHNOLOGY</span>
          <h2 class="section-title">技术实力</h2>
          <p class="section-desc">AI 算法与前沿技术的深度融合，打造稳定高效的智慧教育平台</p>
        </div>
        <div class="tech-grid">
          <div v-for="(tech, index) in techStack" :key="index" class="tech-card">
            <div class="tech-icon">{{ tech.icon }}</div>
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-version">{{ tech.version }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户评价区域 -->
    <div class="testimonials-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">TESTIMONIALS</span>
          <h2 class="section-title">用户心声</h2>
          <p class="section-desc">听听教师和学生们怎么说</p>
        </div>
        <div class="testimonials-grid">
          <div v-for="(item, index) in testimonials" :key="index" class="testimonial-card">
            <div class="quote-icon">"</div>
            <p class="testimonial-content">{{ item.content }}</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ item.avatar }}</div>
              <div class="author-info">
                <div class="author-name">{{ item.name }}</div>
                <div class="author-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA 区域 -->
    <div class="cta-section">
      <div class="cta-stars">
        <div v-for="i in 50" :key="'cta-star-'+i" class="cta-star" :style="getCtaStarStyle(i)"></div>
      </div>
      <div class="cta-content">
        <h2>开启智慧学习之旅</h2>
        <p>立即加入，体验 AI 驱动的全新教育模式</p>
        <div class="cta-buttons">
          <el-button 
            type="primary" 
            size="large" 
            @click="handleEntry"
          >
            立即试用
          </el-button>
          <el-button 
            size="large" 
            plain
          >
            联系我们
          </el-button>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <LoginDialog 
      v-model:visible="showLoginDialog" 
      @login-success="handleLoginSuccess"
    />

    <!-- 底部信息 -->
    <footer class="footer-section">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img :src="logo" alt="Logo" class="footer-logo" />
            <p class="footer-desc">
              云创优学是基于人工智能深度融合的智慧教育平台，致力于为教育者和学习者提供
              个性化、智能化的教学与学习体验，让每个人都能发现学习的乐趣。
            </p>
            <div class="social-links">
              <a href="https://github.com/pure-admin" target="_blank" class="social-link">
                <span>GitHub</span>
              </a>
              <a href="https://pure-admin.cn" target="_blank" class="social-link">
                <span>官网</span>
              </a>
            </div>
          </div>
          <div class="footer-links-group">
            <h4>产品</h4>
            <a href="#">功能介绍</a>
            <a href="#">价格方案</a>
            <a href="#">更新日志</a>
            <a href="#">开发路线</a>
          </div>
          <div class="footer-links-group">
            <h4>资源</h4>
            <a href="https://pure-admin.cn" target="_blank">官方文档</a>
            <a href="#">视频教程</a>
            <a href="#">常见问题</a>
            <a href="#">API 参考</a>
          </div>
          <div class="footer-links-group">
            <h4>关于</h4>
            <a href="#">关于我们</a>
            <a href="#">加入我们</a>
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="company-info">吉林省云创迅捷软件开发有限公司</p>
          <p><a href="https://www.intelledu.cn" target="_blank" class="website-link">www.intelledu.cn</a></p>
          <p>© {{ new Date().getFullYear() }} 云创优学. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Monitor,
  Connection,
  Operation,
  ArrowDown,
  User,
  SwitchButton,
  Setting,
  Check
} from "@element-plus/icons-vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken, getToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";

// 导入图片资源
import banner1 from "@/assets/home/banner1.jpg";
import banner2 from "@/assets/home/banner2.jpg";
import card1 from "@/assets/home/card1.jpg";
import card2 from "@/assets/home/card2.jpg";
import card3 from "@/assets/home/card3.jpg";
import logo from "@/assets/logo.png";
import LoginDialog from "@/components/LoginDialog.vue";

const router = useRouter();
const isScrolled = ref(false);
const userInfo = ref<DataInfo<number> | null>(storageLocal().getItem(userKey));

// 登录弹窗显示状态
const showLoginDialog = ref(false);

/**
 * 立即体验/立即试用/登录处理
 */
const handleEntry = () => {
  // 获取最新的登录状态和用户信息
  const token = getToken();
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  
  // 判断是否已登录：只要 token 对象存在且包含识别信息，或者本地存储有用户信息，就视为已登录
  // 注意：某些情况下 LocalStorage 中的 info 对象可能不包含 accessToken
  const isLogged = !!(token?.accessToken || token?.refreshToken || info);

  if (isLogged) {
    // 获取角色信息：优先从 info 中获取，因为 Cookie 里的 token 可能不含此字段
    const roleType = info?.roleType ?? (token as any)?.roleType ?? userInfo.value?.roleType;
    
    // 角色类型判断：2:教师 3:管理员，跳转到管理后台；其他跳转到个人中心
    if (roleType === 2 || roleType === 3) {
      router.push("/welcome/index");
    } else {
      router.push("/account");
    }
  } else {
    // 未登录则显示登录弹窗
    showLoginDialog.value = true;
  }
};

const handleLoginSuccess = () => {
  userInfo.value = storageLocal().getItem(userKey);
  if (userInfo.value && (userInfo.value.roleType === 2 || userInfo.value.roleType === 3)) {
    router.push("/welcome/index");
  } else {
    router.push("/account");
  }
};

const hasAdminAccess = computed(() => {
  if (!userInfo.value) return false;
  return userInfo.value.roleType === 2 || userInfo.value.roleType === 3;
});

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

const handleMouseMove = (e: MouseEvent) => {
  const elements = document.querySelectorAll('.stat-card, .ai-feature-card, .feature-item, .service-card, .tech-card, .testimonial-card, .hero-btn, .cta-buttons .el-button');
  elements.forEach((el: any) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);
  });
};

const initScrollAnimations = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.stat-card, .ai-feature-card, .feature-item, .service-card, .tech-card, .testimonial-card, .section-header').forEach((el) => {
    el.classList.add('scroll-animate');
    observer.observe(el);
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("mousemove", handleMouseMove);
  setTimeout(initScrollAnimations, 100);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("mousemove", handleMouseMove);
});

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const getStarStyle = (index: number) => {
  const size = Math.random() * 3 + 1;
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${Math.random() * 2 + 1}s`
  };
};

const getShootingStarStyle = (index: number) => {
  return {
    left: `${50 + Math.random() * 50}%`,
    top: `${Math.random() * 30}%`,
    animationDelay: `${index * 15 + Math.random() * 10}s`,
    animationDuration: `${1.5 + Math.random() * 0.5}s`
  };
};

const getParticleStyle = (index: number) => {
  const size = Math.random() * 6 + 2;
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 10 + 10}s`
  };
};

const getCtaStarStyle = (index: number) => {
  const size = Math.random() * 2 + 1;
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${Math.random() * 2 + 1}s`
  };
};

const carouselItems = ref([
  {
    title: "云创优学",
    subtitle: "智慧教育新纪元",
    description: "基于人工智能深度融合的智慧教育平台，为每位学习者打造专属学习路径",
    background: banner1
  },
  {
    title: "因材施教",
    subtitle: "个性化学习体验",
    description: "AI 精准分析学情，智能推荐课程，让每一次学习都更高效、更有针对性",
    background: banner2
  }
]);

const statsData = ref([
  { icon: "👨‍🎓", number: "1,000+", label: "预计注册学员" },
  { icon: "👩‍🏫", number: "50+", label: "预计优秀教师" },
  { icon: "📚", number: "100+", label: "预计上线精品课程" },
  { icon: "⭐", number: "98%+", label: "预计学员满意度" }
]);

const aiFeatures = ref([
  {
    icon: "🧠",
    title: "智能学情分析",
    description: "AI 深度分析学习数据，精准定位知识薄弱点，生成个性化学习报告"
  },
  {
    icon: "🎯",
    title: "精准推荐系统",
    description: "基于深度学习算法，智能推荐最适合的学习内容和练习题目"
  },
  {
    icon: "💬",
    title: "AI 智能助教",
    description: "24小时在线答疑，智能解析错题，提供个性化学习建议"
  },
  {
    icon: "📊",
    title: "实时学习追踪",
    description: "全方位追踪学习进度，可视化数据呈现，家长老师随时掌握"
  }
]);

const features = ref([
  {
    icon: "Monitor",
    title: "智能题库",
    description: "AI 自动组卷，千人千面，每次练习都是专属定制",
    image: card1
  },
  {
    icon: "Connection",
    title: "互动课堂",
    description: "实时互动教学，AI 辅助管理，提升课堂效率与参与度",
    image: card2
  },
  {
    icon: "Operation",
    title: "学情报告",
    description: "多维度数据分析，可视化学习报告，全面了解学习状态",
    image: card3
  }
]);

const services = ref([
  {
    icon: "📖",
    title: "精品课程",
    description: "名师打造的系统化课程体系，覆盖K12全学科",
    features: ["名师授课", "体系完整", "实时更新", "互动练习"]
  },
  {
    icon: "🤖",
    title: "AI 辅导",
    description: "智能 AI 助教 24 小时在线，随时解答学习疑惑",
    features: ["即时答疑", "错题分析", "知识讲解", "学习规划"]
  },
  {
    icon: "📝",
    title: "智能作业",
    description: "AI 智能批改作业，秒出结果，精准定位问题",
    features: ["自动批改", "错因分析", "针对训练", "进度追踪"]
  },
  {
    icon: "📈",
    title: "成长档案",
    description: "全程记录学习轨迹，见证每一步成长",
    features: ["学习记录", "能力图谱", "成长报告", "荣誉勋章"]
  }
]);

const techStack = ref([
  { icon: "🧠", name: "多模态 AI", version: "大语言模型" },
  { icon: "🔮", name: "深度学习", version: "神经网络" },
  { icon: "📊", name: "知识图谱", version: "智能推荐" },
  { icon: "⚡", name: "Vue 3", version: "前端框架" },
  { icon: "🚀", name: "云原生", version: "微服务架构" },
  { icon: "🔐", name: "数据安全", version: "隐私保护" },
  { icon: "📱", name: "多端适配", version: "全平台覆盖" },
  { icon: "🌐", name: "边缘计算", version: "低延迟响应" }
]);

const testimonials = ref([
  {
    content: "启明智教帮助我找到了学习的薄弱点，针对性练习后成绩提升了很多，特别是错题分析功能太实用了！",
    name: "小明同学",
    title: "大学教育阶段学生",
    avatar: "明"
  },
  {
    content: "作为老师，这个平台大大减轻了我的工作负担，智能批改和学情分析让我能更好地因材施教。",
    name: "张老师",
    title: "高中数学教师",
    avatar: "张"
  },
  {
    content: "孩子的学习数据一目了然，AI 推荐的学习计划很科学，再也不用担心孩子的学习没有方向了。",
    name: "李女士",
    title: "学生家长",
    avatar: "李"
  }
]);

const handleCommand = (command: string) => {
  switch (command) {
    case "space":
      if (hasAdminAccess.value) {
        router.push("/welcome/index");
      } else {
        ElMessage.warning("您没有权限进入后台管理空间");
      }
      break;
    case "account":
      router.push("/account");
      break;
    case "logout":
      removeToken();
      storageLocal().removeItem(userKey);
      userInfo.value = null;
      ElMessage.success("退出登录成功");
      break;
  }
};
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #0a0a1a;
  color: #fff;
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  height: 70px;
  width: 100vw;
  background: transparent;
  transition: background 0.3s ease, box-shadow 0.3s ease;

  &.header-scrolled {
    background: rgba(10, 10, 26, 0.95);
    box-shadow: 0 2px 20px rgb(0 0 0 / 30%);
    backdrop-filter: blur(10px);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 80px;
    margin: 0 auto;

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 48px;
      cursor: pointer;

      img { 
        height: 48px;
        padding: 4px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .logo-text-group {
        display: flex;
        flex-direction: column;
        justify-content: center;
        line-height: 1.2;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        color: #fff;
      }

      .logo-text-en {
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: 1px;
      }
    }

    .nav-links {
      display: flex;
      gap: 40px;

      .nav-link {
        font-size: 15px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.3s;
        cursor: pointer;

        &:hover { color: #60a5fa; }
      }
    }

    .login-btn.el-button {
      height: 42px;
      padding: 0 32px;
      font-size: 15px;
      font-weight: 600;
      color: #0a0a1a;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      border: none;
      border-radius: 24px;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(96, 165, 250, 0.4);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      padding: 0 8px;
      cursor: pointer;

      .nickname {
        margin: 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .el-icon--right {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.6);
        transition: transform 0.3s ease;
      }
    }
  }
}

.banner {
  position: relative;
  height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
  overflow: hidden;

  .starfield {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.3;
    pointer-events: none;

    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: twinkle ease-in-out infinite;
      box-shadow: 0 0 4px 1px rgba(255, 255, 255, 0.2);
    }

    .shooting-star {
      position: absolute;
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2), transparent);
      animation: shooting ease-out infinite;
      opacity: 0;
      transform: rotate(135deg);
    }
  }

  .hero-particles {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.25;

    .particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      animation: floatParticle linear infinite;
    }
  }

  :deep(.el-carousel),
  :deep(.el-carousel__container) { height: 100vh; }
  :deep(.el-carousel__item) { overflow: hidden; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes shooting {
  0% { 
    transform: rotate(135deg) translateX(0); 
    opacity: 0; 
  }
  5% { opacity: 0.6; }
  60% { opacity: 0.3; }
  100% { 
    transform: rotate(135deg) translateX(400px); 
    opacity: 0; 
  }
}

@keyframes floatParticle {
  0% { transform: translateY(100vh); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(-100px); opacity: 0; }
}

.carousel-content {
  display: flex;
  align-items: center;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    position: absolute;
    inset: 0;
    content: "";
    background: linear-gradient(135deg, rgba(10, 10, 26, 0.5) 0%, rgba(10, 10, 26, 0.3) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .carousel-text {
    position: relative;
    z-index: 3;
    max-width: 800px;
    padding: 0 80px;

    .hero-badge {
      display: inline-block;
      padding: 8px 20px;
      margin-bottom: 24px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: #60a5fa;
      background: rgba(96, 165, 250, 0.1);
      border: 1px solid rgba(96, 165, 250, 0.3);
      border-radius: 30px;
    }

    .main-title {
      margin: 0 0 16px;
      font-size: 68px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 4px;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .sub-title {
      margin: 0 0 20px;
      font-size: 42px;
      font-weight: 600;
      letter-spacing: 2px;
      background: linear-gradient(135deg, #5dade2 0%, #85c1e9 50%, #aed6f1 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-desc {
      margin: 0 0 32px;
      font-size: 17px;
      font-weight: 400;
      line-height: 1.7;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.75);
    }

    .hero-buttons {
      display: flex;
      gap: 16px;
      position: relative;
      z-index: 100;
      pointer-events: auto;

      .hero-btn {
        position: relative;
        z-index: 101;
        height: 54px;
        padding: 0 38px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 1px;
        border-radius: 30px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        pointer-events: auto;

        :deep(span) {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        &:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        &.primary.el-button--primary {
          color: #0a0a1a;
          background: 
            radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.5), transparent),
            linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);

          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            transition: 0.6s;
            z-index: 1;
            pointer-events: none;
          }

          &:hover {
            box-shadow: 0 12px 30px rgba(96, 165, 250, 0.6);
            &::before { left: 100%; }
          }
        }

        &.secondary.el-button {
          color: #fff;
          background: 
            radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3), transparent),
            rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);

          &:hover { 
            background: 
              radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.4), transparent),
              rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  z-index: 10;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  transform: translateX(-50%);

  .scroll-arrow .el-icon.animated { animation: bounce 2s infinite; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
}

.wave-transition {
  margin-top: -2px;
  z-index: 5;
  svg { display: block; width: 100%; height: 40px; }
}

.stats-section {
  padding: 30px 0;
  background: #0a0a1a;

  .stats-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    perspective: 1000px;
  }

  .stat-card {
    position: relative;
    flex: 1;
    max-width: 260px;
    padding: 40px 30px;
    text-align: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.06),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    &:hover {
      transform: translateY(-12px) scale(1.03);
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 20px 40px rgba(96, 165, 250, 0.15);
      background: linear-gradient(145deg, rgba(30, 30, 60, 0.5) 0%, rgba(20, 20, 45, 0.7) 100%);

      &::before { opacity: 1; }
    }

    .stat-icon, .stat-number, .stat-label {
      position: relative;
      z-index: 1;
    }

    .stat-icon { 
      font-size: 40px; 
      margin-bottom: 16px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    &:hover .stat-icon {
      transform: scale(1.3) rotateZ(15deg);
    }

    .stat-number {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: transform 0.3s;
    }
    
    &:hover .stat-number {
      transform: scale(1.1);
    }

    .stat-label { font-size: 15px; color: rgba(255, 255, 255, 0.6); }
  }
}

.ai-power-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);
  overflow: hidden;

  .ai-features-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .ai-feature-card {
    position: relative;
    padding: 40px 30px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    text-align: center;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    transform-style: preserve-3d;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.08),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    &:hover {
      transform: translateY(-12px) rotateX(5deg) scale(1.02);
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: 0 25px 50px rgba(96, 165, 250, 0.2), 0 10px 20px rgba(0, 0, 0, 0.3);

      &::before { opacity: 1; }
    }

    .ai-icon, h3, p, .ai-glow {
      position: relative;
      z-index: 1;
    }

    &:hover {
      background: linear-gradient(145deg, rgba(30, 30, 60, 0.6) 0%, rgba(20, 20, 45, 0.8) 100%);
      .ai-glow { opacity: 1; }
    }

    .ai-icon { 
      font-size: 48px; 
      margin-bottom: 20px;
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    &:hover .ai-icon {
      transform: scale(1.25) rotateY(20deg);
    }
    
    h3 { 
      font-size: 20px; 
      color: #fff; 
      margin-bottom: 12px;
      transition: color 0.3s;
    }
    
    &:hover h3 {
      background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p { font-size: 14px; color: rgba(255, 255, 255, 0.6); }

    .ai-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
    }
  }

  .ai-decoration {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    pointer-events: none;

    .orbit {
      position: absolute;
      border: 1px solid rgba(96, 165, 250, 0.1);
      border-radius: 50%;
      animation: rotateOrbit 20s linear infinite;

      &.orbit-1 { inset: 0; }
      &.orbit-2 { inset: 50px; animation-duration: 25s; animation-direction: reverse; }
      &.orbit-3 { inset: 100px; animation-duration: 30s; }
    }
  }
}

@keyframes rotateOrbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.transition-image-section {
  padding: 50px 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%);

  .transition-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  .transition-text {
    flex: 1;
    max-width: 500px;

    h2 { font-size: 48px; font-weight: 700; color: #fff; margin-bottom: 24px; }
    p { font-size: 18px; color: rgba(255, 255, 255, 0.6); }
  }

  .transition-visual {
    flex: 1;
    display: flex;
    justify-content: center;

    .floating-cards {
      position: relative;
      width: 300px;
      height: 300px;

      .float-card {
        position: absolute;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        animation: floatCard 4s ease-in-out infinite;

        &.card-1 { top: 0; left: 50%; transform: translateX(-50%); }
        &.card-2 { top: 50%; right: 0; transform: translateY(-50%); animation-delay: 1s; }
        &.card-3 { bottom: 0; left: 50%; transform: translateX(-50%); animation-delay: 2s; }
        &.card-4 { top: 50%; left: 0; transform: translateY(-50%); animation-delay: 3s; }
      }
    }
  }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.section-container {
  max-width: 1300px;
  padding: 0 40px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;

  &.light {
    .section-title { color: #fff; }
    .section-desc { color: rgba(255, 255, 255, 0.6); }
  }

  &.dark {
    .section-title { color: #1a1a2e; }
    .section-desc { color: #64748b; }
    .section-badge { background: rgba(96, 165, 250, 0.15); }
  }

  .section-badge {
    display: inline-block;
    padding: 6px 16px;
    margin-bottom: 16px;
    font-size: 12px;
    font-weight: 600;
    color: #60a5fa;
    letter-spacing: 2px;
    background: rgba(96, 165, 250, 0.1);
    border-radius: 20px;
  }

  .section-title { font-size: 36px; font-weight: 700; color: #fff; margin-bottom: 12px; }
  .section-desc { font-size: 16px; color: rgba(255, 255, 255, 0.6); max-width: 600px; margin: 0 auto; }
}

.platform-intro {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #0a0a1a 0%, #12122a 50%, #0a0a1a 100%);

  .feature-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    perspective: 1000px;
  }

  .feature-item {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.1),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 2;
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-15px) rotateX(5deg);
      border-color: rgba(96, 165, 250, 0.5);
      box-shadow: 0 30px 60px rgba(96, 165, 250, 0.2), 0 15px 30px rgba(0, 0, 0, 0.4);

      &::before { opacity: 1; }

      .feature-image img { transform: scale(1.15); }
      
      .feature-overlay {
        background: linear-gradient(180deg, transparent 30%, rgba(10, 10, 26, 0.95) 100%);
      }
    }

    a { display: block; text-decoration: none; }

    .feature-image {
      aspect-ratio: 4/3;
      overflow: hidden;

      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
    }

    .feature-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 30px;
      background: linear-gradient(180deg, transparent 40%, rgba(10, 10, 26, 0.85) 100%);
      transition: background 0.5s ease;

      h3 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 8px; }
      p { font-size: 14px; color: rgba(255, 255, 255, 0.9); margin: 0; }
    }
  }
}

.transition-section-2 {
  position: relative;
  height: 200px;
  overflow: hidden;

  .parallax-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #0a0a1a 100%);
  }

  .transition-overlay {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .big-quote {
      text-align: center;
      max-width: 800px;
      padding: 0 40px;

      .quote-mark { font-size: 80px; color: rgba(96, 165, 250, 0.3); line-height: 0.5; }
      p { font-size: 24px; font-weight: 300; color: #fff; margin: 16px 0; font-style: italic; }
      .quote-author { font-size: 14px; color: rgba(255, 255, 255, 0.5); }
    }
  }
}

.services-section {
  padding: 50px 0;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);

  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    perspective: 1000px;
  }

  .service-card {
    position: relative;
    padding: 40px 30px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    backface-visibility: hidden;
    overflow: hidden;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.08),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    &:hover {
      background: linear-gradient(145deg, rgba(30, 30, 60, 0.8) 0%, rgba(20, 20, 45, 0.9) 100%);
      border-color: rgba(96, 165, 250, 0.5);
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 40px rgba(96, 165, 250, 0.15), 0 10px 20px rgba(0, 0, 0, 0.3);

      &::before { opacity: 1; }
    }

    .service-icon, h3, p {
      position: relative;
      z-index: 1;
    }

    .service-icon { 
      font-size: 48px; 
      margin-bottom: 20px;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    &:hover .service-icon {
      transform: scale(1.2) rotateZ(10deg);
    }
    
    .service-title { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 12px; }
    .service-desc { font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 20px; }

    .service-features {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        transition: all 0.3s;

        .el-icon { color: #60a5fa; transition: transform 0.3s; }
      }
    }
    
    &:hover .service-features li {
      transform: translateX(5px);
      
      .el-icon { transform: scale(1.2); }
    }
  }
}

.tech-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #12122a 50%, #0a0a1a 100%);

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
    perspective: 800px;
  }

  .tech-card {
    position: relative;
    padding: 30px 20px;
    text-align: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    cursor: pointer;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.08),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    &:hover {
      transform: translateY(-8px) rotateY(10deg);
      border-color: rgba(96, 165, 250, 0.5);
      background: linear-gradient(145deg, rgba(96, 165, 250, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%);
      box-shadow: 0 15px 30px rgba(96, 165, 250, 0.2);

      &::before { opacity: 1; }
    }

    .tech-icon, .tech-name, .tech-version {
      position: relative;
      z-index: 1;
    }

    .tech-icon { 
      font-size: 36px; 
      margin-bottom: 12px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    &:hover .tech-icon {
      transform: scale(1.3) rotateY(180deg);
    }
    
    .tech-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .tech-version { font-size: 12px; color: rgba(255, 255, 255, 0.5); }
  }
}

.testimonials-section {
  padding: 50px 0;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    perspective: 1000px;
  }

  .testimonial-card {
    position: relative;
    padding: 40px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    overflow: hidden;
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(255, 255, 255, 0.08),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 0;
    }

    &:hover { 
      background: linear-gradient(145deg, rgba(30, 30, 60, 0.6) 0%, rgba(20, 20, 45, 0.8) 100%); 
      transform: translateY(-10px) rotateX(3deg); 
      box-shadow: 0 25px 50px rgba(96, 165, 250, 0.15);
      border-color: rgba(167, 139, 250, 0.4);

      &::before { opacity: 1; }
    }

    .quote-icon, .testimonial-content, .user-profile {
      position: relative;
      z-index: 1;
    }

    .quote-icon { 
      font-size: 60px; 
      color: #60a5fa; 
      margin-bottom: 20px;
      display: block;
      opacity: 0.5;
      transition: all 0.4s;
    }
    
    &:hover .quote-icon {
      opacity: 1;
      transform: scale(1.1);
      color: #a78bfa;
    }
    
    .testimonial-content { font-size: 16px; color: rgba(255, 255, 255, 0.8); margin-bottom: 30px; }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 16px;

      .author-avatar {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 600;
        color: #0a0a1a;
        background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
        border-radius: 50%;
      }

      .author-name { font-size: 16px; font-weight: 600; color: #fff; }
      .author-title { font-size: 13px; color: rgba(255, 255, 255, 0.5); }
    }
  }
}

.cta-section {
  position: relative;
  padding: 40px 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #0a0a1a 100%);
  text-align: center;
  overflow: hidden;

  .cta-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .cta-star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: twinkle ease-in-out infinite;
    }
  }

  .cta-content {
    position: relative;
    z-index: 2;

    h2 { font-size: 42px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    p { font-size: 18px; color: rgba(255, 255, 255, 0.7); margin-bottom: 40px; }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 20px;
      position: relative;
      z-index: 10;
      pointer-events: auto;

      .el-button {
        position: relative;
        height: 54px;
        padding: 0 42px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 30px;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        pointer-events: auto;

        :deep(span) {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        &:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        &.el-button--primary {
          background: 
            radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.5), transparent),
            linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          color: #0a0a1a;
          border: none;
          box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);

          &:hover {
            box-shadow: 0 12px 30px rgba(96, 165, 250, 0.6);
          }
        }

        &.is-plain.el-button {
          color: #fff;
          background: 
            radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3), transparent),
            transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);

          &:hover { 
            background: 
              radial-gradient(circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.4), transparent),
              rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }
}

.footer-section {
  padding: 50px 0 30px;
  background: #050510;

  .footer-container { max-width: 1300px; margin: 0 auto; padding: 0 40px; }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-brand {
    .footer-logo { height: 40px; margin-bottom: 20px; }
    .footer-desc { font-size: 14px; color: rgba(255, 255, 255, 0.5); margin-bottom: 24px; }

    .social-links {
      display: flex;
      gap: 12px;

      .social-link {
        padding: 8px 16px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        transition: all 0.3s;

        &:hover { background: #60a5fa; color: #0a0a1a; }
      }
    }
  }

  .footer-links-group {
    h4 { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 24px; }

    a {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      margin-bottom: 12px;
      transition: color 0.3s;

      &:hover { color: #60a5fa; }
    }
  }

  .footer-bottom {
    padding-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;

    p { font-size: 13px; color: rgba(255, 255, 255, 0.4); margin: 6px 0; }

    .company-info {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 8px;
    }

    .website-link {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.3s;

      &:hover { color: #93c5fd; }
    }
  }
}

@media screen and (max-width: 1200px) {
  .header .header-content { padding: 0 40px; .nav-links { display: none; } }
  .carousel-content .carousel-text { padding: 0 40px; .main-title { font-size: 52px; } .sub-title { font-size: 36px; } }
  .ai-power-section .ai-features-grid { grid-template-columns: repeat(2, 1fr); }
  .services-section .services-grid { grid-template-columns: repeat(2, 1fr); }
  .tech-section .tech-grid { grid-template-columns: repeat(4, 1fr); }
  .footer-section .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
}

@media screen and (max-width: 768px) {
  .header .header-content { padding: 0 20px; .logo .logo-text { display: none; } }
  .carousel-content .carousel-text { padding: 0 20px; .main-title { font-size: 36px; } .sub-title { font-size: 24px; } .hero-desc { font-size: 14px; } .hero-buttons { flex-direction: column; .hero-btn { width: 100%; } } }
  .stats-section { .stats-container { flex-wrap: wrap; } .stat-card { min-width: calc(50% - 15px); padding: 24px 16px; .stat-number { font-size: 28px; } } }
  .ai-power-section .ai-features-grid { grid-template-columns: 1fr; }
  .transition-image-section .transition-content { flex-direction: column; gap: 60px; text-align: center; .transition-text h2 { font-size: 32px; } }
  .platform-intro, .services-section, .tech-section, .testimonials-section { padding: 80px 0; }
  .section-header .section-title { font-size: 32px; }
  .platform-intro .feature-list { grid-template-columns: 1fr; }
  .transition-section-2 .transition-overlay .big-quote p { font-size: 20px; }
  .services-section .services-grid { grid-template-columns: 1fr; }
  .tech-section .tech-grid { grid-template-columns: repeat(2, 1fr); }
  .testimonials-section .testimonials-grid { grid-template-columns: 1fr; }
  .footer-section .footer-grid { grid-template-columns: 1fr; gap: 30px; }
  .cta-section .cta-content { h2 { font-size: 28px; } .cta-buttons { flex-direction: column; padding: 0 20px; } }
}

/* 滚动触发动画 */
.scroll-animate {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* 卡片交错入场动画 */
.stat-card.scroll-animate:nth-child(1) { transition-delay: 0s; }
.stat-card.scroll-animate:nth-child(2) { transition-delay: 0.1s; }
.stat-card.scroll-animate:nth-child(3) { transition-delay: 0.2s; }
.stat-card.scroll-animate:nth-child(4) { transition-delay: 0.3s; }

.ai-feature-card.scroll-animate:nth-child(1) { transition-delay: 0s; }
.ai-feature-card.scroll-animate:nth-child(2) { transition-delay: 0.15s; }
.ai-feature-card.scroll-animate:nth-child(3) { transition-delay: 0.3s; }
.ai-feature-card.scroll-animate:nth-child(4) { transition-delay: 0.45s; }

.feature-item.scroll-animate:nth-child(1) { transition-delay: 0s; }
.feature-item.scroll-animate:nth-child(2) { transition-delay: 0.2s; }
.feature-item.scroll-animate:nth-child(3) { transition-delay: 0.4s; }

.service-card.scroll-animate:nth-child(1) { transition-delay: 0s; }
.service-card.scroll-animate:nth-child(2) { transition-delay: 0.15s; }
.service-card.scroll-animate:nth-child(3) { transition-delay: 0.3s; }
.service-card.scroll-animate:nth-child(4) { transition-delay: 0.45s; }

.tech-card.scroll-animate:nth-child(1) { transition-delay: 0s; }
.tech-card.scroll-animate:nth-child(2) { transition-delay: 0.08s; }
.tech-card.scroll-animate:nth-child(3) { transition-delay: 0.16s; }
.tech-card.scroll-animate:nth-child(4) { transition-delay: 0.24s; }
.tech-card.scroll-animate:nth-child(5) { transition-delay: 0.32s; }
.tech-card.scroll-animate:nth-child(6) { transition-delay: 0.4s; }
.tech-card.scroll-animate:nth-child(7) { transition-delay: 0.48s; }
.tech-card.scroll-animate:nth-child(8) { transition-delay: 0.56s; }

.testimonial-card.scroll-animate:nth-child(1) { transition-delay: 0s; }
.testimonial-card.scroll-animate:nth-child(2) { transition-delay: 0.2s; }
.testimonial-card.scroll-animate:nth-child(3) { transition-delay: 0.4s; }

/* 增强卡片悬停效果 */
.stat-card,
.ai-feature-card,
.feature-item,
.service-card,
.tech-card,
.testimonial-card {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
    transition: left 0.6s ease;
    pointer-events: none;
  }

  &:hover::before {
    left: 100%;
  }
}

/* 按钮波纹效果 */
.hero-btn,
.cta-section .el-button {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::after {
    width: 300px;
    height: 300px;
  }
}

/* 标题文字渐变动画 */
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.section-title {
  background: linear-gradient(270deg, #60a5fa, #a78bfa, #f472b6, #60a5fa);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientFlow 8s ease infinite;
}

.main-title {
  background: linear-gradient(270deg, #fff, #60a5fa, #a78bfa, #fff);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientFlow 6s ease infinite;
}

/* 图标缩放效果 */
.stat-card .stat-icon,
.ai-feature-card .feature-icon,
.service-card .service-icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover .stat-icon,
.ai-feature-card:hover .feature-icon,
.service-card:hover .service-icon {
  transform: scale(1.2);
}

/* 浮动阴影效果 */
@keyframes float-shadow {
  0%, 100% {
    box-shadow: 0 15px 30px rgba(96, 165, 250, 0.15);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 25px 50px rgba(167, 139, 250, 0.25);
    transform: translateY(-8px);
  }
}

.feature-item:hover,
.service-card:hover,
.testimonial-card:hover {
  animation: float-shadow 3s ease-in-out infinite;
}

/* 光标跟随光效 - 卡片上的光晕 */
.ai-feature-card,
.service-card {
  background: linear-gradient(145deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%);
  
  &:hover {
    background: linear-gradient(145deg, rgba(40, 40, 80, 0.95) 0%, rgba(25, 25, 50, 0.98) 100%);
  }
}

/* 文字打字机效果光标 */
@keyframes blink-cursor {
  0%, 50% { border-color: #60a5fa; }
  51%, 100% { border-color: transparent; }
}

.hero-desc {
  display: inline-block;
  padding-right: 8px;
}

/* 悬停时图标旋转 */
.tech-card:hover .tech-icon {
  animation: iconSpin 0.6s ease;
}

@keyframes iconSpin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

/* 星星闪烁增强 */
@keyframes twinkle-enhanced {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
    filter: blur(0px);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    filter: blur(1px);
  }
}

/* 轨道上的点发光 */
.orbit-dot {
  box-shadow: 0 0 10px #60a5fa, 0 0 20px #60a5fa, 0 0 30px #60a5fa;
}

/* 数字跳动效果 */
@keyframes numberPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-card:hover .stat-number {
  animation: numberPop 0.4s ease;
}

/* 引用符号动画 */
@keyframes quoteFloat {
  0%, 100% { transform: translateY(0) rotate(-5deg); opacity: 0.15; }
  50% { transform: translateY(-10px) rotate(5deg); opacity: 0.25; }
}

.testimonial-card .quote-icon {
  animation: quoteFloat 4s ease-in-out infinite;
}

/* 导航链接下划线动画 */
.nav-link {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }
  
  &:hover::after {
    width: 100%;
  }
}

/* Logo 呼吸效果 */
@keyframes logoBreathe {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.8)); }
}

.logo-img {
  animation: logoBreathe 3s ease-in-out infinite;
}

/* CTA 按钮闪烁边框 */
@keyframes borderGlow {
  0%, 100% { box-shadow: 0 0 5px #60a5fa, 0 0 10px #60a5fa; }
  50% { box-shadow: 0 0 15px #a78bfa, 0 0 30px #a78bfa; }
}

.cta-section .el-button--primary {
  animation: borderGlow 2s ease-in-out infinite;
}

/* 页脚社交链接悬停 */
.social-link {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(96, 165, 250, 0.4);
  }
}
</style>

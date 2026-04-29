<template>
  <div class="home-container" :style="bannerThemeVars">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo" @click="router.push('/home')">
          <img :src="logo" alt="Logo" class="app-logo-img" />
          <div class="logo-text-group">
            <span class="logo-text">启明智教</span>
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
                <el-avatar :size="32" :src="formatAvatar(userInfo.avatar)" />
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

    <!-- 英雄区域 - 背景图片 -->
    <div class="banner">
      <div
        class="banner-bg"
        :style="{ backgroundImage: `url(${bannerPhoto})` }"
      />
      <!-- 右下角署名 -->
      <div class="banner-signature">
        <p>长春工业大学</p>
        <p>计算机科学与工程学院</p>
        <p>吉林省云创迅捷软件开发有限公司</p>
      </div>
      <div class="banner-overlay">
        <div class="carousel-text">
          <div class="hero-badge">AI 深度融合的智慧教育平台</div>
          <h2 class="main-title">
            启明智教<img
              :src="artisticText"
              class="art-logo-img"
              alt="Intelledu"
            />
          </h2>
          <p class="sub-title">智慧教育新纪元</p>
          <p class="hero-desc">
            基于人工智能深度融合的智慧教育平台，为每位学习者打造专属学习路径
          </p>
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
        <path
          d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
          fill="#0f172a"
        />
      </svg>
    </div>

    <!-- 数据统计区域 -->
    <div id="stats" class="stats-section">
      <div class="stats-container">
        <div v-for="(stat, index) in statsData" :key="index" class="stat-card">
          <div class="stat-icon"><component :is="stat.icon" /></div>
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- AI 赋能区域 -->
    <div id="ai-power" class="ai-power-section">
      <div class="section-container ai-power-container">
        <!-- 内容区域 -->
        <div class="ai-content-right">
          <div class="section-header light">
            <span class="section-badge">AI POWERED</span>
            <h2 class="section-title">AI 深度赋能教育</h2>
            <p class="section-desc">
              人工智能与教育的完美融合，开启智慧学习新时代
            </p>
          </div>
          <div class="ai-features-grid">
            <div
              v-for="(item, index) in aiFeatures"
              :key="index"
              class="ai-feature-card"
            >
              <div class="ai-icon"><component :is="item.icon" /></div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="ai-glow" />
            </div>
          </div>
        </div>
      </div>
      <!-- 装饰性元素 -->
      <div class="ai-decoration">
        <div class="orbit orbit-1" />
        <div class="orbit orbit-2" />
        <div class="orbit orbit-3" />
      </div>
    </div>

    <!-- 过渡图片区域 -->
    <div class="transition-image-section">
      <div class="transition-content">
        <div class="transition-text">
          <h2>让每一位学习者<br />都能发光发亮</h2>
          <p>基于 AI 技术的个性化学习路径规划，因材施教，让知识触手可及</p>
          <div class="transition-stats">
            <div class="stat-item">
              <span class="stat-number">98%</span>
              <span class="stat-label">学习效率提升</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50万+</span>
              <span class="stat-label">活跃学习者</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">1000+</span>
              <span class="stat-label">精品课程</span>
            </div>
          </div>
        </div>
        <div class="transition-visual">
          <div class="visual-grid">
            <div class="grid-card card-large">
              <div class="card-icon"><IconGraduation /></div>
              <div class="card-title">智能学习</div>
              <div class="card-desc">AI 驱动的个性化学习路径</div>
            </div>
            <div class="grid-card card-medium card-top-right">
              <div class="card-icon"><IconChart /></div>
              <div class="card-title">数据分析</div>
            </div>
            <div class="grid-card card-medium card-bottom-left">
              <div class="card-icon"><IconTrophy /></div>
              <div class="card-title">成就系统</div>
            </div>
            <div class="grid-card card-small card-1"><IconBook /></div>
            <div class="grid-card card-small card-2"><IconZap /></div>
            <div class="grid-card card-small card-3"><IconBrain /></div>
            <div class="grid-card card-small card-4"><IconTarget /></div>
            <div class="grid-card card-small card-5"><IconRocket /></div>
          </div>
          <div class="visual-glow" />
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

    <!-- 核心服务区域 -->
    <div id="services" class="services-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">SERVICES</span>
          <h2 class="section-title">核心服务</h2>
          <p class="section-desc">
            专业团队为教育场景提供全方位的智能化服务支持
          </p>
        </div>
        <div class="services-grid">
          <div
            v-for="(service, index) in services"
            :key="index"
            class="service-card"
          >
            <div class="service-icon"><component :is="service.icon" /></div>
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
          <p class="section-desc">
            AI 算法与前沿技术的深度融合，打造稳定高效的智慧教育平台
          </p>
        </div>
        <div class="tech-grid">
          <div
            v-for="(tech, index) in techStack"
            :key="index"
            class="tech-card"
          >
            <div class="tech-icon"><component :is="tech.icon" /></div>
            <div class="tech-name">{{ tech.name }}</div>
            <div class="tech-version">{{ tech.version }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 教育创新模块 -->
    <div id="innovation" class="innovation-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">INNOVATIONS</span>
          <h2 class="section-title">教育 AI 创新引擎</h2>
          <p class="section-desc">
            从 Agentic AI
            到数据闭环与多模态知识引擎，构建可持续进化的教育智能底座
          </p>
        </div>
        <div class="innovation-grid">
          <article
            v-for="(item, index) in innovationHighlights"
            :key="index"
            class="innovation-card"
          >
            <div class="innovation-meta">
              <span class="innovation-label">{{ item.label }}</span>
              <div class="innovation-icon"><component :is="item.icon" /></div>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <ul class="innovation-points">
              <li v-for="(point, pointIndex) in item.points" :key="pointIndex">
                {{ point }}
              </li>
            </ul>
          </article>
        </div>
      </div>
    </div>

    <!-- 核心能力模块 -->
    <div class="capability-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">FRAMEWORK</span>
          <h2 class="section-title">核心能力框架</h2>
          <p class="section-desc">
            通过协议化扩展、混合检索与自适应诊断，实现 AI 教学能力的工程化落地
          </p>
        </div>
        <div class="capability-grid">
          <article
            v-for="(item, index) in capabilityHighlights"
            :key="index"
            class="capability-card"
          >
            <div class="capability-tag">{{ item.tag }}</div>
            <div class="capability-icon"><component :is="item.icon" /></div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>
    </div>

    <!-- 关键技术模块 -->
    <div class="breakthrough-section">
      <div class="section-container">
        <div class="section-header light">
          <span class="section-badge">RESEARCH</span>
          <h2 class="section-title">关键技术成果</h2>
          <p class="section-desc">
            面向教育场景沉淀的七项核心技术，覆盖模型、检索、编排、评估与课件生成
          </p>
        </div>
        <div class="breakthrough-panel">
          <article
            v-for="(item, index) in technicalBreakthroughs"
            :key="index"
            class="breakthrough-item"
          >
            <span class="breakthrough-index">{{ index + 1 }}</span>
            <p>{{ item }}</p>
          </article>
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
          <div
            v-for="(item, index) in testimonials"
            :key="index"
            class="testimonial-card"
            :style="{ '--testimonial-accent': item.accent }"
          >
            <div
              class="testimonial-media"
              :style="{ backgroundImage: `url(${item.background})` }"
            />
            <div class="testimonial-backdrop" />
            <div class="testimonial-shell">
              <div class="testimonial-tag">{{ item.tag }}</div>
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
    </div>

    <!-- CTA 区域 - 非对称左右布局 -->
    <div class="cta-section-new">
      <!-- 背景星星 -->
      <div class="cta-bg-stars">
        <div
          v-for="i in 80"
          :key="'cta-star-' + i"
          class="cta-star"
          :style="getCtaStarStyle(i)"
        />
      </div>
      <!-- 左右布局容器 -->
      <div class="cta-layout">
        <!-- 左侧文字内容 -->
        <div class="cta-content-left">
          <div class="cta-badge">开启新篇章</div>
          <h2>开启智慧学习之旅</h2>
          <p>立即加入，体验 AI 驱动的全新教育模式</p>
          <div class="cta-buttons">
            <el-button type="primary" size="large" @click="handleEntry">
              立即试用
            </el-button>
            <el-button size="large" plain> 联系我们 </el-button>
          </div>
          <div class="cta-features">
            <span><i>→</i> 快速上手</span>
            <span><i>→</i> 精准学习</span>
            <span><i>→</i> 智能推荐</span>
          </div>
        </div>
        <!-- 右侧星光汇聚 Logo -->
        <div class="starlight-logo-wrapper">
          <canvas ref="starlightCanvas" class="starlight-canvas" />
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
              启明智教是基于人工智能深度融合的智慧教育平台，致力于为教育者和学习者提供
              个性化、智能化的教学与学习体验，让每个人都能发现学习的乐趣。
            </p>
            <div class="social-links">
              <a
                href="https://github.com/pure-admin"
                target="_blank"
                class="social-link"
              >
                <span>GitHub</span>
              </a>
              <a
                href="https://pure-admin.cn"
                target="_blank"
                class="social-link"
              >
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
          <p class="school-info">
            长春工业大学 吉林省长春市宽城区北远达大街 3000 号 计算机学院
            启明智教项目 <span class="domain">Intelledu.com</span>
          </p>
          <p
            style="
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              align-items: center;
              justify-content: center;
              margin-top: 8px;
            "
          >
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              style="color: rgb(255 255 255 / 40%); text-decoration: none"
              >吉ICP备2025035820号-1</a
            >
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=22017302000511"
              rel="noreferrer"
              target="_blank"
              style="
                display: inline-flex;
                align-items: center;
                color: rgb(255 255 255 / 40%);
                text-decoration: none;
              "
            >
              <img
                src="https://jsd.kai233.top/web/img/batb.png"
                style="width: 20px; margin-right: 3px"
                alt="备案图标"
              />吉公网安备22017302000511号
            </a>
          </p>
          <p>
            Copyright (c) 2024 Est. 吉林省云创迅捷软件开发有限公司 All Rights
            Reserved
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  Monitor,
  Connection,
  Operation,
  ArrowDown,
  User,
  SwitchButton,
  Setting,
  Check,
  Close
} from "@element-plus/icons-vue";
import { storageLocal } from "@pureadmin/utils";
import { formatAvatar } from "@/utils/avatar";
import { userKey, removeToken, getToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";
import { initRouter } from "@/router/utils";

// 导入图片资源
import card1 from "@/assets/home/card1.jpg";
import card2 from "@/assets/home/card2.jpg";
import card3 from "@/assets/home/card3.jpg";
import logo from "@/assets/logo.png";
import artisticText from "@/assets/816438ed-a33a-4477-b57e-e273e15c03aa.png";
import LoginDialog from "@/components/LoginDialog.vue";
// 导入 SVG 图标组件
import IconStudent from "@/assets/home-icons/student.svg?component";
import IconTeacher from "@/assets/home-icons/teacher.svg?component";
import IconBook from "@/assets/home-icons/book.svg?component";
import IconStar from "@/assets/home-icons/star.svg?component";
import IconBrain from "@/assets/home-icons/brain.svg?component";
import IconTarget from "@/assets/home-icons/target.svg?component";
import IconMessage from "@/assets/home-icons/message.svg?component";
import IconChart from "@/assets/home-icons/chart.svg?component";
import IconRobot from "@/assets/home-icons/robot.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconTrending from "@/assets/home-icons/trending.svg?component";
import IconZap from "@/assets/home-icons/zap.svg?component";
import IconRocket from "@/assets/home-icons/rocket.svg?component";
import IconLightbulb from "@/assets/home-icons/lightbulb.svg?component";
import IconTrophy from "@/assets/home-icons/trophy.svg?component";
import IconGraduation from "@/assets/home-icons/graduation.svg?component";
import IconCrystal from "@/assets/home-icons/crystal.svg?component";
import IconDeviceMultiple from "@/assets/newfirstpageicons/device-multiple-solid-svgrepo-com.svg?component";
import IconFrame from "@/assets/newfirstpageicons/frame-svgrepo-com.svg?component";
import IconKnowledgeGraph from "@/assets/newfirstpageicons/knowledge-graph-dashboard-svgrepo-com.svg?component";
import IconMachineLearning from "@/assets/newfirstpageicons/machine-learning-03-svgrepo-com.svg?component";
import IconMindSmartBulb from "@/assets/newfirstpageicons/mind-smart-light-bulb-svgrepo-com.svg?component";
import IconPlanet from "@/assets/newfirstpageicons/planet-svgrepo-com.svg?component";
import IconRocketInnovation from "@/assets/newfirstpageicons/rocket-innovation-space-svgrepo-com.svg?component";
import IconShieldCheck from "@/assets/newfirstpageicons/shield-check-svgrepo-com.svg?component";

type RgbTriple = [number, number, number];

const router = useRouter();
const isScrolled = ref(false);
const starlightCanvas = ref<HTMLCanvasElement | null>(null);
import { useUserStoreHook } from "@/store/modules/user";

const userStore = useUserStoreHook();
const defaultBannerEdgeColors = {
  top: "rgb(5, 9, 16)",
  bottom: "rgb(15, 23, 42)"
};
const bannerEdgeColors = ref({ ...defaultBannerEdgeColors });
const bannerThemeVars = computed(() => ({
  "--banner-top-color": bannerEdgeColors.value.top,
  "--banner-bottom-color": bannerEdgeColors.value.bottom
}));
const homepageAssetBaseUrl = `${import.meta.env.BASE_URL}homepage`;
const bannerPhoto = `${homepageAssetBaseUrl}/bannerphoto.png`;
const testimonialTeacherPhoto = `${homepageAssetBaseUrl}/teacher.png`;
const testimonialStudentPhoto = `${homepageAssetBaseUrl}/stus.png`;
const testimonialParentPhoto = `${homepageAssetBaseUrl}/parents.png`;

const rgbToCss = ([red, green, blue]: RgbTriple) =>
  `rgb(${red}, ${green}, ${blue})`;

const sampleBandColor = (
  pixels: Uint8ClampedArray,
  width: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number
): RgbTriple => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = pixels[index + 3];
      if (alpha === 0) continue;
      red += pixels[index];
      green += pixels[index + 1];
      blue += pixels[index + 2];
      count += 1;
    }
  }

  if (!count) {
    return [15, 23, 42];
  }

  return [
    Math.round(red / count),
    Math.round(green / count),
    Math.round(blue / count)
  ];
};

const extractBannerEdgeColors = () => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.decoding = "async";

  image.onload = () => {
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = longestSide > 320 ? 320 / longestSide : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      bannerEdgeColors.value = { ...defaultBannerEdgeColors };
      return;
    }

    context.drawImage(image, 0, 0, width, height);

    try {
      const { data } = context.getImageData(0, 0, width, height);
      const xStart = Math.floor(width * 0.16);
      const xEnd = Math.max(xStart + 1, Math.ceil(width * 0.84));
      const topBandHeight = Math.max(1, Math.round(height * 0.06));
      const bottomBandHeight = Math.max(1, Math.round(height * 0.12));
      const topColor = sampleBandColor(
        data,
        width,
        xStart,
        xEnd,
        0,
        topBandHeight
      );
      const bottomColor = sampleBandColor(
        data,
        width,
        xStart,
        xEnd,
        Math.max(0, height - bottomBandHeight),
        height
      );

      bannerEdgeColors.value = {
        top: rgbToCss(topColor),
        bottom: rgbToCss(bottomColor)
      };
    } catch (error) {
      console.warn("[home banner] failed to sample edge colors", error);
      bannerEdgeColors.value = { ...defaultBannerEdgeColors };
    }
  };

  image.onerror = () => {
    bannerEdgeColors.value = { ...defaultBannerEdgeColors };
  };

  image.src = bannerPhoto;
};

const userInfo = computed(() => {
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  const avatar = userStore.avatar || info?.avatar;
  const nickname = userStore.nickname || info?.nickname;
  const username = userStore.username || info?.username;

  // 如果没有任何用户标识信息，返回 null 表示未登录
  if (!avatar && !nickname && !username) {
    return null;
  }

  return {
    avatar,
    nickname,
    username,
    roleType: info?.roleType
  };
});

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
    const roleType =
      info?.roleType ?? (token as any)?.roleType ?? userInfo.value?.roleType;

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

const handleLoginSuccess = async () => {
  // 首先初始化路由，确保菜单数据正确加载
  await initRouter();

  // 登录成功后自动跳转到相应页面
  // 获取最新的登录状态和用户信息
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  const token = getToken();

  // 获取角色信息：优先从 info 中获取
  const roleType =
    info?.roleType ?? (token as any)?.roleType ?? userInfo.value?.roleType;

  console.log("[Login Success] 登录成功，正在准备跳转, roleType:", roleType);

  // 角色类型判断：2:教师 3:管理员，跳转到管理后台；其他跳转到个人中心
  if (Number(roleType) === 2 || Number(roleType) === 3) {
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
  const elements = document.querySelectorAll(
    ".stat-card, .ai-feature-card, .feature-item, .service-card, .tech-card, .innovation-card, .capability-card, .breakthrough-item, .testimonial-card, .hero-btn, .cta-buttons .el-button"
  );
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
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  document
    .querySelectorAll(
      ".stat-card, .ai-feature-card, .feature-item, .service-card, .tech-card, .innovation-card, .capability-card, .breakthrough-item, .testimonial-card, .section-header"
    )
    .forEach(el => {
      el.classList.add("scroll-animate");
      observer.observe(el);
    });
};

// 星光粒子动画相关
interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  speed: number;
  alpha: number;
  delay: number;
}

let starlightAnimationId: number | null = null;
let starlightParticles: Particle[] = [];

const initStarlightAnimation = () => {
  const canvas = starlightCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 设置 canvas尺寸
  const resizeCanvas = () => {
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  };
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // 加载 logo 图片并采样像素
  const logoImg = new Image();
  logoImg.crossOrigin = "anonymous";
  logoImg.src = logo;

  logoImg.onload = () => {
    // 创建临时 canvas 来采样图片像素
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const logoSize = Math.min(canvas.width * 0.4, 200);
    const scale = logoSize / Math.max(logoImg.width, logoImg.height);
    const scaledWidth = logoImg.width * scale;
    const scaledHeight = logoImg.height * scale;

    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    tempCtx.drawImage(logoImg, 0, 0, scaledWidth, scaledHeight);

    // 采样像素点
    const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
    const pixels = imageData.data;
    const targetPoints: { x: number; y: number; color: string }[] = [];

    // 每隔几个像素采样一次
    const sampleRate = 3;
    for (let y = 0; y < scaledHeight; y += sampleRate) {
      for (let x = 0; x < scaledWidth; x += sampleRate) {
        const i = (y * scaledWidth + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // 只采样不透明的像素
        if (a > 128) {
          targetPoints.push({
            x: x,
            y: y,
            color: `rgba(${r}, ${g}, ${b}, 1)`
          });
        }
      }
    }

    // 计算 logo 在 canvas 中的居中位置
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2 - 30;

    // 创建粒子
    starlightParticles = targetPoints.map((point, index) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      targetX: point.x + offsetX,
      targetY: point.y + offsetY,
      size: Math.random() * 2 + 1,
      color: point.color,
      speed: 0.02 + Math.random() * 0.03,
      alpha: 0,
      delay: Math.random() * 2000
    }));

    // 动画开始时间
    const startTime = Date.now();

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      starlightParticles.forEach(particle => {
        // 延迟启动
        if (elapsed < particle.delay) {
          //绘制闪烁的星星
          particle.alpha = Math.random() * 0.5;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
          ctx.fill();
          return;
        }

        //缓动移动到目标位置
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        particle.x += dx * particle.speed;
        particle.y += dy * particle.speed;

        //渐变透明度
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 5) {
          particle.alpha = Math.min(1, particle.alpha + 0.05);
        } else {
          particle.alpha = Math.min(0.8, particle.alpha + 0.02);
        }

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

        // 使用渐变色
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.alpha})`);
        gradient.addColorStop(
          0.5,
          particle.color.replace("1)", `${particle.alpha})`)
        );
        gradient.addColorStop(1, "rgba(96, 165, 250, 0)");

        ctx.fillStyle = gradient;
        ctx.fill();

        // 添加发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#60a5fa";
      });

      // starlightAnimationId = requestAnimationFrame(animate);
    };

    animate();
  };
};

onMounted(() => {
  extractBannerEdgeColors();
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("mousemove", handleMouseMove);
  setTimeout(initScrollAnimations, 100);

  // 使用 IntersectionObserver 延迟加载星光汇聚动画
  nextTick(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            initStarlightAnimation();
            observer.disconnect(); // 只加载一次
          }
        });
      },
      { threshold: 0.1 }
    );

    if (starlightCanvas.value) {
      observer.observe(starlightCanvas.value);
    }
  });
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

const statsData = ref([
  { icon: IconStudent, number: "1,000+", label: "注册学员" },
  { icon: IconTeacher, number: "50+", label: "优秀教师" },
  { icon: IconBook, number: "100+", label: "上线精品课程" },
  { icon: IconStar, number: "98%+", label: "学员满意度" }
]);

const aiFeatures = ref([
  {
    icon: IconBrain,
    title: "智能学情分析",
    description: "AI 深度分析学习数据，精准定位知识薄弱点，生成个性化学习报告"
  },
  {
    icon: IconTarget,
    title: "精准推荐系统",
    description: "基于深度学习算法，智能推荐最适合的学习内容和练习题目"
  },
  {
    icon: IconMessage,
    title: "AI 智能助教",
    description: "24小时在线答疑，智能解析错题，提供个性化学习建议"
  },
  {
    icon: IconChart,
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
    icon: IconBook,
    title: "精品课程",
    description: "名师打造的系统化课程体系，覆盖K12全学科",
    features: ["名师授课", "体系完整", "实时更新", "互动练习"]
  },
  {
    icon: IconRobot,
    title: "AI 辅导",
    description: "智能 AI 助教 24 小时在线，随时解答学习疑惑",
    features: ["即时答疑", "错题分析", "知识讲解", "学习规划"]
  },
  {
    icon: IconEdit,
    title: "智能作业",
    description: "AI 智能批改作业，秒出结果，精准定位问题",
    features: ["自动批改", "错因分析", "针对训练", "进度追踪"]
  },
  {
    icon: IconGraduation,
    title: "成长档案",
    description: "全程记录学习轨迹，见证每一步成长",
    features: ["学习记录", "能力图谱", "成长报告", "荣誉勋章"]
  }
]);

const techStack = ref([
  { icon: IconMindSmartBulb, name: "多模态 AI", version: "大语言模型" },
  { icon: IconMachineLearning, name: "深度学习", version: "神经网络" },
  { icon: IconKnowledgeGraph, name: "知识图谱", version: "智能推荐" },
  { icon: IconFrame, name: "Vue 3", version: "前端框架" },
  { icon: IconRocketInnovation, name: "云原生", version: "微服务架构" },
  { icon: IconShieldCheck, name: "数据安全", version: "隐私保护" },
  { icon: IconDeviceMultiple, name: "多端适配", version: "全平台覆盖" },
  { icon: IconPlanet, name: "边缘计算", version: "低延迟响应" }
]);

const innovationHighlights = ref([
  {
    label: "创新一",
    title: "从传统 RAG 到 Agentic AI",
    description:
      "启明智教引入 Agentic AI 架构，使 AI 具备自主规划、工具调用、多步推理和自我纠错能力。",
    points: ["自主规划", "多工具调用", "多步推理与自纠错"],
    icon: IconRobot
  },
  {
    label: "创新二",
    title: "全流程数据闭环",
    description:
      "系统打通备教学练评五大环节数据流，形成完整教学数据闭环，并持续沉淀领域知识和教学经验。",
    points: ["五环节全链路贯通", "教学数据持续积累", "知识与经验双沉淀"],
    icon: IconChart
  },
  {
    label: "创新三",
    title: "多模态资源引擎",
    description:
      "将长期积累的非结构化数据自动转化为可检索、可引用的结构化智能知识库。",
    points: ["非结构化自动结构化", "高可检索可引用", "跨模态知识融合"],
    icon: IconCrystal
  }
]);

const capabilityHighlights = ref([
  {
    tag: "生态能力",
    title: "支持 MCP 协议的私有 Skill 插件生态",
    description:
      "平台采用热插拔插件架构，可通过 MCP 标准化接口动态挂载外部工具，持续扩展教学能力边界。",
    icon: IconRocket
  },
  {
    tag: "检索能力",
    title: "SAHR 混合检索框架",
    description:
      "重构文档检索切分逻辑，采用动态参数切分与稠密稀疏混合检索，显著提升召回质量与命中效率。",
    icon: IconTarget
  },
  {
    tag: "诊断能力",
    title: "多维学情追踪与自适应引擎",
    description:
      "融合深度知识追踪模型与项目反应理论，实现学习过程的动态评估、个性化诊断与策略自适应。",
    icon: IconTrending
  }
]);

const technicalBreakthroughs = ref([
  "面向教育垂直场景的大模型精调与对齐技术",
  "SAHR 语义自适应切分与交叉映射重排序算法",
  "基于 MCP 协议的微服务动态注册与双向通信架构",
  "多模态智能体意图识别与任务自动化编排技术",
  "基于思维链的错题语义偏离度计算与诊断算法",
  "融合长短期记忆网络与三参数反应理论的动态学情评估算法",
  "基于知识元拓扑的 HTML5 动态课件生成技术"
]);

type TestimonialItem = {
  content: string;
  name: string;
  title: string;
  avatar: string;
  tag?: string;
  accent?: string;
  background?: string;
};

const testimonials = ref<TestimonialItem[]>([
  {
    content:
      "启明智教帮助我找到了学习的薄弱点，针对性练习后成绩提升了很多，特别是错题分析功能太实用了！",
    name: "小明同学",
    title: "大学教育阶段学生",
    avatar: "明"
  },
  {
    content:
      "作为老师，这个平台大大减轻了我的工作负担，智能批改和学情分析让我能更好地因材施教。",
    name: "张老师",
    title: "高中数学教师",
    avatar: "张"
  },
  {
    content:
      "孩子的学习数据一目了然，AI 推荐的学习计划很科学，再也不用担心孩子的学习没有方向了。",
    name: "李女士",
    title: "学生家长",
    avatar: "李"
  }
]);

const testimonialEnhancements = [
  {
    tag: "学生反馈",
    accent: "#38bdf8",
    background: testimonialStudentPhoto
  },
  {
    tag: "教师视角",
    accent: "#a78bfa",
    background: testimonialTeacherPhoto
  },
  {
    tag: "家长评价",
    accent: "#f59e0b",
    background: testimonialParentPhoto
  }
];

testimonials.value = testimonials.value.map((item, index) => ({
  ...item,
  ...testimonialEnhancements[index]
}));

const competitors = ref([
  {
    logo: "A",
    name: "传统网校A",
    isUs: false,
    features: [
      { name: "AI智能推荐", status: "no" },
      { name: "个性化学习路径", status: "no" },
      { name: "实时学情分析", status: "partial", value: "基础" },
      { name: "智能错题本", status: "no" },
      { name: "AI助教答疑", status: "no" }
    ],
    price: "¥2999/年"
  },
  {
    logo: "B",
    name: "在线教育B",
    isUs: false,
    features: [
      { name: "AI智能推荐", status: "partial", value: "基础" },
      { name: "个性化学习路径", status: "no" },
      { name: "实时学情分析", status: "yes" },
      { name: "智能错题本", status: "partial", value: "手动" },
      { name: "AI助教答疑", status: "no" }
    ],
    price: "¥1999/年"
  },
  {
    logo: "★",
    name: "启明智教",
    isUs: true,
    features: [
      { name: "AI智能推荐", status: "yes" },
      { name: "个性化学习路径", status: "yes" },
      { name: "实时学情分析", status: "yes" },
      { name: "智能错题本", status: "yes" },
      { name: "AI助教答疑", status: "yes" }
    ],
    price: "¥999/年"
  },
  {
    logo: "C",
    name: "教育平台C",
    isUs: false,
    features: [
      { name: "AI智能推荐", status: "partial", value: "有限" },
      { name: "个性化学习路径", status: "partial", value: "模板" },
      { name: "实时学情分析", status: "yes" },
      { name: "智能错题本", status: "yes" },
      { name: "AI助教答疑", status: "partial", value: "机器人" }
    ],
    price: "¥2499/年"
  }
]);

const advantages = ref([
  { icon: "→", title: "性价比最高", desc: "同等功能，价格仅为竞品的1/3" },
  { icon: "AI", title: "AI深度融合", desc: "全链路AI赋能，真正的智能学习" },
  { icon: "图", title: "数据驱动", desc: "实时学情分析，精准定位问题" },
  { icon: "→", title: "个性化体验", desc: "千人千面，专属学习路径" }
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
      // 重置 userStore 状态，确保 UI 正确显示未登录状态
      userStore.SET_AVATAR("");
      userStore.SET_USERNAME("");
      userStore.SET_NICKNAME("");
      ElMessage.success("退出登录成功");
      break;
  }
};
</script>

<style lang="scss" scoped>
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes float-particle {
  0% {
    opacity: 0;
    transform: translateY(100vh);
  }

  10% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.8;
  }

  100% {
    opacity: 0;
    transform: translateY(-100px);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-10px);
  }
}

@keyframes rotate-orbit {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes float-card {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* 标题文字渐变动画 */
@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 浮动阴影效果 */
@keyframes float-shadow {
  0%,
  100% {
    box-shadow: 0 15px 30px rgb(96 165 250 / 15%);
    transform: translateY(0);
  }

  50% {
    box-shadow: 0 25px 50px rgb(96 165 250 / 25%);
    transform: translateY(-8px);
  }
}

/* 文字打字机效果光标 */
@keyframes blink-cursor {
  0%,
  50% {
    border-color: #60a5fa;
  }

  51%,
  100% {
    border-color: transparent;
  }
}

@keyframes icon-spin {
  0% {
    transform: rotateY(0deg);
  }

  100% {
    transform: rotateY(360deg);
  }
}

/* 星星闪烁增强 */
@keyframes twinkle-enhanced {
  0%,
  100% {
    opacity: 0.3;
    filter: blur(0);
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    filter: blur(1px);
    transform: scale(1.2);
  }
}

/* 数字跳动效果 */
@keyframes number-pop {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

/* 引用符号动画 */
@keyframes quote-float {
  0%,
  100% {
    opacity: 0.15;
    transform: translateY(0) rotate(-5deg);
  }

  50% {
    opacity: 0.25;
    transform: translateY(-10px) rotate(5deg);
  }
}

/* Logo 呼吸效果 */
@keyframes logo-breathe {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgb(96 165 250 / 50%));
  }

  50% {
    filter: drop-shadow(0 0 15px rgb(96 165 250 / 80%));
  }
}

/* CTA 按钮闪烁边框 */
@keyframes border-glow {
  0%,
  100% {
    box-shadow:
      0 0 5px #60a5fa,
      0 0 10px #60a5fa;
  }

  50% {
    box-shadow:
      0 0 15px #60a5fa,
      0 0 30px #60a5fa;
  }
}

@media screen and (width <= 1200px) {
  .header .header-content {
    padding: 0 40px;

    .nav-links {
      display: none;
    }
  }

  .carousel-content .carousel-text {
    padding: 0 40px;

    .main-title {
      font-size: 52px;
    }

    .sub-title {
      font-size: 36px;
    }
  }

  .ai-power-section {
    .ai-power-container {
      gap: 30px;
    }

    .ai-features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .services-section .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tech-section .tech-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .innovation-section .innovation-grid,
  .capability-section .capability-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-section .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
}

@media screen and (width <= 768px) {
  .header .header-content {
    padding: 0 20px;

    .logo .logo-text {
      display: none;
    }
  }

  .carousel-content .carousel-text {
    padding: 0 20px;

    .main-title {
      font-size: 36px;
    }

    .sub-title {
      font-size: 24px;
    }

    .hero-desc {
      font-size: 14px;
    }

    .hero-buttons {
      flex-direction: column;

      .hero-btn {
        width: 100%;
      }
    }
  }

  .stats-section {
    .stats-container {
      flex-wrap: wrap;
    }

    .stat-card {
      min-width: calc(50% - 15px);
      padding: 24px 16px;

      .stat-number {
        font-size: 28px;
      }
    }
  }

  .ai-power-section {
    .ai-power-container {
      flex-direction: column;
      gap: 40px;
    }

    .ai-video-left {
      flex: 1;
      width: 100%;
    }

    .ai-content-right .section-header {
      text-align: center;

      .section-desc {
        margin: 0 auto;
      }
    }

    .ai-features-grid {
      grid-template-columns: 1fr;
    }
  }

  .transition-image-section .transition-content {
    flex-direction: column;
    gap: 60px;
    text-align: center;

    .transition-text h2 {
      font-size: 32px;
    }
  }

  .platform-intro,
  .services-section,
  .tech-section,
  .innovation-section,
  .capability-section,
  .breakthrough-section,
  .testimonials-section {
    padding: 80px 0;
  }

  .section-header .section-title {
    font-size: 32px;
  }

  .platform-intro .feature-list {
    grid-template-columns: 1fr;
  }

  .transition-section-2 .transition-overlay .big-quote p {
    font-size: 20px;
  }

  .services-section .services-grid {
    grid-template-columns: 1fr;
  }

  .tech-section .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .innovation-section .innovation-grid,
  .capability-section .capability-grid,
  .breakthrough-section .breakthrough-panel {
    grid-template-columns: 1fr;
  }

  .testimonials-section .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .footer-section .footer-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .cta-section .cta-content {
    h2 {
      font-size: 28px;
    }

    .cta-buttons {
      flex-direction: column;
      padding: 0 20px;
    }
  }
}

.home-container {
  width: 100%;
  min-height: 100vh;
  color: #fff;
  background: linear-gradient(180deg, #000 0%, #0f172a 15%, #1e293b 100%);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 70px;
  background: transparent;
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;

  &.header-scrolled {
    background: rgb(0 0 0 / 95%);
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
      gap: 12px;
      align-items: center;
      height: 48px;
      cursor: pointer;

      img {
        height: 48px;
        padding: 4px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        image-rendering: -webkit-optimize-contrast;
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
        color: rgb(255 255 255 / 60%);
        letter-spacing: 1px;
      }
    }

    .nav-links {
      display: flex;
      gap: 40px;

      .nav-link {
        font-size: 15px;
        font-weight: 500;
        color: #000;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          color: #60a5fa;
        }
      }
    }

    .login-btn.el-button {
      height: 42px;
      padding: 0 32px;
      font-size: 15px;
      font-weight: 600;
      color: #0a0a1a;
      cursor: pointer;
      background: #60a5fa;
      border: none;
      border-radius: 24px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 8px 25px rgb(96 165 250 / 40%);
        transform: translateY(-2px);
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
        color: rgb(255 255 255 / 60%);
        transition: transform 0.3s ease;
      }
    }
  }
}

.banner {
  position: relative;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    var(--banner-top-color, #050910) 0%,
    var(--banner-top-color, #050910) 18%,
    var(--banner-bottom-color, #0f172a) 100%
  );

  .banner-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center 30%;
    background-repeat: no-repeat;

    /* 上方柔和模糊渐隐 */
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 18%;
      z-index: 1;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      mask-image: linear-gradient(180deg, #000 0%, transparent 100%);
      -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 100%);
    }

    /* 下方柔和模糊渐隐 */
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 22%;
      z-index: 1;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      mask-image: linear-gradient(0deg, #000 0%, transparent 100%);
      -webkit-mask-image: linear-gradient(0deg, #000 0%, transparent 100%);
    }
  }

  .banner-signature {
    position: absolute;
    right: 40px;
    bottom: 80px;
    z-index: 10;
    text-align: right;
    font-family: "FangSong", "仿宋", STFangsong, serif;

    p {
      margin: 0;
      padding: 6px 0;
      font-size: 22px;
      font-weight: 700;
      color: #000;
      text-shadow: none;
      letter-spacing: 3px;
    }
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    pointer-events: none;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.45) 0%,
      rgba(0, 0, 0, 0) 100%
    );

    .carousel-text {
      position: relative;
      z-index: 3;
      display: inline-block;
      width: auto;
      max-width: fit-content;
      padding: 32px 48px;
      pointer-events: auto;
      background: rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

      .hero-badge {
        display: inline-block;
        padding: 8px 20px;
        margin-bottom: 24px;
        font-size: 14px;
        font-weight: 500;
        color: #60a5fa;
        letter-spacing: 0.5px;
        background: rgb(96 165 250 / 10%);
        border: 1px solid rgb(96 165 250 / 30%);
        border-radius: 30px;
        backdrop-filter: blur(4px);
      }

      .main-title {
        margin: 0 0 16px;
        font-size: 72px;
        font-weight: 800;
        color: #fff;
        line-height: 1.1;
        letter-spacing: 4px;
        text-shadow: 0 10px 30px rgb(0 0 0 / 50%);
      }

      .sub-title {
        margin: 0 0 20px;
        font-size: 42px;
        font-weight: 600;
        letter-spacing: 2px;
        background: linear-gradient(
          135deg,
          #5dade2 0%,
          #85c1e9 50%,
          #aed6f1 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }

      .hero-desc {
        margin: 0 0 32px;
        font-size: 17px;
        font-weight: 400;
        line-height: 1.7;
        color: rgb(255 255 255 / 75%);
        letter-spacing: 0.5px;
      }

      .hero-buttons {
        position: relative;
        z-index: 100;
        display: flex;
        gap: 16px;
        pointer-events: auto;

        /* 用 gap 控制间距，避免 Element Plus 默认 sibling margin 导致错位 */
        .el-button + .el-button {
          margin-left: 0 !important;
        }

        .hero-btn {
          position: relative;
          z-index: 101;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 54px;
          padding: 0 38px;
          overflow: hidden;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          pointer-events: auto;
          cursor: pointer;
          border: none;
          border-radius: 30px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

          :deep(span) {
            position: relative;
            z-index: 2;
            display: flex;
            gap: 8px;
            align-items: center;
            cursor: pointer;
          }

          &:hover {
            box-shadow: 0 20px 40px rgb(0 0 0 / 40%);
            transform: translateY(-6px) scale(1.05);
          }

          &.primary.el-button--primary {
            color: #0a0a1a;
            background:
              radial-gradient(
                circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgb(255 255 255 / 50%),
                transparent
              ),
              #60a5fa;
            box-shadow: 0 4px 15px rgb(96 165 250 / 40%);

            &::before {
              position: absolute;
              top: 0;
              left: -100%;
              z-index: 1;
              width: 100%;
              height: 100%;
              pointer-events: none;
              content: "";
              background: linear-gradient(
                90deg,
                transparent,
                rgb(255 255 255 / 40%),
                transparent
              );
              transition: 0.6s;
            }

            &:hover {
              box-shadow: 0 12px 30px rgb(96 165 250 / 60%);

              &::before {
                left: 100%;
              }
            }
          }

          &.secondary.el-button {
            color: #fff;
            background:
              radial-gradient(
                circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgb(255 255 255 / 30%),
                transparent
              ),
              rgb(255 255 255 / 10%);
            border: 2px solid rgb(255 255 255 / 30%);
            backdrop-filter: blur(10px);

            &:hover {
              background:
                radial-gradient(
                  circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
                  rgb(255 255 255 / 40%),
                  transparent
                ),
                rgb(255 255 255 / 20%);
              border-color: rgb(255 255 255 / 60%);
            }
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
  color: rgb(255 255 255 / 60%);
  text-align: center;
  transform: translateX(-50%);

  .scroll-arrow .el-icon.animated {
    /* animation: bounce 2s infinite; */
  }
}

.wave-transition {
  z-index: 5;
  margin-top: -2px;
  background: linear-gradient(
    180deg,
    var(--banner-bottom-color, #0f172a) 0%,
    var(--banner-bottom-color, #0f172a) 58%,
    #0f172a 100%
  );

  svg {
    display: block;
    width: 100%;
    height: 40px;
  }
}

.stats-section {
  padding: 30px 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .stats-container {
    box-sizing: border-box;
    display: flex;
    gap: 30px;
    justify-content: stretch;
    width: 100%;
    max-width: 100%;
    padding: 0 60px;
    margin: 0 auto;
    perspective: 1000px;
  }

  .stat-card {
    position: relative;
    flex: 1;
    max-width: none;
    padding: 40px 30px;
    text-align: center;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 24px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      content: "";
      background: radial-gradient(
        800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 6%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      background: linear-gradient(
        145deg,
        rgb(20 20 20 / 50%) 0%,
        rgb(10 10 10 / 70%) 100%
      );
      border-color: rgb(96 165 250 / 50%);
      box-shadow: 0 20px 40px rgb(96 165 250 / 15%);
      transform: translateY(-12px) scale(1.03);

      &::before {
        opacity: 1;
      }
    }

    .stat-icon,
    .stat-number,
    .stat-label {
      position: relative;
      z-index: 1;
    }

    .stat-icon {
      margin-bottom: 16px;
      font-size: 40px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover .stat-icon {
      transform: scale(1.1);
    }

    .stat-number {
      font-size: 36px;
      font-weight: 800;
      color: #60a5fa;
      transition: transform 0.3s;
    }

    &:hover .stat-number {
      transform: scale(1.1);
    }

    .stat-label {
      font-size: 15px;
      color: rgb(255 255 255 / 60%);
    }
  }
}

.ai-power-section {
  position: relative;
  padding: 80px 0;
  overflow: hidden;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .ai-power-container {
    display: flex;
    gap: 60px;
    align-items: center;
    justify-content: space-between;
  }

  .ai-content-right {
    position: relative;
    z-index: 2;
    flex: 1;

    .section-header {
      text-align: left;
      margin-bottom: 40px;

      .section-desc {
        margin-left: 0;
      }
    }
  }

  .ai-features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .ai-feature-card {
    position: relative;
    padding: 40px 30px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 24px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      content: "";
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 8%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      background: linear-gradient(
        145deg,
        rgb(20 20 20 / 60%) 0%,
        rgb(10 10 10 / 80%) 100%
      );
      border-color: rgb(96 165 250 / 60%);
      box-shadow:
        0 25px 50px rgb(96 165 250 / 20%),
        0 10px 20px rgb(0 0 0 / 30%);
      transform: translateY(-12px) rotateX(5deg) scale(1.02);

      &::before {
        opacity: 1;
      }

      .ai-glow {
        opacity: 1;
      }
    }

    .ai-icon,
    h3,
    p,
    .ai-glow {
      position: relative;
      z-index: 1;
    }

    .ai-icon {
      margin-bottom: 20px;
      font-size: 48px;
      transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    &:hover .ai-icon {
      transform: scale(1.1);
    }

    h3 {
      margin-bottom: 12px;
      font-size: 20px;
      color: #fff;
      transition: color 0.3s;
    }

    &:hover h3 {
      background: #60a5fa;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 14px;
      color: rgb(255 255 255 / 60%);
    }

    .ai-glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(
        circle at center,
        rgb(96 165 250 / 15%) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }
  }

  .ai-decoration {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 600px;
    height: 600px;
    pointer-events: none;
    transform: translate(-50%, -50%);

    .orbit {
      position: absolute;
      border: 1px solid rgb(96 165 250 / 10%);
      border-radius: 50%;
      /* animation: rotateOrbit 20s linear infinite; */

      &.orbit-1 {
        inset: 0;
      }

      &.orbit-2 {
        inset: 50px;
        /* animation-duration: 25s; */
        animation-direction: reverse;
      }

      &.orbit-3 {
        inset: 100px;
        /* animation-duration: 30s; */
      }
    }
  }
}

.transition-image-section {
  padding: 80px 0;
  overflow: hidden;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .transition-content {
    box-sizing: border-box;
    display: flex;
    gap: 60px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 100%;
    padding: 0 60px;
    margin: 0 auto;
  }

  .transition-text {
    flex: 0 0 45%;
    max-width: 550px;

    h2 {
      margin-bottom: 24px;
      font-size: 48px;
      font-weight: 700;
      line-height: 1.3;
      color: #fff;
    }

    p {
      margin-bottom: 40px;
      font-size: 18px;
      color: rgb(255 255 255 / 60%);
    }

    .transition-stats {
      display: flex;
      gap: 40px;

      .stat-item {
        display: flex;
        flex-direction: column;

        .stat-number {
          margin-bottom: 4px;
          font-size: 32px;
          font-weight: 700;
          color: #60a5fa;
        }

        .stat-label {
          font-size: 14px;
          color: rgb(255 255 255 / 50%);
        }
      }
    }
  }

  .transition-visual {
    position: relative;
    display: flex;
    flex: 0 0 50%;
    align-items: center;
    justify-content: center;
    min-height: 400px;

    .visual-glow {
      position: absolute;
      z-index: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(
        circle,
        rgb(96 165 250 / 15%) 0%,
        transparent 70%
      );
      border-radius: 50%;
      filter: blur(40px);
    }

    .visual-grid {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 500px;
      height: 380px;

      .grid-card {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgb(255 255 255 / 3%);
        border: 1px solid rgb(255 255 255 / 8%);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgb(255 255 255 / 6%);
          border-color: rgb(96 165 250 / 30%);
          transform: translateY(-5px);
        }

        .card-icon {
          margin-bottom: 8px;
          font-size: 36px;
        }

        .card-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .card-desc {
          padding: 0 10px;
          margin-top: 4px;
          font-size: 12px;
          color: rgb(255 255 255 / 50%);
          text-align: center;
        }

        &.card-large {
          top: 50%;
          left: 50%;
          z-index: 3;
          width: 180px;
          height: 160px;
          background: linear-gradient(
            135deg,
            rgb(96 165 250 / 10%) 0%,
            rgb(96 165 250 / 5%) 100%
          );
          border-color: rgb(96 165 250 / 20%);
          transform: translate(-50%, -50%);

          .card-icon {
            font-size: 48px;
          }

          .card-title {
            font-size: 16px;
          }

          &:hover {
            transform: translate(-50%, -55%);
          }
        }

        &.card-medium {
          width: 130px;
          height: 110px;
        }

        &.card-top-right {
          top: 20px;
          right: 30px;
        }

        &.card-bottom-left {
          bottom: 20px;
          left: 30px;
        }

        &.card-small {
          width: 60px;
          height: 60px;
          font-size: 28px;

          &.card-1 {
            top: 10px;
            left: 60px;
            animation-delay: 0s;
          }

          &.card-2 {
            top: 60px;
            right: 20px;
            animation-delay: 0.5s;
          }

          &.card-3 {
            right: 50px;
            bottom: 60px;
            animation-delay: 1s;
          }

          &.card-4 {
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            animation-delay: 1.5s;
          }

          &.card-5 {
            top: 50%;
            left: 10px;
            transform: translateY(-50%);
            animation-delay: 2s;
          }
        }
      }
    }
  }
}

.section-container {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 0 60px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 30px;
  text-align: center;

  &.light {
    .section-title {
      color: #fff;
    }

    .section-desc {
      color: rgb(255 255 255 / 60%);
    }
  }

  &.dark {
    .section-title {
      color: #1a1a2e;
    }

    .section-desc {
      color: #64748b;
    }

    .section-badge {
      background: rgb(96 165 250 / 15%);
    }
  }

  .section-badge {
    display: inline-block;
    padding: 6px 16px;
    margin-bottom: 16px;
    font-size: 12px;
    font-weight: 600;
    color: #60a5fa;
    letter-spacing: 2px;
    background: rgb(96 165 250 / 10%);
    border-radius: 20px;
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 36px;
    font-weight: 700;
    color: #fff;
  }

  .section-desc {
    max-width: 600px;
    margin: 0 auto;
    font-size: 16px;
    color: rgb(255 255 255 / 60%);
  }
}

.platform-intro {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .feature-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    perspective: 1000px;
  }

  .feature-item {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 24px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 30%);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      content: "";
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 10%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      border-color: rgb(96 165 250 / 50%);
      box-shadow:
        0 30px 60px rgb(96 165 250 / 20%),
        0 15px 30px rgb(0 0 0 / 40%);
      transform: translateY(-15px) rotateX(5deg);

      &::before {
        opacity: 1;
      }

      .feature-image img {
        transform: scale(1.15);
      }

      .feature-overlay {
        background: linear-gradient(
          180deg,
          transparent 30%,
          rgb(0 0 0 / 95%) 100%
        );
      }
    }

    a {
      display: block;
      text-decoration: none;
    }

    .feature-image {
      aspect-ratio: 4/3;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .feature-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 30px;
      background: linear-gradient(
        180deg,
        transparent 40%,
        rgb(0 0 0 / 85%) 100%
      );
      transition: background 0.5s ease;

      h3 {
        margin-bottom: 8px;
        font-size: 24px;
        font-weight: 700;
        color: #fff;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgb(255 255 255 / 90%);
      }
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
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }

  .transition-overlay {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .big-quote {
      max-width: 800px;
      padding: 0 40px;
      text-align: center;

      .quote-mark {
        font-size: 80px;
        line-height: 0.5;
        color: rgb(96 165 250 / 30%);
      }

      p {
        margin: 16px 0;
        font-size: 24px;
        font-style: italic;
        font-weight: 300;
        color: #fff;
      }

      .quote-author {
        font-size: 14px;
        color: rgb(255 255 255 / 50%);
      }
    }
  }
}

.services-section {
  padding: 50px 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .services-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    perspective: 1000px;
  }

  .service-card {
    position: relative;
    padding: 40px 30px;
    overflow: hidden;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
    backface-visibility: hidden;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      content: "";
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 8%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      background: linear-gradient(
        145deg,
        rgb(20 20 20 / 80%) 0%,
        rgb(10 10 10 / 90%) 100%
      );
      border-color: rgb(96 165 250 / 50%);
      box-shadow:
        0 20px 40px rgb(96 165 250 / 15%),
        0 10px 20px rgb(0 0 0 / 30%);
      transform: translateY(-10px) scale(1.02);

      &::before {
        opacity: 1;
      }
    }

    .service-icon,
    h3,
    p {
      position: relative;
      z-index: 1;
    }

    .service-icon {
      margin-bottom: 20px;
      font-size: 48px;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover .service-icon {
      transform: scale(1.2) rotateZ(10deg);
    }

    .service-title {
      margin-bottom: 12px;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }

    .service-desc {
      margin-bottom: 20px;
      font-size: 14px;
      color: rgb(255 255 255 / 60%);
    }

    .service-features {
      padding: 0;
      margin: 0;
      list-style: none;

      li {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
        font-size: 13px;
        color: rgb(255 255 255 / 70%);
        transition: all 0.3s;

        .el-icon {
          color: #60a5fa;
          transition: transform 0.3s;
        }
      }
    }

    &:hover .service-features li {
      transform: translateX(5px);

      .el-icon {
        transform: scale(1.2);
      }
    }
  }
}

.tech-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 20px;
    perspective: 800px;
  }

  .tech-card {
    position: relative;
    padding: 30px 20px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      content: "";
      background: radial-gradient(
        400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 8%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      background: linear-gradient(
        145deg,
        rgb(96 165 250 / 10%) 0%,
        rgb(96 165 250 / 5%) 100%
      );
      border-color: rgb(96 165 250 / 50%);
      box-shadow: 0 15px 30px rgb(96 165 250 / 20%);
      transform: translateY(-8px) rotateY(10deg);

      &::before {
        opacity: 1;
      }
    }

    .tech-icon,
    .tech-name,
    .tech-version {
      position: relative;
      z-index: 1;
    }

    .tech-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      margin: 0 auto 12px;
      font-size: 36px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      line-height: 1;
    }

    &:hover .tech-icon {
      transform: scale(1.1);
    }

    .tech-name {
      margin-bottom: 4px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .tech-version {
      font-size: 12px;
      color: rgb(255 255 255 / 50%);
    }
  }
}

.innovation-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #0f172a 0%, #18263d 100%);

  .innovation-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    perspective: 1000px;
  }

  .innovation-card {
    position: relative;
    padding: 32px 26px;
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow:
        0 20px 40px rgb(96 165 250 / 18%),
        0 8px 20px rgb(2 6 23 / 30%);
      transform: translateY(-10px);
    }

    .innovation-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .innovation-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 600;
      color: #bfdbfe;
      letter-spacing: 0.04em;
      background: rgb(96 165 250 / 14%);
      border: 1px solid rgb(147 197 253 / 35%);
      border-radius: 999px;
    }

    .innovation-icon {
      font-size: 30px;
      color: #60a5fa;
    }

    h3 {
      margin: 0 0 10px;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.35;
      color: #fff;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.75;
      color: rgb(255 255 255 / 72%);
    }

    .innovation-points {
      display: grid;
      gap: 8px;
      padding: 0;
      margin: 16px 0 0;
      list-style: none;

      li {
        position: relative;
        padding-left: 16px;
        font-size: 13px;
        line-height: 1.6;
        color: rgb(191 219 254 / 88%);

        &::before {
          position: absolute;
          top: 8px;
          left: 0;
          width: 6px;
          height: 6px;
          content: "";
          background: rgb(96 165 250 / 90%);
          border-radius: 50%;
        }
      }
    }
  }
}

.capability-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #18263d 0%, #1e293b 100%);

  .capability-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    perspective: 1000px;
  }

  .capability-card {
    position: relative;
    padding: 30px 24px;
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: rgb(96 165 250 / 50%);
      box-shadow:
        0 18px 34px rgb(96 165 250 / 15%),
        0 8px 18px rgb(2 6 23 / 30%);
      transform: translateY(-8px);
    }

    .capability-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 0 12px;
      margin-bottom: 16px;
      font-size: 12px;
      font-weight: 600;
      color: rgb(147 197 253 / 95%);
      letter-spacing: 0.04em;
      background: rgb(96 165 250 / 12%);
      border: 1px solid rgb(96 165 250 / 35%);
      border-radius: 999px;
    }

    .capability-icon {
      margin-bottom: 14px;
      font-size: 32px;
      color: #60a5fa;
    }

    h3 {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 700;
      line-height: 1.4;
      color: #fff;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.75;
      color: rgb(255 255 255 / 70%);
    }
  }
}

.breakthrough-section {
  position: relative;
  padding: 50px 0;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);

  .breakthrough-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .breakthrough-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 18px 20px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgb(96 165 250 / 45%);
      background: rgb(96 165 250 / 8%);
      transform: translateY(-4px);
    }

    .breakthrough-index {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      margin-top: 1px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      background: #60a5fa;
      border-radius: 50%;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: rgb(255 255 255 / 78%);
    }
  }
}

.testimonials-section {
  padding: 50px 0;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    align-items: stretch;
    perspective: 1000px;
  }

  .testimonial-card {
    position: relative;
    display: flex;
    min-height: 360px;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    isolation: isolate;
    background:
      linear-gradient(180deg, rgb(15 23 42 / 12%) 0%, rgb(15 23 42 / 72%) 100%),
      rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgb(2 6 23 / 20%);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;

    .testimonial-media,
    .testimonial-backdrop,
    .testimonial-shell {
      position: absolute;
      inset: 0;
    }

    .testimonial-media {
      z-index: 0;
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      filter: blur(2px) brightness(0.5) saturate(0.92);
      transform: scale(1.12);
      transition:
        transform 0.6s ease,
        filter 0.6s ease;
    }

    .testimonial-backdrop {
      z-index: 1;
      background:
        linear-gradient(
          180deg,
          rgb(15 23 42 / 18%) 0%,
          rgb(15 23 42 / 74%) 52%,
          rgb(2 6 23 / 94%) 100%
        ),
        linear-gradient(135deg, rgb(59 130 246 / 18%) 0%, transparent 58%);
    }

    .testimonial-shell {
      position: relative;
      z-index: 3;
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: flex-end;
      padding: 28px;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 2;
      content: "";
      background: radial-gradient(
        600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgb(255 255 255 / 14%),
        transparent 40%
      );
      opacity: 0;
      transition: opacity 0.5s;
    }

    &:hover {
      border-color: rgb(255 255 255 / 16%);
      box-shadow: 0 28px 70px rgb(2 6 23 / 30%);
      transform: translateY(-8px) rotateX(3deg);

      &::after {
        opacity: 1;
      }

      .testimonial-media {
        filter: blur(3px) brightness(0.46) saturate(0.96);
        transform: scale(1.16);
      }
    }

    .testimonial-tag {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      min-height: 32px;
      margin-bottom: auto;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
      color: #fff;
      letter-spacing: 0.04em;
      background: rgb(15 23 42 / 56%);
      border: 1px solid rgb(255 255 255 / 16%);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 4%);
      border-radius: 999px;
      backdrop-filter: blur(8px);
    }

    .quote-icon {
      display: block;
      margin: 56px 0 14px;
      font-size: 52px;
      font-family: Georgia, "Times New Roman", serif;
      line-height: 0.8;
      color: var(--testimonial-accent);
      opacity: 0.88;
      transition: all 0.4s;
    }

    &:hover .quote-icon {
      opacity: 1;
      transform: translateY(-2px) scale(1.04);
    }

    .testimonial-content {
      margin-bottom: 26px;
      font-size: 16px;
      line-height: 1.8;
      color: rgb(255 255 255 / 92%);
      text-shadow: 0 2px 16px rgb(2 6 23 / 35%);
    }

    .testimonial-author {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-top: auto;
      padding-top: 18px;
      border-top: 1px solid rgb(255 255 255 / 14%);

      .author-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        background: var(--testimonial-accent);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 14%);
        border-radius: 50%;
      }

      .author-name {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
      }

      .author-title {
        font-size: 13px;
        line-height: 1.5;
        color: rgb(255 255 255 / 72%);
      }
    }
  }
}

.cta-section {
  position: relative;
  padding: 40px 0;
  overflow: hidden;
  text-align: center;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .cta-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .cta-star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      /* animation: twinkle ease-in-out infinite; */
    }
  }

  .cta-content {
    position: relative;
    z-index: 2;

    h2 {
      margin-bottom: 16px;
      font-size: 42px;
      font-weight: 700;
      color: #fff;
    }

    p {
      margin-bottom: 40px;
      font-size: 18px;
      color: rgb(255 255 255 / 70%);
    }

    .cta-buttons {
      position: relative;
      z-index: 10;
      display: flex;
      gap: 20px;
      justify-content: center;
      pointer-events: auto;

      .el-button {
        position: relative;
        height: 54px;
        padding: 0 42px;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        pointer-events: auto;
        cursor: pointer;
        border-radius: 30px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        :deep(span) {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 8px;
          align-items: center;
          cursor: pointer;
        }

        &:hover {
          box-shadow: 0 20px 40px rgb(0 0 0 / 50%);
          transform: translateY(-6px) scale(1.05);
        }

        &.el-button--primary {
          color: #0a0a1a;
          background:
            radial-gradient(
              circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgb(255 255 255 / 50%),
              transparent
            ),
            #60a5fa;
          border: none;
          box-shadow: 0 4px 15px rgb(96 165 250 / 40%);

          &:hover {
            box-shadow: 0 12px 30px rgb(96 165 250 / 60%);
          }
        }

        &.is-plain.el-button {
          color: #fff;
          background:
            radial-gradient(
              circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
              rgb(255 255 255 / 30%),
              transparent
            ),
            transparent;
          border: 2px solid rgb(255 255 255 / 30%);

          &:hover {
            background:
              radial-gradient(
                circle 120px at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgb(255 255 255 / 40%),
                transparent
              ),
              rgb(255 255 255 / 10%);
            border-color: rgb(255 255 255 / 50%);
          }
        }
      }
    }
  }
}

.footer-section {
  padding: 50px 0 30px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .footer-container {
    max-width: 1300px;
    padding: 0 40px;
    margin: 0 auto;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-brand {
    .footer-logo {
      height: 40px;
      margin-bottom: 20px;
    }

    .footer-desc {
      margin-bottom: 24px;
      font-size: 14px;
      color: rgb(255 255 255 / 50%);
    }

    .social-links {
      display: flex;
      gap: 12px;

      .social-link {
        padding: 8px 16px;
        font-size: 13px;
        color: rgb(255 255 255 / 70%);
        text-decoration: none;
        background: rgb(255 255 255 / 5%);
        border-radius: 20px;
        transition: all 0.3s;

        &:hover {
          color: #0a0a1a;
          background: #60a5fa;
        }
      }
    }
  }

  .footer-links-group {
    h4 {
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    a {
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
      color: rgb(255 255 255 / 50%);
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: #60a5fa;
      }
    }
  }

  .footer-bottom {
    padding-top: 40px;
    text-align: center;
    border-top: 1px solid rgb(255 255 255 / 10%);

    p {
      margin: 6px 0;
      font-size: 13px;
      color: rgb(255 255 255 / 40%);
    }

    .company-info {
      margin-bottom: 8px;
      font-size: 14px;
      color: rgb(255 255 255 / 50%);
    }

    .school-info {
      margin-bottom: 12px !important;
      font-size: 14px !important;
      color: rgb(255 255 255 / 60%) !important;

      .domain {
        margin-left: 10px;
        font-weight: 500;
        color: #60a5fa;
      }
    }

    .website-link {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: #93c5fd;
      }
    }
  }
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
.stat-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.stat-card.scroll-animate:nth-child(2) {
  transition-delay: 0.1s;
}

.stat-card.scroll-animate:nth-child(3) {
  transition-delay: 0.2s;
}

.stat-card.scroll-animate:nth-child(4) {
  transition-delay: 0.3s;
}

.ai-feature-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.ai-feature-card.scroll-animate:nth-child(2) {
  transition-delay: 0.15s;
}

.ai-feature-card.scroll-animate:nth-child(3) {
  transition-delay: 0.3s;
}

.ai-feature-card.scroll-animate:nth-child(4) {
  transition-delay: 0.45s;
}

.feature-item.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.feature-item.scroll-animate:nth-child(2) {
  transition-delay: 0.2s;
}

.feature-item.scroll-animate:nth-child(3) {
  transition-delay: 0.4s;
}

.service-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.service-card.scroll-animate:nth-child(2) {
  transition-delay: 0.15s;
}

.service-card.scroll-animate:nth-child(3) {
  transition-delay: 0.3s;
}

.service-card.scroll-animate:nth-child(4) {
  transition-delay: 0.45s;
}

.tech-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.tech-card.scroll-animate:nth-child(2) {
  transition-delay: 0.08s;
}

.tech-card.scroll-animate:nth-child(3) {
  transition-delay: 0.16s;
}

.tech-card.scroll-animate:nth-child(4) {
  transition-delay: 0.24s;
}

.tech-card.scroll-animate:nth-child(5) {
  transition-delay: 0.32s;
}

.tech-card.scroll-animate:nth-child(6) {
  transition-delay: 0.4s;
}

.tech-card.scroll-animate:nth-child(7) {
  transition-delay: 0.48s;
}

.tech-card.scroll-animate:nth-child(8) {
  transition-delay: 0.56s;
}

.innovation-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.innovation-card.scroll-animate:nth-child(2) {
  transition-delay: 0.15s;
}

.innovation-card.scroll-animate:nth-child(3) {
  transition-delay: 0.3s;
}

.capability-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.capability-card.scroll-animate:nth-child(2) {
  transition-delay: 0.15s;
}

.capability-card.scroll-animate:nth-child(3) {
  transition-delay: 0.3s;
}

.breakthrough-item.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.breakthrough-item.scroll-animate:nth-child(2) {
  transition-delay: 0.08s;
}

.breakthrough-item.scroll-animate:nth-child(3) {
  transition-delay: 0.16s;
}

.breakthrough-item.scroll-animate:nth-child(4) {
  transition-delay: 0.24s;
}

.breakthrough-item.scroll-animate:nth-child(5) {
  transition-delay: 0.32s;
}

.breakthrough-item.scroll-animate:nth-child(6) {
  transition-delay: 0.4s;
}

.breakthrough-item.scroll-animate:nth-child(7) {
  transition-delay: 0.48s;
}

.testimonial-card.scroll-animate:nth-child(1) {
  transition-delay: 0s;
}

.testimonial-card.scroll-animate:nth-child(2) {
  transition-delay: 0.2s;
}

.testimonial-card.scroll-animate:nth-child(3) {
  transition-delay: 0.4s;
}

/* 增强卡片悬停效果 */
.stat-card,
.ai-feature-card,
.feature-item,
.service-card,
.tech-card,
.innovation-card,
.capability-card,
.breakthrough-item,
.testimonial-card {
  position: relative;
  overflow: hidden;

  &::before {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: "";
    background: linear-gradient(
      90deg,
      transparent,
      rgb(255 255 255 / 8%),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }
}

@media (hover: hover) and (pointer: fine) {
  /* 按钮点击波纹：仅桌面端保留 */
  .hero-btn,
  .cta-section .el-button,
  .cta-section-new .cta-buttons .el-button {
    position: relative;
    overflow: hidden;

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      content: "";
      background: rgb(255 255 255 / 30%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition:
        width 0.6s,
        height 0.6s;
    }

    &:active::after {
      width: 300px;
      height: 300px;
    }
  }
}

.section-title {
  color: #60a5fa;
}

.main-title {
  color: #fff;

  .art-logo-img {
    height: 1.2em;
    margin-left: 24px;
    vertical-align: middle;
    filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.6));
  }
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

.feature-item:hover,
.service-card:hover,
.testimonial-card:hover {
}

/* 光标跟随光效 - 卡片上的光晕 */
.ai-feature-card,
.service-card {
  background: linear-gradient(
    145deg,
    rgb(20 20 20 / 90%) 0%,
    rgb(10 10 10 / 95%) 100%
  );

  &:hover {
    background: linear-gradient(
      145deg,
      rgb(30 30 30 / 95%) 0%,
      rgb(20 20 20 / 98%) 100%
    );
  }
}

.hero-desc {
  display: inline-block;
  padding-right: 8px;
}

/* 悬停时图标旋转 */
.tech-card:hover .tech-icon {
}

/* 轨道上的点发光 */
.orbit-dot {
  box-shadow:
    0 0 10px #60a5fa,
    0 0 20px #60a5fa,
    0 0 30px #60a5fa;
}

.stat-card:hover .stat-number {
}

.testimonial-card .quote-icon {
}

/* 导航链接下划线动画 */
.nav-link {
  position: relative;

  &::after {
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    content: "";
    background: #60a5fa;
    transform: translateX(-50%);
    transition: all 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
}

.logo-img {
}

.cta-section .el-button--primary {
}

/* 页脚社交链接悬停 */
.social-link {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 5px 15px rgb(96 165 250 / 40%);
    transform: translateY(-3px);
  }
}

/* 星光汇聚 Logo 区域 */
.starlight-logo-section {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}

.starlight-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.starlight-text {
  position: absolute;
  bottom: 40px;
  left: 50%;
  text-align: center;
  transform: translateX(-50%);

  p {
    margin: 0;
    font-size: 18px;
    color: rgb(255 255 255 / 60%);
    letter-spacing: 2px;
  }
}

/* 新版CTA 区域 - 非对称左右布局 */
.cta-section-new {
  position: relative;
  min-height: 500px;
  padding: 80px 0;
  overflow: hidden;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  .cta-bg-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .cta-star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      /* animation: twinkle ease-in-out infinite; */
    }
  }

  .cta-layout {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 60px;
    align-items: center;
    justify-content: space-between;
    max-width: 1400px;
    padding: 0 80px;
    margin: 0 auto;
  }

  .cta-content-left {
    flex: 0 0 45%;
    max-width: 500px;
    text-align: left;

    .cta-badge {
      display: inline-block;
      padding: 8px 20px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #60a5fa;
      background: rgb(96 165 250 / 10%);
      border: 1px solid rgb(96 165 250 / 30%);
      border-radius: 30px;
    }

    h2 {
      margin-bottom: 16px;
      font-size: 48px;
      font-weight: 700;
      line-height: 1.2;
      color: #fff;
      color: #fff;
    }

    p {
      margin-bottom: 32px;
      font-size: 18px;
      line-height: 1.6;
      color: rgb(255 255 255 / 70%);
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      margin-bottom: 40px;

      /* 用 gap 控制间距，避免 Element Plus 默认 sibling margin 导致错位 */
      .el-button + .el-button {
        margin-left: 0 !important;
      }

      .el-button {
        height: 54px;
        padding: 0 36px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 30px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-4px);
        }

        &.el-button--primary {
          color: #0a0a1a;
          background: #60a5fa;
          border: none;
          box-shadow: 0 8px 25px rgb(96 165 250 / 40%);

          &:hover {
            box-shadow: 0 12px 35px rgb(96 165 250 / 60%);
          }
        }

        &.is-plain {
          color: #fff;
          background: transparent;
          border: 2px solid rgb(255 255 255 / 30%);

          &:hover {
            background: rgb(255 255 255 / 10%);
            border-color: rgb(255 255 255 / 50%);
          }
        }
      }
    }

    .cta-features {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;

      span {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        color: rgb(255 255 255 / 60%);
        transition: all 0.3s;

        i {
          font-size: 18px;
          font-style: normal;
        }

        &:hover {
          color: #60a5fa;
          transform: translateX(5px);
        }
      }
    }
  }

  .starlight-logo-wrapper {
    position: relative;
    flex: 0 0 50%;
    min-height: 400px;
    background: radial-gradient(
      ellipse at center,
      rgb(96 165 250 / 5%) 0%,
      transparent 70%
    );
    border-radius: 24px;

    .starlight-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .starlight-text {
      position: absolute;
      bottom: 30px;
      left: 50%;
      text-align: center;
      transform: translateX(-50%);

      p {
        margin: 0;
        font-size: 16px;
        color: rgb(255 255 255 / 50%);
        letter-spacing: 3px;
      }
    }
  }
}

/* 响应式适配 */
@media screen and (width <= 1200px) {
  .cta-section-new {
    .cta-layout {
      padding: 0 40px;
    }

    .cta-content-left h2 {
      font-size: 36px;
    }
  }
}

@media screen and (width <= 768px) {
  .cta-section-new {
    .cta-layout {
      flex-direction: column;
      gap: 40px;
      padding: 0 20px;
    }

    .cta-content-left {
      flex: 1;
      max-width: 100%;
      text-align: center;

      h2 {
        font-size: 28px;
      }

      .cta-buttons {
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 100%;

        .el-button {
          flex: 1 1 220px;
          width: 100%;
          max-width: 320px;
        }
      }

      .cta-features {
        justify-content: center;
      }
    }

    .starlight-logo-wrapper {
      flex: 1;
      width: 100%;
      min-height: 300px;
    }
  }
}

/* SVG 图标样式 */
.stat-icon svg,
.ai-icon svg,
.service-icon svg,
.tech-icon svg,
.innovation-icon svg,
.capability-icon svg,
.card-icon svg {
  width: 1em;
  height: 1em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stat-icon {
  color: #60a5fa;
}

.ai-icon {
  color: #60a5fa;
}

.service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  color: #60a5fa;
}

.service-icon svg {
  display: block;
}

.tech-icon {
  color: #60a5fa;
}

.tech-icon svg {
  display: block;
  width: 30px;
  height: 30px;
  overflow: visible;
}

.innovation-icon {
  color: #60a5fa;
}

.capability-icon {
  color: #60a5fa;
}

/* 移动端强覆盖：放在样式末尾，确保优先于上方基础样式 */
@media screen and (width <= 1200px) {
  .home-container .header .header-content {
    padding: 0 24px;
  }

  .home-container .header .header-content .nav-links {
    display: none !important;
  }
}

@media screen and (width <= 768px) {
  .home-container .header {
    height: 64px;
  }

  .home-container .header .header-content {
    gap: 12px;
    padding: 0 14px;
  }

  .home-container .header .header-content .logo {
    gap: 8px;
    height: 40px;
  }

  .home-container .header .header-content .logo img {
    height: 38px;
  }

  .home-container .header .header-content .logo .logo-text-group,
  .home-container .header .header-content .nav-links {
    display: none !important;
  }

  .home-container .header .header-content .header-right {
    margin-left: auto;
  }

  .home-container .header .header-content .login-btn.el-button {
    height: 40px;
    padding: 0 20px;
    font-size: 15px;
    border-radius: 22px;
  }

  .home-container .banner .banner-signature {
    display: none;
  }

  .home-container .banner .banner-bg {
    background-size: auto 55%;
    background-position: center 8%;
  }

  .home-container .banner .banner-bg::before {
    height: 6%;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .home-container .banner .banner-bg::after {
    height: 8%;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .home-container .banner .banner-overlay {
    align-items: flex-end;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 28%) 0%,
      rgb(0 0 0 / 52%) 100%
    );
  }

  .home-container .banner .banner-overlay .carousel-text {
    width: calc(100% - 32px);
    max-width: none;
    padding: 20px 16px;
    margin: 0 16px calc(70px + env(safe-area-inset-bottom, 0px));
    border-radius: 14px;
  }

  .home-container .banner .banner-overlay .carousel-text .hero-badge {
    padding: 6px 12px;
    margin-bottom: 14px;
    font-size: 12px;
  }

  .home-container .banner .banner-overlay .carousel-text .main-title {
    margin-bottom: 8px;
    font-size: clamp(48px, 16vw, 64px);
    letter-spacing: 2px;
  }

  .home-container
    .banner
    .banner-overlay
    .carousel-text
    .main-title
    .art-logo-img {
    display: block;
    height: 0.9em;
    margin: 12px 0 0;
  }

  .home-container .banner .banner-overlay .carousel-text .sub-title {
    margin-bottom: 12px;
    font-size: clamp(20px, 9vw, 44px);
  }

  .home-container .banner .banner-overlay .carousel-text .hero-desc {
    margin-bottom: 18px;
    font-size: 17px;
    line-height: 1.7;
  }

  .home-container .banner .banner-overlay .carousel-text .hero-buttons {
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .home-container
    .banner
    .banner-overlay
    .carousel-text
    .hero-buttons
    .hero-btn {
    flex: 1 1 220px;
    width: 100%;
    max-width: 320px;
    height: 48px;
    padding: 0 18px;
    font-size: 16px;
    box-sizing: border-box;
  }

  .home-container
    .banner
    .banner-overlay
    .carousel-text
    .hero-buttons
    .hero-btn.secondary.el-button {
    color: #fff;
  }

  .home-container .scroll-hint {
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  }

  .home-container .section-container {
    padding: 0 16px;
  }

  .home-container .stats-section,
  .home-container .transition-image-section,
  .home-container .ai-power-section,
  .home-container .platform-intro,
  .home-container .services-section,
  .home-container .tech-section,
  .home-container .innovation-section,
  .home-container .capability-section,
  .home-container .breakthrough-section,
  .home-container .testimonials-section {
    padding: 56px 0;
  }

  .home-container .stats-section .stats-container {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px;
    padding: 0 16px;
  }

  .home-container .stats-section .stat-card {
    min-width: 0 !important;
    padding: 20px 14px;
  }

  .home-container .stats-section .stat-card .stat-icon {
    margin-bottom: 10px;
    font-size: 30px;
  }

  .home-container .stats-section .stat-card .stat-number {
    font-size: 24px;
  }

  .home-container .stats-section .stat-card .stat-label {
    font-size: 13px;
    line-height: 1.45;
  }

  .home-container .transition-image-section .transition-content {
    gap: 28px;
    padding: 0 16px;
    text-align: left;
  }

  .home-container .transition-image-section .transition-text {
    width: 100%;
    max-width: none;
  }

  .home-container .transition-image-section .transition-text h2 {
    margin-bottom: 16px;
    font-size: 24px;
    line-height: 1.35;
  }

  .home-container .transition-image-section .transition-text p {
    margin-bottom: 24px;
    font-size: 15px;
    line-height: 1.75;
  }

  .home-container .transition-image-section .transition-text .transition-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .home-container .transition-image-section .transition-text .stat-item {
    min-width: 0;
    padding: 16px 14px;
    text-align: left;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 14px;
  }

  .home-container
    .transition-image-section
    .transition-text
    .stat-item:last-child {
    grid-column: 1 / -1;
  }

  .home-container
    .transition-image-section
    .transition-text
    .stat-item
    .stat-number {
    margin-bottom: 6px;
    font-size: 28px;
    line-height: 1.1;
    white-space: nowrap;
  }

  .home-container
    .transition-image-section
    .transition-text
    .stat-item
    .stat-label {
    font-size: 13px;
    line-height: 1.55;
    color: rgb(255 255 255 / 72%);
    word-break: keep-all;
  }

  .home-container .transition-image-section .transition-visual {
    width: 100%;
    min-height: 300px;
  }

  .home-container .transition-image-section .transition-visual .visual-grid {
    max-width: 340px;
    height: 280px;
    margin: 0 auto;
  }

  .home-container .transition-image-section .transition-visual .visual-glow {
    width: 220px;
    height: 220px;
  }

  .home-container .transition-image-section .transition-visual {
    display: none;
  }

  .home-container .ai-power-section .ai-power-container {
    display: block;
  }

  .home-container .ai-power-section .ai-content-right .section-header {
    text-align: left;
  }

  .home-container
    .ai-power-section
    .ai-content-right
    .section-header
    .section-desc {
    margin-left: 0;
  }

  .home-container .ai-power-section .ai-features-grid {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .home-container .ai-power-section .ai-feature-card {
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 6px 12px;
    align-items: start;
    padding: 22px 16px;
    text-align: left;
  }

  .home-container .ai-power-section .ai-feature-card .ai-icon {
    grid-row: 1 / span 2;
    margin: 2px 0 0;
    font-size: 28px;
  }

  .home-container .ai-power-section .ai-feature-card h3 {
    margin: 0;
    font-size: 22px;
    line-height: 1.35;
  }

  .home-container .ai-power-section .ai-feature-card p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: rgb(255 255 255 / 72%);
  }

  .home-container .ai-power-section .ai-decoration {
    display: none;
  }

  .home-container .platform-intro .feature-list {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .home-container .services-section .services-grid {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .home-container .services-section .service-card {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 8px 12px;
    align-items: center;
    padding: 22px 16px;
    text-align: left;
  }

  .home-container .services-section .service-card .service-icon {
    grid-row: 1;
    align-self: start;
    width: 44px;
    height: 44px;
    margin: 0;
    font-size: 24px;
    background: rgb(96 165 250 / 12%);
    border: 1px solid rgb(96 165 250 / 25%);
    border-radius: 12px;
  }

  .home-container .services-section .service-card .service-title {
    margin: 0;
    font-size: 22px;
    line-height: 1.35;
  }

  .home-container .services-section .service-card .service-desc {
    grid-column: 1 / -1;
    margin: 2px 0 0;
    font-size: 15px;
    line-height: 1.7;
    color: rgb(255 255 255 / 72%);
  }

  .home-container .services-section .service-card .service-features {
    grid-column: 1 / -1;
    margin-top: 8px;
  }

  .home-container .services-section .service-card .service-features li {
    font-size: 14px;
    line-height: 1.6;
  }

  .home-container .tech-section .tech-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 12px;
  }

  .home-container .innovation-section .innovation-grid,
  .home-container .capability-section .capability-grid,
  .home-container .breakthrough-section .breakthrough-panel {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .home-container .innovation-section .innovation-card,
  .home-container .capability-section .capability-card {
    padding: 22px 16px;
  }

  .home-container .innovation-section .innovation-card h3,
  .home-container .capability-section .capability-card h3 {
    font-size: 20px;
    line-height: 1.4;
  }

  .home-container .innovation-section .innovation-card p,
  .home-container .capability-section .capability-card p,
  .home-container .breakthrough-section .breakthrough-item p {
    font-size: 14px;
    line-height: 1.7;
  }

  .home-container .breakthrough-section .breakthrough-item {
    gap: 10px;
    padding: 16px 14px;
  }

  .home-container .breakthrough-section .breakthrough-item .breakthrough-index {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .home-container .testimonials-section .testimonials-grid {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .home-container .testimonials-section .testimonial-card {
    min-height: 300px;
    border-radius: 18px;
  }

  .home-container .testimonials-section .testimonial-card .testimonial-shell {
    padding: 18px 18px 20px;
  }

  .home-container .testimonials-section .testimonial-card .testimonial-tag {
    min-height: 28px;
    padding: 6px 10px;
    font-size: 11px;
  }

  .home-container .testimonials-section .testimonial-card .quote-icon {
    margin: 40px 0 10px;
    font-size: 42px;
  }

  .home-container .testimonials-section .testimonial-card .testimonial-content {
    margin-bottom: 20px;
    font-size: 14px;
    line-height: 1.75;
  }

  .home-container .testimonials-section .testimonial-card .testimonial-author {
    gap: 12px;
    padding-top: 14px;
  }

  .home-container .testimonials-section .testimonial-card .author-avatar {
    width: 42px;
    height: 42px;
    font-size: 17px;
  }

  .home-container .testimonials-section .testimonial-card .author-name {
    font-size: 15px;
  }

  .home-container .testimonials-section .testimonial-card .author-title {
    font-size: 12px;
  }

  .home-container .footer-section .footer-container {
    padding: 0 16px;
  }

  .home-container .footer-section .footer-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

/* UA 识别为移动端时，按钮自动换行并居中（避免仅改 UA 但视口仍偏大时错位） */
:global(html.ua-mobile)
  .home-container
  .banner
  .banner-overlay
  .carousel-text
  .hero-buttons {
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
}

:global(html.ua-mobile)
  .home-container
  .banner
  .banner-overlay
  .carousel-text
  .hero-buttons
  .hero-btn {
  flex: 1 1 220px;
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
}

:global(html.ua-mobile)
  .home-container
  .cta-section-new
  .cta-content-left
  .cta-buttons {
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
}

:global(html.ua-mobile)
  .home-container
  .cta-section-new
  .cta-content-left
  .cta-buttons
  .el-button {
  flex: 1 1 220px;
  width: 100%;
  max-width: 320px;
  box-sizing: border-box;
}

:global(html.ua-mobile)
  .home-container
  .transition-image-section
  .transition-visual {
  display: none;
}

:global(html.ua-mobile)
  .home-container
  .banner
  .banner-overlay
  .carousel-text
  .hero-buttons
  .el-button
  + .el-button,
:global(html.ua-mobile)
  .home-container
  .cta-section-new
  .cta-content-left
  .cta-buttons
  .el-button
  + .el-button {
  margin-left: 0;
}

@media screen and (width <= 520px) {
  .home-container .stats-section .stats-container {
    grid-template-columns: 1fr !important;
  }

  .home-container .transition-image-section .transition-content {
    gap: 24px;
  }

  .home-container .transition-image-section .transition-text h2 {
    font-size: 22px;
  }

  .home-container .transition-image-section .transition-text .transition-stats {
    grid-template-columns: 1fr;
  }

  .home-container
    .transition-image-section
    .transition-text
    .stat-item:last-child {
    grid-column: auto;
  }
}

@media screen and (width >= 1024px) {
  .home-container .ai-power-section .section-header .section-title {
    font-size: clamp(42px, 2.6vw, 52px);
  }

  .home-container .ai-power-section .section-header .section-desc {
    max-width: 760px;
    font-size: clamp(17px, 1.1vw, 20px);
    line-height: 1.85;
  }

  .home-container .ai-power-section .ai-features-grid {
    gap: 28px;
  }

  .home-container .ai-power-section .ai-feature-card {
    padding: 48px 36px;
    min-height: 210px;
  }

  .home-container .ai-power-section .ai-feature-card .ai-icon {
    margin-bottom: 24px;
    font-size: clamp(56px, 3vw, 68px);
  }

  .home-container .ai-power-section .ai-feature-card h3 {
    margin-bottom: 16px;
    font-size: clamp(24px, 1.55vw, 30px);
    line-height: 1.35;
  }

  .home-container .ai-power-section .ai-feature-card p {
    max-width: 34ch;
    margin: 0 auto;
    font-size: clamp(16px, 1vw, 18px);
    line-height: 1.85;
  }
}

@media (hover: hover) and (pointer: fine) {
  .home-container .stat-card:hover,
  .home-container .ai-feature-card:hover,
  .home-container .feature-item:hover,
  .home-container .service-card:hover,
  .home-container .tech-card:hover,
  .home-container .innovation-card:hover,
  .home-container .capability-card:hover,
  .home-container .breakthrough-item:hover,
  .home-container .testimonial-card:hover {
    transform: none !important;
  }

  .home-container .stat-card:hover .stat-icon,
  .home-container .stat-card:hover .stat-number,
  .home-container .ai-feature-card:hover .ai-icon,
  .home-container .feature-item:hover .feature-image img,
  .home-container .service-card:hover .service-icon,
  .home-container .service-card:hover .service-features li,
  .home-container .service-card:hover .service-features li .el-icon,
  .home-container .tech-card:hover .tech-icon,
  .home-container .testimonial-card:hover .quote-icon {
    transform: none !important;
  }

  .home-container .testimonial-card:hover .testimonial-media {
    transform: scale(1.12) !important;
  }
}

@media (hover: none), (pointer: coarse) {
  .home-container .scroll-animate,
  .home-container .scroll-animate.animate-in {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }

  .home-container .stat-card,
  .home-container .ai-feature-card,
  .home-container .feature-item,
  .home-container .service-card,
  .home-container .tech-card,
  .home-container .innovation-card,
  .home-container .capability-card,
  .home-container .breakthrough-item,
  .home-container .testimonial-card,
  .home-container .hero-btn,
  .home-container .cta-section .el-button,
  .home-container .cta-section-new .cta-buttons .el-button,
  .home-container .nav-link,
  .home-container .social-link {
    transition: none !important;
    animation: none !important;
  }

  .home-container .stat-card::before,
  .home-container .ai-feature-card::before,
  .home-container .feature-item::before,
  .home-container .service-card::before,
  .home-container .tech-card::before,
  .home-container .innovation-card::before,
  .home-container .capability-card::before,
  .home-container .breakthrough-item::before,
  .home-container .testimonial-card::before,
  .home-container .hero-btn::after,
  .home-container .cta-section .el-button::after,
  .home-container .cta-section-new .cta-buttons .el-button::after {
    opacity: 0 !important;
    display: none !important;
  }

  .home-container .stat-card:hover,
  .home-container .ai-feature-card:hover,
  .home-container .feature-item:hover,
  .home-container .service-card:hover,
  .home-container .tech-card:hover,
  .home-container .innovation-card:hover,
  .home-container .capability-card:hover,
  .home-container .breakthrough-item:hover,
  .home-container .testimonial-card:hover,
  .home-container .hero-btn:hover,
  .home-container .cta-section .el-button:hover,
  .home-container .cta-section-new .cta-buttons .el-button:hover,
  .home-container .social-link:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .home-container .nav-link:hover::after {
    width: 0 !important;
  }
}
</style>

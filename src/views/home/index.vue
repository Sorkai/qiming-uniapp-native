<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo">
          <img src="" alt="Logo" />
        </div>
        <div class="header-right">
          <el-button type="primary" class="login-btn" @click="handleLogin"
            >登录</el-button
          >
        </div>
      </div>
    </div>

    <!-- 轮播图部分 -->
    <div class="banner">
      <el-carousel
        height="100vh"
        :interval="4000"
        :duration="1000"
        :indicator-position="'none'"
        :arrow="'never'"
      >
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div
            class="carousel-content"
            :style="{ backgroundImage: `url(${item.background})` }"
          >
            <div class="carousel-text">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle }}</p>
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

    <!-- 平台介绍部分 -->
    <div class="platform-intro">
      <div class="section-container">
        <h2 class="section-title">平台特色</h2>
        <div class="feature-list">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-item"
          >
            <div class="feature-icon">
              <el-icon>
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Monitor,
  Connection,
  Operation,
  ArrowDown
} from "@element-plus/icons-vue";

const router = useRouter();
const isScrolled = ref(false);

// 监听滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 轮播图数据
const carouselItems = ref([
  {
    title: "创新技术平台",
    subtitle: "为企业提供全方位的技术支持",
    background: "https://via.placeholder.com/1920x600"
  },
  {
    title: "高效协同办公",
    subtitle: "打造智能化的办公环境",
    background: "https://via.placeholder.com/1920x600"
  },
  {
    title: "数据驱动决策",
    subtitle: "助力企业精准决策",
    background: "https://via.placeholder.com/1920x600"
  }
]);

// 平台特性数据
const features = ref([
  {
    icon: "Monitor",
    title: "智能管理",
    description: "提供智能化的管理工具，提升工作效率"
  },
  {
    icon: "Connection",
    title: "协同办公",
    description: "多部门协同工作，信息共享无障碍"
  },
  {
    icon: "Operation",
    title: "数据分析",
    description: "强大的数据分析能力，助力决策制定"
  }
]);

// 登录按钮点击事件
const handleLogin = () => {
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  height: 64px;
  background: transparent;
  transition: all 0.3s ease;

  &.header-scrolled {
    background: rgb(255 255 255 / 98%);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

    .header-content {
      .logo {
        img {
          filter: none;
        }
      }
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    height: 100%;
    padding: 0 20px;
    margin: 0 auto;

    .logo {
      height: 40px;

      img {
        height: 100%;
        filter: brightness(0) invert(1); // 未滚动时logo显示为白色
      }
    }

    .login-btn {
      height: 36px;
      padding: 0 24px;
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      border-radius: 18px;
      transition: all 0.3s ease;

      &:hover {
        color: #fff;
        background: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

.banner {
  height: 100vh;
  margin-top: 0;

  :deep(.el-carousel),
  :deep(.el-carousel__container) {
    height: 100vh;
  }

  :deep(.el-carousel__item) {
    overflow: hidden;
  }
}

.carousel-content {
  display: flex;
  align-items: center;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  &::before {
    position: absolute;
    inset: 0;
    content: "";
    background: rgb(0 0 0 / 30%); // 添加暗色遮罩
  }

  .carousel-text {
    position: relative; // 确保文字在遮罩层上方
    max-width: 1200px;
    padding: 0 20px;
    margin: 0 auto;
    color: #fff;
    text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    user-select: none;

    h2 {
      margin-bottom: 20px;
      font-size: 56px;
      font-weight: 600;
      letter-spacing: 2px;
    }

    p {
      font-size: 28px;
      letter-spacing: 1px;
      opacity: 0.9;
    }
  }
}

.platform-intro {
  padding: 80px 0;
  background-color: #f8f9fa;

  .section-container {
    max-width: 1200px;
    padding: 0 20px;
    margin: 0 auto;
  }

  .section-title {
    margin-bottom: 60px;
    font-size: 36px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .feature-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }

  .feature-item {
    padding: 40px 20px;
    text-align: center;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      margin-bottom: 20px;
      font-size: 48px;
      color: var(--el-color-primary);
    }

    h3 {
      margin-bottom: 16px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    p {
      font-size: 16px;
      line-height: 1.6;
      color: #666;
    }
  }
}

.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  z-index: 10;
  font-size: 16px;
  color: #fff;
  text-align: center;
  user-select: none;
  transform: translateX(-50%);

  span {
    display: block;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  }

  .scroll-arrow {
    .el-icon {
      font-size: 24px;
      color: #fff;

      &.animated {
        animation: bounce 2s infinite;
      }
    }
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

  60% {
    transform: translateY(-5px);
  }
}
</style>

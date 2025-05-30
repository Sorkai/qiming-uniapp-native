<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo" />
        </div>
        <div class="header-right">
          <template v-if="userInfo">
            <el-dropdown trigger="hover" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar || defaultAvatar" />
                <span class="nickname">{{
                  userInfo.nickname || userInfo.username
                }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="space">
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
            @click="showLoginDialog = true"
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
              <h2 class="main-title">{{ item.title }}</h2>
              <p class="sub-title">{{ item.subtitle }}</p>
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
        <h2 class="section-title">平台特色<span /></h2>
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
              <p>{{ feature.title }}</p>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <login-dialog
      v-model:visible="showLoginDialog"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import {
  Monitor,
  Connection,
  Operation,
  ArrowDown,
  User,
  SwitchButton,
  Setting
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";

const router = useRouter();
const isScrolled = ref(false);
const showLoginDialog = ref(false);
const defaultAvatar = "/src/assets/avatar.png"; // 默认头像路径
const userInfo = ref<DataInfo<number> | null>(storageLocal().getItem(userKey));

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
    subtitle: "全方位技术支持",
    background: "/src/assets/home/banner1.jpg"
  },
  {
    title: "智慧解决方案",
    subtitle: "助力企业转型",
    background: "/src/assets/home/banner2.jpg"
  }
]);

// 平台特性数据
const features = ref([
  {
    icon: "Monitor",
    title: "智能管理",
    description: "提供智能化的管理工具，提升工作效率",
    image: "/src/assets/home/card1.jpg"
  },
  {
    icon: "Connection",
    title: "协同办公",
    description: "多部门协同工作，信息共享无障碍",
    image: "/src/assets/home/card2.jpg"
  },
  {
    icon: "Operation",
    title: "数据分析",
    description: "强大的数据分析能力，助力决策制定",
    image: "/src/assets/home/card3.jpg"
  }
]);

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "space":
      router.push("/dashboard");
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

// 登录成功处理
const handleLoginSuccess = () => {
  userInfo.value = storageLocal().getItem(userKey);
  showLoginDialog.value = false;
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

    .user-info {
      display: flex;
      align-items: center;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 18px;
      transition: all 0.3s;

      &:hover {
        background: rgb(255 255 255 / 10%);

        .el-icon--right {
          transform: rotate(180deg);
        }
      }

      .nickname {
        margin: 0 8px;
        font-size: 16px;
        color: #fff;
        text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
      }

      .el-icon--right {
        font-size: 16px;
        color: rgb(255 255 255 / 85%);
        transition: transform 0.3s ease;
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
    position: relative;
    max-width: 1200px;
    padding: 0 20px;
    margin: 0 auto;
    margin-top: -30px;
    color: #fff;
    text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
    user-select: none;

    .main-title {
      margin: 0;
      font-size: 80px;
      font-weight: bold;
      line-height: 130px;
      color: #fff;
      letter-spacing: 8px;
    }

    .sub-title {
      padding-left: 420px;
      margin: 0;
      font-size: 80px;
      font-weight: bold;
      line-height: 130px;
      color: #f4cb28;
      letter-spacing: 8px;
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
    position: relative;
    height: 63px;
    margin-bottom: 60px;
    font-family:
      Helvetica,
      Arial,
      sans-serif,
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol";
    font-size: 38px;
    font-weight: 500;
    line-height: 53px;
    color: #0d1a26;
    text-align: center;

    span {
      position: absolute;
      bottom: 0;
      left: 50%;
      display: inline-block;
      width: 64px;
      height: 3px;
      margin-left: -32px;
      background: #dbe7f8;
      border-radius: 10px;
    }
  }

  .feature-list {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 60px;
    width: 1200px;
    height: 280px;
    margin-top: 57px;
    overflow: hidden;
  }

  .feature-item {
    position: relative;
    display: inline-block;
    width: 360px;
    overflow: hidden;
    cursor: default;
    border-radius: 6px;

    a {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    .feature-image {
      width: 360px;
      height: auto;
      user-select: none;
      transition: all 0.5s;
      -webkit-user-drag: none;

      img {
        width: 100%;
        height: auto;
        pointer-events: none;
        object-fit: contain;
      }
    }

    p {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 70px;
      margin-top: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 18px;
      line-height: 70px;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      background: rgb(0 0 0 / 50%);
    }

    &:hover .feature-image {
      transform: scale(1.2, 1.2);
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

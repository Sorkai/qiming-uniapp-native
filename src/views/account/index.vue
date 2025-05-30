<template>
  <div class="account-container">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo" @click="router.push('/home')">
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

    <!-- 页面主体内容 -->
    <div class="account-content">
      <!-- 内容区域待添加 -->
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
  User,
  SwitchButton,
  Setting,
  ArrowDown
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";

const router = useRouter();
const isScrolled = ref(false);
const showLoginDialog = ref(false);
const defaultAvatar = "/src/assets/avatar.png";
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
      router.push("/home");
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
.account-container {
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
  height: 80px;
  background: #6b46c1;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

  &.header-scrolled {
    background: rgb(255 255 255 / 98%);
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

    .header-content {
      .logo {
        img {
          filter: none;
        }
      }

      .user-info {
        .nickname {
          color: #333;
          text-shadow: none;
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
      height: 48px;
      cursor: pointer;

      img {
        height: 100%;
        filter: none;
      }
    }

    .login-btn {
      height: 40px;
      padding: 0 28px;
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      border-radius: 20px;
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
        .el-icon--right {
          transform: rotate(180deg);
        }
      }

      .nickname {
        margin: 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        text-shadow: 0 2px 4px rgb(0 0 0 / 30%);
      }

      .el-icon--right {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        transition: transform 0.3s ease;
      }
    }
  }
}

.account-content {
  min-height: calc(100vh - 80px);
  padding-top: 80px; // 为固定定位的 header 留出空间
}
</style>

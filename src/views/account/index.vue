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

    <!-- 账号管理内容 -->
    <div class="account-content">
      <div class="account-sidebar">
        <div class="user-info">
          <el-avatar :size="80" :src="userInfo?.avatar || defaultAvatar" />
          <h3>{{ userInfo?.nickname || userInfo?.username }}</h3>
          <p>{{ userInfo?.username }}</p>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="account-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="home">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="course">
            <el-icon><Reading /></el-icon>
            <span>课程</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="account-main">
        <div v-if="activeMenu === 'home'">首页</div>
        <div v-else-if="activeMenu === 'course'">课程</div>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  User,
  SwitchButton,
  Setting,
  ArrowDown,
  HomeFilled,
  Reading
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";

const router = useRouter();
const route = useRoute();
const isScrolled = ref(false);
const showLoginDialog = ref(false);
const defaultAvatar = "/src/assets/avatar.png";
const userInfo = ref<DataInfo<number> | null>(storageLocal().getItem(userKey));

// 当前激活的菜单项
const activeMenu = ref("home");

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

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
  min-height: 100vh;
  background-color: #f5f7fa;

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
      height: 100%;
      padding: 0 120px;
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
    display: flex;
    gap: 20px;
    min-height: calc(100vh - 80px);
    padding: 100px 20px 20px;

    .account-sidebar {
      flex-shrink: 0;
      width: 260px;

      .user-info {
        padding: 30px 20px;
        margin-bottom: 20px;
        text-align: center;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

        h3 {
          margin: 15px 0 5px;
          font-size: 18px;
          font-weight: 500;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }

      .account-menu {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

        :deep(.el-menu-item) {
          height: 50px;
          line-height: 50px;

          .el-icon {
            margin-right: 10px;
            font-size: 18px;
          }
        }
      }
    }

    .account-main {
      flex: 1;
      padding: 30px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
    }
  }
}

// 路由切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

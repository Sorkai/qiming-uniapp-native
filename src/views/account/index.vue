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
                <el-avatar :size="32" :src="userInfo.avatar" />
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
          <el-avatar :size="80" :src="userInfo?.avatar" />
          <h3>{{ userInfo?.nickname || userInfo?.username }}</h3>
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
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="account-main">
        <div v-if="activeMenu === 'profile'">
          <user-profile />
        </div>
        <div v-else-if="activeMenu === 'home'">
          <!-- 上方卡片 -->
          <div class="card">
            <!-- 重要提醒 -->
            <div class="reminder">
              <div class="reminder-content">
                <el-icon><InfoFilled /></el-icon>
                <span>重要提示:xxx</span>
              </div>
            </div>
            <!-- 课程信息和AI总结 -->
            <div class="info-section">
              <div class="course-info">
                <h3>课程信息</h3>
                <div class="course-card">
                  <!-- 将要考试的课程 -->
                  <div class="course-section">
                    <h4>将要考试的</h4>
                    <div class="mini-course-list">
                      <div
                        v-for="i in 2"
                        :key="'exam-' + i"
                        class="mini-course-item"
                      >
                        <div
                          class="course-thumb"
                          :style="{ backgroundColor: getCoverColor(i) }"
                        >
                          <el-tag size="small" type="warning">考试</el-tag>
                        </div>
                        <div class="course-content">
                          <span class="course-name"
                            >高等数学期末考试 {{ i }}</span
                          >
                          <span class="course-time">{{ i }}天后</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 将要结课的课程 -->
                  <div class="course-section">
                    <h4>将要结课的</h4>
                    <div class="mini-course-list">
                      <div
                        v-for="i in 3"
                        :key="'end-' + i"
                        class="mini-course-item"
                      >
                        <div
                          class="course-thumb"
                          :style="{ backgroundColor: getCoverColor(i + 5) }"
                        >
                          <el-tag size="small" type="success">结课</el-tag>
                        </div>
                        <div class="course-content">
                          <span class="course-name"
                            >数据结构与算法 {{ i }}</span
                          >
                          <span class="course-time">{{ i + 3 }}天后</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 作业未交的课程 -->
                  <div class="course-section">
                    <h4>作业未交的</h4>
                    <div class="mini-course-list">
                      <div
                        v-for="i in 4"
                        :key="'homework-' + i"
                        class="mini-course-item"
                      >
                        <div
                          class="course-thumb"
                          :style="{ backgroundColor: getCoverColor(i + 9) }"
                        >
                          <el-tag size="small" type="danger">作业</el-tag>
                        </div>
                        <div class="course-content">
                          <span class="course-name"
                            >计算机网络实验报告 {{ i }}</span
                          >
                          <span class="course-time">{{ i + 1 }}天后</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ai-summary">
                <h3>AI总结</h3>
                <div class="summary-card">
                  <p>根据您的学习进度，AI为您总结：</p>
                  <ul>
                    <li>已完成基础模块学习，掌握度良好</li>
                    <li>建议加强实践环节的练习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                    <li>下周将开始新模块的学习</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activeMenu === 'course'">
          <!-- 课程列表卡片 -->
          <div class="card course-list">
            <div class="course-header">
              <h3>我的课程</h3>
              <div class="course-filter">
                <el-select
                  v-model="courseFilter"
                  placeholder="课程状态"
                  size="small"
                >
                  <el-option label="全部" value="all" />
                  <el-option label="进行中" value="ongoing" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="未开始" value="upcoming" />
                </el-select>
              </div>
            </div>
            <div class="course-grid">
              <div
                v-for="i in 8"
                :key="i"
                class="course-item"
                @click="router.push(`/course/${i}`)"
              >
                <div
                  class="course-cover"
                  :style="{ backgroundColor: getCoverColor(i) }"
                >
                  <div class="course-status">
                    <el-tag type="success">进行中</el-tag>
                  </div>
                </div>
                <div class="course-info">
                  <h4>课程名称 {{ i }}</h4>
                  <p>
                    课程简介：这是一段课程简介文字，描述课程的主要内容和特点。
                  </p>
                  <div class="course-meta">
                    <span
                      ><el-icon><Clock /></el-icon> 学习进度：75%</span
                    >
                    <span
                      ><el-icon><Calendar /></el-icon> 剩余时间：15天</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <!-- 分页 -->
            <div class="pagination">
              <el-button
                :disabled="currentPage === 1"
                size="small"
                @click="handlePrevPage"
              >
                <el-icon><ArrowLeft /></el-icon>
                上一页
              </el-button>
              <span class="page-info"
                >{{ currentPage }} / {{ totalPages }}</span
              >
              <el-button
                :disabled="currentPage === totalPages"
                size="small"
                @click="handleNextPage"
              >
                下一页
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  User,
  SwitchButton,
  Setting,
  ArrowDown,
  HomeFilled,
  Reading,
  Document,
  Edit,
  Clock,
  Calendar,
  InfoFilled,
  ArrowLeft,
  ArrowRight
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";
import { UserProfile } from "./components";

const router = useRouter();
const route = useRoute();
const isScrolled = ref(false);
const showLoginDialog = ref(false);

const userInfo = ref<DataInfo<number> | null>(storageLocal().getItem(userKey));

// 当前激活的菜单项
const activeMenu = ref("home");

// 分页相关
const currentPage = ref(1);
const pageSize = ref(12); // 每页显示12个课程
const total = ref(15); // 假设总共15个课程
const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

// 添加课程筛选状态
const courseFilter = ref("all");

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

// 监听滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// 监听用户信息更新事件
const handleUserInfoUpdate = (event: CustomEvent) => {
  userInfo.value = event.detail;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("userInfoUpdated", handleUserInfoUpdate as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("userInfoUpdated", handleUserInfoUpdate as EventListener);
});

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "space":
      router.push("/welcome/index");
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

// 进度条格式化
const format = (percentage: number) => {
  return percentage === 100 ? "完成" : `${percentage}%`;
};

const handlePrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    // 这里应该调用获取课程列表的接口
  }
};

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    // 这里应该调用获取课程列表的接口
  }
};

// 生成课程封面颜色
const getCoverColor = (index: number) => {
  const colors = [
    "#e6f7ff", // 浅蓝
    "#f6ffed", // 浅绿
    "#fff7e6", // 浅橙
    "#f9f0ff", // 浅紫
    "#fff1f0", // 浅红
    "#f0f5ff", // 浅靛
    "#e6fffb", // 浅青
    "#fff2e8", // 浅棕
    "#f9f0ff", // 浅紫
    "#fffbe6", // 浅黄
    "#f4ffb8", // 浅柠
    "#d9f7be", // 浅绿
    "#b7eb8f", // 浅青绿
    "#e6fffb", // 浅青
    "#bae7ff" // 浅天蓝
  ];
  return colors[(index - 1) % colors.length];
};

// 修改课程点击处理函数
const handleCourseClick = (courseId: number) => {
  router.push(`/course/${courseId}`);
};
</script>

<style lang="scss" scoped>
// 添加文本省略混入
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-container {
  min-height: 100vh;
  background-color: #f0f2f5;

  .header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1000;
    height: 60px;
    background: #6b46c1;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
    transition: box-shadow 0.3s ease;

    &.header-scrolled {
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
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
    gap: 16px;
    min-height: calc(100vh - 90px);
    padding: 70px 16px 16px;

    .account-sidebar {
      flex-shrink: 0;
      width: 240px;

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

.card {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);

  .reminder {
    margin-bottom: 12px;

    .reminder-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      font-size: 13px;
      color: #333;
      background-color: #fff2f0;
      border: 1px solid #ffccc7;
      border-radius: 4px;

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
        color: #ff4d4f;
      }

      span {
        flex: 1;
        line-height: 1.4;
      }
    }
  }

  .info-section {
    display: flex;
    gap: 16px;

    .course-info {
      flex: 0.7; // 占 70% 宽度

      h3 {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
    }

    .ai-summary {
      position: relative;
      flex: 0.3; // 占 30% 宽度

      h3 {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }

      .summary-card {
        position: absolute;
        inset: 33px 0 0;
        overflow: hidden;

        p {
          margin: 0 0 8px;
          font-size: 13px;
          color: #606266;
        }

        ul {
          height: calc(100% - 24px);
          padding-left: 16px;
          margin: 0;
          overflow-y: auto;
          color: #606266;
          list-style-type: disc;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background-color: #dcdfe6;
            border-radius: 2px;
          }

          li {
            margin-bottom: 4px;
            font-size: 13px;
            line-height: 1.4;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .course-card,
    .summary-card {
      padding: 12px;
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
    }

    .course-card {
      .course-section {
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 4px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }

        .mini-course-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, 200px); // 固定卡片宽度
          gap: 8px;
          justify-content: start; // 从左侧开始排列
        }

        .mini-course-item {
          display: flex;
          gap: 8px;
          align-items: center;
          width: 200px; // 固定卡片宽度
          min-width: 0;
          padding: 4px;
          background: #fafafa;
          border: 1px solid #f0f0f0;
          border-radius: 2px;
          transition: all 0.2s ease;

          &:hover {
            background: #f5f5f5;
          }

          .course-thumb {
            position: relative;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            overflow: hidden;
            border-radius: 2px;

            .el-tag {
              position: absolute;
              top: 2px;
              right: 2px;
              z-index: 1;
              height: 14px;
              padding: 0 3px;
              font-size: 9px;
              line-height: 12px;
            }
          }

          .course-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 2px;
            min-width: 0;

            .course-name {
              @include text-ellipsis;

              font-size: 12px;
              color: #333;
            }

            .course-time {
              font-size: 11px;
              color: #999;
            }
          }
        }
      }
    }
  }
}

.course-list {
  .course-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .course-filter {
      :deep(.el-select) {
        width: 120px;
      }
    }
  }

  h3 {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 12px;

    @media screen and (width <= 1400px) {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    @media screen and (width <= 1200px) {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }

    .course-item {
      width: 100%;
      min-width: 160px;
      max-width: 220px;
      margin: 0 auto;
      overflow: hidden;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #ebeef5;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 3px 8px rgb(0 0 0 / 10%);
        transform: translateY(-2px);
      }

      .course-cover {
        position: relative;
        width: 100%;
        padding-top: 56.25%; // 16:9 宽高比
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.9;
        }

        .course-status {
          position: absolute;
          top: 4px;
          right: 4px;
          z-index: 1;

          :deep(.el-tag) {
            height: 18px;
            padding: 0 4px;
            font-size: 11px;
            line-height: 16px;
          }
        }
      }

      .course-info {
        padding: 8px;

        h4 {
          margin: 0 0 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          white-space: nowrap;
        }

        p {
          display: -webkit-box;
          height: 28px;
          margin: 0 0 4px;
          overflow: hidden;
          -webkit-line-clamp: 2;
          font-size: 11px;
          line-height: 1.3;
          color: #606266;
          -webkit-box-orient: vertical;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #909399;

          span {
            display: flex;
            align-items: center;
            max-width: 45%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .el-icon {
              flex-shrink: 0;
              margin-right: 2px;
              font-size: 11px;
            }
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid #ebeef5;

    .page-info {
      min-width: 60px;
      font-size: 13px;
      color: #606266;
      text-align: center;
    }

    :deep(.el-button) {
      --el-button-size: 28px;

      padding: 0 12px;
      font-size: 13px;

      .el-icon {
        font-size: 14px;
        vertical-align: -0.1em;
      }
    }
  }
}
</style>

<template>
  <div class="account-container">
    <!-- 顶部导航 -->
    <div class="header" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo" @click="router.push('/home')">
          <img src="@/assets/logo.png" alt="Logo" class="app-logo-img" />
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
          <el-menu-item index="cloud-disk">
            <el-icon><Folder /></el-icon>
            <span>学习云盘</span>
          </el-menu-item>
          <el-menu-item index="notification">
            <el-icon><Bell /></el-icon>
            <span>系统通知</span>
          </el-menu-item>
          <el-menu-item index="todo">
            <el-icon><Tickets /></el-icon>
            <span>待办事项</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="account-main">
        <div v-if="activeMenu === 'profile'">
          <user-profile />
        </div>
        <div v-else-if="activeMenu === 'cloud-disk'">
          <cloud-disk />
        </div>
        <div v-else-if="activeMenu === 'notification'">
          <system-notification />
        </div>
        <div v-else-if="activeMenu === 'todo'">
          <todo />
        </div>
        <div v-else-if="activeMenu === 'home'">
          <!-- 上方卡片 -->
          <div class="card">
            <!-- 重要提醒 -->
            <div class="reminder">
              <div class="reminder-content">
                <el-icon><InfoFilled /></el-icon>
                <span
                  >重要提示:同学们，新学期到了，系统已经分配最新的课程，请各位同学抓紧学习
                  书山有路勤为径，学海无涯苦作舟 🎉</span
                >
              </div>
            </div>
            <!-- 课程信息和AI总结 -->
            <div class="info-section">
              <div class="course-info">
                <h3>课程信息</h3>
                <div class="course-card">
                  <!-- 加载状态 -->
                  <div v-if="loading" class="loading-container">
                    <el-skeleton animated :rows="3" />
                  </div>

                  <template v-else>
                    <!-- 将要考试的课程 -->
                    <div
                      v-if="myCourses.examList.length > 0"
                      class="course-section"
                    >
                      <h4>将要考试的</h4>
                      <div class="mini-course-list">
                        <div
                          v-for="course in myCourses.examList"
                          :key="'exam-' + course.courseId"
                          class="mini-course-item"
                          @click="handleCourseClick(course.courseId)"
                        >
                          <div
                            class="course-thumb"
                            :style="{
                              backgroundColor: course.thumbUrl
                                ? ''
                                : getCoverColor(course.courseId)
                            }"
                          >
                            <img
                              v-if="course.thumbUrl"
                              :src="course.thumbUrl"
                              class="thumb-image"
                            />
                            <el-tag type="warning">考试</el-tag>
                          </div>
                          <div class="course-content">
                            <span class="course-name">{{
                              course.courseName
                            }}</span>
                            <span class="course-time"
                              >{{ course.daysLeft }}天后</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 将要结课的课程 -->
                    <div
                      v-if="myCourses.endingList.length > 0"
                      class="course-section"
                    >
                      <h4>将要结课的</h4>
                      <div class="mini-course-list">
                        <div
                          v-for="course in myCourses.endingList"
                          :key="'end-' + course.courseId"
                          class="mini-course-item"
                          @click="handleCourseClick(course.courseId)"
                        >
                          <div
                            class="course-thumb"
                            :style="{
                              backgroundColor: course.thumbUrl
                                ? ''
                                : getCoverColor(course.courseId)
                            }"
                          >
                            <img
                              v-if="course.thumbUrl"
                              :src="course.thumbUrl"
                              class="thumb-image"
                            />
                            <el-tag type="success">结课</el-tag>
                          </div>
                          <div class="course-content">
                            <span class="course-name">{{
                              course.courseName
                            }}</span>
                            <span class="course-time"
                              >{{ course.daysLeft }}天后</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 作业未交的课程 -->
                    <div
                      v-if="myCourses.homeworkList.length > 0"
                      class="course-section"
                    >
                      <h4>作业未交的</h4>
                      <div class="mini-course-list">
                        <div
                          v-for="course in myCourses.homeworkList"
                          :key="'homework-' + course.courseId"
                          class="mini-course-item"
                          @click="handleCourseClick(course.courseId)"
                        >
                          <div
                            class="course-thumb"
                            :style="{
                              backgroundColor: course.thumbUrl
                                ? ''
                                : getCoverColor(course.courseId)
                            }"
                          >
                            <img
                              v-if="course.thumbUrl"
                              :src="course.thumbUrl"
                              class="thumb-image"
                            />
                            <el-tag type="danger">作业</el-tag>
                          </div>
                          <div class="course-content">
                            <span class="course-name">{{
                              course.courseName
                            }}</span>
                            <span class="course-time"
                              >{{ course.daysLeft }}天后</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 无数据提示 -->
                    <el-empty
                      v-if="
                        !myCourses.examList.length &&
                        !myCourses.endingList.length &&
                        !myCourses.homeworkList.length
                      "
                      description="暂无课程数据"
                    />
                  </template>
                </div>
              </div>
              <div class="ai-summary">
                <h3>AI总结</h3>
                <div class="summary-card">
                  <p>根据您的学习进度，AI为您总结：</p>
                  <ul>
                    <li>已完成基础模块学习，知识点良好</li>
                    <li>建议加强实践环节的练习</li>
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
                <el-select v-model="courseFilter" placeholder="课程状态">
                  <el-option label="全部" value="all" />
                  <el-option label="进行中" value="ongoing" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="未开始" value="upcoming" />
                </el-select>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="coursesData.loading" class="loading-container">
              <el-skeleton animated :rows="3" />
            </div>

            <!-- 课程网格 -->
            <template v-else>
              <div v-if="coursesData.list.length > 0" class="course-grid">
                <div
                  v-for="course in coursesData.list"
                  :key="course.courseId"
                  class="course-item"
                  @click="handleCourseClick(course.courseId)"
                >
                  <div
                    class="course-cover"
                    :style="{
                      backgroundColor: course.thumbUrl
                        ? ''
                        : getCoverColor(course.courseId)
                    }"
                  >
                    <img
                      v-if="course.thumbUrl"
                      :src="course.thumbUrl"
                      class="cover-image"
                    />
                    <div class="course-status">
                      <el-tag
                        :type="
                          course.finishedHours >= course.totalHours
                            ? 'info'
                            : course.finishedHours > 0
                              ? 'success'
                              : 'warning'
                        "
                      >
                        {{
                          course.finishedHours >= course.totalHours
                            ? "已完成"
                            : course.finishedHours > 0
                              ? "进行中"
                              : "未开始"
                        }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="course-info">
                    <h4>{{ course.courseName }}</h4>
                    <p>
                      {{ course.isRequired === 1 ? "必修课程" : "选修课程" }}
                    </p>
                    <div class="course-meta">
                      <span>
                        <el-icon><Clock /></el-icon>
                        学习进度：{{
                          Math.floor(
                            (course.finishedHours / course.totalHours) * 100
                          )
                        }}%
                      </span>
                      <span>
                        <el-icon><Calendar /></el-icon>
                        课时：{{ course.totalHours }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 无数据提示 -->
              <el-empty v-else description="暂无课程数据" />
            </template>

            <!-- 分页 -->
            <div v-if="coursesData.list.length > 0" class="pagination">
              <el-button :disabled="currentPage === 1" @click="handlePrevPage">
                <el-icon><ArrowLeft /></el-icon>
                上一页
              </el-button>
              <span class="page-info"
                >{{ currentPage }} / {{ totalPages }}</span
              >
              <el-button
                :disabled="currentPage === totalPages"
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  User,
  SwitchButton,
  Setting,
  ArrowDown,
  HomeFilled,
  Reading,
  Document,
  Folder,
  Edit,
  Clock,
  Calendar,
  InfoFilled,
  ArrowLeft,
  ArrowRight,
  Bell,
  Tickets
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken, hasManageAccess } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";
import { UserProfile, SystemNotification, Todo } from "./components";
import CloudDisk from "./components/CloudDisk.vue";
import { getFrontendCourseList } from "@/api/frontend/course";

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

// 课程数据加载状态
const loading = ref(false);

// 我的课程数据
const myCourses = ref({
  examList: [], // 考试课程
  endingList: [], // 结课课程
  homeworkList: [] // 作业课程
});

// 课程页面数据
const coursesData = ref({
  list: [], // 课程列表
  loading: false // 加载状态
});

// 获取课程列表
const fetchCourseList = async () => {
  try {
    loading.value = true;
    const { code, data, msg } = await getFrontendCourseList({
      pageNum: 1,
      pageSize: 100 // 获取足够多的课程数据
    });

    if (code === 200 && data) {
      return data.list || [];
    } else {
      ElMessage.error(msg || "获取课程列表失败");
      return [];
    }
  } catch (error) {
    console.error("获取课程列表出错:", error);
    ElMessage.error("获取课程数据失败，请稍后重试");
    return [];
  } finally {
    loading.value = false;
  }
};

// 加载主页数据
const loadHomeData = async () => {
  loading.value = true;

  try {
    // 获取课程列表
    const courseList = await fetchCourseList();

    // 这里只是模拟数据，实际项目中应该根据后端接口返回的数据进行处理
    // 将数据分类到不同的列表中
    if (courseList.length > 0) {
      // 随机分配一些课程到各个类别，实际项目中应该根据业务逻辑处理
      myCourses.value.examList = courseList.slice(0, 2).map(course => ({
        ...course,
        daysLeft: Math.floor(Math.random() * 5) + 1 // 随机1-5天
      }));

      myCourses.value.endingList = courseList.slice(2, 5).map(course => ({
        ...course,
        daysLeft: Math.floor(Math.random() * 7) + 3 // 随机3-10天
      }));

      myCourses.value.homeworkList = courseList.slice(5, 9).map(course => ({
        ...course,
        daysLeft: Math.floor(Math.random() * 5) + 1 // 随机1-5天
      }));
    } else {
      // 如果没有数据，则清空所有列表
      myCourses.value.examList = [];
      myCourses.value.endingList = [];
      myCourses.value.homeworkList = [];
    }
  } catch (error) {
    console.error("加载主页数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 加载课程页面数据
const loadCoursePageData = async () => {
  coursesData.value.loading = true;
  try {
    // 分页获取课程列表
    const { code, data, msg } = await getFrontendCourseList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: courseFilter.value === "all" ? undefined : courseFilter.value
    });

    if (code === 200 && data) {
      coursesData.value.list = data.list || [];
      total.value = data.total || 0;
    } else {
      ElMessage.error(msg || "获取课程列表失败");
      coursesData.value.list = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取课程列表出错:", error);
    ElMessage.error("获取课程数据失败，请稍后重试");
    coursesData.value.list = [];
    total.value = 0;
  } finally {
    coursesData.value.loading = false;
  }
};

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
  // 不在这里调用加载数据，只通过 watch 监听器加载数据
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
  window.addEventListener(
    "userInfoUpdated",
    handleUserInfoUpdate as EventListener
  );

  // 如果当前是首页，加载课程数据
  if (activeMenu.value === "home") {
    loadHomeData();
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener(
    "userInfoUpdated",
    handleUserInfoUpdate as EventListener
  );
});

// 监听菜单选择，切换到首页或课程页面时加载数据
watch(activeMenu, newVal => {
  if (newVal === "home") {
    loadHomeData();
  } else if (newVal === "course") {
    loadCoursePageData();
  }
});

// 监听课程筛选变化
watch(courseFilter, () => {
  currentPage.value = 1; // 重置为第一页
  loadCoursePageData();
});

// 检查用户是否有管理权限（教师或管理员）
const hasAdminAccess = computed(() => {
  return hasManageAccess();
});

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "space":
      // 只有管理员或教师可以访问管理空间
      if (hasAdminAccess.value) {
        router.push("/welcome/index");
      } else {
        ElMessage.warning("您没有权限访问管理空间");
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
    loadCoursePageData();
  }
};

const handleNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadCoursePageData();
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
  background-color: #f7f8fc;

  .header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1000;
    height: 64px;
    background: linear-gradient(45deg, #6b46c1, #8a5cf6);
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: all 0.3s ease;

    &.header-scrolled {
      background: #fff;
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);

      .user-info .nickname,
      .user-info .el-icon--right {
        color: #333;
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 80px;
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
          background-color: rgb(255 255 255 / 20%);

          .el-icon--right {
            transform: rotate(180deg);
          }
        }

        .nickname {
          margin: 0 8px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 1px 2px rgb(0 0 0 / 20%);
          transition: color 0.3s;
        }

        .el-icon--right {
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          transition: all 0.3s ease;
        }
      }
    }
  }

  .account-content {
    display: flex;
    gap: 24px;
    min-height: calc(100vh - 90px);
    padding: 88px 32px 32px;

    .account-sidebar {
      flex-shrink: 0;
      width: 240px;

      .user-info {
        padding: 30px 20px;
        margin-bottom: 24px;
        text-align: center;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgb(0 0 0 / 6%);

        h3 {
          margin: 15px 0 5px;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }

      .account-menu {
        padding: 8px;
        background-color: #fff;
        border: none;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgb(0 0 0 / 6%);

        :deep(.el-menu-item) {
          height: 50px;
          margin-bottom: 4px;
          line-height: 50px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background-color: #f7f8fc;
          }

          &.is-active {
            font-weight: bold;
            color: #fff;
            background: linear-gradient(45deg, #6b46c1, #8a5cf6);
            box-shadow: 0 4px 8px rgb(107 70 193 / 30%);
          }

          .el-icon {
            margin-right: 10px;
            font-size: 18px;
          }
        }
      }
    }

    .account-main {
      flex: 1;
      padding: 0;
      background-color: transparent;
      border-radius: 12px;
      box-shadow: none;
    }
  }
}

.card {
  padding: 24px;
  margin-bottom: 24px;
  background-color: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 6%);

  .reminder {
    margin-bottom: 20px;

    .reminder-content {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      font-size: 14px;
      color: #5a4bad;
      background-color: rgb(107 70 193 / 10%);
      border: 1px solid rgb(107 70 193 / 20%);
      border-radius: 8px;

      .el-icon {
        margin-right: 12px;
        font-size: 20px;
        color: #6b46c1;
      }

      span {
        flex: 1;
        line-height: 1.5;
      }
    }
  }

  .info-section {
    display: flex;
    gap: 24px;

    .course-info {
      flex: 0.7;

      h3 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }

    .ai-summary {
      position: relative;
      flex: 0.3;

      h3 {
        margin: 0 0 16px;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .summary-card {
        position: absolute;
        inset: 45px 0 0;
        padding: 16px;
        overflow: hidden;
        color: #fff;
        background: linear-gradient(135deg, #8a5cf6, #6b46c1);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgb(107 70 193 / 40%);

        p {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 500;
        }

        ul {
          height: calc(100% - 32px);
          padding-left: 20px;
          margin: 0;
          overflow-y: auto;
          list-style-type: disc;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background-color: rgb(255 255 255 / 50%);
            border-radius: 2px;
          }

          li {
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.6;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .course-card {
      min-height: 50vh;
      padding: 16px;
      background-color: #f7f8fc;
      border: 1px solid #eef0f5;
      border-radius: 8px;

      .course-section {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }

        .mini-course-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 12px;
        }

        .mini-course-item {
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px;
          background: #fff;
          border: 1px solid #ebeef5;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 6px 16px rgb(0 0 0 / 10%);
            transform: translateY(-4px) scale(1.02);
          }

          .course-thumb {
            position: relative;
            flex-shrink: 0;
            width: 64px;
            height: 64px;
            overflow: hidden;
            border-radius: 6px;

            .thumb-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .el-tag {
              position: absolute;
              top: 4px;
              right: 4px;
              z-index: 1;
            }
          }

          .course-content {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 4px;
            min-width: 0;

            .course-name {
              @include text-ellipsis;

              font-size: 14px;
              font-weight: 600;
              color: #333;
            }

            .course-time {
              font-size: 13px;
              color: #606266;
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
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .course-item {
      overflow: hidden;
      cursor: pointer;
      background-color: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 6px 16px rgb(0 0 0 / 10%);
        transform: translateY(-4px);
      }

      .course-cover {
        position: relative;
        width: 100%;
        padding-top: 56.25%; // 16:9

        .cover-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-status {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 1;
        }
      }

      .course-info {
        padding: 12px;

        h4 {
          @include text-ellipsis;

          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        p {
          height: 32px;
          margin: 0 0 8px;
          font-size: 13px;
          line-height: 1.4;
          color: #606266;
        }

        .course-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #909399;

          span {
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 4px;
              font-size: 14px;
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
      font-size: 14px;
      color: #606266;
      text-align: center;
    }
  }
}

.thumb-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

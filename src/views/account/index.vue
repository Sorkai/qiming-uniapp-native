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
        <div class="user-info-card">
          <div class="avatar-wrapper">
            <el-avatar :size="80" :src="userInfo?.avatar" />
            <div class="avatar-ring"></div>
          </div>
          <h3>{{ userInfo?.nickname || userInfo?.username }}</h3>
          <p class="user-role">学生</p>
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
          <el-menu-item index="virtual-lab">
            <el-icon><Cpu /></el-icon>
            <span>虚拟实验室</span>
          </el-menu-item>
          <el-menu-item index="competition">
            <el-icon><Trophy /></el-icon>
            <span>赛事场</span>
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
        <div v-else-if="activeMenu === 'virtual-lab'">
          <virtual-lab />
        </div>
        <div v-else-if="activeMenu === 'competition'">
          <competition />
        </div>
        <div v-else-if="activeMenu === 'home'">
          <!-- 快速入口卡片 -->
          <div class="quick-access-section">
            <div class="quick-access-card lab-access" @click="activeMenu = 'virtual-lab'">
              <div class="access-icon">🧪</div>
              <div class="access-info">
                <h4>虚拟实验室</h4>
                <p>探索 HTML 动画与 AI 小游戏</p>
              </div>
              <div class="access-arrow">→</div>
            </div>
            <div class="quick-access-card competition-access" @click="activeMenu = 'competition'">
              <div class="access-icon">🏆</div>
              <div class="access-info">
                <h4>赛事场</h4>
                <p>在线 OJ、题库训练、作文批改</p>
              </div>
              <div class="access-arrow">→</div>
            </div>
            <div class="quick-access-card course-access" @click="activeMenu = 'course'">
              <div class="access-icon">📚</div>
              <div class="access-info">
                <h4>我的课程</h4>
                <p>查看全部课程学习进度</p>
              </div>
              <div class="access-arrow">→</div>
            </div>
            <div class="quick-access-card cloud-access" @click="activeMenu = 'cloud-disk'">
              <div class="access-icon">☁️</div>
              <div class="access-info">
                <h4>学习云盘</h4>
                <p>管理你的学习资料</p>
              </div>
              <div class="access-arrow">→</div>
            </div>
          </div>

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
                  <p>{{ aiSummaryTitle }}</p>
                  <ul>
                    <li v-for="(item, idx) in displayedSummary" :key="idx">
                      {{ item }}
                    </li>
                    <li v-if="isTyping" class="typing-cursor">正在生成中<span class="dot" v-for="n in 3" :key="n">.</span></li>
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
  Tickets,
  Cpu,
  Trophy
} from "@element-plus/icons-vue";
import LoginDialog from "@/components/LoginDialog.vue";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken, hasManageAccess } from "@/utils/auth";
import { ElMessage } from "element-plus";
import type { DataInfo } from "@/utils/auth";
import { UserProfile, SystemNotification, Todo, VirtualLab, Competition } from "./components";
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

// ---------------- AI 总结相关（后续可替换为真实接口） ----------------
// 标题与列表通过变量控制，方便后续替换为后端返回
const aiSummaryTitle = ref("根据您的学习进度，AI助手小启为您总结：");
const aiSummaryList = ref<string[]>([
  "您目前已完成基础模块学习，知识点体系良好",
  "建议加强实践环节的练习",
  "下周将开始新模块的学习",
  "根据您的习题练习已经生成相似题目推荐，推荐练习",
  "您可以结合AI课程动画再次复习知识点体系",
  "知识点已生成可以在课程主页进行观看"
]);

// 打字效果相关状态
const typingIndex = ref(0); // 当前正在打的行索引
const charIndex = ref(0); // 当前行字符位置
const typedLines = ref<string[]>([]); // 已经显示的内容（含正在输入的行）
const isTyping = ref(false);
const typingSpeed = 55; // 每个字符毫秒
let typingTimer: number | null = null;

const resetTyping = () => {
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
  typedLines.value = [];
  typingIndex.value = 0;
  charIndex.value = 0;
  isTyping.value = false;
};

const typeNextChar = () => {
  const lines = aiSummaryList.value;
  if (typingIndex.value >= lines.length) {
    isTyping.value = false;
    typingTimer = null;
    return;
  }

  const currentLine = lines[typingIndex.value];
  // 初始化当前行
  if (!typedLines.value[typingIndex.value]) {
    typedLines.value[typingIndex.value] = "";
  }

  // 追加一个字符
  typedLines.value[typingIndex.value] += currentLine[charIndex.value];
  charIndex.value++;

  if (charIndex.value < currentLine.length) {
    typingTimer = window.setTimeout(typeNextChar, typingSpeed);
  } else {
    // 当前行完成，进入下一行
    typingIndex.value++;
    charIndex.value = 0;
    typingTimer = window.setTimeout(typeNextChar, 320); // 换行停顿
  }
};

const startTyping = () => {
  resetTyping();
  if (!aiSummaryList.value.length) return;
  isTyping.value = true;
  typeNextChar();
};

// 供模板使用的展示列表
const displayedSummary = computed(() => typedLines.value);

// 当进入首页时启动打字
watch(activeMenu, newVal => {
  if (newVal === "home") {
    // 延迟确保数据已准备
    setTimeout(() => startTyping(), 100);
  }
});

// 初次挂载如果就在首页也启动
onMounted(() => {
  if (activeMenu.value === "home") {
    setTimeout(() => startTyping(), 150);
  }
});

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
});

// 预留：未来从后端获取 AI 总结内容
// const loadAiSummary = async () => {
//   try {
//     const { code, data } = await getAiSummary();
//     if (code === 200 && data) {
//       aiSummaryTitle.value = data.title;
//       aiSummaryList.value = data.items || [];
//     }
//   } catch (e) {
//     console.error('获取AI总结失败', e);
//   }
// };

// 如果需要与首页数据一起加载，可在 loadHomeData 里调用：
// loadAiSummary();
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
    background: linear-gradient(45deg, #c8d4f0, #dce2f7);
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
        padding: 6px;
        cursor: pointer;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

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
          color: #333;
          transition: color 0.3s;
        }

        .el-icon--right {
          font-size: 18px;
          font-weight: bold;
          color: #333;
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

      .user-info-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 20px 24px;
        margin-bottom: 16px;
        text-align: center;
        background: linear-gradient(145deg, #fff, #f8faff);
        border-radius: 16px;
        box-shadow: 0 4px 24px rgb(0 0 0 / 8%);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgb(0 0 0 / 12%);

          .avatar-ring {
            transform: scale(1.05);
            border-color: #dce2f7;
          }
        }

        .avatar-wrapper {
          position: relative;
          margin-bottom: 8px;

          .el-avatar {
            border: 3px solid #fff;
            box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
            transition: transform 0.3s ease;
          }

          &:hover .el-avatar {
            transform: scale(1.05);
          }

          .avatar-ring {
            position: absolute;
            inset: -6px;
            border: 2px dashed #c8d4f0;
            border-radius: 50%;
            transition: all 0.4s ease;
            animation: rotate 12s linear infinite;
          }
        }

        h3 {
          margin: 12px 0 4px;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .user-role {
          margin: 0;
          padding: 4px 12px;
          font-size: 12px;
          color: #666;
          background: linear-gradient(135deg, #e8edf8, #dce2f7);
          border-radius: 12px;
        }
      }

      .account-menu {
        padding: 12px;
        background: linear-gradient(145deg, #fff, #fafbff);
        border: none;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgb(0 0 0 / 8%);

        :deep(.el-menu-item) {
          position: relative;
          height: 48px;
          margin-bottom: 6px;
          line-height: 48px;
          color: #555;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 4px;
            height: 0;
            background: linear-gradient(180deg, #c8d4f0, #dce2f7);
            border-radius: 0 4px 4px 0;
            transform: translateY(-50%);
            transition: height 0.3s ease;
          }

          &:hover {
            padding-left: 24px;
            color: #333;
            background: linear-gradient(90deg, rgb(220 226 247 / 40%), transparent);
            transform: scale(1.05);
            transform-origin: left center;

            &::before {
              height: 60%;
            }

            .el-icon {
              transform: scale(1.2);
              color: #5a6b8a;
            }

            span {
              font-weight: 600;
            }
          }

          &.is-active {
            padding-left: 24px;
            font-weight: 600;
            color: #333;
            background: linear-gradient(90deg, rgb(220 226 247 / 60%), rgb(220 226 247 / 20%));
            box-shadow: inset 0 0 0 1px rgb(200 212 240 / 50%);

            &::before {
              height: 70%;
              background: linear-gradient(180deg, #a8b8e8, #c8d4f0);
            }

            .el-icon {
              transform: scale(1.1);
              color: #5a6b8a;
              animation: iconPulse 1.5s ease-in-out infinite;
            }
          }

          .el-icon {
            margin-right: 12px;
            font-size: 18px;
            color: #888;
            transition: all 0.3s ease;
          }

          /* 每个菜单项不同的悬停动画 */
          &:nth-child(1):hover .el-icon {
            animation: iconBounce 0.5s ease;
          }
          &:nth-child(2):hover .el-icon {
            animation: iconFlip 0.6s ease;
          }
          &:nth-child(3):hover .el-icon {
            animation: iconHeartbeat 0.8s ease;
          }
          &:nth-child(4):hover .el-icon {
            animation: iconFloat 0.8s ease;
          }
          &:nth-child(5):hover .el-icon {
            animation: iconRing 0.6s ease;
          }
          
          /* 待办事项 - 红色打勾效果 */
          &:nth-child(6) {
            .el-icon {
              position: relative;
              overflow: visible;
            }
            
            .el-icon::after {
              content: '';
              position: absolute;
              bottom: -0.6px;
              right: -1.2px;
              width: 0;
              height: 0;
              border-bottom: 2px solid #e53935;
              border-right: 2px solid #e53935;
              border-radius: 0 0 2px 0;
              transform: rotate(45deg);
              opacity: 0;
              transition: all 0.3s ease;
            }
          }
          
          &:nth-child(6):hover {
            .el-icon::after {
              width: 8px;
              height: 14px;
              opacity: 1;
            }
          }

          span {
            font-size: 14px;
            transition: all 0.3s ease;
          }
        }
      }
    }

    /* 图标动画关键帧 */
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes iconBounce {
      0%, 100% { transform: scale(1.2) translateY(0); }
      30% { transform: scale(1.2) translateY(-6px); }
      50% { transform: scale(1.2) translateY(0); }
      70% { transform: scale(1.2) translateY(-3px); }
    }

    @keyframes iconFlip {
      0% { transform: scale(1.2) rotateY(0); }
      50% { transform: scale(1.2) rotateY(180deg); }
      100% { transform: scale(1.2) rotateY(360deg); }
    }

    /* 个人资料 - 心跳/呼吸效果 */
    @keyframes iconHeartbeat {
      0% { transform: scale(1.2); }
      15% { transform: scale(1.35); }
      30% { transform: scale(1.2); }
      45% { transform: scale(1.3); }
      60%, 100% { transform: scale(1.2); }
    }

    /* 学习云盘 - 上浮到云端效果 */
    @keyframes iconFloat {
      0% { transform: scale(1.2) translateY(0); }
      50% { transform: scale(1.2) translateY(-8px); }
      100% { transform: scale(1.2) translateY(0); }
    }

    @keyframes iconRing {
      0% { transform: scale(1.2) rotate(0); }
      10% { transform: scale(1.2) rotate(20deg); }
      20% { transform: scale(1.2) rotate(-15deg); }
      30% { transform: scale(1.2) rotate(10deg); }
      40% { transform: scale(1.2) rotate(-10deg); }
      50% { transform: scale(1.2) rotate(5deg); }
      60%, 100% { transform: scale(1.2) rotate(0); }
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1.1); }
      50% { transform: scale(1.25); }
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

.quick-access-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .quick-access-card {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 20px;
    cursor: pointer;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 6%);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgb(0 0 0 / 12%);

      .access-arrow {
        transform: translateX(4px);
        opacity: 1;
      }
    }

    .access-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      font-size: 28px;
      border-radius: 14px;
    }

    .access-info {
      flex: 1;
      min-width: 0;

      h4 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: #999;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .access-arrow {
      font-size: 20px;
      font-weight: bold;
      color: #999;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    &.lab-access .access-icon {
      background: linear-gradient(135deg, #ede9fe, #ddd6fe);
    }

    &.competition-access .access-icon {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
    }

    &.course-access .access-icon {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    }

    &.cloud-access .access-icon {
      background: linear-gradient(135deg, #e0f2fe, #bae6fd);
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
        color: #5a6b8a;
        background-color: rgb(220 226 247 / 30%);
        border: 1px solid rgb(220 226 247 / 60%);
        border-radius: 12px;

      .el-icon {
        margin-right: 12px;
        font-size: 20px;
        color: #7a8bb8;
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
        color: #333;
        background: linear-gradient(135deg, #dce2f7, #c8d4f0);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgb(220 226 247 / 60%);

        p {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 500;
        }

        ul {
          height: calc(100% - 32px);
          /* 统一移除默认样式，改为自定义圆点，避免被其它全局 reset 覆盖后无法恢复 */
          padding-left: 0;
          margin: 0;
          overflow-y: auto;
          list-style: none;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background-color: rgb(255 255 255 / 50%);
            border-radius: 2px;
          }

          li {
            position: relative;
            padding-left: 16px;
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.6;

            &:last-child {
              margin-bottom: 0;
            }

            &::before {
              content: "";
              position: absolute;
              top: 0.9em;
              left: 0;
              width: 6px;
              height: 6px;
              background: #fff;
              border-radius: 50%;
              transform: translateY(-50%);
              opacity: 0.9;
            }

            &.typing-cursor::before { display: none; }
          }
        }
      }
    }

    .course-card {
      min-height: 50vh;
      padding: 16px;
      background-color: #f7f8fc;
      border: 1px solid #eef0f5;
      border-radius: 12px;

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
          border-radius: 12px;
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
            border-radius: 8px;

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
    padding: 16px 20px;
    background: linear-gradient(135deg, #dce2f7, #c8d4f0);
    border-radius: 12px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .course-filter {
      :deep(.el-select) {
        .el-select__wrapper {
          background: #c8d4f0;
          border: none;
          border-radius: 8px;
          box-shadow: none;
        }

        .el-select__placeholder {
          color: #333 !important;
        }

        .el-select__suffix {
          color: #000 !important;
          
          .el-icon {
            color: #000 !important;
          }
        }
      }
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
      border: 1px solid rgb(220 226 247 / 60%);
      border-radius: 12px;
      box-shadow: 0 2px 12px rgb(220 226 247 / 40%);
      transition: all 0.3s ease;

      &:hover {
        border-color: #c8d4f0;
        box-shadow: 0 8px 24px rgb(200 212 240 / 50%);
        transform: translateY(-6px);
      }

      .course-cover {
        position: relative;
        width: 100%;
        padding-top: 56.25%; // 16:9
        background: linear-gradient(135deg, rgb(220 226 247 / 30%), rgb(200 212 240 / 20%));

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
        padding: 14px;
        background: linear-gradient(180deg, #fff, rgb(220 226 247 / 15%));

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
          color: #7a8bb8;

          span {
            display: flex;
            align-items: center;

            .el-icon {
              margin-right: 4px;
              font-size: 14px;
              color: #a8b8e8;
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
    border-top: 1px solid rgb(220 226 247 / 60%);

    .page-info {
      min-width: 60px;
      padding: 4px 12px;
      font-size: 14px;
      color: #5a6b8a;
      text-align: center;
      background: linear-gradient(135deg, rgb(220 226 247 / 40%), rgb(200 212 240 / 30%));
      border-radius: 10px;
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

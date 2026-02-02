<script setup lang="ts">
/**
 * 管理员端 - 讨论区统计与审计面板
 * 展示讨论区核心指标、趋势图表以及操作审计日志
 *
 * 接口对接：
 * - GET /edu/backend/v1/discussions/statistics - 获取讨论统计数据
 * - GET /edu/backend/v1/discussions/audit-logs - 获取审计日志
 */
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Refresh,
  TrendCharts,
  DataLine,
  Warning,
  User,
  Document,
  ChatLineRound,
  Star,
  Timer,
  Operation,
  Search,
  Message,
  Bell,
  PieChart,
  Histogram,
  Flag,
  Check,
  Clock
} from "@element-plus/icons-vue";
import {
  getGlobalStatistics,
  getAuditLogs,
  type GlobalStatistics,
  type AuditLog
} from "@/api/discussion-admin";
import { getTeacherUsage, getStudentUsage } from "@/api/statistics";
import { getCourseList } from "@/api/course";
import { useECharts, useDark } from "@pureadmin/utils";

defineOptions({
  name: "DiscussionStatistics"
});

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

// ==================== 状态统计 ====================

const loading = ref(false);
const stats = ref<GlobalStatistics | null>(null);
const selectedCourse = ref("");
const courses = ref([]);

// 获取课程列表用于过滤
const fetchCourses = async () => {
  try {
    const { data } = await getCourseList({ pageNum: 1, pageSize: 100 });
    courses.value = data.courseList || [];
  } catch (error) {
    console.error("加载课程列表失败", error);
  }
};

// 所有统计字段的卡片配置
const allStatCards = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "总帖子数",
      value: stats.value.totalPosts,
      icon: Document,
      color: "#409eff",
      bg: "linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.05) 100%)",
      borderColor: "rgba(64, 158, 255, 0.3)",
      tip: "全站累计发布的讨论帖总数",
      category: "content"
    },
    {
      label: "总回复数",
      value: stats.value.totalReplies,
      icon: ChatLineRound,
      color: "#67c23a",
      bg: "linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.05) 100%)",
      borderColor: "rgba(103, 194, 58, 0.3)",
      tip: "全站累计产生的回复与评论",
      category: "content"
    },
    {
      label: "总点赞数",
      value: stats.value.totalLikes,
      icon: Star,
      color: "#f59e0b",
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      tip: "互动产生的认可与点赞总量",
      category: "engagement"
    },
    {
      label: "活跃用户数",
      value: stats.value.activeUsers,
      icon: User,
      color: "#8b5cf6",
      bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
      borderColor: "rgba(139, 92, 246, 0.3)",
      tip: "最近24小时内参与互动的用户",
      category: "user"
    },
    {
      label: "今日新帖",
      value: stats.value.todayPosts,
      icon: Clock,
      color: "#06b6d4",
      bg: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)",
      borderColor: "rgba(6, 182, 212, 0.3)",
      tip: "今日 00:00 至今新增的发帖",
      isNew: true,
      category: "today"
    },
    {
      label: "今日新回复",
      value: stats.value.todayReplies,
      icon: Message,
      color: "#10b981",
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      tip: "今日 00:00 至今新增的回复",
      isNew: true,
      category: "today"
    },
    {
      label: "待审核帖子",
      value: stats.value.pendingPosts,
      icon: Flag,
      color: "#f97316",
      bg: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)",
      borderColor: "rgba(249, 115, 22, 0.3)",
      tip: "需要尽快完成内容审核",
      isPending: true,
      category: "pending"
    },
    {
      label: "待审核回复",
      value: stats.value.pendingReplies,
      icon: Bell,
      color: "#eab308",
      bg: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)",
      borderColor: "rgba(234, 179, 8, 0.3)",
      tip: "需要尽快完成回复审核",
      isPending: true,
      category: "pending"
    },
    {
      label: "待处理举报",
      value: stats.value.pendingReports,
      icon: Warning,
      color: "#ef4444",
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)",
      borderColor: "rgba(239, 68, 68, 0.3)",
      tip: "用户发起的违规举报",
      isPending: true,
      category: "pending"
    }
  ];
});

// 分组统计卡片
const statCards = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "内容统计",
      icon: Document,
      color: "#409eff",
      children: allStatCards.value.filter(c => c.category === "content")
    },
    {
      label: "今日动态",
      icon: Clock,
      color: "#06b6d4",
      children: allStatCards.value.filter(c => c.category === "today")
    }
  ];
});

// 待处理指标卡片
const pendingCards = computed(() => {
  if (!stats.value)
    return allStatCards.value.filter(c => c.category === "pending");
  return allStatCards.value.filter(c => c.category === "pending");
});

// 用户与互动统计卡片
const engagementCards = computed(() => {
  if (!stats.value) return [];
  return allStatCards.value.filter(
    c => c.category === "engagement" || c.category === "user"
  );
});

// ==================== 图表逻辑 ====================

const trendChartRef = ref();
const ratioChartRef = ref();
const usageChartRef = ref();
const summaryChartRef = ref();
const { setOptions: setTrendOptions } = useECharts(trendChartRef, { theme });
const { setOptions: setRatioOptions } = useECharts(ratioChartRef, { theme });
const { setOptions: setUsageOptions } = useECharts(usageChartRef, { theme });
const { setOptions: setSummaryOptions } = useECharts(summaryChartRef, {
  theme
});

const initCharts = async () => {
  // 趋势图 (Line Chart) - 使用 mock 或 backend 数据
  const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const postData = stats.value?.trends?.posts.map(i => i.count) || [
    120, 132, 101, 134, 90, 230, 210
  ];
  const replyData = stats.value?.trends?.replies.map(i => i.count) || [
    220, 182, 191, 234, 290, 330, 310
  ];

  setTrendOptions({
    tooltip: { trigger: "axis" },
    legend: { data: ["发帖数", "回复数"], bottom: 0 },
    grid: { left: "3%", right: "4%", bottom: "12%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: stats.value?.trends?.posts.map(i => i.date) || dates
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "发帖数",
        type: "line",
        smooth: true,
        data: postData,
        color: "#409eff",
        areaStyle: { opacity: 0.1 }
      },
      {
        name: "回复数",
        type: "line",
        smooth: true,
        data: replyData,
        color: "#67c23a",
        areaStyle: { opacity: 0.1 }
      }
    ]
  });

  // 占比图 (Pie Chart)
  setRatioOptions({
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left", bottom: 0 },
    series: [
      {
        name: "内容分布",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2
        },
        label: { show: false, position: "center" },
        emphasis: {
          label: { show: true, fontSize: "16", fontWeight: "bold" }
        },
        labelLine: { show: false },
        data: [
          {
            value: stats.value?.totalPosts || 0,
            name: "帖子",
            itemStyle: { color: "#409eff" }
          },
          {
            value: stats.value?.totalReplies || 0,
            name: "回复",
            itemStyle: { color: "#67c23a" }
          },
          {
            value: stats.value?.totalLikes || 0,
            name: "点赞",
            itemStyle: { color: "#f59e0b" }
          }
        ]
      }
    ]
  });

  // 待处理统计图 (Bar Chart)
  setSummaryOptions({
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: ["待审核帖子", "待审核回复", "待处理举报"]
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "待处理数量",
        type: "bar",
        barWidth: "50%",
        data: [
          {
            value: stats.value?.pendingPosts || 0,
            itemStyle: { color: "#f97316" }
          },
          {
            value: stats.value?.pendingReplies || 0,
            itemStyle: { color: "#eab308" }
          },
          {
            value: stats.value?.pendingReports || 0,
            itemStyle: { color: "#ef4444" }
          }
        ],
        itemStyle: {
          borderRadius: [6, 6, 0, 0]
        }
      }
    ]
  });

  // 平台使用趋势图 (Enrichment)
  try {
    const [teacherRes, studentRes] = await Promise.all([
      getTeacherUsage(),
      getStudentUsage()
    ]);
    const tData = teacherRes.data.usageInfoList || [];
    const sData = studentRes.data.usageInfoList || [];

    setUsageOptions({
      tooltip: { trigger: "axis" },
      legend: { data: ["教师使用量", "学生使用量"], bottom: 0 },
      xAxis: {
        type: "category",
        data: tData.map(i => i.date)
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "教师使用量",
          type: "bar",
          data: tData.map(i => i.usageNum),
          color: "#409eff"
        },
        {
          name: "学生使用量",
          type: "bar",
          data: sData.map(i => i.usageNum),
          color: "#67c23a"
        }
      ]
    });
  } catch (error) {
    console.warn("加载额外统计图表失败", error);
  }
};

// ==================== 审计日志 ====================

const auditLoading = ref(false);
const auditLogs = ref<AuditLog[]>([]);
const total = ref(0);
const queryForm = reactive({
  targetType: "",
  action: "",
  operatorId: null,
  startTime: "",
  endTime: "",
  pageNum: 1,
  pageSize: 10
});

const timeRange = ref([]);

// 导出字段映射（体现字段实现）
const targetTypeMap = {
  post: { text: "帖子", type: "primary" },
  reply: { text: "回复", type: "success" }
};

const fetchAuditLogs = async () => {
  auditLoading.value = true;
  try {
    const params: any = {
      pageNum: queryForm.pageNum,
      pageSize: queryForm.pageSize
    };
    if (queryForm.targetType) params.targetType = queryForm.targetType;
    if (queryForm.action) params.action = queryForm.action;
    if (queryForm.operatorId) params.operatorId = queryForm.operatorId;
    if (timeRange.value && timeRange.value.length === 2) {
      params.startTime = timeRange.value[0];
      params.endTime = timeRange.value[1];
    }
    const response = await getAuditLogs(params);
    console.log("[AuditLogs] API响应:", response);
    // 兼容不同的响应格式
    const responseData = (response as any)?.data || response;
    auditLogs.value = responseData?.list || [];
    total.value = responseData?.total || 0;
    console.log("[AuditLogs] 审计日志:", auditLogs.value, "总数:", total.value);
  } catch (error) {
    console.error("加载审计日志失败", error);
  } finally {
    auditLoading.value = false;
  }
};

const handleSearch = () => {
  queryForm.pageNum = 1;
  fetchAuditLogs();
};

const handleReset = () => {
  Object.assign(queryForm, {
    targetType: "",
    action: "",
    operatorId: null,
    startTime: "",
    endTime: "",
    pageNum: 1,
    pageSize: 10
  });
  timeRange.value = [];
  fetchAuditLogs();
};

const handleSizeChange = (val: number) => {
  queryForm.pageSize = val;
  fetchAuditLogs();
};

const handleCurrentChange = (val: number) => {
  queryForm.pageNum = val;
  fetchAuditLogs();
};

// ==================== 数据加载 ====================

const lastUpdateTime = ref(new Date().toLocaleString());

const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (selectedCourse.value) params.courseId = selectedCourse.value;
    const response = await getGlobalStatistics(params);
    console.log("[Statistics] API响应:", response);
    // 兼容不同的响应格式
    const responseData = (response as any)?.data || response;
    stats.value = responseData;
    console.log("[Statistics] 统计数据:", stats.value);
    lastUpdateTime.value = new Date().toLocaleString();
    initCharts();
  } catch (error) {
    console.error("加载统计数据失败", error);
    ElMessage.error("加载统计数据失败");
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  fetchData();
  fetchAuditLogs();
};

const handleCourseChange = () => {
  fetchData();
};

onMounted(() => {
  fetchCourses();
  fetchData();
  fetchAuditLogs();
});

watch(theme, () => {
  initCharts();
});
</script>

<template>
  <div class="statistics-container p-4">
    <!-- 操作栏 -->
    <div class="flex justify-end items-center mb-6 gap-3">
      <el-select
        v-model="selectedCourse"
        placeholder="全部课程"
        clearable
        filterable
        class="!w-[200px]"
        @change="handleCourseChange"
      >
        <el-option
          v-for="item in courses"
          :key="item.courseId"
          :label="item.title"
          :value="item.courseId.toString()"
        />
      </el-select>
      <el-button
        type="primary"
        :icon="Refresh"
        :loading="loading"
        @click="handleRefresh"
      >
        同步最新数据
      </el-button>
    </div>

    <!-- 核心数据总览 - 9个字段全部展示 -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <div
          class="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-blue-400 mr-3 rounded-full"
        />
        <span class="text-base font-bold">核心数据指标</span>
      </div>

      <!-- 第一行: 内容统计 (3卡片) -->
      <el-row :gutter="16" class="mb-4">
        <el-col
          v-for="item in allStatCards.filter(c => c.category === 'content')"
          :key="item.label"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div
            class="stat-card-modern p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            :style="{
              background: item.bg,
              border: `1px solid ${item.borderColor}`
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <el-tooltip :content="item.tip" placement="top">
                    <span
                      class="text-sm text-gray-500 dark:text-gray-400 font-medium"
                      >{{ item.label }}</span
                    >
                  </el-tooltip>
                </div>
                <div
                  class="text-3xl font-black tracking-tight"
                  :style="{ color: item.color }"
                >
                  {{ item.value?.toLocaleString() || 0 }}
                </div>
              </div>
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                :style="{ backgroundColor: `${item.color}15` }"
              >
                <el-icon :size="28" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行: 互动与用户 (2卡片) + 今日动态 (2卡片) -->
      <el-row :gutter="16" class="mb-4">
        <el-col
          v-for="item in engagementCards"
          :key="item.label"
          :xs="12"
          :sm="6"
        >
          <div
            class="stat-card-modern p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            :style="{
              background: item.bg,
              border: `1px solid ${item.borderColor}`
            }"
          >
            <div class="flex items-center justify-between">
              <div>
                <el-tooltip :content="item.tip" placement="top">
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 font-medium"
                    >{{ item.label }}</span
                  >
                </el-tooltip>
                <div
                  class="text-2xl font-bold mt-1"
                  :style="{ color: item.color }"
                >
                  {{ item.value?.toLocaleString() || 0 }}
                </div>
              </div>
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center"
                :style="{ backgroundColor: `${item.color}15` }"
              >
                <el-icon :size="22" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
            </div>
          </div>
        </el-col>
        <el-col
          v-for="item in allStatCards.filter(c => c.category === 'today')"
          :key="item.label"
          :xs="12"
          :sm="6"
        >
          <div
            class="stat-card-modern p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            :style="{
              background: item.bg,
              border: `1px solid ${item.borderColor}`
            }"
          >
            <div v-if="item.isNew" class="absolute top-2 right-2">
              <el-tag
                size="small"
                type="danger"
                effect="dark"
                round
                class="scale-75 animate-pulse"
                >NEW</el-tag
              >
            </div>
            <div class="flex items-center justify-between">
              <div>
                <el-tooltip :content="item.tip" placement="top">
                  <span
                    class="text-xs text-gray-500 dark:text-gray-400 font-medium"
                    >{{ item.label }}</span
                  >
                </el-tooltip>
                <div
                  class="text-2xl font-bold mt-1"
                  :style="{ color: item.color }"
                >
                  {{ item.value?.toLocaleString() || 0 }}
                </div>
              </div>
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center"
                :style="{ backgroundColor: `${item.color}15` }"
              >
                <el-icon :size="22" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 待处理任务预警 -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <div
          class="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 mr-3 rounded-full"
        />
        <span class="text-base font-bold">待处理任务预警</span>
        <el-badge
          :value="
            (stats?.pendingPosts || 0) +
            (stats?.pendingReplies || 0) +
            (stats?.pendingReports || 0)
          "
          :max="99"
          class="ml-3"
        />
      </div>
      <el-row :gutter="16">
        <el-col v-for="item in pendingCards" :key="item.label" :xs="24" :sm="8">
          <div
            class="pending-card p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            :style="{
              background: item.bg,
              border: `1px solid ${item.borderColor}`
            }"
          >
            <!-- 背景装饰 -->
            <div
              class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10"
              :style="{ backgroundColor: item.color }"
            />

            <div class="flex items-center justify-between relative z-10">
              <div class="flex items-center">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  :style="{ backgroundColor: `${item.color}20` }"
                >
                  <el-icon :size="24" :color="item.color">
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                <div>
                  <div
                    class="text-sm font-bold mb-0.5"
                    :style="{ color: item.color }"
                  >
                    {{ item.label }}
                  </div>
                  <div class="text-[11px] text-gray-500">{{ item.tip }}</div>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span
                  class="text-3xl font-black"
                  :style="{ color: item.color }"
                >
                  {{ item.value || 0 }}
                </span>
                <span class="text-[10px] text-gray-400">件待处理</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表展示 -->
    <el-row :gutter="16" class="mb-8">
      <el-col :xs="24" :lg="14">
        <el-card
          shadow="never"
          class="!rounded-2xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <div
                class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3"
              >
                <el-icon class="text-blue-500" :size="18"><DataLine /></el-icon>
              </div>
              <span class="font-bold">近七日讨论活跃度趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="5">
        <el-card
          shadow="never"
          class="!rounded-2xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <div
                class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mr-3"
              >
                <el-icon class="text-orange-500" :size="18"
                  ><PieChart
                /></el-icon>
              </div>
              <span class="font-bold">内容构成</span>
            </div>
          </template>
          <div ref="ratioChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="5">
        <el-card
          shadow="never"
          class="!rounded-2xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <div
                class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center mr-3"
              >
                <el-icon class="text-red-500" :size="18"><Histogram /></el-icon>
              </div>
              <span class="font-bold">待处理分布</span>
            </div>
          </template>
          <div ref="summaryChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 平台角色活跃与课程排行 -->
    <el-row :gutter="16" class="mb-8">
      <el-col :xs="24" :lg="8">
        <el-card
          shadow="never"
          class="!rounded-2xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <div
                class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center mr-3"
              >
                <el-icon class="text-green-500" :size="18"><User /></el-icon>
              </div>
              <span class="font-bold">平台角色活跃分布</span>
            </div>
          </template>
          <div ref="usageChartRef" class="h-[280px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="16">
        <el-card
          shadow="never"
          class="!rounded-2xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-3"
                >
                  <el-icon class="text-indigo-500" :size="18"
                    ><ChatLineRound
                  /></el-icon>
                </div>
                <span class="font-bold">热门课程讨论排行</span>
              </div>
              <el-button
                type="primary"
                link
                @click="$router.push('/course/list')"
              >
                查看更多
              </el-button>
            </div>
          </template>
          <el-table
            :data="stats?.topCourses || []"
            style="width: 100%"
            height="250"
          >
            <el-table-column
              type="index"
              label="排名"
              width="80"
              align="center"
            >
              <template #default="{ $index }">
                <div
                  v-if="$index < 3"
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mx-auto"
                  :class="{
                    'bg-gradient-to-br from-yellow-400 to-yellow-600':
                      $index === 0,
                    'bg-gradient-to-br from-gray-300 to-gray-500': $index === 1,
                    'bg-gradient-to-br from-orange-300 to-orange-500':
                      $index === 2
                  }"
                >
                  {{ $index + 1 }}
                </div>
                <span v-else class="text-gray-400">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="courseName"
              label="课程名称"
              show-overflow-tooltip
            />
            <el-table-column
              prop="postCount"
              label="帖子数"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                <span class="font-bold text-blue-500">{{ row.postCount }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="replyCount"
              label="回复数"
              width="120"
              align="right"
            >
              <template #default="{ row }">
                <span class="font-bold text-green-500">{{
                  row.replyCount
                }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div
            v-if="!stats?.topCourses?.length"
            class="flex flex-col items-center justify-center py-8 text-gray-400"
          >
            <el-empty :image-size="60" description="暂无热门课程数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 审计日志 -->
    <el-card shadow="never" class="!rounded-2xl border-none">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <div
              class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mr-3"
            >
              <el-icon class="text-purple-500" :size="18"
                ><Operation
              /></el-icon>
            </div>
            <div>
              <span class="font-bold">全平台操作审计日志</span>
            </div>
          </div>
          <el-tag type="warning" effect="plain" round
            >共 {{ total }} 条记录</el-tag
          >
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="bg-gray-50 dark:bg-black/20 p-4 rounded-xl mb-6">
        <el-form
          :inline="true"
          :model="queryForm"
          class="flex flex-wrap gap-y-2"
        >
          <el-form-item label="目标类型">
            <el-select
              v-model="queryForm.targetType"
              placeholder="全部类型"
              clearable
              class="!w-[120px]"
            >
              <el-option label="帖子" value="post" />
              <el-option label="回复" value="reply" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作动作">
            <el-input
              v-model="queryForm.action"
              placeholder="审批/删除等"
              clearable
              class="!w-[140px]"
            />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              class="!w-[360px]"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch"
              >搜索</el-button
            >
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="auditLoading"
        :data="auditLogs"
        border
        stripe
        style="width: 100%"
        class="!rounded-xl overflow-hidden"
      >
        <el-table-column prop="id" label="ID" width="80" align="center">
          <template #default="{ row }">
            <span class="text-xs text-gray-400">#{{ row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180">
          <template #default="{ row }">
            <div class="flex items-center text-xs">
              <el-icon class="mr-1.5 text-blue-400"><Timer /></el-icon>
              {{ new Date(row.createTime).toLocaleString() }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作者" width="200">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-avatar
                :size="28"
                class="mr-2 bg-gradient-to-br from-blue-400 to-purple-500"
              >
                {{ row.operatorName?.charAt(0) }}
              </el-avatar>
              <div class="flex flex-col">
                <span class="font-bold text-xs">{{ row.operatorName }}</span>
                <span class="text-[10px] text-gray-400"
                  >ID: {{ row.operatorId }}</span
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorRole" label="身份角色" width="100">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="
                row.operatorRole === 'admin'
                  ? 'danger'
                  : row.operatorRole === 'teacher'
                    ? 'warning'
                    : 'info'
              "
              effect="plain"
              round
            >
              {{
                row.operatorRole === "admin"
                  ? "管理员"
                  : row.operatorRole === "teacher"
                    ? "教师"
                    : row.operatorRole
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标对象" width="160">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-tag
                :type="row.targetType === 'post' ? 'primary' : 'success'"
                effect="light"
                size="small"
                class="mr-2"
              >
                {{ row.targetType === "post" ? "帖子" : "回复" }}
              </el-tag>
              <span class="text-xs text-gray-400">#{{ row.targetId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作动作" width="120">
          <template #default="{ row }">
            <span class="font-medium text-blue-600 dark:text-blue-400">{{
              row.action
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态变化" width="240">
          <template #default="{ row }">
            <div class="flex items-center gap-2 overflow-hidden">
              <span
                class="truncate text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 max-w-[80px]"
                >{{ row.previousStatus || "无" }}</span
              >
              <el-icon class="text-gray-300 flex-shrink-0"
                ><TrendCharts
              /></el-icon>
              <span
                class="truncate text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded max-w-[80px]"
                >{{ row.newStatus || "无" }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="reason"
          label="操作原因"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="text-gray-600 dark:text-gray-300">{{
              row.reason || "-"
            }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-6">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.statistics-container {
  max-width: 1600px;
  margin: 0 auto;
}

.stat-card-modern {
  backdrop-filter: blur(10px);
}

.pending-card {
  backdrop-filter: blur(10px);
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 16px 20px;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  font-size: 13px;
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-fill-color-lighter);
  font-weight: 600;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 20px;
  }
}

// 动画效果
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>

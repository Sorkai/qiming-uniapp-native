<script setup lang="ts">
/**
 * 管理员端 - 讨论区统计与审计面板
 * 展示讨论区核心指标、趋势图表以及操作审计日志
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
  Search
} from "@element-plus/icons-vue";
import {
  getGlobalStatistics,
  getAuditLogs,
  type GlobalStatistics,
  type AuditLog
} from "@/api/discussion-admin";
import {
  getTeacherUsage,
  getStudentUsage,
  getPlatformStats
} from "@/api/statistics";
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
const platformOverview = ref([]);

// 获取课程列表用于过滤
const fetchCourses = async () => {
  try {
    const { data } = await getCourseList({ pageNum: 1, pageSize: 100 });
    courses.value = data.courseList || [];
  } catch (error) {
    console.error("加载课程列表失败", error);
  }
};

// 获取平台概览数据
const fetchPlatformOverview = async () => {
  try {
    const { data } = await getPlatformStats();
    platformOverview.value = data.stats || [];
  } catch (error) {
    console.error("加载平台概览失败", error);
  }
};

// 核心指标配置
const statCards = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "核心数据",
      children: [
        {
          label: "总帖子数",
          value: stats.value.totalPosts,
          icon: Document,
          color: "#409eff",
          bg: "rgba(64, 158, 255, 0.1)"
        },
        {
          label: "总回复数",
          value: stats.value.totalReplies,
          icon: ChatLineRound,
          color: "#67c23a",
          bg: "rgba(103, 194, 58, 0.1)"
        },
        {
          label: "总点赞数",
          value: stats.value.totalLikes,
          icon: Star,
          color: "#e6a23c",
          bg: "rgba(230, 162, 60, 0.1)"
        },
        {
          label: "活跃用户数",
          value: stats.value.activeUsers,
          icon: User,
          color: "#909399",
          bg: "rgba(144, 147, 153, 0.1)"
        }
      ]
    },
    {
      label: "今日实时",
      children: [
        {
          label: "今日新帖数",
          value: stats.value.todayPosts,
          icon: Timer,
          color: "#f56c6c",
          bg: "rgba(245, 108, 108, 0.1)",
          isNew: true
        },
        {
          label: "今日新回复数",
          value: stats.value.todayReplies,
          icon: Timer,
          color: "#00ced1",
          bg: "rgba(0, 206, 209, 0.1)",
          isNew: true
        }
      ]
    }
  ];
});

// 待处理指标卡片
const pendingCards = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "待审核帖子数",
      value: stats.value.pendingPosts,
      icon: Warning,
      color: "#e6a23c",
      bg: "rgba(230, 162, 60, 0.1)",
      unit: "条",
      tip: "需要尽快完成内容审核"
    },
    {
      label: "待审核回复数",
      value: stats.value.pendingReplies,
      icon: Warning,
      color: "#e6a23c",
      bg: "rgba(230, 162, 60, 0.1)",
      unit: "条",
      tip: "需要尽快完成回复审核"
    },
    {
      label: "待处理举报数",
      value: stats.value.pendingReports,
      icon: Warning,
      color: "#f56c6c",
      bg: "rgba(245, 108, 108, 0.1)",
      unit: "个",
      tip: "用户发起的违规举报"
    }
  ];
});

// ==================== 图表逻辑 ====================

const trendChartRef = ref();
const ratioChartRef = ref();
const usageChartRef = ref();
const { setOptions: setTrendOptions } = useECharts(trendChartRef, { theme });
const { setOptions: setRatioOptions } = useECharts(ratioChartRef, { theme });
const { setOptions: setUsageOptions } = useECharts(usageChartRef, { theme });

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
          { value: stats.value?.totalPosts || 0, name: "帖子" },
          { value: stats.value?.totalReplies || 0, name: "回复" },
          { value: stats.value?.totalLikes || 0, name: "点赞" }
        ]
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
    const { data } = await getAuditLogs(params);
    auditLogs.value = data.list || [];
    total.value = data.total || 0;
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

const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (selectedCourse.value) params.courseId = selectedCourse.value;
    const { data } = await getGlobalStatistics(params);
    stats.value = data;
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
  fetchPlatformOverview();
});

watch(theme, () => {
  initCharts();
});
</script>

<template>
  <div class="statistics-container p-4">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <el-icon class="mr-2 text-primary" :size="24"><TrendCharts /></el-icon>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
          讨论区业务统计与审计面板
        </h2>
      </div>
      <div class="flex items-center gap-3">
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
        <el-button :icon="Refresh" :loading="loading" @click="handleRefresh">
          同步最新数据
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div v-for="group in statCards" :key="group.label" class="mb-6">
      <div class="flex items-center mb-3">
        <div class="w-1 h-4 bg-primary mr-2 rounded-full" />
        <span class="text-sm font-bold opacity-70">{{ group.label }}</span>
      </div>
      <el-row :gutter="16">
        <el-col
          v-for="item in group.children"
          :key="item.label"
          :xs="12"
          :sm="group.children.length === 2 ? 12 : 6"
          :md="group.children.length === 2 ? 6 : 6"
          class="mb-4"
        >
          <el-card
            shadow="hover"
            class="stat-card !border-none transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
                  :style="{ backgroundColor: item.bg }"
                >
                  <el-icon :size="26" :color="item.color">
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                <div>
                  <div class="text-gray-400 text-xs mb-1 font-medium">
                    {{ item.label }}
                  </div>
                  <div class="text-2xl font-bold tracking-tight">
                    {{ item.value || 0 }}
                  </div>
                </div>
              </div>
              <div v-if="item.isNew" class="self-start">
                <el-tag
                  size="small"
                  type="danger"
                  effect="dark"
                  round
                  class="scale-90 animate-pulse"
                  >NEW</el-tag
                >
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 异常与待处理提醒 -->
    <div class="mb-8">
      <div class="flex items-center mb-3">
        <div class="w-1 h-4 bg-orange-500 mr-2 rounded-full" />
        <span class="text-sm font-bold opacity-70">风险预警与待处理任务</span>
      </div>
      <el-row :gutter="16">
        <el-col
          v-for="item in pendingCards"
          :key="item.label"
          :xs="24"
          :sm="8"
          class="mb-4"
        >
          <el-card
            shadow="hover"
            class="!border-none transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            :style="{ backgroundColor: item.bg }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
                  :style="{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }"
                >
                  <el-icon :size="22" :color="item.color">
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                <div>
                  <div
                    class="text-xs mb-0.5 font-bold"
                    :style="{ color: item.color }"
                  >
                    {{ item.label }}
                  </div>
                  <div
                    class="text-[10px] opacity-60"
                    :style="{ color: item.color }"
                  >
                    {{ item.tip }}
                  </div>
                </div>
              </div>
              <div class="flex items-baseline gap-1">
                <span
                  class="text-2xl font-black"
                  :style="{ color: item.color }"
                  >{{ item.value || 0 }}</span
                >
                <span
                  class="text-[10px] font-bold"
                  :style="{ color: item.color }"
                  >{{ item.unit }}</span
                >
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表展示 -->
    <el-row :gutter="16" class="mb-6">
      <el-col :xs="24" :lg="12">
        <el-card
          shadow="never"
          class="!rounded-xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-blue-500"><DataLine /></el-icon>
              <span class="font-bold">近七日讨论活跃度趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card
          shadow="never"
          class="!rounded-xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-orange-500"><TrendCharts /></el-icon>
              <span class="font-bold">内容构成比例</span>
            </div>
          </template>
          <div ref="ratioChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="6">
        <el-card
          shadow="never"
          class="!rounded-xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-green-500"><User /></el-icon>
              <span class="font-bold">平台角色活跃分布</span>
            </div>
          </template>
          <div ref="usageChartRef" class="h-[300px]" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 课程讨论排行与平台指标 -->
    <el-row :gutter="16" class="mb-6">
      <el-col :xs="24" :lg="16">
        <el-card
          shadow="never"
          class="!rounded-xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <el-icon class="mr-2 text-indigo-500"
                  ><ChatLineRound
                /></el-icon>
                <span class="font-bold">热门课程讨论排行</span>
              </div>
              <el-button
                type="primary"
                link
                @click="$router.push('/course/list')"
                >查看更多</el-button
              >
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
            />
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
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <el-empty :image-size="60" description="暂无热门课程数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card
          shadow="never"
          class="!rounded-xl border-none shadow-sm h-full"
        >
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2 text-pink-500"><TrendCharts /></el-icon>
              <span class="font-bold">平台运营指标概览</span>
            </div>
          </template>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="item in platformOverview"
              :key="item.title"
              class="p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
            >
              <div class="text-[10px] text-gray-400 mb-1 leading-tight">
                {{ item.title }}
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-bold">{{ item.value }}</span>
                <span class="text-[10px] text-gray-500">{{ item.unit }}</span>
              </div>
              <div
                class="text-[10px] mt-1"
                :class="item.trend > 0 ? 'text-green-500' : 'text-red-500'"
              >
                {{ item.trend > 0 ? "↑" : "↓" }} {{ Math.abs(item.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 审计日志 -->
    <el-card shadow="never" class="!rounded-xl border-none">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <el-icon class="mr-2 text-purple-500"><Operation /></el-icon>
            <span class="font-bold">全平台操作审计日志</span>
          </div>
          <el-tag type="info">共 {{ total }} 条记录</el-tag>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="bg-gray-50 dark:bg-black/20 p-4 rounded-lg mb-6">
        <el-form
          :inline="true"
          :model="queryForm"
          class="flex flex-wrap gap-y-2"
        >
          <el-form-item label="类型">
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
          <el-form-item label="操作">
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
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-[340px]"
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
        class="!rounded-lg overflow-hidden"
      >
        <el-table-column prop="createTime" label="操作时间" width="180">
          <template #default="{ row }">
            <div class="flex items-center text-xs">
              <el-icon class="mr-1 text-blue-400"><Timer /></el-icon>
              {{ new Date(row.createTime).toLocaleString() }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作者" width="180">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-avatar :size="24" class="mr-2">{{
                row.operatorName?.charAt(0)
              }}</el-avatar>
              <div class="flex flex-col">
                <span class="font-bold text-xs">{{ row.operatorName }}</span>
                <span class="text-[10px] text-gray-400"
                  >ID: {{ row.operatorId }}</span
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorRole" label="身份" width="100">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.operatorRole === 'admin' ? 'danger' : 'info'"
              effect="plain"
            >
              {{ row.operatorRole }}
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
        <el-table-column prop="action" label="动作" width="100">
          <template #default="{ row }">
            <span class="font-medium text-blue-600 dark:text-blue-400">{{
              row.action
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态演变" width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-2 overflow-hidden">
              <span
                class="truncate text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500"
                >{{ row.previousStatus || "-" }}</span
              >
              <el-icon class="text-gray-300"><TrendCharts /></el-icon>
              <span
                class="truncate text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                >{{ row.newStatus || "-" }}</span
              >
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="reason"
          label="备注/原因"
          min-width="150"
          show-overflow-tooltip
        />
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
.stat-card {
  border: none !important;
  background: var(--el-bg-color);
}

:deep(.el-card__header) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 15px 20px;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  font-size: 13px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 20px;
  }
}
</style>

<script setup lang="ts">
/**
 * 管理员端 - 讨论区统计面板
 * 全平台讨论区数据统计与可视化
 */
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  Refresh,
  TrendCharts,
  DataLine,
  Warning,
  User,
  Document,
  ChatDotRound
} from "@element-plus/icons-vue";
import {
  getGlobalStatistics,
  type GlobalStatistics
} from "@/api/discussion-admin";

defineOptions({
  name: "DiscussionStatistics"
});

// 状态
const loading = ref(false);
const stats = ref<GlobalStatistics | null>(null);
const dateRange = ref<[Date, Date] | null>(null);

// 快捷时间选项
const shortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString().slice(0, 10);
      params.endDate = dateRange.value[1].toISOString().slice(0, 10);
    }
    const { data } = await getGlobalStatistics(params);
    stats.value = data;
  } catch (error) {
    console.error("加载统计数据失败", error);
    ElMessage.error("加载统计数据失败");
  } finally {
    loading.value = false;
  }
};

// 刷新
const handleRefresh = () => {
  fetchData();
};

// 日期变化
const handleDateChange = () => {
  fetchData();
};

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "w";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
};

// 计算环比
const getChangeClass = (change: number) => {
  if (change > 0) return "text-success";
  if (change < 0) return "text-danger";
  return "text-gray-500";
};

const getChangeText = (change: number) => {
  if (change > 0) return `+${change}%`;
  if (change < 0) return `${change}%`;
  return "0%";
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="statistics-page p-4">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            @change="handleDateChange"
          />
        </div>
        <el-button :icon="Refresh" :loading="loading" @click="handleRefresh">
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 核心指标卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-blue-100">
              <el-icon class="text-blue-500" :size="24"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ formatNumber(stats?.totalPosts || 0) }}
              </div>
              <div class="stat-label">总帖子数</div>
              <div
                class="stat-change"
                :class="getChangeClass(stats?.postsChange || 0)"
              >
                {{ getChangeText(stats?.postsChange || 0) }} 较上期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-green-100">
              <el-icon class="text-green-500" :size="24"
                ><ChatDotRound
              /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ formatNumber(stats?.totalReplies || 0) }}
              </div>
              <div class="stat-label">总回复数</div>
              <div
                class="stat-change"
                :class="getChangeClass(stats?.repliesChange || 0)"
              >
                {{ getChangeText(stats?.repliesChange || 0) }} 较上期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-purple-100">
              <el-icon class="text-purple-500" :size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ formatNumber(stats?.activeUsers || 0) }}
              </div>
              <div class="stat-label">活跃用户</div>
              <div
                class="stat-change"
                :class="getChangeClass(stats?.usersChange || 0)"
              >
                {{ getChangeText(stats?.usersChange || 0) }} 较上期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-orange-100">
              <el-icon class="text-orange-500" :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ formatNumber(stats?.pendingReviews || 0) }}
              </div>
              <div class="stat-label">待审核</div>
              <div class="stat-change text-warning">需要处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-red-100">
              <el-icon class="text-red-500" :size="24"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ formatNumber(stats?.pendingReports || 0) }}
              </div>
              <div class="stat-label">待处理举报</div>
              <div class="stat-change text-danger">需要处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="8" :md="4">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-cyan-100">
              <el-icon class="text-cyan-500" :size="24"
                ><TrendCharts
              /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">
                {{ (stats?.avgResponseTime || 0).toFixed(1) }}h
              </div>
              <div class="stat-label">平均响应时间</div>
              <div
                class="stat-change"
                :class="getChangeClass(-(stats?.responseTimeChange || 0))"
              >
                {{ getChangeText(-(stats?.responseTimeChange || 0)) }} 较上期
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="mb-4">
      <!-- 发帖趋势 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon><DataLine /></el-icon>
              <span>发帖趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <div class="chart-content">
              <div v-if="stats?.dailyTrend" class="trend-list">
                <div
                  v-for="(item, index) in stats.dailyTrend.slice(-7)"
                  :key="index"
                  class="trend-item"
                >
                  <span class="trend-date">{{ item.date.slice(5) }}</span>
                  <el-progress
                    :percentage="
                      (item.posts /
                        Math.max(...stats.dailyTrend.map(t => t.posts))) *
                      100
                    "
                    :stroke-width="20"
                    :show-text="false"
                    class="flex-1 mx-3"
                  />
                  <span class="trend-value">{{ item.posts }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无数据" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 内容分布 -->
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon><TrendCharts /></el-icon>
              <span>内容类型分布</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <div v-if="stats?.contentDistribution" class="distribution-list">
              <div
                v-for="(item, index) in stats.contentDistribution"
                :key="index"
                class="distribution-item"
              >
                <div class="flex justify-between mb-1">
                  <span>{{ item.type }}</span>
                  <span class="text-gray-500"
                    >{{ item.count }} ({{ item.percentage }}%)</span
                  >
                </div>
                <el-progress
                  :percentage="item.percentage"
                  :stroke-width="10"
                  :color="
                    ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'][
                      index % 5
                    ]
                  "
                />
              </div>
            </div>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mb-4">
      <!-- 热门课程 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <span>热门讨论课程 TOP 10</span>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, index) in stats?.hotCourses || []"
              :key="item.courseId"
              class="rank-item"
            >
              <span class="rank-number" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </span>
              <span class="rank-name flex-1">{{ item.courseName }}</span>
              <span class="rank-value">{{ item.postCount }} 帖</span>
            </div>
            <el-empty
              v-if="!stats?.hotCourses?.length"
              description="暂无数据"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 活跃用户 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <span>活跃用户 TOP 10</span>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, index) in stats?.topUsers || []"
              :key="item.userId"
              class="rank-item"
            >
              <span class="rank-number" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </span>
              <div class="flex items-center gap-2 flex-1">
                <el-avatar :size="24" :src="item.avatar" />
                <span class="rank-name">{{ item.name }}</span>
              </div>
              <span class="rank-value">{{ item.postCount }} 帖</span>
            </div>
            <el-empty v-if="!stats?.topUsers?.length" description="暂无数据" />
          </div>
        </el-card>
      </el-col>

      <!-- 高质量内容 -->
      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <span>高质量帖子 TOP 10</span>
          </template>
          <div class="rank-list">
            <div
              v-for="(item, index) in stats?.qualityPosts || []"
              :key="item.postId"
              class="rank-item"
            >
              <span class="rank-number" :class="{ 'top-three': index < 3 }">
                {{ index + 1 }}
              </span>
              <span class="rank-name flex-1 truncate" :title="item.title">
                {{ item.title }}
              </span>
              <span class="rank-value">
                <el-icon class="text-orange-500"><Star /></el-icon>
                {{ item.likes }}
              </span>
            </div>
            <el-empty
              v-if="!stats?.qualityPosts?.length"
              description="暂无数据"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 审核统计 -->
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <span>审核统计</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="今日审核">
              {{ stats?.reviewStats?.todayReviewed || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="本周审核">
              {{ stats?.reviewStats?.weekReviewed || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="审核通过率">
              <span class="text-success">
                {{ ((stats?.reviewStats?.passRate || 0) * 100).toFixed(1) }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="平均审核时间">
              {{ (stats?.reviewStats?.avgReviewTime || 0).toFixed(1) }} 分钟
            </el-descriptions-item>
            <el-descriptions-item label="敏感词命中">
              {{ stats?.reviewStats?.sensitiveHits || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="自动过滤">
              {{ stats?.reviewStats?.autoFiltered || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <span>举报统计</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="今日举报">
              {{ stats?.reportStats?.todayReports || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="本周举报">
              {{ stats?.reportStats?.weekReports || 0 }}
            </el-descriptions-item>
            <el-descriptions-item label="处理率">
              <span class="text-success">
                {{ ((stats?.reportStats?.handleRate || 0) * 100).toFixed(1) }}%
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="平均处理时间">
              {{ (stats?.reportStats?.avgHandleTime || 0).toFixed(1) }} 小时
            </el-descriptions-item>
            <el-descriptions-item label="有效举报率">
              {{ ((stats?.reportStats?.validRate || 0) * 100).toFixed(1) }}%
            </el-descriptions-item>
            <el-descriptions-item label="误报率">
              {{
                ((1 - (stats?.reportStats?.validRate || 0)) * 100).toFixed(1)
              }}%
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Star } from "@element-plus/icons-vue";
export default {
  components: { Star }
};
</script>

<style lang="scss" scoped>
.statistics-page {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-info {
        .stat-number {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .stat-label {
          font-size: 13px;
          color: #909399;
          margin-top: 2px;
        }

        .stat-change {
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }
  }

  .chart-placeholder {
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;

    .chart-content {
      width: 100%;
      height: 100%;
      padding: 10px 0;
    }

    .trend-list {
      .trend-item {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .trend-date {
          width: 50px;
          font-size: 13px;
          color: #606266;
        }

        .trend-value {
          width: 40px;
          text-align: right;
          font-size: 13px;
          font-weight: 500;
        }
      }
    }

    .distribution-list {
      .distribution-item {
        padding: 12px 0;

        &:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
      }
    }
  }

  .rank-list {
    .rank-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .rank-number {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: #f0f0f0;
        color: #909399;
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        &.top-three {
          background: linear-gradient(135deg, #f6d365, #fda085);
          color: white;
        }
      }

      .rank-name {
        font-size: 14px;
        color: #303133;
      }

      .rank-value {
        font-size: 13px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}
</style>

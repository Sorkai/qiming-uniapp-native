<template>
  <div class="mb-6">
    <!-- 日期筛选区域 -->
    <div class="date-filter-row mb-4 flex items-center justify-between">
      <div class="filter-hint">
        <el-icon class="mr-1"><InfoFilled /></el-icon>
        <span class="filter-hint-text"
          >日期范围筛选「课程总数」「累计课时」和「完成率」，「在学人数」固定统计近7天</span
        >
      </div>
      <div class="filter-controls flex items-center gap-3">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          clearable
          @change="handleDateChange"
        />
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 统计卡片 -->
    <el-row class="stats-grid" :gutter="20">
      <el-col
        v-for="(item, index) in statsItems"
        :key="index"
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card
          shadow="always"
          class="stats-card"
          :style="{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }"
        >
          <div class="flex items-center">
            <div :class="['icon-wrapper', item.colorClass]">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <div class="ml-4 stats-content">
              <div class="stats-label">
                {{ item.label }}
                <el-tooltip
                  v-if="item.hint"
                  :content="item.hint"
                  placement="top"
                >
                  <el-icon class="hint-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="stats-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Notebook,
  User,
  Timer,
  Trophy,
  Refresh,
  InfoFilled,
  QuestionFilled
} from "@element-plus/icons-vue";

const props = defineProps<{
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalHours: number;
    completionRate: string;
  };
}>();

const emit = defineEmits<{
  (e: "date-change", value: { startDate?: string; endDate?: string }): void;
}>();

// 日期范围
const dateRange = ref<[string, string] | null>(null);

// 日期快捷选项
const dateShortcuts = [
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

// 日期变化处理
const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    emit("date-change", { startDate: val[0], endDate: val[1] });
  } else {
    emit("date-change", {});
  }
};

// 重置日期
const handleReset = () => {
  dateRange.value = null;
  emit("date-change", {});
};

const statsItems = computed(() => [
  {
    label: "课程总数",
    value: props.stats.totalCourses,
    icon: Notebook,
    colorClass: "blue",
    hint: "日期范围内有学习记录的课程数，不选日期则显示全部课程"
  },
  {
    label: "在学人数",
    value: props.stats.totalStudents,
    icon: User,
    colorClass: "green",
    hint: "近7天有学习记录的学生数（不受日期筛选影响）"
  },
  {
    label: "累计课时",
    value: props.stats.totalHours,
    icon: Timer,
    colorClass: "orange",
    hint: "日期范围内有学习记录课程的总课时（单位：分钟）"
  },
  {
    label: "平均完成率",
    value: props.stats.completionRate,
    icon: Trophy,
    colorClass: "purple",
    hint: "日期范围内 完成记录数÷总学习记录数×100%"
  }
]);
</script>

<style scoped lang="scss">
.stats-card {
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border: none !important;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%) !important;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgb(0 0 0 / 12%) !important;
    transform: translateY(-2px);
  }

  .icon-wrapper {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 16px;

    &.blue {
      color: var(--el-color-primary);
      background: linear-gradient(
        135deg,
        rgb(64 158 255 / 15%) 0%,
        rgb(64 158 255 / 8%) 100%
      );
    }

    &.green {
      color: var(--el-color-success);
      background: linear-gradient(
        135deg,
        rgb(103 194 58 / 15%) 0%,
        rgb(103 194 58 / 8%) 100%
      );
    }

    &.orange {
      color: var(--el-color-warning);
      background: linear-gradient(
        135deg,
        rgb(230 162 60 / 15%) 0%,
        rgb(230 162 60 / 8%) 100%
      );
    }

    &.purple {
      color: #9146ff;
      background: linear-gradient(
        135deg,
        rgb(145 70 255 / 15%) 0%,
        rgb(145 70 255 / 8%) 100%
      );
    }
  }

  .stats-content {
    flex: 1;
    min-width: 0;
  }

  .stats-label {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  .stats-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }
}

.date-filter-row {
  padding: 12px 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  gap: 16px;

  .filter-hint {
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);

    .el-icon {
      flex-shrink: 0;
      color: var(--el-color-primary);
    }
  }
}

.filter-hint-text {
  min-width: 0;
  white-space: normal;
}

.filter-controls {
  flex-shrink: 0;
}

.hint-icon {
  margin-left: 4px;
  font-size: 14px;
  vertical-align: middle;
  color: var(--el-text-color-placeholder);
  cursor: help;
}

@media screen and (max-width: 768px) {
  .mb-6 {
    margin-bottom: 8px !important;
  }

  .date-filter-row {
    align-items: center !important;
    gap: 8px;
    padding: 7px 8px;
    margin-bottom: 6px !important;
    border-radius: 12px;
  }

  .filter-hint {
    flex: 1 1 36%;
    width: auto;
    min-width: 0;
    font-size: 11px;
    line-height: 1.4;
  }

  .filter-hint-text {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .filter-controls {
    flex-direction: row;
    flex: 1 1 64%;
    width: auto;
    min-width: 0;
    align-items: stretch !important;
    gap: 6px !important;
  }

  :deep(.filter-controls .el-date-editor) {
    flex: 1 1 auto;
    width: auto;
    margin-right: 0;
  }

  :deep(.filter-controls .el-button) {
    flex: 0 0 76px;
    width: 76px;
    margin-left: 0;
  }

  :deep(.filter-controls .el-input__wrapper),
  :deep(.filter-controls .el-button) {
    min-height: 30px;
  }

  :deep(.filter-controls .el-range-input) {
    font-size: 11px;
  }

  :deep(.filter-controls .el-range-separator) {
    min-width: 18px;
    padding: 0;
    font-size: 12px;
  }

  .stats-grid {
    --el-row-gutter: 8px !important;
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  :deep(.stats-grid .el-col) {
    display: block;
    max-width: 100%;
    padding-right: 0 !important;
    padding-left: 0 !important;
    margin-bottom: 0;
    flex: none;
  }

  .stats-card {
    height: 58px;
    margin-bottom: 0;
    border-radius: 12px;

    :deep(.el-card__body) {
      height: 100%;
      padding: 7px 8px;
      box-sizing: border-box;
    }

    :deep(.el-card__body > .flex) {
      height: 100%;
      align-items: flex-start;
      justify-content: center;
      gap: 3px;
      flex-direction: column;
    }

    .stats-content {
      margin-left: 0 !important;
    }

    .icon-wrapper {
      width: 20px;
      height: 20px;
      border-radius: 7px;

      :deep(.el-icon) {
        font-size: 15px !important;
      }
    }

    .stats-label {
      max-width: 100%;
      margin-bottom: 1px;
      overflow: hidden;
      font-size: 10.5px;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: keep-all;
    }

    .stats-value {
      font-size: 17px;
      line-height: 1.1;
    }
  }
}

@media screen and (max-width: 360px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style lang="scss">
html.qiming-native-webview.ua-mobile .date-filter-row {
  box-shadow: 0 8px 18px rgb(28 39 68 / 5%);
}
</style>

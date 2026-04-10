<template>
  <div class="system-notification" :class="currentTheme">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span>系统通知</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in notificationList"
          :key="index"
          :timestamp="item.timestamp"
          placement="top"
          class="notification-item"
        >
          <el-card class="content-card">
            <h4>{{ item.title }}</h4>
            <p class="publisher">发布者: {{ item.publisher }}</p>
            <p class="content">{{ item.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  currentTheme?: string;
}>();

const notificationList = ref([
  {
    title: "系统维护通知",
    publisher: "信息中心",
    content:
      "为提供更好的服务，学习平台将于本周六凌晨2:00-4:00进行系统维护，届时将无法访问，请提前做好安排。",
    timestamp: "2025/07/17 09:13"
  },
  {
    title: "“迎新杯”篮球赛报名通知",
    publisher: "体育部",
    content: "一年一度的“迎新杯”篮球赛即将拉开帷幕，欢迎各位同学踊跃报名参加。",
    timestamp: "2025/06/20 14:33"
  },
  {
    title: "端午节放假安排",
    publisher: "学校办公室",
    content:
      "根据国家法定节假日安排，我校端午节放假时间为5月31日至6月2日，共3天。祝大家节日快乐！",
    timestamp: "2025/05/28 15:30"
  },
  {
    title: "关于2024-2025学年第二学期选课的通知",
    publisher: "教务处",
    content: "各位同学，新学期的选课工作即将开始，请大家在规定时间内完成选课。",
    timestamp: "2025/03/01 10:02"
  }
]);
</script>

<style lang="scss" scoped>
.system-notification {
  .main-card {
    .dark & {
      background-color: transparent;
      border: none;

      :deep(.el-card__header) {
        color: #f1f5f9;
        border-bottom-color: #1e293b;
      }
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

  .notification-item {
    :deep(.el-timeline-item__timestamp) {
      font-size: 13px;
      font-weight: 500;
      color: #7c9cf5;

      .dark & {
        color: #97b4f7;
      }
    }

    :deep(.el-timeline-item__node) {
      background-color: #97b4f7;
    }

    :deep(.el-timeline-item__tail) {
      border-left-color: rgb(151 180 247 / 25%);
    }

    .content-card {
      cursor: pointer;
      border-radius: 14px;
      transition: all 0.3s ease-in-out;

      .dark & {
        background-color: #1e293b;
        border-color: #334155;
      }

      &:hover {
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
        transform: translateY(-5px);

        .dark & {
          background-color: #334155;
          box-shadow: 0 4px 12px rgb(0 0 0 / 40%);
        }
      }
    }
  }

  h4 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;

    .dark & {
      color: #f1f5f9;
    }
  }

  p {
    margin: 0 0 5px;
    font-size: 14px;

    &.publisher {
      color: #909399;

      .dark & {
        color: #94a3b8;
      }
    }

    &.content {
      line-height: 1.6;
      color: #606266;

      .dark & {
        color: #cbd5e1;
      }
    }
  }
}
</style>

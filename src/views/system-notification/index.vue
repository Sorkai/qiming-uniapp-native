<template>
  <div class="main">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统通知</span>
        </div>
      </template>
      <el-timeline class="notification-timeline">
        <el-timeline-item
          v-for="(item, index) in notificationList"
          :key="index"
          :timestamp="item.timestamp"
          placement="top"
        >
          <el-card class="notification-card">
            <h4>{{ item.title }}</h4>
            <p class="publisher">发布者: {{ item.publisher }}</p>
            <p>{{ item.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "SystemNotification"
});

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
    content: "一年一度的“迎新杯”篮球赛即将拉开帷幕，欢迎各位教师踊跃报名参加。",
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
    content: "各位老师，新学期的选课工作即将开始，请及时完成开课计划。",
    timestamp: "2025/03/01 10:02"
  }
]);
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .box-card {
    margin-bottom: 16px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .notification-timeline {
    padding: 20px 10px;
  }

  .notification-card {
    border-radius: 12px;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    border: 1px solid var(--el-border-color-lighter);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: var(--el-color-primary-light-5);
    }

    h4 {
      margin: 0 0 10px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0 0 5px;
      font-size: 14px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }

    .publisher {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      &::before {
        content: "";
        display: inline-block;
        width: 4px;
        height: 12px;
        background: var(--el-color-primary);
        margin-right: 8px;
        border-radius: 2px;
      }
    }
  }
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary);
}
</style>

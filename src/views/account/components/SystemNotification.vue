<template>
  <div class="system-notification">
    <el-card shadow="never">
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
        >
          <el-card>
            <h4>{{ item.title }}</h4>
            <p>发布者: {{ item.publisher }}</p>
            <p>{{ item.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const notificationList = ref([
  {
    title: "关于2024-2025学年第一学期选课的通知",
    publisher: "教务处",
    content: "各位同学，新学期的选课工作即将开始，请大家在规定时间内完成选课。",
    timestamp: "2024/09/01 10:00"
  },
  {
    title: "国庆节放假安排",
    publisher: "学校办公室",
    content: "根据国家法定节假日安排，我校国庆节放假时间为10月1日至10月7日，共7天。祝大家节日快乐！",
    timestamp: "2024/09/28 15:30"
  },
  {
    title: "系统维护通知",
    publisher: "信息中心",
    content: "为提供更好的服务，学习平台将于本周六凌晨2:00-4:00进行系统维护，届时将无法访问，请提前做好安排。",
    timestamp: "2024/09/25 09:00"
  },
  {
    title: "“迎新杯”篮球赛报名通知",
    publisher: "体育部",
    content: "一年一度的“迎新杯”篮球赛即将拉开帷幕，欢迎各位同学踊跃报名参加。",
    timestamp: "2024/09/20 14:00"
  }
]);
</script>

<style lang="scss" scoped>
.system-notification {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h4 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0 0 5px;
    font-size: 14px;
    color: #606266;
  }
}
</style>

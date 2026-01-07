<template>
  <el-row :gutter="20" class="mb-6">
    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statsItems" :key="index">
      <el-card shadow="never" class="stats-card">
        <div class="flex items-center">
          <div :class="['icon-wrapper', item.colorClass]">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="ml-4">
            <div class="stats-label">{{ item.label }}</div>
            <div class="stats-value">{{ item.value }}</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Notebook, User, Timer, Trophy } from "@element-plus/icons-vue";

const props = defineProps<{
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalHours: number;
    completionRate: string;
  };
}>();

const statsItems = computed(() => [
  { label: '课程总数', value: props.stats.totalCourses, icon: Notebook, colorClass: 'blue' },
  { label: '在学人数', value: props.stats.totalStudents, icon: User, colorClass: 'green' },
  { label: '累计课时', value: props.stats.totalHours, icon: Timer, colorClass: 'orange' },
  { label: '平均完成率', value: props.stats.completionRate, icon: Trophy, colorClass: 'purple' }
]);
</script>


<style scoped lang="scss">
.stats-card {
  border: none;
  background: var(--el-bg-color-overlay);
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.blue { background: rgba(64, 158, 255, 0.1); color: #409eff; }
    &.green { background: rgba(103, 194, 58, 0.1); color: #67c23a; }
    &.orange { background: rgba(230, 162, 60, 0.1); color: #e6a23c; }
    &.purple { background: rgba(153, 102, 255, 0.1); color: #9966ff; }
  }

  .stats-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 4px;
  }

  .stats-value {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
  }
}
</style>

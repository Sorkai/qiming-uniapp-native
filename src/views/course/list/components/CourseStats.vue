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
  border-radius: var(--el-border-radius-base);
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: var(--el-border-radius-base);
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.blue { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
    &.green { background: var(--el-color-success-light-9); color: var(--el-color-success); }
    &.orange { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
    &.purple { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
  }

  .stats-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
  }

  .stats-value {
    font-size: 20px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}
</style>

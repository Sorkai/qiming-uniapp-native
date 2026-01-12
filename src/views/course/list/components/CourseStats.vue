<template>
  <el-row :gutter="20" class="mb-6">
    <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statsItems" :key="index">
      <el-card shadow="never" class="stats-card">
        <div class="flex items-center">
          <div :class="['icon-wrapper', item.colorClass]">
            <el-icon :size="32"><component :is="item.icon" /></el-icon>
          </div>
          <div class="ml-4 stats-content">
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
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  .icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.blue { 
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(64, 158, 255, 0.08) 100%); 
      color: var(--el-color-primary); 
    }
    &.green { 
      background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(103, 194, 58, 0.08) 100%); 
      color: var(--el-color-success); 
    }
    &.orange { 
      background: linear-gradient(135deg, rgba(230, 162, 60, 0.15) 0%, rgba(230, 162, 60, 0.08) 100%); 
      color: var(--el-color-warning); 
    }
    &.purple { 
      background: linear-gradient(135deg, rgba(145, 70, 255, 0.15) 0%, rgba(145, 70, 255, 0.08) 100%); 
      color: #9146ff; 
    }
  }

  .stats-content {
    flex: 1;
    min-width: 0;
  }

  .stats-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .stats-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.2;
  }
}
</style>

<script setup lang="ts">
/**
 * 3D 虚拟教室模块
 * 目前处于空壳状态，待后续二次开发
 */
defineOptions({
  name: "Classroom3D"
});
</script>

<template>
  <div class="classroom-container">
    <el-empty description="3D虚拟教室正在规划中..." />
  </div>
</template>

<style scoped>
.classroom-container {
  padding: 20px;
  background-color: var(--el-bg-color);
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

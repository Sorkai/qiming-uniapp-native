<template>
  <div class="main">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="生成教案" name="generate">
          <plan-generator @switch-tab="switchTab" />
        </el-tab-pane>
        <el-tab-pane label="教案列表" name="list">
          <plan-list />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import PlanGenerator from "./components/PlanGenerator.vue";
import PlanList from "./components/PlanList.vue";

// 标签页控制
const activeTab = ref("generate");

// 切换标签页
const switchTab = (tabName: string) => {
  activeTab.value = tabName;
};
</script>

<style lang="scss" scoped>
.main {
  margin: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 
<script setup lang="ts">
import { ref } from "vue";
import {
  Document,
  VideoPlay,
  Monitor,
  Search,
  MagicStick
} from "@element-plus/icons-vue";

const resources = ref([
  {
    id: 1,
    title: "红黑树左旋右旋 3D动画",
    type: "video",
    tag: "视频讲解",
    desc: "自动生成的动画讲解逻辑",
    time: "2小时前",
    icon: VideoPlay,
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: 2,
    title: "数据结构期中错题重组",
    type: "doc",
    tag: "互动题库",
    desc: "基于你历史易错点生成",
    time: "昨天",
    icon: Document,
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    id: 3,
    title: "二叉树实战代码沙盒",
    type: "code",
    tag: "代码实操",
    desc: "带有智能断点的运行环境",
    time: "3天前",
    icon: Monitor,
    color: "text-green-500",
    bg: "bg-green-50"
  }
]);

const searchQuery = ref("");
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-gray-50/30">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-800">资源生成工作台</h2>
        <p class="text-sm text-gray-500 mt-1">
          根据学习画像自动推演和生成的专属教学物料
        </p>
      </div>
      <el-button type="primary" size="large" round>
        <template #icon
          ><el-icon><MagicStick /></el-icon
        ></template>
        新建生成任务
      </el-button>
    </div>

    <div class="mb-6 flex gap-4">
      <el-input
        v-model="searchQuery"
        placeholder="搜索生成的资源..."
        class="max-w-md"
        :prefix-icon="Search"
      />
      <el-select placeholder="资源类型" class="w-32">
        <el-option label="全部" value="all" />
        <el-option label="视频动画" value="video" />
        <el-option label="交互文档" value="doc" />
        <el-option label="代码沙盒" value="code" />
      </el-select>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
    >
      <div
        v-for="res in resources"
        :key="res.id"
        class="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
      >
        <div class="flex items-start justify-between mb-4">
          <div :class="['p-3 rounded-xl', res.bg, res.color]">
            <el-icon :size="24"><component :is="res.icon" /></el-icon>
          </div>
          <el-tag
            size="small"
            effect="light"
            class="rounded-full !border-none"
            :type="
              res.type === 'video'
                ? 'primary'
                : res.type === 'doc'
                  ? 'warning'
                  : 'success'
            "
          >
            {{ res.tag }}
          </el-tag>
        </div>
        <h3
          class="text-lg font-bold text-gray-700 mb-2 group-hover:text-primary transition-colors"
        >
          {{ res.title }}
        </h3>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ res.desc }}</p>
        <div
          class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50"
        >
          <span>{{ res.time }}</span>
          <span
            class="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium"
            >查看详情 →</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

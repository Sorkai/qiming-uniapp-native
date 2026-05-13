<script setup lang="ts">
import { ref } from "vue";
import {
  DataAnalysis,
  Reading,
  CircleCheck,
  InfoFilled,
  Cpu,
  Promotion
} from "@element-plus/icons-vue";

// 课程上下文：嵌入式 Linux 开发实践教程
const courseInfo = ref({
  name: "嵌入式 Linux 开发实践教程",
  subtitle: "Qt GUI 与 TensorFlow Lite 集成",
  totalChapters: 12,
  finishedChapters: 7
});

const stats = ref([
  { label: "综合评估等级", value: "B+", sub: "前 32%" },
  { label: "预估结业分", value: "84", sub: "稳中有升" },
  { label: "章节里程碑", value: "7/12", sub: "进度 58%" },
  { label: "实操通过率", value: "76%", sub: "略高于均值" }
]);

const strengths = ref([
  { title: "Qt 信号与槽机制", desc: "测验正确率 96%，理解透彻" },
  { title: "交叉编译工具链配置", desc: "完成 sysroot 实操任务 3/3" },
  { title: "Qt 布局管理器", desc: "响应式 UI 题目无错误" }
]);

const weakPoints = ref([
  {
    level: "high",
    title: "TFLite Delegate 硬件加速选择",
    desc: "GPU / NNAPI / XNNPACK 适用场景判断错误率 45%，建议刷《Delegate 决策树》专项。"
  },
  {
    level: "high",
    title: "TFLite Interpreter C++ API 调用顺序",
    desc: "AllocateTensors / Invoke / typed_output_tensor 步骤记忆混淆。"
  },
  {
    level: "mid",
    title: "训练后量化 vs 量化感知训练 (QAT)",
    desc: "概念辨析题答题时间超出平均 40%，建议复看 2.1 节。"
  },
  {
    level: "mid",
    title: "V4L2 摄像头采集与 QImage 转换",
    desc: "上手实验通过，但帧率优化未达标 (实测 12 FPS / 目标 25 FPS)。"
  }
]);

const timeline = ref([
  {
    time: "今天 11:20",
    content: "完成《Qt 布局管理器》章节测验：满分通过",
    type: "success"
  },
  {
    time: "昨天 16:40",
    content: "提交《TFLite 模型转换》代码作业，量化后体积下降 73%",
    type: "primary"
  },
  {
    time: "昨天 09:15",
    content: "Delegate 选择题失分较多，AI 已生成专项练习推送",
    type: "warning"
  },
  {
    time: "本周一",
    content: "完成第一阶段（Qt 框架与环境）综合测评，等级 A",
    type: "success"
  }
]);

const suggestions = ref([
  "重新观看 2.2 节《TFLite Interpreter C++ API》并完成沙盒实操。",
  "在路径规划中接入「Delegate 决策树」专项训练 (20min)。",
  "进入虚拟实验室，尝试将 V4L2 采集帧率优化到 25 FPS 以上。"
]);
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto">
    <div class="mb-8 flex justify-between items-end gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"
        >
          <el-icon :size="24"><Cpu /></el-icon>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">阶段学习评估</h2>
          <p class="text-sm text-gray-500 mt-1">
            课程：{{ courseInfo.name }} ·
            <span class="text-gray-400">{{ courseInfo.subtitle }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <el-tag round type="info" class="!border-none bg-gray-100"
          >章节 {{ courseInfo.finishedChapters }}/{{
            courseInfo.totalChapters
          }}</el-tag
        >
        <el-button plain round>导出为 PDF</el-button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        v-for="(s, i) in stats"
        :key="i"
        class="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <div class="text-gray-500 text-sm mb-2 relative z-10">
          {{ s.label }}
        </div>
        <div class="text-4xl font-black text-gray-800 mb-1 relative z-10">
          {{ s.value }}
        </div>
        <div
          class="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full relative z-10"
        >
          {{ s.sub }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 弱点警示 -->
      <div class="bg-white p-6 rounded-2xl border border-red-100">
        <h4 class="font-bold text-red-600 flex items-center gap-2 mb-4">
          <el-icon><InfoFilled /></el-icon>
          薄弱知识点警示
        </h4>
        <div class="space-y-3">
          <div
            v-for="(w, i) in weakPoints"
            :key="i"
            class="flex flex-col p-3 rounded-lg border"
            :class="
              w.level === 'high'
                ? 'bg-red-50/50 border-red-50'
                : 'bg-orange-50/50 border-orange-50'
            "
          >
            <span
              class="text-sm font-bold"
              :class="w.level === 'high' ? 'text-red-700' : 'text-orange-700'"
              >{{ w.title }}</span
            >
            <span
              class="text-xs mt-1"
              :class="w.level === 'high' ? 'text-red-500' : 'text-orange-500'"
              >{{ w.desc }}</span
            >
          </div>
        </div>
      </div>

      <!-- 优势能力 -->
      <div class="bg-white p-6 rounded-2xl border border-green-100">
        <h4 class="font-bold text-green-600 flex items-center gap-2 mb-4">
          <el-icon><CircleCheck /></el-icon>
          稳定优势能力
        </h4>
        <div class="space-y-3">
          <div
            v-for="(item, i) in strengths"
            :key="i"
            class="flex flex-col p-3 bg-green-50/50 rounded-lg border border-green-50"
          >
            <span class="text-sm font-bold text-green-700">{{
              item.title
            }}</span>
            <span class="text-xs text-green-500 mt-1">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <!-- 动态流水 -->
      <div class="bg-white p-6 rounded-2xl border border-gray-100">
        <h4 class="font-bold text-gray-700 flex items-center gap-2 mb-6">
          <el-icon class="text-primary"><DataAnalysis /></el-icon>
          最近评估动态
        </h4>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in timeline"
            :key="index"
            :type="activity.type"
            :timestamp="activity.time"
            hollow
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- AI 建议 -->
      <div
        class="bg-gradient-to-br from-primary/5 via-purple-50 to-transparent p-6 rounded-2xl border border-primary/10"
      >
        <h4 class="font-bold text-primary flex items-center gap-2 mb-4">
          <el-icon><Promotion /></el-icon>
          AI 提升建议
        </h4>
        <ul class="space-y-3">
          <li
            v-for="(tip, i) in suggestions"
            :key="i"
            class="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-white"
          >
            <span
              class="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 font-bold"
              >{{ i + 1 }}</span
            >
            <span class="text-sm text-gray-700 leading-relaxed">{{
              tip
            }}</span>
          </li>
        </ul>
        <div class="mt-5 flex items-center gap-2">
          <el-button type="primary" round size="small"
            ><el-icon class="mr-1"><Reading /></el-icon>一键加入学习路径</el-button
          >
          <el-button plain round size="small">下次再说</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Location,
  Aim,
  Check,
  VideoPlay,
  Edit,
  Cpu,
  Reading
} from "@element-plus/icons-vue";

// 课程上下文：嵌入式 Linux 开发实践教程（Qt GUI 与 TensorFlow Lite 集成）
const courseMeta = ref({
  name: "嵌入式 Linux 开发实践教程",
  subtitle: "Qt GUI 与 TensorFlow Lite 集成",
  totalPhase: 4,
  currentPhase: 2,
  estimatedHours: 36
});

const roadmapData = ref([
  {
    title: "第一阶段：嵌入式 Qt 框架与环境搭建",
    status: "completed",
    summary: "理解 Qt 模块体系，完成交叉编译工具链与 Qt Creator 远程部署",
    nodes: [
      { name: "Qt Widgets / QML 与模块体系", type: "video", done: true },
      { name: "交叉编译工具链与 sysroot 配置", type: "doc", done: true },
      { name: "Qt Creator 远程部署小测", type: "quiz", done: true }
    ]
  },
  {
    title: "第二阶段：Qt GUI 编程核心 (当前)",
    status: "active",
    summary: "信号与槽机制、布局管理器与 Qt Designer 综合实战",
    nodes: [
      {
        name: "信号与槽机制 (Lambda 与 Connect)",
        type: "video",
        done: true
      },
      {
        name: "QHBoxLayout / QGridLayout 响应式布局",
        type: "video",
        done: false,
        current: true
      },
      { name: "Qt Designer 拖拽 + uic 生成代码", type: "code", done: false },
      { name: "QThread 与 QtConcurrent 多线程", type: "quiz", done: false }
    ]
  },
  {
    title: "第三阶段：TensorFlow Lite 推理引擎部署",
    status: "pending",
    summary: "TFLite 模型转换、量化与 C++ Interpreter 接入",
    nodes: [
      { name: "TFLite 模型转换 (SavedModel → .tflite)", type: "video", done: false },
      { name: "训练后量化 / 量化感知训练 (QAT)", type: "doc", done: false },
      { name: "C++ Interpreter 加载与推理", type: "code", done: false },
      { name: "GPU / NNAPI / XNNPACK Delegate", type: "doc", done: false }
    ]
  },
  {
    title: "第四阶段：Qt + TFLite 综合智能终端实践",
    status: "pending",
    summary: "V4L2 摄像头采集 → TFLite 实时推理 → Qt UI 反馈闭环",
    nodes: [
      { name: "V4L2 摄像头数据流接入", type: "code", done: false },
      { name: "推理结果叠加 (QPainter 绘框)", type: "code", done: false },
      { name: "目标板 FPS / 内存性能调优", type: "quiz", done: false }
    ]
  }
]);
</script>

<template>
  <div
    class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto custom-scrollbar"
  >
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800">个性化路径规划</h2>
      <p class="text-sm text-gray-500 mt-1">
        基于学习画像为你动态规划的最优学习路线
      </p>

      <!-- 课程信息卡 -->
      <div
        class="mt-4 max-w-3xl bg-gradient-to-r from-primary/5 via-purple-50 to-transparent border border-primary/10 rounded-2xl p-5 flex items-center gap-4"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary"
        >
          <el-icon :size="28"><Cpu /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-gray-800">{{ courseMeta.name }}</span>
            <el-tag size="small" type="info" round class="!border-none">{{
              courseMeta.subtitle
            }}</el-tag>
          </div>
          <div class="mt-2 text-xs text-gray-500 flex items-center gap-3">
            <span
              >当前进度：第
              <span class="text-primary font-bold">{{
                courseMeta.currentPhase
              }}</span>
              / {{ courseMeta.totalPhase }} 阶段</span
            >
            <span class="text-gray-300">|</span>
            <span>预计 {{ courseMeta.estimatedHours }} 学时</span>
          </div>
        </div>
        <el-button type="primary" round size="small">
          <el-icon class="mr-1"><Reading /></el-icon>继续学习
        </el-button>
      </div>
    </div>

    <div class="max-w-3xl mx-auto w-full relative">
      <div
        v-for="(phase, index) in roadmapData"
        :key="index"
        class="relative pl-8 mb-12"
      >
        <!-- Connecting Line -->
        <div
          v-if="index !== roadmapData.length - 1"
          class="absolute left-[11px] top-8 bottom-[-48px] w-0.5"
          :class="
            phase.status === 'completed'
              ? 'bg-primary'
              : 'bg-gray-200 border-dashed'
          "
        />

        <!-- Timeline Node -->
        <div
          class="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10"
          :class="{
            'border-primary text-primary': phase.status === 'completed',
            'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]':
              phase.status === 'active',
            'border-gray-300': phase.status === 'pending'
          }"
        >
          <div
            v-if="phase.status === 'completed'"
            class="w-3 h-3 bg-primary rounded-full"
          />
          <div
            v-else-if="phase.status === 'active'"
            class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"
          />
          <div v-else class="w-2 h-2 bg-gray-300 rounded-full" />
        </div>

        <h3
          class="text-lg font-bold mb-4"
          :class="
            phase.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
          "
        >
          {{ phase.title }}
        </h3>
        <p
          v-if="phase.summary"
          class="-mt-3 mb-4 text-xs"
          :class="
            phase.status === 'pending' ? 'text-gray-300' : 'text-gray-500'
          "
        >
          {{ phase.summary }}
        </p>

        <div class="grid gap-3">
          <div
            v-for="(node, nIndex) in phase.nodes"
            :key="nIndex"
            class="flex items-center p-3 rounded-lg border transition-all"
            :class="{
              'bg-primary/5 border-primary/20 text-primary': node.current,
              'bg-white border-gray-100 opacity-60':
                !node.done && !node.current,
              'bg-white border-gray-100 hover:border-primary/30 cursor-pointer':
                node.done
            }"
          >
            <el-icon
              class="mr-3"
              :class="
                node.done
                  ? 'text-green-500'
                  : node.current
                    ? 'text-blue-500'
                    : 'text-gray-300'
              "
            >
              <Check v-if="node.done" />
              <Location v-else-if="node.current" />
              <Aim v-else />
            </el-icon>

            <div
              class="flex-1 font-medium text-sm"
              :class="!node.done && !node.current ? 'text-gray-400' : ''"
            >
              {{ node.name }}
            </div>

            <el-tag
              v-if="node.type === 'video'"
              size="small"
              type="info"
              class="!border-none bg-gray-50"
            >
              <el-icon class="mr-1"><VideoPlay /></el-icon> 视频
            </el-tag>
            <el-tag
              v-else-if="node.type === 'quiz'"
              size="small"
              type="info"
              class="!border-none bg-gray-50"
            >
              <el-icon class="mr-1"><Edit /></el-icon> 练习
            </el-tag>
            <el-tag
              v-else-if="node.type === 'code'"
              size="small"
              type="warning"
              class="!border-none"
            >
              <el-icon class="mr-1"><Edit /></el-icon> 代码实操
            </el-tag>
            <el-tag
              v-else-if="node.type === 'doc'"
              size="small"
              type="success"
              class="!border-none"
            >
              <el-icon class="mr-1"><Reading /></el-icon> 文档
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="ai-chat-module h-full flex flex-col bg-transparent">
    <!-- 顶部精简导航 -->
    <div
      class="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md rounded-t-2xl border-b border-gray-100 z-10"
    >
      <div class="flex items-center gap-2">
        <el-tag size="small" effect="plain" round class="animate-pulse">{{
          activeCourse
        }}</el-tag>
        <span class="text-sm font-medium text-gray-600 uppercase tracking-wider"
          >Session Console</span
        >
      </div>
      <div class="flex items-center gap-3">
        <el-button-group>
          <el-button
            :icon="RefreshRight"
            circle
            size="small"
            class="hover:rotate-180 transition-transform duration-500"
          />
          <el-button
            :icon="More"
            circle
            size="small"
            class="hover:scale-110 transition-transform duration-300"
          />
        </el-button-group>
      </div>
    </div>

    <!-- 消息流：移除背景修饰文字，保持纯净 -->
    <el-scrollbar ref="scrollbarRef" class="flex-1 px-4 py-6 scroll-smooth">
      <transition-group
        appear
        name="chat-list"
        tag="div"
        class="w-full space-y-8 pb-10"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="[
            'flex w-full',
            msg.type === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[85%] lg:max-w-[75%] transition-all duration-500 hover:transform hover:-translate-y-1',
              msg.type === 'user' ? 'ml-auto' : 'mr-auto'
            ]"
          >
            <!-- 角色标识 -->
            <div
              class="flex items-center gap-2 mb-2 px-1 transition-opacity duration-300"
              :class="msg.type === 'user' ? 'flex-row-reverse' : ''"
            >
              <el-avatar
                :size="24"
                :icon="msg.type === 'user' ? User : Cpu"
                class="shadow-sm hover:scale-110 transition-transform duration-300"
              />
              <span
                class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"
                >{{ msg.role }}</span
              >
            </div>

            <!-- 消息气泡 -->
            <div
              :class="[
                'p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden',
                msg.type === 'user'
                  ? 'bg-primary text-white rounded-[20px] rounded-tr-none'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-[20px] rounded-tl-none'
              ]"
            >
              <!-- 气泡内的流光扫过效果 (Hover呈现) -->
              <div
                v-if="msg.type === 'system'"
                class="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out opacity-0 group-hover:opacity-100"
              ></div>

              <div
                class="text-[14px] leading-relaxed whitespace-pre-wrap relative z-10"
              >
                {{ msg.content }}
              </div>

              <!-- 资源卡片：多种形态 -->
              <transition-group
                appear
                name="stagger-list"
                tag="div"
                class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10"
              >
                <div
                  v-for="(res, index) in msg.resources"
                  :key="res.title"
                  :style="{ transitionDelay: `${index * 100}ms` }"
                  class="flex flex-col gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-primary/50 hover:bg-primary/5 cursor-pointer shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div
                    v-if="res.type === 'video'"
                    class="h-24 w-full bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center group-hover:shadow-inner"
                  >
                    <div
                      class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"
                    ></div>
                    <el-icon
                      class="text-white text-3xl opacity-80 group-hover:scale-125 group-hover:text-primary transition-all duration-300 z-10"
                      ><VideoPlay
                    /></el-icon>
                    <div
                      class="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 rounded z-10 font-mono"
                    >
                      03:45
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <el-icon
                      :class="[
                        'mt-0.5 text-lg transition-transform duration-300 group-hover:rotate-12',
                        res.type === 'video' ? 'text-red-500' : 'text-primary'
                      ]"
                    >
                      <component
                        :is="res.type === 'video' ? 'Film' : 'Document'"
                      />
                    </el-icon>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-[13px] font-bold text-gray-800 truncate group-hover:text-primary transition-colors"
                      >
                        {{ res.title }}
                      </p>
                      <p class="text-[10px] text-gray-400 truncate">
                        {{ res.desc || "AI 协同智能体生成" }}
                      </p>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </div>
      </transition-group>
    </el-scrollbar>

    <!-- 输入区：悬浮极简设计 -->
    <div class="p-4 bg-transparent z-10 w-full">
      <div class="w-full relative group">
        <!-- 发光的呼吸框 -->
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[24px] blur opacity-0 group-focus-within:opacity-100 group-focus-within:animate-pulse transition duration-500"
        ></div>
        <div
          class="relative bg-white border border-gray-200 rounded-[24px] p-2 flex items-end gap-2 shadow-sm focus-within:shadow-lg focus-within:-translate-y-1 transition-all duration-300"
        >
          <el-button
            :icon="Plus"
            circle
            class="mb-1 hover:rotate-90 hover:bg-gray-100 transition-all duration-300"
          />
          <el-input
            v-model="input"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 5 }"
            placeholder="与多智能体互动，描述你的学习需求..."
            class="ai-input-base"
            @keydown.enter.prevent="handleSend"
          />
          <el-button
            type="primary"
            :icon="Promotion"
            circle
            class="mb-1 transform transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-primary/40 active:scale-95"
            :class="
              input
                ? 'scale-100 opacity-100 translate-x-0'
                : 'scale-0 opacity-0 translate-x-4'
            "
            @click="handleSend"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
  User,
  Cpu,
  Document,
  Film,
  VideoPlay,
  Promotion,
  Plus,
  RefreshRight,
  More
} from "@element-plus/icons-vue";

const props = defineProps<{
  messages: any[];
  activeCourse: string;
}>();

const emit = defineEmits(["send"]);
const input = ref("");

const scrollbarRef = ref();

const handleSend = () => {
  if (!input.value.trim()) return;
  emit("send", input.value);
  input.value = "";

  nextTick(() => {
    if (scrollbarRef.value) {
      // 添加滚动动画延迟，让消息先渲染完
      setTimeout(() => {
        scrollbarRef.value.setScrollTop(9999);
      }, 100);
    }
  });
};

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      if (scrollbarRef.value) {
        setTimeout(() => {
          scrollbarRef.value.setScrollTop(9999);
        }, 100);
      }
    });
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
:deep(.ai-input-base) {
  .el-textarea__inner {
    border: none !important;
    box-shadow: none !important;
    padding: 8px 12px;
    background: transparent;
    font-size: 14px;
    resize: none;
    transition: all 0.3s;
  }
  .el-textarea__inner:focus {
    background: transparent;
  }
}

/* 消息列表过渡动画 */
.chat-list-enter-active,
.chat-list-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.chat-list-enter-from,
.chat-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 资源卡片交错出现动画 */
.stagger-list-enter-active,
.stagger-list-leave-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stagger-list-enter-from,
.stagger-list-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.9);
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>

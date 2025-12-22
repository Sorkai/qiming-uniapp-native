<template>
  <!-- HTML 动画列表 -->
  <div
    v-show="visible"
    class="course-materials-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="HTML动画"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="e => $emit('toggle-theme', e)"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <!-- 内容 -->
    <div class="materials-container" :class="currentTheme">
      <div v-if="loading" class="materials-list">
        <el-empty description="加载中..." />
      </div>
      <div v-else-if="animationList.length === 0" class="materials-list">
        <el-empty description="暂无可展示的章节动画" />
      </div>
      <div v-else class="materials-list album-grid">
        <div
          v-for="(item, index) in animationList"
          :key="item.chapterId"
          class="animation-card"
          :class="{ dark: currentTheme === 'dark' }"
          v-motion
          :initial="{ opacity: 0, y: 20, scale: 0.95 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: (index % 4) * 100
            }
          }"
          @click="openHtmlAnimation(item)"
        >
          <div class="card-preview">
            <img :src="getPlaceholder(item.chapterId)" alt="预览图" />
            <div class="play-overlay">
              <el-icon size="48">
                <component :is="VideoPlay" />
              </el-icon>
            </div>
          </div>
          <!-- 毛玻璃内容层：带平滑渐变 mask -->
          <div class="card-info-glass">
            <div class="card-title">{{ item.chapterName }}</div>
            <div class="card-version">Version {{ item.version }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="htmlAnimPreviewVisible"
      width="90%"
      top="2vh"
      class="immersive-dialog"
      :show-close="false"
      destroy-on-close
    >
      <template #header>
        <div class="dialog-header-custom">
          <div class="header-info">
            <el-icon><component :is="VideoPlay" /></el-icon>
            <span class="title">HTML动画预览</span>
          </div>
          <div class="header-actions">
            <div class="action-btn" @click="openHtmlAnimInNew" title="新窗口打开">
              <el-icon size="18"><component :is="ExternalLink" /></el-icon>
            </div>
            <div class="action-btn close" @click="htmlAnimPreviewVisible = false" title="关闭">
              <el-icon size="18"><component :is="Close" /></el-icon>
            </div>
          </div>
        </div>
      </template>
      <div v-if="htmlAnimPreviewUrl" class="preview-wrapper-immersive">
        <div v-if="iframeLoading" class="loading-overlay">
          <el-icon class="is-loading" size="40"><component :is="Loading" /></el-icon>
        </div>
        <iframe 
          :src="htmlAnimPreviewUrl" 
          frameborder="0" 
          class="preview-iframe" 
          @load="iframeLoading = false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import CourseHeader from "./CourseHeader.vue";
import logo from "@/assets/kecheng.jpg";
import VideoPlay from "~icons/ep/video-play";
import Close from "~icons/ep/close";
import ExternalLink from "~icons/ep/link";
import Loading from "~icons/ep/loading";

// 动画卡片占位图（根据 chapterId 循环使用）
const placeholders = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80",
  "https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&q=80",
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&q=80"
];

const getPlaceholder = (id: number) => {
  return placeholders[id % placeholders.length];
};

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  loading: boolean;
  animationList: Array<{
    chapterId: number;
    chapterName: string;
    version: string;
    url: string;
  }>;
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme", event: MouseEvent): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 内部状态
const htmlAnimPreviewVisible = ref(false);
const htmlAnimPreviewUrl = ref("");
const iframeLoading = ref(true);

// 监听弹窗打开，重置加载状态
watch(htmlAnimPreviewVisible, (val) => {
  if (val) iframeLoading.value = true;
});

// 打开 HTML 动画预览
const openHtmlAnimation = (item: { url: string }) => {
  htmlAnimPreviewUrl.value = item.url;
  htmlAnimPreviewVisible.value = true;
};

// 在新窗口打开
const openHtmlAnimInNew = () => {
  if (htmlAnimPreviewUrl.value) {
    window.open(htmlAnimPreviewUrl.value, "_blank");
  }
};
</script>

<style scoped>
/* 根容器背景统一为系统浅色调渐变 */
.course-materials-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: transparent; /* 背景透明，防止侧边栏色差 */
}

.course-materials-wrapper.dark {
  background: transparent;
}

.materials-container {
  /* 88px 顶部偏移对齐侧边栏，32px 左间距与课程页面保持一致 */
  padding: 88px 32px 32px !important;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  box-sizing: border-box;
}

.materials-list.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
  width: 100%;
  padding: 0;
}

.animation-card {
  position: relative;
  height: 240px;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.animation-card:hover {
  transform: translateY(-10px);
  /* 统一使用系统标准蓝色 #409eff */
  box-shadow: 0 20px 40px rgba(64, 158, 255, 0.2);
  border-color: rgba(64, 158, 255, 0.4);
}

.animation-card.dark {
  background-color: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.card-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.animation-card:hover .card-preview img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(64, 158, 255, 0.1);
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 5;
}

.animation-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay .el-icon {
  font-size: 56px;
  color: #fff;
  filter: drop-shadow(0 0 10px rgba(64, 158, 255, 0.6));
}

/* 优化的平滑毛玻璃过渡：由于 mask-image 实现模糊渐变更加优雅 */
.card-info-glass {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 80px 24px 24px;
  /* 降低背景颜色遮挡，使其更透明 */
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0.6) 100%
  );
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  /* 调整 mask 渐变，让预览图露出更多 */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: all 0.4s ease;
}

.dark .card-info-glass {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.2) 40%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.animation-card:hover .card-info-glass {
  padding-bottom: 28px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.animation-card:hover .card-title {
  color: #409eff;
}

.dark .card-title {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.card-version {
  font-size: 13px;
  color: #409eff;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.dark .card-version {
  color: #409eff;
}

/* 预览弹窗样式统一 */
:deep(.immersive-dialog) {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(30px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
  border-radius: 28px !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.3) !important;
  overflow: hidden;
}

:deep(.dark .immersive-dialog) {
  background: rgba(15, 23, 42, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.dialog-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-info .el-icon {
  color: #409eff; /* 统一系统蓝 */
  font-size: 22px;
}

.header-info .title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.dark .header-info .title {
  color: #f1f5f9;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.04);
  color: #475569;
}

.dark .action-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.action-btn:hover {
  background: rgba(64, 158, 255, 0.15);
  color: #409eff;
  transform: translateY(-2px);
}

.action-btn.close:hover {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.preview-wrapper-immersive {
  width: 100%;
  height: 82vh;
  position: relative;
  background: #fff;
}

.dark .preview-wrapper-immersive {
  background: #1a1a1a;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  z-index: 10;
  color: #409eff;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 统一配色方案 */
:deep(.light .card-version) {
  color: #409eff;
  opacity: 0.8;
}
</style>

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
      <div v-if="loading" class="materials-list empty-state">
        <el-empty description="加载中..." />
      </div>
      <div v-else-if="animationList.length === 0" class="materials-list empty-state">
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
          @mouseenter="hoveredChapterId = item.chapterId"
          @mouseleave="hoveredChapterId = null"
        >
          <div class="card-preview">
            <template v-if="item.previewVideoUrl && hoveredChapterId === item.chapterId">
              <video
                :src="item.previewVideoUrl"
                autoplay
                loop
                muted
                playsinline
                class="hover-video"
              />
            </template>
            <template v-else>
              <img :src="item.previewUrl || getPlaceholder(item.chapterId)" alt="预览图" />
            </template>
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
      :class="['immersive-dialog', currentTheme]"
      :show-close="false"
      destroy-on-close
    >
      <div class="dialog-header-custom">
        <div class="header-info">
          <el-icon><component :is="VideoPlay" /></el-icon>
          <span class="title">HTML动画预览</span>
        </div>
        <div class="header-actions">
          <!-- 管理员预览时可见的快照按钮 (示例) -->
          <div class="action-btn capture-btn" @click="captureAndUpload" title="截取当前画面为封面">
            <el-icon size="18"><component :is="Camera" /></el-icon>
            <span class="btn-text">设为封面</span>
          </div>
          <div class="action-btn" @click="openHtmlAnimInNew" title="新窗口打开">
            <el-icon size="18"><component :is="ExternalLink" /></el-icon>
          </div>
          <div class="action-btn close" @click="htmlAnimPreviewVisible = false" title="关闭">
            <el-icon size="18"><component :is="Close" /></el-icon>
          </div>
        </div>
      </div>
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
import Camera from "~icons/ep/camera";

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
    previewUrl?: string;
    previewVideoUrl?: string;
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
const hoveredChapterId = ref<number | null>(null);
const htmlAnimPreviewVisible = ref(false);
const htmlAnimPreviewUrl = ref("");
const iframeLoading = ref(true);

// 监听弹窗打开，重置加载状态
watch(htmlAnimPreviewVisible, (val) => {
  if (val) iframeLoading.value = true;
});

// 模拟快照采集（实际开发中需通过 iframe postMessage 获取或画布截取）
const captureAndUpload = () => {
  const chapter = props.animationList.find(a => a.url === htmlAnimPreviewUrl.value);
  if (!chapter) return;
  
  // 这里可以具体扩展为调用 html2canvas 或后端接口
  console.log(`正在为章节 ${chapter.chapterName} 采集画面并设为封面...`);
  // 后续对接：ElMessage.success("快照已提交，正在生成新封面...");
};

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

<style scoped lang="scss">
/* 根容器背景统一为系统浅色调渐变 */
.course-materials-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: transparent; /* 背景透明，防止侧边栏色差 */

  &.dark {
    background: transparent;
  }

  .materials-container {
    /* 顶部 80px 偏移以避开 Header，左右 32px 保持对齐 */
    padding: 80px 32px 24px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
}

.materials-list.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
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
  /* 强制开启 GPU 加速，修复毛玻璃边缘渲染 Bug */
  transform: translateZ(0);
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

.card-preview img,
.hover-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.animation-card:hover .card-preview img,
.animation-card:hover .hover-video {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 184, 212, 0.1);
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
  filter: drop-shadow(0 0 10px rgba(0, 184, 212, 0.6));
}

/* 优化的平滑毛玻璃过渡：由于 mask-image 实现模糊渐变更加优雅 */
.card-info-glass {
  position: absolute;
  bottom: -1px;
  left: -1px;
  right: -1px;
  padding: 80px 32px 24px;
  /* 降低背景颜色遮挡，使其更透明 */
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0.6) 100%
  );
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  /* 调整 mask 渐变，确保底部完全不透明以修复边缘缝隙 */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%, black 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 60%, black 100%);
  border-radius: 0 0 24px 24px;
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
  color: #00b8d4;
  /* 增加白色描边，确保在各种背景图上都能看清 */
  text-shadow: 
    -1px -1px 0 #fff,  
     1px -1px 0 #fff,
    -1px  1px 0 #fff,
     1px  1px 0 #fff,
     0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .card-title {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.dark .animation-card:hover .card-title {
  color: #00b8d4;
  /* 深色模式下同样使用白色描边，配合青色文字会有很强的霓虹感 */
  text-shadow: 
    -1px -1px 0 #fff,  
     1px -1px 0 #fff,
    -1px  1px 0 #fff,
     1px  1px 0 #fff;
}

.card-version {
  font-size: 13px;
  color: #1d1d1f;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.dark .card-version {
  color: #00b8d4;
}

.dark :deep(.el-empty__image img),
.dark :deep(.el-empty__image svg) {
  filter: brightness(0.7);
  opacity: 0.8;
}

/* 预览弹窗样式统一 */
.course-materials-wrapper {
  :deep(.immersive-dialog) {
    background: rgba(248, 250, 252, 0.8);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;

    &.dark {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 0;
    }
  }
}

.dialog-header-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  margin: 20px 20px 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.dark .dialog-header-custom {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-info .el-icon {
  color: #00b8d4;
  font-size: 20px;
}

.header-info .title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.dark .header-info .title {
  color: #f1f5f9;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.03);
  color: #475569;
}

.action-btn.capture-btn {
  width: auto;
  padding: 0 12px;
  gap: 6px;
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.action-btn.capture-btn .btn-text {
  font-size: 13px;
  font-weight: 500;
}

.action-btn.capture-btn:hover {
  background: #409eff;
  color: white;
}

.dark .action-btn {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.dark .action-btn.capture-btn {
  background: rgba(64, 158, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
}

.action-btn:hover {
  background: rgba(0, 184, 212, 0.15);
  color: #00b8d4;
  transform: translateY(-2px);
}

.action-btn.close:hover {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.preview-wrapper-immersive {
  width: calc(100% - 40px);
  height: 80vh;
  margin: 0 20px 20px;
  position: relative;
  background: #f8fafc;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark .preview-wrapper-immersive {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  color: #1d1d1f;
  opacity: 0.8;
}
</style>

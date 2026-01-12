<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { CaptureArea } from "./types";

defineOptions({
  name: "CaptureOverlay"
});

const props = defineProps<{
  origin?: { x: number; y: number };
}>();

const emit = defineEmits<{
  (e: "capture", area: CaptureArea): void;
  (e: "cancel"): void;
}>();

// 选区状态
const isSelecting = ref(false);
const startPoint = ref({ x: 0, y: 0 });
const endPoint = ref({ x: 0, y: 0 });

// 涟漪动画状态
const rippleComplete = ref(false);

// 计算涟漪原点位置
const originX = computed(() => props.origin?.x ?? window.innerWidth - 58);
const originY = computed(() => props.origin?.y ?? window.innerHeight - 128);

// 计算选区样式
const selectionStyle = computed(() => {
  if (!isSelecting.value && startPoint.value.x === 0) {
    return { display: "none" };
  }
  
  const x = Math.min(startPoint.value.x, endPoint.value.x);
  const y = Math.min(startPoint.value.y, endPoint.value.y);
  const width = Math.abs(endPoint.value.x - startPoint.value.x);
  const height = Math.abs(endPoint.value.y - startPoint.value.y);
  
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`
  };
});

// 计算选区尺寸文本
const selectionSize = computed(() => {
  const width = Math.abs(endPoint.value.x - startPoint.value.x);
  const height = Math.abs(endPoint.value.y - startPoint.value.y);
  return `${Math.round(width)} × ${Math.round(height)}`;
});

// 开始选择
const handleMouseDown = (e: MouseEvent) => {
  // 忽略右键
  if (e.button !== 0) return;
  
  isSelecting.value = true;
  startPoint.value = { x: e.clientX, y: e.clientY };
  endPoint.value = { x: e.clientX, y: e.clientY };
};

// 选择中
const handleMouseMove = (e: MouseEvent) => {
  if (!isSelecting.value) return;
  endPoint.value = { x: e.clientX, y: e.clientY };
};

// 结束选择
const handleMouseUp = (e: MouseEvent) => {
  if (!isSelecting.value) return;
  
  isSelecting.value = false;
  
  const width = Math.abs(endPoint.value.x - startPoint.value.x);
  const height = Math.abs(endPoint.value.y - startPoint.value.y);
  
  // 如果选区太小，视为取消
  if (width < 10 || height < 10) {
    resetSelection();
    return;
  }
  
  // 计算选区
  const area: CaptureArea = {
    x: Math.min(startPoint.value.x, endPoint.value.x),
    y: Math.min(startPoint.value.y, endPoint.value.y),
    width,
    height
  };
  
  emit("capture", area);
};

// 重置选区
const resetSelection = () => {
  startPoint.value = { x: 0, y: 0 };
  endPoint.value = { x: 0, y: 0 };
};

// 取消截图
const handleCancel = () => {
  resetSelection();
  emit("cancel");
};

// ESC键取消
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    handleCancel();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  // 涟漪动画完成后显示边框跑马灯（涟漪扩散到边缘需要约1.8秒）
  setTimeout(() => {
    rippleComplete.value = true;
  }, 1800);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      class="capture-overlay"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <!-- 从按钮扩散的涟漪效果 -->
      <div 
        class="ripple-container"
        :style="{ '--origin-x': `${originX}px`, '--origin-y': `${originY}px` }"
      >
        <div class="ripple ripple-1" />
        <div class="ripple ripple-2" />
      </div>
      
      <!-- 屏幕边缘浮光效果 -->
      <div v-show="rippleComplete" class="edge-glow">
        <!-- 顶部浮光 -->
        <div class="glow-edge glow-top">
          <div class="glow-particle glow-cyan" v-for="i in 4" :key="`top-${i}`" :style="{ '--delay': `${i * 0.5}s`, '--offset': `${i * 25}%` }" />
        </div>
        <!-- 右侧浮光 -->
        <div class="glow-edge glow-right">
          <div class="glow-particle glow-indigo" v-for="i in 3" :key="`right-${i}`" :style="{ '--delay': `${i * 0.6}s`, '--offset': `${i * 33}%` }" />
        </div>
        <!-- 底部浮光 -->
        <div class="glow-edge glow-bottom">
          <div class="glow-particle glow-violet" v-for="i in 4" :key="`bottom-${i}`" :style="{ '--delay': `${i * 0.5}s`, '--offset': `${i * 25}%` }" />
        </div>
        <!-- 左侧浮光 -->
        <div class="glow-edge glow-left">
          <div class="glow-particle glow-pink" v-for="i in 3" :key="`left-${i}`" :style="{ '--delay': `${i * 0.6}s`, '--offset': `${i * 33}%` }" />
        </div>
      </div>
      
      <!-- 提示文字 -->
      <div class="capture-tip">
        <div class="tip-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <span class="tip-text">拖动鼠标框选需要识别的区域</span>
        <span class="tip-sub">按 ESC 取消</span>
      </div>
      
      <!-- 选区 -->
      <div
        v-show="isSelecting || startPoint.x !== 0"
        class="selection-area"
        :style="selectionStyle"
      >
        <!-- 尺寸提示 -->
        <div v-if="isSelecting" class="size-tip">
          {{ selectionSize }}
        </div>
        
        <!-- 选区光晕边框 -->
        <div class="selection-glow" />
      </div>
      
      <!-- 取消按钮 -->
      <button class="cancel-btn" @click.stop="handleCancel">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
/* 定义自定义属性，允许动画过渡 */
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@property --selection-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  cursor: crosshair;
  background: transparent;
  overflow: hidden;
}

/* 涟漪容器 */
.ripple-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 从按钮扩散的涟漪 */
.ripple {
  position: absolute;
  left: var(--origin-x);
  top: var(--origin-y);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  
  /* 渐变边框效果 */
  background: conic-gradient(
    from 0deg,
    #00f2fe,
    #4facfe,
    #7928ca,
    #ff0080,
    #4facfe,
    #00f2fe
  );
  
  /* 只显示边框 */
  -webkit-mask: radial-gradient(transparent 45%, #fff 50%, #fff 55%, transparent 60%);
  mask: radial-gradient(transparent 45%, #fff 50%, #fff 55%, transparent 60%);
  
  filter: blur(3px);
}

.ripple-1 {
  animation: ripple-expand 2s ease-out forwards;
}

.ripple-2 {
  animation: ripple-expand 2s ease-out 0.4s forwards;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  70% {
    opacity: 0.8;
  }
  100% {
    /* 扩散到足够大以覆盖整个屏幕 */
    transform: translate(-50%, -50%) scale(80);
    opacity: 0;
  }
}

/* 屏幕边缘光晕 */
.edge-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: edge-fade-in 0.5s ease-out forwards;
}

@keyframes edge-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.glow-edge {
  position: absolute;
  display: flex;
  overflow: hidden;
}

.glow-top {
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  justify-content: space-around;
}

.glow-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  justify-content: space-around;
}

.glow-left {
  left: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  flex-direction: column;
  justify-content: space-around;
}

.glow-right {
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  flex-direction: column;
  justify-content: space-around;
}

/* 浮光粒子 - 更柔和更大的模糊效果 */
.glow-particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0;
  animation: float-glow 4s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

/* 青色浮光 - Cyan - 更高饱和度 */
.glow-cyan {
  background: radial-gradient(circle, 
    rgba(0, 255, 255, 1) 0%, 
    rgba(0, 220, 255, 0.8) 30%,
    rgba(0, 180, 220, 0.4) 60%,
    transparent 85%
  );
}

/* 蓝紫色浮光 - Indigo - 更高饱和度 */
.glow-indigo {
  background: radial-gradient(circle, 
    rgba(99, 102, 241, 1) 0%, 
    rgba(79, 70, 229, 0.8) 30%,
    rgba(67, 56, 202, 0.4) 60%,
    transparent 85%
  );
}

/* 亮紫色浮光 - Violet - 更高饱和度 */
.glow-violet {
  background: radial-gradient(circle, 
    rgba(167, 139, 250, 1) 0%, 
    rgba(139, 92, 246, 0.8) 30%,
    rgba(124, 58, 237, 0.4) 60%,
    transparent 85%
  );
}

/* 暖粉色浮光 - Hot Pink - 更高饱和度 */
.glow-pink {
  background: radial-gradient(circle, 
    rgba(255, 0, 128, 0.9) 0%, 
    rgba(236, 72, 153, 0.6) 30%,
    rgba(219, 39, 119, 0.3) 60%,
    transparent 85%
  );
}

.glow-top .glow-particle {
  width: 280px;
  height: 160px;
  top: -60px;
  left: var(--offset, 25%);
}

.glow-bottom .glow-particle {
  width: 280px;
  height: 160px;
  bottom: -60px;
  left: var(--offset, 25%);
}

.glow-left .glow-particle {
  width: 160px;
  height: 280px;
  left: -60px;
  top: var(--offset, 25%);
}

.glow-right .glow-particle {
  width: 160px;
  height: 280px;
  right: -60px;
  top: var(--offset, 25%);
}

@keyframes float-glow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(0.95) translateY(0);
  }
  25% {
    opacity: 0.9;
    transform: scale(1.1) translateY(-5px);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05) translateY(5px);
  }
  75% {
    opacity: 1;
    transform: scale(1.15) translateY(-3px);
  }
}

/* 浮光漂移动画 - 更缓慢更优雅 */
.glow-top .glow-particle {
  animation: float-glow 4s ease-in-out infinite, drift-horizontal 12s ease-in-out infinite;
}

.glow-bottom .glow-particle {
  animation: float-glow 4s ease-in-out infinite, drift-horizontal-reverse 12s ease-in-out infinite;
}

.glow-left .glow-particle {
  animation: float-glow 4s ease-in-out infinite, drift-vertical 12s ease-in-out infinite;
}

.glow-right .glow-particle {
  animation: float-glow 4s ease-in-out infinite, drift-vertical-reverse 12s ease-in-out infinite;
}

@keyframes drift-horizontal {
  0%, 100% {
    transform: translateX(-30px) scale(1);
  }
  50% {
    transform: translateX(30px) scale(1.1);
  }
}

@keyframes drift-horizontal-reverse {
  0%, 100% {
    transform: translateX(30px) scale(1);
  }
  50% {
    transform: translateX(-30px) scale(1.1);
  }
}

@keyframes drift-vertical {
  0%, 100% {
    transform: translateY(-30px) scale(1);
  }
  50% {
    transform: translateY(30px) scale(1.1);
  }
}

@keyframes drift-vertical-reverse {
  0%, 100% {
    transform: translateY(30px) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

.capture-tip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transform: translateX(-50%);
  pointer-events: none;
  animation: tip-fade-in 0.5s ease-out 0.3s both;
  
  .tip-icon {
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.8);
    
    svg {
      width: 100%;
      height: 100%;
    }
  }

  .tip-text {
    font-size: 13px;
    font-weight: 400;
  }

  .tip-sub {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 4px;
    padding-left: 8px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }
}

@keyframes tip-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.selection-area {
  position: absolute;
  background: transparent;
  border-radius: 8px;
  overflow: visible;

  .size-tip {
    position: absolute;
    bottom: -36px;
    left: 50%;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    transform: translateX(-50%);
  }
  
  /* 选区光晕边框 */
  .selection-glow {
    position: absolute;
    inset: -3px;
    padding: 3px;
    border-radius: 12px;
    pointer-events: none;
    
    -webkit-mask: 
       linear-gradient(#fff 0 0) content-box, 
       linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    
    background: conic-gradient(
      from var(--selection-angle), 
      #00f2fe,
      #4facfe,
      #7928ca,
      #ff0080,
      #4facfe,
      #00f2fe
    );
    
    filter: blur(8px);
    opacity: 1;
    
    animation: selection-spin 2s linear infinite;
  }
  
  /* 选区内部边框 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    pointer-events: none;
  }
}

@keyframes selection-spin {
  to {
    --selection-angle: 360deg;
  }
}

.cancel-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #fff;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.8);
    border-color: rgba(239, 68, 68, 0.5);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}
</style>

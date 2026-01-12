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
  // 涟漪动画完成后显示边框跑马灯
  setTimeout(() => {
    rippleComplete.value = true;
  }, 600);
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
        <div class="ripple ripple-3" />
      </div>
      
      <!-- 屏幕边缘跑马灯光晕 -->
      <div v-show="rippleComplete" class="edge-glow">
        <!-- 顶部光晕 -->
        <div class="glow-edge glow-top">
          <div class="glow-particle" v-for="i in 8" :key="`top-${i}`" :style="{ '--delay': `${i * 0.15}s` }" />
        </div>
        <!-- 右侧光晕 -->
        <div class="glow-edge glow-right">
          <div class="glow-particle" v-for="i in 6" :key="`right-${i}`" :style="{ '--delay': `${i * 0.15}s` }" />
        </div>
        <!-- 底部光晕 -->
        <div class="glow-edge glow-bottom">
          <div class="glow-particle" v-for="i in 8" :key="`bottom-${i}`" :style="{ '--delay': `${i * 0.15}s` }" />
        </div>
        <!-- 左侧光晕 -->
        <div class="glow-edge glow-left">
          <div class="glow-particle" v-for="i in 6" :key="`left-${i}`" :style="{ '--delay': `${i * 0.15}s` }" />
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
  animation: ripple-expand 0.8s ease-out forwards;
}

.ripple-2 {
  animation: ripple-expand 0.8s ease-out 0.15s forwards;
}

.ripple-3 {
  animation: ripple-expand 0.8s ease-out 0.3s forwards;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(50);
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
  }
  to {
    opacity: 1;
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
  height: 8px;
  justify-content: space-around;
}

.glow-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  justify-content: space-around;
}

.glow-left {
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  flex-direction: column;
  justify-content: space-around;
}

.glow-right {
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  flex-direction: column;
  justify-content: space-around;
}

/* 光晕粒子 */
.glow-particle {
  flex-shrink: 0;
  border-radius: 50%;
  filter: blur(12px);
  animation: particle-glow 2s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

.glow-top .glow-particle,
.glow-bottom .glow-particle {
  width: 80px;
  height: 30px;
}

.glow-left .glow-particle,
.glow-right .glow-particle {
  width: 30px;
  height: 80px;
}

.glow-top .glow-particle {
  background: linear-gradient(180deg, 
    rgba(79, 172, 254, 0.8) 0%, 
    rgba(0, 242, 254, 0.6) 50%,
    transparent 100%
  );
  transform: translateY(-50%);
}

.glow-bottom .glow-particle {
  background: linear-gradient(0deg, 
    rgba(121, 40, 202, 0.8) 0%, 
    rgba(255, 0, 128, 0.6) 50%,
    transparent 100%
  );
  transform: translateY(50%);
}

.glow-left .glow-particle {
  background: linear-gradient(90deg, 
    rgba(0, 242, 254, 0.8) 0%, 
    rgba(79, 172, 254, 0.6) 50%,
    transparent 100%
  );
  transform: translateX(-50%);
}

.glow-right .glow-particle {
  background: linear-gradient(270deg, 
    rgba(255, 0, 128, 0.8) 0%, 
    rgba(121, 40, 202, 0.6) 50%,
    transparent 100%
  );
  transform: translateX(50%);
}

@keyframes particle-glow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 跑马灯动画 - 让粒子沿边缘移动 */
.glow-top .glow-particle {
  animation: particle-glow 2s ease-in-out infinite, move-horizontal 4s linear infinite;
}

.glow-bottom .glow-particle {
  animation: particle-glow 2s ease-in-out infinite, move-horizontal-reverse 4s linear infinite;
}

.glow-left .glow-particle {
  animation: particle-glow 2s ease-in-out infinite, move-vertical 4s linear infinite;
}

.glow-right .glow-particle {
  animation: particle-glow 2s ease-in-out infinite, move-vertical-reverse 4s linear infinite;
}

@keyframes move-horizontal {
  0% {
    transform: translateX(-100%) translateY(-50%);
  }
  100% {
    transform: translateX(100%) translateY(-50%);
  }
}

@keyframes move-horizontal-reverse {
  0% {
    transform: translateX(100%) translateY(50%);
  }
  100% {
    transform: translateX(-100%) translateY(50%);
  }
}

@keyframes move-vertical {
  0% {
    transform: translateY(-100%) translateX(-50%);
  }
  100% {
    transform: translateY(100%) translateX(-50%);
  }
}

@keyframes move-vertical-reverse {
  0% {
    transform: translateY(100%) translateX(50%);
  }
  100% {
    transform: translateY(-100%) translateX(50%);
  }
}

.capture-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 48px;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: tip-fade-in 0.5s ease-out 0.3s both;
  
  .tip-icon {
    width: 48px;
    height: 48px;
    color: rgba(255, 255, 255, 0.9);
    
    svg {
      width: 100%;
      height: 100%;
    }
  }

  .tip-text {
    font-size: 18px;
    font-weight: 500;
  }

  .tip-sub {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
}

@keyframes tip-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
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

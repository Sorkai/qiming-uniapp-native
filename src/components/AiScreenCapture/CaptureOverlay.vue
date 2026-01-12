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
      
      <!-- 屏幕边缘流动边框 -->
      <div v-show="rippleComplete" class="screen-border">
        <div class="border-glow" />
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
        
        <!-- 白色粒子飞溅特效 -->
        <div class="particles-container">
          <div class="particle" v-for="i in 20" :key="`particle-${i}`" :style="{ '--i': i }" />
        </div>
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
  
  filter: blur(8px);
}

.ripple-1 {
  animation: ripple-expand 2s ease-out forwards;
}

.ripple-2 {
  /* 第二个涟漪边框变窄 */
  -webkit-mask: radial-gradient(transparent 47%, #fff 49%, #fff 51%, transparent 53%);
  mask: radial-gradient(transparent 47%, #fff 49%, #fff 51%, transparent 53%);
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

/* 定义屏幕边框角度变量 */
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* 屏幕边缘流动边框 */
.screen-border {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: border-fade-in 0.5s ease-out forwards;
}

@keyframes border-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 流动光晕边框 */
.border-glow {
  position: absolute;
  inset: 0;
  padding: 6px;
  border-radius: 16px;
  pointer-events: none;
  
  /* 使用 mask 只显示边框 */
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  
  /* 流动渐变背景 */
  background: conic-gradient(
    from var(--border-angle), 
    #00f2fe,
    #4facfe,
    #7928ca,
    #ff0080,
    #ff6b6b,
    #feca57,
    #48dbfb,
    #00f2fe
  );
  
  filter: blur(6px);
  opacity: 1;
  
  animation: border-spin 3s linear infinite;
}

@keyframes border-spin {
  to {
    --border-angle: 360deg;
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
  
  /* 白色粒子容器 */
  .particles-container {
    position: absolute;
    inset: -20px;
    pointer-events: none;
    overflow: visible;
  }
  
  /* 白色粒子 */
  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.6);
    opacity: 0;
    animation: particle-fly 2.5s ease-out infinite;
    animation-delay: calc(var(--i) * 0.12s);
    
    /* 随机分布在边框周围 */
    &:nth-child(4n+1) {
      top: 20px;
      left: calc(var(--i) * 5%);
    }
    &:nth-child(4n+2) {
      bottom: 20px;
      left: calc(var(--i) * 5%);
    }
    &:nth-child(4n+3) {
      left: 20px;
      top: calc(var(--i) * 5%);
    }
    &:nth-child(4n) {
      right: 20px;
      top: calc(var(--i) * 5%);
    }
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

@keyframes particle-fly {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0);
  }
  30% {
    opacity: 0.7;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc((var(--i) - 10) * 0.8px),
      calc((var(--i) - 10) * -1.2px)
    ) scale(0.3);
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

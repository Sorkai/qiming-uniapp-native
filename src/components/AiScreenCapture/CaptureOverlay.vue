<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
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

const overlayRef = ref<HTMLElement | null>(null);
const isSelecting = ref(false);
const startPoint = ref({ x: 0, y: 0 });
const endPoint = ref({ x: 0, y: 0 });
const activePointerId = ref<number | null>(null);
const activePointerType = ref<string | null>(null);
const rippleComplete = ref(false);

const MIN_SELECTION_SIZE = 10;
const prefersCoarsePointer =
  typeof window !== "undefined" &&
  "matchMedia" in window &&
  window.matchMedia("(pointer: coarse)").matches;

const originX = computed(() => props.origin?.x ?? window.innerWidth - 58);
const originY = computed(() => props.origin?.y ?? window.innerHeight - 128);

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

const selectionSize = computed(() => {
  const width = Math.abs(endPoint.value.x - startPoint.value.x);
  const height = Math.abs(endPoint.value.y - startPoint.value.y);
  return `${Math.round(width)} × ${Math.round(height)}`;
});

const isTouchExperience = computed(() => {
  return (
    activePointerType.value === "touch" ||
    activePointerType.value === "pen" ||
    (activePointerType.value === null && prefersCoarsePointer)
  );
});

const tipText = computed(() => {
  return isTouchExperience.value
    ? "拖动手指框选区域，或轻点整屏截图"
    : "拖动鼠标框选需要识别的区域";
});

const tipSubText = computed(() => {
  return isTouchExperience.value ? "轻点可整屏截图，右上角可取消" : "按 ESC 取消";
});

const clampPoint = (x: number, y: number) => {
  return {
    x: Math.min(Math.max(0, x), window.innerWidth),
    y: Math.min(Math.max(0, y), window.innerHeight)
  };
};

const resetSelection = () => {
  startPoint.value = { x: 0, y: 0 };
  endPoint.value = { x: 0, y: 0 };
};

const releasePointerCapture = (pointerId: number | null) => {
  if (
    overlayRef.value &&
    pointerId !== null &&
    overlayRef.value.hasPointerCapture(pointerId)
  ) {
    overlayRef.value.releasePointerCapture(pointerId);
  }
};

const clearPointerState = () => {
  releasePointerCapture(activePointerId.value);
  activePointerId.value = null;
  activePointerType.value = null;
  isSelecting.value = false;
};

const captureViewport = () => {
  emit("capture", {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
  });
};

const beginSelection = (x: number, y: number) => {
  const point = clampPoint(x, y);
  isSelecting.value = true;
  startPoint.value = point;
  endPoint.value = point;
};

const updateSelection = (x: number, y: number) => {
  if (!isSelecting.value) return;
  endPoint.value = clampPoint(x, y);
};

const finishSelection = () => {
  if (!isSelecting.value) return;

  const width = Math.abs(endPoint.value.x - startPoint.value.x);
  const height = Math.abs(endPoint.value.y - startPoint.value.y);
  const shouldCaptureFullViewport =
    (activePointerType.value === "touch" || activePointerType.value === "pen") &&
    width < MIN_SELECTION_SIZE &&
    height < MIN_SELECTION_SIZE;

  clearPointerState();

  if (shouldCaptureFullViewport) {
    resetSelection();
    captureViewport();
    return;
  }

  if (width < MIN_SELECTION_SIZE || height < MIN_SELECTION_SIZE) {
    resetSelection();
    return;
  }

  const area: CaptureArea = {
    x: Math.min(startPoint.value.x, endPoint.value.x),
    y: Math.min(startPoint.value.y, endPoint.value.y),
    width,
    height
  };

  emit("capture", area);
};

const handlePointerDown = (e: PointerEvent) => {
  if (!e.isPrimary) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;

  activePointerId.value = e.pointerId;
  activePointerType.value = e.pointerType;
  overlayRef.value?.setPointerCapture(e.pointerId);
  beginSelection(e.clientX, e.clientY);
  e.preventDefault();
};

const handlePointerMove = (e: PointerEvent) => {
  if (!isSelecting.value || activePointerId.value !== e.pointerId) return;
  updateSelection(e.clientX, e.clientY);
  e.preventDefault();
};

const handlePointerUp = (e: PointerEvent) => {
  if (!isSelecting.value || activePointerId.value !== e.pointerId) return;
  updateSelection(e.clientX, e.clientY);
  finishSelection();
  e.preventDefault();
};

const handlePointerCancel = (e: PointerEvent) => {
  if (activePointerId.value !== e.pointerId) return;
  clearPointerState();
  resetSelection();
  e.preventDefault();
};

const handleCancel = () => {
  clearPointerState();
  resetSelection();
  emit("cancel");
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    handleCancel();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  window.setTimeout(() => {
    rippleComplete.value = true;
  }, 1800);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  releasePointerCapture(activePointerId.value);
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="overlayRef"
      class="capture-overlay"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
    >
      <div
        class="ripple-container"
        :style="{ '--origin-x': `${originX}px`, '--origin-y': `${originY}px` }"
      >
        <div class="ripple ripple-1" />
        <div class="ripple ripple-2" />
      </div>

      <div v-show="rippleComplete" class="screen-border">
        <div class="border-glow" />
      </div>

      <div class="capture-tip">
        <div class="tip-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <span class="tip-text">{{ tipText }}</span>
        <span class="tip-sub">{{ tipSubText }}</span>
      </div>

      <div
        v-show="isSelecting || startPoint.x !== 0"
        class="selection-area"
        :style="selectionStyle"
      >
        <div v-if="isSelecting" class="size-tip">
          {{ selectionSize }}
        </div>

        <div class="selection-glow" />

        <div class="particles-container">
          <div
            v-for="i in 20"
            :key="`particle-${i}`"
            class="particle"
            :style="{ '--i': i }"
          />
        </div>
      </div>

      <button
        class="cancel-btn"
        type="button"
        @pointerdown.stop
        @pointerup.stop
        @click.stop="handleCancel"
      >
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
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@property --selection-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes ripple-expand {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }

  70% {
    opacity: 0.8;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(80);
  }
}

@property --border-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes border-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes border-spin {
  to {
    --border-angle: 360deg;
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
      )
      scale(0.3);
  }
}

.capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  cursor: crosshair;
  touch-action: none;
  background: transparent;
}

.ripple-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  top: var(--origin-y);
  left: var(--origin-x);
  width: 60px;
  height: 60px;
  background: conic-gradient(
    from 0deg,
    #00f2fe,
    #4facfe,
    #7928ca,
    #ff0080,
    #4facfe,
    #00f2fe
  );
  border-radius: 50%;
  opacity: 0;
  filter: blur(8px);
  mask: radial-gradient(transparent 45%, #fff 50%, #fff 55%, transparent 60%);
  transform: translate(-50%, -50%) scale(0);
}

.ripple-1 {
  animation: ripple-expand 2s ease-out forwards;
}

.ripple-2 {
  mask: radial-gradient(transparent 47%, #fff 49%, #fff 51%, transparent 53%);
  animation: ripple-expand 2s ease-out 0.4s forwards;
}

.screen-border {
  position: absolute;
  inset: 0;
  pointer-events: none;
  animation: border-fade-in 0.5s ease-out forwards;
}

.border-glow {
  position: absolute;
  inset: 0;
  padding: 6px;
  pointer-events: none;
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
  border-radius: 16px;
  opacity: 1;
  filter: blur(6px);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: xor;
  mask-composite: exclude;
  animation: border-spin 3s linear infinite;
}

.capture-tip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  max-width: calc(100vw - 32px);
  padding: 10px 20px;
  color: #fff;
  text-shadow: 0 1px 4px rgb(0 0 0 / 50%);
  pointer-events: none;
  background: rgb(0 0 0 / 50%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  transform: translateX(-50%);
  animation: tip-fade-in 0.5s ease-out 0.3s both;

  .tip-icon {
    width: 20px;
    height: 20px;
    color: rgb(255 255 255 / 80%);

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
    padding-left: 8px;
    margin-left: 4px;
    font-size: 12px;
    color: rgb(255 255 255 / 50%);
    border-left: 1px solid rgb(255 255 255 / 20%);
  }
}

.selection-area {
  position: absolute;
  overflow: visible;
  background: transparent;
  border-radius: 8px;

  .size-tip {
    position: absolute;
    bottom: -36px;
    left: 50%;
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    background: rgb(0 0 0 / 70%);
    border-radius: 8px;
    backdrop-filter: blur(8px);
    transform: translateX(-50%);
  }

  .selection-glow {
    position: absolute;
    inset: -3px;
    padding: 3px;
    pointer-events: none;
    background: conic-gradient(
      from var(--selection-angle),
      #00f2fe,
      #4facfe,
      #7928ca,
      #ff0080,
      #4facfe,
      #00f2fe
    );
    border-radius: 12px;
    opacity: 1;
    filter: blur(8px);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: xor;
    mask-composite: exclude;
    animation: selection-spin 2s linear infinite;
  }

  .particles-container {
    position: absolute;
    inset: -20px;
    overflow: visible;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 3px 1px rgb(255 255 255 / 60%);
    opacity: 0;
    animation: particle-fly 2.5s ease-out infinite;
    animation-delay: calc(var(--i) * 0.12s);

    &:nth-child(4n + 1) {
      top: 20px;
      left: calc(var(--i) * 5%);
    }

    &:nth-child(4n + 2) {
      bottom: 20px;
      left: calc(var(--i) * 5%);
    }

    &:nth-child(4n + 3) {
      top: calc(var(--i) * 5%);
      left: 20px;
    }

    &:nth-child(4n) {
      top: calc(var(--i) * 5%);
      right: 20px;
    }
  }

  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: "";
    border: 2px solid rgb(255 255 255 / 50%);
    border-radius: 8px;
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
  background: rgb(0 0 0 / 50%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgb(239 68 68 / 80%);
    border-color: rgb(239 68 68 / 50%);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

@media screen and (max-width: 768px) {
  .capture-tip {
    bottom: calc(var(--pure-mobile-tab-height) + 24px);
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 16px;

    .tip-sub {
      padding-left: 0;
      margin-left: 0;
      border-left: none;
    }
  }

  .selection-area {
    .size-tip {
      bottom: -32px;
      padding: 5px 12px;
      font-size: 12px;
    }
  }

  .cancel-btn {
    top: calc(env(safe-area-inset-top, 0px) + 16px);
    right: 16px;
    width: 44px;
    height: 44px;

    svg {
      width: 22px;
      height: 22px;
    }
  }
}
</style>

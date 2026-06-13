<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useAppStoreHook } from "@/store/modules/app";
import AiHubIcon from "@/assets/new-release/ai-hub-svgrepo-com.svg?component";

defineOptions({
  name: "AiFloatButton"
});

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const appStore = useAppStoreHook();
const isMobile = computed(
  () => appStore.getDevice === "mobile" || appStore.getViewportWidth <= 768
);
const buttonRef = ref<HTMLElement | null>(null);
const activePointerId = ref<number | null>(null);
const isDragging = ref(false);
const preventNextClick = ref(false);
const tapEmittedByPointer = ref(false);
const lastPointerEventAt = ref(0);
const touchStart = ref({ x: 0, y: 0 });
const dragStart = ref({ x: 0, y: 0 });
const dragOrigin = ref({ left: 0, top: 0 });
const position = ref({
  left: 0,
  top: 0
});

const DESKTOP_BUTTON_SIZE = 56;
const MOBILE_BUTTON_SIZE = 48;
const NATIVE_MOBILE_BUTTON_SIZE = 38;
const POSITION_PADDING = 10;
const MOBILE_POSITION_PADDING = 14;
const DRAG_THRESHOLD = 6;

const getCssPixelValue = (name: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = Number.parseFloat(value);
  if (Number.isFinite(parsed)) return parsed;
  if (!value || typeof document === "undefined") return 0;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = `var(${name})`;
  document.body.appendChild(probe);
  const resolved = probe.getBoundingClientRect().width;
  probe.remove();

  return Number.isFinite(resolved) ? resolved : 0;
};

const getButtonSize = () => {
  return (
    buttonRef.value?.offsetWidth ||
    (isNativeMobile()
      ? NATIVE_MOBILE_BUTTON_SIZE
      : isMobile.value
        ? MOBILE_BUTTON_SIZE
        : DESKTOP_BUTTON_SIZE)
  );
};

const isNativeMobile = () => {
  if (typeof document === "undefined") return false;
  return (
    isMobile.value &&
    document.documentElement.classList.contains("qiming-native-webview")
  );
};

const hasVisibleBottomDock = () => {
  if (typeof document === "undefined") return false;
  const dock = document.querySelector<HTMLElement>(
    ".nav-mobile-container, .native-mobile-tabbar, .pure-mobile-tabbar, .mobile-tabbar"
  );
  if (!dock) return false;

  const style = getComputedStyle(dock);
  const rect = dock.getBoundingClientRect();
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > window.innerHeight - rect.height - 4
  );
};

const getMobileBottomOffset = () => {
  if (!isMobile.value) return POSITION_PADDING;
  const safeBottom = getCssPixelValue("--pure-safe-area-bottom");
  if (isNativeMobile()) {
    const tabHeight =
      getCssPixelValue("--pure-mobile-tab-height") || 58 + safeBottom;
    return tabHeight + safeBottom + 18;
  }

  if (!hasVisibleBottomDock()) {
    return safeBottom + 18;
  }

  const tabHeight =
    getCssPixelValue("--pure-mobile-tab-height") || 58 + safeBottom;

  return tabHeight + safeBottom + 22;
};

const clampPosition = (left: number, top: number) => {
  const size = getButtonSize();
  const edgePadding = isMobile.value
    ? MOBILE_POSITION_PADDING
    : POSITION_PADDING;
  const maxLeft = Math.max(edgePadding, window.innerWidth - size - edgePadding);
  const maxTop = Math.max(
    edgePadding,
    window.innerHeight - size - getMobileBottomOffset()
  );

  return {
    left: Math.min(Math.max(edgePadding, left), maxLeft),
    top: Math.min(Math.max(edgePadding, top), maxTop)
  };
};

const getDefaultPosition = () => {
  const size = getButtonSize();
  const rightOffset = isNativeMobile()
    ? 6
    : isMobile.value
      ? MOBILE_POSITION_PADDING
      : 30;
  const bottomOffset = isMobile.value ? getMobileBottomOffset() : 100;

  return clampPosition(
    window.innerWidth - size - rightOffset,
    window.innerHeight - size - bottomOffset
  );
};

const syncPosition = (reset = false) => {
  if (
    reset ||
    (position.value.left === 0 && position.value.top === 0 && !isDragging.value)
  ) {
    position.value = getDefaultPosition();
    return;
  }

  position.value = clampPosition(position.value.left, position.value.top);
};

const releasePointerCapture = (pointerId: number | null) => {
  if (
    buttonRef.value &&
    pointerId !== null &&
    buttonRef.value.hasPointerCapture(pointerId)
  ) {
    try {
      buttonRef.value.releasePointerCapture(pointerId);
    } catch {
      // Android WebView can reject pointer capture during synthetic/native taps.
    }
  }
};

const setPointerCaptureSafely = (pointerId: number) => {
  try {
    buttonRef.value?.setPointerCapture(pointerId);
  } catch {
    // Dragging still works by tracking viewport coordinates without capture.
  }
};

const handleClick = () => {
  if (props.disabled || isDragging.value) return;

  if (tapEmittedByPointer.value) {
    tapEmittedByPointer.value = false;
    return;
  }

  if (preventNextClick.value) {
    preventNextClick.value = false;
    return;
  }

  emit("click");
};

const handlePointerDown = (e: PointerEvent) => {
  if (props.disabled || !e.isPrimary) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;

  lastPointerEventAt.value = Date.now();
  tapEmittedByPointer.value = false;
  activePointerId.value = e.pointerId;
  isDragging.value = false;
  preventNextClick.value = false;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY
  };
  dragOrigin.value = { ...position.value };

  setPointerCaptureSafely(e.pointerId);
  e.preventDefault();
};

const handlePointerMove = (e: PointerEvent) => {
  if (activePointerId.value !== e.pointerId) return;
  lastPointerEventAt.value = Date.now();

  const deltaX = e.clientX - dragStart.value.x;
  const deltaY = e.clientY - dragStart.value.y;

  if (
    !isDragging.value &&
    (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD)
  ) {
    isDragging.value = true;
  }

  if (!isDragging.value) return;

  position.value = clampPosition(
    dragOrigin.value.left + deltaX,
    dragOrigin.value.top + deltaY
  );
  e.preventDefault();
};

const finishDrag = (pointerId: number | null) => {
  releasePointerCapture(pointerId);
  activePointerId.value = null;

  if (isDragging.value) {
    preventNextClick.value = true;
  }

  window.setTimeout(() => {
    isDragging.value = false;
  }, 0);
};

const handlePointerUp = (e: PointerEvent) => {
  if (activePointerId.value !== e.pointerId) return;
  lastPointerEventAt.value = Date.now();
  const shouldEmitTap = !props.disabled && !isDragging.value;
  finishDrag(e.pointerId);
  if (shouldEmitTap) {
    tapEmittedByPointer.value = true;
    emit("click");
  }
};

const handlePointerCancel = (e: PointerEvent) => {
  if (activePointerId.value !== e.pointerId) return;
  lastPointerEventAt.value = Date.now();
  isDragging.value = false;
  preventNextClick.value = false;
  tapEmittedByPointer.value = false;
  finishDrag(e.pointerId);
};

const shouldIgnoreTouchFallback = () =>
  Date.now() - lastPointerEventAt.value < 600;

const handleTouchStart = (e: TouchEvent) => {
  if (props.disabled || shouldIgnoreTouchFallback()) return;
  const touch = e.changedTouches[0] || e.touches[0];
  if (!touch) return;
  touchStart.value = {
    x: touch.clientX,
    y: touch.clientY
  };
};

const handleTouchEnd = (e: TouchEvent) => {
  if (props.disabled || shouldIgnoreTouchFallback()) return;
  const touch = e.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - touchStart.value.x;
  const deltaY = touch.clientY - touchStart.value.y;
  if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
    return;
  }

  tapEmittedByPointer.value = true;
  emit("click");
  e.preventDefault();
};

const handleResize = () => {
  syncPosition();
};

const handleHashChange = () => {
  syncPosition(true);
};

const buttonStyle = computed(() => ({
  left: `${position.value.left}px`,
  top: `${position.value.top}px`
}));

const getButtonCenter = () => {
  const size = getButtonSize();
  return {
    x: position.value.left + size / 2,
    y: position.value.top + size / 2
  };
};

const getButtonCenterFromDom = () => {
  const buttonEl = buttonRef.value;
  if (buttonEl) {
    const rect = buttonEl.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  return getButtonCenter();
};

onMounted(() => {
  syncPosition(true);
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("hashchange", handleHashChange, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("hashchange", handleHashChange);
  releasePointerCapture(activePointerId.value);
});

watch(isMobile, () => {
  syncPosition(true);
});

defineExpose({
  getButtonCenter: getButtonCenterFromDom,
  position
});
</script>

<template>
  <div
    ref="buttonRef"
    class="ai-float-button"
    :class="{
      disabled: disabled,
      dragging: isDragging,
      'is-native-mobile': isNativeMobile()
    }"
    :style="buttonStyle"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @click="handleClick"
  >
    <el-tooltip content="AI识屏助手" placement="left" :disabled="isDragging">
      <div class="button-inner">
        <AiHubIcon class="ai-icon" />
      </div>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.ai-float-button {
  position: fixed;
  z-index: 3200;
  width: 56px;
  height: 56px;
  cursor: pointer;
  user-select: none;
  touch-action: none;
  transition: transform 0.2s ease;

  &:hover:not(.disabled, .dragging) {
    transform: scale(1.1);
  }

  &:active:not(.disabled) {
    transform: scale(0.95);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.dragging {
    cursor: grabbing;
  }

  .button-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #e2e8f0;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgb(148 163 184 / 30%);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 20px rgb(148 163 184 / 50%);
    }

    html.dark & {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgb(255 255 255 / 10%);
      box-shadow: 0 4px 15px rgb(0 0 0 / 30%);

      &:hover {
        box-shadow: 0 6px 20px rgb(0 0 0 / 50%);
      }
    }
  }

  .ai-icon {
    width: 28px;
    height: 28px;
    color: #64748b;

    html.dark & {
      color: #e2e8f0;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 768px) {
  .ai-float-button {
    width: 48px;
    height: 48px;
  }

  .ai-float-button .ai-icon {
    width: 22px;
    height: 22px;
  }

  :global(html.qiming-native-webview .ai-float-button) {
    width: 38px;
    height: 38px;
    opacity: 0.78;
  }

  :global(html.qiming-native-webview .ai-float-button .ai-icon) {
    width: 20px;
    height: 20px;
  }

  .ai-float-button.is-native-mobile {
    width: 38px;
    height: 38px;
    opacity: 0.78;
  }

  .ai-float-button.is-native-mobile .ai-icon {
    width: 20px;
    height: 20px;
  }
}
</style>

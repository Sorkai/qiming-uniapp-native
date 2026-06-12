<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import listeningVideo from "@/assets/ai-app/digital-human-2d/listening_circle.webm";
import sayingVideo from "@/assets/ai-app/digital-human-2d/saying_circle.webm";
import standbyVideo from "@/assets/ai-app/digital-human-2d/standby_circle.webm";
import thinkingVideo from "@/assets/ai-app/digital-human-2d/thinking_circle.webm";

defineOptions({ name: "FloatingDigitalHuman2D" });

type DigitalHumanState = "standby" | "listening" | "thinking" | "saying";

const props = withDefaults(
  defineProps<{
    roleLabel?: string;
    courseName?: string;
    state?: DigitalHumanState;
    anchor?: "viewportTopRight" | "appLeftBottom";
    anchorSelector?: string;
    leftZoneWidth?: number;
    bottomOffset?: number;
    storageKey?: string;
  }>(),
  {
    roleLabel: "学生",
    courseName: "",
    state: "standby",
    anchor: "viewportTopRight",
    anchorSelector: "",
    leftZoneWidth: 260,
    bottomOffset: 140,
    storageKey: ""
  }
);

const stateAssets: Record<DigitalHumanState, string> = {
  standby: standbyVideo,
  listening: listeningVideo,
  thinking: thinkingVideo,
  saying: sayingVideo
};

const stateLabels: Record<DigitalHumanState, string> = {
  standby: "待机",
  listening: "倾听",
  thinking: "思考",
  saying: "讲解"
};

const windowPadding = 18;
const bubbleSize = ref(88);
const storageKey = computed(
  () => props.storageKey || `ai-app-floating-digital-human-2d-${props.anchor}`
);

const videoRef = ref<HTMLVideoElement | null>(null);
const isReady = ref(false);
const isPaused = ref(false);
const localSpeaking = ref(false);
const position = ref({ x: 0, y: 0 });
const hasUserPosition = ref(false);
const dragState = ref<{
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
} | null>(null);

let speakingTimer: ReturnType<typeof setTimeout> | null = null;
let preloadVideos: HTMLVideoElement[] = [];

const currentState = computed<DigitalHumanState>(() =>
  localSpeaking.value ? "saying" : props.state
);
const currentVideo = computed(() => stateAssets[currentState.value]);
const statusLabel = computed(() => stateLabels[currentState.value]);
const ariaLabel = computed(
  () =>
    `${props.roleLabel}端2D数字人，当前状态：${statusLabel.value}${
      props.courseName ? `，课程：${props.courseName}` : ""
    }`
);
const bubbleStyle = computed(() => ({
  width: `${bubbleSize.value}px`,
  height: `${bubbleSize.value}px`,
  transform: `translate3d(${position.value.x}px, ${position.value.y}px, 0)`,
  opacity: isReady.value ? 1 : 0
}));

const getNativeSafeTop = () => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--pure-safe-area-top")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
};

const getResponsiveBubbleSize = () => {
  if (typeof window === "undefined") return 88;
  return window.innerWidth <= 768 ? 56 : 88;
};

const syncBubbleSize = () => {
  bubbleSize.value = getResponsiveBubbleSize();
};

const clampPosition = (nextX: number, nextY: number) => {
  const size = bubbleSize.value;
  const maxX = Math.max(
    windowPadding,
    window.innerWidth - size - windowPadding
  );
  const maxY = Math.max(
    windowPadding,
    window.innerHeight - size - windowPadding
  );
  return {
    x: Math.min(Math.max(windowPadding, nextX), maxX),
    y: Math.min(Math.max(windowPadding, nextY), maxY)
  };
};

const getAnchorRect = () => {
  const target = props.anchorSelector
    ? document.querySelector<HTMLElement>(props.anchorSelector)
    : null;

  if (target) return target.getBoundingClientRect();

  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  };
};

const getDefaultPosition = () => {
  const size = bubbleSize.value;
  if (window.innerWidth <= 768) {
    return clampPosition(
      window.innerWidth - size - 16,
      getNativeSafeTop() + 92
    );
  }

  if (props.anchor === "appLeftBottom") {
    const rect = getAnchorRect();
    const zoneWidth = Math.min(props.leftZoneWidth, rect.width);
    const leftOffset = Math.max(
      windowPadding,
      Math.round((zoneWidth - size) / 2)
    );

    return clampPosition(
      rect.left + leftOffset,
      rect.bottom - size - props.bottomOffset
    );
  }

  return clampPosition(
    window.innerWidth - size - 30,
    window.innerWidth >= 768 ? 78 : 68
  );
};

const savePosition = () => {
  window.localStorage.setItem(storageKey.value, JSON.stringify(position.value));
};

const restorePosition = () => {
  try {
    const raw = window.localStorage.getItem(storageKey.value);
    const cached = raw ? JSON.parse(raw) : null;
    if (Number.isFinite(cached?.x) && Number.isFinite(cached?.y)) {
      position.value = clampPosition(cached.x, cached.y);
      hasUserPosition.value = true;
      return;
    }
  } catch (error) {
    console.warn("[FloatingDigitalHuman2D] restore position failed", error);
  }

  hasUserPosition.value = false;
  position.value = getDefaultPosition();
};

const preloadStateVideos = () => {
  const run = () => {
    preloadVideos = Object.values(stateAssets).map(src => {
      const video = document.createElement("video");
      video.src = src;
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.load();
      return video;
    });
  };

  const idle = (
    window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
    }
  ).requestIdleCallback;
  if (typeof idle === "function") {
    idle(run, { timeout: 1200 });
  } else {
    window.setTimeout(run, 300);
  }
};

const playVideo = async () => {
  await nextTick();
  const video = videoRef.value;
  if (!video || isPaused.value) return;
  try {
    await video.play();
  } catch {
    // Muted autoplay can still be blocked by strict browser settings.
  }
};

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return;
  dragState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: position.value.x,
    originY: position.value.y
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const handlePointerMove = (event: PointerEvent) => {
  const drag = dragState.value;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - drag.startX;
  const deltaY = event.clientY - drag.startY;
  position.value = clampPosition(drag.originX + deltaX, drag.originY + deltaY);
};

const handlePointerUp = (event: PointerEvent) => {
  const drag = dragState.value;
  if (!drag || drag.pointerId !== event.pointerId) return;
  dragState.value = null;
  hasUserPosition.value = true;
  savePosition();
};

const handleResize = () => {
  syncBubbleSize();
  position.value = hasUserPosition.value
    ? clampPosition(position.value.x, position.value.y)
    : getDefaultPosition();
  if (hasUserPosition.value) savePosition();
};

const pauseRender = () => {
  isPaused.value = true;
  videoRef.value?.pause();
};

const resumeRender = () => {
  isPaused.value = false;
  void playVideo();
};

function speak(text = "") {
  if (speakingTimer) clearTimeout(speakingTimer);
  localSpeaking.value = true;
  isPaused.value = false;
  const duration = Math.min(Math.max(text.length * 80, 1600), 5200);
  speakingTimer = setTimeout(() => {
    localSpeaking.value = false;
  }, duration);
  void playVideo();
}

watch(currentVideo, () => {
  void playVideo();
});

watch(
  () => [
    props.anchor,
    props.anchorSelector,
    props.leftZoneWidth,
    props.bottomOffset
  ],
  () => {
    if (!hasUserPosition.value) {
      position.value = getDefaultPosition();
    }
  }
);

onMounted(() => {
  syncBubbleSize();
  restorePosition();
  isReady.value = true;
  preloadStateVideos();
  window.addEventListener("resize", handleResize);
  void playVideo();
});

onUnmounted(() => {
  if (speakingTimer) clearTimeout(speakingTimer);
  preloadVideos.forEach(video => video.removeAttribute("src"));
  preloadVideos = [];
  window.removeEventListener("resize", handleResize);
});

defineExpose({ speak, pauseRender, resumeRender });
</script>

<template>
  <div
    class="floating-human-2d"
    :class="[`is-${currentState}`, { 'is-dragging': Boolean(dragState) }]"
    :style="bubbleStyle"
    :aria-label="ariaLabel"
    role="status"
    :title="ariaLabel"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <video
      ref="videoRef"
      :src="currentVideo"
      muted
      autoplay
      loop
      playsinline
      preload="auto"
    />
    <span class="floating-human-2d__dot" />
  </div>
</template>

<style scoped lang="scss">
.floating-human-2d {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1200;
  display: block;
  overflow: visible;
  cursor: grab;
  background:
    radial-gradient(
      circle at 50% 24%,
      rgba(255, 255, 255, 0.95),
      transparent 45%
    ),
    linear-gradient(145deg, #f6f9ff, #fff4fb);
  border: 1px solid rgba(191, 203, 230, 0.9);
  border-radius: 999px;
  box-shadow:
    0 12px 34px rgba(94, 127, 248, 0.18),
    0 3px 10px rgba(31, 41, 55, 0.08);
  transition:
    opacity 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
  user-select: none;
  touch-action: none;

  &::before {
    position: absolute;
    inset: -5px;
    z-index: -1;
    content: "";
    border: 2px solid rgba(94, 127, 248, 0.14);
    border-radius: inherit;
    opacity: 0.9;
  }

  &.is-dragging {
    cursor: grabbing;
    box-shadow:
      0 18px 44px rgba(94, 127, 248, 0.24),
      0 5px 14px rgba(31, 41, 55, 0.12);
  }

  &.is-thinking::before,
  &.is-saying::before {
    animation: floating-human-pulse 1.2s ease-in-out infinite;
  }
}

.floating-human-2d video {
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: cover;
  background: #f8fbff;
  border: 4px solid rgba(255, 255, 255, 0.92);
  border-radius: inherit;
}

.floating-human-2d__dot {
  position: absolute;
  right: 7px;
  bottom: 12px;
  width: 13px;
  height: 13px;
  background: #34d399;
  border: 2px solid #fff;
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.16);
}

.floating-human-2d.is-thinking .floating-human-2d__dot {
  background: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
}

.floating-human-2d.is-saying .floating-human-2d__dot {
  background: #5e7ff8;
  box-shadow: 0 0 0 4px rgba(94, 127, 248, 0.18);
}

@keyframes floating-human-pulse {
  0%,
  100% {
    opacity: 0.75;
    transform: scale(1);
  }
  50% {
    opacity: 0.28;
    transform: scale(1.08);
  }
}

@media (max-width: 768px) {
  .floating-human-2d {
    transform-origin: top left;
    z-index: 760;
  }

  .floating-human-2d::before {
    inset: -4px;
  }

  .floating-human-2d video {
    border-width: 3px;
  }

  .floating-human-2d__dot {
    right: 4px;
    bottom: 8px;
    width: 11px;
    height: 11px;
  }
}
</style>

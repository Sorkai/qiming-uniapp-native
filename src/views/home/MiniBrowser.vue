<template>
  <div
    class="mb"
    :class="{ 'mb--dark': dark }"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div class="mb__chrome">
      <div class="mb__lights">
        <span style="background:#ff5f57" />
        <span style="background:#febc2e" />
        <span style="background:#28c840" />
      </div>
      <div class="mb__url">
        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
          <path d="M12 1 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
        </svg>
        <span>{{ active.url }}</span>
      </div>
      <div class="mb__pager">
        <button
          v-for="(_, i) in slides"
          :key="i"
          type="button"
          :class="{ 'is-active': i === idx }"
          :aria-label="`第 ${i + 1} 张`"
          @click="go(i)"
        />
      </div>
    </div>

    <div ref="viewportEl" class="mb__viewport">
      <Transition name="mb-fade" mode="out-in">
        <div
          v-if="liveMode && liveUrl"
          :key="liveUrl"
          class="mb__iframe-wrap"
        >
          <!-- 增加 @load 处理 -->
          <iframe
            :src="liveUrl"
            class="mb__iframe"
            :title="active.title"
            :style="[iframeStyle, { opacity: iframeLoaded ? 1 : 0 }]"
            allow="autoplay; fullscreen; clipboard-read; clipboard-write"
            scrolling="no"
            @load="handleIframeLoad"
          />
          <!-- 在 iframe 内部增加二级 loading -->
          <div v-if="!iframeLoaded" class="mb__loading mb__loading--absolute">
            <span class="mb__spinner" />
            <p>正在环境初始化…</p>
          </div>
        </div>
        <div v-else-if="loadingLive" key="loading" class="mb__loading">
          <span class="mb__spinner" />
          <p>正在打开实时演示…</p>
        </div>
        <img
          v-else
          :key="active.src"
          :src="active.src"
          :alt="active.title"
          loading="lazy"
          class="mb__img"
          :class="{ 'mb__img--clickable': hasLive }"
          @click="enterLive"
        />
      </Transition>

      <button
        v-if="liveMode"
        type="button"
        class="mb__exit"
        @click="exitLive"
      >
        退出演示
      </button>
      <button
        v-else-if="hasLive && !loadingLive"
        type="button"
        class="mb__cta"
        @click.stop="enterLive"
      >
        点击进入实时演示
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M5 12h14M13 5l7 7-7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div v-if="!liveMode" class="mb__caption">{{ active.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { ensureDemoSession, buildIframeUrl } from "./demoSession";

const VIRTUAL_W = 1600;
const VIRTUAL_H = 1000;

interface Slide {
  src: string;
  url: string;
  title: string;
  /** 路由路径，例如 /welcome/index；提供后该幻灯片可点击进入实时演示 */
  iframeRoute?: string;
  /** 进入演示前以此角色登录 */
  role?: "student" | "teacher" | "admin";
}

const props = withDefaults(
  defineProps<{
    slides: Slide[];
    interval?: number;
    dark?: boolean;
  }>(),
  { interval: 4500, dark: false }
);

const idx = ref(0);
const paused = ref(false);
const liveMode = ref(false);
const loadingLive = ref(false);
const iframeLoaded = ref(false); // 新增：追踪 iframe 是否真正加载完成
const liveUrl = ref("");
const viewportEl = ref<HTMLElement | null>(null);
const scale = ref(1);
const active = computed(() => props.slides[idx.value] ?? props.slides[0]);
const hasLive = computed(() => !!active.value?.iframeRoute);
const iframeStyle = computed(() => ({
  width: `${VIRTUAL_W}px`,
  height: `${VIRTUAL_H}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: "top left",
  willChange: "transform",
  border: "0"
}));

let ro: ResizeObserver | undefined;
const recalc = () => {
  const el = viewportEl.value;
  if (!el) return;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (!w || !h) return;
  // 确保计算出的 scale 能够填满 viewport
  scale.value = Math.min(w / VIRTUAL_W, h / VIRTUAL_H);
};

let timer: number | undefined;
const start = () => {
  stop();
  if (props.slides.length < 2) return;
  timer = window.setInterval(() => {
    if (!paused.value && !liveMode.value)
      idx.value = (idx.value + 1) % props.slides.length;
  }, props.interval);
};
const stop = () => {
  if (timer) window.clearInterval(timer);
  timer = undefined;
};
const go = (i: number) => {
  if (liveMode.value) exitLive();
  idx.value = i;
};

const enterLive = async () => {
  const slide = active.value;
  if (!slide?.iframeRoute || loadingLive.value) return;
  
  loadingLive.value = true;
  iframeLoaded.value = false;
  paused.value = true;
  
  try {
    await ensureDemoSession(slide.role || "teacher");
    // 添加时间戳防止缓存，并确保 iframe 重新触发加载
    const url = buildIframeUrl(slide.iframeRoute);
    liveUrl.value = url.includes("?") 
      ? `${url}&t=${Date.now()}` 
      : `${url}?t=${Date.now()}`;
    liveMode.value = true;
  } catch (err) {
    console.error("[MiniBrowser] 进入实时演示失败", err);
    loadingLive.value = false;
  }
};

const handleIframeLoad = () => {
  iframeLoaded.value = true;
  loadingLive.value = false;
  // 加载完成后再次修正尺寸，防止布局抖动
  recalc();
};

const exitLive = () => {
  liveMode.value = false;
  liveUrl.value = "";
  iframeLoaded.value = false;
  loadingLive.value = false;
  paused.value = false;
};

watch(() => props.slides.length, start, { immediate: true });
watch(() => active.value?.src, () => {
  if (liveMode.value) exitLive();
});
watch(liveMode, async v => {
  if (v) {
    await nextTick();
    recalc();
    // 渐变动画完成后(0.45s)再次检查
    setTimeout(recalc, 500);
  }
});

onMounted(() => {
  recalc();
  if (typeof ResizeObserver !== "undefined" && viewportEl.value) {
    ro = new ResizeObserver(() => recalc());
    ro.observe(viewportEl.value);
  } else {
    window.addEventListener("resize", recalc);
  }
});
onUnmounted(() => {
  stop();
  ro?.disconnect();
  window.removeEventListener("resize", recalc);
});
</script>

<style lang="scss" scoped>
.mb {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: 14px;
  box-shadow: 0 24px 60px -24px rgb(15 23 42 / 22%);
  overflow: hidden;

  &--dark {
    background: rgb(13 17 32);
    border-color: rgb(255 255 255 / 12%);
  }
}

.mb__chrome {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  background: rgb(0 0 0 / 3%);
  border-bottom: 1px solid rgb(0 0 0 / 6%);

  .mb--dark & {
    background: rgb(255 255 255 / 4%);
    border-bottom-color: rgb(255 255 255 / 8%);
  }
}

.mb__lights {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;

  span {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
}

.mb__url {
  display: flex;
  flex: 1 1 auto;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 24px;
  padding: 0 12px;
  font-size: 11.5px;
  color: rgb(0 0 0 / 55%);
  background: rgb(255 255 255 / 70%);
  border: 1px solid rgb(0 0 0 / 6%);
  border-radius: 999px;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mb--dark & {
    color: rgb(255 255 255 / 70%);
    background: rgb(255 255 255 / 6%);
    border-color: rgb(255 255 255 / 10%);
  }
}

.mb__pager {
  display: flex;
  flex: 0 0 auto;
  gap: 5px;

  button {
    width: 16px;
    height: 4px;
    cursor: pointer;
    background: rgb(0 0 0 / 12%);
    border: 0;
    border-radius: 2px;
    transition: background 0.25s, width 0.25s;

    &.is-active {
      width: 22px;
      background: rgb(15 23 42 / 65%);
    }

    .mb--dark & {
      background: rgb(255 255 255 / 18%);

      &.is-active {
        background: rgb(255 255 255 / 75%);
      }
    }
  }
}

.mb__viewport {
  position: relative;
  flex: 1 1 auto;
  aspect-ratio: 16 / 10;
  background: #f3f5f9;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.6s ease;
  }

  .mb__img--clickable {
    cursor: pointer;
  }

  &:hover .mb__img--clickable {
    transform: scale(1.015);
  }

  .mb--dark & {
    background: rgb(20 26 44);
  }
}

.mb__iframe-wrap {
  position: absolute;
  inset: 0;
  background: #fff;
  overflow: hidden;
}

.mb__iframe {
  display: block;
  background: #fff;
  border: 0;
  transition: opacity 0.3s ease;
}

.mb__loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 13px;
  color: rgb(15 23 42 / 70%);
  background: #f3f5f9;

  &--absolute {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .mb--dark & {
    color: rgb(255 255 255 / 75%);
    background: rgb(20 26 44);
  }
}

.mb__spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid rgb(0 0 0 / 12%);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: mb-spin 0.9s linear infinite;
}

@keyframes mb-spin {
  to { transform: rotate(360deg); }
}

.mb__cta {
  position: absolute;
  right: 14px;
  bottom: 52px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 12px 28px -10px rgb(37 99 235 / 60%);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s, transform 0.25s, box-shadow 0.25s;
  pointer-events: none;
}

.mb:hover .mb__cta {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.mb__cta:hover {
  box-shadow: 0 16px 36px -10px rgb(37 99 235 / 75%);
}

.mb__exit {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  padding: 6px 14px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: rgb(0 0 0 / 55%);
  backdrop-filter: blur(6px);
  border: 0;
  border-radius: 999px;
}

.mb__caption {
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  padding: 6px 12px;
  font-size: 12px;
  color: #fff;
  text-align: center;
  background: rgb(0 0 0 / 45%);
  backdrop-filter: blur(6px);
  border-radius: 999px;
  pointer-events: none;
}

.mb-fade-enter-active,
.mb-fade-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.mb-fade-enter-from {
  opacity: 0;
  transform: scale(1.02);
}

.mb-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

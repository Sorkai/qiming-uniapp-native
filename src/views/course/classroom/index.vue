<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from "vue";
import { ElMessage } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "Qiming2DCentre"
});

const campusBgUrl = `${import.meta.env.BASE_URL}campus-2d-bg.svg`;
const userStore = useUserStoreHook();

function formatCurrentTime24h(date = new Date()) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${hour}:${minute}:${second}`;
}

const nowTime = ref(formatCurrentTime24h());
const currentUserName = computed(
  () => userStore.nickname || userStore.username || "同学"
);
const welcomeLine1 = computed(
  () => `欢迎来到启明智教 ${currentUserName.value}`
);
const welcomeLine2 = computed(() => `现在是 ${nowTime.value}`);
let clockTimer: number | undefined;
const welcomeAnchor = ref({
  x: 43,
  y: 86,
  w: 668,
  h: 86
});
const welcomeBannerStyle = computed(() => ({
  left: `${welcomeAnchor.value.x}px`,
  top: `${welcomeAnchor.value.y}px`,
  width: `${welcomeAnchor.value.w}px`,
  height: `${welcomeAnchor.value.h}px`
}));

/* ─── 容器与全屏 ─── */
const rootRef = ref<HTMLDivElement>();
const svgObjectRef = ref<HTMLObjectElement>();
const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!rootRef.value) return;
  if (!document.fullscreenElement) {
    rootRef.value.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function onFsChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

/* ─── 自适应居中（不可缩放、不可拖拽） ─── */
const svgNaturalW = 1920;
const svgNaturalH = 1080;

const containerW = ref(800);
const containerH = ref(600);

/** 宽度撑满，上下居中 */
const fitScale = computed(() => containerW.value / svgNaturalW);

const offsetX = computed(() => 0);
const offsetY = computed(
  () => (containerH.value - svgNaturalH * fitScale.value) / 2
);

function measureContainer() {
  if (!rootRef.value) return;
  const el = rootRef.value.querySelector(".campus-container") as HTMLElement;
  if (!el) return;
  containerW.value = el.clientWidth;
  containerH.value = el.clientHeight;
}

/* ─── SVG 内部元素动画 ─── */
/** 热区 id → SVG 内部 id 的映射（处理拼写差异） */
const svgIdMap: Record<string, string> = {
  lbraries: "libraries"
};

function getSvgId(zoneId: string): string {
  return svgIdMap[zoneId] || zoneId;
}

/** SVG 加载后注入 hover 动画样式 */
function injectSvgStyles() {
  const svgDoc = svgObjectRef.value?.contentDocument;
  if (!svgDoc) return;

  // 避免重复注入
  if (svgDoc.getElementById("campus-hover-styles")) return;

  const style = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
  style.id = "campus-hover-styles";
  style.textContent = `
    [id="virtualclass"],
    [id="competitionstate"],
    [id="answershop"],
    [id="deskmate"],
    [id="teamupclockin"],
    [id="libraries"],
    [id="inform"],
    [id="fountainset"],
    [id="missions"],
    [id="Cog"],
    [id="Bell"] {
      transition: transform 0.3s ease;
    }
    .svg-zone-hovered {
      /* 占位，如果以后需要特殊滤镜再加 */
    }
  `;
  svgDoc.querySelector("svg")?.appendChild(style);
}

function syncWelcomeAnchorFromSvg() {
  const svgDoc = svgObjectRef.value?.contentDocument;
  if (!svgDoc) return;
  const target =
    svgDoc.getElementById("Rectangle 13_3") ||
    svgDoc.getElementById("leftuplabel");
  if (!target) return;
  if (!(target instanceof SVGGraphicsElement)) return;

  const box = target.getBBox();
  welcomeAnchor.value = {
    x: box.x,
    y: box.y,
    w: box.width,
    h: box.height
  };
}

function onSvgLoad() {
  injectSvgStyles();
  syncWelcomeAnchorFromSvg();
}

/** 当 hoveredZone 变化时，操作 SVG 内部元素 */
function applySvgHover(newId: string | null, oldId: string | null) {
  const svgDoc = svgObjectRef.value?.contentDocument;
  if (!svgDoc) return;

  // 移除旧的
  if (oldId) {
    const oldEl = svgDoc.getElementById(getSvgId(oldId));
    if (oldEl) {
      oldEl.style.transform = "";
    }
  }

  // 添加新的
  if (newId) {
    const newEl = svgDoc.getElementById(getSvgId(newId));
    if (newEl) {
      newEl.style.transformBox = "fill-box";
      newEl.style.transformOrigin = "center center";
      newEl.style.transform = "scale(1.08)";
    }
  }
}

/* ─── 生命周期 ─── */
const ro = ref<ResizeObserver>();

onMounted(() => {
  nextTick(measureContainer);
  ro.value = new ResizeObserver(measureContainer);
  const el = rootRef.value?.querySelector(".campus-container");
  if (el) ro.value.observe(el);
  document.addEventListener("fullscreenchange", onFsChange);
  clockTimer = window.setInterval(() => {
    nowTime.value = formatCurrentTime24h();
  }, 1000);
});

onBeforeUnmount(() => {
  ro.value?.disconnect();
  document.removeEventListener("fullscreenchange", onFsChange);
  if (clockTimer) {
    window.clearInterval(clockTimer);
  }
});

/* ─── 热区定义 — 坐标基于 SVG 原始 1920×1080 ─── */
interface HotZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 调试模式：显示热区边框（上线前设为 false） */
const DEBUG_ZONES = false;

const buildingZones: HotZone[] = [
  {
    id: "virtualclass",
    label: "虚拟教室",
    x: 700,
    y: 150,
    w: 410,
    h: 250
  },
  {
    id: "competitionstate",
    label: "学科竞赛台",
    x: 200,
    y: 550,
    w: 150,
    h: 290
  },
  {
    id: "answershop",
    label: "答疑工坊",
    x: 1200,
    y: 480,
    w: 250,
    h: 160
  },
  {
    id: "deskmate",
    label: "同桌工坊",
    x: 630,
    y: 520,
    w: 170,
    h: 180
  },
  {
    id: "teamupclockin",
    label: "组队打卡",
    x: 65,
    y: 230,
    w: 340,
    h: 250
  },
  {
    id: "lbraries",
    label: "智教图书馆",
    x: 1600,
    y: 400,
    w: 310,
    h: 200
  },
  {
    id: "inform",
    label: "校园公告",
    x: 1280,
    y: 200,
    w: 150,
    h: 180
  },
  {
    id: "fountainset",
    label: "喷泉",
    x: 850,
    y: 500,
    w: 240,
    h: 160
  }
];

const actionZones: HotZone[] = [
  {
    id: "Cog",
    label: "设置",
    x: 1720,
    y: 55,
    w: 80,
    h: 75
  },
  {
    id: "Bell",
    label: "消息",
    x: 1830,
    y: 55,
    w: 80,
    h: 75
  }
];

const missionsZone: HotZone = {
  id: "missions",
  label: "任务栏",
  x: 1450,
  y: 650,
  w: 275,
  h: 120
};

const hoveredZone = ref<string | null>(null);

watch(hoveredZone, (newId, oldId) => {
  applySvgHover(newId, oldId);
});

function onZoneClick(zone: HotZone) {
  ElMessage.info(`即将进入「${zone.label}」，功能细化中…`);
}
</script>

<template>
  <div
    ref="rootRef"
    class="campus-root"
    :class="{ 'is-fullscreen': isFullscreen }"
  >
    <!-- ====== 顶部工具栏 ====== -->
    <div class="campus-toolbar">
      <span class="toolbar-title">启明智教 · 2D 校园导览</span>
      <div class="toolbar-actions">
        <button
          class="tb-btn"
          :title="isFullscreen ? '退出全屏' : '全屏'"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? "⊗" : "⛶" }}
        </button>
      </div>
    </div>

    <!-- ====== SVG 容器 ====== -->
    <div class="campus-container">
      <div
        class="campus-viewport"
        :style="{
          width: svgNaturalW + 'px',
          height: svgNaturalH + 'px',
          transform: `translate(${offsetX}px, ${offsetY}px) scale(${fitScale})`,

          transformOrigin: '0 0'
        }"
      >
        <!-- SVG 底图 — 用 object 标签可靠渲染 -->
        <object
          ref="svgObjectRef"
          class="campus-bg"
          :data="campusBgUrl"
          type="image/svg+xml"
          :width="svgNaturalW"
          :height="svgNaturalH"
          @load="onSvgLoad"
        >
          <img
            :src="campusBgUrl"
            :width="svgNaturalW"
            :height="svgNaturalH"
            alt="启明智教2D校园"
          />
        </object>

        <div class="welcome-banner" :style="welcomeBannerStyle">
          <div class="welcome-line welcome-line-1">{{ welcomeLine1 }}</div>
          <div class="welcome-line welcome-line-2">{{ welcomeLine2 }}</div>
        </div>

        <!-- 任务栏热区 -->
        <div
          class="hot-zone missions-zone"
          :class="{ hovered: hoveredZone === missionsZone.id }"
          :style="{
            left: missionsZone.x + 'px',
            top: missionsZone.y + 'px',
            width: missionsZone.w + 'px',
            height: missionsZone.h + 'px',
            outline: DEBUG_ZONES ? '2px dashed red' : 'none'
          }"
          @mouseenter="hoveredZone = missionsZone.id"
          @mouseleave="hoveredZone = null"
          @click.stop="onZoneClick(missionsZone)"
        >
          <span class="zone-tip">{{ missionsZone.label }}</span>
        </div>

        <!-- 建筑功能区热区 -->
        <div
          v-for="zone in buildingZones"
          :key="zone.id"
          class="hot-zone building-zone"
          :class="{ hovered: hoveredZone === zone.id }"
          :style="{
            left: zone.x + 'px',
            top: zone.y + 'px',
            width: zone.w + 'px',
            height: zone.h + 'px',
            outline: DEBUG_ZONES ? '2px dashed red' : 'none'
          }"
          @mouseenter="hoveredZone = zone.id"
          @mouseleave="hoveredZone = null"
          @click.stop="onZoneClick(zone)"
        >
          <span class="zone-tip">{{ zone.label }}</span>
        </div>

        <!-- 顶部功能图标热区 -->
        <div
          v-for="zone in actionZones"
          :key="zone.id"
          class="hot-zone action-zone"
          :class="{ hovered: hoveredZone === zone.id }"
          :style="{
            left: zone.x + 'px',
            top: zone.y + 'px',
            width: zone.w + 'px',
            height: zone.h + 'px',
            outline: DEBUG_ZONES ? '2px dashed red' : 'none'
          }"
          @mouseenter="hoveredZone = zone.id"
          @mouseleave="hoveredZone = null"
          @click.stop="onZoneClick(zone)"
        >
          <span class="zone-tip">{{ zone.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ====== 根容器 ====== */
.campus-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 50px);
  background: #acd894;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.campus-root.is-fullscreen {
  height: 100vh;
  border-radius: 0;
}

/* ====== 顶部工具栏 ====== */
.campus-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  z-index: 20;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  letter-spacing: 1px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tb-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    border-color 0.15s;
  color: #555;
}

.tb-btn:hover {
  background: #f0f0f0;
  border-color: #aaa;
}

/* ====== SVG 容器 ====== */
.campus-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background: #acd894;
}

.campus-viewport {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.campus-bg {
  display: block;
  pointer-events: none;
  user-select: none;
}

.welcome-banner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 8px 16px 8px 14px;
  gap: 2px;
  pointer-events: none;
  color: #4f3d2d;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
  z-index: 6;
}

.welcome-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.15;
  letter-spacing: 0.5px;
}

.welcome-line-1 {
  text-align: left;
  font-size: 28px;
  font-weight: 700;
}

.welcome-line-2 {
  text-align: right;
  font-size: 28px;
  font-weight: 600;
  padding-right: 8px;
}

/* ====== 热区通用 ====== */
.hot-zone {
  position: absolute;
  cursor: pointer;
  border-radius: 12px;
  transition:
    box-shadow 0.25s,
    background 0.25s,
    transform 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  z-index: 5;
}

.hot-zone .zone-tip {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.45);
  padding: 4px 14px;
  border-radius: 20px;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.2s,
    transform 0.2s;
  pointer-events: none;
  white-space: nowrap;
}

.hot-zone.hovered .zone-tip {
  opacity: 1;
  transform: translateY(0);
}

.building-zone.hovered {
  background: rgba(255, 255, 255, 0.08);
  z-index: 10;
}

.action-zone.hovered {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  z-index: 10;
}

.missions-zone.hovered {
  background: rgba(255, 255, 255, 0.08);
  z-index: 10;
}
</style>

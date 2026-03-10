<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "Qiming2DCentre"
});

/** 设计稿尺寸 */
const DESIGN_W = 1920;
const DESIGN_H = 1080;
const campusBgUrl = `${import.meta.env.BASE_URL}campus-2d-bg.svg`;

const wrapperRef = ref<HTMLDivElement>();
const scale = ref(1);

/** 根据容器尺寸等比缩放 */
function updateScale() {
  if (!wrapperRef.value) return;
  const parent = wrapperRef.value.parentElement;
  if (!parent) return;
  const pw = parent.clientWidth;
  const ph = parent.clientHeight;
  scale.value = Math.min(pw / DESIGN_W, ph / DESIGN_H);
}

onMounted(() => {
  updateScale();
  window.addEventListener("resize", updateScale);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScale);
});

/** 校园功能区域定义 — 坐标基于 1920×1080 设计稿 */
interface HotZone {
  id: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const buildingZones: HotZone[] = [
  {
    id: "virtualclass",
    label: "虚拟教室",
    icon: "🏫",
    x: 660,
    y: 110,
    w: 390,
    h: 280
  },
  {
    id: "competitionstate",
    label: "学科竞赛台",
    icon: "🏆",
    x: 250,
    y: 400,
    w: 320,
    h: 290
  },
  {
    id: "answershop",
    label: "答疑工坊",
    icon: "❓",
    x: 1030,
    y: 300,
    w: 240,
    h: 180
  },
  {
    id: "deskmate",
    label: "同桌工坊",
    icon: "👥",
    x: 560,
    y: 370,
    w: 170,
    h: 110
  },
  {
    id: "teamupclockin",
    label: "组队打卡",
    icon: "✅",
    x: 260,
    y: 190,
    w: 280,
    h: 200
  },
  {
    id: "lbraries",
    label: "智教图书馆",
    icon: "📚",
    x: 1280,
    y: 190,
    w: 350,
    h: 380
  },
  {
    id: "inform",
    label: "校园公告",
    icon: "📢",
    x: 1050,
    y: 80,
    w: 260,
    h: 160
  },
  {
    id: "fountainset",
    label: "喷泉",
    icon: "⛲",
    x: 700,
    y: 350,
    w: 200,
    h: 260
  }
];

/** 任务栏（顶部黄色横条） */
const missionsZone: HotZone = {
  id: "missions",
  label: "任务栏",
  icon: "📋",
  x: 80,
  y: 60,
  w: 630,
  h: 90
};

const hoveredZone = ref<string | null>(null);

function onZoneClick(zone: HotZone) {
  ElMessage.info(`即将进入「${zone.label}」，功能细化中…`);
}
</script>

<template>
  <div class="campus-root">
    <div
      ref="wrapperRef"
      class="campus-viewport"
      :style="{
        width: DESIGN_W + 'px',
        height: DESIGN_H + 'px',
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }"
    >
      <!-- SVG 底图 -->
      <img
        class="campus-bg"
        :src="campusBgUrl"
        alt="启明智教2D校园"
        draggable="false"
      />

      <!-- 任务栏热区 -->
      <div
        class="hot-zone missions-zone"
        :class="{ hovered: hoveredZone === missionsZone.id }"
        :style="{
          left: missionsZone.x + 'px',
          top: missionsZone.y + 'px',
          width: missionsZone.w + 'px',
          height: missionsZone.h + 'px'
        }"
        @mouseenter="hoveredZone = missionsZone.id"
        @mouseleave="hoveredZone = null"
        @click="onZoneClick(missionsZone)"
      >
        <span class="zone-tip"
          >{{ missionsZone.icon }} {{ missionsZone.label }}</span
        >
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
          height: zone.h + 'px'
        }"
        @mouseenter="hoveredZone = zone.id"
        @mouseleave="hoveredZone = null"
        @click="onZoneClick(zone)"
      >
        <span class="zone-tip">{{ zone.icon }} {{ zone.label }}</span>
      </div>

      <!-- 右上角操作栏 (设置 + 通知) -->
      <div class="rightup-bar">
        <div
          class="rightup-btn"
          title="设置"
          @click="ElMessage.info('设置功能细化中…')"
        >
          ⚙️
        </div>
        <div
          class="rightup-btn"
          title="通知"
          @click="ElMessage.info('通知功能细化中…')"
        >
          🔔
        </div>
      </div>

      <!-- 下边栏 -->
      <div class="down-sidebar">
        <span class="down-sidebar-text">启明智教 · 2D 校园导览</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.campus-root {
  width: 100%;
  height: calc(100vh - 86px);
  overflow: hidden;
  background: #8bc66a;
  position: relative;
}

.campus-viewport {
  position: relative;
  overflow: hidden;
}

.campus-bg {
  display: block;
  width: 1920px;
  height: 1080px;
  pointer-events: none;
  user-select: none;
}

/* ======= 热区通用 ======= */
.hot-zone {
  position: absolute;
  cursor: pointer;
  border-radius: 12px;
  transition:
    box-shadow 0.25s,
    background 0.25s;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
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
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.7),
    0 4px 24px rgba(0, 0, 0, 0.25);
  background: rgba(255, 255, 255, 0.1);
}

.missions-zone.hovered {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(255, 200, 50, 0.6);
}

/* ======= 右上角操作栏 ======= */
.rightup-bar {
  position: absolute;
  top: 40px;
  right: 440px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.rightup-btn {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  cursor: pointer;
  border-radius: 50%;
  transition:
    background 0.2s,
    transform 0.15s;
}

.rightup-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.12);
}

/* ======= 下边栏 ======= */
.down-sidebar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.down-sidebar-text {
  font-size: 18px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  letter-spacing: 2px;
}
</style>

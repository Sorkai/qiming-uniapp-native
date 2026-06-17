<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import blueprintTemplate from "@/assets/Thumbnail-App-Icon-Template_2x.png";

defineOptions({
  name: "CaptureLoadingOverlay"
});

const props = defineProps<{
  visible: boolean;
  stage: "capturing" | "optimizing" | "starting";
  preview?: string;
}>();

type StageKey = "capturing" | "optimizing" | "starting";
type StageState = "done" | "running" | "waiting";

const TERMINAL_TITLE = "IntellEdu 智慧教育解决方案";
const TERMINAL_PATH = "INTELLEDU://screen-capture/init";
const LOOP_INTERVAL = 3000;
const STAGE_VISUAL_LOCK_DURATION = 1600;
const stageOrder: StageKey[] = ["capturing", "optimizing", "starting"];

const stageDefinitions = {
  capturing: {
    code: "0x01",
    label: "Dealing Capture Buffer",
    detail: "锁定框选区域并生成截图",
    command: "dealing.capture.buffer",
    headline: "正在锁定取景区域与画面边界"
  },
  optimizing: {
    code: "0x02",
    label: "Optimizing Screenshot Payload",
    detail: "压缩图片并准备分析数据",
    command: "optimizing.screenshot.payload",
    headline: "正在整理像素并构建分析图表"
  },
  starting: {
    code: "0x03",
    label: "Booting IntellEdu Assistant",
    detail: "唤起对话窗口并连接助手",
    command: "booting.intelledu.assistant",
    headline: "正在准备 IntellEdu 会话与智能响应"
  }
} as const;

const typedTitle = ref("");
const typedCommand = ref("");
const typedHeadline = ref("");
const visualFrame = ref(0);
const isDarkMode = ref(false);

let titleTimer: number | null = null;
let commandTimer: number | null = null;
let headlineTimer: number | null = null;
let visualTimer: number | null = null;
let visualLockTimer: number | null = null;
let themeObserver: MutationObserver | null = null;

const stageIndex = computed(() => stageOrder.indexOf(props.stage));
const overlayThemeClass = computed(() =>
  isDarkMode.value ? "is-dark" : "is-light"
);

const stageItems = computed(() => {
  return stageOrder.map((key, index) => {
    const definition = stageDefinitions[key];
    let state: StageState = "waiting";
    if (index < stageIndex.value) state = "done";
    if (index === stageIndex.value) state = "running";

    return {
      key,
      code: definition.code,
      label: definition.label,
      detail: definition.detail,
      state
    };
  });
});

const badgeText = computed(() =>
  props.preview ? "SCREENSHOT READY" : "CAPTURE LOCKED"
);

const syncThemeMode = () => {
  isDarkMode.value =
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark");
};

const syncVisualStage = (stage: StageKey) => {
  const nextFrame = stageOrder.indexOf(stage);
  visualFrame.value = nextFrame === -1 ? 0 : nextFrame;
};

const clearTimer = (timer: number | null) => {
  if (timer) {
    window.clearInterval(timer);
  }
};

const clearTimers = () => {
  clearTimer(titleTimer);
  clearTimer(commandTimer);
  clearTimer(headlineTimer);
  clearTimer(visualTimer);
  clearTimer(visualLockTimer);
  titleTimer = null;
  commandTimer = null;
  headlineTimer = null;
  visualTimer = null;
  visualLockTimer = null;
};

const runTyping = (
  text: string,
  target: typeof typedTitle,
  speed: number,
  timerType: "title" | "command" | "headline"
) => {
  const timerMap = {
    title: titleTimer,
    command: commandTimer,
    headline: headlineTimer
  };
  const currentTimer = timerMap[timerType];
  if (currentTimer) {
    window.clearInterval(currentTimer);
  }

  target.value = "";
  let index = 0;
  const timer = window.setInterval(() => {
    index += 1;
    target.value = text.slice(0, index);
    if (index >= text.length) {
      window.clearInterval(timer);
      if (timerType === "title") titleTimer = null;
      if (timerType === "command") commandTimer = null;
      if (timerType === "headline") headlineTimer = null;
    }
  }, speed);

  if (timerType === "title") titleTimer = timer;
  if (timerType === "command") commandTimer = timer;
  if (timerType === "headline") headlineTimer = timer;
};

const startVisualLoop = () => {
  clearTimer(visualTimer);
  visualTimer = window.setInterval(() => {
    visualFrame.value = (visualFrame.value + 1) % 3;
  }, LOOP_INTERVAL);
};

const lockVisualStage = (stage: StageKey) => {
  syncVisualStage(stage);
  clearTimer(visualTimer);
  clearTimer(visualLockTimer);
  visualLockTimer = window.setTimeout(() => {
    startVisualLoop();
    visualLockTimer = null;
  }, STAGE_VISUAL_LOCK_DURATION);
};

watch(
  () => props.visible,
  visible => {
    if (!visible) {
      clearTimers();
      typedTitle.value = "";
      typedCommand.value = "";
      typedHeadline.value = "";
      visualFrame.value = 0;
      return;
    }

    syncThemeMode();
    lockVisualStage(props.stage);
    runTyping(TERMINAL_TITLE, typedTitle, 40, "title");
    runTyping(
      stageDefinitions[props.stage].command,
      typedCommand,
      18,
      "command"
    );
    runTyping(
      stageDefinitions[props.stage].headline,
      typedHeadline,
      20,
      "headline"
    );
  },
  { immediate: true }
);

watch(
  () => props.stage,
  stage => {
    if (!props.visible) return;
    lockVisualStage(stage);
    runTyping(stageDefinitions[stage].command, typedCommand, 16, "command");
    runTyping(stageDefinitions[stage].headline, typedHeadline, 18, "headline");
  }
);

onMounted(() => {
  syncThemeMode();
  themeObserver = new MutationObserver(syncThemeMode);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"]
  });
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
});

onBeforeUnmount(() => {
  clearTimers();
  themeObserver?.disconnect();
  themeObserver = null;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="capture-loading-fade">
      <div
        v-if="visible"
        class="capture-loading-overlay"
        :class="overlayThemeClass"
      >
        <div class="terminal-shell">
          <div class="terminal-bar">
            <div class="terminal-dots">
              <span class="dot red" />
              <span class="dot amber" />
              <span class="dot green" />
            </div>
            <div class="terminal-path">{{ TERMINAL_PATH }}</div>
          </div>

          <div class="terminal-body">
            <div class="preview-column">
              <div class="preview-card">
                <div
                  class="preview-stage"
                  :class="`frame-${visualFrame}`"
                  aria-hidden="true"
                >
                  <div class="blueprint-board">
                    <img
                      class="blueprint-template"
                      :src="blueprintTemplate"
                      alt="app icon geometry template"
                    />
                  </div>

                  <div class="chart-stage">
                    <div class="chart-shell">
                      <div class="chart-header">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div class="chart-grid">
                        <span />
                        <span />
                        <span />
                      </div>
                      <div class="chart-bars">
                        <i class="bar-one" />
                        <i class="bar-two" />
                        <i class="bar-three" />
                      </div>
                      <svg
                        class="chart-line"
                        viewBox="0 0 120 68"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 54L34 40L57 44L82 23L110 14"
                          pathLength="1"
                        />
                        <circle cx="10" cy="54" r="3" />
                        <circle cx="34" cy="40" r="3" />
                        <circle cx="57" cy="44" r="3" />
                        <circle cx="82" cy="23" r="3" />
                        <circle cx="110" cy="14" r="3" />
                      </svg>
                    </div>

                    <div class="brand-lockup">
                      <span class="brand-text">IntellEdu</span>
                    </div>
                  </div>

                  <div class="stage-glow" />
                </div>
              </div>

              <div class="preview-chip">{{ badgeText }}</div>
            </div>

            <div class="console-column">
              <div class="console-line hero">
                <span class="prompt">$</span>
                <span class="typed">{{ typedTitle }}</span>
                <span class="cursor" />
              </div>

              <div class="console-line command">
                <span class="prompt accent">&gt;</span>
                <span class="typed command-text">{{ typedCommand }}</span>
                <span class="cursor subtle" />
              </div>

              <div class="headline-panel">
                <span class="headline-label">STATUS</span>
                <span class="headline-text">{{ typedHeadline }}</span>
              </div>

              <div class="stage-list">
                <div
                  v-for="item in stageItems"
                  :key="item.key"
                  class="stage-item"
                  :class="item.state"
                >
                  <div class="stage-head">
                    <span class="state-badge">
                      {{
                        item.state === "done"
                          ? "DONE"
                          : item.state === "running"
                            ? "RUN"
                            : "WAIT"
                      }}
                    </span>
                    <span class="stage-code">{{ item.code }}</span>
                    <span class="stage-label">{{ item.label }}</span>
                  </div>
                  <div class="stage-detail">{{ item.detail }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@keyframes blink-cursor {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

@keyframes stage-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgb(96 165 250 / 0.08%);
  }

  50% {
    box-shadow: 0 0 0 6px rgb(96 165 250 / 0.03%);
  }
}

@keyframes chart-bars {
  0%,
  100% {
    transform: scaleY(0.7);
  }

  50% {
    transform: scaleY(1);
  }
}

.capture-loading-overlay {
  --overlay-tint: rgb(236 240 246 / 64%);
  --overlay-accent: rgb(148 163 184 / 16%);
  --shell-bg: rgb(247 249 252 / 96%);
  --shell-border: rgb(203 213 225 / 52%);
  --shell-shadow: 0 28px 72px rgb(15 23 42 / 12%);
  --bar-bg: linear-gradient(
    180deg,
    rgb(243 246 251 / 96%),
    rgb(236 241 247 / 92%)
  );
  --bar-border: rgb(191 219 254 / 52%);
  --path-color: rgb(71 85 105 / 78%);
  --console-primary: #0f172a;
  --console-secondary: #2563eb;
  --console-muted: rgb(71 85 105 / 76%);
  --prompt-green: #16a34a;
  --preview-bg: transparent;
  --preview-border: transparent;
  --preview-shadow: none;
  --chart-bg: rgb(255 255 255 / 0.84);
  --chart-border: rgb(148 163 184 / 0.3);
  --chart-line: #3b82f6;
  --chart-bar: #60a5fa;
  --brand-color: #0f172a;
  --brand-subtle: rgb(59 130 246 / 0.14);
  --badge-bg: rgb(255 255 255 / 0.86);
  --badge-color: #2563eb;
  --headline-bg: rgb(255 255 255 / 0.7);
  --headline-border: rgb(191 219 254 / 0.64);
  --card-bg: rgb(255 255 255 / 0.66);
  --card-border: rgb(148 163 184 / 0.16);
  --card-running-bg: rgb(239 246 255 / 0.92);
  --card-running-border: rgb(96 165 250 / 0.42);
  --card-done-bg: rgb(236 253 245 / 0.84);
  --card-done-border: rgb(16 185 129 / 0.22);
  --stage-glow: rgb(96 165 250 / 0.2);

  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, var(--overlay-accent), transparent 34%),
    var(--overlay-tint);
  backdrop-filter: blur(8px) saturate(1.06);
}

.capture-loading-overlay.is-dark {
  --overlay-tint: rgb(2 6 23 / 58%);
  --overlay-accent: rgb(59 130 246 / 0.16);
  --shell-bg: rgb(2 6 23 / 0.95);
  --shell-border: rgb(59 130 246 / 0.22);
  --shell-shadow: 0 28px 72px rgb(2 6 23 / 0.34);
  --bar-bg: linear-gradient(180deg, rgb(15 23 42 / 0.96), rgb(15 23 42 / 0.84));
  --bar-border: rgb(59 130 246 / 0.18);
  --path-color: rgb(148 163 184 / 0.82);
  --console-primary: #e2e8f0;
  --console-secondary: #93c5fd;
  --console-muted: rgb(148 163 184 / 0.76);
  --prompt-green: #22c55e;
  --preview-bg: transparent;
  --preview-border: transparent;
  --preview-shadow: none;
  --chart-bg: rgb(15 23 42 / 0.86);
  --chart-border: rgb(96 165 250 / 0.24);
  --chart-line: #93c5fd;
  --chart-bar: #60a5fa;
  --brand-color: #dbeafe;
  --brand-subtle: rgb(59 130 246 / 0.18);
  --badge-bg: rgb(30 41 59 / 0.92);
  --badge-color: #93c5fd;
  --headline-bg: rgb(15 23 42 / 0.72);
  --headline-border: rgb(59 130 246 / 0.18);
  --card-bg: rgb(15 23 42 / 0.74);
  --card-border: rgb(148 163 184 / 0.1);
  --card-running-bg: rgb(15 23 42 / 0.9);
  --card-running-border: rgb(59 130 246 / 0.34);
  --card-done-bg: rgb(6 78 59 / 0.18);
  --card-done-border: rgb(16 185 129 / 0.28);
  --stage-glow: rgb(59 130 246 / 0.24);
}

.capture-loading-overlay.is-light {
  color-scheme: light;
}

.terminal-shell {
  width: min(760px, calc(100vw - 32px));
  overflow: hidden;
  background: var(--shell-bg);
  border: 1px solid var(--shell-border);
  border-radius: 22px;
  box-shadow:
    var(--shell-shadow),
    0 0 0 1px rgb(255 255 255 / 0.06);
}

.terminal-bar {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  background: var(--bar-bg);
  border-bottom: 1px solid var(--bar-border);
}

.terminal-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;

  &.red {
    background: #fb7185;
  }

  &.amber {
    background: #fbbf24;
  }

  &.green {
    background: #34d399;
  }
}

.terminal-path,
.console-line,
.stage-head,
.stage-detail,
.preview-chip,
.headline-panel {
  font-family:
    "Consolas", "JetBrains Mono", "SFMono-Regular", "Cascadia Code",
    "Source Code Pro", monospace;
}

.terminal-path {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--path-color);
}

.terminal-body {
  display: flex;
  gap: 22px;
  align-items: stretch;
  padding: 22px;
}

.preview-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  width: 176px;
}

.preview-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--preview-bg);
  border: 1px solid var(--preview-border);
  border-radius: 0;
  box-shadow: none;
}

.preview-stage {
  position: relative;
  width: 100%;
  height: 100%;
}

.blueprint-board,
.chart-stage,
.stage-glow {
  position: absolute;
  inset: 0;
}

.blueprint-board {
  overflow: hidden;
  transition:
    opacity 1.05s ease,
    transform 1.05s ease,
    filter 1.05s ease;
}

.blueprint-template {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition:
    filter 0.3s ease,
    opacity 0.3s ease;
}

.capture-loading-overlay.is-dark .blueprint-template {
  filter: brightness(0.78) saturate(0.92);
}

.chart-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 28px 18px 18px;
  transition:
    opacity 1s ease,
    transform 1s ease,
    filter 1s ease;
}

.chart-shell {
  position: relative;
  width: 132px;
  padding: 10px 10px 14px;
  background: var(--chart-bg);
  border: 1px solid var(--chart-border);
  border-radius: 18px;
  box-shadow:
    0 16px 28px rgb(15 23 42 / 0.12),
    inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.chart-header {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 10px;

  span {
    width: 6px;
    height: 6px;
    background: var(--chart-line);
    border-radius: 999px;
    opacity: 0.72;
  }
}

.chart-grid {
  position: absolute;
  inset: 30px 10px 14px;
  display: grid;
  gap: 14px;

  span {
    border-top: 1px solid rgb(148 163 184 / 0.22);
  }
}

.chart-bars {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-end;
  height: 74px;
  padding: 14px 10px 10px;

  i {
    width: 20px;
    background: linear-gradient(180deg, var(--chart-line), var(--chart-bar));
    border-radius: 10px 10px 6px 6px;
    transform-origin: bottom;
    animation: chart-bars 2.6s ease-in-out infinite;
  }

  .bar-one {
    height: 34px;
    animation-delay: 0s;
  }

  .bar-two {
    height: 52px;
    animation-delay: 0.25s;
  }

  .bar-three {
    height: 24px;
    animation-delay: 0.5s;
  }
}

.chart-line {
  position: absolute;
  right: 8px;
  bottom: 14px;
  width: 112px;
  height: 66px;
  overflow: visible;

  path {
    stroke: var(--chart-line);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw-line 1.2s ease forwards;
  }

  circle {
    fill: var(--chart-line);
    opacity: 0.92;
  }
}

.brand-lockup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 108px;
  padding: 8px 16px;
  background: var(--brand-subtle);
  border: 1px solid rgb(96 165 250 / 0.18);
  border-radius: 999px;
  transition:
    opacity 0.9s ease,
    transform 0.9s ease;
}

.brand-text {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--brand-color);
}

.stage-glow {
  inset: auto 16px 16px;
  height: 64px;
  background: radial-gradient(
    circle at center,
    var(--stage-glow),
    transparent 72%
  );
  filter: blur(18px);
  pointer-events: none;
}

.preview-stage.frame-0 .blueprint-board {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.preview-stage.frame-0 .chart-stage {
  opacity: 0;
  transform: translateY(20px) scale(0.88);
  filter: blur(8px);
}

.preview-stage.frame-1 .blueprint-board {
  opacity: 0.42;
  transform: scale(0.98);
  filter: blur(2px);
}

.preview-stage.frame-1 .chart-stage {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.preview-stage.frame-1 .brand-lockup {
  opacity: 0;
  transform: translateY(10px);
}

.preview-stage.frame-2 .blueprint-board {
  opacity: 0.18;
  transform: scale(0.97);
  filter: blur(4px);
}

.preview-stage.frame-2 .chart-stage {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.preview-stage.frame-2 .brand-lockup {
  opacity: 1;
  transform: translateY(0);
}

.preview-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--badge-color);
  background: var(--badge-bg);
  border: 1px solid var(--preview-border);
  border-radius: 999px;
}

.console-column {
  flex: 1;
  min-width: 0;
}

.console-line {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 28px;
  color: var(--console-primary);

  &.hero {
    min-height: 34px;
    font-size: 22px;
    font-weight: 600;
  }

  &.command {
    margin-top: 8px;
    font-size: 13px;
    color: var(--console-secondary);
  }
}

.prompt {
  color: var(--prompt-green);
  user-select: none;

  &.accent {
    color: var(--console-secondary);
  }
}

.typed {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-text {
  letter-spacing: 0.08em;
  text-transform: lowercase;
}

.cursor {
  width: 10px;
  height: 1.1em;
  background: currentColor;
  border-radius: 2px;
  animation: blink-cursor 1s step-end infinite;

  &.subtle {
    width: 8px;
    opacity: 0.8;
  }
}

.headline-panel {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  margin-top: 14px;
  background: var(--headline-bg);
  border: 1px solid var(--headline-border);
  border-radius: 16px;
}

.headline-label {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--console-muted);
}

.headline-text {
  min-height: 20px;
  font-size: 14px;
  color: var(--console-primary);
}

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

.stage-item {
  padding: 12px 14px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    opacity 0.2s ease;

  &.waiting {
    opacity: 0.72;
  }

  &.running {
    background: var(--card-running-bg);
    border-color: var(--card-running-border);
    animation: stage-pulse 1.8s ease infinite;
  }

  &.done {
    background: var(--card-done-bg);
    border-color: var(--card-done-border);
  }
}

.stage-head {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.state-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 46px;
  height: 22px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--console-muted);
  background: rgb(148 163 184 / 0.1);
  border-radius: 999px;

  .stage-item.running & {
    color: var(--console-secondary);
    background: rgb(59 130 246 / 0.12);
  }

  .stage-item.done & {
    color: #10b981;
    background: rgb(16 185 129 / 0.1);
  }
}

.stage-code {
  flex-shrink: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--console-muted);
}

.stage-label {
  overflow: hidden;
  font-size: 13px;
  color: var(--console-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-detail {
  margin-top: 8px;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--console-muted);
}

.capture-loading-fade-enter-active,
.capture-loading-fade-leave-active {
  transition: opacity 0.22s ease;
}

.capture-loading-fade-enter-from,
.capture-loading-fade-leave-to {
  opacity: 0;
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

@media (max-width: 720px) {
  .capture-loading-overlay {
    padding: 16px;
  }

  .terminal-body {
    flex-direction: column;
  }

  .preview-column {
    width: 100%;
  }

  .preview-card {
    max-height: 180px;
  }
}
</style>

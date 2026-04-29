<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

defineOptions({
  name: "CaptureLoadingOverlay"
});

const props = defineProps<{
  visible: boolean;
  stage: "capturing" | "optimizing" | "starting";
  preview?: string;
}>();

const TERMINAL_TITLE = "IntellEdu 智慧教育解决方案";
const STAGE_COMMANDS = {
  capturing: "dealing.capture.buffer",
  optimizing: "optimizing.screenshot.payload",
  starting: "booting.intelledu.assistant"
} as const;

const typedTitle = ref("");
const typedCommand = ref("");
let titleTimer: ReturnType<typeof window.setInterval> | null = null;
let commandTimer: ReturnType<typeof window.setInterval> | null = null;

const stageIndex = computed(() => {
  if (props.stage === "capturing") return 0;
  if (props.stage === "optimizing") return 1;
  return 2;
});

const stageItems = computed(() => {
  const current = stageIndex.value;
  return [
    {
      key: "capturing",
      code: "0x01",
      label: "Dealing Capture Buffer",
      detail: "锁定框选区域并生成截图",
      state: current > 0 ? "done" : current === 0 ? "running" : "waiting"
    },
    {
      key: "optimizing",
      code: "0x02",
      label: "Optimizing Screenshot Payload",
      detail: "压缩图片并准备分析数据",
      state: current > 1 ? "done" : current === 1 ? "running" : "waiting"
    },
    {
      key: "starting",
      code: "0x03",
      label: "Booting IntellEdu Assistant",
      detail: "唤起对话窗口并连接助手",
      state: current === 2 ? "running" : "waiting"
    }
  ] as const;
});

const badgeText = computed(() => {
  return props.preview ? "SCREENSHOT READY" : "CAPTURE LOCKED";
});

const clearTimers = () => {
  if (titleTimer) {
    window.clearInterval(titleTimer);
    titleTimer = null;
  }
  if (commandTimer) {
    window.clearInterval(commandTimer);
    commandTimer = null;
  }
};

const runTyping = (
  text: string,
  target: typeof typedTitle,
  speed: number,
  timerType: "title" | "command"
) => {
  const timerRef = timerType === "title" ? titleTimer : commandTimer;
  if (timerRef) {
    window.clearInterval(timerRef);
  }

  target.value = "";
  let index = 0;
  const timer = window.setInterval(() => {
    index += 1;
    target.value = text.slice(0, index);
    if (index >= text.length) {
      window.clearInterval(timer);
      if (timerType === "title") {
        titleTimer = null;
      } else {
        commandTimer = null;
      }
    }
  }, speed);

  if (timerType === "title") {
    titleTimer = timer;
  } else {
    commandTimer = timer;
  }
};

watch(
  () => props.visible,
  visible => {
    if (!visible) {
      clearTimers();
      typedTitle.value = "";
      typedCommand.value = "";
      return;
    }

    runTyping(TERMINAL_TITLE, typedTitle, 46, "title");
    runTyping(STAGE_COMMANDS[props.stage], typedCommand, 28, "command");
  },
  { immediate: true }
);

watch(
  () => props.stage,
  stage => {
    if (!props.visible) return;
    runTyping(STAGE_COMMANDS[stage], typedCommand, 24, "command");
  }
);

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="capture-loading-fade">
      <div v-if="visible" class="capture-loading-overlay">
        <div class="terminal-shell">
          <div class="terminal-bar">
            <div class="terminal-dots">
              <span class="dot red" />
              <span class="dot amber" />
              <span class="dot green" />
            </div>
            <div class="terminal-path">INTELLEDU://screen-capture/init</div>
          </div>

          <div class="terminal-body">
            <div class="preview-column">
              <div class="preview-card">
                <img v-if="preview" :src="preview" alt="capture preview" />
                <div v-else class="preview-placeholder">
                  <div class="placeholder-grid" />
                </div>
                <div class="preview-scanline" />
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
@keyframes preview-scan {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(220%);
  }
}

@keyframes blink-cursor {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.capture-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgb(59 130 246 / 16%), transparent 30%),
    rgb(2 6 23 / 56%);
  backdrop-filter: blur(14px);
}

.terminal-shell {
  width: min(760px, calc(100vw - 32px));
  overflow: hidden;
  background: rgb(2 6 23 / 94%);
  border: 1px solid rgb(59 130 246 / 22%);
  border-radius: 22px;
  box-shadow:
    0 28px 70px rgb(2 6 23 / 35%),
    0 0 0 1px rgb(148 163 184 / 8%);
}

.terminal-bar {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(180deg, rgb(15 23 42 / 96%), rgb(15 23 42 / 84%));
  border-bottom: 1px solid rgb(59 130 246 / 18%);
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
.preview-chip {
  font-family:
    "Consolas",
    "JetBrains Mono",
    "SFMono-Regular",
    "Cascadia Code",
    "Source Code Pro",
    monospace;
}

.terminal-path {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: rgb(148 163 184 / 82%);
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
  width: 168px;
}

.preview-card {
  position: relative;
  width: 100%;
  height: 168px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgb(59 130 246 / 18%);
  border-radius: 18px;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 4%),
    0 18px 36px rgb(2 6 23 / 22%);

  img,
  .preview-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preview-placeholder {
  position: relative;
  background:
    radial-gradient(circle at top, rgb(96 165 250 / 24%), transparent 40%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.placeholder-grid {
  position: absolute;
  inset: 14px;
  border: 1px solid rgb(148 163 184 / 32%);
  border-radius: 12px;

  &::before,
  &::after {
    position: absolute;
    content: "";
    background: rgb(148 163 184 / 28%);
  }

  &::before {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
  }

  &::after {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    transform: translateY(-50%);
  }
}

.preview-scanline {
  position: absolute;
  inset: -40%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgb(96 165 250 / 0%) 36%,
    rgb(96 165 250 / 32%) 50%,
    rgb(96 165 250 / 0%) 64%,
    transparent 100%
  );
  animation: preview-scan 1.6s linear infinite;
}

.preview-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #93c5fd;
  background: rgb(30 41 59 / 92%);
  border: 1px solid rgb(59 130 246 / 22%);
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
  color: #e2e8f0;

  &.hero {
    min-height: 34px;
    font-size: 22px;
    font-weight: 600;
  }

  &.command {
    margin-top: 8px;
    font-size: 13px;
    color: #93c5fd;
  }
}

.prompt {
  color: #22c55e;
  user-select: none;

  &.accent {
    color: #60a5fa;
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

.stage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 22px;
}

.stage-item {
  padding: 12px 14px;
  background: rgb(15 23 42 / 74%);
  border: 1px solid rgb(148 163 184 / 10%);
  border-radius: 16px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &.waiting {
    opacity: 0.72;
  }

  &.running {
    border-color: rgb(59 130 246 / 34%);
    background: rgb(15 23 42 / 88%);
    box-shadow: 0 0 0 1px rgb(59 130 246 / 8%);
  }

  &.done {
    border-color: rgb(16 185 129 / 28%);
    background: rgb(6 78 59 / 18%);
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
  border-radius: 999px;
  background: rgb(30 41 59 / 92%);
  color: #94a3b8;

  .stage-item.running & {
    color: #93c5fd;
    background: rgb(30 64 175 / 24%);
  }

  .stage-item.done & {
    color: #86efac;
    background: rgb(6 95 70 / 28%);
  }
}

.stage-code {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #64748b;
}

.stage-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #e2e8f0;
}

.stage-detail {
  margin-top: 7px;
  margin-left: 58px;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}

.capture-loading-fade-enter-active,
.capture-loading-fade-leave-active {
  transition: opacity 0.22s ease;
}

.capture-loading-fade-enter-from,
.capture-loading-fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 720px) {
  .capture-loading-overlay {
    padding: 16px;
  }

  .terminal-shell {
    width: min(480px, calc(100vw - 20px));
    border-radius: 20px;
  }

  .terminal-body {
    flex-direction: column;
    gap: 18px;
    padding: 18px;
  }

  .preview-column {
    width: 100%;
  }

  .preview-card {
    height: 148px;
  }

  .console-line.hero {
    font-size: 18px;
  }

  .stage-detail {
    margin-left: 0;
  }

  .stage-head {
    flex-wrap: wrap;
  }
}
</style>

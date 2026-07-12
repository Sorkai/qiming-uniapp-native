<template>
  <div
    class="smd"
    :class="{ 'smd--compact': compact }"
    :style="styleVars"
    :aria-label="`${demo.module}演示`"
  >
    <div class="smd__chrome">
      <div class="smd__lights"><span /><span /><span /></div>
      <div class="smd__url">
        <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
          <path
            d="M12 1 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linejoin="round"
          />
        </svg>
        <span>{{ demo.path }}</span>
      </div>
      <span class="smd__live" title="界面预览" aria-label="界面预览">
        <Icon icon="lucide:monitor-play" aria-hidden="true" />
      </span>
    </div>

    <div class="smd__workspace">
      <aside class="smd__side">
        <div class="smd__brand">
          <img :src="logo" alt="" />
          <span>启明智教</span>
        </div>
        <p>工作区</p>
        <button
          v-for="(item, i) in navItems"
          :key="item.label"
          type="button"
          :class="{ 'is-active': i === 0 }"
        >
          <Icon :icon="item.icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </aside>

      <main class="smd__main">
        <div class="smd__top">
          <div class="smd__crumbs">
            <span>启明智教</span>
            <span>/</span>
            <strong>{{ demo.module }}</strong>
          </div>
          <span class="smd__mesh">
            <Icon icon="lucide:cloud-check" aria-hidden="true" />
            课程数据已同步
          </span>
        </div>

        <section class="smd__head">
          <div>
            <p>课程工作台</p>
            <h4>{{ demo.title || demo.module }}</h4>
          </div>
          <div class="smd__metrics">
            <article
              v-for="(metric, i) in demo.metrics"
              :key="metric.label"
              :style="{ animationDelay: `${i * 0.08}s` }"
            >
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <em>{{ metric.trend }}</em>
            </article>
          </div>
        </section>

        <section class="smd__viz">
          <div class="smd__bars" aria-hidden="true">
            <article
              v-for="bar in bars"
              :key="bar.label"
              :style="{ '--bar-h': `${bar.height}%`, '--bar-c': bar.color }"
            >
              <span>{{ bar.value }}</span>
              <i />
              <small>{{ bar.label }}</small>
            </article>
          </div>

          <svg class="smd__radar" viewBox="0 0 100 100" aria-hidden="true">
            <polygon points="50,7 91,35 75,84 25,84 9,35" />
            <polygon points="50,20 78,40 67,72 33,72 22,40" />
            <path d="M50 7V50M91 35 50 50M75 84 50 50M25 84 50 50M9 35 50 50" />
            <polygon class="smd__radarFill" :points="radarPoints" />
            <polyline
              class="smd__radarLine"
              :points="`${radarPoints} ${radarPoints.split(' ')[0]}`"
            />
          </svg>
        </section>

        <section class="smd__pipeline">
          <svg
            class="smd__flow"
            viewBox="0 0 640 80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                :id="riverGradientId"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  :stop-color="demo.accent"
                  stop-opacity="0.1"
                />
                <stop offset="45%" :stop-color="demo.accent" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
            </defs>
            <path
              d="M24 44 C 138 10, 194 70, 304 38 S 486 10, 616 44"
              class="smd__flowBase"
            />
            <path
              d="M24 44 C 138 10, 194 70, 304 38 S 486 10, 616 44"
              class="smd__flowLine"
              :stroke="`url(#${riverGradientId})`"
            />
            <circle cx="320" cy="38" r="5" class="smd__packet" />
          </svg>

          <div class="smd__nodes">
            <article
              v-for="(step, i) in demo.steps"
              :key="step.label"
              :style="{ animationDelay: `${i * 0.1}s` }"
            >
              <span>
                <Icon
                  :icon="stepIcons[i % stepIcons.length]"
                  aria-hidden="true"
                />
              </span>
              <strong>{{ step.label }}</strong>
              <small>{{ step.detail }}</small>
            </article>
          </div>
        </section>

        <section class="smd__stack">
          <article
            v-for="item in demo.stack"
            :key="item.label"
            :title="`${item.label} · ${item.desc}`"
          >
            <strong>
              <Icon :icon="item.icon" aria-hidden="true" />
            </strong>
            <span>{{ item.label }}</span>
          </article>
        </section>

        <section class="smd__console">
          <div
            v-for="(line, i) in demo.console.slice(0, compact ? 2 : 4)"
            :key="line"
            :style="{ animationDelay: `${i * 0.14}s` }"
          >
            <span />
            <code>{{ line }}</code>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import logo from "@/assets/logo.png";

interface DemoStep {
  label: string;
  detail: string;
}

interface DemoMetric {
  label: string;
  value: string;
  trend: string;
}

interface StackItem {
  icon: string;
  label: string;
  desc: string;
}

interface ScriptedMiniScene {
  module: string;
  title: string;
  path: string;
  accent: string;
  steps: DemoStep[];
  metrics: DemoMetric[];
  stack: StackItem[];
  console: string[];
}

const props = withDefaults(
  defineProps<{
    scene?: Partial<ScriptedMiniScene>;
    compact?: boolean;
  }>(),
  { compact: false }
);

const fallbackScene: ScriptedMiniScene = {
  module: "课程工作台",
  title: "本节课备课安排",
  path: "intelledu.com/workspace",
  accent: "#4a90e2",
  steps: [
    { label: "指令解析", detail: "章节目标" },
    { label: "学情接入", detail: "薄弱点" },
    { label: "课堂编排", detail: "互动节奏" },
    { label: "课后反馈", detail: "诊断任务" }
  ],
  metrics: [
    { label: "串联模块", value: "6", trend: "+2" },
    { label: "生成耗时", value: "8s", trend: "-43%" },
    { label: "命中率", value: "96%", trend: "+11%" }
  ],
  stack: [
    { icon: "lucide:sparkles", label: "教学助手", desc: "理解任务意图" },
    { icon: "lucide:workflow", label: "任务编排", desc: "串联教学流程" },
    {
      icon: "lucide:chart-no-axes-combined",
      label: "学情状态",
      desc: "记录学生表现"
    },
    {
      icon: "lucide:clipboard-check",
      label: "课后反馈",
      desc: "反馈下一步行动"
    }
  ],
  console: [
    "章节扫描完成",
    "学情合并完成：45 名学生",
    "课堂节奏生成：7 个环节",
    "评价任务已下发"
  ]
};

const barPalette = ["#2d9d78", "#d99a32"];
const barHeights = [84, 66, 76];
const riverGradientId = `smd-flow-${Math.random().toString(36).slice(2, 9)}`;

const demo = computed<ScriptedMiniScene>(() => {
  const scene = props.scene ?? {};
  return {
    ...fallbackScene,
    ...scene,
    steps: scene.steps?.length ? scene.steps : fallbackScene.steps,
    metrics: scene.metrics?.length ? scene.metrics : fallbackScene.metrics,
    stack: scene.stack?.length ? scene.stack : fallbackScene.stack,
    console: scene.console?.length ? scene.console : fallbackScene.console
  };
});

const styleVars = computed(() => ({
  "--smd-accent": demo.value.accent
}));

const navIcons = [
  "lucide:layout-dashboard",
  "lucide:target",
  "lucide:scan-search",
  "lucide:list-checks",
  "lucide:send"
];

const stepIcons = [
  "lucide:inbox",
  "lucide:search-check",
  "lucide:wand-sparkles",
  "lucide:send-horizontal"
];

const navItems = computed(() =>
  [
    demo.value.module,
    ...demo.value.steps.slice(0, 4).map(item => item.label)
  ].map((label, index) => ({ label, icon: navIcons[index] }))
);

const bars = computed(() =>
  demo.value.metrics.map((metric, i) => ({
    ...metric,
    height: barHeights[i % barHeights.length],
    color: i === 0 ? demo.value.accent : barPalette[(i - 1) % barPalette.length]
  }))
);

const radarPoints = computed(() => {
  const values = [0.88, 0.76, 0.62, 0.82, 0.7];
  return values
    .map((value, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / values.length;
      const radius = 42 * value;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});
</script>

<style lang="scss" scoped>
.smd {
  --smd-border: #e5e8ec;
  --smd-muted: #5f6368;
  --smd-soft: #f6f8fb;

  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 420px;
  color: #202124;
  background: #fff;
  border: 1px solid var(--smd-border);
  border-radius: 10px;
  box-shadow: 0 18px 44px -34px rgb(15 23 42 / 28%);
  overflow: hidden;
}

.smd--compact {
  min-height: 336px;
}

.smd__chrome {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  background: #f7f7f5;
  border-bottom: 1px solid var(--smd-border);
}

.smd__lights {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;

  span {
    width: 11px;
    height: 11px;
    border-radius: 50%;

    &:nth-child(1) {
      background: #ff5f57;
    }

    &:nth-child(2) {
      background: #febc2e;
    }

    &:nth-child(3) {
      background: #28c840;
    }
  }
}

.smd__url {
  display: flex;
  flex: 1 1 auto;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 24px;
  padding: 0 12px;
  font-size: 11px;
  color: rgb(0 0 0 / 42%);
  background: #fff;
  border: 1px solid var(--smd-border);
  border-radius: 999px;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.smd__live {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #2468aa;
  background: rgb(74 144 226 / 10%);
  border: 1px solid rgb(74 144 226 / 24%);
  border-radius: 7px;

  svg {
    width: 15px;
    height: 15px;
  }
}

.smd__mesh {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  height: 26px;
  padding: 0 9px;
  font-size: 10px;
  font-weight: 650;
  color: #2468aa;
  background: rgb(74 144 226 / 8%);
  border: 1px solid rgb(74 144 226 / 18%);
  border-radius: 7px;

  svg {
    width: 13px;
    height: 13px;
  }
}

.smd__workspace {
  display: grid;
  grid-template-columns: 176px minmax(0, 1fr);
  flex: 1 1 auto;
  min-height: 0;
  background: #fff;
}

.smd__side {
  min-width: 0;
  padding: 18px 10px;
  background: rgb(248 248 247 / 88%);
  border-right: 1px solid var(--smd-border);

  p {
    margin: 18px 10px 10px;
    font-size: 12px;
    color: var(--smd-muted);
  }

  button {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    height: 34px;
    padding: 0 10px;
    margin-bottom: 4px;
    font: inherit;
    font-size: 13px;
    color: rgb(0 0 0 / 68%);
    cursor: default;
    background: transparent;
    border: 0;
    border-radius: 6px;

    &.is-active {
      color: #2468aa;
      background: rgb(74 144 226 / 10%);
    }

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > svg {
      flex: 0 0 auto;
      width: 17px;
      height: 17px;
      color: color-mix(in srgb, var(--smd-accent) 82%, #202124);
    }
  }
}

.smd__brand {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0 10px;

  img {
    display: block;
    width: 24px;
    height: 24px;
    object-fit: contain;
    border-radius: 5px;
  }

  span {
    min-width: 0;
    overflow: hidden;
    font-size: 13px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.smd__main {
  display: grid;
  grid-template-rows: auto auto minmax(132px, 1fr) auto auto auto;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  padding: 20px 24px;
  overflow: hidden;
}

.smd__top,
.smd__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  min-width: 0;
}

.smd__crumbs {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 12px;
  color: rgb(0 0 0 / 42%);

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.smd__head {
  align-items: center;

  p {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 700;
    color: color-mix(in srgb, var(--smd-accent) 82%, #111827);
  }

  h4 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.28;
    letter-spacing: 0;
    color: #202124;
    text-wrap: balance;
  }
}

.smd__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(72px, 1fr));
  gap: 0;
  min-width: 236px;
  overflow: hidden;
  background: rgb(255 255 255 / 82%);
  border: 1px solid var(--smd-border);
  border-radius: 8px;

  article {
    min-width: 0;
    padding: 10px 12px;
    opacity: 1;
    transform: none;

    + article {
      border-left: 1px solid var(--smd-border);
    }
  }

  span,
  em {
    display: block;
    overflow: hidden;
    font-size: 11px;
    color: var(--smd-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: block;
    margin: 4px 0 2px;
    overflow: hidden;
    font-size: 20px;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    font-style: normal;
    color: #278365;
  }
}

.smd__viz {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(120px, 0.85fr);
  gap: 20px;
  min-height: 0;
  padding: 10px 4px 0;
}

.smd__bars {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: end;
  min-height: 142px;
}

.smd__bars article {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 8px;
  height: 100%;
  min-width: 0;
  text-align: center;

  span,
  small {
    overflow: hidden;
    color: rgb(0 0 0 / 66%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 13px;
    font-weight: 700;
  }

  small {
    font-size: 11px;
  }

  i {
    align-self: end;
    width: 100%;
    height: var(--bar-h);
    min-height: 28px;
    background: color-mix(in srgb, var(--bar-c) 28%, #fff);
    border-radius: 3px 3px 0 0;
    box-shadow: inset 0 3px 0 var(--bar-c);
    transform-origin: bottom;
  }
}

.smd__radar {
  width: 100%;
  min-width: 0;
  max-height: 180px;
  align-self: center;

  polygon,
  path {
    fill: rgb(74 144 226 / 3%);
    stroke: rgb(0 0 0 / 10%);
    stroke-width: 1;
  }
}

.smd__radarFill {
  fill: color-mix(in srgb, var(--smd-accent) 22%, transparent) !important;
  stroke: none !important;
}

.smd__radarLine {
  fill: none;
  stroke: var(--smd-accent);
  stroke-width: 2;
}

.smd__pipeline {
  position: relative;
  min-height: 112px;
  padding: 10px 12px;
  overflow: hidden;
  background: rgb(255 255 255 / 78%);
  border: 1px solid var(--smd-border);
  border-radius: 8px;
}

.smd__flow {
  position: absolute;
  top: 0;
  left: 10px;
  width: calc(100% - 20px);
  height: 74px;
}

.smd__flowBase,
.smd__flowLine {
  fill: none;
  stroke-linecap: round;
}

.smd__flowBase {
  stroke: rgb(0 0 0 / 8%);
  stroke-width: 6;
}

.smd__flowLine {
  stroke-width: 2.5;
  stroke-dasharray: 18 16;
}

.smd__packet {
  fill: #fff;
  stroke: var(--smd-accent);
  stroke-width: 2;
}

.smd__nodes {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  height: 100%;
  padding-top: 42px;
}

.smd__nodes article {
  min-width: 0;
  padding: 10px;
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--smd-accent) 24%, var(--smd-border));
  border-radius: 8px;
  opacity: 1;
  transform: none;

  span {
    display: inline-grid;
    width: 28px;
    height: 28px;
    margin-bottom: 7px;
    place-items: center;
    color: color-mix(in srgb, var(--smd-accent) 88%, #202124);
    background: color-mix(in srgb, var(--smd-accent) 11%, #fff);
    border: 1px solid color-mix(in srgb, var(--smd-accent) 24%, #fff);
    border-radius: 7px;

    svg {
      width: 15px;
      height: 15px;
    }
  }

  strong,
  small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 12px;
    color: #202124;
  }

  small {
    margin-top: 4px;
    font-size: 10px;
    color: var(--smd-muted);
  }
}

.smd__stack {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  article {
    display: flex;
    gap: 7px;
    align-items: center;
    min-width: 0;
    height: 34px;
    padding: 0 9px;
    background: var(--smd-soft);
    border: 1px solid var(--smd-border);
    border-radius: 7px;
  }

  strong {
    display: inline-grid;
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    place-items: center;
    font-size: 11px;
    color: color-mix(in srgb, var(--smd-accent) 88%, #202124);
    background: color-mix(in srgb, var(--smd-accent) 11%, #fff);
    border: 1px solid color-mix(in srgb, var(--smd-accent) 22%, #fff);
    border-radius: 5px;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  span {
    min-width: 0;
    overflow: hidden;
    font-size: 11px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.smd__console {
  display: grid;
  gap: 5px;
  min-height: 0;
  padding: 10px 12px;
  overflow: hidden;
  background: #f7f7f5;
  border: 1px solid var(--smd-border);
  border-radius: 8px;

  div {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
    opacity: 1;
    transform: none;
  }

  span {
    flex: 0 0 auto;
    width: 6px;
    height: 6px;
    background: #4a90e2;
    border-radius: 50%;
  }

  code {
    display: block;
    min-width: 0;
    overflow: hidden;
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
    font-size: 11px;
    color: rgb(15 23 42 / 66%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.smd--compact {
  .smd__workspace {
    grid-template-columns: 58px minmax(0, 1fr);
  }

  .smd__side {
    padding: 14px 8px;

    p,
    .smd__brand span,
    button span {
      display: none;
    }

    button {
      justify-content: center;
      padding: 0;
    }
  }

  .smd__main {
    grid-template-rows: auto auto minmax(108px, 1fr) auto auto;
    gap: 9px;
    padding: 14px;
  }

  .smd__mesh {
    display: none;
  }

  .smd__head {
    display: block;

    h4 {
      font-size: 17px;
    }
  }

  .smd__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-width: 0;
    margin-top: 10px;

    article {
      padding: 8px 7px;
    }

    span {
      overflow: visible;
      font-size: 9px;
      line-height: 1.15;
      text-overflow: clip;
      white-space: normal;
    }

    strong {
      font-size: 15px;
    }
  }

  .smd__viz {
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 10px;
    padding-top: 0;
  }

  .smd__bars {
    gap: 9px;
    min-height: 106px;
  }

  .smd__nodes {
    gap: 7px;
    padding-top: 34px;
  }

  .smd__nodes article {
    padding: 8px 6px;

    span {
      width: 24px;
      height: 24px;
      margin-bottom: 5px;

      svg {
        width: 13px;
        height: 13px;
      }
    }

    strong {
      font-size: 10px;
    }

    small {
      display: none;
    }
  }

  .smd__pipeline {
    min-height: 90px;
  }

  .smd__stack {
    article {
      justify-content: center;
      padding: 0;
    }

    span {
      display: none;
    }
  }
}

@media (width <= 680px) {
  .smd {
    min-height: 360px;
  }

  .smd__workspace {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .smd__side {
    padding: 12px 8px;

    p,
    .smd__brand span,
    button span {
      display: none;
    }

    button {
      justify-content: center;
      padding: 0;
    }
  }

  .smd__main {
    gap: 9px;
    padding: 14px;
  }

  .smd__mesh,
  .smd__live {
    display: none;
  }

  .smd__head {
    display: block;

    h4 {
      font-size: 18px;
    }
  }

  .smd__metrics {
    min-width: 0;
    margin-top: 10px;
  }

  .smd__viz {
    grid-template-columns: minmax(0, 1fr);
  }

  .smd__radar {
    display: none;
  }

  .smd__nodes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .smd *,
  .smd *::before,
  .smd *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}

@keyframes smd-pulse {
  50% {
    transform: scale(1.25);
    box-shadow: 0 0 0 7px rgb(16 185 129 / 12%);
  }
}

@keyframes smd-rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes smd-grow {
  from {
    transform: scaleY(0.18);
  }
}

@keyframes smd-fade {
  from {
    opacity: 0;
    transform: scale(0.9);
    transform-origin: center;
  }
}

@keyframes smd-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes smd-flow {
  to {
    stroke-dashoffset: -34;
  }
}

@keyframes smd-log {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

<template>
  <section class="sd" aria-label="启明智教 · 智能工作流演示">
    <header class="sd__head">
      <p class="sd__eyebrow">智能工作流 · Scripted Demo</p>
    </header>

    <div ref="rootEl" class="sd__stage" :class="{ 'is-paused': paused }">
      <!-- 舞台：浏览器外框 -->
      <div class="sd__chrome">
        <div class="sd__lights"><span /><span /><span /></div>
        <div class="sd__url">
          <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
            <path
              d="M12 1 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
          <span>intelledu.com / workspace</span>
        </div>
        <div class="sd__chip">
          <i class="sd__chipDot" />
          实时演示
        </div>
      </div>

      <div class="sd__body">
        <!-- 侧边栏 -->
        <aside class="sd__side">
          <div class="sd__sideHead">
            <span class="sd__brandSquare">Q</span>
            <span>Qiming HQ</span>
          </div>
          <p class="sd__sideGroup">工作区</p>
          <button
            v-for="item in navItems"
            :key="item.key"
            ref="navRefs"
            type="button"
            class="sd__navItem"
            :class="{ 'is-active': activeNav === item.key }"
            :data-key="item.key"
            @click="manualActivate(item.key)"
          >
            <span class="sd__navIcon" v-html="item.icon" />
            <span>{{ item.label }}</span>
          </button>
        </aside>

        <!-- 中间内容区 -->
        <main class="sd__main">
          <div class="sd__crumbs">
            <span>Qiming HQ</span>
            <span>/</span>
            <span ref="crumbActiveEl">{{ activeLabel }}</span>
            <div class="sd__tbActions">
              <span class="sd__tbBadge">
                <i class="sd__tbDot"></i>
                Service Mesh: Connected
              </span>
              <button class="sd__tbBtn">导出报告</button>
            </div>
          </div>

          <!-- 场景 1：AI 备课 -->
          <div ref="sceneAEl" class="sd__scene" data-scene="prep">
            <div class="sd__sceneHead">
              <div class="sd__sceneHeadMain">
                <h3 ref="sceneATitle" class="sd__sceneTitle">
                  <span class="sd__typed">{{ typedTitle }}</span>
                  <i v-if="showCaret" class="sd__caret" />
                </h3>
                <p class="sd__sceneLede">
                  AI 已经按本节课的目标，把章节、资源、互动环节自动排好了。
                </p>
                <div class="sd__sceneMeta">
                  <span>授课对象：信工 22 级 3 班 (45人)</span>
                  <span class="divider"></span>
                  <span>预计总时长：45 分钟</span>
                  <span class="divider"></span>
                  <span>关联知识图谱节点：22 个</span>
                </div>
              </div>
            </div>

            <div ref="cardsEl" class="sd__cards">
              <!-- Timeline line running behind cards -->
              <div class="sd__timelineTrack"></div>
              <article
                v-for="(c, i) in prepCards"
                :key="c.title"
                ref="prepCardRefs"
                class="sd__card sd__card--node"
                :data-i="i"
              >
                <div
                  class="sd__timelineDot"
                  :style="{ background: c.tagFg }"
                ></div>
                <div class="sd__cardTop">
                  <span
                    class="sd__cardTag"
                    :style="{
                      background: c.tagBg,
                      color: c.tagFg,
                      border: `1px solid ${c.tagFg}40`
                    }"
                  >
                    {{ c.tag }}
                  </span>
                  <span class="sd__cardMeta">{{ c.meta }}</span>
                </div>
                <h4>{{ c.title }}</h4>
                <p>{{ c.desc }}</p>
                <div class="sd__cardFoot">
                  <div class="sd__cardAvatars">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=e2e8f0"
                      alt=""
                    />
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=fef08a"
                      alt=""
                    />
                  </div>
                  <div class="sd__cardBarWrap">
                    <div class="sd__cardBar">
                      <i
                        :style="{
                          width: c.progress + '%',
                          background: c.tagFg
                        }"
                      />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- 场景 2：学情 -->
          <div
            ref="sceneBEl"
            class="sd__scene sd__scene--hidden"
            data-scene="insight"
          >
            <div class="sd__sceneHead">
              <div class="sd__sceneHeadMain">
                <h3 class="sd__sceneTitle">学情看板 · 多维评估模型 (IRT)</h3>
                <p class="sd__sceneLede">
                  融合学生历史行为（LTSM）与题目难度特征，立体刻画学习者能力。
                </p>
              </div>
              <div class="sd__kpiGrid">
                <div class="sd__kpi">
                  <span class="sd__kpiLabel">群体能力均值</span>
                  <strong class="sd__kpiVal">85.4<small> /100</small></strong>
                  <span class="sd__kpiTrend up">↑ 4.2%</span>
                </div>
                <div class="sd__kpi">
                  <span class="sd__kpiLabel">高危流失预警</span>
                  <strong class="sd__kpiVal text-danger"
                    >6<small> 人</small></strong
                  >
                  <span class="sd__kpiTrend down">↓ 2 人</span>
                </div>
                <div class="sd__kpi">
                  <span class="sd__kpiLabel">概念掌握度</span>
                  <strong class="sd__kpiVal">75<small>%</small></strong>
                  <span class="sd__kpiTrend neutral">持平</span>
                </div>
              </div>
            </div>

            <div class="sd__chartRow">
              <div class="sd__bars">
                <div
                  v-for="(b, i) in bars"
                  :key="b.label"
                  ref="barRefs"
                  class="sd__bar"
                  :data-target="b.value"
                  :data-i="i"
                >
                  <span class="sd__barVal">{{ b.value }}%</span>
                  <span
                    class="sd__barFill"
                    :style="{
                      background: `linear-gradient(to top, ${b.color}15, ${b.color}E6)`,
                      boxShadow: `0 4px 12px ${b.color}33`,
                      borderTop: `2px solid ${b.color}`
                    }"
                  />
                  <span class="sd__barLabel">{{ b.label }}</span>
                </div>
              </div>

              <svg
                ref="radarEl"
                class="sd__radar"
                viewBox="0 0 200 200"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="radarGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stop-color="#4A90E2" stop-opacity="0.5" />
                    <stop
                      offset="100%"
                      stop-color="#7B61FF"
                      stop-opacity="0.1"
                    />
                  </linearGradient>
                </defs>
                <g transform="translate(100 100)">
                  <polygon
                    v-for="r in [80, 60, 40, 20]"
                    :key="r"
                    :points="polygonPoints(r)"
                    fill="rgba(74,144,226,0.03)"
                    stroke="rgba(74,144,226,0.15)"
                    stroke-width="1"
                    stroke-dasharray="2 2"
                  />
                  <line
                    v-for="(p, i) in polygonAxes"
                    :key="i"
                    x1="0"
                    y1="0"
                    :x2="p.x"
                    :y2="p.y"
                    stroke="rgba(74,144,226,0.2)"
                  />
                  <polygon
                    ref="radarShapeEl"
                    :points="radarShape"
                    fill="url(#radarGrad)"
                    stroke="#4A90E2"
                    stroke-width="2"
                    stroke-linejoin="round"
                    style="
                      filter: drop-shadow(0 4px 10px rgba(74, 144, 226, 0.3));
                    "
                  />
                </g>
              </svg>
            </div>
          </div>

          <!-- 场景 3：课堂互动 -->
          <div
            ref="sceneCEl"
            class="sd__scene sd__scene--hidden"
            data-scene="class"
          >
            <div class="sd__sceneHead">
              <div class="sd__sceneHeadMain">
                <h3 class="sd__sceneTitle">课堂中控 · 知识拓扑图</h3>
                <p class="sd__sceneLede">知识点、反馈、资源与评价同步点亮。</p>
              </div>
              <div class="sd__liveOverlay">
                <div class="sd__livePulse"></div>
                <div class="sd__liveStats">
                  <div v-for="m in classMetrics" :key="m.label" class="stat">
                    <span class="val">{{ m.value }}</span
                    ><span class="lbl">{{ m.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="sd__class">
              <aside class="sd__teacherPanel">
                <div class="sd__teacherTop">
                  <span class="sd__avatar sd__avatar--teacher">T</span>
                  <div>
                    <strong>教师中控</strong>
                    <small>Lesson OS</small>
                  </div>
                </div>
                <div class="sd__promptCard">
                  <span>当前意图</span>
                  <strong>平衡二叉树 · 递归边界</strong>
                </div>
                <div class="sd__miniMeters">
                  <div
                    v-for="m in teacherSignals"
                    :key="m.label"
                    class="sd__miniMeter"
                  >
                    <div>
                      <span>{{ m.label }}</span>
                      <b>{{ m.value }}%</b>
                    </div>
                    <i :style="{ width: m.value + '%', background: m.color }" />
                  </div>
                </div>
                <div class="sd__stackMini">
                  <span v-for="s in classStack" :key="s">{{ s }}</span>
                </div>
              </aside>

              <section class="sd__topology" aria-label="知识拓扑图">
                <div class="sd__topologyTop">
                  <span>Knowledge Graph</span>
                  <strong>22 节点 · 6 弱连接</strong>
                </div>
                <div class="sd__topologyCanvas">
                  <svg
                    class="sd__classLines"
                    viewBox="0 0 420 260"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="lineGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stop-color="#111827" />
                        <stop offset="45%" stop-color="#10B981" />
                        <stop offset="100%" stop-color="#4A90E2" />
                      </linearGradient>
                    </defs>
                    <path
                      v-for="(l, i) in classLines"
                      :key="i"
                      ref="lineRefs"
                      :d="l.d"
                      stroke="url(#lineGrad)"
                      stroke-width="2.4"
                      fill="none"
                      stroke-linecap="round"
                      opacity="0.78"
                    />
                  </svg>
                  <div
                    v-for="n in topologyNodes"
                    :key="n.id"
                    class="sd__topologyNode"
                    :class="{
                      'sd__topologyNode--root': n.root,
                      'sd__topologyNode--hot': n.hot
                    }"
                    :style="{
                      left: n.x + '%',
                      top: n.y + '%',
                      '--node': n.color
                    }"
                  >
                    <span>{{ n.code }}</span>
                    <strong>{{ n.title }}</strong>
                    <small>{{ n.meta }}</small>
                  </div>
                </div>
              </section>

              <aside class="sd__featureGrid">
                <article
                  v-for="tile in coreTiles"
                  :key="tile.title"
                  class="sd__featureTile"
                  :style="{ '--tile': tile.color, background: tile.bg }"
                >
                  <span>{{ tile.code }}</span>
                  <strong>{{ tile.title }}</strong>
                  <small>{{ tile.value }}</small>
                </article>
              </aside>

              <div class="sd__responseDock">
                <div
                  v-for="(s, i) in students"
                  :key="s.name"
                  ref="studentRefs"
                  class="sd__student"
                  :data-i="i"
                >
                  <span class="sd__avatar" :class="'sd__avatar--' + i">{{
                    s.name
                  }}</span>
                  <div class="sd__studentBody">
                    <strong>{{ s.reply }}</strong>
                    <span>{{ s.meta }}</span>
                  </div>
                  <i
                    class="sd__studentMeter"
                    :style="{ width: s.score + '%', background: s.color }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 场景 4：智能组卷 -->
          <div
            ref="sceneDEl"
            class="sd__scene sd__scene--hidden"
            data-scene="exam"
          >
            <div class="sd__sceneHead">
              <div class="sd__sceneHeadMain">
                <h3 class="sd__sceneTitle">思维链错题诊断与自适应组卷</h3>
                <p class="sd__sceneLede">
                  SAHR
                  语义自适应检索，跨越题海自动匹配最优评估组合，动态规划试题难度。
                </p>
              </div>
            </div>
            <div class="sd__exam">
              <div class="sd__examBank">
                <div class="sd__labelBar">
                  <p class="sd__label">错因挖掘池</p>
                  <span class="sd__filter">AI Pool</span>
                </div>
                <div
                  v-for="q in examQuestions"
                  :key="q.id"
                  class="sd__examQ"
                  ref="examQRefs"
                  :data-id="q.id"
                >
                  <span
                    :class="{
                      't-err': q.id === 1,
                      't-blind': q.id === 2,
                      't-extend': q.id === 3
                    }"
                    >{{ q.type }}</span
                  >
                  <div class="sd__examQText">
                    <strong>{{ q.title }}</strong>
                    <div class="sd__examQMeta">
                      DI: 0.{{ 80 + q.id * 3 }} | W: {{ 15 + q.id * 5 }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="sd__examPaper">
                <div class="sd__paperBar">
                  <span>高斯网络评估体系 · A 套流转</span>
                  <div class="sd__paperStats">
                    <span>信度 0.88</span>
                    <span>预计耗时 40'</span>
                  </div>
                </div>
                <div class="sd__paperBody" ref="paperBodyEl">
                  <div
                    class="sd__paperPlaceholder"
                    v-if="!paperQuestions.length"
                  >
                    等待算法汇聚组卷策略...
                  </div>
                  <div
                    v-for="q in paperQuestions"
                    :key="q.id"
                    class="sd__paperItem"
                  >
                    <span class="sd__paperNum"
                      >{{ paperQuestions.indexOf(q) + 1 }}.</span
                    >
                    {{ q.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 场景 5：虚拟实验 -->
          <div
            ref="sceneEEl"
            class="sd__scene sd__scene--hidden"
            data-scene="vlab"
          >
            <div class="sd__sceneHead">
              <h3 class="sd__sceneTitle">虚拟仿真实验室 · 实时内核轨迹</h3>
              <p class="sd__sceneLede">
                突破硬件限制，在浏览器中直观追踪 CPU 调度与系统调用流动。
              </p>
            </div>
            <div class="sd__vlab">
              <div class="sd__vlabSys">
                <div class="sd__linuxKernel" ref="vlabKernel">
                  <div class="sd__osLabel">
                    Linux-LTS v6.1 · Pedagogical Trace
                  </div>
                  <div class="sd__osProc">
                    <div
                      v-for="i in 3"
                      :key="i"
                      class="sd__procItem"
                      ref="vlabProcs"
                    >
                      <span class="sd__procId">0{{ i }}</span>
                      Proc_{{ i === 1 ? "INIT" : i === 2 ? "KWORKER" : "VLAB" }}
                    </div>
                  </div>
                  <div class="sd__vlabWaves">
                    <span v-for="i in 5" :key="i" />
                  </div>
                </div>
                <div class="sd__hardware" ref="vlabHardware">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="sd__cpuCore"
                    ref="vlabCpus"
                  >
                    <span class="sd__cpuLabel">Core {{ i }}</span>
                    <div class="sd__cpuLoad"><i /></div>
                  </div>
                </div>
              </div>
              <div class="sd__vlabConsole">
                <div class="sd__consoleHead">
                  <span class="sd__consoleDot" />
                  Kernel Pedagogical Console
                </div>
                <div class="sd__consoleLines" ref="vlabConsoleEl">
                  <p v-for="(line, i) in consoleLines" :key="i">{{ line }}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 右侧浮动卡 -->
        <Transition name="sd-pop">
          <div v-if="showInsight" ref="insightChipEl" class="sd__insight">
            <span class="sd__insightTag">AI 洞察</span>
            <strong>{{ insightTitle }}</strong>
            <p>{{ insightDesc }}</p>
          </div>
        </Transition>
      </div>

      <!-- 假鼠标 -->
      <div ref="cursorEl" class="sd__cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path
            d="M5 3l14 9-6.5 1.2L9 21z"
            fill="#111"
            stroke="#fff"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
        </svg>
        <span ref="rippleEl" class="sd__ripple" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from "vue";

/* ------------ 静态数据 ------------ */
const navItems = [
  {
    key: "prep",
    label: "AI 备课",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 4h12l4 4v12H4z" stroke="currentColor" stroke-width="1.6"/><path d="M16 4v4h4" stroke="currentColor" stroke-width="1.6"/></svg>'
  },
  {
    key: "insight",
    label: "学情分析",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    key: "class",
    label: "课堂互动",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c1-4 5-5 7-5s6 1 7 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    key: "exam",
    label: "智能组卷",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.6"/><path d="M9 12h6M9 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    key: "vlab",
    label: "虚拟实验",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="1.6"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" stroke-width="1.6"/></svg>'
  }
] as const;

type NavKey = (typeof navItems)[number]["key"];

const prepCards = [
  {
    tag: "导入",
    tagBg: "rgba(255,181,71,0.18)",
    tagFg: "#9a6500",
    meta: "10:00 · 5min",
    title: "情境引入：Linux 内核与教学流转换",
    desc: "用智慧物流案例切入，引出本节核心逻辑。",
    progress: 100
  },
  {
    tag: "深度讲解",
    tagBg: "rgba(74,144,226,0.18)",
    tagFg: "#164e63",
    meta: "10:05 · 18min",
    title: "多维学情聚类与归因算法",
    desc: "动态演示如何捕捉学生认知盲区的流动方向。",
    progress: 82
  },
  {
    tag: "实时互动",
    tagBg: "rgba(16,185,129,0.18)",
    tagFg: "#065f46",
    meta: "10:23 · 12min",
    title: "课堂随练 · 高阶思辨讨论",
    desc: "AI 根据历史轨迹自动调整讨论深度。",
    progress: 55
  }
];

const bars = [
  { label: "理解力", value: 86, color: "#10B981" },
  { label: "活跃度", value: 72, color: "#3B82F6" },
  { label: "专注度", value: 58, color: "#8B5CF6" },
  { label: "准确率", value: 45, color: "#F43F5E" },
  { label: "完成率", value: 92, color: "#06B6D4" }
];

const radarValues = [0.88, 0.72, 0.58, 0.82, 0.65, 0.92];
const polygonAxes = computed(() =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return { x: Math.cos(a) * 80, y: Math.sin(a) * 80 };
  })
);
const polygonPoints = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
const radarShape = computed(() =>
  radarValues
    .map((v, i) => {
      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = v * 80;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    })
    .join(" ")
);

const classMetrics = [
  { label: "连通", value: "94%" },
  { label: "响应", value: "37/45" },
  { label: "延迟", value: "1.2s" }
];

const teacherSignals = [
  { label: "掌握", value: 76, color: "#10B981" },
  { label: "追问", value: 48, color: "#4A90E2" },
  { label: "风险", value: 22, color: "#F43F5E" }
];

const classStack = ["AWSP", "MCP", "IRT"];

const topologyNodes = [
  {
    id: "root",
    code: "K0",
    title: "平衡二叉树",
    meta: "核心",
    x: 47,
    y: 43,
    color: "#111827",
    root: true
  },
  {
    id: "dfs",
    code: "K1",
    title: "DFS 后序",
    meta: "已掌握",
    x: 18,
    y: 28,
    color: "#10B981"
  },
  {
    id: "height",
    code: "K2",
    title: "高度差",
    meta: "薄弱",
    x: 72,
    y: 22,
    color: "#F43F5E",
    hot: true
  },
  {
    id: "recursion",
    code: "K3",
    title: "递归边界",
    meta: "追问",
    x: 23,
    y: 68,
    color: "#4A90E2"
  },
  {
    id: "rubric",
    code: "E1",
    title: "评价量规",
    meta: "同步",
    x: 70,
    y: 68,
    color: "#8B5CF6"
  }
];

const coreTiles = [
  {
    code: "01",
    title: "知识拓扑",
    value: "22 节点",
    color: "#111827",
    bg: "linear-gradient(135deg, #ffffff, #f5f5f4)"
  },
  {
    code: "02",
    title: "错因聚类",
    value: "6 簇",
    color: "#F43F5E",
    bg: "linear-gradient(135deg, #fff7ed, #fff1f2)"
  },
  {
    code: "03",
    title: "资源编排",
    value: "12 条",
    color: "#4A90E2",
    bg: "linear-gradient(135deg, #eff6ff, #ecfeff)"
  },
  {
    code: "04",
    title: "评价闭环",
    value: "实时",
    color: "#10B981",
    bg: "linear-gradient(135deg, #ecfdf5, #f7fee7)"
  }
];

const students = [
  {
    name: "明",
    reply: "高度差 ≤ 1",
    meta: "概念确认",
    score: 86,
    color: "#3B82F6"
  },
  {
    name: "妍",
    reply: "先算左右子树",
    meta: "步骤完整",
    score: 74,
    color: "#10B981"
  },
  {
    name: "宇",
    reply: "后序回传高度",
    meta: "方法命中",
    score: 68,
    color: "#F59E0B"
  },
  {
    name: "涵",
    reply: "-1 标记失衡",
    meta: "边界追问",
    score: 58,
    color: "#EC4899"
  }
];
const classLines = [
  { d: "M 205 124 C 165 94, 130 84, 83 75" },
  { d: "M 225 118 C 265 74, 292 62, 315 58" },
  { d: "M 198 142 C 156 164, 116 178, 94 188" },
  { d: "M 230 142 C 270 164, 290 180, 311 189" },
  { d: "M 94 188 C 150 208, 236 206, 311 189" },
  { d: "M 83 75 C 160 36, 248 36, 315 58" }
];

const examQuestions = [
  { id: 1, type: "高频错题", title: "识别内核态与用户态切换触发的根本原因？" },
  {
    id: 2,
    type: "知识盲区",
    title: "对比多线程竞争条件下死锁检测的拓扑算法？"
  },
  {
    id: 3,
    type: "思维延展",
    title: "设计一个满足零拷贝特性的高性能数据流水线。"
  }
];

const consoleHistory = [
  "[ 0.000] Qiming OS Virtual Environment Booting...",
  "[ 0.352] Initializing educational scenario: Process Scheduling",
  "[ 0.820] Detecting pedagogical interactions: Student 15 connected",
  "[ 1.450] Mapping CPU instruction stream to visual trace...",
  "[ 2.100] Context switch captured: SYSCALL_VLAB_READ",
  "[ 2.800] Buffer overflow protection enabled via AI sandbox."
];

/* ------------ 响应式状态 ------------ */
const activeNav = ref<NavKey>("prep");
const activeLabel = computed(
  () => navItems.find(n => n.key === activeNav.value)?.label ?? ""
);
const typedTitle = ref("");
const showCaret = ref(false);
const showInsight = ref(false);
const insight = reactive({ title: "", desc: "" });
const insightTitle = computed(() => insight.title);
const insightDesc = computed(() => insight.desc);
const paused = ref(false);

const paperQuestions = ref<any[]>([]);
const consoleLines = ref<string[]>([]);

/* ------------ DOM 引用 ------------ */
const rootEl = ref<HTMLElement | null>(null);
const cursorEl = ref<HTMLElement | null>(null);
const rippleEl = ref<HTMLElement | null>(null);
const sceneAEl = ref<HTMLElement | null>(null);
const sceneBEl = ref<HTMLElement | null>(null);
const sceneCEl = ref<HTMLElement | null>(null);
const sceneDEl = ref<HTMLElement | null>(null);
const sceneEEl = ref<HTMLElement | null>(null);
const sceneATitle = ref<HTMLElement | null>(null);
const cardsEl = ref<HTMLElement | null>(null);
const prepCardRefs = ref<HTMLElement[]>([]);
const barRefs = ref<HTMLElement[]>([]);
const radarShapeEl = ref<SVGPolygonElement | null>(null);
const lineRefs = ref<SVGPathElement[]>([]);
const studentRefs = ref<HTMLElement[]>([]);
const examQRefs = ref<HTMLElement[]>([]);
const paperBodyEl = ref<HTMLElement | null>(null);
const vlabKernel = ref<HTMLElement | null>(null);
const vlabHardware = ref<HTMLElement | null>(null);
const vlabProcs = ref<HTMLElement[]>([]);
const vlabCpus = ref<HTMLElement[]>([]);
const vlabConsoleEl = ref<HTMLElement | null>(null);
const insightChipEl = ref<HTMLElement | null>(null);
const navRefs = ref<HTMLElement[]>([]);
const crumbActiveEl = ref<HTMLElement | null>(null);

/* ------------ 时间轴 ------------ */
let tl: gsap.core.Timeline | null = null;
let io: IntersectionObserver | null = null;

const FULL_TITLE = "嵌入式 Linux · 第 4 章 教学方案";

const moveCursorToNav = (key: NavKey) => {
  const el = navRefs.value.find(n => n?.dataset.key === key);
  const root = rootEl.value;
  if (!el || !root) return null;
  const rRect = root.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  return {
    x: eRect.left - rRect.left + eRect.width / 2,
    y: eRect.top - rRect.top + eRect.height / 2
  };
};

const buildTimeline = () => {
  tl?.kill();

  // 初始隐藏需要进场的元素
  gsap.set(prepCardRefs.value, { y: 16, opacity: 0 });
  gsap.set(barRefs.value, { transformOrigin: "bottom center" });
  barRefs.value.forEach(b => {
    const fill = b.querySelector(".sd__barFill") as HTMLElement | null;
    if (fill) gsap.set(fill, { scaleY: 0, transformOrigin: "bottom center" });
  });
  if (radarShapeEl.value)
    gsap.set(radarShapeEl.value, { scale: 0, transformOrigin: "center" });
  lineRefs.value.forEach(l => {
    const len = l.getTotalLength?.() ?? 360;
    gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.set(studentRefs.value, { scale: 0.6, opacity: 0 });

  // 鼠标起点：右上
  const root = rootEl.value;
  if (!root || !cursorEl.value) return;
  const startX = root.clientWidth - 60;
  const startY = 80;
  gsap.set(cursorEl.value, { x: startX, y: startY, opacity: 1 });
  gsap.set(rippleEl.value, { scale: 0, opacity: 0 });

  const t = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
  tl = t;
  // 在开发期暴露时间轴便于排查；生产环境无副作用
  if (typeof window !== "undefined") (window as any).__sdTl = t;

  // ============= 幕 1：AI 备课 =============
  const prepPos = moveCursorToNav("prep");
  if (prepPos) {
    t.to(cursorEl.value, { ...prepPos, duration: 0.9, ease: "power2.inOut" });
    t.add(() => clickNav("prep"), "+=0.05");
    t.fromTo(
      rippleEl.value,
      { scale: 0, opacity: 0.5 },
      { scale: 2.2, opacity: 0, duration: 0.55, ease: "power2.out" },
      "<"
    );
  }
  t.add(() => activateScene("prep"), "+=0.05");
  // 打字机：标题
  t.add(() => typeOut(FULL_TITLE), "+=0.1");
  t.to({}, { duration: FULL_TITLE.length * 0.04 + 0.3 });
  // 卡片错层进入
  t.to(prepCardRefs.value, {
    y: 0,
    opacity: 1,
    duration: 0.55,
    stagger: 0.12,
    ease: "power3.out"
  });
  // 洞察弹出
  t.add(() =>
    showInsightChip("已生成教学方案", "本节包含 1 个引入 · 1 段讲解 · 1 组练习")
  );
  t.to({}, { duration: 1.6 });

  // ============= 幕 2：学情 =============
  const insightPos = moveCursorToNav("insight");
  t.add(() => hideInsightChip());
  if (insightPos) {
    t.to(cursorEl.value, {
      ...insightPos,
      duration: 0.85,
      ease: "power2.inOut"
    });
    t.add(() => clickNav("insight"), "+=0.05");
    t.fromTo(
      rippleEl.value,
      { scale: 0, opacity: 0.5 },
      { scale: 2.2, opacity: 0, duration: 0.55, ease: "power2.out" },
      "<"
    );
  }
  t.add(() => activateScene("insight"), "+=0.05");
  // 柱状图生长
  t.to({}, { duration: 0.3 });
  barRefs.value.forEach((b, i) => {
    const fill = b.querySelector(".sd__barFill") as HTMLElement | null;
    const target = Number(b.dataset.target ?? 50) / 100;
    if (fill)
      t.to(
        fill,
        { scaleY: target, duration: 0.6, ease: "power2.out" },
        `>-${i === 0 ? 0 : 0.5}`
      );
  });
  // 雷达图绘制
  if (radarShapeEl.value)
    t.to(
      radarShapeEl.value,
      { scale: 1, duration: 0.7, ease: "back.out(1.4)" },
      "<0.2"
    );
  t.add(() =>
    showInsightChip(
      "学习效率 +18%",
      "AI 标出 3 个薄弱知识点：调度 · 同步 · 信号"
    )
  );
  t.to({}, { duration: 1.6 });

  // ============= 幕 3：课堂 =============
  const classPos = moveCursorToNav("class");
  t.add(() => hideInsightChip());
  if (classPos) {
    t.to(cursorEl.value, {
      ...classPos,
      duration: 0.85,
      ease: "power2.inOut"
    });
    t.add(() => clickNav("class"), "+=0.05");
    t.fromTo(
      rippleEl.value,
      { scale: 0, opacity: 0.5 },
      { scale: 2.2, opacity: 0, duration: 0.55, ease: "power2.out" },
      "<"
    );
  }
  t.add(() => activateScene("class"), "+=0.05");
  // 鼠标淡出
  t.to(cursorEl.value, { opacity: 0, duration: 0.4 }, "+=0.1");
  // 连线绘制
  t.to(
    lineRefs.value,
    { strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: "power2.out" },
    "<-0.2"
  );
  // 学生头像弹入
  t.to(
    studentRefs.value,
    {
      scale: 1,
      opacity: 1,
      duration: 0.45,
      stagger: 0.12,
      ease: "back.out(1.6)"
    },
    "<0.1"
  );
  t.add(() =>
    showInsightChip("4 名学生已响应", "课堂互动率 100% · AI 实时收集回答")
  );
  t.to({}, { duration: 1.8 });

  // ============= 幕 4：智能组卷 =============
  const examPos = moveCursorToNav("exam");
  t.add(() => hideInsightChip());
  if (examPos) {
    t.to(cursorEl.value, {
      ...examPos,
      duration: 0.85,
      opacity: 1,
      ease: "power2.inOut"
    });
    t.add(() => clickNav("exam"), "+=0.05");
    t.fromTo(
      rippleEl.value,
      { scale: 0, opacity: 0.5 },
      { scale: 2.2, opacity: 0, duration: 0.55, ease: "power2.out" },
      "<"
    );
  }
  t.add(() => activateScene("exam"), "+=0.05");
  // 模拟从左侧拖拽/飞入题目
  examQRefs.value.forEach((q, i) => {
    t.to(q, { x: 10, backgroundColor: "#f0f9ff", duration: 0.3 }, ">-0.1");
    t.add(() => {
      paperQuestions.value.push(examQuestions[i]);
      nextTick(() => {
        const item = paperBodyEl.value?.querySelector(
          ".sd__paperItem:last-child"
        );
        if (item) gsap.from(item, { x: -20, opacity: 0, duration: 0.4 });
      });
    }, "+=0.1");
    t.to(q, { x: 0, backgroundColor: "#fff", duration: 0.2, delay: 0.1 });
  });
  t.to(paperBodyEl.value, {
    backgroundColor: "rgba(74, 144, 226, 0.03)",
    duration: 0.4
  });
  t.add(() =>
    showInsightChip(
      "AI 自动调权完成",
      "已根据知识点权重平衡了 A 卷难度，预测区分度 0.82"
    )
  );
  t.to({}, { duration: 1.6 });

  // ============= 幕 5：虚拟实验 =============
  const vlabPos = moveCursorToNav("vlab");
  t.add(() => hideInsightChip());
  if (vlabPos) {
    t.to(cursorEl.value, {
      ...vlabPos,
      duration: 0.85,
      opacity: 1,
      ease: "power2.inOut"
    });
    t.add(() => clickNav("vlab"), "+=0.05");
    t.fromTo(
      rippleEl.value,
      { scale: 0, opacity: 0.5 },
      { scale: 2.2, opacity: 0, duration: 0.55, ease: "power2.out" },
      "<"
    );
  }
  t.add(() => activateScene("vlab"), "+=0.05");
  // 模拟内核调度动画
  t.to(vlabProcs.value, {
    y: -4,
    repeat: 3,
    yoyo: true,
    duration: 0.2,
    stagger: 0.1
  });
  t.to(
    vlabCpus.value.map(c => c.querySelector(".sd__cpuLoad i")),
    {
      width: () => 40 + Math.random() * 50 + "%",
      stagger: 0.1,
      duration: 0.4
    }
  );
  t.to(
    vlabCpus.value,
    { borderColor: "#7B61FF", stagger: 0.1, duration: 0.2 },
    "<"
  );
  // 控制台打字
  consoleHistory.forEach(line => {
    t.add(() => consoleLines.value.push(line), "+=0.3");
  });
  t.add(() =>
    showInsightChip("实时内核观测", "映射内存地址：0x7ffc... 教学负载平衡中")
  );
  t.to({}, { duration: 2 });

  // ============= 收尾：回到右上 =============
  t.add(() => hideInsightChip());
  t.to(cursorEl.value, { x: startX, y: startY, opacity: 1, duration: 0.6 });
  t.add(() => activateScene("prep"));
  t.to({}, { duration: 0.4 });
};

const clickNav = (key: NavKey) => {
  activeNav.value = key;
};

const manualActivate = (key: NavKey) => {
  tl?.pause();
  paused.value = true;
  clickNav(key);
  activateScene(key);
  hideInsightChip();
  gsap.set(cursorEl.value, { opacity: 0 });
  if (key === "class") {
    lineRefs.value.forEach(l => gsap.set(l, { strokeDashoffset: 0 }));
    gsap.set(studentRefs.value, { scale: 1, opacity: 1 });
  }
};

const activateScene = (key: NavKey) => {
  const map = {
    prep: sceneAEl.value,
    insight: sceneBEl.value,
    class: sceneCEl.value,
    exam: sceneDEl.value,
    vlab: sceneEEl.value
  };
  Object.entries(map).forEach(([k, el]) => {
    if (!el) return;
    el.classList.toggle("sd__scene--hidden", k !== key);
  });
  if (key === "prep") {
    typedTitle.value = "";
    showCaret.value = false;
    gsap.set(prepCardRefs.value, { y: 16, opacity: 0 });
  } else if (key === "insight") {
    barRefs.value.forEach(b => {
      const fill = b.querySelector(".sd__barFill") as HTMLElement | null;
      if (fill) gsap.set(fill, { scaleY: 0 });
    });
    if (radarShapeEl.value) gsap.set(radarShapeEl.value, { scale: 0 });
  } else if (key === "class") {
    lineRefs.value.forEach(l => {
      const len = l.getTotalLength?.() ?? 360;
      gsap.set(l, { strokeDashoffset: len });
    });
    gsap.set(studentRefs.value, { scale: 0.6, opacity: 0 });
  } else if (key === "exam") {
    paperQuestions.value = [];
    gsap.set(examQRefs.value, { x: 0, backgroundColor: "#fff" });
  } else if (key === "vlab") {
    consoleLines.value = [];
    gsap.set(vlabCpus.value, { backgroundColor: "rgb(0 0 0 / 6%)" });
  }
};

let typeTimer: number | null = null;
const typeOut = (text: string) => {
  if (typeTimer) window.clearInterval(typeTimer);
  typedTitle.value = "";
  showCaret.value = true;
  let i = 0;
  typeTimer = window.setInterval(() => {
    i++;
    typedTitle.value = text.slice(0, i);
    if (i >= text.length) {
      if (typeTimer) window.clearInterval(typeTimer);
      typeTimer = null;
      window.setTimeout(() => (showCaret.value = false), 600);
    }
  }, 38);
};

const showInsightChip = (title: string, desc: string) => {
  insight.title = title;
  insight.desc = desc;
  showInsight.value = true;
};
const hideInsightChip = () => {
  showInsight.value = false;
};

/* ------------ 生命周期 ------------ */
const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

onMounted(async () => {
  if (reduceMotion()) {
    activeNav.value = "prep";
    typedTitle.value = FULL_TITLE;
    return;
  }

  await nextTick();
  buildTimeline();

  // 当滚动到舞台时启动；离开视口暂停
  if (typeof IntersectionObserver !== "undefined" && rootEl.value) {
    io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            paused.value = false;
            tl?.resume();
          } else {
            paused.value = true;
            tl?.pause();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(rootEl.value);
  }

  window.addEventListener("resize", onResize);
});

let resizeTimer: number | null = null;
const onResize = () => {
  if (resizeTimer) window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    // 重新构建以适配新尺寸下的鼠标坐标
    buildTimeline();
  }, 200);
};

onBeforeUnmount(() => {
  tl?.kill();
  io?.disconnect();
  window.removeEventListener("resize", onResize);
  if (typeTimer) window.clearInterval(typeTimer);
});
</script>

<style lang="scss" scoped>
@use "sass:math";

$bg: #fafaf9;
$border: #e8e5df;
$text: #191918;
$muted: #5f5e5b;
$faint: #91908d;

.sd {
  position: relative;
  padding: 96px 32px;
  background: $bg;

  &__head {
    max-width: 920px;
    margin: 0 auto 18px;
    text-align: center;
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
    color: $muted;
    letter-spacing: 0;
  }

  &__stage {
    position: relative;
    max-width: 1180px;
    margin: 0 auto;
    overflow: hidden;
    background: #fff;
    border: 1px solid $border;
    border-radius: 16px;
    box-shadow:
      0 1px 2px rgb(0 0 0 / 4%),
      0 32px 80px rgb(0 0 0 / 10%),
      inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    aspect-ratio: 16 / 12;
    cursor: default;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(
          circle at 0% 0%,
          rgba(123, 97, 255, 0.03) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 100% 100%,
          rgba(74, 144, 226, 0.03) 0%,
          transparent 50%
        );
      pointer-events: none;
    }
  }

  &__chrome {
    display: flex;
    flex: 0 0 auto;
    gap: 12px;
    align-items: center;
    height: 40px;
    padding: 0 14px;
    background: rgb(0 0 0 / 3%);
    border-bottom: 1px solid $border;
  }

  &__lights {
    display: flex;
    gap: 6px;

    span {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: rgb(0 0 0 / 14%);

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

  &__url {
    display: inline-flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    justify-content: center;
    height: 24px;
    max-width: 360px;
    margin: 0 auto;
    padding: 0 12px;
    font-size: 11.5px;
    color: rgb(0 0 0 / 55%);
    background: rgb(255 255 255 / 70%);
    border: 1px solid rgb(0 0 0 / 6%);
    border-radius: 999px;
  }

  &__chip {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 10px;
    font-size: 11.5px;
    font-weight: 600;
    color: #047857;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.28);
    border-radius: 999px;
  }

  &__chipDot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    animation: sd-pulse 1.6s ease-out infinite;
  }

  &__body {
    position: relative;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    flex: 1;
    height: calc(100% - 40px);
  }

  &__side {
    display: flex;
    flex-direction: column;
    padding: 16px 10px;
    background: $bg;
    border-right: 1px solid $border;
    overflow: hidden;
  }

  &__sideHead {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 10px 14px;
    font-size: 14px;
    font-weight: 600;
    color: $text;
  }

  &__brandSquare {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #111, #444);
    border-radius: 5px;
  }

  &__sideGroup {
    margin: 8px 0 6px;
    padding: 0 10px;
    font-size: 11px;
    font-weight: 500;
    color: $faint;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__navItem {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 2px;
    font: inherit;
    font-size: 13.5px;
    font-weight: 500;
    color: $text;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
    opacity: 0.8;
    transition:
      background 0.18s,
      opacity 0.18s;

    .sd__navIcon {
      display: inline-grid;
      place-items: center;
      width: 16px;
      height: 16px;
      color: $muted;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    &.is-active {
      background: rgb(0 0 0 / 6%);
      opacity: 1;
    }
  }

  &__main {
    position: relative;
    padding: 32px 40px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__crumbs {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 24px;
    font-size: 13px;
    color: $faint;
    flex: 0 0 auto;
    width: 100%;

    span:last-child {
      color: $text;
      font-weight: 600;
    }
  }

  &__tbActions {
    margin-left: auto;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__tbBadge {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #047857;
    background: rgba(16, 185, 129, 0.12);
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  &__tbDot {
    width: 4px;
    height: 4px;
    background: #10b981;
    border-radius: 50%;
    animation: sd-pulse 2s infinite;
  }

  &__tbBtn {
    font-size: 12px;
    font-weight: 600;
    color: $text;
    background: #fff;
    border: 1px solid $border;
    padding: 4px 12px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  &__scene {
    flex: 1 1 auto;
    position: relative;
    inset: auto;
    transition: opacity 0.4s ease;
    opacity: 1;

    &--hidden {
      opacity: 0;
      position: absolute; /* Hide completely from flow */
      pointer-events: none;
    }
  }

  &__sceneHead {
    margin-bottom: 32px;
  }

  &__sceneTitle {
    margin: 0 0 10px;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: $text;
    min-height: 32px;
  }

  &__caret {
    display: inline-block;
    width: 2px;
    height: 18px;
    margin-left: 2px;
    background: $text;
    vertical-align: -3px;
    animation: sd-caret 1s steps(2) infinite;
  }

  &__sceneLede {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.5;
    color: $muted;
  }

  &__sceneHeadMain {
    display: flex;
    flex-direction: column;
  }

  &__sceneHead {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }

  &__kpiGrid {
    display: flex;
    gap: 16px;
    background: rgba(0, 0, 0, 0.02);
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }

  &__kpi {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.06);

    &:last-child {
      padding-right: 0;
      border-right: 0;
    }
  }

  &__kpiLabel {
    font-size: 11px;
    color: $muted;
  }

  &__kpiVal {
    font-size: 18px;
    font-weight: 800;
    color: $text;
    line-height: 1;

    &.text-danger {
      color: #e85847;
    }
    small {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.6;
    }
  }

  &__kpiTrend {
    font-size: 10px;
    font-weight: 600;
    &.up {
      color: #10b981;
    }
    &.down {
      color: #e85847;
    }
    &.neutral {
      color: $muted;
    }
  }

  &__sceneMeta {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 14px;
    font-size: 11.5px;
    font-weight: 600;
    color: $muted;

    .divider {
      width: 1px;
      height: 10px;
      background: $border;
    }
  }

  /* ----- Cards / Prep Timeline ----- */
  &__cards {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    margin-top: 16px;
  }

  &__timelineTrack {
    position: absolute;
    top: 24px;
    left: 40px;
    right: 40px;
    height: 2px;
    background: rgba(0, 0, 0, 0.06);
    z-index: 0;
  }

  &__card--node {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
  }

  &__timelineDot {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow:
      0 0 0 4px #fff,
      0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &__cardFoot {
    margin-top: auto;
    padding-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__cardAvatars {
    display: flex;
    img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1px solid #fff;
      background: #f0f0f0;
      margin-left: -6px;
      &:first-child {
        margin-left: 0;
      }
    }
  }

  &__cardBarWrap {
    flex: 1;
  }

  &__card {
    padding: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(232, 229, 223, 0.6);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

    &:hover {
      border-color: rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
    }

    h4 {
      margin: 8px 0 4px;
      font-size: 14.5px;
      font-weight: 700;
      color: $text;
      line-height: 1.3;
    }

    p {
      margin: 0 0 12px;
      font-size: 12.5px;
      line-height: 1.5;
      color: $muted;
    }
  }

  /* ----- Class Live Stats ----- */
  &__liveOverlay {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(123, 97, 255, 0.2);
    padding: 10px 14px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__livePulse {
    width: 8px;
    height: 8px;
    background: #ff5f57;
    border-radius: 50%;
    animation: sd-pulse 1.5s infinite;
  }

  &__liveStats {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 12px;

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .val {
      font-size: 15px;
      font-weight: 800;
      color: $text;
    }
    .lbl {
      font-size: 10px;
      color: $muted;
      font-weight: 600;
      text-transform: uppercase;
    }
  }

  &__cardTop {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  &__cardTag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 999px;
  }

  &__cardMeta {
    font-size: 11px;
    color: $faint;
  }

  &__cardBar {
    height: 4px;
    overflow: hidden;
    background: rgb(0 0 0 / 6%);
    border-radius: 2px;

    i {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, #111, #5f5e5b);
      border-radius: 2px;
      transition: width 0.6s ease;
    }
  }

  /* ----- Bars + Radar ----- */
  &__chartRow {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) 220px;
    gap: 40px;
    align-items: center;
    height: calc(100% - 100px);
    background-image: radial-gradient(
      circle at 2px 2px,
      rgba(0, 0, 0, 0.03) 1px,
      transparent 0
    );
    background-size: 24px 24px;
    padding: 20px;
    border-radius: 12px;
  }

  &__bars {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
    align-items: end;
    height: 100%;
    position: relative;
    padding-bottom: 24px;

    &::after {
      content: "";
      position: absolute;
      bottom: 24px;
      left: 0;
      right: 0;
      height: 1px;
      background: $border;
    }
  }

  &__bar {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
  }

  &__barFill {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 4px 4px 0 0;
  }

  &__barLabel {
    margin-top: 8px;
    font-size: 12px;
    color: $muted;
  }

  &__radar {
    width: 100%;
    height: auto;
    align-self: center;
  }

  /* ----- Class ----- */
  &__class {
    position: relative;
    display: grid;
    grid-template-columns: 180px minmax(280px, 1fr) 168px;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 14px;
    height: calc(100% - 92px);
    min-height: 350px;
    padding: 14px;
    overflow: hidden;
    background:
      linear-gradient(#fff, #fff) padding-box,
      linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(16, 185, 129, 0.28))
        border-box;
    border: 1px solid transparent;
    border-radius: 14px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
  }

  &__classLines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__teacherPanel,
  &__featureGrid,
  &__topology,
  &__student {
    min-width: 0;
    background: rgba(255, 255, 255, 0.84);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  }

  &__teacherPanel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  &__teacherTop {
    display: flex;
    gap: 10px;
    align-items: center;

    strong {
      display: block;
      font-size: 13px;
      font-weight: 800;
      color: $text;
    }

    small {
      font-size: 10px;
      color: $faint;
    }
  }

  &__promptCard {
    padding: 12px;
    background: #fafaf9;
    border: 1px solid $border;
    border-radius: 10px;

    span {
      display: block;
      margin-bottom: 6px;
      font-size: 10.5px;
      font-weight: 700;
      color: $faint;
      text-transform: uppercase;
    }

    strong {
      display: block;
      font-size: 13px;
      line-height: 1.35;
      color: $text;
    }
  }

  &__miniMeters {
    display: grid;
    gap: 10px;
  }

  &__miniMeter {
    display: grid;
    gap: 6px;

    div {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: $muted;
    }

    b {
      color: $text;
      font-weight: 800;
    }

    i {
      display: block;
      height: 5px;
      border-radius: 999px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }

  &__stackMini {
    display: flex;
    gap: 6px;
    margin-top: auto;

    span {
      padding: 4px 7px;
      font-size: 10px;
      font-weight: 800;
      color: #292524;
      background: #f5f5f4;
      border: 1px solid $border;
      border-radius: 999px;
    }
  }

  &__topology {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 2px 2px, rgba(0, 0, 0, 0.055) 1px, transparent 0),
      #fff;
    background-size: 22px 22px;
  }

  &__topologyTop {
    position: absolute;
    top: 12px;
    left: 14px;
    right: 14px;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 10.5px;
    color: $faint;

    strong {
      color: $muted;
      font-weight: 800;
    }
  }

  &__topologyCanvas {
    position: absolute;
    inset: 26px 10px 10px;
  }

  &__topologyNode {
    position: absolute;
    z-index: 2;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 7px;
    align-items: center;
    width: 118px;
    padding: 8px 9px;
    color: $text;
    background: rgba(255, 255, 255, 0.93);
    border: 1px solid color-mix(in srgb, var(--node) 28%, transparent);
    border-radius: 11px;
    box-shadow:
      0 12px 28px color-mix(in srgb, var(--node) 13%, transparent),
      inset 0 0 0 1px rgba(255, 255, 255, 0.8);
    transform: translate(-50%, -50%);

    span {
      display: grid;
      grid-row: span 2;
      place-items: center;
      width: 28px;
      height: 28px;
      font-size: 10px;
      font-weight: 900;
      color: #fff;
      background: var(--node);
      border-radius: 8px;
    }

    strong {
      overflow: hidden;
      font-size: 11.5px;
      font-weight: 800;
      line-height: 1.1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      font-size: 10px;
      color: $faint;
    }

    &--root {
      width: 130px;
      padding: 10px;
    }

    &--hot {
      animation: sd-node-hot 1.8s ease-in-out infinite;
    }
  }

  &__featureGrid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  &__featureTile {
    display: grid;
    align-content: center;
    gap: 5px;
    min-height: 74px;
    padding: 11px;
    border: 1px solid color-mix(in srgb, var(--tile) 20%, transparent);
    border-radius: 12px;
    box-shadow: 0 8px 20px color-mix(in srgb, var(--tile) 10%, transparent);

    span {
      width: fit-content;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 900;
      color: var(--tile);
      background: rgba(255, 255, 255, 0.72);
      border-radius: 999px;
    }

    strong {
      font-size: 13px;
      font-weight: 850;
      color: $text;
    }

    small {
      font-size: 11px;
      color: $muted;
    }
  }

  &__responseDock {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  /* ----- Exam ----- */
  &__exam {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 20px;
    height: calc(100% - 80px);
  }

  &__examBank {
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
    border: 1px dashed rgba(0, 0, 0, 0.1);
  }

  &__labelBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__label {
    margin: 0;
    font-size: 11px;
    font-weight: 700;
    color: $muted;
    text-transform: uppercase;
  }

  &__filter {
    font-size: 10px;
    background: #e0e7ff;
    color: #3b82f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  }

  &__examQ {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 14px;
    margin-bottom: 10px;
    background: #fff;
    border: 1px solid $border;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

    span {
      flex: 0 0 auto;
      padding: 4px 6px;
      font-size: 10px;
      font-weight: 600;
      border-radius: 4px;

      &.t-err {
        background: #fee2e2;
        color: #e11d48;
      }
      &.t-blind {
        background: #ffedd5;
        color: #d97706;
      }
      &.t-extend {
        background: #dcfce7;
        color: #059669;
      }
    }
  }

  &__examQText {
    display: flex;
    flex-direction: column;
    gap: 6px;

    strong {
      font-size: 13px;
      color: $text;
      line-height: 1.4;
    }
  }

  &__examQMeta {
    font-size: 10px;
    color: $faint;
    font-family: "JetBrains Mono", monospace;
  }

  &__examPaper {
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  &__paperBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #f8fafc;
    border-bottom: 1px solid $border;
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
  }

  &__paperStats {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
  }

  &__student {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
    min-height: 64px;
    padding: 10px 10px 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
  }

  &__studentBody {
    min-width: 0;

    strong,
    span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 12px;
      font-weight: 850;
      color: $text;
    }

    span {
      margin-top: 3px;
      font-size: 10.5px;
      color: $faint;
    }
  }

  &__studentMeter {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 999px;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    font-size: 13.5px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #7b61ff, #4a90e2);
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(123, 97, 255, 0.35);

    &--0 {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
    }
    &--1 {
      background: linear-gradient(135deg, #10b981, #34d399);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
    }
    &--2 {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
    }
    &--3 {
      background: linear-gradient(135deg, #ec4899, #f43f5e);
      box-shadow: 0 2px 8px rgba(236, 72, 153, 0.35);
    }

    &--teacher {
      width: 48px;
      height: 48px;
      margin: 0 auto;
      font-size: 16px;
      background: linear-gradient(135deg, #111, #444);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }
  }

  &__bubble {
    font-size: 12px;
    font-weight: 600;
    color: $text;
    white-space: nowrap;
  }

  /* ----- Exam ----- */
  &__exam {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 20px;
    height: calc(100% - 80px);
  }

  &__examBank {
    padding: 12px;
    background: $bg;
    border-radius: 12px;
    border: 1px dashed $border;
  }

  &__label {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 600;
    color: $faint;
    text-transform: uppercase;
  }

  &__examQ {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px;
    margin-bottom: 8px;
    background: #fff;
    border: 1px solid $border;
    border-radius: 8px;
    font-size: 12.5px;

    span {
      flex: 0 0 auto;
      padding: 2px 6px;
      font-size: 10px;
      background: $bg;
      border-radius: 4px;
    }

    strong {
      font-weight: 500;
    }
  }

  &__examPaper {
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
    overflow: hidden;
  }

  &__paperBar {
    padding: 10px 16px;
    background: $bg;
    border-bottom: 1px solid $border;
    font-size: 13px;
    font-weight: 600;
  }

  &__paperBody {
    padding: 16px;
  }

  &__paperPlaceholder {
    font-size: 13px;
    color: $faint;
    text-align: center;
    padding: 40px 0;
  }

  &__paperItem {
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__paperNum {
    font-weight: 700;
    margin-right: 4px;
  }

  /* ----- Vlab ----- */
  &__vlab {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    height: calc(100% - 80px);
  }

  &__vlabSys {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__linuxKernel {
    flex: 1;
    padding: 20px;
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 14px;
    color: #4ade80;
    font-family: "JetBrains Mono", monospace;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
  }

  &__osLabel {
    font-size: 11px;
    margin-bottom: 16px;
    opacity: 0.5;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  &__osProc {
    display: flex;
    gap: 10px;
  }

  &__procItem {
    padding: 6px 12px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    font-size: 11px;
    color: #aaa;
    transition: all 0.3s;
  }

  &__hardware {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid $border;
    border-radius: 12px;
  }

  &__cpuCore {
    height: 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 10px;
    font-size: 10px;
    font-weight: 600;
    background: #fff;
    border: 1px solid $border;
    border-radius: 8px;
    color: $muted;
    transition: all 0.3s;
  }

  &__cpuLabel {
    margin-bottom: 4px;
    font-size: 9px;
    opacity: 0.6;
  }

  &__cpuLoad {
    height: 3px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 1px;
    overflow: hidden;

    i {
      display: block;
      height: 100%;
      width: 0%;
      background: #7b61ff;
      transition: width 0.3s;
    }
  }

  &__vlabWaves {
    display: flex;
    gap: 3px;
    align-items: flex-end;
    height: 20px;
    margin-top: 20px;

    span {
      width: 3px;
      background: #4ade80;
      opacity: 0.4;
      border-radius: 1px;
      animation: sd-wave 1s ease-in-out infinite;

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          height: 30% + math.random(60);
          animation-delay: $i * 0.1s;
        }
      }
    }
  }

  &__consoleDot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 6px;
    background: #ff5f57;
    border-radius: 50%;
  }

  &__vlabConsole {
    background: #1e1e1e;
    border-radius: 12px;
    overflow: hidden;
    color: #fff;
    font-family: "JetBrains Mono", monospace;
  }

  &__consoleHead {
    padding: 8px 12px;
    background: #2d2d2d;
    font-size: 11px;
    border-bottom: 1px solid #3d3d3d;
  }

  &__consoleLines {
    padding: 12px;
    font-size: 11px;
    line-height: 1.6;

    p {
      margin: 0;
      color: #aaa;
    }
    p:last-child {
      color: #fff;
    }
  }

  /* ----- Common Layout for scenes ----- */
  .sd__scene {
    display: flex;
    flex-direction: column;
  }

  /* ----- Insight chip ----- */
  &__insight {
    position: absolute;
    top: 76px;
    right: 20px;
    z-index: 4;
    width: 220px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid $border;
    border-radius: 10px;
    box-shadow:
      0 4px 14px rgb(0 0 0 / 6%),
      0 12px 32px rgb(0 0 0 / 8%);

    strong {
      display: block;
      margin: 6px 0 4px;
      font-size: 13.5px;
      color: $text;
    }

    p {
      margin: 0;
      font-size: 11.5px;
      line-height: 1.45;
      color: $muted;
    }
  }

  &__insightTag {
    display: inline-block;
    padding: 2px 8px;
    font-size: 10.5px;
    font-weight: 600;
    color: #1d4ed8;
    background: rgba(74, 144, 226, 0.14);
    border-radius: 999px;
  }

  /* ----- Cursor ----- */
  &__cursor {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    pointer-events: none;
    filter: drop-shadow(0 4px 8px rgb(0 0 0 / 18%));
    will-change: transform;
  }

  &__ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 26px;
    height: 26px;
    background: rgba(0, 0, 0, 0.14);
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    pointer-events: none;
  }

  /* ----- Pause overlay (subtle) ----- */
  &__stage.is-paused::after {
    position: absolute;
    inset: 0;
    z-index: 20;
    pointer-events: none;
    content: "";
    background: rgba(255, 255, 255, 0.02);
  }
}

.sd-pop-enter-active,
.sd-pop-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sd-pop-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.9);
}

.sd-pop-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

@keyframes sd-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

@keyframes sd-caret {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes sd-wave {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.4);
  }
}

@keyframes sd-node-hot {
  0%,
  100% {
    box-shadow:
      0 12px 28px rgba(244, 63, 94, 0.12),
      0 0 0 0 rgba(244, 63, 94, 0.28);
  }
  50% {
    box-shadow:
      0 14px 34px rgba(244, 63, 94, 0.2),
      0 0 0 8px rgba(244, 63, 94, 0);
  }
}

@media (max-width: 900px) {
  .sd {
    padding: 72px 18px;
  }
  .sd__stage {
    aspect-ratio: auto;
    min-height: 820px;
  }
  .sd__body {
    grid-template-columns: 1fr;
  }
  .sd__side {
    display: none;
  }
  .sd__main {
    padding: 18px;
  }
  .sd__crumbs {
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 18px;
    font-size: 12px;
  }
  .sd__tbActions {
    width: 100%;
    margin-left: 0;
    gap: 8px;
    justify-content: space-between;
  }
  .sd__tbBadge {
    min-width: 0;
    font-size: 9px;
  }
  .sd__tbBtn {
    flex: 0 0 auto;
    padding: 4px 10px;
    white-space: nowrap;
  }
  .sd__sceneTitle {
    min-height: auto;
    font-size: 22px;
    line-height: 1.2;
  }
  .sd__sceneLede {
    font-size: 12.5px;
  }
  .sd__cards {
    grid-template-columns: 1fr;
  }
  .sd__chartRow {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .sd__radar {
    display: none;
  }
  .sd__insight {
    right: 12px;
    top: 60px;
    width: 180px;
  }
  .sd__sceneHead {
    gap: 12px;
    flex-direction: column;
    margin-bottom: 20px;
  }
  .sd__liveOverlay {
    width: 100%;
    justify-content: space-between;
    padding: 8px 10px;
  }
  .sd__liveStats {
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .sd__liveStats .val {
    font-size: 13px;
  }
  .sd__liveStats .lbl {
    font-size: 9px;
  }
  .sd__class {
    grid-template-columns: 1fr;
    grid-template-rows: auto 280px auto;
    height: auto;
    min-height: 0;
  }
  .sd__teacherPanel {
    display: grid;
    grid-template-columns: 1fr;
  }
  .sd__featureGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sd__responseDock {
    grid-template-columns: 1fr;
  }
  .sd__student {
    min-height: 56px;
  }
  .sd__featureTile {
    min-height: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sd__cursor,
  .sd__caret {
    display: none;
  }
}
</style>

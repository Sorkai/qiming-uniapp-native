<template>
  <section class="sd" aria-label="启明智教 · 智能工作流演示">
    <header class="sd__head">
      <p class="sd__eyebrow">智能工作流 · Scripted Demo</p>
      <h2 class="sd__title">从一次点击，看见教学如何流动。</h2>
      <p class="sd__sub">
        鼠标自己点开备课、学情和课堂，工作台像一条流水线把每一步串起来。
      </p>
    </header>

    <div ref="rootEl" class="sd__stage" :class="{ 'is-paused': paused }">
      <!-- 舞台：浏览器外框 -->
      <div class="sd__chrome">
        <div class="sd__lights">
          <span /><span /><span />
        </div>
        <div class="sd__url">
          <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
            <path d="M12 1 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z"
              fill="none" stroke="currentColor" stroke-width="1.6"
              stroke-linejoin="round" />
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
          </div>

          <!-- 场景 1：AI 备课 -->
          <div ref="sceneAEl" class="sd__scene" data-scene="prep">
            <div class="sd__sceneHead">
              <h3 ref="sceneATitle" class="sd__sceneTitle">
                <span class="sd__typed">{{ typedTitle }}</span>
                <i v-if="showCaret" class="sd__caret" />
              </h3>
              <p class="sd__sceneLede">
                AI 已经按本节课的目标，把章节、资源、互动环节自动排好了。
              </p>
            </div>

            <div ref="cardsEl" class="sd__cards">
              <article
                v-for="(c, i) in prepCards"
                :key="c.title"
                ref="prepCardRefs"
                class="sd__card"
                :data-i="i"
              >
                <div class="sd__cardTop">
                  <span class="sd__cardTag" :style="{ background: c.tagBg, color: c.tagFg }">
                    {{ c.tag }}
                  </span>
                  <span class="sd__cardMeta">{{ c.meta }}</span>
                </div>
                <h4>{{ c.title }}</h4>
                <p>{{ c.desc }}</p>
                <div class="sd__cardBar">
                  <i :style="{ width: c.progress + '%' }" />
                </div>
              </article>
            </div>
          </div>

          <!-- 场景 2：学情 -->
          <div ref="sceneBEl" class="sd__scene sd__scene--hidden" data-scene="insight">
            <div class="sd__sceneHead">
              <h3 class="sd__sceneTitle">学情看板 · 自动生成</h3>
              <p class="sd__sceneLede">
                根据本周练习数据，AI 标出了 3 个薄弱知识点。
              </p>
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
                  <span class="sd__barFill" :style="{ background: b.color }" />
                  <span class="sd__barLabel">{{ b.label }}</span>
                </div>
              </div>

              <svg ref="radarEl" class="sd__radar" viewBox="0 0 200 200" aria-hidden="true">
                <g transform="translate(100 100)">
                  <polygon
                    v-for="r in [80, 60, 40, 20]"
                    :key="r"
                    :points="polygonPoints(r)"
                    fill="none"
                    stroke="rgba(0,0,0,0.08)"
                    stroke-width="1"
                  />
                  <line
                    v-for="(p, i) in polygonAxes"
                    :key="i"
                    x1="0" y1="0" :x2="p.x" :y2="p.y"
                    stroke="rgba(0,0,0,0.06)"
                  />
                  <polygon
                    ref="radarShapeEl"
                    :points="radarShape"
                    fill="rgba(74,144,226,0.18)"
                    stroke="#4A90E2"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </g>
              </svg>
            </div>
          </div>

          <!-- 场景 3：课堂互动 -->
          <div ref="sceneCEl" class="sd__scene sd__scene--hidden" data-scene="class">
            <div class="sd__sceneHead">
              <h3 class="sd__sceneTitle">课堂互动 · 实时连接</h3>
              <p class="sd__sceneLede">
                老师发起的提问，瞬间触达每一名同学。
              </p>
            </div>

            <div class="sd__class">
              <svg class="sd__classLines" viewBox="0 0 600 280" aria-hidden="true">
                <line
                  v-for="(l, i) in classLines"
                  :key="i"
                  ref="lineRefs"
                  :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
                  stroke="#7B61FF"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-dasharray="4 4"
                />
              </svg>
              <div class="sd__teacher">
                <span class="sd__avatar sd__avatar--teacher">师</span>
                <strong>张老师</strong>
                <p>关于二叉树，谁能解释一下平衡条件？</p>
              </div>
              <div
                v-for="(s, i) in students"
                :key="s.name"
                ref="studentRefs"
                class="sd__student"
                :style="{ left: s.x + 'px', top: s.y + 'px' }"
                :data-i="i"
              >
                <span class="sd__avatar">{{ s.name.charAt(0) }}</span>
                <span class="sd__bubble">{{ s.reply }}</span>
              </div>
            </div>
          </div>

          <!-- 场景 4：智能组卷 -->
          <div ref="sceneDEl" class="sd__scene sd__scene--hidden" data-scene="exam">
            <div class="sd__sceneHead">
              <h3 class="sd__sceneTitle">AI 智能组卷</h3>
              <p class="sd__sceneLede">
                选择知识点与难度，AI 瞬时从 10 万题库中提取最佳题目。
              </p>
            </div>
            <div class="sd__exam">
              <div class="sd__examBank">
                <p class="sd__label">智能题库汇聚</p>
                <div v-for="q in examQuestions" :key="q.id" class="sd__examQ" ref="examQRefs" :data-id="q.id">
                  <span>{{ q.type }}</span>
                  <strong>{{ q.title }}</strong>
                </div>
              </div>
              <div class="sd__examPaper">
                <div class="sd__paperBar">期中测验试卷 · A 卷</div>
                <div class="sd__paperBody" ref="paperBodyEl">
                  <div class="sd__paperPlaceholder" v-if="!paperQuestions.length">点击左侧或 AI 自动推题...</div>
                  <div v-for="q in paperQuestions" :key="q.id" class="sd__paperItem">
                    <span class="sd__paperNum">{{ paperQuestions.indexOf(q) + 1 }}.</span>
                    {{ q.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 场景 5：虚拟实验 -->
          <div ref="sceneEEl" class="sd__scene sd__scene--hidden" data-scene="vlab">
            <div class="sd__sceneHead">
              <h3 class="sd__sceneTitle">虚拟仿真实验室</h3>
              <p class="sd__sceneLede">
                突破硬件限制，在浏览器中观察操作系统内核级调用。
              </p>
            </div>
            <div class="sd__vlab">
              <div class="sd__vlabSys">
                <div class="sd__linuxKernel" ref="vlabKernel">
                  <div class="sd__osLabel">Linux Kernel</div>
                  <div class="sd__osProc">
                    <div v-for="i in 3" :key="i" class="sd__procItem" ref="vlabProcs">Proc {{ i }}</div>
                  </div>
                </div>
                <div class="sd__hardware" ref="vlabHardware">
                  <div v-for="i in 4" :key="i" class="sd__cpuCore" ref="vlabCpus">Core {{ i }}</div>
                </div>
              </div>
              <div class="sd__vlabConsole">
                <div class="sd__consoleHead">Kernel Debug Console</div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

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
    title: "情境引入：嵌入式 Linux 在生活中",
    desc: "用智能家居案例切入，引出本节核心问题。",
    progress: 100
  },
  {
    tag: "讲解",
    tagBg: "rgba(74,144,226,0.18)",
    tagFg: "#1d4ed8",
    meta: "10:05 · 18min",
    title: "进程与线程的本质差异",
    desc: "图示 + 现场演示 fork() 与 pthread_create()。",
    progress: 78
  },
  {
    tag: "练习",
    tagBg: "rgba(16,185,129,0.18)",
    tagFg: "#047857",
    meta: "10:23 · 12min",
    title: "课堂随练 · 3 道选择 + 1 道编程",
    desc: "AI 已根据上节错题自动调整难度。",
    progress: 42
  }
];

const bars = [
  { label: "进程", value: 86, color: "#10B981" },
  { label: "线程", value: 72, color: "#10B981" },
  { label: "调度", value: 48, color: "#F59E0B" },
  { label: "同步", value: 35, color: "#E85847" },
  { label: "信号", value: 90, color: "#10B981" }
];

const radarValues = [0.85, 0.62, 0.45, 0.78, 0.55, 0.88];
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

const students = [
  { name: "明", reply: "左右子树高度差 ≤ 1", x: 60, y: 30 },
  { name: "妍", reply: "递归判断每个子树", x: 460, y: 30 },
  { name: "宇", reply: "用 DFS 后序遍历", x: 60, y: 200 },
  { name: "涵", reply: "高度差超过就返回 -1", x: 460, y: 200 }
];
const classLines = [
  { x1: 300, y1: 140, x2: 110, y2: 60 },
  { x1: 300, y1: 140, x2: 510, y2: 60 },
  { x1: 300, y1: 140, x2: 110, y2: 230 },
  { x1: 300, y1: 140, x2: 510, y2: 230 }
];

const examQuestions = [
  { id: 1, type: "单选", title: "Linux 进程的基本状态有哪些？" },
  { id: 2, type: "多选", title: "关于 pthread_mutex，描述正确的是？" },
  { id: 3, type: "填空", title: "系统调用的入口函数是 ____。" }
];

const consoleHistory = [
  "[ 0.000] Initializing scheduler...",
  "[ 0.124] CPU: 4 cores detected",
  "[ 0.450] Process 1 started: /sbin/init",
  "[ 1.200] Mapping memory addresses...",
  "[ 2.100] Waiting for signal interrupts..."
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
const lineRefs = ref<SVGLineElement[]>([]);
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
    showInsightChip("学习效率 +18%", "AI 标出 3 个薄弱知识点：调度 · 同步 · 信号")
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
    t.to(cursorEl.value, { ...examPos, duration: 0.85, opacity: 1, ease: "power2.inOut" });
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
    t.add(() => paperQuestions.value.push(examQuestions[i]), "+=0.1");
    t.from(".sd__paperItem:last-child", { x: -20, opacity: 0, duration: 0.4 }, "<");
  });
  t.add(() => showInsightChip("生成预览试卷", "AI 已根据知识点权重平衡了 A 卷难度"));
  t.to({}, { duration: 1.6 });

  // ============= 幕 5：虚拟实验 =============
  const vlabPos = moveCursorToNav("vlab");
  t.add(() => hideInsightChip());
  if (vlabPos) {
    t.to(cursorEl.value, { ...vlabPos, duration: 0.85, opacity: 1, ease: "power2.inOut" });
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
  t.to(vlabProcs.value, { x: 10, repeat: 3, yoyo: true, duration: 0.2 });
  t.to(vlabCpus.value, { backgroundColor: "#7B61FF", stagger: 0.1, duration: 0.2 });
  // 控制台打字
  consoleHistory.forEach((line) => {
    t.add(() => consoleLines.value.push(line), "+=0.3");
  });
  t.add(() => showInsightChip("实时内核观测", "映射内存地址：0x7ffc... 系统调用正常"));
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
  // eslint-disable-next-line no-console
  console.log("[SD] mounted, reduceMotion =", reduceMotion(), "cards =", prepCardRefs.value.length, "cursor =", !!cursorEl.value);
  if (reduceMotion()) {
    activeNav.value = "prep";
    typedTitle.value = FULL_TITLE;
    return;
  }

  await nextTick();
  buildTimeline();
  // eslint-disable-next-line no-console
  console.log("[SD] timeline built, paused?", tl?.paused());

  // 当滚动到舞台时启动；离开视口暂停
  if (typeof IntersectionObserver !== "undefined" && rootEl.value) {
    io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          // eslint-disable-next-line no-console
          console.log("[SD] IO", e.isIntersecting, "ratio", e.intersectionRatio.toFixed(2));
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
    margin: 0 auto 48px;
    text-align: center;
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
    color: $muted;
    letter-spacing: 0.02em;
  }

  &__title {
    margin: 0;
    font-size: clamp(30px, 3.6vw, 42px);
    font-weight: 700;
    line-height: 1.18;
    letter-spacing: -0.024em;
    color: $text;
  }

  &__sub {
    max-width: 540px;
    margin: 14px auto 0;
    font-size: 16px;
    line-height: 1.55;
    color: $muted;
  }

  &__stage {
    position: relative;
    max-width: 1180px;
    margin: 0 auto;
    overflow: hidden;
    background: #fff;
    border: 1px solid $border;
    border-radius: 14px;
    box-shadow:
      0 1px 2px rgb(0 0 0 / 4%),
      0 24px 60px rgb(0 0 0 / 8%);
    aspect-ratio: 16 / 10;
    cursor: default;
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

      &:nth-child(1) { background: #ff5f57; }
      &:nth-child(2) { background: #febc2e; }
      &:nth-child(3) { background: #28c840; }
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
    transition: background 0.18s, opacity 0.18s;

    .sd__navIcon {
      display: inline-grid;
      place-items: center;
      width: 16px;
      height: 16px;
      color: $muted;

      svg { width: 16px; height: 16px; }
    }

    &.is-active {
      background: rgb(0 0 0 / 6%);
      opacity: 1;
    }
  }

  &__main {
    position: relative;
    padding: 24px 32px;
    overflow: hidden;
  }

  &__crumbs {
    display: flex;
    gap: 6px;
    margin-bottom: 14px;
    font-size: 12.5px;
    color: $faint;

    span:last-child { color: $muted; font-weight: 500; }
  }

  &__scene {
    position: absolute;
    inset: 24px 32px;
    transition: opacity 0.4s ease;
    opacity: 1;

    &--hidden {
      opacity: 0;
      pointer-events: none;
    }
  }

  &__sceneHead {
    margin-bottom: 20px;
  }

  &__sceneTitle {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.018em;
    color: $text;
    min-height: 28px;
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

  /* ----- Cards ----- */
  &__cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  &__card {
    padding: 16px;
    background: #fff;
    border: 1px solid $border;
    border-radius: 10px;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: rgb(0 0 0 / 18%);
      box-shadow: 0 4px 14px rgb(0 0 0 / 5%);
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
    grid-template-columns: minmax(0, 1.4fr) 200px;
    gap: 32px;
    align-items: end;
    height: calc(100% - 80px);
  }

  &__bars {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
    align-items: end;
    height: 100%;
    padding: 12px 0;
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
    height: calc(100% - 80px);
  }

  &__classLines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__teacher {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200px;
    padding: 14px 16px;
    text-align: center;
    background: #fff;
    border: 1px solid $border;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 6%);
    transform: translate(-50%, -50%);

    strong {
      display: block;
      margin: 8px 0 4px;
      font-size: 13px;
    }

    p {
      margin: 0;
      font-size: 11.5px;
      line-height: 1.4;
      color: $muted;
    }
  }

  &__student {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
  }

  &__avatar {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #7B61FF, #4A90E2);
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgb(123 97 255 / 35%);

    &--teacher {
      width: 44px;
      height: 44px;
      margin: 0 auto;
      font-size: 15px;
      background: linear-gradient(135deg, #111, #444);
    }
  }

  &__bubble {
    margin-top: 6px;
    padding: 4px 8px;
    font-size: 10.5px;
    color: $text;
    background: #fff;
    border: 1px solid $border;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 4%);
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

    strong { font-weight: 500; }
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
    border-bottom: 1px solid rgba(0,0,0,0.03);

    &:last-child { border-bottom: 0; }
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
    gap: 12px;
  }

  &__linuxKernel {
    flex: 1;
    padding: 16px;
    background: #111;
    border-radius: 12px;
    color: #0f0;
    font-family: monospace;
  }

  &__osLabel { font-size: 11px; margin-bottom: 12px; opacity: 0.6; }

  &__osProc {
    display: flex;
    gap: 8px;
  }

  &__procItem {
    padding: 4px 8px;
    background: #222;
    border: 1px solid #333;
    border-radius: 4px;
    font-size: 10px;
  }

  &__hardware {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 12px;
    background: $bg;
    border-radius: 10px;
  }

  &__cpuCore {
    height: 40px;
    display: grid;
    place-items: center;
    font-size: 9px;
    background: rgb(0 0 0 / 6%);
    border-radius: 4px;
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

    p { margin: 0; color: #aaa; }
    p:last-child { color: #fff; }
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
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.sd-pop-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.sd-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes sd-pulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  100% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
}

@keyframes sd-caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@media (max-width: 900px) {
  .sd__body { grid-template-columns: 1fr; }
  .sd__side { display: none; }
  .sd__cards { grid-template-columns: 1fr; }
  .sd__chartRow { grid-template-columns: 1fr; gap: 16px; }
  .sd__radar { display: none; }
  .sd__insight { right: 12px; top: 60px; width: 180px; }
}

@media (prefers-reduced-motion: reduce) {
  .sd__cursor,
  .sd__caret { display: none; }
}
</style>

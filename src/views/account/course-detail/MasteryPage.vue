<template>
  <!-- 知识点 -->
  <div
    v-show="visible"
    data-v-487e2460=""
    data-v-2cf49992=""
    class="mastery-page-content"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="知识点掌握"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div
      data-v-487e2460=""
      class="mastery-content-left"
      style="width: 100%"
    >
      <div data-v-487e2460="" class="left-scroll">
        <div class="mastery-summary-wrapper">
          <div class="mastery-summary-left">
            <div class="summary-card" :class="currentTheme">
              <div class="summary-title">基础知识点</div>
              <div class="summary-value">{{ studyEffectData.knowledgePointNum || 0 }}</div>
            </div>
            <div class="summary-card" :class="currentTheme">
              <div class="summary-title">重点数量</div>
              <div class="summary-value">{{ studyEffectData.keyPointNum || 0 }}</div>
            </div>
            <div class="summary-card" :class="currentTheme">
              <div class="summary-title">难点数量</div>
              <div class="summary-value">{{ studyEffectData.difficultPointNum || 0 }}</div>
            </div>
            <div class="summary-card" :class="currentTheme">
              <div class="summary-title">概念数量</div>
              <div class="summary-value">{{ studyEffectData.conceptNum || 0 }}</div>
            </div>
          </div>
          <div class="mastery-summary-charts" :class="currentTheme">
            <div class="chart-box bar-chart-box">
              <div class="summary-chart-title">数量分布</div>
              <div ref="masterySummaryChartRef" class="summary-chart-bar" />
            </div>
            <div class="chart-box pie-chart-box">
              <div class="summary-chart-title">占比分布</div>
              <div ref="masteryPieChartRef" class="summary-chart-pie" />
            </div>
          </div>
        </div>

        <div
          v-if="
            studyEffectData.chapterList &&
            studyEffectData.chapterList.length > 0
          "
          class="chapters-grid"
        >
          <div
            v-for="(chapter, index) in studyEffectData.chapterList"
            :key="index"
            class="chapter-section"
            :class="[currentTheme, { 'slide-in-left': index % 2 === 0, 'slide-in-right': index % 2 === 1 }]"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <h2
              class="collapsible-header"
              :class="{ 'is-expanded': isChapterExpanded(chapter.chapterId) }"
              @click="toggleChapterCollapse(chapter.chapterId)"
            >
              {{ chapter.chapterName }}
              <i
                class="el-icon-arrow-down"
                :class="{
                  rotated: !isChapterExpanded(chapter.chapterId)
                }"
              />
            </h2>

            <transition
              @enter="collapseEnter"
              @after-enter="collapseAfterEnter"
              @leave="collapseLeave"
              @after-leave="collapseAfterLeave"
            >
            <div v-show="isChapterExpanded(chapter.chapterId)" class="chapter-body">
              <!-- 重点部分 -->
              <div
                v-if="
                  chapter.keyPointArray &&
                  chapter.keyPointArray.length > 0
                "
                class="point-section"
                :class="currentTheme"
              >
                <h3
                  class="collapsible-header spotlight-button"
                  :class="{ 'is-expanded': isSubsectionExpanded(chapter.chapterId, 'keyPoint') }"
                  @click="toggleSubsectionCollapse(chapter.chapterId, 'keyPoint')"
                  @mousemove="handleButtonMouseMove"
                >
                  <div style="display: flex; align-items: center;">
                    <span class="count-badge">{{ chapter.keyPointArray.length }}</span>
                    <span style="font-weight: 600;">重点内容</span>
                  </div>
                  <i
                    class="el-icon-arrow-down"
                    :class="{
                      rotated: isSubsectionExpanded(
                        chapter.chapterId,
                        'keyPoint'
                      )
                    }"
                  />
                </h3>
                <transition
                  @enter="collapseEnter"
                  @after-enter="collapseAfterEnter"
                  @leave="collapseLeave"
                  @after-leave="collapseAfterLeave"
                >
                  <div v-show="isSubsectionExpanded(chapter.chapterId, 'keyPoint')" class="subsection-wrapper">
                    <transition-group name="point-fade" tag="div">
                      <div
                        v-for="(item, idx) in chapter.keyPointArray || []"
                        :key="'key-' + idx"
                        class="point-item"
                        :class="currentTheme"
                      >
                        <div class="point-title" :class="currentTheme">
                          {{ item.title }}
                        </div>
                        <div class="point-content" :class="currentTheme">
                          {{ item.content }}
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </transition>
              </div>

              <!-- 难点部分 -->
              <div
                v-if="
                  chapter.difficultPointArray &&
                  chapter.difficultPointArray.length > 0
                "
                class="point-section"
                :class="currentTheme"
              >
                <h3
                  class="collapsible-header spotlight-button"
                  :class="{ 'is-expanded': isSubsectionExpanded(chapter.chapterId, 'difficultPoint') }"
                  @click="toggleSubsectionCollapse(chapter.chapterId, 'difficultPoint')"
                  @mousemove="handleButtonMouseMove"
                >
                  <div style="display: flex; align-items: center;">
                    <span class="count-badge">{{ chapter.difficultPointArray.length }}</span>
                    <span style="font-weight: 600;">难点解析</span>
                  </div>
                  <i
                    class="el-icon-arrow-down"
                    :class="{
                      rotated: isSubsectionExpanded(
                        chapter.chapterId,
                        'difficultPoint'
                      )
                    }"
                  />
                </h3>
                <transition
                  @enter="collapseEnter"
                  @after-enter="collapseAfterEnter"
                  @leave="collapseLeave"
                  @after-leave="collapseAfterLeave"
                >
                  <div v-show="isSubsectionExpanded(chapter.chapterId, 'difficultPoint')" class="subsection-wrapper">
                    <transition-group name="point-fade" tag="div">
                      <div
                        v-for="(item, idx) in chapter.difficultPointArray || []"
                        :key="'diff-' + idx"
                        class="point-item"
                        :class="currentTheme"
                      >
                        <div class="point-title" :class="currentTheme">
                          {{ item.title }}
                        </div>
                        <div class="point-content" :class="currentTheme">
                          {{ item.content }}
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </transition>
              </div>

              <!-- 知识点部分 -->
              <div
                v-if="
                  chapter.knowledgeArray &&
                  chapter.knowledgeArray.length > 0
                "
                class="point-section"
                :class="currentTheme"
              >
                <h3
                  class="collapsible-header spotlight-button"
                  :class="{ 'is-expanded': isSubsectionExpanded(chapter.chapterId, 'knowledge') }"
                  @click="toggleSubsectionCollapse(chapter.chapterId, 'knowledge')"
                  @mousemove="handleButtonMouseMove"
                >
                  <div style="display: flex; align-items: center;">
                    <span class="count-badge">{{ chapter.knowledgeArray.length }}</span>
                    <span style="font-weight: 600;">基础知识点</span>
                  </div>
                  <i
                    class="el-icon-arrow-down"
                    :class="{
                      rotated: isSubsectionExpanded(
                        chapter.chapterId,
                        'knowledge'
                      )
                    }"
                  />
                </h3>
                <transition
                  @enter="collapseEnter"
                  @after-enter="collapseAfterEnter"
                  @leave="collapseLeave"
                  @after-leave="collapseAfterLeave"
                >
                  <div v-show="isSubsectionExpanded(chapter.chapterId, 'knowledge')" class="subsection-wrapper">
                    <transition-group name="point-fade" tag="div">
                      <div
                        v-for="(item, idx) in chapter.knowledgeArray || []"
                        :key="'know-' + idx"
                        class="point-item"
                        :class="currentTheme"
                      >
                        <div class="point-title" :class="currentTheme">
                          {{ item.title }}
                        </div>
                        <div class="point-content" :class="currentTheme">
                          {{ item.content }}
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </transition>
              </div>

              <!-- 概念部分 -->
              <div
                v-if="
                  chapter.ConceptArray && chapter.ConceptArray.length > 0
                "
                class="point-section"
                :class="currentTheme"
              >
                <h3
                  class="collapsible-header spotlight-button"
                  :class="{ 'is-expanded': isSubsectionExpanded(chapter.chapterId, 'concept') }"
                  @click="toggleSubsectionCollapse(chapter.chapterId, 'concept')"
                  @mousemove="handleButtonMouseMove"
                >
                  <div style="display: flex; align-items: center;">
                    <span class="count-badge">{{ chapter.ConceptArray.length }}</span>
                    <span style="font-weight: 600;">核心概念</span>
                  </div>
                  <i
                    class="el-icon-arrow-down"
                    :class="{
                      rotated: isSubsectionExpanded(
                        chapter.chapterId,
                        'concept'
                      )
                    }"
                  />
                </h3>
                <transition
                  @enter="collapseEnter"
                  @after-enter="collapseAfterEnter"
                  @leave="collapseLeave"
                  @after-leave="collapseAfterLeave"
                >
                  <div v-show="isSubsectionExpanded(chapter.chapterId, 'concept')" class="subsection-wrapper">
                    <transition-group name="point-fade" tag="div">
                      <div
                        v-for="(item, idx) in chapter.ConceptArray || []"
                        :key="'con-' + idx"
                        class="point-item"
                        :class="currentTheme"
                      >
                        <div class="point-title" :class="currentTheme">
                          {{ item.title }}
                        </div>
                        <div class="point-content" :class="currentTheme">
                          {{ item.content }}
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </transition>
              </div>
            </div>
            </transition>
          </div>
        </div>

        <!-- 如果没有章节数据，显示无数据提示 -->
        <div v-else class="no-data">暂无学习效果数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import CourseHeader from "./CourseHeader.vue";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  studyEffectData: {
    knowledgePointNum: number;
    keyPointNum: number;
    difficultPointNum: number;
    conceptNum: number;
    chapterList: any[];
  };
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 引用状态
const masterySummaryChartRef = ref<HTMLElement | null>(null);
let masterySummaryChart: echarts.ECharts | null = null;
const masteryPieChartRef = ref<HTMLElement | null>(null);
let masteryPieChart: echarts.ECharts | null = null;

// 折叠状态映射
const chapterCollapseStates = reactive(new Map<number, boolean>());
const subsectionCollapseStates = reactive(new Map<string, boolean>());

// 折叠控制函数
const toggleChapterCollapse = (chapterId: number) => {
  chapterCollapseStates.set(chapterId, !chapterCollapseStates.get(chapterId));
};

const isChapterExpanded = (chapterId: number) => {
  return chapterCollapseStates.get(chapterId) ?? false;
};

const toggleSubsectionCollapse = (chapterId: number, sectionType: string) => {
  const key = `${chapterId}-${sectionType}`;
  subsectionCollapseStates.set(key, !subsectionCollapseStates.get(key));
};

const isSubsectionExpanded = (chapterId: number, sectionType: string) => {
  const key = `${chapterId}-${sectionType}`;
  return subsectionCollapseStates.get(key) ?? false;
};

// 处理按钮光效
const handleButtonMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty("--x", `${x}px`);
  target.style.setProperty("--y", `${y}px`);
};

// ============ JS 动画钩子 ============
const collapseEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = 'auto';
  element.style.paddingTop = '';
  element.style.paddingBottom = '';
  element.style.marginTop = '';
  element.style.marginBottom = '';
  element.style.opacity = '';
  element.style.overflow = 'visible';
  
  const fullHeight = element.offsetHeight;
  const initialStyle = window.getComputedStyle(element);
  const fullPaddingTop = initialStyle.paddingTop;
  const fullPaddingBottom = initialStyle.paddingBottom;
  const fullMarginTop = initialStyle.marginTop;
  const fullMarginBottom = initialStyle.marginBottom;

  element.style.height = '0';
  element.style.paddingTop = '0';
  element.style.paddingBottom = '0';
  element.style.marginTop = '0';
  element.style.marginBottom = '0';
  element.style.opacity = '0';
  element.style.overflow = 'hidden';
  
  void element.offsetHeight; 
  
  element.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  element.style.willChange = 'height, padding, margin, opacity';
  
  requestAnimationFrame(() => {
      element.style.height = fullHeight + 'px';
      element.style.paddingTop = fullPaddingTop;
      element.style.paddingBottom = fullPaddingBottom;
      element.style.marginTop = fullMarginTop;
      element.style.marginBottom = fullMarginBottom;
      element.style.opacity = '1';
  });
};

const collapseAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = ''; 
  element.style.overflow = '';
  element.style.transition = '';
  element.style.willChange = '';
  element.style.paddingTop = '';
  element.style.paddingBottom = '';
  element.style.marginTop = '';
  element.style.marginBottom = '';
  element.style.opacity = '';
};

const collapseLeave = (el: Element) => {
  const element = el as HTMLElement;
  const fullHeight = element.offsetHeight;
  const initialStyle = window.getComputedStyle(element);
  
  element.style.height = fullHeight + 'px';
  element.style.paddingTop = initialStyle.paddingTop;
  element.style.paddingBottom = initialStyle.paddingBottom;
  element.style.marginTop = initialStyle.marginTop;
  element.style.marginBottom = initialStyle.marginBottom;
  element.style.overflow = 'hidden';
  
  void element.offsetHeight;
  
  element.style.transition = 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1), padding 0.4s cubic-bezier(0.4, 0, 0.2, 1), margin 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
  element.style.willChange = 'height, padding, margin, opacity';
  
  requestAnimationFrame(() => {
      element.style.height = '0';
      element.style.paddingTop = '0';
      element.style.paddingBottom = '0';
      element.style.marginTop = '0';
      element.style.marginBottom = '0';
      element.style.opacity = '0';
  });
};

const collapseAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.transition = '';
  element.style.willChange = '';
};

// ============ 图表逻辑 ============
const updateMasteryPieChart = () => {
  if (!masteryPieChart) return;
  const isDark = props.currentTheme === "dark";
  const rawData = [
    { value: props.studyEffectData.knowledgePointNum || 0, name: "基础知识点" },
    { value: props.studyEffectData.keyPointNum || 0, name: "重点" },
    { value: props.studyEffectData.difficultPointNum || 0, name: "难点" },
    { value: props.studyEffectData.conceptNum || 0, name: "概念" }
  ];
  const total = rawData.reduce((sum, item) => sum + item.value, 0);
  const chartData = rawData.filter(d => d.value > 0);
  const colors = isDark 
    ? ["#4facfe", "#00f2fe", "#2ecc71", "#f1c40f"]
    : ["#409eff", "#67c23a", "#e6a23c", "#f56c6c"];

  masteryPieChart.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: isDark ? "rgba(30, 30, 38, 0.9)" : "rgba(255, 255, 255, 0.9)",
      borderColor: isDark ? "#3d3f55" : "#ebeef5",
      borderWidth: 1,
      textStyle: { color: isDark ? "#fff" : "#303133" }
    },
    legend: {
      orient: "vertical",
      left: "0",
      top: "center",
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 20,
      formatter: (name: string) => {
        const item = rawData.find(d => d.name === name);
        return `{name|${name}}   {val|${item?.value || 0}}`;
      },
      textStyle: {
        rich: {
          name: { fontSize: 14, color: isDark ? "#b4b4c7" : "#606266", width: 90 },
          val: { fontSize: 15, fontWeight: "bold", color: isDark ? "#fff" : "#303133" }
        }
      }
    },
    series: [
      {
        name: "知识点分布",
        type: "pie",
        radius: ["55%", "75%"],
        center: ["65%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? "#1e1e26" : "#fff",
          borderWidth: 3
        },
        label: {
          show: true,
          position: "center",
          formatter: `{total|${total}}\n{text|总计}`,
          rich: {
            total: { fontSize: 36, fontWeight: "bold", color: isDark ? "#fff" : "#303133", padding: [0, 0, 4, 0] },
            text: { fontSize: 14, color: isDark ? "#888" : "#999" }
          }
        },
        emphasis: { scale: true, scaleSize: 10, label: { show: true, fontSize: 40, fontWeight: "bold" } },
        labelLine: { show: false },
        data: chartData.map((d, i) => ({
          ...d,
          itemStyle: { color: colors[i % colors.length] }
        }))
      }
    ]
  });
};

const updateMasterySummaryChart = () => {
  if (!masterySummaryChart) return;
  const isDark = props.currentTheme === "dark";
  const textColor = isDark ? "#b4b4c7" : "#909399";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "#f0f2f5";
  const dataValues = [
    props.studyEffectData.knowledgePointNum || 0,
    props.studyEffectData.keyPointNum || 0,
    props.studyEffectData.difficultPointNum || 0,
    props.studyEffectData.conceptNum || 0
  ];
  const maxVal = Math.max(...dataValues, 10);
  
  masterySummaryChart.setOption({
    grid: { left: "15%", right: "5%", top: "15%", bottom: "15%" },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      backgroundColor: isDark ? "rgba(30, 30, 38, 0.9)" : "rgba(255, 255, 255, 0.9)",
      borderColor: isDark ? "#3d3f55" : "#ebeef5",
      borderWidth: 1,
      borderRadius: 12,
      padding: [10, 14],
      textStyle: { color: isDark ? "#fff" : "#303133", fontWeight: 500 }
    },
    xAxis: {
      type: "category",
      data: ["基础", "重点", "难点", "概念"],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 12, margin: 15 }
    },
    yAxis: {
      type: "value",
      min: 0,
      max: Math.ceil(maxVal * 1.2),
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: borderColor, type: "solid" } },
      axisLabel: { show: true, color: textColor, fontSize: 11 }
    },
    series: [
      {
        name: "数量",
        type: "bar",
        data: dataValues.map((v, i) => {
          const colors = isDark 
            ? [["#4facfe", "#00f2fe"], ["#72D5FF", "#4facfe"], ["#a8b8e8", "#72D5FF"], ["#c8d4f0", "#a8b8e8"]]
            : [["#409eff", "#72D5FF"], ["#604ffd", "#409eff"], ["#72D5FF", "#CFD8F0"], ["#CFD8F0", "#a8b8e8"]];
          const [c1, c2] = colors[i];
          return {
            value: v,
            itemStyle: {
              borderRadius: [8, 8, 8, 8],
              color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: c1 }, { offset: 1, color: c2 }]),
              shadowColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(96, 79, 253, 0.15)",
              shadowBlur: 12, shadowOffsetY: 6
            }
          };
        }),
        barWidth: 28,
        showBackground: false,
        label: { show: true, position: "top", distance: 10, color: isDark ? "#fff" : "#303133", fontWeight: "bold", fontSize: 14 }
      }
    ]
  });
};

const handleResize = () => {
  masterySummaryChart?.resize();
  masteryPieChart?.resize();
};

watch(
  () => [props.visible, props.currentTheme, props.studyEffectData],
  () => {
    if (props.visible) {
      nextTick(() => {
        if (!masterySummaryChart && masterySummaryChartRef.value) masterySummaryChart = echarts.init(masterySummaryChartRef.value);
        if (!masteryPieChart && masteryPieChartRef.value) masteryPieChart = echarts.init(masteryPieChartRef.value);
        updateMasterySummaryChart();
        updateMasteryPieChart();
      });
    }
  },
  { deep: true }
);

// 监听数据初始化折叠状态
watch(
  () => props.studyEffectData.chapterList,
  (newList) => {
    if (newList && newList.length > 0) {
      newList.forEach(chapter => {
        if (!chapterCollapseStates.has(chapter.chapterId)) {
          chapterCollapseStates.set(chapter.chapterId, false);
        }
      });
      // 默认展开第一个
      const first = newList[0];
      if (first && !chapterCollapseStates.get(first.chapterId)) {
        setTimeout(() => {
          chapterCollapseStates.set(first.chapterId, true);
        }, 300);
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  masterySummaryChart?.dispose();
  masteryPieChart?.dispose();
});
</script>

<style scoped>
.mastery-page-content {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 100px !important;
  margin-left: 5px !important;
  width: calc(100% - 5px) !important;
  height: 100vh !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  background: transparent !important;
  position: relative;
}

.mastery-content-left {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  height: 100% !important;
}

.left-scroll {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  overflow-y: auto !important;
  padding: 20px 24px 100px !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.left-scroll::-webkit-scrollbar {
  display: none;
}

.mastery-summary-wrapper {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  align-items: stretch;
  flex-wrap: wrap;
}

.mastery-summary-left {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 16px;
  flex: 1 1 380px;
  max-width: 520px;
  padding: 20px;
}

.summary-card {
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(220, 226, 247, 0.3) !important;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: transparent;
}

.summary-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px -15px rgba(96, 79, 253, 0.35);
  border-color: #604ffd !important;
}

.summary-card.dark {
  background: #1e1e26;
  border-color: rgba(61, 63, 85, 0.8) !important;
}

.summary-title {
  font-size: 15px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 12px;
  z-index: 1;
}

.summary-value {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #409eff, #604ffd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  z-index: 1;
}

.mastery-summary-charts {
  flex: 1.5 1 600px;
  display: flex;
  gap: 24px;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(220, 226, 247, 0.3) !important;
  background: transparent;
}

.mastery-summary-charts.dark {
  border-color: rgba(61, 63, 85, 0.5) !important;
}

.chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 280px;
}

.summary-chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.summary-chart-title::before {
  content: "";
  width: 4px; height: 16px; background: #409eff; border-radius: 2px; margin-right: 8px;
}

.dark .summary-chart-title { color: #ffffff; }

.summary-chart-bar,
.summary-chart-pie {
  width: 100%;
  height: 320px;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  perspective: 1000px;
}

@media (max-width: 1280px) { .chapters-grid { grid-template-columns: 1fr; } }

.chapter-section {
  border-radius: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid rgba(220, 226, 247, 0.5);
  box-shadow: 0 10px 30px -12px rgba(90, 107, 138, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.chapter-section:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 20px 40px -15px rgba(90, 107, 138, 0.25);
  border-color: #409eff;
}

.dark .chapter-section {
  background: #1e1e26;
  border-color: rgba(61, 63, 85, 0.8);
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.5);
}

.chapter-section h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 12px;
  display: flex;
  justify-content: space-between;
}

.dark .chapter-section h2 { color: #fff; border-bottom-color: #3d3f55; }

.point-section { margin-bottom: 16px; padding-left: 14px; position: relative; }

.point-section > .collapsible-header {
  background: linear-gradient(145deg, #ffffff, #f8faff);
  border: 1px solid rgba(220, 226, 247, 0.8);
  border-radius: 16px;
  padding: 12px 16px;
  margin: 8px 0 12px;
  transition: all 0.4s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.point-section.dark > .collapsible-header {
  background: linear-gradient(145deg, #2a2a35, #23232b);
  border-color: rgba(61, 63, 85, 0.8);
}

.point-section > .collapsible-header.is-expanded {
  border-color: #409eff;
  box-shadow: 0 10px 30px -10px rgba(64, 158, 255, 0.3);
}

.point-item {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(220, 226, 247, 0.5);
  backdrop-filter: blur(5px);
  transition: transform 0.3s;
}

.point-item:hover { transform: translateX(8px); border-color: #409eff; background: #fff; }

.dark .point-item { background: rgba(42, 42, 53, 0.4); border-color: rgba(61, 63, 85, 0.5); }

.point-title { font-weight: bold; margin-bottom: 6px; color: #303133; font-size: 15px; }
.dark .point-title { color: #fff; }
.point-content { color: #606266; line-height: 1.6; font-size: 14px; }
.dark .point-content { color: #e0e0e0; }

.count-badge {
  padding: 2px 8px; border-radius: 20px; font-size: 12px; font-weight: bold;
  background: rgba(64, 158, 255, 0.1); color: #409eff; margin-right: 12px;
}

.dark .count-badge { background: rgba(79, 172, 254, 0.1); color: #4facfe; }

/* 动画特效 */
.slide-in-left { animation: slideInFromLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-60px) rotateY(8deg); } to { opacity: 1; transform: translateX(0); } }

.slide-in-right { animation: slideInFromRight 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes slideInFromRight { from { opacity: 0; transform: translateX(60px) rotateY(-8deg); } to { opacity: 1; transform: translateX(0); } }

.collapsible-header i { transition: transform 0.4s; }
.collapsible-header i.rotated { transform: rotate(-180deg); }

.point-fade-enter-active { animation: pointSlideIn .6s cubic-bezier(.22, 1, .36, 1) forwards; }
@keyframes pointSlideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }

.spotlight-button { position: relative; overflow: hidden; }
.spotlight-button::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(64, 158, 255, 0.4) 0%, transparent 70%);
  opacity: 0; transition: opacity 0.3s; pointer-events: none;
}
.spotlight-button:hover::before { opacity: 1; }

.no-data { text-align: center; padding: 40px 0; color: #909399; font-size: 14px; }
</style>

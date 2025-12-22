<template>
  <!-- 课程成绩页面 -->
  <div
    v-show="visible"
    data-v-2cf49992=""
    class="course-grades-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="课程成绩"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div class="course-grades-container" :class="currentTheme">
      <div class="grades-content">
        <!-- 成绩卡片 -->
        <div class="grades-cards">
          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                />
              </svg>
              <h3>课时成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.courseScore || 0 }}
              </div>
              <div v-else class="grades-loading">
                <el-skeleton :rows="1" />
              </div>
            </div>
          </div>

          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h3>作业成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.workScore || 0 }}
              </div>
              <div v-else class="grades-loading">
                <el-skeleton :rows="1" />
              </div>
            </div>
          </div>

          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
              <h3>考试成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.examScore || 0 }}
              </div>
              <div v-else class="grades-loading">
                <el-skeleton :rows="1" />
              </div>
            </div>
          </div>
        </div>

        <!-- 成绩图表 -->
        <div class="grades-chart-container" :class="currentTheme">
          <div class="grades-chart-header">
            <h3>成绩分布</h3>
          </div>
          <div class="grades-chart-content">
            <div ref="gradesChartRef" class="grades-chart" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import CourseHeader from "./CourseHeader.vue";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  courseScores: any | null;
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

const gradesChartRef = ref<HTMLElement | null>(null);
let gradeChartInstance: echarts.ECharts | null = null;

// 初始化成绩图表
const initGradesChart = () => {
  if (!gradesChartRef.value || !props.courseScores) return;

  if (gradeChartInstance) {
    gradeChartInstance.dispose();
  }

  gradeChartInstance = echarts.init(gradesChartRef.value);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}"
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      data: ["课时成绩", "作业成绩", "考试成绩"]
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: props.courseScores.courseScore,
            name: "课时成绩",
            itemStyle: { color: "#409eff" }
          },
          {
            value: props.courseScores.workScore,
            name: "作业成绩",
            itemStyle: { color: "#604ffd" }
          },
          {
            value: props.courseScores.examScore,
            name: "考试成绩",
            itemStyle: { color: "#ff6b6b" }
          }
        ]
      }
    ]
  };

  gradeChartInstance.setOption(option);
};

// 监听分数变化或可见性变化
watch(
  () => [props.visible, props.courseScores, props.currentTheme],
  () => {
    if (props.visible && props.courseScores) {
      nextTick(() => {
        initGradesChart();
      });
    }
  },
  { deep: true }
);

const handleResize = () => {
  gradeChartInstance?.resize();
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  if (props.visible && props.courseScores) {
    initGradesChart();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  gradeChartInstance?.dispose();
});
</script>

<style scoped>
/* 课程成绩相关样式 */
.course-grades-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
}

.course-grades-wrapper.dark {
  background-color: #1a1a1a;
}

.course-grades-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.course-grades-container.dark {
  background-color: #1a1a1a;
}

.grades-content {
  width: 100%;
  max-width: 100%;
  padding: 0 1vw;
}

.grades-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grades-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  transition: all 0.3s;
  border: 1px solid #c6e2ff;
}

.grades-card.dark {
  background-color: #1a1a1a;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.grades-card:hover {
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
  transform: translateY(-5px);
  border-color: #409eff;
}

.grades-card.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.grades-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.grades-card-header svg {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #409eff;
}

.grades-card-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.grades-card.dark .grades-card-header h3 {
  color: #e0e0e0;
}

.grades-card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.grades-score {
  font-size: 56px;
  font-weight: 800;
  color: #604ffd;
  text-shadow: 0 2px 4px rgba(96, 79, 253, 0.1);
}

.grades-chart-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  margin-top: 30px;
  border: 1px solid #c6e2ff;
}

.grades-chart-container.dark {
  background-color: #1a1a1a;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.grades-chart-header {
  margin-bottom: 25px;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 15px;
}

.grades-chart-header h3 {
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  margin: 0;
}

.grades-chart-container.dark .grades-chart-header h3 {
  color: #e0e0e0;
}

.grades-chart {
  width: 100%;
  height: 350px;
}

</style>

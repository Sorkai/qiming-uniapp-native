<template>
  <div
    class="ai-inspector h-full flex flex-col p-4 bg-white italic-safe border-l border-gray-100 relative overflow-hidden"
  >
    <el-tabs
      v-model="activeTab"
      class="custom-tabs h-full flex flex-col relative z-10"
    >
      <el-tab-pane label="学习画像" name="profile">
        <div
          class="space-y-5 pt-2 overflow-y-auto custom-scrollbar h-full pr-2"
        >
          <div class="profile-radar-panel">
            <div class="profile-radar-panel__header">
              <span>学习画像</span>
              <el-tag size="small" effect="plain">同步中</el-tag>
            </div>
            <div ref="radarChartRef" class="profile-radar-chart" />
          </div>

          <div class="space-y-3 mt-4">
            <div class="inspector-section-title">
              <span>调度流</span>
              <el-icon><RefreshRight /></el-icon>
            </div>

            <div class="space-y-3">
              <div
                v-for="agent in agentItems"
                :key="agent.id"
                class="agent-status-card"
              >
                <div
                  class="flex items-center justify-between mb-1 relative z-10"
                >
                  <span class="text-sm font-semibold text-gray-800">
                    {{ agent.name }}
                  </span>

                  <el-tag
                    v-if="agent.status === 'running'"
                    size="small"
                    type="primary"
                    effect="plain"
                  >
                    <el-icon class="is-loading mr-1"><Loading /></el-icon>
                    处理中
                  </el-tag>
                  <el-tag v-else size="small" type="success" effect="plain">
                    <el-icon class="mr-1"><Check /></el-icon>
                    已完成
                  </el-tag>
                </div>
                <span class="text-sm text-gray-500 relative z-10 line-clamp-2">
                  {{ agent.desc }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="拓展资源" name="resources">
        <div
          class="space-y-4 pt-2 overflow-y-auto custom-scrollbar h-full pr-2 pb-10"
        >
          <div class="space-y-4">
            <div
              v-for="res in resources"
              :key="res.title"
              class="resource-card"
            >
              <div class="flex items-start justify-between mb-2 relative z-10">
                <el-tag
                  size="small"
                  :type="
                    res.eta.includes('马上') || res.eta.includes('完成')
                      ? 'success'
                      : 'info'
                  "
                  effect="plain"
                  >{{ res.kind }}</el-tag
                >
                <el-button :icon="Download" circle size="small" text />
              </div>
              <h4
                class="text-base font-semibold text-gray-700 mb-1 relative z-10"
              >
                {{ res.title }}
              </h4>
              <p
                v-if="res.desc"
                class="text-sm text-gray-500 leading-snug relative z-10 line-clamp-2"
              >
                {{ res.desc }}
              </p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Download,
  Check,
  Loading,
  RefreshRight
} from "@element-plus/icons-vue";
import * as echarts from "echarts/core";
import { RadarChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([RadarChart, TooltipComponent, CanvasRenderer]);

const props = defineProps<{
  profileDimensions: any[];
  agentItems: any[];
  resources: any[];
}>();

const activeTab = ref("profile");
const radarChartRef = ref<HTMLElement>();
let radarInstance: echarts.ECharts | null = null;
let themeObserver: MutationObserver | null = null;
const handleResize = () => radarInstance?.resize();

const renderRadar = () => {
  if (!radarChartRef.value) return;
  if (!radarInstance) {
    radarInstance = echarts.init(radarChartRef.value);
  }

  const formatRadarLabel = (name: string) => {
    if (!name) return "";
    if (name.length <= 5) return name;
    return name.replace(/(.{4,5})/g, "$1\n").trim();
  };

  const indicator = props.profileDimensions.map(d => ({
    name: d.dimension || d.label,
    max: 100
  }));
  const values = props.profileDimensions.map(d => d.score || d.value || 0);
  const isDark = document.documentElement.classList.contains("dark");
  const radarLabelColor = isDark ? "#cbd6e8" : "#697386";
  const radarLineColor = isDark
    ? "rgba(148, 163, 184, 0.28)"
    : "rgba(209, 213, 219, 0.65)";
  const radarAreaColor = isDark
    ? ["rgba(142, 175, 255, 0.08)", "rgba(15, 23, 42, 0.28)"]
    : ["#fafafa", "#f5f7fa"];

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: isDark ? "#121b2a" : "#fff",
      borderColor: isDark ? "rgba(148, 163, 184, 0.26)" : "#e5e7eb",
      textStyle: { color: isDark ? "#eef4ff" : "#303847" }
    },
    radar: {
      indicator,
      radius: "48%",
      center: ["50%", "52%"],
      splitNumber: 4,
      axisName: {
        color: radarLabelColor,
        fontSize: 11,
        lineHeight: 15,
        formatter: formatRadarLabel
      },
      splitLine: { lineStyle: { color: radarLineColor } },
      splitArea: { show: true, areaStyle: { color: radarAreaColor } },
      axisLine: { lineStyle: { color: radarLineColor } }
    },
    series: [
      {
        name: "学习画像",
        type: "radar",
        data: [
          {
            value: values,
            name: "画像",
            areaStyle: { color: "rgba(95, 143, 232, 0.16)" },
            lineStyle: { width: 2, color: isDark ? "#8eafff" : "#5f8fe8" },
            itemStyle: { color: isDark ? "#8eafff" : "#5f8fe8" },
            animationDurationUpdate: 500,
            animationEasingUpdate: "cubicOut"
          }
        ]
      }
    ]
  };
  radarInstance.setOption(option);
};

onMounted(() => {
  renderRadar();
  themeObserver = new MutationObserver(renderRadar);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"]
  });
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  radarInstance?.dispose();
  themeObserver?.disconnect();
  window.removeEventListener("resize", handleResize);
});

watch(() => props.profileDimensions, renderRadar, { deep: true });
</script>

<style scoped lang="scss">
.custom-tabs {
  min-height: 0;

  :deep(.el-tabs__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    min-height: 0;
  }

  :deep(.el-tabs__header) {
    margin: 0 0 16px 0;
  }
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #f3f4f6;
  }
  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    color: #9ca3af;
    transition: color 0.18s ease;
    &.is-active {
      color: var(--el-color-primary);
    }
  }
}

.ai-inspector {
  min-height: 0;
}

.profile-radar-panel {
  min-height: 360px;
  padding: 14px;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 14px;
}

.profile-radar-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303847;
}

.profile-radar-chart {
  width: 100%;
  height: 322px;
}

.inspector-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #303847;
}

.agent-status-card,
.resource-card {
  position: relative;
  padding: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 12px;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;

  &:hover {
    background: #fafbfc;
    border-color: #a9c4f6;
  }

  &::before {
    position: absolute;
    inset: 12px auto 12px 0;
    width: 3px;
    content: "";
    background: #6f9ff0;
    border-radius: 999px;
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transition: background 0.3s;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
</style>

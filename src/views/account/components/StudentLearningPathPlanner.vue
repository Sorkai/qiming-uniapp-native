<template>
  <div class="student-path-page" :class="currentTheme">
    <section v-loading="loading" class="path-hero">
      <div class="hero-copy">
        <div class="eyebrow">学习路径规划</div>
        <h3>{{ pathTitle }}</h3>
        <p>{{ pathGoal }}</p>
      </div>
      <div class="hero-actions">
        <el-select
          v-model="selectedCourseId"
          class="course-select"
          placeholder="全部课程"
          clearable
          :loading="courseLoading"
          @change="loadPath"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.id"
            :label="course.name"
            :value="course.id"
          />
        </el-select>
        <el-button
          plain
          :icon="Refresh"
          :loading="replanning"
          @click="handleReplan"
        >
          重新规划
        </el-button>
        <el-button
          type="primary"
          :icon="MagicStick"
          :loading="generating"
          @click="handleGenerate"
        >
          生成路径
        </el-button>
      </div>
    </section>

    <el-alert
      v-if="errorText"
      class="page-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="errorText"
    />

    <section class="path-metrics">
      <div v-for="item in metricItems" :key="item.label" class="metric-cell">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}</b>
      </div>
    </section>

    <section v-if="path?.natural_plan" class="plan-text-panel">
      <div class="panel-title">
        <el-icon><Compass /></el-icon>
        <span>规划摘要</span>
      </div>
      <p>{{ readableText(path.natural_plan) }}</p>
    </section>

    <section class="path-layout">
      <div class="roadmap-panel">
        <div class="panel-title">
          <el-icon><Guide /></el-icon>
          <span>路径节点</span>
        </div>

        <div v-if="path?.roadmap?.length" class="phase-list">
          <div
            v-for="(phase, phaseIndex) in path.roadmap"
            :key="`${phase.title}-${phaseIndex}`"
            class="phase-block"
          >
            <div class="phase-head">
              <div>
                <span>阶段 {{ phaseIndex + 1 }}</span>
                <h4>{{ phase.title }}</h4>
              </div>
              <el-tag effect="plain" :type="tagType(phase.status)">
                {{ text(phase.status, "进行中") }}
              </el-tag>
            </div>
            <p v-if="phase.summary">{{ readableText(phase.summary) }}</p>

            <div class="node-list">
              <div
                v-for="node in phase.nodes"
                :key="node.node_id"
                class="node-item"
                :class="{ current: node.current, done: node.done }"
              >
                <div class="node-marker">
                  <el-icon v-if="node.done"><Check /></el-icon>
                  <span v-else>{{ node.current ? "今" : "" }}</span>
                </div>
                <div class="node-content">
                  <div class="node-head">
                    <div>
                      <h5>{{ node.name }}</h5>
                      <div class="node-meta">
                        <span>{{ text(node.type, "学习任务") }}</span>
                        <span v-if="node.estimated_minutes">
                          {{ durationText(node.estimated_minutes) }}
                        </span>
                        <span v-if="node.knowledge_point_id">
                          {{ compactRef(node.knowledge_point_id, "知识点") }}
                        </span>
                      </div>
                    </div>
                    <el-button
                      v-if="!node.done"
                      size="small"
                      plain
                      :icon="Check"
                      :loading="completingNodeId === node.node_id"
                      @click="handleCompleteNode(node.node_id)"
                    >
                      标记完成
                    </el-button>
                  </div>
                  <p v-if="node.reason || node.status_reason">
                    {{ readableText(node.reason || node.status_reason) }}
                  </p>
                  <div
                    v-if="node.resource_id || node.resource_refs?.length"
                    class="resource-row"
                  >
                    <el-tag
                      v-for="resource in nodeResources(node)"
                      :key="resource"
                      size="small"
                      effect="plain"
                    >
                      {{ compactRef(resource, "资源") }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无学习路径" :image-size="100" />
      </div>

      <aside class="side-stack">
        <section class="side-panel">
          <div class="panel-title">
            <el-icon><Pointer /></el-icon>
            <span>待确认动作</span>
          </div>
          <div v-if="pendingActions.length" class="action-list">
            <div
              v-for="action in pendingActions"
              :key="action.action_id"
              class="action-item"
            >
              <div>
                <b>{{ text(action.action_type, "路径建议") }}</b>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="tagType(action.status)"
                >
                  {{ text(action.status) }}
                </el-tag>
              </div>
              <p>
                {{
                  readableText(
                    action.reason || action.path?.summary,
                    "路径建议待确认"
                  )
                }}
              </p>
              <el-button
                size="small"
                type="primary"
                plain
                :loading="applyingActionId === action.action_id"
                @click="handleApplyAction(action.action_id)"
              >
                应用建议
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无待确认动作" :image-size="76" />
        </section>

        <section class="side-panel">
          <div class="panel-title">
            <el-icon><Bell /></el-icon>
            <span>学习提醒</span>
          </div>
          <div v-if="pushTasks.length" class="task-list">
            <div
              v-for="task in pushTasks"
              :key="task.push_id"
              class="task-item"
            >
              <div>
                <b>{{ task.title }}</b>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="tagType(task.status)"
                >
                  {{ text(task.status) }}
                </el-tag>
              </div>
              <p>{{ readableText(task.summary || task.reason, "路径提醒") }}</p>
              <el-button
                v-if="task.status !== 'completed'"
                link
                type="primary"
                :loading="completingPushId === task.push_id"
                @click="handleCompletePush(task.push_id)"
              >
                已处理
              </el-button>
            </div>
          </div>
          <el-empty v-else description="暂无学习提醒" :image-size="76" />
        </section>

        <section class="side-panel">
          <div class="panel-title">
            <el-icon><Clock /></el-icon>
            <span>历史路径</span>
          </div>
          <div v-if="historyList.length" class="history-list">
            <div
              v-for="item in historyList"
              :key="`${item.path_id}-${item.path_version}`"
              class="history-item"
            >
              <div>
                <b>版本 {{ item.path_version }}</b>
                <span>{{ dateText(item.updated_at || item.created_at) }}</span>
              </div>
              <p>
                {{ readableText(item.summary || item.goal, "路径版本已记录") }}
              </p>
            </div>
          </div>
          <el-empty v-else description="暂无历史路径" :image-size="76" />
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Bell,
  Check,
  Clock,
  Compass,
  Guide,
  MagicStick,
  Pointer,
  Refresh
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getFrontendCourseList } from "@/api/frontend/course";
import {
  applyAssistantPathAction,
  completeAssistantPathNode,
  completeAssistantPathPushTask,
  generateAssistantPath,
  getAssistantCurrentPath,
  listAssistantPathActions,
  listAssistantPathHistory,
  listAssistantPathPushTasks,
  replanAssistantPath,
  type AssistantPathActionItem,
  type AssistantPathHistoryItem,
  type AssistantPathPushTaskItem,
  type AssistantPathRoadmap
} from "@/api/frontend/assistant";
import {
  backendText,
  compactRefLabel,
  dateText,
  durationText,
  inlineBackendText,
  progressValue,
  tagType
} from "./assistantDisplay";

defineProps<{
  currentTheme?: string;
}>();

interface CourseOption {
  id: number;
  name: string;
}

const loading = ref(false);
const generating = ref(false);
const replanning = ref(false);
const courseLoading = ref(false);
const completingNodeId = ref("");
const completingPushId = ref("");
const applyingActionId = ref("");
const errorText = ref("");
const selectedCourseId = ref<number>();
const courseOptions = ref<CourseOption[]>([]);
const path = ref<AssistantPathRoadmap | null>(null);
const historyList = ref<AssistantPathHistoryItem[]>([]);
const pendingActions = ref<AssistantPathActionItem[]>([]);
const pushTasks = ref<AssistantPathPushTaskItem[]>([]);

const requestParams = computed(() =>
  selectedCourseId.value ? { course_id: selectedCourseId.value } : undefined
);

const selectedCourseName = computed(
  () =>
    courseOptions.value.find(item => item.id === selectedCourseId.value)
      ?.name || "全部课程"
);

const pathTitle = computed(
  () => path.value?.course_meta?.name || selectedCourseName.value
);
const pathGoal = computed(() =>
  readableText(
    path.value?.goal || path.value?.summary,
    "按当前学习情况生成路径"
  )
);

const completedCount = computed(() =>
  (path.value?.roadmap || []).reduce(
    (sum, phase) => sum + phase.nodes.filter(node => node.done).length,
    0
  )
);
const totalCount = computed(() =>
  (path.value?.roadmap || []).reduce(
    (sum, phase) => sum + phase.nodes.length,
    0
  )
);
const currentPhase = computed(
  () => path.value?.course_meta?.current_phase || 0
);
const totalPhase = computed(() => path.value?.course_meta?.total_phase || 0);

const metricItems = computed(() => [
  {
    label: "节点进度",
    value: totalCount.value
      ? `${completedCount.value} / ${totalCount.value}`
      : "暂无"
  },
  {
    label: "完成率",
    value: totalCount.value
      ? `${progressValue(completedCount.value / totalCount.value)}%`
      : "暂无"
  },
  {
    label: "当前阶段",
    value:
      currentPhase.value && totalPhase.value
        ? `${currentPhase.value} / ${totalPhase.value}`
        : "暂无"
  },
  {
    label: "预计学时",
    value: path.value?.course_meta?.estimated_hours
      ? `${path.value.course_meta.estimated_hours} 小时`
      : "暂无"
  },
  {
    label: "应用状态",
    value: backendText(path.value?.apply_status, "暂无")
  },
  {
    label: "更新时间",
    value: dateText(path.value?.updated_at)
  }
]);

const text = (value?: string | number | null, fallback = "暂无") =>
  backendText(value, fallback);
const readableText = (value?: string | number | null, fallback = "暂无") =>
  inlineBackendText(value, fallback);
const compactRef = (value?: string | number | null, label = "编号") =>
  compactRefLabel(value, label);

const nodeResources = (
  node: AssistantPathRoadmap["roadmap"][number]["nodes"][number]
) =>
  [node.resource_id, ...(node.resource_refs || [])].filter(Boolean) as string[];

const normalizeCourse = (course: any): CourseOption | null => {
  const id = Number(course.course_id ?? course.courseId ?? course.id);
  if (!id) return null;
  return {
    id,
    name:
      course.course_name ||
      course.courseName ||
      course.name ||
      course.title ||
      `课程 ${id}`
  };
};

const loadCourses = async () => {
  courseLoading.value = true;
  try {
    const { code, data } = await getFrontendCourseList({
      pageNum: 1,
      pageSize: 100
    });
    if (code === 200) {
      courseOptions.value = (data?.list || [])
        .map(normalizeCourse)
        .filter(Boolean);
      if (!selectedCourseId.value && courseOptions.value.length) {
        selectedCourseId.value = courseOptions.value[0].id;
      }
    }
  } catch {
    courseOptions.value = [];
  } finally {
    courseLoading.value = false;
  }
};

const loadPath = async () => {
  loading.value = true;
  errorText.value = "";
  try {
    const params = requestParams.value;
    const [currentResp, historyResp, actionsResp, pushResp] =
      await Promise.allSettled([
        getAssistantCurrentPath(params),
        listAssistantPathHistory(params),
        listAssistantPathActions(params),
        listAssistantPathPushTasks(params)
      ]);

    if (currentResp.status === "fulfilled" && currentResp.value.code === 200) {
      path.value = currentResp.value.data.path || null;
    } else {
      path.value = null;
      errorText.value = "学习路径暂不可用";
    }

    historyList.value =
      historyResp.status === "fulfilled" && historyResp.value.code === 200
        ? historyResp.value.data.list || []
        : [];
    pendingActions.value =
      actionsResp.status === "fulfilled" && actionsResp.value.code === 200
        ? actionsResp.value.data.list || []
        : [];
    pushTasks.value =
      pushResp.status === "fulfilled" && pushResp.value.code === 200
        ? pushResp.value.data.list || []
        : [];
  } catch {
    errorText.value = "学习路径暂不可用";
  } finally {
    loading.value = false;
  }
};

const handleGenerate = async () => {
  generating.value = true;
  try {
    const { code, data, msg } = await generateAssistantPath({
      ...requestParams.value,
      goal: "生成适合当前学生的学习路径"
    });
    if (code === 200 && data?.path) {
      ElMessage.success("学习路径已生成");
      path.value = data.path;
      await loadPath();
    } else {
      ElMessage.warning(msg || data?.message || "路径生成暂未生效");
    }
  } catch {
    ElMessage.error("路径生成失败");
  } finally {
    generating.value = false;
  }
};

const handleReplan = async () => {
  replanning.value = true;
  try {
    const { code, data, msg } = await replanAssistantPath({
      ...requestParams.value,
      reason: "学生主动重新规划学习路径",
      apply_immediately: true
    });
    if (code === 200 && data?.path) {
      ElMessage.success("学习路径已更新");
      path.value = data.path;
      await loadPath();
    } else {
      ElMessage.warning(msg || data?.message || "路径重规划暂未生效");
    }
  } catch {
    ElMessage.error("路径重规划失败");
  } finally {
    replanning.value = false;
  }
};

const handleCompleteNode = async (nodeId: string) => {
  completingNodeId.value = nodeId;
  try {
    const { code, data, msg } = await completeAssistantPathNode(nodeId, {
      ...requestParams.value,
      completion_evidence: "学生在路径规划页标记完成"
    });
    if (code === 200 && data?.completed) {
      ElMessage.success("节点已完成");
      await loadPath();
    } else {
      ElMessage.warning(msg || data?.message || "节点暂未完成");
    }
  } catch {
    ElMessage.error("节点完成失败");
  } finally {
    completingNodeId.value = "";
  }
};

const handleApplyAction = async (actionId: string) => {
  applyingActionId.value = actionId;
  try {
    const { code, data, msg } = await applyAssistantPathAction(actionId);
    if (code === 200 && data?.accepted !== false) {
      ElMessage.success("路径建议已应用");
      await loadPath();
    } else {
      ElMessage.warning(msg || data?.message || "路径建议暂未应用");
    }
  } catch {
    ElMessage.error("路径建议应用失败");
  } finally {
    applyingActionId.value = "";
  }
};

const handleCompletePush = async (pushId: string) => {
  completingPushId.value = pushId;
  try {
    const { code, data, msg } = await completeAssistantPathPushTask(pushId);
    if (code === 200 && data?.accepted !== false) {
      ElMessage.success("学习提醒已处理");
      await loadPath();
    } else {
      ElMessage.warning(msg || data?.message || "提醒暂未处理");
    }
  } catch {
    ElMessage.error("提醒处理失败");
  } finally {
    completingPushId.value = "";
  }
};

onMounted(async () => {
  await loadCourses();
  await loadPath();
});
</script>

<style scoped lang="scss">
.student-path-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #27324a;

  &.dark {
    color: #e6edf7;
  }
}

.path-hero,
.path-metrics,
.plan-text-panel,
.roadmap-panel,
.side-panel {
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 94%),
    rgb(247 250 255 / 90%)
  );
  border: 1px solid rgb(151 180 247 / 16%);
  border-radius: 18px;
  box-shadow: 0 14px 36px rgb(80 118 190 / 10%);

  .student-path-page.dark & {
    background: linear-gradient(
      145deg,
      rgb(18 28 46 / 96%),
      rgb(15 23 42 / 92%)
    );
    border-color: rgb(96 165 250 / 16%);
    box-shadow: 0 18px 42px rgb(0 0 0 / 24%);
  }
}

.path-hero {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-height: 132px;
  padding: 26px;

  .hero-copy {
    min-width: 0;
  }

  .eyebrow {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #6f8fea;
  }

  h3 {
    margin: 0;
    overflow: hidden;
    font-size: 30px;
    font-weight: 900;
    color: #17223b;
    text-overflow: ellipsis;
    white-space: nowrap;

    .student-path-page.dark & {
      color: #f8fbff;
    }
  }

  p {
    display: -webkit-box;
    max-width: 780px;
    margin: 8px 0 0;
    overflow: hidden;
    color: #6b7590;
    line-height: 24px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    .student-path-page.dark & {
      color: #aab7cf;
    }
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  .course-select {
    width: 220px;
  }
}

.page-alert {
  border-radius: 14px;
}

.path-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  padding: 18px;
}

.metric-cell {
  min-width: 0;
  padding: 0 16px;
  border-right: 1px solid rgb(151 180 247 / 14%);

  &:last-child {
    border-right: 0;
  }

  span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #7a849c;
  }

  b {
    display: block;
    overflow: hidden;
    font-size: 20px;
    color: #1f2c48;
    text-overflow: ellipsis;
    white-space: nowrap;

    .student-path-page.dark & {
      color: #f5f8ff;
    }
  }
}

.plan-text-panel,
.roadmap-panel,
.side-panel {
  padding: 22px;
}

.plan-text-panel p {
  margin: 0;
  color: #5f6b83;
  line-height: 26px;

  .student-path-page.dark & {
    color: #aab7cf;
  }
}

.panel-title {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 18px;
  font-size: 17px;
  font-weight: 800;
  color: #1e2a44;

  .student-path-page.dark & {
    color: #f3f7ff;
  }

  .el-icon {
    width: 30px;
    height: 30px;
    color: #6f8fea;
    background: rgb(151 180 247 / 14%);
    border-radius: 10px;
  }
}

.path-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.phase-list,
.side-stack,
.action-list,
.task-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.phase-block {
  padding: 18px;
  background: rgb(248 251 255 / 74%);
  border: 1px solid rgb(151 180 247 / 14%);
  border-radius: 16px;

  .student-path-page.dark & {
    background: rgb(15 23 42 / 72%);
    border-color: rgb(96 165 250 / 14%);
  }

  > p {
    margin: 8px 0 0;
    color: #6b7590;
    line-height: 24px;
  }
}

.phase-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;

  span {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    font-weight: 800;
    color: #6f8fea;
  }

  h4 {
    margin: 0;
    font-size: 18px;
    color: #22304e;

    .student-path-page.dark & {
      color: #f6f9ff;
    }
  }
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.node-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
  background: rgb(255 255 255 / 84%);
  border: 1px solid rgb(151 180 247 / 12%);
  border-radius: 14px;

  &.current {
    border-color: rgb(111 156 248 / 42%);
    box-shadow: inset 0 0 0 1px rgb(111 156 248 / 12%);
  }

  &.done {
    background: rgb(236 253 245 / 66%);
  }

  .student-path-page.dark & {
    background: rgb(20 31 52 / 78%);
    border-color: rgb(96 165 250 / 14%);
  }
}

.node-marker {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #6f9cf8, #18b6a3);
  border-radius: 999px;

  span {
    font-size: 12px;
    font-weight: 900;
  }
}

.node-head,
.action-item div,
.task-item div,
.history-item div {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.node-head h5 {
  margin: 0 0 7px;
  font-size: 16px;
  color: #22304e;

  .student-path-page.dark & {
    color: #f7faff;
  }
}

.node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    padding: 4px 8px;
    font-size: 12px;
    color: #68748f;
    background: rgb(151 180 247 / 12%);
    border-radius: 999px;
  }
}

.node-content p,
.action-item p,
.task-item p,
.history-item p {
  margin: 9px 0 0;
  color: #68748f;
  line-height: 23px;
}

.resource-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.action-item,
.task-item,
.history-item {
  padding: 14px;
  background: rgb(248 251 255 / 76%);
  border: 1px solid rgb(151 180 247 / 12%);
  border-radius: 14px;

  .student-path-page.dark & {
    background: rgb(15 23 42 / 72%);
    border-color: rgb(96 165 250 / 14%);
  }

  b,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: #24314e;

    .student-path-page.dark & {
      color: #f7faff;
    }
  }

  span {
    color: #8b95aa;
  }

  .el-button {
    margin-top: 12px;
  }
}

@media (width <= 1199px) {
  .path-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 16px;
  }

  .metric-cell:nth-child(3n) {
    border-right: 0;
  }

  .path-layout {
    grid-template-columns: 1fr;
  }

  .side-stack {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .path-hero {
    align-items: stretch;
    padding: 20px;
    flex-direction: column;

    h3 {
      font-size: 24px;
      white-space: normal;
    }
  }

  .hero-actions,
  .hero-actions .course-select {
    width: 100%;
  }

  .path-metrics,
  .side-stack {
    grid-template-columns: 1fr;
  }

  .metric-cell {
    padding: 10px 0;
    border-right: 0;
    border-bottom: 1px solid rgb(151 180 247 / 12%);

    &:last-child {
      border-bottom: 0;
    }
  }

  .node-head {
    flex-direction: column;
  }
}
</style>

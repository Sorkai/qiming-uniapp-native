<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Location,
  Check,
  Cpu,
  Reading,
  Guide,
  RefreshRight,
  MagicStick,
  Bell,
  Clock
} from "@element-plus/icons-vue";
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

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
}>();

const loading = ref(false);
const actionLoading = ref(false);
const status = ref("");
const statusMessage = ref("");
const path = ref<AssistantPathRoadmap | null>(null);
const pathActions = ref<AssistantPathActionItem[]>([]);
const pathHistory = ref<AssistantPathHistoryItem[]>([]);
const pushTasks = ref<AssistantPathPushTaskItem[]>([]);

const courseMeta = computed(() => path.value?.course_meta);
const roadmapData = computed(() => path.value?.roadmap || []);
const hasPath = computed(() => !!path.value && roadmapData.value.length > 0);
const pendingActions = computed(() =>
  pathActions.value.filter(item => item.status !== "applied")
);

const loadPath = async () => {
  loading.value = true;
  try {
    const params = {
      course_id: props.courseId,
      target_student_id: props.targetStudentId
    };
    const [currentResp, actionsResp, historyResp, pushResp] = await Promise.all([
      getAssistantCurrentPath(params),
      listAssistantPathActions(params),
      listAssistantPathHistory(params),
      listAssistantPathPushTasks(params)
    ]);
    path.value = currentResp.data.path || null;
    status.value = currentResp.data.status;
    statusMessage.value = currentResp.data.message || "";
    pathActions.value = actionsResp.data.list || [];
    pathHistory.value = historyResp.data.list || [];
    pushTasks.value = pushResp.data.list || [];
  } catch (error: any) {
    console.error("[AiLearningPath] 学习路径加载失败:", error);
    ElMessage.error(error?.message || "学习路径加载失败");
  } finally {
    loading.value = false;
  }
};

const handleGenerate = async () => {
  actionLoading.value = true;
  try {
    const { data } = await generateAssistantPath({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      goal: "基于当前画像生成个性化学习路径"
    });
    if (data.path) path.value = data.path;
    status.value = data.status;
    statusMessage.value = data.message || "";
    ElMessage.success(data.message || "学习路径已生成");
    await loadPath();
  } catch (error: any) {
    console.error("[AiLearningPath] 学习路径生成失败:", error);
    ElMessage.error(error?.message || "学习路径生成失败");
  } finally {
    actionLoading.value = false;
  }
};

const handleReplan = async () => {
  actionLoading.value = true;
  try {
    const { data } = await replanAssistantPath({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      reason: "frontend_manual_replan",
      apply_immediately: false
    });
    status.value = data.status;
    statusMessage.value = data.message || "";
    ElMessage.success(data.message || "已生成重规划预览，确认后可应用");
    await loadPath();
  } catch (error: any) {
    console.error("[AiLearningPath] 学习路径重规划失败:", error);
    ElMessage.error(error?.message || "学习路径重规划失败");
  } finally {
    actionLoading.value = false;
  }
};

const handleApplyAction = async (actionId: string) => {
  actionLoading.value = true;
  try {
    const { data } = await applyAssistantPathAction(actionId);
    if (data.path) path.value = data.path;
    ElMessage.success(data.message || "重规划预览已应用");
    await loadPath();
  } catch (error: any) {
    console.error("[AiLearningPath] 应用路径动作失败:", error);
    ElMessage.error(error?.message || "应用路径动作失败");
  } finally {
    actionLoading.value = false;
  }
};

const handleCompletePushTask = async (pushId: string) => {
  actionLoading.value = true;
  try {
    const { data } = await completeAssistantPathPushTask(pushId);
    ElMessage.success(data.message || "推送任务已完成");
    await loadPath();
  } catch (error: any) {
    console.error("[AiLearningPath] 完成推送任务失败:", error);
    ElMessage.error(error?.message || "完成推送任务失败");
  } finally {
    actionLoading.value = false;
  }
};

const handleComplete = async (nodeId: string) => {
  actionLoading.value = true;
  try {
    const { data } = await completeAssistantPathNode(nodeId, {
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      completion_evidence: "前端标记完成"
    });
    ElMessage.success(data.message || "节点已完成");
    await loadPath();
  } catch (error: any) {
    console.error("[AiLearningPath] 完成路径节点失败:", error);
    ElMessage.error(error?.message || "完成路径节点失败");
  } finally {
    actionLoading.value = false;
  }
};

onMounted(loadPath);
watch(() => [props.courseId, props.targetStudentId], loadPath);
</script>

<template>
  <div
    v-loading="loading"
    class="h-full flex flex-col p-6 bg-transparent overflow-y-auto custom-scrollbar"
  >
    <div class="mb-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <el-icon class="text-primary"><Guide /></el-icon>
            <h2 class="text-xl font-bold text-text_color_primary">
              个性化路径规划
            </h2>
          </div>
          <p class="text-sm text-text_color_regular mt-1">
            基于 AI 学情画像动态生成的专属进阶路线
          </p>
        </div>
        <div class="flex gap-2">
          <el-button
            plain
            round
            :loading="actionLoading"
            :disabled="!hasPath"
            @click="handleReplan"
          >
            <el-icon class="mr-1"><RefreshRight /></el-icon>
            重规划
          </el-button>
          <el-button type="primary" round :loading="actionLoading" @click="handleGenerate">
            <el-icon class="mr-1"><MagicStick /></el-icon>
            生成路径
          </el-button>
        </div>
      </div>

      <div
        v-if="courseMeta"
        class="mt-4 max-w-4xl bg-bg_color border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
      >
        <div
          class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
        >
          <el-icon :size="28"><Cpu /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-text_color_primary lg:text-lg">{{
              courseMeta.name
            }}</span>
            <el-tag size="small" effect="plain" round>{{
              courseMeta.subtitle || status
            }}</el-tag>
            <el-tag v-if="path?.schema_version" size="small" effect="plain" round>
              {{ path.schema_version }}
            </el-tag>
            <el-tag
              v-if="path?.apply_status"
              size="small"
              type="success"
              effect="plain"
              round
            >
              {{ path.apply_status }}
            </el-tag>
          </div>
          <div
            class="mt-2 text-xs text-text_color_regular flex items-center gap-3"
          >
            <span
              >当前阶段：<span class="text-primary font-bold">{{
                courseMeta.current_phase
              }}</span>
              / {{ courseMeta.total_phase }}</span
            >
            <span class="w-[1px] h-3 bg-gray-200 dark:bg-gray-700" />
            <span>预计 {{ courseMeta.estimated_hours }} 学时</span>
            <span
              v-if="path?.path_version"
              class="w-[1px] h-3 bg-gray-200 dark:bg-gray-700"
            />
            <span v-if="path?.path_version">路径版本 v{{ path.path_version }}</span>
          </div>
        </div>
        <el-tag v-if="statusMessage" type="info" effect="plain" round>
          {{ statusMessage }}
        </el-tag>
      </div>

      <div
        v-if="pendingActions.length"
        class="mt-4 max-w-4xl rounded-xl border border-amber-100 bg-amber-50 p-4"
      >
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div class="text-sm font-bold text-amber-700">待应用重规划预览</div>
            <p class="mt-1 text-xs text-amber-700/80">
              后端已生成 preview/pending_apply，不会替换当前路径，确认后才应用。
            </p>
          </div>
          <el-button
            v-for="action in pendingActions"
            :key="action.action_id"
            type="warning"
            plain
            :loading="actionLoading"
            @click="handleApplyAction(action.action_id)"
          >
            应用 {{ action.action_type || "预览" }}
          </el-button>
        </div>
        <div
          v-for="action in pendingActions"
          :key="`${action.action_id}-summary`"
          class="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-amber-700"
        >
          {{ action.reason || action.path?.summary || "重规划预览待确认" }}
        </div>
      </div>

      <div
        v-if="path?.natural_plan"
        class="mt-4 max-w-4xl rounded-xl border border-primary/10 bg-primary/5 p-4"
      >
        <div class="mb-2 text-xs font-bold text-primary">自然语言规划</div>
        <pre
          class="whitespace-pre-wrap break-words text-xs leading-6 text-text_color_regular"
          >{{ path.natural_plan }}</pre
        >
      </div>
    </div>

    <div v-if="hasPath" class="max-w-4xl w-full relative">
      <div
        v-for="(phase, index) in roadmapData"
        :key="phase.title"
        class="relative pl-10 mb-12"
      >
        <div
          v-if="index !== roadmapData.length - 1"
          class="absolute left-[11px] top-8 bottom-[-48px] w-0.5"
          :class="
            phase.status === 'completed'
              ? 'bg-primary'
              : 'bg-gray-200 dark:bg-gray-800 border-dashed border-l'
          "
        />

        <div
          class="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-bg_color z-10"
          :class="{
            'border-primary text-primary': phase.status === 'completed',
            'border-blue-500 shadow-[0_0_12px_rgba(var(--el-color-primary-rgb),0.3)]':
              phase.status === 'active',
            'border-gray-300 dark:border-gray-700': phase.status === 'pending'
          }"
        >
          <el-icon v-if="phase.status === 'completed'" :size="12"
            ><Check
          /></el-icon>
          <div
            v-else-if="phase.status === 'active'"
            class="w-2.5 h-2.5 bg-primary rounded-full animate-ping"
          />
          <div
            v-else
            class="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"
          />
        </div>

        <div class="flex items-center justify-between mb-4">
          <div>
            <h3
              class="text-lg font-black tracking-tight"
              :class="
                phase.status === 'pending'
                  ? 'text-text_color_regular opacity-40'
                  : 'text-text_color_primary'
              "
            >
              {{ phase.title }}
            </h3>
            <p
              v-if="phase.summary"
              class="mt-1 text-xs text-text_color_regular"
              :class="phase.status === 'pending' ? 'opacity-50' : ''"
            >
              {{ phase.summary }}
            </p>
          </div>
          <el-tag v-if="phase.status === 'active'" size="small" effect="dark"
            >进行中</el-tag
          >
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="node in phase.nodes"
            :key="node.node_id"
            class="flex items-start p-4 rounded-xl border transition-all duration-300 group"
            :class="{
              'bg-primary/5 border-primary/20 text-primary shadow-sm':
                node.current,
              'bg-bg_color border-gray-100 dark:border-gray-800 opacity-70':
                !node.done && !node.current,
              'bg-bg_color border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md':
                node.done || (!node.done && !node.current)
            }"
          >
            <div
              class="w-8 h-8 rounded-lg flex-c mr-3 transition-colors flex-shrink-0"
              :class="
                node.done
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                  : node.current
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
              "
            >
              <el-icon :size="16">
                <Check v-if="node.done" />
                <Location v-else-if="node.current" />
                <Reading v-else />
              </el-icon>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm truncate">{{ node.name }}</span>
                <el-tag size="small" effect="plain" class="ml-auto !border-none">
                  {{ node.type }}
                </el-tag>
              </div>
              <p v-if="node.reason" class="mt-2 text-xs text-text_color_regular">
                {{ node.reason }}
              </p>
              <p v-if="node.resource_id" class="mt-1 text-[11px] text-primary">
                资源：{{ node.resource_id }}
              </p>
              <div class="mt-2 flex flex-wrap gap-1">
                <el-tag
                  v-if="node.knowledge_point_id"
                  size="small"
                  effect="plain"
                  class="!rounded-md"
                >
                  {{ node.knowledge_point_id }}
                </el-tag>
                <el-tag
                  v-if="node.estimated_minutes"
                  size="small"
                  effect="plain"
                  class="!rounded-md"
                >
                  {{ node.estimated_minutes }} 分钟
                </el-tag>
                <el-tag
                  v-if="node.status"
                  size="small"
                  effect="plain"
                  class="!rounded-md"
                >
                  {{ node.status }}
                </el-tag>
                <el-tag
                  v-if="node.video_segment_refs?.length"
                  size="small"
                  type="info"
                  effect="plain"
                  class="!rounded-md"
                >
                  视频 {{ node.video_segment_refs.length }}
                </el-tag>
              </div>
              <p
                v-if="node.status_reason || node.completion_rule?.type || node.due_at"
                class="mt-2 text-[11px] text-text_color_regular leading-relaxed"
              >
                {{
                  node.status_reason ||
                  node.completion_rule?.type ||
                  (node.due_at ? `截止：${node.due_at}` : "")
                }}
              </p>
              <el-button
                v-if="!node.done"
                size="small"
                link
                type="primary"
                class="!p-0 mt-2"
                :loading="actionLoading"
                @click="handleComplete(node.node_id)"
              >
                标记完成
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="max-w-3xl w-full rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center"
    >
      <el-empty
        :description="statusMessage || '当前课程还没有真实学习路径'"
        :image-size="140"
      />
      <el-button
        type="primary"
        round
        :loading="actionLoading"
        @click="handleGenerate"
      >
        <el-icon class="mr-1"><MagicStick /></el-icon>
        生成路径
      </el-button>
    </div>

    <div
      class="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl w-full pb-6"
    >
      <div
        class="rounded-xl border border-gray-100 dark:border-gray-800 p-5 bg-bg_color"
      >
        <h4 class="font-bold text-text_color_primary flex items-center gap-2 mb-4">
          <el-icon class="text-primary"><Bell /></el-icon>
          路径推送任务
        </h4>
        <div v-if="pushTasks.length" class="space-y-3">
          <div
            v-for="task in pushTasks"
            :key="task.push_id"
            class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3 text-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-text_color_primary">{{ task.title }}</span>
              <el-tag size="small" effect="plain">{{ task.status }}</el-tag>
            </div>
            <p v-if="task.summary || task.reason" class="mt-2 text-text_color_regular">
              {{ task.summary || task.reason }}
            </p>
            <div class="mt-2 flex items-center justify-between gap-2">
              <span class="text-text_color_regular opacity-60">
                {{ task.scheduled_at || task.created_at || "" }}
              </span>
              <el-button
                v-if="task.status !== 'completed'"
                link
                type="primary"
                :loading="actionLoading"
                @click="handleCompletePushTask(task.push_id)"
              >
                标记完成
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无推送任务" :image-size="90" />
      </div>

      <div
        class="rounded-xl border border-gray-100 dark:border-gray-800 p-5 bg-bg_color"
      >
        <h4 class="font-bold text-text_color_primary flex items-center gap-2 mb-4">
          <el-icon class="text-primary"><Clock /></el-icon>
          路径版本历史
        </h4>
        <el-timeline v-if="pathHistory.length">
          <el-timeline-item
            v-for="item in pathHistory"
            :key="item.path_id"
            :timestamp="item.updated_at || item.created_at"
            hollow
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-text_color_primary">
                v{{ item.path_version }}
              </span>
              <el-tag size="small" effect="plain">{{ item.status }}</el-tag>
              <el-tag size="small" effect="plain">{{ item.apply_status }}</el-tag>
            </div>
            <p class="mt-1 text-xs text-text_color_regular leading-relaxed">
              {{ item.summary || item.goal || "路径版本已记录" }}
            </p>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无路径历史" :image-size="90" />
      </div>
    </div>
  </div>
</template>

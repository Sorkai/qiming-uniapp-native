<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Document,
  VideoPlay,
  Monitor,
  Search,
  MagicStick,
  Refresh,
  Download,
  View
} from "@element-plus/icons-vue";
import {
  createAssistantResourceTask,
  listAssistantResourceTaskLogs,
  listAssistantResourceTasks,
  listAssistantResources,
  type AssistantResourceSummary,
  type AssistantResourceTaskItem,
  type AssistantResourceTaskLogItem
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
}>();

const loading = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const resourceType = ref("");
const tasks = ref<AssistantResourceTaskItem[]>([]);
const resources = ref<AssistantResourceSummary[]>([]);
const selectedTaskId = ref("");
const taskLogs = ref<AssistantResourceTaskLogItem[]>([]);

const filteredResources = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  return resources.value.filter(resource => {
    const matchesKeyword =
      !keyword ||
      resource.title.toLowerCase().includes(keyword) ||
      resource.summary?.toLowerCase().includes(keyword) ||
      resource.recommendation?.toLowerCase().includes(keyword);
    const matchesType =
      !resourceType.value || resource.resource_type === resourceType.value;
    return matchesKeyword && matchesType;
  });
});

const resourceTypeOptions = computed(() =>
  Array.from(new Set(resources.value.map(item => item.resource_type))).filter(Boolean)
);

const resourceIcon = (type: string) => {
  if (type.includes("video") || type.includes("animation")) return VideoPlay;
  if (type.includes("code") || type.includes("html")) return Monitor;
  return Document;
};

const tagType = (status: string) => {
  if (status === "completed" || status === "ready") return "success";
  if (status === "failed") return "danger";
  return "warning";
};

const loadResources = async () => {
  loading.value = true;
  try {
    const [taskResp, resourceResp] = await Promise.all([
      listAssistantResourceTasks({
        course_id: props.courseId,
        target_student_id: props.targetStudentId
      }),
      listAssistantResources({
        course_id: props.courseId,
        target_student_id: props.targetStudentId
      })
    ]);
    tasks.value = taskResp.data.list || [];
    resources.value = resourceResp.data.list || [];
  } catch (error: any) {
    console.error("[AiResourceGeneration] 学习资源加载失败:", error);
    ElMessage.error(error?.message || "学习资源加载失败");
  } finally {
    loading.value = false;
  }
};

const loadTaskLogs = async (taskId: string) => {
  selectedTaskId.value = taskId;
  try {
    const { data } = await listAssistantResourceTaskLogs(taskId);
    taskLogs.value = data.list || [];
  } catch (error: any) {
    console.error("[AiResourceGeneration] 任务日志加载失败:", error);
    ElMessage.error(error?.message || "任务日志加载失败");
  }
};

const handleCreateTask = async () => {
  creating.value = true;
  try {
    const { data } = await createAssistantResourceTask({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      resource_types: [
        "explanation_doc",
        "mind_map",
        "exercise_set",
        "extended_reading",
        "html_animation",
        "coding_practice_case"
      ],
      prompt: "请围绕当前课程薄弱点生成一组个性化学习资源"
    });
    ElMessage.success(data.message || "资源生成任务已创建");
    await loadResources();
    if (data.task?.task_id) await loadTaskLogs(data.task.task_id);
  } catch (error: any) {
    console.error("[AiResourceGeneration] 创建资源任务失败:", error);
    ElMessage.error(error?.message || "创建资源任务失败");
  } finally {
    creating.value = false;
  }
};

const openUrl = (url?: string) => {
  if (!url) {
    ElMessage.warning("当前资源暂无可访问链接");
    return;
  }
  window.open(url, "_blank");
};

onMounted(loadResources);
watch(() => [props.courseId, props.targetStudentId], loadResources);
</script>

<template>
  <div
    v-loading="loading"
    class="h-full flex flex-col p-6 bg-gray-50/30 overflow-hidden"
  >
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-gray-800">资源生成工作台</h2>
        <p class="text-sm text-gray-500 mt-1">
          根据学习画像自动推演和生成的专属教学物料
        </p>
      </div>
      <div class="flex gap-2">
        <el-button plain round :icon="Refresh" @click="loadResources">
          刷新
        </el-button>
        <el-button
          type="primary"
          size="large"
          round
          :loading="creating"
          @click="handleCreateTask"
        >
          <template #icon>
            <el-icon><MagicStick /></el-icon>
          </template>
          新建生成任务
        </el-button>
      </div>
    </div>

    <div class="mb-6 flex gap-4">
      <el-input
        v-model="searchQuery"
        placeholder="搜索生成的资源..."
        class="max-w-md"
        :prefix-icon="Search"
      />
      <el-select v-model="resourceType" placeholder="资源类型" class="w-40" clearable>
        <el-option label="全部" value="" />
        <el-option
          v-for="type in resourceTypeOptions"
          :key="type"
          :label="type"
          :value="type"
        />
      </el-select>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      <div class="bg-white border border-gray-100 rounded-xl overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-gray-100 font-bold text-gray-700">
          任务中心
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="task in tasks"
            :key="task.task_id"
            class="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm"
            :class="
              selectedTaskId === task.task_id
                ? 'border-primary bg-primary/5'
                : 'border-gray-100 bg-gray-50/50 hover:border-primary/30'
            "
            @click="loadTaskLogs(task.task_id)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-sm text-gray-700 truncate">{{
                task.stage || task.task_id
              }}</span>
              <el-tag size="small" :type="tagType(task.status)" effect="plain">
                {{ task.status }}
              </el-tag>
            </div>
            <el-progress
              class="mt-3"
              :percentage="task.progress || 0"
              :status="task.status === 'failed' ? 'exception' : undefined"
            />
            <p v-if="task.error_message" class="mt-2 text-xs text-red-500">
              {{ task.error_message }}
            </p>
            <div class="mt-3 flex flex-wrap gap-1">
              <el-tag
                v-for="type in task.resource_types || []"
                :key="type"
                size="small"
                effect="plain"
                class="!rounded-md"
              >
                {{ type }}
              </el-tag>
            </div>
          </div>
          <el-empty v-if="!tasks.length" description="暂无生成任务" />
        </div>
        <div
          v-if="selectedTaskId"
          class="max-h-60 overflow-y-auto border-t border-gray-100 p-4 bg-gray-50/50"
        >
          <el-timeline>
            <el-timeline-item
              v-for="log in taskLogs"
              :key="`${log.occurred_at}-${log.stage}`"
              :timestamp="log.occurred_at"
              :type="tagType(log.status)"
              hollow
            >
              <span class="text-xs text-gray-600">{{ log.message }}</span>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="!taskLogs.length" description="暂无任务日志" :image-size="80" />
        </div>
      </div>

      <div class="overflow-y-auto pr-1">
        <div
          v-if="filteredResources.length"
          class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 auto-rows-max"
        >
          <div
            v-for="res in filteredResources"
            :key="res.resource_id"
            class="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="p-3 rounded-xl text-primary bg-primary/10">
                <el-icon :size="24"><component :is="resourceIcon(res.resource_type)" /></el-icon>
              </div>
              <el-tag
                size="small"
                effect="light"
                class="rounded-full !border-none"
                :type="tagType(res.status)"
              >
                {{ res.resource_type }}
              </el-tag>
            </div>
            <h3
              class="text-lg font-bold text-gray-700 mb-2 group-hover:text-primary transition-colors"
            >
              {{ res.title }}
            </h3>
            <p class="text-sm text-gray-500 mb-3 line-clamp-2">
              {{ res.summary || "暂无摘要" }}
            </p>
            <p v-if="res.recommendation" class="text-xs text-primary mb-4 line-clamp-2">
              {{ res.recommendation }}
            </p>
            <div
              class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50"
            >
              <span>{{ res.status }}</span>
              <div class="flex items-center gap-2">
                <el-button
                  size="small"
                  text
                  type="primary"
                  :icon="View"
                  @click="openUrl(res.preview_url)"
                >
                  预览
                </el-button>
                <el-button
                  size="small"
                  text
                  :icon="Download"
                  @click="openUrl(res.download_url)"
                >
                  下载
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无学习资源" />
      </div>
    </div>
  </div>
</template>

<template>
  <div
    class="generator-container h-full flex flex-col p-6 overflow-y-auto custom-scrollbar"
  >
    <div
      v-show="!generateSuccess"
      class="flex-1 flex flex-col gap-8 max-w-[1400px] mx-auto w-full"
    >
      <!-- 顶部向导 - 宽度铺满 -->
      <div
        class="bg-gradient-to-r from-[var(--el-color-primary-light-9)] to-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-3xl p-8 flex items-start space-x-8 shadow-sm relative overflow-hidden"
      >
        <!-- 装饰性光晕 -->
        <div
          class="absolute -right-20 -top-20 w-64 h-64 bg-[var(--el-color-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"
        />

        <div class="absolute right-0 top-0 opacity-[0.05] blur-[1px]">
          <el-icon class="text-9xl"><MagicStick /></el-icon>
        </div>

        <div
          class="w-20 h-20 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center flex-shrink-0 text-[var(--el-color-primary)] border border-[var(--el-border-color-lighter)] relative z-10"
        >
          <el-icon class="text-4xl"><Cpu /></el-icon>
        </div>

        <div class="flex-1 relative z-10">
          <h3
            class="text-2xl font-bold text-[var(--el-text-color-primary)] mb-2 tracking-tight"
          >
            AI 教案智能生成工作台
          </h3>
          <p
            class="text-base text-[var(--el-text-color-regular)] leading-relaxed max-w-4xl opacity-90 font-medium"
          >
            欢迎使用 AI
            教学辅助系统。请在左侧课程中心选择目标课程，并在下方指定该课程的教学章节。我们将调用业内领先的教育大模型，为您深度拆解教学重难点，并输出一份结构完整的标准化教案。
          </p>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        <!-- 主要选择区 - 占据核心位置 -->
        <div
          class="lg:col-span-8 bg-[var(--el-bg-color-overlay)] rounded-3xl p-12 border border-[var(--el-border-color-light)] shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[460px]"
        >
          <!-- 背景装饰 -->
          <div
            class="absolute -top-32 -right-32 w-96 h-96 bg-[var(--el-color-primary)] opacity-[0.04] rounded-full blur-3xl pointer-events-none"
          />
          <div
            class="absolute -bottom-16 -left-16 w-64 h-64 bg-[var(--el-color-success)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"
          />

          <el-form
            :model="form"
            label-position="top"
            class="w-full relative z-10"
          >
            <el-form-item class="!mb-14">
              <template #label>
                <div class="flex items-center justify-between w-full mb-6">
                  <span
                    class="flex items-center text-xl font-bold text-[var(--el-text-color-primary)]"
                  >
                    <el-icon class="mr-3 text-[var(--el-color-primary)]"
                      ><Management
                    /></el-icon>
                    指定生成章节
                  </span>
                  <div class="flex items-center gap-3">
                    <el-tag
                      v-if="props.courseId"
                      size="large"
                      type="success"
                      effect="plain"
                      class="!rounded-xl border-[var(--el-color-success-light-5)]"
                    >
                      <span class="flex items-center"
                        ><el-icon class="mr-1"><Check /></el-icon>
                        课程已关联</span
                      >
                    </el-tag>
                  </div>
                </div>
              </template>

              <el-select
                v-model="form.chapterId"
                placeholder="请点击下拉菜单选择需要生成教案的章节内容"
                class="w-full custom-select-large"
                size="large"
                :loading="chapterLoading"
                :disabled="!props.courseId"
              >
                <template #empty>
                  <div
                    class="py-14 text-center text-[var(--el-text-color-placeholder)]"
                  >
                    <el-icon class="text-6xl mb-4 opacity-20"><Box /></el-icon>
                    <p v-if="!props.courseId" class="text-base font-bold">
                      请先在左侧课程中心激活目标课程
                    </p>
                    <p v-else class="text-base">
                      该课程暂无章节数据，请先维护课程章节
                    </p>
                  </div>
                </template>
                <el-option
                  v-for="chapter in chapterOptions"
                  :key="chapter.chapterId"
                  :label="chapter.name"
                  :value="chapter.chapterId"
                />
              </el-select>
            </el-form-item>

            <div
              class="flex flex-col items-center justify-center pt-8 border-t border-[var(--el-border-color-lighter)]"
            >
              <el-button
                type="primary"
                :disabled="!props.courseId || !form.chapterId"
                :loading="loading"
                size="large"
                class="!rounded-2xl !px-20 !h-16 !text-xl shadow-2xl shadow-[var(--el-color-primary-light-7)] transform transition-all hover:scale-[1.02] hover:-translate-y-1 active:scale-95"
                @click="generatePlan"
              >
                <template #icon>
                  <el-icon v-if="!loading" class="mr-2"><MagicStick /></el-icon>
                </template>
                {{
                  loading
                    ? "大模型深度计算生成中..."
                    : "立即开启 AI 智能解析生成"
                }}
              </el-button>
              <p
                class="mt-8 text-sm text-[var(--el-text-color-placeholder)] flex items-center"
              >
                <el-icon class="mr-2 text-[var(--el-color-warning)]"
                  ><InfoFilled
                /></el-icon>
                AI 将根据章节内容自动撰写 MD 格式教案，预计耗时 15-30 秒。
              </p>
            </div>
          </el-form>
        </div>

        <!-- 侧边特性区 -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <div
            class="flex-1 group p-8 bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-3xl transition-all duration-300 hover:border-[var(--el-color-primary-light-3)] hover:shadow-xl flex flex-col items-center text-center justify-center"
          >
            <div
              class="w-16 h-16 bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6"
            >
              <el-icon class="text-4xl"><Star /></el-icon>
            </div>
            <h4
              class="font-bold text-lg text-[var(--el-text-color-primary)] mb-3"
            >
              深度知识解析
            </h4>
            <p
              class="text-sm text-[var(--el-text-color-secondary)] leading-relaxed opacity-80"
            >
              自动提取章节核心知识点，并进行教学维度的重难点标注与分层教学建议。
            </p>
          </div>

          <div
            class="flex-1 group p-8 bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-3xl transition-all duration-300 hover:border-[var(--el-color-primary-light-3)] hover:shadow-xl flex flex-col items-center text-center justify-center"
          >
            <div
              class="w-16 h-16 bg-[var(--el-color-primary-light-9)] text-[var(--el-color-primary)] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6"
            >
              <el-icon class="text-4xl"><CopyDocument /></el-icon>
            </div>
            <h4
              class="font-bold text-lg text-[var(--el-text-color-primary)] mb-3"
            >
              全流程结构
            </h4>
            <p
              class="text-sm text-[var(--el-text-color-secondary)] leading-relaxed opacity-80"
            >
              产出包含导入、讲授、练习全环节的标准化教案文档，支持 Markdown
              导出。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功结果页 - 垂直居中铺满 -->
    <div
      v-if="generateSuccess"
      class="flex-1 flex flex-col items-center justify-center text-center bg-[var(--el-bg-color-overlay)] rounded-3xl border border-[var(--el-border-color-light)] shadow-lg p-20 max-w-4xl mx-auto w-full my-auto"
    >
      <div
        class="w-32 h-32 bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)] rounded-full flex items-center justify-center mb-10 shadow-inner animate-bounce"
      >
        <el-icon class="text-7xl"><Check /></el-icon>
      </div>
      <h2 class="text-4xl font-bold text-[var(--el-text-color-primary)] mb-6">
        教案智算任务已入列
      </h2>
      <p
        class="text-lg text-[var(--el-text-color-secondary)] mb-14 max-w-xl mx-auto leading-relaxed"
      >
        教案生成请求已成功发送至 AI 计算引擎！<br />
        您可以前往“教案库”跟踪生成进度，完成后即可管理与下载。
      </p>
      <div class="flex justify-center gap-8">
        <el-button
          type="primary"
          size="large"
          class="!rounded-2xl px-16 !h-16 !text-lg shadow-xl"
          @click="viewPlanList"
        >
          立即前往教案库
        </el-button>
        <el-button
          size="large"
          class="!rounded-2xl px-16 !h-16 !text-lg shadow-sm border-[var(--el-border-color-light)]"
          @click="generateSuccess = false"
        >
          返回继续生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { getCourseHoursList, generateTeacherPlan } from "@/api/course";
import {
  Management,
  Cpu,
  Setting,
  Star,
  CopyDocument,
  EditPen,
  Check,
  Warning
} from "@element-plus/icons-vue";

const props = defineProps({
  courseId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(["switch-tab"]);

// 表单数据
const form = reactive({
  chapterId: null
});

// 数据加载状态
const loading = ref(false);
const chapterLoading = ref(false);

// 章节选项
const chapterOptions = ref([]);

// 生成成功标志
const generateSuccess = ref(false);

// 获取章节列表
const fetchChapters = async (courseId: number) => {
  if (!courseId) {
    chapterOptions.value = [];
    return;
  }

  chapterLoading.value = true;
  try {
    const res = await getCourseHoursList({
      courseId: courseId
    });

    if (res && res.code === 200 && res.data) {
      // API 可能返回 hoursList 或 courseChapters，这里根据实际情况处理
      chapterOptions.value =
        res.data.hoursList || res.data.courseChapters || [];
    } else {
      ElMessage.warning("获取章节列表失败");
    }
  } catch (error) {
    console.error("获取章节列表失败:", error);
    ElMessage.error("获取章节列表失败");
  } finally {
    chapterLoading.value = false;
  }
};

// 监听课程变化
watch(
  () => props.courseId,
  newId => {
    form.chapterId = null;
    if (newId) {
      fetchChapters(newId);
    } else {
      chapterOptions.value = [];
    }
  },
  { immediate: true }
);

// 生成教案
const generatePlan = async () => {
  if (!props.courseId || !form.chapterId) {
    ElMessage.warning("请选择课程和章节");
    return;
  }

  loading.value = true;
  try {
    const res = await generateTeacherPlan({
      courseId: props.courseId,
      chapterId: form.chapterId
    });

    if (res && res.code === 200) {
      generateSuccess.value = true;
      ElMessage.success("已成功提交 AI 生成请求");
    } else {
      ElMessage.error(res.message || "提交生成请求失败");
    }
  } catch (error) {
    console.error("生成教案失败:", error);
    ElMessage.error("网络异常，请稍后再试");
  } finally {
    loading.value = false;
  }
};

// 切换到教案库
const viewPlanList = () => {
  emit("switch-tab", "list");
};

onMounted(() => {
  if (props.courseId) {
    fetchChapters(props.courseId);
  }
});
</script>

<style lang="scss" scoped>
.generator-container {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-select :deep(.el-input__wrapper) {
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }

  &.is-focus {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
  }
}

:deep(.el-form-item__label) {
  width: 100%;
}
</style>

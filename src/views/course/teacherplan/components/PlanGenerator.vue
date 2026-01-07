<template>
  <div class="generator-container max-w-4xl mx-auto py-8">
    <div v-show="!generateSuccess" class="space-y-8">
      <div class="flex items-center space-x-4 mb-4">
        <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
          <el-icon class="text-2xl"><MagicStick /></el-icon>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">配置教案需求</h2>
          <p class="text-gray-500 text-sm">只需三个简单步骤，AI 将为您量身定制专业教案</p>
        </div>
      </div>

      <div class="bg-indigo-50/50 rounded-2xl p-8 border border-indigo-100/50 relative overflow-hidden">
        <!-- 步骤索引背景 -->
        <div class="absolute -right-10 -bottom-10 text-[200px] font-black text-indigo-100/30 select-none">1</div>

        <el-form :model="form" label-position="top" class="relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <el-form-item label="选择目标课程" class="!mb-0">
              <template #label>
                <span class="flex items-center text-gray-700 font-bold mb-2">
                  <el-icon class="mr-1"><Reading /></el-icon> 目标课程
                </span>
              </template>
              <el-select
                v-model="form.courseId"
                placeholder="搜索或选择课程"
                filterable
                remote
                :remote-method="searchCourses"
                :loading="courseLoading"
                @change="handleCourseChange"
                class="w-full !rounded-xl overflow-hidden"
                size="large"
              >
                <el-option
                  v-for="course in courseOptions"
                  :key="course.courseId"
                  :label="course.title"
                  :value="course.courseId"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="指定教学章节" class="!mb-0">
              <template #label>
                <span class="flex items-center text-gray-700 font-bold mb-2">
                  <el-icon class="mr-1"><Management /></el-icon> 对应章节
                </span>
              </template>
              <el-select
                v-model="form.chapterId"
                placeholder="请选择课程内的章节"
                :disabled="!form.courseId"
                class="w-full !rounded-xl overflow-hidden"
                size="large"
              >
                <el-option
                  v-for="chapter in chapterOptions"
                  :key="chapter.chapterId"
                  :label="chapter.name"
                  :value="chapter.chapterId"
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="mt-8 pt-8 border-t border-indigo-100/50">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <div class="flex items-center space-x-2 text-indigo-600 text-sm">
                <el-icon class="animate-spin"><Setting /></el-icon>
                <span>AI 支持：课程大纲分析、课后练习生成、重点难点标注</span>
              </div>
              <el-button
                type="primary"
                :disabled="!form.courseId || !form.chapterId"
                :loading="loading"
                size="large"
                class="min-w-[200px] !rounded-xl !h-12 !text-base bg-indigo-600 border-none hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                @click="generatePlan"
              >
                <template #icon>
                  <el-icon v-if="!loading"><Cpu /></el-icon>
                </template>
                立即生成 AI 教案
              </el-button>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 特性展示 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div class="flex items-center p-4 bg-white border border-gray-100 rounded-xl">
          <div class="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mr-3">
            <el-icon><Star /></el-icon>
          </div>
          <div class="text-sm">
            <div class="font-bold">深度解析</div>
            <div class="text-gray-400 text-xs">自动提炼核心知识点</div>
          </div>
        </div>
        <div class="flex items-center p-4 bg-white border border-gray-100 rounded-xl">
          <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
            <el-icon><CopyDocument /></el-icon>
          </div>
          <div class="text-sm">
            <div class="font-bold">结构完整</div>
            <div class="text-gray-400 text-xs">包含导入、讲解、练习</div>
          </div>
        </div>
        <div class="flex items-center p-4 bg-white border border-gray-100 rounded-xl">
          <div class="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mr-3">
            <el-icon><EditPen /></el-icon>
          </div>
          <div class="text-sm">
            <div class="font-bold">个性定制</div>
            <div class="text-gray-400 text-xs">可根据反馈持续优化</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结果提示 -->
    <div v-if="generateSuccess" class="py-12 flex flex-col items-center">
      <div class="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
        <el-icon class="text-5xl"><Check /></el-icon>
      </div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">教案生成请求已提交</h2>
      <p class="text-gray-500 mb-10 text-center max-w-md">
        AI 助手正在为您精心准备教案，这可能需要一点点时间。您可以返回列表查看生成进度和最终结果。
      </p>
      <div class="flex gap-4">
        <el-button
          type="primary"
          size="large"
          class="!rounded-xl px-12"
          @click="viewPlanList"
        >
          查看教案库
        </el-button>
        <el-button
          size="large"
          class="!rounded-xl px-12"
          @click="generateSuccess = false"
        >
          继续生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCourseList, getCourseHoursList, generateTeacherPlan } from "@/api/course";
import { MagicStick, Reading, Management, Cpu, Setting, Star, CopyDocument, EditPen, Check } from "@element-plus/icons-vue";

const emit = defineEmits(["switch-tab"]);

// 表单数据
const form = reactive({
  courseId: null,
  chapterId: null
});

// 数据加载状态
const loading = ref(false);
const courseLoading = ref(false);
const chapterLoading = ref(false);

// 课程和章节选项
const courseOptions = ref([]);
const chapterOptions = ref([]);

// 生成成功标志
const generateSuccess = ref(false);

// 搜索课程
const searchCourses = async (query: string) => {
  if (!query) {
    await fetchInitialCourses();
    return;
  }

  courseLoading.value = true;
  try {
    const res = await getCourseList({
      pageNum: 1,
      pageSize: 20,
      courseName: query
    });

    if (res && res.code === 200 && res.data) {
      courseOptions.value = res.data.courseList || [];
    } else {
      ElMessage.warning("获取课程列表失败");
    }
  } catch (error) {
    console.error("搜索课程失败:", error);
    ElMessage.error("搜索课程失败");
  } finally {
    courseLoading.value = false;
  }
};

// 获取初始课程列表
const fetchInitialCourses = async () => {
  courseLoading.value = true;
  try {
    const res = await getCourseList({
      pageNum: 1,
      pageSize: 20
    });

    if (res && res.code === 200 && res.data) {
      courseOptions.value = res.data.courseList || [];
    } else {
      ElMessage.warning("获取课程列表失败");
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
    ElMessage.error("获取课程列表失败");
  } finally {
    courseLoading.value = false;
  }
};

// 处理课程选择变化
const handleCourseChange = async (courseId: number) => {
  form.chapterId = null;
  chapterOptions.value = [];
  
  if (!courseId) return;

  chapterLoading.value = true;
  try {
    const res = await getCourseHoursList({ courseId });

    if (res && res.code === 200 && res.data) {
      chapterOptions.value = res.data.courseChapters || [];
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

// 生成教案
const generatePlan = async () => {
  if (!form.courseId || !form.chapterId) {
    ElMessage.warning("请选择课程和章节");
    return;
  }

  loading.value = true;
  try {
    const res = await generateTeacherPlan({
      course_id: form.courseId,
      chapter_id: form.chapterId
    });

    if (res && res.code === 200) {
      ElMessage.success("教案生成请求已提交");
      generateSuccess.value = true;
    } else {
      ElMessage.error(res?.msg || "提交教案生成请求失败");
    }
  } catch (error) {
    console.error("提交教案生成请求失败:", error);
    ElMessage.error("提交教案生成请求失败");
  } finally {
    loading.value = false;
  }
};

// 跳转到教案列表页面
const viewPlanList = () => {
  emit("switch-tab", "list");
};

// 组件挂载时获取初始课程列表
fetchInitialCourses();
</script>

<style lang="scss" scoped>
.generator-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
</style> 
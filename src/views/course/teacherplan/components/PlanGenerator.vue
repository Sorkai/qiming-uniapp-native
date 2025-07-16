<template>
  <div class="generator-container" v-loading="loading">
    <el-form :model="form" label-width="120px">
      <el-form-item label="选择课程">
        <el-select
          v-model="form.courseId"
          placeholder="请选择课程"
          filterable
          remote
          :remote-method="searchCourses"
          :loading="courseLoading"
          @change="handleCourseChange"
          style="width: 100%"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.courseId"
            :label="course.title"
            :value="course.courseId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="选择章节">
        <el-select
          v-model="form.chapterId"
          placeholder="请选择章节"
          :disabled="!form.courseId"
          style="width: 100%"
        >
          <el-option
            v-for="chapter in chapterOptions"
            :key="chapter.chapterId"
            :label="chapter.name"
            :value="chapter.chapterId"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :disabled="!form.courseId || !form.chapterId"
          @click="generatePlan"
        >
          生成教案
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 结果提示 -->
    <el-result
      v-if="generateSuccess"
      icon="success"
      title="教案生成请求已提交"
      sub-title="您可以在「教案列表」中查看生成进度和结果"
    >
      <template #extra>
        <el-button type="primary" @click="viewPlanList">查看教案列表</el-button>
      </template>
    </el-result>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { getCourseList, getCourseHoursList, generateTeacherPlan } from "@/api/course";

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
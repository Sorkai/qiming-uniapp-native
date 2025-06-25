<template>
  <div class="assessment-container">
    <el-card>
      <div class="card-header">
        <div class="course-selector">
          <span class="label">选择课程：</span>
          <el-select
            v-model="selectedCourseId"
            filterable
            remote
            placeholder="请选择或搜索课程"
            :remote-method="searchCourses"
            :loading="courseLoading"
            @change="handleCourseChange"
            style="width: 350px"
            clearable
          >
            <el-option
              v-for="course in courseOptions"
              :key="course.courseId"
              :label="course.title"
              :value="course.courseId"
            >
              <div class="course-option">
                <el-image
                  :src="course.thumbUrl"
                  style="width: 40px; height: 30px; margin-right: 10px"
                  fit="cover"
                >
                  <template #error>
                    <div class="image-placeholder">无图</div>
                  </template>
                </el-image>
                <span>{{ course.title }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
        <div class="course-info" v-if="currentCourse">
          <el-tag>{{ currentCourse.isRequired === 1 ? '必修' : '选修' }}</el-tag>
          <span class="info-item">创建人: {{ currentCourse.userName }}</span>
        </div>
      </div>

      <div v-if="!selectedCourseId" class="empty-tip">
        <el-empty description="请先选择一个课程" />
      </div>

      <div v-else>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="课程作业" name="homework">
            <!-- 作业管理内容 -->
            <homework-management :course-id="selectedCourseId" />
          </el-tab-pane>
          <el-tab-pane label="课程考试" name="exam">
            <!-- 考试管理内容 -->
            <exam-management :course-id="selectedCourseId" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCourseList } from "@/api/course";
import HomeworkManagement from "./components/HomeworkManagement.vue";
import ExamManagement from "./components/ExamManagement.vue";

// 标签页控制
const activeTab = ref("homework");

// 课程选择相关
const selectedCourseId = ref(null);
const courseOptions = ref([]);
const courseLoading = ref(false);
const currentCourse = ref(null);

// 搜索课程
const searchCourses = async (query: string) => {
  if (query) {
    courseLoading.value = true;
    try {
      const { data } = await getCourseList({
        pageNum: 1,
        pageSize: 20,
        courseName: query
      });
      courseOptions.value = data.courseList;
    } catch (error) {
      console.error("搜索课程失败", error);
      ElMessage.error("搜索课程失败");
    } finally {
      courseLoading.value = false;
    }
  }
};

// 获取初始课程列表
const fetchInitialCourses = async () => {
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({
      pageNum: 1,
      pageSize: 20
    });
    courseOptions.value = data.courseList;
  } catch (error) {
    console.error("获取课程列表失败", error);
    ElMessage.error("获取课程列表失败");
  } finally {
    courseLoading.value = false;
  }
};

// 处理课程选择变化
const handleCourseChange = (courseId: number) => {
  if (!courseId) {
    currentCourse.value = null;
    return;
  }
  
  const selectedCourse = courseOptions.value.find(
    (course) => course.courseId === courseId
  );
  if (selectedCourse) {
    currentCourse.value = selectedCourse;
  }
};

// 页面加载时获取初始课程列表
onMounted(() => {
  fetchInitialCourses();
});
</script>

<style lang="scss" scoped>
.assessment-container {
  margin: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-selector {
  display: flex;
  align-items: center;

  .label {
    margin-right: 10px;
    font-weight: bold;
  }
}

.course-option {
  display: flex;
  align-items: center;
}

.image-placeholder {
  width: 40px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.course-info {
  display: flex;
  align-items: center;

  .info-item {
    margin-left: 10px;
    color: #606266;
  }
}

.empty-tip {
  padding: 60px 0;
}
</style> 
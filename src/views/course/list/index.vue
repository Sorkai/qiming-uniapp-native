<template>
  <div class="main">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" @click="openCreateDialog"
            >创建课程</el-button
          >
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input
            v-model="searchForm.courseName"
            placeholder="请输入课程名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="courseList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="courseId" label="ID" width="60" />
        <el-table-column label="封面" width="120">
          <template #default="scope">
            <el-image
              style="width: 80px; height: 80px"
              :src="scope.row.thumbUrl"
              fit="cover"
              :preview-src-list="[scope.row.thumbUrl]"
              :initial-index="0"
              teleported
              preview-teleported
            >
              <template #error>
                <div class="image-placeholder">无图片</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="课程标题"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="shortDesc"
          label="课程简介"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="categoryDesc"
          label="分类描述"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column label="分类列表" min-width="120">
          <template #default="scope">
            <div
              v-if="scope.row.categoryList && scope.row.categoryList.length > 0"
              class="category-tags"
            >
              <el-tag
                v-for="category in scope.row.categoryList"
                :key="category.categoryId"
                size="small"
                class="category-tag"
              >
                {{ category.name }}
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="必修/选修" width="90">
          <template #default="scope">
            <el-tag
              :type="scope.row.isRequired === 1 ? 'danger' : 'info'"
              size="small"
            >
              {{ scope.row.isRequired === 1 ? "必修" : "选修" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="创建人" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="150" />
        <el-table-column prop="endTime" label="结束时间" width="150" />
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <div class="button-row">
                <!-- <el-button size="small" @click="viewCourse(scope.row)"
                  >查看</el-button
                > -->
                <el-button
                  size="small"
                  type="primary"
                  @click="editCourse(scope.row)"
                  >编辑</el-button
                >
              </div>
              <div class="button-row">
                <el-button size="small" @click="viewHours(scope.row)"
                  >课时</el-button
                >
                <el-button size="small" @click="viewAttrs(scope.row)"
                  >附件</el-button
                >
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 课程详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="课程详情" width="70%">
      <div v-loading="detailLoading">
        <div v-if="!detailLoading && !courseDetail" class="empty-state">
          未找到课程信息或加载失败
        </div>
        <div v-else class="course-detail">
          <div class="course-header">
            <div class="course-thumb">
              <el-image
                style="width: 200px; height: 120px"
                :src="courseDetail?.thumbUrl"
                fit="cover"
                :preview-src-list="
                  courseDetail?.thumbUrl ? [courseDetail.thumbUrl] : []
                "
                :initial-index="0"
                teleported
                preview-teleported
              >
                <template #error>
                  <div class="image-placeholder">无图片</div>
                </template>
              </el-image>
            </div>
            <div class="course-info">
              <h2>{{ courseDetail?.title }}</h2>
              <p class="course-desc">{{ courseDetail?.shortDesc }}</p>
              <div class="meta-info">
                <span class="meta-item">
                  <label>分类描述:</label>
                  <span>{{ courseDetail?.categoryDesc || "-" }}</span>
                </span>
                <span class="meta-item">
                  <label>必修/选修:</label>
                  <el-tag
                    :type="courseDetail?.isRequired === 1 ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ courseDetail?.isRequired === 1 ? "必修" : "选修" }}
                  </el-tag>
                </span>
                <span class="meta-item">
                  <label>创建人:</label>
                  {{ courseDetail?.userName }}
                </span>
              </div>
              <div class="meta-info">
                <span class="meta-item">
                  <label>开始时间:</label>
                  <span>{{ courseDetail?.startTime || "-" }}</span>
                </span>
                <span class="meta-item">
                  <label>结束时间:</label>
                  <span>{{ courseDetail?.endTime || "-" }}</span>
                </span>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 课程分类 -->
          <div
            v-if="
              courseDetail?.categoryList && courseDetail.categoryList.length > 0
            "
            class="detail-section"
          >
            <h3>课程分类</h3>
            <div class="category-list">
              <el-tag
                v-for="category in courseDetail?.categoryList"
                :key="category.categoryId"
                class="category-tag"
              >
                {{ category.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- <el-button type="primary" @click="editCourse(courseDetail)"
            >编辑课程</el-button
          > -->
        </div>
      </template>
    </el-dialog>

    <!-- 课时列表弹窗 -->
    <el-dialog v-model="hoursDialogVisible" title="课时列表" width="70%">
      <div v-loading="hoursLoading">
        <div
          v-if="!hoursLoading && courseHours.length === 0"
          class="empty-state"
        >
          该课程暂无课时信息
        </div>
        <div v-else>
          <!-- 课程信息头部 -->
          <div v-if="currentCourse" class="course-header">
            <div class="course-info">
              <h2>{{ currentCourse.title }}</h2>
              <div class="meta-info">
                <span class="meta-item">
                  <label>类型:</label>
                  <el-tag
                    :type="currentCourse.isRequired === 1 ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ currentCourse.isRequired === 1 ? "必修" : "选修" }}
                  </el-tag>
                </span>
                <span class="meta-item">
                  <label>创建人:</label>
                  {{ currentCourse.userName }}
                </span>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 章节和课时内容 -->
          <div class="chapter-list">
            <div
              v-for="chapter in courseHours"
              :key="'chapter-' + chapter.chapterId"
              class="chapter-item"
            >
              <div class="chapter-title">
                {{ chapter.name }}
              </div>

              <el-table
                :data="chapter.hourList"
                stripe
                style="width: 100%"
                border
              >
                <el-table-column prop="hourId" label="ID" width="80" />
                <el-table-column
                  prop="title"
                  label="课时标题"
                  min-width="150"
                />
                <el-table-column label="时长" width="100">
                  <template #default="scope">
                    <span>{{ formatDuration(scope.row.duration) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="资源类型" width="100">
                  <template #default="scope">
                    <el-tag size="small">{{ scope.row.rType }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      @click="previewResource(scope.row)"
                      >预览</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 附件列表弹窗 -->
    <el-dialog v-model="attrDialogVisible" title="附件列表" width="60%">
      <div v-loading="attrLoading">
        <div v-if="courseAttrs.length === 0" class="empty-text">
          该课程暂无附件
        </div>
        <el-table v-else :data="courseAttrs" stripe style="width: 100%">
          <el-table-column prop="attrId" label="ID" width="80" />
          <el-table-column prop="title" label="附件标题" />
          <el-table-column prop="rType" label="类型" width="100" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button
                v-if="scope.row.fileUrl"
                size="small"
                @click="downloadAttachment(scope.row)"
                >下载</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 创建/编辑课程弹窗 -->
    <el-dialog
      v-model="courseFormDialogVisible"
      :title="isEdit ? '编辑课程' : '创建课程'"
      width="80%"
      :close-on-click-modal="false"
      destroy-on-close
      class="course-form-dialog"
    >
      <div class="dialog-content-wrapper">
        <CourseForm
          ref="courseFormRef"
          v-model="courseForm"
          :loading="courseFormLoading"
          :is-edit="isEdit"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="courseFormDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCourseForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";
import {
  getCourseList,
  getCourseHoursList,
  getCourseAttrList,
  getCourseDetail,
  createCourse,
  updateCourse
} from "@/api/course";
import CourseForm from "./components/CourseForm.vue";

const courseFormRef = ref<InstanceType<typeof ElForm>>();

// 数据定义
const courseList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const searchForm = ref({
  courseName: ""
});

// 课时列表相关
const hoursDialogVisible = ref(false);
const hoursLoading = ref(false);
const courseHours = ref([]);
const currentCourse = ref(null);

// 附件列表相关
const attrDialogVisible = ref(false);
const attrLoading = ref(false);
const courseAttrs = ref([]);

// 课程详情相关
const detailDialogVisible = ref(false);
const detailLoading = ref(false);
const courseDetail = ref(null);

// 课程表单相关
const courseFormDialogVisible = ref(false);
const courseFormLoading = ref(false);
const isEdit = ref(false);
const courseForm = ref({
  courseId: 0,
  title: "",
  shortDesc: "",
  thumb: 0,
  thumb_url: "",
  isRequired: 1,
  isChapter: 0,
  categoryIds: [],
  endingTime: "",
  chapterList: [],
  hourList: [],
  attrList: []
});

// 表单验证规则
const courseFormRules = {
  title: [{ required: true, message: "请输入课程标题", trigger: "blur" }],
  shortDesc: [{ required: true, message: "请输入课程简介", trigger: "blur" }],
  thumb: [
    {
      required: true,
      type: "number",
      min: 1,
      message: "请上传课程封面",
      trigger: "change"
    }
  ],
  categoryIds: [
    {
      required: true,
      type: "array",
      min: 1,
      message: "请选择课程分类",
      trigger: "change"
    }
  ],
  endingTime: [{ required: true, message: "请选择结束时间", trigger: "change" }]
};

// 格式化时长显示
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}分${remainingSeconds}秒`;
};

// 处理封面图片选择
const handleThumbChange = file => {
  // 通常这里应该上传文件到服务器，这里仅做演示，使用本地URL预览
  courseForm.value.thumb_url = URL.createObjectURL(file.raw); // 使用thumb_url字段与API参数一致
  // 假设上传成功后服务器返回资源ID
  courseForm.value.thumb = 1001; // 实际项目中应该使用服务器返回的资源ID
};

// 提交课程表单
const submitCourseForm = async () => {
  if (!courseFormRef.value) return;

  try {
    // 使用表单组件的验证方法
    const valid = await courseFormRef.value.validate();

    if (valid) {
      courseFormLoading.value = true;

      // 准备提交数据
      const formData = { ...courseForm.value };
      let submitData;

      if (isEdit.value) {
        // 编辑模式，移除不需要的字段
        const { thumb_url, hourList, chapterList, attrList, ...updateData } =
          formData;
        submitData = {
          ...updateData,
          thumbUrl: thumb_url // 字段名转换
        };

        // 调用更新接口
        const res = await updateCourse(submitData);

        if (res && res.code === 200) {
          ElMessage.success("课程更新成功");
          courseFormDialogVisible.value = false;
          fetchCourseList(); // 刷新列表
        } else {
          ElMessage.error("课程更新失败");
        }
      } else {
        // 创建模式
        if (formData.isChapter === 1) {
          // 有章节模式，移除顶层hourList
          const { hourList, ...chapterData } = formData;
          submitData = chapterData;
        } else {
          // 无章节模式，保留顶层hourList，移除chapterList
          const { chapterList, ...hourData } = formData;
          submitData = hourData;
        }

        // 调用创建接口
        const res = await createCourse(submitData);

        if (res && res.code === 200) {
          ElMessage.success("课程创建成功");
          courseFormDialogVisible.value = false;
          fetchCourseList(); // 刷新列表
        } else {
          ElMessage.error("课程创建失败");
        }
      }
    }
  } catch (error) {
    console.error(isEdit.value ? "更新课程失败:" : "创建课程失败:", error);
    ElMessage.error(isEdit.value ? "更新课程失败" : "创建课程失败");
  } finally {
    courseFormLoading.value = false;
  }
};

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchCourseList();
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchCourseList();
};

// 搜索课程
const handleSearch = () => {
  currentPage.value = 1;
  fetchCourseList();
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.value.courseName = "";
  handleSearch();
};

// 获取课程列表数据
const fetchCourseList = async () => {
  loading.value = true;
  try {
    const res = await getCourseList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      courseName: searchForm.value.courseName
    });

    if (res && res.code === 200 && res.data) {
      courseList.value = res.data.courseList || [];
      total.value = res.data.total || 0;
    } else {
      courseList.value = [];
      total.value = 0;
      ElMessage.warning("获取课程列表失败");
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
    ElMessage.error("获取课程列表失败");
  } finally {
    loading.value = false;
  }
};

// 打开创建课程弹窗
const openCreateDialog = () => {
  isEdit.value = false;
  courseForm.value = {
    courseId: 0,
    title: "",
    shortDesc: "",
    thumb: 0,
    thumb_url: "", // 使用thumb_url字段与API参数一致
    isRequired: 1,
    isChapter: 1, // 默认为有章节模式
    categoryIds: [],
    endingTime: "",
    chapterList: [],
    hourList: [],
    attrList: []
  };
  courseFormDialogVisible.value = true;
};

// 查看课程详情
const viewCourse = async course => {
  currentCourse.value = course;
  detailDialogVisible.value = true;
  detailLoading.value = true;

  try {
    const res = await getCourseDetail({
      courseId: course.courseId
    });

    if (res && res.code === 200 && res.data) {
      courseDetail.value = res.data;
    } else {
      courseDetail.value = null;
      ElMessage.warning("获取课程详情失败");
    }
  } catch (error) {
    console.error("获取课程详情失败:", error);
    ElMessage.error("获取课程详情失败");
  } finally {
    detailLoading.value = false;
  }
};

// 编辑课程
const editCourse = course => {
  isEdit.value = true;
  // 关闭详情弹窗（如果打开了）
  detailDialogVisible.value = false;

  // 填充表单数据
  courseForm.value = {
    courseId: course.courseId,
    title: course.title,
    shortDesc: course.shortDesc || "",
    thumb: course.thumb || 0,
    thumb_url: course.thumbUrl || "", // 从API返回的thumbUrl映射到表单的thumb_url字段
    isRequired: course.isRequired !== undefined ? course.isRequired : 1,
    isChapter: course.isChapter !== undefined ? course.isChapter : 0,
    categoryIds: course.categoryList
      ? course.categoryList.map(c => c.categoryId)
      : [],
    endingTime: course.endTime || "",
    chapterList: course.chapterList || [],
    hourList: course.hourList || [],
    attrList: course.attrList || []
  };

  courseFormDialogVisible.value = true;
};

// 查看课时列表
const viewHours = async course => {
  currentCourse.value = course;
  hoursDialogVisible.value = true;
  hoursLoading.value = true;

  try {
    const res = await getCourseHoursList({
      courseId: course.courseId
    });

    if (res && res.code === 200 && res.data) {
      courseHours.value = res.data.courseChapters || [];
    } else {
      courseHours.value = [];
      ElMessage.warning("获取课时列表失败");
    }
  } catch (error) {
    console.error("获取课时列表失败:", error);
    ElMessage.error("获取课时列表失败");
  } finally {
    hoursLoading.value = false;
  }
};

// 查看附件列表
const viewAttrs = async course => {
  currentCourse.value = course;
  attrDialogVisible.value = true;
  attrLoading.value = true;

  try {
    const res = await getCourseAttrList({
      courseId: course.courseId
    });

    if (res && res.code === 200 && res.data) {
      courseAttrs.value = res.data.courseWares || [];
    } else {
      courseAttrs.value = [];
      ElMessage.warning("获取课程附件列表失败");
    }
  } catch (error) {
    console.error("获取课程附件列表失败:", error);
    ElMessage.error("获取课程附件列表失败");
  } finally {
    attrLoading.value = false;
  }
};

// 预览资源
const previewResource = resource => {
  if (resource.fileUrl) {
    window.open(resource.fileUrl);
  } else {
    ElMessage.warning("无效的资源链接");
  }
};

// 下载附件
const downloadAttachment = attachment => {
  if (attachment.fileUrl) {
    window.open(attachment.fileUrl);
  } else {
    ElMessage.warning("无效的附件链接");
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchCourseList();
});
</script>

<style lang="scss" scoped>
.main {
  margin: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.chapter-item {
  margin-bottom: 20px;
}

.chapter-title {
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  font-weight: bold;
  font-size: 16px;
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.image-placeholder {
  width: 80px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 16px;
}

.course-header {
  display: flex;
  margin-bottom: 20px;
}

.course-thumb {
  margin-right: 20px;
}

.course-info {
  flex: 1;

  h2 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  .course-desc {
    color: #606266;
    margin-bottom: 15px;
  }
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
}

.meta-item {
  margin-right: 20px;
  margin-bottom: 10px;

  label {
    color: #909399;
    margin-right: 5px;
  }
}

.detail-section {
  margin-top: 15px;
  margin-bottom: 15px;

  h3 {
    margin-top: 0;
    font-size: 16px;
    color: #303133;
  }
}

.category-list {
  display: flex;
  flex-wrap: wrap;
}

.category-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.upload-box {
  display: flex;
}

.upload-preview {
  position: relative;

  .upload-actions {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}

.upload-trigger {
  height: 120px;
  width: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .upload-hint {
    color: #909399;
    font-size: 12px;
    margin-top: 10px;
  }
}

// 添加标签样式
.el-tag {
  margin-right: 5px;
}

// 修改操作按钮样式
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-row {
  display: flex;
  gap: 8px;

  .el-button {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

// 避免每行只显示一个标签
.category-tag {
  margin: 0;
}

.course-form-dialog {
  .dialog-content-wrapper {
    max-height: 55vh;
    overflow-y: auto;
    padding-right: 10px;
  }
}
</style>

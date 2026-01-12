<template>
  <div class="main p-4">
    <!-- 统计概览 -->
    <CourseStats :stats="courseStats" />

    <el-card shadow="never" class="mb-4 search-card">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <el-form :inline="true" :model="searchForm" class="!mb-[-18px]">
          <el-form-item label="课程名称">
            <el-input
              v-model="searchForm.courseName"
              placeholder="请输入课程名称"
              clearable
              class="!w-[280px]"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          创建课程
        </el-button>
      </div>
    </el-card>

    <div v-loading="loading">
      <div v-if="courseList.length > 0">
        <el-row :gutter="20">
          <el-col
            v-for="course in courseList"
            :key="course.courseId"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="mb-5"
          >
            <CourseCard
              :course="course"
              @edit="editCourse"
              @delete="confirmDelete"
              @view-hours="viewHours"
              @view-attrs="viewAttrs"
              @allocation="showAllocationDialog"
              @study-status="showStudyStatusDialog"
            />
          </el-col>
        </el-row>

        <div class="pagination-container flex justify-end mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <el-empty v-else description="暂无课程数据" />
    </div>

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
            <div>
              <el-button type="primary" @click="showAddChapterDialog">
                新增章节
              </el-button>
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
                <el-button
                  size="small"
                  type="danger"
                  @click="confirmDeleteChapter(chapter, currentCourse)"
                  >删除章节</el-button
                >
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
                <el-table-column label="操作" width="180">
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="primary"
                      @click="previewResource(scope.row.fileUrl)"
                      >预览</el-button
                    >
                    <el-button
                      size="small"
                      type="danger"
                      @click="
                        confirmDeleteHour(scope.row, chapter, currentCourse)
                      "
                      >删除</el-button
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
          <el-table-column prop="title" label="附件标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="rType" label="类型" width="120" />
          <el-table-column label="操作" width="100">
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
      width="70%"
    >
      <div v-loading="courseFormLoading">
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

    <!-- 课程分配弹窗 -->
    <el-dialog v-model="allocationDialogVisible" title="课程分配" width="60%">
      <div v-loading="allocationLoading">
        <div v-if="currentCourse" class="allocation-header">
          <h3>{{ currentCourse.title }} - 为该课程分配学员</h3>
        </div>

        <el-form :inline="true" class="search-form">
          <el-form-item label="学员姓名">
            <el-input
              v-model="allocationSearchForm.userName"
              placeholder="请输入学员姓名"
              clearable
              @keyup.enter="searchAllocationUsers"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchAllocationUsers"
              >搜索</el-button
            >
            <el-button @click="resetAllocationSearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 可分配学员表格 -->
        <div style="height: 40vh; overflow-y: auto">
          <el-table
            v-loading="allocationTableLoading"
            :data="allocationUsers"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="userId" label="ID" width="80" />
            <el-table-column label="头像" width="80">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatar">
                  {{ scope.row.userName?.charAt(0) || "U" }}
                </el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="用户名" />
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="allocationCurrentPage"
            v-model:page-size="allocationPageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="allocationTotal"
            @size-change="handleAllocationSizeChange"
            @current-change="handleAllocationCurrentChange"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="allocationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAllocation"
            >确定分配</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 学习情况弹窗 -->
    <el-dialog
      v-model="studyStatusDialogVisible"
      title="学员学习情况"
      width="80%"
    >
      <div v-loading="studyStatusLoading">
        <div v-if="currentCourse" class="allocation-header">
          <h3>{{ currentCourse.title }} - 学员学习情况列表</h3>
        </div>

        <el-form :inline="true" class="search-form">
          <el-form-item label="学员姓名">
            <el-input
              v-model="studyStatusSearchForm.userName"
              placeholder="请输入学员姓名"
              clearable
              @keyup.enter="searchStudyUsers"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStudyUsers">搜索</el-button>
            <el-button @click="resetStudySearch">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 学习情况表格 -->
        <div style="height: 40vh; overflow-y: auto">
          <el-table
            v-loading="studyStatusTableLoading"
            :data="studyUsers"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="userId" label="ID" width="80" sortable />
            <el-table-column label="头像" width="80">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatar">
                  {{ scope.row.userName?.charAt(0) || "U" }}
                </el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="用户名" min-width="150" />
            <el-table-column prop="totalHours" label="总课时数" width="100" />
            <el-table-column
              prop="finishedHours"
              label="已完成课时数"
              width="140"
              sortable
            />
            <el-table-column
              label="完成率"
              width="220"
              sortable
              :sort-method="sortProgress"
            >
              <template #default="scope">
                <el-progress
                  :percentage="
                    calculateProgress(
                      scope.row.finishedHours,
                      scope.row.totalHours
                    )
                  "
                  :format="percentageFormat"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="startStudyTime"
              label="开始学习时间"
              width="180"
              sortable
            />
            <el-table-column
              prop="finishedStudyTime"
              label="完成学习时间"
              width="180"
              sortable
            >
              <template #default="scope">
                {{ scope.row.finishedStudyTime || "-" }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="studyStatusCurrentPage"
            v-model:page-size="studyStatusPageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="studyStatusTotal"
            @size-change="handleStudyStatusSizeChange"
            @current-change="handleStudyStatusCurrentChange"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 删除课程确认对话框 -->
    <el-dialog
      v-model="deleteConfirmVisible"
      title="确认删除"
      width="30%"
      center
    >
      <span
        >确定要删除课程 "{{ currentCourse?.title }}" 吗？此操作不可恢复！</span
      >
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteConfirmVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteCourse"
            >确定删除</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- 新增章节对话框 -->
    <el-dialog v-model="addChapterDialogVisible" title="新增章节" width="70%">
      <div v-loading="addChapterLoading">
        <el-form
          ref="newChapterFormRef"
          :model="newChapterForm"
          label-width="120px"
        >
          <el-form-item
            label="章节名称"
            prop="name"
            :rules="[
              { required: true, message: '请输入章节名称', trigger: 'blur' }
            ]"
          >
            <el-input
              v-model="newChapterForm.name"
              placeholder="请输入章节名称"
            />
          </el-form-item>

          <div class="form-section">
            <div class="section-header">
              <h3>课时列表</h3>
              <div>
                <el-button type="primary" @click="addHour">添加课时</el-button>
              </div>
            </div>

            <div
              v-if="newChapterForm.hourList.length === 0"
              class="empty-placeholder"
            >
              尚未添加课时，点击"添加课时"按钮添加
            </div>
            <div v-else class="hour-list">
              <el-collapse v-model="activeHours">
                <el-collapse-item
                  v-for="(hour, hourIndex) in newChapterForm.hourList"
                  :key="'hour-' + hourIndex"
                  :name="hourIndex"
                >
                  <template #title>
                    <div class="hour-header">
                      <span
                        >{{ hour.title || "未命名课时" }}
                        <span class="required-mark">*</span>
                      </span>
                      <div class="hour-title-actions">
                        <el-button
                          type="danger"
                          size="small"
                          @click.stop="removeHour(hourIndex)"
                          >删除课时</el-button
                        >
                      </div>
                    </div>
                  </template>
                  <div class="hour-content">
                    <div class="hour-card">
                      <el-row :gutter="20">
                        <el-col :span="24">
                          <el-form-item :label="'课时标题'">
                            <el-input
                              v-model="hour.title"
                              placeholder="将使用上传的文件名"
                              disabled
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row :gutter="20">
                        <el-col :span="24">
                          <el-form-item
                            :label="'时长(秒)'"
                            :prop="`hourList[${hourIndex}].duration`"
                          >
                            <el-input-number
                              v-model="hour.duration"
                              :min="0"
                              :step="1"
                              disabled
                              placeholder="上传视频后自动获取"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-form-item
                        :label="'课时资源'"
                        :prop="`hourList[${hourIndex}].resourceId`"
                        :rules="[
                          {
                            required: true,
                            type: 'number',
                            min: 1,
                            message: '请上传视频资源',
                            trigger: 'change'
                          }
                        ]"
                      >
                        <div class="upload-with-preview">
                          <div v-if="hour.fileUrl" class="resource-preview">
                            <div class="resource-info">
                              <i class="el-icon-video-camera" />
                              <span class="resource-name">{{
                                hour.originalFileName ||
                                getFileName(hour.fileUrl)
                              }}</span>
                            </div>
                            <div class="resource-actions">
                              <el-button
                                size="small"
                                @click="previewResource(hour.fileUrl)"
                                >预览</el-button
                              >
                              <el-button
                                size="small"
                                type="danger"
                                @click="
                                  removeResource(
                                    newChapterForm.hourList,
                                    hourIndex
                                  )
                                "
                                >移除</el-button
                              >
                            </div>
                          </div>
                          <div
                            v-if="hour.isUploading"
                            class="uploading-overlay"
                          >
                            <div class="uploading-indicator">
                              <el-icon class="is-loading"><Loading /></el-icon>
                              <span>上传中...</span>
                            </div>
                          </div>
                          <el-upload
                            v-if="!hour.isUploading && !hour.fileUrl"
                            class="resource-upload"
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :accept="'.mp4,.webm,.ogg'"
                            :on-change="
                              file => {
                                newChapterForm.hourList[hourIndex].isUploading =
                                  true;
                                handleResourceUpload(
                                  file,
                                  newChapterForm.hourList,
                                  hourIndex
                                );
                              }
                            "
                          >
                            <div class="upload-icon-container">
                              <el-icon><Plus /></el-icon>
                              <p class="upload-tip">点击上传课时视频</p>
                            </div>
                          </el-upload>
                        </div>
                      </el-form-item>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addChapterDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitNewChapter">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from "vue";
import { ElMessage, ElMessageBox, ElForm } from "element-plus";
import {
  getCourseList,
  getCourseHoursList,
  getCourseAttrList,
  getCourseDetail,
  createCourse,
  updateCourse,
  coursesAllocation,
  getAllocationUserList,
  getStudyUserList,
  deleteCourse,
  deleteChapter,
  deleteHour,
  createCourseChapter
} from "@/api/course";
import CourseForm from "./components/CourseForm.vue";
import CourseCard from "./components/CourseCard.vue";
import CourseStats from "./components/CourseStats.vue";
import { Plus, Loading, Search } from "@element-plus/icons-vue";

// 统计数据
const courseStats = reactive({
  totalCourses: 0,
  totalStudents: 0,
  totalHours: 0,
  completionRate: "0%"
});

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

// 课程分配相关
const allocationDialogVisible = ref(false);
const allocationLoading = ref(false);
const allocationTableLoading = ref(false);
const allocationUsers = ref([]);
const allocationTotal = ref(0);
const allocationCurrentPage = ref(1);
const allocationPageSize = ref(20);
const selectedUsers = ref([]);
const allocationSearchForm = ref({
  userName: ""
});

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
  isChapter: 1, // 默认为有章节模式
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
        const { thumb_url, hourList, chapterList, attrList, isChapter, thumb, ...updateData } =
          formData;
        submitData = {
          ...updateData,
          thumbUrl: thumb_url, // 字段名转换
          categoryIds: [...formData.categoryIds] // 确保是普通数组而非 Proxy
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
      
      // 模拟更新统计数据
      courseStats.totalCourses = total.value;
      courseStats.totalStudents = courseList.value.reduce((acc, curr) => acc + (curr.studentCount || 10), 0);
      courseStats.totalHours = courseList.value.length * 15;
      courseStats.completionRate = "78%";
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
const previewResource = (url: string) => {
  if (!url) return;
  window.open(url, "_blank");
};

// 下载附件
const downloadAttachment = attachment => {
  if (attachment.fileUrl) {
    window.open(attachment.fileUrl);
  } else {
    ElMessage.warning("无效的附件链接");
  }
};

// 显示分配弹窗
const showAllocationDialog = course => {
  currentCourse.value = course;
  allocationDialogVisible.value = true;
  allocationCurrentPage.value = 1;
  allocationPageSize.value = 20;
  selectedUsers.value = [];
  allocationSearchForm.value.userName = "";
  allocationLoading.value = true;

  // 加载可分配的用户
  fetchAllocationUsers();
};

// 获取可分配的用户列表
const fetchAllocationUsers = async () => {
  allocationTableLoading.value = true;
  try {
    const res = await getAllocationUserList({
      courseId: currentCourse.value.courseId,
      userName: allocationSearchForm.value.userName,
      pageNum: allocationCurrentPage.value,
      pageSize: allocationPageSize.value
    });

    if (res && res.code === 200 && res.data) {
      allocationUsers.value = res.data.list || [];
      allocationTotal.value = res.data.total || 0;
    } else {
      allocationUsers.value = [];
      allocationTotal.value = 0;
      ElMessage.warning("获取用户列表失败");
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
    allocationUsers.value = [];
    allocationTotal.value = 0;
  } finally {
    allocationTableLoading.value = false;
    allocationLoading.value = false;
  }
};

// 搜索用户
const searchAllocationUsers = () => {
  allocationCurrentPage.value = 1;
  fetchAllocationUsers();
};

// 重置搜索
const resetAllocationSearch = () => {
  allocationSearchForm.value.userName = "";
  allocationCurrentPage.value = 1;
  fetchAllocationUsers();
};

// 处理表格选择变化
const handleSelectionChange = selection => {
  selectedUsers.value = selection;
};

// 处理分配页面大小变化
const handleAllocationSizeChange = (val: number) => {
  allocationPageSize.value = val;
  fetchAllocationUsers();
};

// 处理分配页码变化
const handleAllocationCurrentChange = (val: number) => {
  allocationCurrentPage.value = val;
  fetchAllocationUsers();
};

// 提交课程分配
const submitAllocation = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("请选择需要分配的用户");
    return;
  }

  try {
    allocationLoading.value = true;
    const userIds = selectedUsers.value.map(user => user.userId);

    const res = await coursesAllocation({
      courseId: currentCourse.value.courseId,
      userIdList: userIds
    });

    if (res && res.code === 200) {
      ElMessage.success("课程分配成功");
      allocationDialogVisible.value = false;
    } else {
      ElMessage.error("课程分配失败");
    }
  } catch (error) {
    console.error("课程分配失败:", error);
    ElMessage.error("课程分配失败");
  } finally {
    allocationLoading.value = false;
  }
};

// 学习情况对话框数据
const studyStatusDialogVisible = ref(false);
const studyStatusLoading = ref(false);
const studyStatusTableLoading = ref(false);
const studyUsers = ref<any[]>([]);
const studyStatusCurrentPage = ref(1);
const studyStatusPageSize = ref(10);
const studyStatusTotal = ref(0);
const studyStatusSearchForm = ref({
  userName: ""
});

// 显示学习情况对话框
const showStudyStatusDialog = async (row: any) => {
  currentCourse.value = row;
  studyStatusDialogVisible.value = true;
  studyStatusLoading.value = true;
  await fetchStudyUserList();
  studyStatusLoading.value = false;
};

// 获取学习情况列表
const fetchStudyUserList = async () => {
  try {
    studyStatusTableLoading.value = true;
    const params = {
      courseId: currentCourse.value?.courseId,
      pageNum: studyStatusCurrentPage.value,
      pageSize: studyStatusPageSize.value,
      ...(studyStatusSearchForm.value.userName
        ? { userName: studyStatusSearchForm.value.userName }
        : {})
    };

    const { data } = await getStudyUserList(params);
    studyUsers.value = data.list;
    studyStatusTotal.value = data.total;
  } catch (error) {
    console.error("获取学习情况列表失败", error);
    ElMessage.error("获取学习情况列表失败");
  } finally {
    studyStatusTableLoading.value = false;
  }
};

// 搜索学习记录
const searchStudyUsers = () => {
  studyStatusCurrentPage.value = 1;
  fetchStudyUserList();
};

// 重置学习情况搜索
const resetStudySearch = () => {
  studyStatusSearchForm.value.userName = "";
  searchStudyUsers();
};

// 处理学习情况分页变化
const handleStudyStatusCurrentChange = (val: number) => {
  studyStatusCurrentPage.value = val;
  fetchStudyUserList();
};

// 处理学习情况每页条数变化
const handleStudyStatusSizeChange = (val: number) => {
  studyStatusPageSize.value = val;
  studyStatusCurrentPage.value = 1;
  fetchStudyUserList();
};

// 计算进度百分比
const calculateProgress = (finished: number, total: number) => {
  if (!total) return 0;
  const percentage = (finished / total) * 100;
  return parseFloat(percentage.toFixed(1));
};

// 完成率排序方法
const sortProgress = (a: any, b: any) => {
  const progressA = calculateProgress(a.finishedHours, a.totalHours);
  const progressB = calculateProgress(b.finishedHours, b.totalHours);
  return progressA - progressB;
};

// 格式化百分比显示
const percentageFormat = (percentage: number) => {
  return `${percentage}%`;
};

// 删除课程确认对话框
const deleteConfirmVisible = ref(false);

// 打开删除确认对话框
const confirmDelete = (row: any) => {
  currentCourse.value = row;
  deleteConfirmVisible.value = true;
};

// 处理删除课程
const handleDeleteCourse = async () => {
  try {
    loading.value = true;
    const response = await deleteCourse({
      courseId: currentCourse.value.courseId
    });

    if (response.code === 200) {
      ElMessage.success("课程删除成功");
      deleteConfirmVisible.value = false;
      // 重新获取课程列表
      fetchCourseList();
    } else {
      ElMessage.error(response.msg || "删除失败，请稍后重试");
    }
  } catch (error: any) {
    console.error("删除课程出错:", error);
    // 处理API错误响应，显示服务器返回的错误信息
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.msg || "删除失败，请稍后重试");
    } else {
      ElMessage.error("删除失败，请稍后重试");
    }
  } finally {
    loading.value = false;
  }
};

// 删除章节
const confirmDeleteChapter = async (chapter: any, course: any) => {
  try {
    const response = await deleteChapter({
      courseId: course.courseId,
      chapterId: chapter.chapterId
    });

    if (response.code === 200) {
      ElMessage.success("章节删除成功");
      // 重新获取课时列表
      await viewHours(course);
    } else {
      ElMessage.error(response.msg || "删除章节失败，请稍后重试");
    }
  } catch (error: any) {
    console.error("删除章节出错:", error);
    // 处理API错误响应，显示服务器返回的错误信息
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.msg || "删除章节失败，请稍后重试");
    } else {
      ElMessage.error("删除章节失败，请稍后重试");
    }
  }
};

// 删除课时
const confirmDeleteHour = async (hour: any, chapter: any, course: any) => {
  try {
    const response = await deleteHour({
      courseId: course.courseId,
      chapterId: chapter.chapterId,
      hourId: hour.hourId
    });

    if (response.code === 200) {
      ElMessage.success("课时删除成功");
      // 重新获取课时列表
      await viewHours(course);
    } else {
      ElMessage.error(response.msg || "删除课时失败，请稍后重试");
    }
  } catch (error: any) {
    console.error("删除课时出错:", error);
    // 处理API错误响应，显示服务器返回的错误信息
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.msg || "删除课时失败，请稍后重试");
    } else {
      ElMessage.error("删除课时失败，请稍后重试");
    }
  }
};

// 新增章节相关
const addChapterDialogVisible = ref(false);
const addChapterLoading = ref(false);
const newChapterFormRef = ref();
const newChapterForm = ref({
  name: "",
  hourList: [] as any[]
});
const activeHours = ref([0]); // 默认展开第一个课时

// 显示新增章节对话框
const showAddChapterDialog = () => {
  newChapterForm.value = {
    name: "",
    hourList: []
  };
  activeHours.value = [];
  addChapterDialogVisible.value = true;
};

// 添加课时
const addHour = () => {
  const newIndex = newChapterForm.value.hourList.length;
  newChapterForm.value.hourList.push({
    title: "",
    resourceId: null,
    duration: null,
    rType: "",
    fileUrl: "",
    isUploading: false,
    originalFileName: ""
  });

  // 添加课时后自动展开
  activeHours.value.push(newIndex);
};

// 移除课时
const removeHour = (index: number) => {
  newChapterForm.value.hourList.splice(index, 1);
  // 更新活动课时索引
  activeHours.value = activeHours.value
    .filter(i => i !== index)
    .map(i => (i > index ? i - 1 : i));
};

// 处理资源上传
const handleResourceUpload = async (
  file: any,
  hourList: any[],
  hourIndex: number
) => {
  try {
    // 模拟上传过程
    const formData = new FormData();
    formData.append("file", file.raw);

    // TODO: 这里应该调用实际的上传API
    // 假设上传成功后会返回以下数据
    setTimeout(() => {
      const result = {
        resourceId: Math.floor(Math.random() * 10000) + 1,
        title: file.name.split(".")[0],
        fileUrl: URL.createObjectURL(file.raw),
        rType: file.raw.type.split("/")[1].toUpperCase(),
        duration: Math.floor(Math.random() * 600) + 60 // 模拟60-660秒的时长
      };

      // 更新课时信息
      hourList[hourIndex].resourceId = result.resourceId;
      hourList[hourIndex].title = result.title;
      hourList[hourIndex].fileUrl = result.fileUrl;
      hourList[hourIndex].rType = result.rType;
      hourList[hourIndex].duration = result.duration;
      hourList[hourIndex].originalFileName = file.name;
      hourList[hourIndex].isUploading = false;
    }, 1500);
  } catch (error) {
    console.error("上传资源失败:", error);
    hourList[hourIndex].isUploading = false;
    ElMessage.error("上传资源失败，请重试");
  }
};

// 从文件URL中提取文件名
const getFileName = (url: string) => {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1];
};

// 移除资源
const removeResource = (hourList: any[], hourIndex: number) => {
  hourList[hourIndex].resourceId = null;
  hourList[hourIndex].title = "";
  hourList[hourIndex].fileUrl = "";
  hourList[hourIndex].rType = "";
  hourList[hourIndex].duration = null;
  hourList[hourIndex].originalFileName = "";
};

// 提交新章节
const submitNewChapter = async () => {
  // 表单验证
  if (!newChapterFormRef.value) return;

  try {
    await newChapterFormRef.value.validate();

    // 检查是否有课时
    if (newChapterForm.value.hourList.length === 0) {
      ElMessage.warning("请至少添加一个课时");
      return;
    }

    addChapterLoading.value = true;

    // 提交数据
    const response = await createCourseChapter({
      courseId: currentCourse.value.courseId,
      chapter: {
        name: newChapterForm.value.name,
        hourList: newChapterForm.value.hourList
      }
    });

    if (response.code === 200) {
      ElMessage.success("章节添加成功");
      addChapterDialogVisible.value = false;
      // 重新获取课时列表
      await viewHours(currentCourse.value);
    } else {
      ElMessage.error(response.msg || "添加章节失败，请稍后重试");
    }
  } catch (error: any) {
    console.error("添加章节出错:", error);
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.msg || "添加章节失败，请稍后重试");
    } else if (error.message) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error("添加章节失败，请稍后重试");
    }
  } finally {
    addChapterLoading.value = false;
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
  color: var(--el-text-color-secondary);
  padding: 40px 0;
  font-size: 16px;
}

.course-header {
  display: flex;
  margin-bottom: 20px;
}

.course-thumb {
  margin-right: 20px;
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

.course-info {
  flex: 1;

  h2 {
    margin-top: 0;
    margin-bottom: 10px;
    color: var(--el-text-color-primary);
  }

  .course-desc {
    color: var(--el-text-color-regular);
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
  color: var(--el-text-color-primary);

  label {
    color: var(--el-text-color-secondary);
    margin-right: 5px;
  }
}

.detail-section {
  margin-top: 15px;
  margin-bottom: 15px;

  h3 {
    margin-top: 0;
    font-size: 16px;
    color: var(--el-text-color-primary);
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
  border-radius: var(--el-border-radius-base);
  overflow: hidden;

  .upload-actions {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}

.upload-trigger {
  height: 120px;
  width: 200px;
  border: 1px dashed var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--el-fill-color-blank);

  .upload-hint {
    color: var(--el-text-color-placeholder);
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
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
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

.allocation-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    color: var(--el-text-color-regular);
  }
}

// 章节标题样式
.chapter-title {
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  font-weight: bold;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--el-text-color-primary);
}

// 新增章节相关样式
.hours-list {
  margin-top: 15px;
}

.hour-item {
  margin-bottom: 20px;
}

.hour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-hour-btn {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.form-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-placeholder {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 20px 0;
}

.hour-list {
  margin-top: 15px;
}

.hour-content {
  padding: 10px;
}

.hour-card {
  padding: 10px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-blank);
}

.required-mark {
  color: var(--el-color-danger);
  margin-left: 5px;
}

.hour-title-actions {
  float: right;
}

/* 上传相关样式 */
.upload-with-preview {
  position: relative;
  width: 100%;
  height: 150px;
  border: 1px dashed var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-fill-color-blank);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.resource-upload {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-tip {
  margin-top: 10px;
  font-size: 14px;
}

.resource-preview {
  width: 100%;
  display: flex;
  padding: 10px 15px;
  justify-content: space-between;
  align-items: center;
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 70%;
}

.resource-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-actions {
  display: flex;
  gap: 8px;
}

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--el-mask-color-extra-light);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.uploading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.search-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  
  .el-dialog__header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 16px 24px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-button) {
  border-radius: 10px;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
}

:deep(.el-textarea__inner) {
  border-radius: 10px;
}

:deep(.el-select__wrapper) {
  border-radius: 10px;
}

:deep(.el-date-editor) {
  border-radius: 10px;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-card) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-checkbox__label),
:deep(.el-radio__label) {
  font-size: 14px;
}

:deep(.el-collapse) {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}

:deep(.el-collapse-item__header) {
  font-size: 15px;
  padding: 0 16px;
  height: 48px;
}
</style>

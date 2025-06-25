<template>
  <div class="homework-management">
    <div class="operation-bar">
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>添加作业
      </el-button>
    </div>

    <!-- 作业列表 -->
    <el-table
      v-loading="loading"
      :data="homeworkList"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="homeworkId" label="ID" width="80" />
      <el-table-column prop="title" label="作业标题" min-width="180" />
      <el-table-column prop="chapterName" label="所属章节" min-width="150" />
      <el-table-column prop="hourName" label="所属课时" min-width="150" />
      <el-table-column prop="questionNum" label="题目数量" width="100" />
      <el-table-column prop="totalPoints" label="总分" width="80" />
      <el-table-column prop="dueDate" label="截止日期" width="170" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="showQuestionDialog(scope.row)"
            >试题管理</el-button
          >
          <el-button
            size="small"
            @click="showEditDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="confirmDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 创建/编辑作业对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作业' : '创建作业'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        v-loading="formLoading"
      >
        <el-form-item label="作业标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>

        <el-form-item label="所属章节" prop="chapterId" v-if="!isEdit">
          <el-select
            v-model="form.chapterId"
            placeholder="请选择章节"
            style="width: 100%"
            @change="handleChapterChange"
          >
            <el-option
              v-for="chapter in chapterOptions"
              :key="chapter.chapterId"
              :label="chapter.name"
              :value="chapter.chapterId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属课时" prop="hourId" v-if="!isEdit">
          <el-select
            v-model="form.hourId"
            placeholder="请选择课时"
            style="width: 100%"
          >
            <el-option
              v-for="hour in hourOptions"
              :key="hour.hourId"
              :label="hour.title"
              :value="hour.hourId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="作业描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="4"
            placeholder="请输入作业描述"
          />
        </el-form-item>

        <el-form-item label="截止日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="datetime"
            placeholder="选择截止日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 试题管理对话框 -->
    <el-dialog
      v-model="questionDialogVisible"
      title="试题管理"
      width="90%"
      top="5vh"
    >
      <div v-if="currentHomework" class="question-dialog-header">
        <h3>{{ currentHomework.title }}</h3>
        <p>试题数量: {{ currentHomework.questionNum }} | 总分: {{ currentHomework.totalPoints }}</p>
      </div>

      <div class="question-operation-bar">
        <el-button type="primary" @click="showAddQuestionDialog">
          <el-icon><Plus /></el-icon>添加试题
        </el-button>
      </div>

      <el-table
        v-loading="questionLoading"
        :data="questionList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="questionType" label="题型" width="100">
          <template #default="scope">
            {{ getQuestionTypeName(scope.row.questionType) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="150" />
        <el-table-column prop="stem" label="题干" min-width="250" show-overflow-tooltip />
        <el-table-column prop="points" label="分值" width="80" />
        <el-table-column prop="difficulty" label="难度" width="80">
          <template #default="scope">
            <el-rate
              v-model="scope.row.difficulty"
              disabled
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="editQuestion(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="deleteQuestion(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="questionCurrentPage"
          v-model:page-size="questionPageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="questionTotal"
          @size-change="handleQuestionSizeChange"
          @current-change="handleQuestionCurrentChange"
        />
      </div>
    </el-dialog>

    <!-- 这里可以添加试题相关的对话框，但由于复杂度较高，可以后续实现 -->
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { 
  getHomeworkList, 
  getHomeworkQuestionList, 
  createHomework, 
  updateHomework, 
  deleteHomework 
} from "@/api/homework";
import { getCourseHoursList } from "@/api/course";

const props = defineProps({
  courseId: {
    type: [Number, null],
    required: true
  }
});

// 作业列表相关
const loading = ref(false);
const homeworkList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 章节和课时选项
const chapterOptions = ref([]);
const hourOptions = ref([]);

// 作业表单相关
const dialogVisible = ref(false);
const formLoading = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const form = ref({
  homeworkId: 0,
  courseId: props.courseId,
  chapterId: null,
  hourId: null,
  title: "",
  description: "",
  dueDate: ""
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: "请输入作业标题", trigger: "blur" }],
  chapterId: [{ required: true, message: "请选择章节", trigger: "change" }],
  hourId: [{ required: true, message: "请选择课时", trigger: "change" }],
  description: [{ required: true, message: "请输入作业描述", trigger: "blur" }],
  dueDate: [{ required: true, message: "请选择截止日期", trigger: "change" }]
};

// 试题管理相关
const questionDialogVisible = ref(false);
const questionLoading = ref(false);
const currentHomework = ref(null);
const questionList = ref([]);
const questionCurrentPage = ref(1);
const questionPageSize = ref(10);
const questionTotal = ref(0);

// 监听课程ID变化，重新加载数据
watch(
  () => props.courseId,
  (newVal) => {
    if (newVal) {
      currentPage.value = 1;
      fetchHomeworkList();
      fetchChapters();
    } else {
      homeworkList.value = [];
      total.value = 0;
    }
  }
);

// 获取作业列表
const fetchHomeworkList = async () => {
  if (!props.courseId) return;
  
  loading.value = true;
  try {
    const { data } = await getHomeworkList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      courseId: props.courseId
    });
    homeworkList.value = data.homeworkList;
    total.value = data.total;
  } catch (error) {
    console.error("获取作业列表失败", error);
    ElMessage.error("获取作业列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取章节和课时列表
const fetchChapters = async () => {
  try {
    const { data } = await getCourseHoursList({ courseId: props.courseId });
    chapterOptions.value = data.courseChapters || [];
  } catch (error) {
    console.error("获取章节列表失败", error);
    ElMessage.error("获取章节列表失败");
  }
};

// 处理章节变化，加载对应的课时
const handleChapterChange = (chapterId) => {
  form.value.hourId = null;
  const chapter = chapterOptions.value.find(c => c.chapterId === chapterId);
  if (chapter) {
    hourOptions.value = chapter.hourList || [];
  } else {
    hourOptions.value = [];
  }
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchHomeworkList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchHomeworkList();
};

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false;
  form.value = {
    homeworkId: 0,
    courseId: props.courseId,
    chapterId: null,
    hourId: null,
    title: "",
    description: "",
    dueDate: ""
  };
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    homeworkId: row.homeworkId,
    courseId: props.courseId,
    chapterId: row.chapterId,
    hourId: row.hourId,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate
  };
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      try {
        if (isEdit.value) {
          await updateHomework({
            homeworkId: form.value.homeworkId,
            title: form.value.title,
            description: form.value.description,
            dueDate: form.value.dueDate
          });
          ElMessage.success("更新作业成功");
        } else {
          await createHomework(form.value);
          ElMessage.success("创建作业成功");
        }
        dialogVisible.value = false;
        fetchHomeworkList();
      } catch (error) {
        console.error(isEdit.value ? "更新作业失败" : "创建作业失败", error);
        ElMessage.error(isEdit.value ? "更新作业失败" : "创建作业失败");
      } finally {
        formLoading.value = false;
      }
    }
  });
};

// 确认删除
const confirmDelete = (row) => {
  ElMessageBox.confirm(`确定要删除作业 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteHomework({ homeworkId: row.homeworkId });
        ElMessage.success("删除作业成功");
        fetchHomeworkList();
      } catch (error) {
        console.error("删除作业失败", error);
        ElMessage.error("删除作业失败");
      }
    })
    .catch(() => {});
};

// 显示试题管理对话框
const showQuestionDialog = async (row) => {
  currentHomework.value = row;
  questionDialogVisible.value = true;
  questionCurrentPage.value = 1;
  await fetchQuestionList();
};

// 获取试题列表
const fetchQuestionList = async () => {
  if (!currentHomework.value) return;
  
  questionLoading.value = true;
  try {
    const { data } = await getHomeworkQuestionList({
      pageNum: questionCurrentPage.value,
      pageSize: questionPageSize.value,
      homeworkId: currentHomework.value.homeworkId
    });
    questionList.value = data.questionList;
    questionTotal.value = data.total;
  } catch (error) {
    console.error("获取试题列表失败", error);
    ElMessage.error("获取试题列表失败");
  } finally {
    questionLoading.value = false;
  }
};

// 试题分页相关
const handleQuestionSizeChange = (val: number) => {
  questionPageSize.value = val;
  fetchQuestionList();
};

const handleQuestionCurrentChange = (val: number) => {
  questionCurrentPage.value = val;
  fetchQuestionList();
};

// 显示添加试题对话框
const showAddQuestionDialog = () => {
  // 这里可以实现添加试题的逻辑
  ElMessage.info("添加试题功能待实现");
};

// 编辑试题
const editQuestion = (row) => {
  // 这里可以实现编辑试题的逻辑
  ElMessage.info("编辑试题功能待实现");
};

// 删除试题
const deleteQuestion = (row) => {
  // 这里可以实现删除试题的逻辑
  ElMessage.info("删除试题功能待实现");
};

// 获取题型名称
const getQuestionTypeName = (type: number) => {
  const typeMap = {
    1: "单选题",
    2: "多选题",
    3: "判断题",
    4: "填空题",
    5: "简答题",
    6: "论述题"
  };
  return typeMap[type] || "未知题型";
};

// 页面加载时获取数据
onMounted(() => {
  if (props.courseId) {
    fetchHomeworkList();
    fetchChapters();
  }
});
</script>

<style lang="scss" scoped>
.homework-management {
  padding: 10px 0;
}

.operation-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.question-dialog-header {
  margin-bottom: 20px;

  h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  p {
    color: #606266;
    margin: 0;
  }
}

.question-operation-bar {
  margin-bottom: 20px;
}
</style> 
<template>
  <div class="exam-management">
    <div class="operation-bar">
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>添加考试
      </el-button>
    </div>

    <!-- 考试列表 -->
    <el-table
      v-loading="loading"
      :data="examList"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="examId" label="ID" width="80" />
      <el-table-column prop="title" label="考试标题" min-width="180" />
      <el-table-column prop="questionNum" label="题目数量" width="100" />
      <el-table-column prop="totalPoints" label="总分" width="80" />
      <el-table-column prop="timeLimit" label="时间限制" width="100">
        <template #default="scope">
          {{ scope.row.timeLimit }} 分钟
        </template>
      </el-table-column>
      <el-table-column label="考试时间" min-width="200">
        <template #default="scope">
          <div>开始: {{ scope.row.availableFrom }}</div>
          <div>结束: {{ scope.row.availableTo }}</div>
        </template>
      </el-table-column>
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

    <!-- 创建/编辑考试对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑考试' : '创建考试'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        v-loading="formLoading"
      >
        <el-form-item label="考试标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入考试标题" />
        </el-form-item>

        <el-form-item label="考试描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="4"
            placeholder="请输入考试描述"
          />
        </el-form-item>

        <el-form-item label="时间限制" prop="timeLimit">
          <el-input-number
            v-model="form.timeLimit"
            :min="1"
            :max="300"
            placeholder="请输入时间限制(分钟)"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="考试时间段" prop="examTime">
          <el-date-picker
            v-model="form.examTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
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
      <div v-if="currentExam" class="question-dialog-header">
        <h3>{{ currentExam.title }}</h3>
        <p>试题数量: {{ currentExam.questionNum }} | 总分: {{ currentExam.totalPoints }}</p>
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
  getExamList, 
  getExamQuestionList, 
  createExam, 
  updateExam, 
  deleteExam 
} from "@/api/exam";

const props = defineProps({
  courseId: {
    type: [Number, null],
    required: true
  }
});

// 考试列表相关
const loading = ref(false);
const examList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 考试表单相关
const dialogVisible = ref(false);
const formLoading = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const form = ref({
  examId: 0,
  courseId: props.courseId,
  title: "",
  description: "",
  timeLimit: 60,
  examTime: [] as string[]
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: "请输入考试标题", trigger: "blur" }],
  description: [{ required: true, message: "请输入考试描述", trigger: "blur" }],
  timeLimit: [{ required: true, message: "请输入时间限制", trigger: "blur" }],
  examTime: [{ required: true, message: "请选择考试时间段", trigger: "change" }]
};

// 试题管理相关
const questionDialogVisible = ref(false);
const questionLoading = ref(false);
const currentExam = ref(null);
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
      fetchExamList();
    } else {
      examList.value = [];
      total.value = 0;
    }
  }
);

// 获取考试列表
const fetchExamList = async () => {
  if (!props.courseId) return;
  
  loading.value = true;
  try {
    const { data } = await getExamList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      courseId: props.courseId
    });
    examList.value = data.examList;
    total.value = data.total;
  } catch (error) {
    console.error("获取考试列表失败", error);
    ElMessage.error("获取考试列表失败");
  } finally {
    loading.value = false;
  }
};

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchExamList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchExamList();
};

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false;
  form.value = {
    examId: 0,
    courseId: props.courseId,
    title: "",
    description: "",
    timeLimit: 60,
    examTime: []
  };
  dialogVisible.value = true;
};

// 显示编辑对话框
const showEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    examId: row.examId,
    courseId: props.courseId,
    title: row.title,
    description: row.description,
    timeLimit: row.timeLimit,
    examTime: [row.availableFrom, row.availableTo]
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
          await updateExam({
            examId: form.value.examId,
            title: form.value.title,
            description: form.value.description,
            timeLimit: form.value.timeLimit,
            availableFrom: form.value.examTime[0],
            availableTo: form.value.examTime[1]
          });
          ElMessage.success("更新考试成功");
        } else {
          await createExam({
            courseId: form.value.courseId,
            title: form.value.title,
            description: form.value.description,
            timeLimit: form.value.timeLimit,
            availableFrom: form.value.examTime[0],
            availableTo: form.value.examTime[1]
          });
          ElMessage.success("创建考试成功");
        }
        dialogVisible.value = false;
        fetchExamList();
      } catch (error) {
        console.error(isEdit.value ? "更新考试失败" : "创建考试失败", error);
        ElMessage.error(isEdit.value ? "更新考试失败" : "创建考试失败");
      } finally {
        formLoading.value = false;
      }
    }
  });
};

// 确认删除
const confirmDelete = (row) => {
  ElMessageBox.confirm(`确定要删除考试 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteExam({ examId: row.examId });
        ElMessage.success("删除考试成功");
        fetchExamList();
      } catch (error) {
        console.error("删除考试失败", error);
        ElMessage.error("删除考试失败");
      }
    })
    .catch(() => {});
};

// 显示试题管理对话框
const showQuestionDialog = async (row) => {
  currentExam.value = row;
  questionDialogVisible.value = true;
  questionCurrentPage.value = 1;
  await fetchQuestionList();
};

// 获取试题列表
const fetchQuestionList = async () => {
  if (!currentExam.value) return;
  
  questionLoading.value = true;
  try {
    const { data } = await getExamQuestionList({
      pageNum: questionCurrentPage.value,
      pageSize: questionPageSize.value,
      examId: currentExam.value.examId
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
    fetchExamList();
  }
});
</script>

<style lang="scss" scoped>
.exam-management {
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
<script setup lang="ts">
import { ref, computed } from "vue";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconGrid from "@/assets/home-icons/grid.svg?component";

defineOptions({
  name: "QuestionBank"
});

const { isDark } = useDark();

// 搜索和筛选
const searchQuery = ref("");
const selectedType = ref("");
const selectedDifficulty = ref("");
const selectedSubject = ref("");

// 题目类型选项
const questionTypes = [
  { value: "", label: "全部题型" },
  { value: "radio", label: "单选题" },
  { value: "checkbox", label: "多选题" },
  { value: "input", label: "填空题" },
  { value: "textarea", label: "简答题" },
  { value: "judge", label: "判断题" }
];

// 难度选项
const difficultyOptions = [
  { value: "", label: "全部难度" },
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" }
];

// 科目选项
const subjectOptions = ref([
  { value: "", label: "全部科目" },
  { value: "math", label: "高等数学" },
  { value: "physics", label: "大学物理" },
  { value: "english", label: "大学英语" },
  { value: "programming", label: "程序设计" },
  { value: "database", label: "数据库原理" }
]);

// 统计数据
const statistics = ref({
  total: 156,
  radio: 45,
  checkbox: 28,
  textarea: 32
});

// 题库数据
const questions = ref([
  {
    id: 1,
    type: "radio",
    typeName: "单选题",
    subject: "math",
    subjectName: "高等数学",
    difficulty: "easy",
    difficultyName: "简单",
    stem: "函数 f(x) = x²在 x = 0 处的导数是？",
    options: [
      { key: "A", content: "0" },
      { key: "B", content: "1" },
      { key: "C", content: "2" },
      { key: "D", content: "不存在" }
    ],
    correctAnswer: "A",
    analysis: "根据导数定义，f'(x) = 2x，当 x = 0 时，f'(0) = 0",
    points: 5,
    usageCount: 15,
    createTime: "2026-01-15",
    updateTime: "2026-01-20"
  },
  {
    id: 2,
    type: "checkbox",
    typeName: "多选题",
    subject: "programming",
    subjectName: "程序设计",
    difficulty: "medium",
    difficultyName: "中等",
    stem: "以下哪些是 JavaScript 的基本数据类型？",
    options: [
      { key: "A", content: "String" },
      { key: "B", content: "Number" },
      { key: "C", content: "Array" },
      { key: "D", content: "Boolean" }
    ],
    correctAnswers: ["A", "B", "D"],
    analysis:
      "JavaScript 的基本数据类型包括 String、Number、Boolean、Undefined、Null、Symbol 和 BigInt。Array 是引用类型。",
    points: 10,
    usageCount: 8,
    createTime: "2026-01-18",
    updateTime: "2026-01-25"
  },
  {
    id: 3,
    type: "input",
    typeName: "填空题",
    subject: "physics",
    subjectName: "大学物理",
    difficulty: "medium",
    difficultyName: "中等",
    stem: "光在真空中的传播速度约为 ______ m/s。",
    correctAnswer: "3×10^8",
    analysis:
      "光速是物理学中的基本常数，约为 299,792,458 m/s，通常近似为 3×10^8 m/s。",
    points: 5,
    usageCount: 22,
    createTime: "2026-01-10",
    updateTime: "2026-01-10"
  },
  {
    id: 4,
    type: "textarea",
    typeName: "简答题",
    subject: "database",
    subjectName: "数据库原理",
    difficulty: "hard",
    difficultyName: "困难",
    stem: "请简述数据库事务的 ACID 特性，并举例说明。",
    referenceAnswer:
      "ACID 是数据库事务的四个基本特性：\n1. 原子性(Atomicity)：事务中的所有操作要么全部完成，要么全部不完成。\n2. 一致性(Consistency)：事务执行前后，数据库的完整性约束没有被破坏。\n3. 隔离性(Isolation)：多个事务并发执行时，一个事务的执行不应影响其他事务。\n4. 持久性(Durability)：事务完成后，对数据库的修改是永久性的。",
    points: 15,
    usageCount: 5,
    createTime: "2026-01-22",
    updateTime: "2026-01-28"
  },
  {
    id: 5,
    type: "judge",
    typeName: "判断题",
    subject: "english",
    subjectName: "大学英语",
    difficulty: "easy",
    difficultyName: "简单",
    stem: "The word 'beautiful' is an adjective.",
    correctAnswer: "true",
    analysis: "'Beautiful' 是一个形容词，用于描述名词的特征。",
    points: 3,
    usageCount: 30,
    createTime: "2026-01-05",
    updateTime: "2026-01-05"
  }
]);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = computed(() => filteredQuestions.value.length);

// 筛选后的题目
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchSearch =
      !searchQuery.value ||
      q.stem.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchType = !selectedType.value || q.type === selectedType.value;
    const matchDifficulty =
      !selectedDifficulty.value || q.difficulty === selectedDifficulty.value;
    const matchSubject =
      !selectedSubject.value || q.subject === selectedSubject.value;
    return matchSearch && matchType && matchDifficulty && matchSubject;
  });
});

// 分页后的题目
const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredQuestions.value.slice(start, end);
});

// 选中的题目
const selectedQuestions = ref<number[]>([]);

// 编辑对话框
const editDialogVisible = ref(false);
const editingQuestion = ref<any>(null);
const isNewQuestion = ref(false);

// 打开新建题目对话框
const openNewQuestionDialog = () => {
  isNewQuestion.value = true;
  editingQuestion.value = {
    id: Date.now(),
    type: "radio",
    typeName: "单选题",
    subject: "",
    subjectName: "",
    difficulty: "medium",
    difficultyName: "中等",
    stem: "",
    options: [
      { key: "A", content: "" },
      { key: "B", content: "" },
      { key: "C", content: "" },
      { key: "D", content: "" }
    ],
    correctAnswer: "",
    correctAnswers: [],
    analysis: "",
    referenceAnswer: "",
    points: 5,
    usageCount: 0,
    createTime: new Date().toISOString().split("T")[0],
    updateTime: new Date().toISOString().split("T")[0]
  };
  editDialogVisible.value = true;
};

// 打开编辑题目对话框
const openEditDialog = (question: any) => {
  isNewQuestion.value = false;
  editingQuestion.value = JSON.parse(JSON.stringify(question));
  editDialogVisible.value = true;
};

// 保存题目
const saveQuestion = () => {
  if (!editingQuestion.value.stem) {
    ElMessage.warning("请输入题目内容");
    return;
  }

  const typeInfo = questionTypes.find(
    t => t.value === editingQuestion.value.type
  );
  editingQuestion.value.typeName = typeInfo?.label || "";

  const diffInfo = difficultyOptions.find(
    d => d.value === editingQuestion.value.difficulty
  );
  editingQuestion.value.difficultyName = diffInfo?.label || "";

  const subjectInfo = subjectOptions.value.find(
    s => s.value === editingQuestion.value.subject
  );
  editingQuestion.value.subjectName = subjectInfo?.label || "";

  editingQuestion.value.updateTime = new Date().toISOString().split("T")[0];

  if (isNewQuestion.value) {
    questions.value.unshift(editingQuestion.value);ElMessage.success("题目创建成功");
  } else {
    const index = questions.value.findIndex(
      q => q.id === editingQuestion.value.id
    );
    if (index !== -1) {
      questions.value[index] = editingQuestion.value;
    }
    ElMessage.success("题目更新成功");
  }

  editDialogVisible.value = false;
};

// 删除题目
const deleteQuestion = (question: any) => {
  ElMessageBox.confirm(
    `确定要删除题目"${question.stem.substring(0, 30)}..."吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      const index = questions.value.findIndex(q => q.id === question.id);
      if (index !== -1) {
        questions.value.splice(index, 1);ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

// 批量删除
const batchDelete = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning("请先选择要删除的题目");
    return;
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
    "批量删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(() => {
      questions.value = questions.value.filter(
        q => !selectedQuestions.value.includes(q.id)
      );
      selectedQuestions.value = [];
      ElMessage.success("批量删除成功");
    })
    .catch(() => {});
};

// 添加选项
const addOption = () => {
  if (!editingQuestion.value) return;
  const nextKey = String.fromCharCode(
    65 + editingQuestion.value.options.length
  );
  editingQuestion.value.options.push({ key: nextKey, content: "" });
};

// 删除选项
const removeOption = (index: number) => {
  if (!editingQuestion.value || editingQuestion.value.options.length <= 2)
    return;
  editingQuestion.value.options.splice(index, 1);
  editingQuestion.value.options.forEach((opt: any, i: number) => {
    opt.key = String.fromCharCode(65 + i);
  });
};

// 导入题目
const importQuestions = () => {
  ElMessage.info("导入功能开发中");
};

// 导出题目
const exportQuestions = () => {
  ElMessage.info("导出功能开发中");
};

// 获取难度标签类型
const getDifficultyType = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "danger";
    default:
      return "info";
  }
};

// 获取题型标签类型
const getTypeTagType = (type: string) => {
  switch (type) {
    case "radio":
      return "primary";
    case "checkbox":
      return "success";
    case "input":
      return "warning";
    case "textarea":
      return "danger";
    case "judge":
      return "info";
    default:
      return "primary";
  }
};
</script>

<template>
  <div class="question-bank" :class="{ 'is-dark': isDark }">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <IconGrid />
        </div>
        <div class="header-info">
          <h1 class="page-title">题库管理</h1>
          <p class="page-desc">
            管理和维护题目，支持创建、编辑、删除和批量操作
          </p>
        </div>
      </div>
      <el-button
        type="primary"
        size="large"
        class="create-btn"
        @click="openNewQuestionDialog"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        新建题目
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <IconDocument />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">题目总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon radio">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.radio }}</div>
          <div class="stat-label">单选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon checkbox">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.checkbox }}</div>
          <div class="stat-label">多选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon textarea">
          <IconEdit />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.textarea }}</div>
          <div class="stat-label">简答题</div>
        </div>
      </div>
    </div>

    <!-- 搜索和工具栏 -->
    <div class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索题目内容..."
            prefix-icon="Search"
            clearable
            style="width: 250px"
          />
          <el-select
            v-model="selectedType"
            placeholder="题型"
            style="width: 120px"
          >
            <el-option
              v-for="type in questionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          <el-select
            v-model="selectedDifficulty"
            placeholder="难度"
            style="width: 120px"
          >
            <el-option
              v-for="diff in difficultyOptions"
              :key="diff.value"
              :label="diff.label"
              :value="diff.value"
            />
          </el-select>
          <el-select
            v-model="selectedSubject"
            placeholder="科目"
            style="width: 140px"
          >
            <el-option
              v-for="subject in subjectOptions"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value"
            />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-button @click="importQuestions">
            <el-icon class="mr-1"><Upload /></el-icon>
            导入
          </el-button>
          <el-button @click="exportQuestions">
            <el-icon class="mr-1"><Download /></el-icon>
            导出
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedQuestions.length === 0"
            @click="batchDelete"
          >
            <el-icon class="mr-1"><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 题目列表 -->
    <div class="list-card">
      <el-table
        :data="paginatedQuestions"
        style="width: 100%"
        class="question-table"
        @selection-change="
          (val: any[]) => (selectedQuestions = val.map(v => v.id))
        "
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="题型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getTypeTagType(row.type)"
              size="small"
              effect="light"
            >
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="题目内容" min-width="300">
          <template #default="{ row }">
            <div class="question-stem">{{ row.stem }}</div>
          </template>
        </el-table-column>
        <el-table-column label="科目" width="120">
          <template #default="{ row }">
            <span class="subject-badge">{{ row.subjectName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getDifficultyType(row.difficulty)"
              size="small"
              effect="light"
            >
              {{ row.difficultyName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分值" width="80" align="center">
          <template #default="{ row }">
            <span class="points-badge">{{ row.points }}分</span>
          </template>
        </el-table-column>
        <el-table-column label="使用次数" width="100" align="center">
          <template #default="{ row }">
            <span class="usage-badge">{{ row.usageCount }}次</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="120">
          <template #default="{ row }">
            <span>{{ row.updateTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">
              <el-icon class="mr-1"><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="danger" @click="deleteQuestion(row)">
              <el-icon class="mr-1"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isNewQuestion ? '新建题目' : '编辑题目'"
      width="800px"
      destroy-on-close
    >
      <el-form
        v-if="editingQuestion"
        :model="editingQuestion"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="题型">
              <el-select v-model="editingQuestion.type" style="width: 100%">
                <el-option
                  v-for="type in questionTypes.filter(t => t.value)"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="科目">
              <el-select v-model="editingQuestion.subject" style="width: 100%">
                <el-option
                  v-for="subject in subjectOptions.filter(s => s.value)"
                  :key="subject.value"
                  :label="subject.label"
                  :value="subject.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度">
              <el-select
                v-model="editingQuestion.difficulty"
                style="width: 100%"
              >
                <el-option
                  v-for="diff in difficultyOptions.filter(d => d.value)"
                  :key="diff.value"
                  :label="diff.label"
                  :value="diff.value"
                />
              </el-select>
            </el-form-item>
          </el-col></el-row>

        <el-form-item label="分值">
          <el-input-number
            v-model="editingQuestion.points"
            :min="1"
            :max="100"/>
        </el-form-item>

        <el-form-item label="题目内容">
          <el-input
            v-model="editingQuestion.stem"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <!-- 选择题选项 -->
        <template
          v-if="
            editingQuestion.type === 'radio' ||
            editingQuestion.type === 'checkbox'
          "
        >
          <el-form-item label="选项">
            <div class="options-editor">
              <div
                v-for="(option, index) in editingQuestion.options"
                :key="option.key"
                class="option-item"
              >
                <span class="option-key">{{ option.key }}.</span>
                <el-input
                  v-model="option.content"
                  placeholder="请输入选项内容"
                  style="flex: 1"
                />
                <el-button
                  link
                  type="danger"
                  :disabled="editingQuestion.options.length <= 2"
                  @click="removeOption(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link @click="addOption">
                <el-icon><Plus /></el-icon>
                添加选项
              </el-button>
            </div>
          </el-form-item><el-form-item label="正确答案">
            <el-radio-group
              v-if="editingQuestion.type === 'radio'"
              v-model="editingQuestion.correctAnswer"
            >
              <el-radio
                v-for="option in editingQuestion.options"
                :key="option.key"
                :value="option.key"
              >
                {{ option.key }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-else v-model="editingQuestion.correctAnswers">
              <el-checkbox
                v-for="option in editingQuestion.options"
                :key="option.key"
                :value="option.key"
              >
                {{ option.key }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <!-- 填空题答案 -->
        <template v-else-if="editingQuestion.type === 'input'">
          <el-form-item label="正确答案">
            <el-input
              v-model="editingQuestion.correctAnswer"
              placeholder="请输入正确答案"
            />
          </el-form-item>
        </template>

        <!-- 判断题答案 -->
        <template v-else-if="editingQuestion.type === 'judge'">
          <el-form-item label="正确答案">
            <el-radio-group v-model="editingQuestion.correctAnswer">
              <el-radio value="true">正确</el-radio>
              <el-radio value="false">错误</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 简答题参考答案 -->
        <template v-else-if="editingQuestion.type === 'textarea'">
          <el-form-item label="参考答案">
            <el-input
              v-model="editingQuestion.referenceAnswer"
              type="textarea"
              :rows="4"
              placeholder="请输入参考答案"
            />
          </el-form-item>
        </template>

        <el-form-item label="解析">
          <el-input
            v-model="editingQuestion.analysis"
            type="textarea"
            :rows="3"
            placeholder="请输入题目解析（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestion">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
/*浅色模式变量 */
$light-bg: #f5f7fa;
$light-card-bg: #fff;
$light-text-primary: #1f2937;
$light-text-secondary: #6b7280;
$light-text-muted: #9ca3af;
$light-border: #e5e7eb;
$light-shadow:
  0 4px 6px -1px rgb(0 0 0 / 10%),
  0 2px 4px -2px rgb(0 0 0 / 10%);
$light-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 10%),
  0 4px 6px -4px rgb(0 0 0 / 10%);

/* 深色模式变量 */
$dark-bg: #0f172a;
$dark-card-bg: rgba(30, 41, 59, 0.8);
$dark-text-primary: #f1f5f9;
$dark-text-secondary: #94a3b8;
$dark-text-muted: #64748b;
$dark-border: rgba(255, 255, 255, 0.1);
$dark-shadow:
  0 4px 6px -1px rgb(0 0 0 / 30%),
  0 2px 4px -2px rgb(0 0 0 / 30%);
$dark-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 40%),
  0 4px 6px -4px rgb(0 0 0 / 40%);

/* 主色调 */
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$success-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
$warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
$info-gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
$danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.question-bank {
  min-height: 100%;
  transition: all 0.3s ease;

  &.is-dark {

    .page-header {
      background: $dark-card-bg;
      border-color: $dark-border;

      .page-title {
        color: $dark-text-primary;
      }

      .page-desc {
        color: $dark-text-secondary;
      }

      .header-icon {
        background: rgba(59, 130, 246, 0.2);
      }
    }

    .stat-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      .stat-info {
        .stat-value {
          color: $dark-text-primary;
        }

        .stat-label {
          color: $dark-text-secondary;
        }
      }
    }

    .toolbar-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;
    }

    .list-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      .question-stem {
        color: $dark-text-primary;
      }

      .subject-badge,
      .points-badge,
      .usage-badge {
        color: $dark-text-secondary;
      }
    }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    margin-bottom: 24px;
    border: 1px solid $light-border;

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: $radius-md;
      background: $info-gradient;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(svg) {
        width: 28px;
        height: 28px;
        color: #fff;
      }
    }

    .header-info {
      .page-title {
        font-size: 24px;
        font-weight: 700;
        color: $light-text-primary;
        margin: 0 0 4px;
      }

      .page-desc {
        font-size: 14px;
        color: $light-text-secondary;
        margin: 0;
      }
    }

    .create-btn {
      border-radius: $radius-md;
      padding: 12px 24px;
      font-weight: 600;
    }
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $light-shadow-lg;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: $radius-md;
      background: $primary-gradient;
      display: flex;
      align-items: center;
      justify-content: center;

      &.radio {
        background: $success-gradient;
      }

      &.checkbox {
        background: $warning-gradient;
      }

      &.textarea {
        background: $danger-gradient;
      }

      :deep(svg) {
        width: 24px;
        height: 24px;
        color: #fff;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: $light-text-primary;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: $light-text-secondary;
        margin-top: 4px;
      }
    }
  }

  .toolbar-card {
    padding: 16px 20px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    margin-bottom: 24px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
  }

  .list-card {
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    overflow: hidden;

    .question-table {
      border-radius: $radius-lg;
    }

    .question-stem {
      color: $light-text-primary;
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .subject-badge {
      color: $light-text-secondary;
      font-size: 13px;
    }

    .points-badge,
    .usage-badge {
      color: $light-text-secondary;
      font-size: 13px;
      font-weight: 500;
    }

    .pagination-wrapper {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $light-border;
    }
  }

  .options-editor {
    width: 100%;

    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .option-key {
        font-weight: 600;
        color: $light-text-primary;
        min-width: 24px;
      }
    }
  }
}
</style>

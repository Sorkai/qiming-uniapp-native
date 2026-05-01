<template>
  <div
    class="main question-bank-page"
    :class="{ 'question-bank-page--mobile': isMobile }"
  >
    <!-- 头部统计 -->
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>📚 题库管理</h2>
          <p>管理知识竞赛题库，支持单选、多选、判断、填空、简答题型</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalQuestions }}</span>
            <span class="stat-label">题目总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.categories }}</span>
            <span class="stat-label">分类数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.usedCount }}</span>
            <span class="stat-label">使用次数</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="16" class="content-row">
      <!-- 左侧分类树 -->
      <el-col :xs="24" :sm="24" :md="6" :lg="5">
        <el-card class="box-card category-card">
          <template #header>
            <div class="card-header card-header--category">
              <div class="card-header-title">
                <span>题目分类</span>
                <span v-if="selectedCategory" class="header-subtitle">
                  当前：{{ selectedCategory.name }}
                </span>
              </div>
              <div class="header-actions header-actions--compact">
                <el-button
                  v-if="selectedCategory"
                  size="small"
                  link
                  @click="resetCategoryFilter"
                >
                  全部
                </el-button>
                <el-button
                  v-if="isMobile"
                  size="small"
                  link
                  @click="categoryPanelExpanded = !categoryPanelExpanded"
                >
                  {{ categoryPanelExpanded ? "收起" : "展开" }}
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="openCategoryDialog()"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <el-collapse-transition>
            <div
              v-show="!isMobile || categoryPanelExpanded"
              class="category-tree-wrap"
            >
              <el-tree
                ref="categoryTreeRef"
                :data="categoryTree"
                :props="{ label: 'name', children: 'children' }"
                node-key="categoryId"
                highlight-current
                default-expand-all
                @node-click="handleCategoryClick"
              >
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <span>{{ node.label }}</span>
                    <span class="count">({{ data.questionCount }})</span>
                  </span>
                </template>
              </el-tree>
            </div>
          </el-collapse-transition>
        </el-card>
      </el-col>

      <!-- 右侧题目列表 -->
      <el-col :xs="24" :sm="24" :md="18" :lg="19">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <div class="card-header-title">
                <span>题目列表</span>
                <span v-if="selectedCategory" class="header-subtitle">
                  当前分类：{{ selectedCategory.name }}
                </span>
              </div>
              <div class="header-actions">
                <el-button
                  type="success"
                  :size="isMobile ? 'small' : 'default'"
                  @click="batchImport"
                >
                  <el-icon><Upload /></el-icon>
                  批量导入
                </el-button>
                <el-button
                  type="primary"
                  :size="isMobile ? 'small' : 'default'"
                  @click="openQuestionDialog()"
                >
                  <el-icon><Plus /></el-icon>
                  添加题目
                </el-button>
              </div>
            </div>
          </template>

          <!-- 搜索区域 -->
          <div class="toolbar">
            <el-form
              :inline="!isMobile"
              :model="searchForm"
              :label-position="isMobile ? 'top' : 'right'"
              class="search-form"
            >
              <el-form-item label="题目内容">
                <el-input
                  v-model="searchForm.content"
                  placeholder="搜索题目内容"
                  clearable
                  :style="{ width: isMobile ? '100%' : '220px' }"
                />
              </el-form-item>
              <el-form-item label="题型">
                <el-select
                  v-model="searchForm.type"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '140px' }"
                >
                  <el-option label="单选题" value="single" />
                  <el-option label="多选题" value="multiple" />
                  <el-option label="判断题" value="judge" />
                  <el-option label="填空题" value="fill" />
                  <el-option label="简答题" value="essay" />
                </el-select>
              </el-form-item>
              <el-form-item label="难度">
                <el-select
                  v-model="searchForm.difficulty"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '120px' }"
                >
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </el-form-item>
              <el-form-item class="search-form__actions">
                <el-button type="primary" @click="loadQuestionList"
                  >搜索</el-button
                >
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 题目列表 -->
          <template v-if="isMobile">
            <div v-loading="loading" class="question-mobile-list">
              <div
                v-for="row in questionList"
                :key="row.questionId"
                class="question-mobile-card"
              >
                <div class="mobile-card-head">
                  <div class="mobile-card-head-left">
                    <el-checkbox
                      :model-value="isQuestionSelected(row.questionId)"
                      @change="
                        (checked: unknown) =>
                          toggleQuestionSelection(row, checked)
                      "
                    />
                    <div class="mobile-tag-group">
                      <el-tag :type="getTypeTagType(row.type)" size="small">
                        {{ getTypeLabel(row.type) }}
                      </el-tag>
                      <el-tag
                        :type="getDifficultyType(row.difficulty)"
                        size="small"
                      >
                        {{ getDifficultyLabel(row.difficulty) }}
                      </el-tag>
                    </div>
                  </div>
                  <span class="mobile-score">{{ row.score }} 分</span>
                </div>

                <div class="mobile-question-id">ID: {{ row.questionId }}</div>
                <div class="mobile-question-content">
                  {{ truncateText(row.content, 88) }}
                </div>

                <div class="mobile-meta-grid">
                  <div class="mobile-meta-item">
                    <span class="mobile-meta-label">使用次数</span>
                    <span class="mobile-meta-value"
                      >{{ row.usedCount }} 次</span
                    >
                  </div>
                  <div class="mobile-meta-item">
                    <span class="mobile-meta-label">创建时间</span>
                    <span class="mobile-meta-value">
                      {{ row.createTime || "-" }}
                    </span>
                  </div>
                </div>

                <div class="mobile-action-grid">
                  <el-button
                    type="primary"
                    size="small"
                    @click="viewQuestion(row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    type="warning"
                    size="small"
                    plain
                    @click="openQuestionDialog(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="deleteQuestion(row)"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <el-empty
                v-if="!loading && questionList.length === 0"
                description="暂无题目数据"
                class="mobile-empty"
              />
            </div>
          </template>
          <el-table
            v-else
            v-loading="loading"
            :data="questionList"
            stripe
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column
              prop="questionId"
              label="ID"
              width="80"
              align="center"
            />
            <el-table-column prop="content" label="题目内容" min-width="300">
              <template #default="{ row }">
                <el-tooltip
                  :content="row.content"
                  placement="top"
                  :show-after="500"
                >
                  <span class="question-content">{{
                    truncateText(row.content, 60)
                  }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="题型"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="difficulty"
              label="难度"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                  {{ getDifficultyLabel(row.difficulty) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="score"
              label="分值"
              width="80"
              align="center"
            />
            <el-table-column
              prop="usedCount"
              label="使用次数"
              width="100"
              align="center"
            />
            <el-table-column
              prop="createTime"
              label="创建时间"
              width="160"
              align="center"
            />
            <el-table-column
              label="操作"
              width="180"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="viewQuestion(row)"
                >
                  查看
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  link
                  @click="openQuestionDialog(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="deleteQuestion(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-footer">
            <div v-if="selectedQuestions.length > 0" class="batch-actions">
              <el-button type="danger" size="small" @click="batchDelete">
                批量删除 ({{ selectedQuestions.length }})
              </el-button>
              <el-button type="primary" size="small" @click="batchMove">
                批量移动
              </el-button>
            </div>
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[20, 50, 100]"
              :layout="paginationLayout"
              :size="isMobile ? 'small' : 'default'"
              :total="total"
              @size-change="loadQuestionList"
              @current-change="loadQuestionList"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 题目编辑弹窗 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="questionForm.questionId ? '编辑题目' : '添加题目'"
      :width="getDialogWidth('800px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
      align-center
    >
      <el-form
        ref="questionFormRef"
        :model="questionForm"
        :rules="questionRules"
        :label-width="isMobile ? undefined : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
        class="question-dialog-form"
      >
        <el-row :gutter="isMobile ? 0 : 20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="所属分类" prop="categoryId">
              <el-tree-select
                v-model="questionForm.categoryId"
                :data="categoryTree"
                :props="{
                  label: 'name',
                  value: 'categoryId',
                  children: 'children'
                }"
                placeholder="请选择分类"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="题型" prop="type">
              <el-select
                v-model="questionForm.type"
                placeholder="请选择题型"
                @change="handleTypeChange"
              >
                <el-option label="单选题" value="single" />
                <el-option label="多选题" value="multiple" />
                <el-option label="判断题" value="judge" />
                <el-option label="填空题" value="fill" />
                <el-option label="简答题" value="essay" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="questionForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <!-- 选项（单选/多选） -->
        <el-form-item
          v-if="['single', 'multiple'].includes(questionForm.type)"
          label="选项"
          prop="options"
        >
          <div class="options-editor">
            <div
              v-for="(option, index) in questionForm.options"
              :key="index"
              class="option-item"
            >
              <el-checkbox
                v-if="questionForm.type === 'multiple'"
                v-model="option.isAnswer"
              />
              <el-radio
                v-else
                :value="index"
                :model-value="questionForm.answer"
                @change="questionForm.answer = index"
              />
              <span class="option-label"
                >{{ String.fromCharCode(65 + index) }}.</span
              >
              <el-input v-model="option.content" placeholder="请输入选项内容" />
              <el-button
                v-if="questionForm.options.length > 2"
                type="danger"
                size="small"
                link
                @click="removeOption(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button
              v-if="questionForm.options.length < 6"
              type="primary"
              size="small"
              link
              @click="addOption"
            >
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </div>
        </el-form-item>

        <!-- 判断题答案 -->
        <el-form-item
          v-if="questionForm.type === 'judge'"
          label="答案"
          prop="answer"
        >
          <el-radio-group v-model="questionForm.answer">
            <el-radio :value="true">正确</el-radio>
            <el-radio :value="false">错误</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 填空/简答题答案 -->
        <el-form-item
          v-if="['fill', 'essay'].includes(questionForm.type)"
          label="参考答案"
          prop="answer"
        >
          <el-input
            v-model="questionForm.answer"
            type="textarea"
            :rows="3"
            placeholder="请输入参考答案"
          />
        </el-form-item>

        <el-row :gutter="isMobile ? 0 : 20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="难度" prop="difficulty">
              <el-select
                v-model="questionForm.difficulty"
                placeholder="请选择难度"
              >
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="分值" prop="score">
              <el-input-number
                v-model="questionForm.score"
                :min="1"
                :max="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="解析" prop="analysis">
          <el-input
            v-model="questionForm.analysis"
            type="textarea"
            :rows="3"
            placeholder="请输入题目解析（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestion">保存</el-button>
      </template>
    </el-dialog>

    <!-- 题目详情弹窗 -->
    <el-dialog
      v-model="questionDetailVisible"
      title="题目详情"
      :width="getDialogWidth('700px', '96%')"
      align-center
    >
      <div v-if="currentQuestion" class="question-detail">
        <div class="question-meta">
          <el-tag :type="getTypeTagType(currentQuestion.type)" size="small">
            {{ getTypeLabel(currentQuestion.type) }}
          </el-tag>
          <el-tag
            :type="getDifficultyType(currentQuestion.difficulty)"
            size="small"
          >
            {{ getDifficultyLabel(currentQuestion.difficulty) }}
          </el-tag>
          <span class="score">{{ currentQuestion.score }} 分</span>
        </div>

        <div class="question-content-section">
          <h4>题目</h4>
          <p>{{ currentQuestion.content }}</p>
        </div>

        <div
          v-if="['single', 'multiple'].includes(currentQuestion.type)"
          class="options-section"
        >
          <h4>选项</h4>
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="option-display"
            :class="{ 'is-answer': isCorrectOption(currentQuestion, index) }"
          >
            <span class="option-letter">{{
              String.fromCharCode(65 + index)
            }}</span>
            <span>{{ option.content }}</span>
            <el-icon
              v-if="isCorrectOption(currentQuestion, index)"
              class="check-icon"
            >
              <Check />
            </el-icon>
          </div>
        </div>

        <div class="answer-section">
          <h4>答案</h4>
          <p class="answer-text">{{ formatAnswer(currentQuestion) }}</p>
        </div>

        <div v-if="currentQuestion.analysis" class="analysis-section">
          <h4>解析</h4>
          <p>{{ currentQuestion.analysis }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 分类编辑弹窗 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="categoryForm.categoryId ? '编辑分类' : '添加分类'"
      :width="getDialogWidth('500px', '92%')"
      destroy-on-close
      align-center
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        :label-width="isMobile ? undefined : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="{
              label: 'name',
              value: 'categoryId',
              children: 'children'
            }"
            placeholder="请选择上级分类（可选）"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="categoryForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入题目"
      :width="getDialogWidth('600px', '96%')"
      align-center
    >
      <div class="import-content">
        <el-alert title="导入说明" type="info" :closable="false" class="mb-4">
          <template #default>
            <p>支持Excel文件（.xlsx）导入，请按照模板格式填写题目信息。</p>
          </template>
        </el-alert>

        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><Upload /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件
              <el-button type="primary" link @click="downloadTemplate"
                >下载模板</el-button
              >
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          @click="confirmImport"
        >
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Plus, Delete, Upload, Check } from "@element-plus/icons-vue";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getQuestionBankStats,
  getCategoryTree,
  upsertCategory,
  getQuestionList,
  upsertQuestion,
  deleteQuestion as deleteQuestionApi,
  batchDeleteQuestions,
  importQuestions
} from "@/api/competition";

defineOptions({
  name: "QuestionBankManage"
});

const { isMobile, paginationLayout, getDialogWidth } = usePageResponsive();

// 统计数据
const stats = ref({
  totalQuestions: 0,
  categories: 0,
  usedCount: 0
});

// 分类树
const categoryTreeRef = ref();
const categoryTree = ref<any[]>([]);
const selectedCategory = ref<any>(null);
const categoryPanelExpanded = ref(false);

// 题目列表
const loading = ref(false);
const questionList = ref<any[]>([]);
const total = ref(0);
const selectedQuestions = ref<any[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  categoryId: undefined as number | undefined
});

const searchForm = reactive({
  content: "",
  type: "",
  difficulty: ""
});

// 题目表单
const questionDialogVisible = ref(false);
const questionFormRef = ref<FormInstance>();
const questionForm = reactive({
  questionId: 0,
  categoryId: undefined as number | undefined,
  type: "single",
  content: "",
  options: [
    { content: "", isAnswer: false },
    { content: "", isAnswer: false },
    { content: "", isAnswer: false },
    { content: "", isAnswer: false }
  ] as Array<{ content: string; isAnswer: boolean }>,
  answer: 0 as any,
  difficulty: "easy",
  score: 5,
  analysis: ""
});

const questionRules = {
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  type: [{ required: true, message: "请选择题型", trigger: "change" }],
  content: [{ required: true, message: "请输入题目内容", trigger: "blur" }],
  difficulty: [{ required: true, message: "请选择难度", trigger: "change" }],
  score: [{ required: true, message: "请输入分值", trigger: "blur" }]
};

// 题目详情
const questionDetailVisible = ref(false);
const currentQuestion = ref<any>(null);

// 分类表单
const categoryDialogVisible = ref(false);
const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive({
  categoryId: 0,
  name: "",
  parentId: undefined as number | undefined,
  sort: 0
});
const categoryRules = {
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }]
};

// 批量导入
const importDialogVisible = ref(false);
const importLoading = ref(false);
const importFile = ref<File | null>(null);

const loadStats = async () => {
  try {
    const { data } = await getQuestionBankStats();
    stats.value = {
      totalQuestions: data.totalQuestions ?? 0,
      categories: data.totalCategories ?? 0,
      usedCount: data.usageCount ?? 0
    };
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const loadCategoryTree = async () => {
  try {
    const { data } = await getCategoryTree();
    categoryTree.value = data;
  } catch (error) {
    ElMessage.error("获取分类失败");
  }
};

const handleCategoryClick = (data: any) => {
  selectedCategory.value = data;
  queryParams.categoryId = data.categoryId;
  queryParams.pageNum = 1;
  if (isMobile.value) {
    categoryPanelExpanded.value = false;
  }
  loadQuestionList();
};

const resetCategoryFilter = () => {
  selectedCategory.value = null;
  queryParams.categoryId = undefined;
  queryParams.pageNum = 1;
  selectedQuestions.value = [];
  categoryTreeRef.value?.setCurrentKey?.(null);
  if (isMobile.value) {
    categoryPanelExpanded.value = false;
  }
  loadQuestionList();
};

const loadQuestionList = async () => {
  loading.value = true;
  selectedQuestions.value = [];
  try {
    const params = { ...queryParams, ...searchForm };
    const { data } = await getQuestionList(params);
    questionList.value = data.list || [];
    total.value = data.total || 0;
  } catch (error) {
    ElMessage.error("获取题目列表失败");
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.content = "";
  searchForm.type = "";
  searchForm.difficulty = "";
  queryParams.pageNum = 1;
  loadQuestionList();
};

const handleSelectionChange = (selection: any[]) => {
  selectedQuestions.value = selection;
};

const isQuestionSelected = (questionId: number) => {
  return selectedQuestions.value.some(item => item.questionId === questionId);
};

const toggleQuestionSelection = (row: any, checked: unknown) => {
  const shouldSelect =
    typeof checked === "boolean"
      ? checked
      : !isQuestionSelected(row.questionId);

  if (shouldSelect) {
    if (!isQuestionSelected(row.questionId)) {
      selectedQuestions.value = [...selectedQuestions.value, row];
    }
    return;
  }

  selectedQuestions.value = selectedQuestions.value.filter(
    item => item.questionId !== row.questionId
  );
};

const openQuestionDialog = (row?: any) => {
  questionForm.questionId = 0;
  questionForm.categoryId = selectedCategory.value?.categoryId;
  questionForm.type = "single";
  questionForm.content = "";
  questionForm.options = [
    { content: "", isAnswer: false },
    { content: "", isAnswer: false },
    { content: "", isAnswer: false },
    { content: "", isAnswer: false }
  ];
  questionForm.answer = 0;
  questionForm.difficulty = "easy";
  questionForm.score = 5;
  questionForm.analysis = "";

  if (row) {
    Object.assign(questionForm, row);
  }
  questionDialogVisible.value = true;
};

const handleTypeChange = (type: string) => {
  if (type === "judge") {
    questionForm.answer = true;
  } else if (type === "single") {
    questionForm.answer = 0;
  } else if (type === "multiple") {
    questionForm.options.forEach(opt => (opt.isAnswer = false));
  } else {
    questionForm.answer = "";
  }
};

const addOption = () => {
  questionForm.options.push({ content: "", isAnswer: false });
};

const removeOption = (index: number) => {
  questionForm.options.splice(index, 1);
  if (questionForm.type === "single" && questionForm.answer >= index) {
    questionForm.answer = Math.max(0, questionForm.answer - 1);
  }
};

const saveQuestion = async () => {
  questionFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await upsertQuestion(questionForm);
      ElMessage.success(questionForm.questionId ? "编辑成功" : "添加成功");
      questionDialogVisible.value = false;
      loadQuestionList();
      loadStats();
      loadCategoryTree();
    } catch (error) {
      ElMessage.error("保存失败");
    }
  });
};

const deleteQuestion = (row: any) => {
  ElMessageBox.confirm("确定删除该题目吗？", "提示", { type: "warning" })
    .then(async () => {
      try {
        await deleteQuestionApi({ questionId: row.questionId });
        ElMessage.success("删除成功");
        loadQuestionList();
        loadStats();
        loadCategoryTree();
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
    "提示",
    {
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const ids = selectedQuestions.value.map(q => q.questionId);
        await batchDeleteQuestions({ questionIds: ids });
        ElMessage.success("批量删除成功");
        loadQuestionList();
        loadStats();
        loadCategoryTree();
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

const batchMove = () => {
  ElMessage.info("批量移动功能开发中");
};

const viewQuestion = (row: any) => {
  currentQuestion.value = row;
  questionDetailVisible.value = true;
};

const openCategoryDialog = (row?: any) => {
  categoryForm.categoryId = 0;
  categoryForm.name = "";
  categoryForm.parentId = undefined;
  categoryForm.sort = 0;

  if (row) {
    Object.assign(categoryForm, row);
  }
  categoryDialogVisible.value = true;
};

const saveCategory = async () => {
  categoryFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await upsertCategory(categoryForm);
      ElMessage.success(categoryForm.categoryId ? "编辑成功" : "添加成功");
      categoryDialogVisible.value = false;
      loadCategoryTree();
      loadStats();
    } catch (error) {
      ElMessage.error("保存失败");
    }
  });
};

const batchImport = () => {
  importFile.value = null;
  importDialogVisible.value = true;
};

const handleFileChange = (file: any) => {
  importFile.value = file.raw;
};

const downloadTemplate = () => {
  ElMessage.info("下载模板功能开发中");
};

const confirmImport = async () => {
  if (!importFile.value) {
    ElMessage.warning("请选择文件");
    return;
  }
  importLoading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", importFile.value);
    await importQuestions(formData);
    ElMessage.success("导入成功");
    importDialogVisible.value = false;
    loadQuestionList();
    loadStats();
    loadCategoryTree();
  } catch (error) {
    ElMessage.error("导入失败");
  } finally {
    importLoading.value = false;
  }
};

// 工具函数
const truncateText = (text: string, length: number) => {
  return text.length > length ? text.slice(0, length) + "..." : text;
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    single: "单选题",
    multiple: "多选题",
    judge: "判断题",
    fill: "填空题",
    essay: "简答题"
  };
  return labels[type] || type;
};

const getTypeTagType = (type: string) => {
  const types: Record<
    string,
    "primary" | "success" | "warning" | "danger" | "info"
  > = {
    single: "primary",
    multiple: "success",
    judge: "warning",
    fill: "info",
    essay: "danger"
  };
  return types[type] || "info";
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
  };
  return labels[difficulty] || difficulty;
};

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, "success" | "warning" | "danger"> = {
    easy: "success",
    medium: "warning",
    hard: "danger"
  };
  return types[difficulty] || "info";
};

const isCorrectOption = (question: any, index: number) => {
  if (question.type === "single") {
    return question.answer === index;
  } else if (question.type === "multiple") {
    return question.options[index]?.isAnswer;
  }
  return false;
};

const formatAnswer = (question: any) => {
  if (question.type === "single") {
    return String.fromCharCode(65 + question.answer);
  } else if (question.type === "multiple") {
    return question.options
      .map((opt: any, idx: number) =>
        opt.isAnswer ? String.fromCharCode(65 + idx) : null
      )
      .filter(Boolean)
      .join(", ");
  } else if (question.type === "judge") {
    return question.answer ? "正确" : "错误";
  }
  return question.answer;
};

onMounted(() => {
  loadStats();
  loadCategoryTree();
  loadQuestionList();
});
</script>

<style lang="scss" scoped>
.main.question-bank-page {
  padding: 12px;

  .content-row {
    align-items: stretch;
  }

  .header-card {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 16px;

    .header-content {
      display: flex;
      gap: 24px;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .header-left {
      flex: 1;
      min-width: 0;

      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: #fff;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgb(255 255 255 / 85%);
      }
    }

    .header-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: rgb(255 255 255 / 75%);
        }
      }
    }
  }

  .box-card {
    border-radius: 16px;
  }

  .category-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tree-node {
      display: flex;
      gap: 4px;
      align-items: center;

      .count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .card-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;

    .card-header-title {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      font-weight: 600;
    }

    .header-subtitle {
      font-size: 13px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }

    .header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
    }

    .header-actions--compact {
      flex-shrink: 0;
    }
  }

  .category-tree-wrap {
    min-height: 120px;
  }

  .tree-node {
    display: flex;
    gap: 4px;
    align-items: center;
    min-width: 0;

    > span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0 12px;

    :deep(.el-form-item) {
      margin-bottom: 16px;
    }

    .search-form__actions {
      :deep(.el-form-item__content) {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }

  .question-content {
    cursor: pointer;
    line-height: 1.6;
  }

  .question-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .question-mobile-card {
    padding: 16px;
    background: linear-gradient(180deg, #fff, rgb(255 255 255 / 96%));
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 14px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
  }

  .mobile-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .mobile-card-head-left {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    min-width: 0;
    flex: 1;
  }

  .mobile-tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .mobile-score {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 600;
    color: #059669;
    white-space: nowrap;
    background: rgb(16 185 129 / 10%);
    border-radius: 999px;
  }

  .mobile-question-id {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .mobile-question-content {
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    word-break: break-word;
  }

  .mobile-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    margin-top: 14px;
  }

  .mobile-meta-item {
    padding: 10px 12px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
  }

  .mobile-meta-label {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .mobile-meta-value {
    display: block;
    font-size: 13px;
    color: var(--el-text-color-primary);
    word-break: break-word;
  }

  .mobile-action-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;

    .el-button {
      flex: 1 1 calc(33.333% - 6px);
      min-width: 0;
      margin-left: 0;
    }
  }

  .mobile-empty {
    padding-top: 12px;
  }

  .table-footer {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 16px;

    .batch-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
}

// 选项编辑器
.options-editor {
  :deep(.el-select),
  :deep(.el-tree-select),
  :deep(.el-input-number) {
    width: 100%;
  }

  .option-item {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;

    .option-label {
      width: 24px;
      font-weight: 600;
    }

    .el-input {
      flex: 1;
    }
  }
}

// 题目详情
.question-detail {
  .question-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;

    .score {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .question-content-section,
  .options-section,
  .answer-section,
  .analysis-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
    }

    p {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
    }
  }

  .option-display {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    .option-letter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      font-size: 12px;
      font-weight: 600;
      background: var(--el-fill-color);
      border-radius: 50%;
    }

    &.is-answer {
      background: #ecfdf5;
      border: 1px solid #10b981;

      .option-letter {
        color: #fff;
        background: #10b981;
      }
    }

    .check-icon {
      margin-left: auto;
      color: #10b981;
    }
  }

  .answer-text {
    font-weight: 600;
    color: #10b981;
  }
}

// 导入弹窗
.import-content {
  .mb-4 {
    margin-bottom: 16px;
  }
}

.question-dialog-form {
  :deep(.el-select),
  :deep(.el-tree-select),
  :deep(.el-input-number) {
    width: 100%;
  }
}

.question-bank-page--mobile {
  padding: 8px;

  .header-card {
    margin-bottom: 12px;
  }

  .header-card .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .header-card .header-left h2 {
    font-size: 22px;
  }

  .header-card .header-stats {
    width: 100%;
    gap: 12px;
  }

  .header-card .header-stats .stat-item {
    flex: 1 1 calc(33.333% - 8px);
    min-width: 88px;
    padding: 12px;
    background: rgb(255 255 255 / 12%);
    border-radius: 12px;
  }

  .card-header {
    flex-direction: column;
  }

  .card-header .header-actions {
    justify-content: flex-start;
  }

  .category-card {
    margin-bottom: 12px;
  }

  .category-tree-wrap {
    padding-top: 4px;
  }

  .category-card :deep(.el-tree-node__content) {
    height: auto;
    min-height: 36px;
    padding: 6px 0;
  }

  .search-form {
    display: block;
  }

  .search-form :deep(.el-form-item) {
    margin-right: 0;
  }

  .search-form .search-form__actions :deep(.el-form-item__content) {
    width: 100%;
  }

  .search-form .search-form__actions :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }

  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-actions {
    width: 100%;
  }

  .batch-actions :deep(.el-button) {
    flex: 1;
    margin-left: 0;
  }

  .table-footer :deep(.el-pagination) {
    justify-content: center;
  }

  .options-editor .option-item {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .options-editor .option-label {
    width: auto;
    min-width: 24px;
    padding-top: 6px;
  }

  .options-editor :deep(.el-checkbox),
  .options-editor :deep(.el-radio) {
    margin-top: 6px;
  }

  .options-editor .el-input {
    flex: 1 1 100%;
  }

  .question-detail .question-meta,
  .question-detail .option-display {
    flex-wrap: wrap;
  }

  .import-content :deep(.el-upload),
  .import-content :deep(.el-upload-dragger) {
    width: 100%;
  }

  .import-content :deep(.el-upload-dragger) {
    padding: 24px 16px;
  }
}
</style>

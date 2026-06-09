<template>
  <div class="main oj-manage" :class="{ 'oj-manage--mobile': isMobile }">
    <!-- 头部统计 -->
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>💻 在线 OJ 管理</h2>
          <p>管理编程题目、查看学生提交记录与判题结果</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalProblems }}</span>
            <span class="stat-label">题目总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalSubmissions }}</span>
            <span class="stat-label">提交次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.acceptRate }}%</span>
            <span class="stat-label">通过率</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeUsers }}</span>
            <span class="stat-label">活跃用户</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 标签页切换 -->
    <el-card class="box-card">
      <el-tabs
        v-model="activeTab"
        class="oj-tabs"
        :stretch="isMobile"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="题目管理" name="problems">
          <!-- 题目搜索 -->
          <div class="toolbar">
            <el-form
              :inline="!isMobile"
              :model="problemSearch"
              :label-position="isMobile ? 'top' : 'right'"
              class="search-form"
            >
              <el-form-item label="题目名称">
                <el-input
                  v-model="problemSearch.title"
                  placeholder="请输入题目名称"
                  clearable
                  :style="{ width: isMobile ? '100%' : '200px' }"
                />
              </el-form-item>
              <el-form-item label="难度">
                <el-select
                  v-model="problemSearch.difficulty"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '120px' }"
                >
                  <el-option label="简单" value="easy" />
                  <el-option label="中等" value="medium" />
                  <el-option label="困难" value="hard" />
                </el-select>
              </el-form-item>
              <el-form-item label="标签">
                <el-select
                  v-model="problemSearch.tag"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '150px' }"
                >
                  <el-option
                    v-for="tag in tagOptions"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadProblems">搜索</el-button>
                <el-button @click="resetProblemSearch">重置</el-button>
              </el-form-item>
            </el-form>
            <div class="toolbar-actions">
              <el-button
                type="primary"
                :class="{ 'toolbar-action-button': isMobile }"
                @click="openProblemDialog()"
              >
                <el-icon><Plus /></el-icon>
                添加题目
              </el-button>
            </div>
          </div>

          <!-- 题目列表 -->
          <template v-if="isMobile">
            <div v-loading="problemLoading" class="mobile-problem-list">
              <div
                v-for="row in problemList"
                :key="row.problemId"
                class="mobile-problem-card"
              >
                <div class="mobile-card-head">
                  <div class="mobile-card-head-main">
                    <span class="mobile-card-id">#{{ row.problemId }}</span>
                    <el-link
                      type="primary"
                      class="mobile-card-title"
                      @click="viewProblemDetail(row)"
                    >
                      {{ row.title }}
                    </el-link>
                  </div>
                  <el-tag
                    :type="getProblemStatusType(row.status)"
                    size="small"
                    effect="light"
                  >
                    {{ getProblemStatusLabel(row.status) }}
                  </el-tag>
                </div>

                <div class="mobile-card-tags">
                  <el-tag
                    :type="getDifficultyType(row.difficulty)"
                    size="small"
                    effect="light"
                  >
                    {{ getDifficultyLabel(row.difficulty) }}
                  </el-tag>
                  <span
                    class="mobile-rate"
                    :class="getAcceptRateClass(row.acceptRate)"
                  >
                    通过率 {{ row.acceptRate }}%
                  </span>
                </div>

                <div v-if="row.tags?.length" class="mobile-tag-list">
                  <el-tag
                    v-for="tag in row.tags"
                    :key="tag"
                    size="small"
                    class="tag-item"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>

                <div class="mobile-metrics">
                  <div class="metric-item">
                    <span class="metric-label">提交数</span>
                    <strong>{{ row.submitCount }}</strong>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">通过数</span>
                    <strong>{{ row.acceptCount }}</strong>
                  </div>
                </div>

                <div class="mobile-card-actions">
                  <el-button size="small" plain @click="openProblemDialog(row)">
                    编辑
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    plain
                    @click="viewSubmissions(row)"
                  >
                    提交记录
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="deleteProblem(row)"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <el-empty
                v-if="!problemLoading && problemList.length === 0"
                description="暂无题目"
              />
            </div>
          </template>
          <div v-else class="table-shell">
            <el-table
              v-loading="problemLoading"
              :data="problemList"
              stripe
              style="width: 100%"
            >
              <el-table-column
                prop="problemId"
                label="ID"
                width="80"
                align="center"
              />
              <el-table-column prop="title" label="题目名称" min-width="200">
                <template #default="{ row }">
                  <el-link type="primary" @click="viewProblemDetail(row)">
                    {{ row.title }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column
                prop="difficulty"
                label="难度"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag
                    :type="getDifficultyType(row.difficulty)"
                    size="small"
                  >
                    {{ getDifficultyLabel(row.difficulty) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tags" label="标签" width="200">
                <template #default="{ row }">
                  <el-tag
                    v-for="tag in row.tags"
                    :key="tag"
                    size="small"
                    class="tag-item"
                  >
                    {{ tag }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="submitCount"
                label="提交数"
                width="100"
                align="center"
              />
              <el-table-column
                prop="acceptCount"
                label="通过数"
                width="100"
                align="center"
              />
              <el-table-column
                prop="acceptRate"
                label="通过率"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <span :class="getAcceptRateClass(row.acceptRate)">
                    {{ row.acceptRate }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="status"
                label="状态"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag :type="getProblemStatusType(row.status)" size="small">
                    {{ getProblemStatusLabel(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="200"
                align="center"
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    link
                    @click="openProblemDialog(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    link
                    @click="viewSubmissions(row)"
                  >
                    提交记录
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    link
                    @click="deleteProblem(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="problemParams.pageNum"
              v-model:page-size="problemParams.pageSize"
              :page-sizes="[10, 20, 50]"
              :layout="paginationLayout"
              :size="isMobile ? 'small' : 'default'"
              :total="problemTotal"
              @size-change="loadProblems"
              @current-change="loadProblems"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="提交记录" name="submissions">
          <!-- 提交记录搜索 -->
          <div class="toolbar">
            <el-form
              :inline="!isMobile"
              :model="submissionSearch"
              :label-position="isMobile ? 'top' : 'right'"
              class="search-form"
            >
              <el-form-item label="题目ID">
                <el-input
                  v-model="submissionSearch.problemId"
                  placeholder="题目ID"
                  clearable
                  :style="{ width: isMobile ? '100%' : '120px' }"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input
                  v-model="submissionSearch.username"
                  placeholder="用户名"
                  clearable
                  :style="{ width: isMobile ? '100%' : '150px' }"
                />
              </el-form-item>
              <el-form-item label="判题结果">
                <el-select
                  v-model="submissionSearch.result"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '150px' }"
                >
                  <el-option label="Accepted" value="AC" />
                  <el-option label="Wrong Answer" value="WA" />
                  <el-option label="Time Limit Exceeded" value="TLE" />
                  <el-option label="Memory Limit Exceeded" value="MLE" />
                  <el-option label="Runtime Error" value="RE" />
                  <el-option label="Compile Error" value="CE" />
                </el-select>
              </el-form-item>
              <el-form-item label="语言">
                <el-select
                  v-model="submissionSearch.language"
                  placeholder="请选择"
                  clearable
                  :style="{ width: isMobile ? '100%' : '120px' }"
                >
                  <el-option label="C++" value="cpp" />
                  <el-option label="Java" value="java" />
                  <el-option label="Python" value="python" />
                  <el-option label="JavaScript" value="javascript" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadSubmissions"
                  >搜索</el-button
                >
                <el-button @click="resetSubmissionSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 提交记录列表 -->
          <template v-if="isMobile">
            <div v-loading="submissionLoading" class="mobile-submission-list">
              <div
                v-for="row in submissionList"
                :key="row.submissionId"
                class="mobile-submission-card"
              >
                <div class="mobile-card-head">
                  <div class="mobile-card-head-main">
                    <span class="mobile-card-id">#{{ row.submissionId }}</span>
                    <div class="mobile-card-title">{{ row.problemTitle }}</div>
                  </div>
                  <el-tag
                    :type="getResultType(row.result)"
                    size="small"
                    effect="light"
                  >
                    {{ row.result }}
                  </el-tag>
                </div>

                <div class="mobile-submission-meta">
                  <span>题目 ID：{{ row.problemId }}</span>
                  <span>用户：{{ row.username }}</span>
                  <span>语言：{{ getLanguageLabel(row.language) }}</span>
                  <span>用时：{{ row.time }} ms</span>
                  <span>内存：{{ row.memory }} KB</span>
                  <span>提交时间：{{ row.submitTime }}</span>
                </div>

                <div class="mobile-card-actions">
                  <el-button
                    type="primary"
                    size="small"
                    plain
                    @click="viewCode(row)"
                  >
                    查看代码
                  </el-button>
                </div>
              </div>

              <el-empty
                v-if="!submissionLoading && submissionList.length === 0"
                description="暂无提交记录"
              />
            </div>
          </template>
          <div v-else class="table-shell">
            <el-table
              v-loading="submissionLoading"
              :data="submissionList"
              stripe
              style="width: 100%"
            >
              <el-table-column
                prop="submissionId"
                label="提交ID"
                width="100"
                align="center"
              />
              <el-table-column
                prop="problemId"
                label="题目ID"
                width="100"
                align="center"
              />
              <el-table-column
                prop="problemTitle"
                label="题目名称"
                min-width="180"
              />
              <el-table-column prop="username" label="用户" width="120" />
              <el-table-column
                prop="result"
                label="结果"
                width="150"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag :type="getResultType(row.result)" size="small">
                    {{ row.result }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="language"
                label="语言"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  {{ getLanguageLabel(row.language) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="time"
                label="用时"
                width="100"
                align="center"
              >
                <template #default="{ row }"> {{ row.time }} ms </template>
              </el-table-column>
              <el-table-column
                prop="memory"
                label="内存"
                width="100"
                align="center"
              >
                <template #default="{ row }"> {{ row.memory }} KB </template>
              </el-table-column>
              <el-table-column
                prop="submitTime"
                label="提交时间"
                width="180"
                align="center"
              />
              <el-table-column
                label="操作"
                width="120"
                align="center"
                fixed="right"
              >
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    link
                    @click="viewCode(row)"
                  >
                    查看代码
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="submissionParams.pageNum"
              v-model:page-size="submissionParams.pageSize"
              :page-sizes="[20, 50, 100]"
              :layout="paginationLayout"
              :size="isMobile ? 'small' : 'default'"
              :total="submissionTotal"
              @size-change="loadSubmissions"
              @current-change="loadSubmissions"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 题目编辑弹窗 -->
    <el-dialog
      v-model="problemDialogVisible"
      :title="problemForm.problemId ? '编辑题目' : '添加题目'"
      :width="getDialogWidth('900px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <el-form
        ref="problemFormRef"
        :model="problemForm"
        :rules="problemRules"
        :label-width="isMobile ? undefined : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-row :gutter="isMobile ? 0 : 20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="题目名称" prop="title">
              <el-input
                v-model="problemForm.title"
                placeholder="请输入题目名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="难度" prop="difficulty">
              <el-select
                v-model="problemForm.difficulty"
                placeholder="请选择难度"
              >
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="isMobile ? 0 : 20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="时间限制" prop="timeLimit">
              <el-input-number
                v-model="problemForm.timeLimit"
                :min="100"
                :max="10000"
                :step="100"
                class="oj-number-input"
              />
              <span class="unit">ms</span>
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="内存限制" prop="memoryLimit">
              <el-input-number
                v-model="problemForm.memoryLimit"
                :min="16"
                :max="512"
                :step="16"
                class="oj-number-input"
              />
              <span class="unit">MB</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="problemForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="题目描述" prop="description">
          <el-input
            v-model="problemForm.description"
            type="textarea"
            :rows="6"
            placeholder="请输入题目描述（支持Markdown）"
          />
        </el-form-item>
        <el-row :gutter="isMobile ? 0 : 20">
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="输入格式" prop="inputFormat">
              <el-input
                v-model="problemForm.inputFormat"
                type="textarea"
                :rows="3"
                placeholder="请描述输入格式"
              />
            </el-form-item>
          </el-col>
          <el-col :span="isMobile ? 24 : 12">
            <el-form-item label="输出格式" prop="outputFormat">
              <el-input
                v-model="problemForm.outputFormat"
                type="textarea"
                :rows="3"
                placeholder="请描述输出格式"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="示例输入" prop="sampleInput">
          <el-input
            v-model="problemForm.sampleInput"
            type="textarea"
            :rows="3"
            placeholder="示例输入"
          />
        </el-form-item>
        <el-form-item label="示例输出" prop="sampleOutput">
          <el-input
            v-model="problemForm.sampleOutput"
            type="textarea"
            :rows="3"
            placeholder="示例输出"
          />
        </el-form-item>
        <el-form-item label="提示" prop="hint">
          <el-input
            v-model="problemForm.hint"
            type="textarea"
            :rows="2"
            placeholder="给学生的提示信息（选填）"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="problemForm.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="problemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProblem">保存</el-button>
      </template>
    </el-dialog>

    <!-- 题目详情弹窗 -->
    <el-dialog
      v-model="problemDetailVisible"
      :title="currentProblem?.title"
      :width="getDialogWidth('800px', '96%')"
      :fullscreen="isMobile"
    >
      <div v-if="currentProblem" class="problem-detail">
        <div class="problem-meta">
          <el-tag
            :type="getDifficultyType(currentProblem.difficulty)"
            size="small"
          >
            {{ getDifficultyLabel(currentProblem.difficulty) }}
          </el-tag>
          <span class="meta-item"
            >时间限制: {{ currentProblem.timeLimit }}ms</span
          >
          <span class="meta-item"
            >内存限制: {{ currentProblem.memoryLimit }}MB</span
          >
        </div>
        <el-divider />
        <div class="section">
          <h4>题目描述</h4>
          <div
            class="content"
            v-html="renderMarkdown(currentProblem.description)"
          />
        </div>
        <div class="section">
          <h4>输入格式</h4>
          <div class="content">{{ currentProblem.inputFormat }}</div>
        </div>
        <div class="section">
          <h4>输出格式</h4>
          <div class="content">{{ currentProblem.outputFormat }}</div>
        </div>
        <div class="section">
          <h4>示例</h4>
          <el-row :gutter="isMobile ? 0 : 20">
            <el-col :span="isMobile ? 24 : 12">
              <div class="sample-box">
                <div class="sample-label">输入</div>
                <pre>{{ currentProblem.sampleInput }}</pre>
              </div>
            </el-col>
            <el-col :span="isMobile ? 24 : 12">
              <div class="sample-box">
                <div class="sample-label">输出</div>
                <pre>{{ currentProblem.sampleOutput }}</pre>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-if="currentProblem.hint" class="section">
          <h4>提示</h4>
          <div class="content">{{ currentProblem.hint }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 代码查看弹窗 -->
    <el-dialog
      v-model="codeDialogVisible"
      title="提交代码"
      :width="getDialogWidth('800px', '96%')"
      :fullscreen="isMobile"
    >
      <div v-if="currentSubmission" class="code-info">
        <el-descriptions :column="isMobile ? 1 : 4" border size="small">
          <el-descriptions-item label="提交ID">{{
            currentSubmission.submissionId
          }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{
            currentSubmission.username
          }}</el-descriptions-item>
          <el-descriptions-item label="语言">{{
            getLanguageLabel(currentSubmission.language)
          }}</el-descriptions-item>
          <el-descriptions-item label="结果">
            <el-tag
              :type="getResultType(currentSubmission.result)"
              size="small"
            >
              {{ currentSubmission.result }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="code-container">
        <pre><code>{{ currentSubmission?.code }}</code></pre>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getOJStats,
  getProblemList,
  upsertProblem,
  deleteProblem as deleteProblemApi,
  getSubmissionList,
  getSubmissionDetail
} from "@/api/competition";

defineOptions({
  name: "OJManage"
});

const { isMobile, paginationLayout, getDialogWidth } = usePageResponsive();

const activeTab = ref("problems");

// 统计数据
const stats = ref({
  totalProblems: 0,
  totalSubmissions: 0,
  acceptRate: 0,
  activeUsers: 0
});

// 标签选项
const tagOptions = ref([
  "数组",
  "字符串",
  "链表",
  "树",
  "图",
  "动态规划",
  "贪心",
  "回溯",
  "分治",
  "排序",
  "搜索",
  "数学",
  "位运算",
  "栈",
  "队列",
  "哈希表",
  "双指针",
  "滑动窗口"
]);

// 题目相关
const problemLoading = ref(false);
const problemList = ref<any[]>([]);
const problemTotal = ref(0);
const problemParams = reactive({ pageNum: 1, pageSize: 20 });
const problemSearch = reactive({ title: "", difficulty: "", tag: "" });

// 提交记录相关
const submissionLoading = ref(false);
const submissionList = ref<any[]>([]);
const submissionTotal = ref(0);
const submissionParams = reactive({ pageNum: 1, pageSize: 20 });
const submissionSearch = reactive({
  problemId: "",
  username: "",
  result: "",
  language: ""
});

// 题目表单
const problemDialogVisible = ref(false);
const problemFormRef = ref<FormInstance>();
const problemForm = reactive({
  problemId: 0,
  title: "",
  difficulty: "",
  timeLimit: 1000,
  memoryLimit: 128,
  tags: [] as string[],
  description: "",
  inputFormat: "",
  outputFormat: "",
  sampleInput: "",
  sampleOutput: "",
  hint: "",
  status: "draft"
});

const problemRules = {
  title: [{ required: true, message: "请输入题目名称", trigger: "blur" }],
  difficulty: [{ required: true, message: "请选择难度", trigger: "change" }],
  description: [{ required: true, message: "请输入题目描述", trigger: "blur" }],
  inputFormat: [{ required: true, message: "请输入输入格式", trigger: "blur" }],
  outputFormat: [
    { required: true, message: "请输入输出格式", trigger: "blur" }
  ],
  sampleInput: [{ required: true, message: "请输入示例输入", trigger: "blur" }],
  sampleOutput: [{ required: true, message: "请输入示例输出", trigger: "blur" }]
};

// 题目详情
const problemDetailVisible = ref(false);
const currentProblem = ref<any>(null);

// 代码查看
const codeDialogVisible = ref(false);
const currentSubmission = ref<any>(null);

const handleTabChange = (tab: string) => {
  if (tab === "problems") {
    loadProblems();
  } else {
    loadSubmissions();
  }
};

const loadStats = async () => {
  try {
    const { data } = await getOJStats();
    stats.value = data;
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const loadProblems = async () => {
  problemLoading.value = true;
  try {
    const params = { ...problemParams, ...problemSearch };
    const { data } = await getProblemList(params);
    problemList.value = data.list;
    problemTotal.value = data.total;
  } catch (error) {
    ElMessage.error("获取题目列表失败");
  } finally {
    problemLoading.value = false;
  }
};

const resetProblemSearch = () => {
  problemSearch.title = "";
  problemSearch.difficulty = "";
  problemSearch.tag = "";
  problemParams.pageNum = 1;
  loadProblems();
};

const loadSubmissions = async () => {
  submissionLoading.value = true;
  try {
    const params = {
      ...submissionParams,
      language: submissionSearch.language || undefined,
      status: submissionSearch.result || undefined,
      problemId: submissionSearch.problemId
        ? Number(submissionSearch.problemId)
        : undefined
    };
    const { data } = await getSubmissionList(params);
    submissionList.value = data.list;
    submissionTotal.value = data.total;
  } catch (error) {
    ElMessage.error("获取提交记录失败");
  } finally {
    submissionLoading.value = false;
  }
};

const resetSubmissionSearch = () => {
  submissionSearch.problemId = "";
  submissionSearch.username = "";
  submissionSearch.result = "";
  submissionSearch.language = "";
  submissionParams.pageNum = 1;
  loadSubmissions();
};

const openProblemDialog = (row?: any) => {
  // 重置表单
  problemForm.problemId = 0;
  problemForm.title = "";
  problemForm.difficulty = "";
  problemForm.timeLimit = 1000;
  problemForm.memoryLimit = 128;
  problemForm.tags = [];
  problemForm.description = "";
  problemForm.inputFormat = "";
  problemForm.outputFormat = "";
  problemForm.sampleInput = "";
  problemForm.sampleOutput = "";
  problemForm.hint = "";
  problemForm.status = "draft";

  if (row) {
    Object.assign(problemForm, row);
  }
  problemDialogVisible.value = true;
};

const saveProblem = async () => {
  problemFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await upsertProblem({
        problemId: problemForm.problemId || undefined,
        title: problemForm.title,
        difficulty: problemForm.difficulty,
        tags: problemForm.tags,
        content: problemForm.description,
        inputFormat: problemForm.inputFormat,
        outputFormat: problemForm.outputFormat,
        examples: [
          {
            input: problemForm.sampleInput,
            output: problemForm.sampleOutput
          }
        ],
        timeLimit: problemForm.timeLimit,
        memoryLimit: problemForm.memoryLimit,
        hint: problemForm.hint,
        testCases: [
          {
            input: problemForm.sampleInput,
            output: problemForm.sampleOutput
          }
        ],
        status: problemForm.status
      });
      ElMessage.success(problemForm.problemId ? "编辑成功" : "添加成功");
      problemDialogVisible.value = false;
      loadProblems();
      loadStats();
    } catch (error) {
      ElMessage.error("保存失败");
    }
  });
};

const deleteProblem = (row: any) => {
  ElMessageBox.confirm(`确定删除题目 "${row.title}" 吗？`, "提示", {
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteProblemApi({ problemId: row.problemId });
        ElMessage.success("删除成功");
        loadProblems();
        loadStats();
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

const viewProblemDetail = (row: any) => {
  currentProblem.value = row;
  problemDetailVisible.value = true;
};

const viewSubmissions = (row: any) => {
  submissionSearch.problemId = row.problemId;
  activeTab.value = "submissions";
  loadSubmissions();
};

const viewCode = async (row: any) => {
  try {
    const { data } = await getSubmissionDetail({
      submissionId: row.submissionId
    });
    currentSubmission.value = data;
    codeDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取代码失败");
  }
};

const renderMarkdown = (text: string) => {
  // 简单的Markdown渲染，实际项目可使用marked等库
  return text?.replace(/\n/g, "<br>") || "";
};

// 工具函数
const getDifficultyType = (difficulty: string) => {
  const types: Record<string, "success" | "warning" | "danger"> = {
    easy: "success",
    medium: "warning",
    hard: "danger"
  };
  return types[difficulty] || "info";
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
  };
  return labels[difficulty] || difficulty;
};

const getProblemStatusType = (status: string) =>
  status === "published" ? "success" : "info";

const getProblemStatusLabel = (status: string) =>
  status === "published" ? "已发布" : "草稿";

const getAcceptRateClass = (rate: number) => {
  if (rate >= 60) return "rate-high";
  if (rate >= 30) return "rate-medium";
  return "rate-low";
};

const getResultType = (result: string) => {
  const types: Record<string, "success" | "danger" | "warning" | "info"> = {
    AC: "success",
    Accepted: "success",
    WA: "danger",
    "Wrong Answer": "danger",
    TLE: "warning",
    "Time Limit Exceeded": "warning",
    MLE: "warning",
    "Memory Limit Exceeded": "warning",
    RE: "danger",
    "Runtime Error": "danger",
    CE: "info",
    "Compile Error": "info"
  };
  return types[result] || "info";
};

const getLanguageLabel = (lang: string) => {
  const labels: Record<string, string> = {
    cpp: "C++",
    java: "Java",
    python: "Python",
    javascript: "JavaScript",
    c: "C"
  };
  return labels[lang] || lang;
};

onMounted(() => {
  loadStats();
  loadProblems();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;
  color: var(--el-text-color-primary);

  .header-card {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 8px 0;
    }

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: #1e3a5f;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #374151;
      }
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(4, minmax(90px, 1fr));
      gap: 16px;

      .stat-item {
        text-align: center;
        padding: 14px 12px;
        background: rgb(255 255 255 / 45%);
        border: 1px solid rgb(255 255 255 / 30%);
        border-radius: 14px;
        backdrop-filter: blur(12px);

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #1e3a5f;
        }

        .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #4b5563;
        }
      }
    }
  }

  .box-card {
    border-radius: 16px;

    .oj-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 20px;
      }
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .search-form {
      flex: 1;
      min-width: min(100%, 720px);
    }
  }

  .toolbar-actions {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
  }

  .table-shell {
    overflow-x: auto;

    :deep(.el-table) {
      min-width: 980px;
    }
  }

  .tag-item {
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .rate-high {
    font-weight: 600;
    color: #10b981;
  }

  .rate-medium {
    font-weight: 600;
    color: #f59e0b;
  }

  .rate-low {
    font-weight: 600;
    color: #ef4444;
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .mobile-problem-list,
  .mobile-submission-list {
    display: grid;
    gap: 12px;
  }

  .mobile-problem-card,
  .mobile-submission-card {
    padding: 16px;
    background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 18px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
  }

  .mobile-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .mobile-card-head-main {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .mobile-card-id {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.08em;
  }

  .mobile-card-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .mobile-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .mobile-rate {
    font-size: 13px;
  }

  .mobile-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .mobile-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 14px;

    strong {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .metric-label {
    font-size: 12px;
    color: #64748b;
  }

  .mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .mobile-submission-meta {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .unit {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
  }

  .oj-number-input {
    width: 160px;
  }
}

.oj-manage--mobile {
  padding: 8px;

  .header-card {
    border-radius: 20px;

    .header-content {
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
    }

    .header-left {
      h2 {
        font-size: 22px;
        line-height: 1.3;
      }

      p {
        line-height: 1.6;
      }
    }

    .header-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;

      .stat-item {
        text-align: left;
      }
    }
  }

  .box-card {
    border-radius: 20px;

    .toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-form {
      min-width: 0;

      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 12px;
      }

      :deep(.el-form-item__content) {
        width: 100%;
      }
    }
  }

  .toolbar-actions {
    width: 100%;
  }

  .toolbar-action-button {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
    margin-top: 20px;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      row-gap: 8px;
    }
  }

  .oj-number-input {
    width: 100%;
  }
}

// 题目详情样式
.problem-detail {
  .problem-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    .meta-item {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .content {
      font-size: 14px;
      line-height: 1.6;
      color: var(--el-text-color-regular);
    }
  }

  .sample-box {
    overflow: hidden;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    .sample-label {
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
    }

    pre {
      padding: 12px;
      margin: 0;
      font-family: Consolas, monospace;
      font-size: 14px;
      white-space: pre-wrap;
    }
  }
}

.oj-manage--mobile {
  .problem-detail {
    .section {
      margin-bottom: 16px;
    }
  }
}

// 代码查看样式
.code-info {
  margin-bottom: 16px;
}

.code-container {
  max-height: 500px;
  padding: 16px;
  overflow: auto;
  background: #1e1e1e;
  border-radius: 8px;

  pre {
    margin: 0;

    code {
      font-family: Consolas, Monaco, monospace;
      font-size: 14px;
      line-height: 1.5;
      color: #d4d4d4;
      white-space: pre-wrap;
    }
  }
}
</style>

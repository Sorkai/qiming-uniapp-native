<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "ExamPaperMyPapers"
});

const router = useRouter();

//搜索表单
const searchForm = reactive({
  keyword: "",
  status: "",
  courseId: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 试卷列表
const paperList = ref([
  {
    id: 1,
    title: "2024年春季期中考试",
    courseName: "高等数学",
    createTime: "2024-03-1009:00",
    updateTime: "2024-03-15 14:30",
    status: 1,
    questionCount: 25,
    totalPoints: 100,
    publishCount: 2
  },
  {
    id: 2,
    title: "第三章单元测试",
    courseName: "线性代数",
    createTime: "2024-03-08 10:00",
    updateTime: "2024-03-14 10:20",
    status: 0,
    questionCount: 15,
    totalPoints: 50,
    publishCount: 0
  },
  {
    id: 3,
    title: "期末复习作业",
    courseName: "概率论",
    createTime: "2024-03-05 14:00",
    updateTime: "2024-03-13 16:45",
    status: 1,
    questionCount: 20,
    totalPoints: 80,
    publishCount: 1
  }
]);

const loading = ref(false);

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.keyword = "";
  searchForm.status = "";
  searchForm.courseId = "";
  handleSearch();
};

// 加载数据
const loadData = () => {
  loading.value = true;
  // 模拟加载
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 创建新试卷
const createPaper = () => {
  router.push("/exam-paper/editor");
};

// 编辑试卷
const editPaper = (paper: any) => {
  router.push(`/exam-paper/editor/${paper.id}`);
};

// 复制试卷
const copyPaper = (paper: any) => {
  ElMessageBox.confirm(`确定要复制试卷"${paper.title}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    ElMessage.success("复制成功");
  });
};

// 删除试卷
const deletePaper = (paper: any) => {
  ElMessageBox.confirm(`确定要删除试卷"${paper.title}"吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    ElMessage.success("删除成功");
    loadData();
  });
};

// 发布试卷
const publishPaper = (paper: any) => {
  router.push(`/exam-paper/publish/${paper.id}`);
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  return status === 1 ? "success" : "info";
};

// 获取状态文本
const getStatusText = (status: number) => {
  return status === 1 ? "已发布" : "草稿";
};

// 分页变化
const handlePageChange = () => {
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="my-papers-page">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="试卷标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="草稿" value="0" />
            <el-option label="已发布" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"
            ><el-icon class="mr-1"><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="createPaper">
        <el-icon class="mr-1"><Plus /></el-icon>
        新建试卷
      </el-button>
    </div>

    <!-- 试卷列表 -->
    <el-card shadow="never">
      <el-table :data="paperList" v-loading="loading" stripe>
        <el-table-column prop="title" label="试卷标题" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="editPaper(row)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="courseName" label="所属课程" width="120" />
        <el-table-column
          prop="questionCount"
          label="题目数"
          width="80"
          align="center"
        />
        <el-table-column
          prop="totalPoints"
          label="总分"
          width="80"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishCount" label="发布次数" width="100" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editPaper(row)">
              编辑
            </el-button>
            <el-button type="primary" link size="small" @click="publishPaper(row)">
              发布
            </el-button>
            <el-button type="primary" link size="small" @click="copyPaper(row)">
              复制
            </el-button>
            <el-button type="danger" link size="small" @click="deletePaper(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.my-papers-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
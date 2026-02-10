<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({
  name: "ExamPaperTemplates"
});

const router = useRouter();

// 系统模板
const systemTemplates = ref([
  {
    id: 1,
    name: "标准考试模板",
    description: "包含单选、多选、判断、填空、简答题型，适合期中期末考试",
    questionTypes: ["单选题", "多选题", "判断题", "填空题", "简答题"],
    totalQuestions: 6,
    totalPoints: 26,
    useCount: 156,
    isSystem: true
  },
  {
    id: 2,
    name: "快速测验模板",
    description: "仅包含客观题，适合课堂小测和随堂练习",
    questionTypes: ["单选题", "多选题", "判断题"],
    totalQuestions: 6,
    totalPoints: 35,
    useCount: 89,
    isSystem: true
  },
  {
    id: 3,
    name: "综合能力测试",
    description: "包含材料分析、论述等主观题，适合综合能力评估",
    questionTypes: ["单选题", "简答题"],
    totalQuestions: 5,
    totalPoints: 75,
    useCount: 67,
    isSystem: true
  },
  {
    id: 4,
    name: "学情调查问卷",
    description: "用于学情调查，了解学生学习情况",
    questionTypes: ["单选题", "多选题", "简答题"],
    totalQuestions: 5,
    totalPoints: 0,
    useCount: 45,
    isSystem: true
  }
]);

// 我的模板（私有模板）
const myTemplates = ref<any[]>([]);

// 当前激活的标签页
const activeTab = ref("system");

// 新建模板对话框
const createDialogVisible = ref(false);
const newTemplateForm = ref({
  name: "",
  description: ""
});

// 加载我的模板
const loadMyTemplates = async () => {
  try {
    const response = await fetch("/edu/backend/v1/paper/template/my");
    const result = await response.json();
    if (result.code === 0 && result.data) {
      myTemplates.value = result.data;
    }
  } catch (error) {
    console.error("加载我的模板失败:", error);
  }
};

// 使用模板
const useTemplate = (templateId: number, isSystem: boolean) => {
  const prefix = isSystem ? "" : "my-";
  router.push(`/exam-paper/editor?template=${prefix}${templateId}`);
};

// 预览模板
const previewTemplate = (templateId: number) => {
  ElMessage.info("预览功能开发中");
};

// 打开新建模板对话框
const openCreateDialog = () => {
  newTemplateForm.value = { name: "", description: "" };
  createDialogVisible.value = true;
};

// 创建新模板
const createTemplate = async () => {
  if (!newTemplateForm.value.name.trim()) {
    ElMessage.warning("请输入模板名称");
    return;
  }

  try {
    const response = await fetch("/edu/backend/v1/paper/template/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTemplateForm.value.name,
        description: newTemplateForm.value.description
      })
    });
    const result = await response.json();
    if (result.code === 0) {
      ElMessage.success("模板创建成功");
      createDialogVisible.value = false;
      // 跳转到编辑器编辑新模板
      router.push(
        `/exam-paper/editor?template=my-${result.data.templateId}&edit=true`
      );
    } else {
      ElMessage.error(result.msg || "创建失败");
    }
  } catch (error) {
    console.error("创建模板失败:", error);
    ElMessage.error("创建模板失败");
  }
};

// 删除我的模板
const deleteMyTemplate = (templateId: number, templateName: string) => {
  ElMessageBox.confirm(`确定要删除模板"${templateName}"吗？`, "删除确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        const response = await fetch("/edu/backend/v1/paper/template/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId })
        });
        const result = await response.json();
        if (result.code === 0) {
          ElMessage.success("删除成功");
          loadMyTemplates();
        } else {
          ElMessage.error(result.msg || "删除失败");
        }
      } catch (error) {
        console.error("删除模板失败:", error);
        ElMessage.error("删除模板失败");
      }
    })
    .catch(() => {});
};

// 编辑我的模板
const editMyTemplate = (templateId: number) => {
  router.push(`/exam-paper/editor?template=my-${templateId}&edit=true`);
};

onMounted(() => {
  loadMyTemplates();
});
</script>

<template>
  <div class="templates-page">
    <div class="page-header">
      <div class="header-left">
        <h2>试卷模板</h2>
        <p>选择一个模板快速开始创建试卷，或创建自己的私有模板</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建模板
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="template-tabs">
      <el-tab-pane label="系统模板" name="system">
        <div class="templates-grid">
          <el-card
            v-for="template in systemTemplates"
            :key="template.id"
            class="template-card"
            shadow="hover"
          >
            <div class="template-cover system">
              <el-icon :size="48" color="#00bfa5"><Document /></el-icon>
              <span class="system-badge">系统</span>
            </div>
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-desc">{{ template.description }}</p>
              <div class="template-tags">
                <el-tag
                  v-for="type in template.questionTypes.slice(0, 3)"
                  :key="type"
                  size="small"
                  type="info"
                >
                  {{ type }}
                </el-tag>
                <el-tag
                  v-if="template.questionTypes.length > 3"
                  size="small"
                  type="info"
                >
                  +{{ template.questionTypes.length - 3 }}
                </el-tag>
              </div>
              <div class="template-stats">
                <span>{{ template.totalQuestions }}题</span>
                <span v-if="template.totalPoints"
                  >{{ template.totalPoints }}分</span
                >
                <span>{{ template.useCount }}人使用</span>
              </div>
            </div>
            <div class="template-actions">
              <el-button type="primary" @click="useTemplate(template.id, true)">
                使用模板
              </el-button>
              <el-button @click="previewTemplate(template.id)">预览</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的模板" name="my">
        <div v-if="myTemplates.length === 0" class="empty-state">
          <el-empty description="暂无私有模板">
            <el-button type="primary" @click="openCreateDialog">
              <el-icon><Plus /></el-icon>
              创建第一个模板
            </el-button>
          </el-empty>
        </div>
        <div v-else class="templates-grid">
          <el-card
            v-for="template in myTemplates"
            :key="template.id"
            class="template-card"
            shadow="hover"
          >
            <div class="template-cover private">
              <el-icon :size="48" color="#409eff"><Folder /></el-icon>
              <span class="private-badge">私有</span>
            </div>
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <p class="template-desc">
                {{ template.description || "暂无描述" }}
              </p>
              <div class="template-tags">
                <el-tag
                  v-for="type in (template.questionTypes || []).slice(0, 3)"
                  :key="type"
                  size="small"
                  type="info"
                >
                  {{ type }}
                </el-tag>
              </div>
              <div class="template-stats">
                <span>{{ template.totalQuestions || 0 }}题</span>
                <span v-if="template.totalPoints"
                  >{{ template.totalPoints }}分</span
                >
                <span>创建于 {{ template.createTime }}</span>
              </div>
            </div>
            <div class="template-actions">
              <el-button
                type="primary"
                @click="useTemplate(template.id, false)"
              >
                使用模板
              </el-button>
              <el-button @click="editMyTemplate(template.id)">编辑</el-button>
              <el-button
                type="danger"
                link
                @click="deleteMyTemplate(template.id, template.name)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新建模板对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建私有模板"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="newTemplateForm" label-width="80px">
        <el-form-item label="模板名称" required>
          <el-input
            v-model="newTemplateForm.name"
            placeholder="请输入模板名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input
            v-model="newTemplateForm.description"
            type="textarea"
            placeholder="请输入模板描述（选填）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createTemplate">创建并编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.templates-page {
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #909399;
    }
  }
}

.template-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.template-card {
  .template-cover {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    border-radius: 4px;
    margin-bottom: 16px;

    &.system {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }

    &.private {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .system-badge,
    .private-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 4px;
    }

    .system-badge {
      background: #00bfa5;
      color: #fff;
    }

    .private-badge {
      background: #409eff;
      color: #fff;
    }
  }

  .template-info {
    .template-name {
      margin: 0 0 8px;
      font-size: 16px;
    }

    .template-desc {
      margin: 0 0 12px;
      font-size: 13px;
      color: #606266;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .template-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .template-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #909399;
    }
  }

  .template-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}
</style>

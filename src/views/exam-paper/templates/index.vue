<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "ExamPaperTemplates"
});

const router = useRouter();

const templates = ref([
  {
    id: 1,
    name: "标准考试模板",
    description: "包含单选、多选、判断、填空、简答题型，适合期中期末考试",
    questionTypes: ["单选题", "多选题", "判断题", "填空题", "简答题"],
    totalQuestions: 25,
    totalPoints: 100,
    useCount: 156,
    cover: ""
  },
  {
    id: 2,
    name: "快速测验模板",
    description: "仅包含客观题，适合课堂小测和随堂练习",
    questionTypes: ["单选题", "多选题", "判断题"],
    totalQuestions: 15,
    totalPoints: 50,
    useCount: 89,
    cover: ""
  },
  {
    id: 3,
    name: "综合能力测试",
    description: "包含材料分析、论述等主观题，适合综合能力评估",
    questionTypes: ["单选题", "简答题", "论述题", "材料分析"],
    totalQuestions: 20,
    totalPoints: 100,
    useCount: 67,
    cover: ""
  },
  {
    id: 4,
    name: "问卷调查模板",
    description: "矩阵题、量表题等调查类题型，适合学情调查",
    questionTypes: ["矩阵单选", "矩阵多选", "量表题"],
    totalQuestions: 15,
    totalPoints: 0,
    useCount: 45,
    cover: ""
  }
]);

const useTemplate = (templateId: number) => {
  router.push(`/exam-paper/editor?template=${templateId}`);
};

const previewTemplate = (templateId: number) => {
  ElMessage.info("预览功能开发中");
};
</script>

<template>
  <div class="templates-page">
    <div class="page-header">
      <h2>试卷模板</h2>
      <p>选择一个模板快速开始创建试卷</p>
    </div>

    <div class="templates-grid">
      <el-card
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        shadow="hover"
      >
        <div class="template-cover">
          <el-icon :size="48" color="#409eff"><Document /></el-icon>
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
            </el-tag><el-tag
              v-if="template.questionTypes.length > 3"
              size="small"
              type="info"
            >
              +{{ template.questionTypes.length - 3 }}
            </el-tag>
          </div>
          <div class="template-stats">
            <span>{{ template.totalQuestions }}题</span>
            <span v-if="template.totalPoints">{{ template.totalPoints }}分</span>
            <span>{{ template.useCount }}人使用</span>
          </div>
        </div>
        <div class="template-actions">
          <el-button type="primary" @click="useTemplate(template.id)">
            使用模板
          </el-button>
          <el-button @click="previewTemplate(template.id)">预览</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.templates-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #909399;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.template-card {
  .template-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
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

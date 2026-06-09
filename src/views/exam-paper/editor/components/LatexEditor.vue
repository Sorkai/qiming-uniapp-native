<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";

defineOptions({ name: "LatexEditor" });

const emit = defineEmits<{
  insert: [latex: string];
}>();

const visible = ref(false);
const latexInput = ref("");
const previewRef = ref<HTMLDivElement | null>(null);
const errorMsg = ref("");

// 常用公式模板
const templates = [
  { label: "分数", value: "\\frac{a}{b}" },
  { label: "上标", value: "x^{2}" },
  { label: "下标", value: "x_{i}" },
  { label: "根号", value: "\\sqrt{x}" },
  { label: "n次根", value: "\\sqrt[n]{x}" },
  { label: "求和", value: "\\sum_{i=1}^{n} x_i" },
  { label: "积分", value: "\\int_{a}^{b} f(x) dx" },
  { label: "极限", value: "\\lim_{x \\to \\infty} f(x)" },
  {
    label: "矩阵",
    value: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}"
  },
  { label: "不等式", value: "a \\leq b \\leq c" },
  { label: "希腊字母", value: "\\alpha, \\beta, \\gamma, \\delta" },
  { label: "向量", value: "\\vec{v} = (v_1, v_2)" },
  { label: "对数", value: "\\log_{a} b" },
  {
    label: "三角函数",
    value: "\\sin^2\\theta + \\cos^2\\theta = 1"
  },
  { label: "绝对值", value: "|x - y|" },
  { label: "集合", value: "A \\cup B \\cap C" }
];

const renderPreview = () => {
  if (!previewRef.value) return;
  errorMsg.value = "";
  try {
    if (latexInput.value.trim()) {
      katex.render(latexInput.value, previewRef.value, {
        throwOnError: true,
        displayMode: true
      });
    } else {
      previewRef.value.innerHTML =
        '<span style="color:#909399">输入公式后这里会显示预览</span>';
    }
  } catch (e: any) {
    errorMsg.value = e.message || "公式语法错误";
    previewRef.value.innerHTML = `<span style="color:#f56c6c">${errorMsg.value}</span>`;
  }
};

watch(latexInput, () => {
  nextTick(renderPreview);
});

const open = () => {
  latexInput.value = "";
  visible.value = true;
  nextTick(renderPreview);
};

const insertTemplate = (value: string) => {
  latexInput.value += (latexInput.value ? " " : "") + value;
};

const confirm = () => {
  if (latexInput.value.trim()) {
    // 使用 $...$ 包裹公式，方便后续解析渲染
    emit("insert", `$${latexInput.value}$`);
  }
  visible.value = false;
};

defineExpose({ open });
</script>

<template>
  <div class="latex-editor-btn">
    <!-- 工具栏按钮 -->
    <el-tooltip content="插入 LaTeX 公式" placement="top">
      <el-button size="small" type="primary" plain @click="open">
        <el-icon><EditPen /></el-icon>
        <span>插入公式</span>
      </el-button>
    </el-tooltip>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="visible"
      title="LaTeX 公式编辑器"
      width="700px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <!-- 常用模板 -->
      <div class="template-section">
        <div class="template-label">常用公式模板：</div>
        <div class="template-list">
          <el-button
            v-for="tpl in templates"
            :key="tpl.label"
            size="small"
            @click="insertTemplate(tpl.value)"
          >
            {{ tpl.label }}
          </el-button>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="input-section">
        <div class="input-label">LaTeX 代码：</div>
        <el-input
          v-model="latexInput"
          type="textarea"
          :rows="4"
          placeholder="输入 LaTeX 公式，如 \frac{a}{b} 或 \sum_{i=1}^{n} x_i"
          class="latex-input"
        />
      </div>

      <!-- 预览区 -->
      <div class="preview-section">
        <div class="preview-label">实时预览：</div>
        <div ref="previewRef" class="latex-preview-box" />
      </div>

      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!!errorMsg && !!latexInput.trim()"
          @click="confirm"
        >
          插入到题干
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.latex-editor-btn {
  display: inline-block;
}

.template-section {
  margin-bottom: 16px;

  .template-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .template-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

.input-section {
  margin-bottom: 16px;

  .input-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .latex-input {
    :deep(.el-textarea__inner) {
      font-family: "Courier New", Courier, monospace;
      font-size: 14px;
    }
  }
}

.preview-section {
  .preview-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 8px;
  }

  .latex-preview-box {
    min-height: 60px;
    padding: 16px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.katex) {
      font-size: 20px;
    }

    :deep(.katex-display) {
      margin: 0;
    }
  }
}
</style>

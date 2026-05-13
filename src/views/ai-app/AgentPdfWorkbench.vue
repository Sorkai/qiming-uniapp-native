<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  Check,
  Download,
  Document,
  Files,
  Loading,
  Position,
  Upload
} from "@element-plus/icons-vue";
import {
  type AgentPdfDynamicField,
  type AgentPdfPresetConfig,
  createBaseState,
  defaultValueForComponent,
  extractAgentPdfPresetConfig,
  fetchAgentPdfConfig,
  resolveAgentPdfFileUrl,
  streamAgentPdfEvent,
  toGradioUploadedFile,
  uploadAgentPdfFiles,
  callAgentPdfEvent
} from "./agent-pdf-adapter";

defineOptions({
  name: "AgentPdfWorkbench"
});

const props = defineProps<{
  serviceUrl: string;
}>();

type OutputEntry = {
  key: string;
  label: string;
  url: string;
};

const configLoading = ref(false);
const configLoaded = ref(false);
const submitting = ref(false);
const uploading = ref(false);
const selectedFiles = ref<File[]>([]);
const currentEventId = ref("");
const previewUrl = ref("");
const outputs = ref<OutputEntry[]>([]);

const form = reactive({
  fileType: "File",
  linkInput: "",
  service: "",
  langFrom: "",
  langTo: ""
});

const preset = ref<AgentPdfPresetConfig | null>(null);
const dynamicFields = ref<AgentPdfDynamicField[]>([]);

const canSubmit = computed(() => {
  if (!configLoaded.value || !preset.value?.translateApiName) return false;
  if (submitting.value || uploading.value) return false;
  if (form.fileType === "File") return selectedFiles.value.length > 0;
  return Boolean(form.linkInput.trim());
});

const visibleFields = computed(() =>
  dynamicFields.value.filter(field => field.visible !== false)
);

function patchFieldValue(
  fieldKey: string,
  value: string | number | boolean | null
) {
  dynamicFields.value = dynamicFields.value.map(field =>
    field.key === fieldKey ? { ...field, value: value as never } : field
  );
}

function hydrateFormFromPreset(nextPreset: AgentPdfPresetConfig) {
  form.fileType = nextPreset.fileType || "File";
  form.service = nextPreset.service || "";
  form.langFrom = nextPreset.langFrom || "";
  form.langTo = nextPreset.langTo || "";
  dynamicFields.value = nextPreset.fields;
}

function coerceChoiceValue(field: AgentPdfDynamicField) {
  if (field.kind === "dropdown" || field.kind === "radio") {
    return field.value ?? "";
  }
  if (field.kind === "checkbox") {
    return Boolean(field.value);
  }
  if (field.kind === "number" || field.kind === "slider") {
    return field.value == null ? null : Number(field.value);
  }
  return field.value ?? "";
}

function buildTranslatePayload(uploadedPaths: string[]) {
  if (!preset.value?.translateDependency) {
    throw new Error("未找到 translate_files 事件依赖");
  }

  const inputIds = preset.value.translateDependency.inputs || [];
  const fileEntries = uploadedPaths.map((path, index) =>
    toGradioUploadedFile(path, selectedFiles.value[index]?.name)
  );
  const stateValue = createBaseState(
    selectedFiles.value.map(file => file.name),
    uploadedPaths
  );

  const byLabel = {
    service: form.service,
    langFrom: form.langFrom,
    langTo: form.langTo
  };

  const fieldMap = new Map(
    dynamicFields.value.map(field => [field.componentId, field])
  );
  const payload: any[] = [];

  inputIds.forEach((componentId, index) => {
    if (index === 0) {
      payload.push(form.fileType);
      return;
    }
    if (componentId === preset.value?.fileInputComponentId) {
      payload.push(fileEntries);
      return;
    }
    if (componentId === preset.value?.linkInputComponentId) {
      payload.push(form.linkInput.trim());
      return;
    }
    if (componentId === preset.value?.serviceComponentId) {
      payload.push(byLabel.service);
      return;
    }
    if (componentId === preset.value?.langFromComponentId) {
      payload.push(byLabel.langFrom);
      return;
    }
    if (componentId === preset.value?.langToComponentId) {
      payload.push(byLabel.langTo);
      return;
    }
    if (componentId === preset.value?.stateComponentId) {
      payload.push(stateValue);
      return;
    }

    const field = fieldMap.get(componentId);
    if (field) {
      payload.push(coerceChoiceValue(field));
      return;
    }

    payload.push(
      defaultValueForComponent(preset.value.componentsById[componentId] || null)
    );
  });

  const stateIndex = payload.findIndex(
    item =>
      item &&
      typeof item === "object" &&
      "display_map" in item &&
      "uploaded_files" in item
  );
  if (stateIndex === -1) {
    payload.push(stateValue);
  }

  return payload;
}

function resetRunState() {
  outputs.value = [];
  previewUrl.value = "";
  currentEventId.value = "";
}

function normalizeOutputData(rawData: any) {
  if (!Array.isArray(rawData)) return;

  const nextOutputs: OutputEntry[] = [];
  const firstPreview = rawData[1];
  const monoFile = rawData[0];
  const dualFile = rawData[2];
  const glossaryFile = rawData[3];
  const zipAll = rawData[11];
  const zipMono = rawData[13];
  const zipDual = rawData[15];
  const zipGlossary = rawData[17];

  const pushFile = (label: string, fileLike: any, key: string) => {
    const path = fileLike?.url || fileLike?.path;
    const url = resolveAgentPdfFileUrl(props.serviceUrl, path);
    if (!url) return;
    nextOutputs.push({ key, label, url });
  };

  pushFile("单语译文", monoFile, "mono");
  pushFile("双语译文", dualFile, "dual");
  pushFile("术语表", glossaryFile, "glossary");
  pushFile("全部结果 ZIP", zipAll, "zip_all");
  pushFile("单语结果 ZIP", zipMono, "zip_mono");
  pushFile("双语结果 ZIP", zipDual, "zip_dual");
  pushFile("术语结果 ZIP", zipGlossary, "zip_glossary");

  outputs.value = nextOutputs;
  previewUrl.value = resolveAgentPdfFileUrl(
    props.serviceUrl,
    firstPreview?.url || firstPreview?.path || firstPreview
  );
}

async function loadConfig() {
  configLoading.value = true;
  try {
    const config = await fetchAgentPdfConfig(props.serviceUrl);
    const nextPreset = extractAgentPdfPresetConfig(config);
    preset.value = nextPreset;
    hydrateFormFromPreset(nextPreset);
    configLoaded.value = true;
  } catch (error: any) {
    configLoaded.value = false;
    ElMessage.error(error?.message || "读取 Agent PDF 配置失败");
  } finally {
    configLoading.value = false;
  }
}

function syncSelectedFiles(fileList: any[]) {
  selectedFiles.value = fileList
    .map((item: any) => item.raw || item)
    .filter((file: any) => file instanceof File);
}

function handleFileChange(_file: any, fileList: any[]) {
  syncSelectedFiles(fileList);
}

function handleFileRemove(_file: any, fileList: any[]) {
  syncSelectedFiles(fileList);
}

async function submitTranslation() {
  if (!preset.value?.translateApiName) {
    ElMessage.warning("未识别到后端翻译事件");
    return;
  }

  try {
    submitting.value = true;
    uploading.value = true;
    resetRunState();

    const uploadedPaths =
      form.fileType === "File"
        ? await uploadAgentPdfFiles(props.serviceUrl, selectedFiles.value)
        : [];

    uploading.value = false;

    const payload = buildTranslatePayload(uploadedPaths);
    const { event_id } = await callAgentPdfEvent(
      props.serviceUrl,
      preset.value.translateApiName,
      payload
    );
    currentEventId.value = event_id;

    for await (const event of streamAgentPdfEvent(
      props.serviceUrl,
      preset.value.translateApiName,
      event_id
    )) {
      if (event.type === "heartbeat") continue;
      if (event.type === "generating") {
        normalizeOutputData(event.data);
      }
      if (event.type === "complete") {
        normalizeOutputData(event.data);
        break;
      }
      if (event.type === "error") {
        throw new Error(
          typeof event.data === "string" ? event.data : "翻译任务失败"
        );
      }
    }
  } catch (error: any) {
    ElMessage.error(error?.message || "调用 Agent PDF 任务失败");
  } finally {
    submitting.value = false;
    uploading.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
</script>

<template>
  <div class="agent-pdf-workbench">
    <section class="panel-card form-card">
      <div class="section-head">
        <div>
          <h2>翻译任务</h2>
          <p>上传 PDF 或粘贴链接，然后按标准后端协议发起翻译。</p>
        </div>
        <span class="status-pill" :class="{ ready: configLoaded }">
          {{ configLoaded ? "配置已就绪" : "等待配置" }}
        </span>
      </div>

      <div class="form-stack">
        <label class="field-block">
          <span class="field-label">输入类型</span>
          <el-segmented
            v-model="form.fileType"
            :options="[
              { label: '文件', value: 'File' },
              { label: '链接', value: 'Link' }
            ]"
          />
        </label>

        <label v-if="form.fileType === 'Link'" class="field-block">
          <span class="field-label">PDF 链接</span>
          <el-input
            v-model="form.linkInput"
            placeholder="粘贴可访问的 PDF 链接"
          />
        </label>

        <label v-else class="field-block">
          <span class="field-label">上传 PDF</span>
          <el-upload
            drag
            multiple
            :auto-upload="false"
            :show-file-list="true"
            accept=".pdf,.PDF"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="el-upload__text">拖拽 PDF 到这里，或点击上传</div>
          </el-upload>
        </label>

        <div class="triple-grid">
          <label class="field-block">
            <span class="field-label">翻译服务</span>
            <el-select v-model="form.service" placeholder="选择服务">
              <el-option
                v-for="option in preset?.serviceChoices || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </label>

          <label class="field-block">
            <span class="field-label">源语言</span>
            <el-select v-model="form.langFrom">
              <el-option
                v-for="option in preset?.langFromChoices || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </label>

          <label class="field-block">
            <span class="field-label">目标语言</span>
            <el-select v-model="form.langTo">
              <el-option
                v-for="option in preset?.langToChoices || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </label>
        </div>

        <div class="dynamic-grid">
          <template v-for="field in visibleFields" :key="field.key">
            <label
              v-if="
                !field.label.includes('Service') &&
                !field.label.includes('Translate from') &&
                !field.label.includes('Translate to')
              "
              class="field-block"
            >
              <span class="field-label">{{ field.label }}</span>

              <el-select
                v-if="field.kind === 'dropdown'"
                :model-value="field.value"
                @update:model-value="value => patchFieldValue(field.key, value)"
              >
                <el-option
                  v-for="option in field.choices"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <el-radio-group
                v-else-if="field.kind === 'radio'"
                :model-value="field.value"
                class="radio-group"
                @update:model-value="value => patchFieldValue(field.key, value)"
              >
                <el-radio-button
                  v-for="option in field.choices"
                  :key="option.value"
                  :label="option.value"
                >
                  {{ option.label }}
                </el-radio-button>
              </el-radio-group>

              <el-switch
                v-else-if="field.kind === 'checkbox'"
                :model-value="field.value"
                @update:model-value="value => patchFieldValue(field.key, value)"
              />

              <el-input-number
                v-else-if="field.kind === 'number'"
                :model-value="field.value ?? 0"
                controls-position="right"
                @update:model-value="
                  value => patchFieldValue(field.key, value ?? null)
                "
              />

              <el-slider
                v-else-if="field.kind === 'slider'"
                :model-value="field.value ?? 0"
                :min="field.minimum ?? 0"
                :max="field.maximum ?? 100"
                :step="field.step ?? 1"
                @update:model-value="
                  value =>
                    patchFieldValue(
                      field.key,
                      Array.isArray(value) ? (value[0] ?? null) : value
                    )
                "
              />

              <el-input
                v-else
                :model-value="field.value"
                :placeholder="field.placeholder || ''"
                @update:model-value="value => patchFieldValue(field.key, value)"
              />
            </label>
          </template>
        </div>

        <div class="submit-row">
          <button
            class="submit-btn"
            :disabled="!canSubmit"
            @click="submitTranslation"
          >
            <el-icon v-if="submitting || uploading"><Loading /></el-icon>
            <el-icon v-else><Position /></el-icon>
            <span>{{
              submitting || uploading ? "处理中..." : "开始翻译"
            }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="result-grid">
      <article class="panel-card preview-card">
        <div class="section-head">
          <div>
            <h2>结果预览</h2>
            <p>优先显示当前任务返回的预览文件。</p>
          </div>
          <span class="status-text">{{ currentEventId || "暂无任务" }}</span>
        </div>
        <div class="preview-shell">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="preview-frame"
            title="Agent PDF Preview"
          />
          <div v-else class="preview-empty">
            <el-icon><Document /></el-icon>
            <p>翻译完成后，这里会显示 PDF 预览。</p>
          </div>
        </div>
      </article>

      <article class="panel-card output-card">
        <div class="section-head">
          <div>
            <h2>下载产物</h2>
            <p>标准后端返回的单语、双语、术语和 ZIP 文件都会列在这里。</p>
          </div>
          <span class="status-text">{{ outputs.length }} 项</span>
        </div>

        <div class="output-list">
          <a
            v-for="item in outputs"
            :key="item.key"
            :href="item.url"
            class="output-item"
            target="_blank"
            rel="noreferrer"
          >
            <div class="output-main">
              <div class="output-icon">
                <el-icon><Download /></el-icon>
              </div>
              <div>
                <h3>{{ item.label }}</h3>
                <p>{{ item.url }}</p>
              </div>
            </div>
            <el-icon><Check /></el-icon>
          </a>

          <div v-if="outputs.length === 0" class="preview-empty output-empty">
            <el-icon><Files /></el-icon>
            <p>任务完成后可在这里下载结果。</p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped lang="scss">
.agent-pdf-workbench {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px;
  font-weight: 700;
  border-radius: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-grid {
  display: grid;
  gap: 18px;
}

.output-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: var(--accent-softer);
  color: var(--accent-strong);
  font-size: 20px;
}

.result-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.panel-card {
  padding: 22px;
}

.section-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
  }

  p {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--text-subtle);
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.status-pill {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgb(148 163 184 / 14%);
  color: var(--text-subtle);
  font-size: 12px;
  font-weight: 800;

  &.ready {
    background: var(--accent-softer);
    color: var(--accent-strong);
  }
}

.form-stack,
.dynamic-grid,
.output-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-muted);
}

.triple-grid,
.dynamic-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.dynamic-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  color: #fff;
  border: 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 12px 24px var(--accent-soft);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.output-item {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 16px;
}

.preview-shell {
  overflow: hidden;
  min-height: 720px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--panel-soft);
}

.preview-frame {
  width: 100%;
  height: 720px;
  border: 0;
  background: #fff;
}

.preview-empty {
  display: grid;
  place-items: center;
  min-height: 720px;
  color: var(--text-subtle);

  .el-icon {
    font-size: 42px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
  }
}

.output-item {
  color: inherit;
  text-decoration: none;

  &:hover {
    border-color: var(--accent-line);
    transform: translateY(-1px);
  }
}

.output-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  h3 {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: var(--text-subtle);
    font-size: 12px;
    word-break: break-all;
  }
}

@media (width <= 1400px) {
  .result-grid,
  .triple-grid,
  .dynamic-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 960px) {
  .submit-row {
    justify-content: stretch;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watch, type Component } from "vue";
import { ElMessage } from "element-plus";
import {
  CircleCheck,
  Document,
  Files,
  FolderOpened,
  Headset,
  Link,
  Picture,
  Refresh,
  Search,
  VideoPlay
} from "@element-plus/icons-vue";
import {
  getCourseDetail,
  type CourseDetailResult
} from "@/api/frontend/course";

type ResourceSource = "lesson" | "attachment";
type ResourceScope = "all" | ResourceSource;

type StudentResource = {
  resourceKey: string;
  source: ResourceSource;
  title: string;
  resourceType: string;
  fileUrl?: string;
  chapterId?: number;
  chapterName?: string;
  duration?: number;
  completed?: boolean;
};

type ResourceGroup = {
  key: string;
  title: string;
  description: string;
  resources: StudentResource[];
};

const props = defineProps<{
  courseId?: number;
}>();

const loading = ref(false);
const requestError = ref("");
const courseDetail = ref<CourseDetailResult | null>(null);
const searchQuery = ref("");
const scope = ref<ResourceScope>("all");
const typeFilter = ref("");
let requestVersion = 0;

const scopeOptions = [
  { label: "全部资料", value: "all" },
  { label: "章节课时", value: "lesson" },
  { label: "课程附件", value: "attachment" }
];

const normalizedType = (value?: string) =>
  String(value || "")
    .trim()
    .toLowerCase();

const resourceTypeText = (value?: string) => {
  const type = normalizedType(value);
  if (!type) return "学习资料";
  if (/(video|mp4|mov|avi|mkv)/.test(type)) return "视频";
  if (/(audio|mp3|wav|aac|ogg)/.test(type)) return "音频";
  if (/(image|jpg|jpeg|png|webp|gif|svg)/.test(type)) return "图片";
  if (/(pdf)/.test(type)) return "PDF 文档";
  if (/(ppt|keynote)/.test(type)) return "课件";
  if (/(doc|word|txt|markdown|md)/.test(type)) return "文档";
  if (/(code|html|javascript|typescript|python|java|c\+\+)/.test(type)) {
    return "代码资料";
  }
  return String(value).trim() || "学习资料";
};

const resourceIcon = (value?: string): Component => {
  const type = normalizedType(value);
  if (/(video|mp4|mov|avi|mkv)/.test(type)) return VideoPlay;
  if (/(audio|mp3|wav|aac|ogg)/.test(type)) return Headset;
  if (/(image|jpg|jpeg|png|webp|gif|svg)/.test(type)) return Picture;
  if (/(ppt|keynote)/.test(type)) return Files;
  return Document;
};

const formatDuration = (duration?: number) => {
  const seconds = Number(duration || 0);
  if (!seconds) return "";
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} 小时 ${remainingMinutes} 分钟` : `${hours} 小时`;
};

const allResources = computed<StudentResource[]>(() => {
  const detail = courseDetail.value;
  if (!detail) return [];

  const lessonResources = (detail.courseChapterList || []).flatMap(
    (chapter, chapterIndex) =>
      (chapter.hourList || []).map((hour, hourIndex) => ({
        resourceKey: `lesson:${hour.hourId || `${chapter.chapterId}:${hourIndex}`}`,
        source: "lesson" as const,
        title: hour.title || `第 ${hourIndex + 1} 个课时`,
        resourceType: hour.rType || "",
        fileUrl: hour.fileUrl || undefined,
        chapterId: chapter.chapterId,
        chapterName: chapter.name || `第 ${chapterIndex + 1} 章`,
        duration: hour.duration,
        completed: Number(hour.finished) === 1
      }))
  );
  const attachmentResources = (detail.courseAttrList || []).map(
    (attachment, index) => ({
      resourceKey: `attachment:${attachment.resourceId || attachment.attrId || index}`,
      source: "attachment" as const,
      title: attachment.title || `课程附件 ${index + 1}`,
      resourceType: attachment.rType || "",
      fileUrl: attachment.fileUrl || undefined
    })
  );

  return [...lessonResources, ...attachmentResources];
});

const resourceTypeOptions = computed(() => {
  const types = new Map<string, string>();
  allResources.value.forEach(resource => {
    const value = String(resource.resourceType || "").trim();
    if (value) types.set(value, resourceTypeText(value));
  });
  return Array.from(types, ([value, label]) => ({ value, label }));
});

const filteredResources = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  return allResources.value.filter(resource => {
    const matchesScope = scope.value === "all" || resource.source === scope.value;
    const matchesType =
      !typeFilter.value || resource.resourceType === typeFilter.value;
    const matchesKeyword =
      !keyword ||
      resource.title.toLowerCase().includes(keyword) ||
      resource.chapterName?.toLowerCase().includes(keyword) ||
      resourceTypeText(resource.resourceType).toLowerCase().includes(keyword);
    return matchesScope && matchesType && matchesKeyword;
  });
});

const resourceGroups = computed<ResourceGroup[]>(() => {
  const resourceKeySet = new Set(
    filteredResources.value.map(resource => resource.resourceKey)
  );
  const groups: ResourceGroup[] = [];
  const detail = courseDetail.value;

  (detail?.courseChapterList || []).forEach((chapter, index) => {
    const resources = allResources.value.filter(
      resource =>
        resource.source === "lesson" &&
        resource.chapterId === chapter.chapterId &&
        resourceKeySet.has(resource.resourceKey)
    );
    if (!resources.length) return;
    groups.push({
      key: `chapter:${chapter.chapterId || index}`,
      title: chapter.name || `第 ${index + 1} 章`,
      description: `${resources.length} 项课时资料`,
      resources
    });
  });

  const attachments = allResources.value.filter(
    resource =>
      resource.source === "attachment" && resourceKeySet.has(resource.resourceKey)
  );
  if (attachments.length) {
    groups.push({
      key: "attachments",
      title: "课程附件",
      description: `${attachments.length} 项补充资料`,
      resources: attachments
    });
  }

  return groups;
});

const totalResourceCount = computed(() => allResources.value.length);
const completedLessonCount = computed(
  () => allResources.value.filter(item => item.source === "lesson" && item.completed).length
);
const lessonCount = computed(
  () => allResources.value.filter(item => item.source === "lesson").length
);
const courseDescription = computed(
  () => courseDetail.value?.courseDesc?.trim() || "按章节整理本课程可访问的学习资料。"
);

const loadResources = async () => {
  const courseId = Number(props.courseId || 0);
  const currentRequest = ++requestVersion;
  requestError.value = "";

  if (!courseId) {
    courseDetail.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    const { data } = await getCourseDetail({ courseId });
    if (currentRequest !== requestVersion) return;
    courseDetail.value = data;
  } catch (error) {
    if (currentRequest !== requestVersion) return;
    courseDetail.value = null;
    requestError.value = "课程资源暂时无法加载，请稍后重试。";
    console.error("[AiStudentResourceLibrary] 课程资源加载失败:", error);
  } finally {
    if (currentRequest === requestVersion) loading.value = false;
  }
};

const openResource = (resource: StudentResource) => {
  if (!resource.fileUrl) {
    ElMessage.warning("该资源暂未提供访问地址");
    return;
  }
  const resourceWindow = window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
  if (!resourceWindow) ElMessage.warning("浏览器阻止了新窗口，请允许后重试");
};

watch(
  () => props.courseId,
  () => {
    searchQuery.value = "";
    scope.value = "all";
    typeFilter.value = "";
    void loadResources();
  },
  { immediate: true }
);
</script>

<template>
  <section class="student-resource-library" aria-label="课程资源">
    <header class="student-resource-library__header">
      <div class="library-heading">
        <span class="library-heading__icon" aria-hidden="true">
          <el-icon><FolderOpened /></el-icon>
        </span>
        <div>
          <div class="library-heading__eyebrow">课程资源</div>
          <h2>{{ courseDetail?.courseName || "学习资料" }}</h2>
          <p>{{ courseDescription }}</p>
        </div>
      </div>
      <div class="library-heading__actions">
        <div v-if="courseDetail" class="resource-count" aria-label="资源数量">
          <b>{{ totalResourceCount }}</b>
          <span>项资料</span>
        </div>
        <el-tooltip content="刷新资源" placement="top">
          <el-button
            circle
            :icon="Refresh"
            :loading="loading"
            aria-label="刷新资源"
            @click="loadResources"
          />
        </el-tooltip>
      </div>
    </header>

    <div class="student-resource-library__filters">
      <el-segmented v-model="scope" :options="scopeOptions" size="small" />
      <el-select
        v-model="typeFilter"
        class="resource-type-filter"
        clearable
        placeholder="资源类型"
        aria-label="按资源类型筛选"
      >
        <el-option
          v-for="option in resourceTypeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-input
        v-model="searchQuery"
        class="resource-search"
        clearable
        :prefix-icon="Search"
        placeholder="搜索标题、章节或类型"
        aria-label="搜索课程资源"
      />
    </div>

    <main class="student-resource-library__body" :aria-busy="loading">
      <div v-if="!courseId" class="resource-feedback">
        <el-icon :size="28"><FolderOpened /></el-icon>
        <h3>请选择课程</h3>
        <p>选择课程后即可查看对应的教学资料。</p>
      </div>

      <div v-else-if="loading && !courseDetail" class="resource-skeleton" aria-label="正在加载资源">
        <el-skeleton v-for="index in 6" :key="index" animated>
          <template #template>
            <el-skeleton-item variant="rect" class="resource-skeleton__item" />
          </template>
        </el-skeleton>
      </div>

      <div v-else-if="requestError" class="resource-feedback">
        <el-icon :size="28"><Files /></el-icon>
        <h3>资源加载失败</h3>
        <p>{{ requestError }}</p>
        <el-button type="primary" size="small" @click="loadResources">
          重新加载
        </el-button>
      </div>

      <div v-else-if="!resourceGroups.length" class="resource-feedback">
        <el-icon :size="28"><Document /></el-icon>
        <h3>未找到匹配的资料</h3>
        <p>调整筛选条件，或稍后再查看教师发布的课程资料。</p>
      </div>

      <div v-else class="resource-groups">
        <section
          v-for="group in resourceGroups"
          :key="group.key"
          class="resource-group"
        >
          <header class="resource-group__header">
            <div>
              <h3>{{ group.title }}</h3>
              <p>{{ group.description }}</p>
            </div>
            <span v-if="group.key !== 'attachments'" class="resource-group__progress">
              {{ completedLessonCount }}/{{ lessonCount }} 已完成
            </span>
          </header>

          <div class="student-resource-grid">
            <article
              v-for="resource in group.resources"
              :key="resource.resourceKey"
              class="student-resource-card"
            >
              <div class="student-resource-card__icon" aria-hidden="true">
                <el-icon :size="21">
                  <component :is="resourceIcon(resource.resourceType)" />
                </el-icon>
              </div>
              <div class="student-resource-card__content">
                <div class="student-resource-card__title-row">
                  <h4 :title="resource.title">{{ resource.title }}</h4>
                  <el-tooltip v-if="resource.completed" content="已完成" placement="top">
                    <el-icon class="student-resource-card__completed" aria-label="已完成">
                      <CircleCheck />
                    </el-icon>
                  </el-tooltip>
                </div>
                <p>
                  <span>{{ resourceTypeText(resource.resourceType) }}</span>
                  <span v-if="resource.duration">{{ formatDuration(resource.duration) }}</span>
                  <span v-if="resource.source === 'lesson'">章节课时</span>
                  <span v-else>课程附件</span>
                </p>
              </div>
              <el-tooltip :content="resource.fileUrl ? '打开资料' : '暂不可访问'" placement="top">
                <el-button
                  class="student-resource-card__open"
                  circle
                  :icon="Link"
                  :disabled="!resource.fileUrl"
                  :aria-label="`打开资料：${resource.title}`"
                  @click="openResource(resource)"
                />
              </el-tooltip>
            </article>
          </div>
        </section>
      </div>
    </main>
  </section>
</template>

<style scoped>
.student-resource-library {
  --library-border: #dce5f0;
  --library-surface: #fff;
  --library-surface-muted: #f5f8fc;
  --library-text: #172033;
  --library-text-muted: #637087;
  --library-accent: #2563c9;
  --library-accent-soft: #eaf2ff;

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 14px;
  color: var(--library-text);
}

.student-resource-library__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 92px;
  padding: 20px 22px;
  background: var(--library-surface);
  border: 1px solid var(--library-border);
  border-radius: 8px;
  box-shadow: 0 8px 20px rgb(25 43 74 / 5%);
}

.library-heading {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  gap: 13px;
}

.library-heading__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--library-accent);
  background: var(--library-accent-soft);
  border: 1px solid #d9e7fb;
  border-radius: 8px;
}

.library-heading__eyebrow {
  margin-bottom: 3px;
  color: var(--library-accent);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
}

.library-heading h2,
.library-heading p,
.resource-group h3,
.resource-group p,
.student-resource-card h4,
.student-resource-card p,
.resource-feedback h3,
.resource-feedback p {
  margin: 0;
}

.library-heading h2 {
  overflow: hidden;
  color: var(--library-text);
  font-size: 18px;
  font-weight: 680;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-heading p {
  max-width: 68ch;
  margin-top: 4px;
  overflow: hidden;
  color: var(--library-text-muted);
  font-size: 13px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-heading__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
}

.resource-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--library-text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.resource-count b {
  color: var(--library-text);
  font-size: 17px;
  font-weight: 700;
}

.student-resource-library__filters {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 10px;
  background: var(--library-surface);
  border: 1px solid var(--library-border);
  border-radius: 8px;
}

.resource-type-filter {
  width: 144px;
}

.resource-search {
  width: min(300px, 100%);
  margin-left: auto;
}

.student-resource-library__body {
  min-height: 0;
  padding: 2px 2px 20px;
  overflow: auto;
}

.resource-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-group__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px 9px;
  border-bottom: 1px solid var(--library-border);
}

.resource-group h3 {
  color: var(--library-text);
  font-size: 15px;
  font-weight: 680;
  line-height: 1.35;
}

.resource-group p,
.resource-group__progress {
  color: var(--library-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.resource-group p {
  margin-top: 3px;
}

.resource-group__progress {
  flex: 0 0 auto;
  white-space: nowrap;
}

.student-resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.student-resource-card {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 76px;
  gap: 12px;
  padding: 14px;
  background: var(--library-surface);
  border: 1px solid var(--library-border);
  border-radius: 8px;
  transition:
    border-color 180ms ease-out,
    box-shadow 180ms ease-out,
    transform 180ms ease-out;
}

.student-resource-card:hover {
  border-color: #a8c4ec;
  box-shadow: 0 8px 18px rgb(25 43 74 / 7%);
  transform: translateY(-1px);
}

.student-resource-card__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #196b99;
  background: #e8f4f9;
  border: 1px solid #d0e9f2;
  border-radius: 8px;
}

.student-resource-card__content {
  min-width: 0;
  flex: 1;
}

.student-resource-card__title-row {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.student-resource-card h4 {
  min-width: 0;
  overflow: hidden;
  color: var(--library-text);
  font-size: 14px;
  font-weight: 640;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-resource-card__completed {
  flex: 0 0 auto;
  color: #168260;
}

.student-resource-card p {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 5px;
  color: var(--library-text-muted);
  font-size: 12px;
  line-height: 1.35;
}

.student-resource-card p span + span::before {
  display: inline-block;
  margin: 0 6px;
  color: #a7b1c0;
  content: "·";
}

.student-resource-card__open {
  flex: 0 0 auto;
}

.resource-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.resource-skeleton__item {
  display: block;
  width: 100%;
  height: 76px;
  border-radius: 8px;
}

.resource-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  padding: 32px;
  color: var(--library-text-muted);
  text-align: center;
  background: var(--library-surface-muted);
  border: 1px dashed #cdd9e8;
  border-radius: 8px;
}

.resource-feedback h3 {
  margin-top: 10px;
  color: var(--library-text);
  font-size: 15px;
  font-weight: 660;
}

.resource-feedback p {
  max-width: 36ch;
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.resource-feedback :deep(.el-button) {
  margin-top: 14px;
}

:global(.ai-app-root.dark) .student-resource-library {
  --library-border: rgb(142 175 255 / 32%);
  --library-surface: rgb(18 27 42 / 92%);
  --library-surface-muted: rgb(15 23 42 / 74%);
  --library-text: #e6efff;
  --library-text-muted: #aebed8;
  --library-accent: #92b8ff;
  --library-accent-soft: rgb(94 127 248 / 20%);
}

:global(.ai-app-root.dark) .library-heading__icon {
  border-color: rgb(142 175 255 / 32%);
}

:global(.ai-app-root.dark) .student-resource-card__icon {
  color: #8bd7ec;
  background: rgb(8 74 102 / 24%);
  border-color: rgb(95 202 233 / 25%);
}

:global(.ai-app-root.dark) .student-resource-card:hover {
  border-color: rgb(142 175 255 / 58%);
  box-shadow: 0 10px 24px rgb(0 0 0 / 24%);
}

:global(.ai-app-root.dark) .resource-feedback {
  border-color: rgb(142 175 255 / 30%);
}

@media (max-width: 820px) {
  .student-resource-library__header {
    align-items: flex-start;
    padding: 16px;
  }

  .library-heading p {
    white-space: normal;
  }

  .student-resource-library__filters {
    flex-wrap: wrap;
  }

  .resource-search {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 560px) {
  .student-resource-library {
    gap: 10px;
  }

  .student-resource-library__header {
    min-height: 0;
    gap: 12px;
  }

  .resource-count {
    display: none;
  }

  .student-resource-library__filters {
    align-items: stretch;
    padding: 8px;
  }

  .student-resource-library__filters :deep(.el-segmented) {
    width: 100%;
  }

  .resource-type-filter {
    width: 100%;
  }

  .student-resource-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .resource-group__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .student-resource-card {
    transition: none;
  }

  .student-resource-card:hover {
    transform: none;
  }
}
</style>

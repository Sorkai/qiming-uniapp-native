<template>
  <div class="mind-map-preview">
    <div v-if="resourceUrl" class="mind-map-preview__toolbar">
      <a :href="resourceUrl" target="_blank" rel="noopener noreferrer">
        <el-icon><Link /></el-icon>
        打开源文件
      </a>
    </div>

    <div v-if="loading" class="mind-map-preview__state">
      <el-icon class="is-loading"><Loading /></el-icon>
      正在加载思维导图
    </div>

    <div v-else-if="tree" class="mind-map-preview__viewport">
      <ul class="mind-map-tree">
        <MindMapBranch :node="tree" />
      </ul>
    </div>

    <div
      v-else-if="isImage && resourceUrl && !loadError"
      class="mind-map-preview__image"
    >
      <img :src="resourceUrl" alt="思维导图" @error="loadError = true" />
    </div>

    <div v-else class="mind-map-preview__state">
      {{ loadError ? "思维导图加载失败，可尝试打开源文件" : "暂无思维导图" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, watch } from "vue";
import { Link, Loading } from "@element-plus/icons-vue";
import { formatToken, getToken } from "@/utils/auth";
import { normalizeMindmapResourceUrl } from "@/utils/mindmap-resource.mjs";

interface MindMapNode {
  id: string;
  title: string;
  children: MindMapNode[];
}

const props = defineProps<{
  source?: unknown;
}>();

const loading = ref(false);
const loadError = ref(false);
const tree = ref<MindMapNode | null>(null);

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const fileBaseUrl = String(
  import.meta.env.VITE_MINDMAP_FILE_PROXY_TARGET || ""
).replace(/\/$/, "");
const fileProxyOrigin = String(
  import.meta.env.VITE_PLATFORM_FILE_PROXY_ORIGIN || ""
).replace(/\/$/, "");
const fileProxyPrefix = "/mindmap-file";

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return value;
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
};

const isUrlLike = (value: unknown) => {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return (
    /^(https?:)?\/\//i.test(text) ||
    /^\//.test(text) ||
    /\.(json|png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(text)
  );
};

const buildResourceUrl = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || !isUrlLike(raw)) return "";
  if (/^https?:\/\//i.test(raw)) {
    return normalizeMindmapResourceUrl(raw, {
      target: fileBaseUrl,
      proxyOrigin: fileProxyOrigin,
      dev: import.meta.env.DEV
    });
  }
  if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
  if (raw.startsWith("/api/")) return raw;

  const objectKey = raw.replace(/^\/+/, "");
  if (fileBaseUrl) {
    return import.meta.env.DEV
      ? `${fileProxyPrefix}/${objectKey}`
      : `${fileBaseUrl}/${objectKey}`;
  }
  return `${apiBaseUrl}/${objectKey}`;
};

const resourceUrl = computed(() => buildResourceUrl(props.source));
const isImage = computed(() =>
  /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i.test(resourceUrl.value)
);

const buildFetchUrl = (url: string) => {
  if (!import.meta.env.DEV || !fileBaseUrl || !/^https?:\/\//i.test(url)) {
    return url;
  }

  try {
    const resource = new URL(url);
    const fileBase = new URL(fileBaseUrl);
    if (resource.origin !== fileBase.origin) return url;
    return `${fileProxyPrefix}${resource.pathname}${resource.search}`;
  } catch {
    return url;
  }
};

const getField = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (key in source) return source[key];
    const match = Object.keys(source).find(
      item => item.toLowerCase() === key.toLowerCase()
    );
    if (match) return source[match];
  }
  return undefined;
};

const normalizeNode = (
  value: unknown,
  path = "root",
  fallback = "视频知识导图"
): MindMapNode | null => {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) {
    const children = parsed
      .map((item, index) =>
        normalizeNode(item, `${path}-${index}`, `主题 ${index + 1}`)
      )
      .filter(Boolean) as MindMapNode[];
    return children.length ? { id: path, title: fallback, children } : null;
  }

  if (!parsed || typeof parsed !== "object") {
    if (typeof parsed === "string" && parsed.trim() && !isUrlLike(parsed)) {
      return { id: path, title: parsed.trim(), children: [] };
    }
    return null;
  }

  const source = parsed as Record<string, unknown>;
  const titleValue = getField(source, [
    "text",
    "label",
    "title",
    "name",
    "topic",
    "value",
    "content",
    "summary"
  ]);
  const title =
    typeof titleValue === "string" || typeof titleValue === "number"
      ? String(titleValue).trim()
      : "";

  const childrenValue = parseMaybeJson(
    getField(source, [
      "children",
      "childNodes",
      "childrenNodes",
      "subTopics",
      "subtopics",
      "topics",
      "nodes",
      "items",
      "points"
    ])
  );
  const children = Array.isArray(childrenValue)
    ? (childrenValue
        .map((item, index) =>
          normalizeNode(item, `${path}-${index}`, `主题 ${index + 1}`)
        )
        .filter(Boolean) as MindMapNode[])
    : [];

  if (!title && !children.length) return null;
  return {
    id: path,
    title: title || fallback,
    children
  };
};

const extractTree = (payload: unknown) => {
  const raw = parseMaybeJson(payload) as any;
  const candidates = [
    raw?.data?.mindMap?.tree,
    raw?.data?.mindmap?.tree,
    raw?.data?.mind_map?.tree,
    raw?.data?.mindMap,
    raw?.data?.mindmap,
    raw?.data?.mind_map,
    raw?.mindMap?.tree,
    raw?.mindmap?.tree,
    raw?.mind_map?.tree,
    raw?.mindMap,
    raw?.mindmap,
    raw?.mind_map,
    raw?.tree,
    raw?.root,
    raw?.data,
    raw
  ];

  for (const candidate of candidates) {
    const normalized = normalizeNode(candidate);
    if (normalized) return normalized;
  }
  return null;
};

const fetchOptions = (url: string): RequestInit => {
  const isFileProxy =
    url === fileProxyPrefix || url.startsWith(`${fileProxyPrefix}/`);
  const isCrossOrigin = /^https?:\/\//i.test(url)
    ? new URL(url).origin !== window.location.origin
    : false;
  if (isFileProxy || isCrossOrigin) {
    return {
      headers: { Accept: "application/json, text/plain, */*" },
      credentials: "omit"
    };
  }

  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (token?.accessToken) {
    headers.Authorization = formatToken(token.accessToken);
  }
  return { headers, credentials: "include" };
};

const loadMindMap = async () => {
  loading.value = false;
  loadError.value = false;
  tree.value = null;

  const directTree = extractTree(props.source);
  if (directTree && !resourceUrl.value) {
    tree.value = directTree;
    return;
  }
  if (!resourceUrl.value || isImage.value) return;

  loading.value = true;
  try {
    const fetchUrl = buildFetchUrl(resourceUrl.value);
    const response = await fetch(fetchUrl, fetchOptions(fetchUrl));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    tree.value = extractTree(await response.text());
    loadError.value = !tree.value;
  } catch (error) {
    loadError.value = true;
    console.warn("[MindMapPreview] load failed", error);
  } finally {
    loading.value = false;
  }
};

const MindMapBranch = defineComponent({
  name: "MindMapBranch",
  props: {
    node: {
      type: Object as () => MindMapNode,
      required: true
    }
  },
  setup(branchProps) {
    return () =>
      h("li", { class: "mind-map-branch" }, [
        h("span", { class: "mind-map-node" }, branchProps.node.title),
        branchProps.node.children.length
          ? h(
              "ul",
              { class: "mind-map-children" },
              branchProps.node.children.map(child =>
                h(MindMapBranch, { key: child.id, node: child })
              )
            )
          : null
      ]);
  }
});

watch(() => props.source, loadMindMap, { immediate: true });
</script>

<style scoped lang="scss">
.mind-map-preview {
  min-height: 360px;
}

.mind-map-preview__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;

  a {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    color: var(--el-color-primary);
    font-size: 13px;
    text-decoration: none;
  }
}

.mind-map-preview__state {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  color: var(--el-text-color-placeholder);
}

.mind-map-preview__viewport {
  min-height: 360px;
  padding: 36px 28px 48px;
  overflow: auto;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.mind-map-tree,
.mind-map-tree :deep(ul) {
  position: relative;
  display: flex;
  justify-content: center;
  min-width: max-content;
  padding-top: 28px;
  margin: 0;
  list-style: none;
}

.mind-map-tree {
  padding-top: 0;
}

.mind-map-tree :deep(.mind-map-branch) {
  position: relative;
  padding: 28px 10px 0;
  text-align: center;
}

.mind-map-tree > :deep(.mind-map-branch) {
  padding-top: 0;
}

.mind-map-tree :deep(.mind-map-branch::before),
.mind-map-tree :deep(.mind-map-branch::after) {
  position: absolute;
  top: 0;
  width: 50%;
  height: 28px;
  content: "";
  border-top: 1px solid var(--el-color-primary-light-5);
}

.mind-map-tree :deep(.mind-map-branch::before) {
  right: 50%;
  border-right: 1px solid var(--el-color-primary-light-5);
}

.mind-map-tree :deep(.mind-map-branch::after) {
  left: 50%;
}

.mind-map-tree :deep(.mind-map-branch:only-child::before),
.mind-map-tree :deep(.mind-map-branch:only-child::after) {
  display: none;
}

.mind-map-tree :deep(.mind-map-branch:first-child::before),
.mind-map-tree :deep(.mind-map-branch:last-child::after) {
  border: 0;
}

.mind-map-tree :deep(.mind-map-branch:last-child::before) {
  border-radius: 0 6px 0 0;
}

.mind-map-tree :deep(.mind-map-branch:first-child::after) {
  border-left: 1px solid var(--el-color-primary-light-5);
  border-radius: 6px 0 0;
}

.mind-map-tree :deep(.mind-map-children::before) {
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 28px;
  content: "";
  border-left: 1px solid var(--el-color-primary-light-5);
}

.mind-map-tree :deep(.mind-map-node) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 220px;
  min-height: 42px;
  padding: 9px 14px;
  color: var(--el-text-color-primary);
  line-height: 1.45;
  white-space: normal;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
}

.mind-map-tree > :deep(.mind-map-branch > .mind-map-node) {
  color: #fff;
  font-weight: 700;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.mind-map-preview__image {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: 20px;
  overflow: auto;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  img {
    display: block;
    max-width: 100%;
    max-height: 560px;
    object-fit: contain;
  }
}
</style>

<script setup lang="ts">
import { computed } from "vue";
import BooksIcon from "@/assets/aiapp-assistdisplayicons/books-supplies-svgrepo-com.svg?component";
import FilesIcon from "@/assets/aiapp-assistdisplayicons/files-svgrepo-com.svg?component";
import SearchIcon from "@/assets/aiapp-assistdisplayicons/magnifier-glass-svgrepo-com.svg?component";
import PencilFileIcon from "@/assets/aiapp-assistdisplayicons/pencil-file-svgrepo-com.svg?component";
import PencilFolderIcon from "@/assets/aiapp-assistdisplayicons/pencil-folder-svgrepo-com.svg?component";
import PencilIcon from "@/assets/aiapp-assistdisplayicons/pencil-svgrepo-com.svg?component";
import TerminalIcon from "@/assets/aiapp-assistdisplayicons/terminal-svgrepo-com.svg?component";
import ToolsIcon from "@/assets/aiapp-assistdisplayicons/tools-svgrepo-com.svg?component";

export type AssistantProcessIconKind =
  | "auto"
  | "books"
  | "files"
  | "search"
  | "pencil-file"
  | "pencil-folder"
  | "pencil"
  | "terminal"
  | "tools";

type AssistantProcessIconTone =
  | "neutral"
  | "running"
  | "success"
  | "warning"
  | "error";

const props = withDefaults(
  defineProps<{
    kind?: AssistantProcessIconKind;
    stage?: string;
    tone?: AssistantProcessIconTone;
    size?: number;
    bare?: boolean;
  }>(),
  {
    kind: "auto",
    stage: "",
    tone: "neutral",
    size: 30,
    bare: false
  }
);

const iconComponents = {
  books: BooksIcon,
  files: FilesIcon,
  search: SearchIcon,
  "pencil-file": PencilFileIcon,
  "pencil-folder": PencilFolderIcon,
  pencil: PencilIcon,
  terminal: TerminalIcon,
  tools: ToolsIcon
};

const stageKinds: Record<string, Exclude<AssistantProcessIconKind, "auto">> = {
  request_started: "terminal",
  request_validating: "pencil-file",
  request_preparing: "pencil-folder",
  context_loading: "books",
  knowledge_retrieval: "search",
  answer_generating: "pencil",
  safety_checking: "pencil-file",
  persisting: "files",
  postprocess_queued: "tools",
  profile_refresh: "tools",
  stream: "terminal",
  platform_data: "files",
  generated_resource: "pencil-file",
  course_material: "books",
  knowledge_base: "books",
  student_profile: "files",
  conversation_history: "files",
  video_segment: "search",
  web_search: "search"
};

const inferIconKind = (
  stage: string
): Exclude<AssistantProcessIconKind, "auto"> => {
  const normalized = String(stage || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s-]+/g, "_");

  if (stageKinds[normalized]) return stageKinds[normalized];
  if (/(search|retriev|lookup|find)/.test(normalized)) return "search";
  if (/(validat|review|safety|check)/.test(normalized)) return "pencil-file";
  if (/(prepar|folder|collect)/.test(normalized)) return "pencil-folder";
  if (/(answer|generat|draft|reason|summar)/.test(normalized)) return "pencil";
  if (/(course|book|material|knowledge|context)/.test(normalized)) {
    return "books";
  }
  if (/(persist|save|file|document|history|data|source)/.test(normalized)) {
    return "files";
  }
  if (/(postprocess|profile|tool|task|queue)/.test(normalized)) return "tools";
  return "terminal";
};

const resolvedKind = computed(() =>
  props.kind === "auto" ? inferIconKind(props.stage) : props.kind
);
const iconComponent = computed(() => iconComponents[resolvedKind.value]);
const iconStyle = computed(() => ({
  "--assistant-process-icon-size": `${props.size}px`
}));
</script>

<template>
  <span
    class="assistant-process-icon"
    :class="[`is-${props.tone}`, { 'is-bare': props.bare }]"
    :style="iconStyle"
    aria-hidden="true"
  >
    <component :is="iconComponent" />
  </span>
</template>

<style scoped lang="scss">
.assistant-process-icon {
  --process-icon-color: #42658f;
  --process-icon-bg: #edf3f9;
  --process-icon-border: #d7e2ee;

  display: inline-flex;
  flex: 0 0 var(--assistant-process-icon-size);
  align-items: center;
  justify-content: center;
  width: var(--assistant-process-icon-size);
  height: var(--assistant-process-icon-size);
  color: var(--process-icon-color);
  background: var(--process-icon-bg);
  border: 1px solid var(--process-icon-border);
  border-radius: 8px;

  &.is-running {
    --process-icon-color: #2f68b2;
    --process-icon-bg: #eaf2fc;
    --process-icon-border: #cbdcf1;
  }

  &.is-success {
    --process-icon-color: #2f7657;
    --process-icon-bg: #eaf5ef;
    --process-icon-border: #cce5d7;
  }

  &.is-warning {
    --process-icon-color: #9a6518;
    --process-icon-bg: #fbf2df;
    --process-icon-border: #ead6ae;
  }

  &.is-error {
    --process-icon-color: #a44747;
    --process-icon-bg: #faecec;
    --process-icon-border: #edcece;
  }

  &.is-bare {
    background: transparent;
    border: 0;
    border-radius: 0;
  }
}

.assistant-process-icon :deep(svg) {
  display: block;
  width: 62%;
  height: 62%;
  overflow: visible;
}

.assistant-process-icon.is-bare :deep(svg) {
  width: 100%;
  height: 100%;
}

.assistant-process-icon :deep(svg *) {
  fill: currentcolor !important;
}

:global(html.dark) .assistant-process-icon {
  --process-icon-color: #b4c9e6;
  --process-icon-bg: rgb(88 120 159 / 20%);
  --process-icon-border: rgb(151 179 214 / 28%);

  &.is-running {
    --process-icon-color: #a8c7f5;
    --process-icon-bg: rgb(67 112 170 / 24%);
    --process-icon-border: rgb(124 165 217 / 34%);
  }

  &.is-success {
    --process-icon-color: #9bd1b5;
    --process-icon-bg: rgb(47 118 87 / 22%);
    --process-icon-border: rgb(105 170 139 / 32%);
  }

  &.is-warning {
    --process-icon-color: #e5c483;
    --process-icon-bg: rgb(154 101 24 / 22%);
    --process-icon-border: rgb(207 157 79 / 32%);
  }

  &.is-error {
    --process-icon-color: #e8abab;
    --process-icon-bg: rgb(164 71 71 / 22%);
    --process-icon-border: rgb(212 119 119 / 32%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-process-icon {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";

defineOptions({ name: "RichContent" });

interface MediaItem {
  url: string;
  name: string;
  type: "image" | "audio" | "video";
  size?: number;
}

const props = defineProps<{
  content: string;
  latex?: string;
  media?: MediaItem[];
}>();

const contentRef = ref<HTMLDivElement | null>(null);
const latexRef = ref<HTMLDivElement | null>(null);

// 解析内容，分离文本和公式部分
const parseContent = (
  text: string
): Array<{ type: "text" | "inline" | "block"; value: string }> => {
  const parts: Array<{
    type: "text" | "inline" | "block";
    value: string;
  }> = [];
  const regex = /\$(\$?)([\s\S]+?)\$\1/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const isBlock = match[1] === "$";
    const trimmed = match[2].trim();
    if (trimmed) {
      parts.push({ type: isBlock ? "block" : "inline", value: trimmed });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
};

// 使用 katex.render() 直接渲染到 DOM（避免 renderToString + v-html 的 SVG 命名空间问题）
const renderContent = () => {
  if (!contentRef.value) return;
  const el = contentRef.value;
  el.innerHTML = "";

  if (!props.content) return;

  const parts = parseContent(props.content);
  parts.forEach(part => {
    if (part.type === "text") {
      const lines = part.value.split("\n");
      lines.forEach((line, i) => {
        if (i > 0) el.appendChild(document.createElement("br"));
        if (line) el.appendChild(document.createTextNode(line));
      });
    } else {
      const span = document.createElement("span");
      try {
        katex.render(part.value, span, {
          throwOnError: false,
          displayMode: part.type === "block"
        });
      } catch {
        span.className = "latex-error";
        span.textContent = part.value;
      }
      el.appendChild(span);
    }
  });
};

// 独立 LaTeX 公式渲染
const renderLatex = () => {
  if (!latexRef.value) return;
  if (!props.latex) {
    latexRef.value.innerHTML = "";
    return;
  }
  try {
    katex.render(props.latex, latexRef.value, {
      throwOnError: false,
      displayMode: true
    });
  } catch {
    latexRef.value.innerHTML = `<span class="latex-error">${props.latex}</span>`;
  }
};

watch(
  () => props.content,
  () => nextTick(renderContent),
  { immediate: true }
);

watch(
  () => props.latex,
  () => nextTick(renderLatex),
  { immediate: true }
);

onMounted(() => {
  renderContent();
  renderLatex();
});

const images = computed(
  () => props.media?.filter(m => m.type === "image") || []
);
const audios = computed(
  () => props.media?.filter(m => m.type === "audio") || []
);
const videos = computed(
  () => props.media?.filter(m => m.type === "video") || []
);
</script>

<template>
  <div class="rich-content">
    <!-- 文本内容（支持行内 LaTeX）- 使用 ref 直接渲染 -->
    <div v-if="content" ref="contentRef" class="content-text" />

    <!-- 独立公式块 -->
    <div v-if="latex" ref="latexRef" class="content-latex" />

    <!-- 图片 -->
    <div v-if="images.length" class="content-images">
      <div v-for="(img, idx) in images" :key="idx" class="content-image-item">
        <el-image
          :src="img.url"
          :alt="img.name"
          fit="contain"
          :preview-src-list="images.map(i => i.url)"
          :initial-index="idx"
          class="content-image"
        />
      </div>
    </div>

    <!-- 音频 -->
    <div v-if="audios.length" class="content-audios">
      <div v-for="(aud, idx) in audios" :key="idx" class="content-audio-item">
        <audio :src="aud.url" controls class="content-audio" />
        <span class="audio-name">{{ aud.name }}</span>
      </div>
    </div>

    <!-- 视频 -->
    <div v-if="videos.length" class="content-videos">
      <div v-for="(vid, idx) in videos" :key="idx" class="content-video-item">
        <video
          :src="vid.url"
          controls
          preload="metadata"
          class="content-video"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-content {
  .content-text {
    line-height: 1.8;
    font-size: 14px;
    color: #303133;
    word-break: break-word;

    :deep(.katex) {
      font-size: 1.1em;
    }

    :deep(.katex-display) {
      margin: 8px 0;
    }

    :deep(.latex-error) {
      color: #f56c6c;
      font-family: monospace;
    }
  }

  .content-latex {
    margin: 8px 0;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;
    text-align: center;

    :deep(.katex) {
      font-size: 1.2em;
    }

    :deep(.katex-display) {
      margin: 0;
    }
  }

  .content-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .content-image-item {
      .content-image {
        max-width: 300px;
        max-height: 200px;
        border-radius: 4px;
        border: 1px solid #e4e7ed;
      }
    }
  }

  .content-audios {
    margin-top: 8px;

    .content-audio-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;

      .content-audio {
        height: 36px;
      }

      .audio-name {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .content-videos {
    margin-top: 8px;

    .content-video-item {
      margin-bottom: 8px;

      .content-video {
        max-width: 100%;
        max-height: 300px;
        border-radius: 6px;
        background: #000;
      }
    }
  }
}
</style>

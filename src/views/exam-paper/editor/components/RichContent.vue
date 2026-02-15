<script setup lang="ts">
import { computed } from "vue";
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

// 渲染含 LaTeX 的文本：$..$ 为行内公式，$$...$$ 为块级公式
// 使用单次遍历正则，避免两步替换互相干扰
const renderedContent = computed(() => {
  if (!props.content) return "";
  let text = props.content;
  // 单次遍历：$$...$$ 块级 或 $...$ 行内
  //\\$(\\$?)匹配 $ 或 $$，([\\s\\S]+?) 匹配公式内容，\\$\\1匹配对应的闭合符
  text = text.replace(
    /\$(\$?)([\s\S]+?)\$\1/g,
    (_match, doubleDollar, formula) => {
      const isBlock = doubleDollar === "$";
      const trimmed = formula.trim();
      if (!trimmed) return _match;
      try {
        return katex.renderToString(trimmed, {
          throwOnError: false,
          displayMode: isBlock
        });
      } catch {
        return `<span class="latex-error">${trimmed}</span>`;
      }
    }
  );
  // 换行转 <br>
  text = text.replace(/\n/g, "<br>");
  return text;
});

// 独立 LaTeX 公式渲染
const renderedLatex = computed(() => {
  if (!props.latex) return "";
  try {
    return katex.renderToString(props.latex, {
      throwOnError: false,
      displayMode: true
    });
  } catch {
    return `<span class="latex-error">${props.latex}</span>`;
  }
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
    <!-- 文本内容（支持行内 LaTeX） -->
    <div v-if="content" class="content-text" v-html="renderedContent" />

    <!-- 独立公式块 -->
    <div v-if="latex" class="content-latex" v-html="renderedLatex" />

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

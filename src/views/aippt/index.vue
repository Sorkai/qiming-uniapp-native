<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef, watch } from "vue";
import { getPptToken } from "@/api/ppt";
import { ElMessage } from "element-plus";
import { DocmeeUI, CreatorType } from "@docmee/sdk-ui";
import { usePageResponsive } from "@/utils/pageResponsive";

const loading = ref(true);
const iframeReady = ref(false); // 控制 iframe 显示，避免紫色闪烁
const container = ref<HTMLDivElement>();
const docmeeUI = shallowRef<any>(null);
const outlineReviewMode = ref(false);
let outlineReviewTimer: ReturnType<typeof setTimeout> | null = null;
const { isMobile } = usePageResponsive();

function clearOutlineReviewTimer() {
  if (outlineReviewTimer) {
    clearTimeout(outlineReviewTimer);
    outlineReviewTimer = null;
  }
}

function applyOutlineReviewCss() {
  if (!docmeeUI.value || !isMobile.value) return;

  const extraBottom = outlineReviewMode.value ? "180px" : "0px";

  docmeeUI.value.importCSS(`
    :root, #docmee_SdkContainer {
      --intelledu-outline-extra-bottom: ${extraBottom} !important;
    }
  `);
}

function enterOutlineReviewMode(delay = 1200) {
  clearOutlineReviewTimer();
  outlineReviewTimer = setTimeout(() => {
    outlineReviewMode.value = true;
    applyOutlineReviewCss();
  }, delay);
}

function exitOutlineReviewMode() {
  clearOutlineReviewTimer();
  if (!outlineReviewMode.value) return;
  outlineReviewMode.value = false;
  applyOutlineReviewCss();
}

function destroyDocmee() {
  clearOutlineReviewTimer();
  docmeeUI.value?.destroy?.();
  docmeeUI.value = null;
  iframeReady.value = false;
  outlineReviewMode.value = false;
}

async function initAiPPT() {
  try {
    loading.value = true;
    console.log("正在请求 PPT Token...");
    const res: any = await getPptToken();
    console.log("PPT Token 响应结果:", res);

    // 兼容多种状态码：0 或 200 都视为成功
    if (res && (res.code === 0 || res.code === 200) && res.data?.token) {
      console.log("Token 获取成功，正在初始化 DocmeeUI...");
      destroyDocmee();
      docmeeUI.value = new DocmeeUI({
        container: "aippt-container", // 挂载 iframe 容器元素ID
        page: "creator", // 固定使用creator页面
        creatorVersion: "v2",
        token: res.data.token, // token
        creatorData: {
          text: "",
          creatorNow: true,
          type: CreatorType.AI_GEN
        },
        isMobile: isMobile.value, // 移动端模式
        padding: isMobile.value ? "8px 8px 24px" : "20px 20px 0px",
        background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", // 与 welcome banner 一致的背景色
        mode: "light", // light 亮色模式, dark 暗色模式
        lang: "zh", // 国际化
        // 自定义 CSS 样式 - 使用平台统一蓝色 #97b4f7
        // DaisyUI 主题色覆盖：#97b4f7 转 HSL = 210 100% 62%
        css: `
          /* ========== DaisyUI 主题色覆盖 - 平台统一蓝色 #97b4f7 ========== */
          
          /* 覆盖 DaisyUI CSS 变量 - 这是关键！ */
          *, *::before, *::after,
          :root, [data-theme], #docmee_SdkContainer {
            --p: 210 100% 62% !important;
            --pf: 210 100% 56% !important;
            --pc: 0 0% 100% !important;
            --primary: #97b4f7 !important;
            --primary-focus: #3a8ee6 !important;
            --primary-content: #ffffff !important;
            
            --s: 210 100% 62% !important;
            --sf: 210 100% 56% !important;
            --sc: 0 0% 100% !important;
            --secondary: #97b4f7 !important;
            
            --a: 210 100% 62% !important;
            --af: 210 100% 56% !important;
            --ac: 0 0% 100% !important;
            --accent: #97b4f7 !important;
            
            --in: 210 100% 62% !important;
            --info: #97b4f7 !important;
          }
          
          /* ===== 对话气泡 - chat-bubble ===== */
          .chat-bubble,
          .chat-bubble-primary,
          .chat-bubble.chat-bubble-primary {
            background-color: #97b4f7 !important;
            --tw-bg-opacity: 1 !important;
            color: white !important;
          }
          
          /* ===== 主要按钮 ===== */
          .btn-primary,
          .btn.btn-primary {
            background-color: #97b4f7 !important;
            border-color: #97b4f7 !important;
            color: white !important;
            --tw-bg-opacity: 1 !important;
          }
          
          .btn-primary:hover,
          .btn.btn-primary:hover {
            background-color: #66b1ff !important;
            border-color: #66b1ff !important;
          }
          
          /* ===== 修复"立即创作"按钮 - 移除灰色覆盖 ===== */
          .btn.btn-primary[class*="bg-base-200"],
          .btn.btn-primary.\!bg-base-200 {
            background-color: #97b4f7 !important;
            background: #97b4f7 !important;
            color: white !important;
          }
          
          .btn.btn-primary[class*="text-base-300"],
          .btn.btn-primary.\!text-base-300 {
            color: white !important;
          }
          
          /* ===== 选中的功能卡片（AI智能创作等）- 蓝色背景白色文字 ===== */
          .\\!bg-primary,
          [class*="!bg-primary"] {
            background-color: #97b4f7 !important;
          }
          
          /* 选中状态：卡片内部所有文字都是白色（包括子元素） */
          .\\!bg-primary,
          .\\!bg-primary *,
          .\\!bg-primary .text-primary,
          [class*="!bg-primary"],
          [class*="!bg-primary"] *,
          [class*="!bg-primary"] .text-primary,
          .\\!text-primary-content,
          [class*="!text-primary-content"] {
            color: white !important;
          }
          
          /* ===== 未选中状态的文字颜色 - 蓝色 ===== */
          /* 只有不在选中卡片内的 .text-primary 才是蓝色 */
          .bg-base-100 .text-primary,
          .bg-base-200 .text-primary,
          div:not([class*="!bg-primary"]) > .text-primary {
            color: #97b4f7 !important;
          }
          
          /* ===== 边框颜色 ===== */
          .border-primary,
          .border-primary\/10,
          [class*="border-primary"] {
            border-color: #97b4f7 !important;
          }
          
          .focus-within\:border-primary-focus\/20:focus-within {
            border-color: rgba(64, 158, 255, 0.2) !important;
          }
          
          /* ===== 背景色 ===== */
          .bg-primary,
          .bg-primary\/10,
          [class*="bg-primary"] {
            background-color: #97b4f7 !important;
          }
          
          .hover\:bg-primary\/10:hover {
            background-color: rgba(64, 158, 255, 0.1) !important;
          }
          
          .hover\:text-primary:hover {
            color: #97b4f7 !important;
          }
          
          /* ===== 阴影 ===== */
          .shadow-primary-focus\/20,
          .\!shadow-primary-focus\/20,
          [class*="shadow-primary"] {
            --tw-shadow-color: rgba(64, 158, 255, 0.2) !important;
          }
          
          .hover\:shadow-primary\/10:hover {
            --tw-shadow-color: rgba(64, 158, 255, 0.1) !important;
          }
          
          /* ===== 开关 ===== */
          .hdd-switch-checked,
          .hdd-switch[aria-checked="true"] {
            background-color: #97b4f7 !important;
          }
          
          /* ===== 选择框选中项 ===== */
          .hdd-select-item-option-selected {
            background-color: rgba(64, 158, 255, 0.1) !important;
            color: #97b4f7 !important;
          }
          
          /* ===== 链接 ===== */
          a, .link {
            color: #97b4f7 !important;
          }
          
          a:hover, .link:hover {
            color: #66b1ff !important;
          }
          
          /* ===== 输入框聚焦 - 移除蓝色轮廓线 ===== */
          input:focus, textarea:focus,
          input:focus-visible, textarea:focus-visible,
          .input:focus, .input:focus-visible,
          .textarea:focus, .textarea:focus-visible {
            outline: none !important;
            outline-width: 0 !important;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
          }
          
          /* 移除所有元素的聚焦轮廓 */
          *:focus, *:focus-visible {
            outline: none !important;
            outline-width: 0 !important;
          }
          
          /* DaisyUI 输入框聚焦样式重置 */
          .input:focus, .input:focus-within,
          .textarea:focus, .textarea:focus-within,
          [class*="input"]:focus, [class*="input"]:focus-within {
            outline: none !important;
            outline-offset: 0 !important;
            box-shadow: none !important;
          }
          
          /* ===== 进度条 ===== */
          .progress-primary::-webkit-progress-value {
            background-color: #97b4f7 !important;
          }
          
          /* ===== 强制覆盖内联样式 ===== */
          [style*="--p: 249"] {
            --p: 210 100% 62% !important;
          }
          
          [style*="--pf: 249"] {
            --pf: 210 100% 56% !important;
          }
          
          [style*="--s: 249"] {
            --s: 210 100% 62% !important;
          }

          /* ========== 移动端安全约束 ========== */
          @media (max-width: 768px) {
            #docmee_SdkContainer,
            #docmee_SdkContainer * {
              box-sizing: border-box !important;
            }

            #docmee_SdkContainer {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              overflow-x: hidden !important;
            }

            /* 避免聊天区/卡片区在窄屏下被内容撑出横向滚动 */
            .chat,
            [class*="chat"],
            .card,
            [class*="card"],
            .bg-base-100,
            .bg-base-200,
            .bg-base-300 {
              max-width: 100% !important;
              min-width: 0 !important;
            }

            /* 仅保留可读字号，避免 iOS 聚焦自动放大 */
            textarea,
            .textarea,
            .input,
            input {
              font-size: 16px !important;
            }

            /* 为大纲页底部操作条、反馈卡片预留安全空间 */
            .overflow-y-auto,
            .overflow-auto,
            [class*="overflow-y-auto"],
            [class*="overflow-auto"] {
              scroll-padding-bottom: calc(180px + var(--intelledu-outline-extra-bottom, 0px)) !important;
            }

            .bg-base-100.overflow-y-auto,
            .bg-base-200.overflow-y-auto,
            .bg-base-100.overflow-auto,
            .bg-base-200.overflow-auto,
            [class*="bg-base-100"][class*="overflow-y-auto"],
            [class*="bg-base-200"][class*="overflow-y-auto"],
            [class*="bg-base-100"][class*="overflow-auto"],
            [class*="bg-base-200"][class*="overflow-auto"] {
              padding-bottom: calc(120px + var(--intelledu-outline-extra-bottom, 0px)) !important;
            }

            /* 大纲中轴线：精准命中真实节点，只在移动端缩短顶部和底部 */
            .border-0.border-r.border-solid.border-base-300.h-full.w-1.absolute.top-0 {
              top: 56px !important;
              bottom: 132px !important;
              height: auto !important;
            }

            /* 底部主操作按钮文字略收小，避免“挑选模版”显得发涨 */
            .btn.btn-primary {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 15px !important;
              min-height: 40px !important;
              line-height: 1.2 !important;
              white-space: nowrap !important;
              overflow: visible !important;
            }

            .btn.btn-primary span:last-child {
              font-size: inherit !important;
              line-height: inherit !important;
              white-space: nowrap !important;
              overflow: visible !important;
            }

            /* 大纲底部操作区：移动端改成两行，避免“修改大纲”挤压“挑选模版” */
            div:has(> .btn.btn-primary.btn-sm):has(> .btn.btn-sm:not(.btn-primary)) {
              display: flex !important;
              flex-wrap: wrap !important;
              align-items: center !important;
              justify-content: flex-end !important;
              gap: 8px !important;
            }

            div:has(> .btn.btn-primary.btn-sm):has(> .btn.btn-sm:not(.btn-primary)) > .btn.btn-primary.btn-sm {
              order: 1 !important;
              min-width: 132px !important;
              margin-left: auto !important;
            }

            div:has(> .btn.btn-primary.btn-sm):has(> .btn.btn-sm:not(.btn-primary)) > .btn.btn-sm:not(.btn-primary) {
              order: 2 !important;
              margin-top: 4px !important;
            }

            /* 反馈卡片：精准命中真实节点，放宽宽度并整体上移 */
            .mx-auto.w-1\\/2.bottom-\\[72px\\].rounded-2xl.gap-2.flex.flex-col.bg-white.p-4 {
              box-sizing: border-box !important;
              width: calc(100% - 24px) !important;
              max-width: calc(100% - 24px) !important;
              margin-left: auto !important;
              margin-right: auto !important;
              bottom: 116px !important;
              left: 12px !important;
              right: 12px !important;
              transform: none !important;
              z-index: 20 !important;
            }

            .mx-auto.w-1\\/2.bottom-\\[72px\\].rounded-2xl.gap-2.flex.flex-col.bg-white.p-4 > .flex.gap-2 {
              display: grid !important;
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: 8px !important;
            }

            .mx-auto.w-1\\/2.bottom-\\[72px\\].rounded-2xl.gap-2.flex.flex-col.bg-white.p-4 > .flex.gap-2 > button {
              min-width: 0 !important;
              padding-left: 4px !important;
              padding-right: 4px !important;
            }

            .mx-auto.w-1\\/2.bottom-\\[72px\\].rounded-2xl.gap-2.flex.flex-col.bg-white.p-4 > .flex.gap-2 > button span:last-child {
              white-space: normal !important;
              line-height: 1.15 !important;
              text-align: center !important;
            }
          }

          @media (max-width: 400px) {
            .btn.btn-primary {
              font-size: 14px !important;
              padding-left: 12px !important;
              padding-right: 12px !important;
            }

            .btn.btn-primary svg {
              transform: scale(0.92) !important;
              transform-origin: center !important;
            }
          }
        `,
        onMessage: message => {
          console.log(message);
          if (message.type === "invalid-token") {
            // 在token失效时触发
            console.log("token 认证错误");
            ElMessage.error("token认证失败，请刷新页面重试");
            // 更换新的 token
            initAiPPT();
          } else if (message.type === "beforeGenerate") {
            const { subtype, fields } = message.data;
            if (subtype === "outline") {
              // 生成大纲前触发
              enterOutlineReviewMode();
              console.log("即将生成ppt大纲", fields);
              return true;
            } else if (subtype === "ppt") {
              // 生成PPT前触发
              exitOutlineReviewMode();
              console.log("即将生成ppt", fields);
              docmeeUI.value.sendMessage({
                type: "success",
                content: "继续生成PPT"
              });
              return true;
            }
          } else if (message.type === "afterGenerate") {
            const subtype = String(
              message.data?.subtype || message.data?.type || ""
            ).toLowerCase();
            if (!subtype || subtype === "outline") {
              enterOutlineReviewMode(0);
            } else if (subtype === "ppt") {
              exitOutlineReviewMode();
            }
          } else if (message.type === "beforeCreateCustomTemplate") {
            exitOutlineReviewMode();
            return true;
          } else if (message.type === "pageChange") {
            const page = String(
              message.data?.page || message.data?.name || message.data || ""
            ).toLowerCase();
            if (page.includes("editor") || page.includes("template")) {
              exitOutlineReviewMode();
            }
          } else if (message.type === "beforeDownload") {
            // 自定义下载PPT的文件名称
            const { id, subject } = message.data;
            return `PPT_${subject}.pptx`;
          } else if (message.type == "error") {
            if (message.data.code == 88) {
              // 创建token传了limit参数可以限制使用次数
              ElMessage.warning("您的使用次数已用完");
            } else {
              ElMessage.error("发生错误：" + message.data.message);
            }
          }
        }
      });
      // SDK 初始化后，延迟显示 iframe，让自定义 CSS 有时间生效
      setTimeout(() => {
        iframeReady.value = true;
        applyOutlineReviewCss();
      }, 300); // 300ms 延迟，确保 CSS 注入生效
    } else {
      ElMessage.error("获取token失败");
    }
  } catch (error) {
    console.error("初始化AI PPT失败:", error);
    ElMessage.error("初始化AI PPT失败，请刷新页面重试");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  // 加载SDK和初始化
  initAiPPT();
});
watch(isMobile, () => {
  initAiPPT();
});

onBeforeUnmount(() => {
  destroyDocmee();
});
</script>

<template>
  <div class="aippt-page">
    <!-- iframe容器 -->
    <div v-loading="loading" class="aippt-container-wrapper">
      <div id="aippt-container" :class="{ 'iframe-ready': iframeReady }" />
    </div>
  </div>
</template>

<style scoped>
.aippt-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.aippt-container-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
}

#aippt-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0 auto;
  overflow: hidden;
  color: #1f2937;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  border-radius: 8px;

  /* 初始隐藏，避免紫色闪烁 */
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
}

#aippt-container.iframe-ready {
  opacity: 1;
}

/* iframe 内部样式立即生效 */
#aippt-container :deep(iframe) {
  opacity: inherit;
}

@media (width <= 768px) {
  .aippt-page {
    padding: 4px;
  }

  #aippt-container {
    border-radius: 12px;
  }
}
</style>

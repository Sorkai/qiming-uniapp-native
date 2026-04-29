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
const { isMobile } = usePageResponsive();

function destroyDocmee() {
  docmeeUI.value?.destroy?.();
  docmeeUI.value = null;
  iframeReady.value = false;
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
        padding: isMobile.value ? "12px 12px 0px" : "20px 20px 0px",
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
              console.log("即将生成ppt大纲", fields);
              return true;
            } else if (subtype === "ppt") {
              // 生成PPT前触发
              console.log("即将生成ppt", fields);
              docmeeUI.value.sendMessage({
                type: "success",
                content: "继续生成PPT"
              });
              return true;
            }
          } else if (message.type === "beforeCreateCustomTemplate") {
            return true;
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
  height: calc(100vh - 115px);
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.aippt-container-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
}

#aippt-container {
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
    height: calc(100vh - 88px);
    padding: 8px;
  }

  #aippt-container {
    border-radius: 16px;
  }
}
</style>

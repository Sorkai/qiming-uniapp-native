<script setup lang="ts">
import { ref, onMounted, shallowRef } from "vue";
import { getPptToken } from "@/api/ppt";
import { ElMessage } from "element-plus";
import { DocmeeUI, CreatorType } from "@docmee/sdk-ui";

const loading = ref(true);
const container = ref<HTMLDivElement>();
const docmeeUI = shallowRef<any>(null);

async function initAiPPT() {
  try {
    loading.value = true;
    console.log("正在请求 PPT Token...");
    const res: any = await getPptToken();
    console.log("PPT Token 响应结果:", res);

    // 兼容多种状态码：0 或 200 都视为成功
    if (res && (res.code === 0 || res.code === 200) && res.data?.token) {
      console.log("Token 获取成功，正在初始化 DocmeeUI...");
      docmeeUI.value = new DocmeeUI({
        container: "aippt-container", // 挂载 iframe 容器元素ID
        page: "creator", // 固定使用creator页面
        creatorVersion: "v2",
        token: res.data.token, // token
        creatorData: {
          text: "",
          creatorNow: true,
          type: CreatorType.AI_GEN,
        },
        isMobile: false, // 移动端模式
        padding: "20px 20px 0px",
        background: "linear-gradient(-157deg,#f57bb0, #867dea)", // 自定义背景
        mode: "light", // light 亮色模式, dark 暗色模式
        lang: "zh", // 国际化
        onMessage: (message) => {
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
                content: "继续生成PPT",
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
        },
      });
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
</script>

<template>
  <div class="aippt-page">
    <!-- iframe容器 -->
    <div v-loading="loading" class="aippt-container-wrapper">
      <div id="aippt-container"></div>
    </div>
  </div>
</template>

<style scoped>
.aippt-page {
  width: 100%;
  height: calc(100vh - 115px);
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  margin: 0 auto;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(-157deg, #f57bb0, #867dea);
  color: white;
}
</style> 
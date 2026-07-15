import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import PlatformPreviewTestHarness from "./PlatformPreviewTestHarness.vue";

createApp(PlatformPreviewTestHarness)
  .use(ElementPlus)
  .mount("#platform-preview-test");

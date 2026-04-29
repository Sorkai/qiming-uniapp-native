import { getPluginsList } from "./build/plugins";
import { include, exclude } from "./build/optimize";
import { type UserConfigExport, type ConfigEnv, loadEnv } from "vite";
import {
  root,
  alias,
  wrapperEnv,
  pathResolve,
  __APP_INFO__
} from "./build/utils";

export default ({ mode, command }: ConfigEnv): UserConfigExport => {
  const {
    VITE_CDN,
    VITE_PORT,
    VITE_COMPRESSION,
    VITE_PUBLIC_PATH,
    VITE_PROXY_TARGET,
    VITE_MOCK_SCOPE
  } = wrapperEnv(loadEnv(mode, root));
  return {
    base: VITE_PUBLIC_PATH,
    root,
    publicDir: command === "serve" ? "public" : false,
    resolve: {
      alias
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        "/api": {
          target: VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, "")
        }
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      }
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION, VITE_MOCK_SCOPE),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: "es2015",
      sourcemap: false,
      reportCompressedSize: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        maxParallelFileOps: 5,
        input: {
          index: pathResolve("./index.html", import.meta.url)
        },
        // 抑制特定警告
        onwarn(warning, warn) {
          // 忽略 eval 警告（来自 lottie-web）
          if (warning.code === "EVAL" && warning.id?.includes("lottie-web")) {
            return;
          }
          // 忽略动态导入和静态导入混合的警告
          if (
            warning.code === "PLUGIN_WARNING" &&
            warning.message?.includes("dynamically imported")
          ) {
            return;
          }
          // 其他警告正常输出
          warn(warning);
        },
        // 静态资源分类打包
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (id.includes("pdfjs-dist") || id.includes("vue-pdf-embed")) {
              return "pdf";
            }
            if (id.includes("xlsx")) {
              return "xlsx";
            }
            if (id.includes("echarts")) {
              return "echarts";
            }
            if (
              id.includes("@logicflow") ||
              id.includes("@vue-flow") ||
              id.includes("dagre")
            ) {
              return "flow";
            }
            if (
              id.includes("@pureadmin/table") ||
              id.includes("@pureadmin/descriptions") ||
              id.includes("plus-pro-components") ||
              id.includes("vxe-table")
            ) {
              return "table";
            }
            if (
              id.includes("deep-chat") ||
              id.includes("@docmee/sdk-ui") ||
              id.includes("mqtt") ||
              id.includes("cos-js-sdk-v5")
            ) {
              return "ai-tools";
            }
            if (
              id.includes("cropperjs") ||
              id.includes("html2canvas") ||
              id.includes("sortablejs") ||
              id.includes("vuedraggable") ||
              id.includes("el-table-infinite-scroll") ||
              id.includes("intro.js")
            ) {
              return "interaction";
            }
            if (
              id.includes("@amap") ||
              id.includes("china-area-data") ||
              id.includes("pinyin-pro")
            ) {
              return "geo";
            }
            if (
              id.includes("codemirror") ||
              id.includes("vditor") ||
              id.includes("markdown-it") ||
              id.includes("highlight.js") ||
              id.includes("katex")
            ) {
              return "editor";
            }
            if (id.includes("lottie-web")) {
              return "lottie";
            }
            if (
              id.includes("three") ||
              id.includes("@pixiv/three-vrm") ||
              id.includes("xgplayer") ||
              id.includes("wavesurfer") ||
              id.includes("@splinetool/runtime") ||
              id.includes("swiper")
            ) {
              return "media";
            }
            if (
              id.includes("element-plus") ||
              id.includes("@element-plus/icons-vue")
            ) {
              return "element-plus";
            }
            if (
              id.includes("/vue/") ||
              id.includes("\\vue\\") ||
              id.includes("vue-router") ||
              id.includes("pinia") ||
              id.includes("vue-i18n")
            ) {
              return "vue-vendor";
            }

            return "vendor";
          },
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};

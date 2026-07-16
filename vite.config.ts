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
    VITE_API_URL,
    VITE_PROXY_TARGET,
    VITE_MINDMAP_FILE_PROXY_TARGET,
    VITE_MOCK_SCOPE
  } = wrapperEnv(loadEnv(mode, root));
  const isEdgeOneWechatH5 = process.env.QIMING_EDGEONE_WECHAT_H5 === "1";
  const resolvedApiUrl =
    mode === "app" && !VITE_API_URL ? VITE_PROXY_TARGET : VITE_API_URL;
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
        },
        // 思维导图 JSON 存储在 COS；本地通过同源代理读取，避免 Firefox CORS 差异。
        "/mindmap-file": {
          target: VITE_MINDMAP_FILE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/mindmap-file/, "")
        }
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"]
      },
      watch: {
        ignored: [
          "**/.git/**",
          "**/.screenshots/**",
          "**/dist/**",
          "**/native-app/dist/**",
          "**/native-app/.hbuilderx/**"
        ]
      }
    },
    plugins: getPluginsList(
      VITE_CDN,
      VITE_COMPRESSION,
      VITE_MOCK_SCOPE,
      mode === "app"
    ),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: isEdgeOneWechatH5 ? "es2020" : "es2015",
      minify: isEdgeOneWechatH5 ? false : "esbuild",
      cssMinify: isEdgeOneWechatH5 ? false : "esbuild",
      sourcemap: false,
      reportCompressedSize: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
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
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(resolvedApiUrl),
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    }
  };
};

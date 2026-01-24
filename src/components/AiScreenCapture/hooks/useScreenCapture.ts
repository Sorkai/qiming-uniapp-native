import { ref } from "vue";
import html2canvas from "html2canvas";
import type { CaptureArea, CaptureStatus } from "../types";

/**
 * 截图功能 Hook
 */
export function useScreenCapture() {
  // 截图状态
  const status = ref<CaptureStatus>("idle");
  // 截图结果 (base64)
  const screenshot = ref<string>("");
  // 截图区域
  const captureArea = ref<CaptureArea | null>(null);
  // 是否正在处理
  const isProcessing = ref(false);
  // 错误信息
  const error = ref<string>("");

  /**
   * 开始截图模式
   */
  const startCapture = () => {
    status.value = "capturing";
    error.value = "";
  };

  /**
   * 取消截图
   */
  const cancelCapture = () => {
    status.value = "idle";
    captureArea.value = null;
  };

  /**
   * 执行截图
   * @param area 截图区域
   */
  const captureScreen = async (area: CaptureArea): Promise<string> => {
    isProcessing.value = true;
    error.value = "";
    captureArea.value = area;

    try {
      // 先隐藏截图遮罩层
      status.value = "idle";

      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用html2canvas截取整个页面
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
        logging: false,
        // 忽略某些元素
        ignoreElements: element => {
          return (
            element.classList.contains("capture-overlay") ||
            element.classList.contains("ai-float-button")
          );
        }
      });

      // 裁剪指定区域
      const croppedCanvas = document.createElement("canvas");
      const ctx = croppedCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("无法创建Canvas上下文");
      }

      // 计算实际裁剪区域（考虑设备像素比）
      const scale = window.devicePixelRatio || 1;
      const x = area.x * scale;
      const y = area.y * scale;
      const width = area.width * scale;
      const height = area.height * scale;

      croppedCanvas.width = width;
      croppedCanvas.height = height;

      // 裁剪图片
      ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

      // 转换为base64
      const base64 = croppedCanvas.toDataURL("image/png");
      screenshot.value = base64;
      status.value = "preview";

      return base64;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "截图失败";
      status.value = "idle";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * 重置截图
   */
  const resetCapture = () => {
    status.value = "idle";
    screenshot.value = "";
    captureArea.value = null;
    error.value = "";
  };

  /**
   * 进入对话模式
   */
  const enterChatMode = () => {
    status.value = "chatting";
  };

  /**
   * 压缩图片
   * @param base64 原始base64
   * @param maxWidth 最大宽度
   * @param quality 质量 0-1
   */
  const compressImage = (
    base64: string,
    maxWidth: number = 1200,
    quality: number = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("无法创建Canvas上下文"));
          return;
        }

        let { width, height } = img;

        // 如果宽度超过最大值，等比缩放
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = base64;
    });
  };

  return {
    status,
    screenshot,
    captureArea,
    isProcessing,
    error,
    startCapture,
    cancelCapture,
    captureScreen,
    resetCapture,
    enterChatMode,
    compressImage
  };
}

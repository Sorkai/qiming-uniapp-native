import { ref } from "vue";
import html2canvas from "html2canvas";
import type { CaptureArea, CaptureStatus } from "../types";

/**
 * 截图功能 Hook
 */
export function useScreenCapture() {
  const OKLCH_COLOR_REGEX = /oklch\([^()]*\)/gi;

  /**
   * html2canvas 对 <video> 当前帧支持不稳定，先把源页面视频帧转成图片注入克隆文档，避免截图黑屏。
   */
  const patchVideoFrames = (clonedDoc: Document) => {
    const sourceVideos = Array.from(document.querySelectorAll("video"));
    const clonedVideos = Array.from(clonedDoc.querySelectorAll("video"));

    if (!sourceVideos.length || !clonedVideos.length) return;

    const videoCount = Math.min(sourceVideos.length, clonedVideos.length);

    for (let i = 0; i < videoCount; i++) {
      const sourceVideo = sourceVideos[i];
      const clonedVideo = clonedVideos[i];

      if (!clonedVideo.parentElement) continue;
      if (sourceVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) continue;

      const frameWidth = sourceVideo.videoWidth || sourceVideo.clientWidth;
      const frameHeight = sourceVideo.videoHeight || sourceVideo.clientHeight;

      if (!frameWidth || !frameHeight) continue;

      try {
        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;

        const frameCtx = frameCanvas.getContext("2d");
        if (!frameCtx) continue;

        frameCtx.drawImage(sourceVideo, 0, 0, frameWidth, frameHeight);

        const frameImage = clonedDoc.createElement("img");
        frameImage.src = frameCanvas.toDataURL("image/png");
        frameImage.alt = "video-frame";
        frameImage.className = clonedVideo.className;

        const styleText = clonedVideo.getAttribute("style");
        if (styleText) {
          frameImage.setAttribute("style", styleText);
        }

        const displayWidth = clonedVideo.clientWidth || sourceVideo.clientWidth;
        const displayHeight =
          clonedVideo.clientHeight || sourceVideo.clientHeight;

        if (displayWidth) {
          frameImage.style.width = `${displayWidth}px`;
        }
        if (displayHeight) {
          frameImage.style.height = `${displayHeight}px`;
        }

        if (!frameImage.style.objectFit) {
          frameImage.style.objectFit = "cover";
        }

        clonedVideo.parentElement.replaceChild(frameImage, clonedVideo);
      } catch {
        // 跨域视频或受保护流会导致 drawImage/toDataURL 失败，忽略该视频并继续。
      }
    }
  };

  /**
   * 将不被 html2canvas 支持的 oklch() 转换为 rgb()，避免解析时报错
   */
  const normalizeUnsupportedColors = (clonedDoc: Document) => {
    if (!clonedDoc.body) return;

    const view = clonedDoc.defaultView || window;
    const probe = clonedDoc.createElement("span");
    probe.style.position = "fixed";
    probe.style.left = "-99999px";
    probe.style.top = "-99999px";
    clonedDoc.body.appendChild(probe);

    const toRgbColor = (colorValue: string) => {
      probe.style.color = "";
      probe.style.color = colorValue;
      return probe.style.color
        ? view.getComputedStyle(probe).color
        : colorValue;
    };

    const replaceColorFunctions = (input: string) => {
      if (!input.includes("oklch(")) return input;
      OKLCH_COLOR_REGEX.lastIndex = 0;
      return input.replace(OKLCH_COLOR_REGEX, match => toRgbColor(match));
    };

    const normalizeStyleDeclaration = (style: CSSStyleDeclaration) => {
      for (let i = 0; i < style.length; i++) {
        const prop = style.item(i);
        const value = style.getPropertyValue(prop);
        if (!value || !value.includes("oklch(")) continue;
        const nextValue = replaceColorFunctions(value);
        const priority = style.getPropertyPriority(prop);
        style.setProperty(prop, nextValue, priority);
      }
    };

    const normalizeCssRules = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        const styleRule = rule as CSSRule & { style?: CSSStyleDeclaration };
        if (styleRule.style) {
          normalizeStyleDeclaration(styleRule.style);
        }

        const groupRule = rule as CSSRule & { cssRules?: CSSRuleList };
        if (groupRule.cssRules) {
          normalizeCssRules(groupRule.cssRules);
        }
      }
    };

    // 优先处理 CSSOM，覆盖外链样式、构建产物样式和运行时注入样式
    for (const styleSheet of Array.from(clonedDoc.styleSheets)) {
      try {
        normalizeCssRules(styleSheet.cssRules);
      } catch {
        // 跨域或只读样式表会抛错，忽略后继续处理其他样式
      }
    }

    // 处理 style 标签中的 CSS 文本
    const styleTags = Array.from(clonedDoc.querySelectorAll("style"));
    styleTags.forEach(styleTag => {
      const cssText = styleTag.textContent;
      if (!cssText || !cssText.includes("oklch(")) return;
      styleTag.textContent = replaceColorFunctions(cssText);
    });

    // 处理内联 style
    const styledElements = Array.from(clonedDoc.querySelectorAll("[style]"));
    styledElements.forEach(element => {
      const styleAttr = element.getAttribute("style");
      if (!styleAttr || !styleAttr.includes("oklch(")) return;
      element.setAttribute("style", replaceColorFunctions(styleAttr));
    });

    probe.remove();
  };

  const isUnsupportedColorFunctionError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    return (
      message.includes("unsupported color function") ||
      message.includes("Attempting to parse an unsupported color function")
    );
  };

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

      const renderCanvas = (useForeignObjectRendering: boolean) =>
        html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: window.devicePixelRatio || 1,
          logging: false,
          foreignObjectRendering: useForeignObjectRendering,
          onclone: clonedDoc => {
            normalizeUnsupportedColors(clonedDoc);
            patchVideoFrames(clonedDoc);
          },
          // 忽略某些元素
          ignoreElements: element => {
            return (
              element.classList.contains("capture-overlay") ||
              element.classList.contains("ai-float-button")
            );
          }
        });

      let canvas: HTMLCanvasElement;
      try {
        // 优先走常规渲染，性能更好
        canvas = await renderCanvas(false);
      } catch (firstErr) {
        if (!isUnsupportedColorFunctionError(firstErr)) {
          throw firstErr;
        }
        // 命中颜色函数兼容问题时，降级到 foreignObjectRendering 再试一次
        canvas = await renderCanvas(true);
      }

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

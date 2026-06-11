import { ref, type Ref } from "vue";
import COS from "cos-js-sdk-v5";
import { ElMessage } from "element-plus";
import type {
  AttachmentInfo,
  AttachmentStsCredentials,
  ChatMessage,
  SSEEventData,
  SimpleChatStreamData,
  UploadAttachmentStsInitResponse
} from "../types";
import {
  getConversationList, // 新增：导入获取会话列表的方法
  getConversationDetail,
  getMessageHistory,
  initChatAttachmentStsUpload,
  completeChatAttachmentStsUpload,
  uploadChatAttachment,
  multimodalChatStream,
  continueConversationStream,
  streamCourseChat,
  courseQA
} from "@/api/frontend/aiConversation";

/** 课程上下文（用于单课AI互动接口） */
export interface CourseContext {
  courseId: Ref<number | null>;
  chapterId?: Ref<number | null>;
}

/**
 * 将 data URL 转成 Blob，避免 FileReader 的重复往返。
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(",");
  if (!header || !base64Data) {
    throw new Error("无效的图片数据");
  }

  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

/**
 * 将图片处理为 WebP 格式且控制大小在 6MB 以内。
 */
function processImageToWebP(source: Blob | File | string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const sourceUrl =
      typeof source === "string" ? source : URL.createObjectURL(source);
    let objectUrlToRevoke: string | null =
      typeof source === "string" ? null : sourceUrl;

    img.src = sourceUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
          objectUrlToRevoke = null;
        }
        reject(new Error("无法创建 Canvas 上下文"));
        return;
      }

      // 设置最大尺寸，避免超大图导致性能问题或体积过大
      const MAX_WIDTH = 2048;
      const MAX_HEIGHT = 2048;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 递归压缩，确保在 6MB 以内
      const MAX_SIZE = 6 * 1024 * 1024; // 6MB
      let quality = 0.9;

      const compress = () => {
        canvas.toBlob(
          blob => {
            if (!blob) {
              if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
                objectUrlToRevoke = null;
              }
              reject(new Error("Canvas 转 Blob 失败"));
              return;
            }
            if (blob.size > MAX_SIZE && quality > 0.1) {
              quality -= 0.1;
              compress();
            } else {
              if (objectUrlToRevoke) {
                URL.revokeObjectURL(objectUrlToRevoke);
                objectUrlToRevoke = null;
              }
              resolve(blob);
            }
          },
          "image/webp",
          quality
        );
      };

      compress();
    };
    img.onerror = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
        objectUrlToRevoke = null;
      }
      reject(new Error("图片加载失败"));
    };
  });
}

/**
 * AI 对话 Hook（多模态流式模式）
 * 支持截图上传附件 → 多模态流式对话 → 连续追问
 * 当传入课程上下文时，文字消息自动走「单课AI互动」流式接口
 */
export function useAiChat(courseCtx?: CourseContext) {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const suggestions = ref<string[]>([]);
  const conversationId = ref("");
  const _conversationList = ref<ChatMessage[]>([]); // 修改：为了语义化，我们这里维护一个会话列表
  const historyList = ref<any[]>([]); // 存储会话列表
  const currentImage = ref("");
  const localPreviewUrls = new Set<string>();
  let cancelStream: (() => void) | null = null;

  const isNativeWebView = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("qiming-native-webview");

  const generateId = () =>
    `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const pickField = (obj: any, keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        return obj[key];
      }
    }
    return undefined;
  };

  const getImageSize = (
    blob: Blob
  ): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const size = {
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0
        };
        URL.revokeObjectURL(objectUrl);
        resolve(size);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("读取图片尺寸失败"));
      };
      img.src = objectUrl;
    });

  const createCosClient = (
    credentials: AttachmentStsCredentials,
    uploadUrl?: string
  ) => {
    const tmpSecretId = pickField(credentials, [
      "tmp_secret_id",
      "tmpSecretId",
      "TmpSecretId",
      "secretId",
      "SecretId"
    ]);
    const tmpSecretKey = pickField(credentials, [
      "tmp_secret_key",
      "tmpSecretKey",
      "TmpSecretKey",
      "secretKey",
      "SecretKey"
    ]);
    const securityToken = pickField(credentials, [
      "security_token",
      "securityToken",
      "SecurityToken",
      "session_token",
      "sessionToken",
      "SessionToken",
      "Token"
    ]);
    const bucket = pickField(credentials, ["bucket", "Bucket"]);
    const region = pickField(credentials, ["region", "Region"]);

    if (!tmpSecretId || !tmpSecretKey || !securityToken || !bucket || !region) {
      throw new Error("STS 初始化返回信息不完整");
    }

    let uploadDomain: string | undefined;
    if (uploadUrl) {
      try {
        uploadDomain = new URL(uploadUrl).host;
      } catch {
        uploadDomain = undefined;
      }
    }

    return {
      cos: new COS({
        SecretId: tmpSecretId,
        SecretKey: tmpSecretKey,
        SecurityToken: securityToken,
        Protocol: "https:",
        Domain: uploadDomain
      }),
      bucket,
      region
    };
  };

  const uploadBlobViaAiSts = async (
    rawFile: Blob | File,
    options: {
      scene?: string;
      conversation_id?: string;
      course_id?: number;
      file_name?: string;
      content_type?: string;
    }
  ): Promise<AttachmentInfo> => {
    const fileName =
      options.file_name ||
      (rawFile instanceof File && rawFile.name) ||
      `upload-${Date.now()}.webp`;
    const contentType =
      options.content_type || rawFile.type || "application/octet-stream";

    const initRes = await initChatAttachmentStsUpload({
      scene: options.scene,
      conversation_id: options.conversation_id,
      course_id: options.course_id,
      file_name: fileName,
      content_type: contentType,
      file_size: rawFile.size
    });

    const initData: UploadAttachmentStsInitResponse =
      (initRes as any)?.data?.data || (initRes as any)?.data || initRes;

    const uploadToken = pickField(initData, ["upload_token", "uploadToken"]);
    const objectKey = pickField(initData, [
      "object_key",
      "objectKey",
      "key",
      "Key"
    ]);
    const uploadUrl = pickField(initData, [
      "upload_url",
      "uploadUrl",
      "uploadURL"
    ]);
    const credentials =
      initData.credentials || ({} as AttachmentStsCredentials);

    if (!uploadToken || !objectKey) {
      throw new Error("STS 初始化返回信息不完整");
    }

    const { cos, bucket, region } = createCosClient(credentials, uploadUrl);

    await new Promise((resolve, reject) => {
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: objectKey,
          Body: rawFile,
          ContentType: contentType
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        }
      );
    });

    const { width, height } = await getImageSize(rawFile);
    const completeRes = await completeChatAttachmentStsUpload({
      upload_token: uploadToken,
      width,
      height
    });

    const attachmentInfo: AttachmentInfo =
      (completeRes as any)?.data?.data ||
      (completeRes as any)?.data ||
      completeRes;

    if (!attachmentInfo?.attachment_id) {
      throw new Error("附件上传失败");
    }

    return attachmentInfo;
  };

  const uploadBlobForAiChat = async (
    rawFile: Blob | File,
    options: {
      scene?: string;
      conversation_id?: string;
      course_id?: number;
      file_name?: string;
      content_type?: string;
    }
  ): Promise<AttachmentInfo> => {
    if (!isNativeWebView()) {
      return uploadBlobViaAiSts(rawFile, options);
    }

    const sourceFile =
      rawFile instanceof File
        ? rawFile
        : new File([rawFile], options.file_name || `upload-${Date.now()}.webp`, {
            type: options.content_type || rawFile.type || "image/webp"
          });

    try {
      const response = await uploadChatAttachment(sourceFile, {
        scene: options.scene,
        conversation_id: options.conversation_id,
        course_id: options.course_id
      });
      const attachmentInfo: AttachmentInfo =
        (response as any)?.data?.data ||
        (response as any)?.data ||
        (response as any);

      if (!attachmentInfo?.attachment_id) {
        throw new Error("附件上传失败");
      }

      return attachmentInfo;
    } catch (error) {
      console.warn("AI 识屏后端上传失败，回退 STS 直传", error);
      return uploadBlobViaAiSts(rawFile, options);
    }
  };

  const fetchConversations = async (page = 1, pageSize = 20) => {
    try {
      const res = await getConversationList({ page, page_size: pageSize });
      if (res && res.data) {
        historyList.value = res.data.list || [];
      }
    } catch (error) {
      console.error("获取会话列表失败:", error);
    }
  };

  const addUserMessage = (content: string, image?: string) => {
    const message: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      image,
      timestamp: Date.now()
    };
    messages.value.push(message);
    return message;
  };

  const addLoadingMessage = () => {
    const message: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      loading: true,
      placeholder: "正在思考中，请稍等..."
    };
    messages.value.push(message);
    return message;
  };

  const createLocalPreviewUrl = (file: File) => {
    const url = URL.createObjectURL(file);
    localPreviewUrls.add(url);
    return url;
  };

  const releaseLocalPreview = (url?: string) => {
    if (!url || !localPreviewUrls.has(url)) return;
    URL.revokeObjectURL(url);
    localPreviewUrls.delete(url);
  };

  const releaseAllLocalPreviews = () => {
    localPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    localPreviewUrls.clear();
  };

  const updateAssistantDelta = (id: string, delta: string) => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      msg.content += delta;
      msg.placeholder = "";
    }
  };

  const finalizeAssistantMessage = (id: string, fullContent?: string) => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      if (fullContent !== undefined) msg.content = fullContent;
      msg.loading = false;
      msg.placeholder = "";
    }
  };

  /** 是否处于单课AI互动模式 */
  const isCourseMode = () =>
    !!(courseCtx?.courseId?.value && courseCtx.courseId.value > 0);

  /**
   * 处理「单课AI互动」流式响应（简单格式）
   */
  const handleCourseStreamData = (
    data: SimpleChatStreamData,
    loadingMsgId: string,
    resolve: () => void
  ) => {
    if (data.conversation_id) {
      conversationId.value = data.conversation_id;
    }
    if (data.delta) {
      updateAssistantDelta(loadingMsgId, data.delta);
    }
    if (data.finished) {
      const msg = messages.value.find(m => m.id === loadingMsgId);
      if (msg) msg.loading = false;
      if (msg) msg.placeholder = "";
      loading.value = false;
      resolve();
    }
  };

  /**
   * 处理 SSE 事件统一逻辑
   */
  const handleSSEEvent = (
    data: SSEEventData,
    loadingMsgId: string,
    resolve: () => void
  ) => {
    switch (data.event) {
      case "conversation.created":
        if (data.conversation_id) {
          conversationId.value = data.conversation_id;
        }
        break;
      case "assistant.delta":
        if (data.delta) {
          updateAssistantDelta(loadingMsgId, data.delta);
        }
        break;
      case "assistant.completed":
        finalizeAssistantMessage(loadingMsgId, data.content_text);
        loading.value = false;
        resolve();
        break;
      case "error":
        finalizeAssistantMessage(
          loadingMsgId,
          data.error_message || "AI 服务暂时不可用"
        );
        loading.value = false;
        resolve();
        break;
    }
    if (
      data.finished &&
      data.event !== "assistant.completed" &&
      data.event !== "error"
    ) {
      loading.value = false;
      resolve();
    }
  };

  /**
   * 截图分析 → 上传附件 → 创建会话 → 多模态流式对话
   */
  const analyzeScreenshot = async (image: string, question?: string) => {
    loading.value = true;
    currentImage.value = image;

    const userMsg = question || "请分析这张截图";
    const userMessage = addUserMessage(userMsg, image);
    const loadingMsg = addLoadingMessage();

    try {
      // 1. 处理截图并通过 AI 专用 STS 直传
      const sourceBlob = dataUrlToBlob(image);
      const webpBlob = await processImageToWebP(sourceBlob);
      const uploadRes = await uploadBlobForAiChat(webpBlob, {
        scene: "general",
        course_id: isCourseMode() ? courseCtx!.courseId.value! : undefined,
        file_name: "screenshot.webp",
        content_type: "image/webp"
      });

      const attachmentId = uploadRes.attachment_id;
      const attachmentUrl = uploadRes.url;

      if (!attachmentId) {
        throw new Error("附件上传失败");
      }

      // 2. 上传成功后，使用服务器返回的 URL 替换 base64
      if (attachmentUrl && userMessage) {
        userMessage.image = attachmentUrl;
      }

      // 3. 发起多模态流式对话
      await new Promise<void>(resolve => {
        cancelStream = multimodalChatStream(
          {
            scene: "general",
            course_id: isCourseMode() ? courseCtx!.courseId.value! : undefined,
            chapter_id: courseCtx?.chapterId?.value ?? undefined,
            message: userMsg,
            attachment_ids: [attachmentId],
            metadata: {
              enable_tools: "false"
            }
          },
          data => handleSSEEvent(data, loadingMsg.id, resolve)
        );
      });
    } catch (error) {
      console.error("AI分析失败:", error);
      finalizeAssistantMessage(
        loadingMsg.id,
        "分析失败，请在下方直接输入您的问题"
      );
      loading.value = false;
    }
  };

  /**
   * 通过「单课AI互动」流式接口发送消息
   */
  const sendViaCourseStream = (
    message: string,
    loadingMsgId: string
  ): Promise<void> => {
    return new Promise<void>(resolve => {
      cancelStream = streamCourseChat(
        {
          course_id: courseCtx!.courseId.value!,
          chapter_id: courseCtx?.chapterId?.value ?? undefined,
          conversation_id: conversationId.value || undefined,
          message
        },
        data => handleCourseStreamData(data, loadingMsgId, resolve)
      );
    });
  };

  /**
   * 通过「单课问答（非流式）」接口发送消息
   */
  const _sendCourseQa = async (message: string, loadingMsgId: string) => {
    try {
      const res = await courseQA({
        courseId: courseCtx!.courseId.value!,
        session_id: conversationId.value || undefined,
        userPrompt: message
      });
      if (res && res.data) {
        finalizeAssistantMessage(loadingMsgId, res.data.answer);
      } else {
        throw new Error("接口返回内容为空");
      }
    } catch (error) {
      console.error("单课问答接口调用失败:", error);
      finalizeAssistantMessage(loadingMsgId, "问答服务暂时不可用，请稍后重试");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 发送追问消息（在已有会话中继续流式对话）
   * 当存在会话 ID 时，优先使用「继续流式对话」接口
   */
  const sendMessage = async (message: string) => {
    loading.value = true;
    addUserMessage(message);
    const loadingMsg = addLoadingMessage();

    try {
      if (conversationId.value) {
        // 已有会话，继续对话（多模态流式对话）
        await new Promise<void>(resolve => {
          cancelStream = continueConversationStream(
            conversationId.value,
            {
              message,
              metadata: {
                enable_tools: "false"
              }
            },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      } else if (isCourseMode()) {
        // 单课AI互动流式模式（无会话ID但有课程上下文）
        await sendViaCourseStream(message, loadingMsg.id);
      } else {
        // 无会话 ID，创建新会话
        await new Promise<void>(resolve => {
          cancelStream = multimodalChatStream(
            {
              scene: "general",
              course_id: isCourseMode()
                ? courseCtx!.courseId.value!
                : undefined,
              chapter_id: courseCtx?.chapterId?.value ?? undefined,
              message,
              metadata: {
                enable_tools: "false"
              }
            },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      finalizeAssistantMessage(loadingMsg.id, "网络错误，请稍后重试");
      ElMessage.error("发送消息失败，请稍后重试");
      loading.value = false;
    }
  };

  /**
   * 上传本地图片并继续对话
   */
  const uploadAndContinue = async (file: File) => {
    loading.value = true;
    const previewUrl = createLocalPreviewUrl(file);
    const userMsg = "我上传了一张图片";
    const userMessage = addUserMessage(userMsg, previewUrl);
    const loadingMsg = addLoadingMessage();

    try {
      // 1. 处理图片为 WebP 并通过 AI 专用 STS 直传
      const webpBlob = await processImageToWebP(file);
      const uploadRes = await uploadBlobForAiChat(webpBlob, {
        scene: "general",
        conversation_id: conversationId.value || undefined,
        course_id: isCourseMode() ? courseCtx!.courseId.value! : undefined,
        file_name: "upload.webp",
        content_type: "image/webp"
      });

      const attachmentId = uploadRes.attachment_id;
      const attachmentUrl = uploadRes.url;

      if (!attachmentId) throw new Error("附件上传失败");

      if (attachmentUrl) {
        userMessage.image = attachmentUrl;
        releaseLocalPreview(previewUrl);
      }

      // 4. 发起对话
      if (!conversationId.value) {
        // 如果没有会话，先创建多模态对话
        await new Promise<void>(resolve => {
          cancelStream = multimodalChatStream(
            {
              scene: "general",
              course_id: isCourseMode()
                ? courseCtx!.courseId.value!
                : undefined,
              chapter_id: courseCtx?.chapterId?.value ?? undefined,
              message: userMsg,
              attachment_ids: [attachmentId]
            },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      } else {
        // 已有会话，继续多模态对话
        await new Promise<void>(resolve => {
          cancelStream = continueConversationStream(
            conversationId.value,
            {
              message: userMsg,
              attachment_ids: [attachmentId]
            },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      }
    } catch (error) {
      console.error("上传图片失败:", error);
      finalizeAssistantMessage(loadingMsg.id, "图片上传或发送失败，请重试");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载会话详情（包含消息历史）
   */
  const loadHistory = async (id: string) => {
    if (!id) return;
    loading.value = true;
    try {
      // 1. 获取会话详情 (可选，用于更新基础信息)
      const detailRes = await getConversationDetail(id);
      if (detailRes && detailRes.data) {
        conversationId.value = detailRes.data.conversation_id || id;
      }

      // 2. 获取消息历史（分页获取）
      const res = await getMessageHistory(id, { page: 1, page_size: 50 });
      if (res && res.data && res.data.list) {
        messages.value = res.data.list.map(item => ({
          id: item.message_id || generateId(),
          role: item.role as "user" | "assistant",
          content: item.content_text,
          image: item.attachments?.[0]?.url,
          timestamp: new Date(item.created_at).getTime(),
          loading: false
        }));

        // 3. 将第一条带有图片的 user 消息中的图片设为当前显示的顶部预览图
        const firstImageMsg = messages.value.find(
          m => m.role === "user" && m.image
        );
        if (firstImageMsg) {
          currentImage.value = firstImageMsg.image;
        } else {
          currentImage.value = ""; // 如果没有图片，清空预览
        }
      }
    } catch (error) {
      console.error("加载详情和历史记录失败:", error);
      ElMessage.error("加载历史记录失败");
    } finally {
      loading.value = false;
    }
  };

  const resetChat = () => {
    if (cancelStream) {
      cancelStream();
      cancelStream = null;
    }
    releaseAllLocalPreviews();
    currentImage.value = "";
    conversationId.value = "";
    messages.value = [];
    suggestions.value = [];
    loading.value = false;
  };

  /** 停止当前流式生成 */
  const stopGenerate = () => {
    if (cancelStream) {
      cancelStream();
      cancelStream = null;
    }
    // 结束最后一条 loading 状态的消息
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant" && last.loading) {
      last.loading = false;
      last.placeholder = "";
      if (!last.content) last.content = "已停止生成";
    }
    loading.value = false;
  };

  return {
    messages,
    loading,
    suggestions,
    conversationId,
    historyList,
    currentImage,
    analyzeScreenshot,
    sendMessage,
    resetChat,
    stopGenerate,
    loadHistory,
    fetchConversations,
    uploadAndContinue
  };
}

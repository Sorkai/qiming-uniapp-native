import { http } from "@/utils/http";
import { getToken, formatToken } from "@/utils/auth";

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface AssistantBootstrapCourse {
  course_id: number;
  course_name: string;
  subtitle?: string;
  thumb_url?: string;
}

export interface AssistantBootstrapStudent {
  student_id: number;
  student_name: string;
  avatar?: string;
}

export interface AssistantOption {
  key: string;
  label: string;
  description?: string;
}

export interface AssistantSkill extends AssistantOption {
  default_on: boolean;
}

export interface AssistantBootstrapResp {
  role: string;
  mode: string;
  selected_course_id?: number;
  selected_student_id?: number;
  courses: AssistantBootstrapCourse[];
  students: AssistantBootstrapStudent[];
  agents: AssistantOption[];
  skills: AssistantSkill[];
  models: AssistantOption[];
  thinking_modes: AssistantOption[];
  profile_summary?: {
    status: string;
    dimension_count: number;
    last_updated_at?: string;
    summary?: string;
    evidence_available: boolean;
  };
  path_summary?: {
    status: string;
    current_phase?: string;
    completed_nodes: number;
    total_nodes: number;
    last_generated_at?: string;
  };
  conversation_summary?: {
    conversation_id?: string;
    title?: string;
    last_message_at?: string;
    message_count: number;
  };
  feature_flags?: Record<string, boolean>;
  message?: string;
}

export interface AssistantChatStreamReq {
  conversation_id?: string;
  course_id?: number;
  chapter_id?: number;
  target_student_id?: number;
  mode?: string;
  selected_agent?: string;
  skill_keys?: string[];
  selected_model?: string;
  thinking_mode?: string;
  message: string;
  attachment_ids?: string[];
  metadata?: Record<string, string>;
}

export interface AssistantChatTraceStep {
  agent: string;
  stage: string;
  status: string;
  summary?: string;
}

export interface AssistantChatResource {
  resource_id?: string;
  type: string;
  title: string;
  desc?: string;
  preview_url?: string;
}

export interface AssistantDigitalHumanDirective {
  emotion?: string;
  gesture?: string;
  speech_text?: string;
  highlight_text?: string;
  focus_resource_id?: string;
}

export interface AssistantChatStreamEvent {
  event: string;
  conversation_id?: string;
  message_id?: string;
  delta?: string;
  content_text?: string;
  finish_reason?: string;
  error_message?: string;
  created_at?: string;
  finished: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  resources?: AssistantChatResource[];
  trace?: AssistantChatTraceStep[];
  digital_human?: AssistantDigitalHumanDirective;
}

export interface AssistantConversationItem {
  conversation_id: string;
  title: string;
  summary?: string;
  last_message_at?: string;
  message_count: number;
  course_id?: number;
  target_student_id?: number;
}

export interface AssistantConversationGroup {
  course_id: number;
  course_name: string;
  conversations: AssistantConversationItem[];
}

export interface AssistantConversationGroupedResp {
  status: string;
  message?: string;
  list: AssistantConversationGroup[];
}

export interface AssistantConversationMessagesResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantConversationMessageItem[];
}

export interface AssistantConversationMessageItem {
  message_id: string;
  role: string;
  content_text?: string;
  created_at: string;
}

export interface AssistantProfileCurrentResp {
  status: string;
  message?: string;
  updated_at?: string;
  learner: {
    user_id: number;
    name: string;
    role: string;
    course?: string;
    enroll_days: number;
    study_minutes: number;
  };
  dimensions: {
    label: string;
    value: number;
    color?: string;
    evidence?: string[];
  }[];
  knowledge_map: {
    label: string;
    mastery: number;
  }[];
  tags: string[];
}

export interface AssistantProfileRefreshResp {
  accepted: boolean;
  status: string;
  message?: string;
}

export interface AssistantResourceTaskItem {
  task_id: string;
  status: string;
  stage?: string;
  progress: number;
  error_message?: string;
  course_id?: number;
  chapter_id?: number;
  target_student_id?: number;
  resource_types?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AssistantResourceTaskLogItem {
  stage: string;
  status: string;
  message: string;
  occurred_at: string;
}

export interface AssistantResourceSummary {
  resource_id: string;
  resource_type: string;
  title: string;
  summary?: string;
  status: string;
  preview_url?: string;
  download_url?: string;
  recommendation?: string;
}

export interface AssistantCreateResourceTaskResp {
  accepted: boolean;
  status: string;
  message?: string;
  task?: AssistantResourceTaskItem;
}

export interface AssistantListResourceTasksResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantResourceTaskItem[];
}

export interface AssistantListResourcesResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantResourceSummary[];
}

export interface AssistantListResourceTaskLogsResp {
  status: string;
  message?: string;
  list: AssistantResourceTaskLogItem[];
}

export interface AssistantPathRoadmap {
  course_meta: {
    name: string;
    subtitle?: string;
    total_phase: number;
    current_phase: number;
    estimated_hours: number;
  };
  roadmap: {
    title: string;
    status: string;
    summary?: string;
    nodes: {
      node_id: string;
      name: string;
      type: string;
      done: boolean;
      current: boolean;
      reason?: string;
      resource_id?: string;
    }[];
  }[];
}

export interface AssistantGetCurrentPathResp {
  status: string;
  message?: string;
  path: AssistantPathRoadmap;
}

export interface AssistantGeneratePathResp {
  generated: boolean;
  status: string;
  message?: string;
  path?: AssistantPathRoadmap;
}

export interface AssistantCompletePathNodeResp {
  completed: boolean;
  status: string;
  message?: string;
  node_id: string;
}

export interface AssistantAssessmentCurrentResp {
  status: string;
  message?: string;
  course_info: {
    name: string;
    subtitle?: string;
    total_chapters: number;
    finished_chapters: number;
  };
  stats: {
    label: string;
    value: string;
    sub?: string;
  }[];
  strengths: {
    title: string;
    desc: string;
  }[];
  weak_points: {
    level: string;
    title: string;
    desc: string;
  }[];
  timeline: {
    time: string;
    content: string;
    type: string;
  }[];
  suggestions: string[];
}

function buildAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (token?.accessToken) {
    headers.Authorization = formatToken(token.accessToken);
  }
  return headers;
}

function apiBaseURL() {
  return (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
}

function parseSSEStream(
  response: Response,
  onEvent: (data: AssistantChatStreamEvent) => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法获取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  const pump = () => {
    reader
      .read()
      .then(({ done, value }) => {
        if (done) {
          const rest = buffer.trim();
          if (rest.startsWith("data: ")) {
            emitSSELine(rest, onEvent);
          }
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        lines.forEach(line => emitSSELine(line, onEvent));
        pump();
      })
      .catch(error => {
        console.error("学习助手流读取失败:", error);
        onEvent({
          event: "error",
          error_message: "连接出错，请稍后重试",
          finished: true
        });
      });
  };

  pump();
}

function emitSSELine(
  line: string,
  onEvent: (data: AssistantChatStreamEvent) => void
) {
  if (!line.startsWith("data: ")) return;
  const json = line.slice(6).trim();
  if (!json || json === "[DONE]") return;

  try {
    onEvent(JSON.parse(json));
  } catch (error) {
    console.error("解析学习助手 SSE 消息失败:", error, line);
  }
}

export const getAssistantBootstrap = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantBootstrapResp>>(
    "get",
    "/edu/frontend/v1/assistant/bootstrap",
    { params }
  );

export const getAssistantConversationGroups = (params?: {
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantConversationGroupedResp>>(
    "get",
    "/edu/frontend/v1/assistant/conversations/grouped",
    { params }
  );

export const getAssistantConversationsByCourse = (params: {
  course_id: number;
  target_student_id?: number;
}) =>
  http.request<
    ApiResponse<{
      status: string;
      message?: string;
      total: number;
      list: AssistantConversationItem[];
    }>
  >("get", "/edu/frontend/v1/assistant/conversations/by-course", { params });

export const getAssistantConversationMessages = (conversationId: string) =>
  http.request<ApiResponse<AssistantConversationMessagesResp>>(
    "get",
    `/edu/frontend/v1/assistant/conversations/${encodeURIComponent(conversationId)}/messages`
  );

export function streamAssistantChat(
  params: AssistantChatStreamReq,
  onEvent: (data: AssistantChatStreamEvent) => void
): () => void {
  const controller = new AbortController();

  fetch(`${apiBaseURL()}/edu/frontend/v1/assistant/chat/stream`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(params),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          message = data?.error?.message || data?.msg || message;
        } catch {
          // ignore non-json errors
        }
        throw new Error(message);
      }
      parseSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("学习助手流式请求失败:", error);
      onEvent({
        event: "error",
        conversation_id: params.conversation_id,
        error_message: error.message || "学习助手响应失败",
        finished: true
      });
    });

  return () => controller.abort();
}

export const getAssistantProfileCurrent = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantProfileCurrentResp>>(
    "get",
    "/edu/frontend/v1/assistant/profile/current",
    { params }
  );

export const refreshAssistantProfile = (data: {
  course_id?: number;
  target_student_id?: number;
  trigger?: string;
}) =>
  http.request<ApiResponse<AssistantProfileRefreshResp>>(
    "post",
    "/edu/frontend/v1/assistant/profile/refresh",
    { data }
  );

export const createAssistantResourceTask = (data: {
  course_id?: number;
  chapter_id?: number;
  target_student_id?: number;
  resource_types?: string[];
  prompt?: string;
}) =>
  http.request<ApiResponse<AssistantCreateResourceTaskResp>>(
    "post",
    "/edu/frontend/v1/assistant/resources/tasks",
    { data }
  );

export const listAssistantResourceTasks = (params?: {
  course_id?: number;
  target_student_id?: number;
  status?: string;
}) =>
  http.request<ApiResponse<AssistantListResourceTasksResp>>(
    "get",
    "/edu/frontend/v1/assistant/resources/tasks",
    { params }
  );

export const listAssistantResourceTaskLogs = (taskId: string) =>
  http.request<ApiResponse<AssistantListResourceTaskLogsResp>>(
    "get",
    `/edu/frontend/v1/assistant/resources/tasks/${encodeURIComponent(taskId)}/logs`
  );

export const listAssistantResources = (params?: {
  course_id?: number;
  target_student_id?: number;
  resource_type?: string;
}) =>
  http.request<ApiResponse<AssistantListResourcesResp>>(
    "get",
    "/edu/frontend/v1/assistant/resources",
    { params }
  );

export const getAssistantResource = (resourceId: string) =>
  http.request<ApiResponse<{ status: string; message?: string; resource: AssistantResourceSummary }>>(
    "get",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}`
  );

export const getAssistantCurrentPath = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantGetCurrentPathResp>>(
    "get",
    "/edu/frontend/v1/assistant/path/current",
    { params }
  );

export const generateAssistantPath = (data: {
  course_id?: number;
  target_student_id?: number;
  goal?: string;
}) =>
  http.request<ApiResponse<AssistantGeneratePathResp>>(
    "post",
    "/edu/frontend/v1/assistant/path/generate",
    { data }
  );

export const completeAssistantPathNode = (
  nodeId: string,
  data: {
    course_id?: number;
    target_student_id?: number;
    completion_evidence?: string;
  }
) =>
  http.request<ApiResponse<AssistantCompletePathNodeResp>>(
    "post",
    `/edu/frontend/v1/assistant/path/nodes/${encodeURIComponent(nodeId)}/complete`,
    { data }
  );

export const replanAssistantPath = (data: {
  course_id?: number;
  target_student_id?: number;
  reason?: string;
}) =>
  http.request<ApiResponse<AssistantGeneratePathResp>>(
    "post",
    "/edu/frontend/v1/assistant/path/replan",
    { data }
  );

export const getAssistantAssessmentCurrent = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantAssessmentCurrentResp>>(
    "get",
    "/edu/frontend/v1/assistant/assessment/current",
    { params }
  );

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
  enable_realtime_resource?: boolean;
  preferred_explanation_mode?: string;
  current_path_node_id?: string;
  metadata?: Record<string, string>;
}

export interface AssistantChatTraceStep {
  agent: string;
  agent_key?: string;
  agent_label?: string;
  stage: string;
  status: string;
  summary?: string;
  started_at?: string;
  finished_at?: string;
  duration_ms?: number;
  degraded_reason?: string;
}

export interface AssistantChatResource {
  resource_id?: string;
  type: string;
  title: string;
  desc?: string;
  preview_url?: string;
}

export interface AssistantChatSourceRef {
  source_type: string;
  ref_id?: string;
  title: string;
  summary?: string;
  url?: string;
  confidence?: number;
}

export interface AssistantChatVideoSegment {
  segment_id: string;
  video_id?: string;
  title: string;
  summary?: string;
  start_ms: number;
  end_ms: number;
  reason?: string;
  source_status?: string;
}

export interface AssistantChatFollowup {
  text: string;
  intent?: string;
}

export interface AssistantChatResourceTask {
  task_id: string;
  status: string;
  stage?: string;
  summary?: string;
}

export interface AssistantDigitalHumanDirective {
  state?: string;
  status?: string;
  phase?: string;
  action?: string;
  mode?: string;
  emotion?: string;
  gesture?: string;
  speech_text?: string;
  highlight_text?: string;
  focus_resource_id?: string;
  speak?: boolean;
  expression_intensity?: number;
  gesture_duration_ms?: number;
  posture?: string;
  speech_rate?: number;
  priority?: number;
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
  profile_event?: AssistantProfileEvent;
  source_refs?: AssistantChatSourceRef[];
  video_segments?: AssistantChatVideoSegment[];
  followups?: AssistantChatFollowup[];
  resource_task?: AssistantChatResourceTask;
  conversation_title?: string;
  safety_status?: string;
  safety_summary?: string;
  safety_flags?: string[];
  sensitive_word_hits?: string[];
}

export interface AssistantConversationItem {
  conversation_id: string;
  title: string;
  summary?: string;
  last_message_at?: string;
  message_count: number;
  course_id?: number;
  target_student_id?: number;
  metadata?: Record<string, any>;
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

export interface AssistantCoursesResp {
  status: string;
  message?: string;
  selected_course_id?: number;
  target_student_id?: number;
  selected_student_id?: number;
  latest_conversation_id?: string;
  latest_conversation?: AssistantConversationItem;
  list?: (AssistantBootstrapCourse & {
    selected?: boolean;
    latest_conversation_id?: string;
  })[];
  courses?: AssistantBootstrapCourse[];
}

export interface AssistantCreateConversationResp {
  created?: boolean;
  status: string;
  message?: string;
  conversation?: AssistantConversationItem;
  conversation_id?: string;
  title?: string;
}

export interface AssistantConversationDetailResp {
  status: string;
  message?: string;
  conversation?: AssistantConversationItem;
  total?: number;
  messages?: AssistantConversationMessageItem[];
  list?: AssistantConversationMessageItem[];
}

export interface AssistantConversationMessageItem {
  message_id: string;
  role: string;
  content_text?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AssistantProfileCurrentResp {
  status: string;
  message?: string;
  updated_at?: string;
  schema_version?: string;
  profile_id?: string;
  profile_version?: number;
  confidence?: number;
  risk_flags?: string[];
  last_update_decision?: string;
  learner: AssistantProfileLearner;
  dimensions: AssistantProfileDimension[];
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
  decision?: "write_delta" | "merge_without_event" | "skip" | string;
  skip_reason?: string;
  profile_id?: string;
  profile_version?: number;
  updated_at?: string;
  event?: AssistantProfileEvent;
}

export interface AssistantProfileLearner {
  user_id: number;
  name: string;
  role: string;
  course?: string;
  enroll_days: number;
  study_minutes: number;
}

export interface AssistantProfileDimension {
  key?: string;
  label: string;
  value: number;
  score?: number;
  level?: string;
  description?: string;
  color?: string;
  evidence?: string[];
  evidence_refs?: string[];
  source_refs?: string[];
  trend?: string;
  updated_at?: string;
}

export interface AssistantProfileEvent {
  event_source: string;
  summary?: string;
  decision?: string;
  skip_reason?: string;
  confidence?: number;
  trigger_id?: string;
  delta_json?: string;
  changed_dimensions?: string[];
  evidence?: string[];
  source_refs?: string[];
}

export interface AssistantProfileHistoryItem {
  profile_id: string;
  profile_version: number;
  summary?: string;
  confidence?: number;
  updated_reason?: string;
  updated_at: string;
  dimensions?: AssistantProfileDimension[];
  risk_flags?: string[];
}

export interface AssistantProfileHistoryResp {
  status: string;
  items: AssistantProfileHistoryItem[];
}

export interface AssistantProfileEventsResp {
  status: string;
  items: AssistantProfileEvent[];
}

export interface AssistantProfileStudentItem {
  student_id: number;
  student_name: string;
  avatar?: string;
  progress?: number;
  study_minutes?: number;
  profile_status: string;
  profile_version?: number;
  summary?: string;
  confidence?: number;
  last_updated_at?: string;
  last_update_decision?: string;
  risk_flags?: string[];
}

export interface AssistantProfileStudentsResp {
  status: string;
  course_id: number;
  items: AssistantProfileStudentItem[];
}

export interface AssistantProfileCorrectionItem {
  correction_id: string;
  profile_id: string;
  target_student_id: number;
  dimension_key: string;
  before_json?: string;
  after_json?: string;
  reason?: string;
  operator_id: number;
  operator_role: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface AssistantProfileCorrectionsResp {
  status: string;
  items: AssistantProfileCorrectionItem[];
}

export interface AssistantProfileCorrectionCreateResp {
  accepted: boolean;
  status: string;
  message?: string;
  correction?: AssistantProfileCorrectionItem;
  profile_event?: AssistantProfileEvent;
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
  storage_status?: string;
  storage_error?: string;
  preview_url?: string;
  download_url?: string;
  recommendation?: string;
  object_key?: string;
  description?: string;
  knowledge_point_id?: string;
  knowledge_relevance?: number;
  review_status?: string;
  version_no?: number;
  updated_at?: string;
  content_format?: string;
  content_body?: string;
  html_animation_task_id?: string;
  html_animation_status?: string;
  html_animation_message?: string;
  html_animation_error?: string;
  asset_kind?: string;
  slide_count?: number;
  slides?: Record<string, any>[];
  pptx_status?: string;
  exercise_items?: Record<string, any>[];
  question_bank_status?: string;
  language?: string;
  starter_code?: string;
  test_cases?: Record<string, any>[];
  rubric?: Record<string, any> | string;
  runtime_status?: string;
  quality_score?: number;
  safety_status?: string;
  safety_flags?: string[];
  safety_summary?: string;
  citation_coverage?: number;
  citations?: AssistantResourceCitation[];
}

export interface AssistantResourceCitation {
  title?: string;
  url?: string;
  source?: string;
  snippet?: string;
  [key: string]: any;
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

export interface AssistantResourceMutationResp {
  status: string;
  message?: string;
  resource?: AssistantResourceSummary;
}

export interface AssistantResourceVersionItem {
  version_id: string;
  resource_id: string;
  version_no: number;
  title: string;
  summary?: string;
  description?: string;
  content_format?: string;
  content_body?: string;
  citations?: AssistantResourceCitation[];
  quality_score?: number;
  safety_status?: string;
  editor_id?: number;
  edit_reason?: string;
  created_at?: string;
}

export interface AssistantListResourceVersionsResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantResourceVersionItem[];
}

export type AssistantResourceUsageEventType =
  | "open"
  | "view"
  | "heartbeat"
  | "complete"
  | "feedback";

export interface AssistantResourceUsageMetrics {
  resource_id?: string;
  usage_count?: number;
  dwell_seconds?: number;
  completion_rate?: number;
  average_feedback?: number;
  last_event_at?: string;
  open_count?: number;
  view_count?: number;
  heartbeat_count?: number;
  complete_count?: number;
  feedback_count?: number;
  total_dwell_ms?: number;
  max_progress_percent?: number;
  completed?: boolean;
  average_feedback_score?: number;
  [key: string]: any;
}

export interface AssistantReportResourceUsageResp {
  accepted: boolean;
  status: string;
  message?: string;
  metrics?: AssistantResourceUsageMetrics;
}

export interface AssistantPathRoadmap {
  schema_version?: string;
  path_id?: string;
  path_version?: number;
  summary?: string;
  goal?: string;
  natural_plan?: string;
  apply_status?: string;
  updated_at?: string;
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
      knowledge_point_id?: string;
      resource_refs?: string[];
      video_segment_refs?: string[];
      completion_rule?: AssistantPathCompletionRule;
      estimated_minutes?: number;
      priority?: number;
      status?: string;
      status_reason?: string;
      started_at?: string;
      due_at?: string;
    }[];
  }[];
}

export interface AssistantPathCompletionRule {
  type?: string;
  required_resource_count?: number;
  quiz_score_min?: number;
  required_evidence?: string[];
}

export interface AssistantGetCurrentPathResp {
  status: string;
  message?: string;
  path?: AssistantPathRoadmap | null;
}

export interface AssistantGeneratePathResp {
  generated: boolean;
  accepted?: boolean;
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

export interface AssistantPathHistoryItem {
  path_id: string;
  path_version: number;
  status: string;
  apply_status: string;
  summary?: string;
  goal?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistantListPathHistoryResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantPathHistoryItem[];
}

export interface AssistantPathActionItem {
  action_id: string;
  action_type: string;
  path_id: string;
  status: string;
  reason?: string;
  created_at?: string;
  path?: AssistantPathRoadmap;
}

export interface AssistantListPathActionsResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantPathActionItem[];
}

export interface AssistantApplyPathActionResp {
  accepted: boolean;
  status: string;
  message?: string;
  path?: AssistantPathRoadmap;
}

export interface AssistantPathPushTaskItem {
  push_id: string;
  path_id?: string;
  node_id?: string;
  resource_id?: string;
  push_type: string;
  title: string;
  summary?: string;
  reason?: string;
  status: string;
  scheduled_at?: string;
  delivered_at?: string;
  created_at?: string;
}

export interface AssistantListPathPushTasksResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantPathPushTaskItem[];
}

export interface AssistantCompletePathPushTaskResp {
  accepted: boolean;
  status: string;
  message?: string;
  push_id: string;
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
  resource_usage?: AssistantAssessmentResourceUsage;
  feedback_summary?: AssistantAssessmentFeedbackSummary;
  evidence?: AssistantAssessmentEvidenceItem[];
  confidence?: number;
  recommended_actions?: AssistantAssessmentRecommendedAction[];
  need_replan?: boolean;
}

export interface AssistantAssessmentResourceUsage {
  usage_count?: number;
  dwell_seconds?: number;
  completion_rate?: number;
  feedback_count?: number;
  average_feedback?: number;
  last_event_at?: string;
  open_count?: number;
  view_count?: number;
  heartbeat_count?: number;
  complete_count?: number;
  total_dwell_ms?: number;
  dwell_ms?: number;
  average_progress_percent?: number;
  resource_feedback_count?: number;
  average_resource_score?: number;
  average_feedback_score?: number;
  [key: string]: any;
}

export interface AssistantAssessmentFeedbackSummary {
  feedback_count?: number;
  average_rating?: number;
  last_feedback_at?: string;
  latest_comment?: string;
  count?: number;
  average_score?: number;
  avg_score?: number;
  latest_feedback_at?: string;
  latest_at?: string;
  latest_feedback?: string;
  latest_content?: string;
  [key: string]: any;
}

export interface AssistantAssessmentRefreshResp {
  accepted: boolean;
  status: string;
  message?: string;
  job_id?: string;
  assessment_id?: string;
  need_replan?: boolean;
  recommended_actions?: AssistantAssessmentRecommendedAction[];
}

export interface AssistantAssessmentFeedbackResp {
  accepted: boolean;
  status: string;
  message?: string;
  feedback_id?: string;
  job_id?: string;
  feedback_summary?: AssistantAssessmentFeedbackSummary;
}

export interface AssistantAssessmentEvidenceItem {
  source: string;
  summary: string;
  confidence?: number;
}

export interface AssistantAssessmentRecommendedAction {
  action: string;
  reason: string;
  priority?: string;
  target_type?: string;
  target_id?: string;
  auto_triggered?: boolean;
}

export interface AssistantAssessmentHistoryItem {
  assessment_id: string;
  assessment_version: number;
  overall_level: string;
  predicted_score: number;
  summary?: string;
  need_replan: boolean;
  confidence?: number;
  auto_action_status?: string;
  source_job_id?: string;
  evidence?: AssistantAssessmentEvidenceItem[];
  recommended_actions?: AssistantAssessmentRecommendedAction[];
  created_at?: string;
  updated_at?: string;
}

export interface AssistantAssessmentHistoryResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantAssessmentHistoryItem[];
}

export interface AssistantAssessmentActionItem {
  action_id: string;
  assessment_id: string;
  action: string;
  reason: string;
  priority?: string;
  target_type?: string;
  target_id?: string;
  status: string;
  auto_triggered?: boolean;
  created_at?: string;
}

export interface AssistantAssessmentActionsResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantAssessmentActionItem[];
}

export interface AssistantApplyAssessmentActionResp {
  accepted: boolean;
  status: string;
  message?: string;
  action_id: string;
  action: string;
  path?: AssistantPathRoadmap;
  resource_task?: AssistantResourceTaskItem;
  push_task?: AssistantPathPushTaskItem;
}

export interface AssistantAssessmentJobItem {
  job_id: string;
  job_type: string;
  status: string;
  trigger_source?: string;
  trigger_id?: string;
  priority: number;
  attempt_count: number;
  max_attempts: number;
  assessment_id?: string;
  error_message?: string;
  scheduled_at?: string;
  started_at?: string;
  finished_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistantAssessmentJobsResp {
  status: string;
  message?: string;
  total: number;
  list: AssistantAssessmentJobItem[];
}

export interface AssistantDashboardCountItem {
  key: string;
  label?: string;
  count: number;
}

export interface AssistantDashboardStudentsSummary {
  total_students: number;
  profile_ready_count: number;
  high_risk_count: number;
  need_replan_count: number;
  average_progress: number;
}

export interface AssistantDashboardStudentItem {
  student_id: number;
  student_name: string;
  avatar?: string;
  progress?: number;
  study_minutes?: number;
  profile_status: string;
  last_updated_at?: string;
  summary?: string;
  dimension_scores?: AssistantProfileDimension[];
  risk_flags?: string[];
  latest_event?: string;
  need_teacher_attention: boolean;
  predicted_score?: number;
  need_replan?: boolean;
}

export interface AssistantDashboardStudentsResp {
  status: string;
  message?: string;
  course_id: number;
  total: number;
  summary: AssistantDashboardStudentsSummary;
  list: AssistantDashboardStudentItem[];
}

export interface AssistantDashboardResourcesResp {
  status: string;
  message?: string;
  course_id: number;
  summary: {
    total_resources: number;
    pending_review_count: number;
    blocked_count: number;
    degraded_count: number;
    average_quality: number;
  };
  type_distribution: AssistantDashboardCountItem[];
  status_distribution: AssistantDashboardCountItem[];
  review_distribution: AssistantDashboardCountItem[];
  recent_tasks: AssistantResourceTaskItem[];
}

export interface AssistantDashboardRisksResp {
  status: string;
  message?: string;
  course_id: number;
  summary: {
    high_risk_students: number;
    low_completion_students: number;
    need_replan_students: number;
    negative_feedback_students: number;
  };
  risk_flags: AssistantDashboardCountItem[];
  attention_students: AssistantDashboardStudentItem[];
}

export interface AssistantDashboardPathsResp {
  status: string;
  message?: string;
  course_id: number;
  summary: {
    active_path_students: number;
    average_completion_rate: number;
    overdue_node_count: number;
    need_replan_count: number;
  };
  list: {
    student_id: number;
    student_name?: string;
    path_id: string;
    path_version: number;
    status: string;
    apply_status?: string;
    summary?: string;
    completion_rate: number;
    completed_nodes: number;
    total_nodes: number;
    overdue_nodes: number;
    updated_at?: string;
  }[];
}

export interface AssistantTaskTraceResp {
  status: string;
  message?: string;
  task: AssistantResourceTaskItem;
  trace: AssistantChatTraceStep[];
  logs: AssistantResourceTaskLogItem[];
}

export interface AssistantConversationTraceResp {
  status: string;
  message?: string;
  conversation_id: string;
  title?: string;
  trace: AssistantChatTraceStep[];
  safety?: {
    status?: string;
    summary?: string;
    flags?: string[];
  };
  source_refs?: Record<string, string>[];
  resource_links?: {
    resource_id: string;
    link_source: string;
    reason?: string;
    created_at?: string;
  }[];
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

export const getAssistantCourses = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantCoursesResp>>(
    "get",
    "/edu/frontend/v1/assistant/courses",
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

export const createAssistantConversation = (data: {
  course_id: number;
  chapter_id?: number;
  target_student_id?: number;
  title?: string;
  metadata?: Record<string, string>;
}) =>
  http.request<ApiResponse<AssistantCreateConversationResp>>(
    "post",
    "/edu/frontend/v1/assistant/conversations",
    { data }
  );

export const getAssistantConversation = (conversationId: string) =>
  http.request<ApiResponse<AssistantConversationDetailResp>>(
    "get",
    `/edu/frontend/v1/assistant/conversations/${encodeURIComponent(conversationId)}`
  );

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
  message?: string;
}) =>
  http.request<ApiResponse<AssistantProfileRefreshResp>>(
    "post",
    "/edu/frontend/v1/assistant/profile/refresh",
    { data }
  );

export const listAssistantProfileHistory = (params?: {
  course_id?: number;
  target_student_id?: number;
  limit?: number;
}) =>
  http.request<ApiResponse<AssistantProfileHistoryResp>>(
    "get",
    "/edu/frontend/v1/assistant/profile/history",
    { params }
  );

export const listAssistantProfileEvents = (params?: {
  course_id?: number;
  target_student_id?: number;
  limit?: number;
}) =>
  http.request<ApiResponse<AssistantProfileEventsResp>>(
    "get",
    "/edu/frontend/v1/assistant/profile/events",
    { params }
  );

export const listAssistantProfileStudents = (params?: {
  course_id?: number;
  limit?: number;
}) =>
  http.request<ApiResponse<AssistantProfileStudentsResp>>(
    "get",
    "/edu/frontend/v1/assistant/profile/students",
    { params }
  );

export const listAssistantProfileCorrections = (params?: {
  course_id?: number;
  target_student_id?: number;
  limit?: number;
}) =>
  http.request<ApiResponse<AssistantProfileCorrectionsResp>>(
    "get",
    "/edu/frontend/v1/assistant/profile/corrections",
    { params }
  );

export const createAssistantProfileCorrection = (data: {
  course_id?: number;
  target_student_id: number;
  dimension_key: string;
  after_json: string;
  reason?: string;
}) =>
  http.request<ApiResponse<AssistantProfileCorrectionCreateResp>>(
    "post",
    "/edu/frontend/v1/assistant/profile/corrections",
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

export const getAssistantResourceTask = (taskId: string) =>
  http.request<
    ApiResponse<{
      status: string;
      message?: string;
      task: AssistantResourceTaskItem;
    }>
  >(
    "get",
    `/edu/frontend/v1/assistant/resources/tasks/${encodeURIComponent(taskId)}`
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

export const updateAssistantResource = (
  resourceId: string,
  data: {
    title?: string;
    summary?: string;
    description?: string;
    content_format?: string;
    content_body?: string;
    knowledge_point_id?: string;
    knowledge_relevance?: number;
    citations?: AssistantResourceCitation[];
    edit_reason?: string;
  }
) =>
  http.request<ApiResponse<AssistantResourceMutationResp>>(
    "patch",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}`,
    { data }
  );

export const reviewAssistantResource = (
  resourceId: string,
  data: {
    review_status: "pending" | "approved" | "rejected" | "changes_requested" | string;
    review_comment?: string;
  }
) =>
  http.request<ApiResponse<AssistantResourceMutationResp>>(
    "post",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}/review`,
    { data }
  );

export const publishAssistantResource = (resourceId: string) =>
  http.request<ApiResponse<AssistantResourceMutationResp>>(
    "post",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}/publish`
  );

export const deleteAssistantResource = (resourceId: string) =>
  http.request<ApiResponse<AssistantResourceMutationResp>>(
    "delete",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}`
  );

export const listAssistantResourceVersions = (resourceId: string) =>
  http.request<ApiResponse<AssistantListResourceVersionsResp>>(
    "get",
    `/edu/frontend/v1/assistant/resources/${encodeURIComponent(resourceId)}/versions`
  );

export const reportAssistantResourceUsage = (data: {
  resource_id: string;
  course_id?: number;
  target_student_id?: number;
  event_type: AssistantResourceUsageEventType;
  dwell_ms?: number;
  progress_percent?: number;
  completed?: boolean;
  feedback_score?: number;
  feedback_text?: string;
  metadata?: Record<string, any>;
}) =>
  http.request<ApiResponse<AssistantReportResourceUsageResp>>(
    "post",
    "/edu/frontend/v1/assistant/resources/usage/events",
    { data }
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
  apply_immediately?: boolean;
}) =>
  http.request<ApiResponse<AssistantGeneratePathResp>>(
    "post",
    "/edu/frontend/v1/assistant/path/replan",
    { data }
  );

export const listAssistantPathHistory = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantListPathHistoryResp>>(
    "get",
    "/edu/frontend/v1/assistant/path/history",
    { params }
  );

export const listAssistantPathActions = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantListPathActionsResp>>(
    "get",
    "/edu/frontend/v1/assistant/path/actions",
    { params }
  );

export const applyAssistantPathAction = (actionId: string) =>
  http.request<ApiResponse<AssistantApplyPathActionResp>>(
    "post",
    `/edu/frontend/v1/assistant/path/actions/${encodeURIComponent(actionId)}/apply`
  );

export const listAssistantPathPushTasks = (params?: {
  course_id?: number;
  target_student_id?: number;
  status?: string;
}) =>
  http.request<ApiResponse<AssistantListPathPushTasksResp>>(
    "get",
    "/edu/frontend/v1/assistant/path/push-tasks",
    { params }
  );

export const completeAssistantPathPushTask = (pushId: string) =>
  http.request<ApiResponse<AssistantCompletePathPushTaskResp>>(
    "post",
    `/edu/frontend/v1/assistant/path/push-tasks/${encodeURIComponent(pushId)}/complete`
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

export const refreshAssistantAssessment = (data: {
  course_id?: number;
  target_student_id?: number;
  trigger?: string;
  reason?: string;
  mode?: "sync" | "async" | string;
}) =>
  http.request<ApiResponse<AssistantAssessmentRefreshResp>>(
    "post",
    "/edu/frontend/v1/assistant/assessment/refresh",
    { data: { ...data, reason: data.reason || data.trigger } }
  );

export const submitAssistantAssessmentFeedback = (data: {
  course_id?: number;
  target_student_id?: number;
  assessment_id?: string;
  target_type?: string;
  target_id?: string;
  score?: number;
  feedback_text?: string;
  rating?: number;
  content?: string;
  metadata?: Record<string, string>;
}) =>
  http.request<ApiResponse<AssistantAssessmentFeedbackResp>>(
    "post",
    "/edu/frontend/v1/assistant/assessment/feedback",
    {
      data: {
        ...data,
        rating: data.rating ?? data.score,
        content: data.content ?? data.feedback_text
      }
    }
  );

export const listAssistantAssessmentHistory = (params?: {
  course_id?: number;
  target_student_id?: number;
}) =>
  http.request<ApiResponse<AssistantAssessmentHistoryResp>>(
    "get",
    "/edu/frontend/v1/assistant/assessment/history",
    { params }
  );

export const listAssistantAssessmentActions = (params?: {
  course_id?: number;
  target_student_id?: number;
  status?: string;
}) =>
  http.request<ApiResponse<AssistantAssessmentActionsResp>>(
    "get",
    "/edu/frontend/v1/assistant/assessment/actions",
    { params }
  );

export const applyAssistantAssessmentAction = (actionId: string) =>
  http.request<ApiResponse<AssistantApplyAssessmentActionResp>>(
    "post",
    `/edu/frontend/v1/assistant/assessment/actions/${encodeURIComponent(actionId)}/apply`
  );

export const listAssistantAssessmentJobs = (params?: {
  course_id?: number;
  target_student_id?: number;
  status?: string;
}) =>
  http.request<ApiResponse<AssistantAssessmentJobsResp>>(
    "get",
    "/edu/frontend/v1/assistant/assessment/jobs",
    { params }
  );

export const getAssistantDashboardStudents = (params?: {
  course_id?: number;
  keyword?: string;
  risk_level?: string;
  profile_updated_after?: string;
  page?: number;
  page_size?: number;
}) =>
  http.request<ApiResponse<AssistantDashboardStudentsResp>>(
    "get",
    "/edu/frontend/v1/assistant/dashboard/students",
    { params }
  );

export const getAssistantDashboardResources = (params?: { course_id?: number }) =>
  http.request<ApiResponse<AssistantDashboardResourcesResp>>(
    "get",
    "/edu/frontend/v1/assistant/dashboard/resources",
    { params }
  );

export const getAssistantDashboardRisks = (params?: { course_id?: number }) =>
  http.request<ApiResponse<AssistantDashboardRisksResp>>(
    "get",
    "/edu/frontend/v1/assistant/dashboard/risks",
    { params }
  );

export const getAssistantDashboardPaths = (params?: { course_id?: number }) =>
  http.request<ApiResponse<AssistantDashboardPathsResp>>(
    "get",
    "/edu/frontend/v1/assistant/dashboard/paths",
    { params }
  );

export const getAssistantTaskTrace = (taskId: string) =>
  http.request<ApiResponse<AssistantTaskTraceResp>>(
    "get",
    `/edu/frontend/v1/assistant/tasks/${encodeURIComponent(taskId)}/trace`
  );

export const getAssistantConversationTrace = (conversationId: string) =>
  http.request<ApiResponse<AssistantConversationTraceResp>>(
    "get",
    `/edu/frontend/v1/assistant/conversations/${encodeURIComponent(conversationId)}/trace`
  );

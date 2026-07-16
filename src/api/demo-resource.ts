import { http } from "@/utils/http";
import type { ApiResponse } from "@/api/frontend/types";

export type DemoResourceOperation = "create" | "append" | "update";
export type DemoResourceParser =
  | "manifest_v1"
  | "directory_template_v1"
  | "manual_mapping"
  | "auto_detect_preview";

export type DemoResourceAttemptStatus =
  | "queued"
  | "running"
  | "retrying"
  | "succeeded"
  | "failed"
  | "cancelled";

export type DemoResourceAttemptStage =
  | "queued"
  | "downloading"
  | "extracting"
  | "parsing"
  | "materializing"
  | "persisting"
  | "completed"
  | "failed";

export interface DemoResourceImport {
  import_id: string;
  operation: DemoResourceOperation;
  archive_object_key?: string;
  archive_sha256?: string;
  archive_size?: number;
  import_status?: string;
  selected_attempt_id?: string;
  version?: number;
  [key: string]: any;
}

export interface DemoResourceUploadAccess {
  object_key: string;
  tmp_secret_id: string;
  tmp_secret_key: string;
  session_token: string;
  start_time: number;
  expired_time: number;
  region: string;
  bucket: string;
  upload_host: string;
  upload_url: string;
  [key: string]: any;
}

export interface DemoResourceParseAttempt {
  attempt_id: string;
  attempt_no: number;
  parser_type: DemoResourceParser | string;
  attempt_status: DemoResourceAttemptStatus | string;
  stage: DemoResourceAttemptStage | string;
  progress: number;
  processed_files: number;
  total_files: number;
  processed_bytes: number;
  total_bytes: number;
  retry_count: number;
  max_attempts: number;
  terminal: boolean;
  error_code: string;
  error_message: string;
  started_at: string;
  updated_at: string;
  completed_at: string;
  canonical_hash: string;
  summary_json: string;
  report_json: string;
}

export interface DemoResourceAppliedCatalogCourse {
  catalog_course_id: string;
  external_key: string;
  title: string;
  action?: "created" | "updated" | "reused" | string;
}

export interface DemoResourceApplyResult {
  catalog_courses: DemoResourceAppliedCatalogCourse[];
}

export type DemoResourceDiffResolution =
  | "replace_draft"
  | "keep_existing"
  | "create_new";

export interface DemoResourceDiffItem {
  diff_item_id: string;
  entity_kind?: string;
  external_key?: string;
  action?: string;
  existing_id?: string;
  reason_code?: string;
  before_json?: string;
  after_json?: string;
  resolution?: string;
}

export interface DemoResourceBindingDraft {
  binding_revision_id: string;
  course_binding_id?: string;
  revision_no?: number;
  catalog_hash?: string;
  curriculum_hash?: string;
  binding_version?: number;
  suggestions?: Array<{
    source_node_id: string;
    target_type: "course" | "chapter" | "hour" | string;
    target_id: number;
    score?: number;
    status?: string;
  }>;
  [key: string]: any;
}

export type DemoResourceBindingBatchItemStatus =
  | "pending"
  | "processing"
  | "active"
  | "needs_review"
  | "failed";

export interface DemoResourceBindingBatchItem {
  batch_item_id: string;
  catalog_course_id: string;
  course_id: number;
  status: DemoResourceBindingBatchItemStatus | string;
  course_binding_id: string;
  binding_revision_id: string;
  binding_version: number;
  item_version?: number;
  warning_code: string;
  review_summary?: DemoResourceBindingReviewSummary;
  error_code: string;
  error_message: string;
}

export interface DemoResourceBindingReviewSummary {
  status:
    | "needs_review"
    | "rebase_required"
    | "ready_to_activate"
    | "active"
    | string;
  unmapped_resources: number;
  invalid_recipients: number;
  catalog_changed: boolean;
  curriculum_changed: boolean;
  binding_version_changed: boolean;
  reason_codes: string[];
  next_action:
    | "edit_mappings"
    | "cleanup_invalid_recipients"
    | "rebase"
    | "activate"
    | "";
  can_activate: boolean;
}

export interface DemoResourceBindingReviewContext {
  status: string;
  message: string;
  draft: {
    binding_revision_id: string;
    course_binding_id: string;
    binding_version: number;
    edit_version: number;
    revision_no: number;
    catalog_hash: string;
    curriculum_hash: string;
  };
  course: { course_id: number; title: string };
  batch_item: { batch_id: string; batch_item_id: string; item_version: number };
  preview: DemoResourceBindingPreview;
  review_summary: DemoResourceBindingReviewSummary;
  actions: {
    can_edit: boolean;
    can_cleanup_invalid_recipients: boolean;
    can_rebase: boolean;
    can_activate: boolean;
  };
  source_nodes: Array<{
    source_node_id: string;
    title: string;
    number_path: string;
    resource_count: number;
    resolution_status: string;
    mappings: Array<{
      target_type: "course" | "chapter" | "hour";
      target_id: number;
      target_label: string;
      method: string;
      status: string;
      score: number;
    }>;
    suggestions: Array<{
      target_type: "course" | "chapter" | "hour";
      target_id: number;
      target_label: string;
      score: number;
    }>;
  }>;
  target_nodes: Array<{
    target_type: "course" | "chapter" | "hour";
    target_id: number;
    label: string;
    path: string;
  }>;
  invalid_recipient_total: number;
  invalid_recipients: Array<{
    student_id: number;
    student_name: string;
    resource_title: string;
    variant_code: string;
    reason: string;
  }>;
}

export interface DemoResourceBindingBatch {
  status: "processing" | "completed" | string;
  message: string;
  batch_id: string;
  item_count: number;
  success_count: number;
  review_count: number;
  failure_count: number;
  items: DemoResourceBindingBatchItem[];
}

export interface DemoResourcePublishableVariant {
  code: string;
  label: string;
  content_format: string;
  asset_kind: string;
  ready_to_publish: boolean;
  published: boolean;
  publication_id: string;
  audience_mode: "selected" | "all_enrolled" | string;
  assignable: boolean;
}

export interface DemoResourcePublishableResource {
  course_binding_id: string;
  binding_revision_id: string;
  catalog_course_id: string;
  catalog_course_title: string;
  resource_set_id: string;
  revision_id: string;
  revision_no: number;
  title: string;
  resource_type: string;
  scope_level: string;
  source_node_id: string;
  source_node_title: string;
  source_number_path: string;
  revision_status: string;
  latest_review_decision: string;
  variants: DemoResourcePublishableVariant[];
}

export interface DemoResourcePublishableResourcesResponse {
  status: "ready" | string;
  message: string;
  course: { course_id: number; title: string };
  total: number;
  items: DemoResourcePublishableResource[];
}

export interface DemoResourceItemResult {
  item_index: number;
  status: "succeeded" | "failed" | string;
  resource_set_id: string;
  student_id: number;
  publication_ids: string[];
  error_code: string;
  error_message: string;
}

export interface DemoResourceAssignmentVariant {
  code: string;
  label: string;
  audience_mode: "selected" | "all_enrolled" | string;
  assignable: boolean;
}

export interface DemoResourceAssignmentResource {
  course_binding_id: string;
  resource_set_id: string;
  title: string;
  variants: DemoResourceAssignmentVariant[];
}

export interface DemoResourceAssignmentStudent {
  student_id: number;
  student_name: string;
  avatar: string;
  assignments: Array<{
    resource_set_id: string;
    visible_variant_codes: string[];
  }>;
}

export interface DemoResourceCourseAssignmentsResponse {
  status: "ready" | string;
  message: string;
  course: { course_id: number; title: string };
  assignment_version: number;
  resource_total: number;
  resources: DemoResourceAssignmentResource[];
  student_total: number;
  students: DemoResourceAssignmentStudent[];
}

export interface DemoResourceBindingPreview {
  added_visible_resources?: number;
  removed_visible_resources?: number;
  affected_students?: number;
  invalid_recipients?: number;
  unmapped_resources?: number;
  review_required?: number;
  catalog_changed?: boolean;
  curriculum_changed?: boolean;
  [key: string]: any;
}

export interface DemoResourcePublicationResponse {
  publication_ids?: string[];
  results?: DemoResourceItemResult[];
  [key: string]: any;
}

export interface DemoResourceAssignmentResponse {
  assignment_version?: number;
  recipient_count?: number;
  results?: DemoResourceItemResult[];
  [key: string]: any;
}

type DemoResponse<T> = ApiResponse<T & { status?: string; message?: string }>;

export const createDemoResourceImport = (data: {
  operation: DemoResourceOperation;
  target_catalog_course_id?: string;
}) =>
  http.request<DemoResponse<DemoResourceImport>>(
    "post",
    "/edu/backend/v1/demo-resources/imports",
    { data }
  );

export const getDemoResourceUploadAccess = (importId: string) =>
  http.request<DemoResponse<DemoResourceUploadAccess>>(
    "post",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/upload-access`
  );

export const completeDemoResourceImport = (
  importId: string,
  data: { sha256: string; size: number }
) =>
  http.request<DemoResponse<DemoResourceImport>>(
    "post",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/complete`,
    { data }
  );

export const parseDemoResourceImport = (
  importId: string,
  data: { parser_type: DemoResourceParser; parser_config_json?: string }
) =>
  http.request<DemoResponse<{ attempt_id: string; [key: string]: any }>>(
    "post",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/parse`,
    { data }
  );

export const listDemoResourceParseAttempts = (importId: string) =>
  http.request<DemoResponse<{ items: DemoResourceParseAttempt[] }>>(
    "get",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/parse-attempts`
  );

export const getDemoResourceParseAttempt = (
  importId: string,
  attemptId: string
) =>
  http.request<DemoResponse<{ item: DemoResourceParseAttempt }>>(
    "get",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/parse-attempts/${encodeURIComponent(attemptId)}`
  );

export const selectDemoResourceParseAttempt = (
  importId: string,
  attemptId: string
) =>
  http.request<DemoResponse<Record<string, never>>>(
    "post",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/parse-attempts/${encodeURIComponent(attemptId)}/select`,
    { data: {} }
  );

export const listDemoResourceDiffs = (importId: string) =>
  http.request<DemoResponse<{ items: DemoResourceDiffItem[] }>>(
    "get",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/diffs`
  );

export const resolveDemoResourceDiffs = (
  importId: string,
  data: {
    items: Array<{
      diff_item_id: string;
      resolution: DemoResourceDiffResolution;
    }>;
  }
) =>
  http.request<DemoResponse<{ items?: DemoResourceDiffItem[] }>>(
    "put",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/diffs`,
    { data }
  );

export const applyDemoResourceImport = (
  importId: string,
  data: { idempotency_key: string }
) =>
  http.request<DemoResponse<DemoResourceApplyResult>>(
    "post",
    `/edu/backend/v1/demo-resources/imports/${encodeURIComponent(importId)}/apply`,
    { data }
  );

export const createDemoResourceBindingDraft = (
  courseId: number,
  data: { catalog_course_id: string; mode: "blank" | "auto" }
) =>
  http.request<DemoResponse<DemoResourceBindingDraft>>(
    "post",
    `/edu/backend/v1/demo-resources/courses/${courseId}/binding-drafts`,
    { data }
  );

export const createDemoResourceBindingBatch = (data: {
  idempotency_key: string;
  items: Array<{
    catalog_course_id: string;
    course_id: number;
    mode: "auto";
  }>;
}) =>
  http.request<DemoResponse<DemoResourceBindingBatch>>(
    "post",
    "/edu/backend/v1/demo-resources/binding-batches",
    { data }
  );

export const getDemoResourceBindingBatch = (batchId: string) =>
  http.request<DemoResponse<DemoResourceBindingBatch>>(
    "get",
    `/edu/backend/v1/demo-resources/binding-batches/${encodeURIComponent(batchId)}`
  );

export const getDemoResourceBindingReviewContext = (draftId: string) =>
  http.request<DemoResponse<DemoResourceBindingReviewContext>>(
    "get",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/review-context`,
    {
      params: {
        source_page: 1,
        source_page_size: 100,
        resolution_status: "all"
      }
    }
  );

export const patchDemoResourceBindingMappings = (
  draftId: string,
  data: {
    idempotency_key: string;
    expected_edit_version: number;
    changes: Array<{
      source_node_id: string;
      operation: "replace" | "clear";
      mappings: Array<{
        source_node_id: string;
        target_type: "course" | "chapter" | "hour";
        target_id: number;
        method: "manual";
        status: "confirmed";
        score: number;
      }>;
    }>;
  }
) =>
  http.request<
    DemoResponse<{
      edit_version: number;
      item_version: number;
      review_summary: DemoResourceBindingReviewSummary;
    }>
  >(
    "patch",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/mappings`,
    { data }
  );

export const rebaseDemoResourceBindingBatchItem = (
  batchId: string,
  itemId: string,
  data: { idempotency_key: string; expected_item_version: number }
) =>
  http.request<DemoResponse<DemoResourceBindingBatch>>(
    "post",
    `/edu/backend/v1/demo-resources/binding-batches/${encodeURIComponent(batchId)}/items/${encodeURIComponent(itemId)}/rebase`,
    { data }
  );

export const replaceDemoResourceBindingMappings = (
  draftId: string,
  data: {
    mappings: Array<{
      source_node_id: string;
      target_type: "course" | "chapter" | "hour";
      target_id: number;
      method?: "auto" | "manual";
      status?: "suggested" | "confirmed" | "rejected";
      score?: number;
    }>;
  }
) =>
  http.request<DemoResponse<Record<string, never>>>(
    "put",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/mappings`,
    { data }
  );

export const previewDemoResourceBinding = (draftId: string) =>
  http.request<DemoResponse<DemoResourceBindingPreview>>(
    "get",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/preview`
  );

export const activateDemoResourceBinding = (
  draftId: string,
  data: {
    expected_binding_version: number;
    expected_edit_version?: number;
    expected_batch_item_version?: number;
    expected_catalog_hash: string;
    expected_curriculum_hash: string;
  }
) =>
  http.request<DemoResponse<Record<string, never>>>(
    "post",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/activate`,
    { data }
  );

export const cleanupDemoResourceInvalidRecipients = (
  courseId: number,
  data: {
    idempotency_key: string;
    expected_assignment_version: number;
    mode: "all_invalid";
  }
) =>
  http.request<DemoResponse<Record<string, unknown>>>(
    "post",
    `/edu/backend/v1/demo-resources/courses/${courseId}/invalid-recipients/cleanup`,
    { data }
  );

export const publishDemoResourceRevisions = (
  courseId: number,
  data: {
    idempotency_key: string;
    failure_mode?: "atomic" | "continue";
    items: Array<{
      revision_id: string;
      variant_codes: string[];
      decision: "approved" | "rejected" | "changes_requested";
      comment?: string;
      audience_mode: "selected" | "all_enrolled";
    }>;
  }
) =>
  http.request<DemoResponse<DemoResourcePublicationResponse>>(
    "post",
    `/edu/backend/v1/demo-resources/courses/${courseId}/publications/batch`,
    { data }
  );

export const listDemoResourcePublishableResources = (
  courseId: number,
  params?: {
    page?: number;
    page_size?: number;
    keyword?: string;
    resource_type?: string;
    revision_status?: string;
  }
) =>
  http.request<DemoResponse<DemoResourcePublishableResourcesResponse>>(
    "get",
    `/edu/backend/v1/demo-resources/courses/${courseId}/publishable-resources`,
    { params }
  );

export const getDemoResourceAssignments = (
  courseId: number,
  params?: { page?: number; page_size?: number; keyword?: string }
) =>
  http.request<DemoResponse<DemoResourceCourseAssignmentsResponse>>(
    "get",
    `/edu/backend/v1/demo-resources/courses/${courseId}/assignments`,
    { params }
  );

export const withdrawDemoResourcePublications = (
  courseId: number,
  data: { idempotency_key: string; publication_ids: string[] }
) =>
  http.request<DemoResponse<Record<string, never>>>(
    "post",
    `/edu/backend/v1/demo-resources/courses/${courseId}/withdrawals/batch`,
    { data }
  );

export const replaceDemoResourceAssignments = (
  courseId: number,
  data: {
    idempotency_key: string;
    failure_mode?: "atomic" | "continue";
    expected_assignment_version: number;
    entries: Array<{
      resource_set_id: string;
      student_ids: number[];
      visible_variant_codes: string[];
    }>;
  }
) =>
  http.request<DemoResponse<DemoResourceAssignmentResponse>>(
    "put",
    `/edu/backend/v1/demo-resources/courses/${courseId}/assignments/batch`,
    { data }
  );

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
  [key: string]: any;
}

export interface DemoResourceAssignmentResponse {
  assignment_version?: number;
  recipient_count?: number;
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
    expected_catalog_hash: string;
    expected_curriculum_hash: string;
  }
) =>
  http.request<DemoResponse<Record<string, never>>>(
    "post",
    `/edu/backend/v1/demo-resources/binding-drafts/${encodeURIComponent(draftId)}/activate`,
    { data }
  );

export const publishDemoResourceRevisions = (
  courseId: number,
  data: {
    idempotency_key: string;
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

const directTextMap: Record<string, string> = {
  active: "进行中",
  applied: "已应用",
  approved: "已通过",
  auto: "自动",
  blocked: "已阻断",
  changes_requested: "需修改",
  completed: "已完成",
  current: "当前",
  danger: "高风险",
  draft: "草稿",
  failed: "失败",
  generated: "已生成",
  high: "高",
  low: "低",
  manual: "手动",
  medium: "中",
  merge_without_event: "合并更新",
  normal: "普通",
  pending: "待处理",
  pending_apply: "待确认",
  processing: "处理中",
  queued: "排队中",
  ready: "就绪",
  rejected: "已驳回",
  running: "运行中",
  safe: "安全",
  skip: "已跳过",
  stable: "稳定",
  warning: "需关注",
  write_delta: "已写入变化",
  learner: "学生",
  student: "学生",
  teacher: "教师",
  admin: "管理员",
  profile_memory_agent: "画像记忆",
  path_planner_agent: "路径规划",
  assessment_agent: "学习评估",
  resource_director_agent: "资源调度",
  assessment_feedback: "评估反馈",
  resource_usage: "资源使用",
  path_node: "路径节点",
  quiz: "测验",
  homework: "作业",
  exam: "考试",
  resource: "资源",
  resource_and_evidence: "资源与证据",
  video: "视频",
  exercise: "练习",
  chapter: "章节",
  knowledge_point: "知识点",
  replan_path: "重新规划路径",
  generate_remediation_resources: "生成补救资源",
  apply_replan_preview: "应用重规划预览",
  path_replan_suggestion: "路径重规划建议",
  resource_recommendation: "资源推荐",
  generate_resource: "生成资源",
  remediation_resource: "补救资源",
  open_resource: "打开资源",
  complete_node: "完成节点",
  review_required: "需要复盘",
  weak_knowledge: "薄弱知识点",
  missing_practice: "练习不足",
  slow_progress: "进度偏慢",
  low_confidence: "置信度偏低",
  strong: "优势明显",
  improving: "持续提升",
  declining: "有所回落",
  mastery: "掌握度",
  engagement: "投入度",
  practice: "练习表现",
  persistence: "学习稳定性",
  self_regulation: "自主学习",
  overall: "综合表现",
  confidence: "置信度",
  progress: "进度",
  score: "得分",
  predicted_score: "预测得分",
  need_replan: "需要重规划",
  need_teacher_attention: "需要关注"
};

const tokenTextMap: Record<string, string> = {
  action: "动作",
  active: "进行中",
  applied: "已应用",
  assessment: "评估",
  auto: "自动",
  chapter: "章节",
  complete: "完成",
  completed: "已完成",
  confidence: "置信度",
  current: "当前",
  draft: "草稿",
  dwell: "停留",
  evidence: "证据",
  failed: "失败",
  feedback: "反馈",
  generate: "生成",
  high: "高",
  history: "历史",
  knowledge: "知识",
  learner: "学生",
  low: "低",
  manual: "手动",
  mastery: "掌握",
  medium: "中",
  missing: "缺失",
  node: "节点",
  normal: "普通",
  path: "路径",
  pending: "待处理",
  plan: "规划",
  planner: "规划",
  point: "点",
  predicted: "预测",
  profile: "画像",
  queued: "排队中",
  replan: "重规划",
  resource: "资源",
  review: "复盘",
  running: "运行中",
  score: "得分",
  self: "自主",
  skill: "能力",
  slow: "偏慢",
  source: "来源",
  stable: "稳定",
  status: "状态",
  student: "学生",
  teacher: "教师",
  trigger: "触发",
  usage: "使用",
  weak: "薄弱"
};

const normalizeBackendKey = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

export const backendText = (
  value?: string | number | null,
  fallback = "暂无",
  map: Record<string, string> = {}
) => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/[\u4e00-\u9fa5]/.test(raw)) return raw;

  const normalized = normalizeBackendKey(raw);
  if (map[raw]) return map[raw];
  if (map[normalized]) return map[normalized];
  if (directTextMap[raw]) return directTextMap[raw];
  if (directTextMap[normalized]) return directTextMap[normalized];

  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return fallback;

  const translated = tokens.map(token => tokenTextMap[token]);
  return translated.every(Boolean) ? translated.join("") : fallback;
};

export const inlineBackendText = (
  value?: string | number | null,
  fallback = "暂无"
) => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (!/[a-zA-Z_]/.test(raw)) return raw;

  return raw.replace(
    /\b[a-z][a-z0-9]*(?:[._-][a-z0-9]+)+\b|\b(?:active|applied|approved|completed|failed|high|low|medium|normal|pending|processing|queued|running|skip|warning|write_delta)\b/gi,
    match => backendText(match, match)
  );
};

export const progressValue = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return 0;
  }
  const normalized = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, Math.round(normalized)));
};

export const percentLabel = (value?: number | null, fallback = "暂无") => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return fallback;
  }
  return `${progressValue(value)}%`;
};

export const dateText = (value?: string | null) => {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const durationText = (
  value?: number | null,
  unit: "minute" | "ms" | "s" = "minute"
) => {
  const amount = Number(value || 0);
  if (!amount) return "0 分钟";
  const minutes =
    unit === "ms"
      ? Math.round(amount / 60000)
      : unit === "s"
        ? Math.round(amount / 60)
        : Math.round(amount);
  if (minutes < 60) return `${Math.max(1, minutes)} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
};

export const tagType = (status?: string) => {
  const key = normalizeBackendKey(String(status || ""));
  if (
    [
      "active",
      "applied",
      "approved",
      "completed",
      "done",
      "generated",
      "ready",
      "safe",
      "write_delta"
    ].includes(key)
  ) {
    return "success";
  }
  if (
    ["failed", "blocked", "danger", "deleted", "high", "rejected"].includes(key)
  ) {
    return "danger";
  }
  if (
    [
      "changes_requested",
      "medium",
      "pending",
      "pending_apply",
      "processing",
      "queued",
      "running",
      "warning"
    ].includes(key)
  ) {
    return "warning";
  }
  return "info";
};

export const compactRefLabel = (
  value?: string | number | null,
  label = "编号"
) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/[\u4e00-\u9fa5]/.test(raw) && raw.length <= 18) return raw;
  if (raw.length <= 12) return `${label} ${raw}`;
  return `${label} ${raw.slice(0, 4)} ${raw.slice(-4)}`;
};

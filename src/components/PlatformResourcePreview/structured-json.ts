import type { PlatformPreviewResource } from "./resource-preview";

type UnknownRecord = Record<string, unknown>;

export interface StructuredPreviewMeta {
  label: string;
  value: string;
}

export interface StructuredTestCase {
  name: string;
  input: string;
  output: string;
  explanation: string;
}

export interface StructuredCodingPreview {
  kind: "coding";
  title: string;
  description: string;
  language: string;
  difficulty: string;
  starterCode: string;
  inputSpec: string;
  outputSpec: string;
  constraints: string[];
  hints: string[];
  testCases: StructuredTestCase[];
  rubric: StructuredPreviewMeta[];
  runtimeStatus: string;
  metadata: StructuredPreviewMeta[];
}

export interface StructuredExerciseOption {
  key: string;
  text: string;
}

export interface StructuredExerciseQuestion {
  id: string;
  title: string;
  prompt: string;
  type: string;
  difficulty: string;
  score: string;
  options: StructuredExerciseOption[];
  answer: string;
  explanation: string;
  code: string;
  language: string;
}

export interface StructuredExercisePreview {
  kind: "exercise";
  title: string;
  description: string;
  questions: StructuredExerciseQuestion[];
  metadata: StructuredPreviewMeta[];
}

export interface StructuredDocumentTable {
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
}

export interface StructuredDocumentSection {
  title: string;
  kind: "text" | "list" | "fields" | "table";
  text?: string;
  items?: string[];
  fields?: StructuredPreviewMeta[];
  table?: StructuredDocumentTable;
}

export interface StructuredDocumentPreview {
  kind: "document";
  title: string;
  description: string;
  metadata: StructuredPreviewMeta[];
  sections: StructuredDocumentSection[];
  invalid?: boolean;
}

export type StructuredPreviewView =
  | StructuredCodingPreview
  | StructuredExercisePreview
  | StructuredDocumentPreview;

const labelMap: Record<string, string> = {
  title: "标题",
  name: "名称",
  heading: "标题",
  description: "说明",
  summary: "摘要",
  introduction: "简介",
  overview: "概览",
  content: "内容",
  body: "正文",
  objective: "学习目标",
  objectives: "学习目标",
  learning_objectives: "学习目标",
  knowledge_points: "知识点",
  key_points: "重点",
  steps: "操作步骤",
  procedure: "操作步骤",
  examples: "示例",
  samples: "示例",
  question: "题目",
  questions: "题目",
  exercise_items: "练习题",
  prompt: "题目",
  stem: "题干",
  type: "题型",
  question_type: "题型",
  difficulty: "难度",
  score: "分值",
  points: "分值",
  options: "选项",
  choices: "选项",
  answer: "参考答案",
  correct_answer: "参考答案",
  explanation: "解析",
  analysis: "解析",
  solution: "解答",
  language: "编程语言",
  starter_code: "起始代码",
  starterCode: "起始代码",
  template: "代码模板",
  input: "输入",
  input_spec: "输入说明",
  input_description: "输入说明",
  output: "输出",
  expected_output: "预期输出",
  output_spec: "输出说明",
  output_description: "输出说明",
  constraints: "约束条件",
  hints: "提示",
  test_cases: "测试样例",
  rubric: "评分标准",
  runtime_status: "运行环境"
};

const technicalKeys = new Set([
  "id",
  "resource_id",
  "task_id",
  "schema",
  "schema_version",
  "version",
  "created_at",
  "updated_at",
  "object_key",
  "storage_status",
  "storage_error"
]);

const cleanText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const isRecord = (value: unknown): value is UnknownRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizedKey = (key: string) =>
  key
    .trim()
    .replace(/[\s-]+/g, "_")
    .toLowerCase();

export function structuredFieldLabel(key: string) {
  const normalized = normalizedKey(key);
  if (labelMap[key]) return labelMap[key];
  if (labelMap[normalized]) return labelMap[normalized];
  return key
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, character => character.toUpperCase());
}

function entriesOf(record: UnknownRecord) {
  return Object.entries(record).filter(
    ([key, value]) =>
      !technicalKeys.has(normalizedKey(key)) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );
}

function firstValue(records: UnknownRecord[], keys: string[]) {
  const normalizedKeys = new Set(keys.map(normalizedKey));
  for (const record of records) {
    for (const [key, value] of Object.entries(record)) {
      if (
        normalizedKeys.has(normalizedKey(key)) &&
        value !== null &&
        value !== undefined &&
        value !== ""
      ) {
        return value;
      }
    }
  }
  return undefined;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (isRecord(item)) {
          return (
            cleanText(
              firstValue([item], ["text", "label", "content", "value"])
            ) || compactObjectText(item)
          );
        }
        return cleanText(item);
      })
      .filter(Boolean);
  }
  if (isRecord(value)) {
    return entriesOf(value)
      .map(([key, item]) => {
        const text = readableValue(item);
        return text ? `${structuredFieldLabel(key)}：${text}` : "";
      })
      .filter(Boolean);
  }
  const text = cleanText(value);
  if (!text) return [];
  return text
    .split(/\r?\n|[；;]/)
    .map(item => item.replace(/^[-*\d.、)\s]+/, "").trim())
    .filter(Boolean);
}

function readableValue(value: unknown, depth = 0): string {
  const primitive = cleanText(value);
  if (primitive) return primitive;
  if (depth > 2) return "";
  if (Array.isArray(value)) {
    return value
      .map(item => readableValue(item, depth + 1))
      .filter(Boolean)
      .join("；");
  }
  if (isRecord(value)) return compactObjectText(value, depth + 1);
  return "";
}

function compactObjectText(record: UnknownRecord, depth = 0) {
  return entriesOf(record)
    .map(([key, value]) => {
      const text = readableValue(value, depth + 1);
      return text ? `${structuredFieldLabel(key)}：${text}` : "";
    })
    .filter(Boolean)
    .join("；");
}

function collectCandidateRecords(payload: unknown) {
  const records: UnknownRecord[] = [];
  const add = (value: unknown) => {
    if (isRecord(value) && !records.includes(value)) records.push(value);
  };
  add(payload);
  if (!isRecord(payload)) return records;
  ["data", "resource", "payload", "content", "problem", "exercise"].forEach(
    key => add(payload[key])
  );
  return records;
}

function normalizeStatus(status: unknown) {
  const value = cleanText(status).toLowerCase();
  const labels: Record<string, string> = {
    ready: "可用",
    completed: "已完成",
    passed: "校验通过",
    processing: "准备中",
    pending: "等待准备",
    degraded: "部分可用",
    exportable_only: "仅供导出",
    not_configured: "未配置",
    missing: "未提供"
  };
  return labels[value] || cleanText(status);
}

function normalizeDifficulty(value: unknown) {
  const text = cleanText(value);
  const labels: Record<string, string> = {
    easy: "入门",
    beginner: "入门",
    medium: "进阶",
    intermediate: "进阶",
    hard: "挑战",
    advanced: "挑战"
  };
  return labels[text.toLowerCase()] || text;
}

function normalizeRubric(value: unknown): StructuredPreviewMeta[] {
  if (isRecord(value)) {
    return entriesOf(value)
      .map(([key, item]) => ({
        label: structuredFieldLabel(key),
        value: readableValue(item)
      }))
      .filter(item => item.value);
  }
  return stringList(value).map((item, index) => ({
    label: `评分项 ${index + 1}`,
    value: item
  }));
}

function normalizeTestCases(value: unknown): StructuredTestCase[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item, index) => ({
      name:
        cleanText(firstValue([item], ["name", "title", "label"])) ||
        `样例 ${index + 1}`,
      input: readableValue(
        firstValue([item], ["input", "stdin", "args", "arguments", "params"])
      ),
      output: readableValue(
        firstValue(
          [item],
          ["expected_output", "expected", "output", "stdout", "result"]
        )
      ),
      explanation: cleanText(
        firstValue([item], ["explanation", "description", "note"])
      )
    }))
    .filter(item => item.input || item.output || item.explanation);
}

function codingDescriptor(resource: PlatformPreviewResource) {
  return `${resource.resourceType || ""} ${resource.title || ""}`.toLowerCase();
}

function looksLikeCoding(
  payload: unknown,
  resource: PlatformPreviewResource,
  records: UnknownRecord[]
) {
  if (
    /(coding[_\s-]*practice|programming|code[_\s-]*(exercise|practice)|编程|代码练习|算法)/.test(
      codingDescriptor(resource)
    )
  ) {
    return true;
  }
  if (resource.starterCode || resource.testCases?.length || resource.language) {
    return true;
  }
  if (!isRecord(payload)) return false;
  return Boolean(
    firstValue(records, [
      "starter_code",
      "starterCode",
      "solution_template",
      "test_cases"
    ])
  );
}

function buildCodingPreview(
  payload: unknown,
  resource: PlatformPreviewResource,
  records: UnknownRecord[]
): StructuredCodingPreview {
  const rawDescription =
    firstValue(records, [
      "problem_statement",
      "statement",
      "prompt",
      "description",
      "summary",
      "content",
      "body"
    ]) ?? (typeof payload === "string" ? payload : "");
  const testCases = normalizeTestCases(
    resource.testCases?.length
      ? resource.testCases
      : firstValue(records, ["test_cases", "tests", "samples", "examples"])
  );
  const language =
    cleanText(resource.language) ||
    cleanText(
      firstValue(records, ["language", "lang", "programming_language"])
    );
  const difficulty = normalizeDifficulty(
    firstValue(records, ["difficulty", "level"])
  );
  const runtimeStatus = normalizeStatus(
    resource.runtimeStatus || firstValue(records, ["runtime_status"])
  );
  return {
    kind: "coding",
    title: cleanText(firstValue(records, ["title", "name"])) || resource.title,
    description: readableValue(rawDescription) || resource.description || "",
    language: language || "代码",
    difficulty,
    starterCode:
      resource.starterCode ||
      cleanText(
        firstValue(records, [
          "starter_code",
          "starterCode",
          "solution_template",
          "template",
          "code"
        ])
      ),
    inputSpec: readableValue(
      firstValue(records, [
        "input_spec",
        "input_description",
        "input_format",
        "input"
      ])
    ),
    outputSpec: readableValue(
      firstValue(records, [
        "output_spec",
        "output_description",
        "output_format",
        "output"
      ])
    ),
    constraints: stringList(
      firstValue(records, ["constraints", "limits", "requirements"])
    ),
    hints: stringList(firstValue(records, ["hints", "hint", "tips"])),
    testCases,
    rubric: normalizeRubric(
      resource.rubric ?? firstValue(records, ["rubric", "scoring", "criteria"])
    ),
    runtimeStatus,
    metadata: [
      difficulty ? { label: "难度", value: difficulty } : null,
      language ? { label: "编程语言", value: language } : null,
      runtimeStatus ? { label: "运行环境", value: runtimeStatus } : null,
      testCases.length
        ? { label: "测试样例", value: `${testCases.length} 组` }
        : null
    ].filter((item): item is StructuredPreviewMeta => Boolean(item))
  };
}

function normalizeOptions(value: unknown): StructuredExerciseOption[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (isRecord(item)) {
          return {
            key:
              cleanText(firstValue([item], ["key", "label", "id"])) ||
              String.fromCharCode(65 + index),
            text:
              cleanText(firstValue([item], ["text", "content", "value"])) ||
              compactObjectText(item)
          };
        }
        return {
          key: String.fromCharCode(65 + index),
          text: cleanText(item)
        };
      })
      .filter(item => item.text);
  }
  if (isRecord(value)) {
    return entriesOf(value)
      .map(([key, item]) => ({ key, text: readableValue(item) }))
      .filter(item => item.text);
  }
  return [];
}

function questionTypeLabel(value: unknown, hasOptions: boolean) {
  const text = cleanText(value).toLowerCase();
  const labels: Record<string, string> = {
    single_choice: "单选题",
    single: "单选题",
    multiple_choice: "多选题",
    multiple: "多选题",
    true_false: "判断题",
    boolean: "判断题",
    fill_blank: "填空题",
    short_answer: "简答题",
    coding: "编程题"
  };
  return labels[text] || cleanText(value) || (hasOptions ? "选择题" : "练习题");
}

function questionItems(payload: unknown, resource: PlatformPreviewResource) {
  if (resource.exerciseItems?.length) return resource.exerciseItems;
  if (Array.isArray(payload)) return payload.filter(isRecord);
  const records = collectCandidateRecords(payload);
  const value = firstValue(records, [
    "exercise_items",
    "questions",
    "items",
    "exercises",
    "problems"
  ]);
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function looksLikeExercise(
  payload: unknown,
  resource: PlatformPreviewResource,
  items: UnknownRecord[]
) {
  if (
    /(exercise[_\s-]*set|question[_\s-]*bank|练习题集|题库)/.test(
      codingDescriptor(resource)
    )
  ) {
    return true;
  }
  if (resource.exerciseItems?.length || items.length) return true;
  if (!Array.isArray(payload)) return false;
  return payload.some(
    item =>
      isRecord(item) &&
      Boolean(firstValue([item], ["question", "prompt", "stem", "options"]))
  );
}

function buildExercisePreview(
  resource: PlatformPreviewResource,
  records: UnknownRecord[],
  items: UnknownRecord[]
): StructuredExercisePreview | null {
  const questions = items.map((item, index) => {
    const options = normalizeOptions(
      firstValue([item], ["options", "choices"])
    );
    const prompt = readableValue(
      firstValue(
        [item],
        [
          "question",
          "prompt",
          "stem",
          "description",
          "content",
          "problem_statement"
        ]
      )
    );
    return {
      id:
        cleanText(firstValue([item], ["id", "question_id"])) || `${index + 1}`,
      title:
        cleanText(firstValue([item], ["title", "name"])) ||
        `第 ${index + 1} 题`,
      prompt,
      type: questionTypeLabel(
        firstValue([item], ["type", "question_type"]),
        options.length > 0
      ),
      difficulty: normalizeDifficulty(
        firstValue([item], ["difficulty", "level"])
      ),
      score: cleanText(firstValue([item], ["score", "points", "point"])),
      options,
      answer: readableValue(
        firstValue([item], ["correct_answer", "answer", "reference_answer"])
      ),
      explanation: readableValue(
        firstValue([item], ["explanation", "analysis", "solution", "rationale"])
      ),
      code: cleanText(
        firstValue([item], ["starter_code", "starterCode", "template", "code"])
      ),
      language: cleanText(
        firstValue([item], ["language", "lang", "programming_language"])
      )
    };
  });
  if (!questions.length) return null;
  const description =
    readableValue(
      firstValue(records, ["description", "summary", "introduction"])
    ) ||
    resource.description ||
    "";
  return {
    kind: "exercise",
    title: cleanText(firstValue(records, ["title", "name"])) || resource.title,
    description,
    questions,
    metadata: [
      { label: "题目数量", value: `${questions.length} 题` },
      questions.some(item => item.score)
        ? {
            label: "总分",
            value: `${questions.reduce(
              (total, item) => total + (Number(item.score) || 0),
              0
            )} 分`
          }
        : null
    ].filter((item): item is StructuredPreviewMeta => Boolean(item))
  };
}

function primitiveFields(record: UnknownRecord) {
  return entriesOf(record)
    .filter(([, value]) =>
      ["string", "number", "boolean"].includes(typeof value)
    )
    .map(([key, value]) => ({
      label: structuredFieldLabel(key),
      value: cleanText(value)
    }))
    .filter(item => item.value);
}

function tableFromRecords(records: UnknownRecord[]): StructuredDocumentTable {
  const keys: string[] = [];
  records.slice(0, 20).forEach(record => {
    entriesOf(record).forEach(([key, value]) => {
      if (!keys.includes(key) && keys.length < 8 && readableValue(value)) {
        keys.push(key);
      }
    });
  });
  return {
    columns: keys.map(key => ({ key, label: structuredFieldLabel(key) })),
    rows: records
      .slice(0, 100)
      .map(record =>
        Object.fromEntries(keys.map(key => [key, readableValue(record[key])]))
      )
  };
}

function genericSections(payload: unknown): StructuredDocumentSection[] {
  if (Array.isArray(payload)) {
    const records = payload.filter(isRecord);
    if (records.length === payload.length && records.length) {
      return [
        {
          title: "内容明细",
          kind: "table",
          table: tableFromRecords(records)
        }
      ];
    }
    return [
      {
        title: "内容列表",
        kind: "list",
        items: stringList(payload)
      }
    ];
  }
  if (!isRecord(payload)) return [];

  const sections: StructuredDocumentSection[] = [];
  entriesOf(payload).forEach(([key, value]) => {
    if (
      ["title", "name", "description", "summary"].includes(normalizedKey(key))
    ) {
      return;
    }
    if (Array.isArray(value)) {
      const records = value.filter(isRecord);
      if (records.length === value.length && records.length) {
        sections.push({
          title: structuredFieldLabel(key),
          kind: "table",
          table: tableFromRecords(records)
        });
      } else {
        const items = stringList(value);
        if (items.length) {
          sections.push({
            title: structuredFieldLabel(key),
            kind: "list",
            items
          });
        }
      }
      return;
    }
    if (isRecord(value)) {
      const fields = primitiveFields(value);
      if (fields.length) {
        sections.push({
          title: structuredFieldLabel(key),
          kind: "fields",
          fields
        });
      }
      entriesOf(value).forEach(([childKey, childValue]) => {
        if (!Array.isArray(childValue)) return;
        const childRecords = childValue.filter(isRecord);
        sections.push(
          childRecords.length === childValue.length && childRecords.length
            ? {
                title: `${structuredFieldLabel(key)} · ${structuredFieldLabel(childKey)}`,
                kind: "table",
                table: tableFromRecords(childRecords)
              }
            : {
                title: `${structuredFieldLabel(key)} · ${structuredFieldLabel(childKey)}`,
                kind: "list",
                items: stringList(childValue)
              }
        );
      });
      return;
    }
    const text = cleanText(value);
    if (text) {
      sections.push({
        title: structuredFieldLabel(key),
        kind: "text",
        text
      });
    }
  });
  return sections.filter(section => {
    if (section.kind === "list") return Boolean(section.items?.length);
    if (section.kind === "fields") return Boolean(section.fields?.length);
    if (section.kind === "table") return Boolean(section.table?.columns.length);
    return Boolean(section.text);
  });
}

function buildDocumentPreview(
  payload: unknown,
  resource: PlatformPreviewResource,
  records: UnknownRecord[]
): StructuredDocumentPreview {
  const invalid = typeof payload === "string";
  const primary = records[0];
  return {
    kind: "document",
    title: cleanText(firstValue(records, ["title", "name"])) || resource.title,
    description:
      readableValue(
        firstValue(records, ["description", "summary", "introduction"])
      ) ||
      resource.description ||
      (invalid ? "该结构化内容格式不完整，暂时无法转换为可读视图。" : ""),
    metadata: primary ? primitiveFields(primary).slice(0, 8) : [],
    sections: invalid ? [] : genericSections(payload),
    invalid
  };
}

export function normalizeStructuredPreview(
  payload: unknown,
  resource: PlatformPreviewResource
): StructuredPreviewView {
  const structuredPayload = resource.structuredData ?? payload;
  const records = collectCandidateRecords(structuredPayload);
  if (looksLikeCoding(structuredPayload, resource, records)) {
    return buildCodingPreview(structuredPayload, resource, records);
  }
  const items = questionItems(structuredPayload, resource);
  if (looksLikeExercise(structuredPayload, resource, items)) {
    const exercise = buildExercisePreview(resource, records, items);
    if (exercise) return exercise;
  }
  return buildDocumentPreview(structuredPayload, resource, records);
}

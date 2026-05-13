import axios, { type AxiosRequestConfig } from "axios";

export type GradioChoice = [string, string] | string;

export type GradioComponent = {
  id: number;
  type: string;
  props?: Record<string, any>;
};

export type GradioDependency = {
  api_name?: string | null;
  backend_fn?: boolean;
  inputs?: number[];
  outputs?: number[];
  queue?: boolean;
  show_progress?: string;
  targets?: Array<[number, string]>;
};

export type GradioConfig = {
  version?: string;
  mode?: string;
  enable_queue?: boolean;
  protocol?: string;
  components: GradioComponent[];
  dependencies: GradioDependency[];
  root?: string | null;
};

export type GradioFileData = {
  path: string;
  url?: string | null;
  size?: number | null;
  orig_name?: string | null;
  mime_type?: string | null;
  is_stream?: boolean;
  meta: {
    _type: "gradio.FileData";
  };
};

export type AgentPdfDynamicField =
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "dropdown";
      value: string | null;
      choices: Array<{ label: string; value: string }>;
      visible: boolean;
    }
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "radio";
      value: string | null;
      choices: Array<{ label: string; value: string }>;
      visible: boolean;
    }
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "checkbox";
      value: boolean;
      visible: boolean;
    }
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "number";
      value: number | null;
      visible: boolean;
    }
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "slider";
      value: number | null;
      visible: boolean;
      minimum?: number;
      maximum?: number;
      step?: number;
    }
  | {
      key: string;
      label: string;
      componentId: number;
      kind: "textbox";
      value: string;
      visible: boolean;
      placeholder?: string;
    };

export type AgentPdfPresetConfig = {
  fileTypeComponentId: number | null;
  fileInputComponentId: number | null;
  linkInputComponentId: number | null;
  stateComponentId: number | null;
  serviceComponentId: number | null;
  langFromComponentId: number | null;
  langToComponentId: number | null;
  fileType: string;
  service: string;
  langFrom: string;
  langTo: string;
  serviceChoices: Array<{ label: string; value: string }>;
  langFromChoices: Array<{ label: string; value: string }>;
  langToChoices: Array<{ label: string; value: string }>;
  fields: AgentPdfDynamicField[];
  translateApiName: string | null;
  translateDependency?: GradioDependency;
  componentsById: Record<number, GradioComponent>;
};

export type GradioCallEvent =
  | { type: "complete"; data: any }
  | { type: "generating"; data: any }
  | { type: "heartbeat"; data: null }
  | { type: "error"; data: any };

const FILE_META = { _type: "gradio.FileData" as const };

const KEYWORDS = {
  fileType: ["Type", "类型"],
  linkInput: ["Link", "链接"],
  service: ["Service", "服务"],
  langFrom: ["Translate from", "从...翻译", "翻译自"],
  langTo: ["Translate to", "翻译为"],
  pageRange: ["Pages", "页面", "頁面"],
  pageInput: ["Page range", "页码范围", "頁碼範圍"],
  onlyTranslated: [
    "Only include translated pages in the output PDF.",
    "仅在输出 PDF 中包含已翻译的页面。"
  ],
  noMono: ["Disable monolingual output", "禁用单语输出"],
  noDual: ["Disable bilingual output", "禁用双语输出"],
  dualFirst: [
    "Put translated pages first in dual mode",
    "在双语模式下优先显示翻译后的页面"
  ],
  alternatingDual: [
    "Use alternating pages for dual PDF",
    "使用交替页面进行双页 PDF 阅读"
  ],
  watermark: ["Watermark mode", "水印模式"],
  customPrompt: ["Custom prompt for translation", "翻译自定义提示"],
  customSystemPrompt: ["Custom System Prompt", "自定义系统提示"],
  minTextLength: ["Minimum text length to translate", "最小翻译文本长度"],
  glossaryFile: ["Glossary File", "术语表文件"],
  saveGlossary: [
    "save automatically extracted glossary",
    "保存自动提取的术语表"
  ],
  translateTableText: ["Translate table text", "翻译表格文本"],
  skipScannedDetection: ["Skip scanned detection", "跳过扫描检测"],
  ocrWorkaround: ["OCR workaround", "OCR 变通方案"],
  maxPagesPerPart: ["Maximum pages per part", "每部分最大页数"],
  primaryFontFamily: [
    "Primary font family for translated text",
    "翻译文本的主要字体"
  ],
  rateLimitMode: ["Rate Limit Mode", "速率限制模式"],
  rpm: ["RPM (Requests Per Minute)", "RPM（每分钟请求数）"],
  concurrentThreads: ["Concurrent Threads", "并发线程"],
  customQps: ["QPS (Queries Per Second)", "QPS（每秒查询数）"],
  customPoolWorkers: ["Pool Max Workers", "最大工作线程数"],
  termService: ["Term extraction engine", "术语提取引擎"],
  termRateLimitMode: ["Term rate limit mode", "术语速率限制模式"],
  termQps: ["Term QPS", "术语 QPS"],
  termPoolWorkers: ["Term pool max workers", "术语池最大工作线程数"]
};

const BASE_STATE = {
  session_id: null,
  current_task: null,
  results: {},
  file_order: [],
  display_map: {},
  parent_map: {},
  uploaded_files: []
};

function normalizeChoice(choice: GradioChoice) {
  if (Array.isArray(choice)) {
    return { label: String(choice[0]), value: String(choice[1]) };
  }

  return { label: String(choice), value: String(choice) };
}

function textOfLabel(component: GradioComponent) {
  return String(component.props?.label || "");
}

function matchKeyword(label: string, candidates: string[]) {
  return candidates.some(candidate => label.includes(candidate));
}

function findComponentByLabel(
  config: GradioConfig,
  candidates: string[],
  type?: string
) {
  return config.components.find(component => {
    if (type && component.type !== type) return false;
    return matchKeyword(textOfLabel(component), candidates);
  });
}

function findDependencyByTargetEvent(config: GradioConfig, eventName: string) {
  return config.dependencies.find(dependency =>
    (dependency.targets || []).some(([, event]) => event === eventName)
  );
}

export function defaultValueForComponent(component?: GradioComponent | null) {
  if (!component) return null;

  const props = component.props || {};

  if (component.type === "state") return props.value ?? null;
  if (component.type === "file") return null;
  if (component.type === "checkbox") return Boolean(props.value);
  if (component.type === "dropdown" || component.type === "radio") {
    return props.value ?? "";
  }
  if (component.type === "number" || component.type === "slider") {
    return props.value ?? null;
  }
  if (component.type === "dataframe") {
    return props.value ?? [];
  }
  if (component.type === "textbox" || component.type === "markdown") {
    return props.value ?? "";
  }

  return props.value ?? null;
}

function buildFieldKey(label: string, componentId: number) {
  const normalized = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `component_${componentId}`;
}

function ensureAgentPdfServiceUrl(serviceUrl?: string | null) {
  const normalized = String(serviceUrl || "").trim();
  if (!normalized) {
    throw new Error("Agent PDF 服务地址未配置");
  }
  return normalized.replace(/\/$/, "");
}

function toField(component: GradioComponent): AgentPdfDynamicField | null {
  const props = component.props || {};
  const label = String(props.label || component.type || component.id);
  const visible = props.visible !== false;

  if (component.type === "dropdown") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "dropdown",
      value: props.value == null ? null : String(props.value),
      choices: Array.isArray(props.choices)
        ? props.choices.map((item: GradioChoice) => normalizeChoice(item))
        : [],
      visible
    };
  }

  if (component.type === "radio") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "radio",
      value: props.value == null ? null : String(props.value),
      choices: Array.isArray(props.choices)
        ? props.choices.map((item: GradioChoice) => normalizeChoice(item))
        : [],
      visible
    };
  }

  if (component.type === "checkbox") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "checkbox",
      value: Boolean(props.value),
      visible
    };
  }

  if (component.type === "number") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "number",
      value: props.value == null ? null : Number(props.value),
      visible
    };
  }

  if (component.type === "slider") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "slider",
      value: props.value == null ? null : Number(props.value),
      visible,
      minimum: props.minimum,
      maximum: props.maximum,
      step: props.step
    };
  }

  if (component.type === "textbox") {
    return {
      key: buildFieldKey(label, component.id),
      label,
      componentId: component.id,
      kind: "textbox",
      value: String(props.value || ""),
      visible,
      placeholder: props.placeholder
    };
  }

  return null;
}

export async function fetchAgentPdfConfig(
  serviceUrl: string,
  axiosConfig?: AxiosRequestConfig
) {
  const baseUrl = ensureAgentPdfServiceUrl(serviceUrl);
  const url = `${baseUrl}/config`;
  const { data } = await axios.get<GradioConfig>(url, {
    withCredentials: true,
    ...axiosConfig
  });
  return data;
}

export function extractAgentPdfPresetConfig(
  config: GradioConfig
): AgentPdfPresetConfig {
  const fileTypeComponent = findComponentByLabel(
    config,
    KEYWORDS.fileType,
    "radio"
  );
  const fileInputComponent = config.components.find(
    component =>
      component.type === "file" &&
      Array.isArray(component.props?.file_types) &&
      component.props.file_types.some((item: unknown) =>
        String(item || "")
          .toLowerCase()
          .includes(".pdf")
      )
  );
  const linkInputComponent = findComponentByLabel(
    config,
    KEYWORDS.linkInput,
    "textbox"
  );
  const stateComponent = config.components.find(
    component => component.type === "state"
  );
  const serviceComponent = findComponentByLabel(
    config,
    KEYWORDS.service,
    "dropdown"
  );
  const langFromComponent = findComponentByLabel(
    config,
    KEYWORDS.langFrom,
    "dropdown"
  );
  const langToComponent = findComponentByLabel(
    config,
    KEYWORDS.langTo,
    "dropdown"
  );
  const translateDependency =
    config.dependencies.find(
      dependency => dependency.api_name === "translate_files"
    ) || findDependencyByTargetEvent(config, "click");

  const excludedLabels = [
    ...KEYWORDS.fileType,
    ...KEYWORDS.service,
    ...KEYWORDS.langFrom,
    ...KEYWORDS.langTo
  ];

  const excludedIds = new Set<number>(
    [
      fileTypeComponent?.id,
      serviceComponent?.id,
      langFromComponent?.id,
      langToComponent?.id
    ].filter(Boolean) as number[]
  );

  const fields = config.components
    .filter(component => {
      if (
        ![
          "dropdown",
          "radio",
          "checkbox",
          "number",
          "slider",
          "textbox"
        ].includes(component.type)
      ) {
        return false;
      }

      if (excludedIds.has(component.id)) return false;
      const label = textOfLabel(component);
      if (!label) return false;
      return !matchKeyword(label, excludedLabels);
    })
    .map(component => toField(component))
    .filter(Boolean) as AgentPdfDynamicField[];

  const componentsById = Object.fromEntries(
    config.components.map(component => [component.id, component])
  ) as Record<number, GradioComponent>;

  return {
    fileTypeComponentId: fileTypeComponent?.id ?? null,
    fileInputComponentId: fileInputComponent?.id ?? null,
    linkInputComponentId: linkInputComponent?.id ?? null,
    stateComponentId: stateComponent?.id ?? null,
    serviceComponentId: serviceComponent?.id ?? null,
    langFromComponentId: langFromComponent?.id ?? null,
    langToComponentId: langToComponent?.id ?? null,
    fileType: String(fileTypeComponent?.props?.value || "File"),
    service: String(serviceComponent?.props?.value || ""),
    langFrom: String(langFromComponent?.props?.value || ""),
    langTo: String(langToComponent?.props?.value || ""),
    serviceChoices: Array.isArray(serviceComponent?.props?.choices)
      ? serviceComponent.props.choices.map((item: GradioChoice) =>
          normalizeChoice(item)
        )
      : [],
    langFromChoices: Array.isArray(langFromComponent?.props?.choices)
      ? langFromComponent.props.choices.map((item: GradioChoice) =>
          normalizeChoice(item)
        )
      : [],
    langToChoices: Array.isArray(langToComponent?.props?.choices)
      ? langToComponent.props.choices.map((item: GradioChoice) =>
          normalizeChoice(item)
        )
      : [],
    fields,
    translateApiName: translateDependency?.api_name || null,
    translateDependency,
    componentsById
  };
}

export async function uploadAgentPdfFiles(
  serviceUrl: string,
  files: File[],
  axiosConfig?: AxiosRequestConfig
) {
  const baseUrl = ensureAgentPdfServiceUrl(serviceUrl);
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const { data } = await axios.post<string[]>(
    `${baseUrl}/upload`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data"
      },
      ...axiosConfig
    }
  );

  return data;
}

export function toGradioUploadedFile(
  path: string,
  originalName?: string
): GradioFileData {
  return {
    path,
    orig_name: originalName || path.split("/").pop() || path,
    meta: FILE_META
  };
}

export function createBaseState(fileNames: string[], filePaths: string[]) {
  const displayMap: Record<string, string> = {};
  const parentMap: Record<string, string> = {};

  fileNames.forEach((name, index) => {
    const path = filePaths[index];
    displayMap[name] = path;
    parentMap[name] = name;
  });

  return {
    ...BASE_STATE,
    display_map: displayMap,
    parent_map: parentMap,
    uploaded_files: fileNames
  };
}

export async function callAgentPdfEvent(
  serviceUrl: string,
  apiName: string,
  data: any[],
  sessionHash?: string,
  axiosConfig?: AxiosRequestConfig
) {
  const baseUrl = ensureAgentPdfServiceUrl(serviceUrl);
  const { data: response } = await axios.post<{ event_id: string }>(
    `${baseUrl}/call/${apiName}`,
    {
      data,
      session_hash: sessionHash || null
    },
    {
      withCredentials: true,
      ...axiosConfig
    }
  );

  return response;
}

export async function* streamAgentPdfEvent(
  serviceUrl: string,
  apiName: string,
  eventId: string
): AsyncGenerator<GradioCallEvent> {
  const baseUrl = ensureAgentPdfServiceUrl(serviceUrl);
  const response = await fetch(
    `${baseUrl}/call/${apiName}/${eventId}`,
    {
      credentials: "include"
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(`Failed to connect event stream: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const eventMatch = chunk.match(/event:\s*([^\n]+)/);
      const dataMatch = chunk.match(/data:\s*([\s\S]*)$/);
      const type = (
        eventMatch?.[1] || "heartbeat"
      ).trim() as GradioCallEvent["type"];
      const rawData = dataMatch?.[1]?.trim();

      let parsed: any = null;
      if (rawData && rawData !== "null") {
        try {
          parsed = JSON.parse(rawData);
        } catch {
          parsed = rawData;
        }
      }

      yield { type, data: parsed };
    }
  }
}

export function resolveAgentPdfFileUrl(
  serviceUrl: string,
  filePathOrUrl?: string | null
) {
  const baseUrl = ensureAgentPdfServiceUrl(serviceUrl);
  if (!filePathOrUrl) return "";
  if (/^https?:\/\//i.test(filePathOrUrl)) return filePathOrUrl;
  if (filePathOrUrl.startsWith("/")) {
    return `${baseUrl}${filePathOrUrl}`;
  }
  return `${baseUrl}/file=${filePathOrUrl}`;
}

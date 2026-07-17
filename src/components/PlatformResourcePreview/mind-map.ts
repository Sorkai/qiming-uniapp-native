export interface PlatformMindMapNode {
  id: string;
  title: string;
  children: PlatformMindMapNode[];
}

const maxMindMapNodes = 320;

export function stripStructuredCodeFence(content: string) {
  const trimmed = String(content || "").trim();
  const match = trimmed.match(
    /^```(?:json|mermaid|mindmap)?\s*([\s\S]*?)\s*```$/i
  );
  return match?.[1]?.trim() || trimmed;
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const text = stripStructuredCodeFence(value);
  if (!text || !/^[\[{]/.test(text)) return value;
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

function getField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) return source[key];
    const match = Object.keys(source).find(
      item => item.toLowerCase() === key.toLowerCase()
    );
    if (match) return source[match];
  }
  return undefined;
}

function nodeTitle(value: unknown, fallback: string) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim() || fallback;
  }
  if (!value || typeof value !== "object") return fallback;
  const source = value as Record<string, unknown>;
  const candidate = getField(source, [
    "text",
    "label",
    "title",
    "name",
    "topic",
    "value",
    "content",
    "summary"
  ]);
  return typeof candidate === "string" || typeof candidate === "number"
    ? String(candidate).trim() || fallback
    : fallback;
}

function nodeChildren(value: Record<string, unknown>) {
  const children = parseMaybeJson(
    getField(value, [
      "children",
      "childNodes",
      "childrenNodes",
      "subTopics",
      "subtopics",
      "topics",
      "nodes",
      "items",
      "points",
      "branches"
    ])
  );
  return Array.isArray(children) ? children : [];
}

function normalizeTreeNode(
  value: unknown,
  path: string,
  fallback: string,
  budget: { count: number }
): PlatformMindMapNode | null {
  if (budget.count >= maxMindMapNodes) return null;
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) {
    const children = parsed
      .map((item, index) =>
        normalizeTreeNode(item, `${path}-${index}`, `主题 ${index + 1}`, budget)
      )
      .filter(Boolean) as PlatformMindMapNode[];
    if (!children.length) return null;
    budget.count += 1;
    return { id: path, title: fallback, children };
  }
  if (!parsed || typeof parsed !== "object") {
    if (typeof parsed !== "string" && typeof parsed !== "number") return null;
    const title = String(parsed).trim();
    if (!title) return null;
    budget.count += 1;
    return { id: path, title, children: [] };
  }

  const source = parsed as Record<string, unknown>;
  const children = nodeChildren(source)
    .map((item, index) =>
      normalizeTreeNode(item, `${path}-${index}`, `主题 ${index + 1}`, budget)
    )
    .filter(Boolean) as PlatformMindMapNode[];
  const title = nodeTitle(source, fallback);
  if (!title && !children.length) return null;
  budget.count += 1;
  return { id: path, title: title || fallback, children };
}

function normalizeTypedGraph(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;
  const nodes = getField(source, ["nodes", "nodeList", "node_list"]);
  const edges = getField(source, ["edges", "edgeList", "edge_list", "links"]);
  if (!Array.isArray(nodes) || !Array.isArray(edges) || !nodes.length) {
    return null;
  }

  const nodeMap = new Map<string, Record<string, unknown>>();
  nodes.forEach(node => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const id = getField(record, ["node_id", "nodeId", "id", "key"]);
    if (id !== undefined && id !== null) nodeMap.set(String(id), record);
  });
  if (!nodeMap.size) return null;

  const childrenByParent = new Map<string, string[]>();
  const incoming = new Set<string>();
  edges.forEach(edge => {
    if (!edge || typeof edge !== "object") return;
    const record = edge as Record<string, unknown>;
    const parent = String(
      getField(record, ["source", "from", "parent", "parent_id"]) || ""
    );
    const child = String(
      getField(record, ["target", "to", "child", "child_id"]) || ""
    );
    if (!nodeMap.has(parent) || !nodeMap.has(child)) return;
    const children = childrenByParent.get(parent) || [];
    if (!children.includes(child)) children.push(child);
    childrenByParent.set(parent, children);
    incoming.add(child);
  });

  const rootId = String(
    getField(source, ["root_id", "rootId"]) ||
      [...nodeMap.keys()].find(id => !incoming.has(id)) ||
      ""
  );
  if (!rootId || !nodeMap.has(rootId)) return null;

  const budget = { count: 0 };
  const visiting = new Set<string>();
  const build = (id: string, path: string): PlatformMindMapNode | null => {
    if (budget.count >= maxMindMapNodes || visiting.has(id)) return null;
    visiting.add(id);
    const record = nodeMap.get(id)!;
    budget.count += 1;
    const children = (childrenByParent.get(id) || [])
      .map((child, index) => build(child, `${path}-${index}`))
      .filter(Boolean) as PlatformMindMapNode[];
    visiting.delete(id);
    return {
      id: path,
      title: nodeTitle(record, id),
      children
    };
  };
  return build(rootId, "graph-root");
}

function mermaidNodeTitle(line: string, fallback: string) {
  const cleaned = line.replace(/\s+%%.*$/, "").trim();
  const paired = cleaned.match(
    /^(?:[^\s()[\]{}]+\s*)?(?:\(\((.*?)\)\)|\[(.*?)\]|\{(.*?)\}|\((.*?)\))$/
  );
  return String(paired?.slice(1).find(Boolean) || cleaned || fallback)
    .replace(/[`"']/g, "")
    .trim();
}

function parseMermaidMindMap(content: string) {
  const lines = stripStructuredCodeFence(content)
    .split(/\r?\n/)
    .map(line => ({ raw: line, text: line.trim() }))
    .filter(item => item.text && !/^mindmap\s*$/i.test(item.text));
  const roots: PlatformMindMapNode[] = [];
  const stack: Array<{ indent: number; node: PlatformMindMapNode }> = [];

  lines.slice(0, maxMindMapNodes).forEach((item, index) => {
    const indent = item.raw.match(/^\s*/)?.[0].replace(/\t/g, "  ").length || 0;
    const node: PlatformMindMapNode = {
      id: `mermaid-${index}`,
      title: mermaidNodeTitle(item.text, `主题 ${index + 1}`),
      children: []
    };
    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.node;
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push({ indent, node });
  });

  if (roots.length === 1) return roots[0];
  return roots.length
    ? { id: "mermaid-root", title: "学习导图", children: roots }
    : null;
}

function parseMermaidFlowchart(content: string) {
  const lines = stripStructuredCodeFence(content)
    .split(/\r?\n/)
    .map(line => line.replace(/\s+%%.*$/, "").trim())
    .filter(Boolean);
  const nodes = new Map<string, PlatformMindMapNode>();
  const edges: Array<[string, string]> = [];
  const ensureNode = (id: string, title = id) => {
    if (!nodes.has(id)) nodes.set(id, { id, title, children: [] });
    else if (title !== id) nodes.get(id)!.title = title;
  };

  lines.slice(0, maxMindMapNodes).forEach(line => {
    if (/^(flowchart|graph)\b/i.test(line)) return;
    const declarations = line.matchAll(
      /([A-Za-z0-9_.:-]+)\s*(?:\[\s*["']?(.*?)["']?\s*\]|\(\(\s*(.*?)["']?\s*\)\)|\{\s*["']?(.*?)["']?\s*\})/g
    );
    for (const match of declarations) {
      ensureNode(
        match[1],
        String(match[2] || match[3] || match[4] || match[1]).trim()
      );
    }
    const edgeMatch = line.match(
      /^([A-Za-z0-9_.:-]+)\s*(?:-->|---|==>|-.+->)(?:\|[^|]*\|)?\s*([A-Za-z0-9_.:-]+)/
    );
    if (edgeMatch) {
      ensureNode(edgeMatch[1]);
      ensureNode(edgeMatch[2]);
      edges.push([edgeMatch[1], edgeMatch[2]]);
    }
  });

  if (!nodes.size || !edges.length) return null;
  const incoming = new Set(edges.map(([, target]) => target));
  edges.forEach(([source, target]) => {
    const parent = nodes.get(source);
    const child = nodes.get(target);
    if (
      parent &&
      child &&
      !parent.children.some(item => item.id === child.id)
    ) {
      parent.children.push(child);
    }
  });
  return [...nodes.values()].find(node => !incoming.has(node.id)) || null;
}

function objectMapTree(
  value: unknown,
  title: string,
  path = "object-root",
  budget = { count: 0 }
): PlatformMindMapNode | null {
  if (budget.count >= maxMindMapNodes) return null;
  budget.count += 1;
  if (Array.isArray(value)) {
    const children = value
      .map((item, index) =>
        objectMapTree(item, `主题 ${index + 1}`, `${path}-${index}`, budget)
      )
      .filter(Boolean) as PlatformMindMapNode[];
    return { id: path, title, children };
  }
  if (!value || typeof value !== "object") {
    return {
      id: path,
      title: `${title}: ${String(value ?? "")}`,
      children: []
    };
  }
  const children = Object.entries(value as Record<string, unknown>)
    .map(([key, item], index) =>
      objectMapTree(item, key, `${path}-${index}`, budget)
    )
    .filter(Boolean) as PlatformMindMapNode[];
  return { id: path, title, children };
}

export function extractPlatformMindMapTree(
  payload: unknown,
  options?: { fallbackTitle?: string; allowObjectMap?: boolean }
): PlatformMindMapNode | null {
  const fallbackTitle = options?.fallbackTitle || "学习导图";
  const normalizedPayload = parseMaybeJson(payload);

  if (typeof normalizedPayload === "string") {
    const text = stripStructuredCodeFence(normalizedPayload);
    if (/^mindmap\b/i.test(text)) return parseMermaidMindMap(text);
    if (/^(flowchart|graph)\b/i.test(text)) return parseMermaidFlowchart(text);
    return null;
  }

  const typedGraph =
    normalizeTypedGraph(normalizedPayload) ||
    normalizeTypedGraph((normalizedPayload as any)?.data);
  if (typedGraph) return typedGraph;

  const raw = normalizedPayload as any;
  const candidates = [
    raw?.data?.mindMap?.tree,
    raw?.data?.mindmap?.tree,
    raw?.data?.mind_map?.tree,
    raw?.mindMap?.tree,
    raw?.mindmap?.tree,
    raw?.mind_map?.tree,
    raw?.data?.mindMap,
    raw?.data?.mindmap,
    raw?.data?.mind_map,
    raw?.mindMap,
    raw?.mindmap,
    raw?.mind_map,
    raw?.tree,
    raw?.root
  ].filter(value => value !== undefined && value !== null);

  for (const candidate of candidates) {
    const graph = normalizeTypedGraph(candidate);
    if (graph) return graph;
    const tree = normalizeTreeNode(candidate, "root", fallbackTitle, {
      count: 0
    });
    if (tree) return tree;
  }

  if (Array.isArray(normalizedPayload)) {
    return normalizeTreeNode(normalizedPayload, "root", fallbackTitle, {
      count: 0
    });
  }

  if (normalizedPayload && typeof normalizedPayload === "object") {
    const source = normalizedPayload as Record<string, unknown>;
    const hasTreeShape = nodeChildren(source).length > 0;
    if (hasTreeShape) {
      return normalizeTreeNode(source, "root", fallbackTitle, { count: 0 });
    }
    if (options?.allowObjectMap) {
      return objectMapTree(source, fallbackTitle);
    }
  }

  return null;
}

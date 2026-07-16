<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";
import { Aim, FullScreen } from "@element-plus/icons-vue";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import {
  Handle,
  Position,
  VueFlow,
  useVueFlow,
  type Edge,
  type Node
} from "@vue-flow/core";
import type { PlatformMindMapNode } from "./mind-map";

defineOptions({ name: "PlatformMindMapPreview" });

const props = defineProps<{
  tree: PlatformMindMapNode;
}>();

interface MindMapViewNode {
  label: string;
  rawLabel: string;
  depth: number;
  width: number;
  side: "left" | "right" | "root";
}

const flowId = `platform-mind-map-${useId().replace(/[^a-z0-9_-]/gi, "")}`;
const flowNodes = ref<Node<MindMapViewNode>[]>([]);
const flowEdges = ref<Edge[]>([]);
const mindMapRoot = ref<HTMLElement | null>(null);
const { fitView, setCenter } = useVueFlow(flowId);
let fitTimer: number | undefined;
let resizeObserver: ResizeObserver | undefined;

function splitLabel(value: string, maxChars: number) {
  const source = String(value || "").trim();
  if (!source) return ["未命名主题"];
  const lines: string[] = [];
  let rest = source;
  while (rest.length > maxChars) {
    const candidates = [
      rest.lastIndexOf("，", maxChars),
      rest.lastIndexOf("、", maxChars),
      rest.lastIndexOf(" ", maxChars),
      rest.lastIndexOf("；", maxChars)
    ];
    const naturalBreak = Math.max(...candidates);
    const breakIndex =
      naturalBreak > Math.floor(maxChars * 0.55) ? naturalBreak + 1 : maxChars;
    lines.push(rest.slice(0, breakIndex).trim());
    rest = rest.slice(breakIndex).trim();
  }
  if (rest) lines.push(rest);
  return lines.filter(Boolean);
}

function formattedLabel(label: string, depth: number) {
  const maxChars = depth === 0 ? 18 : depth === 1 ? 12 : 14;
  return splitLabel(label, maxChars).join("\n");
}

function nodeWidth(depth: number) {
  if (depth === 0) return 260;
  if (depth === 1) return 220;
  return 245;
}

function nodeHeight(label: string, depth: number) {
  const lineCount = formattedLabel(label, depth).split("\n").length;
  return Math.max(depth === 0 ? 58 : 50, lineCount * 22 + 26);
}

function subtreeHeight(node: PlatformMindMapNode, depth: number): number {
  const ownHeight = nodeHeight(node.title, depth);
  if (!node.children.length) return ownHeight;
  const childHeights = node.children.map(child =>
    subtreeHeight(child, depth + 1)
  );
  const childrenHeight =
    childHeights.reduce((sum, height) => sum + height, 0) +
    Math.max(0, childHeights.length - 1) * 18;
  return Math.max(ownHeight, childrenHeight);
}

function nodeX(side: MindMapViewNode["side"], depth: number, width: number) {
  if (side === "root") return -width / 2;
  const gap = depth === 1 ? 260 : 300;
  const offset = 150 + (depth - 1) * gap;
  return side === "left" ? -offset - width : offset;
}

function addFlowNode(
  source: PlatformMindMapNode,
  depth: number,
  side: MindMapViewNode["side"],
  yCenter: number,
  nodes: Node<MindMapViewNode>[],
  path: string
) {
  const width = nodeWidth(depth);
  const height = nodeHeight(source.title, depth);
  nodes.push({
    id: path,
    type: "platform-mind-map",
    position: {
      x: nodeX(side, depth, width),
      y: yCenter - height / 2
    },
    data: {
      label: formattedLabel(source.title, depth),
      rawLabel: source.title,
      depth,
      side,
      width
    },
    draggable: true,
    selectable: false,
    connectable: false
  });
  return path;
}

function addFlowEdge(
  parentId: string,
  childId: string,
  side: MindMapViewNode["side"]
): Edge {
  return {
    id: `${parentId}-${childId}`,
    source: parentId,
    target: childId,
    sourceHandle: side === "left" ? "source-left" : "source-right",
    targetHandle: "target",
    type: "default",
    pathOptions: { curvature: 0.28 },
    selectable: false,
    class: "platform-mind-map__edge",
    style: {
      stroke: "rgba(66, 112, 178, 0.42)",
      strokeWidth: 2.3
    }
  };
}

function layoutSubtree(
  node: PlatformMindMapNode,
  depth: number,
  side: "left" | "right",
  yCenter: number,
  parentId: string,
  path: string,
  nodes: Node<MindMapViewNode>[],
  edges: Edge[]
) {
  const nodeId = addFlowNode(node, depth, side, yCenter, nodes, path);
  edges.push(addFlowEdge(parentId, nodeId, side));
  if (!node.children.length) return;

  const childHeights = node.children.map(child =>
    subtreeHeight(child, depth + 1)
  );
  const totalHeight =
    childHeights.reduce((sum, height) => sum + height, 0) +
    Math.max(0, childHeights.length - 1) * 18;
  let cursor = yCenter - totalHeight / 2;

  node.children.forEach((child, index) => {
    const childHeight = childHeights[index];
    const childCenter = cursor + childHeight / 2;
    layoutSubtree(
      child,
      depth + 1,
      side,
      childCenter,
      nodeId,
      `${path}-${index}`,
      nodes,
      edges
    );
    cursor += childHeight + 18;
  });
}

function buildFlow(tree: PlatformMindMapNode) {
  const nodes: Node<MindMapViewNode>[] = [];
  const edges: Edge[] = [];
  const rootId = addFlowNode(tree, 0, "root", 0, nodes, "root");
  const splitIndex = Math.ceil(tree.children.length / 2);
  const rightChildren = tree.children.slice(0, splitIndex);
  const leftChildren = tree.children.slice(splitIndex);

  const layoutSide = (
    children: PlatformMindMapNode[],
    side: "left" | "right"
  ) => {
    const heights = children.map(child => subtreeHeight(child, 1));
    const totalHeight =
      heights.reduce((sum, height) => sum + height, 0) +
      Math.max(0, heights.length - 1) * 26;
    let cursor = -totalHeight / 2;

    children.forEach((child, index) => {
      const height = heights[index];
      const center = cursor + height / 2;
      layoutSubtree(
        child,
        1,
        side,
        center,
        rootId,
        `${side}-${index}`,
        nodes,
        edges
      );
      cursor += height + 26;
    });
  };

  layoutSide(rightChildren, "right");
  layoutSide(leftChildren, "left");
  return { nodes, edges };
}

function fitMindMapOverview() {
  void nextTick(() => {
    fitView({ padding: 0.18, maxZoom: 1, duration: 180 });
  });
}

function applyInitialView() {
  void nextTick(() => {
    if ((mindMapRoot.value?.clientWidth || 0) < 640) {
      setCenter(0, 0, { zoom: 0.72, duration: 180 });
      return;
    }
    fitView({ padding: 0.18, maxZoom: 1, duration: 180 });
  });
}

function scheduleFit(delay = 320) {
  applyInitialView();
  window.clearTimeout(fitTimer);
  fitTimer = window.setTimeout(applyInitialView, delay);
}

function centerMindMap() {
  setCenter(0, 0, { zoom: 0.9, duration: 180 });
}

watch(
  () => props.tree,
  tree => {
    const { nodes, edges } = buildFlow(tree);
    flowNodes.value = nodes;
    flowEdges.value = edges;
    scheduleFit();
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  if (typeof ResizeObserver === "undefined" || !mindMapRoot.value) return;
  resizeObserver = new ResizeObserver(entries => {
    const rect = entries[0]?.contentRect;
    if (rect?.width && rect?.height) scheduleFit(120);
  });
  resizeObserver.observe(mindMapRoot.value);
});

onBeforeUnmount(() => {
  window.clearTimeout(fitTimer);
  resizeObserver?.disconnect();
});
</script>

<template>
  <section
    ref="mindMapRoot"
    class="platform-mind-map"
    aria-label="思维导图预览"
  >
    <div class="platform-mind-map__toolbar">
      <el-tooltip content="居中" placement="bottom">
        <el-button
          circle
          size="small"
          :icon="Aim"
          aria-label="居中思维导图"
          @click="centerMindMap"
        />
      </el-tooltip>
      <el-tooltip content="适配视图" placement="bottom">
        <el-button
          circle
          size="small"
          :icon="FullScreen"
          aria-label="适配思维导图视图"
          @click="fitMindMapOverview"
        />
      </el-tooltip>
    </div>

    <VueFlow
      :id="flowId"
      v-model:nodes="flowNodes"
      v-model:edges="flowEdges"
      class="platform-mind-map__viewer"
      :min-zoom="0.3"
      :max-zoom="1.8"
      :nodes-draggable="true"
      :nodes-connectable="false"
      :elements-selectable="false"
      :pan-on-scroll="false"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :zoom-on-double-click="false"
      :prevent-scrolling="true"
      :fit-view-on-init="true"
      @nodes-initialized="() => scheduleFit()"
    >
      <template #node-platform-mind-map="{ data }">
        <div
          class="platform-mind-map__node"
          :class="`depth-${data.depth}`"
          :style="{ width: `${data.width}px` }"
          :title="data.rawLabel"
        >
          <Handle
            v-if="data.depth > 0"
            id="target"
            type="target"
            :position="data.side === 'left' ? Position.Right : Position.Left"
          />
          <Handle id="source-left" type="source" :position="Position.Left" />
          <Handle id="source-right" type="source" :position="Position.Right" />
          <span>{{ data.label }}</span>
        </div>
      </template>
    </VueFlow>
  </section>
</template>

<style scoped>
.platform-mind-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  overflow: hidden;
  background: #f8fafc;
}

.platform-mind-map__toolbar {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 4;
  display: inline-flex;
  gap: 8px;
  padding: 5px;
  background: rgb(255 255 255 / 92%);
  border: 1px solid #dce4ee;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgb(31 41 55 / 8%);
  backdrop-filter: blur(8px);
}

.platform-mind-map__viewer {
  width: 100%;
  height: 100%;
}

.platform-mind-map__viewer :deep(.vue-flow__pane),
.platform-mind-map__viewer :deep(.vue-flow__renderer) {
  background:
    linear-gradient(rgb(148 163 184 / 8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(148 163 184 / 8%) 1px, transparent 1px), #f8fafc;
  background-size: 26px 26px;
}

.platform-mind-map__viewer :deep(.vue-flow__node) {
  background: transparent;
  border: 0;
  box-shadow: none;
}

.platform-mind-map__node {
  position: relative;
  box-sizing: border-box;
  padding: 10px 14px;
  overflow-wrap: anywhere;
  color: #263a56;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.45;
  white-space: pre-line;
  word-break: break-word;
  background: rgb(255 255 255 / 97%);
  border: 1px solid rgb(121 144 172 / 34%);
  border-radius: 8px;
  box-shadow: 0 10px 24px rgb(15 23 42 / 8%);
}

.platform-mind-map__node.depth-0 {
  padding: 12px 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  background: #356fb8;
  border-color: #356fb8;
}

.platform-mind-map__node.depth-1 {
  color: #24466f;
  background: #f5f9ff;
  border-color: rgb(53 111 184 / 32%);
}

.platform-mind-map__node.depth-2 {
  color: #27564f;
  background: #f5fbf8;
  border-color: rgb(62 139 118 / 28%);
}

.platform-mind-map__node.depth-3,
.platform-mind-map__node.depth-4,
.platform-mind-map__node.depth-5 {
  color: #5f4b2d;
  font-size: 12.5px;
  background: #fffaf2;
  border-color: rgb(180 137 71 / 26%);
}

.platform-mind-map__viewer :deep(.vue-flow__handle) {
  width: 1px;
  min-width: 1px;
  height: 1px;
  min-height: 1px;
  opacity: 0;
  pointer-events: none;
}

.platform-mind-map__viewer :deep(.vue-flow__edge-path) {
  stroke: rgb(66 112 178 / 42%);
  stroke-width: 2.3;
}

:global(.dark) .platform-mind-map,
:global(.dark) .platform-mind-map__viewer :deep(.vue-flow__pane),
:global(.dark) .platform-mind-map__viewer :deep(.vue-flow__renderer) {
  background:
    linear-gradient(rgb(255 255 255 / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 6%) 1px, transparent 1px), #111827;
  background-size: 26px 26px;
}

:global(.dark) .platform-mind-map__toolbar {
  background: rgb(17 24 39 / 92%);
  border-color: rgb(255 255 255 / 12%);
}

:global(.dark) .platform-mind-map__node {
  color: #e5edf7;
  background: rgb(30 41 59 / 96%);
  border-color: rgb(255 255 255 / 14%);
  box-shadow: 0 10px 24px rgb(0 0 0 / 24%);
}

:global(.dark) .platform-mind-map__node.depth-0 {
  color: #fff;
  background: #2f629f;
}
</style>

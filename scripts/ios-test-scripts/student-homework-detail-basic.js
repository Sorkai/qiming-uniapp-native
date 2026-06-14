function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function appText() {
  return (document.querySelector("#app")?.innerText || "").replace(/\s+/g, " ");
}

function rectOf(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

function cssPixelVar(name) {
  const parsed = Number.parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function isVisible(node) {
  if (!node) return false;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    rect.width > 12 &&
    rect.height > 12 &&
    centerX >= -1 &&
    centerY >= -1 &&
    centerX <= viewportWidth + 1 &&
    centerY <= viewportHeight + 1 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function hitTarget(node) {
  if (!isVisible(node)) return null;

  const rect = node.getBoundingClientRect();
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  return document.elementFromPoint(
    Math.min(Math.max(rect.left + Math.min(rect.width / 2, 80), 1), viewportWidth - 1),
    Math.min(Math.max(rect.top + Math.min(rect.height / 2, 24), 1), viewportHeight - 1)
  );
}

function isInteractable(node) {
  const target = hitTarget(node);
  return !!(
    target &&
    (target === node ||
      node.contains(target) ||
      target.closest?.("button") === node ||
      target.closest?.(".el-button") === node ||
      target.closest?.(".el-radio") === node ||
      target.closest?.(".el-checkbox") === node ||
      target.closest?.(".el-input") === node)
  );
}

function clickNode(node, shouldScroll = true) {
  if (!node) return false;
  if (shouldScroll) {
    node.scrollIntoView({ block: "center", inline: "nearest" });
  }
  node.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  node.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  node.click();
  return true;
}

function findButtonByText(label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
}

async function waitFor(predicate, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(200);
  }
  return null;
}

await waitFor(() => appText().includes("嵌入式 Linux 开发环境作业"), 9000);

const text = appText();
const page = document.querySelector(".homework-detail-container");
const header = document.querySelector(".homework-detail-container .header");
const card = document.querySelector(".homework-detail-container .el-card");
const questions = [...document.querySelectorAll(".homework-detail-container .question-item")];
const radio = document.querySelector(".homework-detail-container .el-radio");
const checkbox = document.querySelector(".homework-detail-container .el-checkbox");
const input = document.querySelector(".homework-detail-container .el-input input");
const textarea = document.querySelector(".homework-detail-container textarea");
const submitButton = findButtonByText("提交作业");

const safeTop = cssPixelVar("--pure-safe-area-top");
const headerRect = rectOf(header);
const cardRect = rectOf(card);
const topClearance = cardRect && headerRect ? cardRect.top - headerRect.bottom : null;
const viewportWidth = window.visualViewport?.width || window.innerWidth;
const cardWidthRatio = cardRect ? cardRect.width / viewportWidth : 0;

if (radio) clickNode(radio);
await wait(250);
if (checkbox) clickNode(checkbox);
await wait(250);
if (input) {
  input.scrollIntoView({ block: "center", inline: "nearest" });
  input.focus();
  input.value = "bootm";
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
if (textarea) {
  textarea.scrollIntoView({ block: "center", inline: "nearest" });
  textarea.focus();
  textarea.value = "先检查网络连通性，再确认 NFS 服务、导出目录权限和 bootargs。";
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

submitButton?.scrollIntoView({ block: "center", inline: "nearest" });
await wait(300);
const submitInteractable = isInteractable(submitButton);
if (submitInteractable) clickNode(submitButton, false);
const confirmDialog = await waitFor(
  () => [...document.querySelectorAll(".el-message-box")].find(isVisible),
  4000
);
const confirmButton = confirmDialog && findButtonByText("确认提交", confirmDialog);

const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    !!page &&
    !!header &&
    safeTop >= 0 &&
    topClearance !== null &&
    topClearance >= 8 &&
    cardWidthRatio >= 0.9 &&
    questions.length >= 5 &&
    text.includes("总题数：5 题") &&
    text.includes("交叉编译工具链选择") &&
    text.includes("提交作业") &&
    !!radio &&
    !!checkbox &&
    !!input &&
    !!textarea &&
    !!submitButton &&
    submitInteractable &&
    !!confirmDialog &&
    !!confirmButton &&
    horizontalOverflow <= 4,
  href: location.href,
  safeTop,
  headerRect,
  cardRect,
  topClearance,
  cardWidthRatio,
  questionCount: questions.length,
  submitInteractable,
  hasConfirmDialog: !!confirmDialog,
  hasConfirmButton: !!confirmButton,
  horizontalOverflow,
  text: appText().slice(0, 1400)
};

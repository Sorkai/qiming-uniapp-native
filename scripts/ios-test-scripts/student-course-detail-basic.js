function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function appText() {
  return (document.querySelector("#app")?.innerText || "").replace(/\s+/g, " ");
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
    centerX >= 0 &&
    centerY >= 0 &&
    centerX <= viewportWidth &&
    centerY <= viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function hitTarget(node) {
  if (!isVisible(node)) return null;

  const rect = node.getBoundingClientRect();
  return document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
}

function isInteractable(node) {
  const target = hitTarget(node);
  return !!(
    target &&
    (target === node ||
      node.contains(target) ||
      target.closest?.("button") === node)
  );
}

function clickNode(node) {
  if (!node) return false;
  scrollIntoUsableView(node);
  node.click();
  return true;
}

function scrollIntoUsableView(node) {
  if (!node) return;

  const sidebarScroller = document.querySelector(".layout-sidebar-scroll");
  if (sidebarScroller?.contains(node)) {
    const nodeRect = node.getBoundingClientRect();
    const scrollerRect = sidebarScroller.getBoundingClientRect();
    sidebarScroller.scrollLeft +=
      nodeRect.left -
      scrollerRect.left -
      scrollerRect.width / 2 +
      nodeRect.width / 2;
  }

  node.scrollIntoView({ block: "center", inline: "center" });
}

function findByText(selector, label, root = document) {
  return [...root.querySelectorAll(selector)].find(node =>
    node.textContent?.replace(/\s+/g, "").includes(label)
  );
}

function findHeaderByText(selector, label, root = document) {
  return [...root.querySelectorAll(selector)].find(
    node =>
      node.textContent?.replace(/\s+/g, "").includes(label) &&
      !node.textContent?.replace(/\s+/g, "").includes("章节目录")
  );
}

async function waitFor(predicate, timeoutMs = 7000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(200);
  }
  return null;
}

async function clickMenu(label, expectedText) {
  const item = findByText(".layout-sidebar .item", label);
  scrollIntoUsableView(item);
  await wait(350);

  if (!item || !isInteractable(item)) {
    return {
      ok: false,
      label,
      reason: "menu item not interactable",
      found: !!item
    };
  }

  item.click();
  const rendered = await waitFor(() => appText().includes(expectedText), 8000);
  return {
    ok: !!rendered,
    label,
    expectedText,
    text: appText().slice(0, 900)
  };
}

await wait(1200);

const initialText = appText();
const lessonNodes = [...document.querySelectorAll(".lesson-node")];
const secondLesson = lessonNodes[1];
const aiWidget = document.querySelector(".ai-assistant-widget");
const firstTitle =
  document.querySelector(".lesson-title")?.textContent?.trim() || "";

if (
  !initialText.includes("章节目录") ||
  !initialText.includes("6 课时") ||
  !initialText.includes("嵌入式系统与 Linux 开发环境概览") ||
  lessonNodes.length < 6
) {
  return {
    ok: false,
    reason: "course study shell did not render demo course",
    href: location.href,
    lessonCount: lessonNodes.length,
    initialText: initialText.slice(0, 1400)
  };
}

scrollIntoUsableView(secondLesson);
await wait(500);
const lessonInteractable = isInteractable(secondLesson);
if (lessonInteractable) {
  secondLesson.click();
  await wait(600);
}
const secondTitle =
  document.querySelector(".lesson-title")?.textContent?.trim() || "";

const aiInteractable = isInteractable(aiWidget);
if (aiInteractable) {
  clickNode(aiWidget);
  await wait(500);
}
const aiDialog = document.querySelector(".ai-dialog");
const aiDialogOpened = isVisible(aiDialog);
const aiDialogText =
  aiDialog?.innerText.replace(/\s+/g, " ").slice(0, 500) || "";
const aiClose = aiDialog?.querySelector(".close-btn");
if (aiClose) {
  aiClose.click();
  await wait(400);
}
const aiDialogClosed = !isVisible(aiDialog);

const masteryResult = await clickMenu("知识点", "基础知识点");
await waitFor(() => appText().includes("交叉编译链"), 9000);
const masteryText = appText();
const masteryCards = [...document.querySelectorAll(".summary-card")];
const masteryChapter = findHeaderByText(
  ".chapter-section > .collapsible-header",
  "环境搭建"
);
if (masteryChapter && !masteryChapter.classList.contains("is-expanded")) {
  clickNode(masteryChapter);
  await wait(450);
}
const masteryKeyPoint = await waitFor(
  () => findHeaderByText(".point-section > .collapsible-header", "重点内容"),
  4000
);
if (masteryKeyPoint && !masteryKeyPoint.classList.contains("is-expanded")) {
  clickNode(masteryKeyPoint);
  await wait(450);
}
await waitFor(() => appText().includes("交叉编译链"), 5000);
const masteryExpandedText = appText();

const materialsResult = await clickMenu(
  "课程资料",
  "嵌入式 Linux 开发环境清单.pdf"
);
const materialItems = [...document.querySelectorAll(".material-item")];

const gradesResult = await clickMenu("成绩", "成绩多维分析");
await waitFor(() => appText().includes("环境搭建随堂练习"), 9000);
const gradesText = appText();
const gradeCards = [...document.querySelectorAll(".grades-card")];
const gradeItems = [...document.querySelectorAll(".grade-item")];

const studyResult = await clickMenu("课程学习", "章节目录");

const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    lessonNodes.length >= 6 &&
    lessonInteractable &&
    secondTitle.includes("交叉编译工具链") &&
    aiInteractable &&
    aiDialogOpened &&
    aiDialogText.includes("AI 智能助教") &&
    aiDialogClosed &&
    masteryResult.ok &&
    masteryCards.length >= 4 &&
    masteryText.includes("重点数量") &&
    masteryExpandedText.includes("交叉编译链") &&
    materialsResult.ok &&
    materialItems.length >= 2 &&
    gradesResult.ok &&
    gradeCards.length >= 3 &&
    gradesText.includes("88") &&
    gradesText.includes("92") &&
    gradeItems.length >= 3 &&
    studyResult.ok &&
    horizontalOverflow <= 4,
  href: location.href,
  firstTitle,
  secondTitle,
  lessonCount: lessonNodes.length,
  lessonInteractable,
  aiInteractable,
  aiDialogOpened,
  aiDialogClosed,
  aiDialogText,
  masteryResult,
  masteryCardCount: masteryCards.length,
  masteryHasExpandedContent: masteryExpandedText.includes("交叉编译链"),
  materialsResult,
  materialItemCount: materialItems.length,
  gradesResult,
  gradeCardCount: gradeCards.length,
  gradeItemCount: gradeItems.length,
  studyResult,
  horizontalOverflow,
  text: appText().slice(0, 1400)
};

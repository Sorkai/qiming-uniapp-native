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

function isVisible(node) {
  if (!node) return false;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  return (
    rect.width > 12 &&
    rect.height > 12 &&
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
  const centerX = Math.min(
    Math.max(rect.left + rect.width / 2, 1),
    viewportWidth - 1
  );
  const centerY = Math.min(
    Math.max(rect.top + rect.height / 2, 1),
    viewportHeight - 1
  );
  return document.elementFromPoint(centerX, centerY);
}

function isInteractable(node) {
  const target = hitTarget(node);
  return !!(
    target &&
    (target === node ||
      node.contains(target) ||
      target.closest?.("button") === node ||
      target.closest?.(".el-button") === node ||
      target.closest?.(".el-select") === node)
  );
}

function findButtonByText(label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
}

function findTabByText(label) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...document.querySelectorAll(".el-tabs__item")].find(tab =>
    tab.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
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

function clickNode(node, shouldScroll = true) {
  if (!node) return false;
  if (shouldScroll) {
    node.scrollIntoView({ block: "center", inline: "nearest" });
  }
  node.click();
  return true;
}

async function activateTab(label) {
  const tab = findTabByText(label);
  if (!tab) return { found: false, active: false, interactable: false };

  const alreadyActive = tab.classList.contains("is-active");
  const interactable = isInteractable(tab);
  if (!alreadyActive) {
    tab.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    tab.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    tab.click();
  }

  const active = !!(await waitFor(() => {
    const normalizedLabel = label.replace(/\s+/g, "");
    const activeTab = [...document.querySelectorAll(".el-tabs__item")].find(
      item => item.classList.contains("is-active")
    );
    return activeTab?.textContent
      ?.replace(/\s+/g, "")
      .includes(normalizedLabel);
  }, 5000));

  return { found: true, active, interactable, alreadyActive };
}

async function openSelectAndInspect() {
  const select = document.querySelector(".custom-select-large");
  const selectWrapper =
    select?.querySelector(".el-select__wrapper") ||
    select?.querySelector(".el-input__wrapper") ||
    select;
  if (!select || !selectWrapper) {
    return {
      hasSelect: false,
      opened: false,
      optionCount: 0,
      emptyText: "",
      interactable: false
    };
  }

  const interactable = isInteractable(selectWrapper);
  clickNode(selectWrapper);

  const dropdown = await waitFor(
    () =>
      [...document.querySelectorAll(".el-select-dropdown, .el-popper")].find(
        node => isVisible(node) && node.innerText?.trim()
      ),
    4000
  );
  const optionCount = dropdown
    ? [...dropdown.querySelectorAll(".el-select-dropdown__item")].filter(
        isVisible
      ).length
    : 0;
  const emptyText = dropdown?.innerText.replace(/\s+/g, " ") || "";

  document.body.click();
  await wait(300);

  return {
    hasSelect: true,
    opened: !!dropdown,
    optionCount,
    emptyText,
    interactable,
    disabled: select.classList.contains("is-disabled"),
    rect: rectOf(select)
  };
}

async function closeDialogByTitle(title) {
  const dialog = [...document.querySelectorAll(".el-dialog")].find(
    node =>
      isVisible(node) && node.innerText?.replace(/\s+/g, "").includes(title)
  );
  const closeButton =
    dialog?.querySelector(".el-dialog__headerbtn") ||
    findButtonByText("关闭", dialog);
  if (!dialog || !closeButton) return false;

  closeButton.click();
  return !!(await waitFor(() => !isVisible(dialog), 3000));
}

function horizontalOverflow() {
  return Math.max(
    0,
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
      (window.visualViewport?.width || window.innerWidth)
  );
}

function topChromeBottom() {
  const navBar = document.querySelector(".navbar");
  const header = document.querySelector(".fixed-header");
  const navRect = navBar?.getBoundingClientRect();
  const headerRect = header?.getBoundingClientRect();
  return Math.max(
    0,
    navRect && isVisible(navBar) ? navRect.bottom : 0,
    headerRect && isVisible(header) ? headerRect.bottom : 0
  );
}

await wait(1200);

const container = document.querySelector(".teacher-plan-container");
const initialText = appText();
const courseItems = [...document.querySelectorAll(".course-item")].filter(
  isVisible
);
const emptyPanel = document.querySelector(".teacher-plan-empty-mobile");
const initialOverflow = horizontalOverflow();

if (!container || courseItems.length === 0) {
  return {
    ok: false,
    reason: "teacher plan course list did not render",
    hasContainer: !!container,
    courseCount: courseItems.length,
    initialOverflow,
    text: initialText.slice(0, 1000)
  };
}

const firstCourseText = courseItems[0].innerText.replace(/\s+/g, " ");
clickNode(courseItems[0], false);

await waitFor(
  () =>
    document.querySelector(".teacher-plan-tabs") &&
    appText().includes("AI 教案智能生成工作台"),
  10000
);
await waitFor(
  () =>
    document.querySelector(".generator-container") &&
    !document.querySelector(".generator-container .el-loading-mask"),
  9000
);

const selectedText = appText();
const generator = document.querySelector(".generator-container");
const generatorButton =
  findButtonByText("立即生成教案") ||
  findButtonByText("立即开启AI智能解析生成");
const selectInspection = await openSelectAndInspect();
const generateTab = await activateTab("AI 智能生成工作台");

const listTab = await activateTab("已生成教案库");
await waitFor(
  () =>
    document.querySelector(".list-container") &&
    (appText().includes("已生成教案") || appText().includes("暂无教案内容")),
  10000
);
await waitFor(
  () => !document.querySelector(".list-container .el-loading-mask"),
  10000
);

const listContainer = document.querySelector(".list-container");
const refreshButton = findButtonByText("刷新", listContainer || document);
let refreshInteractable = refreshButton ? isInteractable(refreshButton) : false;
if (refreshButton) {
  clickNode(refreshButton);
  refreshInteractable = refreshInteractable || isInteractable(refreshButton);
  await waitFor(
    () => !document.querySelector(".list-container .el-loading-mask"),
    9000
  );
}

const planCards = [...document.querySelectorAll(".plan-card")].filter(
  isVisible
);
const emptyList =
  document.querySelector(".list-container .el-empty") ||
  [...document.querySelectorAll(".list-container div")].find(
    node => isVisible(node) && node.textContent?.includes("暂无教案内容")
  );

let managementResult = {
  attempted: false,
  opened: true,
  closed: true,
  text: ""
};
if (planCards.length > 0) {
  const manageButton = findButtonByText("管理", planCards[0]);
  managementResult = {
    attempted: !!manageButton,
    opened: false,
    closed: false,
    text: planCards[0].innerText.replace(/\s+/g, " ")
  };
  if (manageButton) {
    clickNode(manageButton);
    const progressDialog = await waitFor(
      () =>
        [...document.querySelectorAll(".el-dialog")].find(
          node =>
            isVisible(node) &&
            node.innerText?.replace(/\s+/g, "").includes("教案处理状态")
        ),
      6000
    );
    managementResult.opened = !!progressDialog;
    managementResult.text =
      progressDialog?.innerText.replace(/\s+/g, " ") || managementResult.text;
    managementResult.closed = progressDialog
      ? await closeDialogByTitle("教案处理状态")
      : false;
  }
} else if (emptyList) {
  const goGenerateButton = findButtonByText(
    "立即去生成",
    listContainer || document
  );
  if (goGenerateButton) {
    clickNode(goGenerateButton);
    await waitFor(
      () => findTabByText("AI 智能生成工作台")?.classList.contains("is-active"),
      5000
    );
  }
}

document.querySelector(".plan-list-toolbar")?.scrollIntoView({
  block: "start",
  inline: "nearest"
});
await wait(350);

const finalText = appText();
const finalOverflow = horizontalOverflow();
const selectedCard = [...document.querySelectorAll(".course-item.active")].find(
  isVisible
);
const toolbarRect = rectOf(document.querySelector(".plan-list-toolbar"));
const topClearance = toolbarRect ? toolbarRect.top - topChromeBottom() : null;

return {
  ok:
    container.classList.contains("is-mobile-layout") &&
    initialText.includes("教学中心") &&
    initialText.includes("开启智能教案设计") &&
    initialText.includes("大模型智能解析") &&
    courseItems.length >= 1 &&
    !!selectedCard &&
    selectedText.includes("AI 教案智能生成工作台") &&
    selectedText.includes("指定生成章节") &&
    !!generator &&
    generator.classList.contains("is-mobile-layout") &&
    !!generatorButton &&
    selectInspection.hasSelect &&
    (selectInspection.opened ||
      selectInspection.optionCount > 0 ||
      selectInspection.emptyText.includes("暂无章节")) &&
    generateTab.found &&
    generateTab.active &&
    listTab.found &&
    listTab.active &&
    !!listContainer &&
    listContainer.classList.contains("is-mobile-layout") &&
    !!refreshButton &&
    (planCards.length > 0 || !!emptyList) &&
    managementResult.opened &&
    managementResult.closed &&
    (topClearance === null || topClearance >= -4) &&
    finalOverflow <= 4,
  courseCount: courseItems.length,
  firstCourseText,
  selectedCourseText: selectedCard?.innerText.replace(/\s+/g, " ") || "",
  containerMobile: container.classList.contains("is-mobile-layout"),
  generatorMobile: generator?.classList.contains("is-mobile-layout") || false,
  listMobile: listContainer?.classList.contains("is-mobile-layout") || false,
  generateTab,
  listTab,
  selectInspection,
  generatorButtonDisabled: generatorButton?.disabled || false,
  refreshInteractable,
  planCardCount: planCards.length,
  hasEmptyList: !!emptyList,
  managementResult,
  topClearance,
  toolbarRect,
  initialOverflow,
  finalOverflow,
  viewport: {
    width: window.visualViewport?.width || window.innerWidth,
    height: window.visualViewport?.height || window.innerHeight
  },
  text: finalText.slice(0, 1200)
};

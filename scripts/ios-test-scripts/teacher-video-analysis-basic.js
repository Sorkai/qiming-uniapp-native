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
    Math.min(Math.max(rect.left + rect.width / 2, 1), viewportWidth - 1),
    Math.min(Math.max(rect.top + rect.height / 2, 1), viewportHeight - 1)
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
      target.closest?.(".el-select") === node ||
      target.closest?.(".el-input") === node)
  );
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

function visibleDropdown() {
  return [...document.querySelectorAll(".el-select-dropdown, .el-popper")].find(
    node => isVisible(node) && node.innerText?.trim()
  );
}

function visibleOptions(dropdown = visibleDropdown()) {
  return dropdown
    ? [...dropdown.querySelectorAll(".el-select-dropdown__item")].filter(
        node => isVisible(node) && !node.classList.contains("is-disabled")
      )
    : [];
}

function findSelectByPlaceholder(placeholder) {
  const exactInput = document.querySelector(
    `input[placeholder='${placeholder}']`
  );
  if (exactInput) {
    const select =
      exactInput.closest(".el-select") ||
      exactInput.closest(".el-select-v2") ||
      exactInput.parentElement;
    return {
      input: exactInput,
      select,
      trigger:
        select?.querySelector(".el-select__wrapper") ||
        select?.querySelector(".el-input__wrapper") ||
        exactInput
    };
  }

  const selects = [...document.querySelectorAll(".sidebar-card .el-select")];
  const index = placeholder.includes("章节") ? 1 : 0;
  const select = selects[index];
  return {
    input: select?.querySelector("input") || null,
    select,
    trigger:
      select?.querySelector(".el-select__wrapper") ||
      select?.querySelector(".el-input__wrapper") ||
      select
  };
}

async function openSelectByPlaceholder(placeholder) {
  const { input, select, trigger } = findSelectByPlaceholder(placeholder);

  if (!select || !trigger) {
    return {
      hasInput: !!input,
      hasSelect: !!select,
      opened: false,
      optionCount: 0,
      dropdownText: "",
      interactable: false,
      disabled: true
    };
  }

  const interactable = isInteractable(trigger);
  clickNode(trigger);
  const dropdown = await waitFor(visibleDropdown, 5000);
  const options = visibleOptions(dropdown);

  return {
    input,
    trigger,
    dropdown,
    options,
    hasInput: true,
    opened: !!dropdown,
    optionCount: options.length,
    dropdownText: dropdown?.innerText.replace(/\s+/g, " ").slice(0, 500) || "",
    interactable,
    disabled:
      input?.disabled ||
      input?.getAttribute("aria-disabled") === "true" ||
      select?.classList.contains("is-disabled") ||
      trigger?.classList.contains("is-disabled"),
    rect: rectOf(trigger)
  };
}

async function chooseFirstSelectOption(placeholder) {
  const opened = await openSelectByPlaceholder(placeholder);
  if (!opened.opened || opened.optionCount === 0) {
    document.body.click();
    await wait(250);
    return {
      ...opened,
      selected: false,
      selectedText: ""
    };
  }

  const option = opened.options[0];
  const selectedText = option.textContent?.replace(/\s+/g, " ").trim() || "";
  clickNode(option, false);
  await wait(900);

  return {
    ...opened,
    selected: true,
    selectedText
  };
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

function bottomChromeTop() {
  const mobileNav = document.querySelector(".nav-mobile-container");
  const rect = mobileNav?.getBoundingClientRect();
  return rect && isVisible(mobileNav)
    ? rect.top
    : window.visualViewport?.height || window.innerHeight;
}

function visibleDialog(title) {
  return [...document.querySelectorAll(".el-dialog")].find(
    dialog =>
      isVisible(dialog) &&
      (!title || dialog.textContent?.replace(/\s+/g, "").includes(title))
  );
}

async function closeVisibleDialog(title) {
  const dialog = visibleDialog(title);
  const closeButton =
    dialog?.querySelector(".el-dialog__headerbtn") ||
    findButtonByText("取消", dialog) ||
    findButtonByText("关闭", dialog);
  if (!dialog || !closeButton) return false;

  closeButton.click();
  return !!(await waitFor(() => !isVisible(dialog), 3000));
}

async function waitForNoLoading(timeoutMs = 9000) {
  return waitFor(
    () => !document.querySelector(".video-analysis-container .el-loading-mask"),
    timeoutMs
  );
}

await wait(1600);

const container = document.querySelector(".video-analysis-container");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const refreshButton = findButtonByText("刷新");
const submitButton = findButtonByText("提交视频分析");
const initialSubmitDisabled =
  submitButton?.disabled || submitButton?.classList.contains("is-disabled");

if (!container) {
  return {
    ok: false,
    reason: "video analysis container did not render",
    initialOverflow,
    text: initialText.slice(0, 1200)
  };
}

const isMobileLayout = container.classList.contains("is-mobile-layout");
const courseSelection = await chooseFirstSelectOption("搜索或选择课程...");

if (!courseSelection.selected) {
  return {
    ok: false,
    reason: "course select could not choose an option",
    isMobileLayout,
    courseSelection,
    hasRefreshButton: !!refreshButton,
    hasSubmitButton: !!submitButton,
    initialSubmitDisabled,
    text: appText().slice(0, 1200)
  };
}

await waitFor(() => {
  const chapterInput = document.querySelector(
    "input[placeholder='请选择课程内的章节...']"
  );
  const select = chapterInput?.closest(".el-select");
  return (
    chapterInput &&
    !chapterInput.disabled &&
    !select?.classList.contains("is-disabled")
  );
}, 10000);

const chapterSelection = await chooseFirstSelectOption("请选择课程内的章节...");

if (!chapterSelection.selected) {
  return {
    ok: false,
    reason: "chapter select could not choose an option",
    isMobileLayout,
    courseSelection,
    chapterSelection,
    text: appText().slice(0, 1400)
  };
}

await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-video-task-list") &&
    (document.querySelector(".mobile-video-task-card") ||
      document.querySelector(".mobile-video-task-list .el-empty") ||
      appText().includes("暂无视频分析任务")),
  10000
);

const afterSelectionText = appText();
const mobileList = document.querySelector(".mobile-video-task-list");
const cardCount = document.querySelectorAll(".mobile-video-task-card").length;
const emptyState = !!(
  document.querySelector(".mobile-video-task-list .el-empty") ||
  afterSelectionText.includes("暂无视频分析任务")
);
const desktopTableDisplay = document.querySelector(".task-table")
  ? window.getComputedStyle(document.querySelector(".task-table")).display
  : "missing";
const mobileListDisplay = mobileList
  ? window.getComputedStyle(mobileList).display
  : "missing";

let refreshInteractable = refreshButton ? isInteractable(refreshButton) : false;
if (refreshButton && !refreshButton.disabled) {
  clickNode(refreshButton);
  refreshInteractable = refreshInteractable || isInteractable(refreshButton);
  await waitForNoLoading();
}

let submitDialogOpened = false;
let submitDialogClosed = false;
let submitDialogText = "";
if (submitButton) {
  clickNode(submitButton);
  const dialog = await waitFor(() => visibleDialog("提交视频分析任务"), 6000);
  submitDialogOpened = !!dialog;
  submitDialogText = dialog?.innerText.replace(/\s+/g, " ").slice(0, 700) || "";
  submitDialogClosed = submitDialogOpened
    ? await closeVisibleDialog("提交视频分析任务")
    : false;
  await wait(300);
}

const firstCard = document.querySelector(".mobile-video-task-card");
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";
const detailButton = firstCard ? findButtonByText("查看详情", firstCard) : null;
const refreshTaskButton = firstCard
  ? findButtonByText("刷新状态", firstCard)
  : null;
const firstCardActions = firstCard?.querySelector(
  ".mobile-video-task-card__actions"
);

let detailOpened = true;
let detailClosed = true;
let detailDialogText = "";
if (detailButton) {
  clickNode(detailButton);
  const dialog = await waitFor(() => visibleDialog("视频分析结果"), 7000);
  detailOpened = !!dialog;
  detailDialogText = dialog?.innerText.replace(/\s+/g, " ").slice(0, 700) || "";
  detailClosed = detailOpened
    ? await closeVisibleDialog("视频分析结果")
    : false;
  await wait(300);
}

if (firstCardActions) {
  firstCardActions.scrollIntoView({ block: "center", inline: "nearest" });
  await wait(250);
}

const actionRect = firstCardActions?.getBoundingClientRect();
const actionTopClearance = actionRect
  ? Math.round(actionRect.top - topChromeBottom())
  : 999;
const actionBottomClearance = actionRect
  ? Math.round(bottomChromeTop() - actionRect.bottom)
  : 999;
const firstCardActionsVisible = firstCardActions
  ? isVisible(firstCardActions)
  : true;

if (firstCard) {
  firstCard.scrollIntoView({ block: "center", inline: "nearest" });
  await wait(250);
}

const finalOverflow = horizontalOverflow();
const finalText = appText();

return {
  ok:
    isMobileLayout &&
    initialText.includes("视频分析中心") &&
    initialText.includes("目标课程") &&
    initialText.includes("对应章节") &&
    initialText.includes("任务看板") &&
    !!refreshButton &&
    !!submitButton &&
    initialSubmitDisabled &&
    courseSelection.selected &&
    chapterSelection.selected &&
    finalText.includes("共") &&
    finalText.includes("任务") &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    (cardCount > 0 || emptyState) &&
    refreshInteractable &&
    submitDialogOpened &&
    submitDialogClosed &&
    submitDialogText.includes("视频课时") &&
    (!firstCard || (!!detailButton && !!refreshTaskButton)) &&
    detailOpened &&
    detailClosed &&
    firstCardActionsVisible &&
    actionTopClearance >= 0 &&
    actionBottomClearance >= 0 &&
    finalOverflow <= 4,
  isMobileLayout,
  courseSelection: {
    opened: courseSelection.opened,
    optionCount: courseSelection.optionCount,
    selectedText: courseSelection.selectedText,
    interactable: courseSelection.interactable,
    dropdownText: courseSelection.dropdownText
  },
  chapterSelection: {
    opened: chapterSelection.opened,
    optionCount: chapterSelection.optionCount,
    selectedText: chapterSelection.selectedText,
    interactable: chapterSelection.interactable,
    dropdownText: chapterSelection.dropdownText
  },
  hasRefreshButton: !!refreshButton,
  hasSubmitButton: !!submitButton,
  initialSubmitDisabled,
  refreshInteractable,
  submitDialogOpened,
  submitDialogClosed,
  submitDialogText,
  cardCount,
  emptyState,
  firstCardText,
  hasDetailButton: !!detailButton,
  hasRefreshTaskButton: !!refreshTaskButton,
  detailOpened,
  detailClosed,
  detailDialogText,
  firstCardActionsVisible,
  actionTopClearance,
  actionBottomClearance,
  mobileListDisplay,
  desktopTableDisplay,
  initialOverflow,
  finalOverflow,
  text: finalText.slice(0, 1600)
};

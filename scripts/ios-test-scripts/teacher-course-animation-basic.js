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

function findRadioByText(label) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...document.querySelectorAll(".el-radio-button")].find(radio =>
    radio.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
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

function setNativeValue(field, value) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;

  field.focus();
  if (setter) {
    setter.call(field, value);
  } else {
    field.value = value;
  }
  field.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
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

async function waitForNoLoading(timeoutMs = 9000) {
  return waitFor(
    () => !document.querySelector(".ai-animation-container .el-loading-mask"),
    timeoutMs
  );
}

await wait(1600);

const container = document.querySelector(".ai-animation-container");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const refreshButton = findButtonByText("刷新");
const syncButton = findButtonByText("同步");
const generateButton =
  findButtonByText("AI生成") || findButtonByText("AI 生成");
const initialGenerateDisabled =
  generateButton?.disabled || generateButton?.classList.contains("is-disabled");

if (!container) {
  return {
    ok: false,
    reason: "AI animation container did not render",
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
    hasSyncButton: !!syncButton,
    hasGenerateButton: !!generateButton,
    initialGenerateDisabled,
    initialOverflow,
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
    appText().includes("全部") &&
    appText().includes("成功") &&
    (document.querySelector(".mobile-animation-card") ||
      document.querySelector(".mobile-animation-list .el-empty") ||
      appText().includes("暂无数据")),
  10000
);

const afterSelectionText = appText();
const mobileList = document.querySelector(".mobile-animation-list");
const cardCount = document.querySelectorAll(".mobile-animation-card").length;
const emptyState = !!(
  document.querySelector(".mobile-animation-list .el-empty") ||
  afterSelectionText.includes("暂无数据")
);
const desktopTableDisplay = document.querySelector(".animation-table")
  ? window.getComputedStyle(document.querySelector(".animation-table")).display
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

const filterSuccess = findRadioByText("成功");
let successFilterActive = false;
if (filterSuccess) {
  clickNode(filterSuccess);
  successFilterActive = !!(await waitFor(
    () => findRadioByText("成功")?.classList.contains("is-active"),
    4000
  ));
}

const filterAll = findRadioByText("全部");
let allFilterRestored = false;
if (filterAll) {
  clickNode(filterAll);
  allFilterRestored = !!(await waitFor(
    () => findRadioByText("全部")?.classList.contains("is-active"),
    4000
  ));
}

const keywordInput = document.querySelector(
  "input[placeholder='搜索文件名...']"
);
let keywordAccepted = false;
if (keywordInput) {
  setNativeValue(keywordInput, "html");
  await wait(350);
  keywordAccepted = keywordInput.value === "html";
  setNativeValue(keywordInput, "");
  await wait(350);
}

const firstCard = document.querySelector(".mobile-animation-card");
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";
const firstCardPreview = firstCard ? findButtonByText("预览", firstCard) : null;
const firstCardDisplay = firstCard ? findButtonByText("展示", firstCard) : null;
const firstCardUrl = firstCard ? findButtonByText("URL", firstCard) : null;
const firstCardActions = firstCard?.querySelector(
  ".mobile-animation-card__actions"
);

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

const filterToolbar = document.querySelector(".filter-toolbar");
const topClearance = filterToolbar
  ? Math.round(filterToolbar.getBoundingClientRect().top - topChromeBottom())
  : 999;
const finalOverflow = horizontalOverflow();
const finalText = appText();

return {
  ok:
    isMobileLayout &&
    initialText.includes("智能动画中心") &&
    initialText.includes("目标课程") &&
    initialText.includes("对应章节") &&
    initialText.includes("任务看板") &&
    !!refreshButton &&
    !!syncButton &&
    !!generateButton &&
    initialGenerateDisabled &&
    courseSelection.selected &&
    chapterSelection.selected &&
    finalText.includes("全部") &&
    finalText.includes("成功") &&
    finalText.includes("进行中") &&
    finalText.includes("失败") &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    (cardCount > 0 || emptyState) &&
    refreshInteractable &&
    successFilterActive &&
    allFilterRestored &&
    keywordAccepted &&
    (!firstCard ||
      (!!firstCardPreview && !!firstCardDisplay && !!firstCardUrl)) &&
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
  hasSyncButton: !!syncButton,
  hasGenerateButton: !!generateButton,
  initialGenerateDisabled,
  refreshInteractable,
  successFilterActive,
  allFilterRestored,
  keywordAccepted,
  cardCount,
  emptyState,
  firstCardText,
  hasFirstCardPreview: !!firstCardPreview,
  hasFirstCardDisplay: !!firstCardDisplay,
  hasFirstCardUrl: !!firstCardUrl,
  firstCardActionsVisible,
  actionTopClearance,
  actionBottomClearance,
  mobileListDisplay,
  desktopTableDisplay,
  topClearance,
  initialOverflow,
  finalOverflow,
  text: finalText.slice(0, 1600)
};

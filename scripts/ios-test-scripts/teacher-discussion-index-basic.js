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
      target.closest?.(".el-checkbox") === node ||
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

async function closeDropdowns() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      bubbles: true
    })
  );
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  document.body.click();
  await waitFor(() => !visibleDropdown(), 1200);
}

function selectInFormItem(labelText) {
  const normalizedLabel = labelText.replace(/\s+/g, "");
  const formItem = [...document.querySelectorAll(".el-form-item")].find(item =>
    item
      .querySelector(".el-form-item__label")
      ?.textContent?.replace(/\s+/g, "")
      .includes(normalizedLabel)
  );
  const select = formItem?.querySelector(".el-select");
  const input = select?.querySelector("input") || null;
  return {
    input,
    select,
    trigger:
      select?.querySelector(".el-select__wrapper") ||
      select?.querySelector(".el-input__wrapper") ||
      select
  };
}

async function openSelectByLabel(labelText) {
  await closeDropdowns();

  const { input, select, trigger } = selectInFormItem(labelText);

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

async function chooseSelectOptionByLabel(labelText, optionText) {
  const opened = await openSelectByLabel(labelText);
  if (!opened.opened || opened.optionCount === 0) {
    document.body.click();
    await wait(250);
    return {
      ...opened,
      selected: false,
      selectedText: ""
    };
  }

  const normalizedOption = optionText.replace(/\s+/g, "");
  const option =
    opened.options.find(node =>
      node.textContent?.replace(/\s+/g, "").includes(normalizedOption)
    ) || opened.options[0];
  const selectedText = option.textContent?.replace(/\s+/g, " ").trim() || "";
  clickNode(option, false);
  await wait(900);
  await closeDropdowns();

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

async function scrollClearOfChrome(node) {
  if (!node) return false;

  node.scrollIntoView({ block: "center", inline: "nearest" });
  await wait(250);

  for (let attempt = 0; attempt < 4; attempt++) {
    const rect = node.getBoundingClientRect();
    const desiredTop = topChromeBottom() + 28;
    const desiredBottom = bottomChromeTop() - 28;

    if (rect.top >= desiredTop && rect.bottom <= desiredBottom) {
      return true;
    }

    if (rect.top < desiredTop) {
      window.scrollBy(0, rect.top - desiredTop);
    } else if (rect.bottom > desiredBottom) {
      window.scrollBy(0, rect.bottom - desiredBottom);
    }

    await wait(250);
  }

  return isVisible(node);
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
    findButtonByText("跳过", dialog) ||
    findButtonByText("取消", dialog) ||
    findButtonByText("关闭", dialog);
  if (!dialog || !closeButton) return false;

  closeButton.click();
  return !!(await waitFor(() => !isVisible(dialog), 3000));
}

function visibleMessageBox(title) {
  return [...document.querySelectorAll(".el-message-box")].find(
    box =>
      isVisible(box) &&
      (!title || box.textContent?.replace(/\s+/g, "").includes(title))
  );
}

async function closeVisibleMessageBox(title) {
  const box = visibleMessageBox(title);
  const cancelButton = findButtonByText("取消", box);
  const closeButton = box?.querySelector(".el-message-box__headerbtn");
  if (!box || (!cancelButton && !closeButton)) return false;

  (cancelButton || closeButton).click();
  return !!(await waitFor(() => !isVisible(box), 3000));
}

async function waitForNoLoading(timeoutMs = 3000) {
  return waitFor(
    () =>
      ![...document.querySelectorAll(".review-queue .el-loading-mask")].some(
        isVisible
      ),
    timeoutMs
  );
}

function mobileCards() {
  return [...document.querySelectorAll(".mobile-review-card")];
}

function allVisibleCardsInclude(label) {
  const cards = mobileCards();
  return (
    cards.length > 0 && cards.every(card => card.innerText.includes(label))
  );
}

await wait(1800);

const container = document.querySelector(".review-queue");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const searchButton = findButtonByText("查询审核");
const resetButton = findButtonByText("重置条件");
const syncButton = findButtonByText("同步数据");

if (!container) {
  return {
    ok: false,
    reason: "discussion index container did not render",
    initialOverflow,
    text: initialText.slice(0, 1200)
  };
}

const isMobileLayout = container.classList.contains("review-queue--mobile");
await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-review-list") &&
    (document.querySelector(".mobile-review-card") ||
      appText().includes("暂无待审核内容")),
  10000
);

const courseSelect = await openSelectByLabel("所属课程");
await closeDropdowns();

const initialCardCount = mobileCards().length;
const priorityHigh = await chooseSelectOptionByLabel("优先级", "高优先级");
await waitForNoLoading();
await waitFor(
  () =>
    appText().includes("已启用") ||
    appText().includes("暂无对应优先级内容") ||
    allVisibleCardsInclude("高优先级"),
  8000
);
const highText = appText();
const highCardCount = mobileCards().length;
const highFilterValid =
  (highCardCount === 0 && highText.includes("暂无对应优先级内容")) ||
  allVisibleCardsInclude("高优先级");

const priorityMedium = await chooseSelectOptionByLabel("优先级", "中优先级");
await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-review-card") ||
    appText().includes("暂无对应优先级内容"),
  8000
);
const mediumCardCount = mobileCards().length;
const mediumFilterValid =
  mediumCardCount === 0
    ? appText().includes("暂无对应优先级内容")
    : allVisibleCardsInclude("中优先级");

const priorityReset = await chooseSelectOptionByLabel("优先级", "全部");
await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-review-card") ||
    appText().includes("暂无待审核内容"),
  8000
);

const syncInteractable = syncButton ? isInteractable(syncButton) : false;

const afterFilterText = appText();
const mobileList = document.querySelector(".mobile-review-list");
const cardCount = mobileCards().length;
const emptyState = !!(
  document.querySelector(".mobile-review-list .el-empty") ||
  afterFilterText.includes("暂无待审核内容")
);
const desktopTable = document.querySelector(".el-table");
const desktopTableDisplay = desktopTable
  ? window.getComputedStyle(desktopTable).display
  : "missing";
const mobileListDisplay = mobileList
  ? window.getComputedStyle(mobileList).display
  : "missing";

const firstCard = document.querySelector(".mobile-review-card");
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";
const detailButton = firstCard ? findButtonByText("详情审核", firstCard) : null;
const approveButton = firstCard
  ? findButtonByText("直接通过", firstCard)
  : null;
const rejectButton = firstCard ? findButtonByText("违规拒绝", firstCard) : null;
const pinButton = firstCard ? findButtonByText("设为置顶", firstCard) : null;
const firstCardActions = firstCard?.querySelector(
  ".mobile-review-card__actions"
);

let selectionWorked = true;
let batchInfoVisible = true;
if (firstCard) {
  const checkbox =
    firstCard.querySelector(".el-checkbox") ||
    firstCard.querySelector(".el-checkbox__input");
  selectionWorked = false;
  batchInfoVisible = false;
  if (checkbox) {
    await scrollClearOfChrome(checkbox);
    clickNode(checkbox, false);
    selectionWorked = !!(await waitFor(
      () => firstCard.innerText.includes("已加入批量处理"),
      3000
    ));
    batchInfoVisible = appText().includes("已选中 1 个待审项");
    await scrollClearOfChrome(checkbox);
    clickNode(checkbox, false);
    await wait(250);
  }
}

let detailOpened = true;
let detailClosed = true;
let detailDialogText = "";
let detailDialogRect = null;
let detailFooterClearance = 999;
if (detailButton) {
  await scrollClearOfChrome(detailButton);
  clickNode(detailButton, false);
  const dialog = await waitFor(() => visibleDialog("内容审核"), 5000);
  detailOpened = !!dialog;
  detailDialogText = dialog?.innerText.replace(/\s+/g, " ").slice(0, 700) || "";
  detailDialogRect = rectOf(dialog);
  const footer = dialog?.querySelector(".el-dialog__footer");
  const footerRect = footer?.getBoundingClientRect();
  detailFooterClearance = footerRect
    ? Math.round(bottomChromeTop() - footerRect.bottom)
    : 999;
  detailClosed = detailOpened ? await closeVisibleDialog("内容审核") : false;
  await wait(300);
}

let rejectPromptOpened = true;
let rejectPromptClosed = true;
if (rejectButton) {
  await scrollClearOfChrome(rejectButton);
  clickNode(rejectButton, false);
  const box = await waitFor(() => visibleMessageBox("拒绝审核"), 5000);
  rejectPromptOpened = !!box;
  rejectPromptClosed = rejectPromptOpened
    ? await closeVisibleMessageBox("拒绝审核")
    : false;
  await wait(300);
}

if (firstCardActions) {
  await scrollClearOfChrome(firstCardActions);
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

const finalOverflow = horizontalOverflow();
const finalText = appText();

return {
  ok:
    isMobileLayout &&
    initialText.includes("待审核内容") &&
    initialText.includes("高风险预警") &&
    initialText.includes("平均处理时效") &&
    initialText.includes("筛选条件") &&
    initialText.includes("内容审核列表") &&
    !!searchButton &&
    !!resetButton &&
    !!syncButton &&
    priorityHigh.selected &&
    priorityMedium.selected &&
    priorityReset.selected &&
    highFilterValid &&
    mediumFilterValid &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    (cardCount > 0 || emptyState) &&
    syncInteractable &&
    selectionWorked &&
    batchInfoVisible &&
    (!firstCard ||
      (!!detailButton &&
        !!approveButton &&
        !!rejectButton &&
        firstCardText.includes("已等待"))) &&
    detailOpened &&
    detailClosed &&
    detailDialogText.includes("内容审核") &&
    rejectPromptOpened &&
    rejectPromptClosed &&
    firstCardActionsVisible &&
    actionTopClearance >= 0 &&
    actionBottomClearance >= 0 &&
    detailFooterClearance >= 0 &&
    finalOverflow <= 4,
  isMobileLayout,
  courseSelect: {
    opened: courseSelect.opened,
    optionCount: courseSelect.optionCount,
    interactable: courseSelect.interactable,
    disabled: courseSelect.disabled,
    dropdownText: courseSelect.dropdownText
  },
  priorityHigh: {
    opened: priorityHigh.opened,
    optionCount: priorityHigh.optionCount,
    selectedText: priorityHigh.selectedText,
    interactable: priorityHigh.interactable
  },
  priorityMedium: {
    opened: priorityMedium.opened,
    optionCount: priorityMedium.optionCount,
    selectedText: priorityMedium.selectedText,
    interactable: priorityMedium.interactable
  },
  priorityReset: {
    opened: priorityReset.opened,
    optionCount: priorityReset.optionCount,
    selectedText: priorityReset.selectedText,
    interactable: priorityReset.interactable
  },
  hasSearchButton: !!searchButton,
  hasResetButton: !!resetButton,
  hasSyncButton: !!syncButton,
  syncInteractable,
  initialCardCount,
  highCardCount,
  highFilterValid,
  mediumCardCount,
  mediumFilterValid,
  cardCount,
  emptyState,
  firstCardText,
  hasDetailButton: !!detailButton,
  hasApproveButton: !!approveButton,
  hasRejectButton: !!rejectButton,
  hasPinButton: !!pinButton,
  selectionWorked,
  batchInfoVisible,
  detailOpened,
  detailClosed,
  detailDialogText,
  detailDialogRect,
  detailFooterClearance,
  rejectPromptOpened,
  rejectPromptClosed,
  firstCardActionsVisible,
  actionTopClearance,
  actionBottomClearance,
  mobileListDisplay,
  desktopTableDisplay,
  initialOverflow,
  finalOverflow,
  text: finalText.slice(0, 1600)
};

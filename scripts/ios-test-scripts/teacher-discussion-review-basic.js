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

function findTextNodeByText(selector, label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll(selector)].find(
    node =>
      isVisible(node) &&
      node.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
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
    findButtonByText("关闭", dialog) ||
    findButtonByText("跳过", dialog);
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

async function waitForNoLoading(timeoutMs = 9000) {
  return waitFor(
    () => !document.querySelector(".discussion-manage .el-loading-mask"),
    timeoutMs
  );
}

await wait(1800);

const container = document.querySelector(".discussion-manage");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const searchButton = findButtonByText("查询");
const resetButton = findButtonByText("重置");
const syncButton = findButtonByText("同步状态");

if (!container) {
  return {
    ok: false,
    reason: "discussion review container did not render",
    initialOverflow,
    text: initialText.slice(0, 1200)
  };
}

const isMobileLayout = container.classList.contains(
  "discussion-manage--mobile"
);
await waitForNoLoading();

const typeSelection = await chooseSelectOptionByLabel("内容类型", "帖子");
await waitForNoLoading();
const typeReset = await chooseSelectOptionByLabel("内容类型", "全部");
await waitForNoLoading();

const courseSelect = await openSelectByLabel("归属课程");
document.body.click();
await wait(250);

if (searchButton) {
  clickNode(searchButton);
  await waitForNoLoading();
}

const afterFilterText = appText();
const mobileList = document.querySelector(".mobile-discussion-list");
const cardCount = document.querySelectorAll(".mobile-discussion-card").length;
const emptyState = !!(
  document.querySelector(".mobile-discussion-list .el-empty") ||
  afterFilterText.includes("暂无匹配内容")
);
const desktopTable = document.querySelector(".el-table");
const desktopTableDisplay = desktopTable
  ? window.getComputedStyle(desktopTable).display
  : "missing";
const mobileListDisplay = mobileList
  ? window.getComputedStyle(mobileList).display
  : "missing";

let syncInteractable = syncButton ? isInteractable(syncButton) : false;
if (syncButton && !syncButton.disabled) {
  clickNode(syncButton);
  syncInteractable = syncInteractable || isInteractable(syncButton);
  await waitForNoLoading();
}

const firstCard = document.querySelector(".mobile-discussion-card");
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";
const detailButton = firstCard ? findButtonByText("详情", firstCard) : null;
const approveButton = firstCard ? findButtonByText("通过", firstCard) : null;
const rejectButton = firstCard ? findButtonByText("拒绝", firstCard) : null;
const moreButton = firstCard ? findButtonByText("更多操作", firstCard) : null;
const firstCardActions = firstCard?.querySelector(
  ".mobile-discussion-card__actions"
);

let selectionWorked = true;
let batchButtonsVisible = true;
if (firstCard) {
  const checkbox =
    firstCard.querySelector(".el-checkbox") ||
    firstCard.querySelector(".el-checkbox__input");
  selectionWorked = false;
  batchButtonsVisible = false;
  if (checkbox) {
    clickNode(checkbox);
    selectionWorked = !!(await waitFor(
      () => firstCard.innerText.includes("已加入批量操作"),
      3000
    ));
    const batchApprove = findButtonByText("批量通过");
    const batchReject = findButtonByText("批量拒绝");
    batchButtonsVisible = !!batchApprove && !!batchReject;
    clickNode(checkbox);
    await wait(250);
  }
}

let detailOpened = true;
let detailClosed = true;
let detailDialogText = "";
let detailDialogRect = null;
let detailFooterClearance = 999;
if (detailButton) {
  clickNode(detailButton);
  const dialog = await waitFor(() => visibleDialog("内容审核"), 7000);
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
  clickNode(rejectButton);
  const box = await waitFor(() => visibleMessageBox("拒绝审核"), 5000);
  rejectPromptOpened = !!box;
  rejectPromptClosed = rejectPromptOpened
    ? await closeVisibleMessageBox("拒绝审核")
    : false;
  await wait(300);
}

let moreMenuOpened = true;
let moreMenuText = "";
let editDialogOpened = true;
let editDialogClosed = true;
if (moreButton) {
  clickNode(moreButton);
  const dropdown = await waitFor(visibleDropdown, 5000);
  moreMenuOpened = !!dropdown;
  moreMenuText = dropdown?.innerText.replace(/\s+/g, " ").slice(0, 500) || "";
  const editItem = dropdown
    ? findTextNodeByText(".el-dropdown-menu__item", "编辑内容", dropdown)
    : null;
  if (editItem) {
    clickNode(editItem, false);
    const dialog = await waitFor(
      () => visibleDialog("编辑帖子") || visibleDialog("编辑回复"),
      5000
    );
    editDialogOpened = !!dialog;
    editDialogClosed = editDialogOpened
      ? await closeVisibleDialog(
          dialog.innerText.includes("编辑回复") ? "编辑回复" : "编辑帖子"
        )
      : false;
    await wait(300);
  }
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

const finalOverflow = horizontalOverflow();
const finalText = appText();

return {
  ok:
    isMobileLayout &&
    initialText.includes("库内讨论总量") &&
    initialText.includes("学生互动回复") &&
    initialText.includes("当前待处理审查") &&
    initialText.includes("筛选条件") &&
    initialText.includes("讨论列表") &&
    !!searchButton &&
    !!resetButton &&
    !!syncButton &&
    typeSelection.selected &&
    typeReset.selected &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    (cardCount > 0 || emptyState) &&
    syncInteractable &&
    selectionWorked &&
    batchButtonsVisible &&
    (!firstCard ||
      (!!detailButton &&
        !!approveButton &&
        !!rejectButton &&
        !!moreButton &&
        firstCardText.includes("低风险"))) &&
    detailOpened &&
    detailClosed &&
    detailDialogText.includes("内容审核") &&
    rejectPromptOpened &&
    rejectPromptClosed &&
    moreMenuOpened &&
    moreMenuText.includes("编辑内容") &&
    editDialogOpened &&
    editDialogClosed &&
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
  typeSelection: {
    opened: typeSelection.opened,
    optionCount: typeSelection.optionCount,
    selectedText: typeSelection.selectedText,
    interactable: typeSelection.interactable
  },
  typeReset: {
    opened: typeReset.opened,
    optionCount: typeReset.optionCount,
    selectedText: typeReset.selectedText,
    interactable: typeReset.interactable
  },
  hasSearchButton: !!searchButton,
  hasResetButton: !!resetButton,
  hasSyncButton: !!syncButton,
  syncInteractable,
  cardCount,
  emptyState,
  firstCardText,
  hasDetailButton: !!detailButton,
  hasApproveButton: !!approveButton,
  hasRejectButton: !!rejectButton,
  hasMoreButton: !!moreButton,
  selectionWorked,
  batchButtonsVisible,
  detailOpened,
  detailClosed,
  detailDialogText,
  detailDialogRect,
  detailFooterClearance,
  rejectPromptOpened,
  rejectPromptClosed,
  moreMenuOpened,
  moreMenuText,
  editDialogOpened,
  editDialogClosed,
  firstCardActionsVisible,
  actionTopClearance,
  actionBottomClearance,
  mobileListDisplay,
  desktopTableDisplay,
  initialOverflow,
  finalOverflow,
  text: finalText.slice(0, 1600)
};

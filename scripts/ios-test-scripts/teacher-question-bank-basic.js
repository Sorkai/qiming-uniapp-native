function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 8000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(180);
  }
  return null;
}

function compactText(node = document.body) {
  return (node?.innerText || "").replace(/\s+/g, " ").trim();
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
    rect.width > 8 &&
    rect.height > 8 &&
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
      target.closest?.(".el-input") === node ||
      target.closest?.(".el-checkbox") === node)
  );
}

function findButtonByText(label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
}

function findVisibleButtonByText(label, root = document) {
  return [...root.querySelectorAll("button")].find(
    button =>
      isVisible(button) &&
      button.textContent?.replace(/\s+/g, "").includes(label)
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

function setInputValue(input, value) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function scrollHost() {
  const candidates = [
    document.getElementById("app"),
    document.querySelector(".app-wrapper"),
    document.querySelector(".mobile-main-container"),
    document.querySelector(".main-container"),
    document.querySelector(".app-main"),
    document.querySelector(".app-main-nofixed-header"),
    document.querySelector(".app-main > .el-scrollbar > .el-scrollbar__wrap"),
    document.querySelector(
      ".main-container > .el-scrollbar > .el-scrollbar__wrap"
    ),
    document.scrollingElement,
    document.documentElement
  ].filter(Boolean);

  return (
    candidates
      .filter(node => node.scrollHeight > node.clientHeight + 12)
      .sort(
        (left, right) =>
          right.scrollHeight -
          right.clientHeight -
          (left.scrollHeight - left.clientHeight)
      )[0] ||
    document.scrollingElement ||
    document.documentElement
  );
}

function setScrollTop(node, top) {
  if (!node) return;

  node.scrollTop = Math.max(0, top);
  node.dispatchEvent(new Event("scroll", { bubbles: true }));
  if (node === document.scrollingElement || node === document.documentElement) {
    window.scrollTo({ left: 0, top: Math.max(0, top) });
  }
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
  await wait(220);

  for (let attempt = 0; attempt < 5; attempt++) {
    const host = scrollHost();
    const rect = node.getBoundingClientRect();
    const desiredTop = topChromeBottom() + 24;
    const desiredBottom = bottomChromeTop() - 24;

    if (rect.top >= desiredTop && rect.bottom <= desiredBottom) {
      return true;
    }

    if (rect.top < desiredTop) {
      setScrollTop(host, host.scrollTop + rect.top - desiredTop);
    } else if (rect.bottom > desiredBottom) {
      setScrollTop(host, host.scrollTop + rect.bottom - desiredBottom);
    }

    await wait(220);
  }

  return isVisible(node);
}

async function waitForNoLoading(timeoutMs = 9000) {
  return waitFor(
    () =>
      ![...document.querySelectorAll(".question-bank .el-loading-mask")].some(
        isVisible
      ),
    timeoutMs
  );
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

async function chooseToolbarSelect(index, optionText) {
  await closeDropdowns();

  const select = document.querySelectorAll(".toolbar-left .el-select")[index];
  const trigger =
    select?.querySelector(".el-select__wrapper") ||
    select?.querySelector(".el-input__wrapper") ||
    select;

  if (!select || !trigger) {
    return {
      exists: false,
      opened: false,
      selected: false,
      optionCount: 0,
      interactable: false,
      optionInteractable: false,
      rect: null
    };
  }

  await scrollClearOfChrome(trigger);
  const interactable = isInteractable(trigger);
  clickNode(trigger, false);
  const dropdown = await waitFor(visibleDropdown, 5000);
  const options = visibleOptions(dropdown);
  const normalizedOption = optionText.replace(/\s+/g, "");
  const option =
    options.find(node =>
      node.textContent?.replace(/\s+/g, "").includes(normalizedOption)
    ) || options[0];
  const optionInteractable = option ? isInteractable(option) : false;
  const selectedText = option?.textContent?.replace(/\s+/g, " ").trim() || "";

  if (option) {
    clickNode(option, false);
    await wait(650);
  }

  await closeDropdowns();
  await waitForNoLoading();

  return {
    exists: true,
    opened: !!dropdown,
    selected: !!option,
    selectedText,
    optionCount: options.length,
    interactable,
    optionInteractable,
    rect: rectOf(trigger),
    dropdownText: dropdown?.innerText.replace(/\s+/g, " ").slice(0, 500) || ""
  };
}

function visibleDialog() {
  return [...document.querySelectorAll(".el-dialog, .el-message-box")].find(
    node => isVisible(node) && compactText(node)
  );
}

async function openDialogWithButton(label) {
  const button = findButtonByText(label);
  if (!button) {
    return {
      opened: false,
      buttonExists: false,
      buttonInteractable: false,
      text: ""
    };
  }

  await scrollClearOfChrome(button);
  const buttonInteractable = isInteractable(button);
  clickNode(button, false);
  const dialog = await waitFor(visibleDialog, 6000);

  return {
    opened: !!dialog,
    buttonExists: true,
    buttonInteractable,
    text: compactText(dialog).slice(0, 700),
    rect: rectOf(dialog)
  };
}

async function closeVisibleDialog() {
  const dialog = visibleDialog();
  if (!dialog) return true;

  const cancel =
    findVisibleButtonByText("取消", dialog) ||
    dialog.querySelector(".el-dialog__headerbtn") ||
    dialog.querySelector(".el-message-box__headerbtn");
  clickNode(cancel, false);

  return !!(await waitFor(() => !visibleDialog(), 2500));
}

await wait(1800);

const page = await waitFor(() => document.querySelector(".question-bank"));
const initialText = compactText();
const initialOverflow = horizontalOverflow();

if (!page) {
  return {
    ok: false,
    reason: "question bank page did not render",
    href: location.href,
    text: initialText.slice(0, 1200),
    initialOverflow
  };
}

await waitForNoLoading();
await waitFor(
  () =>
    document.querySelectorAll(".stat-card").length >= 4 &&
    compactText().includes("题库管理"),
  10000
);

const viewportWidth = Math.round(
  window.visualViewport?.width || window.innerWidth
);
const viewportHeight = Math.round(
  window.visualViewport?.height || window.innerHeight
);
const isMobileViewport = viewportWidth <= 768;
const requiredText = [
  "题库管理",
  "题库分类",
  "题目总数",
  "单选题",
  "多选题",
  "简答题",
  "新建文件夹",
  "新建题目",
  "导入",
  "导出",
  "移动",
  "批量删除"
];

const statCards = [...document.querySelectorAll(".stat-card")];
const folderItems = [...document.querySelectorAll(".folder-item")];
const mobileList = document.querySelector(".question-mobile-list");
const initialMobileCards = [
  ...document.querySelectorAll(".question-mobile-card")
];
const desktopTable = document.querySelector(".question-table");
const desktopTableDisplay = desktopTable
  ? window.getComputedStyle(desktopTable).display
  : "missing";
const mobileListDisplay = mobileList
  ? window.getComputedStyle(mobileList).display
  : "missing";

const searchInput = document.querySelector(".toolbar-left .el-input input");
if (searchInput) {
  await scrollClearOfChrome(searchInput);
  setInputValue(searchInput, "Linux");
  await waitForNoLoading();
  await wait(350);
}

const typeSelection = await chooseToolbarSelect(0, "单选题");
const difficultySelection = await chooseToolbarSelect(1, "中等");
const filteredMobileCards = [
  ...document.querySelectorAll(".question-mobile-card")
];

const newQuestionDialog = await openDialogWithButton("新建题目");
const newQuestionOk =
  newQuestionDialog.opened &&
  ["新建题目", "题型", "难度", "题目内容", "正确答案", "保存"].every(label =>
    newQuestionDialog.text.includes(label)
  );
const closeNewQuestionOk = await closeVisibleDialog();

const newFolderDialog = await openDialogWithButton("新建文件夹");
const newFolderOk =
  newFolderDialog.opened &&
  ["新建文件夹", "名称", "保存"].every(label =>
    newFolderDialog.text.includes(label)
  );
const closeNewFolderOk = await closeVisibleDialog();

const importDialog = await openDialogWithButton("导入");
const importOk =
  importDialog.opened &&
  ["导入题目", "点击上传", "目标文件夹", "下载导入模板"].every(label =>
    importDialog.text.includes(label)
  );
const closeImportOk = await closeVisibleDialog();

const exportDialog = await openDialogWithButton("导出");
const exportOk =
  exportDialog.opened &&
  ["导出题目", "导出范围", "导出格式", "Excel", "Word", "JSON"].every(label =>
    exportDialog.text.includes(label)
  );
const closeExportOk = await closeVisibleDialog();

let moveDialog = {
  opened: false,
  buttonExists: false,
  buttonInteractable: false,
  text: "",
  rect: null
};
let moveOk = filteredMobileCards.length === 0;
const firstCardMove = filteredMobileCards[0]
  ? [...filteredMobileCards[0].querySelectorAll("button")].find(button =>
      button.textContent?.replace(/\s+/g, "").includes("移动")
    )
  : null;
if (firstCardMove) {
  await scrollClearOfChrome(firstCardMove);
  const buttonInteractable = isInteractable(firstCardMove);
  clickNode(firstCardMove, false);
  const dialog = await waitFor(visibleDialog, 6000);
  moveDialog = {
    opened: !!dialog,
    buttonExists: true,
    buttonInteractable,
    text: compactText(dialog).slice(0, 700),
    rect: rectOf(dialog)
  };
  moveOk =
    moveDialog.opened &&
    ["移动到文件夹", "目标文件夹", "确定"].every(label =>
      moveDialog.text.includes(label)
    );
  await closeVisibleDialog();
}

const bottomTarget =
  document.querySelector(".pagination-wrapper") ||
  document.querySelector(".question-mobile-card:last-child") ||
  document.querySelector(".mobile-empty");
if (bottomTarget) {
  await scrollClearOfChrome(bottomTarget);
}
const bottomRect = bottomTarget?.getBoundingClientRect();
const bottomClearance = bottomRect
  ? Math.round(bottomChromeTop() - bottomRect.bottom)
  : 999;
const bottomVisible = bottomTarget ? isVisible(bottomTarget) : false;
const finalText = compactText();
const finalOverflow = horizontalOverflow();

return {
  ok:
    isMobileViewport &&
    requiredText.every(label => finalText.includes(label)) &&
    statCards.length >= 4 &&
    folderItems.length >= 1 &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    !!searchInput &&
    filteredMobileCards.length >= 1 &&
    typeSelection.selected &&
    typeSelection.optionInteractable &&
    difficultySelection.selected &&
    difficultySelection.optionInteractable &&
    newQuestionOk &&
    closeNewQuestionOk &&
    newFolderOk &&
    closeNewFolderOk &&
    importOk &&
    closeImportOk &&
    exportOk &&
    closeExportOk &&
    moveOk &&
    bottomVisible &&
    bottomClearance >= 0 &&
    finalOverflow <= 4,
  href: location.href,
  viewport: {
    width: viewportWidth,
    height: viewportHeight
  },
  isMobileViewport,
  requiredTextPresent: requiredText.filter(label => finalText.includes(label)),
  statCardCount: statCards.length,
  folderItemCount: folderItems.length,
  mobileListDisplay,
  initialMobileCardCount: initialMobileCards.length,
  mobileCardCount: filteredMobileCards.length,
  desktopTableDisplay,
  searchInput: {
    exists: !!searchInput,
    interactable: searchInput ? isInteractable(searchInput) : false,
    rect: rectOf(searchInput)
  },
  typeSelection,
  difficultySelection,
  dialogs: {
    newQuestion: newQuestionDialog,
    newQuestionOk,
    newFolder: newFolderDialog,
    newFolderOk,
    import: importDialog,
    importOk,
    export: exportDialog,
    exportOk,
    move: moveDialog,
    moveOk
  },
  bottomTarget: {
    exists: !!bottomTarget,
    rect: rectOf(bottomTarget),
    visible: bottomVisible,
    clearance: bottomClearance
  },
  scrollHost: {
    scrollTop: Math.round(scrollHost().scrollTop || 0),
    scrollHeight: Math.round(scrollHost().scrollHeight || 0),
    clientHeight: Math.round(scrollHost().clientHeight || 0)
  },
  initialOverflow,
  finalOverflow,
  text: finalText.slice(0, 1800)
};

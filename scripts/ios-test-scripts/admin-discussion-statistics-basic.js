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
      target.closest?.(".el-input") === node ||
      target.closest?.(".el-date-editor") === node)
  );
}

function findButtonByText(label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
}

function findVisibleTextNode(selector, label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll(selector)].find(
    node =>
      isVisible(node) &&
      node.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
}

function findTextNode(selector, label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll(selector)].find(node =>
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
    await closeDropdowns();
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
  const optionInteractable = isInteractable(option);
  clickNode(option, false);
  await wait(900);
  await closeDropdowns();

  return {
    ...opened,
    selected: true,
    selectedText,
    optionInteractable
  };
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

async function waitForNoLoading(timeoutMs = 9000) {
  return waitFor(
    () =>
      ![
        ...document.querySelectorAll(".statistics-container .el-loading-mask")
      ].some(isVisible),
    timeoutMs
  );
}

async function scrollClearOfChrome(node) {
  if (!node) return false;

  node.scrollIntoView({ block: "center", inline: "nearest" });
  await wait(250);

  for (let attempt = 0; attempt < 4; attempt++) {
    const host = scrollHost();
    const rect = node.getBoundingClientRect();
    const desiredTop = topChromeBottom() + 28;
    const desiredBottom = bottomChromeTop() - 28;

    if (rect.top >= desiredTop && rect.bottom <= desiredBottom) {
      return true;
    }

    if (rect.top < desiredTop) {
      setScrollTop(host, host.scrollTop + rect.top - desiredTop);
    } else if (rect.bottom > desiredBottom) {
      setScrollTop(host, host.scrollTop + rect.bottom - desiredBottom);
    }

    await wait(250);
  }

  return isVisible(node);
}

function chartState(label) {
  const heading =
    findTextNode(".el-card__header", label) ||
    findVisibleTextNode(".el-card__header", label);
  const card = heading?.closest(".el-card");
  const chartRoot = card?.querySelector(".el-card__body > div");
  const canvas = chartRoot?.querySelector("canvas");
  const svg = chartRoot?.querySelector("svg");
  const rect = rectOf(chartRoot);
  const canvasRect = rectOf(canvas || svg);

  return {
    label,
    rendered: !!(chartRoot && (canvas || svg)),
    rect,
    canvasRect,
    text: card?.innerText.replace(/\s+/g, " ").slice(0, 300) || ""
  };
}

function dateRangeState() {
  const formItem = [...document.querySelectorAll(".el-form-item")].find(item =>
    item
      .querySelector(".el-form-item__label")
      ?.textContent?.replace(/\s+/g, "")
      .includes("时间范围")
  );
  const picker =
    formItem?.querySelector(".el-date-editor") ||
    formItem?.querySelector(".el-input__wrapper") ||
    null;
  return {
    exists: !!picker,
    interactable: picker ? isInteractable(picker) : false,
    rect: rectOf(picker)
  };
}

await wait(1800);

const container = document.querySelector(".statistics-container");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const syncButton = findButtonByText("同步最新数据");
const searchButton = findButtonByText("搜索");
const resetButton = findButtonByText("重置");

if (!container) {
  return {
    ok: false,
    reason: "statistics container did not render",
    initialOverflow,
    text: initialText.slice(0, 1200)
  };
}

await waitForNoLoading();
await waitFor(
  () =>
    document.querySelectorAll(".stat-card-modern").length >= 6 &&
    document.querySelectorAll(".pending-card").length >= 3,
  10000
);
await waitFor(
  () =>
    [
      "近七日讨论活跃度趋势",
      "内容构成",
      "待处理分布",
      "平台角色活跃分布"
    ].every(label => chartState(label).rendered),
  12000
);

const viewportWidth = Math.round(
  window.visualViewport?.width || window.innerWidth
);
const viewportHeight = Math.round(
  window.visualViewport?.height || window.innerHeight
);
const isMobileViewport = viewportWidth <= 768;
const statCards = [...document.querySelectorAll(".stat-card-modern")];
const pendingCards = [...document.querySelectorAll(".pending-card")];
const allStatLabels = [
  "总帖子数",
  "总回复数",
  "总点赞数",
  "活跃用户数",
  "今日新帖",
  "今日新回复",
  "待审核帖子",
  "待审核回复",
  "待处理举报"
];
const requiredSections = [
  "核心数据指标",
  "待处理任务预警",
  "近七日讨论活跃度趋势",
  "内容构成",
  "待处理分布",
  "平台角色活跃分布",
  "热门课程讨论排行",
  "全平台操作审计日志"
];

const chartLabels = [
  "近七日讨论活跃度趋势",
  "内容构成",
  "待处理分布",
  "平台角色活跃分布"
];
const charts = chartLabels.map(chartState);

if (syncButton) {
  await scrollClearOfChrome(syncButton);
  clickNode(syncButton, false);
  await waitForNoLoading();
}

const courseSelectTrigger =
  document.querySelector(".statistics-toolbar__select .el-select__wrapper") ||
  document.querySelector(".statistics-toolbar__select .el-input__wrapper") ||
  document.querySelector(".statistics-toolbar__select");
const courseSelect = {
  exists: !!courseSelectTrigger,
  interactable: courseSelectTrigger
    ? isInteractable(courseSelectTrigger)
    : false,
  rect: rectOf(courseSelectTrigger)
};

const targetTypeSelection = await chooseSelectOptionByLabel("目标类型", "帖子");
if (searchButton) {
  await scrollClearOfChrome(searchButton);
  clickNode(searchButton, false);
}
await waitForNoLoading();
await wait(400);

const afterFilterText = appText();
const auditMobileList = document.querySelector(".audit-log-list");
const auditCards = [...document.querySelectorAll(".audit-log-card")];
const auditEmpty = !!(
  document.querySelector(".audit-log-list .el-empty") ||
  afterFilterText.includes("暂无审计日志")
);
const auditDesktopTable = document.querySelector(
  ".statistics-container > .el-card:last-child .el-table"
);
const auditDesktopTableDisplay = auditDesktopTable
  ? window.getComputedStyle(auditDesktopTable).display
  : "missing";
const auditMobileListDisplay = auditMobileList
  ? window.getComputedStyle(auditMobileList).display
  : "missing";

const topCourseList = document.querySelector(".top-course-list");
const topCourseCards = [...document.querySelectorAll(".top-course-card")];
const topCourseEmpty = afterFilterText.includes("暂无热门课程数据");
const topCourseDesktopTable = [...document.querySelectorAll(".el-card")]
  .find(card => card.innerText.includes("热门课程讨论排行"))
  ?.querySelector(".el-table");
const topCourseDesktopTableDisplay = topCourseDesktopTable
  ? window.getComputedStyle(topCourseDesktopTable).display
  : "missing";
const topCourseListDisplay = topCourseList
  ? window.getComputedStyle(topCourseList).display
  : "missing";

const dateRange = dateRangeState();
const resetInteractable = resetButton ? isInteractable(resetButton) : false;
const searchInteractable = searchButton ? isInteractable(searchButton) : false;
if (resetButton) {
  await scrollClearOfChrome(resetButton);
  clickNode(resetButton, false);
  await waitForNoLoading();
}

const pagination = document.querySelector(".pagination-bar");
const bottomTarget =
  document.querySelector(".pagination-bar") ||
  document.querySelector(".audit-log-card:last-child") ||
  document.querySelector(".audit-log-list .el-empty");
if (bottomTarget) {
  await scrollClearOfChrome(bottomTarget);
}

const bottomRect = bottomTarget?.getBoundingClientRect();
const bottomClearance = bottomRect
  ? Math.round(bottomChromeTop() - bottomRect.bottom)
  : 999;
const bottomVisible = bottomTarget ? isVisible(bottomTarget) : false;
const finalOverflow = horizontalOverflow();
const finalText = appText();

return {
  ok:
    isMobileViewport &&
    requiredSections.every(label => finalText.includes(label)) &&
    allStatLabels.every(label => finalText.includes(label)) &&
    statCards.length >= 6 &&
    pendingCards.length >= 3 &&
    charts.every(
      chart =>
        chart.rendered &&
        chart.rect?.width >= 240 &&
        chart.rect?.height >= 240 &&
        chart.canvasRect?.width >= 120 &&
        chart.canvasRect?.height >= 120
    ) &&
    !!syncButton &&
    courseSelect.exists &&
    courseSelect.interactable &&
    targetTypeSelection.selected &&
    targetTypeSelection.optionInteractable &&
    !!searchButton &&
    !!resetButton &&
    searchInteractable &&
    resetInteractable &&
    dateRange.exists &&
    auditMobileListDisplay !== "missing" &&
    (auditDesktopTableDisplay === "none" ||
      auditDesktopTableDisplay === "missing") &&
    (auditCards.length > 0 || auditEmpty) &&
    topCourseListDisplay !== "missing" &&
    (topCourseDesktopTableDisplay === "none" ||
      topCourseDesktopTableDisplay === "missing") &&
    (topCourseCards.length > 0 || topCourseEmpty) &&
    !!pagination &&
    bottomVisible &&
    bottomClearance >= 0 &&
    finalOverflow <= 4,
  viewport: {
    width: viewportWidth,
    height: viewportHeight
  },
  isMobileViewport,
  requiredSectionsPresent: requiredSections.filter(label =>
    finalText.includes(label)
  ),
  statLabelsPresent: allStatLabels.filter(label => finalText.includes(label)),
  statCardCount: statCards.length,
  pendingCardCount: pendingCards.length,
  charts,
  hasSyncButton: !!syncButton,
  courseSelect,
  targetTypeSelection: {
    opened: targetTypeSelection.opened,
    optionCount: targetTypeSelection.optionCount,
    selectedText: targetTypeSelection.selectedText,
    interactable: targetTypeSelection.interactable,
    optionInteractable: targetTypeSelection.optionInteractable,
    dropdownText: targetTypeSelection.dropdownText
  },
  hasSearchButton: !!searchButton,
  hasResetButton: !!resetButton,
  searchInteractable,
  resetInteractable,
  dateRange,
  auditMobileListDisplay,
  auditDesktopTableDisplay,
  auditCardCount: auditCards.length,
  auditEmpty,
  topCourseListDisplay,
  topCourseDesktopTableDisplay,
  topCourseCardCount: topCourseCards.length,
  topCourseEmpty,
  hasPagination: !!pagination,
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

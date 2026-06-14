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
      target.closest?.(".template-card") === node ||
      target.closest?.(".paper-item") === node ||
      target.closest?.(".quick-link-item") === node)
  );
}

function findButtonByText(label, root = document) {
  const normalizedLabel = label.replace(/\s+/g, "");
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(normalizedLabel)
  );
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

async function chooseCourseOption(optionText) {
  await closeDropdowns();
  const trigger =
    document.querySelector(".course-filter .el-select__wrapper") ||
    document.querySelector(".course-filter .el-input__wrapper") ||
    document.querySelector(".course-filter");

  if (!trigger) {
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
  trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  trigger.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  trigger.click();
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
    option.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    option.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    option.click();
    await wait(650);
  }

  await closeDropdowns();

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

await wait(1800);

const page = await waitFor(() => document.querySelector(".exam-paper-index"));
const initialText = compactText();
const initialOverflow = horizontalOverflow();

if (!page) {
  return {
    ok: false,
    reason: "exam overview page did not render",
    href: location.href,
    text: initialText.slice(0, 1200),
    initialOverflow
  };
}

await waitFor(
  () =>
    document.querySelectorAll(".stat-card").length >= 4 &&
    document.querySelectorAll(".template-card").length >= 4 &&
    compactText().includes("题目组卷器"),
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
  "智能组卷系统",
  "题目组卷器",
  "新建空白试卷",
  "试卷总数",
  "已发布",
  "待阅卷",
  "平均分",
  "从模板开始",
  "标准考试模板",
  "快速测验模板",
  "最近编辑",
  "学情概览",
  "及格率",
  "优秀率",
  "参与人数",
  "快捷入口",
  "阅卷管理",
  "我的试卷",
  "学情分析",
  "试卷模板"
];

const statCards = [...document.querySelectorAll(".stat-card")];
const templateCards = [...document.querySelectorAll(".template-card")];
const recentPapers = [...document.querySelectorAll(".paper-item")];
const quickLinks = [...document.querySelectorAll(".quick-link-item")];
const createButton = findButtonByText("新建空白试卷");
const viewDetailButton = findButtonByText("查看详细分析");

if (createButton) {
  await scrollClearOfChrome(createButton);
}
const createButtonInteractable = createButton
  ? isInteractable(createButton)
  : false;

const firstTemplate = templateCards[0] || null;
if (firstTemplate) {
  await scrollClearOfChrome(firstTemplate);
}
const firstTemplateInteractable = firstTemplate
  ? isInteractable(firstTemplate)
  : false;

const firstRecent = recentPapers[0] || null;
if (firstRecent) {
  await scrollClearOfChrome(firstRecent);
}
const firstRecentInteractable = firstRecent
  ? isInteractable(firstRecent)
  : false;

const courseSelection = await chooseCourseOption("高等数学");

const bottomTarget =
  quickLinks[quickLinks.length - 1] ||
  document.querySelector(".side-content .section-card:last-child") ||
  page;
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
    templateCards.length >= 4 &&
    recentPapers.length >= 1 &&
    quickLinks.length >= 4 &&
    !!createButton &&
    createButtonInteractable &&
    !!viewDetailButton &&
    firstTemplate &&
    firstTemplateInteractable &&
    firstRecent &&
    firstRecentInteractable &&
    courseSelection.selected &&
    courseSelection.optionInteractable &&
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
  templateCardCount: templateCards.length,
  recentPaperCount: recentPapers.length,
  quickLinkCount: quickLinks.length,
  createButton: {
    exists: !!createButton,
    interactable: createButtonInteractable,
    rect: rectOf(createButton)
  },
  viewDetailButton: {
    exists: !!viewDetailButton,
    interactable: viewDetailButton ? isInteractable(viewDetailButton) : false,
    rect: rectOf(viewDetailButton)
  },
  firstTemplate: {
    exists: !!firstTemplate,
    interactable: firstTemplateInteractable,
    rect: rectOf(firstTemplate),
    text: firstTemplate?.innerText.replace(/\s+/g, " ").slice(0, 300) || ""
  },
  firstRecent: {
    exists: !!firstRecent,
    interactable: firstRecentInteractable,
    rect: rectOf(firstRecent),
    text: firstRecent?.innerText.replace(/\s+/g, " ").slice(0, 300) || ""
  },
  courseSelection,
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

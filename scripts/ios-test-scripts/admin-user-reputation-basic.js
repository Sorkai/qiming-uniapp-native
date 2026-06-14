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

function isTransparentColor(value) {
  return /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/i.test(
    value || ""
  );
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

function scrollHost() {
  return (
    document.querySelector(".app-main > .el-scrollbar > .el-scrollbar__wrap") ||
    document.querySelector(
      ".main-container > .el-scrollbar > .el-scrollbar__wrap"
    ) ||
    document.scrollingElement ||
    document.documentElement
  );
}

function resetShellScroll() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ left: 0, top: 0 });
  ["#app", ".app-wrapper", ".main-container", ".app-main"].forEach(selector => {
    document.querySelectorAll(selector).forEach(node => {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    });
  });
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
      target.closest?.(".el-input-number") === node)
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

  const host = scrollHost();
  const hostRect =
    host === document.scrollingElement || host === document.documentElement
      ? { top: 0, bottom: window.visualViewport?.height || window.innerHeight }
      : host.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  const desiredTop = topChromeBottom() + 36;
  const desiredBottom = bottomChromeTop() - 36;
  const targetOffset =
    nodeRect.top -
    hostRect.top -
    Math.max(0, (desiredBottom - desiredTop - nodeRect.height) / 2);
  host.scrollTop += targetOffset;
  await wait(250);

  for (let attempt = 0; attempt < 4; attempt++) {
    const rect = node.getBoundingClientRect();
    const desiredTop = topChromeBottom() + 28;
    const desiredBottom = bottomChromeTop() - 28;

    if (rect.top >= desiredTop && rect.bottom <= desiredBottom) {
      return true;
    }

    if (rect.top < desiredTop) {
      host.scrollTop += rect.top - desiredTop;
    } else if (rect.bottom > desiredBottom) {
      host.scrollTop += rect.bottom - desiredBottom;
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
    findButtonByText("取消", dialog) ||
    findButtonByText("关闭", dialog);
  if (!dialog || !closeButton) return false;

  closeButton.click();
  return !!(await waitFor(() => !isVisible(dialog), 3000));
}

async function waitForNoLoading(timeoutMs = 5000) {
  return waitFor(
    () =>
      ![
        ...document.querySelectorAll(".user-reputation-page .el-loading-mask")
      ].some(isVisible),
    timeoutMs
  );
}

function isRendered(node) {
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

function mobileCards() {
  return [...document.querySelectorAll(".mobile-user-card")].filter(isRendered);
}

function allVisibleCardsInclude(label) {
  const cards = mobileCards();
  return (
    cards.length > 0 && cards.every(card => card.innerText.includes(label))
  );
}

function numberAfterLabel(text, label) {
  const match = text.match(new RegExp(`${label}\\s*(\\d+)`));
  return match ? Number.parseInt(match[1], 10) : null;
}

function userListCount(text) {
  const match = text.match(/用户信誉管理\s*共\s*(\d+)\s*位用户/);
  return match ? Number.parseInt(match[1], 10) : null;
}

await wait(1800);

const container = document.querySelector(".user-reputation-page");
const initialText = appText();
const initialOverflow = horizontalOverflow();
const searchButton = findButtonByText("搜索");
const resetButton = findButtonByText("重置");
const syncButton = findButtonByText("同步数据");

if (!container) {
  return {
    ok: false,
    reason: "user reputation container did not render",
    initialOverflow,
    text: initialText.slice(0, 1200)
  };
}

const isMobileLayout = container.classList.contains(
  "user-reputation-page--mobile"
);
await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-user-list") &&
    (document.querySelector(".mobile-user-card") ||
      appText().includes("暂无用户信誉记录")),
  10000
);

const levelSelect = await chooseSelectOptionByLabel("信誉等级", "信誉良好");
if (searchButton) {
  clickNode(searchButton);
}
await waitForNoLoading();
await wait(300);
await waitFor(
  () =>
    appText().includes("已启用") ||
    appText().includes("暂无用户信誉记录") ||
    allVisibleCardsInclude("良好"),
  8000
);
const trustedText = appText();
const trustedCardCount = mobileCards().length;
const trustedMetricCount = numberAfterLabel(trustedText, "良好用户");
const trustedListCount = userListCount(trustedText);
const trustedFilterValid =
  (trustedCardCount === 0 && trustedText.includes("暂无用户信誉记录")) ||
  (Number.isFinite(trustedMetricCount) &&
    Number.isFinite(trustedListCount) &&
    trustedMetricCount === trustedListCount) ||
  allVisibleCardsInclude("良好");

const sortBySelect = await chooseSelectOptionByLabel("排序字段", "被举报数");
const sortOrderSelect = await chooseSelectOptionByLabel("排序方向", "升序");
if (searchButton) {
  clickNode(searchButton);
}
await waitForNoLoading();
await wait(300);

if (resetButton) {
  clickNode(resetButton);
}
await waitForNoLoading();
await waitFor(
  () =>
    document.querySelector(".mobile-user-card") ||
    appText().includes("暂无用户信誉记录"),
  8000
);

const afterResetText = appText();
const mobileList = document.querySelector(".mobile-user-list");
const cardCount = mobileCards().length;
const emptyState = !!(
  document.querySelector(".mobile-user-list .el-empty") ||
  afterResetText.includes("暂无用户信誉记录")
);
const desktopTable = document.querySelector(".el-table");
const desktopTableDisplay = desktopTable
  ? window.getComputedStyle(desktopTable).display
  : "missing";
const mobileListDisplay = mobileList
  ? window.getComputedStyle(mobileList).display
  : "missing";

let syncInteractable = false;
if (syncButton) {
  await scrollClearOfChrome(syncButton);
  syncInteractable = isInteractable(syncButton);
}

const firstCard = document.querySelector(".mobile-user-card");
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";
const detailButton = firstCard ? findButtonByText("详情", firstCard) : null;
const adjustButton = firstCard ? findButtonByText("调整", firstCard) : null;
const firstCardActions = firstCard?.querySelector(".mobile-user-card__actions");

let detailOpened = true;
let detailClosed = true;
let detailDialogText = "";
let detailDialogRect = null;
let detailFooterClearance = 999;
let detailToAdjustOpened = true;
let detailToAdjustClosed = true;
let detailToAdjustText = "";
let detailToAdjustFooterClearance = 999;
if (detailButton) {
  await scrollClearOfChrome(detailButton);
  clickNode(detailButton, false);
  const dialog = await waitFor(() => visibleDialog("用户信誉详情"), 5000);
  detailOpened = !!dialog;
  detailDialogText = dialog?.innerText.replace(/\s+/g, " ").slice(0, 800) || "";
  detailDialogRect = rectOf(dialog);
  const footer = dialog?.querySelector(".el-dialog__footer");
  const footerRect = footer?.getBoundingClientRect();
  detailFooterClearance = footerRect
    ? Math.round(bottomChromeTop() - footerRect.bottom)
    : 999;

  const detailAdjustButton = dialog
    ? findButtonByText("调整信誉", dialog)
    : null;
  if (detailAdjustButton) {
    clickNode(detailAdjustButton, false);
    const adjustDialog = await waitFor(
      () => visibleDialog("调整用户信誉"),
      5000
    );
    detailToAdjustOpened = !!adjustDialog;
    detailToAdjustText =
      adjustDialog?.innerText.replace(/\s+/g, " ").slice(0, 800) || "";
    const adjustFooter = adjustDialog?.querySelector(".el-dialog__footer");
    const adjustFooterRect = adjustFooter?.getBoundingClientRect();
    detailToAdjustFooterClearance = adjustFooterRect
      ? Math.round(bottomChromeTop() - adjustFooterRect.bottom)
      : 999;
    detailToAdjustClosed = detailToAdjustOpened
      ? await closeVisibleDialog("调整用户信誉")
      : false;
  } else {
    detailToAdjustOpened = false;
    detailToAdjustClosed = false;
  }

  await wait(300);
  detailClosed = detailToAdjustOpened
    ? !visibleDialog("用户信誉详情")
    : await closeVisibleDialog("用户信誉详情");
}

let adjustOpened = true;
let adjustClosed = true;
let adjustDialogText = "";
let adjustFooterClearance = 999;
let scoreInputVisible = true;
let reasonInputVisible = true;
if (adjustButton) {
  await scrollClearOfChrome(adjustButton);
  clickNode(adjustButton, false);
  const dialog = await waitFor(() => visibleDialog("调整用户信誉"), 5000);
  adjustOpened = !!dialog;
  adjustDialogText = dialog?.innerText.replace(/\s+/g, " ").slice(0, 800) || "";
  const footer = dialog?.querySelector(".el-dialog__footer");
  const footerRect = footer?.getBoundingClientRect();
  adjustFooterClearance = footerRect
    ? Math.round(bottomChromeTop() - footerRect.bottom)
    : 999;
  scoreInputVisible = !!dialog?.querySelector(".el-input-number");
  reasonInputVisible = !!dialog?.querySelector("textarea");
  adjustClosed = adjustOpened
    ? await closeVisibleDialog("调整用户信誉")
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
resetShellScroll();
await wait(250);

const navbar = document.querySelector(".navbar");
const navbarStyle = navbar ? window.getComputedStyle(navbar) : null;
const navbarRect = rectOf(navbar);
const navbarBackground =
  navbarStyle?.backgroundColor || navbarStyle?.background || "";
const navbarOpaqueOnIos =
  document.documentElement.classList.contains("qiming-native-ios") &&
  !!navbar &&
  !/(rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent)/i.test(
    navbarBackground
  );
const brandTitle = document.querySelector(".mobile-brand-title");
const brandTitleStyle = brandTitle ? window.getComputedStyle(brandTitle) : null;
const fixedHeader = document.querySelector(".fixed-header");
const fixedHeaderStyle = fixedHeader
  ? window.getComputedStyle(fixedHeader)
  : null;
const safeAreaTop = cssPixelVar("--pure-safe-area-top");
const iosSafeTopFallback = cssPixelVar("--qiming-native-ios-safe-top-fallback");
const effectiveSafeTop = Math.max(safeAreaTop, iosSafeTopFallback);
const brandTitleRect = rectOf(brandTitle);
const brandContainer = document.querySelector(".mobile-brand");
const brandContainerStyle = brandContainer
  ? window.getComputedStyle(brandContainer)
  : null;
const brandNotClippedOnIos =
  document.documentElement.classList.contains("qiming-native-ios") &&
  !!brandTitleRect &&
  !!navbarRect &&
  brandTitleRect.top >= effectiveSafeTop + 4 &&
  brandTitleRect.bottom <= navbarRect.bottom - 8 &&
  brandTitleRect.left >= 0 &&
  brandTitleRect.right <=
    (window.visualViewport?.width || window.innerWidth) + 1 &&
  brandContainerStyle?.overflowX === "visible" &&
  brandTitleStyle?.overflowX === "visible" &&
  Number.parseFloat(brandTitleStyle?.lineHeight || "0") >
    Number.parseFloat(brandTitleStyle?.fontSize || "0");
const navbarVisualPolishedOnIos =
  document.documentElement.classList.contains("qiming-native-ios") &&
  !!navbarRect &&
  navbarRect.height >= effectiveSafeTop + 72 &&
  Number.parseFloat(navbarStyle?.borderBottomLeftRadius || "0") >= 20 &&
  Number.parseFloat(navbarStyle?.borderBottomRightRadius || "0") >= 20 &&
  !!brandTitleStyle &&
  Number.parseFloat(brandTitleStyle.fontSize || "0") >= 18 &&
  Number.parseInt(brandTitleStyle.fontWeight || "0", 10) >= 800 &&
  brandTitleStyle.fontStyle === "italic" &&
  brandTitleStyle.color !== "rgba(0, 0, 0, 0)" &&
  brandTitleStyle.backgroundImage === "none" &&
  brandNotClippedOnIos &&
  !!fixedHeaderStyle &&
  /transparent|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(
    fixedHeaderStyle.backgroundColor || ""
  );

const sidebar = document.querySelector(".sidebar-container");
const sidebarRect = rectOf(sidebar);
const sidebarLogoContainer = sidebar?.querySelector(".sidebar-logo-container");
const sidebarLogoContainerRect = rectOf(sidebarLogoContainer);
const sidebarTitle = sidebar?.querySelector(".sidebar-title");
const sidebarTitleRect = rectOf(sidebarTitle);
const sidebarTitleStyle = sidebarTitle
  ? window.getComputedStyle(sidebarTitle)
  : null;
const sidebarLogoContainerStyle = sidebarLogoContainer
  ? window.getComputedStyle(sidebarLogoContainer)
  : null;
const finalOverflow = horizontalOverflow();
const finalText = appText();
const finalAppRect = rectOf(document.querySelector("#app"));
const finalMainRect = rectOf(document.querySelector(".app-main"));
const rootWidthValid =
  (finalAppRect?.width || 0) >=
    Math.round((window.visualViewport?.width || window.innerWidth) * 0.9) &&
  (finalMainRect?.width || 0) >=
    Math.round((window.visualViewport?.width || window.innerWidth) * 0.9);

return {
  ok:
    isMobileLayout &&
    initialText.includes("筛选条件") &&
    initialText.includes("良好用户") &&
    initialText.includes("普通用户") &&
    initialText.includes("受限用户") &&
    initialText.includes("用户信誉管理") &&
    !!searchButton &&
    !!resetButton &&
    !!syncButton &&
    navbarOpaqueOnIos &&
    navbarVisualPolishedOnIos &&
    levelSelect.selected &&
    sortBySelect.selected &&
    sortOrderSelect.selected &&
    trustedFilterValid &&
    mobileListDisplay !== "missing" &&
    (desktopTableDisplay === "none" || desktopTableDisplay === "missing") &&
    (cardCount > 0 || emptyState) &&
    (!firstCard ||
      (!!detailButton &&
        !!adjustButton &&
        firstCardText.includes("信誉等级") &&
        firstCardText.includes("最后活跃"))) &&
    detailOpened &&
    detailClosed &&
    detailDialogText.includes("信誉分") &&
    detailToAdjustOpened &&
    detailToAdjustClosed &&
    (detailToAdjustText.includes("调整原因") ||
      detailToAdjustText.includes("原因")) &&
    adjustOpened &&
    adjustClosed &&
    adjustDialogText.includes("设置范围") &&
    scoreInputVisible &&
    reasonInputVisible &&
    detailFooterClearance >= 0 &&
    detailToAdjustFooterClearance >= 0 &&
    adjustFooterClearance >= 0 &&
    rootWidthValid &&
    finalOverflow <= 4,
  isMobileLayout,
  levelSelect: {
    opened: levelSelect.opened,
    optionCount: levelSelect.optionCount,
    selectedText: levelSelect.selectedText,
    interactable: levelSelect.interactable
  },
  sortBySelect: {
    opened: sortBySelect.opened,
    optionCount: sortBySelect.optionCount,
    selectedText: sortBySelect.selectedText,
    interactable: sortBySelect.interactable
  },
  sortOrderSelect: {
    opened: sortOrderSelect.opened,
    optionCount: sortOrderSelect.optionCount,
    selectedText: sortOrderSelect.selectedText,
    interactable: sortOrderSelect.interactable
  },
  hasSearchButton: !!searchButton,
  hasResetButton: !!resetButton,
  hasSyncButton: !!syncButton,
  syncInteractable,
  navbarRect,
  navbarBackground,
  navbarOpaqueOnIos,
  navbarBorderBottomLeftRadius: navbarStyle?.borderBottomLeftRadius || "",
  navbarBorderBottomRightRadius: navbarStyle?.borderBottomRightRadius || "",
  navbarVisualPolishedOnIos,
  safeAreaTop,
  iosSafeTopFallback,
  effectiveSafeTop,
  brandTitleRect,
  brandNotClippedOnIos,
  brandContainerOverflowX: brandContainerStyle?.overflowX || "",
  brandTitleOverflowX: brandTitleStyle?.overflowX || "",
  brandTitleFontSize: brandTitleStyle?.fontSize || "",
  brandTitleLineHeight: brandTitleStyle?.lineHeight || "",
  brandTitleFontWeight: brandTitleStyle?.fontWeight || "",
  brandTitleFontStyle: brandTitleStyle?.fontStyle || "",
  brandTitleColor: brandTitleStyle?.color || "",
  brandTitleBackgroundImage: brandTitleStyle?.backgroundImage || "",
  fixedHeaderBackground: fixedHeaderStyle?.backgroundColor || "",
  sidebarRect,
  sidebarLogoContainerRect,
  sidebarTitleRect,
  sidebarTitleFontSize: sidebarTitleStyle?.fontSize || "",
  sidebarTitleFontWeight: sidebarTitleStyle?.fontWeight || "",
  sidebarTitleFontStyle: sidebarTitleStyle?.fontStyle || "",
  sidebarTitleColor: sidebarTitleStyle?.color || "",
  sidebarTitleTextFillColor: sidebarTitleStyle?.webkitTextFillColor || "",
  sidebarTitleBackgroundImage: sidebarTitleStyle?.backgroundImage || "",
  sidebarTitleOverflowX: sidebarTitleStyle?.overflowX || "",
  sidebarLogoContainerOverflowX: sidebarLogoContainerStyle?.overflowX || "",
  trustedCardCount,
  trustedFilterValid,
  cardCount,
  emptyState,
  firstCardText,
  hasDetailButton: !!detailButton,
  hasAdjustButton: !!adjustButton,
  detailOpened,
  detailClosed,
  detailDialogText,
  detailDialogRect,
  detailFooterClearance,
  detailToAdjustOpened,
  detailToAdjustClosed,
  detailToAdjustText,
  detailToAdjustFooterClearance,
  adjustOpened,
  adjustClosed,
  adjustDialogText,
  adjustFooterClearance,
  scoreInputVisible,
  reasonInputVisible,
  firstCardActionsVisible,
  actionTopClearance,
  actionBottomClearance,
  mobileListDisplay,
  desktopTableDisplay,
  initialOverflow,
  finalOverflow,
  finalAppRect,
  finalMainRect,
  rootWidthValid,
  text: finalText.slice(0, 1800)
};

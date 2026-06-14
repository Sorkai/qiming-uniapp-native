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
      target.closest?.("button") === node ||
      target.closest?.(".el-button") === node)
  );
}

function findButtonByText(label, root = document) {
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(label)
  );
}

function visibleDialog() {
  return [...document.querySelectorAll(".el-dialog")].find(isVisible);
}

function visibleMessageBox() {
  return [...document.querySelectorAll(".el-message-box")].find(isVisible);
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

function clickNode(node) {
  if (!node) return false;
  node.scrollIntoView({ block: "center", inline: "nearest" });
  node.click();
  return true;
}

function inputText(input, value) {
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

await wait(1200);

const initialText = appText();
const list = document.querySelector(".mobile-category-list");
const initialCards = [...document.querySelectorAll(".mobile-category-card")];
const searchInput = document.querySelector(
  ".search-form input[placeholder='请输入分类名称']"
);
const createButton = findButtonByText("创建分类");
const searchButton = findButtonByText("搜索");
const resetButton = findButtonByText("重置");

if (!list || initialCards.length < 4) {
  return {
    ok: false,
    reason: "category mobile list did not render",
    initialCards: initialCards.length,
    initialText: initialText.slice(0, 900)
  };
}

if (!searchInput || !createButton || !searchButton || !resetButton) {
  return {
    ok: false,
    reason: "missing category controls",
    hasSearchInput: !!searchInput,
    hasCreateButton: !!createButton,
    hasSearchButton: !!searchButton,
    hasResetButton: !!resetButton,
    initialText: initialText.slice(0, 900)
  };
}

const controlInteractable =
  isInteractable(createButton) &&
  isInteractable(searchButton) &&
  isInteractable(resetButton);

inputText(searchInput, "自然");
searchButton.click();
const filtered = await waitFor(() => {
  const text = appText();
  const cards = [...document.querySelectorAll(".mobile-category-card")];
  return (
    text.includes("自然科学类") &&
    !text.includes("社会科学类") &&
    cards.length === 1 &&
    cards
  );
}, 8000);

const filteredCards = [...document.querySelectorAll(".mobile-category-card")];
const filteredText = appText();

resetButton.click();
await waitFor(
  () => document.querySelectorAll(".mobile-category-card").length >= 4
);
const resetCards = [...document.querySelectorAll(".mobile-category-card")];

clickNode(createButton);
await wait(650);
const createDialog = visibleDialog();
const createDialogText = createDialog?.innerText.replace(/\s+/g, " ") || "";
const createCancel = createDialog
  ? findButtonByText("取消", createDialog)
  : null;
if (createCancel) {
  createCancel.click();
  await wait(450);
}
const createDialogClosed = !visibleDialog();

const firstCard = document.querySelector(".mobile-category-card");
const editButton = firstCard ? findButtonByText("编辑", firstCard) : null;
const deleteButton = firstCard ? findButtonByText("删除", firstCard) : null;
const firstCardText = firstCard?.innerText.replace(/\s+/g, " ") || "";

if (!editButton || !deleteButton) {
  return {
    ok: false,
    reason: "missing card action buttons",
    firstCardText,
    filteredCards: filteredCards.length,
    resetCards: resetCards.length
  };
}

clickNode(editButton);
await wait(650);
const editDialog = visibleDialog();
const editDialogText = editDialog?.innerText.replace(/\s+/g, " ") || "";
const editInput = editDialog?.querySelector("input");
const editCancel = editDialog ? findButtonByText("取消", editDialog) : null;
if (editCancel) {
  editCancel.click();
  await wait(450);
}
const editDialogClosed = !visibleDialog();

clickNode(deleteButton);
await wait(650);
const messageBox = visibleMessageBox();
const messageBoxText = messageBox?.innerText.replace(/\s+/g, " ") || "";
const messageCancel = messageBox ? findButtonByText("取消", messageBox) : null;
if (messageCancel) {
  messageCancel.click();
  await wait(450);
}
const messageBoxClosed = !visibleMessageBox();

const pagination = document.querySelector(".pagination-container");
const paginationText = pagination?.innerText.replace(/\s+/g, " ") || "";

const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    initialText.includes("课程分类") &&
    initialCards.length >= 4 &&
    controlInteractable &&
    !!filtered &&
    filteredCards.length === 1 &&
    filteredText.includes("自然科学类") &&
    !filteredText.includes("社会科学类") &&
    resetCards.length >= 4 &&
    createDialogText.includes("创建分类") &&
    createDialogText.includes("分类名称") &&
    createDialogClosed &&
    firstCardText.includes("Category ID") &&
    isInteractable(editButton) &&
    isInteractable(deleteButton) &&
    editDialogText.includes("编辑分类") &&
    editInput?.value.length > 0 &&
    editDialogClosed &&
    messageBoxText.includes("确定要删除分类") &&
    messageBoxText.includes("取消") &&
    messageBoxClosed &&
    /条\/页|条每页|page/i.test(paginationText) &&
    horizontalOverflow <= 4,
  initialCardCount: initialCards.length,
  filteredCardCount: filteredCards.length,
  resetCardCount: resetCards.length,
  controlInteractable,
  createDialogText,
  createDialogClosed,
  firstCardText,
  editDialogText,
  editDialogClosed,
  messageBoxText,
  messageBoxClosed,
  paginationText,
  horizontalOverflow,
  text: appText().slice(0, 1000)
};

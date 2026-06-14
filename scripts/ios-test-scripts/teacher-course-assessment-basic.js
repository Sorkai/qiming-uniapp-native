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

function findTabByText(label) {
  return [...document.querySelectorAll(".el-tabs__item")].find(tab =>
    tab.textContent?.replace(/\s+/g, "").includes(label)
  );
}

function visibleDialog(title) {
  return [...document.querySelectorAll(".el-dialog")].find(
    dialog =>
      isVisible(dialog) &&
      (!title || dialog.textContent?.replace(/\s+/g, "").includes(title))
  );
}

function visibleMessageBox() {
  return [...document.querySelectorAll(".el-message-box")].find(isVisible);
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

function clickNode(node) {
  if (!node) return false;
  node.scrollIntoView({ block: "center", inline: "nearest" });
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
    const activeTab = [...document.querySelectorAll(".el-tabs__item")].find(
      item => item.classList.contains("is-active")
    );
    return activeTab?.textContent?.replace(/\s+/g, "").includes(label);
  }, 4000));

  return { found: true, active, interactable, alreadyActive };
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

async function cancelMessageBox() {
  const messageBox = visibleMessageBox();
  const cancelButton = messageBox ? findButtonByText("取消", messageBox) : null;
  if (!messageBox || !cancelButton) return false;

  cancelButton.click();
  return !!(await waitFor(() => !isVisible(messageBox), 3000));
}

function displayOf(selector) {
  const node = document.querySelector(selector);
  return node ? window.getComputedStyle(node).display : "missing";
}

async function openAndCloseCreate(label) {
  const button = findButtonByText(label);
  const expectedTitle = label === "添加作业" ? "创建作业" : "创建考试";

  if (!button) {
    return {
      opened: false,
      closed: false,
      hasButton: false,
      interactable: false
    };
  }

  const interactable = isInteractable(button);
  clickNode(button);
  const dialog = await waitFor(() => visibleDialog(expectedTitle), 5000);
  const text = dialog?.innerText.replace(/\s+/g, " ") || "";
  const closed = dialog ? await closeVisibleDialog(expectedTitle) : false;

  return {
    opened: !!dialog,
    closed,
    text: text.slice(0, 400),
    hasButton: true,
    interactable
  };
}

async function exerciseCardActions(card, config) {
  if (!card) {
    return {
      hasCard: false,
      questionOpened: true,
      questionClosed: true,
      editOpened: true,
      editClosed: true,
      deleteOpened: true,
      deleteClosed: true
    };
  }

  const questionButton = findButtonByText("试题管理", card);
  const editButton = findButtonByText("编辑", card);
  const deleteButton = findButtonByText("删除", card);
  const cardText = card.innerText.replace(/\s+/g, " ");

  let questionOpened = false;
  let questionClosed = false;
  if (questionButton) {
    clickNode(questionButton);
    questionOpened = !!(await waitFor(
      () => visibleDialog(config.questionTitle),
      6000
    ));
    questionClosed = questionOpened
      ? await closeVisibleDialog(config.questionTitle)
      : false;
    await wait(400);
  }

  let editOpened = false;
  let editClosed = false;
  if (editButton) {
    clickNode(editButton);
    editOpened = !!(await waitFor(() => visibleDialog(config.editTitle), 5000));
    editClosed = editOpened
      ? await closeVisibleDialog(config.editTitle)
      : false;
    await wait(400);
  }

  let deleteOpened = false;
  let deleteClosed = false;
  if (deleteButton) {
    clickNode(deleteButton);
    deleteOpened = !!(await waitFor(visibleMessageBox, 5000));
    deleteClosed = deleteOpened ? await cancelMessageBox() : false;
    await wait(400);
  }

  return {
    hasCard: true,
    cardText,
    hasQuestionButton: !!questionButton,
    hasEditButton: !!editButton,
    hasDeleteButton: !!deleteButton,
    questionOpened,
    questionClosed,
    editOpened,
    editClosed,
    deleteOpened,
    deleteClosed
  };
}

await wait(1200);

const courseItems = [...document.querySelectorAll(".course-item")];
if (courseItems.length === 0) {
  return {
    ok: false,
    reason: "course list did not render",
    text: appText().slice(0, 900)
  };
}

clickNode(courseItems[0]);
await waitFor(() => document.querySelector(".assessment-tabs"), 9000);
await waitFor(
  () =>
    document.querySelector(".homework-management") &&
    (document.querySelector(".mobile-homework-card") ||
      appText().includes("暂无作业") ||
      appText().includes("作业列表")),
  9000
);

const selectedText = appText();
const homeworkTab = await activateTab("课程作业");
await waitFor(
  () =>
    document.querySelector(".homework-management") &&
    (document.querySelector(".mobile-homework-card") ||
      appText().includes("暂无作业") ||
      appText().includes("作业列表")),
  5000
);
const homeworkCreate = await openAndCloseCreate("添加作业");
const homeworkCard = document.querySelector(".mobile-homework-card");
const homeworkActions = await exerciseCardActions(homeworkCard, {
  questionTitle: "作业管理",
  editTitle: "编辑作业"
});
const homeworkMobileDisplay = displayOf(".mobile-homework-list");
const homeworkDesktopDisplay = displayOf(".desktop-homework-table");
const homeworkCardCount = document.querySelectorAll(
  ".mobile-homework-card"
).length;

const examTab = await activateTab("课程考试");
if (!examTab.found || !examTab.active) {
  return {
    ok: false,
    reason: "exam tab did not activate",
    examTab,
    selectedText: selectedText.slice(0, 900)
  };
}

await waitFor(
  () =>
    document.querySelector(".exam-management") &&
    (document.querySelector(".mobile-exam-card") ||
      appText().includes("暂无考试") ||
      appText().includes("考试列表")),
  9000
);

const examCreate = await openAndCloseCreate("创建考试");
const examCard = document.querySelector(".mobile-exam-card");
const examActions = await exerciseCardActions(examCard, {
  questionTitle: "试题管理",
  editTitle: "编辑考试"
});
const examMobileDisplay = displayOf(".mobile-exam-list");
const examDesktopDisplay = displayOf(".desktop-exam-table");
const examCardCount = document.querySelectorAll(".mobile-exam-card").length;

const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    selectedText.includes("课程中心") &&
    selectedText.includes("课程作业") &&
    selectedText.includes("课程考试") &&
    homeworkTab.found &&
    homeworkTab.active &&
    homeworkCreate.opened &&
    homeworkCreate.closed &&
    homeworkMobileDisplay !== "none" &&
    homeworkDesktopDisplay === "none" &&
    homeworkActions.hasQuestionButton !== false &&
    homeworkActions.hasEditButton !== false &&
    homeworkActions.hasDeleteButton !== false &&
    homeworkActions.questionOpened &&
    homeworkActions.questionClosed &&
    homeworkActions.editOpened &&
    homeworkActions.editClosed &&
    homeworkActions.deleteOpened &&
    homeworkActions.deleteClosed &&
    examCreate.opened &&
    examCreate.closed &&
    examMobileDisplay !== "none" &&
    examDesktopDisplay === "none" &&
    examActions.hasQuestionButton !== false &&
    examActions.hasEditButton !== false &&
    examActions.hasDeleteButton !== false &&
    examActions.questionOpened &&
    examActions.questionClosed &&
    examActions.editOpened &&
    examActions.editClosed &&
    examActions.deleteOpened &&
    examActions.deleteClosed &&
    horizontalOverflow <= 4,
  courseCount: courseItems.length,
  homeworkCardCount,
  examCardCount,
  homeworkTab,
  examTab,
  homeworkCreate,
  examCreate,
  homeworkActions,
  examActions,
  homeworkMobileDisplay,
  homeworkDesktopDisplay,
  examMobileDisplay,
  examDesktopDisplay,
  horizontalOverflow,
  text: appText().slice(0, 1000)
};

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

  return (
    rect.width > 12 &&
    rect.height > 12 &&
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.left <= viewportWidth &&
    rect.top <= viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0"
  );
}

function hitTarget(node) {
  if (!isVisible(node)) return null;

  const rect = node.getBoundingClientRect();
  return document.elementFromPoint(
    rect.left + Math.min(rect.width / 2, 60),
    rect.top + Math.min(rect.height / 2, 24)
  );
}

function isInteractable(node) {
  const target = hitTarget(node);
  return !!(
    target &&
    (target === node || node.contains(target) || target.closest?.("button"))
  );
}

function displayValue(node) {
  if (!node) return "";
  return window.getComputedStyle(node).display;
}

await wait(500);

const beforeText = appText();
const page = document.querySelector(".exam-result-page");
const scoreCard = document.querySelector(".score-card");
const summaryCards = [...document.querySelectorAll(".summary-card")];
const answerCard = document.querySelector(".answer-card");
const mobileAnswerList = document.querySelector(".mobile-answer-list");
const desktopTable = document.querySelector(".desktop-answer-table");
const mobileAnswerCards = [...document.querySelectorAll(".mobile-answer-card")];
const backButton = [...document.querySelectorAll("button")].find(button =>
  button.textContent?.replace(/\s+/g, "").includes("返回试卷中心")
);

if (!page || !scoreCard || !answerCard) {
  return {
    ok: false,
    reason: "result page shell did not render",
    href: location.href,
    beforeText: beforeText.slice(0, 900),
    hasPage: !!page,
    hasScoreCard: !!scoreCard,
    hasAnswerCard: !!answerCard
  };
}

const requiredText = [
  "考试结果",
  "总得分",
  "85 / 100",
  "2024年春季期中考试",
  "总题数 7",
  "已作答 7",
  "客观题正确率 100%",
  "答题明细",
  "题号 101",
  "题号 601",
  "表达清晰，可补充条件说明"
];

const missingText = requiredText.filter(item => !beforeText.includes(item));

const desktopHidden = displayValue(desktopTable) === "none";
const mobileListRendered = displayValue(mobileAnswerList) === "grid";
const backButtonInteractableBeforeScroll = isInteractable(backButton);
const firstAnswer = mobileAnswerCards[0];
const lastAnswer = mobileAnswerCards[mobileAnswerCards.length - 1];

firstAnswer?.scrollIntoView({ block: "center", inline: "nearest" });
await wait(400);
const firstAnswerVisibleAfterScroll = isVisible(firstAnswer);

lastAnswer?.scrollIntoView({ block: "center", inline: "nearest" });
await wait(400);

const afterScrollY = Math.round(window.scrollY);
const lastAnswerVisible = isVisible(lastAnswer);
const pageScrollable =
  document.documentElement.scrollHeight > window.innerHeight + 120 ||
  document.body.scrollHeight > window.innerHeight + 120;
const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    missingText.length === 0 &&
    summaryCards.length === 3 &&
    mobileAnswerCards.length === 7 &&
    desktopHidden &&
    mobileListRendered &&
    firstAnswerVisibleAfterScroll &&
    lastAnswerVisible &&
    !!backButton &&
    backButtonInteractableBeforeScroll &&
    horizontalOverflow <= 4,
  href: location.href,
  missingText,
  summaryCardCount: summaryCards.length,
  mobileAnswerCardCount: mobileAnswerCards.length,
  desktopTableDisplay: displayValue(desktopTable),
  mobileAnswerListDisplay: displayValue(mobileAnswerList),
  mobileListRendered,
  firstAnswerVisibleAfterScroll,
  lastAnswerVisible,
  pageScrollable,
  horizontalOverflow,
  afterScrollY,
  backButtonInteractableBeforeScroll,
  text: appText().slice(0, 1400)
};

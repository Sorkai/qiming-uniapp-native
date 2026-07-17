export type GradingAnswerValue =
  | string
  | string[]
  | number
  | null
  | Record<string, unknown>
  | Array<string | number>;

export interface GradingQuestionLike {
  questionId: number;
  questionType: number | string;
  title?: string;
  stem?: string;
  points: number;
  sortOrder?: number;
  options?: Array<{ key: string; content: string }>;
  correctAnswer?: string;
  correctAnswers?: string[];
  referenceAnswer?: string;
  analysis?: string;
}

export interface GradingQuestionGroupLike {
  sortOrder?: number;
  questions?: GradingQuestionLike[];
}

export interface GradingPaperSnapshotLike {
  questionGroups?: GradingQuestionGroupLike[];
}

export interface SubmissionAnswerLike {
  questionId: number;
  answer: GradingAnswerValue;
  score?: number;
  comment?: string;
  isCorrect?: boolean;
}

export interface GradingAnswerDraft {
  question: GradingQuestionLike;
  answer: GradingAnswerValue;
  score: number | null;
  comment: string;
  isCorrect?: boolean;
}

const objectiveQuestionTypes = new Set<number | string>([
  1,
  2,
  3,
  4,
  7,
  8,
  9,
  10,
  "radio",
  "checkbox",
  "judge",
  "input",
  "matrix-single",
  "matrix-multiple",
  "matching",
  "ordering"
]);

export const isObjectiveQuestionType = (
  questionType: number | string
): boolean => objectiveQuestionTypes.has(questionType);

export const flattenPaperQuestions = (
  groups: GradingQuestionGroupLike[] = []
): GradingQuestionLike[] =>
  [...groups]
    .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
    .flatMap(group =>
      [...(group.questions || [])].sort(
        (left, right) => (left.sortOrder || 0) - (right.sortOrder || 0)
      )
    );

export const getFrozenSnapshotQuestions = (
  snapshot?: GradingPaperSnapshotLike
): GradingQuestionLike[] => {
  if (!snapshot) {
    throw new Error("答卷缺少冻结试卷快照，已阻止批改");
  }
  const questions = flattenPaperQuestions(snapshot.questionGroups || []);
  if (!questions.length) {
    throw new Error("答卷冻结试卷快照中没有题目，已阻止批改");
  }
  return questions;
};

export const buildGradingAnswerDrafts = (
  questions: GradingQuestionLike[],
  answers: SubmissionAnswerLike[] = []
): GradingAnswerDraft[] => {
  const answerByQuestion = new Map(
    answers.map(answer => [answer.questionId, answer])
  );

  return questions.map(question => {
    const submissionAnswer = answerByQuestion.get(question.questionId);
    const score = submissionAnswer?.score;

    return {
      question,
      answer: submissionAnswer?.answer ?? null,
      score: typeof score === "number" && Number.isFinite(score) ? score : null,
      comment: submissionAnswer?.comment || "",
      isCorrect: submissionAnswer?.isCorrect
    };
  });
};

export const getUnmatchedAnswerIds = (
  questions: GradingQuestionLike[],
  answers: SubmissionAnswerLike[] = []
): number[] => {
  const questionIds = new Set(questions.map(question => question.questionId));
  return answers
    .map(answer => answer.questionId)
    .filter(questionId => !questionIds.has(questionId));
};

export const isGradeScoreValid = (
  score: number | null,
  maxScore: number
): boolean =>
  typeof score === "number" &&
  Number.isFinite(score) &&
  score >= 0 &&
  score <= maxScore;

export const formatGradingAnswer = (value: GradingAnswerValue): string => {
  if (value === null || value === "") return "未作答";
  if (Array.isArray(value)) {
    return value.length ? value.join("，") : "未作答";
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "未作答";
    return entries
      .map(([key, item]) => {
        const formatted = Array.isArray(item) ? item.join("，") : String(item);
        return `${key}：${formatted}`;
      })
      .join("；");
  }
  return String(value);
};

import {
  PaperStatus,
  QuestionType,
  type StartExamResult,
  type StudentPaperDetail
} from "@/api/examPaper";

export const nativeDemoStudentPaper: StudentPaperDetail = {
  paperId: 1,
  title: "2024年春季期中考试",
  description: "覆盖函数、导数与综合应用题，建议完成后查看错题解析。",
  courseId: 1,
  courseName: "高等数学",
  creatorId: 3,
  creatorName: "张老师",
  status: PaperStatus.PUBLISHED,
  timeLimit: 105,
  totalPoints: 100,
  totalQuestions: 7,
  startTime: "2024-04-15 09:00:00",
  endTime: "2099-04-15 11:00:00",
  createTime: "2024-04-01 09:30:00",
  updateTime: "2024-04-12 16:20:00",
  questionGroups: [
    {
      groupId: 101,
      groupName: "一、单选题",
      questionType: QuestionType.SINGLE_CHOICE,
      sortOrder: 1,
      questions: [
        {
          questionId: 101,
          questionType: QuestionType.SINGLE_CHOICE,
          title: "导数概念",
          stem: "函数 f(x)=x^2 在 x=3 处的导数是（ ）。",
          options: [
            { key: "A", content: "3" },
            { key: "B", content: "6" },
            { key: "C", content: "9" },
            { key: "D", content: "12" }
          ],
          points: 4,
          difficulty: 1,
          knowledgePoints: ["导数定义"],
          sortOrder: 1
        },
        {
          questionId: 102,
          questionType: QuestionType.SINGLE_CHOICE,
          title: "极限运算",
          stem: "当 x 趋近于 0 时，sinx / x 的极限为（ ）。",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1/2" },
            { key: "C", content: "1" },
            { key: "D", content: "不存在" }
          ],
          points: 4,
          difficulty: 1,
          knowledgePoints: ["重要极限"],
          sortOrder: 2
        }
      ]
    },
    {
      groupId: 201,
      groupName: "二、多选题",
      questionType: QuestionType.MULTIPLE_CHOICE,
      sortOrder: 2,
      questions: [
        {
          questionId: 201,
          questionType: QuestionType.MULTIPLE_CHOICE,
          title: "函数性质",
          stem: "下列关于连续函数的说法正确的是（ ）。",
          options: [
            { key: "A", content: "闭区间上的连续函数有最大值和最小值" },
            { key: "B", content: "连续函数在区间内一定可导" },
            { key: "C", content: "可导函数一定连续" },
            { key: "D", content: "连续函数满足介值定理" }
          ],
          points: 8,
          difficulty: 2,
          knowledgePoints: ["连续性", "可导性"],
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 301,
      groupName: "三、判断题",
      questionType: QuestionType.TRUE_FALSE,
      sortOrder: 3,
      questions: [
        {
          questionId: 301,
          questionType: QuestionType.TRUE_FALSE,
          title: "积分判断",
          stem: "若函数在区间上可积，则它一定连续。",
          options: [
            { key: "A", content: "正确" },
            { key: "B", content: "错误" }
          ],
          points: 4,
          difficulty: 2,
          knowledgePoints: ["定积分"],
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 401,
      groupName: "四、填空题",
      questionType: QuestionType.FILL_BLANK,
      sortOrder: 4,
      questions: [
        {
          questionId: 401,
          questionType: QuestionType.FILL_BLANK,
          title: "不定积分",
          stem: "请填写 ∫x² dx 的一个原函数：____。",
          points: 10,
          difficulty: 2,
          knowledgePoints: ["不定积分"],
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 501,
      groupName: "五、简答题",
      questionType: QuestionType.SHORT_ANSWER,
      sortOrder: 5,
      questions: [
        {
          questionId: 501,
          questionType: QuestionType.SHORT_ANSWER,
          title: "导数应用",
          stem: "简述如何利用导数判断函数的单调区间。",
          points: 20,
          difficulty: 3,
          knowledgePoints: ["导数应用"],
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 601,
      groupName: "六、论述题",
      questionType: QuestionType.ESSAY,
      sortOrder: 6,
      questions: [
        {
          questionId: 601,
          questionType: QuestionType.ESSAY,
          title: "综合证明",
          stem: "结合拉格朗日中值定理，说明它在函数不等式证明中的作用。",
          points: 50,
          difficulty: 4,
          knowledgePoints: ["中值定理", "综合应用"],
          sortOrder: 1
        }
      ]
    }
  ]
};

export const createNativeDemoExamSession = (): StartExamResult => ({
  submissionId: 1,
  paper: JSON.parse(JSON.stringify(nativeDemoStudentPaper)),
  remainingTime: nativeDemoStudentPaper.timeLimit * 60,
  serverTime: Date.now()
});

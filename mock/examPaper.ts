import type { MockMethod } from "vite-plugin-mock";

// 试卷状态枚举
const PaperStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
  IN_PROGRESS: 2,
  ENDED: 3,
  GRADING: 4,
  GRADED: 5,
  SCORE_RELEASED: 6
};

// 题型枚举
const QuestionType = {
  SINGLE_CHOICE: 1,
  MULTIPLE_CHOICE: 2,
  TRUE_FALSE: 3,
  FILL_BLANK: 4,
  SHORT_ANSWER: 5,
  ESSAY: 6,
  MATRIX_SINGLE: 7,
  MATRIX_MULTIPLE: 8,
  MATCHING: 9,
  ORDERING: 10
};

// 模拟试卷列表数据
const mockPaperList = [
  {
    paperId: 1,
    title: "2024年春季期中考试",
    courseName: "高等数学",
    creatorName: "张老师",
    status: PaperStatus.SCORE_RELEASED,
    statusText: "已发布成绩",
    timeLimit: 120,
    totalPoints: 100,
    totalQuestions: 25,
    startTime: "2024-04-15 09:00:00",
    endTime: "2024-04-15 11:00:00",
    createTime: "2024-04-01 10:00:00",
    participantCount: 45,
    submittedCount: 45,
    gradedCount: 45
  },
  {
    paperId: 2,
    title: "第三章单元测试",
    courseName: "线性代数",
    creatorName: "李老师",
    status: PaperStatus.GRADED,
    statusText: "已批改",
    timeLimit: 60,
    totalPoints: 50,
    totalQuestions: 15,
    startTime: "2024-04-10 14:00:00",
    endTime: "2024-04-10 15:00:00",
    createTime: "2024-04-05 09:00:00",
    participantCount: 38,
    submittedCount: 38,
    gradedCount: 38
  },
  {
    paperId: 3,
    title: "概率论期末考试",
    courseName: "概率论与数理统计",
    creatorName: "王老师",
    status: PaperStatus.GRADING,
    statusText: "批改中",
    timeLimit: 120,
    totalPoints: 100,
    totalQuestions: 30,
    startTime: "2024-04-20 09:00:00",
    endTime: "2024-04-20 11:00:00",
    createTime: "2024-04-10 14:00:00",
    participantCount: 52,
    submittedCount: 50,
    gradedCount: 25
  },
  {
    paperId: 4,
    title: "数据结构随堂测验",
    courseName: "数据结构",
    creatorName: "张老师",
    status: PaperStatus.ENDED,
    statusText: "已结束",
    timeLimit: 30,
    totalPoints: 30,
    totalQuestions: 10,
    startTime: "2024-04-22 10:00:00",
    endTime: "2024-04-22 10:30:00",
    createTime: "2024-04-21 16:00:00",
    participantCount: 40,
    submittedCount: 38,
    gradedCount: 0
  },
  {
    paperId: 5,
    title: "算法设计期中考试",
    courseName: "算法设计与分析",
    creatorName: "李老师",
    status: PaperStatus.IN_PROGRESS,
    statusText: "考试中",
    timeLimit: 90,
    totalPoints: 80,
    totalQuestions: 20,
    startTime: "2024-04-25 14:00:00",
    endTime: "2024-04-25 15:30:00",
    createTime: "2024-04-20 10:00:00",
    participantCount: 35,
    submittedCount: 10,
    gradedCount: 0
  },
  {
    paperId: 6,
    title: "操作系统第一次测验",
    courseName: "操作系统",
    creatorName: "王老师",
    status: PaperStatus.PUBLISHED,
    statusText: "已发布",
    timeLimit: 45,
    totalPoints: 40,
    totalQuestions: 12,
    startTime: "2024-04-28 09:00:00",
    endTime: "2024-04-28 09:45:00",
    createTime: "2024-04-23 11:00:00",
    participantCount: 0,
    submittedCount: 0,
    gradedCount: 0
  },
  {
    paperId: 7,
    title: "计算机网络练习题",
    courseName: "计算机网络",
    creatorName: "张老师",
    status: PaperStatus.DRAFT,
    statusText: "草稿",
    timeLimit: 60,
    totalPoints: 50,
    totalQuestions: 15,
    startTime: null,
    endTime: null,
    createTime: "2024-04-24 15:00:00",
    participantCount: 0,
    submittedCount: 0,
    gradedCount: 0
  }
];

// 模拟试卷详情数据
const mockPaperDetail = {
  paperId: 1,
  title: "2024年春季期中考试",
  description: "本次考试涵盖第1-5章内容，请认真作答。",
  courseId: 1,
  courseName: "高等数学",
  creatorId: 101,
  creatorName: "张老师",
  status: PaperStatus.SCORE_RELEASED,
  timeLimit: 120,
  totalPoints: 100,
  totalQuestions: 25,
  startTime: "2024-04-15 09:00:00",
  endTime: "2024-04-15 11:00:00",
  createTime: "2024-04-01 10:00:00",
  updateTime: "2024-04-14 18:00:00",
  questionGroups: [
    {
      groupId: 1,
      groupName: "一、单选题",
      questionType: QuestionType.SINGLE_CHOICE,
      sortOrder: 1,
      questions: [
        {
          questionId: 101,
          questionType: QuestionType.SINGLE_CHOICE,
          title: "极限计算",
          stem: "求极限 lim(x→0) sin(x)/x 的值为：",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1" },
            { key: "C", content: "∞" },
            { key: "D", content: "不存在" }
          ],
          correctAnswer: "B",
          analysis: "这是一个重要极限，lim(x→0) sin(x)/x = 1",
          points: 4,
          difficulty: 2,
          sortOrder: 1
        },
        {
          questionId: 102,
          questionType: QuestionType.SINGLE_CHOICE,
          title: "导数计算",
          stem: "函数 f(x) = x³的导数 f'(x) 为：",
          options: [
            { key: "A", content: "x²" },
            { key: "B", content: "2x²" },
            { key: "C", content: "3x²" },
            { key: "D", content: "3x" }
          ],
          correctAnswer: "C",
          analysis: "根据幂函数求导公式，所以 (x³)' = 3x²",
          points: 4,
          difficulty: 1,
          sortOrder: 2
        }
      ]
    },
    {
      groupId: 2,
      groupName: "二、多选题",
      questionType: QuestionType.MULTIPLE_CHOICE,
      sortOrder: 2,
      questions: [
        {
          questionId: 201,
          questionType: QuestionType.MULTIPLE_CHOICE,
          title: "连续函数性质",
          stem: "下列关于连续函数的说法正确的是：",
          options: [
            { key: "A", content: "连续函数的和仍是连续函数" },
            { key: "B", content: "连续函数的积仍是连续函数" },
            { key: "C", content: "连续函数的商一定是连续函数" },
            { key: "D", content: "连续函数的复合仍是连续函数" }
          ],
          correctAnswers: ["A", "B", "D"],
          analysis: "连续函数的和、积、复合都是连续函数，但商在分母为0处不连续",
          points: 5,
          difficulty: 3,
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 3,
      groupName: "三、判断题",
      questionType: QuestionType.TRUE_FALSE,
      sortOrder: 3,
      questions: [
        {
          questionId: 301,
          questionType: QuestionType.TRUE_FALSE,
          title: "可导与连续",
          stem: "可导函数一定连续。",
          options: [
            { key: "A", content: "正确" },
            { key: "B", content: "错误" }
          ],
          correctAnswer: "A",
          analysis: "可导必连续，但连续不一定可导",
          points: 3,
          difficulty: 2,
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 4,
      groupName: "四、填空题",
      questionType: QuestionType.FILL_BLANK,
      sortOrder: 4,
      questions: [
        {
          questionId: 401,
          questionType: QuestionType.FILL_BLANK,
          title: "积分计算",
          stem: "∫x²dx = ______ + C",
          correctAnswer: "x³/3",
          analysis: "根据积分公式",
          points: 4,
          difficulty: 2,
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 5,
      groupName: "五、简答题",
      questionType: QuestionType.SHORT_ANSWER,
      sortOrder: 5,
      questions: [
        {
          questionId: 501,
          questionType: QuestionType.SHORT_ANSWER,
          title: "极值问题",
          stem: "求函数 f(x) = x³ - 3x + 2 的极值点和极值。",
          referenceAnswer: "f'(x) = 3x² - 3，令f'(x) = 0，得x = -1或x = 1",
          analysis: "先求导，令导数为0求驻点，再判断极值类型",
          points: 10,
          difficulty: 3,
          sortOrder: 1
        }
      ]
    },
    {
      groupId: 6,
      groupName: "六、论述题",
      questionType: QuestionType.ESSAY,
      sortOrder: 6,
      questions: [
        {
          questionId: 601,
          questionType: QuestionType.ESSAY,
          title: "微分中值定理",
          stem: "请阐述拉格朗日中值定理的内容，并给出几何意义的解释。",
          referenceAnswer:
            "拉格朗日中值定理：如果函数f(x)在闭区间[a,b]上连续，在开区间(a,b)内可导，则至少存在一点ξ∈(a,b)，使得f'(ξ) = [f(b)-f(a)]/(b-a)。",
          analysis: "需要完整阐述定理条件、结论和几何意义",
          points: 15,
          difficulty: 4,
          sortOrder: 1
        }
      ]
    }
  ]
};

// 模拟班级列表
const mockClasses = [
  { classId: 1, className: "计算机科学2021级1班", studentCount: 45 },
  { classId: 2, className: "计算机科学2021级2班", studentCount: 42 },
  { classId: 3, className: "软件工程2021级1班", studentCount: 48 },
  { classId: 4, className: "软件工程2021级2班", studentCount: 46 }
];

// 模拟学生列表
const mockStudents = [
  {
    studentId: 1001,
    studentName: "张三",
    studentNo: "2021001001",
    className: "计算机科学2021级1班"
  },
  {
    studentId: 1002,
    studentName: "李四",
    studentNo: "2021001002",
    className: "计算机科学2021级1班"
  },
  {
    studentId: 1003,
    studentName: "王五",
    studentNo: "2021001003",
    className: "计算机科学2021级1班"
  },
  {
    studentId: 1004,
    studentName: "赵六",
    studentNo: "2021001004",
    className: "计算机科学2021级2班"
  },
  {
    studentId: 1005,
    studentName: "钱七",
    studentNo: "2021001005",
    className: "计算机科学2021级2班"
  },
  {
    studentId: 1006,
    studentName: "孙八",
    studentNo: "2021002001",
    className: "软件工程2021级1班"
  },
  {
    studentId: 1007,
    studentName: "周九",
    studentNo: "2021002002",
    className: "软件工程2021级1班"
  },
  {
    studentId: 1008,
    studentName: "吴十",
    studentNo: "2021002003",
    className: "软件工程2021级2班"
  }
];

// 模拟答卷列表
const mockSubmissions = [
  {
    submissionId: 1,
    paperId: 1,
    paperTitle: "2024年春季期中考试",
    studentId: 1001,
    studentName: "张三",
    studentNo: "2021001001",
    className: "计算机科学2021级1班",
    submitStatus: 1,
    submitTime: "2024-04-15 10:45:00",
    startTime: "2024-04-15 09:00:00",
    duration: 6300,
    totalScore: 100,
    score: 85,
    gradeStatus: 2,
    graderId: 101,
    graderName: "张老师",
    gradeTime: "2024-04-16 14:00:00"
  },
  {
    submissionId: 2,
    paperId: 1,
    paperTitle: "2024年春季期中考试",
    studentId: 1002,
    studentName: "李四",
    studentNo: "2021001002",
    className: "计算机科学2021级1班",
    submitStatus: 1,
    submitTime: "2024-04-15 10:58:00",
    startTime: "2024-04-15 09:00:00",
    duration: 7080,
    totalScore: 100,
    score: 92,
    gradeStatus: 2,
    graderId: 101,
    graderName: "张老师",
    gradeTime: "2024-04-16 14:30:00"
  },
  {
    submissionId: 3,
    paperId: 1,
    paperTitle: "2024年春季期中考试",
    studentId: 1003,
    studentName: "王五",
    studentNo: "2021001003",
    className: "计算机科学2021级1班",
    submitStatus: 1,
    submitTime: "2024-04-15 10:30:00",
    startTime: "2024-04-15 09:00:00",
    duration: 5400,
    totalScore: 100,
    score: 78,
    gradeStatus: 2,
    graderId: 101,
    graderName: "张老师",
    gradeTime: "2024-04-16 15:00:00"
  },
  {
    submissionId: 4,
    paperId: 3,
    paperTitle: "概率论期末考试",
    studentId: 1004,
    studentName: "赵六",
    studentNo: "2021001004",
    className: "计算机科学2021级2班",
    submitStatus: 1,
    submitTime: "2024-04-20 10:50:00",
    startTime: "2024-04-20 09:00:00",
    duration: 6600,
    totalScore: 100,
    score: null,
    gradeStatus: 1,
    graderId: 102,
    graderName: "王老师",
    gradeTime: null
  },
  {
    submissionId: 5,
    paperId: 3,
    paperTitle: "概率论期末考试",
    studentId: 1005,
    studentName: "钱七",
    studentNo: "2021001005",
    className: "计算机科学2021级2班",
    submitStatus: 1,
    submitTime: "2024-04-20 10:55:00",
    startTime: "2024-04-20 09:00:00",
    duration: 6900,
    totalScore: 100,
    score: null,
    gradeStatus: 0,
    graderId: null,
    graderName: null,
    gradeTime: null
  }
];

// 模拟统计数据
const mockStatistics = {
  paperId: 1,
  paperTitle: "2024年春季期中考试",
  participantCount: 45,
  submittedCount: 45,
  gradedCount: 45,
  averageScore: 76.5,
  maxScore: 98,
  minScore: 45,
  passRate: 0.867,
  excellentRate: 0.156,
  scoreDistribution: [
    { range: "0-59", count: 6, percentage: 13.3 },
    { range: "60-69", count: 8, percentage: 17.8 },
    { range: "70-79", count: 12, percentage: 26.7 },
    { range: "80-89", count: 12, percentage: 26.7 },
    { range: "90-100", count: 7, percentage: 15.5 }
  ],
  questionAccuracy: [
    { questionId: 101, questionTitle: "极限计算", accuracy: 0.89 },
    { questionId: 102, questionTitle: "导数计算", accuracy: 0.95 },
    { questionId: 201, questionTitle: "连续函数性质", accuracy: 0.67 },
    { questionId: 301, questionTitle: "可导与连续", accuracy: 0.82 },
    { questionId: 401, questionTitle: "积分计算", accuracy: 0.73 },
    { questionId: 501, questionTitle: "极值问题", accuracy: 0.65 },
    { questionId: 601, questionTitle: "微分中值定理", accuracy: 0.58 }
  ]
};

// 学生考试列表数据
const mockStudentExamList = [
  {
    paperId: 1,
    paperTitle: "2024年春季期中考试",
    courseName: "高等数学",
    timeLimit: 120,
    totalPoints: 100,
    startTime: "2024-04-15 09:00:00",
    endTime: "2024-04-15 11:00:00",
    status: 2,
    submitted: true,
    score: 85
  },
  {
    paperId: 5,
    paperTitle: "算法设计期中考试",
    courseName: "算法设计与分析",
    timeLimit: 90,
    totalPoints: 80,
    startTime: "2024-04-25 14:00:00",
    endTime: "2024-04-25 15:30:00",
    status: 1,
    submitted: false,
    score: null
  },
  {
    paperId: 6,
    paperTitle: "操作系统第一次测验",
    courseName: "操作系统",
    timeLimit: 45,
    totalPoints: 40,
    startTime: "2024-04-28 09:00:00",
    endTime: "2024-04-28 09:45:00",
    status: 0,
    submitted: false,
    score: null
  }
];

export default [
  //==================== 教师/管理员端API ====================

  // 获取试卷列表
  {
    url: "/edu/backend/v1/paper/list",
    method: "get",
    response: ({ query }: { query: any }) => {
      const { pageNum = 1, pageSize = 10, status, keyword } = query;
      let list = [...mockPaperList];
      if (status !== undefined && status !== "") {
        list = list.filter(item => item.status === Number(status));
      }
      if (keyword) {
        list = list.filter(
          item =>
            item.title.includes(keyword) || item.courseName.includes(keyword)
        );
      }
      const start = (pageNum - 1) * pageSize;
      const end = start + Number(pageSize);
      return {
        code: 0,
        msg: "success",
        data: { total: list.length, list: list.slice(start, end) }
      };
    }
  },

  // 获取试卷详情
  {
    url: "/edu/backend/v1/paper/detail/:paperId",
    method: "get",
    response: ({ params }: { params: any }) => {
      return {
        code: 0,
        msg: "success",
        data: { ...mockPaperDetail, paperId: Number(params.paperId) }
      };
    }
  },

  // 创建试卷
  {
    url: "/edu/backend/v1/paper/create",
    method: "post",
    response: () => {
      return { code: 0, msg: "创建成功", data: { paperId: Date.now() } };
    }
  },

  // 更新试卷
  {
    url: "/edu/backend/v1/paper/update",
    method: "post",
    response: () => {
      return { code: 0, msg: "更新成功", data: null };
    }
  },

  // 删除试卷
  {
    url: "/edu/backend/v1/paper/delete",
    method: "post",
    response: () => {
      return { code: 0, msg: "删除成功", data: null };
    }
  },

  // 发布试卷
  {
    url: "/edu/backend/v1/paper/publish",
    method: "post",
    response: () => {
      return { code: 0, msg: "发布成功", data: null };
    }
  },

  // 撤回发布
  {
    url: "/edu/backend/v1/paper/unpublish",
    method: "post",
    response: () => {
      return { code: 0, msg: "撤回成功", data: null };
    }
  },

  // 获取可发布的班级列表
  {
    url: "/edu/backend/v1/paper/publish/classes",
    method: "get",
    response: () => {
      return { code: 0, msg: "success", data: mockClasses };
    }
  },

  // 获取可发布的学生列表
  {
    url: "/edu/backend/v1/paper/publish/students",
    method: "get",
    response: ({ query }: { query: any }) => {
      let list = [...mockStudents];
      if (query.classId) {
        const classInfo = mockClasses.find(
          c => c.classId === Number(query.classId)
        );
        if (classInfo) {
          list = list.filter(s => s.className === classInfo.className);
        }
      }
      if (query.keyword) {
        list = list.filter(
          s =>
            s.studentName.includes(query.keyword) ||
            s.studentNo.includes(query.keyword)
        );
      }
      return { code: 0, msg: "success", data: list };
    }
  },

  // 获取答卷列表
  {
    url: "/edu/backend/v1/paper/submission/list",
    method: "get",
    response: ({ query }: { query: any }) => {
      const {
        pageNum = 1,
        pageSize = 10,
        paperId,
        submitStatus,
        gradeStatus,
        keyword
      } = query;
      let list = [...mockSubmissions];
      if (paperId) {
        list = list.filter(item => item.paperId === Number(paperId));
      }
      if (submitStatus !== undefined && submitStatus !== "") {
        list = list.filter(item => item.submitStatus === Number(submitStatus));
      }
      if (gradeStatus !== undefined && gradeStatus !== "") {
        list = list.filter(item => item.gradeStatus === Number(gradeStatus));
      }
      if (keyword) {
        list = list.filter(
          item =>
            item.studentName.includes(keyword) ||
            item.studentNo.includes(keyword)
        );
      }
      const start = (pageNum - 1) * pageSize;
      const end = start + Number(pageSize);
      return {
        code: 0,
        msg: "success",
        data: { total: list.length, list: list.slice(start, end) }
      };
    }
  },

  // 获取答卷详情
  {
    url: "/edu/backend/v1/paper/submission/detail/:submissionId",
    method: "get",
    response: ({ params }: { params: any }) => {
      const submission = mockSubmissions.find(
        s => s.submissionId === Number(params.submissionId)
      );
      return {
        code: 0,
        msg: "success",
        data: submission
          ? {
              ...submission,
              answers: [
                { questionId: 101, answer: "B", score: 4, isCorrect: true },
                { questionId: 102, answer: "C", score: 4, isCorrect: true },
                {
                  questionId: 201,
                  answer: ["A", "B", "D"],
                  score: 5,
                  isCorrect: true
                },
                { questionId: 301, answer: "A", score: 3, isCorrect: true },
                { questionId: 401, answer: "x³/3", score: 4, isCorrect: true },
                {
                  questionId: 501,
                  answer: "解题过程...",
                  score: 8,
                  comment: "正确"
                },
                {
                  questionId: 601,
                  answer: "拉格朗日...",
                  score: 12,
                  comment: "完整"
                }
              ]
            }
          : null
      };
    }
  },

  // 提交批改
  {
    url: "/edu/backend/v1/paper/grade/submit",
    method: "post",
    response: () => {
      return { code: 0, msg: "批改提交成功", data: null };
    }
  },

  // 自动批改客观题
  {
    url: "/edu/backend/v1/paper/grade/auto",
    method: "post",
    response: () => {
      return { code: 0, msg: "自动批改完成", data: { gradedCount: 45 } };
    }
  },

  // 发布成绩
  {
    url: "/edu/backend/v1/paper/score/release",
    method: "post",
    response: () => {
      return { code: 0, msg: "成绩发布成功", data: null };
    }
  },

  // 获取试卷统计数据
  {
    url: "/edu/backend/v1/paper/statistics/:paperId",
    method: "get",
    response: () => {
      return { code: 0, msg: "success", data: mockStatistics };
    }
  },

  // ==================== 学生端API ====================

  // 获取学生考试列表
  {
    url: "/edu/frontend/v1/exam/list",
    method: "get",
    response: ({ query }: { query: any }) => {
      const { pageNum = 1, pageSize = 10 } = query;
      const list = mockStudentExamList;
      const start = (pageNum - 1) * pageSize;
      const end = start + Number(pageSize);
      return {
        code: 0,
        msg: "success",
        data: { total: list.length, list: list.slice(start, end) }
      };
    }
  },

  // 开始考试
  {
    url: "/edu/frontend/v1/exam/start",
    method: "post",
    response: ({ body }: { body: any }) => {
      const { paperId } = body;
      return {
        code: 0,
        msg: "success",
        data: {
          submissionId: Date.now(),
          paper: { ...mockPaperDetail, paperId },
          remainingTime: mockPaperDetail.timeLimit * 60
        }
      };
    }
  },

  // 保存答案
  {
    url: "/edu/frontend/v1/exam/save",
    method: "post",
    response: () => {
      return { code: 0, msg: "保存成功", data: null };
    }
  },

  // 提交试卷
  {
    url: "/edu/frontend/v1/exam/submit",
    method: "post",
    response: () => {
      return {
        code: 0,
        msg: "提交成功",
        data: { score: null, showScore: false }
      };
    }
  },

  // 查看考试结果
  {
    url: "/edu/frontend/v1/exam/result/:submissionId",
    method: "get",
    response: ({ params }: { params: any }) => {
      const submission = mockSubmissions.find(
        s => s.submissionId === Number(params.submissionId)
      );
      return {
        code: 0,
        msg: "success",
        data: submission
          ? {
              ...submission,
              answers: [
                { questionId: 101, answer: "B", score: 4, isCorrect: true },
                { questionId: 102, answer: "C", score: 4, isCorrect: true },
                {
                  questionId: 201,
                  answer: ["A", "B", "D"],
                  score: 5,
                  isCorrect: true
                },
                { questionId: 301, answer: "A", score: 3, isCorrect: true },
                { questionId: 401, answer: "x³/3", score: 4, isCorrect: true },
                {
                  questionId: 501,
                  answer: "解题过程...",
                  score: 8,
                  comment: "正确"
                },
                {
                  questionId: 601,
                  answer: "拉格朗日...",
                  score: 12,
                  comment: "完整"
                }
              ]
            }
          : null
      };
    }
  },

  // ==================== 学情分析API ====================

  // 获取学情分析数据
  {
    url: "/edu/backend/v1/paper/learning-analytics",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: {
          overview: {
            totalExams: 28,
            totalStudents: 156,
            avgScore: 78.5,
            passRate: 85.2
          },
          scoreDistribution: [
            { range: "0-59", count: 12, percentage: 7.7 },
            { range: "60-69", count: 18, percentage: 11.5 },
            { range: "70-79", count: 45, percentage: 28.8 },
            { range: "80-89", count: 52, percentage: 33.3 },
            { range: "90-100", count: 29, percentage: 18.6 }
          ],
          knowledgePoints: [
            { name: "极限与连续", mastery: 85, questionCount: 45 },
            { name: "导数与微分", mastery: 78, questionCount: 62 },
            { name: "积分计算", mastery: 72, questionCount: 58 },
            { name: "级数理论", mastery: 65, questionCount: 35 },
            { name: "多元函数", mastery: 70, questionCount: 42 }
          ],
          questionTypeStats: [
            { type: "单选题", correctRate: 82, avgTime: 45 },
            { type: "多选题", correctRate: 68, avgTime: 72 },
            { type: "判断题", correctRate: 88, avgTime: 25 },
            { type: "填空题", correctRate: 75, avgTime: 90 },
            { type: "简答题", correctRate: 70, avgTime: 180 }
          ],
          examTrends: [
            { date: "2024-01", avgScore: 72, passRate: 78 },
            { date: "2024-02", avgScore: 75, passRate: 82 },
            { date: "2024-03", avgScore: 78, passRate: 85 },
            { date: "2024-04", avgScore: 80, passRate: 88 }
          ],
          studentRanking: [
            {
              rank: 1,
              name: "张三",
              studentId: "2024001",
              score: 98,
              trend: "up"
            },
            {
              rank: 2,
              name: "李四",
              studentId: "2024002",
              score: 95,
              trend: "same"
            },
            {
              rank: 3,
              name: "王五",
              studentId: "2024003",
              score: 93,
              trend: "up"
            },
            {
              rank: 4,
              name: "赵六",
              studentId: "2024004",
              score: 91,
              trend: "down"
            },
            {
              rank: 5,
              name: "钱七",
              studentId: "2024005",
              score: 89,
              trend: "up"
            }
          ]
        }
      };
    }
  },

  // 获取课程列表
  {
    url: "/edu/backend/v1/course/list",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: [
          { id: 1, name: "高等数学" },
          { id: 2, name: "线性代数" },
          { id: 3, name: "概率论" },
          { id: 4, name: "数据结构" },
          { id: 5, name: "算法设计与分析" }
        ]
      };
    }
  },

  // ==================== 题目助手API ====================

  // 搜索题库题目（与列表共享同一数据源）
  {
    url: "/edu/backend/v1/question-bank/search",
    method: "get",
    response: ({ query }: { query: any }) => {
      const {
        pageNum = 1,
        pageSize = 10,
        keyword,
        type,
        difficulty,
        knowledgePoint
      } = query;
      // 统一数据源：包含题库管理列表中的所有题目 + 额外题目
      const allQuestions = [
        {
          id: 1,
          type: "radio",
          typeName: "单选题",
          stem: "函数 f(x) = x²在 x = 0 处的导数是？",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1" },
            { key: "C", content: "2" },
            { key: "D", content: "不存在" }
          ],
          correctAnswer: "A",
          analysis: "根据导数定义，f'(x) = 2x，当 x = 0 时，f'(0) = 0",
          knowledgePoints: ["导数与微分", "求导公式"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 5,
          createTime: "2026-01-15",
          useCount: 15
        },
        {
          id: 2,
          type: "checkbox",
          typeName: "多选题",
          stem: "以下哪些是 JavaScript 的基本数据类型？",
          options: [
            { key: "A", content: "String" },
            { key: "B", content: "Number" },
            { key: "C", content: "Array" },
            { key: "D", content: "Boolean" }
          ],
          correctAnswers: ["A", "B", "D"],
          analysis: "JavaScript 的基本数据类型包括 String、Number、Boolean、Undefined、Null、Symbol 和 BigInt。Array 是引用类型。",
          knowledgePoints: ["JavaScript基础", "数据类型"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 10,
          createTime: "2026-01-18",
          useCount: 8
        },
        {
          id: 3,
          type: "input",
          typeName: "填空题",
          stem: "光在真空中的传播速度约为 ______ m/s。",
          blanks: [{ answer: "3×10^8" }],
          correctAnswer: "3×10^8",
          analysis: "光速是物理学中的基本常数，约为 299,792,458 m/s，通常近似为 3×10^8 m/s。",
          knowledgePoints: ["光学", "物理常数"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 5,
          createTime: "2026-01-10",
          useCount: 22
        },
        {
          id: 4,
          type: "textarea",
          typeName: "简答题",
          stem: "请简述数据库事务的 ACID 特性，并举例说明。",
          referenceAnswer: "ACID 是数据库事务的四个基本特性...",
          knowledgePoints: ["事务管理", "ACID"],
          difficulty: "hard",
          difficultyName: "困难",
          points: 15,
          createTime: "2026-01-22",
          useCount: 5
        },
        {
          id: 5,
          type: "judge",
          typeName: "判断题",
          stem: "The word 'beautiful' is an adjective.",
          options: [
            { key: "T", content: "正确" },
            { key: "F", content: "错误" }
          ],
          correctAnswer: "T",
          analysis: "'Beautiful' 是一个形容词，用于描述名词的特征。",
          knowledgePoints: ["词性", "形容词"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 3,
          createTime: "2026-01-05",
          useCount: 30
        },
        {
          id: 6,
          type: "radio",
          typeName: "单选题",
          stem: "求极限 lim(x→0) sin(x)/x 的值为：",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1" },
            { key: "C", content: "∞" },
            { key: "D", content: "不存在" }
          ],
          correctAnswer: "B",
          analysis: "这是一个重要极限，lim(x→0) sin(x)/x = 1",
          knowledgePoints: ["极限与连续", "重要极限"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 4,
          createTime: "2026-01-20",
          useCount: 12
        },
        {
          id: 1002,
          type: "radio",
          typeName: "单选题",
          stem: "函数 f(x) = x³ 的导数 f'(x) 为：",
          options: [
            { key: "A", content: "x²" },
            { key: "B", content: "2x²" },
            { key: "C", content: "3x²" },
            { key: "D", content: "3x" }
          ],
          correctAnswer: "C",
          analysis: "根据幂函数求导公式，(x³)' = 3x²",
          knowledgePoints: ["导数与微分", "求导公式"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 4,
          createTime: "2024-03-16 14:00:00",
          useCount: 8
        },
        {
          id: 1003,
          type: "checkbox",
          typeName: "多选题",
          stem: "下列关于连续函数的说法正确的是：",
          options: [
            { key: "A", content: "连续函数的和仍是连续函数" },
            { key: "B", content: "连续函数的积仍是连续函数" },
            { key: "C", content: "连续函数的商一定是连续函数" },
            { key: "D", content: "连续函数的复合仍是连续函数" }
          ],
          correctAnswers: ["A", "B", "D"],
          analysis: "连续函数的和、积、复合都是连续函数，但商在分母为0处不连续",
          knowledgePoints: ["极限与连续", "连续函数"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 5,
          createTime: "2024-03-17 09:00:00",
          useCount: 6
        },
        {
          id: 1004,
          type: "judge",
          typeName: "判断题",
          stem: "可导函数一定连续。",
          options: [
            { key: "T", content: "正确" },
            { key: "F", content: "错误" }
          ],
          correctAnswer: "T",
          analysis: "可导必连续，但连续不一定可导",
          knowledgePoints: ["导数与微分", "可导与连续"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 3,
          createTime: "2024-03-18 11:00:00",
          useCount: 15
        },
        {
          id: 1005,
          type: "input",
          typeName: "填空题",
          stem: "∫x²dx = ______ + C",
          blanks: [{ answer: "x³/3" }],
          correctAnswer: "x³/3",
          analysis: "根据积分公式 ∫xⁿdx = xⁿ⁺¹/(n+1) + C",
          knowledgePoints: ["积分计算", "不定积分"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 4,
          createTime: "2024-03-19 15:00:00",
          useCount: 10
        },
        {
          id: 1006,
          type: "textarea",
          typeName: "简答题",
          stem: "求函数 f(x) = x³ - 3x + 2 的极值点和极值。",
          referenceAnswer:
            "f'(x) = 3x² - 3 = 0，得 x = ±1。f''(x) = 6x，f''(-1) = -6 < 0，所以 x = -1 是极大值点，极大值 f(-1) = 4；f''(1) = 6 > 0，所以 x = 1 是极小值点，极小值 f(1) = 0。",
          analysis: "先求导，令导数为0求驻点，再用二阶导数判断极值类型",
          knowledgePoints: ["导数与微分", "极值问题"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 10,
          createTime: "2024-03-20 10:00:00",
          useCount: 5
        },
        {
          id: 1007,
          type: "radio",
          typeName: "单选题",
          stem: "设 f(x) 在 [a,b] 上连续，在 (a,b) 内可导，且 f(a) = f(b)，则至少存在一点 ξ∈(a,b)，使得 f'(ξ) = 0。这是哪个定理？",
          options: [
            { key: "A", content: "罗尔定理" },
            { key: "B", content: "拉格朗日中值定理" },
            { key: "C", content: "柯西中值定理" },
            { key: "D", content: "泰勒定理" }
          ],
          correctAnswer: "A",
          analysis: "罗尔定理的条件是函数在闭区间连续、开区间可导、端点值相等",
          knowledgePoints: ["导数与微分", "中值定理"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 4,
          createTime: "2024-03-21 08:00:00",
          useCount: 9
        },
        {
          id: 1008,
          type: "radio",
          typeName: "单选题",
          stem: "级数 Σ(1/n²) (n=1到∞) 是：",
          options: [
            { key: "A", content: "发散的" },
            { key: "B", content: "条件收敛的" },
            { key: "C", content: "绝对收敛的" },
            { key: "D", content: "无法判断" }
          ],
          correctAnswer: "C",
          analysis: "p级数当p>1时收敛，这里p=2>1，所以绝对收敛",
          knowledgePoints: ["级数理论", "正项级数"],
          difficulty: "medium",
          difficultyName: "中等",
          points: 4,
          createTime: "2024-03-22 16:00:00",
          useCount: 7
        },
        {
          id: 1009,
          type: "textarea",
          typeName: "简答题",
          stem: "证明：若 f(x) 在 [a,b] 上连续，则 f(x) 在 [a,b] 上有最大值和最小值。",
          referenceAnswer:
            "这是最值定理（魏尔斯特拉斯定理）的内容。证明需要用到有界性定理和确界原理...",
          analysis:
            "需要利用有界性定理证明函数有界，再利用确界原理证明上确界可以取到",
          knowledgePoints: ["极限与连续", "连续函数性质"],
          difficulty: "hard",
          difficultyName: "困难",
          points: 12,
          createTime: "2024-03-23 09:00:00",
          useCount: 3
        },
        {
          id: 1010,
          type: "radio",
          typeName: "单选题",
          stem: "二重积分 ∬_D dxdy 的几何意义是：",
          options: [
            { key: "A", content: "区域D的面积" },
            { key: "B", content: "区域D的周长" },
            { key: "C", content: "曲面的面积" },
            { key: "D", content: "体积" }
          ],
          correctAnswer: "A",
          analysis: "当被积函数为1时，二重积分的值等于积分区域的面积",
          knowledgePoints: ["多元函数", "重积分"],
          difficulty: "easy",
          difficultyName: "简单",
          points: 4,
          createTime: "2024-03-24 14:00:00",
          useCount: 11
        }
      ];

      let filtered = [...allQuestions];
      if (keyword) {
        filtered = filtered.filter(
          q =>
            q.stem.includes(keyword) ||
            q.knowledgePoints.some(kp => kp.includes(keyword))
        );
      }
      if (type) {
        filtered = filtered.filter(q => q.type === type);
      }
      if (difficulty) {
        filtered = filtered.filter(q => q.difficulty === difficulty);
      }
      if (knowledgePoint) {
        filtered = filtered.filter(q =>
          q.knowledgePoints.some(kp => kp.includes(knowledgePoint))
        );
      }
      const start = (Number(pageNum) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      return {
        code: 0,
        msg: "success",
        data: {
          total: filtered.length,
          list: filtered.slice(start, end)
        }
      };
    }
  },

  // AI 生成题目（支持 mode 字段：generate/recommend/polish）
  {
    url: "/edu/backend/v1/ai/generate-question",
    method: "post",
    response: ({ body }: { body: any }) => {
      const { questionType, count = 1, knowledgePoints, difficulty, includeAnalysis = true, mode = "generate", excludeQuestionIds = [] } = body;
      
      // recommend 模式：从题库推荐题目
      if (mode === "recommend") {
        const questionBank = [
          { id: 1, type: "radio", stem: "函数 f(x) = x²在 x = 0 处的导数是？", options: [{ key: "A", content: "0" }, { key: "B", content: "1" }, { key: "C", content: "2" }, { key: "D", content: "不存在" }], correctAnswer: "A", analysis: "根据导数定义，f'(x) = 2x，当 x = 0 时，f'(0) = 0", difficulty: "easy", knowledgePoints: ["导数与微分"] },
          { id: 6, type: "radio", stem: "求极限 lim(x→0) sin(x)/x 的值为：", options: [{ key: "A", content: "0" }, { key: "B", content: "1" }, { key: "C", content: "∞" }, { key: "D", content: "不存在" }], correctAnswer: "B", analysis: "这是一个重要极限", difficulty: "medium", knowledgePoints: ["极限与连续"] },
          { id: 1002, type: "radio", stem: "函数 f(x) = x³ 的导数 f'(x) 为：", options: [{ key: "A", content: "x²" }, { key: "B", content: "2x²" }, { key: "C", content: "3x²" }, { key: "D", content: "3x" }], correctAnswer: "C", analysis: "根据幂函数求导公式", difficulty: "easy", knowledgePoints: ["导数与微分"] },
          { id: 2, type: "checkbox", stem: "以下哪些是 JavaScript 的基本数据类型？", options: [{ key: "A", content: "String" }, { key: "B", content: "Number" }, { key: "C", content: "Array" }, { key: "D", content: "Boolean" }], correctAnswers: ["A", "B", "D"], analysis: "Array 是引用类型", difficulty: "medium", knowledgePoints: ["JavaScript基础"] },
          { id: 5, type: "judge", stem: "可导函数一定连续。", options: [{ key: "T", content: "正确" }, { key: "F", content: "错误" }], correctAnswer: "T", analysis: "可导必连续", difficulty: "easy", knowledgePoints: ["导数与微分"] },
          { id: 3, type: "input", stem: "光在真空中的传播速度约为 ______ m/s。", blanks: [{ answer: "3×10^8" }], correctAnswer: "3×10^8", analysis: "光速常数", difficulty: "medium", knowledgePoints: ["光学"] },
        ];
        let filtered = questionBank.filter(q => !excludeQuestionIds.includes(q.id));
        if (questionType) filtered = filtered.filter(q => q.type === questionType);
        if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
        if (knowledgePoints) filtered = filtered.filter(q => q.knowledgePoints.some(kp => kp.includes(knowledgePoints)));
        return { code: 0, msg: "success", data: filtered.slice(0, count).map(q => ({ ...q, id: Date.now() + Math.random(), fromBank: true })) };
      }
      
      const generated = [];
      for (let i = 0; i < Math.min(count, 10); i++) {
        const id = Date.now() + i;
        if (questionType === "radio") {
          generated.push({
            id,
            type: "radio",
            stem: `[AI生成] 关于${knowledgePoints || "数学"}的单选题 ${i + 1}：以下哪个说法是正确的？`,
            options: [
              { key: "A", content: "选项A的内容" },
              { key: "B", content: "选项B的内容" },
              { key: "C", content: "选项C的内容（正确答案）" },
              { key: "D", content: "选项D的内容" }
            ],
            correctAnswer: "C",
            analysis: includeAnalysis ? "AI生成的解析：选项C是正确的，因为..." : "",
            difficulty: difficulty || "medium",
            knowledgePoints: knowledgePoints ? [knowledgePoints] : ["数学基础"]
          });
        } else if (questionType === "checkbox") {
          generated.push({
            id,
            type: "checkbox",
            stem: `[AI生成] 关于${knowledgePoints || "数学"}的多选题 ${i + 1}：以下哪些说法是正确的？`,
            options: [
              { key: "A", content: "正确选项A" },
              { key: "B", content: "正确选项B" },
              { key: "C", content: "错误选项C" },
              { key: "D", content: "正确选项D" }
            ],
            correctAnswers: ["A", "B", "D"],
            analysis: includeAnalysis ? "AI生成的解析：A、B、D都是正确的..." : "",
            difficulty: difficulty || "medium",
            knowledgePoints: knowledgePoints ? [knowledgePoints] : ["数学基础"]
          });
        } else if (questionType === "judge") {
          generated.push({
            id,
            type: "judge",
            stem: `[AI生成] 关于${knowledgePoints || "数学"}的判断题 ${i + 1}：该命题是否正确？`,
            options: [
              { key: "T", content: "正确" },
              { key: "F", content: "错误" }
            ],
            correctAnswer: "T",
            analysis: includeAnalysis ? "AI生成的解析：该命题是正确的，因为..." : "",
            difficulty: difficulty || "easy",
            knowledgePoints: knowledgePoints ? [knowledgePoints] : ["数学基础"]
          });
        } else if (questionType === "input") {
          generated.push({
            id,
            type: "input",
            stem: `[AI生成] 关于${knowledgePoints || "数学"}的填空题 ${i + 1}：请填写 ______。`,
            blanks: [{ answer: "参考答案" }],
            correctAnswer: "参考答案",
            analysis: includeAnalysis ? "AI生成的解析：答案是..." : "",
            difficulty: difficulty || "medium",
            knowledgePoints: knowledgePoints ? [knowledgePoints] : ["数学基础"]
          });
        } else {
          generated.push({
            id,
            type: "textarea",
            stem: `[AI生成] 关于${knowledgePoints || "数学"}的简答题 ${i + 1}：请详细阐述相关概念。`,
            referenceAnswer: "AI生成的参考答案：...",
            analysis: includeAnalysis ? "AI生成的解析：需要从以下几个方面回答..." : "",
            difficulty: difficulty || "medium",
            knowledgePoints: knowledgePoints ? [knowledgePoints] : ["数学基础"]
          });
        }
      }
      return {
        code: 0,
        msg: "success",
        data: generated
      };
    }
  },

  // 获取题库列表
  {
    url: "/edu/backend/v1/question-bank/list",
    method: "get",
    response: ({ query }: { query: any }) => {
      const {
        pageNum = 1,
        pageSize = 10,
        keyword,
        type,
        difficulty,
        knowledgePoint,
        folderId
      } = query;
      const allQuestions = [
        {
          id: 1,
          type: "radio",
          typeName: "单选题",
          subject: "math",
          subjectName: "高等数学",
          difficulty: "easy",
          difficultyName: "简单",
          stem: "函数 f(x) = x²在 x = 0 处的导数是？",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1" },
            { key: "C", content: "2" },
            { key: "D", content: "不存在" }
          ],
          correctAnswer: "A",
          analysis: "根据导数定义，f'(x) = 2x，当 x = 0 时，f'(0) = 0",
          knowledgePoints: ["导数与微分", "求导公式"],
          points: 5,
          useCount: 15,
          createTime: "2026-01-15",
          folderId: 1,
          folderName: "高等数学"
        },
        {
          id: 2,
          type: "checkbox",
          typeName: "多选题",
          subject: "programming",
          subjectName: "程序设计",
          difficulty: "medium",
          difficultyName: "中等",
          stem: "以下哪些是 JavaScript 的基本数据类型？",
          options: [
            { key: "A", content: "String" },
            { key: "B", content: "Number" },
            { key: "C", content: "Array" },
            { key: "D", content: "Boolean" }
          ],
          correctAnswers: ["A", "B", "D"],
          analysis:
            "JavaScript 的基本数据类型包括 String、Number、Boolean、Undefined、Null、Symbol 和 BigInt。Array 是引用类型。",
          knowledgePoints: ["JavaScript基础", "数据类型"],
          points: 10,
          useCount: 8,
          createTime: "2026-01-18",
          folderId: 2,
          folderName: "程序设计"
        },
        {
          id: 3,
          type: "input",
          typeName: "填空题",
          subject: "physics",
          subjectName: "大学物理",
          difficulty: "medium",
          difficultyName: "中等",
          stem: "光在真空中的传播速度约为 ______ m/s。",
          correctAnswer: "3×10^8",
          blanks: [{ answer: "3×10^8" }],
          analysis:
            "光速是物理学中的基本常数，约为 299,792,458 m/s，通常近似为 3×10^8 m/s。",
          knowledgePoints: ["光学", "物理常数"],
          points: 5,
          useCount: 22,
          createTime: "2026-01-10",
          folderId: 3,
          folderName: "大学物理"
        },
        {
          id: 4,
          type: "textarea",
          typeName: "简答题",
          subject: "database",
          subjectName: "数据库原理",
          difficulty: "hard",
          difficultyName: "困难",
          stem: "请简述数据库事务的 ACID 特性，并举例说明。",
          referenceAnswer:
            "ACID 是数据库事务的四个基本特性：\\n1. 原子性(Atomicity)：事务中的所有操作要么全部完成，要么全部不完成。\\n2. 一致性(Consistency)：事务执行前后，数据库的完整性约束没有被破坏。\\n3. 隔离性(Isolation)：多个事务并发执行时，一个事务的执行不应影响其他事务。\\n4. 持久性(Durability)：事务完成后，对数据库的修改是永久性的。",
          knowledgePoints: ["事务管理", "ACID"],
          points: 15,
          useCount: 5,
          createTime: "2026-01-22",
          folderId: 2,
          folderName: "程序设计"
        },
        {
          id: 5,
          type: "judge",
          typeName: "判断题",
          subject: "english",
          subjectName: "大学英语",
          difficulty: "easy",
          difficultyName: "简单",
          stem: "The word 'beautiful' is an adjective.",
          options: [
            { key: "T", content: "正确" },
            { key: "F", content: "错误" }
          ],
          correctAnswer: "T",
          analysis: "'Beautiful' 是一个形容词，用于描述名词的特征。",
          knowledgePoints: ["词性", "形容词"],
          points: 3,
          useCount: 30,
          createTime: "2026-01-05",
          folderId: 4,
          folderName: "大学英语"
        },
        {
          id: 6,
          type: "radio",
          typeName: "单选题",
          subject: "math",
          subjectName: "高等数学",
          difficulty: "medium",
          difficultyName: "中等",
          stem: "求极限 lim(x→0) sin(x)/x 的值为：",
          options: [
            { key: "A", content: "0" },
            { key: "B", content: "1" },
            { key: "C", content: "∞" },
            { key: "D", content: "不存在" }
          ],
          correctAnswer: "B",
          analysis: "这是一个重要极限，lim(x→0) sin(x)/x = 1",
          knowledgePoints: ["极限与连续", "重要极限"],
          points: 4,
          useCount: 12,
          createTime: "2026-01-20",
          folderId: 1,
          folderName: "高等数学"
        }
      ];

      let filtered = [...allQuestions];
      if (keyword) {
        filtered = filtered.filter(
          q =>
            q.stem.includes(keyword) ||
            q.knowledgePoints.some(kp => kp.includes(keyword))
        );
      }
      if (type) {
        filtered = filtered.filter(q => q.type === type);
      }
      if (difficulty) {
        filtered = filtered.filter(q => q.difficulty === difficulty);
      }
      if (knowledgePoint) {
        filtered = filtered.filter(q =>
          q.knowledgePoints.some(kp => kp.includes(knowledgePoint))
        );
      }
      if (folderId) {
        filtered = filtered.filter(q => q.folderId === Number(folderId));
      }
      const start = (Number(pageNum) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      return {
        code: 0,
        msg: "success",
        data: {
          total: filtered.length,
          list: filtered.slice(start, end)
        }
      };
    }
  },

  // 获取题库统计数据
  {
    url: "/edu/backend/v1/question-bank/statistics",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: {
          total: 156,
          radio: 45,
          checkbox: 28,
          judge: 20,
          input: 31,
          textarea: 32
        }
      };
    }
  },

  // 创建题目
  {
    url: "/edu/backend/v1/question-bank/create",
    method: "post",
    response: () => {
      return { code: 0, msg: "创建成功", data: { id: Date.now() } };
    }
  },

  // 更新题目
  {
    url: "/edu/backend/v1/question-bank/update",
    method: "post",
    response: () => {
      return { code: 0, msg: "更新成功", data: null };
    }
  },

  // 删除题目
  {
    url: "/edu/backend/v1/question-bank/delete",
    method: "post",
    response: () => {
      return { code: 0, msg: "删除成功", data: null };
    }
  },

  // 批量删除题目
  {
    url: "/edu/backend/v1/question-bank/batch-delete",
    method: "post",
    response: ({ body }: { body: any }) => {
      const { ids } = body;
      return {
        code: 0,
        msg: `成功删除 ${ids?.length || 0} 道题目`,
        data: null
      };
    }
  },

  // 导入题目
  {
    url: "/edu/backend/v1/question-bank/import",
    method: "post",
    response: () => {
      return {
        code: 0,
        msg: "导入成功",
        data: { importedCount: 10, failedCount: 0 }
      };
    }
  },

  // 导出题目
  {
    url: "/edu/backend/v1/question-bank/export",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: { downloadUrl: "/api/download/questions.xlsx" }
      };
    }
  },

  // 获取题库文件夹列表
  {
    url: "/edu/backend/v1/question-bank/folders",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: [
          {
            id: 1,
            name: "高等数学",
            parentId: null,
            questionCount: 45,
            createTime: "2026-01-01",
            children: [
              {
                id: 11,
                name: "极限与连续",
                parentId: 1,
                questionCount: 15,
                createTime: "2026-01-02"
              },
              {
                id: 12,
                name: "导数与微分",
                parentId: 1,
                questionCount: 20,
                createTime: "2026-01-02"
              },
              {
                id: 13,
                name: "积分计算",
                parentId: 1,
                questionCount: 10,
                createTime: "2026-01-02"
              }
            ]
          },
          {
            id: 2,
            name: "程序设计",
            parentId: null,
            questionCount: 38,
            createTime: "2026-01-01",
            children: [
              {
                id: 21,
                name: "JavaScript",
                parentId: 2,
                questionCount: 18,
                createTime: "2026-01-03"
              },
              {
                id: 22,
                name: "数据库",
                parentId: 2,
                questionCount: 20,
                createTime: "2026-01-03"
              }
            ]
          },
          {
            id: 3,
            name: "大学物理",
            parentId: null,
            questionCount: 32,
            createTime: "2026-01-01"
          },
          {
            id: 4,
            name: "大学英语",
            parentId: null,
            questionCount: 41,
            createTime: "2026-01-01"
          }
        ]
      };
    }
  },

  // 创建题库文件夹
  {
    url: "/edu/backend/v1/question-bank/folders/create",
    method: "post",
    response: () => {
      return { code: 0, msg: "创建成功", data: { id: Date.now() } };
    }
  },

  // 更新题库文件夹
  {
    url: "/edu/backend/v1/question-bank/folders/update",
    method: "post",
    response: () => {
      return { code: 0, msg: "更新成功", data: null };
    }
  },

  // 删除题库文件夹
  {
    url: "/edu/backend/v1/question-bank/folders/delete",
    method: "post",
    response: () => {
      return { code: 0, msg: "删除成功", data: null };
    }
  },

  // 移动题目到文件夹
  {
    url: "/edu/backend/v1/question-bank/move-to-folder",
    method: "post",
    response: () => {
      return { code: 0, msg: "移动成功", data: null };
    }
  },

  // 发布试卷（高级配置）
  {
    url: "/edu/backend/v1/paper/publish-advanced",
    method: "post",
    response: () => {
      return { code: 0, msg: "发布成功", data: null };
    }
  },

  // 保存为模板
  {
    url: "/edu/backend/v1/paper/save-as-template",
    method: "post",
    response: () => {
      return { code: 0, msg: "保存模板成功", data: { templateId: Date.now() } };
    }
  },

  // 获取模板详情
  {
    url: "/edu/backend/v1/paper/template/:templateId",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: {
          title: "模板试卷",
          description: "这是一个模板试卷",
          timeLimit: 90,
          questionGroups: []
        }
      };
    }
  },

  // 归档题目到题库
  {
    url: "/edu/backend/v1/question-bank/archive",
    method: "post",
    response: ({ body }: { body: any }) => {
      const count = body?.questions?.length || 1;
      return {
        code: 0,
        msg: `成功归档 ${count} 道题目到题库`,
        data: { archivedCount: count }
      };
    }
  },

  // 批量归档题目到题库
  {
    url: "/edu/backend/v1/question-bank/batch-archive",
    method: "post",
    response: ({ body }: { body: any }) => {
      const count = body?.questions?.length || 0;
      return {
        code: 0,
        msg: `成功归档 ${count} 道题目到题库`,
        data: { archivedCount: count }
      };
    }
  },

  // AI 试卷分析
  {
    url: "/edu/backend/v1/ai/paper/analyze",
    method: "post",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: {
          difficulty: 3.2,
          difficultyDescription: "中等偏难",
          knowledgeCoverage: 85,
          typeBalance: 78,
          estimatedTime: 95,
          overallScore: 82,
          suggestions: [
            "建议增加简单题目的比例，当前难度分布偏高",
            "知识点覆盖较全面，但「级数理论」相关题目较少",
            "题型分布合理，但可考虑增加填空题数量",
            "预估答题时间接近限时，建议适当减少题量或延长考试时间"
          ]
        }
      };
    }
  },

  // 获取知识点列表
  {
    url: "/edu/backend/v1/knowledge-points",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: [
          {
            id: 1,
            name: "极限与连续",
            questionCount: 45,
            children: [
              { id: 11, name: "数列极限", parentId: 1, questionCount: 12 },
              { id: 12, name: "函数极限", parentId: 1, questionCount: 15 },
              { id: 13, name: "重要极限", parentId: 1, questionCount: 8 },
              { id: 14, name: "连续函数", parentId: 1, questionCount: 10 }
            ]
          },
          {
            id: 2,
            name: "导数与微分",
            questionCount: 62,
            children: [
              { id: 21, name: "求导公式", parentId: 2, questionCount: 18 },
              { id: 22, name: "复合函数求导", parentId: 2, questionCount: 14 },
              { id: 23, name: "隐函数求导", parentId: 2, questionCount: 10 },
              { id: 24, name: "中值定理", parentId: 2, questionCount: 12 },
              { id: 25, name: "极值问题", parentId: 2, questionCount: 8 }
            ]
          },
          {
            id: 3,
            name: "积分计算",
            questionCount: 58,
            children: [
              { id: 31, name: "不定积分", parentId: 3, questionCount: 20 },
              { id: 32, name: "定积分", parentId: 3, questionCount: 18 },
              { id: 33, name: "换元积分法", parentId: 3, questionCount: 12 },
              { id: 34, name: "分部积分法", parentId: 3, questionCount: 8 }
            ]
          },
          {
            id: 4,
            name: "级数理论",
            questionCount: 35,
            children: [
              { id: 41, name: "正项级数", parentId: 4, questionCount: 12 },
              { id: 42, name: "交错级数", parentId: 4, questionCount: 8 },
              { id: 43, name: "幂级数", parentId: 4, questionCount: 10 },
              { id: 44, name: "傅里叶级数", parentId: 4, questionCount: 5 }
            ]
          },
          {
            id: 5,
            name: "多元函数",
            questionCount: 42,
            children: [
              { id: 51, name: "偏导数", parentId: 5, questionCount: 15 },
              { id: 52, name: "全微分", parentId: 5, questionCount: 10 },
              { id: 53, name: "重积分", parentId: 5, questionCount: 12 },
              { id: 54, name: "曲线积分", parentId: 5, questionCount: 5 }
            ]
          }
        ]
      };
    }
  }
] as MockMethod[];

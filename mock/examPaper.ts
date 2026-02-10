import { MockMethod } from "vite-plugin-mock";

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
          referenceAnswer: "拉格朗日中值定理：如果函数f(x)在闭区间[a,b]上连续，在开区间(a,b)内可导，则至少存在一点ξ∈(a,b)，使得f'(ξ) = [f(b)-f(a)]/(b-a)。",
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
  { studentId: 1001, studentName: "张三", studentNo: "2021001001", className: "计算机科学2021级1班" },
  { studentId: 1002, studentName: "李四", studentNo: "2021001002", className: "计算机科学2021级1班" },
  { studentId: 1003, studentName: "王五", studentNo: "2021001003", className: "计算机科学2021级1班" },
  { studentId: 1004, studentName: "赵六", studentNo: "2021001004", className: "计算机科学2021级2班" },
  { studentId: 1005, studentName: "钱七", studentNo: "2021001005", className: "计算机科学2021级2班" },
  { studentId: 1006, studentName: "孙八", studentNo: "2021002001", className: "软件工程2021级1班" },
  { studentId: 1007, studentName: "周九", studentNo: "2021002002", className: "软件工程2021级1班" },
  { studentId: 1008, studentName: "吴十", studentNo: "2021002003", className: "软件工程2021级2班" }
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
      const { pageNum = 1, pageSize = 10, paperId, submitStatus, gradeStatus, keyword } = query;
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
        data: submission? {
              ...submission,
              answers: [
                { questionId: 101, answer: "B", score: 4, isCorrect: true },
                { questionId: 102, answer: "C", score: 4, isCorrect: true },
                { questionId: 201, answer: ["A", "B", "D"], score: 5, isCorrect: true },
                { questionId: 301, answer: "A", score: 3, isCorrect: true },
                { questionId: 401, answer: "x³/3", score: 4, isCorrect: true },
                { questionId: 501, answer: "解题过程...", score: 8, comment: "正确" },
                { questionId: 601, answer: "拉格朗日...", score: 12, comment: "完整" }
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
      const { pageNum = 1, pageSize = 10} = query;
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
      return { code: 0, msg: "提交成功", data: { score: null, showScore: false } };
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
        data: submission ? {
          ...submission,
          answers: [
            { questionId: 101, answer: "B", score: 4, isCorrect: true },
            { questionId: 102, answer: "C", score: 4, isCorrect: true },
            { questionId: 201, answer: ["A", "B", "D"], score: 5, isCorrect: true },
            { questionId: 301, answer: "A", score: 3, isCorrect: true },
            { questionId: 401, answer: "x³/3", score: 4, isCorrect: true },
            { questionId: 501, answer: "解题过程...", score: 8, comment: "正确" },
            { questionId: 601, answer: "拉格朗日...", score: 12, comment: "完整" }
          ]
        } : null
      };
    }
  }
] as MockMethod[];

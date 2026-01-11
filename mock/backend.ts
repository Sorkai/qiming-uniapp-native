import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 辅助函数：安全获取查询参数
const getQueryParam = (
  query: Record<string, string | string[]>,
  key: string
): string => {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value || "";
};

// 模拟课程数据
const mockCourseList = [
  {
    courseId: 1,
    title: "Python 基础入门",
    thumbUrl: "https://pure-admin.github.io/pure-admin-utils/logo.png",
    shortDesc: "Python 编程语言基础课程，涵盖变量、数据类型、控制流等内容。",
    categoryDesc: "编程语言",
    isRequired: 1,
    userName: "张老师",
    startTime: "2023-09-01 00:00:00",
    endTime: "2023-12-31 23:59:59",
    categoryList: [{ categoryId: 1, name: "编程语言" }]
  },
  {
    courseId: 2,
    title: "Web 前端开发实战",
    thumbUrl: "https://pure-admin.github.io/pure-admin-utils/logo.png",
    shortDesc: "从零开始学习 HTML, CSS 和 JavaScript。",
    categoryDesc: "前端开发",
    isRequired: 1,
    userName: "李老师",
    startTime: "2023-10-01 00:00:00",
    endTime: "2024-01-31 23:59:59",
    categoryList: [{ categoryId: 2, name: "前端开发" }]
  },
  {
    courseId: 3,
    title: "Java 高级进阶",
    thumbUrl: "https://pure-admin.github.io/pure-admin-utils/logo.png",
    shortDesc: "深入浅出 Java 虚拟机、并发编程与设计模式。",
    categoryDesc: "后端开发",
    isRequired: 1,
    userName: "张老师",
    startTime: "2023-11-01 00:00:00",
    endTime: "2024-03-31 23:59:59",
    categoryList: [{ categoryId: 3, name: "后端开发" }]
  },
  {
    courseId: 4,
    title: "数据结构与算法",
    thumbUrl: "https://pure-admin.github.io/pure-admin-utils/logo.png",
    shortDesc: "大厂面试必备，系统学习常用数据结构与经典算法。",
    categoryDesc: "计算机基础",
    isRequired: 1,
    userName: "王老师",
    startTime: "2023-08-01 00:00:00",
    endTime: "2023-12-31 23:59:59",
    categoryList: [{ categoryId: 5, name: "计算机基础" }]
  }
];

// 模拟分类数据
const mockCategoryList = [
  { categoryId: 1, name: "编程语言" },
  { categoryId: 2, name: "前端开发" },
  { categoryId: 3, name: "后端开发" },
  { categoryId: 4, name: "人工智能" }
];

// 模拟虚拟实验室数据
const mockLabList = [
  {
    labId: 1,
    title: "CSS 粒子动画",
    icon: "✨",
    description: "学习使用纯 CSS 创建炫酷的粒子效果动画",
    category: "animation",
    difficulty: "medium",
    duration: "15分钟",
    url: "/demos/particle-animation.html",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    featured: true,
    status: 1,
    viewCount: 1256,
    createTime: "2024-12-01 10:00:00"
  },
  {
    labId: 2,
    title: "贪吃蛇大作战",
    icon: "🐍",
    description: "AI 生成的经典贪吃蛇游戏，支持多种难度模式",
    category: "game",
    difficulty: "easy",
    duration: "不限",
    url: "/demos/snake-game.html",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    featured: true,
    status: 1,
    viewCount: 2340,
    createTime: "2024-12-05 14:30:00"
  },
  {
    labId: 3,
    title: "3D 旋转立方体",
    icon: "🎲",
    description: "CSS 3D 变换实现的旋转立方体效果",
    category: "animation",
    difficulty: "hard",
    duration: "20分钟",
    url: "/demos/3d-cube.html",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    featured: false,
    status: 1,
    viewCount: 890,
    createTime: "2024-12-10 09:15:00"
  },
  {
    labId: 4,
    title: "物理弹球模拟",
    icon: "⚽",
    description: "模拟真实物理效果的弹球运动实验",
    category: "simulation",
    difficulty: "medium",
    duration: "10分钟",
    url: "/demos/physics-ball.html",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    featured: false,
    status: 1,
    viewCount: 567,
    createTime: "2024-12-15 11:20:00"
  },
  {
    labId: 5,
    title: "记忆翻牌游戏",
    icon: "🃏",
    description: "AI 生成的记忆力训练小游戏",
    category: "game",
    difficulty: "easy",
    duration: "5分钟",
    url: "/demos/memory-game.html",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    featured: false,
    status: 1,
    viewCount: 1456,
    createTime: "2024-12-20 16:45:00"
  },
  {
    labId: 6,
    title: "化学分子结构",
    icon: "⚗️",
    description: "3D 可视化展示常见化学分子结构",
    category: "simulation",
    difficulty: "hard",
    duration: "25分钟",
    url: "/demos/molecule-3d.html",
    gradient: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)",
    featured: true,
    status: 1,
    viewCount: 723,
    createTime: "2024-12-25 08:30:00"
  },
  {
    labId: 7,
    title: "波浪动画效果",
    icon: "🌊",
    description: "使用 SVG 和 CSS 创建流动的波浪效果",
    category: "animation",
    difficulty: "easy",
    duration: "10分钟",
    url: "/demos/wave-animation.html",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    featured: false,
    status: 0,
    viewCount: 345,
    createTime: "2025-01-02 13:00:00"
  }
];

// 模拟赛事数据
const mockEventList = [
  {
    eventId: 1,
    title: "2025 春季算法挑战赛",
    description: "参与编程挑战，赢取丰厚奖品，提升算法能力",
    type: "coding",
    startTime: "2025-03-15 14:00:00",
    endTime: "2025-03-15 17:00:00",
    questionCount: 5,
    timeLimit: 180,
    totalScore: 500,
    participants: 256,
    status: "upcoming"
  },
  {
    eventId: 2,
    title: "国家安全知识网络竞赛",
    description: "全民国家安全教育日专题活动，学习国家安全知识",
    type: "quiz",
    startTime: "2025-01-01 00:00:00",
    endTime: "2025-01-31 23:59:59",
    questionCount: 10,
    timeLimit: 10,
    totalScore: 100,
    participants: 1024,
    status: "ongoing"
  },
  {
    eventId: 3,
    title: "英语写作大赛",
    description: "展示你的英语写作能力，AI智能批改评分",
    type: "essay",
    startTime: "2025-02-01 09:00:00",
    endTime: "2025-02-28 18:00:00",
    questionCount: 1,
    timeLimit: 90,
    totalScore: 100,
    participants: 512,
    status: "upcoming"
  },
  {
    eventId: 4,
    title: "数据结构期末考核",
    description: "检验本学期数据结构学习成果的综合测评",
    type: "comprehensive",
    startTime: "2024-12-20 14:00:00",
    endTime: "2024-12-20 16:00:00",
    questionCount: 30,
    timeLimit: 120,
    totalScore: 100,
    participants: 189,
    status: "ended"
  },
  {
    eventId: 5,
    title: "Python 编程入门挑战",
    description: "面向初学者的 Python 基础编程竞赛",
    type: "coding",
    startTime: "2025-02-10 10:00:00",
    endTime: "2025-02-10 12:00:00",
    questionCount: 10,
    timeLimit: 120,
    totalScore: 200,
    participants: 378,
    status: "upcoming"
  }
];

// 模拟考试数据
const mockExamList = [
  {
    examId: 101,
    courseId: 1,
    courseName: "Python 基础入门",
    title: "Python 期中考试",
    description: "这是 Python 基础入门课程的期中联考",
    questionNum: 20,
    totalPoints: 100,
    timeLimit: 60,
    availableFrom: "2023-11-01 09:00:00",
    availableTo: "2023-11-01 11:00:00"
  }
];

// 模拟作业数据
const mockHomeworkList = [
  {
    homeworkId: 201,
    courseId: 1,
    courseName: "Python 基础入门",
    chapterId: 1,
    chapterName: "第一章：变量",
    hourId: 1,
    hourName: "1.1 变量定义",
    title: "变量练习题",
    description: "请完成课后练习题并提交",
    questionNum: 10,
    totalPoints: 50,
    dueDate: "2023-09-15 23:59:59"
  }
];

// 模拟统计数据
const mockTeacherUsage = [
  { date: "2023-12-01", usageNum: 12 },
  { date: "2023-12-02", usageNum: 15 },
  { date: "2023-12-03", usageNum: 8 },
  { date: "2023-12-04", usageNum: 20 },
  { date: "2023-12-05", usageNum: 18 },
  { date: "2023-12-06", usageNum: 25 },
  { date: "2023-12-07", usageNum: 22 },
  { date: "2023-12-08", usageNum: 30 },
  { date: "2023-12-09", usageNum: 28 },
  { date: "2023-12-10", usageNum: 15 },
  { date: "2023-12-11", usageNum: 35 },
  { date: "2023-12-12", usageNum: 40 },
  { date: "2023-12-13", usageNum: 38 },
  { date: "2023-12-14", usageNum: 45 }
];

export default defineFakeRoute([
  // 6. 后端课程管理模块
  {
    url: "/edu/backend/v1/course/list",
    method: "get",
    response: ({ query }) => {
      const courseName = getQueryParam(query, "courseName");
      let filtered = mockCourseList;
      if (courseName) {
        filtered = mockCourseList.filter(c => c.title.includes(courseName));
      }
      return {
        code: 200,
        msg: "success",
        data: {
          total: filtered.length,
          courseList: filtered
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/detail",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      const course = mockCourseList.find(c => c.courseId === courseId) || mockCourseList[0];
      return {
        code: 200,
        msg: "success",
        data: course
      };
    }
  },
  {
    url: "/edu/backend/v1/course/create",
    method: "post",
    response: () => {
      return {
        code: 200,
        msg: "创建成功",
        data: { courseId: mockCourseList.length + 1 }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/update",
    method: "post",
    response: () => {
      return { code: 200, msg: "更新成功", data: null };
    }
  },
  {
    url: "/edu/backend/v1/course/delete",
    method: "post",
    response: () => {
      return { code: 200, msg: "删除成功", data: null };
    }
  },
  // 课程分配学员列表
  {
    url: "/edu/backend/v1/course/allocation/user/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 20;
      const userName = getQueryParam(query, "userName");

      // 模拟学员数据
      const mockStudents = [
        { userId: 1, userName: "张三", avatar: "", mobile: "13800138001" },
        { userId: 2, userName: "李四", avatar: "", mobile: "13800138002" },
        { userId: 3, userName: "王五", avatar: "", mobile: "13800138003" },
        { userId: 4, userName: "赵六", avatar: "", mobile: "13800138004" },
        { userId: 5, userName: "钱七", avatar: "", mobile: "13800138005" },
        { userId: 6, userName: "孙八", avatar: "", mobile: "13800138006" },
        { userId: 7, userName: "周九", avatar: "", mobile: "13800138007" },
        { userId: 8, userName: "吴十", avatar: "", mobile: "13800138008" }
      ];

      let filtered = mockStudents;
      if (userName) {
        filtered = mockStudents.filter(s => s.userName.includes(userName));
      }

      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const list = filtered.slice(start, end);

      return {
        code: 200,
        msg: "success",
        data: {
          total: filtered.length,
          list: list
        }
      };
    }
  },
  // 课程分配提交
  {
    url: "/edu/backend/v1/course/allocation",
    method: "post",
    response: () => {
      return { code: 200, msg: "分配成功", data: null };
    }
  },
  {
    url: "/edu/backend/v1/course/hours/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          courseChapters: [
            {
              chapterId: 1,
              name: "第一章：Python 环境搭建",
              hourList: [
                { resourceId: 1, duration: 600, title: "1.1 安装 Python", rType: "video", hourId: 1, fileUrl: "http://example.com/v1.mp4" },
                { resourceId: 2, duration: 800, title: "1.2 第一个程序", rType: "video", hourId: 2, fileUrl: "http://example.com/v2.mp4" }
              ]
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/attr/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          courseWares: [
            { resourceId: 101, title: "Python入门课件.pdf", rType: "pdf", attrId: 1, fileUrl: "http://example.com/doc1.pdf" }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/teacher/plan/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: 1,
          teacherPlanList: [
            { teacherPlanId: 1, courseId: 1, chapterId: 1, courseName: "Python 基础入门", chapterName: "第一章：Python 环境搭建" }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/teacher/plan/progress",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          progress: 100,
          downloadUrl: "http://example.com/plan.docx"
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/generate/teacher/plan",
    method: "post",
    response: () => {
      return {
        code: 200,
        msg: "生成中",
        data: { teacherPlanId: Date.now() }
      };
    }
  },

  // 7. 后端考试管理模块
  {
    url: "/edu/backend/v1/course/exam/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockExamList.length,
          examList: mockExamList
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/exam/question/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: 2,
          questionList: [
            {
              questionType: 1,
              title: "Python语法",
              stem: "以下哪个不是Python关键字？",
              options: JSON.stringify([{ id: "A", content: "def" }, { id: "B", content: "class" }, { id: "C", content: "function" }, { id: "D", content: "if" }]),
              correctAnswer: "C",
              analysis: "Python中使用def定义函数，function不是关键字。",
              points: 5,
              difficulty: 1,
              sortOrder: 1
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/exam/create",
    method: "post",
    response: () => {
      return { code: 200, msg: "创建成功", data: { examId: Date.now() } };
    }
  },
  {
    url: "/edu/backend/v1/course/exam/update",
    method: "post",
    response: () => {
      return { code: 200, msg: "更新成功", data: null };
    }
  },
  {
    url: "/edu/backend/v1/course/exam/delete",
    method: "post",
    response: () => {
      return { code: 200, msg: "删除成功", data: null };
    }
  },

  // 8. 后端作业管理模块
  {
    url: "/edu/backend/v1/course/homework/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockHomeworkList.length,
          homeworkList: mockHomeworkList
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/homework/question/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: 1,
          questionList: [
            {
              questionType: 4,
              title: "基础填空",
              stem: "Python中输出内容的函数是___。",
              options: "",
              correctAnswer: "print",
              analysis: "print() 是内置输出函数。",
              points: 5,
              difficulty: 1,
              sortOrder: 1
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/homework/create",
    method: "post",
    response: () => {
      return { code: 200, msg: "创建成功", data: { homeworkId: Date.now() } };
    }
  },
  {
    url: "/edu/backend/v1/course/homework/update",
    method: "post",
    response: () => {
      return { code: 200, msg: "更新成功", data: null };
    }
  },
  {
    url: "/edu/backend/v1/course/homework/delete",
    method: "post",
    response: () => {
      return { code: 200, msg: "删除成功", data: null };
    }
  },

  // 9. 后端分类管理模块
  {
    url: "/edu/backend/v1/course/category/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockCategoryList.length,
          categoryList: mockCategoryList
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/course/category/upsert",
    method: "post",
    response: () => {
      return { code: 200, msg: "操作成功", data: null };
    }
  },
  {
    url: "/edu/backend/v1/course/category/delete",
    method: "post",
    response: () => {
      return { code: 200, msg: "删除成功", data: null };
    }
  },

  // 10. 后端统计模块
  {
    url: "/edu/backend/v1/statistics/teacher/usage",
    method: "get",
    response: () => {
      return { code: 200, msg: "success", data: { usageInfoList: mockTeacherUsage } };
    }
  },
  {
    url: "/edu/backend/v1/statistics/student/usage",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          usageInfoList: mockTeacherUsage.map(i => ({ ...i, usageNum: i.usageNum * 5 }))
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/statistics/week/usage",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: { studentTotalNum: 500, teacherTotalNum: 100 }
      };
    }
  },
  {
    url: "/edu/backend/v1/statistics/course/users/progress",
    method: "get",
    response: () => {
      // 生成学生名单
      const generateStudents = (count: number) => {
        const firstNames = ["张", "李", "王", "赵", "钱", "孙", "周", "吴", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许"];
        const lastNames = ["三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十"];

        const students = [];
        for (let i = 1; i <= count; i++) {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[i % lastNames.length];
          students.push({
            userId: i,
            userName: firstName + lastName + "_" + i,
            progress: Math.floor(Math.random() * 100)
          });
        }
        return students;
      };

      return {
        code: 200,
        msg: "success",
        data: {
          courseUsersProgress: [
            {
              courseId: 1,
              courseName: "Python 基础入门",
              usersProgress: generateStudents(28)
            },
            {
              courseId: 2,
              courseName: "Web 前端开发实战",
              usersProgress: generateStudents(25)
            },
            {
              courseId: 3,
              courseName: "Java 高级进阶",
              usersProgress: generateStudents(22)
            },
            {
              courseId: 4,
              courseName: "数据结构与算法",
              usersProgress: generateStudents(30)
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/statistics/course/users/exam/info",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          courseUsersExamInfoList: [
            {
              courseId: 1,
              courseName: "Python 基础入门",
              examId: 101,
              examName: "Python 期中考试",
              examInfo: [
                { level: 4, levelNum: 8, levelUserList: [{ userId: 3, userName: "王五" }, { userId: 6, userName: "孙八" }] },
                { level: 3, levelNum: 12, levelUserList: [] },
                { level: 2, levelNum: 5, levelUserList: [] },
                { level: 1, levelNum: 3, levelUserList: [] }
              ]
            },
            {
              courseId: 1,
              courseName: "Python 基础入门",
              examId: 102,
              examName: "Python 期末考试",
              examInfo: [
                { level: 4, levelNum: 10, levelUserList: [] },
                { level: 3, levelNum: 11, levelUserList: [] },
                { level: 2, levelNum: 5, levelUserList: [] },
                { level: 1, levelNum: 2, levelUserList: [] }
              ]
            },
            {
              courseId: 2,
              courseName: "Web 前端开发实战",
              examId: 201,
              examName: "前端基础能力测试",
              examInfo: [
                { level: 4, levelNum: 6, levelUserList: [] },
                { level: 3, levelNum: 9, levelUserList: [] },
                { level: 2, levelNum: 7, levelUserList: [] },
                { level: 1, levelNum: 3, levelUserList: [] }
              ]
            },
            {
              courseId: 2,
              courseName: "Web 前端开发实战",
              examId: 202,
              examName: "前端综合项目考核",
              examInfo: [
                { level: 4, levelNum: 8, levelUserList: [] },
                { level: 3, levelNum: 10, levelUserList: [] },
                { level: 2, levelNum: 5, levelUserList: [] },
                { level: 1, levelNum: 2, levelUserList: [] }
              ]
            },
            {
              courseId: 3,
              courseName: "Java 高级进阶",
              examId: 301,
              examName: "JVM 原理深度考核",
              examInfo: [
                { level: 4, levelNum: 5, levelUserList: [] },
                { level: 3, levelNum: 8, levelUserList: [] },
                { level: 2, levelNum: 6, levelUserList: [] },
                { level: 1, levelNum: 3, levelUserList: [] }
              ]
            },
            {
              courseId: 3,
              courseName: "Java 高级进阶",
              examId: 302,
              examName: "并发编程综合实战",
              examInfo: [
                { level: 4, levelNum: 4, levelUserList: [] },
                { level: 3, levelNum: 7, levelUserList: [] },
                { level: 2, levelNum: 7, levelUserList: [] },
                { level: 1, levelNum: 4, levelUserList: [] }
              ]
            },
            {
              courseId: 4,
              courseName: "数据结构与算法",
              examId: 401,
              examName: "算法基础测试",
              examInfo: [
                { level: 4, levelNum: 9, levelUserList: [] },
                { level: 3, levelNum: 12, levelUserList: [] },
                { level: 2, levelNum: 6, levelUserList: [] },
                { level: 1, levelNum: 3, levelUserList: [] }
              ]
            },
            {
              courseId: 4,
              courseName: "数据结构与算法",
              examId: 402,
              examName: "数据结构深度考核",
              examInfo: [
                { level: 4, levelNum: 7, levelUserList: [] },
                { level: 3, levelNum: 13, levelUserList: [] },
                { level: 2, levelNum: 7, levelUserList: [] },
                { level: 1, levelNum: 3, levelUserList: [] }
              ]
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/statistics/efficient/index",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          efficientIndexList: [
            {
              courseName: "Python 基础入门",
              planTime: 120,
              correctPlanTime: 10,
              planWorkTime: 45,
              correctPlanWorkTime: 5,
              optimizeDirection: "加强循环与函数章节的练习，学生在复杂控制流上耗时较多。",
              expectedEffect: "预计备课修正耗时减少 15%",
              difficulty: "低"
            },
            {
              courseName: "Web 前端开发实战",
              planTime: 200,
              correctPlanTime: 25,
              planWorkTime: 90,
              correctPlanWorkTime: 15,
              optimizeDirection: "CSS 布局部分建议增加更多实战案例，减少理论讲解。",
              expectedEffect: "预计作业设计修正耗时减少 20%",
              difficulty: "中"
            },
            {
              courseName: "Java 高级进阶",
              planTime: 350,
              correctPlanTime: 80,
              planWorkTime: 120,
              correctPlanWorkTime: 30,
              optimizeDirection: "JVM 内存模型部分难度较大，建议拆分为两个课时进行讲解。",
              expectedEffect: "预计备课时间减少 10%",
              difficulty: "高"
            },
            {
              courseName: "数据结构与算法",
              planTime: 180,
              correctPlanTime: 15,
              planWorkTime: 60,
              correctPlanWorkTime: 10,
              optimizeDirection: "动态规划算法是多数学生的薄弱点，可以增加 AI 生成的针对性题库。",
              expectedEffect: "预计作业评改效率提高 25%",
              difficulty: "中"
            },
            {
              courseName: "机器学习基础",
              planTime: 240,
              correctPlanTime: 35,
              planWorkTime: 110,
              correctPlanWorkTime: 20,
              optimizeDirection: "线性回归与逻辑回归的数学基础需要强化，建议补充线性代数内容。",
              expectedEffect: "预计备课时间减少 5%，学生掌握度提高 10%",
              difficulty: "由于涉及多门学科，难度较高"
            },
            {
              courseName: "云计算与容器技术",
              planTime: 210,
              correctPlanTime: 30,
              planWorkTime: 95,
              correctPlanWorkTime: 18,
              optimizeDirection: "Docker 与 Kubernetes 的实操练习需要增加，提高学生的动手能力。",
              expectedEffect: "预计实操课时占比增加 20%",
              difficulty: "中"
            }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/statistics/platform/overview",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "成功",
        data: {
          stats: [
            {
              title: "授课时长",
              value: 1280,
              unit: "min",
              trend: 12,
              icon: "ep:timer"
            },
            {
              title: "活跃学生",
              value: 156,
              unit: "位",
              trend: -5,
              icon: "ep:user"
            },
            {
              title: "完成进度",
              value: 85,
              unit: "%",
              trend: 8,
              icon: "ep:finished"
            },
            {
              title: "AI 生成方案",
              value: 42,
              unit: "个",
              trend: 25,
              icon: "ep:magic-stick"
            }
          ]
        }
      };
    }
  },

  // 11. 后端HTML动画模块
  {
    url: "/edu/backend/v1/html-animation/generate",
    method: "post",
    response: () => {
      return {
        code: 200,
        msg: "已提交生成任务",
        data: { taskId: "task-" + Date.now(), status: "pending", message: "任务已进入队列" }
      };
    }
  },
  {
    url: "/edu/backend/v1/html-animation/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          tasks: [
            {
              taskId: "task-1",
              status: "completed",
              version: 1,
              fileName: "animation_v1.html",
              fileUrl: "http://example.com/animation_v1.html",
              createdAt: "2023-12-01 10:00:00"
            }
          ],
          displayVersionRaw: "1",
          displayVersionResolved: "1"
        }
      };
    }
  },

  // 13. 用户管理
  {
    url: "/edu/backend/v1/user/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: 2,
          userList: [
            { id: 1, mobile: "13800138000", nickname: "张三", sex: 1, avatar: "", roleType: 1 },
            { id: 2, mobile: "13900139000", nickname: "李老师", sex: 2, avatar: "", roleType: 2 }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/user/file/list",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          total: 1,
          fileList: [{ fileId: 1, fileUrl: "http://example.com/a.png", fileName: "a.png", extension: "png", size: 1024 }]
        }
      };
    }
  },

  // =============== 虚拟实验室管理 ===============
  {
    url: "/edu/backend/v1/virtual-lab/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 20;
      const title = getQueryParam(query, "title");
      const category = getQueryParam(query, "category");
      const status = getQueryParam(query, "status");

      let filteredList = [...mockLabList];

      if (title) {
        filteredList = filteredList.filter(item =>
          item.title.toLowerCase().includes(title.toLowerCase())
        );
      }
      if (category) {
        filteredList = filteredList.filter(item => item.category === category);
      }
      if (status !== "") {
        filteredList = filteredList.filter(item => item.status === parseInt(status));
      }

      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const paginatedList = filteredList.slice(start, end);

      return {
        code: 200,
        msg: "success",
        data: {
          total: filteredList.length,
          labList: paginatedList
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/virtual-lab/stats",
    method: "get",
    response: () => {
      const activeLabs = mockLabList.filter(item => item.status === 1).length;
      const totalViews = mockLabList.reduce((sum, item) => sum + item.viewCount, 0);
      return {
        code: 200,
        msg: "success",
        data: {
          totalLabs: mockLabList.length,
          activeLabs,
          totalViews
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/virtual-lab/upsert",
    method: "post",
    response: ({ body }) => {
      if (body.labId) {
        const index = mockLabList.findIndex(item => item.labId === body.labId);
        if (index !== -1) {
          mockLabList[index] = { ...mockLabList[index], ...body };
        }
      } else {
        const newId = Math.max(...mockLabList.map(item => item.labId)) + 1;
        mockLabList.push({
          labId: newId,
          ...body,
          viewCount: 0,
          createTime: new Date().toISOString().slice(0, 19).replace("T", " ")
        });
      }
      return { code: 200, msg: "success", data: null };
    }
  },
  {
    url: "/edu/backend/v1/virtual-lab/delete",
    method: "post",
    response: ({ body }) => {
      const index = mockLabList.findIndex(item => item.labId === body.labId);
      if (index !== -1) {
        mockLabList.splice(index, 1);
      }
      return { code: 200, msg: "success", data: null };
    }
  },

  // =============== 赛事管理 ===============
  {
    url: "/edu/backend/v1/competition/event/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 20;
      const title = getQueryParam(query, "title");
      const type = getQueryParam(query, "type");
      const status = getQueryParam(query, "status");

      let filteredList = [...mockEventList];

      if (title) {
        filteredList = filteredList.filter(item =>
          item.title.toLowerCase().includes(title.toLowerCase())
        );
      }
      if (type) {
        filteredList = filteredList.filter(item => item.type === type);
      }
      if (status) {
        filteredList = filteredList.filter(item => item.status === status);
      }

      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const paginatedList = filteredList.slice(start, end);

      return {
        code: 200,
        msg: "success",
        data: {
          total: filteredList.length,
          eventList: paginatedList
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/competition/event/stats",
    method: "get",
    response: () => {
      const ongoingEvents = mockEventList.filter(item => item.status === "ongoing").length;
      const totalParticipants = mockEventList.reduce((sum, item) => sum + item.participants, 0);
      return {
        code: 200,
        msg: "success",
        data: {
          totalEvents: mockEventList.length,
          ongoingEvents,
          totalParticipants
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/competition/event/upsert",
    method: "post",
    response: ({ body }) => {
      if (body.eventId) {
        const index = mockEventList.findIndex(item => item.eventId === body.eventId);
        if (index !== -1) {
          mockEventList[index] = { ...mockEventList[index], ...body };
        }
      } else {
        const newId = Math.max(...mockEventList.map(item => item.eventId)) + 1;
        mockEventList.push({
          eventId: newId,
          ...body,
          participants: 0
        });
      }
      return { code: 200, msg: "success", data: null };
    }
  },
  {
    url: "/edu/backend/v1/competition/event/delete",
    method: "post",
    response: ({ body }) => {
      const index = mockEventList.findIndex(item => item.eventId === body.eventId);
      if (index !== -1) {
        mockEventList.splice(index, 1);
      }
      return { code: 200, msg: "success", data: null };
    }
  },
  {
    url: "/edu/backend/v1/competition/event/participants",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          list: [
            { userId: 1, username: "student001", realName: "张小明", className: "高一(1)班", registerTime: "2025-01-05 10:30:00", status: "completed" },
            { userId: 2, username: "student002", realName: "李小红", className: "高一(1)班", registerTime: "2025-01-05 11:20:00", status: "completed" },
            { userId: 3, username: "student003", realName: "王小刚", className: "高一(2)班", registerTime: "2025-01-05 14:15:00", status: "pending" },
            { userId: 4, username: "student004", realName: "赵小美", className: "高一(2)班", registerTime: "2025-01-06 09:00:00", status: "pending" },
            { userId: 5, username: "student005", realName: "刘小强", className: "高一(3)班", registerTime: "2025-01-06 10:30:00", status: "completed" }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/competition/event/rankings",
    method: "get",
    response: () => {
      return {
        code: 200,
        msg: "success",
        data: {
          list: [
            { userId: 1, username: "算法大神", avatar: "", className: "高一(1)班", score: 98, duration: "45分32秒" },
            { userId: 2, username: "代码狂人", avatar: "", className: "高一(2)班", score: 95, duration: "48分15秒" },
            { userId: 3, username: "编程小王子", avatar: "", className: "高一(1)班", score: 92, duration: "52分08秒" },
            { userId: 4, username: "刷题达人", avatar: "", className: "高一(3)班", score: 88, duration: "55分40秒" },
            { userId: 5, username: "技术新星", avatar: "", className: "高一(2)班", score: 85, duration: "58分22秒" }
          ]
        }
      };
    }
  },

  // ==================== OJ 题目管理 Mock ====================
  {
    url: "/edu/backend/v1/oj/stats",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        totalProblems: 156,
        totalSubmissions: 4328,
        acceptRate: 68.5,
        activeUsers: 234
      }
    })
  },
  {
    url: "/edu/backend/v1/oj/problem/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockProblems = [
        { problemId: 1, title: "两数之和", difficulty: "easy", tags: ["数组", "哈希表"], acceptCount: 1234, submitCount: 1856, acceptRate: 66.5, timeLimit: 1000, memoryLimit: 256, status: "published", createTime: "2024-01-15 10:00:00" },
        { problemId: 2, title: "最长回文子串", difficulty: "medium", tags: ["字符串", "动态规划"], acceptCount: 856, submitCount: 1523, acceptRate: 56.2, timeLimit: 2000, memoryLimit: 256, status: "published", createTime: "2024-01-16 14:30:00" },
        { problemId: 3, title: "合并K个升序链表", difficulty: "hard", tags: ["链表", "分治", "堆"], acceptCount: 423, submitCount: 1102, acceptRate: 38.4, timeLimit: 1000, memoryLimit: 512, status: "published", createTime: "2024-01-17 09:15:00" },
        { problemId: 4, title: "有效的括号", difficulty: "easy", tags: ["栈", "字符串"], acceptCount: 2156, submitCount: 2789, acceptRate: 77.3, timeLimit: 1000, memoryLimit: 256, status: "published", createTime: "2024-01-18 11:00:00" },
        { problemId: 5, title: "最大子数组和", difficulty: "medium", tags: ["数组", "动态规划"], acceptCount: 1567, submitCount: 2345, acceptRate: 66.8, timeLimit: 1000, memoryLimit: 256, status: "published", createTime: "2024-01-19 16:20:00" },
        { problemId: 6, title: "接雨水", difficulty: "hard", tags: ["数组", "双指针", "动态规划"], acceptCount: 678, submitCount: 1890, acceptRate: 35.9, timeLimit: 1000, memoryLimit: 256, status: "published", createTime: "2024-01-20 08:45:00" },
        { problemId: 7, title: "二分查找", difficulty: "easy", tags: ["数组", "二分查找"], acceptCount: 1890, submitCount: 2234, acceptRate: 84.6, timeLimit: 1000, memoryLimit: 256, status: "draft", createTime: "2024-01-21 10:30:00" }
      ];
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockProblems.length,
          list: mockProblems.slice((pageNum - 1) * pageSize, pageNum * pageSize)
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/oj/problem/detail",
    method: "get",
    response: ({ query }) => {
      const problemId = parseInt(getQueryParam(query, "problemId"));
      return {
        code: 200,
        msg: "success",
        data: {
          problemId,
          title: "两数之和",
          difficulty: "easy",
          tags: ["数组", "哈希表"],
          content: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n你可以假设每种输入只会对应一个答案，且同样的元素不能被重复利用。",
          inputFormat: "第一行包含两个整数 n 和 target，表示数组长度和目标值。\n第二行包含 n 个整数，表示数组元素。",
          outputFormat: "输出两个整数，表示两个数的下标（从0开始）。",
          examples: [
            { input: "4 9\n2 7 11 15", output: "0 1", explanation: "因为 nums[0] + nums[1] == 9，返回 [0, 1]" },
            { input: "3 6\n3 2 4", output: "1 2" }
          ],
          timeLimit: 1000,
          memoryLimit: 256,
          hint: "尝试使用哈希表来优化时间复杂度",
          testCases: [
            { input: "4 9\n2 7 11 15", output: "0 1" },
            { input: "3 6\n3 2 4", output: "1 2" },
            { input: "2 6\n3 3", output: "0 1" }
          ]
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/oj/problem/upsert",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/oj/problem/delete",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/oj/submission/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockSubmissions = [
        { submissionId: 1001, problemId: 1, problemTitle: "两数之和", userId: 1, username: "张小明", language: "cpp", status: "accepted", runTime: 4, memory: 8.2, submitTime: "2025-01-15 14:32:15" },
        { submissionId: 1002, problemId: 2, problemTitle: "最长回文子串", userId: 2, username: "李小红", language: "python", status: "wrong_answer", runTime: 120, memory: 15.6, submitTime: "2025-01-15 14:35:22" },
        { submissionId: 1003, problemId: 3, problemTitle: "合并K个升序链表", userId: 3, username: "王小刚", language: "java", status: "time_limit", runTime: 2000, memory: 32.4, submitTime: "2025-01-15 14:40:08" },
        { submissionId: 1004, problemId: 1, problemTitle: "两数之和", userId: 4, username: "赵小美", language: "cpp", status: "accepted", runTime: 2, memory: 7.8, submitTime: "2025-01-15 14:45:33" },
        { submissionId: 1005, problemId: 4, problemTitle: "有效的括号", userId: 1, username: "张小明", language: "python", status: "runtime_error", runTime: 0, memory: 0, submitTime: "2025-01-15 14:50:17" },
        { submissionId: 1006, problemId: 5, problemTitle: "最大子数组和", userId: 5, username: "刘小强", language: "cpp", status: "accepted", runTime: 8, memory: 9.1, submitTime: "2025-01-15 15:02:45" },
        { submissionId: 1007, problemId: 6, problemTitle: "接雨水", userId: 2, username: "李小红", language: "java", status: "memory_limit", runTime: 156, memory: 512, submitTime: "2025-01-15 15:10:28" },
        { submissionId: 1008, problemId: 2, problemTitle: "最长回文子串", userId: 3, username: "王小刚", language: "cpp", status: "compile_error", runTime: 0, memory: 0, submitTime: "2025-01-15 15:15:33" }
      ];
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockSubmissions.length,
          list: mockSubmissions.slice((pageNum - 1) * pageSize, pageNum * pageSize)
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/oj/submission/detail",
    method: "get",
    response: ({ query }) => {
      const submissionId = parseInt(getQueryParam(query, "submissionId"));
      return {
        code: 200,
        msg: "success",
        data: {
          submissionId,
          problemId: 1,
          problemTitle: "两数之和",
          userId: 1,
          username: "张小明",
          language: "cpp",
          code: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    Solution sol;
    auto result = sol.twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}`,
          status: "accepted",
          runTime: 4,
          memory: 8.2,
          submitTime: "2025-01-15 14:32:15",
          testResults: [
            { caseId: 1, status: "accepted", runTime: 2, memory: 8.1 },
            { caseId: 2, status: "accepted", runTime: 1, memory: 8.2 },
            { caseId: 3, status: "accepted", runTime: 1, memory: 8.0 }
          ]
        }
      };
    }
  },

  // ==================== 作文批改管理 Mock ====================
  {
    url: "/edu/backend/v1/essay/stats",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        totalEssays: 328,
        pendingReview: 45,
        avgScore: 78.5,
        todaySubmissions: 23
      }
    })
  },
  {
    url: "/edu/backend/v1/essay/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockEssays = [
        { essayId: 1, topicId: 1, topicTitle: "我的梦想", studentId: 1, studentName: "张小明", className: "高一(1)班", wordCount: 856, submitTime: "2025-01-15 09:30:00", aiScore: 85, teacherScore: 88, status: "teacher_reviewed" },
        { essayId: 2, topicId: 1, topicTitle: "我的梦想", studentId: 2, studentName: "李小红", className: "高一(1)班", wordCount: 923, submitTime: "2025-01-15 10:15:00", aiScore: 78, teacherScore: null, status: "ai_reviewed" },
        { essayId: 3, topicId: 1, topicTitle: "我的梦想", studentId: 3, studentName: "王小刚", className: "高一(2)班", wordCount: 756, submitTime: "2025-01-15 11:00:00", aiScore: null, teacherScore: null, status: "pending" },
        { essayId: 4, topicId: 2, topicTitle: "春天的故事", studentId: 4, studentName: "赵小美", className: "高一(2)班", wordCount: 1024, submitTime: "2025-01-14 14:20:00", aiScore: 92, teacherScore: 90, status: "teacher_reviewed" },
        { essayId: 5, topicId: 2, topicTitle: "春天的故事", studentId: 5, studentName: "刘小强", className: "高一(3)班", wordCount: 889, submitTime: "2025-01-14 15:45:00", aiScore: 82, teacherScore: null, status: "ai_reviewed" },
        { essayId: 6, topicId: 3, topicTitle: "读书的意义", studentId: 1, studentName: "张小明", className: "高一(1)班", wordCount: 945, submitTime: "2025-01-13 09:00:00", aiScore: 88, teacherScore: 85, status: "teacher_reviewed" }
      ];
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockEssays.length,
          list: mockEssays.slice((pageNum - 1) * pageSize, pageNum * pageSize)
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/essay/detail",
    method: "get",
    response: ({ query }) => {
      const essayId = parseInt(getQueryParam(query, "essayId"));
      return {
        code: 200,
        msg: "success",
        data: {
          essayId,
          topicId: 1,
          topicTitle: "我的梦想",
          topicRequirement: "请以'我的梦想'为题，写一篇不少于800字的记叙文或议论文，要求内容真实、情感真挚、结构完整。",
          studentId: 1,
          studentName: "张小明",
          className: "高一(1)班",
          content: `每个人都有自己的梦想，梦想是人生道路上的指路明灯，照亮我们前进的方向。我的梦想是成为一名优秀的软件工程师，用代码改变世界。

从小我就对电脑充满好奇，记得第一次接触编程是在初中的信息技术课上。当我成功运行第一个"Hello World"程序时，屏幕上那几个简单的字符仿佛打开了一扇通往新世界的大门。从那时起，我便深深爱上了编程这门技术。

高中后，我开始系统地学习编程知识。我利用课余时间自学Python、JavaScript等编程语言，还参加了学校的编程社团。在社团里，我和志同道合的伙伴们一起研究算法、开发小项目。我们开发的校园二手交易平台获得了学校信息化建设比赛的一等奖，这让我更加坚定了自己的梦想。

当然，追逐梦想的路上并非一帆风顺。有时候，一个看似简单的bug会让我熬夜调试好几个小时；有时候，复杂的算法会让我百思不得其解。但正是这些困难，让我学会了坚持和思考，让我在不断失败中成长。

我相信，只要我不断努力，终有一天我会实现自己的梦想。我会开发出让人们生活更美好的软件，用技术为社会贡献自己的力量。

梦想是远航的帆，我会扬帆起航，驶向那片属于我的星辰大海。`,
          wordCount: 856,
          submitTime: "2025-01-15 09:30:00",
          aiResult: {
            score: 85,
            dimensions: [
              { name: "内容立意", score: 22, maxScore: 25, comment: "主题明确，立意积极向上，但部分论述略显浅显" },
              { name: "结构层次", score: 20, maxScore: 25, comment: "结构完整，层次分明，过渡自然" },
              { name: "语言表达", score: 23, maxScore: 25, comment: "语言流畅，用词准确，有一定的文采" },
              { name: "书写规范", score: 20, maxScore: 25, comment: "标点使用正确，段落划分合理" }
            ],
            strengths: [
              "文章结构完整，开头点题，结尾呼应",
              "语言表达流畅自然，有真情实感",
              "运用了比喻等修辞手法，增强了表现力"
            ],
            weaknesses: [
              "部分段落论述不够深入，可以增加更多细节",
              "结尾略显仓促，可以进一步升华主题"
            ],
            suggestions: [
              "建议在描写初次接触编程的经历时，增加更多心理描写",
              "可以引用一些名人名言来增强文章的说服力",
              "结尾可以联系社会发展，拓宽文章视野"
            ],
            corrections: [
              { original: "仿佛打开了一扇通往新世界的大门", corrected: "仿佛为我打开了一扇通往新世界的大门", type: "语句优化", reason: "增加主语使句子更完整" },
              { original: "我便深深爱上了编程这门技术", corrected: "我便深深爱上了编程这门艺术", type: "用词建议", reason: "\"艺术\"更能体现对编程的热爱和追求" }
            ]
          },
          teacherResult: {
            score: 88,
            comment: "这是一篇优秀的命题作文。小明同学以软件工程师的梦想为主线，通过具体的经历展现了对编程的热爱和追求。文章结构清晰，语言流畅，情感真挚。建议在今后的写作中，可以更加深入地挖掘主题的社会意义，使文章更具深度。继续加油！",
            reviewTime: "2025-01-15 16:30:00"
          }
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/essay/review",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/essay/ai-review",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/essay/topic/publish",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/essay/topic/list",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        list: [
          { topicId: 1, title: "我的梦想", deadline: "2025-01-20 23:59:59", submissions: 45 },
          { topicId: 2, title: "春天的故事", deadline: "2025-01-25 23:59:59", submissions: 32 },
          { topicId: 3, title: "读书的意义", deadline: "2025-01-30 23:59:59", submissions: 28 }
        ]
      }
    })
  },

  // ==================== 题库管理 Mock ====================
  {
    url: "/edu/backend/v1/question-bank/stats",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        totalQuestions: 1256,
        totalCategories: 24,
        usageCount: 8965,
        avgAccuracy: 72.3
      }
    })
  },
  {
    url: "/edu/backend/v1/question-bank/category/tree",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: [
        {
          categoryId: 1,
          name: "计算机基础",
          questionCount: 156,
          children: [
            { categoryId: 11, name: "计算机组成原理", questionCount: 45 },
            { categoryId: 12, name: "操作系统", questionCount: 52 },
            { categoryId: 13, name: "计算机网络", questionCount: 59 }
          ]
        },
        {
          categoryId: 2,
          name: "编程语言",
          questionCount: 234,
          children: [
            { categoryId: 21, name: "Python基础", questionCount: 78 },
            { categoryId: 22, name: "Java基础", questionCount: 89 },
            { categoryId: 23, name: "C++基础", questionCount: 67 }
          ]
        },
        {
          categoryId: 3,
          name: "数据结构与算法",
          questionCount: 189,
          children: [
            { categoryId: 31, name: "基础数据结构", questionCount: 65 },
            { categoryId: 32, name: "排序算法", questionCount: 42 },
            { categoryId: 33, name: "图论算法", questionCount: 82 }
          ]
        },
        {
          categoryId: 4,
          name: "信息安全",
          questionCount: 98,
          children: [
            { categoryId: 41, name: "密码学基础", questionCount: 35 },
            { categoryId: 42, name: "网络安全", questionCount: 63 }
          ]
        }
      ]
    })
  },
  {
    url: "/edu/backend/v1/question-bank/category/upsert",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/question-bank/category/delete",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/question-bank/question/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockQuestions = [
        { questionId: 1, content: "以下哪个不是Python的内置数据类型？", type: "single", difficulty: "easy", categoryId: 21, categoryName: "Python基础", score: 5, usageCount: 156, accuracy: 85.3, createTime: "2024-12-01 10:00:00" },
        { questionId: 2, content: "在Java中，以下哪些关键字用于异常处理？", type: "multiple", difficulty: "medium", categoryId: 22, categoryName: "Java基础", score: 10, usageCount: 123, accuracy: 68.7, createTime: "2024-12-02 14:30:00" },
        { questionId: 3, content: "TCP协议是面向连接的协议", type: "judge", difficulty: "easy", categoryId: 13, categoryName: "计算机网络", score: 5, usageCount: 234, accuracy: 92.1, createTime: "2024-12-03 09:15:00" },
        { questionId: 4, content: "请说明OSI七层模型的各层功能", type: "essay", difficulty: "hard", categoryId: 13, categoryName: "计算机网络", score: 20, usageCount: 89, accuracy: 45.6, createTime: "2024-12-04 11:00:00" },
        { questionId: 5, content: "快速排序的平均时间复杂度是____", type: "fill", difficulty: "medium", categoryId: 32, categoryName: "排序算法", score: 5, usageCount: 178, accuracy: 76.2, createTime: "2024-12-05 16:20:00" },
        { questionId: 6, content: "以下哪种数据结构采用先进先出(FIFO)的原则？", type: "single", difficulty: "easy", categoryId: 31, categoryName: "基础数据结构", score: 5, usageCount: 267, accuracy: 88.9, createTime: "2024-12-06 08:45:00" },
        { questionId: 7, content: "二叉树的遍历方式包括哪些？", type: "multiple", difficulty: "medium", categoryId: 31, categoryName: "基础数据结构", score: 10, usageCount: 198, accuracy: 72.4, createTime: "2024-12-07 10:30:00" },
        { questionId: 8, content: "对称加密算法的密钥分发比非对称加密更安全", type: "judge", difficulty: "medium", categoryId: 41, categoryName: "密码学基础", score: 5, usageCount: 145, accuracy: 61.8, createTime: "2024-12-08 14:00:00" }
      ];
      return {
        code: 200,
        msg: "success",
        data: {
          total: mockQuestions.length,
          list: mockQuestions.slice((pageNum - 1) * pageSize, pageNum * pageSize)
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/question-bank/question/detail",
    method: "get",
    response: ({ query }) => {
      const questionId = parseInt(getQueryParam(query, "questionId"));
      return {
        code: 200,
        msg: "success",
        data: {
          questionId,
          content: "以下哪个不是Python的内置数据类型？",
          type: "single",
          difficulty: "easy",
          categoryId: 21,
          score: 5,
          options: [
            { content: "list", isAnswer: false },
            { content: "tuple", isAnswer: false },
            { content: "array", isAnswer: true },
            { content: "dict", isAnswer: false }
          ],
          answer: 2,
          analysis: "Python的内置数据类型包括：int, float, str, list, tuple, dict, set等。array不是Python的内置类型，需要导入array模块或使用numpy库。"
        }
      };
    }
  },
  {
    url: "/edu/backend/v1/question-bank/question/upsert",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/question-bank/question/delete",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/question-bank/question/batch-delete",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/backend/v1/question-bank/question/import",
    method: "post",
    response: () => ({
      code: 200,
      msg: "success",
      data: { success: 45, failed: 3 }
    })
  }
]);

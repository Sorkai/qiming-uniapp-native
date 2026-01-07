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
              optimizeDirection: "加强循环与函数章节的练习，学生在复杂控制流上耗时较多。"
            },
            {
              courseName: "Web 前端开发实战",
              planTime: 200,
              correctPlanTime: 25,
              planWorkTime: 90,
              correctPlanWorkTime: 15,
              optimizeDirection: "CSS 布局部分建议增加更多实战案例，减少理论讲解。"
            },
            {
              courseName: "Java 高级进阶",
              planTime: 350,
              correctPlanTime: 80,
              planWorkTime: 120,
              correctPlanWorkTime: 30,
              optimizeDirection: "JVM 内存模型部分难度较大，建议拆分为两个课时进行讲解。"
            },
            {
              courseName: "数据结构与算法",
              planTime: 180,
              correctPlanTime: 15,
              planWorkTime: 60,
              correctPlanWorkTime: 10,
              optimizeDirection: "动态规划算法是多数学生的薄弱点，可以增加 AI 生成的针对性题库。"
            },
            {
              courseName: "机器学习基础",
              planTime: 240,
              correctPlanTime: 35,
              planWorkTime: 110,
              correctPlanWorkTime: 20,
              optimizeDirection: "线性回归与逻辑回归的数学基础需要强化，建议补充线性代数内容。"
            },
            {
              courseName: "云计算与容器技术",
              planTime: 210,
              correctPlanTime: 30,
              planWorkTime: 95,
              correctPlanWorkTime: 18,
              optimizeDirection: "Docker 与 Kubernetes 的实操练习需要增加，提高学生的动手能力。"
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
  }
]);

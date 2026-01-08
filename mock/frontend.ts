// 前端课程相关接口 mock 数据
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 辅助函数：安全获取查询参数
const getQueryParam = (
  query: Record<string, string | string[]>,
  key: string
): string => {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value || "";
};

// 模拟课程列表
const mockCourses = [
  {
    courseId: 1,
    courseName: "Python 基础入门",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 24,
    finishedHours: 18,
    courseDesc: "Python 编程语言基础课程，涵盖变量、数据类型、控制流、函数等核心概念"
  },
  {
    courseId: 2,
    courseName: "Web 前端开发",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 36,
    finishedHours: 12,
    courseDesc: "HTML、CSS、JavaScript 前端开发基础与实战"
  },
  {
    courseId: 3,
    courseName: "数据结构与算法",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 48,
    finishedHours: 32,
    courseDesc: "计算机基础数据结构与算法，包括数组、链表、树、图等"
  },
  {
    courseId: 4,
    courseName: "Vue3 实战开发",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 20,
    finishedHours: 5,
    courseDesc: "Vue3 框架实战项目开发，组合式API、响应式原理"
  },
  {
    courseId: 5,
    courseName: "数据库原理",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 32,
    finishedHours: 28,
    courseDesc: "数据库基础原理与SQL，关系型数据库设计"
  },
  {
    courseId: 6,
    courseName: "人工智能导论",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 40,
    finishedHours: 10,
    courseDesc: "AI 人工智能基础知识，机器学习入门"
  },
  {
    courseId: 7,
    courseName: "软件工程",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 28,
    finishedHours: 20,
    courseDesc: "软件开发流程与方法论，敏捷开发实践"
  },
  {
    courseId: 8,
    courseName: "Linux 系统管理",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 24,
    finishedHours: 8,
    courseDesc: "Linux 操作系统基础，命令行与Shell脚本"
  }
];

// 模拟作业列表
const mockHomeworkList = [
  {
    homeworkId: 1,
    title: "Python 基础练习",
    description: "完成 Python 变量和数据类型的练习题",
    questionNum: 10,
    totalPoints: 100,
    dueDate: "2025-12-3023:59:59",
    status: 2, // 进行中
    score: 0
  },
  {
    homeworkId: 2,
    title: "函数与模块作业",
    description: "编写 Python 函数，实现指定功能",
    questionNum: 5,
    totalPoints: 50,
    dueDate: "2025-12-28 23:59:59",
    status: 2,
    score: 0
  },
  {
    homeworkId: 3,
    title: "面向对象编程",
    description: "设计一个简单的类，实现继承和多态",
    questionNum: 3,
    totalPoints: 30,
    dueDate: "2025-12-25 23:59:59",
    status: 3, // 已完成
    score: 28
  }
];

// 模拟考试列表
const mockExamList = [
  {
    examId: 1,
    title: "Python 期中考试",
    description: "Python 基础知识综合测试",
    questionNum: 20,
    totalPoints: 100,
    timeLimit: 90,
    availableFrom: "2025-12-20 09:00:00",
    availableTo: "2025-12-31 23:59:59",
    status: 2, // 进行中
    score: 0
  },
  {
    examId: 2,
    title: "数据结构测验",
    description: "数据结构基础概念测试",
    questionNum: 15,
    totalPoints: 100,
    timeLimit: 60,
    availableFrom: "2025-12-15 09:00:00",
    availableTo: "2025-12-20 23:59:59",
    status: 4, // 已过期
    score: 85
  }
];

// 模拟考试详情
const mockExamDetail = {
  examId: 1,
  title: "Python 期中考试",
  description: "Python 基础知识综合测试，包括变量、数据类型、控制流、函数等内容",
  questionNum: 5,
  totalPoints: 100,
  timeLimit: 90,
  availableFrom: "2025-12-20 09:00:00",
  availableTo: "2025-12-31 23:59:59",
  finished: 0,
  score: 0,
  questionList: [
    {
      questionId: 1,
      questionType: 1,
      title: "Python 变量命名规则",
      stem: "以下哪个是合法的 Python 变量名？",
      options: JSON.stringify(["2name", "_name", "class", "my-name"]),
      correctAnswer: "B",
      analysis: "Python 变量名可以以字母或下划线开头，不能以数字开头，不能使用关键字",
      points: 20,
      difficulty: 2,
      sortOrder: 1
    },
    {
      questionId: 2,
      questionType: 1,
      title: "Python 数据类型",
      stem: "Python 中以下哪个不是基本数据类型？",
      options: JSON.stringify(["int", "str", "list", "array"]),
      correctAnswer: "D",
      analysis: "Python 的基本数据类型包括 int、float、str、bool、list、tuple、dict、set 等，array 不是内置类型",
      points: 20,
      difficulty: 2,
      sortOrder: 2
    },
    {
      questionId: 3,
      questionType: 2,
      title: "Python 列表操作",
      stem: "以下哪些是 Python 列表的方法？（多选）",
      options: JSON.stringify(["append()", "push()", "pop()", "remove()"]),
      correctAnswer: "A,C,D",
      analysis: "Python 列表的常用方法包括 append()、pop()、remove()、insert() 等，push() 不是列表方法",
      points: 20,
      difficulty: 3,
      sortOrder: 3
    },
    {
      questionId: 4,
      questionType: 3,
      title: "Python 字符串不可变性",
      stem: "Python 中的字符串是可变的数据类型",
      options: null,
      correctAnswer: "0",
      analysis: "Python 中的字符串是不可变的，一旦创建就不能修改",
      points: 20,
      difficulty: 2,
      sortOrder: 4
    },
    {
      questionId: 5,
      questionType: 5,
      title: "Python 函数定义",
      stem: "请简述 Python 中定义函数的语法，并举例说明",
      options: null,
      correctAnswer: "使用 def 关键字定义函数",
      analysis: "Python 使用 def 关键字定义函数，语法为：def 函数名(参数): 函数体",
      points: 20,
      difficulty: 3,
      sortOrder: 5
    }
  ]
};

// 模拟作业详情
const mockHomeworkDetail = {
  homeworkId: 1,
  title: "Python 基础练习",
  description: "完成 Python 变量和数据类型的练习题",
  questionNum: 3,
  totalPoints: 100,
  dueDate: "2025-12-30 23:59:59",
  finished: 0,
  score: 0,
  questionList: [
    {
      questionId: 101,
      questionType: 1,
      title: "Python 输出函数",
      stem: "Python 中用于输出的函数是？",
      options: JSON.stringify(["echo()", "print()", "console.log()", "printf()"]),
      correctAnswer: "B",
      analysis: "Python 使用 print() 函数进行输出",
      points: 30,
      difficulty: 1,
      sortOrder: 1
    },
    {
      questionId: 102,
      questionType: 1,
      title: "Python 注释",
      stem: "Python 中单行注释使用什么符号？",
      options: JSON.stringify(["//", "#", "/*", "--"]),
      correctAnswer: "B",
      analysis: "Python 使用 # 进行单行注释",
      points: 30,
      difficulty: 1,
      sortOrder: 2
    },
    {
      questionId: 103,
      questionType: 4,
      title: "Python 字符串拼接",
      stem: "Python 中使用 _____ 运算符可以拼接两个字符串",
      options: null,
      correctAnswer: "+",
      analysis: "Python 使用 + 运算符拼接字符串",
      points: 40,
      difficulty: 2,
      sortOrder: 3
    }
  ]
};

// 模拟错题列表
const mockWrongQuestionList = [
  {
    id: 1,
    sourceType: 1,
    sourceId: 1,
    sourceName: "Python 基础练习",
    questionId: 101,
    questionType: 1,
    title: "Python 输出函数",
    stem: "Python 中用于输出的函数是？",
    options: JSON.stringify(["echo()", "print()", "console.log()", "printf()"]),
    analysis: "Python 使用 print() 函数进行输出",
    answer: "B",
    userAnswer: "A",
    wrongNum: 2,
    lastWrongTime: "2025-12-20 15:30:00"
  },
  {
    id: 2,
    sourceType: 2,
    sourceId: 1,
    sourceName: "Python 期中考试",
    questionId: 3,
    questionType: 2,
    title: "Python 列表操作",
    stem: "以下哪些是 Python 列表的方法？（多选）",
    options: JSON.stringify(["append()", "push()", "pop()", "remove()"]),
    analysis: "Python 列表的常用方法包括 append()、pop()、remove()、insert() 等",
    answer: "A,C,D",
    userAnswer: "A,B,C",
    wrongNum: 1,
    lastWrongTime: "2025-12-21 10:00:00"
  }
];

export default defineFakeRoute([
  // 获取课程列表
  {
    url: "/edu/frontend/v1/course/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const list = mockCourses.slice(start, end);

      return {
        code: 200,
        msg: "获取成功",
        data: {
          list,
          total: mockCourses.length
        }
      };
    }
  },
  // 获取课程详情
  {
    url: "/edu/frontend/v1/course/detail",
    method: "get",
    timeout: 800,
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      const course = mockCourses.find(c => c.courseId === courseId);

      if (!course) {
        return {
          code: 404,
          msg: "课程不存在",
          data: null
        };
      }

      // 动态生成更多章节以测试滚动逻辑
      const generatedChapters = Array.from({ length: 30 }, (_, i) => ({
        chapterId: i + 1,
        name: `第 ${i + 1} 章：${[
          "基础概念",
          "核心知识",
          "进阶内容",
          "实战演练",
          "性能优化",
          "架构设计",
          "自动化测试",
          "部署运维",
          "安全性考虑",
          "未来趋势",
          "总结与回顾",
          "扩展阅读",
          "面试指南",
          "工具推荐",
          "社区资源",
          "深度剖析",
          "最佳实践",
          "常见陷阱",
          "性能调优",
          "高可用架构",
          "微服务治理",
          "容器化部署",
          "持续集成",
          "监控告警",
          "日志分析",
          "故障排查",
          "团队协作",
          "项目管理",
          "职业规划",
          "终身学习"
        ][i] || `额外章节 ${i + 1}`
          }`,
        hourList: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, j) => ({
          hourId: i * 100 + j + 1,
          duration: 1800 + Math.floor(Math.random() * 1800),
          title: `${i + 1}.${j + 1} ${[
            "理论讲解",
            "代码演示",
            "动手实践",
            "疑难解答",
            "小结测试",
            "案例分析",
            "深度思考",
            "课后练习"
          ][j] || `补充内容 ${j + 1}`
            }`,
          rType: "video",
          fileUrl: "",
          finished: i < 5 ? 1 : 0 // 前五章标记为已完成
        }))
      }));

      return {
        code: 200,
        msg: "获取成功",
        data: {
          ...course,
          courseChapterList: generatedChapters,
          courseAttrList: [
            {
              resourceId: 1,
              title: "课程讲义.pdf",
              rType: "pdf",
              attrId: 1,
              fileUrl: ""
            },
            {
              resourceId: 2,
              title: "代码示例.zip",
              rType: "zip",
              attrId: 2,
              fileUrl: ""
            },
            {
              resourceId: 3,
              title: "参考资料.docx",
              rType: "docx",
              attrId: 3,
              fileUrl: ""
            }
          ]
        }
      };
    }
  },
  // 课时完成上报
  {
    url: "/edu/frontend/v1/course/report/lesson",
    method: "post",
    response: () => {
      return {
        code: 200,
        msg: "上报成功",
        data: null
      };
    }
  },
  // 获取课程学习效果
  {
    url: "/edu/frontend/v1/course/study/effect",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          courseId,
          keyPointNum: 12,
          difficultPointNum: 5,
          knowledgePointNum: 28,
          conceptNum: 15,
          chapterList: [
            {
              chapterId: 1,
              chapterName: "第一章：基础概念",
              keyPointArray: [
                { title: "变量定义", content: "Python 变量无需声明类型，直接赋值即可" },
                { title: "数据类型", content: "Python 支持多种数据类型：int、float、str、bool 等" }
              ],
              difficultPointArray: [
                { title: "类型转换", content: "不同数据类型之间的转换规则和注意事项" }
              ],
              knowledgeArray: [
                { title: "变量命名规则", content: "变量名只能包含字母、数字和下划线" },
                { title: "保留字", content: "Python 有35 个保留字不能用作变量名" }
              ],
              ConceptArray: [
                { title: "动态类型", content: "Python 是动态类型语言，变量类型在运行时确定" }
              ]
            },
            {
              chapterId: 2,
              chapterName: "第二章：核心知识",
              keyPointArray: [
                { title: "控制流", content: "if-else、for、while 等控制结构" },
                { title: "函数定义", content: "使用 def 关键字定义函数" }
              ],
              difficultPointArray: [
                { title: "递归", content: "函数调用自身的编程技巧" }
              ],
              knowledgeArray: [
                { title: "参数传递", content: "位置参数、关键字参数、默认参数" }
              ],
              ConceptArray: [
                { title: "作用域", content: "局部变量和全局变量的作用范围" }
              ]
            }
          ]
        }
      };
    }
  },
  // 获取课程成绩
  {
    url: "/edu/frontend/v1/course/score",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          courseId,
          courseScore: 85,
          workScore: 90,
          examScore: 78
        }
      };
    }
  },
  // 获取课程成绩详情列表
  {
    url: "/edu/frontend/v1/course/grades/list",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          list: [
            {
              name: "第一章基础练习",
              type: "作业",
              score: 85,
              submitTime: "2024-03-15 14:30:00",
              gradedTime: "2024-03-16 10:00:00",
              comment: "完成度较好，但部分细节需要注意"
            },
            {
              name: "Python环境搭建实验",
              type: "实验",
              score: 95,
              submitTime: "2024-03-18 11:20:00",
              gradedTime: "2024-03-19 14:00:00",
              comment: "实验报告详尽，操作规范"
            },
            {
              name: "第二章逻辑控制作业",
              type: "作业",
              score: 92,
              submitTime: "2024-03-22 16:45:00",
              gradedTime: "2024-03-23 09:30:00",
              comment: "非常优秀，代码规范，逻辑清晰"
            },
            {
              name: "基础语法单元测验",
              type: "考试",
              score: 78,
              submitTime: "2024-03-28 15:00:00",
              gradedTime: "2024-03-28 15:30:00",
              comment: "基础知识掌握良好，需加强实践应用"
            },
            {
              name: "数据结构综合实验",
              type: "实验",
              score: 88,
              submitTime: "2024-04-05 09:00:00",
              gradedTime: "2024-04-06 16:30:00",
              comment: "算法实现正确，性能优化有待提高"
            },
            {
              name: "期中综合考试",
              type: "考试",
              score: 82,
              submitTime: "2024-04-10 16:00:00",
              gradedTime: "2024-04-12 09:00:00",
              comment: "整体表现不错，继续保持"
            },
            {
              name: "第三章函数与模块作业",
              type: "作业",
              score: 88,
              submitTime: "2024-04-18 20:15:00",
              gradedTime: "2024-04-19 11:00:00",
              comment: "进步明显，思路清晰"
            },
            {
              name: "面向对象编程实验",
              type: "实验",
              score: 90,
              submitTime: "2024-04-25 14:00:00",
              gradedTime: "2024-04-26 10:00:00",
              comment: "类设计合理，封装性良好"
            },
            {
              name: "第四章异常处理作业",
              type: "作业",
              score: 86,
              submitTime: "2024-05-02 10:00:00",
              gradedTime: "2024-05-03 09:00:00",
              comment: "异常捕获全面，逻辑严密"
            },
            {
              name: "文件操作综合实验",
              type: "实验",
              score: 94,
              submitTime: "2024-05-10 15:30:00",
              gradedTime: "2024-05-11 11:00:00",
              comment: "文件读写效率高，资源释放及时"
            },
            {
              name: "第五章并发编程作业",
              type: "作业",
              score: 80,
              submitTime: "2024-05-18 21:00:00",
              gradedTime: "2024-05-20 10:00:00",
              comment: "多线程同步理解尚可，需注意死锁问题"
            },
            {
              name: "期末综合大作业",
              type: "作业",
              score: 96,
              submitTime: "2024-06-01 12:00:00",
              gradedTime: "2024-06-05 14:00:00",
              comment: "项目架构清晰，功能完整，表现优异"
            }
          ]
        }
      };
    }
  },
  // 获取课程成绩统计概览
  {
    url: "/edu/frontend/v1/course/grades/statistics",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          totalAssignments: 15,
          completedAssignments: 12,
          averageScore: 88.5,
          highestScore: 98,
          completionRate: 80.0
        }
      };
    }
  },
  // 获取成绩班级对比数据
  {
    url: "/edu/frontend/v1/course/grades/class-comparison",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          categories: [
            "第一章作业",
            "环境搭建实验",
            "第二章作业",
            "单元测验",
            "综合实验",
            "期中考试",
            "第三章作业",
            "面向对象实验",
            "第四章作业",
            "文件实验",
            "第五章作业",
            "期末大作业"
          ],
          personalScores: [85, 95, 92, 78, 88, 82, 88, 90, 86, 94, 80, 96],
          classAverages: [80, 88, 85, 75, 82, 78, 82, 85, 82, 89, 78, 90]
        }
      };
    }
  },
  // 获取用户课程作业列表
  {
    url: "/edu/frontend/v1/course/homework/list",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          list: mockHomeworkList
        }
      };
    }
  },
  // 获取用户课程考试列表
  {
    url: "/edu/frontend/v1/course/exam/list",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          list: mockExamList
        }
      };
    }
  },
  // 获取考试详情
  {
    url: "/edu/frontend/v1/exam/detail",
    method: "get",
    response: ({ query }) => {
      const examId = parseInt(getQueryParam(query, "examId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          ...mockExamDetail,
          examId
        }
      };
    }
  },
  // 提交考试答案
  {
    url: "/edu/frontend/v1/exam/submit",
    method: "post",
    response: ({ body }) => {
      // 模拟评分
      const score = Math.floor(Math.random() * 30) + 70; // 70-100分
      return {
        code: 200,
        msg: "提交成功",
        data: {
          score,
          totalScore: 100
        }
      };
    }
  },
  // 获取作业详情
  {
    url: "/edu/frontend/v1/homework/detail",
    method: "get",
    response: ({ query }) => {
      const homeworkId = parseInt(getQueryParam(query, "homeworkId"));
      return {
        code: 200,
        msg: "获取成功",
        data: {
          ...mockHomeworkDetail,
          homeworkId
        }
      };
    }
  },
  // 提交作业答案
  {
    url: "/edu/frontend/v1/homework/submit",
    method: "post",
    response: ({ body }) => {
      // 模拟评分
      const score = Math.floor(Math.random() * 20) + 80; // 80-100分
      return {
        code: 200,
        msg: "提交成功",
        data: {
          score,
          totalScore: 100
        }
      };
    }
  },
  // 获取用户错题列表
  {
    url: "/edu/frontend/v1/wrong/question/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const sourceType = getQueryParam(query, "sourceType")
        ? parseInt(getQueryParam(query, "sourceType"))
        : null;

      let filteredList = mockWrongQuestionList;
      if (sourceType) {
        filteredList = mockWrongQuestionList.filter(q => q.sourceType === sourceType);
      }

      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const list = filteredList.slice(start, end);

      return {
        code: 200,
        msg: "获取成功",
        data: {
          total: filteredList.length,
          list
        }
      };
    }
  },
  // 修改用户密码
  {
    url: "/edu/frontend/v1/user/update/password",
    method: "post",
    response: ({ body }) => {
      if (!body.oldPassword || !body.newPassword) {
        return {
          code: 400,
          msg: "密码不能为空",
          data: null
        };
      }
      return {
        code: 200,
        msg: "密码修改成功",
        data: null
      };
    }
  },
  // 获取HTML 动画展示版本
  {
    url: "/edu/frontend/v1/html-animation/display",
    method: "get",
    response: ({ query }) => {
      const courseId = parseInt(getQueryParam(query, "courseId"));
      const chapterId = parseInt(getQueryParam(query, "chapterId"));

      // 模拟不同课程和章节的动画数据
      const animations = {
        // Python 基础入门
        1: {
          1: { version: "2", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/1/1/v2_python_intro.html" },
          2: { version: "1", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/1/2/v1_variables.html" },
          3: { version: "3", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/1/3/v3_control_flow.html" }
        },
        // Web 前端开发
        2: {
          1: { version: "1", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/2/1/v1_html_tags.html" },
          5: { version: "2", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/2/5/v2_css_flexbox.html" }
        },
        // 数据结构与算法
        3: {
          10: { version: "5", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/3/10/v5_linked_list.html" },
          11: { version: "2", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/3/11/v2_binary_tree.html" },
          12: { version: "1", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/3/12/v1_quick_sort.html" }
        },
        // Vue3 实战开发
        4: {
          1: { version: "1", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/4/1/v1_composition_api.html" },
          3: { version: "2", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/4/3/v2_reactivity.html" }
        },
        // 人工智能导论
        6: {
          1: { version: "1", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/6/1/v1_neural_network.html" },
          5: { version: "3", url: "https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/6/5/v3_gradient_descent.html" }
        }
      };

      const courseAnims = animations[courseId];
      if (courseAnims && courseAnims[chapterId]) {
        const anim = courseAnims[chapterId];
        return {
          code: 200,
          msg: "获取成功",
          data: {
            courseId,
            chapterId,
            version: anim.version,
            url: anim.url
          }
        };
      }

      // 兜底逻辑：奇数章节返回一个通用模拟动画，偶数返回 404
      if (chapterId % 2 === 1) {
        return {
          code: 200,
          msg: "获取成功",
          data: {
            courseId,
            chapterId,
            version: "1",
            url: `https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/${courseId}/${chapterId}/v1_default.html`
          }
        };
      }

      return {
        code: 404,
        msg: "该章节暂无动画演示",
        data: null
      };
    }
  },
  // 错题分析
  {
    url: "/edu/frontend/v1/ai/wrong-exercise/analyze",
    method: "post",
    response: ({ body }) => {
      return {
        code: 200,
        msg: "分析成功",
        data: {
          analysis: {
            error_type: "概念理解错误",
            error_reason: "对Python 内置函数的理解不够准确，混淆了不同语言的输出函数",
            knowledge_points: ["Python 基础语法", "内置函数", "输出与输入"],
            learning_suggestions: "建议复习 Python 基础语法章节，重点关注 print() 函数的用法和参数"
          },
          generated_exercises: [
            {
              exercise_id: "gen_1",
              question: "Python 中 print() 函数的默认分隔符是什么？",
              options: ["逗号", "空格", "换行", "无"],
              correct_answer: "B",
              explanation: "print() 函数默认使用空格作为多个参数之间的分隔符",
              difficulty_level: "简单",
              knowledge_points: ["print函数", "参数"]
            },
            {
              exercise_id: "gen_2",
              question: "如何让 print() 函数不换行输出？",
              options: ["print(x, end='')", "print(x, sep='')", "print(x, line=False)", "print(x, newline=False)"],
              correct_answer: "A",
              explanation: "使用 end='' 参数可以让 print() 不在末尾添加换行符",
              difficulty_level: "中等",
              knowledge_points: ["print函数", "end参数"]
            }
          ]
        }
      };
    }
  },
  // 获取错题分析历史
  {
    url: "/edu/frontend/v1/ai/wrong-exercise/history",
    method: "get",
    response: ({ query }) => {
      const page = parseInt(getQueryParam(query, "page")) || 1;
      const pageSize = parseInt(getQueryParam(query, "page_size")) || 10;
      return {
        code: 200,
        msg: "获取成功",
        data: {
          total: 2,
          page,
          page_size: pageSize,
          total_pages: 1,
          records: [
            {
              id: "history_1",
              course_id: 1,
              original_exercise_id: "101",
              original_exercise_content: "Python 中用于输出的函数是？",
              student_answer: "A",
              correct_answer: "B",
              analysis: {
                error_type: "概念理解错误",
                error_reason: "混淆了不同语言的输出函数",
                knowledge_points: ["Python 基础语法"],
                learning_suggestions: "复习 Python 基础语法"
              },
              generated_exercises: [],
              created_at: "2025-12-2015:30:00",
              updated_at: "2025-12-20 15:30:00"
            }
          ]
        }
      };
    }
  },

  // ==================== 学生端 OJ Mock ====================
  {
    url: "/edu/frontend/v1/oj/stats",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        totalProblems: 156,
        solved: 45,
        attempted: 12,
        rank: 23
      }
    })
  },
  {
    url: "/edu/frontend/v1/oj/problem/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockProblems = [
        { problemId: 1, title: "两数之和", difficulty: "easy", tags: ["数组", "哈希表"], acceptRate: 66.5, myStatus: "solved" },
        { problemId: 2, title: "最长回文子串", difficulty: "medium", tags: ["字符串", "动态规划"], acceptRate: 56.2, myStatus: "attempted" },
        { problemId: 3, title: "合并K个升序链表", difficulty: "hard", tags: ["链表", "分治", "堆"], acceptRate: 38.4, myStatus: null },
        { problemId: 4, title: "有效的括号", difficulty: "easy", tags: ["栈", "字符串"], acceptRate: 77.3, myStatus: "solved" },
        { problemId: 5, title: "最大子数组和", difficulty: "medium", tags: ["数组", "动态规划"], acceptRate: 66.8, myStatus: "solved" },
        { problemId: 6, title: "接雨水", difficulty: "hard", tags: ["数组", "双指针", "动态规划"], acceptRate: 35.9, myStatus: "attempted" },
        { problemId: 7, title: "二分查找", difficulty: "easy", tags: ["数组", "二分查找"], acceptRate: 84.6, myStatus: null },
        { problemId: 8, title: "无重复字符的最长子串", difficulty: "medium", tags: ["哈希表", "字符串", "滑动窗口"], acceptRate: 58.3, myStatus: "solved" },
        { problemId: 9, title: "寻找两个正序数组的中位数", difficulty: "hard", tags: ["数组", "二分查找"], acceptRate: 32.1, myStatus: null },
        { problemId: 10, title: "整数反转", difficulty: "easy", tags: ["数学"], acceptRate: 72.8, myStatus: "solved" }
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
    url: "/edu/frontend/v1/oj/problem/detail",
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
          myStatus: "solved"
        }
      };
    }
  },
  {
    url: "/edu/frontend/v1/oj/submission/my",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(getQueryParam(query, "pageNum")) || 1;
      const pageSize = parseInt(getQueryParam(query, "pageSize")) || 10;
      const mockSubmissions = [
        { submissionId: 1001, problemId: 1, problemTitle: "两数之和", language: "cpp", status: "accepted", runTime: 4, memory: 8.2, submitTime: "2025-01-15 14:32:15" },
        { submissionId: 1002, problemId: 1, problemTitle: "两数之和", language: "cpp", status: "wrong_answer", runTime: 3, memory: 8.1, submitTime: "2025-01-15 14:28:10" },
        { submissionId: 1003, problemId: 2, problemTitle: "最长回文子串", language: "python", status: "time_limit", runTime: 2000, memory: 15.6, submitTime: "2025-01-14 16:45:22" },
        { submissionId: 1004, problemId: 4, problemTitle: "有效的括号", language: "cpp", status: "accepted", runTime: 0, memory: 6.2, submitTime: "2025-01-14 10:20:33" },
        { submissionId: 1005, problemId: 5, problemTitle: "最大子数组和", language: "java", status: "accepted", runTime: 8, memory: 42.5, submitTime: "2025-01-13 19:15:45" }
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
    url: "/edu/frontend/v1/oj/run",
    method: "post",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        status: "success",
        output: "0 1",
        runTime: 2,
        memory: 7.8
      }
    })
  },
  {
    url: "/edu/frontend/v1/oj/submit",
    method: "post",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        submissionId: 1006,
        status: "accepted",
        runTime: 4,
        memory: 8.2,
        passedCases: 3,
        totalCases: 3
      }
    })
  },

  // ==================== 学生端作文批改 Mock ====================
  {
    url: "/edu/frontend/v1/essay/topics",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        list: [
          { topicId: 1, title: "我的梦想", requirement: "请以'我的梦想'为题，写一篇不少于800字的记叙文或议论文，要求内容真实、情感真挚、结构完整。", wordLimit: { min: 800, max: 1200 }, deadline: "2025-01-20 23:59:59", hasSubmitted: true, score: 85 },
          { topicId: 2, title: "春天的故事", requirement: "以'春天的故事'为主题，描写一段发生在春天的难忘经历或感悟。字数800-1000字。", wordLimit: { min: 800, max: 1000 }, deadline: "2025-01-25 23:59:59", hasSubmitted: false },
          { topicId: 3, title: "读书的意义", requirement: "谈谈你对读书意义的理解，可以结合自身经历，字数不少于800字。", wordLimit: { min: 800, max: 1500 }, deadline: "2025-01-30 23:59:59", hasSubmitted: false }
        ]
      }
    })
  },
  {
    url: "/edu/frontend/v1/essay/my",
    method: "get",
    response: ({ query }) => {
      const topicId = parseInt(getQueryParam(query, "topicId"));
      if (topicId === 1) {
        return {
          code: 200,
          msg: "success",
          data: {
            essayId: 1,
            content: `每个人都有自己的梦想，梦想是人生道路上的指路明灯，照亮我们前进的方向。我的梦想是成为一名优秀的软件工程师，用代码改变世界。

从小我就对电脑充满好奇，记得第一次接触编程是在初中的信息技术课上。当我成功运行第一个"Hello World"程序时，屏幕上那几个简单的字符仿佛打开了一扇通往新世界的大门。从那时起，我便深深爱上了编程这门技术。

高中后，我开始系统地学习编程知识。我利用课余时间自学Python、JavaScript等编程语言，还参加了学校的编程社团。在社团里，我和志同道合的伙伴们一起研究算法、开发小项目。我们开发的校园二手交易平台获得了学校信息化建设比赛的一等奖，这让我更加坚定了自己的梦想。

当然，追逐梦想的路上并非一帆风顺。有时候，一个看似简单的bug会让我熬夜调试好几个小时；有时候，复杂的算法会让我百思不得其解。但正是这些困难，让我学会了坚持和思考，让我在不断失败中成长。

我相信，只要我不断努力，终有一天我会实现自己的梦想。我会开发出让人们生活更美好的软件，用技术为社会贡献自己的力量。

梦想是远航的帆，我会扬帆起航，驶向那片属于我的星辰大海。`,
            wordCount: 856,
            submitTime: "2025-01-15 09:30:00",
            status: "teacher_reviewed",
            aiResult: {
              score: 85,
              dimensions: [
                { name: "内容立意", score: 22, maxScore: 25, comment: "主题明确，立意积极向上" },
                { name: "结构层次", score: 20, maxScore: 25, comment: "结构完整，层次分明" },
                { name: "语言表达", score: 23, maxScore: 25, comment: "语言流畅，有文采" },
                { name: "书写规范", score: 20, maxScore: 25, comment: "书写规范，无明显错误" }
              ],
              strengths: ["文章结构完整", "语言流畅自然", "情感真挚"],
              weaknesses: ["部分论述不够深入", "结尾略显仓促"],
              suggestions: ["增加更多细节描写", "结尾可以进一步升华"],
              corrections: [
                { original: "仿佛打开了一扇通往新世界的大门", corrected: "仿佛为我打开了一扇通往新世界的大门", type: "语句优化", reason: "增加主语使句子更完整" }
              ]
            },
            teacherResult: {
              score: 88,
              comment: "这是一篇优秀的作文，主题明确，情感真挚，继续加油！",
              reviewTime: "2025-01-15 16:30:00"
            }
          }
        };
      }
      return {
        code: 200,
        msg: "success",
        data: {
          essayId: null,
          content: "",
          wordCount: 0,
          submitTime: null,
          status: "draft",
          aiResult: null,
          teacherResult: null
        }
      };
    }
  },
  {
    url: "/edu/frontend/v1/essay/draft",
    method: "post",
    response: () => ({ code: 200, msg: "草稿保存成功", data: null })
  },
  {
    url: "/edu/frontend/v1/essay/submit",
    method: "post",
    response: () => ({
      code: 200,
      msg: "提交成功",
      data: { essayId: 10 }
    })
  },
  {
    url: "/edu/frontend/v1/essay/ai-check",
    method: "post",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        score: 78,
        dimensions: [
          { name: "内容立意", score: 20, maxScore: 25 },
          { name: "结构层次", score: 18, maxScore: 25 },
          { name: "语言表达", score: 22, maxScore: 25 },
          { name: "书写规范", score: 18, maxScore: 25 }
        ],
        suggestions: [
          "建议增加更多具体事例",
          "可以适当使用修辞手法增强表现力"
        ],
        corrections: [
          { original: "我认为这很重要", corrected: "我深信这举足轻重", type: "用词建议" }
        ]
      }
    })
  },

  // ==================== 学生端题库训练 Mock ====================
  {
    url: "/edu/frontend/v1/training/categories",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: [
        {
          categoryId: 1,
          name: "计算机基础",
          total: 156,
          completed: 89,
          children: [
            { categoryId: 11, name: "计算机组成原理", total: 45, completed: 32 },
            { categoryId: 12, name: "操作系统", total: 52, completed: 28 },
            { categoryId: 13, name: "计算机网络", total: 59, completed: 29 }
          ]
        },
        {
          categoryId: 2,
          name: "编程语言",
          total: 234,
          completed: 156,
          children: [
            { categoryId: 21, name: "Python基础", total: 78, completed: 65 },
            { categoryId: 22, name: "Java基础", total: 89, completed: 45 },
            { categoryId: 23, name: "C++基础", total: 67, completed: 46 }
          ]
        },
        {
          categoryId: 3,
          name: "数据结构与算法",
          total: 189,
          completed: 78,
          children: [
            { categoryId: 31, name: "基础数据结构", total: 65, completed: 42 },
            { categoryId: 32, name: "排序算法", total: 42, completed: 18 },
            { categoryId: 33, name: "图论算法", total: 82, completed: 18 }
          ]
        }
      ]
    })
  },
  {
    url: "/edu/frontend/v1/training/questions",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        list: [
          {
            questionId: 1,
            content: "以下哪个不是Python的内置数据类型？",
            type: "single",
            difficulty: "easy",
            score: 5,
            options: [
              { content: "list" },
              { content: "tuple" },
              { content: "array" },
              { content: "dict" }
            ],
            answer: 2,
            analysis: "Python的内置数据类型包括：int, float, str, list, tuple, dict, set等。array不是Python的内置类型。"
          },
          {
            questionId: 2,
            content: "在Java中，以下哪些关键字用于异常处理？",
            type: "multiple",
            difficulty: "medium",
            score: 10,
            options: [
              { content: "try", isAnswer: true },
              { content: "catch", isAnswer: true },
              { content: "throw", isAnswer: true },
              { content: "class", isAnswer: false }
            ],
            analysis: "Java中用于异常处理的关键字包括：try, catch, finally, throw, throws。"
          },
          {
            questionId: 3,
            content: "TCP协议是面向连接的协议",
            type: "judge",
            difficulty: "easy",
            score: 5,
            answer: true,
            analysis: "TCP（传输控制协议）是一种面向连接的、可靠的、基于字节流的传输层通信协议。"
          },
          {
            questionId: 4,
            content: "快速排序的平均时间复杂度是____",
            type: "fill",
            difficulty: "medium",
            score: 5,
            answer: "O(nlogn)",
            analysis: "快速排序的平均时间复杂度为O(nlogn)，最坏情况下为O(n²)。"
          },
          {
            questionId: 5,
            content: "以下哪种数据结构采用先进先出(FIFO)的原则？",
            type: "single",
            difficulty: "easy",
            score: 5,
            options: [
              { content: "栈" },
              { content: "队列" },
              { content: "树" },
              { content: "图" }
            ],
            answer: 1,
            analysis: "队列是一种先进先出(FIFO)的数据结构，而栈是后进先出(LIFO)的数据结构。"
          }
        ]
      }
    })
  },
  {
    url: "/edu/frontend/v1/training/answer",
    method: "post",
    response: () => ({ code: 200, msg: "success", data: null })
  },
  {
    url: "/edu/frontend/v1/training/wrong",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        list: [
          {
            questionId: 2,
            content: "在Java中，以下哪些关键字用于异常处理？",
            type: "multiple",
            difficulty: "medium",
            wrongCount: 3,
            lastWrongTime: "2025-01-15 10:30:00",
            options: [
              { content: "try", isAnswer: true },
              { content: "catch", isAnswer: true },
              { content: "throw", isAnswer: true },
              { content: "class", isAnswer: false }
            ],
            analysis: "Java中用于异常处理的关键字包括：try, catch, finally, throw, throws。"
          },
          {
            questionId: 6,
            content: "二叉树的遍历方式包括哪些？",
            type: "multiple",
            difficulty: "medium",
            wrongCount: 2,
            lastWrongTime: "2025-01-14 16:45:00",
            options: [
              { content: "前序遍历", isAnswer: true },
              { content: "中序遍历", isAnswer: true },
              { content: "后序遍历", isAnswer: true },
              { content: "随机遍历", isAnswer: false }
            ],
            analysis: "二叉树的遍历方式包括：前序遍历、中序遍历、后序遍历和层序遍历。"
          }
        ]
      }
    })
  },
  {
    url: "/edu/frontend/v1/training/wrong/clear",
    method: "post",
    response: () => ({ code: 200, msg: "清空成功", data: null })
  },
  {
    url: "/edu/frontend/v1/training/exam/start",
    method: "post",
    response: ({ body }) => ({
      code: 200,
      msg: "success",
      data: {
        examId: 1,
        questions: Array.from({ length: body.questionCount || 10 }, (_, i) => ({
          questionId: i + 1,
          content: `模拟考试题目 ${i + 1}：以下关于${["Python", "Java", "C++", "JavaScript", "数据结构"][i % 5]}的描述，哪个是正确的？`,
          type: i % 3 === 0 ? "single" : i % 3 === 1 ? "multiple" : "judge",
          difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
          score: i % 3 === 0 ? 5 : 10,
          options: i % 3 !== 2 ? [
            { content: "选项A" },
            { content: "选项B" },
            { content: "选项C" },
            { content: "选项D" }
          ] : undefined
        }))
      }
    })
  },
  {
    url: "/edu/frontend/v1/training/exam/submit",
    method: "post",
    response: ({ body }) => {
      const totalQuestions = body.questions?.length || 10;
      const correctCount = Math.floor(totalQuestions * 0.7);
      return {
        code: 200,
        msg: "success",
        data: {
          score: correctCount * 5 + (totalQuestions - correctCount) * 2,
          totalScore: totalQuestions * 5,
          correctCount,
          wrongCount: totalQuestions - correctCount,
          details: body.questions?.map((q: any, i: number) => ({
            questionId: q.questionId,
            isCorrect: i < correctCount,
            userAnswer: body.answers?.[i],
            correctAnswer: 1
          })) || []
        }
      };
    }
  },
  {
    url: "/edu/frontend/v1/competition/overview",
    method: "get",
    response: () => ({
      code: 200,
      msg: "success",
      data: {
        ojStats: { total: 156, solved: 45, rank: 23 },
        essayStats: { submitted: 3, avgScore: 82 },
        trainingStats: { completed: 323, accuracy: 76.5 }
      }
    })
  }
]);

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

      return {
        code: 200,
        msg: "获取成功",
        data: {
          ...course,
          courseChapterList: [
            {
              chapterId: 1,
              name: "第一章：基础概念",
              hourList: [
                {
                  hourId: 1,
                  duration: 1800,
                  title: "1.1 课程介绍",
                  rType: "video",
                  fileUrl: "",
                  finished: 1
                },
                {
                  hourId: 2,
                  duration: 2400,
                  title: "1.2 环境搭建",
                  rType: "video",
                  fileUrl: "",
                  finished: 1
                }
              ]
            },
            {
              chapterId: 2,
              name: "第二章：核心知识",
              hourList: [
                {
                  hourId: 3,
                  duration: 3000,
                  title: "2.1 核心概念讲解",
                  rType: "video",
                  fileUrl: "",
                  finished: 0
                },
                {
                  hourId: 4,
                  duration: 2700,
                  title: "2.2 实践练习",
                  rType: "video",
                  fileUrl: "",
                  finished: 0
                }
              ]
            },
            {
              chapterId: 3,
              name: "第三章：进阶内容",
              hourList: [
                {
                  hourId: 5,
                  duration: 3600,
                  title: "3.1 高级特性",
                  rType: "video",
                  fileUrl: "",
                  finished: 0
                },
                {
                  hourId: 6,
                  duration: 2400,
                  title: "3.2 项目实战",
                  rType: "video",
                  fileUrl: "",
                  finished: 0
                }
              ]
            }
          ],
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
  // 更新用户信息
  {
    url: "/edu/frontend/v1/user/update",
    method: "post",
    response: () => {
      return {
        code: 200,
        msg: "更新成功",
        data: null
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
  }
]);

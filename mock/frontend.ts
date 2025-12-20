// 前端课程相关接口 mock 数据
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 模拟课程列表
const mockCourses = [
  {
    courseId: 1,
    courseName: "Python 基础入门",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 24,
    finishedHours: 18,
    courseDesc: "Python 编程语言基础课程"
  },
  {
    courseId: 2,
    courseName: "Web 前端开发",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 36,
    finishedHours: 12,
    courseDesc: "HTML、CSS、JavaScript 前端开发"
  },
  {
    courseId: 3,
    courseName: "数据结构与算法",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 48,
    finishedHours: 32,
    courseDesc: "计算机基础数据结构与算法"
  },
  {
    courseId: 4,
    courseName: "Vue3 实战开发",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 20,
    finishedHours: 5,
    courseDesc: "Vue3 框架实战项目开发"
  },
  {
    courseId: 5,
    courseName: "数据库原理",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 32,
    finishedHours: 28,
    courseDesc: "数据库基础原理与 SQL"
  },
  {
    courseId: 6,
    courseName: "人工智能导论",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 40,
    finishedHours: 10,
    courseDesc: "AI 人工智能基础知识"
  },
  {
    courseId: 7,
    courseName: "软件工程",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 28,
    finishedHours: 20,
    courseDesc: "软件开发流程与方法论"
  },
  {
    courseId: 8,
    courseName: "Linux 系统管理",
    thumbUrl: "",
    isRequired: 0,
    totalHours: 24,
    finishedHours: 8,
    courseDesc: "Linux 操作系统基础"
  }
];

export default defineFakeRoute([
  // 获取课程列表
  {
    url: "/edu/frontend/v1/course/list",
    method: "get",
    response: ({ query }) => {
      const pageNum = parseInt(query.pageNum) || 1;
      const pageSize = parseInt(query.pageSize) || 10;
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
      const courseId = parseInt(query.courseId);
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
      const courseId = parseInt(query.courseId);
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
              chapterName: "第一章",
              keyPointArray: [{ title: "重点1", content: "这是重点内容" }],
              difficultPointArray: [{ title: "难点1", content: "这是难点内容" }],
              knowledgeArray: [{ title: "知识点1", content: "这是知识点" }],
              ConceptArray: [{ title: "概念1", content: "这是概念解释" }]
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
      const courseId = parseInt(query.courseId);
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
  }
]);

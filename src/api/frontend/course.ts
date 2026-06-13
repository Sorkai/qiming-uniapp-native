import { http, isNativeWebViewRuntime, resolveApiURL } from "@/utils/http";
import type { ApiResponse } from "./types";

export interface CourseListResult {
  list: Array<{
    courseId: number;
    courseName: string;
    thumbUrl: string;
    isRequired: number;
    totalHours: number;
    finishedHours: number;
  }>;
  total: number;
}

export interface CourseDetailResult {
  courseId: number;
  courseName: string;
  thumbUrl: string;
  isRequired: number;
  totalHours: number;
  finishedHours: number;
  courseDesc: string;
  courseChapterList: Array<{
    chapterId: number;
    name: string;
    hourList: Array<{
      hourId: number;
      duration: number;
      title: string;
      rType: string;
      fileUrl: string;
      finished: number;
    }>;
  }>;
  courseAttrList: Array<{
    resourceId: number;
    title: string;
    rType: string;
    attrId: number;
    fileUrl: string;
  }>;
}

export interface CourseScoreResult {
  courseId: number;
  courseScore: number;
  workScore: number;
  examScore: number;
}

export interface CourseStudyEffectResult {
  courseId: number;
  keyPointNum: number;
  difficultPointNum: number;
  knowledgePointNum: number;
  conceptNum: number;
  chapterList: Array<{
    chapterId: number;
    chapterName: string;
    keyPointArray: Array<{
      title: string;
      content: string;
    }>;
    difficultPointArray: Array<{
      title: string;
      content: string;
    }>;
    knowledgeArray: Array<{
      title: string;
      content: string;
    }>;
    ConceptArray: Array<{
      title: string;
      content: string;
    }>;
  }>;
}

/** 课程成绩详情列表项 */
export interface CourseGradeItem {
  name: string;
  type: string;
  score: number;
  submitTime: string;
  gradedTime: string;
  comment: string;
}

/** 课程成绩详情列表结果 */
export interface CourseGradesListResult {
  list: CourseGradeItem[];
}

/** 课程成绩统计概览结果 */
export interface CourseGradesStatisticsResult {
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  highestScore: number;
  completionRate: number;
}

/** 成绩班级对比数据结果 */
export interface CourseGradesClassComparisonResult {
  categories: string[];
  personalScores: number[];
  classAverages: number[];
}

const cloneNativeDemoData = <T>(data: T): T => JSON.parse(JSON.stringify(data));

const buildNativeDemoCourseDetail = (courseId: number): CourseDetailResult => {
  const detail: CourseDetailResult = {
    courseId,
    courseName: "嵌入式Linux开发实践教程",
    thumbUrl: "",
    isRequired: 1,
    totalHours: 6,
    finishedHours: 2,
    courseDesc:
      "面向移动端原生壳验收的嵌入式 Linux 课程样例，覆盖环境搭建、驱动开发、应用调试与 AI 辅助学习。",
    courseChapterList: [
      {
        chapterId: 3101,
        name: "环境搭建与 Linux 基础",
        hourList: [
          {
            hourId: 310101,
            duration: 582,
            title: "嵌入式系统与 Linux 开发环境概览",
            rType: "VIDEO",
            fileUrl: "",
            finished: 1
          },
          {
            hourId: 310102,
            duration: 740,
            title: "交叉编译工具链与工程结构",
            rType: "VIDEO",
            fileUrl: "",
            finished: 1
          }
        ]
      },
      {
        chapterId: 3102,
        name: "驱动与设备通信",
        hourList: [
          {
            hourId: 310201,
            duration: 910,
            title: "GPIO、串口与 I2C 调试流程",
            rType: "VIDEO",
            fileUrl: "",
            finished: 0
          },
          {
            hourId: 310202,
            duration: 860,
            title: "Linux 字符设备驱动实践",
            rType: "VIDEO",
            fileUrl: "",
            finished: 0
          }
        ]
      },
      {
        chapterId: 3103,
        name: "应用开发与部署",
        hourList: [
          {
            hourId: 310301,
            duration: 780,
            title: "Qt GUI 与板端资源联调",
            rType: "VIDEO",
            fileUrl: "",
            finished: 0
          },
          {
            hourId: 310302,
            duration: 820,
            title: "TensorFlow Lite 模型部署入门",
            rType: "VIDEO",
            fileUrl: "",
            finished: 0
          }
        ]
      }
    ],
    courseAttrList: [
      {
        resourceId: 31001,
        title: "嵌入式 Linux 开发环境清单.pdf",
        rType: "PDF",
        attrId: 31001,
        fileUrl: ""
      },
      {
        resourceId: 31002,
        title: "GPIO 与串口调试速查表.docx",
        rType: "DOCUMENT",
        attrId: 31002,
        fileUrl: ""
      }
    ]
  };

  return cloneNativeDemoData(detail);
};

const nativeDemoCourseList = (): CourseListResult => ({
  list: [
    {
      courseId: 31,
      courseName: "嵌入式Linux开发实践教程",
      thumbUrl: "",
      isRequired: 1,
      totalHours: 6,
      finishedHours: 2
    },
    {
      courseId: 32,
      courseName: "物理先导课",
      thumbUrl: "",
      isRequired: 1,
      totalHours: 5,
      finishedHours: 1
    },
    {
      courseId: 33,
      courseName: "AI 课程动画与实验入门",
      thumbUrl: "",
      isRequired: 0,
      totalHours: 4,
      finishedHours: 0
    }
  ],
  total: 3
});

const nativeDemoStudyEffect = (courseId: number): CourseStudyEffectResult => ({
  courseId,
  keyPointNum: 4,
  difficultPointNum: 3,
  knowledgePointNum: 5,
  conceptNum: 3,
  chapterList: [
    {
      chapterId: 3101,
      chapterName: "环境搭建与 Linux 基础",
      keyPointArray: [
        {
          title: "交叉编译链",
          content:
            "理解主机与目标板架构差异，掌握工具链、sysroot 与部署目录的关系。"
        },
        {
          title: "工程目录约定",
          content:
            "将源码、脚本、构建产物和板端配置拆分管理，便于移动端学习记录追踪。"
        }
      ],
      difficultPointArray: [
        {
          title: "环境变量冲突",
          content:
            "多个 SDK 共存时需要明确 PATH、CC、CXX 和 pkg-config 的优先级。"
        }
      ],
      knowledgeArray: [
        {
          title: "Linux 文件系统",
          content: "根文件系统、用户空间程序和设备节点共同组成板端运行环境。"
        },
        {
          title: "远程调试",
          content: "通过 ssh、scp、串口日志定位部署和启动问题。"
        }
      ],
      ConceptArray: [
        {
          title: "Host / Target",
          content: "Host 是开发主机，Target 是实际运行程序的嵌入式设备。"
        }
      ]
    },
    {
      chapterId: 3102,
      chapterName: "驱动与设备通信",
      keyPointArray: [
        {
          title: "设备抽象",
          content:
            "Linux 将硬件能力抽象成文件、总线和驱动接口，应用层通过统一方式访问。"
        }
      ],
      difficultPointArray: [
        {
          title: "时序与电平",
          content:
            "I2C、SPI 等总线问题常来自时序、电平转换和地址配置，需要结合示波器排查。"
        },
        {
          title: "内核日志定位",
          content:
            "dmesg、journalctl 与驱动返回码是定位驱动初始化失败的关键入口。"
        }
      ],
      knowledgeArray: [
        {
          title: "GPIO",
          content: "GPIO 可用于输入检测、输出控制和外设中断触发。"
        },
        {
          title: "字符设备",
          content: "字符设备驱动通常提供 open、read、write、ioctl 等操作入口。"
        }
      ],
      ConceptArray: [
        {
          title: "Device Tree",
          content: "设备树描述硬件拓扑，让内核在启动时识别外设资源。"
        }
      ]
    },
    {
      chapterId: 3103,
      chapterName: "应用开发与部署",
      keyPointArray: [
        {
          title: "板端性能预算",
          content: "部署 GUI 与推理任务前，需要评估 CPU、内存、存储和功耗余量。"
        }
      ],
      difficultPointArray: [],
      knowledgeArray: [
        {
          title: "Qt 事件循环",
          content: "GUI 响应依赖事件循环，耗时任务应放入线程或异步流程。"
        }
      ],
      ConceptArray: [
        {
          title: "边缘推理",
          content: "边缘设备直接运行轻量模型，减少网络依赖并提升响应速度。"
        }
      ]
    }
  ]
});

const nativeDemoCourseScore = (courseId: number): CourseScoreResult => ({
  courseId,
  courseScore: 88,
  workScore: 92,
  examScore: 85
});

const nativeDemoGradeList = (): CourseGradesListResult => ({
  list: [
    {
      name: "环境搭建随堂练习",
      type: "作业",
      score: 92,
      submitTime: "2026-06-10 20:12",
      gradedTime: "2026-06-11 09:30",
      comment: "命令截图与步骤记录完整，继续保持。"
    },
    {
      name: "GPIO 调试实验报告",
      type: "实验",
      score: 86,
      submitTime: "2026-06-12 19:48",
      gradedTime: "2026-06-13 10:05",
      comment: "现象描述清楚，建议补充异常分支的日志分析。"
    },
    {
      name: "阶段测验一",
      type: "考试",
      score: 85,
      submitTime: "2026-06-13 15:20",
      gradedTime: "2026-06-13 16:40",
      comment: "基础概念掌握较好，驱动加载流程还可以再复习。"
    }
  ]
});

const nativeDemoGradesStatistics = (): CourseGradesStatisticsResult => ({
  totalAssignments: 3,
  completedAssignments: 3,
  averageScore: 88,
  highestScore: 92,
  completionRate: 100
});

const nativeDemoClassComparison = (): CourseGradesClassComparisonResult => ({
  categories: ["环境搭建", "GPIO 实验", "阶段测验"],
  personalScores: [92, 86, 85],
  classAverages: [84, 82, 80]
});

const safeStorageValue = (
  storage: Storage | undefined,
  key: string
): string => {
  try {
    return storage?.getItem(key) || "";
  } catch {
    return "";
  }
};

const getNativeDemoRole = () => {
  if (typeof window === "undefined") return "";

  const queryText = `${window.location.search}&${window.location.hash}`;
  const roleMatch = queryText.match(/[?&#]demoRole=([^&#]+)/);
  return (
    safeStorageValue(localStorage, "qiming-demo-role") ||
    safeStorageValue(sessionStorage, "qiming-demo-role") ||
    (roleMatch ? decodeURIComponent(roleMatch[1]) : "")
  );
};

async function requestWithNativeFetchFallback<T>(
  path: string,
  params: Record<string, unknown> | undefined,
  request: () => Promise<ApiResponse<T>>,
  nativeFallback?: () => T
) {
  const createNativeFallbackResponse = (
    reason: string,
    detail?: unknown
  ): ApiResponse<T> | null => {
    if (!nativeFallback) return null;
    console.warn("[NativeFetchFallback] using local course demo data", {
      path,
      params,
      reason,
      detail
    });
    return {
      code: 200,
      msg: "native demo fallback",
      data: nativeFallback()
    };
  };

  if (
    nativeFallback &&
    isNativeWebViewRuntime() &&
    !!getNativeDemoRole() &&
    path.startsWith("/edu/frontend/v1/course/")
  ) {
    const fallback = createNativeFallbackResponse("native course demo preview");
    if (fallback) return fallback;
  }

  try {
    return await request();
  } catch (error) {
    const isNativePreview = isNativeWebViewRuntime();
    if (!isNativePreview) throw error;

    const tokenInfo = (() => {
      try {
        return JSON.parse(localStorage.getItem("user-info") || "{}");
      } catch {
        return {};
      }
    })();
    const token = tokenInfo.accessToken || tokenInfo.refreshToken;
    if (!token) {
      const fallback = createNativeFallbackResponse("missing token", error);
      if (fallback) return fallback;
      throw error;
    }

    const url = resolveApiURL(path, params);
    let lastFetchError: unknown = error;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) return (await response.json()) as ApiResponse<T>;
        lastFetchError = new Error(`Native fetch failed: ${response.status}`);
      } catch (fetchError) {
        lastFetchError = fetchError;
      }

      await new Promise(resolve => setTimeout(resolve, 260 * (attempt + 1)));
    }

    console.warn("[NativeFetchFallback] course request failed", {
      url,
      error: lastFetchError
    });

    const fallback = createNativeFallbackResponse(
      "native request failed",
      lastFetchError
    );
    if (fallback) return fallback;

    throw error;
  }
}

/**
 * 获取课程列表
 */
export const getCourseList = (params: {
  pageNum: number;
  pageSize?: number;
  queryType?: number;
}) => {
  return requestWithNativeFetchFallback<CourseListResult>(
    "/edu/frontend/v1/course/list",
    params,
    () =>
      http.request<ApiResponse<CourseListResult>>(
        "get",
        "/edu/frontend/v1/course/list",
        { params }
      ),
    nativeDemoCourseList
  );
};

/**
 * 获取课程详情
 */
export const getCourseDetail = (params: { courseId: number }) => {
  return requestWithNativeFetchFallback<CourseDetailResult>(
    "/edu/frontend/v1/course/detail",
    params,
    () =>
      http.request<ApiResponse<CourseDetailResult>>(
        "get",
        "/edu/frontend/v1/course/detail",
        { params }
      ),
    () => buildNativeDemoCourseDetail(params.courseId)
  );
};

/**
 * 课时完成上报
 */
export const reportCourseLesson = (data: {
  courseId: number;
  hourId: number;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/frontend/v1/course/report/lesson",
    { data }
  );
};

/**
 * 获取课程学习效果
 */
export const getCourseStudyEffect = (params: { courseId: number }) => {
  return requestWithNativeFetchFallback<CourseStudyEffectResult>(
    "/edu/frontend/v1/course/study/effect",
    params,
    () =>
      http.request<ApiResponse<CourseStudyEffectResult>>(
        "get",
        "/edu/frontend/v1/course/study/effect",
        { params }
      ),
    () => nativeDemoStudyEffect(params.courseId)
  );
};

/**
 * 获取课程成绩
 */
export const getCourseScore = (params: { courseId: number }) => {
  return requestWithNativeFetchFallback<CourseScoreResult>(
    "/edu/frontend/v1/course/score",
    params,
    () =>
      http.request<ApiResponse<CourseScoreResult>>(
        "get",
        "/edu/frontend/v1/course/score",
        { params }
      ),
    () => nativeDemoCourseScore(params.courseId)
  );
};

/**
 * 获取前台课程列表
 */
export const getFrontendCourseList = (params: {
  pageNum: number;
  pageSize?: number;
  status?: string;
}) => {
  return requestWithNativeFetchFallback<CourseListResult>(
    "/edu/frontend/v1/course/list",
    params,
    () =>
      http.request<ApiResponse<CourseListResult>>(
        "get",
        "/edu/frontend/v1/course/list",
        { params }
      ),
    nativeDemoCourseList
  );
};

/**
 * 获取课程成绩详情列表
 *包含每个作业/考试的得分、提交时间、评语等
 */
export const getCourseGradesList = (params: { courseId: number }) => {
  return requestWithNativeFetchFallback<CourseGradesListResult>(
    "/edu/frontend/v1/course/grades/list",
    params,
    () =>
      http.request<ApiResponse<CourseGradesListResult>>(
        "get",
        "/edu/frontend/v1/course/grades/list",
        { params }
      ),
    nativeDemoGradeList
  );
};

/**
 * 获取课程成绩统计概览
 * 包含总作业数、完成数、平均分、最高分等指标
 */
export const getCourseGradesStatistics = (params: { courseId: number }) => {
  return requestWithNativeFetchFallback<CourseGradesStatisticsResult>(
    "/edu/frontend/v1/course/grades/statistics",
    params,
    () =>
      http.request<ApiResponse<CourseGradesStatisticsResult>>(
        "get",
        "/edu/frontend/v1/course/grades/statistics",
        { params }
      ),
    nativeDemoGradesStatistics
  );
};

/**
 * 获取成绩班级对比数据
 * 用于展示个人得分与班级平均分的对比图表
 */
export const getCourseGradesClassComparison = (params: {
  courseId: number;
}) => {
  return requestWithNativeFetchFallback<CourseGradesClassComparisonResult>(
    "/edu/frontend/v1/course/grades/class-comparison",
    params,
    () =>
      http.request<ApiResponse<CourseGradesClassComparisonResult>>(
        "get",
        "/edu/frontend/v1/course/grades/class-comparison",
        { params }
      ),
    nativeDemoClassComparison
  );
};

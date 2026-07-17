import { http, isNativeWebViewRuntime, resolveApiURL } from "@/utils/http";
import type { ApiResponse } from "./types";

export interface ExamDetailParams {
  examId: number;
  courseId: number;
}

export interface ExamDetailResult {
  examId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  timeLimit: number;
  availableFrom: string;
  availableTo: string;
  finished: number;
  score: number;
  questionList: Array<{
    questionId: number;
    questionType: number;
    title: string;
    stem: string;
    content?: string;
    options: string | null;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
  }>;
}

export interface SubmitExamAnswersParams {
  examId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface ExamAnswerResult {
  score: number;
  totalScore: number;
}

export interface HomeworkDetailParams {
  homeworkId: number;
  courseId: number;
}

export interface HomeworkDetailResult {
  homeworkId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  dueDate: string;
  finished: number;
  score: number;
  questionList: Array<{
    questionId: number;
    questionType: number;
    title: string;
    stem: string;
    content?: string;
    options: string | null;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
  }>;
}

export interface SubmitHomeworkAnswersParams {
  homeworkId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface HomeworkAnswerResult {
  score: number;
  totalScore: number;
}

export interface CourseExamListResult {
  examId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  timeLimit: number;
  availableFrom: string;
  availableTo: string;
  status: number;
  score: number;
}

export interface CourseHomeworkListResult {
  homeworkId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  dueDate: string;
  status: number;
  score: number;
}

export interface WrongQuestionListParams {
  page?: number; // 兼容旧参数
  pageNum?: number; // 文档中的参数名
  pageSize?: number;
  sourceType?: number; // 1：作业，2：考试，3：自测题
  courseId?: number; // 可选课程筛选
}

export interface WrongQuestionListResult {
  total: number;
  list: Array<{
    id: number; // 错题ID
    sourceType: number; // 来源类型 1:作业 2:考试 3:自测题
    sourceId: number; // 来源ID
    sourceName: string; // 来源名称
    questionId: number; // 题目ID
    questionType: number; // 1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
    title: string; // 题目标题
    stem: string; // 题目题干
    options: string | null; // 选项(JSON字符串)
    analysis: string | null; // 解析
    answer: string; // 正确答案
    userAnswer: string; // 用户答案
    wrongNum: number; // 错误次数
    lastWrongTime: string; // 最近错误时间
  }>;
}

const buildDemoQuestions = () => [
  {
    questionId: 101,
    questionType: 1,
    title: "交叉编译工具链选择",
    stem: "在嵌入式 Linux 开发中，交叉编译工具链的主要作用是什么？",
    options: JSON.stringify([
      "在开发机上生成目标板可运行程序",
      "替代目标板的网络服务",
      "只用于压缩内核镜像",
      "自动完成所有硬件焊接"
    ]),
    correctAnswer: "A",
    analysis: "交叉编译工具链用于在一种平台上构建另一种平台可运行的程序。",
    points: 20,
    difficulty: 2,
    sortOrder: 1
  },
  {
    questionId: 102,
    questionType: 2,
    title: "开发环境检查项",
    stem: "搭建嵌入式 Linux 开发环境时，通常需要确认哪些内容？",
    options: JSON.stringify([
      "目标板串口连接",
      "交叉编译器版本",
      "内核源码路径",
      "手机相册权限"
    ]),
    correctAnswer: "A,B,C",
    analysis: "串口、工具链和源码路径会直接影响构建、烧录与调试。",
    points: 20,
    difficulty: 2,
    sortOrder: 2
  },
  {
    questionId: 103,
    questionType: 3,
    title: "环境变量判断",
    stem: "PATH 配置错误可能导致 make 时找不到交叉编译器。",
    options: null,
    correctAnswer: "1",
    analysis: "工具链 bin 目录未加入 PATH 时，命令无法被 shell 正确解析。",
    points: 15,
    difficulty: 1,
    sortOrder: 3
  },
  {
    questionId: 104,
    questionType: 4,
    title: "启动参数填写",
    stem: "U-Boot 中常用的内核启动命令是 ____。",
    options: null,
    correctAnswer: "bootm",
    analysis: "bootm 常用于启动 uImage 等镜像。",
    points: 15,
    difficulty: 2,
    sortOrder: 4
  },
  {
    questionId: 105,
    questionType: 5,
    title: "排障说明",
    stem: "简述目标板无法通过 NFS 挂载根文件系统时的排查步骤。",
    options: null,
    correctAnswer: "检查网络、NFS 服务、导出目录和启动参数。",
    analysis: "可按网络连通性、服务状态、目录权限、bootargs 顺序排查。",
    points: 30,
    difficulty: 3,
    sortOrder: 5
  }
];

const nativeDemoExamDetail = (params: ExamDetailParams): ExamDetailResult => {
  const now = Date.now();

  return {
    examId: params.examId,
    title: "嵌入式 Linux 阶段测验",
    description:
      "本测验用于检查交叉编译、启动参数和调试流程的掌握情况。请在移动端完成答题并留意计时状态。",
    questionNum: 5,
    totalPoints: 100,
    timeLimit: 45,
    availableFrom: new Date(now - 60 * 60 * 1000).toISOString(),
    availableTo: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    finished: 0,
    score: 0,
    questionList: buildDemoQuestions()
  };
};

const nativeDemoHomeworkDetail = (
  params: HomeworkDetailParams
): HomeworkDetailResult => ({
  homeworkId: params.homeworkId,
  title: "嵌入式 Linux 开发环境作业",
  description:
    "请结合课程资料完成环境检查与基础命令练习。移动端预览使用本地演示数据，方便离线验收界面和交互。",
  questionNum: 5,
  totalPoints: 100,
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  finished: 0,
  score: 0,
  questionList: buildDemoQuestions()
});

const nativeDemoExamList = (courseId: number): CourseExamListResult[] => [
  {
    examId: 1,
    title: "嵌入式 Linux 阶段测验",
    description: "覆盖交叉编译、启动参数和基础调试流程。",
    questionNum: 5,
    totalPoints: 100,
    timeLimit: 45,
    availableFrom: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    availableTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 2,
    score: 0
  },
  {
    examId: courseId + 10,
    title: "设备树基础复盘",
    description: "巩固设备树节点、属性和驱动匹配过程。",
    questionNum: 4,
    totalPoints: 80,
    timeLimit: 30,
    availableFrom: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    availableTo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 1,
    score: 0
  }
];

const nativeDemoHomeworkList = (
  courseId: number
): CourseHomeworkListResult[] => [
  {
    homeworkId: 1,
    title: "嵌入式 Linux 开发环境作业",
    description: "完成工具链、串口和 NFS 环境检查。",
    questionNum: 5,
    totalPoints: 100,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 2,
    score: 0
  },
  {
    homeworkId: courseId + 20,
    title: "Bootloader 参数整理",
    description: "整理 bootargs、bootcmd 与网络启动参数。",
    questionNum: 3,
    totalPoints: 60,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 1,
    score: 0
  }
];

const nativeDemoWrongQuestions = (): WrongQuestionListResult => ({
  total: 2,
  list: [
    {
      id: 1,
      sourceType: 1,
      sourceId: 1,
      sourceName: "嵌入式 Linux 开发环境作业",
      questionId: 101,
      questionType: 1,
      title: "交叉编译工具链选择",
      stem: "在嵌入式 Linux 开发中，交叉编译工具链的主要作用是什么？",
      options: JSON.stringify([
        "在开发机上生成目标板可运行程序",
        "替代目标板的网络服务",
        "只用于压缩内核镜像",
        "自动完成所有硬件焊接"
      ]),
      analysis: "交叉编译工具链用于在一种平台上构建另一种平台可运行的程序。",
      answer: "A",
      userAnswer: "C",
      wrongNum: 1,
      lastWrongTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      sourceType: 2,
      sourceId: 1,
      sourceName: "嵌入式 Linux 阶段测验",
      questionId: 103,
      questionType: 3,
      title: "环境变量判断",
      stem: "PATH 配置错误可能导致 make 时找不到交叉编译器。",
      options: null,
      analysis: "工具链 bin 目录未加入 PATH 时，命令无法被 shell 正确解析。",
      answer: "1",
      userAnswer: "0",
      wrongNum: 2,
      lastWrongTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ]
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

async function requestWithNativeWorkFallback<T>(
  path: string,
  params: object | undefined,
  request: () => Promise<ApiResponse<T>>,
  nativeFallback?: () => T
) {
  const createNativeFallbackResponse = (
    reason: string,
    detail?: unknown
  ): ApiResponse<T> | null => {
    if (!nativeFallback) return null;
    console.warn("[NativeFetchFallback] using local work demo data", {
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
    path.startsWith("/edu/frontend/v1/")
  ) {
    const fallback = createNativeFallbackResponse("native work demo preview");
    if (fallback) return fallback;
  }

  try {
    return await request();
  } catch (error) {
    if (!isNativeWebViewRuntime()) throw error;

    const url = resolveApiURL(path, params as Record<string, unknown>);
    let lastFetchError: unknown = error;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) return (await response.json()) as ApiResponse<T>;
        lastFetchError = new Error(`Native fetch failed: ${response.status}`);
      } catch (fetchError) {
        lastFetchError = fetchError;
      }

      await new Promise(resolve => setTimeout(resolve, 220 * (attempt + 1)));
    }

    console.warn("[NativeFetchFallback] work request failed", {
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

async function mutateWithNativeWorkFallback<T>(
  path: string,
  data: object | undefined,
  request: () => Promise<ApiResponse<T>>,
  nativeFallback?: () => T
) {
  if (nativeFallback && isNativeWebViewRuntime() && !!getNativeDemoRole()) {
    console.warn("[NativeFetchFallback] using local work mutation result", {
      path,
      data
    });
    return {
      code: 200,
      msg: "native demo fallback",
      data: nativeFallback()
    } as ApiResponse<T>;
  }

  return request();
}

/**
 * 获取考试详情
 */
export const getExamDetail = (params: ExamDetailParams) => {
  return requestWithNativeWorkFallback<ExamDetailResult>(
    "/edu/frontend/v1/exam/detail",
    params,
    () =>
      http.request<ApiResponse<ExamDetailResult>>(
        "get",
        "/edu/frontend/v1/exam/detail",
        { params }
      ),
    () => nativeDemoExamDetail(params)
  );
};

/**
 * 提交考试答案
 */
export const submitExamAnswers = (data: SubmitExamAnswersParams) => {
  return mutateWithNativeWorkFallback<ExamAnswerResult>(
    "/edu/frontend/v1/exam/submit",
    data,
    () =>
      http.request<ApiResponse<ExamAnswerResult>>(
        "post",
        "/edu/frontend/v1/exam/submit",
        { data }
      ),
    () => ({ score: 92, totalScore: 100 })
  );
};

/**
 * 获取作业详情
 */
export const getHomeworkDetail = (params: HomeworkDetailParams) => {
  return requestWithNativeWorkFallback<HomeworkDetailResult>(
    "/edu/frontend/v1/homework/detail",
    params,
    () =>
      http.request<ApiResponse<HomeworkDetailResult>>(
        "get",
        "/edu/frontend/v1/homework/detail",
        { params }
      ),
    () => nativeDemoHomeworkDetail(params)
  );
};

/**
 * 提交作业答案
 */
export const submitHomeworkAnswers = (data: SubmitHomeworkAnswersParams) => {
  return mutateWithNativeWorkFallback<HomeworkAnswerResult>(
    "/edu/frontend/v1/homework/submit",
    data,
    () =>
      http.request<ApiResponse<HomeworkAnswerResult>>(
        "post",
        "/edu/frontend/v1/homework/submit",
        { data }
      ),
    () => ({ score: 88, totalScore: 100 })
  );
};

/**
 * 获取用户课程考试列表
 */
export const getUserCourseExamList = (params: { courseId: number }) => {
  return requestWithNativeWorkFallback<CourseExamListResult[]>(
    "/edu/frontend/v1/course/exam/list",
    params,
    () =>
      http.request<ApiResponse<CourseExamListResult[]>>(
        "get",
        "/edu/frontend/v1/course/exam/list",
        { params }
      ),
    () => nativeDemoExamList(params.courseId)
  );
};

/**
 * 获取用户课程作业列表
 */
export const getUserCourseHomeworkList = (params: { courseId: number }) => {
  return requestWithNativeWorkFallback<CourseHomeworkListResult[]>(
    "/edu/frontend/v1/course/homework/list",
    params,
    () =>
      http.request<ApiResponse<CourseHomeworkListResult[]>>(
        "get",
        "/edu/frontend/v1/course/homework/list",
        { params }
      ),
    () => nativeDemoHomeworkList(params.courseId)
  );
};

/**
 * 获取用户错题列表
 */
export const getUserWrongQuestionList = (params: WrongQuestionListParams) => {
  return requestWithNativeWorkFallback<WrongQuestionListResult>(
    "/edu/frontend/v1/wrong/question/list",
    params,
    () =>
      http.request<ApiResponse<WrongQuestionListResult>>(
        "get",
        "/edu/frontend/v1/wrong/question/list",
        { params }
      ),
    nativeDemoWrongQuestions
  );
};

/**
 * 学生差异化模拟数据集（演示用）
 * 用于：AiLearningPath / AiLearningProfile / AiAssessment
 * 课程上下文：嵌入式 Linux 开发实践教程 (Qt GUI + TFLite)
 */

export interface StudentDataset {
  id: string;
  name: string;
  // 路径规划
  path: {
    courseMeta: {
      name: string;
      subtitle: string;
      totalPhase: number;
      currentPhase: number;
      estimatedHours: number;
    };
    roadmap: Array<{
      title: string;
      status: "completed" | "active" | "pending";
      summary: string;
      nodes: Array<{
        name: string;
        type: "video" | "doc" | "quiz" | "code";
        done: boolean;
        current?: boolean;
      }>;
    }>;
  };
  // 学习画像
  profile: {
    learner: {
      name: string;
      role: string;
      course: string;
      enrollDays: number;
      studyMinutes: number;
    };
    dimensions: Array<{ label: string; value: number; color: string }>;
    knowledgeMap: Array<{ label: string; mastery: number }>;
    tags: string[];
  };
  // 学习评估
  assessment: {
    courseInfo: {
      name: string;
      subtitle: string;
      totalChapters: number;
      finishedChapters: number;
    };
    stats: Array<{ label: string; value: string; sub: string }>;
    strengths: Array<{ title: string; desc: string }>;
    weakPoints: Array<{ level: "high" | "mid"; title: string; desc: string }>;
    timeline: Array<{ time: string; content: string; type: string }>;
    suggestions: string[];
  };
}

const COURSE = "嵌入式 Linux 开发实践教程";
const SUB = "Qt GUI 与 TensorFlow Lite 集成";

export const studentDatasets: Record<string, StudentDataset> = {
  s1: {
    id: "s1",
    name: "吴同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 2, estimatedHours: 36 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架与环境搭建",
          status: "completed",
          summary: "Qt 模块体系扎实，交叉编译一次通过",
          nodes: [
            { name: "Qt Widgets / QML 与模块体系", type: "video", done: true },
            { name: "交叉编译工具链与 sysroot 配置", type: "doc", done: true },
            { name: "Qt Creator 远程部署小测", type: "quiz", done: true }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心 (当前)",
          status: "active",
          summary: "信号槽掌握良好，正攻克响应式布局",
          nodes: [
            { name: "信号与槽机制 (Lambda 与 Connect)", type: "video", done: true },
            { name: "QHBoxLayout / QGridLayout 响应式布局", type: "video", done: false, current: true },
            { name: "Qt Designer 拖拽 + uic 生成代码", type: "code", done: false },
            { name: "QThread 与 QtConcurrent 多线程", type: "quiz", done: false }
          ]
        },
        {
          title: "第三阶段：TensorFlow Lite 推理引擎部署",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "TFLite 模型转换 (SavedModel → .tflite)", type: "video", done: false },
            { name: "训练后量化 / 量化感知训练 (QAT)", type: "doc", done: false },
            { name: "C++ Interpreter 加载与推理", type: "code", done: false },
            { name: "GPU / NNAPI / XNNPACK Delegate", type: "doc", done: false }
          ]
        },
        {
          title: "第四阶段：Qt + TFLite 综合智能终端实践",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "V4L2 摄像头数据流接入", type: "code", done: false },
            { name: "推理结果叠加 (QPainter 绘框)", type: "code", done: false },
            { name: "目标板 FPS / 内存性能调优", type: "quiz", done: false }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "吴同学", role: "Qt + TFLite 进阶选手", course: COURSE, enrollDays: 18, studyMinutes: 1240 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 82, color: "#10b981" },
        { label: "C++ / 交叉编译基础", value: 88, color: "#3b82f6" },
        { label: "TFLite 推理与量化理解", value: 64, color: "#f59e0b" },
        { label: "硬件加速 (Delegate) 实战", value: 55, color: "#ef4444" },
        { label: "工程化与调试能力", value: 76, color: "#8b5cf6" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 95 },
        { label: "信号与槽 / 布局管理", mastery: 86 },
        { label: "Qt Designer & uic", mastery: 70 },
        { label: "QThread / QtConcurrent", mastery: 58 },
        { label: "交叉编译与 sysroot", mastery: 90 },
        { label: "TFLite Converter (量化)", mastery: 62 },
        { label: "TFLite Interpreter C++ API", mastery: 48 },
        { label: "GPU / NNAPI Delegate", mastery: 35 },
        { label: "V4L2 摄像头采集", mastery: 40 },
        { label: "QPainter 推理结果叠加", mastery: 30 }
      ],
      tags: ["Qt 信号槽达人", "交叉编译稳健", "TFLite 量化新手", "偏好 3D 推演视频", "夜间高产学员"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 7 },
      stats: [
        { label: "综合评估等级", value: "B+", sub: "前 32%" },
        { label: "预估结业分", value: "84", sub: "稳中有升" },
        { label: "章节里程碑", value: "7/12", sub: "进度 58%" },
        { label: "实操通过率", value: "76%", sub: "略高于均值" }
      ],
      strengths: [
        { title: "Qt 信号与槽机制", desc: "测验正确率 96%，理解透彻" },
        { title: "交叉编译工具链配置", desc: "完成 sysroot 实操任务 3/3" },
        { title: "Qt 布局管理器", desc: "响应式 UI 题目无错误" }
      ],
      weakPoints: [
        { level: "high", title: "TFLite Delegate 硬件加速选择", desc: "GPU / NNAPI / XNNPACK 适用场景判断错误率 45%。" },
        { level: "high", title: "TFLite Interpreter C++ API 调用顺序", desc: "AllocateTensors / Invoke / typed_output_tensor 步骤记忆混淆。" },
        { level: "mid", title: "训练后量化 vs QAT", desc: "概念辨析题答题时间超出平均 40%。" },
        { level: "mid", title: "V4L2 帧率优化", desc: "实测 12 FPS / 目标 25 FPS。" }
      ],
      timeline: [
        { time: "今天 11:20", content: "完成《Qt 布局管理器》章节测验：满分通过", type: "success" },
        { time: "昨天 16:40", content: "提交《TFLite 模型转换》代码作业，量化后体积下降 73%", type: "primary" },
        { time: "昨天 09:15", content: "Delegate 选择题失分较多，AI 已生成专项练习推送", type: "warning" },
        { time: "本周一", content: "完成第一阶段综合测评，等级 A", type: "success" }
      ],
      suggestions: [
        "重新观看 2.2 节《TFLite Interpreter C++ API》并完成沙盒实操。",
        "在路径规划中接入「Delegate 决策树」专项训练 (20min)。",
        "进入虚拟实验室，尝试将 V4L2 采集帧率优化到 25 FPS 以上。"
      ]
    }
  },

  s2: {
    id: "s2",
    name: "张同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 1, estimatedHours: 42 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架与环境搭建 (当前)",
          status: "active",
          summary: "Qt 基础尚浅，正在补齐交叉编译知识",
          nodes: [
            { name: "Qt Widgets / QML 与模块体系", type: "video", done: true },
            { name: "交叉编译工具链与 sysroot 配置", type: "doc", done: false, current: true },
            { name: "Qt Creator 远程部署小测", type: "quiz", done: false }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "信号与槽机制", type: "video", done: false },
            { name: "响应式布局", type: "video", done: false },
            { name: "Qt Designer", type: "code", done: false },
            { name: "QThread 多线程", type: "quiz", done: false }
          ]
        },
        {
          title: "第三阶段：TensorFlow Lite 部署",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "TFLite 模型转换", type: "video", done: false },
            { name: "量化策略", type: "doc", done: false },
            { name: "C++ Interpreter", type: "code", done: false }
          ]
        },
        {
          title: "第四阶段：Qt + TFLite 综合实践",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "V4L2 摄像头采集", type: "code", done: false },
            { name: "QPainter 绘框", type: "code", done: false },
            { name: "性能调优", type: "quiz", done: false }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "张同学", role: "Qt 入门学员", course: COURSE, enrollDays: 9, studyMinutes: 480 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 48, color: "#f59e0b" },
        { label: "C++ / 交叉编译基础", value: 52, color: "#f59e0b" },
        { label: "TFLite 推理与量化理解", value: 22, color: "#ef4444" },
        { label: "硬件加速 (Delegate) 实战", value: 15, color: "#ef4444" },
        { label: "工程化与调试能力", value: 40, color: "#ef4444" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 60 },
        { label: "信号与槽 / 布局管理", mastery: 35 },
        { label: "Qt Designer & uic", mastery: 25 },
        { label: "QThread / QtConcurrent", mastery: 12 },
        { label: "交叉编译与 sysroot", mastery: 50 },
        { label: "TFLite Converter", mastery: 10 },
        { label: "TFLite Interpreter C++ API", mastery: 5 },
        { label: "GPU / NNAPI Delegate", mastery: 0 },
        { label: "V4L2 摄像头采集", mastery: 0 },
        { label: "QPainter 推理结果叠加", mastery: 0 }
      ],
      tags: ["入门稳健派", "偏好图文文档", "白天集中型", "需要更多实操"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 2 },
      stats: [
        { label: "综合评估等级", value: "C", sub: "后 40%" },
        { label: "预估结业分", value: "68", sub: "需加把劲" },
        { label: "章节里程碑", value: "2/12", sub: "进度 17%" },
        { label: "实操通过率", value: "55%", sub: "低于均值" }
      ],
      strengths: [
        { title: "Qt 模块概念", desc: "概念题正确率 80%" },
        { title: "学习专注度", desc: "单次学习时长稳定 45min+" }
      ],
      weakPoints: [
        { level: "high", title: "交叉编译工具链", desc: "sysroot 配置失败 3 次。" },
        { level: "high", title: "Qt 信号槽实战", desc: "Lambda connect 写法多次出错。" },
        { level: "mid", title: "Qt Creator 远程部署", desc: "未完成首次部署测验。" }
      ],
      timeline: [
        { time: "今天 09:30", content: "重做《Qt 模块体系》测验，正确率提升至 80%", type: "primary" },
        { time: "昨天 20:10", content: "sysroot 配置实验失败，已请求 AI 导师帮助", type: "warning" },
        { time: "前天", content: "完成第一阶段第 1 节视频", type: "success" }
      ],
      suggestions: [
        "立即开启《交叉编译工具链一站式排错》专项，预计 30min。",
        "AI 导师为你预约了 1v1 文字答疑（信号槽专题）。",
        "建议完成沙盒实验 1.3《Qt Creator 远程部署》解锁下一阶段。"
      ]
    }
  },

  s3: {
    id: "s3",
    name: "赵同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 4, estimatedHours: 30 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架",
          status: "completed",
          summary: "完美通过",
          nodes: [
            { name: "Qt 模块体系", type: "video", done: true },
            { name: "交叉编译工具链", type: "doc", done: true },
            { name: "远程部署小测", type: "quiz", done: true }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心",
          status: "completed",
          summary: "全章节满分通过",
          nodes: [
            { name: "信号与槽", type: "video", done: true },
            { name: "响应式布局", type: "video", done: true },
            { name: "Qt Designer", type: "code", done: true },
            { name: "QThread 多线程", type: "quiz", done: true }
          ]
        },
        {
          title: "第三阶段：TFLite 推理引擎",
          status: "completed",
          summary: "Delegate 篇额外加分",
          nodes: [
            { name: "TFLite 模型转换", type: "video", done: true },
            { name: "量化策略", type: "doc", done: true },
            { name: "C++ Interpreter", type: "code", done: true },
            { name: "GPU / NNAPI Delegate", type: "doc", done: true }
          ]
        },
        {
          title: "第四阶段：综合智能终端实践 (当前)",
          status: "active",
          summary: "正在攻坚性能调优",
          nodes: [
            { name: "V4L2 摄像头采集", type: "code", done: true },
            { name: "QPainter 推理叠加", type: "code", done: true },
            { name: "FPS / 内存性能调优", type: "quiz", done: false, current: true }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "赵同学", role: "嵌入式智能终端能手", course: COURSE, enrollDays: 30, studyMinutes: 2380 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 96, color: "#10b981" },
        { label: "C++ / 交叉编译基础", value: 94, color: "#10b981" },
        { label: "TFLite 推理与量化理解", value: 90, color: "#10b981" },
        { label: "硬件加速 (Delegate) 实战", value: 85, color: "#3b82f6" },
        { label: "工程化与调试能力", value: 92, color: "#10b981" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 100 },
        { label: "信号与槽 / 布局管理", mastery: 98 },
        { label: "Qt Designer & uic", mastery: 95 },
        { label: "QThread / QtConcurrent", mastery: 90 },
        { label: "交叉编译与 sysroot", mastery: 95 },
        { label: "TFLite Converter", mastery: 92 },
        { label: "TFLite Interpreter C++ API", mastery: 90 },
        { label: "GPU / NNAPI Delegate", mastery: 85 },
        { label: "V4L2 摄像头采集", mastery: 88 },
        { label: "QPainter 推理结果叠加", mastery: 82 }
      ],
      tags: ["全栈型选手", "性能优化能手", "代码沙盒高产", "TFLite 实战达人", "可担任学习助教"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 11 },
      stats: [
        { label: "综合评估等级", value: "A+", sub: "前 5%" },
        { label: "预估结业分", value: "96", sub: "稳定高位" },
        { label: "章节里程碑", value: "11/12", sub: "进度 92%" },
        { label: "实操通过率", value: "97%", sub: "顶尖水平" }
      ],
      strengths: [
        { title: "TFLite Delegate 选型", desc: "GPU/NNAPI 决策树题全部正确" },
        { title: "QPainter 推理叠加", desc: "完成自定义绘制扩展任务" },
        { title: "工程化与调试", desc: "GDB 远程调试任务一次过" },
        { title: "C++ 并发编程", desc: "QThread + atomic 实验得分 100" }
      ],
      weakPoints: [
        { level: "mid", title: "目标板内存峰值", desc: "推理高峰内存 220MB / 期望 180MB。" }
      ],
      timeline: [
        { time: "今天 10:00", content: "提交《QPainter 实时叠加》进阶实验，评分 100", type: "success" },
        { time: "昨天 19:30", content: "实测推理 FPS 达 31，超过目标 25", type: "success" },
        { time: "昨天 14:00", content: "完成 Delegate 决策树专项练习", type: "success" },
        { time: "本周一", content: "被推荐参加校内嵌入式 AI 创新赛", type: "primary" }
      ],
      suggestions: [
        "尝试通过 XNNPACK + 多线程进一步压低内存峰值。",
        "申请参与开源课程的助教计划，输出 Delegate 决策心得。",
        "解锁拓展任务：YOLOv5-nano TFLite 移植实战。"
      ]
    }
  },

  s4: {
    id: "s4",
    name: "钱同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 3, estimatedHours: 34 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架",
          status: "completed",
          summary: "通过",
          nodes: [
            { name: "Qt 模块体系", type: "video", done: true },
            { name: "交叉编译工具链", type: "doc", done: true },
            { name: "远程部署小测", type: "quiz", done: true }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心",
          status: "completed",
          summary: "通过",
          nodes: [
            { name: "信号与槽", type: "video", done: true },
            { name: "响应式布局", type: "video", done: true },
            { name: "Qt Designer", type: "code", done: true },
            { name: "QThread 多线程", type: "quiz", done: true }
          ]
        },
        {
          title: "第三阶段：TFLite 推理引擎 (当前)",
          status: "active",
          summary: "C++ Interpreter 实战中",
          nodes: [
            { name: "TFLite 模型转换", type: "video", done: true },
            { name: "量化策略", type: "doc", done: true },
            { name: "C++ Interpreter", type: "code", done: false, current: true },
            { name: "GPU / NNAPI Delegate", type: "doc", done: false }
          ]
        },
        {
          title: "第四阶段：综合实践",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "V4L2 摄像头采集", type: "code", done: false },
            { name: "QPainter 推理叠加", type: "code", done: false },
            { name: "性能调优", type: "quiz", done: false }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "钱同学", role: "AI 推理探索者", course: COURSE, enrollDays: 22, studyMinutes: 1620 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 78, color: "#3b82f6" },
        { label: "C++ / 交叉编译基础", value: 70, color: "#3b82f6" },
        { label: "TFLite 推理与量化理解", value: 75, color: "#3b82f6" },
        { label: "硬件加速 (Delegate) 实战", value: 42, color: "#ef4444" },
        { label: "工程化与调试能力", value: 60, color: "#f59e0b" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 88 },
        { label: "信号与槽 / 布局管理", mastery: 82 },
        { label: "Qt Designer & uic", mastery: 78 },
        { label: "QThread / QtConcurrent", mastery: 65 },
        { label: "交叉编译与 sysroot", mastery: 70 },
        { label: "TFLite Converter", mastery: 80 },
        { label: "TFLite Interpreter C++ API", mastery: 55 },
        { label: "GPU / NNAPI Delegate", mastery: 35 },
        { label: "V4L2 摄像头采集", mastery: 20 },
        { label: "QPainter 推理结果叠加", mastery: 15 }
      ],
      tags: ["量化方向偏好", "提问活跃", "概念题强者", "C++ API 待加强"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 8 },
      stats: [
        { label: "综合评估等级", value: "B", sub: "中上 45%" },
        { label: "预估结业分", value: "80", sub: "有上升空间" },
        { label: "章节里程碑", value: "8/12", sub: "进度 67%" },
        { label: "实操通过率", value: "72%", sub: "接近均值" }
      ],
      strengths: [
        { title: "TFLite 模型转换", desc: "量化模型体积压缩 75%" },
        { title: "概念题解析", desc: "前三阶段概念题正确率 88%" }
      ],
      weakPoints: [
        { level: "high", title: "C++ Interpreter 内存生命周期", desc: "Tensor 释放时机理解不到位，沙盒实验 2 次失败。" },
        { level: "mid", title: "QThread 与共享数据", desc: "并发访问无加锁导致 UB。" }
      ],
      timeline: [
        { time: "今天 14:25", content: "提交 TFLite Interpreter 沙盒第 2 次尝试，仍 segfault", type: "warning" },
        { time: "昨天 22:10", content: "完成量化策略章节，章节测验 95 分", type: "success" },
        { time: "前天", content: "提问『QThread 安全锁』，AI 已回复并附示例", type: "primary" }
      ],
      suggestions: [
        "重点复习 3.3 节《Tensor 内存生命周期》并完成断点单步实验。",
        "进入沙盒练习 QMutex / std::lock_guard 的最佳实践。",
        "可提前预习第四阶段 V4L2，缩短综合实战项目周期。"
      ]
    }
  },

  s5: {
    id: "s5",
    name: "孙同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 2, estimatedHours: 38 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架",
          status: "completed",
          summary: "略有反复，已掌握",
          nodes: [
            { name: "Qt 模块体系", type: "video", done: true },
            { name: "交叉编译工具链", type: "doc", done: true },
            { name: "远程部署小测", type: "quiz", done: true }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心 (当前)",
          status: "active",
          summary: "Qt Designer 卡住",
          nodes: [
            { name: "信号与槽", type: "video", done: true },
            { name: "响应式布局", type: "video", done: true },
            { name: "Qt Designer + uic", type: "code", done: false, current: true },
            { name: "QThread 多线程", type: "quiz", done: false }
          ]
        },
        {
          title: "第三阶段：TFLite 推理引擎",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "TFLite 模型转换", type: "video", done: false },
            { name: "量化策略", type: "doc", done: false },
            { name: "C++ Interpreter", type: "code", done: false }
          ]
        },
        {
          title: "第四阶段：综合实践",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "V4L2 摄像头采集", type: "code", done: false },
            { name: "QPainter 推理叠加", type: "code", done: false },
            { name: "性能调优", type: "quiz", done: false }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "孙同学", role: "Qt 实战探索者", course: COURSE, enrollDays: 15, studyMinutes: 900 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 66, color: "#3b82f6" },
        { label: "C++ / 交叉编译基础", value: 60, color: "#f59e0b" },
        { label: "TFLite 推理与量化理解", value: 30, color: "#ef4444" },
        { label: "硬件加速 (Delegate) 实战", value: 18, color: "#ef4444" },
        { label: "工程化与调试能力", value: 50, color: "#f59e0b" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 80 },
        { label: "信号与槽 / 布局管理", mastery: 72 },
        { label: "Qt Designer & uic", mastery: 40 },
        { label: "QThread / QtConcurrent", mastery: 30 },
        { label: "交叉编译与 sysroot", mastery: 65 },
        { label: "TFLite Converter", mastery: 20 },
        { label: "TFLite Interpreter C++ API", mastery: 10 },
        { label: "GPU / NNAPI Delegate", mastery: 0 },
        { label: "V4L2 摄像头采集", mastery: 0 },
        { label: "QPainter 推理结果叠加", mastery: 0 }
      ],
      tags: ["夜猫学习型", "视频偏好者", "Qt Designer 困境", "尚未触及 AI 模块"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 5 },
      stats: [
        { label: "综合评估等级", value: "C+", sub: "中位 50%" },
        { label: "预估结业分", value: "74", sub: "有潜力" },
        { label: "章节里程碑", value: "5/12", sub: "进度 42%" },
        { label: "实操通过率", value: "62%", sub: "略低于均值" }
      ],
      strengths: [
        { title: "Qt 信号槽", desc: "已能独立写出 Lambda connect" }
      ],
      weakPoints: [
        { level: "high", title: "Qt Designer + uic 流程", desc: "未能成功生成自定义控件，3 次实验失败。" },
        { level: "high", title: "并发编程", desc: "QThread + 互斥锁概念混淆。" },
        { level: "mid", title: "学习节奏", desc: "近 7 日有 3 天未登录。" }
      ],
      timeline: [
        { time: "今天 23:40", content: "Qt Designer 第 3 次实验失败，AI 已生成详细排错路径", type: "warning" },
        { time: "前天", content: "重新提交响应式布局实验，通过", type: "success" }
      ],
      suggestions: [
        "完成《Qt Designer 视频精讲》并跟做示例工程。",
        "建议把学习时间固定在 20:00–22:00，避免深夜疲劳学习。",
        "进入《QMutex 互斥锁》专项练习巩固并发概念。"
      ]
    }
  },

  s6: {
    id: "s6",
    name: "周同学",
    path: {
      courseMeta: { name: COURSE, subtitle: SUB, totalPhase: 4, currentPhase: 3, estimatedHours: 32 },
      roadmap: [
        {
          title: "第一阶段：嵌入式 Qt 框架",
          status: "completed",
          summary: "通过",
          nodes: [
            { name: "Qt 模块体系", type: "video", done: true },
            { name: "交叉编译工具链", type: "doc", done: true },
            { name: "远程部署小测", type: "quiz", done: true }
          ]
        },
        {
          title: "第二阶段：Qt GUI 编程核心",
          status: "completed",
          summary: "顺利完成",
          nodes: [
            { name: "信号与槽", type: "video", done: true },
            { name: "响应式布局", type: "video", done: true },
            { name: "Qt Designer", type: "code", done: true },
            { name: "QThread 多线程", type: "quiz", done: true }
          ]
        },
        {
          title: "第三阶段：TFLite 推理引擎 (当前)",
          status: "active",
          summary: "GPU Delegate 攻坚",
          nodes: [
            { name: "TFLite 模型转换", type: "video", done: true },
            { name: "量化策略", type: "doc", done: true },
            { name: "C++ Interpreter", type: "code", done: true },
            { name: "GPU / NNAPI Delegate", type: "doc", done: false, current: true }
          ]
        },
        {
          title: "第四阶段：综合实践",
          status: "pending",
          summary: "等待开启",
          nodes: [
            { name: "V4L2 摄像头采集", type: "code", done: false },
            { name: "QPainter 推理叠加", type: "code", done: false },
            { name: "性能调优", type: "quiz", done: false }
          ]
        }
      ]
    },
    profile: {
      learner: { name: "周同学", role: "GPU Delegate 攻坚选手", course: COURSE, enrollDays: 26, studyMinutes: 1880 },
      dimensions: [
        { label: "Qt GUI 编程熟练度", value: 84, color: "#10b981" },
        { label: "C++ / 交叉编译基础", value: 80, color: "#3b82f6" },
        { label: "TFLite 推理与量化理解", value: 82, color: "#3b82f6" },
        { label: "硬件加速 (Delegate) 实战", value: 65, color: "#f59e0b" },
        { label: "工程化与调试能力", value: 78, color: "#3b82f6" }
      ],
      knowledgeMap: [
        { label: "Qt 模块体系", mastery: 92 },
        { label: "信号与槽 / 布局管理", mastery: 88 },
        { label: "Qt Designer & uic", mastery: 85 },
        { label: "QThread / QtConcurrent", mastery: 80 },
        { label: "交叉编译与 sysroot", mastery: 78 },
        { label: "TFLite Converter", mastery: 86 },
        { label: "TFLite Interpreter C++ API", mastery: 78 },
        { label: "GPU / NNAPI Delegate", mastery: 60 },
        { label: "V4L2 摄像头采集", mastery: 20 },
        { label: "QPainter 推理结果叠加", mastery: 18 }
      ],
      tags: ["代码沙盒型", "高频提问者", "稳步进阶", "GPU Delegate 进行中"]
    },
    assessment: {
      courseInfo: { name: COURSE, subtitle: SUB, totalChapters: 12, finishedChapters: 9 },
      stats: [
        { label: "综合评估等级", value: "A-", sub: "前 18%" },
        { label: "预估结业分", value: "88", sub: "上升趋势" },
        { label: "章节里程碑", value: "9/12", sub: "进度 75%" },
        { label: "实操通过率", value: "85%", sub: "高于均值" }
      ],
      strengths: [
        { title: "C++ Interpreter 实战", desc: "Tensor 生命周期管理无错误" },
        { title: "代码沙盒提交频率", desc: "近 7 日提交 12 次，全员第一" },
        { title: "概念融会贯通", desc: "量化与 Delegate 综合题正确率 90%" }
      ],
      weakPoints: [
        { level: "mid", title: "GPU Delegate 兼容性矩阵", desc: "Op fallback 情形理解不全。" },
        { level: "mid", title: "NNAPI 设备发现", desc: "未掌握 ANeuralNetworks API 入口。" }
      ],
      timeline: [
        { time: "今天 15:55", content: "提交 GPU Delegate 实验初版，op fallback 6 处", type: "warning" },
        { time: "昨天 21:00", content: "完成 TFLite Interpreter 实战，得分 92", type: "success" },
        { time: "前天", content: "在论坛回答其他同学的量化问题，被采纳", type: "primary" }
      ],
      suggestions: [
        "深入阅读《GPU Delegate Op 支持矩阵》并完成 fallback 标注练习。",
        "可提前阅读第四阶段 V4L2 章节，做好综合实战准备。",
        "AI 推荐你作为论坛 Top 答主，开启高级权限。"
      ]
    }
  }
};

export function getStudentDataset(id?: string): StudentDataset {
  if (id && studentDatasets[id]) return studentDatasets[id];
  return studentDatasets.s1;
}

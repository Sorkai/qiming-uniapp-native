import type {
  LearningAnalyticsData,
  OverviewStatistics,
  RecentPaperItem,
  SystemTemplateStats
} from "@/api/examPaper";

export const nativeDemoOverviewStatistics: OverviewStatistics = {
  totalPapers: 18,
  publishedCount: 12,
  gradingCount: 4,
  averageScore: 83
};

export const nativeDemoRecentPapers: RecentPaperItem[] = [
  {
    id: 1,
    title: "嵌入式 Linux 开发阶段测验",
    courseName: "嵌入式 Linux",
    updateTime: "2026-06-13 18:20",
    status: 1,
    questionCount: 24,
    totalPoints: 100
  },
  {
    id: 2,
    title: "高等数学导数与极限练习",
    courseName: "高等数学",
    updateTime: "2026-06-12 15:40",
    status: 0,
    questionCount: 18,
    totalPoints: 80
  },
  {
    id: 3,
    title: "计算机基础期末综合训练",
    courseName: "计算机基础",
    updateTime: "2026-06-11 09:35",
    status: 1,
    questionCount: 30,
    totalPoints: 120
  }
];

export const nativeDemoSystemTemplateStats: SystemTemplateStats[] = [
  {
    templateKey: "standard",
    questionCount: 30,
    totalPoints: 100,
    useCount: 128
  },
  {
    templateKey: "quick",
    questionCount: 5,
    totalPoints: 25,
    useCount: 84
  },
  {
    templateKey: "comprehensive",
    questionCount: 15,
    totalPoints: 75,
    useCount: 63
  },
  {
    templateKey: "survey",
    questionCount: 22,
    totalPoints: 120,
    useCount: 47
  }
];

export const createNativeDemoLearningAnalytics = (
  courseId?: number
): LearningAnalyticsData => {
  const courseOffset = courseId ? courseId * 2 : 0;
  const avgScore = 82 + courseOffset;
  const passRate = Math.min(94, 84 + courseOffset);
  const excellentRate = Math.min(42, 26 + courseOffset);
  const totalStudents = 146 + courseOffset * 5;

  return {
    overview: {
      totalExams: 12 + (courseId || 0),
      totalStudents,
      avgScore,
      passRate
    },
    scoreDistribution: [
      {
        range: "90-100",
        count: Math.round((totalStudents * excellentRate) / 100),
        percentage: excellentRate
      },
      {
        range: "80-89",
        count: Math.round(totalStudents * 0.34),
        percentage: 34
      },
      {
        range: "70-79",
        count: Math.round(totalStudents * 0.24),
        percentage: 24
      },
      {
        range: "60-69",
        count: Math.round(totalStudents * 0.12),
        percentage: 12
      },
      {
        range: "0-59",
        count: Math.round(totalStudents * 0.04),
        percentage: 4
      }
    ],
    knowledgePoints: [
      { name: "导数定义", mastery: 88, questionCount: 12 },
      { name: "Linux 权限", mastery: 82, questionCount: 10 },
      { name: "进程管理", mastery: 76, questionCount: 8 }
    ],
    questionTypeStats: [
      { type: "单选题", correctRate: 86, avgTime: 42 },
      { type: "多选题", correctRate: 73, avgTime: 68 },
      { type: "简答题", correctRate: 69, avgTime: 180 }
    ],
    examTrends: [
      { date: "06-09", avgScore: avgScore - 3, passRate: passRate - 4 },
      { date: "06-10", avgScore: avgScore - 2, passRate: passRate - 3 },
      { date: "06-11", avgScore: avgScore - 1, passRate: passRate - 2 },
      { date: "06-12", avgScore, passRate }
    ],
    studentRanking: [
      {
        rank: 1,
        name: "吴同学",
        studentId: "S2026001",
        score: 96,
        trend: "up"
      },
      {
        rank: 2,
        name: "李同学",
        studentId: "S2026002",
        score: 93,
        trend: "same"
      }
    ]
  };
};

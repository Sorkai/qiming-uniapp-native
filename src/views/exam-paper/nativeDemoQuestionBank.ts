import type {
  KnowledgePoint,
  QuestionBankFullItem,
  QuestionFolder
} from "@/api/examPaper";

export const nativeDemoQuestionFolders: QuestionFolder[] = [
  {
    id: 101,
    name: "高等数学",
    questionCount: 0,
    createTime: "2026-03-01"
  },
  {
    id: 102,
    name: "嵌入式 Linux",
    questionCount: 0,
    createTime: "2026-03-02"
  },
  {
    id: 103,
    name: "计算机基础",
    questionCount: 0,
    createTime: "2026-03-03"
  }
];

export const nativeDemoKnowledgePoints: KnowledgePoint[] = [
  {
    id: 201,
    name: "导数定义",
    questionCount: 0,
    children: [
      { id: 202, name: "极限运算", parentId: 201, questionCount: 0 },
      { id: 203, name: "导数应用", parentId: 201, questionCount: 0 }
    ]
  },
  {
    id: 301,
    name: "Linux 权限",
    questionCount: 0,
    children: [
      { id: 302, name: "文件系统", parentId: 301, questionCount: 0 },
      { id: 303, name: "进程管理", parentId: 301, questionCount: 0 }
    ]
  },
  {
    id: 401,
    name: "数据结构",
    questionCount: 0,
    children: [
      { id: 402, name: "栈与队列", parentId: 401, questionCount: 0 },
      { id: 403, name: "树结构", parentId: 401, questionCount: 0 }
    ]
  }
];

export const nativeDemoQuestionBankItems: QuestionBankFullItem[] = [
  {
    id: 1001,
    type: "radio",
    typeName: "单选题",
    stem: "函数 f(x)=x^2 在 x=3 处的导数是（ ）。",
    options: [
      { key: "A", content: "3" },
      { key: "B", content: "6" },
      { key: "C", content: "9" },
      { key: "D", content: "12" }
    ],
    correctAnswer: "B",
    analysis: "f'(x)=2x，所以 f'(3)=6。",
    knowledgePoints: ["导数定义"],
    difficulty: "easy",
    difficultyName: "简单",
    points: 4,
    createTime: "2026-03-10",
    useCount: 18,
    folderId: 101,
    folderName: "高等数学",
    subject: "math",
    subjectName: "高等数学"
  },
  {
    id: 1002,
    type: "radio",
    typeName: "单选题",
    stem: "当 x 趋近于 0 时，sinx / x 的极限为（ ）。",
    options: [
      { key: "A", content: "0" },
      { key: "B", content: "1/2" },
      { key: "C", content: "1" },
      { key: "D", content: "不存在" }
    ],
    correctAnswer: "C",
    analysis: "这是重要极限之一，结果为 1。",
    knowledgePoints: ["极限运算"],
    difficulty: "easy",
    difficultyName: "简单",
    points: 4,
    createTime: "2026-03-10",
    useCount: 22,
    folderId: 101,
    folderName: "高等数学",
    subject: "math",
    subjectName: "高等数学"
  },
  {
    id: 1003,
    type: "checkbox",
    typeName: "多选题",
    stem: "下列关于 Linux 文件权限的说法正确的是（ ）。",
    options: [
      { key: "A", content: "r 表示可读" },
      { key: "B", content: "w 表示可写" },
      { key: "C", content: "x 表示可执行" },
      { key: "D", content: "chmod 只能由 root 使用" }
    ],
    correctAnswers: ["A", "B", "C"],
    analysis: "普通用户也可以修改自己拥有文件的权限。",
    knowledgePoints: ["Linux 权限", "文件系统"],
    difficulty: "medium",
    difficultyName: "中等",
    points: 8,
    createTime: "2026-03-12",
    useCount: 15,
    folderId: 102,
    folderName: "嵌入式 Linux",
    subject: "linux",
    subjectName: "嵌入式 Linux"
  },
  {
    id: 1004,
    type: "judge",
    typeName: "判断题",
    stem: "进程调度只发生在多核处理器环境中。",
    options: [
      { key: "T", content: "正确" },
      { key: "F", content: "错误" }
    ],
    correctAnswer: "F",
    analysis: "单核处理器同样需要通过调度在进程之间切换。",
    knowledgePoints: ["进程管理"],
    difficulty: "medium",
    difficultyName: "中等",
    points: 5,
    createTime: "2026-03-14",
    useCount: 11,
    folderId: 102,
    folderName: "嵌入式 Linux",
    subject: "linux",
    subjectName: "嵌入式 Linux"
  },
  {
    id: 1007,
    type: "radio",
    typeName: "单选题",
    stem: "在 Linux 中查看当前目录文件列表的常用命令是（ ）。",
    options: [
      { key: "A", content: "pwd" },
      { key: "B", content: "ls" },
      { key: "C", content: "cd" },
      { key: "D", content: "mkdir" }
    ],
    correctAnswer: "B",
    analysis: "ls 用于列出目录内容，pwd 用于查看当前路径。",
    knowledgePoints: ["Linux 权限", "文件系统"],
    difficulty: "medium",
    difficultyName: "中等",
    points: 4,
    createTime: "2026-03-15",
    useCount: 13,
    folderId: 102,
    folderName: "嵌入式 Linux",
    subject: "linux",
    subjectName: "嵌入式 Linux"
  },
  {
    id: 1005,
    type: "input",
    typeName: "填空题",
    stem: "栈是一种后进先出结构，通常简称为 ____。",
    correctAnswer: "LIFO",
    analysis: "Last In First Out，即后进先出。",
    knowledgePoints: ["栈与队列"],
    difficulty: "easy",
    difficultyName: "简单",
    points: 6,
    createTime: "2026-03-16",
    useCount: 9,
    folderId: 103,
    folderName: "计算机基础",
    subject: "cs",
    subjectName: "计算机基础"
  },
  {
    id: 1006,
    type: "textarea",
    typeName: "简答题",
    stem: "简述二叉搜索树在插入数据时保持有序性的基本规则。",
    referenceAnswer:
      "小于当前节点的值进入左子树，大于当前节点的值进入右子树，并递归比较直到找到空位置。",
    analysis: "回答应包含左右子树比较规则和递归插入过程。",
    knowledgePoints: ["树结构", "数据结构"],
    difficulty: "hard",
    difficultyName: "困难",
    points: 12,
    createTime: "2026-03-18",
    useCount: 7,
    folderId: 103,
    folderName: "计算机基础",
    subject: "cs",
    subjectName: "计算机基础"
  }
];

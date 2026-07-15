<script setup lang="ts">
import { computed, ref } from "vue";
import { PlatformResourcePreviewPane } from "@/components/PlatformResourcePreview";
import type { PlatformPreviewResource } from "@/components/PlatformResourcePreview";

const mode = ref<"coding" | "exercise" | "document">("coding");

const resources: Record<string, PlatformPreviewResource> = {
  coding: {
    title: "数组中两数之和",
    resourceType: "coding_practice_case",
    contentFormat: "json",
    description: "给定一个整数数组和目标值，请找出和为目标值的两个元素下标。",
    language: "Python 3",
    starterCode:
      "class Solution:\n    def two_sum(self, nums: list[int], target: int) -> list[int]:\n        # 请在这里完成代码\n        pass",
    testCases: [
      { input: "nums = [2, 7, 11, 15], target = 9", expected_output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", expected_output: "[1, 2]" }
    ],
    rubric: {
      correctness: "通过全部公开与隐藏测试用例",
      complexity: "时间复杂度达到 O(n)",
      readability: "变量命名清晰并处理边界情况"
    },
    runtimeStatus: "ready",
    content: JSON.stringify({
      difficulty: "medium",
      input_spec: "整数数组 nums 与整数 target，数组长度不少于 2。",
      output_spec: "返回两个下标组成的数组，答案顺序不限。",
      constraints: [
        "2 <= nums.length <= 10^4",
        "每组输入只对应一个有效答案",
        "同一个元素不能重复使用"
      ],
      hints: ["使用哈希表记录已经遍历过的数字及其下标。"]
    })
  },
  exercise: {
    title: "数据安全基础练习",
    resourceType: "exercise_set",
    contentFormat: "json",
    description: "围绕访问控制、隐私保护和责任边界进行巩固。",
    exerciseItems: [
      {
        title: "访问控制",
        type: "single_choice",
        question: "以下哪一项最符合最小权限原则？",
        options: [
          "所有成员共享管理员账号",
          "仅授予完成当前任务所需的权限",
          "系统上线后不再调整权限",
          "默认开放全部数据"
        ],
        correct_answer: "B",
        explanation: "最小权限原则要求主体只拥有完成任务必需的权限。",
        score: 5,
        difficulty: "easy"
      },
      {
        title: "隐私保护",
        type: "short_answer",
        question: "请说明数据脱敏与数据加密的主要区别。",
        answer: "脱敏降低数据的可识别性，加密通过密钥控制明文恢复。",
        explanation: "两者可以组合使用，但解决的问题和可逆性不同。",
        score: 10,
        difficulty: "medium"
      }
    ]
  },
  document: {
    title: "课程知识结构",
    resourceType: "document",
    contentFormat: "json",
    content: JSON.stringify({
      title: "大数据安全课程知识结构",
      summary: "按章节整理学习目标、知识点和实践任务。",
      course: { name: "大数据导论", semester: "2026 春季", credits: 3 },
      chapters: [
        { chapter: "第一章", topic: "数据生命周期", objective: "识别各阶段风险" },
        { chapter: "第二章", topic: "访问控制", objective: "设计最小权限策略" },
        { chapter: "第三章", topic: "隐私计算", objective: "比较常见技术路径" }
      ],
      learning_objectives: [
        "理解数据采集、传输、存储和销毁阶段的风险",
        "能够为教学案例选择合适的保护措施",
        "说明技术控制与治理责任之间的关系"
      ]
    })
  }
};

const resource = computed(() => resources[mode.value]);
</script>

<template>
  <main class="preview-test">
    <header>
      <strong>结构化资源预览</strong>
      <nav>
        <button
          v-for="item in ['coding', 'exercise', 'document'] as const"
          :key="item"
          type="button"
          :class="{ 'is-active': mode === item }"
          @click="mode = item"
        >
          {{
            item === "coding"
              ? "编程练习"
              : item === "exercise"
                ? "练习题集"
                : "通用 JSON"
          }}
        </button>
      </nav>
    </header>
    <PlatformResourcePreviewPane :resource="resource" embedded />
  </main>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#platform-preview-test {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  font-family:
    Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
}

.preview-test {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: 54px minmax(0, 1fr);
  background: #f4f6f9;
}

.preview-test > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #dfe6ee;
}

.preview-test nav {
  display: inline-flex;
  gap: 5px;
}

.preview-test nav button {
  min-height: 32px;
  padding: 0 11px;
  color: #53677f;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d7e0e9;
  border-radius: 4px;
}

.preview-test nav button.is-active {
  color: #fff;
  background: #326caa;
  border-color: #326caa;
}
</style>

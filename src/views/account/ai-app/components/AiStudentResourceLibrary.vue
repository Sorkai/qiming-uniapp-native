<script setup lang="ts">
import StudentResourceWorkbench from "@/views/course/student-resource/index.vue";

defineOptions({ name: "AiStudentResourceLibrary" });

defineProps<{
  courseId?: number;
}>();
</script>

<template>
  <StudentResourceWorkbench :course-id="courseId" embedded />
</template>

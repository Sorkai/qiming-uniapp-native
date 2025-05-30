<template>
  <div class="course-detail-container">课程</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const courseId = ref(route.params.id);

onMounted(() => {
  console.log("课程ID:", courseId.value);
});
</script>

<style lang="scss" scoped>
.course-detail-container {
  min-height: 100vh;
  padding: 16px;
  background-color: #f0f2f5;
}
</style>

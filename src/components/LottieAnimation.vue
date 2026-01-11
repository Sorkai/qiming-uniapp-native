<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface Props {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  loop: true,
  autoplay: true,
  width: 200,
  height: 200
});

const containerRef = ref<HTMLDivElement>();
let animationInstance: any = null;

const loadLottie = async () => {
  try {
    // 动态加载 lottie-web
    const lottie = await import("lottie-web");
    
    if (containerRef.value) {
      if (animationInstance) {
        animationInstance.destroy();
      }
      
      animationInstance = lottie.default.loadAnimation({
        container: containerRef.value,
        renderer: "svg",
        loop: props.loop,
        autoplay: props.autoplay,
        animationData: props.animationData
      });
    }
  } catch (error) {
    console.error("Lottie 加载失败，请确保已安装 lottie-web:", error);
  }
};

onMounted(() => {
  loadLottie();
});

watch(() => props.animationData, () => {
  loadLottie();
});
</script>

<template>
  <div
    ref="containerRef"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
  ></div>
</template>

<style scoped>
div {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

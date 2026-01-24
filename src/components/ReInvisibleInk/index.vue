.
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: ""
  },
  active: {
    type: Boolean,
    default: true
  },
  radius: {
    type: Number,
    default: 20
  }
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;
let particles: Particle[] = [];
const mouse = { x: -1000, y: -1000 };

class Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  opacity: number;
  angle: number;
  velocity: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = x;
    this.baseY = y;
    this.density = Math.random() * 30 + 1;
    this.opacity = Math.random() * 0.8 + 0.2;
    this.angle = Math.random() * Math.PI * 2;
    this.velocity = Math.random() * 0.1 + 0.05;
    // 使用白色
    this.color = "#ffffff";
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    // 增加一点随机性，让粒子看起来更像流动的墨水
    const currentSize = this.size * (Math.sin(this.angle) * 0.2 + 1);

    ctx.beginPath();
    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // 增加光晕效果，使其更亮
    if (this.opacity > 0.6) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
    }
    ctx.restore();
  }

  update() {
    // 基础的随机晃动，模拟 iMessage 效果
    this.angle += this.velocity;
    this.x = this.baseX + Math.cos(this.angle) * 2;
    this.y = this.baseY + Math.sin(this.angle) * 2;

    // 闪烁效果
    this.opacity = Math.sin(this.angle) * 0.4 + 0.6;

    // 鼠标交互：擦除效果
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = props.radius;

    if (distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const directionX = dx / distance;
      const directionY = dy / distance;

      this.x -= directionX * force * 10;
      this.y -= directionY * force * 10;
      this.opacity = 0.1; // 几乎透明
    }
  }
}

const initParticles = () => {
  if (!canvasRef.value || !containerRef.value) return;
  const canvas = canvasRef.value;
  const container = containerRef.value;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  particles = [];
  // 降低粒子密度，使其更轻盈
  const numberOfParticles = (canvas.width * canvas.height) / 20;
  for (let i = 0; i < numberOfParticles; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
};

const animate = () => {
  if (!ctx || !canvasRef.value) return;
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  animationFrameId = requestAnimationFrame(animate);
};

const handleMouseMove = (e: MouseEvent) => {
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
};

const handleMouseLeave = () => {
  mouse.x = -1000;
  mouse.y = -1000;
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext("2d");
    initParticles();
    animate();
  }
  window.addEventListener("resize", initParticles);
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", initParticles);
});

watch(
  () => props.active,
  val => {
    if (val) {
      animate();
    } else {
      cancelAnimationFrame(animationFrameId);
    }
  }
);
</script>

<template>
  <div
    ref="containerRef"
    class="invisible-ink-container"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <canvas v-show="active" ref="canvasRef" class="ink-canvas" />
    <div class="content-slot" :class="{ 'is-active': active }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.invisible-ink-container {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

.ink-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.content-slot {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.content-slot.is-active {
  /* 当特效激活时，内容本身可以稍微模糊一点，配合 Canvas 效果更好 */

  /* filter: blur(1px); */
}
</style>

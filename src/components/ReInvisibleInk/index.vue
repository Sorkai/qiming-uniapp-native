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
let animationFrameId = 0;
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
    this.density = Math.random() * 30 + 1;
    this.opacity = Math.random() * 0.8 + 0.2;
    this.angle = Math.random() * Math.PI * 2;
    this.velocity = Math.random() * 0.1 + 0.05;
    this.color = "#ffffff";
  }

  draw() {
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    const currentSize = this.size * (Math.sin(this.angle) * 0.2 + 1);

    ctx.beginPath();
    ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    if (this.opacity > 0.6) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
    }

    ctx.restore();
  }

  update() {
    this.angle += this.velocity;
    this.x = this.baseX + Math.cos(this.angle) * 2;
    this.y = this.baseY + Math.sin(this.angle) * 2;
    this.opacity = Math.sin(this.angle) * 0.4 + 0.6;

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = props.radius;

    if (distance > 0 && distance < maxDistance) {
      const force = (maxDistance - distance) / maxDistance;
      const directionX = dx / distance;
      const directionY = dy / distance;

      this.x -= directionX * force * 10;
      this.y -= directionY * force * 10;
      this.opacity = 0.1;
    }
  }
}

const initParticles = () => {
  if (!canvasRef.value || !containerRef.value) return;

  const canvas = canvasRef.value;
  const rect = containerRef.value.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  particles = [];
  const numberOfParticles = (canvas.width * canvas.height) / 20;

  for (let i = 0; i < numberOfParticles; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particles.push(new Particle(x, y));
  }
};

const animate = () => {
  if (!ctx || !canvasRef.value) return;

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }

  animationFrameId = requestAnimationFrame(animate);
};

const stopAnimation = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
};

const handleMouseLeave = () => {
  mouse.x = -1000;
  mouse.y = -1000;
};

onMounted(() => {
  if (!canvasRef.value) return;

  ctx = canvasRef.value.getContext("2d");
  initParticles();

  if (props.active) {
    animate();
  }

  window.addEventListener("resize", initParticles);
});

onUnmounted(() => {
  stopAnimation();
  window.removeEventListener("resize", initParticles);
});

watch(
  () => props.active,
  active => {
    stopAnimation();
    if (active) {
      animate();
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
</style>

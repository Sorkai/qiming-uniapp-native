<template>
  <canvas ref="canvasRef" class="particles-canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;
let particles: Particle[] = [];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const colors = [
  "rgba(64, 158, 255, 0.6)",
  "rgba(103, 194, 58, 0.6)",
  "rgba(230, 162, 60, 0.6)",
  "rgba(144, 147, 153, 0.4)",
  "rgba(245, 108, 108, 0.5)"
];

function createParticle(canvas: HTMLCanvasElement): Particle {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    opacity: Math.random() * 0.5 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

function initParticles(canvas: HTMLCanvasElement) {
  particles = [];
  const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle(canvas));
  }
}

function animate() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });

  // 绘制粒子之间的连线
  particles.forEach((particle, i) => {
    particles.slice(i + 1).forEach(otherParticle => {
      const dx = particle.x - otherParticle.x;
      const dy = particle.y - otherParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(64, 158, 255, ${0.15 * (1 - distance / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(otherParticle.x, otherParticle.y);
        ctx.stroke();
      }
    });
  });

  animationId = requestAnimationFrame(animate);
}

function handleResize() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles(canvas);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  initParticles(canvas);
  animate();

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>

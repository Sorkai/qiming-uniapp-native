<script setup lang="ts">
import { computed } from "vue";

const hour = new Date().getHours();

// 根据时间段判断显示的内容
const timeType = computed(() => {
  if (hour < 6) return "midnight"; // 凌晨
  if (hour < 9) return "morning"; // 早上
  if (hour < 12) return "late-morning"; // 上午
  if (hour < 14) return "noon"; // 中午
  if (hour < 17) return "afternoon"; // 下午
  if (hour < 19) return "evening"; // 傍晚
  return "night"; // 晚上
});

const getTimeText = () => {
  switch (timeType.value) {
    case "midnight":
      return "凌晨";
    case "morning":
      return "早晨";
    case "late-morning":
      return "上午";
    case "noon":
      return "中午";
    case "afternoon":
      return "下午";
    case "evening":
      return "傍晚";
    case "night":
      return "夜晚";
    default:
      return "白天";
  }
};
</script>

<template>
  <div class="time-animation-container" :class="timeType">
    <!-- 太阳卡通 -->
    <svg v-if="['noon', 'afternoon', 'morning', 'late-morning'].includes(timeType)" 
         viewBox="0 0 200 200" width="120" height="120" class="sun-cartoon">
      <!-- 光线 -->
      <g class="sun-rays">
        <line x1="100" y1="20" x2="100" y2="0" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="170" y1="30" x2="185" y2="15" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="180" y1="100" x2="200" y2="100" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="170" y1="170" x2="185" y2="185" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="100" y1="180" x2="100" y2="200" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="30" y1="170" x2="15" y2="185" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="20" y1="100" x2="0" y2="100" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
        <line x1="30" y1="30" x2="15" y2="15" stroke="#FFD700" stroke-width="6" stroke-linecap="round" />
      </g>
      
      <!-- 太阳脸 -->
      <circle cx="100" cy="100" r="65" fill="#FFD700" />
      
      <!-- 左眼 -->
      <g class="left-eye">
        <circle cx="75" cy="80" r="10" fill="white" />
        <circle cx="77" cy="80" r="4" fill="#333" />
      </g>
      
      <!-- 右眼 -->
      <g class="right-eye">
        <circle cx="125" cy="80" r="10" fill="white" />
        <circle cx="127" cy="80" r="4" fill="#333" />
      </g>
      
      <!-- 微笑嘴 -->
      <path d="M 80 110 Q 100 125 120 110" stroke="#333" stroke-width="4" fill="none" stroke-linecap="round" />
      
      <!-- 腮红 -->
      <circle cx="55" cy="100" r="8" fill="#FFB6C1" opacity="0.6" />
      <circle cx="145" cy="100" r="8" fill="#FFB6C1" opacity="0.6" />
    </svg>

    <!-- 月亮卡通 -->
    <svg v-else viewBox="0 0 200 200" width="120" height="120" class="moon-cartoon">
      <!-- 月亮身体 -->
      <circle cx="100" cy="100" r="65" fill="#FFF8DC" class="moon-body" />
      
      <!-- 月亮脸 -->
      <g class="moon-face">
        <!-- 左眼 -->
        <circle cx="75" cy="85" r="10" fill="#333" class="left-eye" />
        <circle cx="77" cy="83" r="3" fill="white" />
        
        <!-- 右眼 -->
        <circle cx="125" cy="85" r="10" fill="#333" class="right-eye" />
        <circle cx="127" cy="83" r="3" fill="white" />
      </g>
      
      <!-- 嘴巴（惺忪表情） -->
      <path d="M 85 115 Q 100 120 115 115" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round" />
      
      <!-- 腮红 -->
      <circle cx="50" cy="110" r="10" fill="#FFB6C1" opacity="0.5" class="blush-left" />
      <circle cx="150" cy="110" r="10" fill="#FFB6C1" opacity="0.5" class="blush-right" />
      
      <!-- 星星装饰 -->
      <g class="stars">
        <path d="M 40 50 L 45 60 L 55 65 L 45 70 L 40 80 L 35 70 L 25 65 L 35 60 Z" fill="#FFD700" class="star-1" />
        <path d="M 160 40 L 163 48 L 171 50 L 163 52 L 160 60 L 157 52 L 149 50 L 157 48 Z" fill="#FFD700" class="star-2" />
        <path d="M 150 150 L 152 156 L 158 158 L 152 160 L 150 166 L 148 160 L 142 158 L 148 156 Z" fill="#FFD700" class="star-3" />
      </g>
    </svg>

    <div class="time-label">{{ getTimeText() }}</div>
  </div>
</template>

<style scoped>
.time-animation-container {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 太阳动画 */
.sun-cartoon {
  animation: sun-bounce 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  filter: drop-shadow(0 10px 20px rgba(255, 215, 0, 0.3));

  .sun-rays {
    animation: sun-rotate 8s linear infinite;
  }

  .left-eye .pupil {
    animation: pupil-look-right 3s ease-in-out infinite;
  }

  .right-eye .pupil {
    animation: pupil-look-left 3s ease-in-out infinite;
  }
}

/* 月亮动画 */
.moon-cartoon {
  animation: moon-stretch 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  filter: drop-shadow(0 8px 20px rgba(100, 149, 237, 0.3));

  .moon-body {
    animation: moon-body-stretch 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  }

  .moon-face {
    animation: moon-face-stretch 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  }

  .left-eye {
    animation: lazy-left-eye 4s ease-in-out infinite;
  }

  .right-eye {
    animation: lazy-right-eye 4s ease-in-out infinite;
  }

  .blush-left {
    animation: blush-pulse-left 3s ease-in-out infinite;
  }

  .blush-right {
    animation: blush-pulse-right 3s ease-in-out infinite;
  }

  .stars {
    animation: stars-twinkle 3s ease-in-out infinite;
  }
}

.time-label {
  font-size: 13px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
  animation: label-pulse 2s ease-in-out infinite;
}

/* 太阳动画关键帧 */
@keyframes sun-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.05);
  }
}

@keyframes sun-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pupil-look-right {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(2px);
  }
}

@keyframes pupil-look-left {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-2px);
  }
}

/* 月亮动画关键帧 */
@keyframes moon-stretch {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scaleX(0.95) scaleY(1.1) translateY(-8px);
  }
  50% {
    transform: scaleX(0.9) scaleY(1.15) translateY(0);
  }
  75% {
    transform: scaleX(0.95) scaleY(1.1) translateY(-8px);
  }
}

@keyframes moon-body-stretch {
  0%,
  100% {
    cy: 100;
    r: 65;
  }
  25% {
    cy: 95;
    r: 66;
  }
  50% {
    cy: 100;
    r: 65;
  }
  75% {
    cy: 95;
    r: 66;
  }
}

@keyframes moon-face-stretch {
  0%,
  100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-8px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(-8px);
  }
}

@keyframes lazy-left-eye {
  0%,
  100% {
    transform: scaleY(1);
  }
  40%,
  60% {
    transform: scaleY(0.1);
  }
}

@keyframes lazy-right-eye {
  0%,
  100% {
    transform: scaleY(1);
  }
  40%,
  60% {
    transform: scaleY(0.1);
  }
}

@keyframes blush-pulse-left {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes blush-pulse-right {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes stars-twinkle {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

@keyframes label-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}
</style>

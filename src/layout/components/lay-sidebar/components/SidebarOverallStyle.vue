<script setup lang="ts">
import { useGlobal } from "@pureadmin/utils";
import { computed, ref, nextTick } from "vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

const { $storage } = useGlobal<GlobalPropertiesApi>();
const { dataTheme, dataThemeChange } = useDataThemeChange();
const overallStyle = computed(() => $storage?.layout?.overallStyle);

const isAnimating = ref(false);

function toggleTheme() {
  if (overallStyle.value === "light") {
    dataTheme.value = true;
    dataThemeChange("dark");
  } else {
    dataTheme.value = false;
    dataThemeChange("light");
  }
}

/**
 * 核心切换逻辑：
 * 强制使用 Clip-path 方案，确保在所有浏览器中都能看到从点击处扩散的效果。
 */
const onToggle = async (event: MouseEvent) => {
  if (isAnimating.value) return;

  const x = event.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  );

  isAnimating.value = true;

  // 设置 CSS 变量供动画使用
  document.documentElement.style.setProperty("--pure-x", `${x}px`);
  document.documentElement.style.setProperty("--pure-y", `${y}px`);
  document.documentElement.style.setProperty("--pure-r", `${endRadius}px`);

  // @ts-ignore
  if (document.startViewTransition) {
    // Chrome/Edge 支持 View Transitions API
    // @ts-ignore
    const transition = document.startViewTransition(async () => {
      toggleTheme();
      await nextTick();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
      isAnimating.value = false;
    });
  } else {
    // Firefox/Safari 降级方案：创建一个全屏遮罩层进行扩散
    const overlay = document.createElement("div");
    const isDark = overallStyle.value === "light";
    overlay.className = "pure-theme-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999999;
      pointer-events: none;
      background: ${isDark ? "#121212" : "#ffffff"};
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(overlay);

    // 强制重绘
    overlay.offsetWidth;

    // 开始扩散
    overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;

    setTimeout(async () => {
      toggleTheme();
      await nextTick();
      
      // 渐隐遮罩层
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 400ms ease, clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1)";
      
      setTimeout(() => {
        overlay.remove();
        isAnimating.value = false;
      }, 400);
    }, 500);
  }
};
</script>

<template>
  <div class="theme-toggle-wrapper">
    <div
      class="theme-toggle-btn"
      :class="overallStyle"
      :title="overallStyle === 'light' ? '切换到深色模式' : '切换到浅色模式'"
      @click="onToggle"
    >
      <div class="sun-moon-container">
        <div class="sun-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13L2,13z M20,13l2,0 c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13L20,13z M11,2l0,2c0,0.55,0.45,1,1,1s1-0.45,1-1l0-2 c0-0.55-0.45-1-1-1S11,1.45,11,2L11,2z M11,20l0,2c0,0.55,0.45,1,1,1s1-0.45,1-1l0-2c0-0.55-0.45-1-1-1S11,19.45,11,20L11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41 L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M5.99,19.42l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41c0.39,0.39,1.03,0.39,1.41,0 l1.06-1.06c0.39-0.39,0.39-1.03,0-1.41C7.02,19.03,6.38,19.03,5.99,19.42L5.99,19.42z M18.36,7.05l1.06-1.06 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 C17.33,7.44,17.97,7.44,18.36,7.05L18.36,7.05z"
            />
          </svg>
        </div>
        <div class="moon-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.1,22c-4.8,0-9-3.7-9.8-8.5c-0.9-5.4,2.8-10.4,8.2-11.3c0.7-0.1,1.3-0.1,2,0c0.5,0.1,0.8,0.6,0.6,1.1 c-0.1,0.4-0.5,0.6-0.9,0.6c-0.4,0-0.8,0-1.2,0.1c-3.9,0.7-6.6,4.4-5.9,8.3c0.7,3.9,4.4,6.6,8.3,5.9c1.3-0.2,2.5-0.8,3.5-1.7 c0.3-0.3,0.8-0.3,1.1,0c0.3,0.3,0.4,0.8,0.1,1.1c-1.7,1.9-4.1,3.1-6.7,3.3C12.8,22,12.4,22,12.1,22z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.theme-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: scale(1.1);
  }

  &.dark {
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .sun-icon {
      opacity: 0;
      transform: scale(0.5) rotate(-45deg);
    }

    .moon-icon {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
  }

  .sun-moon-container {
    position: relative;
    width: 20px;
    height: 20px;
  }

  .sun-icon,
  .moon-icon {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sun-icon {
    color: #ffb900;
    opacity: 1;
    transform: scale(1) rotate(0);
  }

  .moon-icon {
    color: #f6c138;
    opacity: 0;
    transform: scale(0.5) rotate(45deg);
  }
}
</style>

<style lang="scss">
/* 核心扩散动画样式 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 确保新视图在顶层 */
::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 9999999;
}

/* 强制深色模式切换时的层级关系 */
.dark::view-transition-old(root) {
  z-index: 9999999;
}

.dark::view-transition-new(root) {
  z-index: 1;
}

/* 修正：当从深色切回浅色时，让旧视图（深色）收缩 */
.dark::view-transition-old(root) {
  animation: 600ms cubic-bezier(0.4, 0, 0.2, 1) both circle-shrink;
}

@keyframes circle-shrink {
  from {
    clip-path: circle(var(--pure-r) at var(--pure-x) var(--pure-y));
  }
  to {
    clip-path: circle(0px at var(--pure-x) var(--pure-y));
  }
}

/* 页面平滑过渡 */
html {
  transition: background-color 0.3s ease;
}

.pure-theme-overlay {
  will-change: clip-path, opacity;
}
</style>

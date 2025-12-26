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
 * 通用圆形扩散方案：
 * 不依赖实验性 API，通过动态插入全屏遮罩层并利用 clip-path 动画实现。
 * 确保在所有现代浏览器（Chrome, Firefox, Safari）中均有完美表现。
 */
const onToggle = async (event: MouseEvent) => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // 1. 创建扩散层
  const overlay = document.createElement("div");
  const isToDark = overallStyle.value === "light";
  
  // 扩散层样式：绝对置顶，初始半径为0
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    pointer-events: none;
    background: ${isToDark ? "#121212" : "#ffffff"};
    clip-path: circle(0px at ${x}px ${y}px);
    transition: clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1);
  `;
  document.body.appendChild(overlay);

  // 2. 触发扩散动画
  requestAnimationFrame(() => {
    overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
  });

  // 3. 在扩散到一半或完成时切换真实主题
  setTimeout(async () => {
    toggleTheme();
    await nextTick();

    // 4. 主题切换后，让遮罩层淡出
    overlay.style.transition = "opacity 500ms ease, clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1)";
    overlay.style.opacity = "0";

    setTimeout(() => {
      overlay.remove();
      isAnimating.value = false;
    }, 500);
  }, 500);
};
</script>

<template>
  <div class="theme-toggle-container">
    <div
      class="theme-btn-premium"
      :class="{ 'is-dark': overallStyle === 'dark' }"
      @click="onToggle"
    >
      <div class="sun-moon-wrapper">
        <div class="icon sun">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </div>
        <div class="icon moon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </div>
      </div>
      <div class="switch-dot"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.theme-toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.theme-btn-premium {
  position: relative;
  width: 52px;
  height: 28px;
  padding: 4px;
  cursor: pointer;
  background-color: #e2e8f0;
  border-radius: 100px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    background-color: #cbd5e0;
  }

  &.is-dark {
    background-color: #2d3748;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

    .switch-dot {
      transform: translateX(24px);
      background-color: #1a202c;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    .sun {
      transform: translateY(20px) scale(0);
      opacity: 0;
    }

    .moon {
      transform: translateY(0) scale(1);
      opacity: 1;
      color: #f6e05e;
    }
  }

  .sun-moon-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .icon {
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .sun {
    left: 0;
    color: #f6ad55;
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .moon {
    right: 0;
    color: #718096;
    transform: translateY(-20px) scale(0);
    opacity: 0;
  }

  .switch-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 50%;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}
</style>

<style lang="scss">
/* 强制关闭所有默认的主题切换过渡，由我们的扩散层接管 */
html {
  transition: none;
}

/* 确保扩散动画在最顶层 */
.pure-theme-overlay {
  will-change: clip-path;
}
</style>

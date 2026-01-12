<script setup lang="ts">
import { ref, computed } from "vue";
import { getToken } from "@/utils/auth";
import AiHubIcon from "@/assets/new-release/ai-hub-svgrepo-com.svg?component";

defineOptions({
  name: "AiFloatButton"
});

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

// 检查用户是否已登录
const isLoggedIn = computed(() => {
  const token = getToken();
  return !!token?.accessToken;
});

// 按钮位置
const position = ref({
  right: 30,
  bottom: 100
});

// 是否正在拖拽
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// 处理点击
const handleClick = () => {
  if (props.disabled || isDragging.value) return;
  emit("click");
};

// 拖拽功能
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = false;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY
  };
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - dragStart.value.x;
    const deltaY = moveEvent.clientY - dragStart.value.y;
    
    // 如果移动距离超过5px，认为是拖拽
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDragging.value = true;
    }
    
    if (isDragging.value) {
      position.value.right -= deltaX;
      position.value.bottom -= deltaY;
      
      // 限制范围
      position.value.right = Math.max(10, Math.min(window.innerWidth - 70, position.value.right));
      position.value.bottom = Math.max(10, Math.min(window.innerHeight - 70, position.value.bottom));
      
      dragStart.value = {
        x: moveEvent.clientX,
        y: moveEvent.clientY
      };
    }
  };
  
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    
    // 延迟重置拖拽状态，防止触发点击
    setTimeout(() => {
      isDragging.value = false;
    }, 100);
  };
  
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

// 按钮样式
const buttonStyle = computed(() => ({
  right: `${position.value.right}px`,
  bottom: `${position.value.bottom}px`
}));

// 获取按钮中心位置（用于涟漪效果）
const getButtonCenter = () => {
  const x = window.innerWidth - position.value.right - 28; // 28 = 按钮宽度的一半
  const y = window.innerHeight - position.value.bottom - 28;
  return { x, y };
};

// 暴露方法给父组件
defineExpose({
  getButtonCenter,
  position
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isLoggedIn"
      class="ai-float-button"
      :class="{ disabled: disabled, dragging: isDragging }"
      :style="buttonStyle"
      @mousedown="handleMouseDown"
      @click="handleClick"
    >
      <el-tooltip
        content="AI识屏助手"
        placement="left"
        :disabled="isDragging"
      >
        <div class="button-inner">
          <AiHubIcon class="ai-icon" />
        </div>
      </el-tooltip>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.ai-float-button {
  position: fixed;
  z-index: 2000;
  width: 56px;
  height: 56px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease;

  &:hover:not(.disabled):not(.dragging) {
    transform: scale(1.1);
  }

  &:active:not(.disabled) {
    transform: scale(0.95);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.dragging {
    cursor: grabbing;
  }

  .button-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #e2e8f0;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(148, 163, 184, 0.3);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 20px rgba(148, 163, 184, 0.5);
    }

    html.dark & {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

      &:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
      }
    }
  }

  .ai-icon {
    width: 28px;
    height: 28px;
    color: #64748b;

    html.dark & {
      color: #e2e8f0;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

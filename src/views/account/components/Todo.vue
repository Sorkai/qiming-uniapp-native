<template>
  <div class="todo-container" :class="currentTheme">
    <div class="todo-header card">
      <div class="header-left">
        <h3>待办事项</h3>
        <p>共 {{ totalTodos }} 项，已完成 {{ completedTodos }} 项</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openAddDialog" round
          >添加待办</el-button
        >
      </div>
    </div>

    <div class="todo-controls card">
      <el-radio-group v-model="filterStatus" size="large">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="pending">待处理</el-radio-button>
        <el-radio-button value="completed">已完成</el-radio-button>
      </el-radio-group>
    </div>

    <transition-group name="todo-list" tag="div" class="todo-list">
      <div
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item card"
        :class="{ completed: todo.completed }"
      >
        <div class="item-content">
          <div class="item-header">
            <span class="item-title">{{ todo.title }}</span>
            <el-tag :type="todo.completed ? 'success' : 'warning'" size="small">
              {{ todo.completed ? "已完成" : "待处理" }}
            </el-tag>
          </div>
          <p class="item-details">{{ todo.details }}</p>
          <div class="item-footer">
            <span class="item-publisher">
              <el-icon><User /></el-icon> {{ todo.publisher }}
            </span>
            <span class="item-time">
              <el-icon><Clock /></el-icon> {{ todo.time }}
            </span>
          </div>
        </div>
        <div class="item-actions">
          <el-tooltip
            :content="todo.completed ? '标记为未完成' : '标记为已完成'"
            placement="top"
          >
            <el-button
              :type="todo.completed ? 'warning' : 'success'"
              :icon="todo.completed ? Refresh : Check"
              @click="toggleStatus(todo)"
              circle
            />
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button
              type="primary"
              :icon="Edit"
              @click="openEditDialog(todo)"
              circle
            />
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              type="danger"
              :icon="Delete"
              @click="deleteTodo(todo)"
              circle
            />
          </el-tooltip>
        </div>
      </div>
    </transition-group>

    <el-empty
      v-if="filteredTodos.length === 0"
      description="暂无待办事项"
      class="card"
    />

    <!-- 添加/编辑待办对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑待办' : '添加待办'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="关系人" prop="publisher" required>
          <el-input v-model="form.publisher" placeholder="请输入关系人" />
        </el-form-item>
        <el-form-item label="详细信息" prop="details">
          <el-input
            type="textarea"
            v-model="form.details"
            placeholder="请输入详细信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Check,
  Refresh,
  User,
  Clock
} from "@element-plus/icons-vue";

defineProps<{
  currentTheme?: string;
}>();

interface TodoItem {
  id: number;
  title: string;
  publisher: string;
  details: string;
  time: string;
  completed: boolean;
}

const loading = ref(true);
const todos = ref<TodoItem[]>([]);
const dialogVisible = ref(false);
const isEditMode = ref(false);
const formRef = ref(null);
const filterStatus = ref("all"); // all, pending, completed

const initialFormState = {
  id: 0,
  title: "",
  publisher: "",
  details: "",
  time: "",
  completed: false
};
const form = ref<TodoItem>({ ...initialFormState });

const TODO_STORAGE_KEY = "vue-pure-admin-todos";

const initialTodos: TodoItem[] = [
  {
    id: 1,
    title: "完成高等数学作业",
    publisher: "王小明",
    details: "完成第5章习题并上传至学习平台。",
    time: "2025-07-15 10:00:00",
    completed: false
  },
  {
    id: 2,
    title: "准备英语口语考试",
    publisher: "李晓红",
    details: "整理考试重点，练习自我介绍和常见问答。",
    time: "2025-07-20 14:30:00",
    completed: false
  },
  {
    id: 3,
    title: "小组项目讨论",
    publisher: "张伟",
    details: "与小组成员线上讨论数据库课程设计方案。",
    time: "2025-07-12 18:00:00",
    completed: true
  }
];

// 过滤后的待办事项
const filteredTodos = computed(() => {
  if (filterStatus.value === "pending") {
    return todos.value.filter(todo => !todo.completed);
  }
  if (filterStatus.value === "completed") {
    return todos.value.filter(todo => todo.completed);
  }
  return todos.value;
});

// 统计信息
const totalTodos = computed(() => todos.value.length);
const completedTodos = computed(
  () => todos.value.filter(todo => todo.completed).length
);

// 从localStorage加载数据
const loadTodos = () => {
  loading.value = true;
  setTimeout(() => {
    const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
    if (storedTodos) {
      todos.value = JSON.parse(storedTodos);
    } else {
      // 如果没有存储数据，则使用初始数据
      todos.value = initialTodos;
      saveTodos();
    }
    loading.value = false;
  }, 500); // 模拟加载效果
};

// 保存数据到localStorage
const saveTodos = () => {
  localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos.value));
};

onMounted(() => {
  loadTodos();
});

// 打开添加对话框
const openAddDialog = () => {
  isEditMode.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 打开编辑对话框
const openEditDialog = (row: TodoItem) => {
  isEditMode.value = true;
  form.value = { ...row };
  dialogVisible.value = true;
};

// 重置表单
const resetForm = () => {
  form.value = { ...initialFormState };
  if (formRef.value) {
    (formRef.value as any).resetFields();
  }
};

// 提交表单
const handleSubmit = () => {
  if (!form.value.title || !form.value.publisher) {
    ElMessage.error("标题和发布者不能为空");
    return;
  }

  if (isEditMode.value) {
    // 编辑模式
    const index = todos.value.findIndex(t => t.id === form.value.id);
    if (index !== -1) {
      todos.value[index] = { ...form.value };
      ElMessage.success("修改成功");
    }
  } else {
    // 添加模式
    const newTodo: TodoItem = {
      ...form.value,
      id: Date.now(),
      time: new Date().toLocaleString(),
      completed: false
    };
    todos.value.unshift(newTodo);
    ElMessage.success("添加成功");
  }

  saveTodos();
  dialogVisible.value = false;
};

// 删除待办
const deleteTodo = (row: TodoItem) => {
  ElMessageBox.confirm(`确定要删除 "${row.title}" 吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = todos.value.findIndex(t => t.id === row.id);
      if (index !== -1) {
        todos.value.splice(index, 1);
        saveTodos();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      // 用户取消
    });
};

// 切换完成状态
const toggleStatus = (row: TodoItem) => {
  const index = todos.value.findIndex(t => t.id === row.id);
  if (index !== -1) {
    todos.value[index].completed = !todos.value[index].completed;
    saveTodos();
    ElMessage.success("状态更新成功");
  }
};
</script>

<style lang="scss" scoped>
.todo-container {
  .card {
    padding: 24px;
    margin-bottom: 24px;
    background-color: #fff;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 6%);
    transition: all 0.3s ease;
  }

  &.dark .card {
    background-color: #1e293b;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .todo-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      h3 {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 600;
        color: #333;
      }
      p {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  &.dark .todo-header {
    .header-left {
      h3 {
        color: #f1f5f9;
      }
      p {
        color: #94a3b8;
      }
    }
  }

  .todo-controls {
    display: flex;
    justify-content: flex-end;
  }

  &.dark .todo-controls {
    :deep(.el-radio-group) {
      .el-radio-button__inner {
        background-color: #0f172a;
        border-color: #334155;
        color: #94a3b8;
      }
      
      .el-radio-button__orig-radio:checked + .el-radio-button__inner {
        background-color: #3b82f6;
        border-color: #3b82f6;
        color: #fff;
      }
    }
  }

  .todo-list {
    position: relative;
    padding: 0;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    opacity: 1;
    transition:
      transform 0.4s ease,
      opacity 0.4s ease,
      background-color 0.3s;

    &:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 0 8px 25px rgb(0 0 0 / 10%);
    }

    &.completed {
      background-color: #f7f8fc;

      .item-title {
        text-decoration: line-through;
        color: #909399;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        transition: color 0.3s;
      }
    }

    .item-details {
      margin: 0 0 12px;
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }

    .item-footer {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: #909399;

      span {
        display: flex;
        align-items: center;
        .el-icon {
          margin-right: 6px;
        }
      }
    }

    .item-actions {
      display: flex;
      gap: 10px;
    }
  }

  // 深色模式样式
  &.dark {
    .todo-item {
      &:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
      }

      &.completed {
        background-color: #0f172a;

        .item-title {
          color: #64748b;
        }
      }

      .item-header .item-title {
        color: #f1f5f9;
      }

      .item-details {
        color: #cbd5e1;
      }

      .item-footer {
        color: #64748b;
      }
    }
  }
}

// Transition-group animations
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}
.todo-list-leave-active {
  position: absolute;
  width: calc(100% - 48px);
}
</style>

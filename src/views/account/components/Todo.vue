<template>
  <div class="todo-container card">
    <div class="todo-header">
      <h3>待办事项</h3>
      <el-button type="primary" :icon="Plus" @click="openAddDialog"
        >添加待办</el-button
      >
    </div>

    <el-table :data="todos" style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="publisher" label="发布者" width="120" />
      <el-table-column prop="details" label="详细信息" show-overflow-tooltip />
      <el-table-column prop="time" label="时间" width="180" />
      <el-table-column prop="completed" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.completed ? 'success' : 'warning'">
            {{ row.completed ? "已完成" : "待处理" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button
            size="small"
            type="success"
            :icon="Check"
            @click="toggleStatus(row)"
            v-if="!row.completed"
          >
            完成
          </el-button>
          <el-button
            size="small"
            type="warning"
            :icon="Refresh"
            @click="toggleStatus(row)"
            v-else
          >
            重置
          </el-button>
          <el-button
            size="small"
            type="primary"
            :icon="Edit"
            @click="openEditDialog(row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            @click="deleteTodo(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

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
        <el-form-item label="发布者" prop="publisher" required>
          <el-input v-model="form.publisher" placeholder="请输入发布者" />
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
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Edit,
  Delete,
  Check,
  Refresh
} from "@element-plus/icons-vue";

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

// 初始硬编码数据
const initialTodos: TodoItem[] = [
  {
    id: 1,
    title: "完成项目报告",
    publisher: "张三",
    details: "需要完成Q3季度的项目总结报告，并提交给部门主管。",
    time: "2025-08-15 10:00:00",
    completed: false
  },
  {
    id: 2,
    title: "准备技术分享会",
    publisher: "李四",
    details: "准备关于Vue 3 Composition API的技术分享，制作PPT。",
    time: "2025-08-20 14:30:00",
    completed: false
  },
  {
    id: 3,
    title: "修复Bug #1024",
    publisher: "王五",
    details: "修复用户反馈的登录页面样式错乱问题。",
    time: "2025-08-12 18:00:00",
    completed: true
  }
];

// 从localStorage加载数据
const loadTodos = () => {
  loading.value = true;
  const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
  if (storedTodos) {
    todos.value = JSON.parse(storedTodos);
  } else {
    // 如果没有存储数据，则使用初始数据
    todos.value = initialTodos;
    saveTodos();
  }
  loading.value = false;
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
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 6%);
}

.todo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}
</style>

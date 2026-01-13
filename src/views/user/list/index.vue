<template>
  <div class="main">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <!-- <el-form-item label="手机号">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <!-- <el-button @click="resetSearch">重置</el-button> -->
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="userList" stripe style="width: 100%">
        <el-table-column prop="id" label="用户ID" width="100" sortable />
        <el-table-column prop="mobile" label="手机号" width="180" sortable />
        <el-table-column prop="nickname" label="昵称" width="180" sortable />
        <el-table-column prop="sex" label="性别" width="100" sortable>
          <template #default="scope">
            {{
              scope.row.sex === 1 ? "男" : scope.row.sex === 2 ? "女" : "未知"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="avatar" label="头像" width="100">
          <template #default="scope">
            <el-avatar :src="formatAvatar(scope.row.avatar)" />
          </template>
        </el-table-column>
        <el-table-column prop="info" label="个性签名" />
        <el-table-column prop="roleType" label="角色类型" width="120" sortable>
          <template #default="scope">
            {{ getRoleTypeName(scope.row.roleType) }}
          </template>
        </el-table-column>
        <el-table-column v-if="isAdminUser" label="操作" width="180">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small"
              @click="handleEditRole(scope.row)"
            >
              修改角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 修改角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="修改用户角色"
      width="30%"
      :close-on-click-modal="false"
      align-center
    >
      <el-form ref="roleFormRef" :model="roleForm" label-width="100px">
        <el-form-item label="当前用户">
          {{ roleForm.nickname || roleForm.mobile }}
        </el-form-item>
        <el-form-item label="当前角色">
          {{ getRoleTypeName(roleForm.currentRoleType) }}
        </el-form-item>
        <el-form-item label="新角色" prop="roleType">
          <el-select v-model="roleForm.roleType" placeholder="请选择新角色">
            <el-option label="学生" :value="1" />
            <el-option label="教师" :value="2" />
            <el-option label="管理员" :value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="roleUpdateLoading" @click="submitRoleChange">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from "vue";
import { formatAvatar } from "@/utils/avatar";
import { getUserList, updateUserRole } from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";
import { isAdmin } from "@/utils/auth";

// 数据定义
const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

const searchForm = reactive({ mobile: "" });

// 判断当前用户是否是管理员
const isAdminUser = computed(() => isAdmin());

// 修改角色对话框
const roleDialogVisible = ref(false);
const roleUpdateLoading = ref(false);
const roleForm = reactive({
  id: 0,
  nickname: "",
  mobile: "",
  currentRoleType: 0,
  roleType: 0
});

// 获取角色类型名称
const getRoleTypeName = (roleType: number) => {
  switch (roleType) {
    case 1:
      return "学生";
    case 2:
      return "教师";
    case 3:
      return "管理员";
    default:
      return "未知";
  }
};

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUserList();
};

// 搜索操作
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置回第一页
  fetchUserList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.mobile = "";
  currentPage.value = 1; // 重置时也回到第一页
  fetchUserList();
};

// 打开修改角色对话框
const handleEditRole = (user) => {
  if (!isAdminUser.value) {
    ElMessage.warning("只有管理员可以修改用户角色");
    return;
  }

  roleForm.id = user.id;
  roleForm.nickname = user.nickname;
  roleForm.mobile = user.mobile;
  roleForm.currentRoleType = user.roleType;
  roleForm.roleType = user.roleType; // 默认选中当前角色

  roleDialogVisible.value = true;
};

// 提交角色修改
const submitRoleChange = async () => {
  if (roleForm.roleType === roleForm.currentRoleType) {
    ElMessage.info("角色未变更，无需修改");
    return;
  }

  // 二次确认
  try {
    await ElMessageBox.confirm(
      `确认将用户 ${roleForm.nickname || roleForm.mobile} 的角色从 ${getRoleTypeName(
        roleForm.currentRoleType
      )} 修改为 ${getRoleTypeName(roleForm.roleType)} 吗？`,
      "确认修改",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
  } catch (e) {
    return; // 用户取消操作
  }

  roleUpdateLoading.value = true;
  try {
    const res = await updateUserRole({
      targetUserId: roleForm.id,
      roleType: roleForm.roleType
    });

    if (res && res.code === 200) {
      ElMessage.success("角色修改成功");
      roleDialogVisible.value = false;
      fetchUserList(); // 刷新列表
    } else {
      ElMessage.error(res?.msg || "角色修改失败");
    }
  } catch (error) {
    console.error("修改用户角色失败:", error);
    ElMessage.error("修改用户角色失败，请稍后重试");
  } finally {
    roleUpdateLoading.value = false;
  }
};

// 获取用户列表数据
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      mobile: searchForm.mobile // 将userName改为mobile，以匹配API定义
    });

    // 正确处理嵌套在data中的userList和total
    if (res && res.data) {
      userList.value = res.data.userList || [];
      total.value = res.data.total || 0;
    } else {
      userList.value = [];
      total.value = 0;
      ElMessage.warning("未获取到用户数据");
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  fetchUserList();
});
</script>

<style lang="scss" scoped>
.main {
  margin: 10px;
}

.box-card {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>

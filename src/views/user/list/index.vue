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
        <el-table-column prop="id" label="用户ID" width="100" />
        <el-table-column prop="mobile" label="手机号" width="180" />
        <el-table-column prop="nickname" label="昵称" width="180" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="scope">
            {{
              scope.row.sex === 1 ? "男" : scope.row.sex === 2 ? "女" : "未知"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="avatar" label="头像" width="100">
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" />
            <el-avatar v-else icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column prop="info" label="个性签名" />
        <el-table-column prop="roleType" label="角色类型" width="100">
          <template #default="scope">
            {{ getRoleTypeName(scope.row.roleType) }}
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from "vue";
import { getUserList } from "@/api/user";
import { ElMessage } from "element-plus";

// 数据定义
const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

const searchForm = reactive({ mobile: "" });

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

.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <div class="ai-animation-page">
    <el-card class="toolbar-card">
      <template #header>
        <div class="toolbar">
          <div class="selectors">
            <el-select
              v-model="selectedCourseId"
              filterable
              remote
              clearable
              placeholder="选择课程"
              :remote-method="searchCourses"
              :loading="courseLoading"
              style="width:260px"
              @change="handleCourseChange"
            >
              <el-option
                v-for="c in courseOptions"
                :key="c.courseId"
                :label="c.title"
                :value="c.courseId"
              />
            </el-select>
            <el-select
              v-model="selectedChapterId"
              :disabled="!selectedCourseId"
              placeholder="选择章节"
              clearable
              filterable
              style="width:220px;margin-left:12px"
              @change="handleChapterChange"
            >
              <el-option
                v-for="ch in chapterOptions"
                :key="ch.chapterId"
                :label="ch.name"
                :value="ch.chapterId"
              />
            </el-select>
          </div>
          <div class="actions">
            <el-button type="primary" :disabled="!canGenerate" :loading="generateLoading" @click="onGenerate">生成动画</el-button>
            <el-button :disabled="!selectedChapterId" @click="refreshList">刷新</el-button>
            <el-button type="warning" :disabled="!latestCompletedVersion" @click="setDisplayLatest">设展示=最新</el-button>
            <el-button type="success" :loading="syncLoading" @click="onForceSync">强制同步</el-button>
            <el-button v-if="polling" type="danger" @click="stopPolling">停止轮询</el-button>
          </div>
        </div>
        <div v-if="displayVersionResolved" class="display-info">
          展示版本: <el-tag size="small" type="success">{{ displayVersionResolved }}<span v-if="displayVersionRaw==='latest'"> (latest)</span></el-tag>
          <span class="divider" />
          <span v-if="latestSuccessTime">最近成功: {{ latestSuccessTime }}</span>
          <span class="divider" />
          <span>统计: 成功 {{ stats.completed }} / 进行中 {{ stats.processing }} / 失败 {{ stats.failed }}</span>
          <span v-if="polling" class="polling-indicator">
            <el-icon class="is-loading" style="margin-left:6px"><loading /></el-icon>轮询中...
          </span>
        </div>
      </template>

      <div v-if="!selectedChapterId" class="empty-block">
        <el-empty description="请选择课程与章节以查看动画任务" />
      </div>
      <div v-else>
        <div class="filter-row">
          <el-radio-group v-model="statusFilter" size="small" @change="applyFilter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="completed">成功</el-radio-button>
            <el-radio-button label="processing">进行中</el-radio-button>
            <el-radio-button label="failed">失败</el-radio-button>
          </el-radio-group>
          <el-input v-model="keyword" placeholder="搜索文件名" clearable size="small" style="width:220px" @input="applyFilter" />
        </div>
        <el-table :data="filteredTasks" v-loading="listLoading" size="small" style="width:100%" :row-class-name="rowClassName">
          <el-table-column prop="version" label="版本" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.status==='completed'" type="success" size="small">v{{ row.version }}</el-tag>
              <el-tag v-else size="small" type="info">--</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="110">
            <template #default="{ row }">
              <el-tag v-if="row.status==='completed'" type="success" size="small">完成</el-tag>
              <el-tag v-else-if="row.status==='processing'" type="warning" size="small">进行中</el-tag>
              <el-tag v-else-if="row.status==='failed'" type="danger" size="small">失败</el-tag>
              <el-tag v-else size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
          <el-table-column prop="fileSize" label="大小" width="100">
            <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" />
          <el-table-column prop="completedAt" label="完成时间" width="170">
            <template #default="{ row }">{{ row.completedAt || '-' }}</template>
          </el-table-column>
          <el-table-column label="展示" width="90">
            <template #default="{ row }">
              <el-tag v-if="isDisplayVersion(row)" type="success" size="small">展示</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="错误" min-width="160">
            <template #default="{ row }">
              <span v-if="row.status==='failed' && row.errorMessage" class="error-text" v-title="row.errorMessage">{{ truncate(row.errorMessage,32) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" :disabled="row.status!=='completed'" @click="openPreview(row)">预览</el-button>
              <el-button size="small" :disabled="row.status!=='completed' || isDisplayVersion(row)" @click="setDisplay(row)">设为展示</el-button>
              <el-button size="small" :disabled="row.status!=='completed'" @click="copyUrl(row)">复制URL</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog v-model="previewVisible" title="动画预览" width="80%" top="5vh">
      <div v-if="previewUrl" class="preview-wrapper">
        <iframe :src="previewUrl" frameborder="0" class="preview-iframe" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openInNewWindow" :disabled="!previewUrl">新窗口打开</el-button>
          <el-button type="primary" @click="previewVisible=false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getCourseList, getCourseHoursList } from '@/api/course';
import { generateHtmlAnimation, getHtmlAnimationList, setHtmlAnimationDisplay, forceSyncHtmlAnimation, type HtmlAnimationTask } from '@/api/htmlAnimation';
import { Loading } from '@element-plus/icons-vue';

const selectedCourseId = ref<number|null>(null);
const selectedChapterId = ref<number|null>(null);
const courseOptions = ref<any[]>([]);
const chapterOptions = ref<any[]>([]);
const courseLoading = ref(false);
const listLoading = ref(false);
const generateLoading = ref(false);
const syncLoading = ref(false);
const polling = ref(false);
let pollTimer: any = null;

const tasks = ref<HtmlAnimationTask[]>([]);
const displayVersionRaw = ref('');
const displayVersionResolved = ref('');

const statusFilter = ref('all');
const keyword = ref('');

const previewVisible = ref(false);
const previewUrl = ref('');

// 统计
const stats = computed(()=>{
  return {
    completed: tasks.value.filter(t=>t.status==='completed').length,
    processing: tasks.value.filter(t=>t.status==='processing').length,
    failed: tasks.value.filter(t=>t.status==='failed').length
  };
});

const latestCompletedVersion = computed(()=>{
  const versions = tasks.value.filter(t=>t.status==='completed').map(t=>t.version).filter(v=>v>0);
  return versions.length? Math.max(...versions): null;
});

const latestSuccessTime = computed(()=>{
  const completed = tasks.value.filter(t=>t.status==='completed' && t.completedAt);
  if(!completed.length) return '';
  // 最新完成时间
  return completed.sort((a,b)=> (b.completedAt||'').localeCompare(a.completedAt||''))[0].completedAt;
});

const canGenerate = computed(()=> !!selectedCourseId.value && !!selectedChapterId.value && !tasks.value.some(t=>t.status==='processing'));

const filteredTasks = computed(()=>{
  let arr = tasks.value.slice().sort((a,b)=> b.version - a.version);
  if(statusFilter.value!=='all') arr = arr.filter(t=>t.status===statusFilter.value);
  if(keyword.value) arr = arr.filter(t=> t.fileName?.toLowerCase().includes(keyword.value.toLowerCase()));
  return arr;
});

function applyFilter(){ /* computed 已处理，此函数占位供事件触发刷新 */ }

async function searchCourses(query:string){
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({ pageNum:1, pageSize:20, courseName: query|| undefined });
    courseOptions.value = data.courseList || [];
  } catch(e){
    ElMessage.error('课程搜索失败');
  } finally { courseLoading.value=false; }
}

async function preloadCourses(){
  await searchCourses('');
}

async function handleCourseChange(){
  selectedChapterId.value = null;
  chapterOptions.value = [];
  tasks.value = [];
  stopPolling();
  if(!selectedCourseId.value) return;
  // load chapters
  try {
    const { data } = await getCourseHoursList({ courseId: selectedCourseId.value });
    chapterOptions.value = (data.courseChapters||[]).map(ch=> ({ chapterId: ch.chapterId, name: ch.name }));
  } catch(e){
    ElMessage.error('章节加载失败');
  }
}

function handleChapterChange(){
  tasks.value = [];
  stopPolling();
  if(selectedChapterId.value) refreshList();
}

async function refreshList(){
  if(!selectedCourseId.value || !selectedChapterId.value) return;
  listLoading.value = true;
  try {
    const { data } = await getHtmlAnimationList({ courseId: selectedCourseId.value, chapterId: selectedChapterId.value });
    tasks.value = data.tasks || [];
    displayVersionRaw.value = data.displayVersionRaw;
    displayVersionResolved.value = data.displayVersionResolved;
    // 若存在 processing 且未轮询启动 -> 启动
    if(tasks.value.some(t=>t.status==='processing') && !polling.value){
      startPolling();
    } else if(!tasks.value.some(t=>t.status==='processing')){
      stopPolling();
    }
  } catch(e){
    ElMessage.error('动画列表获取失败');
  } finally { listLoading.value = false; }
}

async function onGenerate(){
  if(!canGenerate.value) return;
  generateLoading.value = true;
  try {
    await generateHtmlAnimation({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value! });
    ElMessage.success('生成任务已提交');
    await refreshList();
  } catch(e){
    ElMessage.error('生成任务提交失败');
  } finally { generateLoading.value=false; }
}

function startPolling(){
  polling.value = true;
  clearInterval(pollTimer);
  pollTimer = setInterval(async ()=>{
    await refreshList();
  }, 5000);
}

function stopPolling(){
  polling.value = false;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function setDisplayLatest(){
  if(!latestCompletedVersion.value) return;
  try {
    await setHtmlAnimationDisplay({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value!, version: String(latestCompletedVersion.value) });
    ElMessage.success('展示版本已设置');
    await refreshList();
  } catch(e){
    ElMessage.error('设置展示版本失败');
  }
}

async function setDisplay(row: HtmlAnimationTask){
  if(row.status!=='completed') return;
  try {
    await setHtmlAnimationDisplay({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value!, version: String(row.version) });
    ElMessage.success('展示版本已设置');
    await refreshList();
  } catch(e){
    ElMessage.error('设置展示版本失败');
  }
}

async function onForceSync(){
  syncLoading.value = true;
  try {
    const { data } = await forceSyncHtmlAnimation();
    ElMessage.success(`同步完成: ${data.successChapters}/${data.totalChapters}`);
    await refreshList();
  } catch(e){
    ElMessage.error('强制同步失败');
  } finally { syncLoading.value=false; }
}

function isDisplayVersion(row: HtmlAnimationTask){
  if(row.status!=='completed' || !row.version) return false;
  if(displayVersionRaw.value==='latest') return String(row.version)===displayVersionResolved.value;
  return String(row.version)===displayVersionRaw.value;
}

function openPreview(row: HtmlAnimationTask){
  if(row.status!=='completed') return;
  previewUrl.value = buildFileUrl(row);
  previewVisible.value = true;
}

function buildFileUrl(row: HtmlAnimationTask){
  // 后端提供 objectName + 可能需要拼域。当前缺少域配置，假设后端 list 已返回可访问 fileName/objectName 之一
  // 优先尝试直接 fileName 为完整URL，否则返回 objectName 作为相对路径。
  if(row.fileName && row.fileName.startsWith('http')) return row.fileName;
  if(row.objectName && row.objectName.startsWith('http')) return row.objectName;
  return row.fileName || row.objectName || '';
}

function openInNewWindow(){
  if(previewUrl.value) window.open(previewUrl.value,'_blank');
}

async function copyUrl(row: HtmlAnimationTask){
  const url = buildFileUrl(row);
  if(!url){ ElMessage.warning('无可复制URL'); return; }
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('已复制');
  } catch(e){
    ElMessage.error('复制失败');
  }
}

function formatSize(size:number){
  if(!size) return '-';
  const units = ['B','KB','MB','GB'];
  let idx=0; let val=size;
  while(val>1024 && idx<units.length-1){ val/=1024; idx++; }
  return val.toFixed( (idx===0)?0:2 ) + units[idx];
}

function truncate(str:string, len:number){
  if(!str) return '';
  return str.length>len? str.slice(0,len)+'…': str;
}

function rowClassName({ row }: { row: HtmlAnimationTask }){
  if(isDisplayVersion(row)) return 'row-display';
  if(row.status==='failed') return 'row-failed';
  return '';
}

onMounted(()=>{
  preloadCourses();
});
</script>

<style scoped lang="scss">
.ai-animation-page { margin:10px; }
.toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.selectors { display:flex; align-items:center; }
.actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.display-info { margin-top:6px; font-size:12px; color:#606266; display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.display-info .divider { width:1px; height:14px; background:#dcdfe6; display:inline-block; }
.polling-indicator { color:#409eff; }
.empty-block { padding:60px 0; }
.filter-row { display:flex; justify-content:space-between; align-items:center; margin:10px 0 14px; }
.preview-wrapper { height:70vh; }
.preview-iframe { width:100%; height:100%; border:1px solid #e5e5e5; border-radius:4px; }
.error-text { color:#f56c6c; cursor:help; }
:deep(.row-display) { background: #f0fff4; }
:deep(.row-failed) { background: #fff5f5; }
</style>

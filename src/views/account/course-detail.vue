<template>
  <div id="app">
    <div data-v-2cf49992="" class="layout-container">
      <div
        id="layout-sidebar"
        data-v-8289e326=""
        data-v-2cf49992=""
        class="layout-sidebar light"
        style="top: 125.389px"
      >
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'course-learn' }"
          tabindex="0"
          data-menu="course-learn"
          @click="handleMenuClick('course-learn')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'course-learn' }"
          >
            <CourseLearnIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程学习</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'mastery' }"
          tabindex="0"
          data-menu="mastery"
          @click="handleMenuClick('mastery')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'mastery' }"
          >
            <MasteryIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">掌握度</div>
          </div>
        </div>
        <div data-v-8289e326="" class="line" />
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'course-qa' }"
          tabindex="0"
          data-menu="course-qa"
          @click="handleMenuClick('course-qa')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'course-qa' }"
          >
            <CourseQaIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程问答</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'homework-exam' }"
          tabindex="0"
          data-menu="homework-exam"
          @click="handleMenuClick('homework-exam')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'homework-exam' }"
          >
            <HomeworkExamIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">作业考试</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'course-materials' }"
          tabindex="0"
          data-menu="course-materials"
          @click="handleMenuClick('course-materials')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'course-materials' }"
          >
            <CourseMaterialsIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程资料</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'grades' }"
          tabindex="0"
          data-menu="grades"
          @click="handleMenuClick('grades')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'grades' }"
          >
            <GradesIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">成绩</div>
          </div>
        </div>
        <!-- <div data-v-8289e326="" class="line" />
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          :class="{ active: activeMenu === 'ai-doc-qa' }"
          tabindex="0"
          data-menu="ai-doc-qa"
          @click="handleMenuClick('ai-doc-qa')"
        >
          <div
            data-v-1139a0f7=""
            data-v-8289e326=""
            class="hover-box"
            :class="{ active: activeMenu === 'ai-doc-qa' }"
          >
            <AiDocQaIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">AI文档问答</div>
          </div>
        </div> -->
        <div data-v-8289e326="" class="line" />
      </div>
      <div data-v-2cf49992="" class="layout-inner-content">
        <!-- 课程资料 -->
        <div
          v-show="activeMenu === 'course-materials'"
          data-v-2cf49992=""
          class="course-materials-wrapper"
          :class="currentTheme"
        >
          <!-- 头部 -->
          <div
            data-v-3e66491d=""
            data-v-cebc91e2=""
            class="layout-header"
            :class="currentTheme"
            isatlas="1"
            style="z-index: 10"
          >
            <div
              id="header-content-layout only-filter"
              data-v-3e66491d=""
              class="header-content"
            >
              <div data-v-3e66491d="" class="item header-left">
                <div
                  data-v-3e66491d=""
                  class="item header-back"
                  @click="goBack"
                >
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time">{{
                  currentDate
                }}</span>
                <div data-v-3e66491d="" class="theme-mode" @click="toggleTheme">
                  <ThemeSunIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                  />
                  <ThemeMoonIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                  />
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-center">
                <div
                  data-v-cebc91e2=""
                  data-v-3e66491d=""
                  class="study-mode custom-mode"
                >
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                    style="margin: 0 auto"
                  >
                    课程资料
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <li data-v-3e66491d="" style="margin-left: 1.875vw">
                    <ul
                      data-v-3e66491d=""
                      role="menubar"
                      class="fu-header-users el-menu--horizontal el-menu"
                    >
                      <li
                        data-v-3e66491d=""
                        role="menuitem"
                        aria-haspopup="true"
                        class="el-submenu"
                        tabindex="0"
                      >
                        <div
                          class="el-submenu__title"
                          style="border-bottom-color: transparent"
                        >
                          <div data-v-3e66491d="" class="avatar-info">
                            <img
                              data-v-3e66491d=""
                              :src="userAvatar"
                              alt=""
                              class="avatar"
                            />
                            <span data-v-3e66491d="" class="name">{{
                              userNickname
                            }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-down"
                          />
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 内容 -->
          <div class="materials-container" :class="currentTheme">
            <div
              v-if="courseAttrList && courseAttrList.length > 0"
              class="materials-list"
            >
              <div
                v-for="(item, index) in courseAttrList"
                :key="index"
                class="material-item"
                :class="{ dark: currentTheme === 'dark' }"
                @click="viewMaterial(item)"
              >
                <div class="material-icon">
                  <img
                    v-if="item.rType === 'IMAGE'"
                    src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                    alt="图片"
                  />
                  <img
                    v-else-if="item.rType === 'VIDEO'"
                    src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                    alt="视频"
                  />
                  <img
                    v-else-if="item.rType === 'DOCUMENT'"
                    src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                    alt="文档"
                  />
                  <img
                    v-else
                    src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                    alt="资源"
                  />
                </div>
                <div class="material-info">
                  <div class="material-title">{{ item.title }}</div>
                  <div class="material-type">
                    {{ getMaterialTypeName(item.rType) }}
                  </div>
                </div>
                <div class="material-action">
                  <el-button size="small" type="primary">查看</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无课程资料" />
          </div>
        </div>

        <!-- 作业考试 -->
        <div
          v-show="activeMenu === 'homework-exam'"
          data-v-2cf49992=""
          class="homework-exam-wrapper"
          :class="currentTheme"
        >
          <!-- 头部 -->
          <div
            data-v-3e66491d=""
            data-v-cebc91e2=""
            class="layout-header"
            :class="currentTheme"
            isatlas="1"
            style="z-index: 10"
          >
            <div
              id="header-content-layout only-filter"
              data-v-3e66491d=""
              class="header-content"
            >
              <div data-v-3e66491d="" class="item header-left">
                <div
                  data-v-3e66491d=""
                  class="item header-back"
                  @click="goBack"
                >
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time">{{
                  currentDate
                }}</span>
                <div data-v-3e66491d="" class="theme-mode" @click="toggleTheme">
                  <ThemeSunIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                  />
                  <ThemeMoonIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                  />
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-center">
                <div
                  data-v-cebc91e2=""
                  data-v-3e66491d=""
                  class="study-mode custom-mode"
                >
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                    style="margin: 0 auto"
                  >
                    作业考试
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <li data-v-3e66491d="" style="margin-left: 1.875vw">
                    <ul
                      data-v-3e66491d=""
                      role="menubar"
                      class="fu-header-users el-menu--horizontal el-menu"
                    >
                      <li
                        data-v-3e66491d=""
                        role="menuitem"
                        aria-haspopup="true"
                        class="el-submenu"
                        tabindex="0"
                      >
                        <div
                          class="el-submenu__title"
                          style="border-bottom-color: transparent"
                        >
                          <div data-v-3e66491d="" class="avatar-info">
                            <img
                              data-v-3e66491d=""
                              :src="userAvatar"
                              alt=""
                              class="avatar"
                            />
                            <span data-v-3e66491d="" class="name">{{
                              userNickname
                            }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-down"
                          />
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 内容 -->
          <div class="homework-container" :class="currentTheme">
            <el-tabs v-model="homeworkExamTab" class="homework-tabs">
              <el-tab-pane label="作业" name="homework">
                <div
                  v-if="homeworkList && homeworkList.length > 0"
                  class="homework-list"
                >
                  <div
                    v-for="(item, index) in homeworkList"
                    :key="index"
                    class="homework-item"
                    :class="{ dark: currentTheme === 'dark' }"
                    @click="viewHomework(item)"
                  >
                    <div class="homework-icon">
                      <img
                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                        alt="作业"
                      />
                    </div>
                    <div class="homework-info">
                      <div class="homework-title">{{ item.title }}</div>
                      <div class="homework-meta">
                        <span>题目数量: {{ item.questionNum }}</span>
                        <span>总分: {{ item.totalPoints }}</span>
                        <span>截止日期: {{ formatDate(item.dueDate) }}</span>
                      </div>
                    </div>
                    <div class="homework-status">
                      <el-tag
                        :type="getHomeworkStatusType(item.status)"
                        effect="plain"
                      >
                        {{ getHomeworkStatusText(item.status) }}
                      </el-tag>
                    </div>
                    <div class="homework-action">
                      <el-button size="small" type="primary">查看</el-button>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无作业" />
              </el-tab-pane>
              <el-tab-pane label="考试" name="exam">
                <div v-if="examList && examList.length > 0" class="exam-list">
                  <div
                    v-for="(item, index) in examList"
                    :key="index"
                    class="exam-item"
                    :class="{ dark: currentTheme === 'dark' }"
                    @click="viewExam(item)"
                  >
                    <div class="exam-icon">
                      <img
                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                        alt="考试"
                      />
                    </div>
                    <div class="exam-info">
                      <div class="exam-title">{{ item.title }}</div>
                      <div class="exam-meta">
                        <span>题目数量: {{ item.questionNum }}</span>
                        <span>总分: {{ item.totalPoints }}</span>
                        <span>时间限制: {{ item.timeLimit }}分钟</span>
                        <span
                          >开始时间: {{ formatDate(item.availableFrom) }}</span
                        >
                        <span
                          >结束时间: {{ formatDate(item.availableTo) }}</span
                        >
                      </div>
                    </div>
                    <div class="exam-status">
                      <el-tag
                        :type="getExamStatusType(item.status)"
                        effect="plain"
                      >
                        {{ getExamStatusText(item.status) }}
                      </el-tag>
                    </div>
                    <div class="exam-action">
                      <el-button size="small" type="primary">查看</el-button>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无考试" />
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <!-- 课程学习 -->
        <div
          v-show="activeMenu == 'course-learn'"
          data-v-cebc91e2=""
          data-v-2cf49992=""
        >
          <!-- 课程学习 -->
          <div
            data-v-3e66491d=""
            data-v-cebc91e2=""
            class="layout-header light"
            isatlas="1"
            style="z-index: 10"
          >
            <div
              id="header-content-layout only-filter"
              data-v-3e66491d=""
              class="header-content"
            >
              <div data-v-3e66491d="" class="item header-left">
                <div
                  data-v-3e66491d=""
                  class="item header-back"
                  @click="goBack"
                >
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time">{{
                  currentDate
                }}</span>
                <div data-v-3e66491d="" class="theme-mode" @click="toggleTheme">
                  <ThemeSunIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                  />
                  <ThemeMoonIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                  />
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-center">
                <div
                  data-v-cebc91e2=""
                  data-v-3e66491d=""
                  class="study-mode custom-mode"
                >
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                    style="margin: 0 auto"
                  >
                    章节模式
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <!-- <li data-v-3e66491d="" class="mypopper brepopper">
                    <div
                      data-v-3e66491d=""
                      class="icon-item icon-item1 new-icon"
                    >
                      <div data-v-3e66491d="" class="icon-hover">课程提醒</div>
                      <span data-v-3e66491d="" class="tag" />
                    </div>
                  </li>
                  <li data-v-3e66491d="" class="mypopper brepopper">
                    <div
                      data-v-3e66491d=""
                      class="icon-item icon-item2 new-icon"
                    >
                      <div data-v-3e66491d="" class="icon-hover">学前必读</div>
                    </div>
                  </li>
                  <li data-v-3e66491d="" class="mypopper brepopper">
                    <div
                      data-v-3e66491d=""
                      class="icon-item icon-item3 new-icon"
                    >
                      <div data-v-3e66491d="" class="icon-hover">班级信息</div>
                    </div>
                  </li>
                  <li data-v-3e66491d="" class="mypopper brepopper">
                    <div
                      data-v-3e66491d=""
                      class="icon-item icon-item4 new-icon"
                    >
                      <div data-v-3e66491d="" class="icon-hover">消息中心</div>
                      <div data-v-3e66491d="" class="yuandian" />
                    </div>
                  </li>
                  <li data-v-3e66491d="" class="mypopper brepopper">
                    <div
                      data-v-3e66491d=""
                      class="icon-item icon-item5 new-icon"
                    >
                      <div data-v-3e66491d="" class="tuikeIcon">
                        <div data-v-3e66491d="" class="tuike">退课</div>
                      </div>
                    </div>
                  </li> -->
                  <li data-v-3e66491d="" style="margin-left: 1.875vw">
                    <ul
                      data-v-3e66491d=""
                      role="menubar"
                      class="fu-header-users el-menu--horizontal el-menu"
                    >
                      <li
                        data-v-3e66491d=""
                        role="menuitem"
                        aria-haspopup="true"
                        class="el-submenu"
                        tabindex="0"
                      >
                        <div
                          class="el-submenu__title"
                          style="border-bottom-color: transparent"
                        >
                          <div data-v-3e66491d="" class="avatar-info">
                            <img
                              data-v-3e66491d=""
                              :src="userAvatar"
                              alt=""
                              class="avatar"
                            /><span data-v-3e66491d="" class="name">{{
                              userNickname
                            }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-down"
                          />
                        </div>
                        <div
                          class="el-menu--horizontal light fu-header-users-3"
                          style="display: none"
                        >
                          <ul
                            role="menu"
                            class="el-menu el-menu--popup el-menu--popup-bottom-start"
                          >
                            <li
                              data-v-3e66491d=""
                              role="menuitem"
                              tabindex="-1"
                              class="el-menu-item fu-header-1"
                            >
                              <span data-v-3e66491d="" class="fu-i fu-header-f1"
                                >账号管理</span
                              >
                            </li>
                            <li
                              data-v-3e66491d=""
                              role="menuitem"
                              tabindex="-1"
                              class="el-menu-item fu-header-1"
                            >
                              <span data-v-3e66491d="" class="fu-i fu-header-f2"
                                >安全退出</span
                              >
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                    <div data-v-3e66491d="" class="user-info" />
                  </li>
                </ul>
              </div>
            </div>
            <div data-v-3e66491d="" class="hover-area" />
            <!----><!---->
            <div
              data-v-3e66491d=""
              class="el-dialog__wrapper courseRemind khfaPop light"
              style="display: none"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="dialog"
                class="el-dialog newAiPop"
                style="margin-top: 15vh; width: 39.0625vw"
              >
                <div class="el-dialog__header">
                  <div data-v-3e66491d="" class="header-slot header-slot-box">
                    <StudyBeforeReadingIcon /><span
                      data-v-3e66491d=""
                      class="study-before-texts"
                      >学前必读</span
                    ><i data-v-3e66491d="" class="el-icon-error" />
                  </div>
                  <!---->
                </div>
                <!----><!---->
              </div>
            </div>
            <!---->
            <div
              data-v-3e66491d=""
              class="el-dialog__wrapper light courseRemind courseRemindAd"
              style="display: none"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="dialog"
                class="el-dialog newAiPop"
                style="margin-top: 15vh; width: 28.125vw"
              >
                <div class="el-dialog__header">
                  <div data-v-3e66491d="" class="header-slot">
                    <i data-v-3e66491d="" class="el-icon-error" />
                  </div>
                  <!---->
                </div>
                <!---->
                <div class="el-dialog__footer">
                  <div data-v-3e66491d="" class="btn-list">
                    <div data-v-3e66491d="" class="btn">取消</div>
                    <div data-v-3e66491d="" class="btn primary">确定</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div data-v-cebc91e2="" class="study-container light">
            <div data-v-cebc91e2="" class="light" style="overflow: hidden">
              <div class="aloneMapCourrseWarp">
                <div class="left-warp">
                  <div class="courseMsg-box">
                    <div class="small-text">
                      <i />同学们，本次我们学习的知识点是
                    </div>
                    <div class="kg-name">
                      {{ currentVideoTitle }}
                    </div>
                  </div>
                  <div
                    class="preview-warp"
                    style="
                      width: 100%;
                      height: 369px;
                      background: rgb(0, 0, 0);
                      border-radius: 0.83333vw;
                    "
                  >
                    <video
                      v-if="currentVideoUrl"
                      ref="videoPlayer"
                      controls
                      style="width: 100%; height: 100%"
                      :src="currentVideoUrl"
                      @loadeddata="videoLoaded"
                      @ended="videoEnded"
                    />
                    <div
                      v-else
                      class="loading-placeholder"
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        color: #fff;
                      "
                    >
                      {{ loading ? "加载中..." : "暂无视频" }}
                    </div>
                  </div>
                  <div
                    class="kgDescribe-warp"
                    style="height: auto"
                    courseinfo="[object Object]"
                  >
                    <div class="top-test">
                      <img :src="describeImgSrc" alt="" /><span
                        >知识点描述</span
                      >
                      <div
                        class="botton-box-down close-status"
                        @click="toggleContent"
                      />
                    </div>
                    <div class="label-list deslabel-list">
                      <div class="lab-item active"><span>描述一</span></div>
                    </div>
                    <div class="introduce-div">
                      <p>
                        国家安全是指一个国家政权、主权、统一和领土完整、人民福祉、经济社会可持续发展和国家其他重大利益相对处于没有危险和不受内外威胁的状态，以及保障、维护和塑造持续安全状态的能力。实现中华民族伟大复兴，保证人民安居乐业，国家安全是头等大事。习近平指出，"我们要辩证认识和把握国内外大势，统筹中华民族伟大复兴战略全局和世界百年未有之大变局"。在"两个大局"加速演进并深刻互动的时代背景下，我国国家安全形势发生了深刻变化，维护和塑造国家安全的任务比以往任何时候都更加艰巨。
                      </p>
                      <p>
                        当前，世界之变、时代之变、历史之变正以前所未有的方式展开。一方面，和平、发展、合作、共赢的历史潮流不可阻挡，人心所向、大势所趋决定了人类前途终归光明。另一方面，恃强凌弱、巧取豪夺、零和博弈等霸权霸道霸凌行径危害深重，和平赤字、发展赤字、安全赤字、治理赤字加重，人类社会面临前所未有的挑战。我们所处的是一个充满挑战的时代，也是一个充满希望的时代。时代发展进程中的新趋向和新变化，带来全球政治、经济、社会、文化等方面的新变革，也使我国国家安全面临一系列新形势新任务。<br />第一，<strong>国家安全形势更趋复杂</strong>。从国际上看，世界进入新的动荡变革期，单边主义、保护主义、霸权主义、强权政治对世界和平与发展威胁上升，经济全球化遭遇逆流，世界经济增长乏力，发展鸿沟日益突出，兵戎相见时有发生，冷战思维阴魂不散，恐怖主义、难民危机、重大传染性疾病、气候变化等非传统安全威胁持续蔓延，贫富分化、环境危机、能源枯竭、太空无序开发等全球性问题加剧，国际安全环境日趋复杂、严峻，不确定、不稳定、难预料因素增多。人类正处在一个挑战层出不穷、风险日益增多的时代，安全问题解决不好，人类和平与发展的崇高事业就难以顺利推进。从国内来看，中国特色社会主义进入新时代，人民的美好生活需要日益增长，对国家安全提出了更高要求。同时，必须清醒地认识到，在全面建设社会主义现代化国家的新征程上，我国还面临一系列风险挑战，主要有：发展不平衡不充分问题仍然突出，推进高质量发展还有很多卡点和瓶颈，科技创新能力还不强；确保粮食、能源、产业链供应链可靠安全和防范金融风险还须解决许多重大问题；意识形态领域存在不少挑战；生态环境保护任务依然艰巨；等等。如果这些领域的风险挑战防范不及、应对不当、化解不力，就会给人民安全、经济发展、社会稳定带来严峻挑战。总之，错综复杂的国际环境带来新矛盾新挑战，我国社会主要矛盾发展变化带来新特征新要求，使我国国家安全面临更趋复杂严峻的形势。<br />第二，<strong>发展和安全利益面临重大挑战</strong>。发展和安全利益是国家利益的主要内容。在百年变局下，我国发展和安全利益面临严峻外部挑战。个别西方国家对中国开展全面施压，粗暴干涉中国内政，挑动"台独""港独""藏独""东突"等分裂势力，妄图分裂中国；在南海滋事生非，挑拨地区国家关系，打着"航行自由"旗号炫耀武力，严重破坏地区和平稳定；向我国派遣特务、培植间谍，策反国家公职人员、技术人员和青年学生等，进行政治破坏、思想渗透和情报窃取等活动；加紧对我国进行科技封锁，动辄制裁、打压我国企业，试图遏制我国发展。大量事实一再表明，维护国家主权、安全是推动发展、实现发展利益的根本保证。因此，必须严密防范和严厉打击敌对势力渗透、破坏、颠覆、分裂活动，顶住和反击外部极端打压遏制，开展涉港、涉台、涉疆、涉藏、涉海等领域的斗争。同时，只有发展才会带来真正的安全，没有发展就没有安全，不发展是最大的不安全。过去我们是顺势而上，机遇比较好把握；现在要顶风而上，把握机遇的难度就不一样了。过去我们发展水平相对较低，同外部的互补性就多一些；现在我们发展水平提高了，同外部的竞争性就多起来了。我们越发展壮大，遇到的阻力和压力就会越大，面临的外部风险就会越多。这是我国由大向强发展进程中无法回避的挑战，是实现中华民族伟大复兴绕不过的门槛。我们面对的挑战前所未有，更具有复杂性、全局性，来自外部的打压遏制随时可能升级。只有统筹发展和安全，坚持发展和安全并重，才能既实现高质量发展，又实现高水平安全。<br />第三，<strong>传统和非传统安全威胁重叠交织</strong>。传统安全主要包括政治安全、国土安全、军事安全，非传统安全主要包括经济安全、文化安全、社会安全、科技安全、生态安全、核安全等。传统和非传统安全挑战各不相同，却又彼此相关。在新的条件下，传统和非传统安全挑战层出不穷。一方面，国家、地区之间的军事冲突与战争带来的传统安全威胁并没有消除，在个别地区和领域还有加剧的趋势；另一方面，公共卫生、恐怖主义、气候变化、网络安全等非传统安全威胁持续蔓延，这些威胁及其风险外溢直接或间接地危及我国国家主权、国家利益、人民福祉。当前，传统和非传统安全威胁相互交织。比如，传染病流行暴发、生物恐怖袭击、生物资源危机等生物领域的重大风险直接危及人民生命健康，同时诱发和滋生经济、社会、文化、网络、粮食、科技、军事等领域重大风险。此外，一些传统安全问题会呈现出非传统安全的特征，一些非传统安全问题往往又是从传统安全领域诱生出来的，这些风险联动叠加、积聚发酵，将破坏国家利益，最终危害国家安全。<br />第四，<strong>国际和国内安全风险传导联动</strong>。当前，国际形势波谲云诡，国家安全受到多重因素影响，面临的风险源越来越复杂，呈现出内外联动的特征，相互影响、相互渗透、相互传导。一个国家在发展过程中，不断累积的各种深层次矛盾和问题逐渐显露，彼此叠加，相互关联，极易引发影响社会稳定的重大群体性事件。在外部输入性风险诱导下，一些事件可能升级为影响发展和安全的全局性风险问题。在政治领域，世界多地发生的"颜色革命"就是内外势力勾连造成的国家安全受到重大挑战的典型案例，其外溢效应给本国和地区安全带来危机。长期以来，少数西方国家罔顾事实，不断借口所谓"人权"问题攻击中国，通过教育、宗教、文化等对我国进行意识形态渗透。信息时代，一些媒介的虚假信息和谣言传播混淆视听，给敌对势力和不法分子以可乘之机，给维护意识形态安全带来新的风险。这些风险使维护政治安全的艰巨性大大增加。在经济领域，一国的经济危机、金融危机、能源危机等影响着周边地区乃至全球的经济发展，也危及共同的经济安全。这种风险同样会传导至科技、社会、文化、生态等领域，呈现出越来越鲜明的联动趋势。<br />当前，中华民族伟大复兴进入关键时期，我国发展也进入战略机遇和风险挑战并存、不确定难预料因素增多的时期。中华民族伟大复兴绝不是轻轻松松、敲锣打鼓就能实现的，也绝不是一马平川、朝夕之间就能到达的。各种矛盾风险挑战源、各类矛盾风险挑战点相互交织、相互作用。如果防范应对不及时，就会传导、叠加、演变、升级，使小的矛盾风险挑战激化成大的矛盾风险挑战，局部的矛盾风险挑战演化成系统的矛盾风险挑战，国际上的矛盾风险挑战演变成国内的矛盾风险挑战，经济、社会、文化、生态领域的矛盾风险挑战转化成政治领域的矛盾风险挑战，最终危及社会主义制度，危害国家安全。
                      </p>
                    </div>
                  </div>
                  <div data-v-e74995e4="" class="ai-observer" style="">
                    <!---->
                  </div>
                  <div class="resource-warp">
                    <div class="resource-tab">
                      <div
                        class="tab-item"
                        :class="{ active: activeResourceTab === 'required' }"
                        @click="handleResourceTabClick('required')"
                      >
                        <i />
                        <span>必学资源</span>
                      </div>
                      <div
                        class="tab-item"
                        :class="{ active: activeResourceTab === 'optional' }"
                        @click="handleResourceTabClick('optional')"
                      >
                        <i />
                        <span>选学资源</span>
                      </div>
                    </div>
                    <div class="label-list rlabel-list">
                      <div class="label-name active">
                        <span class="name-box"
                          >全部<span class="lab-number">1</span></span
                        >
                      </div>
                    </div>
                    <div class="el-scrollbar" style="height: 100%">
                      <div
                        class="el-scrollbar__wrap"
                        style="margin-bottom: -1px; margin-right: -1px"
                      >
                        <div class="el-scrollbar__view">
                          <div class="resources-list">
                            <!----><!---->
                            <div class="resources-item active">
                              <div
                                data="74468421"
                                class="basic-info-video-card-container"
                              >
                                <div class="video-wrap">
                                  <div class="video-img-bg">
                                    <div class="img-bg" />
                                    <img
                                      src="https://image.zhihuishu.com/screenshot/zhs/ai-smart-course-h5/TEACH_RESOURCE/202503/f4a27bf2dfbd4399b6ccf1ef0dc353d0.jpg"
                                      alt=""
                                    />
                                    <div class="file-type file-video">
                                      <i />
                                    </div>
                                    <div class="video-time">00:07:13</div>
                                    <div class="isActive">
                                      <img
                                        src="https://image.zhihuishu.com/zhs_yufa_150820/b2cm/base1/202308/56da0a86aeeb4f2eb7d503ee11dea19f.gif"
                                        alt=""
                                      />
                                    </div>
                                    <!---->
                                    <div class="isFinsh">
                                      <img
                                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202408/c0805653b2404808acd72b0db4092e61.png"
                                        alt=""
                                      />已完成
                                    </div>
                                  </div>
                                </div>
                                <div class="video-info">
                                  <div class="file-name">
                                    深刻认识新时代我国国家安全形势.mp4
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="el-scrollbar__bar is-horizontal">
                        <div
                          class="el-scrollbar__thumb"
                          style="transform: translateX(0%)"
                        />
                      </div>
                      <div class="el-scrollbar__bar is-vertical">
                        <div
                          class="el-scrollbar__thumb"
                          style="transform: translateY(0%)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="rigth-warp">
                  <div>
                    <div data-v-0762fd62="" class="ai-helper-sections light">
                      <div
                        data-v-0762fd62=""
                        class="out-ai-showbox-pro"
                        style="
                          position: fixed;
                          top: 5.83333vw;
                          margin-right: 0px;
                          width: 23.9583vw;
                          height: 10.4167vw;
                        "
                      >
                        <div
                          data-v-0762fd62=""
                          class="out-ai-pro-talk-box glow-border"
                        >
                          <div data-v-0762fd62="" class="inset-div">
                            <div data-v-0762fd62="" class="photo">
                              <img
                                data-v-0762fd62=""
                                src="@/assets/aipeople.jpg"
                                alt=""
                              />
                            </div>
                            <div data-v-0762fd62="" class="ai-hepler-pro-box">
                              <div data-v-0762fd62="" class="people-name">
                                AI助教
                              </div>
                              <div data-v-0762fd62="" class="init-talk-cotent">
                                Hi～我是您的AI助教
                              </div>
                            </div>
                            <div data-v-0762fd62="" class="ai-hepler-pro-input">
                              <div data-v-0762fd62="" class="el-input">
                                <!----><input
                                  type="text"
                                  autocomplete="off"
                                  placeholder="输入您的问题，与AI助教互动问答..."
                                  class="el-input__inner"
                                  style="padding-left: 10px; font-size: 10px"
                                  @click="openAiDialog"
                                /><!----><!----><!----><!---->
                              </div>
                              <span
                                data-v-0762fd62=""
                                class="mock-send-btn"
                                @click="openAiDialog"
                              >
                                <SendIcon />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!----><!----><!---->
                      <!-- ai 返回按钮 -->
                      <div
                        data-v-0762fd62=""
                        class="not-expand-icon"
                        style="
                          right: 26.875vw;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        "
                        :style="{
                          display: isAiDialogVisible ? 'flex' : 'none'
                        }"
                        @click="closeAiDialog"
                      >
                        <NotExpandIcon />
                      </div>
                      <!-- ai弹窗 -->
                      <div
                        data-v-0762fd62=""
                        class="ai-draggable-dialog auto"
                        style="
                          width: 23.9583vw;
                          height: calc(100% - 5.3125vw);
                          top: auto;
                        "
                        :style="{
                          display: isAiDialogVisible ? 'block' : 'none'
                        }"
                      >
                        <div data-v-0762fd62="" class="ai-fill-bg">
                          <div data-v-0762fd62="" class="dialog-content">
                            <div data-v-0762fd62="" class="ai-talk-box">
                              <div
                                data-v-0762fd62=""
                                class="el-scrollbar"
                                style="height: 100%; box-sizing: border-box"
                              >
                                <div
                                  class="el-scrollbar__wrap"
                                  style="
                                    margin-bottom: -1px;
                                    margin-right: -1px;
                                  "
                                >
                                  <div class="el-scrollbar__view">
                                    <!-- 修改聊天消息区域，使用现有的CSS样式类 -->
                                    <div
                                      data-v-0762fd62=""
                                      class="header-tips-box"
                                    >
                                      <div
                                        data-v-0762fd62=""
                                        class="robbot-icon"
                                      >
                                        <img
                                          data-v-0762fd62=""
                                          src="@/assets/aipeople.jpg"
                                          alt=""
                                          style="transform: scaleX(-1)"
                                        />
                                      </div>
                                      <div data-v-0762fd62="" class="code-icon">
                                        <img
                                          data-v-0762fd62=""
                                          src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/cbfe6f1ad06b413d91391b1625d37210.png"
                                          alt=""
                                        />
                                      </div>
                                      <p data-v-0762fd62="" class="code-hello">
                                        Hi～我是您的AI助教
                                      </p>
                                      <div
                                        data-v-0762fd62=""
                                        class="ai-heler-header-tips"
                                      >
                                        课程学习中欢迎随时提问，我将全力为您答疑解惑，共同进步哦！
                                      </div>
                                    </div>

                                    <!-- 聊天消息区域 -->
                                    <div
                                      v-for="(message, index) in chatMessages"
                                      :key="index"
                                      data-v-0762fd62=""
                                    >
                                      <!-- 用户消息 -->
                                      <div
                                        v-if="message.role === 'user'"
                                        :id="`talk_${index}`"
                                        data-v-0762fd62=""
                                        class="ai-chat-share-container_nVXTe"
                                      >
                                        <div
                                          data-v-0762fd62=""
                                          class="chat-common_3Wk2t margin-bottom-16 chat-common_AKa0H"
                                        >
                                          <div
                                            data-v-0762fd62=""
                                            class="question-container_2GfLA chat-common_AKa0H"
                                          >
                                            <div
                                              data-v-0762fd62=""
                                              class="question-content_1e1fE question-content-animation_2xq2F"
                                            >
                                              {{ message.content }}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <!-- AI回复 -->
                                      <div
                                        v-else
                                        :id="`talk_${index}`"
                                        data-v-0762fd62=""
                                        class="ai-chat-share-container_nVXTe"
                                      >
                                        <div
                                          data-v-0762fd62=""
                                          class="chat-common_3Wk2t margin-bottom-16"
                                        >
                                          <div
                                            data-v-0762fd62=""
                                            class="answer-box-wrapper_1QYRS full-line_3ITtH chat-ans_1oSN6"
                                          >
                                            <div
                                              data-v-0762fd62=""
                                              class="answer-content-box_2Pu7S chat-answer-content-box"
                                            >
                                              <div
                                                data-v-0762fd62=""
                                                class="markdown-content"
                                              >
                                                <p
                                                  :id="`turnMathJax${index}`"
                                                  data-v-0762fd62=""
                                                  class="result"
                                                  v-html="
                                                    parseMarkdown(
                                                      message.content
                                                    )
                                                  "
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <!-- 正在输入提示 -->
                                    <div v-if="isTyping" data-v-0762fd62="">
                                      <div
                                        data-v-0762fd62=""
                                        class="ai-chat-share-container_nVXTe"
                                      >
                                        <div
                                          data-v-0762fd62=""
                                          class="chat-common_3Wk2t margin-bottom-16"
                                        >
                                          <div
                                            data-v-0762fd62=""
                                            class="answer-box-wrapper_1QYRS full-line_3ITtH chat-ans_1oSN6"
                                          >
                                            <div
                                              data-v-0762fd62=""
                                              class="answer-content-box_2Pu7S chat-answer-content-box"
                                            >
                                              <div
                                                data-v-0762fd62=""
                                                class="markdown-content"
                                              >
                                                <p
                                                  data-v-0762fd62=""
                                                  class="result"
                                                >
                                                  <span class="typing-dot"
                                                    >.</span
                                                  >
                                                  <span class="typing-dot"
                                                    >.</span
                                                  >
                                                  <span class="typing-dot"
                                                    >.</span
                                                  >
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="el-scrollbar__bar is-horizontal">
                                  <div
                                    class="el-scrollbar__thumb"
                                    style="transform: translateX(0%)"
                                  />
                                </div>
                                <div class="el-scrollbar__bar is-vertical">
                                  <div
                                    class="el-scrollbar__thumb"
                                    style="transform: translateY(0%)"
                                  />
                                </div>
                              </div>
                            </div>
                            <div data-v-0762fd62="" class="talk-input-box">
                              <div data-v-0762fd62="" class="ai-footer-btns">
                                <!----><!---->
                              </div>
                              <div data-v-0762fd62="" class="input-box">
                                <div
                                  data-v-0762fd62=""
                                  class="ai-pro-content-edit-box"
                                >
                                  <div
                                    data-v-0762fd62=""
                                    class="input-fill-box-new"
                                  >
                                    <div data-v-0762fd62="" class="el-textarea">
                                      <textarea
                                        v-model="currentMessage"
                                        autocomplete="off"
                                        placeholder="请输入您的问题"
                                        maxlength="300"
                                        class="el-textarea__inner"
                                        :style="
                                          currentMessage.trim()
                                            ? 'min-height: 12px;'
                                            : 'min-height: 12px; height: 12px;'
                                        "
                                        @keydown.enter.prevent="sendMessage"
                                      /><!---->
                                    </div>
                                  </div>
                                  <div
                                    data-v-0762fd62=""
                                    class="add-new-talk"
                                    :class="{
                                      'not-allowed': !currentMessage.trim()
                                    }"
                                  >
                                    <AddNewTalkIcon />
                                  </div>
                                </div>
                                <div
                                  data-v-0762fd62=""
                                  :class="
                                    currentMessage.trim() && !sendingMessage
                                      ? 'send-btn'
                                      : 'not-send-btn'
                                  "
                                  @click="sendMessage"
                                >
                                  <NotSendBtnIcon
                                    v-if="
                                      !currentMessage.trim() || sendingMessage
                                    "
                                  />
                                  <SendIcon v-else />
                                </div>
                              </div>
                              <div data-v-0762fd62="" class="ai-tips-box" />
                            </div>
                          </div>
                          <div
                            data-v-0762fd62=""
                            class="ai-toast-container"
                            style="display: none"
                          >
                            <div data-v-0762fd62="" class="ai-toast-message" />
                          </div>
                        </div>
                      </div>
                      <!-- 欢迎使用AI助教 -->
                      <div
                        data-v-0762fd62=""
                        class="el-dialog__wrapper"
                        style="display: none"
                      >
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-label="欢迎使用AI助教"
                          class="el-dialog el-dialog--center ai-helper-agreement-Dialog"
                          style="margin-top: 15vh; width: 37.5vw"
                        >
                          <div class="el-dialog__header">
                            <span class="el-dialog__title">欢迎使用AI助教</span
                            ><!---->
                          </div>
                          <!---->
                          <div class="el-dialog__footer">
                            <span
                              data-v-0762fd62=""
                              class="ai-agree-dialog-footer"
                              ><div data-v-0762fd62="" class="disable-btn">
                                确定
                              </div>
                              <!----></span
                            >
                          </div>
                        </div>
                      </div>
                      <!-- 温馨提示 -->
                      <div
                        data-v-0762fd62=""
                        class="el-dialog__wrapper"
                        style="display: none"
                      >
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-label="温馨提示"
                          class="el-dialog el-dialog--center ai-helper-agreement-Dialog"
                          style="margin-top: 15vh; width: 41.6667vw"
                        >
                          <div class="el-dialog__header">
                            <span class="el-dialog__title">温馨提示</span
                            ><!---->
                          </div>
                          <!---->
                          <div class="el-dialog__footer">
                            <span
                              data-v-0762fd62=""
                              class="ai-agree-dialog-footer"
                              ><div data-v-0762fd62="" class="primary-btn">
                                我知道了
                              </div></span
                            >
                          </div>
                        </div>
                      </div>
                      <div
                        data-v-0762fd62=""
                        class="el-dialog__wrapper"
                        style="display: none"
                      >
                        <!-- 反馈 -->
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-label="dialog"
                          class="el-dialog el-dialog--center ai-helper-feedback-Dialog"
                          style="margin-top: 15vh; width: 41.6667vw"
                        >
                          <div class="el-dialog__header">
                            <span class="el-dialog__title" /><!---->
                          </div>
                          <!---->
                          <div class="el-dialog__footer">
                            <span
                              data-v-0762fd62=""
                              class="ai-feedback-dialog-footer"
                              ><div data-v-0762fd62="" class="disable-btn">
                                提交
                              </div></span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="rightTreeWarp" courseinfo="[object Object]">
                    <div class="top-title">目录</div>
                    <div
                      class="my-scrollbar el-scrollbar"
                      style="height: calc(100% - 3.38542vw)"
                    >
                      <div
                        class="el-scrollbar__wrap"
                        style="margin-bottom: -1px; margin-right: -1px"
                      >
                        <div class="el-scrollbar__view">
                          <div class="chapterList-box">
                            <ul class="list">
                              <span class="position_first_bg" />

                              <!-- 使用API返回的章节列表 -->
                              <template
                                v-for="(
                                  chapter, chapterIndex
                                ) in courseDetail?.courseChapterList"
                                :key="chapter.chapterId"
                              >
                                <li class="clearfix font_gray_inclined chapter">
                                  <span
                                    :title="`第${chapterIndex + 1}章`"
                                    class="catalogue_title3 fl"
                                  >
                                    <b>第{{ chapterIndex + 1 }}章</b>
                                  </span>
                                  <em class="Sectionmark-em fl" />
                                  <span
                                    :title="chapter.name"
                                    class="catalogue_title fl catalogue_titleweight"
                                    >{{ chapter.name }}</span
                                  >
                                </li>
                                <div
                                  v-for="(hour, hourIndex) in chapter.hourList"
                                  :key="hour.hourId"
                                  class="inner-li"
                                >
                                  <li
                                    class="clearfix video"
                                    :class="{
                                      activeNode:
                                        activeNode ===
                                        `${chapterIndex + 1}.${hourIndex + 1}`
                                    }"
                                    @click="
                                      handleNodeClick(
                                        `${chapterIndex + 1}.${hourIndex + 1}`,
                                        hour
                                      )
                                    "
                                  >
                                    <span
                                      class="catalogue_title3 fl cataloguediv-l"
                                      ><b class="pl5 hour"
                                        >{{ chapterIndex + 1 }}.{{
                                          hourIndex + 1
                                        }}</b
                                      ></span
                                    >
                                    <div class="fl cataloguediv-c haveRe">
                                      <span
                                        :title="hour.title"
                                        class="catalogue_title"
                                        >{{ hour.title }}</span
                                      >
                                      <div class="resource-box clearfix">
                                        <div class="resource-text">
                                          必学 <span>{{ hour.finished }}</span
                                          >/1
                                        </div>
                                        <div class="resource-bar">
                                          <div
                                            role="progressbar"
                                            :aria-valuenow="hour.finished * 100"
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                            class="el-progress el-progress--line"
                                          >
                                            <div class="el-progress-bar">
                                              <div
                                                class="el-progress-bar__outer"
                                                style="height: 6px"
                                              >
                                                <div
                                                  class="el-progress-bar__inner"
                                                  :style="{
                                                    width:
                                                      hour.finished * 100 + '%'
                                                  }"
                                                />
                                              </div>
                                            </div>
                                            <div
                                              class="el-progress__text"
                                              style="font-size: 14.4px"
                                            >
                                              {{ hour.finished * 100 }}%
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="progress" />
                                    <em class="Sectionmark-em" />
                                    <div class="icon-box">
                                      <div
                                        v-if="hour.finished === 1"
                                        class="isFinish"
                                      >
                                        <img
                                          src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/e72ded52758742c186763c64f841692d.png"
                                          alt=""
                                        />
                                      </div>
                                    </div>
                                  </li>
                                </div>
                              </template>

                              <!-- 如果没有数据则显示加载中 -->
                              <li
                                v-if="
                                  loading ||
                                  !courseDetail?.courseChapterList?.length
                                "
                                class="clearfix chapter"
                              >
                                <span
                                  class="catalogue_title fl catalogue_titleweight"
                                >
                                  {{ loading ? "加载中..." : "暂无章节数据" }}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div class="el-scrollbar__bar is-horizontal">
                        <div
                          class="el-scrollbar__thumb"
                          style="transform: translateX(0%)"
                        />
                      </div>
                      <div class="el-scrollbar__bar is-vertical">
                        <div
                          class="el-scrollbar__thumb"
                          style="transform: translateY(0%)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  data-v-4f948fdc=""
                  class="el-dialog__wrapper wxtsPop"
                  tiptype=""
                  style="display: none"
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="温馨提示"
                    class="el-dialog newAiPop wxtsPop"
                    style="margin-top: 15vh; width: 30.2083vw"
                  >
                    <div class="el-dialog__header">
                      <span class="el-dialog__title">温馨提示</span
                      ><button
                        type="button"
                        aria-label="Close"
                        class="el-dialog__headerbtn"
                      >
                        <i class="el-dialog__close el-icon el-icon-close" />
                      </button>
                    </div>
                    <!---->
                    <div class="el-dialog__footer">
                      <div data-v-4f948fdc="" class="btn-list">
                        <div data-v-4f948fdc="" class="btn primary">
                          我知道了
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 掌握度 -->
        <div
          v-show="activeMenu == 'mastery'"
          data-v-487e2460=""
          data-v-2cf49992=""
          class="mastery-page-content light"
        >
          <div
            data-v-487e2460=""
            class="mastery-content-left"
            style="width: 100%"
          >
            <div data-v-487e2460="" class="left-scroll">
              <ul data-v-487e2460="" class="mastery-data-ul">
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">知识点总数</span
                  ><span data-v-487e2460="" class="num">{{
                    studyEffectData.knowledgePointNum || 0
                  }}</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">重点数量</span
                  ><span data-v-487e2460="" class="num">{{
                    studyEffectData.keyPointNum || 0
                  }}</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">难点数量</span
                  ><span data-v-487e2460="" class="num">{{
                    studyEffectData.difficultPointNum || 0
                  }}</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">概念数量</span
                  ><span data-v-487e2460="" class="num">{{
                    studyEffectData.conceptNum || 0
                  }}</span>
                </li>
              </ul>

              <div
                v-if="
                  studyEffectData.chapterList &&
                  studyEffectData.chapterList.length > 0
                "
              >
                <div
                  v-for="(chapter, index) in studyEffectData.chapterList"
                  :key="index"
                  class="chapter-section"
                >
                  <h2>{{ chapter.chapterName }}</h2>

                  <!-- 重点部分 -->
                  <div
                    v-if="
                      chapter.keyPointArray && chapter.keyPointArray.length > 0
                    "
                    class="point-section"
                  >
                    <h3>重点</h3>
                    <div
                      v-for="(item, idx) in chapter.keyPointArray"
                      :key="'key-' + idx"
                      class="point-item"
                    >
                      <div class="point-title">{{ item.title }}</div>
                      <div class="point-content">{{ item.content }}</div>
                    </div>
                  </div>

                  <!-- 难点部分 -->
                  <div
                    v-if="
                      chapter.difficultPointArray &&
                      chapter.difficultPointArray.length > 0
                    "
                    class="point-section"
                  >
                    <h3>难点</h3>
                    <div
                      v-for="(item, idx) in chapter.difficultPointArray"
                      :key="'diff-' + idx"
                      class="point-item"
                    >
                      <div class="point-title">{{ item.title }}</div>
                      <div class="point-content">{{ item.content }}</div>
                    </div>
                  </div>

                  <!-- 知识点部分 -->
                  <div
                    v-if="
                      chapter.knowledgeArray &&
                      chapter.knowledgeArray.length > 0
                    "
                    class="point-section"
                  >
                    <h3>知识点</h3>
                    <div
                      v-for="(item, idx) in chapter.knowledgeArray"
                      :key="'know-' + idx"
                      class="point-item"
                    >
                      <div class="point-title">{{ item.title }}</div>
                      <div class="point-content">{{ item.content }}</div>
                    </div>
                  </div>

                  <!-- 概念部分 -->
                  <div
                    v-if="
                      chapter.ConceptArray && chapter.chapterList.length > 0
                    "
                    class="point-section"
                  >
                    <h3>概念</h3>
                    <div
                      v-for="(item, idx) in chapter.ConceptArray"
                      :key="'con-' + idx"
                      class="point-item"
                    >
                      <div class="point-title">{{ item.title }}</div>
                      <div class="point-content">{{ item.content }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 如果没有章节数据，显示无数据提示 -->
              <div v-else class="no-data">暂无学习效果数据</div>
            </div>
          </div>
          <div v-if="false" data-v-487e2460="" class="mastery-content-right">
            <div data-v-b3b486ce="" data-v-487e2460="" class="mastery-box">
              <div data-v-b3b486ce="" class="mastery-status">
                <div data-v-b3b486ce="" class="mastery-status-item">
                  <span data-v-b3b486ce="" class="status green" />
                  <span data-v-b3b486ce="" class="name">掌握较好</span>
                  <span data-v-b3b486ce="" class="score">100-80(含)</span>
                </div>
                <div data-v-b3b486ce="" class="mastery-status-item">
                  <span data-v-b3b486ce="" class="status origin" />
                  <span data-v-b3b486ce="" class="name">掌握一般</span>
                  <span data-v-b3b486ce="" class="score">80-60(含)</span>
                </div>
                <div data-v-b3b486ce="" class="mastery-status-item">
                  <span data-v-b3b486ce="" class="status pink" />
                  <span data-v-b3b486ce="" class="name">薄弱点</span>
                  <span data-v-b3b486ce="" class="score">60-0(不含)</span>
                </div>
                <div data-v-b3b486ce="" class="mastery-status-item">
                  <span data-v-b3b486ce="" class="status gray" />
                  <span data-v-b3b486ce="" class="name">遗漏点</span>
                  <span data-v-b3b486ce="" class="score">0</span>
                </div>
                <div data-v-b3b486ce="" class="mastery-status-item">
                  <span data-v-b3b486ce="" class="status blue" />
                  <span data-v-b3b486ce="" class="name">免考</span>
                  <span data-v-b3b486ce="" class="score" />
                </div>
              </div>
              <div data-v-b3b486ce="" class="mastery-content">
                <h1 data-v-b3b486ce="" class="mastery-name">
                  <svg
                    data-v-b3b486ce=""
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewbox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      data-v-b3b486ce=""
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M11.0317 3.57909C10.746 2.80697 9.65396 2.80697 9.36825 3.57909L7.94617 7.4222C7.85634 7.66495 7.66495 7.85634 7.4222 7.94617L3.57909 9.36825C2.80697 9.65396 2.80697 10.746 3.57909 11.0318L7.4222 12.4538C7.66495 12.5437 7.85634 12.735 7.94617 12.9778L9.36825 16.8209C9.65396 17.593 10.746 17.593 11.0318 16.8209L12.4538 12.9778C12.5437 12.735 12.735 12.5437 12.9778 12.4538L16.8209 11.0317C17.593 10.746 17.593 9.65396 16.8209 9.36825L12.9778 7.94617C12.735 7.85634 12.5437 7.66495 12.4538 7.4222L11.0317 3.57909ZM17.8159 14.0895C17.673 13.7035 17.127 13.7035 16.9841 14.0895L16.2731 16.0111C16.2282 16.1325 16.1325 16.2282 16.0111 16.2731L14.0895 16.9841C13.7035 17.127 13.7035 17.673 14.0895 17.8159L16.0111 18.5269C16.1325 18.5718 16.2282 18.6675 16.2731 18.7889L16.9841 20.7105C17.127 21.0965 17.673 21.0965 17.8159 20.7105L18.5269 18.7889C18.5718 18.6675 18.6675 18.5718 18.7889 18.5269L20.7105 17.8159C21.0965 17.673 21.0965 17.127 20.7105 16.9841L18.7889 16.2731C18.6675 16.2282 18.5718 16.1325 18.5269 16.0111L17.8159 14.0895Z"
                      :fill="currentTheme === 'dark' ? '#fff' : '#604FFD'"
                    /></svg
                  >完整准确领会总体国家安全观
                </h1>
                <ul data-v-b3b486ce="" class="chunk-list">
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce=""
                      ><span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-8164"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >中国共产党国家安全思想的演进</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce=""
                      ><span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-6319"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >总体国家安全观的形成和发展</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce=""
                      ><span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-3385"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >创造性提出总体国家安全观的重大意义</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce=""
                      ><span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-4253"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >总体国家安全观的"十个坚持"</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce="">
                      <div
                        id="el-popover-2183"
                        role="tooltip"
                        aria-hidden="true"
                        class="el-popover el-popper mastery-box-custom-popover"
                        tabindex="0"
                        style="display: none"
                      >
                        <!---->
                        <div data-v-b3b486ce="" class="custom-content">
                          <strong data-v-b3b486ce="" class="name"
                            >总体国家安全观的"五个统筹"</strong
                          >
                          <div data-v-b3b486ce="" class="text">
                            掌握度：
                            <span data-v-b3b486ce="">100%</span>
                            <button
                              data-v-b3b486ce=""
                              type="button"
                              class="el-button btn el-button--primary"
                            >
                              <!---->
                              <!----><span
                                ><span data-v-b3b486ce="">提升掌握度</span>
                                <svg
                                  data-v-b3b486ce=""
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewbox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    data-v-b3b486ce=""
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M17.3759 18.2505C17.943 18.2505 18.4028 17.7908 18.4028 17.2237L18.4028 7.05826C18.4028 6.49114 17.943 6.0314 17.3759 6.0314L7.2105 6.0314C6.64338 6.0314 6.18364 6.49114 6.18364 7.05826C6.18364 7.62538 6.64338 8.08512 7.2105 8.08512L14.8968 8.08512L6.84745 16.1345C6.44644 16.5355 6.44644 17.1857 6.84745 17.5867C7.24846 17.9877 7.89864 17.9877 8.29965 17.5867L16.349 9.53732L16.349 17.2237C16.349 17.7908 16.8088 18.2505 17.3759 18.2505Z"
                                    fill="white"
                                  /></svg
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-2183"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >总体国家安全观的"五个统筹"</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce="">
                      <div
                        id="el-popover-8271"
                        role="tooltip"
                        aria-hidden="true"
                        class="el-popover el-popper mastery-box-custom-popover"
                        tabindex="0"
                        style="display: none"
                      >
                        <!---->
                        <div data-v-b3b486ce="" class="custom-content">
                          <strong data-v-b3b486ce="" class="name"
                            >总体国家安全观涵盖的重点领域</strong
                          >
                          <div data-v-b3b486ce="" class="text">
                            掌握度：
                            <span data-v-b3b486ce="">80%</span>
                            <button
                              data-v-b3b486ce=""
                              type="button"
                              class="el-button btn el-button--primary"
                            >
                              <!---->
                              <!----><span
                                ><span data-v-b3b486ce="">提升掌握度</span>
                                <svg
                                  data-v-b3b486ce=""
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewbox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    data-v-b3b486ce=""
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M17.3759 18.2505C17.943 18.2505 18.4028 17.7908 18.4028 17.2237L18.4028 7.05826C18.4028 6.49114 17.943 6.0314 17.3759 6.0314L7.2105 6.0314C6.64338 6.0314 6.18364 6.49114 6.18364 7.05826C6.18364 7.62538 6.64338 8.08512 7.2105 8.08512L14.8968 8.08512L6.84745 16.1345C6.44644 16.5355 6.44644 17.1857 6.84745 17.5867C7.24846 17.9877 7.89864 17.9877 8.29965 17.5867L16.349 9.53732L16.349 17.2237C16.349 17.7908 16.8088 18.2505 17.3759 18.2505Z"
                                    fill="white"
                                  /></svg
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-8271"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >总体国家安全观涵盖的重点领域</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                  <li data-v-b3b486ce="" class="item-box green">
                    <span data-v-b3b486ce="">
                      <div
                        id="el-popover-1237"
                        role="tooltip"
                        aria-hidden="true"
                        class="el-popover el-popper mastery-box-custom-popover"
                        tabindex="0"
                        style="display: none"
                      >
                        <!---->
                        <div data-v-b3b486ce="" class="custom-content">
                          <strong data-v-b3b486ce="" class="name"
                            >总体国家安全观的基本特征</strong
                          >
                          <div data-v-b3b486ce="" class="text">
                            掌握度：
                            <span data-v-b3b486ce="">80%</span>
                            <button
                              data-v-b3b486ce=""
                              type="button"
                              class="el-button btn el-button--primary"
                            >
                              <!---->
                              <!----><span
                                ><span data-v-b3b486ce="">提升掌握度</span>
                                <svg
                                  data-v-b3b486ce=""
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewbox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    data-v-b3b486ce=""
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M17.3759 18.2505C17.943 18.2505 18.4028 17.7908 18.4028 17.2237L18.4028 7.05826C18.4028 6.49114 17.943 6.0314 17.3759 6.0314L7.2105 6.0314C6.64338 6.0314 6.18364 6.49114 6.18364 7.05826C6.18364 7.62538 6.64338 8.08512 7.2105 8.08512L14.8968 8.08512L6.84745 16.1345C6.44644 16.5355 6.44644 17.1857 6.84745 17.5867C7.24846 17.9877 7.89864 17.9877 8.29965 17.5867L16.349 9.53732L16.349 17.2237C16.349 17.7908 16.8088 18.2505 17.3759 18.2505Z"
                                    fill="white"
                                  /></svg
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <span class="el-popover__reference-wrapper"
                        ><span
                          data-v-b3b486ce=""
                          class="item-box-name el-popover__reference"
                          aria-describedby="el-popover-1237"
                          tabindex="0"
                          ><span data-v-b3b486ce="" class="z-line-2"
                            >总体国家安全观的基本特征</span
                          ></span
                        ></span
                      ></span
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 课程问答页面 -->
        <div
          v-show="activeMenu === 'course-qa'"
          data-v-2cf49992=""
          class="course-qa-wrapper"
          :class="currentTheme"
        >
          <!-- 头部 -->
          <div
            data-v-3e66491d=""
            data-v-cebc91e2=""
            class="layout-header"
            :class="currentTheme"
            isatlas="1"
            style="z-index: 10"
          >
            <div
              id="header-content-layout only-filter"
              data-v-3e66491d=""
              class="header-content"
            >
              <div data-v-3e66491d="" class="item header-left">
                <div
                  data-v-3e66491d=""
                  class="item header-back"
                  @click="goBack"
                >
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time">{{
                  currentDate
                }}</span>
                <div data-v-3e66491d="" class="theme-mode" @click="toggleTheme">
                  <ThemeSunIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                  />
                  <ThemeMoonIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                  />
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-center">
                <div
                  data-v-cebc91e2=""
                  data-v-3e66491d=""
                  class="study-mode custom-mode"
                >
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                    style="margin: 0 auto"
                  >
                    课程问答
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <li data-v-3e66491d="" style="margin-left: 1.875vw">
                    <ul
                      data-v-3e66491d=""
                      role="menubar"
                      class="fu-header-users el-menu--horizontal el-menu"
                    >
                      <li
                        data-v-3e66491d=""
                        role="menuitem"
                        aria-haspopup="true"
                        class="el-submenu"
                        tabindex="0"
                      >
                        <div
                          class="el-submenu__title"
                          style="border-bottom-color: transparent"
                        >
                          <div data-v-3e66491d="" class="avatar-info">
                            <img
                              data-v-3e66491d=""
                              :src="userAvatar"
                              alt=""
                              class="avatar"
                            />
                            <span data-v-3e66491d="" class="name">{{
                              userNickname
                            }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-down"
                          />
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="course-qa-container" :class="currentTheme">
            <!-- 两列布局 -->
            <div class="qa-content-layout">
              <!-- 左侧区域 - 统计和历史 -->
              <div class="qa-content-left">
                <div class="left-scroll">
                  <!-- 统计数据 -->
                  <ul class="qa-data-ul">
                    <li>
                      <span class="text">累计提问</span>
                      <span class="num">{{ qaStats.totalQuestions || 0 }}</span>
                    </li>
                    <li>
                      <span class="text">已解决问题</span>
                      <span class="num">{{
                        qaStats.solvedQuestions || 0
                      }}</span>
                    </li>
                    <li>
                      <span class="text">解答率</span>
                      <span class="num">{{ qaStats.solveRate || "0%" }}</span>
                    </li>
                    <li>
                      <span class="text">平均响应时间</span>
                      <span class="num">{{
                        qaStats.avgResponseTime || "0分钟"
                      }}</span>
                    </li>
                  </ul>

                  <!-- 历史问答 -->
                  <div class="qa-history-container">
                    <h3 class="qa-section-title">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.5 2C4.01472 2 2 4.01472 2 6.5V17.5C2 19.9853 4.01472 22 6.5 22H17.5C19.9853 22 22 19.9853 22 17.5V6.5C22 4.01472 19.9853 2 17.5 2H6.5ZM6 7.5C6 7.22386 6.22386 7 6.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H6.5C6.22386 8 6 7.77614 6 7.5ZM6.5 11C6.22386 11 6 11.2239 6 11.5C6 11.7761 6.22386 12 6.5 12H17.5C17.7761 12 18 11.7761 18 11.5C18 11.2239 17.7761 11 17.5 11H6.5ZM6 15.5C6 15.2239 6.22386 15 6.5 15H13.5C13.7761 15 14 15.2239 14 15.5C14 15.7761 13.7761 16 13.5 16H6.5C6.22386 16 6 15.7761 6 15.5Z"
                          :fill="currentTheme === 'dark' ? '#fff' : '#604FFD'"
                        />
                      </svg>
                      历史问答
                    </h3>

                    <div
                      v-if="qaHistoryList.length > 0"
                      class="qa-history-list"
                    >
                      <div
                        v-for="(item, index) in qaHistoryList"
                        :key="index"
                        class="qa-history-item"
                        :class="{ active: selectedHistoryItem === index }"
                        @click="selectHistoryItem(index)"
                      >
                        <div class="qa-history-title">{{ item.question }}</div>
                        <div class="qa-history-time">
                          {{ formatDate(item.timestamp) }}
                        </div>
                      </div>
                    </div>
                    <div v-else class="qa-empty-history">
                      <p>暂无历史问答</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧区域 - 聊天 -->
              <div class="qa-content-right">
                <div class="qa-chat-container">
                  <div class="qa-chat-header">
                    <h3>课程问答</h3>
                    <p>向教师提问，或使用AI智能解答</p>
                  </div>

                  <!-- 聊天区域 -->
                  <div ref="chatBodyRef" class="qa-chat-body">
                    <div
                      v-if="chatMessages.length > 0"
                      class="qa-chat-messages"
                    >
                      <div
                        v-for="(message, index) in chatMessages"
                        :key="index"
                        class="qa-message-item"
                        :class="message.role"
                      >
                        <div class="qa-message-avatar">
                          <img
                            :src="
                              message.role === 'user'
                                ? userAvatar
                                : 'https://image.zhihuishu.com/zhs/zd/avatar/202411/b901eb69b7a744b4bc784e7a45e6b69d_s3.png'
                            "
                            alt="Avatar"
                          />
                        </div>
                        <div class="qa-message-content">
                          <div class="qa-message-name">
                            {{
                              message.role === "user"
                                ? userNickname
                                : "智能助手"
                            }}
                          </div>
                          <div
                            class="qa-message-text"
                            v-html="parseMarkdown(message.content)"
                          />
                          <div class="qa-message-time">
                            {{ formatMessageTime(message.timestamp) }}
                          </div>
                        </div>
                      </div>
                      <!-- 正在输入提示 -->
                      <div v-if="isTyping" class="qa-typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div v-else class="qa-empty-chat">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 1.5 0 2.921-.33 4.21-.92l3.715 1.483a1 1 0 001.317-1.024l-.473-4.593A9.96 9.96 0 0022 12c0-5.523-4.477-10-10-10zm0 18a8 8 0 110-16 8 8 0 010 16z"
                          fill="#604FFD"
                        />
                        <circle cx="8" cy="10" r="1.5" fill="#604FFD" />
                        <circle cx="12" cy="10" r="1.5" fill="#604FFD" />
                        <circle cx="16" cy="10" r="1.5" fill="#604FFD" />
                      </svg>
                      <p>暂无对话，发送第一条消息开始聊天</p>
                    </div>
                  </div>

                  <!-- 输入区域 -->
                  <div class="qa-chat-footer">
                    <div class="qa-input-wrapper">
                      <div
                        class="qa-input disabled"
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #999;
                          cursor: not-allowed;
                          background-color: #f5f5f5;
                          height: 100%;
                        "
                      >
                        教师已关闭讨论功能
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 课程成绩页面 -->
        <div
          v-show="activeMenu === 'grades'"
          data-v-2cf49992=""
          class="course-grades-wrapper"
          :class="currentTheme"
        >
          <!-- 头部 -->
          <div
            data-v-3e66491d=""
            data-v-cebc91e2=""
            class="layout-header"
            :class="currentTheme"
            isatlas="1"
            style="z-index: 10"
          >
            <div
              id="header-content-layout only-filter"
              data-v-3e66491d=""
              class="header-content"
            >
              <div data-v-3e66491d="" class="item header-left">
                <div
                  data-v-3e66491d=""
                  class="item header-back"
                  @click="goBack"
                >
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time">{{
                  currentDate
                }}</span>
                <div data-v-3e66491d="" class="theme-mode" @click="toggleTheme">
                  <ThemeSunIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'light' ? '#604FFD' : '#B4B4C7'"
                  />
                  <ThemeMoonIcon
                    data-v-3e66491d=""
                    :fill="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                    :stroke="currentTheme === 'dark' ? '#604FFD' : '#B4B4C7'"
                  />
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-center">
                <div
                  data-v-cebc91e2=""
                  data-v-3e66491d=""
                  class="study-mode custom-mode"
                >
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                    style="margin: 0 auto"
                  >
                    课程成绩
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <li data-v-3e66491d="" style="margin-left: 1.875vw">
                    <ul
                      data-v-3e66491d=""
                      role="menubar"
                      class="fu-header-users el-menu--horizontal el-menu"
                    >
                      <li
                        data-v-3e66491d=""
                        role="menuitem"
                        aria-haspopup="true"
                        class="el-submenu"
                        tabindex="0"
                      >
                        <div
                          class="el-submenu__title"
                          style="border-bottom-color: transparent"
                        >
                          <div data-v-3e66491d="" class="avatar-info">
                            <img
                              data-v-3e66491d=""
                              :src="userAvatar"
                              alt=""
                              class="avatar"
                            />
                            <span data-v-3e66491d="" class="name">{{
                              userNickname
                            }}</span>
                          </div>
                          <i
                            class="el-submenu__icon-arrow el-icon-arrow-down"
                          />
                        </div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="course-grades-container" :class="currentTheme">
            <div class="grades-content">
              <!-- 成绩卡片 -->
              <div class="grades-cards">
                <div class="grades-card" :class="currentTheme">
                  <div class="grades-card-header">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path
                        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                      />
                    </svg>
                    <h3>课时成绩</h3>
                  </div>
                  <div class="grades-card-content">
                    <div v-if="courseScores" class="grades-score">
                      {{ courseScores.courseScore || 0 }}
                    </div>
                    <div v-else class="grades-loading">
                      <el-skeleton :rows="1" />
                    </div>
                  </div>
                </div>

                <div class="grades-card" :class="currentTheme">
                  <div class="grades-card-header">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <h3>作业成绩</h3>
                  </div>
                  <div class="grades-card-content">
                    <div v-if="courseScores" class="grades-score">
                      {{ courseScores.workScore || 0 }}
                    </div>
                    <div v-else class="grades-loading">
                      <el-skeleton :rows="1" />
                    </div>
                  </div>
                </div>

                <div class="grades-card" :class="currentTheme">
                  <div class="grades-card-header">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                    <h3>考试成绩</h3>
                  </div>
                  <div class="grades-card-content">
                    <div v-if="courseScores" class="grades-score">
                      {{ courseScores.examScore || 0 }}
                    </div>
                    <div v-else class="grades-loading">
                      <el-skeleton :rows="1" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 成绩图表 -->
              <div class="grades-chart-container" :class="currentTheme">
                <div class="grades-chart-header">
                  <h3>成绩分布</h3>
                </div>
                <div class="grades-chart-content">
                  <div ref="gradesChartRef" class="grades-chart" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  getCourseDetail,
  reportCourseLesson,
  getCourseScore,
  CourseScoreResult,
  getCourseStudyEffect
} from "@/api/frontend/course";
import {
  courseAIChatStream,
  getConversationHistory
} from "@/api/frontend/chat";
import {
  getUserCourseHomeworkList,
  getUserCourseExamList
} from "@/api/frontend/work";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";

import { ElMessage } from "element-plus";
import CourseLearnIcon from "@/assets/course-icons/course-learn-new.svg?component";
import MasteryIcon from "@/assets/course-icons/mastery-new.svg?component";
import CourseQaIcon from "@/assets/course-icons/course-qa-new.svg?component";
import HomeworkExamIcon from "@/assets/course-icons/homework-exam-new.svg?component";
import GradesIcon from "@/assets/course-icons/grades.svg?component";
import AiDocQaIcon from "@/assets/course-icons/ai-doc-qa-new.svg?component";
import CourseMaterialsIcon from "@/assets/course-icons/course-materials-new.svg?component";
import ThemeSunIcon from "@/assets/course-icons/theme-sun.svg?component";
import ThemeMoonIcon from "@/assets/course-icons/theme-moon.svg?component";
import SeekLeftIcon from "@/assets/course-icons/seek-left.svg?component";
import SeekRightIcon from "@/assets/course-icons/seek-right.svg?component";
import SendIcon from "@/assets/course-icons/send-icon.svg?component";
import NotExpandIcon from "@/assets/course-icons/not-expand-icon.svg?component";
import AddNewTalkIcon from "@/assets/course-icons/add-new-talk-icon.svg?component";
import NotSendBtnIcon from "@/assets/course-icons/not-send-btn.svg?component";
import StudyBeforeReadingIcon from "@/assets/course-icons/study-before-reading-icon.svg?component";
import PicInPicIcon from "@/assets/course-icons/pic-in-pic-icon.svg?component";
import * as echarts from "echarts";

const router = useRouter();
const route = useRoute();
const courseId = computed(() => Number(route.params.id));
const courseDetail = ref(null);
const loading = ref(false);
const currentTheme = ref("light");
const activeMenu = ref("course-learn");
const isContentCollapsed = ref(false);
const activeResourceTab = ref("required");
const courseAttrList = ref([]); // 课程资料列表
// 作业考试相关
const homeworkExamTab = ref("homework");
const homeworkList = ref([]);
const examList = ref([]);
// 移除了图谱模式，所以不再需要activeMode变量
// const activeMode = ref("0");
const activeNode = ref("1.1");
const currentVideoUrl = ref("");
const videoPlayer = ref(null);
const autoPlayOnLoad = ref(false);
const currentHour = ref(null);
const isAiDialogVisible = ref(false);
const masteryChartRef = ref(null); // 添加图表引用
let masteryChart = null; // 添加图表实例变量

// 课程成绩相关
const courseScores = ref<CourseScoreResult | null>(null);
const gradesLoading = ref(false);
const gradesChartRef = ref(null);

// 课程问答相关数据
const chatBodyRef = ref(null);
const selectedHistoryItem = ref(-1);
const qaHistoryList = ref([]);
const qaStats = ref({
  totalQuestions: 12,
  solvedQuestions: 10,
  solveRate: "83%",
  avgResponseTime: "5分钟"
});

// 获取本地存储的用户信息
const userInfo = storageLocal().getItem(userKey) || {};
const userAvatar = ref(
  (userInfo as any)?.avatar ||
    "https://image.zhihuishu.com/zhs/zd/avatar/202411/b901eb69b7a744b4bc784e7a45e6b69d_s3.png"
);
const userNickname = ref(
  (userInfo as any)?.nickname || (userInfo as any)?.username || "用户"
);

// 添加AI聊天相关状态
const conversationId = ref("");
const chatMessages = ref<
  Array<{ role: string; content: string; timestamp: string }>
>([]);
const currentMessage = ref("");
const sendingMessage = ref(false);
const streamResponse = ref("");
const isTyping = ref(false);
const cancelStreamRequest = ref<() => void | null>(null);

const describeImgSrc = computed(() =>
  currentTheme.value === "dark"
    ? "https://image.zhihuishu.com/zhs/b2cm/base1/202408/7e6f3450c9fc44bc8dfd380ea2aa2c24.png"
    : "https://image.zhihuishu.com/zhs/b2cm/base1/202411/33b30e1359074b389417c68c5c898253.png"
);

// 当前播放视频的标题
const currentVideoTitle = computed(() => {
  return (
    currentHour.value?.title || courseDetail.value?.courseName || "加载中..."
  );
});

// 当前日期，格式化为"年月日"
const currentDate = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
});

// 获取课程详情
const fetchCourseDetail = async () => {
  if (!courseId.value) return;

  loading.value = true;
  try {
    const { code, data, msg } = await getCourseDetail({
      courseId: courseId.value
    });

    if (code === 200 && data) {
      courseDetail.value = data;
      console.log("课程详情数据:", data);

      // 加载课程资料数据
      if (data.courseAttrList) {
        courseAttrList.value = data.courseAttrList;
      }

      // 默认加载第一个章节的第一个课时视频
      if (data.courseChapterList && data.courseChapterList.length > 0) {
        const firstChapter = data.courseChapterList[0];
        if (firstChapter.hourList && firstChapter.hourList.length > 0) {
          const firstHour = firstChapter.hourList[0];
          currentHour.value = firstHour; // 保存当前课时信息
          currentVideoUrl.value = firstHour.fileUrl;
          activeNode.value = "1.1"; // 默认选中第一个节点
          autoPlayOnLoad.value = true; // 设置标记以在视频加载后自动播放
        }
      }
    } else {
      ElMessage.error(msg || "获取课程详情失败");
    }
  } catch (error) {
    console.error("获取课程详情出错:", error);
    ElMessage.error("获取课程详情数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 添加资源标签切换函数
const handleResourceTabClick = (tab: string) => {
  activeResourceTab.value = tab;
};

// 获取课程资料类型名称
const getMaterialTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    IMAGE: "图片",
    VIDEO: "视频",
    DOCUMENT: "文档",
    PDF: "PDF文档",
    AUDIO: "音频"
  };
  return typeMap[type] || "其他资源";
};

// 查看课程资料
const viewMaterial = (material: any) => {
  if (material && material.fileUrl) {
    window.open(material.fileUrl, "_blank");
  }
};

// 添加折叠处理函数
const toggleContent = () => {
  isContentCollapsed.value = !isContentCollapsed.value;
};

// 作业考试相关方法
// 获取作业列表
const fetchHomeworkList = async () => {
  if (!courseId.value) return;

  try {
    const { code, data, msg } = await getUserCourseHomeworkList({
      courseId: courseId.value
    });

    if (code === 200 && data && data.list) {
      homeworkList.value = data.list;
    } else {
      ElMessage.error(msg || "获取作业列表失败");
    }
  } catch (error) {
    console.error("获取作业列表出错:", error);
    ElMessage.error("获取作业列表失败，请稍后重试");
  }
};

// 获取考试列表
const fetchExamList = async () => {
  if (!courseId.value) return;

  try {
    const { code, data, msg } = await getUserCourseExamList({
      courseId: courseId.value
    });

    if (code === 200 && data && data.list) {
      examList.value = data.list;
    } else {
      ElMessage.error(msg || "获取考试列表失败");
    }
  } catch (error) {
    console.error("获取考试列表出错:", error);
    ElMessage.error("获取考试列表失败，请稍后重试");
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 获取作业状态类型
const getHomeworkStatusType = (status: number) => {
  const typeMap: Record<
    number,
    "info" | "warning" | "success" | "danger" | "primary"
  > = {
    1: "info", // 未开始
    2: "warning", // 进行中
    3: "success", // 已完成
    4: "danger" // 已过期
  };
  return typeMap[status] || "info";
};

// 获取作业状态文本
const getHomeworkStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: "未开始",
    2: "进行中",
    3: "已完成",
    4: "已过期"
  };
  return textMap[status] || "未知状态";
};

// 获取考试状态类型
const getExamStatusType = (status: number) => {
  const typeMap: Record<
    number,
    "info" | "warning" | "success" | "danger" | "primary"
  > = {
    1: "info", // 未开始
    2: "warning", // 进行中
    3: "success", // 已完成
    4: "danger" // 已过期
  };
  return typeMap[status] || "info";
};

// 获取考试状态文本
const getExamStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: "未开始",
    2: "进行中",
    3: "已完成",
    4: "已过期"
  };
  return textMap[status] || "未知状态";
};

// 查看作业
const viewHomework = (homework: any) => {
  if (homework && homework.homeworkId) {
    // 只有状态为2(进行中)的作业可以查看
    if (homework.status === 2) {
      // 重定向到作业详情页
      router.push({
        path: `/account/homework-detail`,
        query: {
          homeworkId: homework.homeworkId,
          courseId: route.params.id
        }
      });
    } else {
      ElMessage.warning(`${getHomeworkStatusText(homework.status)}状态的作业不可查看`);
    }
  }
};

// 查看考试
const viewExam = (exam: any) => {
  if (exam && exam.examId) {
    // 只有状态为2(进行中)的考试可以查看
    if (exam.status === 2) {
      // 重定向到考试页面
      router.push({
        path: `/account/exam-detail`,
        query: {
          examId: exam.examId,
          courseId: route.params.id
        }
      });
    } else {
      ElMessage.warning(`${getExamStatusText(exam.status)}状态的考试不可查看`);
    }
  }
};

function toggleTheme() {
  const oldTheme = currentTheme.value;
  const newTheme = oldTheme === "light" ? "dark" : "light";

  // 切换容器主题
  const elements = document.querySelectorAll(`.${oldTheme}`);
  elements.forEach(el => {
    el.classList.remove(oldTheme);
    el.classList.add(newTheme);
  });

  // 切换 SVG 图标颜色
  const svgElements = document.querySelectorAll(".hover-box svg");
  svgElements.forEach(svg => {
    const parentElement = svg.closest(".hover-box");
    const menuItem = parentElement?.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === activeMenu.value;

    // 定义颜色
    const activeColor = newTheme === "dark" ? "white" : "#604FFD";
    const inactiveColor = newTheme === "dark" ? "#B4B4C7" : "#604FFD";
    const color = isCurrentActive ? activeColor : inactiveColor;

    // 设置整个SVG的stroke颜色
    svg.setAttribute("stroke", color);

    // 设置所有path和circle的填充颜色
    const elements = svg.querySelectorAll("path, circle, rect");
    elements.forEach(el => {
      if (el.getAttribute("fill") !== "none") {
        el.setAttribute("fill", color);
      }
      el.setAttribute("stroke", color);
    });
  });

  // 切换文字颜色
  const sideNames = document.querySelectorAll(".side-name");
  sideNames.forEach(name => {
    const element = name as HTMLElement;
    const menuItem = element.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === activeMenu.value;

    if (isCurrentActive) {
      // 当前选中的菜单项
      if (newTheme === "dark") {
        element.style.color = "white";
      } else {
        element.style.color = "#604FFD";
      }
    } else {
      // 未选中的菜单项
      if (newTheme === "dark") {
        element.style.color = "#B4B4C7";
      } else {
        element.style.color = "#604FFD";
      }
    }
  });

  currentTheme.value = newTheme;

  // 如果在掌握度页面，重新初始化图表以适应新主题
  if (activeMenu.value === "mastery" && masteryChart) {
    // 销毁旧图表
    masteryChart.dispose();
    masteryChart = null;
    // 重新初始化
    nextTick(() => {
      initMasteryChart();
    });
  }
}

// 添加菜单切换函数
function handleMenuClick(menuName: string) {
  activeMenu.value = menuName;

  // 如果视频正在播放且切换到了非课程学习菜单，则暂停视频
  if (menuName !== "course-learn" && videoPlayer.value) {
    if (!videoPlayer.value.paused) {
      videoPlayer.value.pause();
    }
  }

  // 当切换到作业考试菜单时，加载作业和考试数据
  if (menuName === "homework-exam") {
    fetchHomeworkList();
    fetchExamList();
  }

  // 当切换到成绩菜单时，加载成绩数据
  if (menuName === "grades") {
    fetchCourseScores();
  }

  // 更新 SVG 图标颜色
  const svgElements = document.querySelectorAll(".hover-box svg");
  svgElements.forEach(svg => {
    const parentElement = svg.closest(".hover-box");
    const menuItem = parentElement?.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === menuName;

    // 定义颜色
    const activeColor = currentTheme.value === "dark" ? "white" : "#604FFD";
    const inactiveColor = currentTheme.value === "dark" ? "#B4B4C7" : "#604FFD";
    const color = isCurrentActive ? activeColor : inactiveColor;

    // 设置整个SVG的stroke颜色
    svg.setAttribute("stroke", color);

    // 设置所有path和circle的填充颜色
    const elements = svg.querySelectorAll("path, circle, rect");
    elements.forEach(el => {
      if (el.getAttribute("fill") !== "none") {
        el.setAttribute("fill", color);
      }
      el.setAttribute("stroke", color);
    });
  });

  // 更新文字颜色
  const sideNames = document.querySelectorAll(".side-name");
  sideNames.forEach(name => {
    const element = name as HTMLElement;
    const menuItem = element.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === menuName;

    if (isCurrentActive) {
      // 当前选中的菜单项
      if (currentTheme.value === "dark") {
        element.style.color = "white";
      } else {
        element.style.color = "#604FFD";
      }
    } else {
      // 未选中的菜单项
      if (currentTheme.value === "dark") {
        element.style.color = "#B4B4C7";
      } else {
        element.style.color = "#604FFD";
      }
    }
  });

  // 如果切换到掌握度页面，初始化图表
  if (menuName === "mastery") {
    nextTick(() => {
      // 检查图表是否已经初始化
      if (!masteryChart && masteryChartRef.value) {
        initMasteryChart();
      } else if (masteryChart) {
        // 已初始化但可能需要刷新
        masteryChart.resize();
      }
    });
  }
}

// 已移除图谱模式，不再需要此函数
// function handleModeClick(mode: string) {
//   activeMode.value = mode;
// }

// 添加节点点击处理函数
function handleNodeClick(nodeId: string, hour: any) {
  activeNode.value = nodeId;
  if (hour && hour.fileUrl) {
    // 保存当前课时信息
    currentHour.value = hour;

    // 保存旧的视频URL，用于判断是否真的改变了视频
    const oldVideoUrl = currentVideoUrl.value;
    currentVideoUrl.value = hour.fileUrl;

    // 如果视频URL发生变化，设置标记以在视频加载后自动播放
    if (oldVideoUrl !== hour.fileUrl) {
      autoPlayOnLoad.value = true;
    }

    // 如果视频已经加载完成并且URL没变，则直接播放
    if (videoPlayer.value && oldVideoUrl === hour.fileUrl) {
      videoPlayer.value.currentTime = 0; // 重置到开头
      videoPlayer.value.play();
    }
  }
}

// 视频加载完成后的回调
function videoLoaded() {
  if (autoPlayOnLoad.value && videoPlayer.value) {
    videoPlayer.value.play();
    autoPlayOnLoad.value = false;
  }
}

// 视频播放完成后的回调
function videoEnded() {
  // 只有在视频播放完成且课时未完成时才上报进度
  if (currentHour.value && currentHour.value.finished !== 1) {
    reportProgress(currentHour.value.hourId);

    // 更新本地状态，避免重复上报
    currentHour.value.finished = 1;

    // 更新课程完成进度
    if (courseDetail.value) {
      courseDetail.value.finishedHours += 1;
    }

    ElMessage.success("学习进度已更新");
  }
}

// 上报学习进度
async function reportProgress(hourId: number) {
  try {
    await reportCourseLesson({
      courseId: courseId.value,
      hourId: hourId
    });
    console.log("学习进度上报成功");
  } catch (error) {
    console.error("学习进度上报失败:", error);
  }
}

// 返回上一页
const goBack = () => {
  router.back();
};

// 打开AI对话框
const openAiDialog = () => {
  isAiDialogVisible.value = true;
};

// 关闭AI对话框
const closeAiDialog = () => {
  isAiDialogVisible.value = false;

  // 如果有活跃的流请求，取消它
  if (cancelStreamRequest.value) {
    cancelStreamRequest.value();
    cancelStreamRequest.value = null;
  }
};

// 初始化聊天功能
const initChat = () => {
  // 生成或重用会话ID
  const storedConversationId = localStorage.getItem(`chat_${courseId.value}`);
  if (storedConversationId) {
    conversationId.value = storedConversationId;
    // 尝试加载历史记录，但不阻塞UI
    try {
      loadChatHistory();
    } catch (e) {
      console.warn("历史记录加载失败，将开始新对话", e);
      // 历史加载失败也没关系，继续使用空白对话
    }
  } else {
    // 简单生成唯一ID: 时间戳+随机数
    conversationId.value =
      Date.now().toString() + Math.random().toString(36).substring(2);
    localStorage.setItem(`chat_${courseId.value}`, conversationId.value);
    // 对于新对话不需要加载历史
  }
};

// 加载聊天历史
const loadChatHistory = async () => {
  try {
    const response = await getConversationHistory(conversationId.value);
    console.log("聊天历史响应:", response);
    // 从响应中提取正确的历史记录路径：data.data.history
    if (
      response &&
      response.code === 200 &&
      response.data &&
      response.data.history
    ) {
      chatMessages.value = response.data.history;
      // 滚动到底部
      nextTick(() => {
        scrollToBottomQA();
      });
    } else {
      console.log("没有历史聊天记录或格式不正确");
    }
  } catch (error) {
    console.error("加载聊天历史失败:", error);
    // 失败了也没关系，我们可以继续新的对话
  }
};

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim() || sendingMessage.value) return;

  const userMessage = currentMessage.value.trim();

  // 添加用户消息到聊天记录
  chatMessages.value.push({
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString()
  });

  // 清空输入框
  currentMessage.value = "";
  sendingMessage.value = true;
  streamResponse.value = "";

  // 先不显示isTyping，等请求启动后再显示

  // 滚动到底部
  nextTick(() => {
    scrollToBottomQA();
  });

  try {
    // 不再预先添加AI消息，而是等待第一个响应
    let aiMessageAdded = false;
    let currentResponseIndex = -1;

    // 现在显示"正在输入"状态
    isTyping.value = true;

    // 使用流式API
    cancelStreamRequest.value = courseAIChatStream(
      {
        course_id: courseId.value,
        conversation_id: conversationId.value,
        message: userMessage
      },
      data => {
        // 更新会话ID
        if (data.conversation_id) {
          conversationId.value = data.conversation_id;
          localStorage.setItem(`chat_${courseId.value}`, conversationId.value);
        }

        // 只有收到非空内容时才添加AI消息
        if (data.delta) {
          if (!aiMessageAdded) {
            // 收到第一个响应，隐藏"正在输入"提示
            isTyping.value = false;

            aiMessageAdded = true;
            currentResponseIndex = chatMessages.value.length;
            chatMessages.value.push({
              role: "ai",
              content: data.delta,
              timestamp: new Date().toISOString()
            });
          } else {
            // 累积响应内容
            chatMessages.value[currentResponseIndex].content += data.delta;
          }
        }

        // 流结束时
        if (data.finished) {
          sendingMessage.value = false;
          isTyping.value = false;
        }

        // 滚动到底部
        nextTick(() => {
          scrollToBottomQA();
        });
      }
    );
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送失败，请重试");

    // 添加错误消息
    chatMessages.value.push({
      role: "ai",
      content: "抱歉，发生了错误，请稍后重试。",
      timestamp: new Date().toISOString()
    });

    sendingMessage.value = false;
    isTyping.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  const scrollbar = document.querySelector(".ai-talk-box .el-scrollbar__wrap");
  if (scrollbar) {
    scrollbar.scrollTop = scrollbar.scrollHeight;
  }
};

// 简单的Markdown解析函数
const parseMarkdown = (text: string) => {
  if (!text) return "";

  // 处理粗体 **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 处理换行符
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

// 格式化消息时间
const formatMessageTime = (timestamp: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

// 选择历史聊天记录
const selectHistoryItem = (index: number) => {
  selectedHistoryItem.value = index;
  const selectedHistory = qaHistoryList.value[index];

  // 加载历史对话
  chatMessages.value = [
    {
      role: "user",
      content: selectedHistory.question,
      timestamp: selectedHistory.timestamp
    },
    {
      role: "ai",
      content: selectedHistory.answer,
      timestamp: selectedHistory.timestamp
    }
  ];

  // 滚动到底部
  nextTick(() => {
    scrollToBottomQA();
  });
};

// 滚动聊天窗口到底部
const scrollToBottomQA = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

// 初始化SVG图标和文字颜色
const initIconColors = () => {
  // 初始化SVG图标颜色
  const svgElements = document.querySelectorAll(".hover-box svg");
  svgElements.forEach(svg => {
    const parentElement = svg.closest(".hover-box");
    const menuItem = parentElement?.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === activeMenu.value;

    // 浅色模式下所有图标默认使用紫色
    const color = isCurrentActive ? "#604FFD" : "#604FFD";

    // 设置整个SVG的stroke颜色
    svg.setAttribute("stroke", color);

    // 设置所有path和circle的填充颜色
    const elements = svg.querySelectorAll("path, circle, rect");
    elements.forEach(el => {
      if (el.getAttribute("fill") !== "none") {
        el.setAttribute("fill", color);
      }
      el.setAttribute("stroke", color);
    });
  });

  // 初始化文字颜色
  const sideNames = document.querySelectorAll(".side-name");
  sideNames.forEach(name => {
    const element = name as HTMLElement;
    const menuItem = element.closest(".item");
    const currentMenuName = menuItem?.getAttribute("data-menu");
    const isCurrentActive = currentMenuName === activeMenu.value;

    // 设置文字颜色
    if (isCurrentActive) {
      element.style.color = "#604FFD"; // 选中状态为紫色
    } else {
      element.style.color = "#604FFD"; // 非选中也使用紫色
    }
  });
};

// 获取课程成绩
const fetchCourseScores = async () => {
  if (!courseId.value) return;
  gradesLoading.value = true;

  try {
    const response = await getCourseScore({ courseId: courseId.value });
    if (response && response.code === 200 && response.data) {
      courseScores.value = response.data;
      // 在DOM更新后初始化图表
      nextTick(() => {
        initGradesChart();
      });
    }
  } catch (error) {
    console.error("获取课程成绩失败:", error);
    ElMessage.error("获取成绩数据失败，请稍后重试");
  } finally {
    gradesLoading.value = false;
  }
};

// 初始化成绩图表
const initGradesChart = () => {
  if (!gradesChartRef.value || !courseScores.value) return;

  const gradeChart = echarts.init(gradesChartRef.value);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}"
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      data: ["课时成绩", "作业成绩", "考试成绩"]
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: courseScores.value.courseScore,
            name: "课时成绩",
            itemStyle: { color: "#41b6ff" }
          },
          {
            value: courseScores.value.workScore,
            name: "作业成绩",
            itemStyle: { color: "#e85f33" }
          },
          {
            value: courseScores.value.examScore,
            name: "考试成绩",
            itemStyle: { color: "#604ffd" }
          }
        ]
      }
    ]
  };

  gradeChart.setOption(option);

  // 处理窗口大小变化
  window.addEventListener("resize", () => {
    gradeChart.resize();
  });
};

// 初始化掌握度圆环图表
const initMasteryChart = () => {
  // 确保DOM已加载
  if (!masteryChartRef.value) return;

  // 初始化echarts实例
  masteryChart = echarts.init(masteryChartRef.value);

  // 基于legend数据构建图表数据
  const chartData = [
    {
      name: "掌握较好",
      value: 100.0,
      itemStyle: { color: "rgb(140, 229, 162)" }
    },
    {
      name: "掌握一般",
      value: 0.0,
      itemStyle: { color: "rgb(255, 203, 102)" }
    },
    { name: "薄弱点", value: 0.0, itemStyle: { color: "rgb(255, 162, 162)" } },
    { name: "遗漏点", value: 0.0, itemStyle: { color: "rgb(204, 204, 204)" } },
    { name: "免考", value: 0.0, itemStyle: { color: "rgb(143, 208, 255)" } }
  ];

  // 过滤掉数值为0的项，以便正确显示
  const filteredData = chartData.filter(item => item.value > 0);

  // 图表配置
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderWidth: 0,
      borderRadius: 16,
      textStyle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 700
      },
      padding: [12, 16],
      extraCssText: "backdrop-filter: blur(20px);"
    },
    series: [
      {
        name: "掌握度",
        type: "pie",
        radius: ["60%", "80%"], // 环形图的内外半径
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,
          borderColor: "#fff",
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 10
        },
        data:
          filteredData.length > 0
            ? filteredData
            : [
                // 如果没有数据，显示一个占位图
                {
                  value: 100,
                  name: "暂无数据",
                  itemStyle: { color: "#f0f0f0" }
                }
              ]
      }
    ]
  };

  // 应用配置
  masteryChart.setOption(option);

  // 添加窗口大小变化的自适应
  window.addEventListener("resize", () => {
    masteryChart?.resize();
  });
};

// 初始化课程问答历史数据
const initQAHistory = () => {
  // 模拟历史问答数据
  qaHistoryList.value = [
    {
      question: "这门课程的考核方式是什么？",
      answer:
        "本课程采用线上考试的方式进行考核，总成绩由平时作业（30%）、课堂表现（20%）和期末考试（50%）三部分构成。",
      timestamp: "2025-07-13T16:30:00Z"
    },
    {
      question: "如何理解计算机网络的OSI七层模型？",
      answer:
        "OSI七层模型从下到上分别是：物理层、数据链路层、网络层、传输层、会话层、表示层和应用层。各层有不同的功能：\n\n- 物理层：处理比特流传输\n- 数据链路层：负责节点之间的数据传输\n- 网络层：处理分组路由\n- 传输层：提供端到端的可靠数据传输\n- 会话层：建立、管理和终止会话\n- 表示层：数据格式转换、加密解密\n- 应用层：为应用程序提供网络服务",
      timestamp: "2025-07-13T15:45:00Z"
    },
    {
      question: "期末考试的范围是什么？",
      answer:
        "期末考试范围包括课程的所有章节内容，特别关注第3、4、7章的核心概念和应用案例。考试形式为线上闭卷，时间为90分钟。",
      timestamp: "2025-07-12T09:15:00Z"
    }
  ];
};

// 学习效果数据
const studyEffectData = ref({
  courseId: 0,
  keyPointNum: 0,
  difficultPointNum: 0,
  knowledgePointNum: 0,
  conceptNum: 0,
  chapterList: []
});

// 获取课程学习效果
const fetchCourseStudyEffect = async () => {
  try {
    const { data } = await getCourseStudyEffect({
      courseId: courseId.value
    });
    if (data.code === 200) {
      studyEffectData.value = data.data;
    }
  } catch (error) {
    console.error("获取课程学习效果失败", error);
  }
};

watch(
  () => activeMenu.value,
  newVal => {
    if (newVal === "mastery") {
      fetchCourseStudyEffect();
    }
    // ... existing code ...
  }
);

onMounted(async () => {
  // 获取课程ID
  courseId.value = Number(route.params.id);

  // 获取课程详情
  await fetchCourseDetail();

  // 初始化AI聊天
  initChat();

  // 初始化课程问答历史数据
  initQAHistory();

  // 如果当前是成绩菜单，加载成绩数据
  if (activeMenu.value === "grades") {
    fetchCourseScores();
  }

  // 等待DOM更新后初始化图表
  nextTick(() => {
    initIconColors();
    initMasteryChart(); // 初始化掌握度图表
  });
});
</script>

<style>
/* @import "@/../coursecss/css/chunk-1.css";
@import "@/../coursecss/css/chunk-2.css";
@import "@/../coursecss/css/chunk-3.css";
@import "@/../coursecss/css/chunk-5.css";
@import "@/../coursecss/css/app-1.css"; */

@import "@/../coursecss/css/chunk-b3e9f934.1c00050a.css";
@import "@/../coursecss/css/chunk-8cf7ce30.92e48af1.css";
@import "@/../coursecss/css/chunk-3cf64ec0.4f07a253.css";
@import "@/../coursecss/css/chunk-3248eec0.130a3cd9.css";
@import "@/../coursecss/css/app.a5f91bbb.css";
@import "@/../coursecss/css/chunk-b4b575b6.fcb08796.css";
</style>

<style scoped>
.header-back > i {
  margin-left: -1.5vw;
}
.layout-header .header-content .item[data-v-3e66491d] {
  padding: 0 2.5vw;
}
.el-menu--horizontal {
  height: 2.29167vw !important;
}
.avatar-info {
  display: flex;
  align-items: center;
}

/* 添加按钮旋转动画 */
.botton-box-down {
  transition: transform 0.3s ease;
  cursor: pointer;
}

/* 课程问答样式 */
.course-qa-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.course-qa-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 80px 20px 20px 120px; /* 增加上边距和左边距，避免被菜单遮挡 */
  background-color: #f5f7fa;
  height: calc(100vh - 125px);
}

.course-qa-container.dark {
  background-color: #1d1e1f;
  color: #fff;
}

.qa-content-layout {
  display: flex;
  height: 100%;
  gap: 20px;
  width: 100%;
}

.qa-content-left {
  width: 30%;
  min-width: 320px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dark .qa-content-left {
  background-color: #2a2a2a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.left-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.qa-data-ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding: 0;
  margin: 0 0 20px 0;
  list-style: none;
  width: 100%;
}

.qa-data-ul li {
  background-color: rgba(96, 79, 253, 0.1);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100px;
}

.dark .qa-data-ul li {
  background-color: #333;
}

.qa-data-ul .text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 700;
  line-height: 16px;
}

.dark .qa-data-ul .text {
  color: #bbb;
}

.qa-data-ul .num {
  font-size: 24px;
  font-weight: bold;
  color: #604ffd;
  line-height: 24px;
}

.qa-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.dark .qa-section-title {
  color: #fff;
}

.qa-history-container {
  margin-top: 20px;
}

.qa-history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qa-history-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.dark .qa-history-item {
  background-color: #333;
}

.qa-history-item:hover {
  background-color: #f0f0f0;
}

.dark .qa-history-item:hover {
  background-color: #444;
}

.qa-history-item.active {
  border-left-color: #604ffd;
  background-color: rgba(96, 79, 253, 0.1);
}

.dark .qa-history-item.active {
  background-color: rgba(96, 79, 253, 0.2);
}

.qa-history-title {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .qa-history-title {
  color: #fff;
}

.qa-history-time {
  font-size: 12px;
  color: #999;
}

.qa-empty-history {
  text-align: center;
  padding: 30px 0;
  color: #999;
}

.qa-content-right {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-width: calc(70% - 20px);
}

.dark .qa-content-right {
  background-color: #2a2a2a;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.qa-chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.qa-chat-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dark .qa-chat-header {
  border-bottom: 1px solid #3a3a3a;
}

.qa-chat-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.dark .qa-chat-header h3 {
  color: #fff;
}

.qa-chat-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.dark .qa-chat-header p {
  color: #bbb;
}

.qa-chat-body {
  height: 400px; /* 固定高度 */
  max-height: calc(100vh - 300px); /* 最大高度，适应不同屏幕 */
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.dark .qa-chat-body {
  background-color: #333;
}

.qa-chat-body::-webkit-scrollbar {
  width: 6px;
}

.qa-chat-body::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.2);
}

.qa-chat-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark .qa-chat-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.dark .qa-chat-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.qa-chat-messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  overflow-y: auto;
}

.qa-message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.qa-message-item.ai {
  align-self: flex-start;
}

.qa-message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.qa-message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.qa-message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qa-message-content {
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.dark .qa-message-content {
  background-color: #2a2a2a;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.qa-message-item.user .qa-message-content {
  background-color: #604ffd;
  color: #fff;
}

.dark .qa-message-item.user .qa-message-content {
  background-color: #604ffd;
}

.qa-message-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.dark .qa-message-name {
  color: #fff;
}

.qa-message-item.user .qa-message-name {
  color: #fff;
}

.qa-message-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.dark .qa-message-text {
  color: #ddd;
}

.qa-message-item.user .qa-message-text {
  color: #fff;
}

.qa-message-time {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 5px;
}

.qa-message-item.user .qa-message-time {
  color: rgba(255, 255, 255, 0.7);
}

.qa-empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 20px;
}

.qa-typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background-color: #f0f0f0;
  border-radius: 20px;
}

.dark .qa-typing-indicator {
  background-color: #444;
}

.qa-typing-indicator span {
  display: block;
  width: 8px;
  height: 8px;
  background-color: #604ffd;
  border-radius: 50%;
  animation: typing 1.4s infinite both;
}

.qa-typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.qa-typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

.qa-chat-footer {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0; /* 防止压缩 */
  background-color: #fff; /* 确保背景色 */
  position: relative; /* 相对定位 */
  z-index: 2; /* 确保在消息上方 */
}

.dark .qa-chat-footer {
  border-top: 1px solid #3a3a3a;
}

.qa-input-wrapper {
  display: flex;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 10px;
}

.dark .qa-input-wrapper {
  background-color: #333;
}

.qa-input {
  flex: 1;
  border: none;
  background: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  font-family: inherit;
}

.dark .qa-input {
  color: #fff;
}

.qa-input::placeholder {
  color: #999;
}

.qa-send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #604ffd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-left: 10px;
}

.qa-send-button:hover {
  background-color: #4d3fd9;
}

.qa-send-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 修复标签按钮高度 */
.resource-warp .label-list .label-name {
  height: auto;
}

/* 添加标签切换样式 */
.resource-tab .tab-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.resource-tab .tab-item.active {
  color: #604ffd;
  font-weight: bold;
}

/* 知识点描述标签样式 */
.kgDescribe-warp .label-list .lab-item {
  transition: all 0.3s ease;
}

.kgDescribe-warp .label-list .lab-item:hover {
  background-color: rgba(96, 79, 253, 0.1) !important;
}

.kgDescribe-warp .label-list .lab-item.active {
  background-color: #604ffd !important;
  color: white !important;
}

/* 修改竖虚线位置 */
:deep(.rightTreeWarp .chapterList-box .list li:after) {
  left: 3.25vw !important;
}

/* 修改圆点位置 */
:deep(.rightTreeWarp .chapterList-box .list li .Sectionmark-em) {
  left: 3vw !important;
}

/* 确保SVG图标居中 */
.not-expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 聊天消息样式 */
.message-item {
  display: flex;
  margin-bottom: 16px;
  padding: 0 12px;
}

.message-item.user {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  max-width: 80%;
}

.message-item.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 8px;
}

.message-item.user .avatar {
  margin-right: 0;
  margin-left: 8px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  padding: 10px 14px;
  background-color: #ffffff;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.message-item.user .bubble {
  background-color: #604ffd;
  color: white;
}

.typing {
  display: flex;
  align-items: center;
  min-width: 40px;
  min-height: 20px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #666;
  margin: 0 2px;
  animation: typing 1.4s infinite both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

.send-btn {
  cursor: pointer;
  color: #604ffd;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 用于打字动画效果 */
.typing-dot {
  display: inline-block;
  margin: 0 2px;
  animation: typing 1.4s infinite both;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 输入框样式 */
.el-textarea__inner {
  box-shadow: none !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 10px;
}

/* 缩小侧边栏SVG图标尺寸 */
.hover-box svg {
  width: 25px;
  height: 25px;
}

/* 移除章节模式背景 */
.custom-mode {
  background: transparent !important;
}
.mastery-page-content {
  height: 100vh;
}

/* 课程资料相关样式 */
.course-materials-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa; /* 默认浅色背景 */
}

.course-materials-wrapper.dark {
  background-color: #1e1e1e;
}

.materials-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: calc(100vh - 125px);
  overflow-y: auto;
  background-color: #f5f7fa; /* 默认浅色背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.materials-container.dark {
  background-color: #1e1e1e;
}

.materials-container.light {
  background-color: #f5f7fa;
}

.materials-title {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.materials-list {
  display: grid;
  gap: 20px;
  width: 90%;
  max-width: 1400px;
}

.material-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.material-item.dark {
  background-color: #252525;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.material-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.material-item.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.material-icon {
  flex-shrink: 0;
  margin-right: 15px;
}

.material-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.material-info {
  flex-grow: 1;
  overflow: hidden;
}

.material-info .material-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-item.dark .material-info .material-title {
  color: #e0e0e0;
}

.material-info .material-type {
  font-size: 12px;
  color: #909399;
}

.material-item.dark .material-info .material-type {
  color: #aaa;
}

.material-action {
  flex-shrink: 0;
  margin-left: 10px;
}

/* 作业考试相关样式 */
.homework-exam-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa; /* 默认浅色背景 */
}

.homework-exam-wrapper.dark {
  background-color: #1e1e1e;
}

.homework-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: calc(100vh - 125px);
  overflow-y: auto;
  background-color: #f5f7fa; /* 默认浅色背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.homework-container.dark {
  background-color: #1e1e1e;
}

.homework-tabs {
  width: 90%;
  max-width: 1400px;
}

.homework-list,
.exam-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.homework-item,
.exam-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.homework-item.dark,
.exam-item.dark {
  background-color: #252525;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.homework-item:hover,
.exam-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.homework-item.dark:hover,
.exam-item.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.homework-icon,
.exam-icon {
  flex-shrink: 0;
  margin-right: 15px;
}

.homework-icon img,
.exam-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.homework-info,
.exam-info {
  flex-grow: 1;
  overflow: hidden;
}

.homework-title,
.exam-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}

.homework-item.dark .homework-title,
.exam-item.dark .exam-title {
  color: #e0e0e0;
}

.homework-meta,
.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.homework-item.dark .homework-meta,
.exam-item.dark .exam-meta {
  color: #aaa;
}

.homework-status,
.exam-status {
  margin: 0 15px;
}

.homework-action,
.exam-action {
  flex-shrink: 0;
}

/* 课程成绩相关样式 */
.course-grades-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f7fa; /* 默认浅色背景 */
}

.course-grades-wrapper.dark {
  background-color: #1e1e1e;
}

.course-grades-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: calc(100vh - 125px);
  overflow-y: auto;
  background-color: #f5f7fa; /* 默认浅色背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.course-grades-container.dark {
  background-color: #1e1e1e;
}

.grades-content {
  width: 90%;
  max-width: 1400px;
}

.grades-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grades-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.grades-card.dark {
  background-color: #252525;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.grades-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.grades-card.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.grades-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.grades-card-header svg {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  color: #604ffd;
}

.grades-card-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.grades-card.dark .grades-card-header h3 {
  color: #e0e0e0;
}

.grades-card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.grades-score {
  font-size: 48px;
  font-weight: 600;
  color: #604ffd;
}

.grades-chart-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.grades-chart-container.dark {
  background-color: #252525;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.grades-chart-header {
  margin-bottom: 20px;
}

.grades-chart-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.grades-chart-container.dark .grades-chart-header h3 {
  color: #e0e0e0;
}

.grades-chart {
  width: 100%;
  height: 350px;
}

.chapter-section {
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chapter-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.point-section {
  margin-bottom: 16px;
}

.point-section h3 {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.point-item {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.point-title {
  font-weight: bold;
  margin-bottom: 4px;
  color: #303133;
}

.point-content {
  color: #606266;
  line-height: 1.5;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}
</style>

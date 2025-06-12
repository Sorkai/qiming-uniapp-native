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
          class="el-tooltip item active"
          aria-describedby="el-tooltip-3541"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box active">
            <CourseLearnIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程学习</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-4068"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <MasteryIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">掌握度</div>
          </div>
        </div>
        <div data-v-8289e326="" class="line" />
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-4782"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <CourseQaIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程问答</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-8004"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <HomeworkExamIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">作业考试</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-7753"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <CourseMaterialsIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">课程资料</div>
          </div>
        </div>
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-9625"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <GradesIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">成绩</div>
          </div>
        </div>
        <div data-v-8289e326="" class="line" />
        <div
          data-v-8289e326=""
          class="el-tooltip item"
          aria-describedby="el-tooltip-1636"
          tabindex="0"
        >
          <div data-v-1139a0f7="" data-v-8289e326="" class="hover-box">
            <AiDocQaIcon data-v-1139a0f7="" />
            <div data-v-1139a0f7="" class="side-name">AI文档问答</div>
          </div>
        </div>
        <div data-v-8289e326="" class="line" />
      </div>
      <div data-v-2cf49992="" class="layout-inner-content">
        <div data-v-cebc91e2="" data-v-2cf49992="">
          <!---->
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
                <div data-v-3e66491d="" class="item header-back">
                  <i data-v-3e66491d="" />
                </div>
                <span data-v-3e66491d="" class="current-time"
                  >2025年06月10日</span
                >
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
                <div data-v-cebc91e2="" data-v-3e66491d="" class="study-mode">
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="0"
                    class="mode-item active"
                  >
                    章节模式
                  </div>
                  <div
                    data-v-cebc91e2=""
                    data-v-3e66491d=""
                    data-name="1"
                    class="mode-item"
                  >
                    图谱模式
                  </div>
                </div>
              </div>
              <div data-v-3e66491d="" class="item header-right">
                <ul data-v-3e66491d="" class="popper-box">
                  <li data-v-3e66491d="" class="mypopper brepopper">
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
                  </li>
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
                              src="https://image.zhihuishu.com/zhs/zd/avatar/202411/b901eb69b7a744b4bc784e7a45e6b69d_s3.png"
                              alt=""
                              class="avatar"
                            /><span data-v-3e66491d="" class="name">test</span>
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
                    <div class="kg-name">深刻认识新时代我国国家安全形势</div>
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
                    <!----><!----><!---->
                    <div
                      style="
                        width: 100%;
                        height: 90%;
                        background: rgb(0, 0, 0);
                        padding-top: 2.08333vw;
                        border-radius: 0.83333vw;
                      "
                    >
                      <div
                        id="container"
                        class="able-player-container"
                        style="
                          width: 100%;
                          height: 100%;
                          margin: 0px;
                          overflow: hidden;
                          background-color: rgb(0, 0, 0);
                        "
                      >
                        <div
                          id="vjs_container"
                          poster="about:blank"
                          class="video-js vjs-default-skin able-player-skin vjs_container-dimensions vjs-controls-disabled vjs-workinghover vjs-has-started vjs-paused vjs-user-inactive"
                          role="region"
                          aria-label="video player"
                        >
                          <video
                            id="vjs_container_html5_api"
                            class="vjs-tech"
                            poster="about:blank"
                            src="https://wsvideo.zhihuishu.com/zhs/ai-smart-course-h5/TEACH_RESOURCE/202503/f4a27bf2dfbd4399b6ccf1ef0dc353d0_512.mp4"
                          >
                            <p class="vjs-no-js">
                              Sorry
                              您可能需要下载新版本的浏览器来支持html5并播放本视频.
                              <br />
                              请下载如下浏览器: Firefox3.5+ 或 Chrome3+
                            </p>
                          </video>
                          <div />
                          <div
                            class="vjs-poster"
                            tabindex="-1"
                            style="
                              background-image: url(&quot;about:blank&quot;);
                            "
                          />
                          <div
                            class="vjs-text-track-display"
                            aria-live="assertive"
                            aria-atomic="true"
                          >
                            <div
                              style="
                                position: absolute;
                                inset: 0px;
                                margin: 1.5%;
                              "
                            />
                          </div>
                          <div class="vjs-loading-spinner" dir="ltr" />
                          <button
                            class="vjs-big-play-button"
                            type="button"
                            aria-live="polite"
                          >
                            <span class="vjs-control-text">Play Video</span>
                          </button>
                          <div class="vjs-control-bar" dir="ltr" role="group">
                            <button
                              class="vjs-play-control vjs-control vjs-button vjs-paused"
                              type="button"
                              aria-live="polite"
                            >
                              <span class="vjs-control-text">Play</span>
                            </button>
                            <div
                              class="vjs-volume-menu-button vjs-menu-button vjs-menu-button-inline vjs-control vjs-button vjs-volume-menu-button-horizontal vjs-vol-2"
                              tabindex="0"
                              role="button"
                              aria-live="polite"
                            >
                              <div class="vjs-menu">
                                <div class="vjs-menu-content">
                                  <div
                                    tabindex="0"
                                    class="vjs-volume-bar vjs-slider-bar vjs-slider vjs-slider-horizontal"
                                    role="slider"
                                    aria-valuenow="50.00"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                    aria-label="volume level"
                                    aria-valuetext="50.00%"
                                  >
                                    <div class="vjs-volume-level">
                                      <span class="vjs-control-text" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <span class="vjs-control-text">Mute</span>
                            </div>
                            <div
                              class="vjs-current-time vjs-time-control vjs-control"
                            >
                              <div
                                class="vjs-current-time-display"
                                aria-live="off"
                              >
                                <span class="vjs-control-text"
                                  >Current Time</span
                                >
                                0:00
                              </div>
                            </div>
                            <div class="vjs-time-control vjs-time-divider">
                              <div><span>/</span></div>
                            </div>
                            <div
                              class="vjs-duration vjs-time-control vjs-control"
                            >
                              <div class="vjs-duration-display" aria-live="off">
                                <span class="vjs-control-text"
                                  >Duration Time</span
                                >
                                7:13
                              </div>
                            </div>
                            <div class="vjs-progress-control vjs-control">
                              <div
                                tabindex="0"
                                class="vjs-progress-holder vjs-slider vjs-slider-horizontal"
                                role="slider"
                                aria-valuenow="0.16"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-label="progress bar"
                                aria-valuetext="0:00"
                              >
                                <div
                                  class="vjs-load-progress"
                                  style="width: 2.64186%"
                                >
                                  <span
                                    class="vjs-control-text"
                                    style="left: 0%; width: 100%"
                                    ><span>Loaded</span>: 0%</span
                                  >
                                </div>
                                <div
                                  class="vjs-mouse-display"
                                  data-current-time="0:00"
                                  style="left: 0px"
                                />
                                <div
                                  class="vjs-play-progress vjs-slider-bar"
                                  data-current-time="0:00"
                                  style="width: 0.16%"
                                >
                                  <span class="vjs-control-text"
                                    ><span>Progress</span>: 0%</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div
                              class="vjs-live-control vjs-control vjs-hidden"
                            >
                              <div class="vjs-live-display" aria-live="off">
                                <span class="vjs-control-text">Stream Type</span
                                >LIVE
                              </div>
                            </div>
                            <div
                              class="vjs-remaining-time vjs-time-control vjs-control"
                            >
                              <div
                                class="vjs-remaining-time-display"
                                aria-live="off"
                              >
                                <span class="vjs-control-text"
                                  >Remaining Time</span
                                >
                                -7:13
                              </div>
                            </div>
                            <div class="vjs-custom-control-spacer vjs-spacer">
                              &nbsp;
                            </div>
                            <div
                              class="vjs-playback-rate vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu" />
                              </div>
                              <span class="vjs-control-text"
                                >Playback Rate</span
                              >
                              <div class="vjs-playback-rate-value">1</div>
                            </div>
                            <div
                              class="vjs-chapters-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                              aria-label="Chapters Menu"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu">
                                  <li class="vjs-menu-title" tabindex="-1">
                                    Chapters
                                  </li>
                                </ul>
                              </div>
                              <span class="vjs-control-text">Chapters</span>
                            </div>
                            <div
                              class="vjs-descriptions-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                              aria-label="Descriptions Menu"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu">
                                  <li
                                    class="vjs-menu-item vjs-selected"
                                    tabindex="-1"
                                    role="menuitemcheckbox"
                                    aria-live="polite"
                                    aria-checked="true"
                                  >
                                    descriptions off<span
                                      class="vjs-control-text"
                                      >, selected</span
                                    >
                                  </li>
                                </ul>
                              </div>
                              <span class="vjs-control-text">Descriptions</span>
                            </div>
                            <div
                              class="vjs-subtitles-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                              aria-label="Subtitles Menu"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu">
                                  <li
                                    class="vjs-menu-item vjs-selected"
                                    tabindex="-1"
                                    role="menuitemcheckbox"
                                    aria-live="polite"
                                    aria-checked="true"
                                  >
                                    subtitles off<span class="vjs-control-text"
                                      >, selected</span
                                    >
                                  </li>
                                </ul>
                              </div>
                              <span class="vjs-control-text">Subtitles</span>
                            </div>
                            <div
                              class="vjs-captions-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                              aria-label="Captions Menu"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu">
                                  <li
                                    class="vjs-menu-item vjs-texttrack-settings"
                                    tabindex="-1"
                                    role="menuitem"
                                    aria-live="polite"
                                  >
                                    captions settings<span
                                      class="vjs-control-text"
                                      >, opens captions settings dialog</span
                                    >
                                  </li>
                                  <li
                                    class="vjs-menu-item vjs-selected"
                                    tabindex="-1"
                                    role="menuitemcheckbox"
                                    aria-live="polite"
                                    aria-checked="true"
                                  >
                                    captions off<span class="vjs-control-text"
                                      >, selected</span
                                    >
                                  </li>
                                </ul>
                              </div>
                              <span class="vjs-control-text">Captions</span>
                            </div>
                            <div
                              class="vjs-audio-button vjs-menu-button vjs-menu-button-popup vjs-control vjs-button vjs-hidden"
                              tabindex="0"
                              role="menuitem"
                              aria-live="polite"
                              aria-expanded="false"
                              aria-haspopup="true"
                              aria-label="Audio Menu"
                            >
                              <div class="vjs-menu" role="presentation">
                                <ul class="vjs-menu-content" role="menu" />
                              </div>
                              <span class="vjs-control-text" />
                            </div>
                            <button
                              class="vjs-fullscreen-control vjs-control vjs-button"
                              type="button"
                              aria-live="polite"
                            >
                              <span class="vjs-control-text">Fullscreen</span>
                            </button>
                          </div>
                          <div
                            class="vjs-error-display vjs-modal-dialog vjs-hidden"
                            tabindex="-1"
                            aria-describedby="vjs_container_component_340_description"
                            aria-hidden="true"
                            aria-label="Modal Window"
                            role="dialog"
                          >
                            <p
                              id="vjs_container_component_340_description"
                              class="vjs-modal-dialog-description vjs-offscreen"
                            >
                              This is a modal window.
                            </p>
                            <div
                              class="vjs-modal-dialog-content"
                              role="document"
                            />
                          </div>
                          <div
                            class="vjs-caption-settings vjs-modal-overlay vjs-hidden"
                          >
                            <div class="vjs-tracksettings">
                              <div class="vjs-tracksettings-colors">
                                <div class="vjs-fg-color vjs-tracksetting">
                                  <label class="vjs-label">Foreground</label>
                                  <select>
                                    <option value="">---</option>
                                    <option value="#FFF">White</option>
                                    <option value="#000">Black</option>
                                    <option value="#F00">Red</option>
                                    <option value="#0F0">Green</option>
                                    <option value="#00F">Blue</option>
                                    <option value="#FF0">Yellow</option>
                                    <option value="#F0F">Magenta</option>
                                    <option value="#0FF">Cyan</option>
                                  </select>
                                  <span class="vjs-text-opacity vjs-opacity">
                                    <select>
                                      <option value="">---</option>
                                      <option value="1">Opaque</option>
                                      <option value="0.5">Semi-Opaque</option>
                                    </select>
                                  </span>
                                </div>
                                <!-- vjs-fg-color -->
                                <div class="vjs-bg-color vjs-tracksetting">
                                  <label class="vjs-label">Background</label>
                                  <select>
                                    <option value="">---</option>
                                    <option value="#FFF">White</option>
                                    <option value="#000">Black</option>
                                    <option value="#F00">Red</option>
                                    <option value="#0F0">Green</option>
                                    <option value="#00F">Blue</option>
                                    <option value="#FF0">Yellow</option>
                                    <option value="#F0F">Magenta</option>
                                    <option value="#0FF">Cyan</option>
                                  </select>
                                  <span class="vjs-bg-opacity vjs-opacity">
                                    <select>
                                      <option value="">---</option>
                                      <option value="1">Opaque</option>
                                      <option value="0.5">
                                        Semi-Transparent
                                      </option>
                                      <option value="0">Transparent</option>
                                    </select>
                                  </span>
                                </div>
                                <!-- vjs-bg-color -->
                                <div class="window-color vjs-tracksetting">
                                  <label class="vjs-label">Window</label>
                                  <select>
                                    <option value="">---</option>
                                    <option value="#FFF">White</option>
                                    <option value="#000">Black</option>
                                    <option value="#F00">Red</option>
                                    <option value="#0F0">Green</option>
                                    <option value="#00F">Blue</option>
                                    <option value="#FF0">Yellow</option>
                                    <option value="#F0F">Magenta</option>
                                    <option value="#0FF">Cyan</option>
                                  </select>
                                  <span class="vjs-window-opacity vjs-opacity">
                                    <select>
                                      <option value="">---</option>
                                      <option value="1">Opaque</option>
                                      <option value="0.5">
                                        Semi-Transparent
                                      </option>
                                      <option value="0">Transparent</option>
                                    </select>
                                  </span>
                                </div>
                                <!-- vjs-window-color -->
                              </div>
                              <!-- vjs-tracksettings -->
                              <div class="vjs-tracksettings-font">
                                <div class="vjs-font-percent vjs-tracksetting">
                                  <label class="vjs-label">Font Size</label>
                                  <select>
                                    <option value="0.50">50%</option>
                                    <option value="0.75">75%</option>
                                    <option value="1.00" :selected="true">
                                      100%
                                    </option>
                                    <option value="1.25">125%</option>
                                    <option value="1.50">150%</option>
                                    <option value="1.75">175%</option>
                                    <option value="2.00">200%</option>
                                    <option value="3.00">300%</option>
                                    <option value="4.00">400%</option>
                                  </select>
                                </div>
                                <!-- vjs-font-percent -->
                                <div class="vjs-edge-style vjs-tracksetting">
                                  <label class="vjs-label"
                                    >Text Edge Style</label
                                  >
                                  <select>
                                    <option value="none">None</option>
                                    <option value="raised">Raised</option>
                                    <option value="depressed">Depressed</option>
                                    <option value="uniform">Uniform</option>
                                    <option value="dropshadow">
                                      Dropshadow
                                    </option>
                                  </select>
                                </div>
                                <!-- vjs-edge-style -->
                                <div class="vjs-font-family vjs-tracksetting">
                                  <label class="vjs-label">Font Family</label>
                                  <select>
                                    <option value="">Default</option>
                                    <option value="monospaceSerif">
                                      Monospace Serif
                                    </option>
                                    <option value="proportionalSerif">
                                      Proportional Serif
                                    </option>
                                    <option value="monospaceSansSerif">
                                      Monospace Sans-Serif
                                    </option>
                                    <option value="proportionalSansSerif">
                                      Proportional Sans-Serif
                                    </option>
                                    <option value="casual">Casual</option>
                                    <option value="script">Script</option>
                                    <option value="small-caps">
                                      Small Caps
                                    </option>
                                  </select>
                                </div>
                                <!-- vjs-font-family -->
                              </div>
                            </div>
                            <div class="vjs-tracksettings-controls">
                              <button class="vjs-default-button">
                                Defaults
                              </button>
                              <button class="vjs-done-button">Done</button>
                            </div>
                          </div>
                          <div
                            class="videoArea"
                            style="
                              width: 100%;
                              height: 100%;
                              z-index: 1;
                              position: absolute;
                            "
                          />
                          <div class="videoTitle" style="display: none" />
                          <div
                            class="controlsBar"
                            style="z-index: 2; overflow: inherit; display: none"
                          >
                            <div class="nPlayTime 33322">
                              <span class="currentTime">00:00:00</span
                              ><span class="duration">00:07:13</span>
                            </div>
                            <div id="playButton" class="playButton">
                              <div class="bigPlayButton pointer" style="" />
                            </div>
                            <div class="fullScreen 111" />
                            <div class="picinpic-box hover-opt">
                              <PicInPicIcon class="request-picinpic" />
                            </div>
                            <div
                              class="customFullScreen"
                              style="display: none"
                            />
                            <div class="volumeBox" style="display: block">
                              <div class="volumeIcon" />
                              <div class="volumeBarWrap">
                                <div class="volumeBarWrapBg">
                                  <div class="volumeBar">
                                    <div
                                      class="volumeBall"
                                      style="bottom: 44px"
                                    >
                                      <div class="volumeNumber">0%</div>
                                    </div>
                                    <div
                                      class="passVolume"
                                      style="height: 44px"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="definiBox" style="display: none">
                              <span>高清</span>
                              <div class="definiLines" style="display: none">
                                <b class="line1bq switchLine">流畅</b
                                ><b class="line1gq switchLine active">高清</b>
                              </div>
                            </div>
                            <div class="speedBox" style="display: none">
                              <span>X 1.0</span>
                              <div class="speedList">
                                <div class="speedTab speedTab15" rate="1.5">
                                  X 1.5
                                </div>
                                <div class="speedTab speedTab10" rate="1.25">
                                  X 1.25
                                </div>
                                <div
                                  class="speedTab active speedTab05"
                                  rate="1.0"
                                >
                                  X 1.0
                                </div>
                              </div>
                            </div>
                            <div class="commonBox" style="display: none">
                              <span>中文</span>
                              <div class="trackList" />
                            </div>
                            <div class="seek-box hover-opt">
                              <SeekLeftIcon class="left" data-seek="-10" />
                              <SeekRightIcon class="right" data-seek="10" />
                            </div>
                            <div id="current-node-box" />
                            <div class="progress">
                              <div
                                class="hoverBox"
                                style="left: 404.352px; display: none"
                              >
                                <div id="hover-box" />
                              </div>
                              <div class="progressBall" style="left: 0%">
                                <div class="progressNumber">00:00</div>
                              </div>
                              <div style="width: 100%" class="progressBar">
                                <div
                                  class="passTime"
                                  style="max-width: 100%; width: 0%"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="vjs-double-subtitles">
                            <div class="double-subtitles-box">
                              <div
                                class="zh-subtitles subtitles-item"
                                data-lang="zh"
                              />
                              <div
                                class="en-subtitles subtitles-item"
                                data-lang="en"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="kgDescribe-warp"
                    style="height: auto"
                    courseinfo="[object Object]"
                  >
                    <div class="top-test">
                      <img
                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/33b30e1359074b389417c68c5c898253.png"
                        alt=""
                      /><span>知识点描述</span>
                      <div class="botton-box-down close-status" />
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
                      <div class="tab-item active">
                        <i /><span>必学资源</span>
                      </div>
                      <div class="tab-item"><i /><span>选学资源</span></div>
                      <!---->
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
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/9b01df14f9824284901dca0376b07324.png"
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
                                /><!----><!----><!----><!---->
                              </div>
                              <span data-v-0762fd62="" class="mock-send-btn">
                                <SendIcon />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!----><!----><!---->
                      <div
                        data-v-0762fd62=""
                        class="not-expand-icon"
                        style="right: 26.875vw; display: none"
                      >
                        <NotExpandIcon />
                      </div>
                      <div
                        data-v-0762fd62=""
                        class="ai-draggable-dialog auto"
                        style="
                          width: 23.9583vw;
                          height: calc(100% - 5.3125vw);
                          top: auto;
                          display: none;
                        "
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
                                          src="https://image.zhihuishu.com/zhs/b2cm/base1/202408/d22ea904b368461092afc351c3226de2.png"
                                          alt=""
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
                                    <!---->
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
                                        autocomplete="off"
                                        placeholder="请输入您的问题"
                                        maxlength="300"
                                        class="el-textarea__inner"
                                        style="min-height: 12px; height: 12px"
                                      /><!---->
                                    </div>
                                  </div>
                                  <div
                                    data-v-0762fd62=""
                                    class="add-new-talk not-allowed"
                                  >
                                    <AddNewTalkIcon />
                                  </div>
                                </div>
                                <div data-v-0762fd62="" class="not-send-btn">
                                  <NotSendBtnIcon />
                                </div>
                              </div>
                              <div data-v-0762fd62="" class="ai-tips-box">
                                <p data-v-0762fd62="" class="pad-bottom-8">
                                  仅限学习期间使用：<span data-v-0762fd62=""
                                    >2025-04-01</span
                                  >至<span data-v-0762fd62="">2025-05-31</span>
                                </p>
                                <!----><!---->
                              </div>
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
                              <li class="clearfix font_gray_inclined chapter">
                                <span title="第一章" class="catalogue_title3 fl"
                                  ><b>第一章</b></span
                                ><em class="Sectionmark-em fl" /><span
                                  title="导论"
                                  class="catalogue_title fl catalogue_titleweight"
                                  >导论</span
                                >
                              </li>
                              <div class="inner-li">
                                <li class="clearfix video activeNode">
                                  <span
                                    class="catalogue_title3 fl cataloguediv-l"
                                    ><b class="pl5 hour">1.1</b></span
                                  >
                                  <div class="fl cataloguediv-c haveRe">
                                    <span
                                      title="深刻认识新时代我国国家安全形势"
                                      class="catalogue_title"
                                      >深刻认识新时代我国国家安全形势</span
                                    >
                                    <div class="resource-box clearfix">
                                      <div class="resource-text">
                                        必学 <span> 1</span>/1
                                      </div>
                                      <div class="resource-bar">
                                        <div
                                          role="progressbar"
                                          aria-valuenow="100"
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
                                                style="width: 100%"
                                              >
                                                <!---->
                                              </div>
                                            </div>
                                          </div>
                                          <div
                                            class="el-progress__text"
                                            style="font-size: 14.4px"
                                          >
                                            100%
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="progress" />
                                  <em class="Sectionmark-em" />
                                  <div class="icon-box">
                                    <div class="isFinish">
                                      <img
                                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/e72ded52758742c186763c64f841692d.png"
                                        alt=""
                                      />
                                    </div>
                                    <!---->
                                    <div class="haveDone">
                                      <img
                                        src="https://image.zhihuishu.com/zhs_yufa_150820/b2cm/base1/202408/a9fd8153a1594110957604220c36b05f.png"
                                        alt=""
                                      />
                                    </div>
                                  </div>
                                </li>
                                <!---->
                              </div>
                              <div class="inner-li">
                                <li class="clearfix video">
                                  <span
                                    class="catalogue_title3 fl cataloguediv-l"
                                    ><b class="pl5 hour">1.2</b></span
                                  >
                                  <div class="fl cataloguediv-c haveRe">
                                    <span
                                      title="不断加强大学生国家安全教育"
                                      class="catalogue_title"
                                      >不断加强大学生国家安全教育</span
                                    >
                                    <div class="resource-box clearfix">
                                      <div class="resource-text">
                                        必学 <span> 1</span>/1
                                      </div>
                                      <div class="resource-bar">
                                        <div
                                          role="progressbar"
                                          aria-valuenow="100"
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
                                                style="width: 100%"
                                              >
                                                <!---->
                                              </div>
                                            </div>
                                          </div>
                                          <div
                                            class="el-progress__text"
                                            style="font-size: 14.4px"
                                          >
                                            100%
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="progress" />
                                  <em class="Sectionmark-em" />
                                  <div class="icon-box">
                                    <div class="isFinish">
                                      <img
                                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/e72ded52758742c186763c64f841692d.png"
                                        alt=""
                                      />
                                    </div>
                                    <!---->
                                    <div class="haveDone">
                                      <img
                                        src="https://image.zhihuishu.com/zhs_yufa_150820/b2cm/base1/202408/a9fd8153a1594110957604220c36b05f.png"
                                        alt=""
                                      />
                                    </div>
                                  </div>
                                </li>
                                <!---->
                              </div>
                              <div class="inner-li">
                                <li
                                  class="clearfix video last-child last-child-num"
                                >
                                  <span
                                    class="catalogue_title3 fl cataloguediv-l"
                                    ><b class="pl5 hour">1.3</b></span
                                  >
                                  <div class="fl cataloguediv-c haveRe">
                                    <span
                                      title="深入学习贯彻总体国家安全观"
                                      class="catalogue_title"
                                      >深入学习贯彻总体国家安全观</span
                                    >
                                    <div class="resource-box clearfix">
                                      <div class="resource-text">
                                        必学 <span> 1</span>/1
                                      </div>
                                      <div class="resource-bar">
                                        <div
                                          role="progressbar"
                                          aria-valuenow="100"
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
                                                style="width: 100%"
                                              >
                                                <!---->
                                              </div>
                                            </div>
                                          </div>
                                          <div
                                            class="el-progress__text"
                                            style="font-size: 14.4px"
                                          >
                                            100%
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="progress" />
                                  <em class="Sectionmark-em" />
                                  <div class="icon-box">
                                    <div class="isFinish">
                                      <img
                                        src="https://image.zhihuishu.com/zhs/b2cm/base1/202411/e72ded52758742c186763c64f841692d.png"
                                        alt=""
                                      />
                                    </div>
                                    <!---->
                                    <div class="haveDone">
                                      <img
                                        src="https://image.zhihuishu.com/zhs_yufa_150820/b2cm/base1/202408/a9fd8153a1594110957604220c36b05f.png"
                                        alt=""
                                      />
                                    </div>
                                  </div>
                                </li>
                                <!---->
                              </div>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CourseLearnIcon from "@/assets/course-icons/course-learn.svg?component";
import MasteryIcon from "@/assets/course-icons/mastery.svg?component";
import CourseQaIcon from "@/assets/course-icons/course-qa.svg?component";
import HomeworkExamIcon from "@/assets/course-icons/homework-exam.svg?component";
import GradesIcon from "@/assets/course-icons/grades.svg?component";
import AiDocQaIcon from "@/assets/course-icons/ai-doc-qa.svg?component";
import CourseMaterialsIcon from "@/assets/course-icons/course-materials.svg?component";
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

const currentTheme = ref("light");

function toggleTheme() {
  const oldTheme = currentTheme.value;
  const newTheme = oldTheme === "light" ? "dark" : "light";

  const elements = document.querySelectorAll(`.${oldTheme}`);
  elements.forEach(el => {
    el.classList.remove(oldTheme);
    el.classList.add(newTheme);
  });

  currentTheme.value = newTheme;
}
</script>

<style>
@import "@/../fusioncourseh/css/chunk-b3e9f934.1c00050a.css";
@import "@/../fusioncourseh/css/chunk-8cf7ce30.92e48af1.css";
@import "@/../fusioncourseh/css/chunk-3cf64ec0.4f07a253.css";
@import "@/../fusioncourseh/css/chunk-3248eec0.130a3cd9.css";
@import "@/../fusioncourseh/css/app.a5f91bbb.css";
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
</style>

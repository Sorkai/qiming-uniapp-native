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
        <div data-v-8289e326="" class="line" />
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
        </div>
        <div data-v-8289e326="" class="line" />
      </div>
      <div data-v-2cf49992="" class="layout-inner-content">
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
          <div data-v-487e2460="" class="mastery-content-left">
            <div data-v-487e2460="" class="left-scroll">
              <ul data-v-487e2460="" class="mastery-data-ul">
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">考核知识点总数</span
                  ><span data-v-487e2460="" class="num">110</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">平均掌握度</span
                  ><span data-v-487e2460="" class="num">92.7%</span>
                </li>
                <li data-v-487e2460="" class="icon-tip">
                  <i
                    data-v-487e2460=""
                    class="el-tooltip icon-img"
                    aria-describedby="el-tooltip-7778"
                    tabindex="0"
                  />
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">薄弱点个数</span
                  ><span data-v-487e2460="" class="num">0</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">遗漏点个数</span
                  ><span data-v-487e2460="" class="num">0</span>
                </li>
                <li data-v-487e2460="">
                  <span data-v-487e2460="" class="text">免考个数</span
                  ><span data-v-487e2460="" class="num">0</span>
                </li>
              </ul>
              <div data-v-423b05d0="" data-v-487e2460="" class="echart-content">
                <h1 data-v-423b05d0="" class="echart-title">
                  本课程知识点我的情况占比
                </h1>
                <div
                  ref="masteryChartRef"
                  data-v-423b05d0=""
                  class="my-point-EChart"
                  style="
                    user-select: none;
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                    position: relative;
                  "
                />
                <div data-v-423b05d0="" class="custom-legend">
                  <li data-v-423b05d0="" class="item-legend">
                    <i
                      data-v-423b05d0=""
                      class="icon"
                      style="background-color: rgb(140, 229, 162)"
                    /><span data-v-423b05d0="" class="name">掌握较好</span
                    ><span data-v-423b05d0="" class="num">100.0%</span>
                  </li>
                  <li data-v-423b05d0="" class="item-legend">
                    <i
                      data-v-423b05d0=""
                      class="icon"
                      style="background-color: rgb(255, 203, 102)"
                    /><span data-v-423b05d0="" class="name">掌握一般</span
                    ><span data-v-423b05d0="" class="num">0.0%</span>
                  </li>
                  <li data-v-423b05d0="" class="item-legend">
                    <i
                      data-v-423b05d0=""
                      class="icon"
                      style="background-color: rgb(255, 162, 162)"
                    /><span data-v-423b05d0="" class="name">薄弱点</span
                    ><span data-v-423b05d0="" class="num">0.0%</span>
                  </li>
                  <li data-v-423b05d0="" class="item-legend">
                    <i
                      data-v-423b05d0=""
                      class="icon"
                      style="background-color: rgb(204, 204, 204)"
                    /><span data-v-423b05d0="" class="name">遗漏点</span
                    ><span data-v-423b05d0="" class="num">0.0%</span>
                  </li>
                  <li data-v-423b05d0="" class="item-legend">
                    <i
                      data-v-423b05d0=""
                      class="icon"
                      style="background-color: rgb(143, 208, 255)"
                    /><span data-v-423b05d0="" class="name">免考</span
                    ><span data-v-423b05d0="" class="num">0.0%</span>
                  </li>
                </div>
              </div>
              <div data-v-487e2460="">
                <div
                  data-v-1cf35c08=""
                  data-v-487e2460=""
                  class="related-resources-mastery"
                >
                  <h1 data-v-1cf35c08="" class="sun-up">
                    <svg
                      data-v-1cf35c08=""
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewbox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        data-v-1cf35c08=""
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M14.709 4.77212C14.3281 3.74262 12.8719 3.74263 12.491 4.77212L10.5949 9.89626C10.4751 10.2199 10.2199 10.4751 9.89626 10.5949L4.77212 12.491C3.74262 12.8719 3.74263 14.3281 4.77212 14.709L9.89626 16.6051C10.2199 16.7249 10.4751 16.9801 10.5949 17.3037L12.491 22.4279C12.8719 23.4574 14.3281 23.4574 14.709 22.4279L16.6051 17.3037C16.7249 16.9801 16.9801 16.7249 17.3037 16.6051L22.4279 14.709C23.4574 14.3281 23.4574 12.8719 22.4279 12.491L17.3037 10.5949C16.9801 10.4751 16.7249 10.2199 16.6051 9.89626L14.709 4.77212ZM23.7545 18.7861C23.564 18.2713 22.836 18.2713 22.6455 18.7861L21.6974 21.3481C21.6376 21.51 21.51 21.6376 21.3481 21.6974L18.7861 22.6455C18.2713 22.836 18.2713 23.564 18.7861 23.7545L21.3481 24.7026C21.51 24.7624 21.6376 24.89 21.6974 25.0519L22.6455 27.6139C22.836 28.1287 23.564 28.1287 23.7545 27.6139L24.7026 25.0519C24.7624 24.89 24.89 24.7624 25.0519 24.7026L27.6139 23.7545C28.1287 23.564 28.1287 22.836 27.6139 22.6455L25.0519 21.6974C24.89 21.6376 24.7624 21.51 24.7026 21.3481L23.7545 18.7861Z"
                        fill="#47FFFF"
                      /></svg
                    ><span data-v-1cf35c08="">AI助教总结</span>
                  </h1>
                  <div data-v-1cf35c08="">
                    <p data-v-1cf35c08="" class="remark">
                      以下知识点相关资源：
                    </p>
                    <div data-v-1cf35c08="" class="line3 line">
                      <div data-v-1cf35c08="" class="line3-sub">
                        总体国家安全观涵盖的重点领域
                      </div>
                      <div data-v-1cf35c08="" class="line3-small">定义</div>
                      <div data-v-1cf35c08="" class="line3-content">
                        总体国家安全观涵盖的重点领域包括政治安全、国土安全、军事安全、经济安全、文化安全、社会安全、科技安全、网络安全、生态安全、资源安全、核安全、海外利益安全、太空安全、深海安全、极地安全等。
                      </div>
                      <div data-v-1cf35c08="" class="line3-source-list">
                        <div data-v-1cf35c08="" class="line3-list-scroll">
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                总体国家安全观
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              总体国家安全观是一个内容丰富、开放包容、不断发展的思想体系，其核心要义可以概括为五大要素和五对关系。
                              [9]xa0
                              2014年4月15日，习近平总书记主持召开中央国家安全委员会第一次会议。习近平总书记在讲话中首次提出总体国家安全观，阐述了总体国家安全观的基本内涵、指导思想和贯彻原则。
                              [9]xa0
                              2021年4月14日，总体国家安全观研究中心挂牌成立。
                              [4]
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              >
                                大连交通大学
                              </div>
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                大学生总体国家安全观教育问题研究
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              随着经济全球化和科技革命的深入发展,国际安全形势发生着深刻的变化,国家安全问题不容小觑,维护国家安全任重而道远。总体国家安全观是国家安全建设的重大理论创新与重要内容,对中国国家安全战略的调整具有重大指导意义。为践行总体国家安全观,教育部在2018年正式颁发了《关于加强大中小学国家安全教育的实施意见》,在国民教育体系中添加国家安全教育的相关内容。大学生作为建设中国特色社会主义事业的接班人,对其进行国家安全教育尤为关键,研究大学生总体国家安全观教育问题具有强烈的现实意义与理论意义。论文采用问卷调查法和文献搜集法,对大学生总体国家安全观教育问题进行研究。首先,在理论层面上,通过对总体国家安全观与大学生总体国家观教育相关概念界定,将大学生总体国家安全观教育的构成要素划分为主体、客体、介体与环体四个方面。其次,在实践层面上,通过对大学生总体国家安全观教育现状进行调查问卷,分析总结出大学生总体国家安全观教育取得的成效及其面临的问题。在此基础上,深入分析存在问题的成因,即教育主体尚未形成协同育人机制、教育客体缺乏对国家安全形势的研判能力、教育介体尚未形成完善的教育场域、教育环体尚未与高校形成有机联动。最后,针对新时代大学生总体国家安全观教育问题背后的深层次原因,提出创新性、针对性的解决对策,即提升主体重视程度,强化大学生总体国家安全观教育主体的协同育人机制;增强教育客体国家安全形势研判能力和使命意识,提升大学生总体国家安全观教育客体的自我教育能动性;拓展教育介体的场域实效功能,提高大学生总体国家安全观教育的实效性;增强教育环体宣传联动效能,实现大学生总体国家安全观教育的多方联动。最终落实加强大学生国家安全教育的目标任务,提升大学生国家安全意识,提高维护国家安全能力,强化责任担当,筑牢国家安全防线,培养德智体美全面发展的社会主义建设者和接班人。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date">
                              2024-02-29
                            </div>
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              >
                                广东财经大学
                              </div>
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                习近平总体国家安全观研究
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              安全问题是世界共同关注的焦点问题。近年来,安全问题没有减少,反而愈加复杂多变。这需要我们重视国家安全问题研究,只有加强对国家安全的认识,才能有效维护中国国家安全,做好国家安全工作,完善国家安全工作机制。当今世界局势百年未遇,机遇与挑战并存,中国必须在发展和安全两方面做好统筹之策,这是新时代党和国家的一项重要任务。总体国家安全观是党和国家关于国家安全的新思想、新理念,是习近平新时代中国特色社会主义思想的重要部分。研究总体国家安全观对推动改革发展事业、实现伟大梦想具有重要的作用。论文立足"总体安全",对总体国家安全观进行系统归纳,提炼出逻辑严谨和结构完整的安全思想体系。首先追溯总体国家安全观的形成背景和理论渊源。分析了总体国家安全观是在全球化世界形势深刻变化、中国周边安全环境复杂多变以及国内面临的压力和挑战的背景下提出的。它继承了马克思主义的科学思维方法,回答了"怎样认识新形势下的国家安全"的问题;深化了原有的国家安全理论,形成了"总体安全"的大安全格局;借鉴了传统优秀文化中的政治思想,强化忧患意识,形成国家安全的战略思维。其次,总体国家安全观的内容体现了"总体安全"概念,明确了宗旨、地位和作用,以及构建国家安全体系的重要举措。本文试图抓住理论渊源与新理念之间的系与发展演变过程。在研究思维上,本文立足"总体安全",整体上把握总体国家安全观;在研究路径上,采取纵向的连续性研究和横向的对比研究相结合的方法,进一步梳理习近平总体国家安全观的内涵和外延。本文认为习近平总体国家安全观的特点在于时代性、前瞻性、人民性、纲领性和整体性。习近平总体国家安全观的意义在于发展了马克思主义中国化的国家安全思想以及中国特色社会主义理论体系的理论意义;提高党领导能力和国家治理能力水平;以及开辟了人类社会国家安全新纪元。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date">
                              2024-03-15
                            </div>
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                总体国家安全观的理论要义阐释
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              党的十八大以来,以习近平同志为核心的党中央统筹新时代"两个大局"和国家安全形势任务,提出了总体国家安全观,并不断发展完善。总体国家安全观主要通过领导论、地位论、总体论、宗旨论、道路论、体系论、防范论、科技论、法治论和共同论等内涵要义,科学、系统地回答了新时代国家安全事业的领导核心、地位作用、总体性质、立场宗旨、道路方向、布局体系、防范化解、科技支撑、法治轨道和共同安全等重大问题,形成了中国共产党对于新时代国家安全事业发展规律的认识深化和重大理论创新。总体国家安全观体现鲜明的马克思主义理论品格,具有突出的人民性、系统性、发展性和实践性,对于新时代国家安全事业发展以及世界安全格局演进,具有重大的理论和实践意义。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date">
                              2023-11-29
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div data-v-1cf35c08="" class="line3 line">
                      <div data-v-1cf35c08="" class="line3-sub">
                        新时代维护生态安全的途径和方法
                      </div>
                      <div data-v-1cf35c08="" class="line3-small">定义</div>
                      <div data-v-1cf35c08="" class="line3-content">
                        "新时代维护生态安全的途径和方法"是指在新时代背景下，为了确保生态系统的稳定和安全，所采取的各种措施和方法，包括加强生态保护、推动可持续发展、加强环境监管、提高公众环保意识等。
                      </div>
                      <div data-v-1cf35c08="" class="line3-source-list">
                        <div data-v-1cf35c08="" class="line3-list-scroll">
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                《生态安全：维护五大安全
                                践行青年担当》（第七届全国大学生讲思政课公开展示作品）
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              作为祖国最东、最北的省份，黑龙江生态资源独特富集，是祖国北方生态安全屏障。党的十八大以来，
                              习近平总书记3次视察黑龙江，大小兴安岭都留下了他心系"绿色中国"的足迹。龙江青年要牢固树立"绿水青山就是金山银山、冰天雪地也是金山银山"的理念，守青山、护绿水，肩负起筑牢祖国北方生态安全屏障的青年担当。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                生态安全（下）
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              传播安全文化，分享安全技术
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                生态安全（中）
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              传播安全文化，分享安全知识
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                生态护坡模具 阶梯生态护坡模具
                                维护建设区域的生态环境
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              生态护坡模具 阶梯生态护坡模具
                              维护建设区域的生态环境
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div data-v-1cf35c08="" class="line3 line">
                      <div data-v-1cf35c08="" class="line3-sub">
                        坚持以军事安全为保障的科学内涵
                      </div>
                      <div data-v-1cf35c08="" class="line3-small">定义</div>
                      <div data-v-1cf35c08="" class="line3-content">
                        坚持以军事安全为保障的科学内涵是指在国家总体安全观的指导下，将军事安全作为国家安全的重要保障，通过加强军事力量建设、提高军事能力、维护国家主权和安全等方面的工作，确保国家的安全和稳定。
                      </div>
                      <div data-v-1cf35c08="" class="line3-source-list">
                        <div data-v-1cf35c08="" class="line3-list-scroll">
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                军事安全
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              军事安全（military
                              security）是指主权国家为了保卫国家主权和领土完整，有效遏制、抵御外来武装力量的侵略和颠覆所进行的必要的军事防御准备。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              />
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                坚持
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              坚持（名词、形容词、动词），汉语词汇。拼音：jiān
                              ch&iacute;
                              即意志坚强，坚韧不拔，持即持久，有耐性。坚持意思是不改变不动摇，始终如一。坚持是意志力的良好表现。坚持也是有毅力的一种表现。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date" />
                          </div>
                          <div data-v-1cf35c08="" class="line3-item">
                            <div data-v-1cf35c08="" class="line3-item1">
                              <div
                                data-v-1cf35c08=""
                                class="line3-item1-school z-line-1"
                              >
                                当代经济研究
                              </div>
                            </div>
                            <div data-v-1cf35c08="" class="line3-item2">
                              <img
                                data-v-1cf35c08=""
                                src="https://image.zhihuishu.com/zhs/b2cm/base1/202210/a030cec12c694944b06cc4e8addce325.png"
                                alt=""
                                class="line3-item2-icon"
                              />
                              <div
                                data-v-1cf35c08=""
                                class="line3-item2-title z-line-2"
                              >
                                中国农村基本经营制度:科学内涵、质规定性及演变逻辑
                              </div>
                            </div>
                            <div
                              data-v-1cf35c08=""
                              class="line3-item3 z-line-3"
                            >
                              农村基本经营制度是中国特色社会主义政治经济学的重要内容,深入系统地研究其科学内涵及质规定性对于坚持和完善农村基本经营制度具有重要的理论价值和现实意义。农村基本经营制度包括农地产权制度、农业经营主体和农业经营方式三大构成要素。其中,农地产权制度层面的集体所有制规定性、农业经营主体层面的家庭经营基础性和农业经营方式层面的规定性是中国农村基本经营制度的质的规定性。"坚持"和"完善"的统一,构成了中国农村基本经营制度的演变逻辑。
                            </div>
                            <div data-v-1cf35c08="" class="line3-item-date">
                              2023-11-30
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    data-v-6c888e32=""
                    data-v-1cf35c08=""
                    class="el-dialog__wrapper"
                    style="display: none"
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="提示"
                      class="el-dialog custom-dialog"
                      style="margin-top: 15vh; width: 30.2083vw"
                    >
                      <div class="el-dialog__header">
                        <span class="el-dialog__title">提示</span>
                        <button
                          type="button"
                          aria-label="Close"
                          class="el-dialog__headerbtn"
                        >
                          <i class="el-dialog__close el-icon el-icon-close" />
                        </button>
                      </div>
                      <!---->
                      <div class="el-dialog__footer">
                        <span data-v-6c888e32="" class="dialog-footer"
                          ><button
                            data-v-6c888e32=""
                            type="button"
                            class="el-button btn1 el-button--default"
                          >
                            <!---->
                            <!----><span>继续访问</span></button
                          ><button
                            data-v-6c888e32=""
                            type="button"
                            class="el-button btn2 el-button--default"
                          >
                            <!---->
                            <!----><span>返回</span>
                          </button></span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div data-v-487e2460="" class="mastery-content-right">
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
                      fill="#fff"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  getFrontendCourseDetail,
  reportFrontendLesson
} from "@/api/frontend/course";
import {
  courseAIChatStream,
  getConversationHistory
} from "@/api/frontend/chat";
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
    const { code, data, msg } = await getFrontendCourseDetail({
      courseId: courseId.value
    });

    if (code === 200 && data) {
      courseDetail.value = data;
      console.log("课程详情数据:", data);

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

// 添加折叠处理函数
function toggleContent() {
  isContentCollapsed.value = !isContentCollapsed.value;
  const contentElement = document.querySelector(
    ".kgDescribe-warp"
  ) as HTMLElement;
  const introduceDiv = contentElement?.querySelector(
    ".introduce-div"
  ) as HTMLElement;
  const buttonElement = document.querySelector(
    ".botton-box-down"
  ) as HTMLElement;

  if (contentElement && introduceDiv && buttonElement) {
    if (isContentCollapsed.value) {
      introduceDiv.style.display = "none";
      buttonElement.style.transform = "rotate(180deg)";
    } else {
      introduceDiv.style.display = "block";
      buttonElement.style.transform = "rotate(0deg)";
    }
  }
}

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
    await reportFrontendLesson({
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
    if (response && response.history && Array.isArray(response.history)) {
      chatMessages.value = response.history;
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
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
    scrollToBottom();
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
          scrollToBottom();
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

onMounted(() => {
  fetchCourseDetail();
  initChat(); // 初始化AI聊天

  // 等待DOM更新后初始化图标颜色和图表
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
</style>

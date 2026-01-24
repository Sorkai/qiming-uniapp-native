import { ref } from "vue";

export function useCourseTheme() {
  const currentTheme = ref("light");

  // 切换主题
  const toggleTheme = () => {
    const oldTheme = currentTheme.value;
    const newTheme = oldTheme === "light" ? "dark" : "light";

    // 切换容器主题
    const elements = document.querySelectorAll(`.${oldTheme}`);
    elements.forEach(el => {
      el.classList.remove(oldTheme);
      el.classList.add(newTheme);
    });

    // 同时切换 html 和 body 的主题类
    document.documentElement.classList.remove(oldTheme);
    document.documentElement.classList.add(newTheme);
    document.body.classList.remove(oldTheme);
    document.body.classList.add(newTheme);

    currentTheme.value = newTheme;

    // 更新侧边栏图标颜色
    updateSidebarColors(newTheme);
  };

  // 更新侧边栏颜色
  const updateSidebarColors = (theme: string, activeMenu?: string) => {
    // 更新 SVG 图标颜色
    const svgElements = document.querySelectorAll(".hover-box svg");
    svgElements.forEach(svg => {
      const parentElement = svg.closest(".hover-box");
      const menuItem = parentElement?.closest(".item");
      const currentMenuName = menuItem?.getAttribute("data-menu");
      const isCurrentActive = activeMenu
        ? currentMenuName === activeMenu
        : parentElement?.classList.contains("active");

      const activeColor = theme === "dark" ? "white" : "white";
      const inactiveColor = theme === "dark" ? "#B4B4C7" : "#5a6b8a";
      const color = isCurrentActive ? activeColor : inactiveColor;

      svg.setAttribute("stroke", color);

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
      const isCurrentActive = activeMenu
        ? currentMenuName === activeMenu
        : element.closest(".hover-box")?.classList.contains("active");

      if (isCurrentActive) {
        element.style.color = "white";
      } else {
        element.style.color = theme === "dark" ? "#B4B4C7" : "#5a6b8a";
      }
    });
  };

  // 初始化主题
  const initTheme = () => {
    document.documentElement.classList.add(currentTheme.value);
    document.body.classList.add(currentTheme.value);
  };

  return {
    currentTheme,
    toggleTheme,
    updateSidebarColors,
    initTheme
  };
}

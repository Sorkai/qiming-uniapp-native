import { storageLocal } from "@pureadmin/utils";

export type CourseTheme = "light" | "dark";

const COURSE_THEME_KEY = "course_theme";
const RESPONSIVE_LAYOUT_KEY = "responsive-layout";

export const normalizeCourseTheme = (theme: unknown): CourseTheme | "" => {
  return theme === "dark" || theme === "light" ? theme : "";
};

export const getSavedCourseTheme = (fallback: CourseTheme = "light") => {
  const rawTheme = normalizeCourseTheme(
    window.localStorage.getItem(COURSE_THEME_KEY)
  );
  if (rawTheme) return rawTheme;

  try {
    const storedTheme = normalizeCourseTheme(
      storageLocal().getItem(COURSE_THEME_KEY)
    );
    if (storedTheme) return storedTheme;
  } catch {
    // course_theme is often stored as a raw string; storageLocal parses JSON.
  }

  return fallback;
};

export const getResponsiveLayoutTheme = () => {
  try {
    return (storageLocal().getItem(RESPONSIVE_LAYOUT_KEY) as any)?.darkMode
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export const setSavedCourseTheme = (theme: CourseTheme) => {
  window.localStorage.setItem(COURSE_THEME_KEY, theme);

  try {
    const layout = (storageLocal().getItem(RESPONSIVE_LAYOUT_KEY) as any) || {};
    storageLocal().setItem(RESPONSIVE_LAYOUT_KEY, {
      ...layout,
      darkMode: theme === "dark"
    });
  } catch {
    // Keep the theme usable even if a legacy responsive-layout value is broken.
  }
};

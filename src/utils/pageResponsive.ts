import { computed } from "vue";
import { useAppStoreHook } from "@/store/modules/app";

export function usePageResponsive() {
  const appStore = useAppStoreHook();

  const isMobile = computed(
    () => appStore.getDevice === "mobile" || appStore.getViewportWidth <= 768
  );
  const paginationLayout = computed(() =>
    isMobile.value
      ? "sizes, prev, pager, next"
      : "total, sizes, prev, pager, next, jumper"
  );

  const getDialogWidth = (desktop = "50%", mobile = "92%") =>
    isMobile.value ? mobile : desktop;

  return {
    isMobile,
    paginationLayout,
    getDialogWidth
  };
}

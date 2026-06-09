import { defineStore } from "pinia";
import {
  applyUAFlags,
  getUA,
  resolveLayoutDevice,
  type LayoutDevice
} from "@/utils/ua";
import {
  type appType,
  store,
  getConfig,
  storageLocal,
  responsiveStorageNameSpace
} from "../utils";

const initialUA = getUA();
applyUAFlags(initialUA);

export const useAppStore = defineStore("pure-app", {
  state: (): appType => ({
    sidebar: {
      opened:
        storageLocal().getItem<StorageConfigs>(
          `${responsiveStorageNameSpace()}layout`
        )?.sidebarStatus ?? getConfig().SidebarStatus,
      withoutAnimation: false,
      isClickCollapse: false
    },
    // 这里的 layout 用于监听容器拖拽后恢复对应的导航模式
    layout:
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      )?.layout ?? getConfig().Layout,
    device: resolveLayoutDevice(
      initialUA,
      document.documentElement.clientWidth || window.innerWidth
    ),
    ua: initialUA,
    isShowDouble: true,
    // 浏览器窗口的可视区域大小
    viewportSize: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    },
    // 作用于 draggable 页面，离开页面后不销毁 sortable 实例
    sortSwap: false
  }),
  getters: {
    getSidebarStatus(state) {
      return state.sidebar.opened;
    },
    getDevice(state) {
      return state.device;
    },
    getUA(state) {
      return state.ua;
    },
    getViewportWidth(state) {
      return state.viewportSize.width;
    },
    getViewportHeight(state) {
      return state.viewportSize.height;
    }
  },
  actions: {
    TOGGLE_SIDEBAR(opened?: boolean, resize?: string) {
      // resize 时走显式开关，普通交互时执行切换
      const layout =
        storageLocal().getItem<StorageConfigs>(
          `${responsiveStorageNameSpace()}layout`
        ) ?? {};

      if (opened && resize) {
        this.sidebar.withoutAnimation = true;
        this.sidebar.opened = true;
        this.sidebar.isClickCollapse = false;
        layout.sidebarStatus = true;
      } else if (!opened && resize) {
        this.sidebar.withoutAnimation = true;
        this.sidebar.opened = false;
        this.sidebar.isClickCollapse = false;
        layout.sidebarStatus = false;
      } else if (!opened && !resize) {
        this.sidebar.withoutAnimation = false;
        this.sidebar.opened = !this.sidebar.opened;
        this.sidebar.isClickCollapse = !this.sidebar.opened;
        layout.sidebarStatus = this.sidebar.opened;
      }

      storageLocal().setItem(`${responsiveStorageNameSpace()}layout`, layout);
    },
    async toggleSideBar(opened?: boolean, resize?: string) {
      await this.TOGGLE_SIDEBAR(opened, resize);
    },
    toggleDevice(device: LayoutDevice) {
      this.device = device;
      // 切换设备时同步更新 UA 信息
      this.ua = getUA();
      applyUAFlags(this.ua);
    },
    refreshUA(viewportWidth?: number) {
      const nextUA = getUA();
      this.ua = nextUA;
      this.device = resolveLayoutDevice(
        nextUA,
        viewportWidth ?? this.viewportSize.width
      );
      applyUAFlags(nextUA);
    },
    setLayout(layout) {
      this.layout = layout;
    },
    showDouble(bool: boolean) {
      this.isShowDouble = bool;
    },
    setViewportSize(size) {
      this.viewportSize = size;
    },
    setSortSwap(val) {
      this.sortSwap = val;
    }
  }
});

export function useAppStoreHook() {
  return useAppStore(store);
}

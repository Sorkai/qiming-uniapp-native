declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "*.scss" {
  const scss: Record<string, string>;
  export default scss;
}

declare module "vue3-puzzle-vcode";
declare module "vue-virtual-scroller";
declare module "vuedraggable/src/vuedraggable";

declare module "@vue-office/docx/lib/v3/index.js" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>>;
  export default component;
}

declare module "@vue-office/excel/lib/v3/index.js" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>>;
  export default component;
}

declare module "@vue-office/pptx/lib/v3/index.js" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>>;
  export default component;
}

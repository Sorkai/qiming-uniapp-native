<script setup lang="ts">
import { reactive, getCurrentInstance, onBeforeMount, onUnmounted } from "vue";
import { deviceDetection } from "@pureadmin/utils";
import AMapLoader from "@amap/amap-jsapi-loader";
import { mapJson } from "@/api/mock";

// 使用内联 SVG 作为车辆图标
const car =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24'%3E%3Cpath fill='%234299e1' d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm110c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E";

export interface MapConfigureInter {
  on: Fn;
  destroy?: Fn;
  clearEvents?: Fn;
  addControl?: Fn;
  setCenter?: Fn;
  setZoom?: Fn;
  plugin?: Fn;
}

defineOptions({
  name: "Amap"
});

let MarkerCluster;
let map: MapConfigureInter;

const instance = getCurrentInstance();

const mapSet = reactive({
  loading: deviceDetection() ? false : true
});

// 地图创建完成(动画关闭)
const complete = (): void => {
  if (map) {
    map.on("complete", () => {
      mapSet.loading = false;
    });
  }
};

onBeforeMount(() => {
  if (!instance) return;
  const { MapConfigure } = instance.appContext.config.globalProperties.$config;
  const { options } = MapConfigure;

  AMapLoader.load({
    key: MapConfigure.amapKey,
    version: "2.0",
    plugins: ["AMap.MarkerCluster"]
  })
    .then(AMap => {
      // 创建地图实例
      map = new AMap.Map(instance.refs.mapview, options);

      //地图中添加地图操作ToolBar插件
      map.plugin(["AMap.ToolBar", "AMap.MapType"], () => {
        map.addControl(new AMap.ToolBar());
        //地图类型切换
        map.addControl(
          new AMap.MapType({
            defaultType: 0
          })
        );
      });

      MarkerCluster = new AMap.MarkerCluster(map, [], {
        // 聚合网格像素大小
        gridSize: 80,
        maxZoom: 14,
        renderMarker(ctx) {
          const { marker, data } = ctx;
          if (Array.isArray(data) && data[0]) {
            const { driver, plateNumber, orientation } = data[0];
            const content = `<img style="transform: scale(1) rotate(${
              360 - Number(orientation)
            }deg);" src='${car}' />`;
            marker.setContent(content);
            marker.setLabel({
              direction: "bottom",
              //设置文本标注偏移量
              offset: new AMap.Pixel(-4, 0),
              //设置文本标注内容
              content: `<div> ${plateNumber}(${driver})</div>`
            });
            marker.setOffset(new AMap.Pixel(-18, -10));
            marker.on("click", ({ lnglat }) => {
              map.setZoom(13); //设置地图层级
              map.setCenter(lnglat);
            });
          }
        }
      });

      // 获取模拟车辆信息
      mapJson()
        .then(({ data }) => {
          const points: object = data.map(v => {
            return {
              lnglat: [v.lng, v.lat],
              ...v
            };
          });
          if (MarkerCluster) MarkerCluster.setData(points);
        })
        .catch(err => {
          console.log("err:", err);
        });

      complete();
    })
    .catch(() => {
      mapSet.loading = false;
      throw "地图加载失败，请重新加载";
    });
});

onUnmounted(() => {
  if (map) {
    // 销毁地图实例
    map.destroy() && map.clearEvents("click");
  }
});
</script>

<template>
  <div id="mapview" ref="mapview" v-loading="mapSet.loading" />
</template>

<style lang="scss" scoped>
#mapview {
  height: calc(100vh - 86px);
}

:deep(.amap-marker-label) {
  border: none;
}
</style>

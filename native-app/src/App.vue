<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  console.log("Qiming Native App Launch");
});
onShow(() => {
  console.log("Qiming Native App Show");
});
onHide(() => {
  console.log("Qiming Native App Hide");
});
</script>
<style>
page {
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  background: #f7f8fc;
}
</style>

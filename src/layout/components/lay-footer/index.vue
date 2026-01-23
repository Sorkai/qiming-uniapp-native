<script setup lang="ts">
import { getConfig } from "@/config";

const TITLE = getConfig("Title");
</script>

<template>
  <footer
    class="layout-footer text-[rgba(0,0,0,0.6)] dark:text-[rgba(220,220,242,0.8)]"
  >
    <div class="footer-container">
      <div class="line1">
        长春工业大学 吉林省长春市宽城区北远达大街 3000 号 计算机学院 启明智教项目
        <span class="domain">Intelledu.com</span>
      </div>
      <div class="line2">
        Copyright (c) 2024 Est. 吉林省云创迅捷软件开发有限公司 All Rights Reserved
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 16px 0;
  font-size: 13px;
  line-height: 1.8;
  text-align: center;

  .footer-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .domain {
    margin-left: 10px;
    font-weight: 500;
  }

  .line1 {
    opacity: 0.9;
  }

  .line2 {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>

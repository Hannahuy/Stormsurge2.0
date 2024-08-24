<template>
  <a-config-provider :locale="zhCN">
    <router-view></router-view>
  </a-config-provider>
</template>
<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
/* 禁止鼠标选中文字 */
div {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.el-picker__popper.el-popper {
  inset: 51% auto auto 15px !important;
}
.el-popper__arrow::before {
  display: none;
}
</style>

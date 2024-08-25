<template>
  <div class="page">
    <div class="top-view">
      <div>
        <span>近岸风暴潮防灾减灾数字孪生系统</span>
      </div>
      <div class="top-view-button">
        <div class="top-view-button-left">
          <div class="top-view-button-style" :class="{ 'active': activeButton === '实时感知' }"
            @click="setActiveButton('实时感知')">
            实时感知
            <div class="bottomurl" v-if="activeButton === '实时感知'"></div>
          </div>
          <div style="margin-left: 90px;" class="top-view-button-style" :class="{ 'active': activeButton === '模拟预测' }"
            @click="setActiveButton('模拟预测')">模拟预测
            <div class="bottomurl" v-if="activeButton === '模拟预测'"></div>
          </div>
        </div>
        <div class="top-view-button-right">
          <div style="margin-right: 90px;" class="top-view-button-style" :class="{ 'active': activeButton === '辅助决策' }"
            @click="setActiveButton('辅助决策')">辅助决策
            <div class="bottomurl" v-if="activeButton === '辅助决策'"></div>
          </div>
          <div class="top-view-button-style" :class="{ 'active': activeButton === '风险评估' }"
            @click="setActiveButton('风险评估')">风险评估
            <div class="bottomurl" v-if="activeButton === '风险评估'"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeButton === '风险评估'">
      <Virtualsimulation />
    </div>
    <div v-if="activeButton === '实时感知'">
      <Realtimeawareness />
    </div>
    <div v-if="activeButton === '模拟预测'">
      <Rapidpredictions />
    </div>
    <div v-if="activeButton === '辅助决策'">
      <Whatifanalysis />
    </div>
  </div>
  <!-- <background /> -->
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Virtualsimulation from './topButton/Virtualsimulation.vue'
import Realtimeawareness from './topButton/Realtimeawareness.vue'
import Rapidpredictions from './topButton/Rapidpredictions.vue'
import Whatifanalysis from './topButton/Whatifanalysis.vue'
import background from './topButton/background.vue'
import { callUIInteraction } from "../module/webrtcVideo/webrtcVideo.js";
import * as echarts from "echarts";
import axios from 'axios';

const activeButton = ref('实时感知')
const lastActiveButton = ref('')
const currentDate = ref('');
const current = new Date();
const options = { month: '2-digit', day: '2-digit' };
currentDate.value = current.toLocaleDateString('zh-CN', options);
const setActiveButton = (button) => {
  if (activeButton.value === button) {
    return; 
  } else {
    lastActiveButton.value = activeButton.value;
    activeButton.value = button;

    if (lastActiveButton.value) {
      callUIInteraction({
        ModuleName: `${lastActiveButton.value}`,
        FunctionName: `${lastActiveButton.value}`,
        State: false,
      });
    }
    callUIInteraction({
      ModuleName: `${button}`,
      FunctionName: `${button}`,
      State: true,
    });
  }
}

onMounted(() => {
  callUIInteraction({
      ModuleName: '实时感知',
      FunctionName: '实时感知',
      State: true,
    });
  if (window.performance.navigation.type == 1) {
    console.log("页面被刷新")
    sessionStorage.clear();
  } else {
    console.log("首次被加载")
  }
})
onBeforeUnmount(() => {

});
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.page>div {
  pointer-events: auto;
}

.top-view {
  width: 100%;
  height: 80px;
  background-image: url('../assets/img/title.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top-view span {
  color: #FFFFFF;
  line-height: 0px;
  text-align: center;
  font-style: normal;
  -moz-text-align-last: justify;
  text-align-last: justify;
  font-size: 28px;
  font-family: YouSheBiaoTiHei;
  font-weight: 600;
  background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 3px;
}

.top-view-button-left {
  position: absolute;
  top: 5px;
  left: 7.8%;
  display: flex;
}

.top-view-button-right {
  position: absolute;
  top: 5px;
  right: 7.8%;
  display: flex;
}

.top-view-button-style {
  width: 134px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: PangMenZhengDao;
  font-size: 22px;
  line-height: 44px;
  color: #FFFFFF;
  font-weight: 500;
  cursor: pointer;
  font-style: normal;
  cursor: pointer;
  letter-spacing: 3px;
}

.top-view-button-style.active {
  background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bottomurl {
  position: absolute;
  top: 26px;
  width: 134px;
  height: 50px;
  background-image: url('../assets/img/标题选中样式.png');
  background-repeat: no-repeat;
  background-position: -20% 50%;
}

.hleftbox {
  position: absolute;
  top: 12%;
  left: 10px;
  width: 420px;
  min-height: 800px;
  padding: 20px;
  box-sizing: border-box;
  background-image: url('../assets/img/kuang-1@3x.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.hleftbox-1 {
  min-height: 250px;
}

.hleftbox-1-title {
  height: 30px;
  background-image: url('../assets/img/标题背景.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  color: #b7cffc;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 30px;
  font-size: 18px;
}

.hleftbox-1-title span {
  font-family: PangMenZhengDao;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 5px;
  background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hleftbox-1-content {
  margin-top: 10px;
  height: 210px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  color: #b7cffc;
}

.hleftbox-1-content span {
  margin-left: 5px;
  margin-right: 5px;
  font-family: PangMenZhengDao;
  font-size: 16px;
  font-weight: 600;
  /* letter-spacing: 5px; */
  background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hleftbox-1-content-1 {
  width: 190px;
  height: 105px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hleftbox-1-content-1-span {
  display: flex;
  flex-direction: column;
}

.imgsize {
  width: 55px;
  height: 55px;
}

#hleftbox-1-content-echarts,
#hleftbox-2-content-echarts,
#hleftbox-3-content-echarts,
#hleftbox-4-content-echarts,
#hleftbox-5-content-echarts {
  width: 380px;
  margin-top: 10px;
  height: 210px;
}

.hleftbox-2 {
  min-height: 250px;
  margin-top: 10px;
}

.hleftbox-3 {
  margin-top: 10px;
  min-height: 250px;
}

.rightbox {
  position: absolute;
  top: 12%;
  right: 10px;
  width: 420px;
  min-height: 800px;
  padding: 20px;
  box-sizing: border-box;
  background-image: url('../assets/img/kuang-1@3x.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>

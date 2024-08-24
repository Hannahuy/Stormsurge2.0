<template>
  <div class="page">
    <div class="top-view">
      <div>
        <span>青岛澳门路近岸海洋动力灾害数字孪生系统</span>
      </div>
      <div class="top-view-button">
        <div class="top-view-button-left">
          <div class="top-view-button-style" :class="{ 'active': activeButton === '虚拟仿真' }"
            @click="setActiveButton('虚拟仿真')">
            虚拟仿真
            <div class="bottomurl" v-if="activeButton === '虚拟仿真'"></div>
          </div>
          <div style="margin-left: 90px;" class="top-view-button-style" :class="{ 'active': activeButton === '实时感知' }"
            @click="setActiveButton('实时感知')">实时感知
            <div class="bottomurl" v-if="activeButton === '实时感知'"></div>
          </div>
        </div>
        <div class="top-view-button-right">
          <div style="margin-right: 90px;" class="top-view-button-style" :class="{ 'active': activeButton === '模拟预测' }"
            @click="setActiveButton('模拟预测')">模拟预测
            <div class="bottomurl" v-if="activeButton === '模拟预测'"></div>
          </div>
          <div class="top-view-button-style" :class="{ 'active': activeButton === '假设分析' }"
            @click="setActiveButton('假设分析')">假设分析
            <div class="bottomurl" v-if="activeButton === '假设分析'"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="activeButton === '虚拟仿真'">
      <Virtualsimulation />
    </div>
    <div v-if="activeButton === '实时感知'">
      <Realtimeawareness />
    </div>
    <div v-if="activeButton === '模拟预测'">
      <Rapidpredictions />
    </div>
    <div v-if="activeButton === '假设分析'">
      <Whatifanalysis />
    </div>
    <div v-show="!activeButton">
      <div class="hleftbox">
        <div class="hleftbox-1">
          <div class="hleftbox-1-title">
            <span>最近24小时数据</span>
          </div>
          <div class="hleftbox-1-content">
            <div class="hleftbox-1-content-1">
              <img src="../assets/img/风场@3x.png" class="imgsize" alt="">
              <div class="hleftbox-1-content-1-span">
                <span>最大潮位：3.0m</span>
                <span>{{ currentDate }} 11:00</span>
              </div>
            </div>
            <div class="hleftbox-1-content-1">
              <img src="../assets/img/海温@3x.png" class="imgsize" alt="">
              <div class="hleftbox-1-content-1-span">
                <span>最小潮位：0.5m</span>
                <span>{{ currentDate }} 05:00</span>
              </div>
            </div>
            <div class="hleftbox-1-content-1">
              <img src="../assets/img/海浪@3x.png" class="imgsize" alt="">
              <div class="hleftbox-1-content-1-span">
                <span>最大波高：{{ maxWaveHeight }}m</span>
                <span>{{ wavemaxDataTime }}</span>
              </div>
            </div>
            <div class="hleftbox-1-content-1">
              <img src="../assets/img/流场@3x.png" class="imgsize" alt="">
              <div class="hleftbox-1-content-1-span">
                <span>最小波高：{{ minWaveHeight }}m</span>
                <span>{{ waveminDataTime }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="hleftbox-2">
          <div class="hleftbox-1-title">
            <span>最近一个月潮位变化</span>
          </div>
          <div id="hleftbox-1-content-echarts"></div>
        </div>
        <div class="hleftbox-3">
          <div class="hleftbox-1-title">
            <span>过去一周波高变化</span>
          </div>
          <div id="hleftbox-2-content-echarts"></div>
        </div>
      </div>
      <div class="rightbox">
        <div class="hleftbox-1">
          <div class="hleftbox-1-title">
            <span>小麦岛实时监测数据</span>
          </div>
          <div id="hleftbox-3-content-echarts"></div>
        </div>
        <div class="hleftbox-1">
          <div class="hleftbox-1-title">
            <span>未来24小时潮位预测</span>
          </div>
          <div id="hleftbox-4-content-echarts"></div>
        </div>
        <div class="hleftbox-1">
          <div class="hleftbox-1-title">
            <span>未来24小时波高预测</span>
          </div>
          <div id="hleftbox-5-content-echarts"></div>
        </div>
      </div>
    </div>
  </div>
  <background />
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

const activeButton = ref('')
const lastActiveButton = ref('')
const currentDate = ref('');
const current = new Date();
const options = { month: '2-digit', day: '2-digit' };
currentDate.value = current.toLocaleDateString('zh-CN', options);
const setActiveButton = (button) => {
  if (activeButton.value === button) {
    // 如果当前按钮已经被选中，则取消选中
    lastActiveButton.value = activeButton.value
    activeButton.value = ''
    leftcenter();
    righttop();
    rightcenter();
    callUIInteraction({
      ModuleName: `${lastActiveButton.value}`,
      FunctionName: `${lastActiveButton.value}`,
      State: false,
    });
  } else {
    // 否则设置为当前按钮
    lastActiveButton.value = activeButton.value
    activeButton.value = button
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

const maxWaveHeight = ref(null);
const minWaveHeight = ref(null);
const wavemaxDataTime = ref(null);
const waveminDataTime = ref(null); 

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  return `${year}${month}${day}${hours}`; // 返回YYYYMMDDHH格式
};

const formatDisplayDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  return `${month}/${day} ${hours}:00`;
};

const getLastWaveData = () => {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 1); // 往前推一天
  const staUtcTime = formatDate(startDate);
  const endUtcTime = formatDate(currentDate);
  const message = JSON.stringify({
    lon: 108.050537109375,
    lat: 18.302380604025146,
    type: 'wave',
    staUtcTime: staUtcTime,
    endUtcTime: endUtcTime
  });
  axios.post('https://www.oceanread.com/YHYBService/v1.4.0/WS_DataQuery.asmx/QueryDataFromFull', { message }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(res => {
      const data = res.data.data;
      if (data && data.length > 0) {
        // 如果数据长度为9，则只取前8条数据
        const processedData = data.length === 9 ? data.slice(0, 8) : data;
        maxWaveHeight.value = Math.max(...processedData.map(item => item.v));
        minWaveHeight.value = Math.min(...processedData.map(item => item.v));
        const maxIndex = processedData.findIndex(item => item.v === maxWaveHeight.value);
        const minIndex = processedData.findIndex(item => item.v === minWaveHeight.value);
        const maxTime = new Date(startDate.getTime() + maxIndex * 3 * 60 * 60 * 1000);
        const minTime = new Date(startDate.getTime() + minIndex * 3 * 60 * 60 * 1000);
        wavemaxDataTime.value = formatDisplayDate(maxTime);
        waveminDataTime.value = formatDisplayDate(minTime);
      } else {
        maxWaveHeight.value = null;
        minWaveHeight.value = null;
        wavemaxDataTime.value = null;
        waveminDataTime.value = null;
      }
    })
    .catch(error => {
      console.error(error);
    });
};
const nextxData = ref()
const nextyData = ref()
const getNextWaveData = () => {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setMinutes(0, 0, 0); // 将分钟、秒和毫秒设为0，得到整点时间
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 24); // 往后推24小时
  const staUtcTime = formatDate(startDate);
  const endUtcTime = formatDate(endDate);
  const message = JSON.stringify({
    lon: 108.050537109375,
    lat: 18.302380604025146,
    type: 'wave',
    staUtcTime: staUtcTime,
    endUtcTime: endUtcTime
  });

  axios.post('https://www.oceanread.com/YHYBService/v1.4.0/WS_DataQuery.asmx/QueryDataFromFull', { message }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(res => {
      let data = res.data.data;

      if (data && data.length === 9) {
        data = data.slice(0, 8);
      }
      if (data && data.length === 8) {
        let time = new Date(startDate);
        nextxData.value = []; // 清空之前的数据
        nextyData.value = []; // 清空之前的数据

        data.forEach(item => {
          time.setHours(time.getHours() + 3); // 增加3小时
          nextxData.value.push(formatDisplayDate(time)); // 添加到 xData7
          nextyData.value.push(item.v); // 添加到 yData7
        });
        rightbottom(); // 初始化图表
      }
    })
    .catch(error => {
      console.error(error);
    });
};

const xData7 = ref();
const yData7 = ref();

const get7DayWaveData = () => {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 7); // 往前推一周
  const staUtcTime = formatDate(startDate);
  const endUtcTime = formatDate(currentDate);
  const message = JSON.stringify({
    lon: 108.050537109375,
    lat: 18.302380604025146,
    type: 'wave',
    staUtcTime: staUtcTime,
    endUtcTime: endUtcTime
  });

  axios.post('https://www.oceanread.com/YHYBService/v1.4.0/WS_DataQuery.asmx/QueryDataFromFull', { message }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(res => {
      let data = res.data.data;

      if (data && data.length === 57) {
        data = data.slice(0, 56); // 去掉第57个，只取前56个值
      }

      if (data && data.length === 56) {
        let time = new Date(startDate);
        xData7.value = []; // 清空之前的数据
        yData7.value = []; // 清空之前的数据

        data.forEach(item => {
          time.setHours(time.getHours() + 3); // 增加3小时
          xData7.value.push(formatDisplayDate(time)); // 添加到 xData7
          yData7.value.push(item.v); // 添加到 yData7
        });
        leftbottom(); // 初始化图表
      }
    })
    .catch(error => {
      console.error(error);
    });
};

// 30天
const generateDates = (days) => {
  const dates = [];
  const today = new Date();
  today.setDate(today.getDate() + 1); // 从明天开始
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toLocaleDateString()); // 格式化日期
  }
  return dates;
};
// 24小时
const generateHours = (hours) => {
  const timeLabels = [];
  for (let i = 0; i < hours; i++) {
    const hour = i < 10 ? `0${i}:00` : `${i}:00`; // 格式化为两位数
    timeLabels.push(hour);
  }
  return timeLabels;
};

let TideEchartsdata = null;
const leftcenter = () => {
  const salinityChartElement = document.getElementById("hleftbox-1-content-echarts");
  if (TideEchartsdata) {
    TideEchartsdata.dispose();
  }
  TideEchartsdata = echarts.init(salinityChartElement);

  // 未来30天
  const days = 30;
  const dates = generateDates(days);

  // 数据
  const seriesData1 = [
    2.26, 3.12, 3.37, 2.84, 2.16, 1.85, 1.73, 1.94, 2.07, 2.11,
    2.04, 1.84, 1.64, 1.55, 1.72, 2.21, 2.48, 2.74, 2.91, 3.31,
    3.58, 2.79, 2.66, 2.41, 1.79, 2.33, 2.79, 2.07, 1.77, 1.49
  ];

  const seriesData2 = [
    -1.35, -0.87, -0.55, -1.32, -1.21, -1.07, -1.48, -1.62, -1.83, -1.49,
    -1.22, -1.64, -1.65, -1.81, -1.21, -1.05, -1.83, -1.55, -1.29, -1.64,
    -0.97, -1.23, -1.63, -1.55, -1.87, -2.01, -1.94, -1.67, -1.53, -1.22
  ];

  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14,
        },
      },
      splitLine: { show: false },
    },
    yAxis: {
      name: '水位 (m)', // 添加单位
      nameTextStyle: {
        color: "#b7cffc",
        fontSize: 14
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14
        }
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: '最大潮位',
        type: 'bar',
        stack: 'stack1', // 堆叠标识
        barWidth: '40%', // 设置条形宽度
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00f2fe' }, // 渐变起始颜色
              { offset: 1, color: '#0088ff' }  // 渐变结束颜色
            ],
            global: false // 默认值为 false
          }
        },
        data: seriesData1 // 使用第一个数据系列
      },
      {
        name: '最小潮位',
        type: 'bar',
        stack: 'stack1', // 堆叠标识
        barWidth: '40%', // 设置条形宽度
        barGap: '0%', // 设置条形之间的间距为0
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#ffcc80' }, // 渐变起始颜色（浅橙色）
              { offset: 1, color: '#ff5722' }  // 渐变结束颜色（深橙色）
            ],
            global: false // 默认值为 false
          }
        },
        data: seriesData2 // 使用第二个数据系列
      }
    ],
    grid: { x: 35, y: 30, x2: 15, y2: 25 },
  };
  TideEchartsdata.setOption(options);
};
let TideEchartsdatas = null;
const leftbottom = () => {
  const salinityChartElement = document.getElementById("hleftbox-2-content-echarts");
  if (TideEchartsdatas) {
    TideEchartsdatas.dispose();
  }
  TideEchartsdatas = echarts.init(salinityChartElement);
  const options = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: xData7.value, // 使用生成的日期
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14,
        },
      },
    },
    yAxis: {
      name: '波高 (m)', // 添加单位
      nameTextStyle: {
        color: "#b7cffc",
        fontSize: 14
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14
        }
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        type: 'line',
        showSymbol: false,
        name: '波高',
        data: yData7.value,
        stack: "Total",
        smooth: true,
        lineStyle: { width: 0 },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 1, color: "#0358c0" },
            { offset: 0, color: "#28F2E6" },
          ]),
        },
        emphasis: { focus: "series" },
      }
    ],
    grid: { x: 45, y: 30, x2: 15, y2: 25 },
  };
  TideEchartsdatas.setOption(options);
};
let TideEchartsdatass = null;
const righttop = () => {
  const salinityChartElement = document.getElementById("hleftbox-3-content-echarts");
  if (TideEchartsdatass) {
    TideEchartsdatass.dispose();
  }
  TideEchartsdatass = echarts.init(salinityChartElement);

  const hours = 24; // 24小时
  const timeLabels = generateHours(hours);

  const options = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '9%',
      top: '20%',
      right: '22%',
      bottom: '18%'
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        // rotate: 30,    // 旋转角度，这里设置为45度
        fontSize: 14,  // 这里可以根据需要调整字体大小
        // interval: 0,
        color: '#b7cffc'
      },
      data: timeLabels
    },
    yAxis: {
      type: 'value',
      name: '波高(m)',
      nameTextStyle: {
        color: '#b7cffc',
        fontFamily: 'FZLTHK--GBK1-0',
        fontSize: '14'
      },
      splitLine: {
        show: false // 不显示网格线
      },
      axisLabel: {
        rotate: 0,    // 旋转角度，这里设置为45度
        fontSize: 14,  // 这里可以根据需要调整字体大小
        color: '#b7cffc'
      },
    },
    visualMap: {
      top: 'middle',    // 将位置设置为中间，也可以用百分比或具体数值调整位置
      right: 10,
      align: 'left',   // 确保与右侧对齐
      itemWidth: 10,    // 调整色带的宽度
      itemHeight: 10,  // 调整色带的高度，较大的高度会增加间隙感
      textStyle: {
        color: '#b7cffc',  // 文字颜色
        fontSize: 12   // 文字大小
      },
      pieces: [
        {
          gt: 0,
          lte: 1,
          color: '#93CE07'
        },
        {
          gt: 1,
          lte: 2,
          color: '#FBDB0F'
        },
        {
          gt: 2,
          lte: 3,
          color: '#FC7D02'
        },
        {
          gt: 3,
          lte: 4,
          color: '#FD0100'
        },
        {
          gt: 4,
          lte: 5,
          color: '#AA069F'
        },
        {
          gt: 5,
          color: '#AC3B2A'
        }
      ],
      outOfRange: {
        color: '#999'
      }
    },
    series: [
      {
        name: '波高 m',
        type: 'line',
        smooth: 0.2,
        data: [0.04, 1.10, 2.50, 3.80, 4.27, 4.54, 4.08, 3.60, 2.50, 2.00, 1.75, 0.090, 1.78, 2.78, 3.78, 4.20, 4.00, 3.00, 2.20, 0.9, 1.12, 1.35, 1.27, 1.18],
      }
    ]
  };
  TideEchartsdatass.setOption(options);
};
let TideEchartsdatasss = null;
const rightcenter = () => {
  const salinityChartElement = document.getElementById("hleftbox-4-content-echarts");
  if (TideEchartsdatasss) {
    TideEchartsdatasss.dispose();
  }
  TideEchartsdatasss = echarts.init(salinityChartElement);
  const hours = 24; // 24小时
  const timeLabels = generateHours(hours);
  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: timeLabels, // 使用生成的时间标签
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#b7cffc",
            fontSize: 14,
          },
        },
      }
    ],
    yAxis: {
      name: '水位 (m)', // 添加单位
      nameTextStyle: {
        color: "#b7cffc",
        fontSize: 14
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14
        }
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        name: '水位',
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          // 使用渐变色
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#00f2fe' }, // 渐变起始颜色
              { offset: 1, color: '#0088ff' }  // 渐变结束颜色
            ],
            global: false // 缺省为 false
          }
        },
        data: [-1.04, -0.67, -0.33, -0.04, 0.17, 0.67, 1.21, 1.47, 1.63, 1.85,
          1.93, 1.97, 1.72, 1.57, 1.31, 1.08, 0.64, 0.31, 0.13, -0.11,
        -0.37, -0.69, -0.81, -1.27]
      }
    ],
    grid: { x: 35, y: 30, x2: 15, y2: 25 },
  };
  TideEchartsdatasss.setOption(options);
};
let TideEchartsdatassss = null;
const rightbottom = () => {
  const salinityChartElement = document.getElementById("hleftbox-5-content-echarts");
  if (TideEchartsdatassss) {
    TideEchartsdatassss.dispose();
  }
  TideEchartsdatassss = echarts.init(salinityChartElement);
  const options = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      data: nextxData.value,
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14,
        },
      },
    },
    yAxis: {
      name: '波高 (m)', // 添加单位
      nameTextStyle: {
        color: "#b7cffc",
        fontSize: 14
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: true,
        textStyle: {
          color: "#b7cffc",
          fontSize: 14
        }
      },
      splitLine: {
        show: false
      }
    },
    series: [
      {
        type: 'line',
        showSymbol: false,
        name: '波高',
        data: nextyData.value,
        stack: "Total",
        smooth: true,
        lineStyle: { width: 0 },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 1, color: "#0358c0" },
            { offset: 0, color: "#28F2E6" },
          ]),
        },
        emphasis: { focus: "series" },
      }
    ],
    grid: { x: 35, y: 30, x2: 15, y2: 25 },
  };
  TideEchartsdatassss.setOption(options);
};
onMounted(() => {
  leftcenter();
  righttop();
  rightcenter();
  getLastWaveData();
  getNextWaveData();
  get7DayWaveData();
  if (window.performance.navigation.type == 1) {
    console.log("页面被刷新")
    sessionStorage.clear();
  } else {
    console.log("首次被加载")
  }
})
onBeforeUnmount(() => {
  const echartsDataArray = [
    TideEchartsdata,
    TideEchartsdatas,
    TideEchartsdatass,
    TideEchartsdatasss,
    TideEchartsdatassss
  ];
  echartsDataArray.forEach(echartsData => {
    if (echartsData) {
      echartsData.dispose();
    }
  });
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

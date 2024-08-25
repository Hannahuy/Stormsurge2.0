<template>
    <div class="leftbox">
        <div class="leftbox-top">
            <div class="leftbox-top-title">
                <img :src="currentImage" alt="" class="FBshow" @click="toggleImage">
                <span>潮位变化</span>
            </div>
            <div id="TideEcharts"></div>
        </div>
        <div class="leftbox-bottom">
            <div class="leftbox-top-title">
                <img :src="currentImage" alt="" class="FBshow" @click="toggleImage">
                <span>波高变化</span>
            </div>
            <div id="WaveheightEcharts"></div>
        </div>
    </div>
    <div class="bottomCalendar">
        <el-date-picker v-model="timePick" type="date" :disabled-date="disabledDate" :editable="false" />
    </div>
    <div class="bottombox-button">
        <el-button type="primary" class="bottombox-Backoff" :disabled="isDisabled" @click="Backoff"></el-button>
        <el-button type="primary" class="bottombox-play" :class="{ active: activePlay === 'play' }"
            @click="togglePlay"></el-button>
        <el-button type="primary" class="bottombox-Fastforward" :disabled="isDisabled" @click="Fastforward"></el-button>
    </div>
    <div class="bottombox">
        <div class="bottombox-slider">
            <div :style="adjustedStyle">
                <span class="bottombox-slider-span">{{ formattedTime }}</span>
            </div>
            <el-slider :step="3600000" v-model="timePlay" :show-tooltip="false" :min="min" :max="max" :marks="marks"
                style="position: relative; z-index: 1; width: 1600px" @change="gettimePlay">
            </el-slider>
        </div>
    </div>
    <div class="rightbox">
        <div class="hleftbox-1">
            <div class="hleftbox-1-title">
                <span>最近24小时数据</span>
            </div>
            <div class="hleftbox-1-content">
                <div class="hleftbox-1-content-1">
                    <img src="../../assets/img/风场@3x.png" class="imgsize" alt="">
                    <div class="hleftbox-1-content-1-span">
                        <span>最大潮位：{{ maxTideHeight }}m</span>
                        <span>{{ tidemaxDataTime }}</span>
                    </div>
                </div>
                <div class="hleftbox-1-content-1">
                    <img src="../../assets/img/海温@3x.png" class="imgsize" alt="">
                    <div class="hleftbox-1-content-1-span">
                        <span>最小潮位：{{ minTideHeight }}m</span>
                        <span>{{ tideminDataTime }}</span>
                    </div>
                </div>
                <div class="hleftbox-1-content-1">
                    <img src="../../assets/img/海浪@3x.png" class="imgsize" alt="">
                    <div class="hleftbox-1-content-1-span">
                        <span>最大波高：{{ maxWaveHeight }}m</span>
                        <span>{{ wavemaxDataTime }}</span>
                    </div>
                </div>
                <div class="hleftbox-1-content-1">
                    <img src="../../assets/img/流场@3x.png" class="imgsize" alt="">
                    <div class="hleftbox-1-content-1-span">
                        <span>最小波高：{{ minWaveHeight }}m</span>
                        <span>{{ waveminDataTime }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="hleftbox-1">
            <div class="hleftbox-1-title">
                <span>小麦岛实时监测数据</span>
            </div>
            <div id="hleftbox-3-content-echarts"></div>
        </div>
        <div class="hleftbox-3">
            <div class="hleftbox-1-title">
                <span>过去一周波高变化</span>
            </div>
            <div id="hleftbox-2-content-echarts"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { callUIInteraction, addResponseEventListener, } from "../../module/webrtcVideo/webrtcVideo.js";
import { ElMessage } from 'element-plus'
import imgshow from '../../assets/img/浮标.png'
import imageshow from '../../assets/img/浮标 (1).png'
import axios from 'axios'
import { ElLoading } from 'element-plus'

const loading = ref()
const Tidedata = ref();
const Wavedata = ref();
const currentImage = ref(imageshow);
const toggleImage = () => {
    if (currentImage.value === imageshow) {
        callUIInteraction({
            ModuleName: '实时感知',
            FunctionName: '浮标模型',
            State: false
        })
        currentImage.value = imgshow;
        console.log('实时感知', '浮标模型', false);

    } else {
        callUIInteraction({
            ModuleName: '实时感知',
            FunctionName: '浮标模型',
            State: true
        })
        currentImage.value = imageshow;
        console.log('实时感知', '浮标模型', true);
    }
};

const timePick = ref(dayjs().toDate());
const timePlay = ref(dayjs().minute(0).second(0).valueOf());
const disabledDate = () => false;
const activePlay = ref("");
const isDisabled = ref(false);

const isProgrammaticDateChange = ref(false);

const isAdjustingTime = ref(false);
const isJumpingDay = ref(false);
// 倒退
const Backoff = () => {
    if (isAdjustingTime.value) return;
    isAdjustingTime.value = true;
    const previousTime = timePlay.value;
    timePlay.value = dayjs(previousTime).subtract(1, 'hour').valueOf();

    // 检查是否达到最小值
    if (timePlay.value < min.value) {
        isJumpingDay.value = true; // 标记为日期跳跃
        isProgrammaticDateChange.value = true;
        // 跳到前一天
        timePick.value = dayjs(timePick.value).subtract(1, 'day').toDate();
        timePlay.value = max.value; // 加满进度条，设置为最大值
    }

    // 格式化 timePlay 为 YYYYMMDDHH
    const formattedTimePlay = dayjs(timePlay.value).format('YYYYMMDDHH');

    // 查找并打印对应的值
    const tideItem = Tidedata.value.find(item => item.time === formattedTimePlay);
    const waveItem = Wavedata.value.find(item => item.time === formattedTimePlay);

    if (tideItem && waveItem) {
        callUIInteraction({
            ModuleName: '实时感知',
            FunctionName: `实时感知时间轴`,
            Waterhigh: tideItem.value1,
            Wavehigh: waveItem.v
        });
    } else {
        // ElMessage.warning('当前时刻无数据');
    }
    isAdjustingTime.value = false;
};


// 暂停/播放
let previousPlayState = "";
let intervalTime = null;
let playInterval = null;
const togglePlay = () => {
    intervalTime = 16.6665;
    previousPlayState = activePlay.value;
    activePlay.value = activePlay.value === "play" ? "" : "play";
    if (activePlay.value === "play") {
        playInterval = setInterval(() => {
            timePlay.value = dayjs(timePlay.value).add(1, "minute").valueOf();
            if (activePlay.value !== "play") {
                clearInterval(playInterval);
            }
        }, intervalTime);
    } else {
        clearInterval(playInterval);
    }
};
// 前进
const Fastforward = () => {
    if (isAdjustingTime.value) return;
    isAdjustingTime.value = true;
    const previousTime = timePlay.value;
    timePlay.value = dayjs(previousTime).add(1, 'hour').valueOf();

    // 检查是否达到最大值
    if (timePlay.value > max.value) {
        isJumpingDay.value = true; // 标记为日期跳跃
        isProgrammaticDateChange.value = true;
        // 跳到下一天
        timePick.value = dayjs(timePick.value).add(1, 'day').toDate();
        timePlay.value = min.value; // 清零进度条
    }

    // 格式化 timePlay 为 YYYYMMDDHH
    const formattedTimePlay = dayjs(timePlay.value).format('YYYYMMDDHH');
    console.log(formattedTimePlay); // 打印格式化后的值

    // 查找并打印对应的值
    const tideItem = Tidedata.value.find(item => item.time === formattedTimePlay);
    const waveItem = Wavedata.value.find(item => item.time === formattedTimePlay);

    if (tideItem && waveItem) {
        callUIInteraction({
            ModuleName: '实时感知',
            FunctionName: `实时感知时间轴`,
            Waterhigh: tideItem.value1,
            Wavehigh: waveItem.v
        });
    } else {
        // ElMessage.warning('当前时刻无数据');
    }
    isAdjustingTime.value = false;
};


const min = ref(dayjs(timePick.value).startOf("day").valueOf());
// 将 max 设置为当天的23点
const max = ref(dayjs(timePick.value).hour(23).minute(0).second(0).valueOf());

const formattedTime = computed(() => {
    const time = dayjs(timePlay.value);
    return time.format("YYYY/MM/DD HH:mm");
});

const style = computed(() => {
    const length = max.value - min.value,
        progress = timePlay.value - min.value,
        left = (progress / length) * 92;
    return {
        paddingLeft: `${left}%`,
    };
});

const adjustedStyle = computed(() => {
    const baseStyle = style.value;
    const divWidth = 125; // 计算宽度为125px
    const totalWidth = 1600;
    const leftPadding = parseFloat(baseStyle.paddingLeft);

    if ((leftPadding / 100) * totalWidth + divWidth > totalWidth) {
        return {
            paddingLeft: `${((totalWidth - divWidth) / totalWidth) * 100}%`,
        };
    }
    return baseStyle;
});

// 定义 slider 的刻度
const marks = computed(() => {
    const marks = {};
    const start = dayjs(min.value);
    for (let i = 0; i <= 23; i++) {
        const markTime = start.add(i, 'hour');
        marks[markTime.valueOf()] = {
            style: {
                color: '#ffffff'
            },
            label: markTime.format('HH:mm')
        };
    }
    return marks;
});
watch(timePick, (newVal) => {
    const selectedDate = dayjs(newVal);
    const today = dayjs(); // 获取今天的日期
    min.value = selectedDate.startOf("day").valueOf();
    // 更新 max 为当天23点
    max.value = selectedDate.hour(23).minute(0).second(0).valueOf();
    if (isProgrammaticDateChange.value) {
        isProgrammaticDateChange.value = false;
        return;
    }
    // 根据日期设置时间进度
    if (selectedDate.isSame(today, 'day')) {
        // 如果是今天，设置为当前小时的时间戳，分钟和秒数为0
        timePlay.value = today.startOf('hour').valueOf();
    } else {
        timePlay.value = selectedDate.startOf("day").valueOf();
    }
});
watch(timePlay, (newVal) => {
    if (isAdjustingTime.value) return;
    const currentTime = dayjs(newVal);
    if (currentTime.minute() === 0 && currentTime.second() === 0) {
        if (isJumpingDay.value) {
            isJumpingDay.value = false;
        } else {

        }
    }
    if (currentTime.isSame(dayjs(max.value))) {
        activePlay.value = '';
    }
});

// 监听时间轴
const gettimePlay = (e) => {
    timePlay.value = dayjs(e).second(0).valueOf(); // 确保秒数为 0
    if (activePlay.value === "play") {
        activePlay.value = "";
    }
}

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
const Tideinit = () => {
    const salinityChartElement = document.getElementById("TideEcharts");
    if (TideEchartsdata) {
        TideEchartsdata.dispose();
    }
    TideEchartsdata = echarts.init(salinityChartElement);
    const options = {
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: tidexData.value,
            axisLabel: {
                show: true,
                textStyle: {
                    color: "#b7cffc",
                    fontSize: 14,
                },
                formatter: function (value) {
                    // 提取时间部分
                    return value.split(' ')[1]; // 只显示时间部分
                },
            },
        },
        yAxis: {
            name: '潮位 (m)', // 添加单位
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
                type: 'bar', // 将类型改为 'bar'
                name: '潮位',
                data: tideyData.value,
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
                        global: false // 缺省为 false
                    }
                }
            }
        ],
        grid: { x: 35, y: 40, x2: 15, y2: 25 },
    };
    TideEchartsdata.setOption(options);
};

let WaveheightEchartsdata = null;
const Waveheightinit = () => {
    const salinityChartElement = document.getElementById("WaveheightEcharts");
    if (WaveheightEchartsdata) {
        WaveheightEchartsdata.dispose();
    }
    WaveheightEchartsdata = echarts.init(salinityChartElement);

    const options = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            data: wavexData.value,
            axisLabel: {
                show: true,
                textStyle: {
                    color: "#b7cffc",
                    fontSize: 14,
                },
                formatter: function (value) {
                    // 提取时间部分
                    return value.split(' ')[1]; // 只显示时间部分
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
                },
            },
            splitLine: {
                show: false
            },
            max: Math.max(...waveyData.value) + 0.3 // 设置最大值为当前最大值加0.5
        },
        series: [
            {
                type: 'line',
                showSymbol: false,
                name: '波高',
                data: waveyData.value,
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
        grid: { x: 35, y: 40, x2: 15, y2: 25 },
    };
    WaveheightEchartsdata.setOption(options);
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

const maxWaveHeight = ref(null);
const minWaveHeight = ref(null);
const wavemaxDataTime = ref(null);
const waveminDataTime = ref(null);

const maxTideHeight = ref(null);
const minTideHeight = ref(null);
const tidemaxDataTime = ref(null);
const tideminDataTime = ref(null);

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

const wavexData = ref();
const waveyData = ref();

const getLastWaveData = () => {
    return new Promise((resolve, reject) => {
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
                    // const processedData = data.length === 9 ? data.slice(0, 8) : data;
                    const processedData = data;

                    // 获取昨天的当前时间
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const baseTime = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}${String(yesterday.getHours()).padStart(2, '0')}`;

                    // 为每个数据项添加 time 属性
                    processedData.forEach((item, index) => {
                        const hourOffset = index * 3; // 每个数据项间隔3小时
                        const newTime = new Date(yesterday);
                        newTime.setHours(newTime.getHours() + hourOffset);
                        item.time = `${newTime.getFullYear()}${String(newTime.getMonth() + 1).padStart(2, '0')}${String(newTime.getDate()).padStart(2, '0')}${String(newTime.getHours()).padStart(2, '0')}`;
                    });
                    Wavedata.value = processedData;
                    maxWaveHeight.value = Math.max(...processedData.map(item => item.v));
                    minWaveHeight.value = Math.min(...processedData.map(item => item.v));
                    const maxIndex = processedData.findIndex(item => item.v === maxWaveHeight.value);
                    const minIndex = processedData.findIndex(item => item.v === minWaveHeight.value);
                    const maxTime = new Date(startDate.getTime() + maxIndex * 3 * 60 * 60 * 1000);
                    const minTime = new Date(startDate.getTime() + minIndex * 3 * 60 * 60 * 1000);
                    wavemaxDataTime.value = formatDisplayDate(maxTime);
                    waveminDataTime.value = formatDisplayDate(minTime);
                    let time = new Date(startDate);
                    wavexData.value = []; // 清空之前的数据
                    waveyData.value = []; // 清空之前的数据

                    data.forEach(item => {
                        wavexData.value.push(formatDisplayDate(time)); // 添加到 wavexData
                        waveyData.value.push(item.v); // 添加到 waveyData
                        time.setHours(time.getHours() + 3); // 增加3小时
                    });
                    Waveheightinit(); // 初始化图表
                } else {
                    maxWaveHeight.value = null;
                    minWaveHeight.value = null;
                    wavemaxDataTime.value = null;
                    waveminDataTime.value = null;
                }
                resolve()
            })
            .catch(error => {
                console.error(error);
                reject()
            });
    });

};

const xData7 = ref();
const yData7 = ref();

const get7DayWaveData = async () => {
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
                    xData7.value.push(formatDisplayDate(time)); // 添加到 xData7
                    yData7.value.push(item.v); // 添加到 yData7
                    time.setHours(time.getHours() + 3); // 增加3小时
                });
                leftbottom(); // 初始化图表
            }
            loading.value.close();
            return
        })
        .catch(error => {
            console.error(error);
            return
        });
};
const tidexData = ref();
const tideyData = ref();
const getTidedata = () => {
    return new Promise((resolve, reject) => {
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 1); // 往前推一天
        const staUtcTime = formatDate(startDate);
        const endUtcTime = formatDate(currentDate);
        const data = {
            dataType: 'BH_crt',
            endUtcTimeStr: endUtcTime,
            lat: 36.04254778378739,
            lon: 120.37788381113283,
            startUtcTimeStr: staUtcTime,
        }
        axios.post('http://www.oceanread.com/QueryData/WS_DataQuery.asmx/QueryDataFromFull', data).then((res) => {
            const data = res.data.d.resultJsonArray;
            if (data && data.length > 0) {
                // 如果数据长度为9，则只取前8条数据
                // const processedData = data.length === 9 ? data.slice(0, 8) : data;
                const processedData = data;
                Tidedata.value = processedData;
                maxTideHeight.value = Math.max(...processedData.map(item => item.value1));
                minTideHeight.value = Math.min(...processedData.map(item => item.value1));
                const maxIndex = processedData.findIndex(item => item.value1 === maxTideHeight.value);
                const minIndex = processedData.findIndex(item => item.value1 === minTideHeight.value);
                const maxTime = new Date(startDate.getTime() + maxIndex * 3 * 60 * 60 * 1000);
                const minTime = new Date(startDate.getTime() + minIndex * 3 * 60 * 60 * 1000);
                tidemaxDataTime.value = formatDisplayDate(maxTime);
                tideminDataTime.value = formatDisplayDate(minTime);
                let time = new Date(startDate);
                tidexData.value = []; // 清空之前的数据
                tideyData.value = []; // 清空之前的数据
                data.forEach(item => {
                    tidexData.value.push(formatDisplayDate(time)); // 添加到 tidexData
                    tideyData.value.push(item.value1); // 添加到 tideyData
                    time.setHours(time.getHours() + 3); // 增加3小时
                });
                Tideinit(); // 初始化图表
            } else {
                maxTideHeight.value = null;
                minTideHeight.value = null;
                tidemaxDataTime.value = null;
                tideminDataTime.value = null;
            }
            resolve()
        }, () => {
            reject()
        })
    })

}
const forUEmessage = () => {
    callUIInteraction({
        ModuleName: '实时感知',
        FunctionName: `实时感知时间轴`,
        Waterhigh: Wavedata.value[Wavedata.value.length - 1].v,
        Wavehigh: Tidedata.value[Tidedata.value.length - 1].value1
    });
}
onMounted(async () => {
    loading.value = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    righttop();
    await getTidedata();
    await getLastWaveData();
    await get7DayWaveData();
    forUEmessage();
})
onBeforeUnmount(() => {
    if (TideEchartsdata) {
        TideEchartsdata.dispose();
    }
    if (WaveheightEchartsdata) {
        WaveheightEchartsdata.dispose();
    }
    if (TideEchartsdatass) {
        TideEchartsdatass.dispose();
    }
    if (TideEchartsdatas) {
        TideEchartsdatas.dispose();
    }
});
</script>

<style scoped>
.leftbox {
    padding: 7px 20px 20px 20px;
    width: 420px;
    min-height: 707px;
    position: absolute;
    background-image: url('../../assets/img/反框.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    top: 8%;
    left: 20px;
}

.leftbox-top {
    width: 100%;
    height: 350px;
}

/* .leftbox-top-content {
    width: 100%;
    height: 110px;
} */

.leftbox-top-title {
    width: 380px;
    height: 45px;
    background-image: url('../../assets/img/标题背景.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    line-height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.leftbox-top-title span {
    /* margin-left: 40px; */
    font-weight: 600;
    background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 20px;
    letter-spacing: 5px;
}

.leftbox-bottom {
    width: 100%;
    height: 350px;
    margin-top: 10px;
}

#TideEcharts {
    width: 380px;
    height: 290px;
    margin-top: 5px;
}

#WaveheightEcharts {
    width: 380px;
    height: 290px;
    margin-top: 5px;
}

.bottomCalendar {
    position: absolute;
    bottom: 90px;
    left: 30px;
    width: 130px;
    height: 2.5rem;
    color: rgb(0, 113, 204);
    border-radius: 1.25rem;
    line-height: 2.5rem;
    border: 0;
    cursor: pointer;
    padding: 0;
    font-size: 18px;
}

.bottombox {
    width: 100%;
    padding: 0 30px 0 100px;
    position: absolute;
    bottom: 25px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
}

.bottombox-button {
    position: absolute;
    bottom: 22px;
    left: 1.5%;
    display: flex;
    align-items: center;
    z-index: 1;
}

:deep(.el-input__wrapper) {
    position: absolute;
    z-index: 1000;
    width: 130px;
    height: 2.5rem;
    color: rgb(0, 113, 204);
    border-radius: 1.25rem;
    background: #fff;
    line-height: 2.5rem;
    border: 0;
    cursor: pointer;
    padding: 0;
    font-size: 18px;
}

:deep(.el-input__prefix-inner) {
    display: none !important;
}

:deep(.el-input__inner) {
    margin-right: 15px;
    color: rgb(0, 113, 204);
    cursor: pointer;
}

:deep(.el-input__suffix-inner) {
    display: none !important;
}

.bottombox-Backoff {
    background-image: url("../../assets/img/Backoff.png");
    background-repeat: no-repeat;
    background-color: #42aeff;
    background-position: 40% 50%;
    border-radius: 100%;
    border: 0;
    width: 30px;
    height: 30px;
}

.bottombox-play {
    background-image: url("../../assets/img/Timeout.png");
    background-repeat: no-repeat;
    background-color: #42aeff;
    background-position: 55% 50%;
    border-radius: 100%;
    border: 0;
    width: 40px;
    height: 40px;
}

.bottombox-play.active {
    background-image: url("../../assets/img/Play.png");
    background-repeat: no-repeat;
    background-color: #42aeff;
    background-position: center;
    background-size: 70% 70%;
    border-radius: 100%;
    border: 0;
    width: 40px;
    height: 40px;
}

.bottombox-Fastforward {
    background-image: url("../../assets/img/Fastforward.png");
    background-repeat: no-repeat;
    background-color: #42aeff;
    background-position: 55% 50%;
    border-radius: 100%;
    border: 0;
    width: 30px;
    height: 30px;
}

.bottombox-timespan {
    width: 1600px;
    position: absolute;
    display: flex;
    justify-content: space-between;
    color: white;
    bottom: -10px;
    font-size: 14px;
}

.bottombox-slider-span {
    width: 125px;
    background-color: #42aeff;
    border-radius: 1.25rem;
    color: white;
    display: block;
    text-align: center;
    font-size: 14px;
}

.bottombox-slider :deep(.el-slider__button) {
    background-color: transparent;
    border: 0;
}

/* .bottombox-slider :deep(.el-slider__bar) {
    background-color: #42aeff;
} */
.bottombox-slider :deep(.el-slider__bar) {
    background: linear-gradient(to right, #0088ff, #00f2fe);
    /* 渐变蓝色 */
}

.bottombox-slider :deep(.el-slider__marks-text) {
    color: white !important;
}

:deep(.el-slider__stop) {
    background-color: #fff;
    width: 2px;
}

.FBshow {
    margin-right: 10px;
    width: 25px;
    height: 25px;
    cursor: pointer;
}

.rightbox {
    position: absolute;
    top: 8%;
    right: 20px;
    width: 420px;
    min-height: 780px;
    padding: 6px 20px 20px 20px;
    box-sizing: border-box;
    background-image: url('../../src/assets/img/框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.hleftbox-1 {
    min-height: 205px;
}

.hleftbox-1-title {
    height: 45px;
    background-image: url('../../assets/img/标题背景.png');
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
    height: 150px;
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
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hleftbox-1-content-1-span {
    width: 147px;
    display: flex;
    flex-direction: column;
}

.imgsize {
    width: 43px;
    height: 43px;
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

.hleftbox-3 {
    margin-top: 10px;
    min-height: 250px;
}
</style>
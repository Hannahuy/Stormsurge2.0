<template>
    <div class="leftbox">
        <div class="leftbox-top">
            <div class="leftbox-top-title">
                <img :src="currentImage" alt="" class="FBshow" @click="toggleImage">
                <span>水位变化</span>
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
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { callUIInteraction, addResponseEventListener, } from "../../module/webrtcVideo/webrtcVideo.js";
import tabledataJson from "/public/data/实时监测.json";
import { ElMessage } from 'element-plus'
import imgshow from '../../assets/img/浮标.png'
import imageshow from '../../assets/img/浮标 (1).png'

const currentImage = ref(imageshow);
const toggleImage = () => {
    if (currentImage.value === imageshow) {
        callUIInteraction({
            ModuleName:'实时感知',
            FunctionName: '浮标模型',
            State: false
        })
        currentImage.value = imgshow;
    } else {
        callUIInteraction({
            ModuleName:'实时感知',
            FunctionName: '浮标模型',
            State: true
        })
        currentImage.value = imageshow;
    }
};

const timePick = ref(dayjs("2024-06-14").toDate());
const timePlay = ref(dayjs("2024-06-14 00:00").valueOf()); // 默认设置为 2024-06-14 00:00
const disabledDate = () => false;
const activePlay = ref("");
const isDisabled = ref(false);
// 倒退
const Backoff = () => {
    const previousTime = timePlay.value;
    const newTime = dayjs(previousTime).subtract(1, 'hour').valueOf();
    // 确保 newTime 不小于 min
    if (newTime >= min.value) {
        timePlay.value = newTime;
    } else {
        timePlay.value = min.value;
    }
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
    const previousTime = timePlay.value;
    const newTime = dayjs(previousTime).add(1, 'hour').valueOf();
    // 确保 newTime 不大于 max
    if (newTime <= max.value) {
        timePlay.value = newTime;
    } else {
        timePlay.value = max.value;
    }
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
    min.value = selectedDate.startOf("day").valueOf();
    // 更新 max 为当天23点
    max.value = selectedDate.hour(23).minute(0).second(0).valueOf();
    // 根据日期设置时间进度
    timePlay.value = selectedDate.startOf("day").valueOf();
});
watch(timePlay, (newVal) => {
    const currentTime = dayjs(newVal);
    // 检查当前时间是否为整点
    if (currentTime.minute() === 0 && currentTime.second() === 0) {
        // 打印对应的 waterlevel 值
        const hour = currentTime.hour(); // 获取当前小时
        if (hour >= 0 && hour < tabledataJson.length) { // 确保小时在数组范围内
            const waterLevel = parseFloat(tabledataJson[hour].waterlevel); // 获取对应的 waterlevel 并转换为浮点型
            const wavehight = parseFloat(tabledataJson[hour].Waveheight);
            callUIInteraction({
                ModuleName:'实时感知',
                FunctionName: '实时感知时间轴',
                Waterhigh: waterLevel,
                Wavehigh: wavehight
            });
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

let TideEchartsdata = null;
const Tideinit = () => {
    const salinityChartElement = document.getElementById("TideEcharts");
    if (TideEchartsdata) {
        TideEchartsdata.dispose();
    }
    TideEchartsdata = echarts.init(salinityChartElement);

    // 从 JSON 数据中提取 x 和 y 轴的数据
    const updatedTimes = tabledataJson.map(item => item.Updated);
    const waterLevels = tabledataJson.map(item => parseFloat(item.waterlevel));

    const options = {
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            data: updatedTimes,
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
                type: 'bar', // 将类型改为 'bar'
                name: '水位',
                data: waterLevels,
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
    // 从 JSON 数据中提取 x 和 y 轴的数据
    const updatedTimes = tabledataJson.map(item => item.Updated);
    const WaveHeight = tabledataJson.map(item => parseFloat(item.Waveheight));

    const options = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            data: updatedTimes,
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
            }
        },
        series: [
            {
                type: 'line',
                showSymbol: false,
                name: '波高',
                data: WaveHeight,
                stack: "Total",
                smooth: true,
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: "#0358c0" },
                        { offset: 0, color: "#28F2E6" },
                    ]),
                },
                emphasis: { focus: "series" },
                // lineStyle: {
                //     width: 5, // 设置线条粗细为5
                //     color: {
                //         type: 'linear',
                //         x: 0,
                //         y: 0,
                //         x2: 0,
                //         y2: 1,
                //         colorStops: [
                //             { offset: 0, color: '#00f2fe' }, // 渐变起始颜色
                //             { offset: 1, color: '#0088ff' }  // 渐变结束颜色
                //         ],
                //         global: false // 缺省为 false
                //     }
                // }
            }
        ],
        grid: { x: 35, y: 40, x2: 15, y2: 25 },
    };
    WaveheightEchartsdata.setOption(options);
};

onMounted(() => {
    Tideinit();
    Waveheightinit();
    callUIInteraction({
        ModuleName:'实时感知',
        FunctionName: `实时感知时间轴`,
        Waterhigh: tabledataJson[0].waterlevel,
        Wavehigh: tabledataJson[0].Waveheight
    });
})
onBeforeUnmount(() => {
    if (TideEchartsdata) {
        TideEchartsdata.dispose();
    }
    if (WaveheightEchartsdata) {
        WaveheightEchartsdata.dispose();
    }
});
</script>

<style scoped>
.leftbox {
    padding: 7px 20px 20px 20px;
    width: 420px;
    min-height: 707px;
    position: absolute;
    background-image: url('../../assets/img/框.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    top: 10%;
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
    color: #B7CFFC;
    font-size: 20px;
    letter-spacing: 5px;
}

/* .leftbox-top-content-btn {
    width: 100%;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
} */

/* .leftbox-top-content-botton {
    height: 32px;
    width: 80px;
    border: 0px;
    border-radius: 0;
    background-color: #8ca6bb;
}

.leftbox-top-content-botton.active {
    background-color: #116AD4;
} */

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
</style>
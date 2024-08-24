<template>
    <div class="leftbox-top">
        <div class="leftbox-top-button" :class="{ active: activeButton === 'wave' }" @click="toggleBackground('wave')">
            海浪预测
        </div>
        <div class="leftbox-top-button" :class="{ active: activeButton === 'tide' }" @click="toggleBackground('tide')">
            潮位预测
        </div>
    </div>
    <div v-if="showBottom" class="leftbox-bottom">
        <div class="leftbox-top-title">
            <span>{{ activeButton === 'wave' ? '海浪预测' : '潮位预测' }}</span>
        </div>
        <div id="WaveheightEcharts">
            <table class="custom-table">
                <tr>
                    <td>时间</td>
                    <td>{{ Datatime }}</td>
                </tr>
                <tr>
                    <td>经度</td>
                    <td>{{ Lon }}°E</td>
                </tr>
                <tr>
                    <td>纬度</td>
                    <td>{{ Lat }}°N</td>
                </tr>
                <tr v-for="(item, index) in Data" :key="index">
                    <td>{{ item.Name }}</td>
                    <td>{{ item.Value }}</td>
                </tr>
            </table>
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
    <div v-show="showbar" class="sidebar">
        <div :style="adjustedStylelang">
            <span class="sidebar-span">{{ colorvalue }}</span>
        </div>
        <el-slider v-model="colorvalue" :step="0.1" vertical height="200px" :min="0" :max="3" :marks="colormarks" :show-tooltip="false" @change="getcolorvalue" />
        <div class="color-bar"></div>
    </div>
    <div class="sidebar" v-show="shownextbar">
        <div :style="adjustedStylechao">
            <span class="sidebar-span2">{{ colorvalue2 }}</span>
        </div>
        <el-slider v-model="colorvalue2" :step="0.1" vertical height="200px" :min="-2" :max="3" :marks="colormarks2" :show-tooltip="false" @change="getcolorvalue2" />
        <div class="color-nextbar"></div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { callUIInteraction, addResponseEventListener } from "../../module/webrtcVideo/webrtcVideo.js";
import { ElMessage } from 'element-plus';

const Datatime = ref();
const Lon = ref();
const Lat = ref();
const Data = ref([]);
const showBottom = ref(false);
const activeButton = ref('wave'); // 默认选择海浪预测
const colorvalue = ref(3);
const colorvalue2 = ref(3);
const colormarks = {
    0: '0m',
    1: '',
    2: '',
};
const colormarks2 = {
    '-2': '-2m',
    '-1': '',
    '0': '',
    '1': '',
    '2': '',
};

const timePick = ref(dayjs("2024-03-21").toDate());
const timePlay = ref(dayjs("2024-03-21 12:00").valueOf()); // 默认设置为 2024-03-21 12:00

const disabledDate = () => false;

const toggleBackground = (button) => {
    if (activeButton.value === button) {
        activeButton.value = null;
    } else {
        activeButton.value = button;
        const name = button === 'wave' ? '海浪预测' : '潮位预测';

        showBottom.value = false; // 切换时隐藏
        if (button === 'wave') {
            timePick.value = dayjs("2024-03-21").toDate();
            timePlay.value = dayjs("2024-03-21 12:00").valueOf();
        } else if (button === 'tide') {
            timePick.value = dayjs("2024-06-06").toDate();
            timePlay.value = dayjs("2024-06-06 20:00").valueOf();
        }

        min.value = dayjs(timePick.value).startOf("day").valueOf();
        max.value = dayjs(timePick.value).endOf("day").valueOf();

        callUIInteraction({
            ModuleName: '模拟预测',
            FunctionName: name,
            Time: dayjs(timePlay.value).format('YYYY-MM-DD HH:mm:ss')
        });
    }
};

const activePlay = ref("");
const isDisabled = ref(false);

const predictionType = computed(() => {
    return activeButton.value === 'wave' ? '海浪预测时间轴' : '潮位预测时间轴';
});
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
const adjustedStylelang = computed(() => {
    return {
        bottom: `${30 + colorvalue.value * 60}px`,
        position: 'absolute',
    };
});
const adjustedStylechao = computed(() => {
    const minBottom = 45;
    const maxBottom = 225;
    const range = maxBottom - minBottom;
    const valueRange = 5;
    const bottom = minBottom + ((colorvalue2.value + 2) / valueRange) * range;
    return {
        bottom: `${bottom}px`,
        position: 'absolute',
    };
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
    if (isProgrammaticDateChange.value) {
        isProgrammaticDateChange.value = false;
        return;
    }
    // 根据日期设置时间进度
    if (selectedDate.isSame(dayjs("2024-03-21"), 'day')) {
        timePlay.value = dayjs("2024-03-21 12:00").valueOf();
    } else if (selectedDate.isSame(dayjs("2024-06-06"), 'day')) {
        timePlay.value = dayjs("2024-06-06 20:00").valueOf();
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
            callUIInteraction({
                ModuleName: '模拟预测',
                FunctionName: predictionType.value,
                Time: dayjs(timePlay.value).format('YYYY-MM-DD HH:mm:ss')
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
};
const getcolorvalue = (e) => {
    callUIInteraction({
        ModuleName: '模拟预测',
        FunctionName: '海浪预测色带值',
        Value: e
    });
};
const getcolorvalue2 = (e) => {
    callUIInteraction({
        ModuleName: '模拟预测',
        FunctionName: '潮位预测色带值',
        Value: e
    });
};

const showbar = computed(() => {
    return activeButton.value === "wave";
});
const shownextbar = computed(() => {
    return activeButton.value === "tide";
});

const myHandleResponseFunction = (data) => {
    console.log(data);
    const datajson = JSON.parse(data);
    if (datajson.Function === '报错') {
        ElMessage({
            message: datajson.Type,
            type: 'warning',
        });
        return
    } else {
        Datatime.value = datajson.DataTime;
        Lon.value = datajson.Lon;
        Lat.value = datajson.Lat;
        Data.value = datajson.Data;
        showBottom.value = true;
    }
}

onMounted(() => {
    callUIInteraction({
        ModuleName: '模拟预测',
        FunctionName: `海浪预测`,
    });
    callUIInteraction({
        ModuleName: '模拟预测',
        FunctionName: `海浪预测时间轴`,
        Time: dayjs(timePlay.value).format('YYYY-MM-DD HH:mm:ss')
    });
    addResponseEventListener("handle_responses", myHandleResponseFunction);
})
onBeforeUnmount(() => {

});
</script>

<style scoped>
.leftbox-top {
    width: 200px;
    height: 150px;
    position: absolute;
    left: 20px;
    display: flex;
    flex-direction: column;
}

.leftbox-top-button {
    margin-top: 20px;
    width: 150px;
    height: 50px;
    background-image: url('../../assets/img/按钮.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #FFFFFF;
    letter-spacing: 5px;
    cursor: pointer;
    transition: background-image 0.3s;
}

.leftbox-top-button.active {
    background-image: url('../../assets/img/按钮-变.png');
}

.leftbox-top-title {
    width: 460px;
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

.leftbox-bottom {
    position: absolute;
    background-image: url('../../assets/img/框.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 460px;
    height: 300px;
    top: 280px;
    left: 15px;
}

#TideEcharts {
    padding: 0 20px 0 20px;
    width: 460px;
    height: 240px;
    margin-top: 5px;
}

#WaveheightEcharts {
    padding: 0 20px 0 20px;
    width: 460px;
    height: 240px;
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
    /* height: 50px; */
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
    background-position: center;
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
    background-position: center;
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

.sidebar-span {
    width: 25px;
    height: 15px;
    background-color: #42aeff;
    border-radius: 0.25rem;
    color: white;
    display: block;
    text-align: center;
    font-size: 14px;
    position: absolute;
    right: 15px;
    bottom: 0px;
}

.sidebar-span2 {
    width: 25px;
    height: 15px;
    background-color: #42aeff;
    border-radius: 0.25rem;
    color: white;
    display: block;
    text-align: center;
    font-size: 14px;
    position: absolute;
    right: 15px;
}

.bottombox-slider :deep(.el-slider__button) {
    background-color: transparent;
    border: 0;
}

/* .bottombox-slider :deep(.el-slider__bar) {
    background-color: #42aeff;
} */

.sidebar {
    position: absolute;
    bottom: 35px;
    right: 20px;
    background-image: url("../../assets/img/框-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 90px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar :deep(.el-slider__button) {
    display: none;
}

.sidebar :deep(.el-slider.is-vertical .el-slider__bar) {
    width: 10px;
    border-radius: 20px;
}

.sidebar :deep(.el-slider.is-vertical .el-slider__runway) {
    width: 10px;
    border-radius: 20px;
}

.sidebar :deep(.el-slider__stop) {
    background-color: #fff;
    width: 10px;
    height: 2px;
}

.sidebar :deep(.el-slider.is-vertical .el-slider__marks-text) {
    left: -28px !important;
    color: white;
}

.color-bar {
    width: 10px;
    height: 200px;
    background: linear-gradient(180deg,
            #ff0000 5%,
            #ff8800 20%,
            #ffdb00 35%,
            #0cd112 50%,
            #0dc1ce 70%,
            #2323f5 95%);
    border-radius: 9px;
}

.color-bar-number {
    height: 176px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-right: 5px;
    font-size: 12px;
}

.nextbar {
    display: flex;
    align-items: center;
}

.color-nextbar {
    width: 10px;
    height: 200px;
    background-image: url('../../assets/img/colorbar.jpg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 9px;
}

.color-nextbar-number {
    /* height: 176px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    margin-right: 5px;
    font-size: 12px; */

    width: 10px;
    height: 200px;
    background-image: url('../../assets/img/colorbar2.jpg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 9px;
    
}

:deep(.el-table--fit) {
    padding: 0;
}

:deep(.el-table, .el-table__expanded-cell) {
    background-color: transparent;
    border: none;
}

:deep(.el-table th) {
    background-color: transparent;
    border: none;
}

:deep(.el-table tr) {
    background-color: transparent;
    border: none;
}

:deep(.el-table--enable-row-transition .el-table__body td, .el-table .cell) {
    background-color: transparent;
    border: none;
}

:deep(.el-table__header-wrapper th) {
    background-color: transparent;
    border: none;
}

:deep(.el-table__body-wrapper td) {
    border: none;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    background-color: transparent;
}

/* 去掉中间数据的分割线 */
:deep(.el-table__row > td) {
    border: none;
}

/* 去掉上面的线 */
:deep(.el-table th.is-leaf) {
    border: none;
}

:deep(.el-table__inner-wrapper:before) {
    display: none;
}

:deep(.el-table .cell) {
    color: #b7cffc;
}

/* .bottombox-slider :deep(.el-slider__runway) {
    background: linear-gradient(to right, #4facfe, #00f2fe);
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

.custom-table {
    border-collapse: collapse;
    width: 100%;
    color: #b7cffc;
    margin-top: 10px;
}

.custom-table th,
.custom-table td {
    border: 1px solid #416491;
    padding: 8px;
    text-align: center;
    height: 38px;
    width: 50%;
}
</style>
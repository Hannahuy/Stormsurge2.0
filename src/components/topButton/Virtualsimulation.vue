<template>
    <div class="leftbox">
        <div class="leftbox-top">
            <div class="Weather-list-top">
                <div class="Weather-list-top-left">
                    <span>{{ currentTime }}</span>
                    <span>{{ currentDate }}</span>
                </div>
                <div class="Weather-list-top-right">
                    <span>是否实时</span>
                    <el-switch style="margin-left: 20px;" v-model="swtichvalue" inline-prompt active-text="ON"
                        inactive-text="OFF" @change="handleswtich" />
                </div>
            </div>
            <div class="leftbox-top-title" style="margin-top: 20px;">
                <span>天气模拟</span>
            </div>
            <div class="Weather-type-icon">
                <img src="../../assets/img/weather_sunny_icon.png" alt="Sunny"
                    :class="{ 'selected': selectedIcon === 'sunny', 'disabled': swtichvalue }"
                    @click="selectIcon('sunny')" />
                <img src="../../assets/img/heavyrain.png" alt="Heavy Rain"
                    :class="{ 'selected': selectedIcon === 'heavyrain', 'disabled': swtichvalue }"
                    @click="selectIcon('heavyrain')" />
                <img src="../../assets/img/Mediumfog.png" alt="Medium Fog"
                    :class="{ 'selected': selectedIcon === 'fog', 'disabled': swtichvalue }"
                    @click="selectIcon('fog')" />
                <img src="../../assets/img/heavysnow.png" alt="Moderate Snow"
                    :class="{ 'selected': selectedIcon === 'snow', 'disabled': swtichvalue }"
                    @click="selectIcon('snow')" />
            </div>
            <div class="Weather-type-icon-detailed">
                <img :src="weatherone" alt=""
                    :class="{ 'selected': selectedIconDetail === 'sunnyDetail', 'disabled': swtichvalue }"
                    @click="selectDetailIcon('sunnyDetail')" />
                <img :src="weathertwo" alt=""
                    :class="{ 'selected': selectedIconDetail === 'heavyrainDetail', 'disabled': swtichvalue }"
                    @click="selectDetailIcon('heavyrainDetail')" />
                <img :src="weatherthree" alt=""
                    :class="{ 'selected': selectedIconDetail === 'fogDetail', 'disabled': swtichvalue }"
                    @click="selectDetailIcon('fogDetail')" />
            </div>
            <div class="leftbox-top-content">
                <span>风强度</span>
                <img src="../../assets/img/small_icon.png" alt="" :class="{ 'disabled': swtichvalue }" class="imgbutton"
                    @click="decreaseintensity">
                <el-slider v-model="Windintensity" :disabled="swtichvalue" style="width: 240px;margin-left: 20px;"
                    @change="getWindintensity" />
                <img src="../../assets/img/big_icon.png" :class="{ 'disabled': swtichvalue }" alt="" class="imgbutton"
                    @click="addintensity">
            </div>
            <div class="leftbox-top-content">
                <span style="margin-left: 12px;">风向</span>
                <img src="../../assets/img/small_icon.png" :class="{ 'disabled': swtichvalue }" alt="" class="imgbutton"
                    @click="decreasedirection">
                <el-slider v-model="Winddirection" :min="0" :max="360" :disabled="swtichvalue"
                    style="width: 240px;margin-left: 20px;" @change="getWinddirection" />
                <img src="../../assets/img/big_icon.png" :class="{ 'disabled': swtichvalue }" alt="" class="imgbutton"
                    @click="adddirection">
            </div>
            <div style="margin-top: 15px;" class="leftbox-top-title">
                <span>时间模拟</span>
            </div>
            <div class="leftbox-middle-content">
                <img src="../../assets/img/small_icon.png" :class="{ disabled: swtichvalue }" alt="" class="imgbutton"
                    @click="decreasetime" />
                <el-slider v-model="timevalue" :disabled="swtichvalue" style="width: 320px; margin-left: 20px;" :min="1"
                    :max="86400" :step="1" @input="updateTimeDisplay" @change="gettimevalue" :show-tooltip="false"
                    :marks="generateMarks()" />
                <img src="../../assets/img/big_icon.png" :class="{ disabled: swtichvalue }" alt="" class="imgbutton"
                    @click="addtime" />
            </div>
            <div class="leftbox-middle-bottom">
                <div class="leftbox-middle-bottom-content">
                    <img src="../../assets/img/morning_icon.png" alt="">
                    <span>早晨</span>
                </div>
                <div class="leftbox-middle-bottom-content">
                    <img src="../../assets/img/noon_icon.png" alt="">
                    <span>中午</span>
                </div>
                <!-- <div class="leftbox-middle-bottom-content">
                    <img src="../../assets/img/night_icon.png" alt="">
                    <span>傍晚</span>
                </div> -->
                <div class="leftbox-middle-bottom-content">
                    <img src="../../assets/img/evening_icon.png" alt="">
                    <span>晚上</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { callUIInteraction } from "../../module/webrtcVideo/webrtcVideo.js";
import sunnyday from '../../assets/img/weather_sunny_icon.png';
import sunnycloudyday from '../../assets/img/sunnycloudy.png';
import cloudyday from '../../assets/img/cloudy.png';
import lightrainday from '../../assets/img/lightrain.png';
import heavyrainday from '../../assets/img/heavyrain.png';
import rainstormday from '../../assets/img/rainstorm.png';
import Lightfogday from '../../assets/img/Lightfog.png';
import Mediumfogday from '../../assets/img/Mediumfog.png';
import Fogday from '../../assets/img/Fog.png';
import lightsnow from '../../assets/img/lightsnow.png';
import moderatesnow from '../../assets/img/moderatesnow.png';
import heavysnow from '../../assets/img/heavysnow.png';

const currentTime = ref('');
const currentDate = ref('');
const timevalue = ref(sessionStorage.getItem('timevalue') ? parseInt(sessionStorage.getItem('timevalue')) : 34200);
const Windintensity = ref(sessionStorage.getItem('Windintensity') ? parseInt(sessionStorage.getItem('Windintensity')) : 0);
const Winddirection = ref(sessionStorage.getItem('Winddirection') ? parseInt(sessionStorage.getItem('Winddirection')) : 0);
const generateMarks = () => {
    const marks = {};
    for (let i = 0; i <= 24; i += 5) { // 每3小时
        const seconds = i * 3600; // 每小时的秒数
        marks[seconds] = `${i}h`; // 显示为小时
    }
    return marks;
};
// 时间模拟时间轴
const updateTimeDisplay = (value) => {
    timevalue.value = value;
    sessionStorage.setItem('timevalue', value);
};
// 获取当前时间
const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTime.value = `${hours}:${minutes}:${seconds}`;

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    currentDate.value = `${year}/${month}/${day}`;
};

updateTime();
setInterval(updateTime, 1000);
// 是否实时
const swtichvalue = ref(false);
let intervalId;
const handleswtich = (e) => {
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '是否实时',
        State: e
    });
    if (e) {
        const now = new Date();
        const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        timevalue.value = totalSeconds;
        callUIInteraction({
            ModuleName:'虚拟仿真',
            FunctionName: '虚拟仿真时间模拟',
            Time: timevalue.value
        });
        intervalId = setInterval(() => {
            timevalue.value++;
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '虚拟仿真时间模拟',
                Time: timevalue.value
            });
        }, 1000);
    } else {
        clearInterval(intervalId);
    }
}

// 根据图片路径判断对应天气内容
const weatherIcons = {
    [sunnyday]: '晴天',
    [sunnycloudyday]: '多云',
    [cloudyday]: '阴天',
    [lightrainday]: '小雨',
    [heavyrainday]: '中雨',
    [rainstormday]: '暴雨',
    [Lightfogday]: '小雾',
    [Mediumfogday]: '中雾',
    [Fogday]: '大雾',
    [lightsnow]: '小雪',
    [moderatesnow]: '中雪',
    [heavysnow]: '大雪'
};

const weatherone = ref(sunnyday);
const weathertwo = ref(sunnycloudyday);
const weatherthree = ref(cloudyday);
const selectedIcon = ref(sessionStorage.getItem('selectedIcon') || 'sunny');
const selectedIconDetail = ref(sessionStorage.getItem('selectedIconDetail') || 'sunnyDetail');
// 选择第一层天气图标
const selectIcon = (icon) => {
    selectedIcon.value = icon;
    sessionStorage.setItem('selectedIcon', icon);
    updateWeatherDetails(icon);
};
// 选择第二层天气图标
const selectDetailIcon = (icon) => {
    selectedIconDetail.value = icon;
    sessionStorage.setItem('selectedIconDetail', icon);
    let selectedWeatherIcon = '';
    switch (icon) {
        case 'sunnyDetail':
            selectedWeatherIcon = weatherIcons[weatherone.value];
            break;
        case 'heavyrainDetail':
            selectedWeatherIcon = weatherIcons[weathertwo.value];
            break;
        case 'fogDetail':
            selectedWeatherIcon = weatherIcons[weatherthree.value];
            break;
        case 'snowDetail':
            selectedWeatherIcon = weatherIcons[weatherone.value];
            break;
        default:
            break;
    }
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '选中的天气详情图标',
        Weather: selectedWeatherIcon
    });
};

const updateWeatherDetails = (icon) => {
    switch (icon) {
        case 'sunny':
            weatherone.value = sunnyday;
            weathertwo.value = sunnycloudyday;
            weatherthree.value = cloudyday;
            selectedIconDetail.value = 'sunnyDetail';
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: '晴天'
            });
            break;
        case 'heavyrain':
            weatherone.value = lightrainday;
            weathertwo.value = heavyrainday;
            weatherthree.value = rainstormday;
            selectedIconDetail.value = 'heavyrainDetail';
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: '中雨'
            });
            break;
        case 'fog':
            weatherone.value = Lightfogday;
            weathertwo.value = Mediumfogday;
            weatherthree.value = Fogday;
            selectedIconDetail.value = 'fogDetail';
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: '大雾'
            });
            break;
        case 'snow':
            weatherone.value = lightsnow;
            weathertwo.value = moderatesnow;
            weatherthree.value = heavysnow;
            selectedIconDetail.value = 'sunnyDetail';
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: '小雪'
            });
            break;
        default:
            break;
    }
    sessionStorage.setItem('weatherone', weatherone.value);
    sessionStorage.setItem('weathertwo', weathertwo.value);
    sessionStorage.setItem('weatherthree', weatherthree.value);
};
// 时间模拟时间轴增加
const addtime = () => {
    timevalue.value += 3600;
    sessionStorage.setItem('timevalue', timevalue.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真时间模拟',
        Time: timevalue.value
    });
};
// 时间模拟时间轴减少
const decreasetime = () => {
    timevalue.value -= 3600;
    sessionStorage.setItem('timevalue', timevalue.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真时间模拟',
        Time: timevalue.value
    });
};
// 风强度增加
const addintensity = () => {
    Windintensity.value++;
    sessionStorage.setItem('Windintensity', Windintensity.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风强度',
        FQD: Windintensity.value
    });
};
// 风强度减少
const decreaseintensity = () => {
    Windintensity.value--;
    sessionStorage.setItem('Windintensity', Windintensity.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风强度',
        FQD: Windintensity.value
    });
};
// 风向增加
const adddirection = () => {
    Winddirection.value++;
    sessionStorage.setItem('Winddirection', Winddirection.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风向',
        FX: Winddirection.value
    });
};
// 风向增加
const decreasedirection = () => {
    Winddirection.value--;
    sessionStorage.setItem('Winddirection', Winddirection.value);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风向',
        FX: Winddirection.value
    });
};
// 监听最后拖动的风强度
const getWindintensity = (e) => {
    sessionStorage.setItem('Windintensity', e);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风强度',
        FQD: e
    });
};
// 监听最后拖动的风向
const getWinddirection = (e) => {
    sessionStorage.setItem('Winddirection', e);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真风向',
        FQD: e
    });
};
// 监听最后拖动的时间模拟
const gettimevalue = (e) => {
    sessionStorage.setItem('timevalue', e);
    callUIInteraction({
        ModuleName:'虚拟仿真',
        FunctionName: '虚拟仿真时间模拟',
        Time: e
    });
};

onMounted(() => {
    if (sessionStorage.getItem('weatherone')) {
        weatherone.value = sessionStorage.getItem('weatherone');
    }
    if (sessionStorage.getItem('weathertwo')) {
        weathertwo.value = sessionStorage.getItem('weathertwo');
    }
    if (sessionStorage.getItem('weatherthree')) {
        weatherthree.value = sessionStorage.getItem('weatherthree');
    }
    if (!sessionStorage.getItem('selectedIconDetail')) {
        const iconPath = selectedIconDetail.value === 'sunnyDetail' ? weatherone.value
            : selectedIconDetail.value === 'heavyrainDetail' ? weathertwo.value
                : selectedIconDetail.value === 'fogDetail' ? weatherthree.value
                    : selectedIconDetail.value === 'snowDetail' ? weatherone.value
                        : '';

        if (iconPath && weatherIcons[iconPath]) {
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: weatherIcons[iconPath]
            });
        }
    } else {
        const iconPath = selectedIconDetail.value === 'sunnyDetail' ? weatherone.value
            : selectedIconDetail.value === 'heavyrainDetail' ? weathertwo.value
                : selectedIconDetail.value === 'fogDetail' ? weatherthree.value
                    : selectedIconDetail.value === 'snowDetail' ? weatherone.value
                        : '';
        if (iconPath && weatherIcons[iconPath]) {
            callUIInteraction({
                ModuleName:'虚拟仿真',
                FunctionName: '选中的天气详情图标',
                Weather: weatherIcons[iconPath]
            });
        }
    }
});
</script>

<style scoped>
.leftbox {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 20px;
    top: 18%;
}

.leftbox-top {
    width: 460px;
    height: 650px;
    background-image: url('../../assets/img/框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    padding: 20px;
    box-sizing: border-box;
}

.leftbox-top-title {
    width: 418px;
    height: 33px;
    background-image: url('../../assets/img/标题背景.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.leftbox-top-title span {
    font-family: PangMenZhengDao;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 5px;
    background: linear-gradient(0deg, #12D8FF 0%, #96EFFD 50%, #F9FCFF 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.leftbox-top-content {
    /* width: 100%; */
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E6E6E6;
    font-size: 14px;
    margin-top: 25px;
}

.leftbox-middle {
    width: 460px;
    height: 228px;
    background-image: url('../../assets/img/框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    margin-top: 20px;
    padding: 20px;
    box-sizing: border-box;
}

.leftbox-middle-content {
    /* width: 100%; */
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E6E6E6;
    font-size: 14px;
    margin-top: 55px;
}

.leftbox-middle-bottom {
    /* width: 100%; */
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 5px;
}

.leftbox-middle-bottom-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.Weather-list-top {
    display: flex;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;
}

.Weather-list-top-left span:first-child {
    color: #B7CFFC;
    font-size: 20px;
}

.Weather-list-top-left span:last-child {
    color: #B7CFFC;
    font-size: 14px;
    margin-left: 10px;
}

.Weather-list-top-right {
    margin-left: 95px;
    display: flex;
    align-items: center;
}

.Weather-list-top-right span {
    font-family: SourceHanSansCN, SourceHanSansCN;
    font-weight: 500;
    font-size: 16px;
    color: #B7CFFC;
}

.Weather-list-top-right :deep(.el-switch__core) {
    border-radius: 0;
    border: 1px solid #42AEFF;
    background-color: transparent;
}

.Weather-list-top-right :deep(.el-switch__core .el-switch__action) {
    border-radius: 0;
    background-color: #42AEFF;
}

.Weather-list-top-right :deep(.el-switch.is-checked .el-switch__core .el-switch__inner) {
    background-color: #08415c;
}

.Weather-list-top-right :deep(.el-switch__core .el-switch__inner) {
    border: 1px solid #08415c;
    background-color: #08415c;
}

.Weather-list-top-right :deep(.el-switch.is-checked .el-switch__core) {
    background-color: #08415c;
}

.Weather-list-top-right :deep(.el-switch__core .el-switch__inner .is-text) {
    color: #AFDFFD;
}

.Weather-type-icon,
.Weather-type-icon-detailed {
    padding-left: 40px;
    padding-right: 40px;
    margin-top: 25px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.Weather-type-icon img,
.Weather-type-icon-detailed img {
    cursor: pointer;
}

.selected {
    filter: invert(0.4) sepia(1) saturate(20) hue-rotate(180deg) brightness(1.01);
}

.imgbutton {
    margin-left: 20px;
    cursor: pointer;
}

:deep(.el-slider__runway) {
    height: 2px;
    background-color: #00A8D2;
}

:deep(.el-slider__bar) {
    height: 2px;
    background-color: #00A8D2;
}

:deep(.el-slider__button) {
    background-color: transparent;
    width: 18px;
    height: 18px;
    background: #4AB4FE;
    /* border: 4px solid rgba(74, 180, 254, 0.5); */
    margin-bottom: 4px;
}

.disabled {
    pointer-events: none;
    /* 禁用鼠标事件 */
    opacity: 0.6;
    /* 使元素半透明 */
}

:deep(.el-slider__runway.is-disabled .el-slider__bar) {
    height: 2px;
    background-color: #00A8D2;
}

:deep(.el-slider__stop) {
    background-color: #fff;
    width: 2px;
    height: 4px;
    top: -1px;
}

:deep(.el-slider__marks-text) {
    color: white;
    margin-top: -50px;
    font-size: 16px;
}
</style>
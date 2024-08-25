<template>
    <div class="leftbox">
        <div class="leftbox-top-bottom">
            <div class="leftbox-top-title">
                <span>重现期情景库</span>
            </div>
            <div class="radio-group">
                <div class="radio-item" :class="{ 'active': selectedScenario === 'waves' }"
                    @click="selectScenario('waves')">
                    <span>海浪情景</span>
                </div>
                <div class="radio-item" :class="{ 'active': selectedScenario === 'submerge' }"
                    @click="selectScenario('submerge')">
                    <span>淹没情景</span>
                </div>
                <div class="switchbox" v-if="showdimension">
                    <el-switch v-model="dimensionvalue" class="ml-2" inline-prompt active-text="二维" inactive-text="三维"
                        @change="getdimension" />
                </div>
            </div>
            <div class="twoBox">
                <div class="checkbox-item" v-for="(item, index) in checkboxItems" :key="index"
                    @click="selectCheckbox(index)">
                    <span>{{ item.label }}</span>
                    <img :src="item.active ? activeImg : topimg" alt="">
                </div>
            </div>
        </div>
    </div>
    <div class="colorbarBox" v-if="showWaves">
        <div class="colornumber">
            <span>{{ MaxValue }}m</span>
            <span>{{ MinValue }}m</span>
        </div>
        <div class="colorbar"></div>
    </div>
    <div class="colorbarBox" v-if="showSubmerge">
        <div class="colornumber">
            <span>{{ MaxValue }}m</span>
            <span>{{ MinValue }}m</span>
        </div>
        <div class="colorbar1"></div>
    </div>
    <div v-if="showBottom" class="leftbox-bottom">
        <div class="leftbox-top-title-bottom">
            <span>{{ titlevalue }}</span>
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
                <tr v-if="showWaveheight">
                    <td>潮位</td>
                    <td>{{ Waveheight }}m</td>
                </tr>
                <tr v-for="(item, index) in Data" :key="index">
                    <td>{{ item.Name }}</td>
                    <td>{{ item.Value }}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { callUIInteraction, addResponseEventListener } from "../../module/webrtcVideo/webrtcVideo.js";
import topimg from '../../assets/img/newimg/资源 7.png';
import activeImg from '../../assets/img/newimg/资源 6.png';

const dimensionvalue = ref(true); // true 表示二维，false 表示三维
const showdimension = ref(true);
const showWaves = ref(true);
const showBottom = ref(false);
const showSubmerge = ref(false);
const MaxValue = ref(0);
const MinValue = ref(0);
const selectedScenario = ref('waves');
const titlevalue = ref('海浪情景');
const Datatime = ref();
const Lon = ref();
const Lat = ref();
const Data = ref([]);
const showWaveheight = ref(false)
const Waveheight = ref('')

const checkboxItems = ref([
    { label: '10年一遇', active: true }, // 默认选择10年一遇
    { label: '20年一遇', active: false },
    { label: '50年一遇', active: false },
    { label: '100年一遇', active: false },
    { label: '200年一遇', active: false },
    { label: '1000年一遇', active: false }
]);

const selectedValue = ref('10'); // 默认选择的值

const selectScenario = (scenario) => {
    selectedScenario.value = scenario;
    showdimension.value = (scenario === 'waves');

    // 根据选择的情景显示或隐藏 colorbar
    if (scenario === 'waves') {
        const dimension = dimensionvalue.value ? '二维' : '三维';
        showWaves.value = true;
        showSubmerge.value = false;
        titlevalue.value = '海浪情景';
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `重现期情景库`,
            ChildrenModule: `${selectedScenario.value === 'waves' ? '海浪情景' : '淹没情景'}`,
            State: `10`,
            Dimension: dimension
        });
    } else if (scenario === 'submerge') {
        showWaves.value = false;
        showSubmerge.value = true;
        titlevalue.value = '淹没情景';
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `重现期情景库`,
            ChildrenModule: `${selectedScenario.value === 'waves' ? '海浪情景' : '淹没情景'}`,
            State: `10`,
        });
    }
    resetCheckboxes();
};
const resetCheckboxes = () => {
    checkboxItems.value.forEach((item, index) => {
        item.active = (index === 0); // 选择 "10年一遇"
    });
    selectedValue.value = checkboxItems.value[0].label.replace('年一遇', ''); // 更新默认选择的值
};

const selectCheckbox = (index) => {
    showBottom.value = false; // 隐藏底部内容
    // 将所有复选框的 active 状态设置为 false
    checkboxItems.value.forEach((item, i) => {
        item.active = (i === index); // 只有被点击的项设置为 true
    });
    // 更新选择的值
    selectedValue.value = checkboxItems.value[index].label.replace('年一遇', '');
    const dimension = dimensionvalue.value ? '二维' : '三维';

    // 调用接口，根据情景决定是否传递 Dimension
    if (selectedScenario.value === 'waves') {
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `重现期情景库`,
            ChildrenModule: '海浪情景',
            State: `${selectedValue.value}`,
            Dimension: `${dimension}`
        });
    } else {
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `重现期情景库`,
            ChildrenModule: '淹没情景',
            State: `${selectedValue.value}`
        });
    }

};

const getdimension = (e) => {
    if (e === true) {
        showWaves.value = true;
    } else if (e === false) {
        showWaves.value = false;
        showBottom.value = false;
    }
    const dimension = dimensionvalue.value ? '二维' : '三维';
    callUIInteraction({
        ModuleName: '风险评估',
        FunctionName: `重现期情景库`,
        ChildrenModule: `${selectedScenario.value === 'waves' ? '海浪情景' : '淹没情景'}`,
        State: `${selectedValue.value}`,
        Dimension: dimension
    });
};

const myHandleResponseFunction = (data) => {
    const datajson = JSON.parse(data);
    console.log(data);
    if (datajson.Function === '报错') {
        ElMessage({
            message: datajson.Type,
            type: 'warning',
        });
        return
    } else if (datajson.Function === '假设分析海浪情景色带范围' || datajson.Function === '假设分析淹没情景色带范围') {
        MaxValue.value = datajson.MaxValue;
        MinValue.value = datajson.MinValue;
    } else if (datajson.Function === '假设分析海浪情景点击查询' || datajson.Function === '假设分析淹没情景点击查询') {
        if (datajson.Function === '假设分析淹没情景点击查询') {
            showWaveheight.value = true;
            Waveheight.value = datajson.Zeta.toFixed(2);
        } else {
            showWaveheight.value = false;
        }
        Datatime.value = datajson.DataTime;
        Lon.value = datajson.Lon;
        Lat.value = datajson.Lat;
        Data.value = datajson.Data;
        showBottom.value = true;
    }
}

onMounted(() => {
    const initialDimension = dimensionvalue.value ? '二维' : '三维';
    callUIInteraction({
        ModuleName: '风险评估',
        FunctionName: `重现期情景库`,
        ChildrenModule: `${selectedScenario.value === 'waves' ? '海浪情景' : '淹没情景'}`,
        State: `${selectedValue.value}`,
        Dimension: `${initialDimension}`
    });
    addResponseEventListener("handle_responses", myHandleResponseFunction);
});
</script>

<style scoped>
.leftbox {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 20px;
    top: 8%;
    padding: 0 20px 20px 20px;
    box-sizing: border-box;
    background-image: url('../../assets/img/反框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 400px;
}

.leftbox-top-bottom {
    width: 100%;
    position: relative;
}

.leftbox-top-title {
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
    width: 400px;
    top: 280px;
    right: 15px;
}


.colorbarBox {
    position: absolute;
    bottom: 35px;
    right: 20px;
    background-image: url("../../assets/img/框-bg.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 7vh;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.colorbarBox span {
    width: 25px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    bottom: 0px;
}

.colornumber {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0 20px 0;
}

.colorbar {
    width: 10px;
    height: 200px;
    border-radius: 9px;
    background-image: url('../../assets/img/bar1.jpg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
}

.colorbar1 {
    width: 10px;
    height: 200px;
    border-radius: 9px;
    background-image: url('../../assets/img/bar2.jpg');
    background-size: 100% 100%;
    background-repeat: no-repeat;
}

:deep(.el-switch__core) {
    border-radius: 0;
    border: 1px solid #42AEFF;
    background-color: transparent;
}

:deep(.el-switch__core .el-switch__action) {
    border-radius: 0;
    background-color: #42AEFF;
}

:deep(.el-switch.is-checked .el-switch__core .el-switch__inner) {
    background-color: #08415c;
}

:deep(.el-switch__core .el-switch__inner) {
    border: 1px solid #08415c;
    background-color: #08415c;
}

:deep(.el-switch.is-checked .el-switch__core) {
    background-color: #08415c;
}

:deep(.el-switch__core .el-switch__inner .is-text) {
    color: #AFDFFD;
}

:deep(.el-radio.el-radio--large .el-radio__label) {
    color: white;
}

.switchbox {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 5vh;
}

.radio-group {
    margin-top: 2vh;
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
}

.radio-item {
    width: 12vh;
    height: 3vh;
    background-image: url('../../assets/img/newimg/资源 2.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #B7CFFC;
    cursor: pointer;
}

.radio-item.active {
    width: 12vh;
    height: 3vh;
    background-image: url('../../assets/img/newimg/资源 3.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #B7CFFC;
    cursor: pointer;
}

.twoBox {
    height: 35vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
}

.checkbox-item {
    width: 20vh;
    height: 4vh;
    background-image: url('../../assets/img/newimg/资源 5.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    color: #B7CFFC;
    cursor: pointer;
}

.checkbox-item span {
    width: 9.5vh;
    margin-left: 3vh;
}
.custom-table {
    border-collapse: collapse;
    width: 100%;
    color: #b7cffc;
    margin-top: 10px;
    margin-bottom: 20px;
}

.custom-table th,
.custom-table td {
    border: 1px solid #416491;
    padding: 8px;
    text-align: center;
    height: 38px;
    width: 50%;
}
#WaveheightEcharts {
    padding: 0 20px 0 20px;
    width: 400px;
    /* height: 240px; */
    margin-top: 5px;
}
.leftbox-bottom {
    position: absolute;
    background-image: url('../../assets/img/框.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 400px;
    /* height: 300px; */
    top: 280px;
    right: 15px;
}

.leftbox-top-title-bottom {
    width: 400px;
    height: 45px;
    background-image: url('../../assets/img/标题背景.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    line-height: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.leftbox-top-title-bottom span {
    /* margin-left: 40px; */
    font-weight: 600;
    color: #B7CFFC;
    font-size: 20px;
    letter-spacing: 5px;
}
</style>
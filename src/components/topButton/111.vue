<template>
    <div class="leftbox">
        <div class="leftbox-top-bottom">
            <div class="leftbox-top-title">
                <span>重现期情景库</span>
            </div>
            <div class="radio-group">
                <el-radio-group v-model="checkList" @change="getcheck">
                    <el-radio label="海浪情景" value="海浪情景" />
                    <el-radio label="淹没情景" value="淹没情景" />
                </el-radio-group>
                <div class="switchbox" v-if="showdimension">
                    <el-switch v-model="dimensionvalue" class="ml-2" inline-prompt active-text="二维" inactive-text="三维"
                        @change="getdimension" />
                </div>
            </div>
            <div class="twoBox">
                <el-radio-group v-model="checkListtwo" class="checkboxtwo" @change="handleCheckChange('checkListtwo')"
                    :disabled="isCheckListEmpty">
                    <div class="radio-column">
                        <el-radio label="10年一遇" value='10' />
                        <el-radio label="20年一遇" value='20' />
                        <el-radio label="50年一遇" value='50' />
                        <el-radio label="100年一遇" value="100" />
                        <el-radio label="200年一遇" value="200" />
                        <el-radio label="1000年一遇" value="1000" />
                    </div>
                </el-radio-group>
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
import { ref, onMounted, watch, computed } from 'vue';
import { callUIInteraction } from "../../module/webrtcVideo/webrtcVideo.js";

const checkList = ref('');
const isCheckListEmpty = computed(() => checkList.value === '');
const showdimension = ref(true);
const showSubmerge = ref(false);
const showBottom = ref(false);
const titlevalue = ref('');
const MaxValue = ref(0);
const MinValue = ref(0);

const dimensionvalue = ref(true);
const showWaves = ref(false);
const checkListtwo = ref('');
const descriptions = {
    checkListtwo: '重现期情景库',
};

let isdimension = '';
if (dimensionvalue.value === true) {
    isdimension = '二维';
} else if (dimensionvalue.value === false) {
    isdimension = '三维';
}

watch(checkList, (newValue) => {
    if (newValue === '') {
        checkListtwo.value = '';
    } else {
        checkListtwo.value = '10';
    }

    if (newValue === '海浪情景') {
        showdimension.value = true;
    } else {
        showdimension.value = false;
    }
});

watch(checkListtwo, (newValue) => {
    if (newValue === '') {
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `${descriptions['checkListtwo']}`,
            State: false
        });
    }
});

const getcheck = (checked) => {
    showBottom.value = false;
    titlevalue.value = checkList.value;
    if (checkList.value === '海浪情景') {
        if (isdimension === '二维') {
            showWaves.value = true;
        } else if (isdimension === '三维') {
            showWaves.value = false;
        }
        showSubmerge.value = false;
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value,
            State: checkListtwo.value,
            Dimension: isdimension
        });
    } else if (checkList.value === '淹没情景') {
        showWaves.value = false;
        showSubmerge.value = true;
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value,
            State: checkListtwo.value
        });
    } else {
        showWaves.value = false;
        showSubmerge.value = false;
    }
};

const getdimension = (e) => {
    if (e === true) {
        showWaves.value = true;
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value,
            State: checkListtwo.value,
            Dimension: '二维'
        });
    } else if (e === false) {
        showWaves.value = false;
        showBottom.value = false;
        callUIInteraction({
            ModuleName: '风险评估',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value,
            State: checkListtwo.value,
            Dimension: '三维'
        });
    }
};

watch(dimensionvalue, (newValue) => {
    isdimension = newValue ? '二维' : '三维';
});

const handleCheckChange = (listName) => {
    showBottom.value = false;
    if (listName === 'checkListtwo') {
        // 直接使用单选的值
        let scene = '';
        if (checkList.value === '海浪情景') {
            scene = '海浪情景';
        } else if (checkList.value === '淹没情景') {
            scene = '淹没情景';
        }
        if (scene === '海浪情景') {
            callUIInteraction({
                ModuleName: '风险评估',
                FunctionName: `${descriptions['checkListtwo']}`,
                ChildrenModule: scene,
                State: checkListtwo.value,
                Dimension: isdimension
            });
        } else if (scene === '淹没情景') {
            callUIInteraction({
                ModuleName: '风险评估',
                FunctionName: `${descriptions['checkListtwo']}`,
                ChildrenModule: scene,
                State: checkListtwo.value
            });
        }
    }
};

onMounted(() => {

});
</script>


<style scoped>
.leftbox {
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 20px;
    top: 18%;
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
    right: 0px;
    top: 68px;
}

.radio-group {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
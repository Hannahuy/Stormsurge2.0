<template>
    <div class="left-menu">
        <div class="leftbox-top-top">
            <div class="leftbox-top-title">
                <span>减灾措施情景库</span>
            </div>
            <div class="oneBox">
                <el-checkbox-group v-model="checkListone" class="checkboxone"
                    @change="handleCheckChange('checkListone')" :disabled="isCheckListmeasure">
                    <el-checkbox label="无减灾设施" value="无减灾设施" />
                    <el-checkbox label="加防潮堤" value="加防潮堤" />
                    <el-checkbox label="加防汛沙袋" value="加防汛沙袋" />
                </el-checkbox-group>
            </div>
        </div>
        <div class="leftbox-top-content">
            <div class="leftbox-top-title">
                <span>水位情景库</span>
            </div>
            <div class="waterBox">
                <span>水位高度：&nbsp;</span>
                <el-input-number v-model="inputvalue" size="large" style="width: 150px" :min="0" :max="8" :step="0.1"
                    :precision="1" @change="getinput" />
                <span>&nbsp;&nbsp;米</span>
            </div>
        </div>
        <div class="leftbox-top-bottom">
            <div class="leftbox-top-title">
                <span>重现期情景库</span>
            </div>
            <div class="checkbox">
                <el-checkbox-group v-model="checkList" @change="getcheck" :disabled="isCheckListscene">
                    <el-checkbox label="海浪情景" value="海浪情景" />
                    <el-checkbox label="淹没情景" value="淹没情景" />
                </el-checkbox-group>
                <div class="switchbox" v-if="showdimension">
                    <el-switch v-model="dimensionvalue" class="ml-2" inline-prompt active-text="二维" inactive-text="三维"
                        @change="getdimension" />
                </div>
            </div>
            <div class="twoBox">
                <el-checkbox-group v-model="checkListtwo" class="checkboxtwo"
                    @change="handleCheckChange('checkListtwo')" :disabled="isCheckListEmpty">
                    <div class="checkbox-column">
                        <el-checkbox label="10年一遇" value='10' />
                        <el-checkbox label="20年一遇" value='20' />
                        <el-checkbox label="50年一遇" value='50' />
                    </div>
                    <div class="checkbox-column">
                        <el-checkbox label="100年一遇" value="100" />
                        <el-checkbox label="200年一遇" value="200" />
                        <el-checkbox label="1000年一遇" value="1000" />
                    </div>
                </el-checkbox-group>
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
                    <td>水位</td>
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
import { ref, watch, onMounted, computed } from 'vue';
import { callUIInteraction, addResponseEventListener } from "../../module/webrtcVideo/webrtcVideo.js";
import { ElMessage } from 'element-plus';

const MaxValue = ref(0);
const MinValue = ref(0);
const showWaves = ref(false);
const showSubmerge = ref(false);
const showBottom = ref(false);
const showWaveheight = ref(false)
const Waveheight = ref('')
const Datatime = ref();
const titlevalue = ref('')
const Lon = ref();
const Lat = ref();
const Data = ref([]);
const checkListone = ref([]);
const checkListtwo = ref([]);
const inputvalue = ref(0.0);
const checkList = ref([]);
const dimensionvalue = ref(true);
const showdimension = ref(false);
const isCheckListEmpty = computed(() => checkList.value.length === 0);
const isCheckListscene = computed(() => checkListone.value.length != 0);
const isCheckListmeasure = computed(() => checkList.value.length != 0);
watch(checkList, (newValue) => {
    if (newValue.length === 0) {
        checkListtwo.value = [];
    } else {
        checkListtwo.value = ['10'];
    }

    if (newValue[0] === '海浪情景') {
        showdimension.value = true;
    } else {
        showdimension.value = false;
    }
});

let lastSelected = ref('0m');

const descriptions = {
    checkListone: '减灾措施情景库',
    checkListtwo: '重现期情景库',
};

let isdimension = '';
if (dimensionvalue.value === true) {
    isdimension = '二维';
} else if (dimensionvalue.value === false) {
    isdimension = '三维';
}
const getcheck = (checked) => {
    showBottom.value = false;
    titlevalue.value = checkList.value[0]
    if (checked.length > 1) {
        checkList.value = [checked[checked.length - 1]];
    } else {
        checkList.value = checked;
    }
    if (checkList.value[0] === '海浪情景') {
        if (isdimension == '二维') {
            showWaves.value = true;
        } else if (isdimension == '三维') {
            showWaves.value = false;
        }
        showSubmerge.value = false;
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value[0],
            State: checkListtwo.value[0],
            Dimension: isdimension
        });
    } else if (checkList.value[0] === '淹没情景') {
        showWaves.value = false;
        showSubmerge.value = true;
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value[0],
            State: checkListtwo.value[0]
        });
    } else {
        showWaves.value = false;
        showSubmerge.value = false;
    }
};

const getinput = () => {
    if (inputvalue.value == null) {
        ElMessage({
            message: '请输入正确的水位高度，最多一位小数',
            type: 'warning',
        });
        return;
    }
    callUIInteraction({
        ModuleName: '假设分析',
        FunctionName: `水位情景库`,
        State: inputvalue.value
    });
};

watch(checkListone, (newValue, oldValue) => {
    const added = newValue.filter(item => !oldValue.includes(item));
    const removed = oldValue.filter(item => !newValue.includes(item));

    if (removed.length) {
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListone']}${removed}`,
            State: false
        });
    }

    if (added.length) {
        setTimeout(() => {
            callUIInteraction({
                ModuleName: '假设分析',
                FunctionName: `水位情景库`,
                State: inputvalue.value
            });
            callUIInteraction({
                ModuleName: '假设分析',
                FunctionName: `${descriptions['checkListone']}${added[added.length - 1]}`,
                State: true
            });
        }, 0);
    }
});

const getdimension = (e) => {
    if (e == true) {
        showWaves.value = true;
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value[0],
            State: checkListtwo.value[0],
            Dimension: '二维'
        });
    } else if (e == false) {
        showWaves.value = false;
        showBottom.value = false;
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListtwo']}`,
            ChildrenModule: checkList.value[0],
            State: checkListtwo.value[0],
            Dimension: '三维'
        });
    }
}
watch(dimensionvalue, (newValue) => {
    isdimension = newValue ? '二维' : '三维';
});
watch(checkListtwo, (newValue, oldValue) => {
    if (newValue == '') {
        callUIInteraction({
            ModuleName: '假设分析',
            FunctionName: `${descriptions['checkListtwo']}`,
            State: false
        });
    }
});

const handleCheckChange = (listName) => {
    showBottom.value = false;
    const list = listName === 'checkListone' ? checkListone : checkListtwo;
    // 如果是 checkListtwo，确保只能选择一个
    if (listName === 'checkListtwo') {
        if (list.value.length > 1) {
            list.value = [list.value[list.value.length - 1]]; // 保留最后一个选项
        }
        // 如果当前选项被取消，恢复到上一个选项
        if (list.value.length === 0) {
            list.value = [lastSelected.value]; // 恢复到上一个选项
        } else {
            lastSelected.value = list.value[0]; // 更新上一个选项
        }
        let scene = '';
        if (checkList.value[0] === '海浪情景') {
            scene = '海浪情景';
        } else if (checkList.value[0] === '淹没情景') {
            scene = '淹没情景';
        }
        if (scene === '海浪情景') {
            callUIInteraction({
                ModuleName: '假设分析',
                FunctionName: `${descriptions['checkListtwo']}`,
                ChildrenModule: scene,
                State: lastSelected.value,
                Dimension: isdimension
            });
        } else if (scene === '淹没情景') {
            callUIInteraction({
                ModuleName: '假设分析',
                FunctionName: `${descriptions['checkListtwo']}`,
                ChildrenModule: scene,
                State: lastSelected.value
            });
        }

    } else {
        // 如果选中多个，保留最后一个
        if (list.value.length > 1) {
            list.value = [list.value[list.value.length - 1]];
        }
    }
};

const myHandleResponseFunction = (data) => {
    const datajson = JSON.parse(data);
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
    callUIInteraction({
        ModuleName: '假设分析',
        FunctionName: `水位情景库`,
        State: inputvalue.value
    });
    callUIInteraction({
        ModuleName: '假设分析',
        FunctionName: `减灾措施情景库无减灾设施`,
        State: false
    });
    addResponseEventListener("handle_responses", myHandleResponseFunction);
});
</script>

<style scoped>
.left-menu {
    position: absolute;
    top: 12%;
    left: 20px;
    width: 440px;
    height: 655px;
    padding: 20px;
    box-sizing: border-box;
    background-image: url('../../assets/img/框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.leftbox-top-top {
    width: 100%;
    height: 200px;
}

.leftbox-top-content {
    width: 100%;
    height: 120px;
}

.leftbox-top-title {
    margin-top: 10px;
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

.oneBox {
    width: 300px;
    height: 250px;
}

.checkboxone {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 140px;
}

.oneBox:deep(.el-checkbox) {
    height: 45px;
}

.oneBox:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;
}

.oneBox:deep(.el-checkbox__label) {
    color: #D4E1FF;
    font-size: 18px;
}

.oneBox:deep(.el-checkbox__inner:after) {
    height: 11px;
    left: 5px;
    top: 0px;
    width: 6px;
}

.twoBox {
    height: 180px;
}

.checkboxtwo {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}

.checkbox-column {
    display: flex;
    flex-direction: column;
    margin: 0 10px;
}

.twoBox:deep(.el-checkbox) {
    height: 45px;
}

.twoBox:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;
}

.twoBox:deep(.el-checkbox__label) {
    color: #D4E1FF;
    font-size: 16px;
}

.twoBox:deep(.el-checkbox__inner:after) {
    height: 11px;
    left: 5px;
    top: 0px;
    width: 6px;
}

.buttonitem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
}

.buttons {
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 0;
    width: 80%;
    height: 40px;
    background-color: rgba(25, 104, 153, 0.5);
    border: 0;
    font-size: 18px;
}

.fourBox {
    position: absolute;
    top: 550px;
    left: 250px;
    width: 200px;
    height: 180px;
    background-image: url('../../assets/img/dialog4_back.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
}

.checkboxfour {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 50px;
}

.fourBox-title {
    width: 100%;
    display: flex;
    justify-content: center;
    height: 70px;
    line-height: 80px;
    font-size: 24px;
    color: #D4E1FF;
}

.fourBox:deep(.el-checkbox) {
    height: 45px;
}

.fourBox:deep(.el-checkbox__inner) {
    width: 18px;
    height: 18px;
}

.fourBox:deep(.el-checkbox__label) {
    color: #D4E1FF;
    font-size: 18px;
}

.fourBox:deep(.el-checkbox__inner:after) {
    height: 11px;
    left: 5px;
    top: 0px;
    width: 6px;
}

.leftbox-top-bottom {
    width: 100%;
    position: relative;
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
    top: 60px;
}

.checkbox {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.waterBox {
    width: 100%;
    height: 75px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
}

:deep(.input) {
    background-color: white;
    border: none;
}

:deep(.el-input-number .el-input__inner) {
    background-color: white;
    border: none;
    color: black;
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

#WaveheightEcharts {
    padding: 0 20px 0 20px;
    width: 400px;
    /* height: 240px; */
    margin-top: 5px;
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
</style>
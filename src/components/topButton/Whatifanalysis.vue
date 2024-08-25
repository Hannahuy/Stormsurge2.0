<template>
    <div class="left-menu">
        <div class="leftbox-top-top">
            <div class="leftbox-top-title" style="margin-top: 0;">
                <span>减灾措施情景库</span>
            </div>
            <div class="oneBox">
                <el-checkbox-group v-model="checkListone" class="checkboxone"
                    @change="handleCheckChange('checkListone')">
                    <el-checkbox label="加防潮堤" value="加防潮堤" />
                    <el-checkbox label="加防汛沙袋" value="加防汛沙袋" />
                </el-checkbox-group>
            </div>
        </div>
        <div class="leftbox-top-content">
            <div class="leftbox-top-title">
                <span>潮位情景库</span>
            </div>
            <div class="waterBox">
                <span>潮位高度：&nbsp;</span>
                <el-input-number v-model="inputvalue" size="large" style="width: 150px" :min="0" :max="8" :step="0.1"
                    :precision="1" @change="getinput" />
                <span>&nbsp;&nbsp;米</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { callUIInteraction, addResponseEventListener } from "../../module/webrtcVideo/webrtcVideo.js";
import { ElMessage } from 'element-plus';

const checkListone = ref([]);
const inputvalue = ref(0.0);
const descriptions = {
    checkListone: '减灾措施情景库',
};

const getinput = () => {
    if (inputvalue.value == null) {
        ElMessage({
            message: '请输入正确的潮位高度，最多一位小数',
            type: 'warning',
        });
        return;
    }
    callUIInteraction({
        ModuleName: '假设分析',
        FunctionName: `潮位情景库`,
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
                FunctionName: `潮位情景库`,
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



const handleCheckChange = (listName) => {
    const list = listName === 'checkListone' ? checkListone : checkListtwo;
    // 如果选中多个，保留最后一个
    if (list.value.length > 1) {
        list.value = [list.value[list.value.length - 1]];
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
    }
}

onMounted(() => {
    callUIInteraction({
        ModuleName: '假设分析',
        FunctionName: `潮位情景库`,
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
    height: 285px;
    padding: 0 20px 20px 20px;
    box-sizing: border-box;
    background-image: url('../../assets/img/反框.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.leftbox-top-top {
    width: 100%;
    height: 145px;
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
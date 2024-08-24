<template>
    <div id="UEplayer"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { app_load, callUIInteraction } from '../../module/webrtcVideo/webrtcVideo.js';
import '../../module/webrtcVideo/player.css';

const width = ref()
const height = ref()

const logScreenSize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
    callUIInteraction({
        ModuleName: '其他',
        FunctionName: "分辨率",
        Width:width.value,
        Height:height.value
    });
};

onMounted(() => {
    logScreenSize(); // 初始打印屏幕大小
    window.addEventListener('resize', logScreenSize); // 监听屏幕大小变化

    app_load(
        {
            serverUrl: 'http://192.168.0.124:89/', // 像素流链接
            matchViewportResolution: true,
            autoConnection: true,
            showPlayOverlay: true,
            qualityControl: true,
            inputOptions: {
                controlScheme: 1,
                suppressBrowserKeys: false
            }
        },
        () => {
            console.log("成功");
            callUIInteraction({
                ModuleName: '其他',
                FunctionName: "刷新",
            });
        },
        () => {
            console.log("失败");
        }
    );
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', logScreenSize); // 清理事件监听器
});
</script>

<style>
#UEplayer {
    position: absolute;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    bottom: 0;
    overflow: hidden;
}
</style>

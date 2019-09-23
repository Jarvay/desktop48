<template>
    <div>
        <el-divider content-position="left">下载任务</el-divider>

        <el-card v-if="downloadTasks.length === 0" shadow="hover">
            <span>当前未有下载任务</span>
        </el-card>

        <el-card v-else style="margin-bottom: 8px;" shadow="hover" v-for="(downloadTask, index) in downloadTasks">
            <div class="task-info">
                <span>{{downloadTask.getFilePath()}}</span>
                <div>
                    <el-button v-if="downloadTask.isDownloading()" type="danger" @click="downloadTask.stop()"
                               size="small">结束
                    </el-button>
                    <el-button v-if="downloadTask.isFinish()" type="success" @click="downloadTask.openSaveDirectory()"
                               size="small">打开文件夹
                    </el-button>
                </div>
            </div>

            <div class="task-progress">
                <el-progress text-inside :stroke-width="18" :percentage="downloadTask.progress"></el-progress>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import DownloadTask from '@/assets/js/download-task';
    import EventBus from '@/assets/js/event-bus';
    import Constants from '@/assets/js/constants';
    import Debug from '@/assets/js/debug';

    @Component
    export default class Downloads extends Vue {
        private downloadTasks: DownloadTask[] = [];

        private created() {
            /**
             * 绑定下载事件
             */
            EventBus.bind<DownloadTask>(Constants.EVENT.DOWNLOAD_TASK, (downloadTask: DownloadTask) => {
                Debug.log(downloadTask);
                const exists = this.downloadTasks.some((item: DownloadTask) => {
                    return item.getLiveId() === downloadTask.getLiveId();
                });
                if (exists) {
                    this.$message({
                        message: '该回放已在下载列表',
                        type: 'warning'
                    });
                    return;
                }
                this.downloadTasks.push(downloadTask);
                downloadTask.setOnProgress((percent: number) => {
                    this.$set(downloadTask, 'progress', percent);
                });
                downloadTask.start(() => {
                    this.$message({
                        message: '下载开始',
                        type: 'info'
                    });
                });
            });
        }
    }
</script>

<style scoped lang="scss">
    .task-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 18px;
    }

    .task-progress {
        margin-top: 8px;
        text-align: left;
    }

    .download-button {
        cursor: pointer;
        font-size: 28px;
    }
</style>

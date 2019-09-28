<template>
    <div>
        <el-divider content-position="left">下载任务(下载进度显示可能有问题)</el-divider>

        <el-card v-if="downloadTasks.length === 0" shadow="hover">
            <span>未有下载任务</span>
        </el-card>

        <el-card v-else style="margin-bottom: 8px;" shadow="hover" v-for="(downloadTask, index) in downloadTasks">
            <div class="task-info">
                <div>
                    <i class="el-icon-loading" v-if="downloadTask.isDownloading()" style="color: #409EFF;"></i>
                    <i class="el-icon-check" v-if="downloadTask.isFinish()" style="color: #67C23A;"></i>
                    <span style="margin-left: 8px;">{{downloadTask.getFilePath()}}</span>
                </div>
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

        <el-divider content-position="left">录制任务</el-divider>

        <el-card v-if="recordTasks.length === 0" shadow="hover">
            <span>未有录制任务</span>
        </el-card>

        <el-card v-else style="margin-bottom: 8px;" shadow="hover" v-for="(recordTask, index) in recordTasks">
            <div class="task-info">
                <div>
                    <i class="el-icon-loading" v-if="recordTask.isRecording()" style="color: #409EFF;"></i>
                    <i class="el-icon-check" v-if="recordTask.isFinish()" style="color: #67C23A;"></i>
                    <span style="margin-left: 8px;">{{recordTask.getFilePath()}}</span>
                </div>
                <div>
                    <el-button v-if="recordTask.isRecording()" type="danger" @click="recordTask.stop()"
                               size="small">结束
                    </el-button>
                    <el-button v-if="recordTask.isFinish()" type="success" @click="recordTask.openSaveDirectory()"
                               size="small">打开文件夹
                    </el-button>
                </div>
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
    import RecordTask from '@/assets/js/record-task';

    @Component
    export default class Downloads extends Vue {
        private downloadTasks: DownloadTask[] = [];
        private recordTasks: RecordTask[] = [];

        private created() {
            /**
             * 绑定下载事件
             */
            EventBus.bind<DownloadTask>(Constants.Event.DOWNLOAD_TASK, (downloadTask: DownloadTask) => {
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

            EventBus.bind<RecordTask>(Constants.Event.RECORD_TASK, (recordTask: RecordTask) => {
                Debug.log(recordTask);
                const exists = this.recordTasks.some((item: RecordTask) => {
                    return item.getLiveId() === recordTask.getLiveId() && item.isRecording();
                });
                if (exists) {
                    this.$message({
                        message: '该直播已在录制',
                        type: 'warning'
                    });
                    return;
                }
                this.recordTasks.push(recordTask);
                recordTask.start(() => {
                    this.$message({
                        message: '录制开始',
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

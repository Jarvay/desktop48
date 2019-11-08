<template>
    <el-container>
        <el-main style="display: flex;flex-direction: column;align-items:center;justify-content:center;height: 600px;">
            <div>
                <i class="el-icon-loading"></i>
                <span style="margin-left: 8px;">{{initText}}</span>
            </div>
            <el-progress v-if="downloading" style="margin-top: 16px;" type="circle" :percentage="percent"></el-progress>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Emit, Vue} from 'vue-property-decorator';
    import Constants from '@/assets/js/constants';
    import Tools from '@/assets/js/tools';
    import fs from 'fs';
    import path from 'path';
    import AdmZip from 'adm-zip';

    @Component
    export default class Initialize extends Vue {
        //初始化
        protected initText: string = '正在初始化';
        protected isIniting: boolean = false;
        protected percent: number = 0;
        protected downloading = false;

        protected created() {
            this.init();
        }

        /**
         * 初始化
         */
        protected init() {
            let url: string;
            switch (process.platform) {
                default:
                case 'win32':
                    url = Constants.FFMPEG_URL_WIN32;
                    break;
                case 'darwin':
                    url = Constants.FFMPEG_URL_MAC;
                    break;
            }

            fs.stat(Tools.ffplayPath(), (error: any) => {
                if (error) {
                    this.isIniting = true;
                    fs.stat(path.join(Tools.APP_DATA_PATH, 'ffmpeg.zip'), (error) => {
                        if (error) {
                            this.initText = '正在下载所需文件';
                            this.downloading = true;
                            Tools.download({
                                url: url,
                                filePath: path.join(Tools.APP_DATA_PATH, 'ffmpeg.zip'),
                                onError: () => {
                                    this.downloading = false;
                                },
                                onFinish: () => {
                                    this.downloading = false;
                                    this.unzip();
                                },
                                onProgress: (progress: any) => {
                                    this.percent = parseInt(progress);
                                }
                            });
                        } else {
                            this.unzip();
                        }
                    });
                } else {
                    this.onInitialized();
                }
            });
        }

        /**
         * 解压
         */
        protected unzip() {
            console.info('正在解压');
            this.initText = '正在解压';
            const zip = new AdmZip(path.join(Tools.APP_DATA_PATH, 'ffmpeg.zip'));
            const [parentEntry] = zip.getEntries();
            zip.extractAllTo(Tools.APP_DATA_PATH, true);
            fs.renameSync(path.join(Tools.APP_DATA_PATH, parentEntry.entryName), path.join(Tools.APP_DATA_PATH, 'ffmpeg'));
            this.onInitialized();
        }

        protected ffmpegInit() {
            fs.chmodSync(Tools.ffmpegPath(), '777');
            fs.chmodSync(Tools.ffplayPath(), '777');
        }

        @Emit()
        protected onInitialized() {
            this.ffmpegInit();
        }
    };
</script>

<style scoped>

</style>

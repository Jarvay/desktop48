import {remote} from "electron";
<template>
  <el-container>
    <el-main
            style="display: flex;flex-direction: column;align-items:center;justify-content:center;height: 600px;">
      <div>
        <i class="el-icon-loading"></i>
        <span style="margin-left: 8px;">{{initText}}</span>
      </div>
      <el-progress v-if="downloading" style="margin-top: 16px;" type="circle"
                   :percentage="percent"></el-progress>

      <el-button style="margin-top: 32px;" @click="selectFfmpegDir" type="primary">跳过，手动选择ffmpeg目录
      </el-button>
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
    import Database from '@/assets/js/database';
    import {remote} from 'electron';

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
                                onError: (error) => {
                                    this.downloading = false;
                                    console.error('error', error);
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
            this.initText = '正在解压';
            const zip = new AdmZip(path.join(Tools.APP_DATA_PATH, 'ffmpeg.zip'));
            const [parentEntry] = zip.getEntries();
            const originPath = path.join(Tools.APP_DATA_PATH, parentEntry.entryName);
            fs.stat(originPath, err => {
                if (!err) {
                    fs.unlink(originPath, () => {
                    });
                }
            });
            zip.extractAllTo(Tools.APP_DATA_PATH, true);

            const filePath = path.join(Tools.APP_DATA_PATH, 'ffmpeg');
            fs.stat(filePath, err => {
                if (!err) {
                    fs.unlink(filePath, () => {
                    });
                }
            });
            fs.renameSync(originPath, filePath);
            Database.instance().setFfmpegDir(path.join(filePath, 'bin'));
            this.onInitialized();
        }

        /**
         * 选择ffmpeg目录
         */
        protected selectFfmpegDir() {
            const dir = remote.dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });
            if (typeof dir !== 'undefined' && dir.length !== 0) {
                const [ffmpegDir] = dir;
                try {
                    fs.statSync(path.join(ffmpegDir, Tools.ffmpegFullFilename('ffmpeg')));
                    fs.statSync(path.join(ffmpegDir, Tools.ffmpegFullFilename('ffplay')));
                    Database.instance().setFfmpegDir(ffmpegDir);
                    this.onInitialized();
                } catch (e) {
                    this.confirmFfmpegDir();
                }
            }
        }

        protected confirmFfmpegDir() {
            this.$confirm('选择的目录下没有ffmpeg或ffplay', {
                confirmButtonText: '重新选择',
                cancelButtonText: '就这样吧'
            }).then(() => {
               this.selectFfmpegDir();
            }).catch(() => {
                this.onInitialized();
            });
        }

        @Emit()
        protected onInitialized() {
            Tools.setFfmpegExecutable();
        }
    };
</script>

<style scoped>

</style>

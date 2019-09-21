<template>
    <el-container>
        <el-main style="display: flex;flex-direction: column;align-items:center;justify-content:center;height: 600px;">
            <span>{{initText}}</span>
            <el-progress style="margin-top: 16px;" type="circle" :percentage="percent"></el-progress>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Emit, Vue} from "vue-property-decorator";
    import Debug from "@/assets/js/debug";
    import Constants from "@/assets/js/constants";
    import Tools from "@/assets/js/tools";
    import fs from "fs";
    import path from "path";

    @Component
    export default class Initialize extends Vue {
        //初始化
        private initText: string = "";
        private isIniting: boolean = false;
        private percent: number = 0;

        private mounted() {
            this.init();
        }

        /**
         * 初始化
         */
        private init() {
            let url: string;
            switch (process.platform) {
                default:
                case "win32":
                    url = Constants.FFMPEG_URL_WIN32;
                    break;
                case "darwin":
                    url = Constants.FFMPEG_URL_MAC;
                    break;
            }

            fs.stat(Tools.ffplayPath(), (error: any, stat: any) => {
                if (error) {
                    this.isIniting = true;
                    fs.stat(path.join(Tools.APP_DATA_PATH, "ffmpeg.zip"), (error, stat) => {
                        if (error) {
                            this.initText = "正在下载所需文件";
                            Tools.download({
                                url: url,
                                filePath: path.join(Tools.APP_DATA_PATH, "ffmpeg.zip"),
                                onError: () => {
                                },
                                onFinish: () => {
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
        private unzip() {
            this.initText = "正在解压";
            const AdmZip = require("adm-zip");
            const zip = new AdmZip(path.join(Tools.APP_DATA_PATH, "ffmpeg.zip"));
            const dir = zip.getEntries()[0].entryName;
            zip.extractAllTo(Tools.APP_DATA_PATH, true);
            fs.renameSync(path.join(Tools.APP_DATA_PATH, dir), path.join(Tools.APP_DATA_PATH, "ffmpeg"));
            this.onInitialized();
        }

        @Emit()
        private onInitialized() {
        }
    };
</script>

<style scoped>

</style>

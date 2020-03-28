import fs from "fs";
<template>
    <div>
        <el-divider content-position="left">更新成员信息</el-divider>

        <el-card style="text-align: left;" shadow="hover">
            <el-button type="primary" @click="updateInfo" :loading="isUpdating">更新成员信息</el-button>
        </el-card>

        <el-divider content-position="left">User-Agent设置</el-divider>

        <el-card style="margin-top: 16px;" shadow="hover">
            <div style="display: flex;flex-direction: row;width: 720px;">
                <el-input style="" type="text" v-model="userAgent" placeholder="设置User-Agent"></el-input>

                <el-button style="margin-left: 8px;" type="primary" @click="setUserAgent">设置</el-button>
            </div>
        </el-card>

        <el-divider content-position="left">默认下载目录</el-divider>

        <el-card style="margin-top: 16px;" shadow="hover">
            <div style="display: flex;flex-direction: row; width: 640px;">
                <el-input type="text" v-model="downloadDirectory" placeholder="下载目录"
                          @click="setDownloadDirectory" readonly></el-input>

                <el-button style="margin-left: 8px;" type="primary" @click="setDownloadDirectory">选择</el-button>

                <el-button style="margin-left: 8px;" type="success" @click="openDownloadDirectory">打开目录</el-button>
            </div>
        </el-card>

        <el-divider content-position="left">ffmpeg目录</el-divider>

        <el-card style="margin-top: 16px;" shadow="hover">
            <div style="display: flex;flex-direction: row; width: 640px;">
                <el-input type="text" v-model="ffmpegDirectory" placeholder="ffmpeg目录"
                          @click="setFfmpegDirectory" readonly></el-input>

                <el-button style="margin-left: 8px;" type="primary" @click="setFfmpegDirectory">选择</el-button>

                <el-button style="margin-left: 8px;" type="success" @click="openFfmpegDirectory">打开目录</el-button>
            </div>
        </el-card>

        <el-divider content-position="left">屏蔽成员直播|回放</el-divider>

        <el-card style="margin-top: 16px;" shadow="hover">
            <hidden-members></hidden-members>
        </el-card>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Database from '@/assets/js/database';
    import Constants from '@/assets/js/constants';
    import Apis from '@/assets/js/apis';
    import HiddenMembers from '@/components/HiddenMembers.vue';
    import {remote} from 'electron';
    import path from 'path';
    import Tools from '@/assets/js/tools';
    import * as fs from 'fs';

    @Component({
        components: {HiddenMembers}
    })
    export default class Setting extends Vue {
        protected userAgent: string = Database.instance().getConfig('userAgent', Constants.DEFAULT_USER_AGENT);
        protected isUpdating: boolean = false;
        protected downloadDirectory: string = Database.instance().getDownloadDir();
        protected ffmpegDirectory: string = Database.instance().getFfmpegDir();

        protected updateInfo() {
            this.isUpdating = true;
            Apis.instance().syncInfo().then(() => {
                this.$message({
                    message: '更新完毕',
                    type: 'success'
                });
                this.isUpdating = false;
            }).catch((error: any) => {
                console.error(error);
                this.isUpdating = false;
            });
        }

        protected setUserAgent() {
            Database.instance().setConfig('userAgent', this.userAgent);
            this.$message({
                message: '设置成功',
                type: 'success'
            });
        }

        protected setDownloadDirectory() {
            const dir = remote.dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });
            if (typeof dir !== 'undefined') {
                this.downloadDirectory = dir[0];
                Database.instance().setDownloadDir(this.downloadDirectory);
            }
        }

        protected openDownloadDirectory() {
            remote.shell.showItemInFolder(path.join(Database.instance().getDownloadDir(), '48'));
        }

        protected setFfmpegDirectory() {
            const dir = remote.dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });
            if (typeof dir !== 'undefined') {
                const [ffmpegDir] = dir;
                try {
                    fs.statSync(path.join(ffmpegDir, Tools.ffmpegFullFilename('ffmpeg')));
                    fs.statSync(path.join(ffmpegDir, Tools.ffmpegFullFilename('ffplay')));
                    this.ffmpegDirectory = ffmpegDir;
                    Database.instance().setFfmpegDir(ffmpegDir);
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
                this.setFfmpegDirectory();
            }).catch(() => {

            });
        }

        protected openFfmpegDirectory() {
            remote.shell.showItemInFolder(path.join(Database.instance().getFfmpegDir(), '48'));
        }
    }
</script>

<style scoped>

</style>

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
                          @click="setDownloadDirectory"></el-input>

                <el-button style="margin-left: 8px;" type="primary" @click="setDownloadDirectory">选择</el-button>
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
    import Debug from '@/assets/js/debug';
    import HiddenMembers from '@/components/HiddenMembers.vue';
    import {remote} from 'electron';

    @Component({
        components: {HiddenMembers}
    })
    export default class Setting extends Vue {
        private userAgent: string = Database.instance().getConfig('userAgent', Constants.DEFAULT_USER_AGENT);
        private isUpdating: boolean = false;
        private downloadDirectory: string = Database.instance().getDownloadDir();

        private updateInfo() {
            this.isUpdating = true;
            Apis.instance().syncInfo().then(() => {
                this.$message({
                    message: '更新完毕',
                    type: 'success'
                });
                this.isUpdating = false;
            }).catch((error: any) => {
                Debug.error(error);
                this.isUpdating = false;
            });
        }

        private setUserAgent() {
            Database.instance().setConfig('userAgent', this.userAgent);
            this.$message({
                message: '设置成功',
                type: 'success'
            });
        }

        private setDownloadDirectory() {
            const dir = remote.dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });
            if (typeof dir !== 'undefined') {
                this.downloadDirectory = dir[0];
                Database.instance().setDownloadDir(this.downloadDirectory);
            }
        }
    }
</script>

<style scoped>

</style>

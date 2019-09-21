<template>
    <div>
        <el-card style="text-align: left;">
            <el-button type="primary" @click="updateInfo" :loading="isUpdating">更新成员信息</el-button>
        </el-card>

        <el-card style="margin-top: 16px;">
            <div style="display: flex;flex-direction: row;">
                <el-input style="width: 640px;" type="text" v-model="userAgent" placeholder="设置User-Agent"></el-input>

                <el-button style="margin-left: 8px;" type="primary" @click="setUserAgent">设置</el-button>
            </div>
        </el-card>

        <el-card style="margin-top: 16px;">
            <div slot="header">
                <span>屏蔽直播|回放的成员</span>
            </div>
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
    @Component({
        components: {HiddenMembers}
    })
    export default class Setting extends Vue{
        private userAgent: string = Database.instance().getConfig('userAgent', Constants.DEFAULT_USER_AGENT);
        private isUpdating: boolean = false;

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
    }
</script>

<style scoped>

</style>

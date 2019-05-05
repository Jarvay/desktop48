<template>
    <div>
        <Card>
            <Button type="primary" @click="updateInfo" :loading="isUpdating">更新成员信息</Button>
        </Card>

        <Card style="margin-top: 16px;">
            <div style="display: flex;flex-direction: row;margin-top: 16px;">
                <Input style="width: 480px;" type="text" v-model="token" placeholder="手动设置Token"></Input>

                <Button style="margin-left: 8px;" type="primary" @click="setToken">设置</Button>
            </div>
        </Card>

        <Card style="margin-top: 16px;">
            <Button type="primary" @click="accountShow = true">个人信息</Button>

            <Button style="margin-left: 8px;" @click="checkIn" type="primary" :disabled="checkInDisabled">
                每日打卡{{checkInDisabled ? '（已打卡）' : ''}}
            </Button>
        </Card>

        <Card style="margin-top: 16px;">
            <p slot="title">
                <span>{{`当前版本:${version}`}}</span>
                <span style="margin-left: 8px;">{{`最新版本:${latestVersion}`}}</span>
            </p>
            <Button style="margin-top: 16px;" type="primary" @click="openDownloadPage">下载新版本</Button>
        </Card>

        <Drawer v-model="accountShow">
            <Account></Account>
        </Drawer>
    </div>
</template>

<script>
    import Apis from "../assets/js/apis";
    import Account from "./Account";
    import Database from "../assets/js/database";

    export default {
        name: "Settings",
        components: {Account},
        data() {
            return {
                isUpdating: false,
                token: '',
                accountShow: false,
                version: '',
                latestVersion: '',
                checkInDisabled: false,
            };
        },
        created() {
            if (typeof Database.getToken() === "string") {
                this.token = Database.getToken();
            }
            this.version = require('../../../package').version;
            this.remoteVersion();
            this.registerEvent();

            const date = new Date().format('MM-dd');
            const lastCheckInTime = Database.getLastCheckInTime();
            if (typeof lastCheckInTime === "undefined") {
                this.checkInDisabled = true;
            } else {
                const lastCheckInDate = lastCheckInTime.format('MM-dd');
                if (date == lastCheckInDate) {
                    this.checkInDisabled = true;
                }
            }
        },
        methods: {
            updateInfo: function () {
                this.isUpdating = true;
                Apis.syncInfo().then(() => {
                    this.isUpdating = false;
                    this.$Message.success({
                        content: '更新成功'
                    });
                }).catch(error => {
                    this.isUpdating = false;
                    console.error(error);
                });
            },
            setToken: function () {
                if (this.token.length == 0) {
                    this.$Message.warning({
                        content: '请输入token'
                    });
                    return;
                }
                Database.setToken(this.token);
                Apis.reloadUserInfo().then(content => {
                    this.$Message.success({
                        content: '设置成功'
                    });
                    Database.setLoginUserInfo(content);
                    this.$eventBus.$emit(this.Constants.EVENT.USER_INFO);
                    this.$eventBus.$emit(this.Constants.EVENT.LOGIN);
                }).catch(error => {
                    Dev.error(error);
                });
            },
            remoteVersion: function () {
                axios.get('https://raw.githubusercontent.com/Jarvay/desktop48/master/package.json').then(response => {
                    this.latestVersion = response.data.version;
                }).catch(error => {
                    this.latestVersion = '获取失败';
                });
            },
            openDownloadPage: function () {
                require('electron').remote.shell.openExternal('https://github.com/Jarvay/desktop48/releases');
            },
            registerEvent: function () {
                this.$eventBus.$on(this.Constants.EVENT.LOGIN, () => {
                    this.token = Database.getToken();
                });

                this.$eventBus.$on(this.Constants.EVENT.LOGOUT, () => {
                    this.token = '';
                });
            },
            checkIn: function () {
                Apis.checkIn().then(content => {
                    this.$Message.success({
                        content: `应援力+${content.addSupport},经验+${content.addExp}`
                    });
                    Database.setLastCheckInTime(new Date().getTime());
                    this.checkInDisabled = true;
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                });
            },
        }
    }
</script>

<style scoped>

</style>
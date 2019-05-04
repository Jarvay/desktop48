<template>
    <div>
        <Card>
            <Button type="primary" @click="updateInfo" :loading="isUpdating">更新成员信息</Button>
        </Card>

        <Card style="margin-top: 16px;">
            <div style="display: flex;flex-direction: row;margin-top: 16px;">
                <Input style="width: 320px;" type="text" v-model="token" placeholder="手动设置Token"></Input>
                <Button style="margin-left: 8px;" type="primary" @click="setToken">设置</Button>
            </div>
        </Card>

        <Card style="margin-top: 16px;">
            <Button style="margin-top: 16px;" type="primary" @click="accountShow = true">账号登录</Button>
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
                accountShow: false
            };
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
                this.$Message.success({
                    content: '设置成功'
                });
                this.$eventBus.$emit(this.Constants.EVENT.LOGIN);
            }
        }
    }
</script>

<style scoped>

</style>
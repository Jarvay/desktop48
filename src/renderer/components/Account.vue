<template>
    <div style="margin-top: 32px;">
        <div v-if="isLogin">
            <UserInfo :user-info="userInfo"></UserInfo>

            <Button style="margin-top: 8px;" type="primary" @click="logout">退出登录</Button>
        </div>

        <div v-else>
            <Select v-model="loginType">
                <Option :value="Constants.LOGIN_TYPE.VERIFY_CODE">验证码登录(推荐)</Option>
                <Option :value="Constants.LOGIN_TYPE.ACCOUNT">账号密码登录</Option>
            </Select>

            <Form class="form" v-show="loginType == Constants.LOGIN_TYPE.VERIFY_CODE" ref="formInline"
                  :model="form"
                  :rules="ruleInline">
                <Row>
                    <Col span="6">
                        <FormItem prop="area">
                            <Input type="text" v-model="form.area" placeholder="地区"></Input>
                        </FormItem>
                    </Col>
                    <Col span="18">
                        <FormItem prop="mobileVerify" style="margin-left: 8px;">
                            <Input type="text" v-model="form.mobileVerify"
                                   placeholder="手机号码"></Input>
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span="12">
                        <FormItem prop="verifyCode">
                            <Input type="text" v-model="form.verifyCode" placeholder="验证码"></Input>
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem style="margin-left: 8px;">
                            <Button type="primary" @click="getVerifyCode" :loading="gettingVerifyCode"
                                    :disabled="disabled">
                                {{sendText}}
                            </Button>
                        </FormItem>
                    </Col>
                </Row>
                <FormItem>
                    <Button type="primary" @click="verifyCodeLogin" :disabled="verifyLoginDisabled">登录</Button>
                </FormItem>
            </Form>

            <Form class="form" v-show="loginType == Constants.LOGIN_TYPE.ACCOUNT" ref="formInline" :model="form"
                  :rules="ruleInline">
                <FormItem prop="mobile">
                    <Input type="text" v-model="form.mobile" placeholder="手机号码">
                        <Icon type="ios-person-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="password">
                    <Input type="password" v-model="form.password" placeholder="密码">
                        <Icon type="ios-lock-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button type="primary" @click="login" :disabled="loginDisabled">登录</Button>
                </FormItem>
            </Form>
        </div>
    </div>
</template>

<script>
    import Apis from "../assets/js/apis";
    import Database from "../assets/js/database";
    import UserInfo from "./UserInfo";

    export default {
        name: "Account",
        components: {UserInfo},
        data() {
            return {
                form: {
                    mobile: '',
                    mobileVerify: '',
                    password: '',
                    area: '086',
                    verifyCode: '',
                },
                ruleInline: {
                    mobile: [
                        {required: true, message: '请输入手机号码', trigger: 'blur'}
                    ],
                    verifyCode: [
                        {required: true, message: '请输入验证码', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                    ]
                },
                loginType: this.Constants.LOGIN_TYPE.VERIFY_CODE,
                gettingVerifyCode: false,
                disabled: false,
                seconds: this.Constants.VERIFY_CODE_INTERVAL,
                sendText: '获取验证码',
                verifyLoginDisabled: false,
                loginDisabled: false,
                userInfo: {}
            };
        },
        computed: {
            isLogin() {
                return typeof this.userInfo !== "undefined";
            }
        },
        created() {
            this.userInfo = Database.getLoginUserInfo();
            this.registerEvent();
        },
        methods: {
            login: function () {
                if (this.form.mobile.length == 0 || this.form.password.length == 0) return;
                this.loginDisabled = true;
                Apis.login(this.form.mobile, this.form.password).then(data => {
                    this.loginSuccess(data)
                }).catch(error => {
                    this.loginFailed(error);
                });
            },
            getVerifyCode: function () {
                this.gettingVerifyCode = true;
                this.disabled = true;
                Apis.verifyCode(this.form.mobileVerify, this.form.area).then(data => {
                    this.$Message.success({
                        content: '发送成功'
                    });
                    this.gettingVerifyCode = false;
                    const timer = setInterval(() => {
                        this.sendText = `重新获取(${this.seconds})`;
                        this.seconds--;
                        if (this.seconds == 0) {
                            this.sendText = '获取验证码';
                            clearInterval(timer);
                            this.seconds = this.Constants.VERIFY_CODE_INTERVAL;
                            this.disabled = false;
                        }
                    }, 1000);
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                    this.gettingVerifyCode = false;
                    this.disabled = false;
                })
            },
            verifyCodeLogin: function () {
                if (this.form.mobileVerify.length == 0 || this.form.verifyCode.length == 0) return;
                this.verifyLoginDisabled = true;
                Apis.verifyCodeLogin(this.form.mobileVerify, this.form.verifyCode).then(data => {
                    this.loginSuccess(data)
                }).catch(error => {
                    this.loginFailed(error);
                });
            },
            loginSuccess: function (content) {
                this.$Message.success({
                    content: '登陆成功'
                });
                Database.setLoginUserInfo(content.userInfo);
                Database.setToken(content.userInfo.token);
                this.userInfo = content.userInfo;
                this.$eventBus.$emit(this.Constants.EVENT.LOGIN);
            },
            loginFailed: function (error) {
                this.loginDisabled = false;
                this.verifyLoginDisabled = false;
                this.$Message.error({
                    content: error
                });
            },
            logout: function () {
                this.loginDisabled = false;
                this.verifyLoginDisabled = false;
                Database.removeLoginUserInfo();
                Database.removeToken();
                this.userInfo = undefined;

                this.$eventBus.$emit(this.Constants.EVENT.LOGOUT);
            },
            registerEvent: function () {
                this.$eventBus.$on(this.Constants.EVENT.USER_INFO, () => {
                    this.userInfo = Database.getLoginUserInfo();
                });
            }
        }
    }
</script>

<style scoped>
    .form {
        margin-top: 8px;
    }
</style>
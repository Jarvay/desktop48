<template>
    <div style="display: flex;flex-direction: row;">
        <Card style="width: 480px;">
            <div slot="title">
                <span>{{roomInfo.roomTopic}}</span>
            </div>

            <div>
                <div class="input-box">
                    <Input type="text" v-model="content" @on-enter="send"></Input>
                    <Button style="margin-left: 8px;" type="primary" @click="send" :disabled="sendDisabled">
                        {{sendText}}
                    </Button>
                </div>
                <Scroll class="scroll" :style="{backgroundImage: `url(${background})`}"
                        :distance-to-edge="distance" :on-reach-bottom="onOwnerReachBottom" height="600">
                    <div>
                        <JuJuMsgItem v-for="message in ownerMessages" :message="message"></JuJuMsgItem>
                    </div>
                </Scroll>
            </div>
        </Card>

        <Card style="width: 480px;margin-left: 16px;">
            <div>
                <Scroll class="scroll" :style="{backgroundImage: `url(${background})`}"
                        :distance-to-edge="distance" :on-reach-bottom="onAllReachBottom" height="700">
                    <div>
                        <JuJuMsgItem v-for="message in allMessages" :message="message"></JuJuMsgItem>
                    </div>
                </Scroll>
            </div>
        </Card>
    </div>
</template>

<script>
    import Apis from "../assets/js/apis";
    import JuJuMsgItem from "./JuJuMsgItem";
    import Tools from "../assets/js/tools";
    import Dev from "../assets/js/dev";
    import ChatRoomTools from '../assets/js/chatroom-tools';
    import Database from "../assets/js/database";

    export default {
        name: "JuJuConversation",
        components: {JuJuMsgItem},
        props: {
            userId: {
                type: Number | String,
                required: true
            }
        },
        data() {
            return {
                roomId: '0',
                ownerNextTime: '0',
                allNextTime: '0',
                roomInfo: {},
                ownerMessages: [],
                allMessages: [],
                background: '',
                distance: -10,
                content: '',
                isFirstLoad: false,
                chatroom: null,
                loginUserInfo: {},
                sendText: '发送',
                seconds: this.Constants.BARRAGE_SEND_INTERVAL,
                sendDisabled: false
            };
        },
        computed: {
            ownerId() {
                return this.userId;
            }
        },
        watch: {},
        created() {
            this.init();
        },
        destroyed() {
            if (this.chatroom != null) {
                this.chatroom.disconnect();
            }
        },
        methods: {
            init:function(){
                this.loginUserInfo = Database.getLoginUserInfo();
                this.isFirstLoad = true;

                this.ownerMessages = [];
                this.allMessages = [];

                this.juJuSource();
            },
            juJuSource: function () {
                Apis.juJuSource(this.ownerId).then(content => {
                    this.roomId = content.roomInfo.roomId;
                    this.roomInfo = content.roomInfo;
                    this.background = Tools.sourceUrl(this.roomInfo.bgImg);

                    this.connectChatroom();
                    this.juJuOwner();
                    this.juJuAll();
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                    Dev.error(error);
                });
            },
            juJuOwner: function () {
                Apis.juJuOwner(this.userId, this.roomId, this.ownerNextTime).then(content => {
                    const messages = content.message;
                    this.ownerMessages = this.ownerMessages.concat(messages);
                    this.ownerNextTime = content.nextTime;
                    if (this.isFirstLoad) {
                        this.onLoaded();
                        this.isFirstLoad = false;
                    }
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                    Dev.error('juJuOwner', error);
                });
            },
            juJuAll: function () {
                Apis.juJuAll(this.userId, this.roomId, this.allNextTime).then(content => {
                    const messages = content.message;
                    this.allMessages = this.allMessages.concat(messages);
                    this.allNextTime = content.nextTime;
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                    Dev.error('juJuAll', error);
                });
            },
            onOwnerReachBottom: function () {
                this.juJuOwner();
            },
            onAllReachBottom: function () {
                this.juJuAll();
            },
            send: function () {
                const custom = JSON.stringify(ChatRoomTools.juJuMsgCustomCreate(this.loginUserInfo, this.roomId, this.content));
                Dev.log(custom);
                const message = {
                    type: 'text',
                    text: this.content,
                    custom: custom,
                    done: (error) => {
                        if (error == null) {
                            const data = {
                                msgTime: new Date().getTime(),
                                extInfo: custom
                            };
                            this.allMessages.unshift(data);
                            this.ownerMessages.unshift(data);
                        } else {
                            Dev.error(error);
                            this.$Message.error({
                                content: error
                            });
                        }
                        this.sendDisabled = true;
                        this.content = '';
                        const timer = setInterval(() => {
                            this.sendText = `发送(${this.seconds})`;
                            this.seconds--;
                            if (this.seconds == 0) {
                                this.sendText = '发送';
                                clearInterval(timer);
                                this.seconds = this.Constants.BARRAGE_SEND_INTERVAL;
                                this.sendDisabled = false;
                            }
                        }, 1000);
                    }
                };
                this.chatroom.sendText(message);
            },
            onLoaded: function () {
                this.$emit('on-loaded', this.roomInfo);
            },
            connectChatroom: function () {
                const options = {
                    roomId: this.roomId,
                    onConnect: () => {
                        Dev.info('onConnect');
                    },
                    onDisconnect: (message) => {
                        Dev.log('disconnect', message);
                    },
                    onWillConnect: () => {

                    },
                    onMessage: messages => {
                        messages.forEach(message => {
                            Dev.log('onMessage', message);
                            const custom = JSON.parse(message.custom);
                            switch (custom.messageType) {
                                case this.Constants.JUJU_MSG_TYPE.TEXT:
                                    const data = {
                                        msgTime: message.time,
                                        extInfo: message.custom
                                    }
                                    this.allMessages.unshift(data);
                                    if (custom.user.userId == this.userId) {
                                        this.ownerMessages.unshift(data);
                                    }
                                    break;
                                case this.Constants.JUJU_MSG_TYPE.DELETE:
                                    break;
                                default:
                                    break;
                            }
                        });
                    },
                    onError: error => {
                        Dev.error('chatroom error', error);
                    }
                };
                ChatRoomTools.chatroom(options).then(chatroom => {
                    this.chatroom = chatroom;
                }).catch(error => {
                    Dev.error(error);
                });
            }
        }
    }
</script>

<style scoped>
    .scroll {
        margin-top: 8px;
        background-size: 100% auto;
    }

    .input-box {
        display: flex;
        flex-direction: row;
    }
</style>
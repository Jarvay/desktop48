<template>
    <div class="msg-container">
        <Avatar class="avatar" :src="avatar" size="large"></Avatar>

        <!--消息|回复-->
        <div class="msg-content"
             v-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.REPLY || extInfo.messageType == Constants.JUJU_MSG_TYPE.TEXT">
            <p>
                <span>{{extInfo.user.nickName}}</span>
                <span class="message-time">{{msgTime}}</span>
            </p>
            <p>{{extInfo.text}}</p>

            <div class="reply-box" v-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.REPLY">
                <Divider size="small"></Divider>
                <p>
                    <span>{{extInfo.replyName}}</span>
                </p>
                <p>{{extInfo.replyText}}</p>
            </div>
        </div>

        <!--图片-->
        <div v-else-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.IMAGE">
            <img class="image" :src="bodys.url" v-gallery>
        </div>

        <!--直播-->
        <div class="msg-content" v-else-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.LIVE_PUSH">
            <span>[直播消息]</span>
        </div>

        <!--翻牌-->
        <div class="msg-content" v-else-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.FLIP_CARD">
            <p>

                <span>{{extInfo.user.nickName}}</span>
                <span class="message-time">{{msgTime}}</span>
            </p>
            <p>
                <Icon class="icon-answer" type="md-bulb" size="18"/>
                <span>{{extInfo.answer}}</span>
            </p>

            <div class="reply-box">
                <Divider size="small"></Divider>

                <p>
                    <Icon class="icon-question" style="color: #89decb;" type="md-help-circle" size="18"/>
                    <span style="word-break: break-all;"> {{extInfo.question}}</span>
                </p>
            </div>
        </div>

        <!--语音-->
        <div class="msg-content" v-else-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.AUDIO">
            <audio :src="bodys.url" controls></audio>
        </div>

        <!--视频-->
        <div class="msg-content" v-else-if="extInfo.messageType == Constants.JUJU_MSG_TYPE.VIDEO">
            <video style="max-width: 300px;" :src="bodys.url" controls></video>
        </div>
    </div>
</template>

<script>
    import Tools from "../assets/js/tools";

    export default {
        name: "JuJuMsgItem",
        props: {
            message: {
                type: Object,
                required: true
            }
        },
        computed: {
            extInfo() {
                return JSON.parse(this.message.extInfo);
            },
            avatar() {
                return Tools.sourceUrl(this.extInfo.user.avatar);
            },
            msgTime() {
                return new Date(this.message.msgTime).format('yyyy-MM-dd hh:mm')
            },
            bodys() {
                return JSON.parse(this.message.bodys);
            }
        },
        created() {

        },
        data() {
            return {};
        },
        methods: {}
    }
</script>

<style scoped lang="scss">
    .msg-container {
        display: flex;
        flex-direction: row;
        padding: 8px;

        .avatar {
            flex: 0 0 auto;
        }

        .image {
            max-width: 50%;
            margin-left: 16px;
            border-radius: 20px;
        }

        .msg-content {
            display: flex;
            margin-left: 16px;
            flex: 0 1 auto;
            flex-direction: column;
            padding: 6px 16px;
            background-color: white;
            border-radius: 8px;

            .icon-answer {
                color: #be4d36;
            }

            .icon-question {
                color: #19be6b;
            }
        }

        .message-time {
            margin-left: 8px;
        }

        .reply-box {
            color: #999999;
        }

        .ivu-divider-horizontal {
            margin: 8px 0;
        }
    }
</style>
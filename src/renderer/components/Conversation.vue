<template>
    <div class="base-container">
        <Card style="width: 560px;">
            <p slot="title">{{title}}</p>

            <Scroll :on-reach-bottom="onReachBottom" :distance-to-edge="distance" height="700">
                <Card v-for="item in messages" class="message-card">
                    <div class="message-item">
                        <Avatar class="avatar" size="large" :src="item.user.avatar"></Avatar>
                        <div class="message-content">
                            <p>
                                <span class="username">{{item.user.nickname}}</span>
                                <span class="team-badge" :style="{'background-color':`#${item.team.teamColor}`}">
                                        {{item.team.teamName.replace('TEAM ', '')}}
                                    </span>
                            </p>
                            <p>{{item.content.text}}</p>
                        </div>
                    </div>
                    <span class="message-time" slot="extra">{{item.newestMessagetime}}</span>
                </Card>
            </Scroll>
        </Card>
    </div>
</template>

<script>
    import Database from "../assets/js/database";
    import Apis from "../assets/js/apis";
    import Tools from "../assets/js/tools";

    export default {
        name: "Conversation",
        props: {},
        data() {
            return {
                targetUserId: 0,
                title: '',
                distance: -10,
                messages: [],
                lastTime: 0,
                isEnd: false
            };
        },
        computed: {},
        created() {

        },
        methods: {
            getMessages: function () {
                if (this.isEnd) {
                    this.$Message.info({
                        content: '没有更多了'
                    });
                }
                Apis.messageInfo(this.targetUserId, this.lastTime).then(content => {
                    if (this.lastTime == content.lastTime) {
                        this.isEnd = true;
                        return;
                    }
                    this.lastTime = content.lastTime;
                    const messages = content.data.map(item => {
                        item.user.avatar = Tools.sourceUrl(item.user.avatar);
                        item.team = Database.member(item.user.userId).team;
                        item.newestMessagetime = new Date(item.timestamp).format('yyyy-MM-dd hh:mm')
                        return item;
                    });
                    this.messages = this.messages.concat(messages);
                    console.log('content', content);
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                });
            },
            onReachBottom: function () {
                this.getMessages();
            },
            setTargetUserId: function (targetUserId) {
                this.targetUserId = targetUserId;
                this.messages = [];
                this.getMessages();
            }
        }
    }
</script>

<style scoped type="scss">
    .message-card {
        margin-bottom: 8px;
    }

    .message-item {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .avatar {
        flex: 0 0 auto;
    }

    .message-content {
        flex: 0 1 auto;
        margin-left: 8px;
    }
</style>
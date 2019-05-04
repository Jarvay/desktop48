<template>
    <div class="base-container">
        <Card style="width: 480px;">
            <p slot="title">我的消息</p>
            <div slot="extra">
                <Button type="primary" @click="refresh">刷新</Button>
            </div>
            <Scroll :on-reach-bottom="onReachBottom" :distance-to-edge="distance" height="700">
                <CellGroup @on-click="onItemClick">
                    <Cell v-for="(item, index) in messages" :name="index">
                        <div class="message-item">
                            <Avatar size="large" :src="item.user.avatar"></Avatar>
                            <div style="margin-left: 8px;">
                                <p>
                                    <span class="username">{{item.user.nickname}}</span>
                                    <span class="team-badge" :style="{'background-color':`#${item.team.teamColor}`}">
                                        {{item.team.teamName.replace('TEAM ', '')}}
                                    </span>
                                </p>
                                <p>{{item.newestMessage}}</p>
                            </div>
                        </div>
                        <span class="message-time" slot="extra">{{item.newestMessagetime}}</span>
                    </Cell>
                </CellGroup>
            </Scroll>
        </Card>

        <div style="margin-left: 16px;">
            <Conversation ref="conversation"></Conversation>
        </div>
    </div>
</template>

<script>
    import Apis from '../assets/js/apis';
    import Database from "../assets/js/database";
    import Tools from "../assets/js/tools";
    import Conversation from "./Conversation";

    export default {
        name: "MessageBox",
        components: {Conversation},
        data() {
            return {
                messages: [],
                lastTime: 0,
                limit: 20,
                distance: -10,
                isEnd: false,
                clickable: true
            };
        },
        created() {
            if (Database.isLogin()){
                this.getMessages();
            }
            this.registerEvent();
        },
        methods: {
            getMessages: function () {
                if (this.isEnd) {
                    this.$Message.info({
                        content: '没有更多了'
                    });
                }
                Apis.messageBox(this.lastTime, this.limit).then(content => {
                    if (this.lastTime == content.lastTime) {
                        this.isEnd = true;
                        return;
                    }
                    this.lastTime = content.lastTime;
                    const messages = content.data.map(item => {
                        item.user.avatar = Tools.sourceUrl(item.user.avatar);
                        item.team = Database.member(item.user.userId).team;
                        item.newestMessagetime = new Date(item.newestMessagetime).format('yyyy-MM-dd hh:mm')
                        return item;
                    });
                    this.messages = this.messages.concat(messages);
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                });
            },
            onReachBottom: function () {
                this.getMessages();
            },
            refresh: function () {
                this.isEnd = false;
                this.lastTime = 0;
                this.getMessages();
            },
            onItemClick: function (index) {
                if (!this.clickable) {
                    this.$Message.warning({
                        content: `请勿频繁点击，${this.Constants.MESSAGE_CLICK_INTERVAL}秒内只能点击一次`
                    });
                    return;
                }
                this.clickable = false;
                setTimeout(() => {
                    this.clickable = true;
                }, this.Constants.MESSAGE_CLICK_INTERVAL * 1000);
                this.$refs.conversation.setTargetUserId(this.messages[index].user.userId);
            },
            registerEvent: function () {
                this.$eventBus.$on(this.Constants.EVENT.LOGIN, () => {
                   this.getMessages();
                });
            }
        }
    }
</script>

<style scoped type="scss">
    .base-container {
        display: flex;
        flex-direction: row;
    }
</style>
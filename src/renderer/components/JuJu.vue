<template>
    <div>
        <Card>
            <div slot="title">
                <div v-if="!listShow">
                    <Icon style="cursor: pointer;" size="24" type="md-arrow-round-back" @click="listShow = true"/>
                    <span style="margin-left: 8px;">{{title}}</span>
                </div>

                <div v-else>
                    <Icon size="24" type="md-home"/>
                    <span style="margin-left: 8px;">房间</span>
                </div>
            </div>

            <div slot="extra">
                <span v-if="!listShow">{{username}}</span>

                <div v-if="listShow">
                    <Button :loading="loading" type="primary" @click="refresh">刷新</Button>

                    <Icon type="md-people" size="24" style="cursor: pointer;margin-left: 8px;"
                          @click="memberAttentionShow = true"/>
                </div>
            </div>

            <div>
                <Card class="juju-list" v-show="listShow">
                    <CellGroup @on-click="onItemClick">
                        <Cell v-for="(item, index) in list" :name="index">
                            <div class="message-item">
                                <Avatar size="large" :src="item.avatar"></Avatar>
                                <div style="margin-left: 8px;">
                                    <p>{{item.targetName}}</p>
                                    <p>
                                        <span>{{item.ownerName}}</span>
                                        <span class="team-badge"
                                              :style="{backgroundColor:`#${item.team.teamColor}`}">
                                        {{item.team.teamName.replace('TEAM ', '')}}
                                    </span>
                                    </p>
                                    <p class="message-content">{{item.msg}}</p>
                                </div>
                            </div>
                            <div slot="extra">
                                <p><span class="message-time">{{item.newTime}}</span></p>
                                <p style="margin-top: 4px;">
                                    <Badge type="primary" :count="item.badgeCount"></Badge>
                                </p>
                            </div>
                        </Cell>
                    </CellGroup>
                </Card>


                <div v-if="!listShow">
                    <JuJuConversation :user-id="userId" @on-loaded="onLoaded" ref="juJuConversation"></JuJuConversation>
                </div>
            </div>
        </Card>

        <Drawer width="400" v-model="memberAttentionShow" closable>
            <MemberAttention></MemberAttention>
        </Drawer>
    </div>
</template>

<script>
    import Apis from "../assets/js/apis";
    import Database from "../assets/js/database";
    import Tools from "../assets/js/tools";
    import JuJuConversation from "./JuJuConversation";
    import MemberAttention from "./MemberAttention";
    import ChatRoomTools from "../assets/js/chatroom-tools";
    import Dev from "../assets/js/dev";

    export default {
        name: "JuJu",
        components: {MemberAttention, JuJuConversation},
        props: {},
        data() {
            return {
                list: [],
                listShow: true,
                loading: false,
                title: '',
                username: '',
                userId: 0,
                memberAttentionShow: false,
                chatroom: null
            };
        },
        created() {
            if (Database.isLogin()) {
                this.init();
            }
            this.registerEvent();
        },
        methods: {
            init: function () {
                this.juJuList();
                this.connectHomeChatRoom();
            },
            juJuList: function () {
                Apis.juJuList().then(content => {
                    this.loading = false;
                    this.list = content.conversations.map(item => {
                        item.user = Database.member(item.ownerId);
                        item.team = item.user.team;
                        item.newTime = new Date(item.msgTime).format('hh:mm');
                        item.avatar = Tools.sourceUrl(item.targetAvatar);
                        item.badgeCount = Database.getBadgeCount(item.ownerId);
                        return item;
                    });
                }).catch(error => {
                    this.loading = false;
                    this.$Message.error({
                        content: error
                    });
                });
            },
            onItemClick: function (index) {
                this.userId = this.list[index].ownerId;
                this.listShow = false;
                const item = this.list[index];
                item.badgeCount = 0;
                this.$set(this.list, index, item);
                Database.clearBadgeCount(this.userId);
            },
            onLoaded: function (roomInfo) {
                this.username = roomInfo.ownerName;
                this.title = roomInfo.roomName;
                this.listShow = false;
            },
            refresh() {
                this.loading = true;
                this.juJuList();
            },
            connectHomeChatRoom: function () {
                if (this.chatroom != null) return;
                const options = {
                    roomId: ChatRoomTools.HOME_CHATROOM_ID,
                    onConnect: () => {
                        Dev.info('Home chatroom connect');
                    },
                    onDisconnect: (message) => {
                        Dev.log('Home chatroom disconnect', message);
                    },
                    onWillConnect: () => {

                    },
                    onMessage: messages => {
                        messages.forEach(message => {
                            if (message.type == 'text') {
                                const custom = JSON.parse(message.custom);
                                const index = this.list.findIndex(item => {
                                    return item.ownerId == custom.ownerId;
                                });
                                if (index != -1) {
                                    const matchedItem = this.list[index];
                                    matchedItem.msgTime = custom.msgTime;
                                    matchedItem.msg = custom.msg;
                                    matchedItem.newTime = new Date(custom.msgTime).format('hh:ss');
                                    matchedItem.badgeCount++;
                                    Database.incrementBadgeCount(matchedItem.ownerId);
                                    this.list.splice(index, 1);
                                    this.list.unshift(matchedItem);

                                    if (custom.msg == '[直播消息]') {
                                        this.notification(matchedItem.ownerId);
                                    }
                                }
                            }
                        });
                    },
                    onError: error => {
                        Dev.error('home chatroom error', error);
                    }
                };
                ChatRoomTools.chatroom(options).then(chatroom => {
                    this.chatroom = chatroom;
                });
            },
            registerEvent: function () {
                this.$eventBus.$on(this.Constants.EVENT.LOGIN, () => {
                    this.init();
                });
            },
            notification: function (userId) {
                const user = Database.member(userId);
                const notification = new Notification('直播提示', {
                    body: `${user.realName}的直播开始啦`
                });
            }
        }
    }
</script>

<style scoped>
    .message-content {
        color: #cccccc;
    }

    .juju-list {
        height: 700px;
        width: 480px;
        overflow-y: auto;
    }
</style>
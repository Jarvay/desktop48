<template>
    <div class="layout">
        <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
            <TabPane label="Home" :closable="homeClosable">
                <Layout>
                    <Sider hide-trigger width="120">
                        <Menu :active-name="Constants.MENU.LIVES" theme="dark" width="auto"
                              @on-select="onMenuSelect">
                            <MenuItem :name="Constants.MENU.LIVES">直播</MenuItem>
                            <MenuItem :name="Constants.MENU.REVIEWS">回放</MenuItem>
                            <MenuItem :name="Constants.MENU.TRIPS">行程</MenuItem>
                            <MenuItem :name="Constants.MENU.JUJU">聚聚</MenuItem>
                            <MenuItem :name="Constants.MENU.MESSAGES">消息</MenuItem>
                            <MenuItem :name="Constants.MENU.SETTINGS">设置</MenuItem>
                        </Menu>
                    </Sider>

                    <Layout>
                        <Content style="padding: 8px 16px;min-height: 600px;">
                            <Card>
                                <div>
                                    <Lives ref="lives" v-show="menus[Constants.MENU.LIVES]"
                                           :col="colNum"
                                           @on-item-click="openLive"></Lives>

                                    <Reviews ref="reviews" v-show="menus[Constants.MENU.REVIEWS]"
                                             :col="colNum"
                                             @on-item-click="openLive"
                                             :members="members"
                                             :teams="teams"
                                             :groups="groups"></Reviews>

                                    <Trips v-show="menus[Constants.MENU.TRIPS]"></Trips>

                                    <MessageBox
                                            v-show="menus[Constants.MENU.MESSAGES]"></MessageBox>

                                    <JuJu v-show="menus[Constants.MENU.JUJU]"></JuJu>

                                    <Settings v-show="menus[Constants.MENU.SETTINGS]"></Settings>
                                </div>
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </TabPane>

            <TabPane v-for="(liveTab, index) in liveTabs" :label="liveTab.label" v-if="liveTab.show"
                     :name="liveTab.name">
                <Live :index="index" :live-id="liveTab.liveId" :start-time="liveTab.startTime"
                      :title="liveTab.title"></Live>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import Live from "./Live";
    import Apis from "../assets/js/apis";
    import Constants from "../assets/js/constants";
    import Reviews from "./Reviews";
    import Lives from "./Lives";
    import Database from "../assets/js/database";
    import MessageBox from "./MessageBox";
    import Settings from "./Settings";
    import JuJu from "./JuJu";
    import Dev from "../assets/js/dev";
    import Tools from "../assets/js/tools";
    import Trips from "./Trips";

    const menus = {};
    Object.keys(Constants.MENU).forEach(key => {
        menus[key] = Constants.MENU[key] == Constants.MENU.LIVES;
    });

    export default {
        name: 'Home',
        components: {Trips, JuJu, Settings, MessageBox, Lives, Reviews, Live},
        data() {
            return {
                homeClosable: false,
                liveTabs: [],
                activeTab: 0,
                syncing: false,
                colNum: 8,
                menuShow: {
                    lives: true,
                    reviews: false,
                    settings: false,
                    messages: false
                },
                menus: menus,
                activeMenu: this.Constants.MENU.LIVES,
                members: [],
                teams: [],
                groups: []
            }
        },
        created() {
            this.initMembers();

            this.checkForUpdate();

            if (Database.isLogin()) {
                this.imUserInfo();

                const lastCheckInTime = Database.getLastCheckInTime();
                if (!Tools.isToday(lastCheckInTime)) {
                    this.$eventBus.$emit(this.Constants.EVENT.TO_CHECK_IN);
                }
            }

            this.registerEvent();
        },
        mounted() {
            this.$refs.reviews.getReviewList();
            this.$refs.lives.getLiveList();
        },
        methods: {
            handleTabRemove: function (name) {
                const index = this.liveTabs.findIndex(item => {
                    return item.name == name;
                });

                this.liveTabs[index].show = false;
            },
            openLive: function (item) {
                const exists = this.liveTabs.some(tab => {
                    return tab.liveId == item.liveId && tab.show == true;
                });
                if (exists) return;
                const liveTab = {
                    label: `${item.userInfo.nickname}的直播间`,
                    title: item.title,
                    liveId: item.liveId,
                    show: true,
                    name: item.liveId + '_' + Math.random().toString(36).substr(2),
                    startTime: parseInt(item.ctime)
                };
                this.liveTabs.push(liveTab);
                this.activeTab = liveTab.name;
            },
            syncInfo: function () {
                this.syncing = true;
                Apis.syncInfo().then(() => {
                    this.syncing = false;
                }).catch(error => {
                    this.syncing = false;
                })
            },
            onMenuSelect: function (name) {
                switch (name) {
                    case this.Constants.MENU.JUJU:
                    case this.Constants.MENU.MESSAGES:
                        if (!Database.isLogin()) {
                            this.$Message.warning({
                                content: '登录后才能使用'
                            });
                            return;
                        }
                        break;
                }

                Object.keys(this.menus).forEach(key => {
                    this.menus[key] = key == name;
                });
                this.activeMenu = name;
            },
            initMembers: function () {
                this.members = Database.groups().map(group => {
                    return {
                        value: group.groupId + "",
                        label: group.groupName,
                        children: group.teams.map(team => {
                            return {
                                value: team.teamId + "",
                                label: team.teamName,
                                children: team.members.map(member => {
                                    return {
                                        value: member.userId + "",
                                        label: `${member.realName}(${member.abbr})`
                                    }
                                })
                            }
                        })
                    }
                });

                this.teams = Database.groups().map(group => {
                    return {
                        value: group.groupId + "",
                        label: group.groupName,
                        children: group.teams.map(team => {
                            return {
                                value: team.teamId + "",
                                label: team.teamName
                            }
                        })
                    }
                });

                this.groups = Database.groups().map(group => {
                    return {
                        value: group.groupId + "",
                        label: group.groupName
                    }
                });
            },
            imUserInfo: function () {
                if (Database.getToken() != '' && Database.getAccid() == null) {
                    Apis.IMUserInfo().then(content => {
                        Database.setAccid(content.accid);
                        Database.setIMPwd(content.pwd);
                    }).catch(error => {
                        Dev.error(error);
                    });
                }
            },
            checkForUpdate: function () {
                Tools.checkForUpdate().then(() => {
                    this.$Notice.info({
                        title: '检测到新版本',
                        desc: '可在【设置】菜单中打开下载页面'
                    });
                }).catch(error => {

                });
            },
            registerEvent: function () {
                this.$eventBus.$on(this.Constants.EVENT.LIVE_OPEN, item => {
                    this.openLive(item);
                });
            }
        }
    }
</script>

<style scoped>

</style>

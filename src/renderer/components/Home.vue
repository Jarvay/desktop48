<template>
    <div class="layout">
        <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
            <TabPane label="Home" :closable="homeClosable">
                <Layout>
                    <Sider hide-trigger width="120">
                        <Menu :active-name="Constants.MENU.LIVES" theme="dark" width="auto" @on-select="onMenuSelect">
                            <MenuItem :name="Constants.MENU.LIVES">直播</MenuItem>
                            <MenuItem :name="Constants.MENU.REVIEWS">回放</MenuItem>
                            <MenuItem :name="Constants.MENU.ME">我的</MenuItem>
                            <MenuItem :name="Constants.MENU.SETTINGS">设置</MenuItem>
                        </Menu>
                    </Sider>

                    <Layout>
                        <Content style="padding: 8px 16px;min-height: 600px;">
                            <Card>
                                <div>
                                    <Lives ref="lives" v-show="menuShow.lives" :col="colNum"
                                           @on-item-click="openLive"></Lives>

                                    <Reviews ref="reviews" v-show="menuShow.reviews" :col="colNum"
                                             @on-item-click="openLive"
                                             :members="members"></Reviews>

                                    <Account v-show="menuShow.settings"></Account>
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

        <Drawer title="个人信息" closable v-model="userInfoShow">
            <Account></Account>
        </Drawer>
    </div>
</template>

<script>
    import Live from "./Live";
    import Apis from "../assets/js/apis";
    import Constants from "../assets/js/constants";
    import Reviews from "./Reviews";
    import Lives from "./Lives";
    import Account from "./Account";
    import Database from "../assets/js/database";

    export default {
        name: 'Home',
        components: {Account, Lives, Reviews, Live},
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
                    settings: false
                },
                activeMenu: this.Constants.MENU.LIVES,
                members: [],
                userInfoShow: false
            }
        },
        created: async function () {
            await this.initMembers();

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
                let typeText = item.liveType == 1 ? '视频' : '电台';
                typeText = this.isReview ? `${typeText}回放` : `${typeText}直播`;
                const liveTab = {
                    label: `${item.userInfo.nickname}的${typeText}`,
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
                    console.error(error);
                    this.syncing = false;
                })
            },
            onLiveReachBottom: function () {
                return new Promise(resolve => {
                    this.getLiveList(this.liveNext);
                    resolve();
                });
            },
            onReviewReachBottom: function () {
                return new Promise(resolve => {
                    this.getReviewList(this.reviewNext);
                    resolve();
                });
            },
            showListEndTips: function () {
                this.$Notice.info({
                    title: '没有更多了'
                })
            },
            onMenuSelect: function (name) {
                switch (name) {
                    case Constants.MENU.LIVES:
                        this.menuShow.lives = true;
                        this.menuShow.reviews = false;
                        this.menuShow.settings = false;
                        break;
                    case Constants.MENU.REVIEWS:
                        this.menuShow.lives = false;
                        this.menuShow.reviews = true;
                        this.menuShow.settings = false;
                        break;
                    case Constants.MENU.ME:
                        this.userInfoShow = true;
                        break;
                    case Constants.MENU.SETTINGS:
                        this.menuShow.lives = false;
                        this.menuShow.reviews = false;
                        this.menuShow.settings = true;
                        break;
                    default:
                        break;
                }

                this.activeMenu = name;
            },
            initMembers: async function () {
                if (!Database.db().has('members').value()) {
                    await Apis.syncInfo();
                }

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
            }
        }
    }
</script>

<style scoped>

</style>

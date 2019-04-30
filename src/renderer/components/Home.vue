<template>
    <div class="layout">
        <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
            <TabPane label="Home" :closable="homeClosable">
                <Layout>
                    <Sider hide-trigger width="120">
                        <Menu :active-name="Constants.MENU.LIVE" theme="dark" width="auto" @on-select="onMenuSelect">
                            <MenuItem :name="Constants.MENU.LIVE">直播</MenuItem>
                            <MenuItem :name="Constants.MENU.REVIEW">回放</MenuItem>
                        </Menu>
                    </Sider>

                    <Layout>
                        <Content style="padding: 8px 16px;min-height: 600px;">
                            <Card>
                                <div>
                                    <Lives ref="lives" v-show="liveShow" :col="colNum"
                                           @on-item-click="openLive"></Lives>

                                    <Reviews ref="reviews" v-show="reviewShow" :col="colNum"
                                             @on-item-click="openLive"
                                             :members="members"></Reviews>
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

    export default {
        name: 'Home',
        components: {Lives, Reviews, Live},
        data() {
            return {
                homeClosable: false,
                liveTabs: [],
                activeTab: 0,
                syncing: false,
                colNum: 8,
                liveShow: true,
                reviewShow: false,
                activeMenu: this.Constants.MENU.LIVE,
                members: []
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
                const typeText = item.liveType == 1 ? '直播视频' : '直播电台';
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
                    case Constants.MENU.LIVE:
                        this.liveShow = true;
                        this.reviewShow = false;
                        break;
                    case Constants.MENU.REVIEW:
                        this.reviewShow = true;
                        this.liveShow = false;
                        break;
                    default:
                        break;
                }
                this.activeMenu = name;
            },
            initMembers: async function () {
                if (!Apis.db().has('members').value()) {
                    await Apis.syncInfo();
                }

                this.members = Apis.groups().map(group => {
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

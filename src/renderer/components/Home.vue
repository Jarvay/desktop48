<template>
    <div class="layout">
        <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
            <TabPane label="Home" :closable="homeClosable">
                <Layout>
                    <Spin size="large" fix v-if="spinShow"></Spin>

                    <Header class="header">
                        <div>
                            <Cascader filterable="" class="cascader" placeholder="请选择成员"
                                      :data="members"
                                      v-model="selectedUser"></Cascader>

                            <Button type="primary" @click="refresh">搜索</Button>
                        </div>

                        <Button :loading="syncing" @click="syncInfo">同步成员信息</Button>

                    </Header>

                    <Layout>
                        <Sider style="background-color: white;" hide-trigger width="120">
                            <Menu active-name="1" theme="light" width="auto" @on-select="onMenuSelect">
                                <MenuItem :name="Constants.MENU.LIVE">直播</MenuItem>
                                <MenuItem :name="Constants.MENU.REVIEW">回放</MenuItem>
                            </Menu>
                        </Sider>

                        <Content style="padding: 8px 16px;min-height: 600px;">
                            <Card>
                                <div>
                                    <div v-show="liveShow">
                                        <Card v-if="liveList.length == 0"
                                              style="margin-bottom:8px">
                                            <p slot="title">当前没有直播</p>
                                        </Card>

                                        <Scroll :on-reach-bottom="onLiveReachBottom" height="720"
                                                :distance-to-edge="distance" v-else>
                                            <Row v-for="index in Math.ceil(liveList.length / colNum)"
                                                 :key="index">
                                                <Col style="padding: 4px;" span="4"
                                                     v-for="(item, i) in liveList"
                                                     v-if="i <  index * colNum && i >= (index - 1) * colNum"
                                                     :key="item.liveId">
                                                    <div class="live-card" @click="openLive(item)">
                                                        <Card>
                                                            <p slot="title">{{item.title}}</p>

                                                            <div class="cover-container">
                                                                <img ref="cover" class="cover" :src="item.cover">
                                                            </div>
                                                            <p class="live-date">{{item.date}}</p>
                                                            <div style="display: flex;justify-content: space-between;">
                                                                <div class="member-info">
                                                                    <span style="color: #000;">{{item.userInfo.nickname}}</span>
                                                                    <span class="team-badge"
                                                                          :style="{'background-color':`#${item.member.team.teamColor}`}">{{item.member.team.teamName.replace('TEAM ', '')}}</span>
                                                                </div>
                                                                <span v-if="item.liveType == 1">直播</span>
                                                                <span v-else>电台</span>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Scroll>
                                    </div>

                                    <div v-show="reviewShow">
                                        <Scroll :on-reach-bottom="onReviewReachBottom" height="720"
                                                :distance-to-edge="distance">
                                            <Row v-for="index in Math.ceil(reviewList.length / colNum)"
                                                 :key="index">
                                                <Col style="padding: 4px;" span="3"
                                                     v-for="(item, i) in reviewList"
                                                     v-if="i <  index * colNum && i >= (index - 1) * colNum"
                                                     :key="item.liveId">
                                                    <div class="live-card" @click="openLive(item)">
                                                        <Card>
                                                            <p slot="title">{{item.title}}</p>

                                                            <div class="cover-container">
                                                                <img ref="cover" class="cover" :src="item.cover">
                                                            </div>
                                                            <p class="live-date">{{item.date}}</p>
                                                            <div class="live-info">
                                                                <div class="member-info">
                                                                    <span style="color: #000;">{{item.userInfo.nickname}}</span>
                                                                    <span class="team-badge"
                                                                          :style="{'background-color':`#${item.member.team.teamColor}`}">{{item.member.team.teamName.replace('TEAM ', '')}}</span>
                                                                </div>
                                                                <span v-if="item.liveType == 1">直播</span>
                                                                <span v-else>电台</span>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Scroll>
                                    </div>
                                </div>
                            </Card>
                        </Content>

                    </Layout>
                </Layout>
            </TabPane>

            <TabPane v-for="liveTab in liveTabs" :label="liveTab.label" v-if="liveTab.show"
                     :name="liveTab.name">
                <Live :live-id="liveTab.liveId" :start-time="liveTab.startTime" :title="liveTab.title"></Live>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import Tools from "../assets/js/tools";
    import Live from "./Live";
    import Apis from "../assets/js/apis";
    import Constants from "../assets/js/constants";

    export default {
        name: 'Home',
        components: {Live},
        data() {
            return {
                spinShow: true,
                liveList: [],
                reviewList: [],
                currentLiveList: [],
                currentReviewList: [],
                coverWidth: -1,
                pageSize: 16,
                members: [],
                pageCount: 5,
                liveTotal: 0,
                reviewTotal: 0,
                livePage: 1,
                reviewPage: 1,
                homeClosable: false,
                liveTabs: [],
                activeTab: 0,
                syncing: false,
                liveNext: '0',
                reviewNext: '0',
                distance: -10,
                selectedUser: [],
                liveShow: true,
                reviewShow: false,
                colNum: 8
            }
        },
        created: async function () {
            if (!Apis.db().has('members').value()) {
                await Apis.syncInfo();
            }

            this.members = Apis.groups().map(group => {
                return {
                    value: group.groupId,
                    label: group.groupName,
                    children: group.teams.map(team => {
                        return {
                            value: team.teamId,
                            label: team.teamName,
                            children: team.members.map(member => {
                                return {
                                    value: member.userId,
                                    label: member.realName
                                }
                            })
                        }
                    })
                }
            });

            this.getLiveList();
            this.getReviewList();
        },
        updated: function () {
            this.reSize();
        },
        mounted: function () {
            window.onresize = () => {
                this.reSize();
            };
        },
        methods: {
            getLiveList: function () {
                this.spinShow = true;

                Apis.lives(this.selectedUser[2], this.liveNext).then((responseBody) => {
                    this.spinShow = false;
                    if (this.liveNext == responseBody.content.next && this.liveNext != '0') {
                        this.showListEndTips();
                        return;
                    }

                    this.liveNext = responseBody.content.next;
                    const newList = responseBody.content.liveList.map(item => {
                        item.cover = Tools.pictureUrls(item.coverPath);
                        item.date = new Date(parseInt(item.ctime)).format('yyyy-MM-dd hh:mm');
                        item.userInfo.teamLogo = Tools.pictureUrls(item.userInfo.teamLogo);
                        item.isReview = false;
                        item.member = Apis.member(item.userInfo.userId);
                        return item;
                    });
                    this.liveList = this.liveList.concat(newList);
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            getReviewList: function () {
                Apis.reviews(this.selectedUser[2], this.reviewNext).then(responseBody => {
                    console.log('reviews', responseBody);
                    this.spinShow = false;
                    if (this.reviewNext == responseBody.content.next) {
                        this.showListEndTips();
                        return;
                    }

                    this.reviewNext = responseBody.content.next;
                    const newList = responseBody.content.liveList.map(item => {
                        item.cover = Tools.pictureUrls(item.coverPath);
                        item.date = new Date(parseInt(item.ctime)).format('yyyy-MM-dd hh:mm');
                        item.userInfo.teamLogo = Tools.pictureUrls(item.userInfo.teamLogo);
                        item.isReview = false;
                        item.member = Apis.member(item.userInfo.userId);
                        return item;
                    });
                    this.reviewList = this.reviewList.concat(newList);
                    console.log(this.reviewList);
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            refresh: function () {
                this.liveNext = "0";
                this.reviewNext = "0";

                this.liveList = [];
                this.reviewList = [];

                this.getLiveList();
                this.getReviewList();
            },
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
            reSize: function () {
                if (this.$refs.cover) {
                    if (this.coverWidth == -1) {
                        this.coverWidth = this.$refs.cover[0].offsetWidth;
                    }

                    this.$refs.cover.forEach(item => {
                        item.style.height = this.coverWidth + 'px';
                    });
                }
            },
            syncInfo: function () {
                this.syncing = true;
                Apis.syncInfo().then(() => {
                    this.syncing = false;
                }).catch(error => {
                    console.log(error);
                    this.syncing = false;
                })
            },
            changePlayer: function (newPlayer, liveId) {
                const index = this.liveTabs.findIndex(tab => {
                    return tab.liveId == liveId && tab.show;
                });

                this.liveTabs[index].type = newPlayer;
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
            }
        }
    }
</script>

<style scoped>
    .cover-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .cover {
        width: 180px;
        height: 180px !important;
    }

    .layout-footer-center {
        text-align: center;
    }

    .cascader {
        display: inline-flex;
        min-width: 240px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .ivu-layout-header {
        padding: 0 32px;
    }

    .live-card {
        cursor: pointer;
    }

    .live-info {
        display: flex;
        justify-content: space-between;
    }

    .member-info {
        display: flex;
        align-items: center;
    }

    .member-info > span {
        font-size: 13px;
    }

    .live-date {
        margin-top: 4px;
        color: #cccccc;
        font-size: 13px;
    }
</style>

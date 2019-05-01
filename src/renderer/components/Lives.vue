<template>
    <Layout>
        <Header class="header">
            <div>
                <Button type="primary" @click="refresh">刷新</Button>
            </div>
        </Header>
        <Content>
            <div>
                <Spin size="large" fix v-if="liveSpinShow"></Spin>

                <Card v-if="liveList.length == 0"
                      style="margin-bottom:8px">
                    <p slot="title">当前没有直播</p>
                </Card>

                <Scroll :on-reach-bottom="onLiveReachBottom" height="720"
                        :distance-to-edge="distance" v-else>
                    <Row v-for="index in Math.ceil(liveList.length / col)"
                         :key="index">
                        <Col style="padding: 4px;" span="3"
                             v-for="(item, i) in liveList"
                             v-if="i <  index * col && i >= (index - 1) * col"
                             :key="item.liveId">
                            <div class="live-card" @click="onItemClick(item)">
                                <Card>
                                    <p slot="title" class="live-title">
                                        <span>{{item.title}}</span>
                                    </p>

                                    <p slot="extra">
                                        <Tag v-if="item.liveType == 1" color="purple">直播</Tag>
                                        <Tag v-else color="orange">电台</Tag>
                                    </p>

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
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Scroll>
            </div>
        </Content>
    </Layout>
</template>

<script>
    import Apis from '../assets/js/apis';
    import Tools from '../assets/js/tools';
    import Database from "../assets/js/database";

    export default {
        name: "Lives",
        props: {
            col: {
                type: Number,
                required: true
            }
        },
        data() {
            return {
                liveSpinShow: true,
                liveList: [],
                liveNext: '0',
                distance: -10
            }
        },
        created() {

        },
        methods: {
            getLiveList: function () {
                this.liveSpinShow = true;

                Apis.lives("0", this.liveNext).then((responseBody) => {
                    this.liveSpinShow = false;
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
                        item.member = Database.member(item.userInfo.userId);
                        return item;
                    });
                    this.liveList = this.liveList.concat(newList);
                }).catch(error => {
                    this.liveSpinShow = false;
                    console.error(error);
                });
            },
            refresh: function () {
                this.liveNext = "0";
                this.liveList = [];
                this.getLiveList();
            },
            onLiveReachBottom: function () {
                return new Promise(resolve => {
                    this.getLiveList(this.liveNext);
                    resolve();
                });
            },
            showListEndTips: function () {
                this.$Notice.info({
                    title: '没有更多了'
                })
            },
            onItemClick: function (item) {
                this.$emit('on-item-click', item);
            }
        }
    }
</script>

<style scoped>

</style>
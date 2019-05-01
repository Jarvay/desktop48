<template>
    <Layout>
        <Header class="header">
            <div>
                <Cascader transfer
                          filterable="" class="cascader" placeholder="请选择成员"
                          :data="members"
                          v-model="selectedUser"></Cascader>

                <Button type="primary" @click="refresh">刷新</Button>
            </div>
        </Header>

        <Content>
            <div>
                <Spin size="large" fix v-if="reviewSpinShow"></Spin>

                <Scroll :on-reach-bottom="onReviewReachBottom" height="720"
                        :distance-to-edge="distance">
                    <Row v-for="index in Math.ceil(reviewList.length / col)"
                         :key="index">
                        <Col style="padding: 4px;" span="3"
                             v-for="(item, i) in reviewList"
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
                                    <div class="live-info">
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
        name: "Reviews",
        props: {
            col: {
                type: Number,
                required: true
            },
            members: {
                type: Array,
                required: true
            }
        },
        data() {
            return {
                reviewSpinShow: true,
                reviewList: [],
                reviewNext: '0',
                distance: -10,
                selectedUser: [],
            }
        },
        created() {

        },
        methods: {
            getReviewList: function () {
                this.reviewSpinShow = true;

                Apis.reviews(this.selectedUser[2], this.reviewNext).then(responseBody => {
                    this.reviewSpinShow = false;
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
                        item.member = Database.member(item.userInfo.userId);
                        return item;
                    });
                    this.reviewList = this.reviewList.concat(newList);
                }).catch(error => {
                    this.reviewSpinShow = false;
                    console.error(error);
                });
            },
            refresh: function () {
                this.reviewNext = "0";
                this.reviewList = [];
                this.getReviewList();
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
            onItemClick: function (item) {
                this.$emit('on-item-click', item);
            },
        }
    }
</script>

<style scoped>
    .cascader {
        display: inline-flex;
        min-width: 240px;
    }
</style>
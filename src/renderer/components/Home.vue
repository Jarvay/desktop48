<template>
    <div class="layout">
        <Spin size="large" fix v-if="spinShow"></Spin>

        <Tabs type="card" closable @on-tab-remove="handleTabRemove" :value="activeTab">
            <TabPane label="Home" :closable="homeClosable">
                <Layout>
                    <Header class="header">
                        <div>
                            <Cascader filterable="" class="cascader" placeholder="请选择成员" :data="members"
                                    v-model="selectedMember"></Cascader>

                            <span style="margin-left:16px;color:white;">获取条数</span>

                            <Tooltip content="最大值：4800" placement="bottom">
                                <InputNumber style="margin-left:8px;" :max="4800" :min="1" :step="160" v-model="limit"></InputNumber>
                            </Tooltip>

                            <Button type="primary" @click="getList">搜索</Button>
                        </div>

                        <Button :loading="syncing" @click="syncInfo">同步成员信息</Button>
                    </Header>
                    <Content style="padding: 8px 32px;">
                        <Card>
                            <div style="min-height: 200px;">
                                <Tabs type="card">
                                    <TabPane label="直播">
                                        <Card v-if="currentLiveList.length === 0" style="margin-bottom:8px">
                                            <p slot="title">当前没有直播</p>
                                        </Card>

                                        <Row v-for="index in Math.ceil(currentLiveList.length / 8)"
                                                :key="index">
                                            <Col style="padding: 4px;" span="3" v-for="(item, i) in currentLiveList"
                                                    v-if="i <  index * 8 && i >= (index - 1) * 8" :key="item.liveId">
                                                <div  @click="openLive(item)">
                                                    <Card>
                                                        <p slot="title">{{item.subTitle}}</p>

                                                        <img ref="cover" class="cover" :src="item.cover">
                                                        <p style="color:#ccc;">{{item.date}}</p>
                                                        <div style="display: flex;justify-content: space-between;">
                                                            <div>
                                                                <span style="color: #000;">{{item.member
                                                                    .real_name}}</span>
                                                                <span class="team-badge"
                                                                        :style="{'background-color':'#' +
                                                                        item.member.teamObj.color}">{{item.member.teamObj.team_name}}</span>
                                                            </div>
                                                            <span v-if="item.liveType == 1">直播</span>
                                                            <span v-else>电台</span>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Page :current="livePage" :total="liveTotal" :page-size="pageSize" size="small"
                                                show-total
                                                @on-change="onLivePageChange"></Page>
                                    </TabPane>

                                    <TabPane label="回放">
                                        <Row v-for="index in Math.ceil(currentReviewList.length / 8)"
                                                :key="index">
                                            <Col style="padding: 4px;" span="3" v-for="(item, i) in currentReviewList"
                                                    v-if="i <  index * 8 && i >= (index - 1) * 8" :key="item.liveId">
                                                <div @click="openLive(item)">
                                                    <Card>
                                                        <p slot="title">{{item.subTitle}}</p>

                                                        <img ref="cover" class="cover" :src="item.cover">
                                                        <p style="color:#ccc;">{{item.date}}</p>
                                                        <div style="display: flex;justify-content: space-between;">
                                                            <div>
                                                                <span style="color: #000;">{{item.member
                                                                    .real_name}}</span>
                                                                <span class="team-badge"
                                                                        :style="{'background-color':'#' +
                                                                        item.member.teamObj.color}">
                                                            {{item.member.teamObj.team_name}}</span>
                                                            </div>
                                                            <span v-if="item.liveType == 1">直播</span>
                                                            <span v-else>电台</span>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Page :current="reviewPage" :total="reviewTotal" :page-size="pageSize" size="small"
                                                show-total
                                                @on-change="onReviewPageChange"></Page>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </Card>
                    </Content>
                    <Footer class="layout-footer-center">2018 &copy; Jarvay 超绝可爱黄婷婷</Footer>
                </Layout>
            </TabPane>

            <TabPane v-for="liveTab in liveTabs" :label="liveTab.title">
                <FlvJs v-if="liveTab.type == 'flvjs'" :liveId="liveTab.id" @change-player="changePlayer"></FlvJs>
                <VideoJs v-else-if="liveTab.type == 'videojs'" :liveId="liveTab.id"
                        @change-player="changePlayer"></VideoJs>
            </TabPane>
        </Tabs>
    </div>
</template>

<script>
    import Tools from "../assets/js/tools";
    import FlvJs from "./FlvJs";
    import VideoJs from "./VideoJs";
    import LiveApi from "../assets/js/live-api";

    const VIDEO_JS = 'videojs';
    const FLV_JS = 'flvjs';

    export default {
        name:'Home',
        components:{VideoJs, FlvJs},
        data(){
            return {
                spinShow:true,
                liveList:[],
                reviewList:[],
                currentLiveList:[],
                currentReviewList:[],
                coverWidth:-1,
                pageSize:16,
                members:[],
                selectedMember:[],
                limit:80,
                liveTotal:0,
                reviewTotal:0,
                livePage:1,
                reviewPage:1,
                homeClosable:false,
                liveTabs:[],
                activeTab:0,
                syncing:false,
            }
        },
        created:async function(){
            if(!LiveApi.db().has('members').value()){
                await LiveApi.syncInfo();
            }

            this.getList();

            this.members = LiveApi.groups().map(group => {
                return {
                    value:group.group_id,
                    label:group.group_name,
                    children:group.teams.map(team => {
                        return {
                            value:team.team_id,
                            label:team.team_name,
                            children:team.members.map(member => {
                                return {
                                    value:member.member_id,
                                    label:member.real_name
                                }
                            })
                        }
                    })
                }
            });

        },
        updated:function(){
            this.reSize();
        },
        mounted:function(){
            window.onresize = () => {
                this.reSize();
            };
        },
        methods:{
            getList:function(){
                this.spinShow = true;

                LiveApi.lives(this.selectedMember[2], this.limit).then((responseBody) => {
                    console.log('getList', responseBody.content);
                    this.liveList = responseBody.content.liveList.map(item => {
                        item.cover = Tools.pictureUrls(item.picPath)[0];
                        item.date = new Date(item.startTime).format('yyyy-MM-dd hh:mm');
                        item.member = LiveApi.member(item.memberId);
                        item.member.teamObj.team_name = item.member.teamObj.team_name.replace('TEAM ', '');
                        return item;
                    });
                    this.liveTotal = this.liveList.length;

                    this.reviewList = responseBody.content.reviewList.map(item => {
                        item.cover = Tools.pictureUrls(item.picPath)[0];
                        item.date = new Date(item.startTime).format('yyyy-MM-dd hh:mm');
                        item.member = LiveApi.member(item.memberId);
                        item.member.teamObj.team_name = item.member.teamObj.team_name.replace('TEAM ', '');
                        return item;
                    });

                    this.reviewTotal = this.reviewList.length;

                    this.onLivePageChange(1);
                    this.onReviewPageChange(1);
                    this.spinShow = false;
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            onLivePageChange:function(page){
                this.livePage = page;
                const start = (page - 1) * this.pageSize;
                this.currentLiveList = this.liveList.slice(start, start + this.pageSize);
            },
            onReviewPageChange:function(page){
                this.reviewPage = page;
                const start = (page - 1) * this.pageSize;
                this.currentReviewList = this.reviewList.slice(start, start + this.pageSize);
            },
            getType:function(item){
                if(item.streamPath.includes('.flv') || item.streamPath.includes('.mp4')){
                    return FLV_JS;
                }else if(item.streamPath.includes('.m3u8')){
                    return VIDEO_JS;
                }else{
                    return '';
                }
            },
            handleTabRemove:function(index){
                this.liveTabs.splice(index - 1, 1);
                this.activeTab = index - 1;
            },
            openLive:function(item){
                this.liveTabs.push({
                    title:item.title.replace('（回放生成中）', ''),
                    type:this.getType(item),
                    id:item.liveId
                });
                this.activeTab = this.liveTabs.length;
            },
            reSize:function(){
                if(this.$refs.cover){
                    if(this.coverWidth == -1){
                        this.coverWidth = this.$refs.cover[0].offsetWidth;
                    }

                    this.$refs.cover.forEach(item => {
                        item.style.height = this.coverWidth + 'px';
                    });
                }
            },
            syncInfo:function(){
                this.syncing = true;
                LiveApi.syncInfo().then(() => {
                    this.syncing = false;
                    this.getList();
                }).catch(error => {
                    this.syncing = false;
                })
            },
            changePlayer:function(newPlayer, liveId){
                console.log('change-player', liveId);
                const index = this.liveTabs.findIndex(tab => {
                    return tab.id == liveId;
                });

                this.liveTabs[index].type = newPlayer;
            }
        }
    }
</script>

<style scoped>
    .cover {
        width: 100%;
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
</style>

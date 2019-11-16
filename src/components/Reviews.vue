<template>
    <div>
        <el-tabs v-model="activeName" closable type="card" @tab-remove="onTabRemove">
            <el-tab-pane :closable="false" label="列表" name="Home">
                <el-container>
                    <el-header class="header-box">
                        <el-select style="width: 100px;" v-model="reviewScreen">
                            <el-option :value="Constants.REVIEW_SCREEN.USER" label="成员"></el-option>
                            <el-option :value="Constants.REVIEW_SCREEN.TEAM" label="队伍"></el-option>
                            <el-option :value="Constants.REVIEW_SCREEN.GROUP"
                                       label="分团"></el-option>
                        </el-select>

                        <div style="margin-left: 8px;">
                            <el-cascader transfer
                                         v-if="reviewScreen === Constants.REVIEW_SCREEN.USER"
                                         style="width: 320px;"
                                         clearable
                                         placeholder="请选择成员"
                                         filterable
                                         :options="members"
                                         v-model="selectedUser"></el-cascader>

                            <el-cascader transfer
                                         v-if="reviewScreen === Constants.REVIEW_SCREEN.TEAM"
                                         placeholder="请选择队伍"
                                         clearable
                                         filterable
                                         :options="teams"
                                         v-model="selectedTeam"></el-cascader>

                            <el-cascader transfer
                                         v-if="reviewScreen === Constants.REVIEW_SCREEN.GROUP"
                                         placeholder="请选择分团"
                                         clearable
                                         filterable
                                         :options="groups"
                                         v-model="selectedGroup"></el-cascader>
                        </div>
                        <el-button style="margin-left: 8px;" type="primary" @click="refresh">刷新
                        </el-button>
                    </el-header>

                    <el-main v-loading="loading" style="overflow: auto;height: 780px;"
                             v-infinite-scroll="getReviewList"
                             :infinite-scroll-disabled="disabled">
                        <el-row v-for="(items, index) in listAfterHandle"
                                :key="index" :gutter="10">
                            <el-col :span="Constants.LIST_SPAN_TOTAL / Constants.LIST_COL"
                                    v-for="item in items"
                                    :key="item.liveId">
                                <div @click="onReviewClick(item)">
                                    <live-item :item="item" slot="reference"></live-item>
                                </div>
                            </el-col>
                        </el-row>
                    </el-main>
                </el-container>
            </el-tab-pane>

            <el-tab-pane v-for="(liveTab, index) in liveTabs" :label="liveTab.label"
                         :key="index"
                         :name="liveTab.name">
                <review :index="index" :live-id="liveTab.liveId" :start-time="liveTab.startTime"
                        :live-title="liveTab.title"></review>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
    import {Component, Vue, Watch} from 'vue-property-decorator';
    import Apis from '@/assets/js/apis';
    import Tools from '@/assets/js/tools';
    import Database from '@/assets/js/database';
    import Constants from '@/assets/js/constants';
    import LiveItem from '@/components/LiveItem.vue';
    import Review from '@/components/Review.vue';
    import {store} from "@/assets/js/store";

    @Component({
        components: {Review, LiveItem}
    })
    export default class Reviews extends Vue {
        //顶部tabs
        protected activeName: string = 'Home';
        protected liveTabs: any[] = [];

        protected reviewList: any[][] = [];
        protected reviewNext: string = '0';
        protected loading: boolean = false;
        protected noMore: boolean = false;
        protected reviewScreen: string = Constants.REVIEW_SCREEN.USER;
        protected members: any = store.memberOptions;
        protected teams: any = store.teamOptions;
        protected groups: any = store.groupOptions;
        protected selectedUser: any[] = [];
        protected selectedTeam: any[] = [];
        protected selectedGroup: any[] = [];

        @Watch('listAfterHandle')
        protected onListAfterHandleChange(newValue: any[]) {
            if (newValue.length < Constants.MIN_SHOWN_LIVE_COUNT && newValue.length !== 0) {
                this.getReviewList();
            }
        }

        get disabled() {
            return this.loading || this.noMore;
        }

        get listAfterHandle() {
            const list = this.reviewList.filter((item: any) => {
                return !store.hiddenMemberIds.some((memberId: number) => item.userInfo.userId == memberId);
            });

            const rowCount = Math.ceil(list.length / Constants.LIST_COL);
            const data: any[] = [];
            for (let i = 0; i < rowCount; i++) {
                data[i] = list.slice(i * Constants.LIST_COL, (i + 1) * Constants.LIST_COL - 1);
            }
            return data;
        }

        public getReviewList() {
            let params: {
                userId: string,
                teamId: string,
                groupId: string,
                next: string
            } = {
                userId: '0',
                teamId: '0',
                groupId: '0',
                next: this.reviewNext
            };
            switch (this.reviewScreen) {
                case Constants.REVIEW_SCREEN.USER:
                    params.userId = this.selectedUser[2];
                    break;
                case Constants.REVIEW_SCREEN.TEAM:
                    params.teamId = this.selectedTeam[1];
                    break;
                case Constants.REVIEW_SCREEN.GROUP:
                    params.groupId = this.selectedGroup[0];
                    break;
                default:
                    break;
            }
            params.next = this.reviewNext;
            this.loading = true;
            Apis.instance().reviews(params).then((content: any) => {
                if (this.noMore) {
                    this.$message({
                        message: '加载完毕',
                        type: 'info'
                    });
                    this.noMore = true;
                    return;
                }
                if (content.next == '0') {
                    this.noMore = true;
                }
                this.reviewNext = content.next;
                content.liveList.forEach((item: any, index: number) => {
                    item.cover = Tools.pictureUrls(item.coverPath);
                    item.userInfo.teamLogo = Tools.pictureUrls(item.userInfo.teamLogo);
                    item.isReview = true;
                    item.member = Database.instance().member(item.userInfo.userId);
                    item.date = Tools.dateFormat(parseFloat(item.ctime), 'yyyy-MM-dd hh:mm:ss');
                    this.reviewList.push(item);
                });
                console.log('reviewList', this.reviewList);
                this.loading = false;
            }).catch((error: any) => {
                console.info(error);
                this.loading = false;
            });
        }

        protected refresh() {
            this.reviewList = [];
            this.reviewNext = '0';
            this.noMore = false;
            this.getReviewList();
        }

        /**
         * 打开回放
         * @param item
         */
        protected onReviewClick(item: any) {
            const exists = this.liveTabs.some((tab: any) => {
                return tab.liveId === item.liveId;
            });
            if (exists) {
                return;
            }
            const liveTab = {
                label: `${item.userInfo.nickname}的直播间`,
                title: item.title,
                liveId: item.liveId,
                name: item.liveId + '_' + Math.random().toString(36).substr(2),
                startTime: parseInt(item.ctime)
            };
            console.log(liveTab);
            this.liveTabs.push(liveTab);
            this.activeName = liveTab.name;
        }

        /**
         * 移除tab
         * @param targetName
         */
        protected onTabRemove(targetName: string) {
            this.activeName = 'Home';
            this.liveTabs = this.liveTabs.filter((tab: any) => {
                return tab.name != targetName;
            });
        }
    }
</script>

<style scoped lang="scss">
    .el-card__header {
        padding: 0 8px;
    }
</style>

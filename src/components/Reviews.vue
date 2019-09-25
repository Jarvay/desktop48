<template>
    <el-container v-loading="loading">
        <el-header class="header-box">
            <el-select style="width: 100px;" v-model="reviewScreen">
                <el-option :value="Constants.REVIEW_SCREEN.USER" label="成员"></el-option>
                <el-option :value="Constants.REVIEW_SCREEN.TEAM" label="队伍"></el-option>
                <el-option :value="Constants.REVIEW_SCREEN.GROUP" label="分团"></el-option>
            </el-select>

            <div style="margin-left: 8px;">
                <el-cascader transfer v-if="reviewScreen === Constants.REVIEW_SCREEN.USER"
                             style="width: 320px;"
                             clearable
                             placeholder="请选择成员"
                             filterable
                             :options="members"
                             v-model="selectedUser"></el-cascader>

                <el-cascader transfer v-if="reviewScreen === Constants.REVIEW_SCREEN.TEAM"
                             placeholder="请选择队伍"
                             clearable
                             filterable
                             :options="teams"
                             v-model="selectedTeam"></el-cascader>

                <el-cascader transfer v-if="reviewScreen === Constants.REVIEW_SCREEN.GROUP"
                             placeholder="请选择分团"
                             clearable
                             filterable
                             :options="groups"
                             v-model="selectedGroup"></el-cascader>
            </div>
            <el-button style="margin-left: 8px;" type="primary" @click="refresh">刷新</el-button>
        </el-header>

        <el-main style="overflow: auto;height: 800px;" v-infinite-scroll="getReviewList"
                 :infinite-scroll-disabled="disabled">
            <el-row v-for="index in Math.ceil(reviewList.length / Constants.LIST_COL)"
                    :key="index" :gutter="10">
                <el-col :span="Constants.LIST_SPAN_TOTAL / Constants.LIST_COL"
                        v-for="(item, i) in reviewList"
                        v-if="i <  index * Constants.LIST_COL && i >= (index - 1) * Constants.LIST_COL"
                        :key="item.liveId">
                    <div @click="onReviewClick(item)">
                        <live-item :item="item"></live-item>
                    </div>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Emit, Vue, Watch} from 'vue-property-decorator';
    import Apis from '@/assets/js/apis';
    import Tools from '@/assets/js/tools';
    import Database from '@/assets/js/database';
    import Debug from '@/assets/js/debug';
    import Constants from '@/assets/js/constants';
    import ListInterface from '@/assets/js/list-interface';
    import LiveItem from '@/components/LiveItem.vue';

    @Component({
        components: {LiveItem}
    })
    export default class Reviews extends Vue implements ListInterface {
        public setVisibility(flag: boolean): void {
            this.visible = flag;
        }

        public onItemClick(item: any) {
            this.onReviewClick(item);
        }

        public created() {
            this.initMembers();
        }

        public visible: boolean = false;
        private reviewList: any[] = [];
        private reviewNext: string = '0';
        private loading: boolean = false;
        private noMore: boolean = false;
        private reviewScreen: string = Constants.REVIEW_SCREEN.USER;
        private members: any = [];
        private teams: any = [];
        private groups: any = [];
        private selectedUser: any[] = [];
        private selectedTeam: any[] = [];
        private selectedGroup: any[] = [];

        @Watch('reviewList')
        private onReviewListChange(newValue: any[]) {
            if (newValue.length < Constants.MIN_SHOWN_LIVE_COUNT)
                this.getReviewList();
        }

        get disabled() {
            return this.loading || this.noMore || !this.visible;
        }

        public getReviewList() {
            let params: any;
            switch (this.reviewScreen) {
                case Constants.REVIEW_SCREEN.USER:
                    params = {
                        userId: this.selectedUser[2],
                        teamId: '0',
                        groupId: '0'
                    };
                    break;
                case Constants.REVIEW_SCREEN.TEAM:
                    params = {
                        userId: '0',
                        teamId: this.selectedTeam[1],
                        groupId: '0'
                    };
                    break;
                case Constants.REVIEW_SCREEN.GROUP:
                    params = {
                        userId: '0',
                        teamId: '0',
                        groupId: this.selectedGroup[0]
                    };
                    break;
                default:
                    params = {
                        userId: '0',
                        teamId: '0',
                        groupId: '0'
                    };
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
                if (content.next === '0') {
                    this.noMore = true;
                }
                this.reviewNext = content.next;
                content.liveList.forEach((item: any) => {
                    item.cover = Tools.pictureUrls(item.coverPath);
                    item.userInfo.teamLogo = Tools.pictureUrls(item.userInfo.teamLogo);
                    item.isReview = true;
                    item.member = Database.instance().member(item.userInfo.userId);
                    item.date = Tools.dateFormat(parseFloat(item.ctime), 'yyyy-MM-dd hh:mm:ss');
                    const hidden = Database.instance().getHiddenMembers().some((memberId: string) => {
                        return memberId === item.userInfo.userId.toString();
                    });
                    if (!hidden) {
                        this.reviewList.push(item);
                    }
                });
                Debug.log('reviewList', this.reviewList);
                this.loading = false;
            }).catch((error: any) => {
                Debug.info(error);
                this.loading = false;
            });
        }

        private refresh() {
            this.reviewList = [];
            this.reviewNext = '0';
            this.noMore = false;
            this.getReviewList();
        }

        private initMembers() {
            this.members = Database.instance().groups().map((group: any) => {
                return {
                    value: group.groupId + '',
                    label: group.groupName,
                    children: group.teams.map((team: any) => {
                        return {
                            value: team.teamId + '',
                            label: team.teamName,
                            children: team.members.map((member: any) => {
                                return {
                                    value: member.userId + '',
                                    label: `${member.realName}(${member.abbr})`,
                                };
                            }),
                        };
                    }),
                };
            });

            Debug.log('init members', this.members);

            this.teams = Database.instance().groups().map((group: any) => {
                return {
                    value: group.groupId + '',
                    label: group.groupName,
                    children: group.teams.map((team: any) => {
                        return {
                            value: team.teamId + '',
                            label: team.teamName,
                        };
                    }),
                };
            });

            this.groups = Database.instance().groups().map((group: any) => {
                return {
                    value: group.groupId + '',
                    label: group.groupName,
                };
            });
        }

        @Emit()
        private onReviewClick(item: any) {
            return;
        }
    }
</script>

<style scoped lang="scss">
    .el-card__header {
        padding: 0 8px;
    }
</style>

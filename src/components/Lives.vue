<template>
    <el-container v-loading="loading">
        <el-header class="header-box">
            <el-button type="primary" @click="refresh">刷新</el-button>
        </el-header>

        <div style="height: 800px;" v-if="liveList.length === 0">
            <el-card style="margin-bottom:8px" shadow="hover">
                <div slot="header">当前没有直播</div>
            </el-card>
        </div>

        <el-main style="overflow: auto;height: 800px;" v-infinite-scroll="getLiveList"
                 :infinite-scroll-disabled="disabled" v-else>
            <el-row v-for="index in Math.ceil(liveList.length / Constants.LIST_COL)"
                    :key="index" :gutter="10">
                <el-col :span="Constants.LIST_SPAN_TOTAL / Constants.LIST_COL"
                        v-for="(item, i) in liveList"
                        v-if="i <  index * Constants.LIST_COL && i >= (index - 1) * Constants.LIST_COL"
                        :key="item.liveId">
                    <div @click="onItemClick(item)">
                        <live-item :item="item"></live-item>
                    </div>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Emit, Vue} from 'vue-property-decorator';
    import Apis from '@/assets/js/apis';
    import Database from '@/assets/js/database';
    import Tools from '@/assets/js/tools';
    import Debug from '@/assets/js/debug';
    import ListInterface from '@/assets/js/list-interface';
    import LiveItem from '@/components/LiveItem.vue';

    @Component({
        components: {LiveItem}
    })
    export default class Lives extends Vue implements ListInterface {
        visible: boolean = true;

        setVisibility(flag: boolean): void {
            this.visible = flag;
        }

        private liveList: any[] = [];
        private liveNext: string = '0';
        private loading: boolean = false;
        private noMore: boolean = false;

        get disabled() {
            return this.loading || this.noMore || !this.visible;
        }

        public getLiveList() {
            Apis.instance().lives(0, this.liveNext).then((content: any) => {
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
                this.liveNext = content.next;
                content.liveList.forEach((item: any) => {
                    item.cover = Tools.pictureUrls(item.coverPath);
                    item.userInfo.teamLogo = Tools.pictureUrls(item.userInfo.teamLogo);
                    item.isReview = true;
                    item.member = Database.instance().member(item.userInfo.userId);
                    item.date = Tools.dateFormat(parseInt(item.ctime), 'yyyy-MM-dd hh:mm:ss');
                    const hidden = Database.instance().getHiddenMembers().some((memberId: number) => {
                        return memberId === item.userInfo.userId;
                    });
                    if (!hidden) {
                        this.liveList.push(item);
                    }
                });
                Debug.log('liveList', this.liveList);
                this.loading = false;
            }).catch((error: any) => {
                Debug.info(error);
                this.loading = false;
            });
        }

        private refresh() {
            this.liveList = [];
            this.liveNext = '0';
            this.noMore = false;
            this.getLiveList();
        }

        onItemClick(item: any): void | any {
            this.onLiveClick(item);
        }

        @Emit()
        onLiveClick(item: any) {
        }
    }
</script>

<style scoped>

</style>

<template>
    <el-container>
        <el-header class="header-box">
            <el-button type="primary" @click="refresh">刷新</el-button>
        </el-header>

        <div style="height: 800px;" v-if="liveList.length === 0">
            <el-card style="margin-bottom:8px" shadow="hover">
                <div slot="header">当前没有直播</div>
            </el-card>
        </div>

        <el-main v-loading="loading" style="overflow: auto;height: 800px;"
                 v-infinite-scroll="getLiveList"
                 :infinite-scroll-disabled="disabled" v-else>
            <el-row v-for="(items, index) in listAfterHandle"
                    :key="index" :gutter="10">
                <el-col :span="Constants.LIST_SPAN_TOTAL / Constants.LIST_COL"
                        v-for="item in items"
                        :key="item.liveId">
                    <div style="padding: 6px 0;">
                        <el-popover placement="top" trigger="hover" :ref="`popover-${item.liveId}`">
                            <p>{{item.title}}</p>
                            <div>
                                <el-button type="danger" icon="el-icon-video-camera" size="small"
                                           @click="record(item)">录制
                                </el-button>
                                <el-button type="success" icon="el-icon-video-play" size="small"
                                           @click="play(item)">观看
                                </el-button>
                            </div>
                            <live-item :item="item" slot="reference"></live-item>
                        </el-popover>
                    </div>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Apis from '@/assets/js/apis';
    import Database from '@/assets/js/database';
    import Tools from '@/assets/js/tools';
    import LiveItem from '@/components/LiveItem.vue';
    import RecordTask from '@/assets/js/record-task';
    import EventBus from '@/assets/js/event-bus';
    import Constants from '@/assets/js/constants';
    import ChildProcess from 'child_process';
    import {store} from "@/assets/js/store";

    @Component({
        components: {LiveItem}
    })
    export default class Lives extends Vue {
        protected liveList: any[] = [];
        protected liveNext: string = '0';
        protected loading: boolean = false;
        protected noMore: boolean = false;

        get disabled() {
            return this.loading || this.noMore;
        }

        get listAfterHandle() {
            const list = this.liveList.filter((item: any) => {
                return !store.hiddenMemberIds.some((memberId: number) => item.userInfo.userId == memberId);
            });

            const rowCount = Math.ceil(list.length / Constants.LIST_COL);
            const data: any[] = [];
            for (let i = 0; i < rowCount; i++) {
                data[i] = list.slice(i * Constants.LIST_COL, (i + 1) * Constants.LIST_COL - 1);
            }
            return data;
        }

        protected getLiveList() {
            Apis.instance().lives(this.liveNext).then((content: any) => {
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
                    this.liveList.push(item);
                });
                console.log('liveList', this.liveList);
                this.loading = false;
            }).catch((error: any) => {
                console.info(error);
                this.loading = false;
            });
        }

        protected created() {
            this.getLiveList();
        }

        protected refresh() {
            this.liveList = [];
            this.liveNext = '0';
            this.noMore = false;
            this.getLiveList();
        }

        /**
         * 直播录制
         */
        protected record(item: any) {
            Apis.instance().live(item.liveId).then(content => {
                const member = Database.instance().member(content.user.userId);
                const date = Tools.dateFormat(parseInt(item.ctime), 'yyyyMMddhhmm');
                const randomNumber = parseInt((Math.random() * 100000000).toFixed());
                const filename = `${member.realName} ${date}-${randomNumber}.flv`;
                const recordTask: RecordTask = new RecordTask(content.playStreamPath, filename, content.liveId);
                EventBus.post<string>(Constants.Event.CHANGE_SELECTED_MENU, Constants.Menu.DOWNLOADS);
                this.$router.push('/downloads');
                this.$nextTick(() => {
                    EventBus.post<RecordTask>(Constants.Event.RECORD_TASK, recordTask);
                });
            }).catch(error => {
                console.error(error);
            });
        }

        /**
         * 打开直播
         */
        protected play(item: any) {
            Apis.instance().live(item.liveId).then(content => {
                const command = `"${Tools.ffplayPath()}" -window_title "${item.userInfo.nickname} ${item.title}" "${content.playStreamPath}"`;
                console.log(command);
                ChildProcess.exec(command);
            }).catch((error: any) => {
                this.$message.error(error);
                console.error(error);
            });
        }
    }
</script>

<style scoped>

</style>

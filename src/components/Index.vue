<template>
    <el-tabs v-model="activeName" closable type="card" @tab-remove="onTabRemove">
        <el-tab-pane :closable="false" label="Home" name="Home">
            <el-container>
                <el-aside style="width: 200px;">
                    <el-menu @select="onMenuSelect"
                             class="side-menu"
                             background-color="#545c64"
                             text-color="#fff"
                             active-text-color="#ffd04b"
                             :default-active="Constants.Menu.LIVES">
                        <el-menu-item :index="Constants.Menu.LIVES">直播
                        </el-menu-item>
                        <el-menu-item :index="Constants.Menu.REVIEWS">回放
                        </el-menu-item>
                        <el-menu-item :index="Constants.Menu.DOWNLOADS">下载
                        </el-menu-item>
                        <el-menu-item :index="Constants.Menu.SETTING">设置
                        </el-menu-item>
                    </el-menu>
                </el-aside>

                <el-main style="height: 900px;">
                    <lives ref="lives" v-show="menus[Constants.Menu.LIVES]" @on-record-click="record"
                           :visible="menus[Constants.Menu.LIVES]"
                           @on-play-click="play"></lives>

                    <reviews ref="reviews" v-show="menus[Constants.Menu.REVIEWS]"
                             @on-review-click="onReviewClick" @on-download-click="download"
                             :visible="menus[Constants.Menu.REVIEWS]"></reviews>

                    <downloads v-show="menus[Constants.Menu.DOWNLOADS]"></downloads>

                    <setting ref="setting" v-show="menus[Constants.Menu.SETTING]"></setting>
                </el-main>
            </el-container>
        </el-tab-pane>

        <el-tab-pane v-for="(liveTab, index) in liveTabs" :label="liveTab.label" :name="liveTab.name" lazy>
            <review :index="index" :live-id="liveTab.liveId" :start-time="liveTab.startTime"
                    :live-title="liveTab.title"></review>
        </el-tab-pane>
    </el-tabs>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Lives from '@/components/Lives.vue';
    import Reviews from '@/components/Reviews.vue';
    import Constants from '@/assets/js/constants';
    import Debug from '@/assets/js/debug';
    import Tools from '@/assets/js/tools';
    import Apis from '@/assets/js/apis';
    import Review from '@/components/Review.vue';
    import Setting from '@/components/Setting.vue';
    import Downloads from '@/components/Downloads.vue';
    import Database from '@/assets/js/database';
    import EventBus from '@/assets/js/event-bus';
    import RecordTask from '@/assets/js/record-task';
    import DownloadTask from '@/assets/js/download-task';

    const menus: any = {};
    Object.keys(Constants.Menu).forEach(key => {
        menus[key] = Constants.Menu[key] == Constants.Menu.LIVES;
    });

    @Component({
        components: {
            Downloads,
            Setting,
            Review,
            Lives,
            Reviews,
        },
    })
    export default class Index extends Vue {
        public $refs!: {
            lives: HTMLFormElement,
            reviews: HTMLFormElement,
        };
        //顶部tabs
        private activeName: string = 'Home';
        private liveTabs: any[] = [];
        //菜单
        private menus: any = menus;

        private onMenuSelect(menu: any) {
            Object.keys(this.menus).forEach(key => {
                this.$set(this.menus, key, key === menu);
            });
        }

        private mounted() {
            this.$refs.lives.getLiveList();
            this.$refs.reviews.getReviewList();
        }

        /**
         * 直播录制
         */
        private record(item: any) {
            Apis.instance().live(item.liveId).then(content => {
                const member = Database.instance().member(content.user.userId);
                const date = Tools.dateFormat(parseInt(item.ctime), 'yyyyMMddhhmm');
                const randomNumber = parseInt((Math.random() * 100000000).toFixed());
                const filename = `${member.realName} ${date}-${randomNumber}.flv`;
                const recordTask: RecordTask = new RecordTask(content.playStreamPath, filename, content.liveId);
                EventBus.post<RecordTask>(Constants.Event.RECORD_TASK, recordTask);
            }).catch(error => {
                Debug.error(error);
            });
        }

        /**
         * 打开直播
         */
        private play(item: any) {
            const ChildProcess = require('child_process');
            Apis.instance().live(item.liveId).then(content => {
                const command = `"${Tools.ffplayPath()}" ${content.playStreamPath}`;
                Debug.log(command);
                ChildProcess.exec(command);
            }).catch(error => {
                Debug.error(error);
            });
        }

        /**
         * 回放下载
         */
        private download(item: any) {
            Apis.instance().live(item.liveId).then(content => {
                const member = Database.instance().member(content.user.userId);
                const date = Tools.dateFormat(parseInt(item.ctime), 'yyyyMMddhhmm');
                const random: number = parseInt((parseFloat(Math.random().toFixed(5)) * 100000).toString());
                const filename = `${member.realName} ${date}.mp4`;
                const downloadTask: DownloadTask = new DownloadTask(content.playStreamPath, filename, content.liveId);
                EventBus.post<DownloadTask>(Constants.Event.DOWNLOAD_TASK, downloadTask);
            }).catch(error => {
                Debug.error(error);
            });
        }

        /**
         * 打开回放
         * @param item
         */
        private onReviewClick(item: any) {
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
            Debug.log(liveTab);
            this.liveTabs.push(liveTab);
            this.activeName = liveTab.name;
        }

        /**
         * 移除tab
         * @param targetName
         */
        private onTabRemove(targetName: string) {
            this.activeName = 'Home';
            this.liveTabs = this.liveTabs.filter((tab: any) => {
                return tab.name != targetName;
            });
        }
    }
</script>

<style scoped lang="scss">
    .side-menu:not(.el-menu--collapse) {
        min-height: 100%;
    }
</style>

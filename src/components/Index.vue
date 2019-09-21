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
                             :default-active="Constants.MENUS.LIVES">
                        <el-menu-item :index="Constants.MENUS.LIVES">直播
                        </el-menu-item>
                        <el-menu-item :index="Constants.MENUS.REVIEWS">回放
                        </el-menu-item>
                        <el-menu-item :index="Constants.MENUS.SETTING">设置
                        </el-menu-item>
                    </el-menu>
                </el-aside>

                <el-main style="height: 900px;">
                    <lives ref="lives" v-show="menus[Constants.MENUS.LIVES]"
                           @on-live-click="onLiveClick"></lives>

                    <reviews ref="reviews" v-show="menus[Constants.MENUS.REVIEWS]"
                             @on-review-click="onReviewClick"></reviews>

                    <setting ref="setting" v-show="menus[Constants.MENUS.SETTING]"></setting>
                </el-main>
            </el-container>
        </el-tab-pane>

        <el-tab-pane v-for="(liveTab, index) in liveTabs" :label="liveTab.label" :name="liveTab.name">
            <review :index="index" :live-id="liveTab.liveId" :start-time="liveTab.startTime"
                    :live-title="liveTab.title"></review>
        </el-tab-pane>
    </el-tabs>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import Lives from "@/components/Lives.vue";
    import Reviews from "@/components/Reviews.vue";
    import Constants from "@/assets/js/constants";
    import Debug from "@/assets/js/debug";
    import Tools from "@/assets/js/tools";
    import Apis from "@/assets/js/apis";
    import Review from '@/components/Review.vue';
    import Setting from '@/components/Setting.vue';

    const menus: any = {};
    Object.keys(Constants.MENUS).forEach(key => {
        menus[key] = Constants.MENUS[key] == Constants.MENUS.LIVES;
    });

    @Component({
        components: {
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

        private mounted() {
            this.$refs.lives.getLiveList();
            this.$refs.reviews.getReviewList();
        }

        private onMenuSelect(menu: any) {
            Object.keys(this.menus).forEach(key => {
                this.menus[key] = key === menu;
            });
            this.$refs.lives.setVisibility(menu === Constants.MENUS.LIVES);
            this.$refs.reviews.setVisibility(menu === Constants.MENUS.REVIEWS);
        }

        /**
         * 打开直播
         * @param item
         */
        private onLiveClick(item: any) {
            const ChildProcess = require('child_process');
            Apis.instance().live(item.liveId).then(content => {
                Debug.log(Tools.ffplayPath() + ` ${content.playStreamPath}`);
                ChildProcess.exec(Tools.ffplayPath() + ` ${content.playStreamPath}`);
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
                return tab.liveId == item.liveId && tab.show == true;
            });
            if (exists) {
                return;
            }
            const liveTab = {
                label: `${item.userInfo.nickname}的直播间`,
                title: item.title,
                liveId: item.liveId,
                name: item.liveId + "_" + Math.random().toString(36).substr(2),
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

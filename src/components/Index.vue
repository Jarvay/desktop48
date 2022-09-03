<template>
    <el-container>
        <el-aside style="width: 200px;">
            <el-menu router
                     ref="navMenu"
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

        <el-main>
            <keep-alive>
                <router-view></router-view>
            </keep-alive>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Lives from '@/components/Lives.vue';
    import Reviews from '@/components/Reviews.vue';
    import Review from '@/components/Review.vue';
    import Setting from '@/components/Setting.vue';
    import Downloads from '@/components/Downloads.vue';
    import Constants from '@/assets/js/constants';
    import EventBus from '@/assets/js/event-bus';
    import Apis from "@/assets/js/apis";

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
            navMenu: HTMLFormElement
        };

        created() {
            EventBus.bind<string>(Constants.Event.CHANGE_SELECTED_MENU, (menu: string) => {
                this.$refs.navMenu.activeIndex = menu;
            });
        }
    }
</script>

<style scoped lang="scss">
    .side-menu:not(.el-menu--collapse) {
        min-height: 100%;
    }
</style>

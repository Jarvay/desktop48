<template>
    <el-container>
        <el-header class="header-box">
            <el-tooltip :content="playStreamPath">
                <el-button type="primary">视频地址</el-button>
            </el-tooltip>

            <el-button @click="download" type="success">下载</el-button>
        </el-header>

        <el-main>
            <div class="player-container">
                <el-card>
                    <div slot="header">
                        <el-tooltip :content="liveTitle"><span>{{liveTitle}}</span></el-tooltip>
                    </div>
                    <p slot="extra">
                        <span>{{member.userName}}</span>
                    </p>

                    <el-carousel class="video" v-if="isRadio" autoplay loop :autoplay-speed="carouselTime">
                        <el-carousel-item v-for="carousel in carousels" :key="carousel">
                            <el-image class="picture" :src="carousel"/>
                        </el-carousel-item>
                    </el-carousel>

                    <div v-else>
                        <video :id="'video-js-' + liveId" class="video video-js" preload="auto">
                            <source :src="playStreamPath">
                        </video>
                    </div>

                    <player-controls ref="controls" :is-muted="isMuted"
                                     :is-playing="status === Constants.STATUS_PLAYING" :volume-disabled="isMuted"
                                     @play="play" @pause="pause" @mute="mute" @unmute="unmute"
                                     @progress-change="progressChange"
                                     @volume-change="volumeChange"
                                     @full-screen="fullScreen"
                                     :current-time="currentTime"
                                     :duration="duration"></player-controls>
                </el-card>

                <barrage-box :ref="'barrage-box-' + liveId" :number="number"
                             :start-time="startTime"
                             :barrage-loaded="barrageLoaded"
                             :is-live="!isReview"></barrage-box>
            </div>
        </el-main>
    </el-container>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import Apis from '@/assets/js/apis';
    import Tools from '@/assets/js/tools';
    import Debug from '@/assets/js/debug';
    import VideoJsPlayer from '@/assets/js/video-js-player';
    import Constants from '@/assets/js/constants';
    import Database from '@/assets/js/database';
    import PlayerControls from '@/components/PlayerControls.vue';
    import BarrageBox from '@/components/BarrageBox.vue';
    import VideoJs from 'video.js';
    import 'video.js/dist/video-js.css';
    import DownloadTask from '@/assets/js/download-task';
    import EventBus from '@/assets/js/event-bus';

    @Component({
        components: {BarrageBox, PlayerControls}
    })
    export default class Review extends Vue {
        @Prop({type: String, required: true}) private liveTitle: any;
        @Prop({type: String, required: true}) private liveId: any;
        @Prop({type: Number, required: true}) private startTime: any;
        //回放相关信息
        private playStreamPath: string = '';
        private isReview: boolean = false;
        private isRadio: boolean = false;
        private number: number = 0;
        private member: any = {};
        private player!: VideoJsPlayer;
        private currentTime: number = 0;
        private status: any = Constants.STATUS_PREPARED;
        private duration: number = 0;
        private isMuted: boolean = false;
        private volume: number = 80;
        //跑马灯
        private carousels: any[] = [];
        private carouselTime: number = 0;
        //弹幕
        private barrageUrl: string = '';
        private barrageLoaded: boolean = false;
        private finalBarrageList: any[] = [];
        private barrageList: any[] = [];
        private currentBarrage: any = {};
        public $refs!: any;

        get barrageBox(): any {
            return this.$refs['barrage-box-' + this.liveId];
        }

        private created() {
            this.getOne();
        }

        private destroyed() {
            if (this.player != null) {
                this.player.destroy();
                Debug.info('player destroyed')
            }
        }

        private getOne() {
            Apis.instance().live(this.liveId).then(data => {
                this.playStreamPath = Tools.streamPathHandle(data.playStreamPath, this.startTime);
                this.isReview = data.review;
                this.barrageUrl = data.msgFilePath;
                this.isRadio = data.liveType == 2;
                this.number = data.onlineNum;
                if (this.isRadio) {
                    this.carousels = data.carousels.carousels.map((carousel: any) => {
                        return Tools.sourceUrl(carousel);
                    });
                    this.carouselTime = parseInt(data.carousels.carouselTime);
                }
                this.member = Database.instance().member(data.user.userId);

                this.initPlayer();
            }).catch((error: any) => {
                Debug.error(error);
            });
        }

        private initPlayer() {
            if (this.player != null) {
                this.player.destroy();
            }

            this.initVideoJs();
            this.player.volume(Database.instance().getConfig('volume', 80));

            if (!this.isReview) {
                this.play();
            }
            //时长
            this.player.onGotDuration((duration: any) => {
                if (this.isReview) {
                    this.duration = duration;
                    this.getBarrages();
                }
            });
            //当前进度
            this.player.onTimeUpdate((currentTime: number) => {
                this.currentTime = currentTime;

                this.loadBarrages();
            });
        }

        private initVideoJs() {
            const videoJsPlayer = VideoJs('video-js-' + this.liveId, {
                autoplay: false, // 自动播放
                controls: false, // 是否显示控制栏
                techOrder: ['html5'], // 兼容顺序
                sourceOrder: true, //
                sources: [{
                    src: this.playStreamPath
                }]
            });
            videoJsPlayer.volume(this.$refs.controls.volume * 0.01);
            this.player = new VideoJsPlayer(videoJsPlayer);
        }

        private play() {
            this.player.play();
            this.status = Constants.STATUS_PLAYING;
            Debug.log('play');
        }

        private pause() {
            this.player.pause();
            this.status = Constants.STATUS_PREPARED;
            Debug.log('pause');
        }

        private mute() {
            this.player.mute();
            this.isMuted = true;
            Debug.log('mute');
        }

        private unmute() {
            this.player.volume(this.volume);
            this.isMuted = false;
            Debug.log('unmute');
        }

        private progressChange(newTime: number) {
            this.currentTime = newTime;
            this.player.currentTime(newTime);

            //重新加载弹幕
            this.barrageBox.clear();
            this.barrageList = [];
            this.finalBarrageList.forEach(item => {
                if (Tools.timeToSecond(item.time) - 2 > newTime) {
                    this.barrageList.push(item);
                }
            });
            this.currentBarrage = this.barrageList.shift();
            Debug.log('progressChange');
        }

        private volumeChange(volume: number) {
            this.volume = volume;
            Debug.log('volumeChange');
            Database.instance().setConfig('volume', volume);
        }

        private fullScreen() {
            this.player.fullScreen();
            Debug.log('fullScreen');
        }

        private getBarrages() {
            if (this.barrageUrl.length == 0) {
                return;
            }
            Apis.instance().barrage(this.barrageUrl).then((response: any) => {
                this.barrageLoaded = true;
                this.finalBarrageList = this.barrageList = Tools.lyricsParse(response);
                this.currentBarrage = this.barrageList.shift();

                this.$message({
                    message: '弹幕已加载',
                    type: 'success'
                });
            }).catch((error: any) => {
                Debug.error(error);
                this.$message({
                    message: '弹幕加载失败',
                    type: 'error'
                });
            });
        }

        private loadBarrages() {
            if (this.barrageList.length == 0) {
                return;
            }
            const barrageTime: number = Tools.timeToSecond(this.currentBarrage.time);
            if (barrageTime > this.currentTime - 1 && barrageTime < this.currentTime + 1) { //弹幕可误差1秒
                this.barrageBox.shoot({
                    content: this.currentBarrage.content,
                    username: this.currentBarrage.username
                });
                this.currentBarrage = this.barrageList.shift();
                this.loadBarrages();
            }
        }

        private download() {
            const date = Tools.dateFormat(parseInt(this.startTime), 'yyyyMMddhhmm');
            const random: number = parseInt((parseFloat(Math.random().toFixed(5)) * 100000).toString());
            const filename = `${this.member.realName} ${date}.mp4`;
            const downloadTask: DownloadTask = new DownloadTask(this.playStreamPath, filename, this.liveId);
            EventBus.post<DownloadTask>(Constants.EVENT.DOWNLOAD_TASK, downloadTask);
        }
    }
</script>

<style scoped lang="scss">

</style>

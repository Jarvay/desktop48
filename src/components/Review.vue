<template>
    <el-container>
        <el-header class="header-box">
            <el-tooltip :content="playStreamPath">
                <el-button type="primary">视频地址</el-button>
            </el-tooltip>

            <el-button icon="el-icon-download" @click="download" type="success">下载</el-button>
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

                    <div class="carousel-box" v-if="isRadio">
                        <el-carousel style="top: 25%;" autoplay loop :interval="carouselTime">
                            <el-carousel-item v-for="carousel in carousels" :key="carousel">
                                <el-image class="picture" :src="carousel"/>
                            </el-carousel-item>
                        </el-carousel>
                    </div>

                    <div v-else>
                        <video v-show="videoJsShow" :id="'video-js-' + liveId" class="video video-js" preload="auto">
                            <source :src="playStreamPath">
                        </video>

                        <video class="video" :id="'flv-js-' + liveId" ref="video" v-show="flvJsShow"></video>
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
    import IPlayer from '@/assets/js/i-player';
    import FlvJs from 'flv.js';
    import FlvJsPlayer from '@/assets/js/flv-js-player';

    @Component({
        components: {BarrageBox, PlayerControls}
    })
    export default class Review extends Vue {
        @Prop({type: String, required: true}) protected liveTitle: any;
        @Prop({type: String, required: true}) protected liveId: any;
        @Prop({type: Number, required: true}) protected startTime: any;
        //回放相关信息
        protected playStreamPath: string = '';
        protected isReview: boolean = false;
        protected isRadio: boolean = false;
        protected number: number = 0;
        protected member: any = {};
        protected player!: IPlayer;
        protected currentTime: number = 0;
        protected status: any = Constants.STATUS_PREPARED;
        protected duration: number = 0;
        protected isMuted: boolean = false;
        protected volume: number = 80;
        //跑马灯
        protected carousels: any[] = [];
        protected carouselTime: number = 0;
        //弹幕
        protected barrageUrl: string = '';
        protected barrageLoaded: boolean = false;
        protected finalBarrageList: any[] = [];
        protected barrageList: any[] = [];
        protected currentBarrage: any = {};
        protected videoJsShow: boolean = true;
        protected flvJsShow: boolean = false;
        public $refs!: any;

        get barrageBox(): any {
            return this.$refs['barrage-box-' + this.liveId];
        }

        protected created() {
            this.getOne();
        }

        protected destroyed() {
            if (this.player != null) {
                this.player.destroy();
                Debug.info('player destroyed');
            }
        }

        protected getOne() {
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

        protected initPlayer() {
            if (this.player != null) {
                this.player.destroy();
            }

            if (this.playStreamPath.includes('.m3u8')) {
                this.initVideoJs();
            } else {
                this.initFlvJs();
            }
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

        /**
         * 初始化FlvJs
         */
        protected initFlvJs() {
            if (FlvJs.isSupported()) {
                const videoElement: any = document.getElementById('flv-js-' + this.liveId);
                const flvPlayer = FlvJs.createPlayer({
                    type: 'video/mp4',
                    url: this.playStreamPath,
                    isLive: !this.isReview,
                    withCredentials: false,
                    hasVideo: !this.isRadio,
                    hasAudio: true,
                });
                flvPlayer.attachMediaElement(videoElement);
                flvPlayer.volume = this.$refs.controls.volume * 0.01;
                flvPlayer.load();
                this.player = new FlvJsPlayer(flvPlayer);

                this.flvJsShow = true;
                this.videoJsShow = false;
            }
        }

        /**
         * 初始化VideoJS
         */
        protected initVideoJs() {
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

            this.flvJsShow = false;
            this.videoJsShow = true;
        }

        protected play() {
            this.player.play();
            this.status = Constants.STATUS_PLAYING;
            Debug.log('play');
        }

        protected pause() {
            this.player.pause();
            this.status = Constants.STATUS_PREPARED;
            Debug.log('pause');
        }

        protected mute() {
            this.player.mute();
            this.isMuted = true;
            Debug.log('mute');
        }

        protected unmute() {
            this.player.volume(this.volume);
            this.isMuted = false;
            Debug.log('unmute');
        }

        protected progressChange(newTime: number) {
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

        protected volumeChange(volume: number) {
            this.volume = volume;
            Debug.log('volumeChange');
            Database.instance().setConfig('volume', volume);
        }

        protected fullScreen() {
            this.player.fullScreen();
            Debug.log('fullScreen');
        }

        protected getBarrages() {
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

        protected loadBarrages() {
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

        protected download() {
            const date = Tools.dateFormat(parseInt(this.startTime), 'yyyyMMddhhmm');
            const filename = `${this.member.realName} ${date}.mp4`;
            const downloadTask: DownloadTask = new DownloadTask(this.playStreamPath, filename, this.liveId);
            EventBus.post<string>(Constants.Event.CHANGE_SELECTED_MENU, Constants.Menu.DOWNLOADS);
            this.$router.push('/downloads');
            this.$nextTick(() => {
                EventBus.post<DownloadTask>(Constants.Event.DOWNLOAD_TASK, downloadTask);
            });
        }
    }
</script>

<style scoped lang="scss">

</style>

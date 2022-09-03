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
                        <el-carousel style="height: 100%;" autoplay loop :interval="carouselTime">
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

                    <player-controls v-if="isRadio" ref="controls" :is-muted="isMuted"
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
    import {cloneDeep} from "lodash";

    VideoJs.Vhs.xhr.beforeRequest = function (options: any) {
      let headers = options.headers || {};
      headers["headers1"] = "headers1";
      headers["headers2"] = "headers2";
      headers["token"] = "J2LqH1mnoXE0ZL5typ3VT3n4fe7RFYAO";

      options.headers = headers;

      console.log("options", options);

      return options;
    };

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
                console.info('player destroyed');
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
                console.error(error);
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
                if (this.currentTime === currentTime) return;
                this.onTimeUpdate(currentTime);
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
                controls: true, // 是否显示控制栏
                techOrder: ['html5'], // 兼容顺序
                sourceOrder: true, //
                sources: [{
                    src: this.playStreamPath
                }],
              playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4, 4.5, 5]
            });
            this.player = new VideoJsPlayer(videoJsPlayer);

            this.flvJsShow = false;
            this.videoJsShow = true;
        }

        protected play() {
            this.player.play();
            this.status = Constants.STATUS_PLAYING;
            console.log('play');
        }

        protected pause() {
            this.player.pause();
            this.status = Constants.STATUS_PREPARED;
            console.log('pause');
        }

        protected mute() {
            this.player.mute();
            this.isMuted = true;
            console.log('mute');
        }

        protected unmute() {
            this.player.volume(this.volume);
            this.isMuted = false;
            console.log('unmute');
        }

        protected progressChange(newTime: number) {
            this.player.currentTime(newTime);
            this.onTimeUpdate(newTime);
            console.log('progressChange');
        }

        protected onTimeUpdate(newTime: number) {
          if (newTime < this.currentTime) {
            this.barrageList = cloneDeep(this.finalBarrageList);
          }

          this.currentTime = newTime;

          //重新加载弹幕
          for (let item of this.barrageList) {
            if (Tools.timeToSecond(item.time) <= newTime - 1) {
              this.barrageBox.shoot({
                content: item.content,
                username: item.username,
                time: item.time,
              });
              this.barrageList.shift();
            } else {
              break;
            }
          }
        }

        protected volumeChange(volume: number) {
            this.volume = volume;
            console.log('volumeChange');
            Database.instance().setConfig('volume', volume);
        }

        protected fullScreen() {
            this.player.fullScreen();
            console.log('fullScreen');
        }

        protected getBarrages() {
            if (this.barrageUrl.length == 0) {
                return;
            }
            Apis.instance().barrage(this.barrageUrl).then((response: any) => {
                this.barrageLoaded = true;
                this.finalBarrageList = Tools.lyricsParse(response);
                this.barrageList = cloneDeep(this.finalBarrageList);
            }).catch((error: any) => {
                console.error(error);
                this.$message({
                    message: '弹幕加载失败',
                    type: 'error'
                });
            });
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
::v-deep.el-carousel__container {
  height: 100%;
}

::v-deep.el-carousel__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

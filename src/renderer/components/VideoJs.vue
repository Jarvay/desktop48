<template>
    <div class="layout">
        <Layout>
            <PlayerHeader other-player="flvjs" :video-url="streamPath" @change-player="changePlayer"></PlayerHeader>
            <Content style="padding: 16px;">
                <div class="player-container">
                    <Spin size="large" fix v-if="spinShow"></Spin>

                    <Card>
                        <p slot="title">{{subTitle}}</p>
                        <p slot="extra">{{title}}</p>

                        <Carousel class="video" v-if="isRadio" autoplay loop :autoplay-speed="8000">
                            <CarouselItem v-for="picture in pictures" :key="picture">
                                <img class="picture" :src="picture">
                            </CarouselItem>
                        </Carousel>

                        <!--<video-player ref="videoPlayer" class="video" :options="playerOptions" v-else></video-player>-->

                        <video id="video-js" class="video" v-else></video>

                        <PlayerControls ref="controls" :is-muted="isMuted" :show-progress="isReview"
                                :is-playing="isPlaying" :volume-disabled="volumeDisabled"
                                @play="play" @pause="pause" @mute="mute" @unmute="unmute" @progress="progressChange"
                                @volume="onVolumeChange"
                                :current-time="currentTime"
                                :duration="duration"></PlayerControls>
                    </Card>

                    <Card style="flex: 1 0 auto;margin-left: 16px;">
                        <p slot="title">弹幕</p>
                        <p slot="extra">观看人数：{{number}}</p>

                        <div class="barrage-container">
                            <Barrage class="barrage-box" ref="barrage"></Barrage>
                        </div>
                    </Card>
                </div>
            </Content>
        </Layout>
    </div>
</template>

<script>
    import PlayerHeader from "./PlayerHeader";
    import PlayerControls from "./PlayerControls";
    import Barrage from "./Barrage";
    import Tools from "../assets/js/tools";
    import LiveApi from "../assets/js/live-api";
    import videojs from 'video.js';
    import 'videojs-flash'

    const STATUS_PLAYING = 1;
    const STATUS_PREPARED = 0;

    export default {
        name:'VideoJs',
        components:{Barrage, PlayerControls, PlayerHeader},
        props:{
            liveId:''
        },
        data(){
            return {
                playerOptions:{
                    autoplay:false, // 自动播放
                    controls:false, // 是否显示控制栏
                    techOrder:['flash', 'html5'], // 兼容顺序
                    sourceOrder:true, //
                    flash:{
                        hls:{withCredentials:false},
                    },
                    html5:{hls:{withCredentials:false}},
                    sources:[{
                        withCredentials:false,
                        type:'',
                        src:''
                    }],
                },
                spinShow:true,
                streamPath:'',
                barrageUrl:'',
                title:'',
                subTitle:'',
                status:STATUS_PREPARED,
                volume:0,
                isMuted:false,
                volumeDisabled:false,
                duration:0,
                currentTime:0,
                isReview:true,      //是否回放
                currentBarrage:{},
                finalBarrageList:[],
                barrageList:[],
                isRadio:false,
                pictures:[],
                number:0,
                player:{}
            }
        },
        computed:{
            isPlaying:function(){
                return this.status === STATUS_PLAYING;
            },
            // player(){
            //     return this.$refs.videoPlayer.player;
            // }
        },
        watch:{
            volume:function(newVolume){
                this.player.volume(newVolume * 0.01);
            }
        },
        created:function(){
            this.$Notice.config({
                top:80
            });
        },
        mounted:function(){
            this.getOne();
        },
        methods:{
            getOne:function(){
                LiveApi.live(this.liveId).then(responseBody => {
                    if(responseBody.status == 200){
                        const data = responseBody.content;
                        this.streamPath = data.streamPath;
                        this.title = data.title;
                        this.subTitle = data.subTitle;
                        this.isReview = data.isReview;
                        this.barrageUrl = 'http://source.48.cn' + data.lrcPath;
                        this.isRadio = data.liveType == 2;
                        this.number = data.number;

                        this.player = videojs('video-js', this.playerOptions);

                        this.pictures = Tools.pictureUrls(data.picPath);

                        this.player.volume(this.$refs.controls.volume * 0.01);

                        this.player.src({
                            type:this.getType(this.streamPath),
                            src:this.streamPath
                        });
                        //时长
                        this.player.on('loadeddata', event => {
                            this.duration = event.target.player.duration();

                            if(this.isReview){
                                this.getBarrages();
                            }
                        });
                        //当前进度
                        this.player.on('timeupdate', event => {
                            this.currentTime = event.target.player.currentTime();
                            //弹幕
                            this.loadBarrages();
                        });
                        //播放结束
                        this.player.on('ended', () => {
                            this.status = STATUS_PREPARED;
                            this.$Notice.info({
                                title:'播放完毕',
                                desc:''
                            });
                        });
                        this.spinShow = false;
                    }
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            getBarrages:function(){
                LiveApi.barrage(this.barrageUrl).then(response => {
                    this.finalBarrageList = this.barrageList = Tools.lyricsParse(response.data);
                    this.currentBarrage = this.barrageList.shift();

                    this.$Notice.success({
                        title:'弹幕已加载',
                        desc:''
                    });
                }).catch(error => {
                    console.log(error);
                });
            },
            play:function(){
                this.player.play();
                this.status = STATUS_PLAYING;
            },
            pause:function(){
                this.player.pause();
                this.status = STATUS_PREPARED;
            },
            mute:function(){
                this.player.volume(0);
                this.isMuted = true;
                this.volumeDisabled = true;
            },
            unmute:function(){
                this.player.volume(this.volume * 0.01);
                this.isMuted = false;
                this.volumeDisabled = false;
            },
            onVolumeChange:function(volume){
                this.volume = volume
            },
            getType:function(url){
                if(url.includes('.mp4')){
                    return 'video/mp4';
                }else if(url.includes('.m3u8')){
                    return 'application/x-mpegURL';
                }
            },
            progressChange:function(progress){
                this.player.currentTime(progress);
                //重新加载弹幕
                this.barrageList = [];
                this.finalBarrageList.forEach(item => {
                    if(Tools.timeToSecond(item.time) - 2 > progress){
                        this.barrageList.push(item);
                    }
                });
                this.currentBarrage = this.barrageList.shift();
            },
            loadBarrages:function(){
                const barrageTime = Tools.timeToSecond(this.currentBarrage.time);
                if(barrageTime > this.currentTime - 1 && barrageTime < this.currentTime + 1){ //弹幕可误差1秒
                    this.$refs.barrage.shoot({
                        content:this.currentBarrage.content,
                        username:this.currentBarrage.username
                    });
                    this.currentBarrage = this.barrageList.shift();
                    this.loadBarrages();
                }
            },
            changePlayer:function(){
                this.$emit('change-player', 'flvjs', this.liveId);
            },
        }
    }
</script>

<style scoped>

</style>

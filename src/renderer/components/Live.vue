<template>
    <div class="layout">
        <Layout>
            <PlayerHeader :video-url="playStreamPath" :current-player="currentPlayer" @try-to-fix="createVideoServer"></PlayerHeader>
            <Content style="padding: 16px;">
                <div class="player-container">
                    <Card>
                        <Spin size="large" fix v-if="spinShow"></Spin>

                        <p slot="title" style="max-width: 160px;">
                            <Tooltip :content="liveTitle"><span>{{liveTitle}}</span></Tooltip>
                        </p>
                        <p slot="extra">
                            <span>{{user.userName}}</span>
                        </p>

                        <Carousel class="video" v-if="isRadio" autoplay loop :autoplay-speed="carouselTime">
                            <CarouselItem v-for="carousel in carousels" :key="carousel">
                                <img class="picture" :src="carousel">
                            </CarouselItem>
                        </Carousel>

                        <div v-else>
                            <video class="video" :id="'flv-js-' + liveId" ref="video" v-show="flvJsShow"></video>
                            <video :id="'video-js-' + liveId" class="video video-js" preload="auto"
                                   v-show="videoJsShow">
                                <source :src="playStreamPath" :type="getType(playStreamPath)">
                            </video>
                        </div>

                        <PlayerControls ref="controls" :show-play-button="isReview"
                                        :is-muted="isMuted"
                                        :show-progress="isReview"
                                        :is-playing="status == Constants.STATUS_PLAYING" :volume-disabled="isMuted"
                                        @play="play" @pause="pause" @mute="mute" @unmute="unmute"
                                        @progress="progressChange"
                                        @volume="volumeChange"
                                        :current-time="currentTime"
                                        :duration="duration"></PlayerControls>
                    </Card>

                    <BarrageBox :ref="'barrage-box-' + liveId" :number="number"
                                :start-time="startTime"
                                :chat-room-status="chatRoomStatus"
                                :send-disabled="sendDisabled"
                                :send-text="sendText"
                                :show-input="!isReview"
                                :send-barrage="sendBarrage"></BarrageBox>
                </div>
            </Content>
        </Layout>
    </div>
</template>

<script>
    import PlayerHeader from './PlayerHeader';
    import PlayerControls from './PlayerControls';
    import Tools from "../assets/js/tools";
    import Apis from "../assets/js/apis";
    import BarrageBox from "./BarrageBox";
    import ChatRoomTools from '../assets/js/chatroom-tools';

    import VideoJs from 'video.js';
    import 'video.js/src/css/video-js.scss';

    import FlvJs from 'flv.js';

    import {FlvJsPlayer, VideoJsPlayer} from '../assets/js/players';

    export default {
        name: "Live",
        components: {BarrageBox, PlayerControls, PlayerHeader},
        data() {
            return {
                user: {},
                isRadio: false,
                carousels: [],
                carouselTime: 5000,
                isReview: true,
                isMuted: false,
                volume: 80,
                currentTime: 0,
                duration: 0,
                player: null,
                playStreamPath: '',
                spinShow: true,
                chatRoomStatus: 0,
                sendDisabled: false,
                sendText: '发送',
                number: 0,
                flvJsShow: true,
                videoJsShow: true,
                barrageUrl: '',
                finalBarrageList: [],
                barrageList: [],
                status: this.Constants.STATUS_PREPARED,
                currentPlayer: '',
                chatroom: null,
                seconds: this.Constants.BARRAGE_SEND_INTERVAL,
                videoServer: null,
                port: 8800
            };
        },
        props: {
            liveId: {
                type: String,
                required: true
            },
            startTime: {
                type: Number,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            index: {
                type: Number,
                required: true
            }
        },
        watch: {
            volume: function (newVolume) {
                this.player.volume(newVolume);
            },
        },
        computed: {
            barrageBox() {
                return this.$refs['barrage-box-' + this.liveId];
            },
            liveTitle() {
                return this.title;
            }
        },
        created: function () {
            this.port = this.port + this.index;

            this.getOne();
        },
        destroyed: function () {
            if (this.player != null) {
                this.player.destroy();
            }

            if (this.chatroom != null) {
                this.chatroom.disconnect();
            }

            if (this.videoServer != null){
                this.videoServer.close();
            }
        },
        methods: {
            getOne: function () {
                Apis.live(this.liveId).then(responseBody => {
                    if (responseBody.status == 200) {
                        const data = responseBody.content;

                        this.playStreamPath = Tools.streamPathHandle(data.playStreamPath, this.startTime);
                        this.subTitle = data.subTitle;
                        this.isReview = data.review;
                        this.barrageUrl = data.msgFilePath;
                        this.roomId = data.roomId;
                        this.isRadio = data.liveType == 2;
                        this.number = data.onlineNum;
                        if (this.isRadio) {
                            this.carousels = data.carousels.carousels.map(carousel => {
                                return Tools.sourceUrl(carousel);
                            });
                            this.carouselTime = parseInt(data.carousels.carouselTime);
                        }
                        this.user = data.user;

                        this.initPlayer();
                    } else {
                        this.$Message.error(responseBody.message);
                    }
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            initPlayer: function () {
                this.spinShow = false;

                if (this.player != null) {
                    this.player.destroy();
                }

                if (!this.isReview && this.playStreamPath.includes('.flv')) {
                    this.initFlvJs();
                } else if (this.playStreamPath.includes('.mp4') && this.isReview) {
                    this.initFlvJs();
                } else {
                    this.initVideoJs();
                }

                this.player.volume(Tools.getVolume());

                Tools.videoInfo(this.playStreamPath).then(result => {
                    this.duration = result.duration;
                }).catch(error => {
                   console.error(error);
                });

                //时长
                this.player.onGotDuration(duration => {
                    if (!this.isReview) {
                        this.connectChatroom();
                        this.play();
                    } else {
                        this.getBarrages();
                    }
                });
                //当前进度
                this.player.onTimeUpdate(currentTime => {
                    this.currentTime = currentTime;

                    this.loadBarrages();
                });
            },
            initFlvJs: function () {
                if (FlvJs.isSupported()) {
                    const videoElement = document.getElementById('flv-js-' + this.liveId);
                    const flvPlayer = FlvJs.createPlayer({
                        type: this.getType(this.playStreamPath),
                        url: this.playStreamPath,
                        isLive: !this.isReview,
                        withCredentials: false,
                        hasVideo: !this.isRadio,
                        hasAudio: true,
                        config: {
                            autoCleanupSourceBuffer: true
                        }
                    });
                    flvPlayer.attachMediaElement(videoElement);
                    flvPlayer.volume = this.$refs.controls.volume * 0.01;
                    flvPlayer.load();
                    this.player = new FlvJsPlayer(flvPlayer);

                    this.flvJsShow = true;
                    this.videoJsShow = false;

                    this.currentPlayer = this.Constants.FLV_JS;
                }
            },
            initVideoJs: function () {
                const videoJsPlayer = VideoJs('video-js-' + this.liveId, {
                    autoplay: false, // 自动播放
                    controls: false, // 是否显示控制栏
                    techOrder: ['flash', 'html5'], // 兼容顺序
                    sourceOrder: true, //
                    sources: [{
                        withCredentials: false,
                        type: this.getType(this.playStreamPath),
                        src: this.playStreamPath
                    }],
                });
                videoJsPlayer.volume(this.$refs.controls.volume * 0.01);
                this.player = new VideoJsPlayer(videoJsPlayer);

                this.flvJsShow = false;
                this.videoJsShow = true;

                this.currentPlayer = this.Constants.VIDEO_JS;
            },
            //连接聊天室
            connectChatroom: function () {
                const options = {
                    roomId: this.roomId,
                    onConnect: () => {
                        this.chatRoomStatus = 1;
                    },
                    onDisconnect: (message) => {
                        this.chatRoomStatus = 0;
                        console.log(message);
                    },
                    onWillConnect: () => {

                    },
                    /**
                     * @link https://github.com/Jarvay/48Live/wiki/Chatroom-OnMessage
                     */
                    onMessage: messages => {
                        messages.forEach(message => {
                            if (message.type == 'text') {
                                console.log(message.custom);
                                const custom = JSON.parse(message.custom);
                                switch (custom.messageType) {
                                    case this.Constants.MESSAGE_TYPE.BARRAGE_NORMAL: //弹幕消息
                                        let level = 1;
                                        if (custom.user.roleId == 2) {
                                            level = 3;
                                        } else if (custom.isBarrage) {
                                            level = 2;
                                        }
                                        this.barrageBox.shoot({
                                            content: custom.text,
                                            username: custom.user.nickName,
                                            level: level
                                        });
                                        break;
                                    case this.Constants.MESSAGE_TYPE.LIVEUPDATE: //观看人数
                                        this.number = custom.liveUpdateInfo.online;
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                console.log(message);
                            }
                        });
                    },
                    onError: error => {
                        console.log(error);
                    }
                };
                ChatRoomTools.chatroom(options).then(chatroom => {
                    this.chatroom = chatroom;
                }).catch(error => {
                    this.$Notice.error({
                        title: '聊天室token获取失败',
                        desc: ''
                    });
                    console.log(error);
                });
            },
            getType: function (url) {
                if (url.includes('.mp4')) {
                    return 'mp4';
                } else if (url.includes('.flv')) {
                    return 'flv';
                }
            },
            play: function () {
                this.player.play();
                this.status = this.Constants.STATUS_PLAYING;
            },
            pause: function () {
                this.player.pause();
                this.status = this.Constants.STATUS_PREPARED;
            },
            mute: function () {
                this.player.mute();
                this.isMuted = true;
            },
            unmute: function () {
                this.player.volume(this.volume);
                this.isMuted = false;
            },
            progressChange: function (newTime) {
                this.currentTime = newTime;
                this.player.currentTime(newTime);

                //重新加载弹幕
                this.barrageList = [];
                this.finalBarrageList.forEach(item => {
                    if (Tools.timeToSecond(item.time) - 2 > newTime) {
                        this.barrageList.push(item);
                    }
                });
                this.currentBarrage = this.barrageList.shift();
            },
            volumeChange: function (volume) {
                this.volume = volume;
            },
            sendBarrage: function () {
                if (this.barrageBox.senderName.length == 0) {
                    this.$Notice.info({
                        title: '首次发送弹幕请输入昵称'
                    });
                    return;
                } else if (this.barrageBox.content.length == 0) {
                    this.$Notice.info({
                        title: '请输入发送内容'
                    });
                    return;
                }else if (this.chatRoomStatus == 0){
                    this.$Notice.info({
                        title: '尚未连接到聊天室'
                    });
                    return;
                } else if (this.seconds != this.Constants.BARRAGE_SEND_INTERVAL) {
                    return;
                }
                const custom = {
                    sourceId: this.liveId,
                    sessionRole: 0,
                    messageType: 'BARRAGE_NORMAL',
                    fromApp: "201811",
                    module: "session",
                    bubbleId: "0",
                    inTop: false,
                    text: this.barrageBox.content,
                    moudule: "live",
                    user: {
                        gender: 0,
                        sessionRole: 0,
                        level: 2,
                        nickName: this.barrageBox.senderName,
                        roleId: 1,
                        avatar: '',
                        badgeCount: 0,
                        userId: 0,
                        friends: 0,
                        badge: [],
                        followers: 0,
                        isStar: false,
                        money: 0,
                        isOwener: false,
                        exp: 0,
                        vip: true,
                        support: 0,
                        card: 0,
                        verification: false
                    },
                    config: {
                        build: '190415',
                        phoneName: 'HuaWei P30 Pro',
                        version: '',
                        mobileOperators: '中国电信',
                        ip: '10.10.10.10',
                        phoneSystemVersion: '9.0'
                    },
                    roomId: this.roomId

                };
                const message = {
                    text: this.barrageBox.content,
                    custom: JSON.stringify(custom),
                    done: (error) => {
                        if (error == null) {
                            this.barrageBox.shoot({
                                username: this.barrageBox.senderName,
                                content: this.barrageBox.content
                            });
                            this.$refs['barrage-box-' + this.liveId].senderNameReadonly = true;
                        } else {
                            console.error(error);
                        }
                        this.sendDisabled = true;
                        this.barrageBox.content = '';
                        const timer = setInterval(() => {
                            this.sendText = '发送(' + this.seconds + ')';
                            this.seconds--;
                            if (this.seconds == 0) {
                                this.sendText = '发送';
                                clearInterval(timer);
                                this.seconds = this.Constants.BARRAGE_SEND_INTERVAL;
                                this.sendDisabled = false;
                            }
                        }, 1000);

                        Tools.setSenderName(this.barrageBox.senderName);
                    }
                };

                this.chatroom.sendText(message);
            },
            getBarrages: function () {
                if (this.barrageUrl.length == 0) {
                    this.$Notice.error({
                        title: '弹幕加载失败'
                    });
                    return;
                }
                Apis.barrage(this.barrageUrl).then(response => {
                    this.finalBarrageList = this.barrageList = Tools.lyricsParse(response.data);
                    this.currentBarrage = this.barrageList.shift();

                    this.$Notice.success({
                        title: '弹幕已加载',
                        desc: ''
                    });
                }).catch(error => {
                    console.log(error);
                    this.$Notice.error({
                        title: '弹幕加载失败'
                    });
                });
            },
            loadBarrages: function () {
                if (this.barrageList.length == 0) return;
                const barrageTime = Tools.timeToSecond(this.currentBarrage.time);
                if (barrageTime > this.currentTime - 1 && barrageTime < this.currentTime + 1) { //弹幕可误差1秒
                    this.barrageBox.shoot({
                        content: this.currentBarrage.content,
                        username: this.currentBarrage.username
                    });
                    this.currentBarrage = this.barrageList.shift();
                    this.loadBarrages();
                }
            },
            createVideoServer: function () {
                this.spinShow = true;
                this.videoServer = Tools.createVideoServer(this.playStreamPath, this.port);
                this.playStreamPath = `http://127.0.0.1:${this.port}?.mp4`;
                this.initPlayer();
            },
        }
    }
</script>

<style scoped>
    .carousel {
        position: absolute !important;
        background-color: #fff;
    }

    .video-js {
        background-color: unset;
    }
</style>
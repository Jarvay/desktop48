<template>
    <div class="layout">
        <Layout>
            <PlayerHeader other-player="flvjs" :video-url="streamPath"
                          @change-player="changePlayer"></PlayerHeader>
            <Content style="padding: 16px;">
                <div class="player-container">
                    <Spin size="large" fix v-if="spinShow"></Spin>

                    <Card>
                        <p slot="title">{{subTitle}}</p>
                        <p slot="extra">{{title}}</p>

                        <Carousel class="video carousel" v-if="isRadio" autoplay loop
                                  :autoplay-speed="8000">
                            <CarouselItem v-for="picture in pictures" :key="picture">
                                <img class="picture" :src="picture">
                            </CarouselItem>
                        </Carousel>

                        <video :id="'video-js-' + liveId" class="video" v-show="!isRadio"></video>

                        <PlayerControls ref="controls" :is-muted="isMuted" :show-progress="isReview"
                                        :show-play-button="isReview"
                                        :is-playing="isPlaying" :volume-disabled="volumeDisabled"
                                        @play="play" @pause="pause" @mute="mute" @unmute="unmute"
                                        @progress="progressChange"
                                        @volume="onVolumeChange"
                                        :current-time="currentTime"
                                        :duration="duration"></PlayerControls>
                    </Card>

                    <BarrageBox :ref="'barrage-box-' + liveId" :number="number" :send-disabled="sendDisabled"
                                :send-text="sendText"
                                :sender-name-readonly="senderNameReadonly" :show-input="!isReview"
                                :send-barrage="sendBarrage"></BarrageBox>
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
    import ChatRoomTools from '../assets/js/chatroom-tools';
    import LiveApi from "../assets/js/live-api";
    import BarrageBox from "./BarrageBox";
    import videojs from 'video.js';
    import 'video.js/src/css/video-js.scss';
    import 'videojs-flash'

    const STATUS_PLAYING = 1;
    const STATUS_PREPARED = 0;

    export default {
        name: 'VideoJs',
        components: {Barrage, PlayerControls, PlayerHeader, BarrageBox},
        props: {
            liveId: {
                type: String,
                required: true
            },
            streamPath: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                playerOptions: {
                    autoplay: false, // 自动播放
                    controls: false, // 是否显示控制栏
                    techOrder: ['flash', 'html5'], // 兼容顺序
                    sourceOrder: true, //
                    sources: [{
                        withCredentials: false,
                        type: this.getType(this.streamPath),
                        src: this.streamPath
                    }],
                },
                spinShow: true,
                barrageUrl: '',
                title: '',
                subTitle: '',
                status: STATUS_PREPARED,
                volume: 0,
                isMuted: false,
                volumeDisabled: false,
                duration: 0,
                currentTime: 0,
                isReview: true,      //是否回放
                currentBarrage: {},
                finalBarrageList: [],
                barrageList: [],
                isRadio: false,
                pictures: [],
                player: {},
                senderName: '',
                senderNameReadonly: false,
                sendDisabled: false,
                sendText: '发送',
                seconds: Tools.BARRAGE_SEND_INTERVAL,
                chatroom: null,
                endTipsShow: false,
                number: 0,   //观看人数
            }
        },
        computed: {
            isPlaying: function () {
                return this.status === STATUS_PLAYING;
            },
        },
        watch: {
            volume: function (newVolume) {
                this.player.volume(newVolume * 0.01);
            }
        },
        created: function () {
            this.$Notice.config({
                top: 200
            });
        },
        destroyed: function () {
            if (this.player) {
                this.player.dispose();
            }

            if (this.chatroom !== null) {
                this.chatroom.disconnect();
            }
        },
        mounted: function () {
            this.getOne();
        },
        methods: {
            getOne: function () {
                LiveApi.live(this.liveId).then(responseBody => {
                    if (responseBody.status == 200) {
                        const data = responseBody.content;
                        this.title = data.title;
                        this.subTitle = data.subTitle;
                        this.isReview = data.isReview;
                        this.barrageUrl = 'http://source.48.cn' + data.lrcPath;
                        this.isRadio = data.liveType == 2;
                        this.number = data.number;
                        this.roomId = data.roomId;

                        this.player = videojs('video-js-' + this.liveId, this.playerOptions);

                        const member = LiveApi.member(data.memberId);
                        this.$refs['barrage-box-' + this.liveId].senderName = Tools.getSenderName() || '超绝可爱' + member.real_name;

                        this.pictures = Tools.pictureUrls(data.picPath);

                        this.player.volume(this.$refs.controls.volume * 0.01);

                        //时长
                        this.player.on('loadeddata', event => {
                            this.duration = event.target.player.duration();

                            if (this.isReview) {
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
                                title: '播放完毕',
                                desc: ''
                            });
                        });

                        if (!this.isReview) {
                            this.play();
                            this.connectChatroom();
                        }

                        this.spinShow = false;
                    }
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            getBarrages: function () {
                LiveApi.barrage(this.barrageUrl).then(response => {
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
            play: function () {
                this.player.play();
                this.status = STATUS_PLAYING;
            },
            pause: function () {
                this.player.pause();
                this.status = STATUS_PREPARED;
            },
            mute: function () {
                this.player.volume(0);
                this.isMuted = true;
                this.volumeDisabled = true;
            },
            unmute: function () {
                this.player.volume(this.volume * 0.01);
                this.isMuted = false;
                this.volumeDisabled = false;
            },
            onVolumeChange: function (volume) {
                this.volume = volume
            },
            getType: function (url) {
                if (url.includes('.mp4')) {
                    return 'video/mp4';
                } else if (url.includes('.m3u8')) {
                    return 'application/x-mpegURL';
                } else if (url.includes('.flv')) {
                    return 'video/flv';
                }
            },
            progressChange: function (progress) {
                this.player.currentTime(progress);
                //重新加载弹幕
                this.barrageList = [];
                this.finalBarrageList.forEach(item => {
                    if (Tools.timeToSecond(item.time) - 2 > progress) {
                        this.barrageList.push(item);
                    }
                });
                this.currentBarrage = this.barrageList.shift();
            },
            loadBarrages: function () {
                if (this.barrageList.length == 0) return;
                const barrageTime = Tools.timeToSecond(this.currentBarrage.time);
                if (barrageTime > this.currentTime - 1 && barrageTime < this.currentTime + 1) { //弹幕可误差1秒
                    this.$refs['barrage-box-' + this.liveId].shoot({
                        content: this.currentBarrage.content,
                        username: this.currentBarrage.username
                    });
                    this.currentBarrage = this.barrageList.shift();
                    this.loadBarrages();
                }
            },
            changePlayer: function () {
                this.$emit('change-player', 'flvjs', this.liveId);
            },
            sendBarrage: function () {
                if (this.seconds != Tools.BARRAGE_SEND_INTERVAL || this.$refs['barrage-box-' + this.liveId].content.length == 0 || this.$refs['barrage-box-' + this.liveId].senderName.length
                    == 0) {
                    return;
                }
                const custom = {
                    sourceId: this.$route.params.liveId,
                    preLiveTime: 0,
                    source: 'member_live',
                    chatType: 1,
                    senderLevel: '' + Math.floor(Math.random() * (6 - 1 + 1) + 1),
                    senderId: undefined,
                    fromApp: 2,
                    isBarrage: 0,
                    contentType: 1,
                    senderRole: 0,
                    content: this.$refs['barrage-box-' + this.liveId].content,
                    senderName: this.$refs['barrage-box-' + this.liveId].senderName,
                    isGuardMan: 0,
                    senderAvatar: '',
                    platform: 'android',
                    liveStartTime: '',
                    text: this.$refs['barrage-box-' + this.liveId].content,
                    senderHonor: ';',

                };
                const message = {
                    text: this.$refs['barrage-box-' + this.liveId].content,
                    custom: JSON.stringify(custom),
                    type: 'text',
                    chatroomId: this.roomId,
                    done: (error) => {
                        if (error == null) {
                            this.$refs['barrage-box-' + this.liveId].shoot({
                                username: this.$refs['barrage-box-' + this.liveId].senderName,
                                content: this.$refs['barrage-box-' + this.liveId].content
                            });
                            this.senderNameReadonly = true;
                        }
                        this.sendDisabled = true;
                        this.$refs['barrage-box-' + this.liveId].content = '';
                        const timer = setInterval(() => {
                            this.sendText = '发送(' + this.seconds + ')';
                            this.seconds--;
                            if (this.seconds == 0) {
                                this.sendText = '发送';
                                clearInterval(timer);
                                this.seconds = Tools.BARRAGE_SEND_INTERVAL;
                                this.sendDisabled = false;
                            }
                        }, 1000);

                        Tools.setSenderName(this.$refs.barrageBox.senderName);
                    }
                };

                this.chatroom.sendText(message);
            },
            //连接聊天室
            connectChatroom: function () {
                const options = {
                    roomId: this.roomId,
                    onConnect: () => {
                        this.$Notice.success({
                            title: '聊天室连接成功',
                            desc: ''
                        });
                    },
                    onDisconnect: (message) => {
                        this.$Notice.success({
                            title: '聊天室连接断开',
                            desc: ''
                        });
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
                                const custom = JSON.parse(message.custom);
                                console.log(custom);
                                switch (custom.contentType) {
                                    case 1: //弹幕消息
                                        let level = 1;
                                        if (custom.senderRole == 1) {
                                            level = 3;
                                        } else if (custom.isBarrage) {
                                            level = 2;
                                        }
                                        this.$refs['barrage-box-' + this.liveId].shoot({
                                            content: custom.content,
                                            username: custom.senderName,
                                            level: level
                                        });
                                        break;
                                    case 3: //礼物信息
                                        this.$refs['barrage-box-' + this.liveId].shoot({
                                            username: custom.senderName,
                                            content: '送出了' + custom.giftCount + '个' + custom.giftName,
                                            level: 0
                                        });
                                        console.log(custom);
                                        break;
                                    case 6: //观看人数
                                        this.number = custom.content.number;
                                        break;
                                    case 8:
                                        this.endTipsShow = true;
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
        }
    }
</script>

<style scoped>
    .carousel {
        position: absolute !important;
        background-color: #fff;
    }
</style>

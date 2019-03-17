<template>
    <div class="layout">
        <Layout>
            <PlayerHeader other-player="videojs" :video-url="streamPath"
                          @change-player="changePlayer"></PlayerHeader>
            <Content style="padding: 16px;">
                <div class="player-container">
                    <Spin size="large" fix v-if="spinShow"></Spin>

                    <Card>
                        <p slot="title">{{subTitle}}</p>
                        <p slot="extra">
                            <span>{{title}}</span>
                        </p>

                        <Carousel class="video" v-if="isRadio" autoplay loop :autoplay-speed="8000">
                            <CarouselItem v-for="picture in pictures" :key="picture">
                                <img class="picture" :src="picture">
                            </CarouselItem>
                        </Carousel>

                        <video class="video" :id="'flv-js-' + liveId" ref="video" v-else></video>

                        <PlayerControls ref="controls" :show-play-button="isReview"
                                        :is-muted="isMuted"
                                        :show-progress="isReview"
                                        :is-playing="isPlaying" :volume-disabled="volumeDisabled"
                                        @play="play" @pause="pause" @mute="mute" @unmute="unmute"
                                        @progress="progressChange"
                                        @volume="volumeChange"
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

        <Modal v-model="endTipsShow"
               title="提示">
            <p>直播结束</p>
        </Modal>
    </div>
</template>

<script>
    import PlayerHeader from './PlayerHeader';
    import PlayerControls from './PlayerControls';
    import Barrage from "./Barrage";
    import Casitem from "iview/src/components/cascader/casitem";
    import Tools from "../assets/js/tools";
    import ChatRoomTools from '../assets/js/chatroom-tools';
    import LiveApi from "../assets/js/live-api";
    import BarrageBox from "./BarrageBox";

    const STATUS_PLAYING = 1;
    const STATUS_PREPARED = 0;

    export default {
        name: 'FlvJs',
        components: {BarrageBox, Casitem, Barrage, PlayerControls, PlayerHeader},
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
                spinShow: true,
                flvPlayer: null,
                barrageUrl: '',
                title: '',
                subTitle: '',
                status: STATUS_PREPARED,
                isMuted: false,
                volumeDisabled: false,
                duration: 0,
                currentTime: 0,
                isReview: true,      //是否回放
                volume: Tools.getVolume(),
                currentBarrage: {},
                finalBarrageList: [],
                barrageList: [],
                roomId: '',
                isRadio: false,
                pictures: [],
                content: '',
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
            }
        },
        watch: {
            volume: function (newVolume) {
                this.flvPlayer.volume = newVolume * 0.01;
            }
        },
        created: function () {
            this.$Notice.config({
                top: 200
            });

            this.getOne();
        },
        destroyed: function () {
            if (this.chatroom !== null) {
                this.chatroom.disconnect();
            }

            if (this.flvPlayer !== null) {
                this.flvPlayer.destroy();
            }
        },
        methods: {
            getOne: function () {
                LiveApi.live(this.liveId).then(responseBody => {
                    console.log(responseBody);
                    if (responseBody.status == 200) {
                        const data = responseBody.content;
                        this.streamPath = Tools.streamPathHandle(data.streamPath, data.startTime);
                        this.title = data.title;
                        this.subTitle = data.subTitle;
                        this.isReview = data.isReview;
                        this.barrageUrl = 'http://source.48.cn' + data.lrcPath;
                        this.roomId = data.roomId;
                        this.isRadio = data.liveType == 2;
                        this.number = data.number;

                        const member = LiveApi.member(data.memberId);
                        this.$refs['barrage-box-' + this.liveId].senderName = Tools.getSenderName() || '超绝可爱' + member.real_name;

                        this.pictures = Tools.pictureUrls(data.picPath);

                        this.init();
                    } else {
                        this.$Message.error(responseBody.message);
                    }
                }).catch(error => {
                    this.spinShow = false;
                    console.log(error);
                });
            },
            init: function () {
                if (this.$flvjs.isSupported()) {
                    const videoElement = document.getElementById('flv-js-' + this.liveId);
                    this.flvPlayer = this.$flvjs.createPlayer({
                        type: this.getType(this.streamPath),
                        url: this.streamPath,
                        isLive: !this.isReview
                    });
                    this.flvPlayer.attachMediaElement(videoElement);
                    this.flvPlayer.volume = this.$refs.controls.volume * 0.01;

                    //当前进度
                    this.$refs.video.addEventListener('timeupdate', event => {
                        this.currentTime = event.target.currentTime;
                        //弹幕
                        if (this.isReview) {  //录播
                            this.loadBarrages();
                        }
                    });
                    //播放结束
                    this.$refs.video.addEventListener('ended', () => {
                        this.status = STATUS_PREPARED;
                        this.$Notice.info({
                            title: '播放完毕',
                            desc: ''
                        });
                    });

                    this.spinShow = false;
                    this.flvPlayer.load();

                    if (this.isReview) {  //录播
                        this.getBarrages();
                        //时长
                        this.flvPlayer.on(this.$flvjs.Events.MEDIA_INFO, media => {
                            this.duration = media.duration / 1000;
                        });
                    } else {              //直播
                        this.flvPlayer.on(this.$flvjs.Events.MEDIA_INFO, media => {
                            this.play();
                        });
                        this.connectChatroom();
                    }
                }
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
                this.flvPlayer.play();
                this.status = STATUS_PLAYING;
            },
            pause: function () {
                this.flvPlayer.pause();
                this.status = STATUS_PREPARED;
            },
            mute: function () {
                this.flvPlayer.volume = 0;
                this.isMuted = true;
                this.volumeDisabled = true;
            },
            unmute: function () {
                this.flvPlayer.volume = this.volume * 0.01;
                this.isMuted = false;
                this.volumeDisabled = false;
            },
            getType: function (url) {
                if (url.includes('.mp4')) {
                    return 'mp4';
                } else if (url.includes('.flv')) {
                    return 'flv';
                }
            },
            progressChange: function (progress) {
                this.flvPlayer.currentTime = progress;
                //重新加载弹幕
                this.barrageList = [];
                this.finalBarrageList.forEach(item => {
                    if (Tools.timeToSecond(item.time) - 2 > progress) {
                        this.barrageList.push(item);
                    }
                });
                this.currentBarrage = this.barrageList.shift();
            },
            volumeChange: function (volume) {
                this.volume = volume;
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
            sendBarrage: function () {
                if (this.seconds != Tools.BARRAGE_SEND_INTERVAL || this.content.length == 0 || this.$refs['barrage-box-' + this.liveId].senderName.length == 0) {
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
                    content: this.content,
                    senderName: this.$refs['barrage-box-' + this.liveId].senderName,
                    isGuardMan: 0,
                    senderAvatar: '',
                    platform: 'android',
                    liveStartTime: '',
                    text: this.content,
                    senderHonor: ';',

                };
                const message = {
                    text: this.content,
                    custom: JSON.stringify(custom),
                    type: 'text',
                    chatroomId: this.roomId,
                    done: (error) => {
                        if (error == null) {
                            this.$refs['barrage-box-' + this.liveId].shoot({
                                username: this.$refs['barrage-box-' + this.liveId].senderName,
                                content: this.content
                            });
                            this.$refs['barrage-box-' + liveId].senderNameReadonly = true;
                        }
                        this.sendDisabled = true;
                        this.content = '';
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

                        Tools.setSenderName(this.$refs['barrage-box-' + this.liveId].senderName);
                    }
                };

                this.chatroom.sendText(message);
            },
            changePlayer: function () {
                this.$emit('change-player', 'videojs', this.liveId);
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
                                        this.endShow = true;
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
                    this.$Notice.success({
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
    .barrage-input-box {
        display: flex;
    }
</style>

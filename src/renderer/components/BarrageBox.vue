<template>
    <Card style="flex: 1 0 auto;margin-left: 16px;">
        <p slot="title">
            <span>弹幕</span>
            <span style="color: #ccc;" v-if="chatRoomStatus == 0">未连接</span>
            <span style="color: #19be6b;" v-else>已连接</span>
        </p>
        <p slot="extra">观看人数：{{number}}</p>

        <div class="barrage-container">
            <Barrage class="barrage-box" ref="barrage"></Barrage>

            <div class="barrage-input-box" v-if="showInput">
                <Poptip trigger="hover" title="发送者名称" style="margin-left:8px;">
                    <div slot="content">
                        <p>请勿滥用</p>
                        <p>请勿Diss小偶像</p>
                        <p>请勿KY</p>
                    </div>
                    <Input style="width:160px;" v-model="senderName"
                           placeholder="发送者名称"/>
                </Poptip>

                <Input v-model="content" placeholder="请填写弹幕内容"
                       style="margin-left: 8px;" clearable
                       @on-enter="sendBarrage"/>

                <Button type="primary" style="margin-left: 8px;"
                        @click="sendBarrage"
                        :disabled="sendDisabled">
                    {{sendText}}
                </Button>
            </div>
        </div>
    </Card>
</template>

<script>
    import Barrage from './Barrage';

    export default {
        name: "BarrageBox",
        props: {
            number: {
                type: Number,
                required: true,
                default: 0
            },
            sendDisabled: {
                type: Boolean,
                required: true,
                default: false
            },
            sendBarrage: {
                type: Function,
                required: true
            },
            sendText: {
                type: String,
                required: true,
                default: ''
            },
            showInput: {
                type: Boolean,
                required: true,
                default: false
            },
            chatRoomStatus: {
                type: Number,
                required: true,
                default: ''
            }
        },
        components: {Barrage},
        data() {
            return {
                senderName: '',
                content: ''
            };
        },
        methods: {
            shoot: function (barrage) {
                this.$refs.barrage.shoot(barrage);
            }
        }
    }
</script>

<style scoped>

</style>

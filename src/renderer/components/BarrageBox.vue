<template>
    <Card style="flex: 1 0 auto;margin-left: 16px;">
        <p slot="title">弹幕</p>
        <p slot="extra">观看人数：{{number}}</p>

        <div class="barrage-container">
            <Barrage class="barrage-box" ref="barrage"></Barrage>

            <div class="barrage-input-box" v-if="showInput">
                <Poptip trigger="hover" title="发送者名称" style="margin-left:8px;">
                    <div slot="content">
                        <p>第一次发送弹幕后将变为只读</p>
                        <p>刷新页面后可再次更改</p>
                        <p>请勿滥用</p>
                        <p>请勿diss小偶像</p>
                        <p>请勿ky</p>
                    </div>
                    <Input style="width:160px;" v-model="senderName"
                           placeholder="发送者名称"
                           :readonly="senderNameReadonly"/>
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
            senderNameReadonly: {
                type: Boolean,
                required: true,
                default: false
            },
            sendDisabled: {
                type: Boolean,
                required: true,
                default: false
            },
            sendBarrage: {
                type: Function,
                required: false,
                default: function () {

                }
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
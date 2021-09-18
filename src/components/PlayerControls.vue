<template>
    <div>
        <div class="progress-container" @mousedown="dragging = true" @mouseup="dragging = false">
            <el-slider :max="duration" class="progress-slider" v-model="progress"
                       @change="progressChange" :format-tooltip="timeFormat"></el-slider>
            <span class="progress-text">{{timeFormat(currentTime)}} / {{timeFormat(duration)}}</span>
        </div>

        <div class="button-box">
            <i class="button icon-playarrow iconfont" @click="play"
               v-if="!isPlaying"></i>

            <i class="button icon-pause iconfont" @click="pause"
               v-if="isPlaying"></i>

            <div class="volume-box">
                <i style="margin-right:8px;" class="volume-icon iconfont icon-volumeup"
                   @click="mute"
                   v-if="!isMuted"></i>

                <i style="margin-right:8px;" class="volume-icon iconfont icon-volumeoff"
                   @click="unmute"
                   v-if="isMuted"></i>

                <el-slider class="volume-slider" :disabled="volumeDisabled" v-model="volume"
                           @change="volumeChange"></el-slider>
            </div>

            <i v-if="showFullScreen" style="margin-left: 8px;" class="button icon-fullscreen iconfont" @click="fullScreen"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator';
    import Database from '@/assets/js/database';

    @Component
    export default class PlayerControls extends Vue {
        protected dragging: boolean = false;
        protected progress: number = 0;
        protected volume: number = Database.instance().getConfig('volume', 80);

        @Prop({type: Boolean, required: true}) protected isPlaying!: boolean;
        @Prop({type: Boolean, required: true}) protected isMuted!: boolean;
        @Prop({type: Boolean, required: true}) protected volumeDisabled!: boolean;
        @Prop({type: Number, required: true}) protected duration!: number;
        @Prop({type: Number, required: true}) protected currentTime!: number;
        @Prop({type: Boolean, required: false, default: false}) protected showFullScreen!: number;

        @Watch('currentTime')
        protected currentTimeChange(newVal: number) {
            if (!this.dragging) {
                this.progress = newVal;
            }
        }

        @Emit()
        protected play(): void {
        }

        @Emit()
        protected pause(): void {
        }

        @Emit()
        protected mute(): void {
        }

        @Emit()
        protected unmute(): void {
        }

        @Emit()
        protected fullScreen(): void {
        }

        @Emit()
        protected volumeChange(volume: number): number {
            Database.instance().setConfig('volume', volume);
            return volume;
        }

        @Emit()
        protected progressChange(newTime: number): number {
            console.info('progress change');
            return newTime;
        }

        protected timeFormat(seconds: any): string {
            seconds = Math.round(seconds);
            let minutes: any = Math.floor(seconds / 60);
            let hours: any = Math.floor(minutes / 60);
            minutes = minutes % 60;
            seconds = seconds % 60;
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            return hours + ':' + minutes + ':' + seconds;
        }
    }
</script>

<style scoped lang="scss">
    .button-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .button {
        cursor: pointer;
        font-size: 32px;
    }

    .progress-container {
        display: inline-flex;
        align-items: center;
        width: 100%;
    }

    .progress-text {
        font-size: 11px;
    }

    .progress-slider {
        flex: 1 0 auto;
        margin: 0 8px;
    }

    .volume-box {
        display: flex;
        flex: 1 0 auto;
        justify-content: flex-end;
        align-items: center;
    }

    .volume-icon {
        font-size: 24px;
        cursor: pointer;
    }

    .volume-slider {
        width: 72px;
    }
</style>

<template>
    <el-card style="flex: 1 0 auto;margin-left: 16px;">
        <div slot="header">
            <el-tag :type="statusType">
              {{statusText}}
            </el-tag>
        </div>
        <div slot="extra">
            <span>观看人数：{{number}} </span>
            <span style="margin-left: 8px;color: #19be6b">开始时间：{{startDate}}</span>
        </div>

        <div class="barrage-container">
            <barrage class="barrage-box" ref="barrage"></barrage>
        </div>
    </el-card>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';
    import Tools from '@/assets/js/tools';
    import Barrage from '@/components/Barrage.vue';

    @Component({
        components: {Barrage}
    })
    export default class BarrageBox extends Vue {
        @Prop({type: Number, required: true}) private number!: number;
        @Prop({type: Number, required: true}) private startTime!: any;
        @Prop({type: Boolean, required: true}) private barrageLoaded!: boolean;
        protected startDate: string = Tools.dateFormat(parseInt(this.startTime), 'yyyy-MM-dd hh:mm');
        public $refs!: {
            barrage: HTMLFormElement
        };

        get statusType() {
          return this.barrageLoaded ? 'success' : 'info';
        }

        get statusText() {
          return this.barrageLoaded ? '弹幕已加载' : '弹幕未加载';
        }

        public clear() {
            this.$refs.barrage.clear();
        }

        public shoot(barrage: any) {
            this.$refs.barrage.shoot(barrage);
        }
    }
</script>

<style scoped>

</style>

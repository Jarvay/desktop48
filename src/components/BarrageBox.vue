<template>
    <el-card style="flex: 1 0 auto;margin-left: 16px;">
        <div slot="header">
            <span>弹幕</span>
            <span style="color: #ccc;" v-if="!barrageLoaded">未加载</span>
            <span style="color: #19be6b;" v-else>已加载</span>
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
        private startDate: string = Tools.dateFormat(parseInt(this.startTime), 'yyyy-MM-dd hh:mm');
        public $refs!: {
            barrage: HTMLFormElement
        };

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

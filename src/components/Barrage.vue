<template>
    <el-card style="min-width: 480px;height: inherit;">
        <ul id="barrage-ul" style="overflow-y: auto;height: 620px;">
            <li v-for="(barrage, index) in barrageList" class="barrage-item">
                <span class="barrage-username">{{barrage.username}}：</span>
                <span>{{barrage.content}}</span>
            </li>
        </ul>
    </el-card>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';

    @Component
    export default class Barrage extends Vue {
        private barrageList: any[] = [];

        private updated() {
            this.$nextTick(() => {
                const barrageUl: any = document.getElementById('barrage-ul');
                barrageUl.scrollTop = barrageUl.scrollHeight;
            });
        }

        public shoot(barrage: any) {
            if (this.barrageList.length >= 30) {
                this.barrageList.shift();
            }
            this.barrageList.push({
                content: barrage.content,
                username: barrage.username,
                level: barrage.level,
            });
        }

        public clear() {
            this.barrageList = [];
        }
    }
</script>

<style scoped lang="scss">
    .barrage-item {
        margin-top: 4px;
        list-style: none;
        text-align: left;
        font-size: 18px;
        font-family: "Microsoft YaHei", serif;

        .barrage-username {
            color: #18c8cc;
        }
    }
</style>

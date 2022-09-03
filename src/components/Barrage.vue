<template>
    <ul id="barrage-ul" style="overflow-y: auto;">
        <li v-for="(barrage, index) in barrageList" class="barrage-item" :key="index">
            <span class="barrage-time">{{barrage.time}}</span>
            <span class="barrage-username">{{barrage.username}}：</span>
            <span>{{barrage.content}}</span>
        </li>
    </ul>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Constants from "@/assets/js/constants";

    @Component
    export default class Barrage extends Vue {
        protected barrageList: any[] = [];

        protected updated() {
            this.$nextTick(() => {
                const barrageUl: any = document.getElementById('barrage-ul');
                barrageUl.scrollTop = barrageUl.scrollHeight;
            });
        }

        public shoot(barrage: any) {
            if (this.barrageList.length >= Constants.MAX_BARRAGE_LENGTH) {
                this.barrageList.shift();
            }
            this.barrageList.push({
                content: barrage.content,
                username: barrage.username,
                level: barrage.level,
                time: barrage.time.replace(/\.[0-9]*/, ''),
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
            margin-left: 16px;
        }

      .barrage-time {
        color: #bfbfbf;
      }
    }
</style>

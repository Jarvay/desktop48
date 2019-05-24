<template>
    <Card style="min-width: 480px;height: inherit;">
        <CellGroup id="cell-group" style="overflow-y: auto;height: 620px;">
            <Cell v-for="(barrage, index) in barrageList">
                <div class="barrage-item">
                    <span class="barrage-username">{{barrage.username}}：</span>
                    <span>{{barrage.content}}</span>
                </div>
            </Cell>
        </CellGroup>
    </Card>
</template>

<script>
    export default {
        name: 'Barrage',
        data() {
            return {
                barrageList: [],
                randomCount: 0,
            };
        },
        created() {

        },
        updated() {
            this.$nextTick(() => {
                const cellGroup = document.getElementById('cell-group');
                cellGroup.scrollTop = cellGroup.scrollHeight;
            });
        },
        methods: {
            shoot: function (barrage) {
                if (this.barrageList.length >= 30) {
                    this.barrageList.shift();
                }
                this.barrageList.push({
                    content: barrage.content,
                    username: barrage.username,
                    level: barrage.level,
                });
            },
            clear: function () {
                this.barrageList = [];
            }
        }
    }
</script>

<style scoped lang="scss">
    .barrage-item {
        font-size: 18px;
        font-family: "Microsoft YaHei", serif;

        .barrage-username {
            color: #18c8cc;
        }
    }
</style>

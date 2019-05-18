<template>
    <Card>
        <Scroll :on-reach-bottom="onReachBottom" height="700" :distance-to-edge="distance">
            <Table :columns="columns" :data="list">

            </Table>
        </Scroll>
    </Card>
</template>

<script>
    import Apis from "../assets/js/apis";
    import Dev from "../assets/js/dev";

    export default {
        name: "Trips",
        data() {
            return {
                distance: -10,
                lastTime: 0,
                list: [],
                columns: [
                    {
                        title: '标题',
                        key: 'title'
                    },
                    {
                        title: '简介',
                        key: 'desc'
                    },
                    {
                        title: '日期',
                        key: 'date'
                    }
                ],
            };
        },
        created() {
            this.trips();
        },
        methods: {
            trips: function () {
                Apis.trips(this.lastTime).then(content => {
                    this.lastTime = content.data[content.data.length - 1].timestamp;
                    const newList = [];
                    content.data.forEach(item => {
                        const newItem = {
                            title: item.title,
                            desc: item.subTitle,
                            date: `${item.showDate} ${item.showTime}`
                        };
                        newList.push(newItem);
                    });
                    this.list = this.list.concat(newList);
                }).catch(error => {
                    this.$Message.error({
                        content: error
                    });
                    Dev.error(error);
                });
            },
            onReachBottom: function () {
                this.trips();
            }
        }
    }
</script>

<style scoped>

</style>
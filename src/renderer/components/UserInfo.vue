<template>
    <div>
        <Card>
            <div slot="title" style="height: auto;">
                <div class="user-info-header">
                    <Avatar size="large" :src="avatarUrl()"></Avatar>
                    <span style="margin-top: 4px;">{{userInfo.nickname}}</span>
                    <Tag style="margin-top: 4px;" color="geekblue">Lv{{userInfo.level}}</Tag>
                </div>
            </div>
            <CellGroup>
                <Cell title="粉丝">
                    <p slot="extra">
                        <Tag color="blue">{{userInfo.followers}}</Tag>
                    </p>
                </Cell>
                <Cell title="关注">
                    <p slot="extra">
                        <Tag color="blue">{{userInfo.friends}}</Tag>
                    </p>
                </Cell>
                <Cell title="鸡腿">
                    <p slot="extra">
                        <Tag color="blue">{{userInfo.money}}</Tag>
                    </p>
                </Cell>
                <Cell title="徽章">
                    <p slot="extra">
                        <Tag color="blue">{{userInfo.badgeCount}}</Tag>
                    </p>
                </Cell>
                <Cell title="应援力">
                    <p slot="extra">
                        <Tag color="blue">{{userInfo.support}}</Tag>
                    </p>
                </Cell>
            </CellGroup>
        </Card>
    </div>
</template>

<script>
    import Tools from '../assets/js/tools';

    export default {
        name: "UserInfo",
        props: {
            userInfo: {
                type: Object,
                require: true
            }
        },
        methods: {
            avatarUrl: function () {
                return Tools.sourceUrl(this.userInfo.avatar)
            }
        }
    }
</script>

<style scoped>
    .user-info-header {
        display: flex;
        align-items: center;
        flex-direction: column;
    }
</style>
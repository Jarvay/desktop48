<template>
    <el-card class="live-card" shadow="hover">
        <div slot="header">
            <div class="live-header">
                <span class="live-title">{{item.title}}</span>

                <div>
                    <el-tag v-if="item.liveType === 1">直播</el-tag>
                    <el-tag v-else type="warning">电台</el-tag>
                </div>
            </div>
        </div>

        <div class="cover-container">
            <el-image ref="cover" class="cover" :src="item.cover[0]" fit="cover"/>
        </div>
        <p class="live-date">{{item.date}}</p>
        <div style="display: flex;justify-content: space-between;">
            <div class="member-info">
                <span style="color: #000;">{{item.userInfo.nickname}}</span>
                <span class="team-badge"
                      :style="{'background-color':`#${item.member.team.teamColor}`}">{{item.member.team.teamName.replace('TEAM ', '')}}</span>
            </div>
        </div>
    </el-card>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from 'vue-property-decorator';

    @Component
    export default class LiveItem extends Vue {
        @Prop({type: Object, required: true}) private item!: object;
    }
</script>

<style scoped>

</style>

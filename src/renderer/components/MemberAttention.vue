<template>
    <div>
        <Spin fix size="large" v-if="spinShow"></Spin>

        <Collapse simple accordion>
            <Panel v-for="(team, teamIndex) in teams">
                <span>{{team.teamName}}</span>
                <CellGroup slot="content">
                    <Cell v-for="(member, memberIndex) in team.members">
                        <p>
                            <span class="team-badge" :style="{backgroundColor: `#${team.teamColor}`}">{{team.teamName.replace('TEAM ', '')}}</span>
                            <span>{{member.realName}}</span>
                        </p>

                        <Tag @on-change="onFollowChange(teamIndex, member, memberIndex)" class="follow-tag"
                             slot="extra"
                             :checked="member.isFollowed" :color="`#${team.teamColor}`" checkable>
                            {{member.followText}}
                        </Tag>
                    </Cell>
                </CellGroup>
            </Panel>
        </Collapse>
    </div>
</template>

<script>
    import Database from "../assets/js/database";
    import Dev from "../assets/js/dev";
    import Apis from "../assets/js/apis";

    export default {
        name: "MemberAttention",
        data() {
            return {
                teams: [],
                followMembers: [],
                spinShow: false,
            };
        },
        created() {
            this.teams = Database.teamsDB().value();

            if (Database.isLogin()) {
                this.followMemberList();
            }
        },
        methods: {
            followMemberList: function () {
                Apis.followMemberList().then(content => {
                    this.followMembers = content.list;
                    this.teams = this.teams.filter(team => {
                        team.members = Database.membersDB().filter({teamId: team.teamId, status: 1}).value();
                        team.members = team.members.map(member => {
                            member.isFollowed = this.followMembers.some(follow => {
                                return follow.userInfo.userId == member.userId;
                            });
                            member.followText = member.isFollowed ? '已关注' : '关注';
                            return member;
                        });
                        return team.members.length > 0;
                    });
                }).catch(error => {
                    Dev.error(error);
                })
            },
            onFollowChange: function (teamIndex, member, memberIndex) {
                this.spinShow = true;
                if (member.isFollowed) {    //取消关注
                    Apis.removeSingleAttention(member.userId).then(content => {
                        this.spinShow = false;
                        this.$Message.success({
                            content: '已取消关注'
                        });
                        this.updateMembers(teamIndex, member, memberIndex, false);
                    }).catch(error => {
                        this.spinShow = false;
                        this.$Message.error({
                            content: error
                        });
                    });
                } else {    //关注
                    Apis.addSingleAttention(member.userId).then(content => {
                        this.spinShow = false;
                        this.$Message.success({
                            content: '已关注'
                        });
                        this.updateMembers(teamIndex, member, memberIndex, true);
                    }).catch(error => {
                        this.spinShow = false;
                        this.$Message.error({
                            content: error
                        });
                    });
                }
            },
            updateMembers: function (teamIndex, member, memberIndex, isFollowed) {
                this.teams[teamIndex].members[memberIndex].isFollowed = isFollowed;
                this.teams[teamIndex].members[memberIndex].followText = isFollowed ? '已关注' : '关注';
                const newTeam = this.teams[teamIndex];
                this.$set(this.teams, teamIndex, newTeam);
            }
        }
    }
</script>

<style scoped>
    .team-card {
        margin-bottom: 8px;
    }

    .follow-tag {
        margin-left: 8px;
    }
</style>
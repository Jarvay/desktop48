<template>
    <div>
        <Collapse>
            <Panel>
                <span slot="">接收以下小偶像的直播通知（免登陆）</span>
                <Collapse slot="content" simple accordion>
                    <Panel v-for="(team, teamIndex) in teams">
                        <span>{{team.teamName}}</span>
                        <div slot="content">
                            <Tag @on-change="onChange" checkable :checked="member.checked"
                                 :name="member.userId"
                                 :color="`#${team.teamColor}`"
                                 v-for="member in team.members">
                                {{member.realName}}
                            </Tag>
                        </div>
                    </Panel>
                </Collapse>
            </Panel>
        </Collapse>
    </div>
</template>

<script>
    import Database from "../assets/js/database";
    import Dev from "../assets/js/dev";

    export default {
        name: "NoticeMembers",
        data() {
            return {
                teams: []
            };
        },
        created() {
            this.teams = Database.teamsDB.value();

            this.teams = this.teams.filter(team => {
                team.members = Database.membersDB.filter({teamId: team.teamId, status: 1}).value();
                team.members = team.members.map(member => {
                    member.checked = Database.getNoticeMembers().some(memberId => {
                        return memberId == member.userId;
                    });
                    return member;
                });
                return team.members.length > 0;
            });
        },
        methods: {
            onChange: function (checked, memberId) {
                if (checked) {
                    Database.addNoticeMember(memberId);
                } else {
                    Database.removeNoticeMember(memberId);
                }
                Dev.log('noticeMembers', Database.getNoticeMembers());
            }
        }
    }
</script>

<style scoped>

</style>
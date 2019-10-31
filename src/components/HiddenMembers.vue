<template>
    <div style="text-align: left;">
        <el-cascader style="width: 320px;" transfer placeholder="请选择成员"
                     clearable
                     filterable
                     :options="members"
                     v-model="selectedMember"></el-cascader>
        <el-button style="margin-left: 8px;" type="primary" @click="addHiddenMember">屏蔽</el-button>

        <el-button style="margin-left: 8px;" type="danger" @click="clear">清空</el-button>

        <div style="margin-top: 8px;">
            <el-tag :style="{color: 'white',borderColor:member.team.teamColor, marginRight: '8px'}" :name="member.userId" closable
                    @close="removeHiddenMember(member.userId)"
                    :color="member.team.teamColor"
                    v-for="member in hiddenMembers"
                    :key="member.userId">
                {{member.realName}}
            </el-tag>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';
    import Database from '@/assets/js/database';
    import Debug from '@/assets/js/debug';

    @Component
    export default class HiddenMembers extends Vue {
        //屏蔽成员
        protected hiddenMembers: any[] = [];
        //所有成员
        protected members: any[] = Database.instance().getMemberOptions();

        protected selectedMember: any[] = [];

        protected created() {
            Database.instance().getHiddenMembers().forEach((memberId: number) => {
                if (memberId !== null) {
                    const member: any = Database.instance().member(memberId);
                    member.team.teamColor = member.team.teamColor === '' ? '#409eff' : `#${member.team.teamColor}`;
                    this.hiddenMembers.push(member);
                }
            });
        }

        protected clear() {
            Database.instance().clearHiddenMembers();
            this.hiddenMembers = [];
        }

        /**
         * 添加屏蔽成员
         */
        protected addHiddenMember() {
            Debug.log('selected memberId', this.selectedMember[2]);
            Debug.log('hidden memberIds', Database.instance().getHiddenMembers());
            if (typeof this.selectedMember[2] === 'undefined') {
                this.$message({
                    message: '请选中需要屏蔽的成员',
                    type: 'warning'
                });
                return;
            }
            const exists = Database.instance().getHiddenMembers().some((memberId: number) => {
                return memberId === this.selectedMember[2];
            });
            if (exists) {
                this.$message({
                    message: '请勿重复添加',
                    type: 'warning'
                });
                return;
            }
            const member: any = Database.instance().member(this.selectedMember[2]);
            member.team.teamColor = member.team.teamColor === '' ? '#409eff' : `#${member.team.teamColor}`;
            this.hiddenMembers.push(member);
            Database.instance().addHiddenMember(this.selectedMember[2]);
        }

        /**
         * 移除屏蔽成员
         * @param memberId
         */
        protected removeHiddenMember(memberId: number) {
            this.hiddenMembers = this.hiddenMembers.filter((member: any) => {
                return member.userId !== memberId;
            });
            Database.instance().removeHiddenMember(memberId.toString());
            Debug.log('remove memberId', memberId);
            Debug.log('hidden memberIds', Database.instance().getHiddenMembers());
        }
    }
</script>

<style scoped lang="scss">

</style>

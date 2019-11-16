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
            <el-tag :style="{color: 'white',borderColor:member.team.teamColor, marginRight: '8px'}"
                    :name="member.userId" closable
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
    import {mutations, store} from "@/assets/js/store";

    @Component
    export default class HiddenMembers extends Vue {
        //所有成员
        protected members: any[] = Database.instance().getMemberOptions();

        protected selectedMember: any[] = [];

        get hiddenMembers() {
            let members: any[] = Database.instance().membersDB.filter((member: any) => {
                return store.hiddenMemberIds.some((memberId: number) => memberId == member.userId);
            }).sortBy((member: any) => store.hiddenMemberIds.findIndex((memberId: number) => memberId == member.userId)).value() || [];

            members.forEach((member: any) => {
                member.team = Database.instance().team(member.teamId);
                member.team.teamColor = member.team.teamColor == '' ? '#409eff' : `#${member.team.teamColor}`;
            });
            return members;
        }

        protected created() {

        }

        protected clear() {
            mutations.setHiddenMemberIds([]);
        }

        /**
         * 添加屏蔽成员
         */
        protected addHiddenMember() {
            console.log('selected memberId', this.selectedMember[2]);
            console.log('hidden memberIds', Database.instance().getHiddenMembers());
            if (typeof this.selectedMember[2] === 'undefined') {
                this.$message({
                    message: '请选中需要屏蔽的成员',
                    type: 'warning'
                });
                return;
            }
            const exists = store.hiddenMemberIds.some((memberId: number) => memberId == this.selectedMember[2]);
            console.log(exists);
            if (exists) {
                this.$message({
                    message: '请勿重复添加',
                    type: 'warning'
                });
                return;
            }
            const member: any = Database.instance().member(this.selectedMember[2]);
            member.team.teamColor = member.team.teamColor == '' ? '#409eff' : `#${member.team.teamColor}`;
            const tempIds = Array.from(store.hiddenMemberIds);
            tempIds.push(member.userId);
            mutations.setHiddenMemberIds(tempIds);
            this.selectedMember = [];
        }

        /**
         * 移除屏蔽成员
         * @param memberId
         */
        protected removeHiddenMember(memberId: number) {
            mutations.setHiddenMemberIds(store.hiddenMemberIds.filter((item: number) => item != memberId));
            console.log('remove memberId', memberId);
            console.log('hidden memberIds', Database.instance().getHiddenMembers());
        }
    }
</script>

<style lang="scss">
    .el-icon-close:before {
        color: #fff !important;
    }

    .el-tag {
        .el-tag__close {
            color: #fff !important;
        }
    }
</style>

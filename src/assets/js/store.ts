import Database from "@/assets/js/database";
import Vue from 'vue';

export const store: any = Vue.observable({
    hiddenMemberIds: Database.instance().getHiddenMembers(),
    memberOptions: Database.instance().getMemberOptions(),
    teamOptions: Database.instance().getTeamOptions(),
    groupOptions: Database.instance().getGroupOptions()
});

export const mutations: any = {
    setHiddenMemberIds(newValue: []) {
        store.hiddenMemberIds = newValue;
        Database.instance().setHiddenMembers(newValue);
    },
    setMemberOptions(newValue: []) {
        store.memberOptions = newValue;
    },
    setTeamOptions(newValue: []) {
        store.teamOptions = newValue;
    },
    setGroupOptions(newValue: []) {
        store.groupOptions = newValue;
    }
};

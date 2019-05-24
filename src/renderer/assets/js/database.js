import Constants from "./constants";
import data from './data';

class Database {
    static member(memberId) {
        memberId = parseInt(memberId);
        let member = Database.membersDB.find({userId: memberId}).value();
        if (typeof member === "undefined") {
            member = Constants.UNKNOWN_USER;
            member.team = {
                teamName: 'unknown',
                teamColor: 'ccc'
            };
        } else {
            member.team = Database.teamsDB.find({teamId: member.teamId}).value();
        }
        return member;
    }

    static team(teamId) {
        const team = Database.teamsDB.find({teamId: teamId}).value();
        const members = Database.membersDB.filter({teamId: teamId}).value();

        const tmpMembers = [];
        for (let i = 0; i < members.length; i++) {
            tmpMembers.push(Database.member(members[i].userId));

        }
        team.members = tmpMembers;
        return team;
    }

    static group(groupId) {
        const group = Database.groupsDB.find({groupId: groupId}).value();

        const teams = Database.teamsDB.filter({groupId: groupId}).value();

        const tmpTeams = [];
        for (let i = 0; i < teams.length; i++) {
            tmpTeams.push(Database.team(teams[i].teamId));
        }
        group.teams = tmpTeams;
        return group;
    }

    /**
     * 分团列表
     * @returns {Array}
     */
    static groups() {
        const groups = Database.groupsDB.value();
        const result = [];
        for (let i = 0; i < groups.length; i++) {
            result.push(Database.group(groups[i].groupId));
        }
        return result;
    }

    static setLoginUserInfo(userInfo) {
        Database.db.set('loginUserInfo', userInfo).write();
    }

    static getLoginUserInfo() {
        return Database.get('loginUserInfo', null);
    }

    static removeLoginUserInfo() {
        Database.db.unset('loginUserInfo').write();
    }

    static getToken() {
        return Database.get('token', '');
    }

    static setToken(token) {
        Database.db.set('token', token).write();
    }

    static removeToken() {
        Database.db.unset('token').write();
    }

    static isLogin() {
        return Database.db.has('token').value();
    }

    static setAccid(accid) {
        Database.db.set('accid', accid).write();
    }

    static getAccid() {
        return Database.get('accid', null);
    }

    static setIMPwd(accid) {
        Database.db.set('imPwd', accid).write();
    }

    static getIMPwd() {
        return Database.get('imPwd', '');
    }

    static incrementBadgeCount(ownerId) {
        if (typeof Database.db.get('badgeCount').find({ownerId: ownerId}).value() === "undefined") {
            Database.db.get('badgeCount').push({
                ownerId: ownerId,
                count: 1
            }).write();
        } else {
            Database.db.get('badgeCount').find({ownerId: ownerId}).update('count', n => n + 1).write();
        }
    }

    static clearBadgeCount(ownerId) {
        Database.db.get('badgeCount').remove({ownerId: ownerId}).write();
    }

    static getBadgeCount(ownerId) {
        const item = Database.db.get('badgeCount').find({ownerId: ownerId}).value();
        if (typeof item === "undefined") {
            return 0;
        }
        return item.count;
    }

    static setLastCheckInTime(lastCheckInTime) {
        Database.db.set('lastCheckInTime', lastCheckInTime).write();
    }

    static getLastCheckInTime() {
        return Database.get('lastCheckInTime', null);
    }

    static addHiddenMember(memberId) {
        Database.removeHiddenMember(memberId);
        Database.db.get('hiddenMembers').push(memberId).write();
    }

    static removeHiddenMember(memberId) {
        Database.db.get('hiddenMembers').pull(memberId).write();
    }

    static getHiddenMembers() {
        return Database.get('hiddenMembers', []);
    }

    static addNoticeMember(memberId) {
        Database.removeNoticeMember(memberId);
        Database.db.get('noticeMembers').push(memberId).write();
    }

    static removeNoticeMember(memberId) {
        Database.db.get('noticeMembers').pull(memberId).write();
    }

    static getNoticeMembers() {
        return Database.get('noticeMembers', []);
    }

    static setConfig(key, value) {
        Database.db.set(`config.${key}`, value).write();
    }

    static getConfig(key, defaultValue) {
        return Database.get(`config.${key}`, defaultValue);
    }

    static init() {
        const low = require('lowdb');
        const LocalStorage = require('lowdb/adapters/LocalStorage')
        const adapter = new LocalStorage();

        Database.db = low(adapter);

        Database.db.set('members', data.starInfo).write();
        Database.db.set('teams', data.teamInfo).write();
        Database.db.set('groups', data.groupInfo).write();

        Database.membersDB = Database.db.get('members').cloneDeep();
        Database.teamsDB = Database.db.get('teams').cloneDeep();
        Database.groupsDB = Database.db.get('groups').cloneDeep();

        if (!Database.db.has('config')) {
            Database.db.set('config', {}).write();
        }

        if (!Database.db.has('badgeCount').value()) {
            Database.db.set('badgeCount', []).write();
        }

        if (!Database.db.has('noticeMembers').value()) {
            Database.db.set('noticeMembers', []).write();
        }

        if (!Database.db.has('hiddenMembers').value()) {
            Database.db.set('hiddenMembers', []).write();
        }
    }

    static get(key, defaultValue) {
        const result = Database.db.get(`${key}`).cloneDeep().value();
        if (typeof result === "undefined" || result == null) {
            return defaultValue;
        }
        return result;
    }
}

Database.init();

export default Database;
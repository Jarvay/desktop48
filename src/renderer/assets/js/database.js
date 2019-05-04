import Constants from "./constants";

class Database {
    static db() {
        if (Database._db == null) {
            const low = require('lowdb');
            const LocalStorage = require('lowdb/adapters/LocalStorage')
            const adapter = new LocalStorage();

            Database._db = low(adapter);
        }
        return Database._db;
    }

    static membersDB() {
        if (Database._membersDB == null) {
            Database._membersDB = Database.db().get('members').cloneDeep();
        }
        return Database._membersDB;
    }

    static teamsDB() {
        if (Database._teamsDB == null) {
            Database._teamsDB = Database.db().get('teams').cloneDeep();
        }
        return Database._teamsDB;
    }

    static groupsDB() {
        if (Database._groupsDB == null) {
            Database._groupsDB = Database.db().get('groups').cloneDeep();
        }
        return Database._groupsDB;
    }

    static member(memberId) {
        memberId = parseInt(memberId);
        let member = Database.membersDB().find({userId: memberId}).value();
        if (typeof member === "undefined") {
            member = Constants.UNKNOWN_USER;
            member.team = {
                teamName: 'unknown',
                teamColor: 'ccc'
            };
        } else {
            member.team = Database.teamsDB().find({teamId: member.teamId}).value();
        }
        return member;
    }

    static team(teamId) {
        const team = Database.teamsDB().find({teamId: teamId}).value();
        const members = Database.membersDB().filter({teamId: teamId}).value();

        const tmpMembers = [];
        for (let i = 0; i < members.length; i++) {
            tmpMembers.push(Database.member(members[i].userId));

        }
        team.members = tmpMembers;
        return team;
    }

    static group(groupId) {
        const group = Database.groupsDB().find({groupId: groupId}).value();

        const teams = Database.teamsDB().filter({groupId: groupId}).value();

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
        const groups = Database.groupsDB().value();
        const result = [];
        for (let i = 0; i < groups.length; i++) {
            result.push(Database.group(groups[i].groupId));
        }
        return result;
    }

    static setLoginUserInfo(userInfo) {
        Database._db.set('loginUserInfo', userInfo).write();
        Database.setToken(userInfo.token);
    }

    static getLoginUserInfo() {
        return Database._db.get('loginUserInfo').cloneDeep().value();
    }

    static removeLoginUserInfo() {
        Database._db.unset('loginUserInfo').write();
    }

    static getToken() {
        return Database._db.get('token').cloneDeep().value();
    }

    static setToken(token) {
        Database._db.set('token', token).write();
    }

    static isLogin() {
        return Database._db.has('token').value();
    }

    static setAccid(accid) {
        Database._db.set('accid', accid).write();
    }

    static getAccid() {
        return Database._db.get('accid').cloneDeep().value();
    }

    static setIMPwd(accid) {
        Database._db.set('imPwd', accid).write();
    }

    static getIMPwd() {
        return Database._db.get('imPwd').cloneDeep().value();
    }

    static incrementBadgeCount(ownerId) {
        if (!Database._db.has('badgeCount').value()) {
            Database._db.set('badgeCount', []).write();
        }
        if (typeof Database._db.get('badgeCount').find({ownerId: ownerId}).value() === "undefined") {
            Database._db.get('badgeCount').push({
                ownerId: ownerId,
                count: 1
            }).write();
        } else {
            Database._db.get('badgeCount').find({ownerId: ownerId}).update('count', n => n + 1).write();
        }
    }

    static clearBadgeCount(ownerId) {
        Database._db.get('badgeCount').remove({ownerId: ownerId});
    }

    static getBadgeCount(ownerId) {
        const item = Database._db.get('badgeCount').find({ownerId: ownerId}).value();
        if (typeof item === "undefined") {
            return 0;
        }
        return item.count;
    }
}

Database._membersDB = null;
Database._groupsDB = null;
Database._teamsDB = null;
Database._db = null;

export default Database;
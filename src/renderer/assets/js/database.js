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
        const member = Database.membersDB().find({userId: memberId}).value();
        member.team = Database.teamsDB().find({teamId: member.teamId}).value();
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
    }

    static getLoginUserInfo() {
        return Database._db.get('loginUserInfo').cloneDeep().value();
    }

    static removeLoginUserInfo() {
        Database._db.unset('loginUserInfo').write();
    }
}

Database._membersDB = null;
Database._groupsDB = null;
Database._teamsDB = null;
Database._db = null;

export default Database;
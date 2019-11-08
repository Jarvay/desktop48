import Constants from './constants';
import data from './data';
import low from 'lowdb';
import LocalStorage from 'lowdb/adapters/LocalStorage';
import {mutations, store} from "@/assets/js/store";

export default class Database {
    /**
     * 单例
     */
    public static instance() {
        return this.database;
    }

    private static database: Database = new Database();
    public db: any;
    public membersDB: any;
    public teamsDB: any;
    public groupsDB: any;

    private constructor() {
        this.init();
    }

    public member(memberId: any): any {
        memberId = parseInt(memberId);
        let member = this.membersDB.find({userId: memberId}).value();
        if (typeof member === 'undefined') {
            member = Constants.UNKNOWN_MEMBER;
            member.team = {
                teamName: 'unknown',
                teamColor: 'ccc',
            };
        } else {
            member.team = this.teamsDB.find({teamId: member.teamId}).value();
        }
        return member;
    }

    public team(teamId: any): any {
        const team = this.teamsDB.find({teamId}).value();
        const members = this.membersDB.filter({teamId}).value();

        const tmpMembers = [];
        for (const member of members) {
            tmpMembers.push(this.member(member.userId));
        }
        team.members = tmpMembers;
        return team;
    }

    public group(groupId: any): any {
        const group = this.groupsDB.find({groupId}).value();

        const teams = this.teamsDB.filter({groupId}).value();

        const tmpTeams = [];
        for (const team of teams) {
            tmpTeams.push(this.team(team.teamId));
        }
        group.teams = tmpTeams;
        return group;
    }

    /**
     * 分团列表
     * @returns {Array}
     */
    public groups(): any[] {
        const groups = this.groupsDB.value();
        const result = [];
        for (const group of groups) {
            result.push(this.group(group.groupId));
        }
        return result;
    }

    public refreshOptions(): void {
        const memberOptions: any[] = [];
        const teamOptions: any[] = [];
        const groupOptions: any[] = [];
        this.groups().forEach((group: any) => {
            //成员
            memberOptions.push({
                value: String(group.groupId),
                label: group.groupName,
                children: group.teams.map((team: any) => {
                    return {
                        value: String(team.teamId),
                        label: team.teamName,
                        children: team.members.map((member: any) => {
                            return {
                                value: String(member.userId),
                                label: `${member.realName}(${member.abbr})`,
                            };
                        }),
                    };
                }),
            });
            //队伍
            teamOptions.push({
                value: String(group.groupId),
                label: group.groupName,
                children: group.teams.map((team: any) => {
                    return {
                        value: String(team.teamId),
                        label: team.teamName,
                    };
                }),
            });
            //分团
            groupOptions.push({
                value: String(group.groupId),
                label: group.groupName
            });
        });

        this.db.set('memberOptions', memberOptions).write();
        mutations.setMemberOptions(memberOptions);
        this.db.set('teamOptions', teamOptions).write();
        mutations.setTeamOptions(teamOptions);
        this.db.set('groupOptions', groupOptions).write();
        mutations.setGroupOptions(groupOptions);
    }

    /**
     * 成员筛选
     */
    public getMemberOptions(): any[] {
        return this.db.get('memberOptions').value();
    }

    /**
     * 队伍筛选
     */
    public getTeamOptions(): any[] {
        return this.db.get('teamOptions').value();
    }

    /**
     * 分团筛选
     */
    public getGroupOptions(): any[] {
        return this.db.get('groupOptions').value();
    }

    /**
     * 获取屏蔽成员
     */
    public getHiddenMembers(): any[] {
        return this.get('hiddenMembers', []);
    }

    /**
     * 设置屏蔽成员
     */
    public setHiddenMembers(members: number[] = []) {
        this.db.set('hiddenMembers', members).write();
    }

    /**
     * 获取下载目录
     */
    public getDownloadDir() {
        return this.getConfig('downloadDir', Constants.DEFAULT_DOWNLOAD_DIR);
    }

    /**
     * 是否初始化过
     * @param initialized
     */
    public setInitialized(initialized: boolean) {
        this.setConfig('initialized', initialized);
    }

    public getInitialized() {
        return this.getConfig('initialized', false);
    }

    /**
     * 设置下载目录
     * @param downloadDir
     */
    public setDownloadDir(downloadDir: string) {
        this.setConfig('downloadDir', downloadDir);
    }

    public setConfig(key: string, value: any) {
        this.db.set(`config.${key}`, value).write();
    }

    public getConfig(key: string, defaultValue: any) {
        return this.get(`config.${key}`, defaultValue);
    }

    public init() {
        const adapter = new LocalStorage('database');

        this.db = low(adapter);

        if (!this.db.has('userAgent')) {
            this.db.set('userAgent', Constants.DEFAULT_USER_AGENT);
        }

        if (!this.db.has('members').value()) {
            this.db.set('members', data.starInfo).write();
            this.db.set('teams', data.teamInfo).write();
            this.db.set('groups', data.groupInfo).write();
        }

        this.membersDB = this.db.get('members').cloneDeep();
        this.teamsDB = this.db.get('teams').cloneDeep();
        this.groupsDB = this.db.get('groups').cloneDeep();

        //回放筛选
        if (!this.db.has('memberOptions').value()
            || !this.db.has('teamOptions').value()
            || !this.db.has('groupOptions').value()) {
            this.refreshOptions();
        }

        if (!this.db.has('config')) {
            this.db.set('config', {}).write();
        }

        if (!this.db.has('badgeCount').value()) {
            this.db.set('badgeCount', []).write();
        }

        if (!this.db.has('noticeMembers').value()) {
            this.db.set('noticeMembers', []).write();
        }

        if (!this.db.has('hiddenMembers').value()) {
            this.db.set('hiddenMembers', []).write();
        }
    }

    public get(key: string, defaultValue: any) {
        const result = this.db.get(`${key}`).cloneDeep().value();
        if (typeof result === 'undefined' || result == null) {
            return defaultValue;
        }
        return result;
    }
}

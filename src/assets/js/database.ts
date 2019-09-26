import Constants from './constants';
import data from './data';
import Debug from '@/assets/js/debug';

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

    public member(memberId: any) {
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

    public team(teamId: any) {
        const team = this.teamsDB.find({teamId}).value();
        const members = this.membersDB.filter({teamId}).value();

        const tmpMembers = [];
        for (const member of members) {
            tmpMembers.push(this.member(member.userId));
        }
        team.members = tmpMembers;
        return team;
    }

    public group(groupId: any) {
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
    public groups() {
        const groups = this.groupsDB.value();
        const result = [];
        for (const group of groups) {
            result.push(this.group(group.groupId));
        }
        return result;
    }

    /**
     * 添加屏蔽成员
     * @param memberId
     */
    public addHiddenMember(memberId: any) {
        this.removeHiddenMember(memberId);
        this.db.get('hiddenMembers').push(memberId).write();
    }

    /**
     * 取消屏蔽成员
     * @param memberId
     */
    public removeHiddenMember(memberId: any) {
        this.db.get('hiddenMembers').pull(memberId).write();
    }

    /**
     * 获取屏蔽成员
     */
    public getHiddenMembers(): any[] {
        return this.get('hiddenMembers', []);
    }

    /**
     * 清空屏蔽成员
     */
    public clearHiddenMembers() {
        this.db.get('hiddenMembers').remove().write();
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
        const low = require('lowdb');
        const LocalStorage = require('lowdb/adapters/LocalStorage');
        const adapter = new LocalStorage();

        this.db = low(adapter);

        if (!this.db.has('userAgent')) {
            this.db.set('userAgent', Constants.DEFAULT_USER_AGENT);
        }

        if (!this.db.has('members').value()) {
            Debug.log(1);
            this.db.set('members', data.starInfo).write();
            this.db.set('teams', data.teamInfo).write();
            this.db.set('groups', data.groupInfo).write();
        }

        this.membersDB = this.db.get('members').cloneDeep();
        this.teamsDB = this.db.get('teams').cloneDeep();
        this.groupsDB = this.db.get('groups').cloneDeep();

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

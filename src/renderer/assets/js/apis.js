import axios from 'axios';

class Apis {
    static db() {
        if (Apis._db == null) {
            const low = require('lowdb');
            const LocalStorage = require('lowdb/adapters/LocalStorage')
            const adapter = new LocalStorage();

            Apis._db = low(adapter);
        }
        return Apis._db;
    }

    static membersDB() {
        if (Apis._membersDB == null) {
            Apis._membersDB = Apis.db().get('members').cloneDeep();
        }
        return Apis._membersDB;
    }

    static teamsDB() {
        if (Apis._teamsDB == null) {
            Apis._teamsDB = Apis.db().get('teams').cloneDeep();
        }
        return Apis._teamsDB;
    }

    static groupsDB() {
        if (Apis._groupsDB == null) {
            Apis._groupsDB = Apis.db().get('groups').cloneDeep();
        }
        return Apis._groupsDB;
    }

    /**
     * 同步成员信息
     */
    static syncInfo() {
        return new Promise((resolve, reject) => {
            this.request('https://pocketapi.48.cn/user/api/v1/client/update/group_team_star').then(responseBody => {
                if (responseBody.status == 200) {
                    const content = responseBody.content;
                    Apis.db().set('members', content.starInfo).write();
                    Apis.db().set('teams', content.teamInfo).write();
                    Apis.db().set('groups', content.groupInfo).write();
                    resolve();
                } else {
                    reject(responseBody.message);
                }
            }).catch(error => {
                reject(error);
            })
        });
    }

    static member(memberId) {
        memberId = parseInt(memberId);
        const member = Apis.membersDB().find({userId: memberId}).value();
        member.team = Apis.teamsDB().find({teamId: member.teamId}).value();
        return member;
    }

    static team(teamId) {
        const team = Apis.teamsDB().find({teamId: teamId}).value();
        const members = Apis.membersDB().filter({teamId: teamId}).value();

        const tmpMembers = [];
        for (let i = 0; i < members.length; i++) {
            tmpMembers.push(Apis.member(members[i].userId));

        }
        team.members = tmpMembers;
        return team;
    }

    static group(groupId) {
        const group = Apis.groupsDB().find({groupId: groupId}).value();

        const teams = Apis.teamsDB().filter({groupId: groupId}).value();

        const tmpTeams = [];
        for (let i = 0; i < teams.length; i++) {
            tmpTeams.push(Apis.team(teams[i].teamId));
        }
        group.teams = tmpTeams;
        return group;
    }

    /**
     * 分团列表
     * @returns {Array}
     */
    static groups() {
        const groups = Apis.groupsDB().value();
        const result = [];
        for (let i = 0; i < groups.length; i++) {
            result.push(Apis.group(groups[i].groupId));
        }
        return result;
    }

    /**
     * 直播列表
     * @param userId
     * @param next
     */
    static lives(userId, next) {
        const body = {
            "next": next == undefined ? "0" : next,
            "loadMore": "true",
            "userId": userId == undefined ? "0" : userId,
            "teamId": "0",
            "groupId": "0",
            "record": "false"
        };

        return Apis.list(body);
    }

    /**
     * 回放列表
     * @param userId
     * @param next
     */
    static reviews(userId, next) {
        const body = {
            "next": next == undefined ? "0" : next,
            "loadMore": "true",
            "userId": userId == undefined ? "0" : userId,
            "teamId": "0",
            "groupId": "0",
            "record": "true"
        };

        return Apis.list(body);
    }

    static list(body) {
        return Apis.request('https://pocketapi.48.cn/live/api/v1/live/getLiveList', body);
    }

    /**
     * 直播|回放详情
     * @param liveId
     * @returns {*|Promise<any>}
     */
    static live(liveId) {
        const body = {
            "type": 1,
            "userId": '0',
            "liveId": liveId
        };

        return Apis.request('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', body);
    }

    static request(url, body = {}) {
        return new Promise((resolve, reject) => {
            const request = Apis._net.request({
                url: url,
                method: 'POST'
            });

            request.setHeader('Content-type', 'application/json');
            request.setHeader('os', 'android');
            request.setHeader('version', '9.0');

            let data = '';
            request.on('response', response => {
                response.on('end', () => {
                    const responseBody = JSON.parse(data);
                    resolve(responseBody);
                });

                response.on('data', (chunk) => {
                    let body = chunk.toString('utf8');
                    data = data + body;
                });

                response.on('error', error => {
                    reject(error);
                })
            });

            request.on('error', error => {
                reject(error);
            });
            request.write(JSON.stringify(body));
            request.end();
        });
    }

    static barrage(barrageUrl) {
        return new Promise((resolve, reject) => {
            axios.get(barrageUrl).then(response => {
                resolve(response);
            }).catch(error => {
                reject(error);
            });
        });
    }

    static async chatRoomToken() {
        const cookieVal = '48web' + Math.random().toString(36).substr(2);

        const formData = new FormData();
        formData.append('cookie_val', cookieVal);

        await axios.post('https://live.48.cn/Server/do_ajax_setcookie', formData);
        return new Promise((resolve, reject) => {
            axios.post('https://live.48.cn/Server/do_ajax_setcookie', formData).then(response => {
                resolve(response.data);
            }).catch(error => {
                reject(error);
            });
        });
    }
}


Apis._membersDB = null;
Apis._groupsDB = null;
Apis._teamsDB = null;
Apis._db = null;
Apis._net = require('electron').remote.net;

export default Apis;

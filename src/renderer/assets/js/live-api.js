import axios from 'axios';

class LiveApi {
    static db() {
        if (LiveApi._db == null) {
            const low = require('lowdb');
            const LocalStorage = require('lowdb/adapters/LocalStorage')
            const adapter = new LocalStorage();

            LiveApi._db = low(adapter);
        }
        return LiveApi._db;
    }

    static membersDB() {
        if (LiveApi._membersDB == null) {
            LiveApi._membersDB = LiveApi.db().get('members').cloneDeep();
        }
        return LiveApi._membersDB;
    }

    static teamsDB() {
        if (LiveApi._teamsDB == null) {
            LiveApi._teamsDB = LiveApi.db().get('teams').cloneDeep();
        }
        return LiveApi._teamsDB;
    }

    static groupsDB() {
        if (LiveApi._groupsDB == null) {
            LiveApi._groupsDB = LiveApi.db().get('groups').cloneDeep();
        }
        return LiveApi._groupsDB;
    }

    /**
     * 同步成员信息
     */
    static syncInfo() {
        const body = {
            "videoTypeUtime": "2010-03-24 15:59:11",
            "musicAlbumUtime": "2010-04-18 14:45:37",
            "functionUtime": "2010-10-17 15:00:00",
            "groupUtime": "2010-10-17 17:27:00",
            "memberInfoUtime": "2010-10-20 11:55:09",
            "talkUtime": "2010-05-05 18:04:52",
            "videoUtime": "2010-05-17 18:36:32",
            "musicUtime": "2010-05-05 15:56:11",
            "urlUtime": "2010-07-19 12:10:59",
            "teamUtime": "2010-10-20 10:39:00",
            "memberPropertyUtime": "2010-02-20 18:57:48",
            "periodUtime": "2010-10-14 14:45:00"
        };

        return new Promise((resolve, reject) => {
            this.request('https://psync.48.cn/syncsystem/api/cache/v1/update/overview', body).then(responseBody => {
                if (responseBody.status == 200) {
                    const content = responseBody.content;
                    console.log(content);
                    LiveApi.db().set('members', content.memberInfo).write();
                    LiveApi.db().set('teams', content.team).write();
                    LiveApi.db().set('groups', content.group).write();
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
        const member = LiveApi.membersDB().find({member_id: memberId}).value();
        member.teamObj = LiveApi.teamsDB().find({team_id: member.team}).value();
        return member;
    }

    static team(teamId) {
        const team = LiveApi.teamsDB().find({team_id: teamId}).value();
        const members = LiveApi.membersDB().filter({team: teamId}).value();

        const tmpMembers = [];
        for (let i = 0; i < members.length; i++) {
            tmpMembers.push(LiveApi.member(members[i].member_id));
        }
        team.members = tmpMembers;
        return team;
    }

    static group(groupId) {
        const group = LiveApi.groupsDB().find({group_id: groupId}).value();

        const teams = LiveApi.teamsDB().filter({group_id: groupId}).value();

        const tmpTeams = [];
        for (let i = 0; i < teams.length; i++) {
            tmpTeams.push(LiveApi.team(teams[i].team_id));
        }
        group.teams = tmpTeams;
        return group;
    }

    /**
     * 分团列表
     * @returns {Array}
     */
    static groups() {
        const groups = (LiveApi.groupsDB().value());
        const result = [];
        for (let i = 0; i < groups.length; i++) {
            result.push(LiveApi.group(groups[i].group_id));
        }
        return result;
    }

    /**
     * 获取直播列表
     */
    static lives(memberId, limit) {
        const body = {
            "lastTime": 0,
            "groupId": 0,
            "type": 0,
            "memberId": memberId,
            "giftUpdTime": 1498211389003,
            "limit": limit
        };

        return LiveApi.request('https://plive.48.cn/livesystem/api/live/v1/memberLivePage', body);
    }

    static live(liveId) {
        const body = {
            "type": 1,
            "userId": '0',
            "liveId": liveId
        };

        return LiveApi.request('https://plive.48.cn/livesystem/api/live/v1/getLiveOne', body);
    }

    static request(url, body) {
        return new Promise((resolve, reject) => {
            const request = LiveApi._net.request({
                url: url,
                method: 'POST'
            });

            request.setHeader('Content-type', 'application/json');
            request.setHeader('os', 'android');
            request.setHeader('version', '8.1.0');

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
        const body = {
            timestamp: new Date().getTime(),
            cookie_val: cookieVal,
            type: 2
        };

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


LiveApi._membersDB = null;
LiveApi._groupsDB = null;
LiveApi._teamsDB = null;
LiveApi._db = null;
LiveApi._net = require('electron').remote.net;

export default LiveApi;

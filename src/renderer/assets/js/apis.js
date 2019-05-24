import axios from 'axios';
import Request from './request';
import Database from "./database";
import ApiUrls from './api-urls';
import Dev from './dev';

class Apis {
    /**
     * 同步成员信息
     */
    static syncInfo() {
        return new Promise((resolve, reject) => {
            Apis.request(ApiUrls.UPDATE_INFO_URL).then(content => {
                Database.db.set('members', content.starInfo).write();
                Database.db.set('teams', content.teamInfo).write();
                Database.db.set('groups', content.groupInfo).write();
                resolve(content);
            }).catch(error => {
                reject(error);
            })
        });
    }

    /**
     * 直播列表
     * @param userId
     * @param next
     */
    static lives(userId, next) {
        const data = {
            "next": next == undefined ? "0" : next,
            "loadMore": "true",
            "userId": userId == undefined ? "0" : userId,
            "teamId": "0",
            "groupId": "0",
            "record": "false"
        };

        return Apis.list(data);
    }

    /**
     * 回放列表
     * @param options
     */
    static reviews(options) {
        const data = {
            "next": options.next == undefined ? "0" : options.next,
            "loadMore": "true",
            "userId": options.userId == undefined ? "0" : options.userId,
            "teamId": options.teamId,
            "groupId": options.groupId,
            "record": "true"
        };

        return Apis.list(data);
    }

    static list(data) {
        return Apis.request(ApiUrls.LIVE_LIST_URL, data);
    }

    /**
     * 直播|回放详情
     * @param liveId
     * @returns {*|Promise<any>}
     */
    static live(liveId) {
        const data = {
            "type": 1,
            "userId": '0',
            "liveId": liveId
        };

        return Apis.request(ApiUrls.LIVE_ONE_URL, data);
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

    /**
     *
     * @param lastTime
     * @param userId
     * @returns {*|Promise<any>}
     */
    static trips(lastTime, userId = '0') {
        return Apis.request(ApiUrls.TRIP_LIST_URL, {
            isMore: 'true',
            lastTime: lastTime,
            limit: 20,
            userId: userId
        });
    }

    static async chatRoomToken() {
        const cookieVal = '48web' + Math.random().toString(36).substr(2);

        const formData = new FormData();
        formData.append('cookie_val', cookieVal);

        await axios.post(ApiUrls.SET_COOKIE_URL, formData);
        return new Promise((resolve, reject) => {
            axios.post(ApiUrls.SET_COOKIE_URL, formData).then(response => {
                resolve(response.data);
            }).catch(error => {
                reject(error);
            });
        });
    }

    /**
     * 登录
     * @param mobile
     * @param password
     * @returns {*|Promise<any>}
     */
    static login(mobile, password) {
        return Apis.request(ApiUrls.MOBILE_LOGIN_URL, {
            mobile: mobile,
            pwd: password
        }, Apis.loginHeaders());
    }

    /**
     * 获取验证码
     * @param mobile
     * @param area
     * @returns {*|Promise|Promise<any>}
     */
    static verifyCode(mobile, area) {
        return Apis.request(ApiUrls.SEND_SMS_URL, {
            mobile: mobile,
            area: area
        });
    }

    static verifyCodeLogin(mobile, verifyCode) {
        return Apis.request(ApiUrls.VERIFY_CODE_LOGIN_URL, {
            mobile: mobile,
            code: verifyCode
        }, Apis.loginHeaders());
    }

    static messageBox(lastTime, limit) {
        return Apis.request(ApiUrls.MESSAGE_BOX_URL, {
            lastTime: lastTime,
            limit: limit
        }, Apis.headersWithToken());
    }

    static messageInfo(targetUserId, lastTime) {
        return Apis.request(ApiUrls.MESSAGE_INFO_URL, {
            lastTime: lastTime,
            targetUserId: targetUserId
        }, Apis.headersWithToken());
    }

    static juJuList() {
        return Apis.request(ApiUrls.JUJU_LIST_URL, {}, Apis.headersWithToken());
    }

    static juJuSource(userId, type = '0') {
        return Apis.request(ApiUrls.JUJU_SOURCE_URL, {
            sourceId: userId,
            type: type
        }, Apis.headersWithToken());
    }

    static juJuOwner(userId, roomId, nextTime, needTop1Msg = "false") {
        return Apis.request(ApiUrls.JUJU_OWNER_URL, {
            ownerId: userId.toString(),
            roomId: roomId,
            nextTime: nextTime,
            needTop1Msg: needTop1Msg
        }, Apis.headersWithToken());
    }

    static juJuAll(userId, roomId, nextTime, needTop1Msg = "false") {
        return Apis.request(ApiUrls.JUJU_ALL_URL, {
            ownerId: userId.toString(),
            roomId: roomId,
            nextTime: nextTime,
            needTop1Msg: needTop1Msg
        }, Apis.headersWithToken());
    }

    static addSingleAttention(toUserId) {
        return Apis.request(ApiUrls.ADD_SINGLE_ATTENTION_URL, {
            toUserId: toUserId
        }, this.headersWithToken());
    }

    static removeSingleAttention(toUserId) {
        return Apis.request(ApiUrls.REMOVE_SINGLE_ATTENTION_URL, {
            toUserId: toUserId
        }, this.headersWithToken());
    }

    static followMemberList() {
        return Apis.request(ApiUrls.FOLLOW_MEMBERS_URL, {
            limit: 500
        }, Apis.headersWithToken());
    }

    static IMUserInfo() {
        return Apis.request(ApiUrls.IM_USER_INFO, {}, Apis.headersWithToken());
    }

    static checkIn() {
        return Apis.request(ApiUrls.CHECK_IN_URL, {}, Apis.headersWithToken());
    }

    static reloadUserInfo() {
        return Apis.request(ApiUrls.USER_INFO_URL, {}, Apis.headersWithToken());
    }

    static headersWithToken() {
        const headers = Apis.loginHeaders();
        headers.token = Database.getToken();
        return headers;
    }

    static loginHeaders() {
        return {
            'Content-Type': 'application/json',
            'appinfo': JSON.stringify({
                'appBuild': '1',
                'appVersion': '6.0.0',
                'deviceId': '882163256345',
                'deviceName': 'redmi note5',
                'osType': 'android',
                'osVersion': 'android 9.0',
                'vendor': 'whyred',
                'longitude': '116.417',
                'latitude': '39.888'
            })
        };
    }

    static request(url, data, headers) {
        return new Promise((resolve, reject) => {
            Request.send(url, data, headers).then(responseBody => {
                Dev.log('url', url);
                Dev.log('request headers', headers);
                Dev.log('request body', data);
                Dev.log('responseBody', responseBody);
                if (responseBody.success) {
                    resolve(responseBody.content);
                } else {
                    reject(responseBody.message);
                }
            }).catch(error => {
                throw `request error ${error}`;
            });
        });
    }
}

export default Apis;

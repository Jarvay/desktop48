import axios from 'axios';
import Request from './request';
import Database from "./database";

class Apis {
    /**
     * 同步成员信息
     */
    static syncInfo() {
        return new Promise((resolve, reject) => {
            Request.send('https://pocketapi.48.cn/user/api/v1/client/update/group_team_star').then(responseBody => {
                if (responseBody.status == 200) {
                    const content = responseBody.content;
                    Database.db().set('members', content.starInfo).write();
                    Database.db().set('teams', content.teamInfo).write();
                    Database.db().set('groups', content.groupInfo).write();
                    resolve();
                } else {
                    reject(responseBody.message);
                }
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
     * @param userId
     * @param next
     */
    static reviews(userId, next) {
        const data = {
            "next": next == undefined ? "0" : next,
            "loadMore": "true",
            "userId": userId == undefined ? "0" : userId,
            "teamId": "0",
            "groupId": "0",
            "record": "true"
        };

        return Apis.list(data);
    }

    static list(data) {
        return Request.send('https://pocketapi.48.cn/live/api/v1/live/getLiveList', data);
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

        return Request.send('https://pocketapi.48.cn/live/api/v1/live/getLiveOne', data);
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

    /**
     * 登录
     * @param mobile
     * @param password
     * @returns {*|Promise<any>}
     */
    static login(mobile, password) {
        return Request.send('https://pocketapi.48.cn/user/api/v1/login/app/mobile', {
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
        return Request.send('https://pocketapi.48.cn/user/api/v1/sms/send2', {
            mobile: mobile,
            area: area
        });
    }

    static verifyCodeLogin(mobile, verifyCode) {
        return Request.send('https://pocketapi.48.cn/user/api/v1/login/app/mobile/code', {
            mobile: mobile,
            code: verifyCode
        }, Apis.loginHeaders());
    }

    static loginHeaders() {
        return {
            'Content-Type': 'application/json',
            'appinfo': JSON.stringify({
                'appBuild': '1',
                'appVersion': '6.0.1',
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
}

export default Apis;

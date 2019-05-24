import './48sdk/base-v2.8.0';
import './48sdk/nim-v2.8.0';
import Chatroom from './48sdk/chatroom-v2.8.0';
import Apis from "./apis";
import Database from "./database";

const APP_KEY = '632feff1f4c838541ab75195d1ceb3fa';

class ChatRoomTools {
    /**
     *
     * @param options
     * @returns {Promise<any>}
     */
    static chatroom(options) {
        if (Database.getAccid() != null) {
            return new Promise((resolve, reject) => {
                const chatroom = new Chatroom({
                    appKey: APP_KEY,      //从官网公演直播网页代码获取
                    account: Database.getAccid(),
                    token: Database.getIMPwd(),
                    chatroomId: options.roomId,
                    chatroomAddresses: [
                        // '127.0.0.1:7272',
                        'weblink04.netease.im:443',
                        /*'',*/
                    ],
                    onconnect: options.onConnect,
                    onerror: options.onError,
                    onwillreconnect: options.onWillConnnect,
                    ondisconnect: options.onDisconnect,
                    onmsgs: options.onMessage
                });
                resolve(chatroom);
            });
        } else {
            return new Promise((resolve, reject) => {
                Apis.IMUserInfo().then(content => {
                    const chatroom = new Chatroom({
                        appKey: APP_KEY,      //从官网公演直播网页代码获取
                        account: content.accid,
                        token: content.pwd,
                        chatroomId: options.roomId,
                        chatroomAddresses: [
                            // '127.0.0.1:7272',
                            'weblink04.netease.im:443',
                            /*'',*/
                        ],
                        onconnect: options.onConnect,
                        onerror: options.onError,
                        onwillreconnect: options.onWillConnnect,
                        ondisconnect: options.onDisconnect,
                        onmsgs: options.onMessage
                    });
                    resolve(chatroom);
                }).catch(error => {
                    reject(error);
                });
            });
        }
    }

    static juJuMsgCustomCreate(userInfo, roomId, content) {
        return {
            "config": {
                "build": "190420",
                "phoneName": "红米Note5",
                "version": "6.0.1",
                "mobileOperators": "中国移动",
                "ip": "192.168.48.48",
                "phoneSystemVersion": "9.0"
            },
            "roomId": roomId.toString(),
            "module": "session",
            "sessionRole": 0,
            "sourceId": roomId.toString(),
            "text": content,
            "bubbleId": '0',
            "messageType": "TEXT",
            "fromApp": "201811",
            "user": {
                "roleId": 1,
                "vip": false,
                "nickName": userInfo.nickname,
                "level": userInfo.level,
                "userId": userInfo.userId,
                "avatar": userInfo.avatar
            }
        };
    }
}

ChatRoomTools.HOME_CHATROOM_ID = '59260116';

export default ChatRoomTools;

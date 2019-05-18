const Constants = {};

Constants.BARRAGE_SEND_INTERVAL = 5;    //弹幕间隔

Constants.VERIFY_CODE_INTERVAL = 60;    //获取验证码间隔

Constants.MESSAGE_CLICK_INTERVAL = 5;  //消息点击间隔

Constants.ATTENTION_LIMIT_INTERVAL = 10;    //关注操作间隔

/**
 * 播放器类型
 * @type {string}
 */
Constants.FLV_JS = 'flv.js';
Constants.VIDEO_JS = 'video.js';

/**
 * 播放状态
 * @type {number}
 */
Constants.STATUS_PLAYING = 1;
Constants.STATUS_PREPARED = 0;
/**
 * 消息类型
 * @type {{}}
 */
const MESSAGE_TYPE = {};
MESSAGE_TYPE.LIVEUPDATE = 'LIVEUPDATE';
MESSAGE_TYPE.BARRAGE_NORMAL = 'BARRAGE_NORMAL';
MESSAGE_TYPE.CLOSELIVE = 'CLOSELIVE';
MESSAGE_TYPE.LIVE_TRANSFORM = 'LIVE_TRANSFORM';
Constants.MESSAGE_TYPE = MESSAGE_TYPE;

/**
 * 房间消息类型
 * @type {{}}
 */
const JUJU_MSG_TYPE = {};
JUJU_MSG_TYPE.TEXT = 'TEXT';
JUJU_MSG_TYPE.DELETE = 'DELETE';
JUJU_MSG_TYPE.REPLY = 'REPLY';
JUJU_MSG_TYPE.IMAGE = 'IMAGE';
JUJU_MSG_TYPE.LIVE_PUSH = 'LIVEPUSH';
JUJU_MSG_TYPE.FLIP_CARD = 'FLIPCARD';
JUJU_MSG_TYPE.AUDIO = 'AUDIO';
JUJU_MSG_TYPE.VIDEO = 'VIDEO';
JUJU_MSG_TYPE.PRESENT_TEXT = 'PRESENT_TEXT';
JUJU_MSG_TYPE.EXPRESS = 'EXPRESS';
Constants.JUJU_MSG_TYPE = JUJU_MSG_TYPE;

/**
 * 菜单
 * @type {{}}
 */
const MENU = {};
MENU.LIVES = 'LIVES';
MENU.REVIEWS = 'REVIEWS';
MENU.TRIPS = 'TRIPS';
MENU.SETTINGS = 'SETTINGS';
MENU.MESSAGES = 'MESSAGES';
MENU.JUJU = 'JUJU';
MENU.ME = 'ME';
Constants.MENU = MENU;

/**
 * 登录方式
 * @type {{}}
 */
const LOGIN_TYPE = {};
LOGIN_TYPE.VERIFY_CODE = 'VERIFY_CODE';
LOGIN_TYPE.ACCOUNT = 'ACCOUNT';
Constants.LOGIN_TYPE = LOGIN_TYPE;

/**
 * 回放筛选
 * @type {{}}
 */
const REVIEW_SCREEN = {};
REVIEW_SCREEN.USER = 'USER';
REVIEW_SCREEN.TEAM = 'TEAM';
REVIEW_SCREEN.GROUP = 'GROUP';
Constants.REVIEW_SCREEN = REVIEW_SCREEN;

/**
 * 事件
 * @type {{}}
 */
const EVENT = {};
EVENT.LOGIN = 'LOGIN';
EVENT.LOGOUT = 'LOGOUT';
EVENT.USER_INFO = 'USER_INFO';
EVENT.LIVE_OPEN = 'LIVE_OPEN';
EVENT.TO_CHECK_IN = 'TO_CHECK_IN';
Constants.EVENT = EVENT;

Constants.UNKNOWN_USER = {
    "teamName": "unknown",
    "birthday": "01-01",
    "specialty": "",
    "groupId": 10,
    "periodName": "",
    "bloodType": "",
    "constellation": "",
    "nickname": "",
    "ctime": 1553661473202,
    "abbr": "",
    "height": "",
    "periodId": 0,
    "starRegion": "",
    "joinTime": "",
    "utime": 1553661473202,
    "fullPhoto4": "",
    "avatar": "",
    "fullPhoto3": "",
    "wbName": "",
    "userId": 0,
    "realName": "unknown",
    "groupName": "SNH48",
    "pinyin": "unknown",
    "birthplace": "unknown",
    "fullPhoto2": "",
    "hobbies": "",
    "fullPhoto1": "",
    "teamId": 1001,
    "wbUid": "",
    "status": 1
};


export default Constants;

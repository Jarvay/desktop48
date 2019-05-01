const Constants = {};

Constants.BARRAGE_SEND_INTERVAL = 5;    //弹幕间隔

Constants.VERIFY_CODE_INTERVAL = 60;    //获取验证码间隔

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
Constants.MESSAGE_TYPE = MESSAGE_TYPE;

/**
 * 菜单
 * @type {{}}
 */
const MENU = {};
MENU.LIVES = 'LIVES';
MENU.REVIEWS = 'REVIEWS';
MENU.SETTINGS = 'SETTINGS';
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


export default Constants;

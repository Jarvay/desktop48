export default class ApiUrls {
    public static readonly LIVE_LIST_URL = 'https://pocketapi.48.cn/live/api/v1/live/getLiveList';
    public static readonly LIVE_ONE_URL = 'https://pocketapi.48.cn/live/api/v1/live/getLiveOne';
    public static readonly UPDATE_INFO_URL = 'https://pocketapi.48.cn/user/api/v1/client/update/group_team_star';
    public static readonly SET_COOKIE_URL = 'https://live.48.cn/Server/do_ajax_setcookie';

    public static readonly MESSAGE_BOX_URL = 'https://pocketapi.48.cn/message/api/v1/user/message/list';
    public static readonly MESSAGE_INFO_URL = 'https://pocketapi.48.cn/message/api/v1/user/message/info';

    public static readonly MOBILE_LOGIN_URL = 'https://pocketapi.48.cn/user/api/v1/login/app/mobile';
    public static readonly VERIFY_CODE_LOGIN_URL = 'https://pocketapi.48.cn/user/api/v1/login/app/mobile/code';
    public static readonly SEND_SMS_URL = 'https://pocketapi.48.cn/user/api/v1/sms/send2';

    public static readonly USER_INFO_URL = 'https://pocketapi.48.cn/user/api/v1/user/info/reload';

    public static readonly JUJU_LIST_URL = 'https://pocketapi.48.cn/im/api/v1/conversation/page';
    public static readonly JUJU_SOURCE_URL = 'https://pocketapi.48.cn/im/api/v1/im/room/info/type/source';
    public static readonly JUJU_OWNER_URL = 'https://pocketapi.48.cn/im/api/v1/chatroom/msg/list/homeowner';
    public static readonly JUJU_ALL_URL = 'https://pocketapi.48.cn/im/api/v1/chatroom/msg/list/all';
    public static readonly IM_USER_INFO = 'https://pocketapi.48.cn/im/api/v1/im/userinfo';

    public static readonly ADD_SINGLE_ATTENTION_URL = 'https://pocketapi.48.cn/user/api/v1/friendships/friends/add';
    public static readonly REMOVE_SINGLE_ATTENTION_URL = 'https://pocketapi.48.cn/user/api/v1/friendships/friends/remove';
    public static readonly FOLLOW_MEMBERS_URL = 'https://pocketapi.48.cn/user/api/v1/friendships/friends';

    public static readonly CHECK_IN_URL = 'https://pocketapi.48.cn/user/api/v1/checkin';

    public static readonly TRIP_LIST_URL = 'https://pocketapi.48.cn/trip/api/trip/v1/list';
}

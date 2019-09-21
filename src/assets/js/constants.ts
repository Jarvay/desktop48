export default class Constants {
    /**
     * 初始化状态
     */
    public static readonly INITIAL_STATUS_DOWNLOADING: string = 'DOWNLOADING';
    public static readonly INITIAL_STATUS_UNZIPPING: string = 'UNZIPPING';
    public static readonly INITIAL_STATUS_FINISHED: string = 'FINISHED';

    /**
     * 回放筛选
     */
    public static readonly REVIEW_SCREEN: any = {
        USER: 'USER',
        TEAM: 'TEAM',
        GROUP: 'GROUP',
    };

    /**
     * 默认User-Agent
     */
    public static readonly DEFAULT_USER_AGENT: string = 'Mozilla/5.0 (Linux; U; Android 8.1.0;) AppleWebKit/537.36 (KHTML, like Gecko)';

    /**
     * 菜单
     */
    public static readonly MENUS: any = {
        LIVES: 'LIVES',
        REVIEWS: 'REVIEWS',
        SETTING: 'SETTING',
    };

    /**
     * ffmpeg下载地址
     */
    public static readonly FFMPEG_URL_WIN32 = 'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20190826-0821bc4-win64-static.zip';
    public static readonly FFMPEG_URL_MAC = 'https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-20190909-976617c-macos64-static.zip';

    /**
     * 播放状态
     */
    public static readonly STATUS_PLAYING = 1;
    public static readonly STATUS_PREPARED = 0;

    /**
     * 列表列数
     */
    public static readonly LIST_COL = 8;
    public static readonly LIST_SPAN_TOTAL = 24;

    /**
     * 未知成员
     */
    public static readonly UNKNOWN_MEMBER = {
        teamName: 'unknown',
        birthday: '01-01',
        specialty: '',
        groupId: 10,
        periodName: '',
        bloodType: '',
        constellation: '',
        nickname: '',
        ctime: 1553661473202,
        abbr: '',
        height: '',
        periodId: 0,
        starRegion: '',
        joinTime: '',
        utime: 1553661473202,
        fullPhoto4: '',
        avatar: '',
        fullPhoto3: '',
        wbName: '',
        userId: 0,
        realName: 'unknown',
        groupName: 'SNH48',
        pinyin: 'unknown',
        birthplace: 'unknown',
        fullPhoto2: '',
        hobbies: '',
        fullPhoto1: '',
        teamId: 1001,
        wbUid: '',
        status: 1,
    };
}

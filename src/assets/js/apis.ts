import Request from './request';
import Database from './database';
import ApiUrls from './api-urls';
import Debug from './debug';

export default class Apis {
    public static instance() {
        return this.apis;
    }

    private static apis: Apis = new Apis();

    /**
     * 同步成员信息
     */
    public syncInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.request(ApiUrls.UPDATE_INFO_URL, {}, {}).then((content: any) => {
                Database.instance().db.set('members', content.starInfo).write();
                Database.instance().db.set('teams', content.teamInfo).write();
                Database.instance().db.set('groups', content.groupInfo).write();

                Database.instance().refreshMemberOptions();
                Database.instance().refreshTeamOptions();
                Database.instance().refreshGroupOptions();
                resolve(content);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * 直播列表
     * @param userId
     * @param next
     */
    public lives(userId: number, next: string) {
        const data = {
            next: typeof next === 'undefined' ? '0' : next,
            loadMore: 'true',
            userId: typeof userId === 'undefined' ? '0' : userId,
            teamId: '0',
            groupId: '0',
            record: 'false',
        };

        return this.list(data);
    }

    /**
     * 回放列表
     * @param options
     */
    public reviews(options: any) {
        const data = {
            next: typeof options.next === 'undefined' ? '0' : options.next,
            loadMore: 'true',
            userId: typeof options.userId === 'undefined' ? '0' : options.userId,
            teamId: options.teamId,
            groupId: options.groupId,
            record: 'true',
        };

        return this.list(data);
    }

    public list(data: any) {
        return this.request(ApiUrls.LIVE_LIST_URL, data, {});
    }

    /**
     * 直播|回放详情
     * @param liveId
     * @returns Promise
     */
    public live(liveId: any): Promise<any> {
        const data = {
            type: 1,
            userId: '0',
            liveId: liveId
        };

        return this.request(ApiUrls.LIVE_ONE_URL, data, {});
    }

    public barrage(barrageUrl: string): Promise<any> {
        return Request.get(barrageUrl);
    }

    public request(url: string, data: any, headers: any) {
        return new Promise((resolve, reject) => {
            Request.post(url, data, headers).then((responseBody) => {
                Debug.log('url', url);
                Debug.log('request headers', headers);
                Debug.log('request body', data);
                Debug.log('responseBody', responseBody);
                if (responseBody.success) {
                    resolve(responseBody.content);
                } else {
                    reject(responseBody.message);
                }
            }).catch((error) => {
                throw new Error(`request error ${error}`);
            });
        });
    }
}


import Request from "./request";
import Database from "./database";
import ApiUrls from "./api-urls";

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
			this.request(ApiUrls.UPDATE_INFO_URL, {}, {})
				.then((content: any) => {
					Database.instance()
						.db.set("members", content.starInfo)
						.write();
					Database.instance()
						.db.set("teams", content.teamInfo)
						.write();
					Database.instance()
						.db.set("groups", content.groupInfo)
						.write();

					Database.instance().refreshOptions();
					resolve(content);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	/**
	 * 直播列表
	 * @param next
	 */
	public lives(next: string = "0") {
		const data = {
			next,
			loadMore: "true",
			userId: "0",
			teamId: "0",
			groupId: "0",
			record: "false"
		};

		return this.list(data);
	}

	/**
	 * 回放列表
	 * @param options
	 */
	public reviews({
		next = "0",
		userId = "0",
		teamId = "0",
		groupId = "0"
	}: {
		next: string;
		userId: string;
		teamId: string;
		groupId: string;
	}) {
		const data = {
			next,
			loadMore: "true",
			userId,
			teamId,
			groupId,
			record: "true"
		};

		return this.list(data);
	}

	public list(data: any) {
		return this.request(ApiUrls.LIVE_LIST_URL, data, {});
	}

	/**
	 * 直播|回放详情
	 * @param liveId 直播|回放id
	 * @returns Promise
	 */
	public live(liveId: any): Promise<any> {
		const data = {
			type: 1,
			userId: "0",
			liveId: liveId
		};

		return this.request(ApiUrls.LIVE_ONE_URL, data, {});
	}

    /**
     * 下载弹幕
     * @param barrageUrl 弹幕地址
     */
	public barrage(barrageUrl: string): Promise<any> {
		return Request.get(barrageUrl);
	}

	private request(url: string, data: any, headers: any) {
		return new Promise((resolve, reject) => {
			Request.post(url, data, headers)
				.then(responseBody => {
					console.log("url", url);
					console.log("request headers", headers);
					console.log("request body", data);
					console.log("responseBody", responseBody);
					if (responseBody.success) {
						resolve(responseBody.content);
					} else {
						reject(responseBody.message);
					}
				})
				.catch(error => {
					console.error(error);
					throw new Error(`request error ${error}`);
				});
		});
	}
}

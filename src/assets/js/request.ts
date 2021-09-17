import Constants from './constants';
import Database from './database';
import {remote} from 'electron';

export default class Request {
    /**
     * 发送post请求
     * @param url
     * @param body
     * @param headers
     */
    public static post(url: string, body: object, headers: any = {}): Promise<any> {
        headers['User-Agent'] = Database.instance().getConfig('userAgent', Constants.DEFAULT_USER_AGENT);
        headers['Content-Type'] = 'application/json';
        return new Promise<any>((resolve, reject) => {
            const request = remote.net.request({
                url,
                method: 'POST',
            });

            for (let key in headers) {
                request.setHeader(key, headers[key]);
            }

            let data = '';
            request.on('response', (response: any) => {
                response.on('end', () => {
                    const responseBody = JSON.parse(data);
                    resolve(responseBody);
                });

                response.on('data', (chunk: any) => {
                    const chunkData = chunk.toString('utf8');
                    data = data + chunkData;
                });

                response.on('error', (error: any) => {
                    reject(error);
                });
            });

            request.on('error', (error: any) => {
                reject(error);
            });
            request.write(JSON.stringify(body));
            request.end();
        });
    }

    /**
     * 发送get请求
     * @param url
     */
    public static get(url: string): Promise<any> {
        console.log('get url', url);
        return new Promise((resolve, reject) => {
            const request = remote.net.request(url);

            let data = '';
            request.on('response', (response: any) => {
                response.on('end', () => {
                    resolve(data);
                });

                response.on('data', (chunk: any) => {
                    const chunkData = chunk.toString('utf8');
                    data = data + chunkData;
                });

                response.on('error', (error: any) => {
                    reject(error);
                });
            });

            request.on('error', (error: any) => {
                reject(error);
            });
            request.end();
        });
    }
}

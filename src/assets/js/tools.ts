import path from 'path';
import {remote} from 'electron';
import fs from 'fs';
import https from 'https';
import Database from '@/assets/js/database';

const YI_ZHI_BO_HOST = 'alcdn.hls.xiaoka.tv';

class Tools {
    public static readonly APP_DATA_PATH: string = remote.app.getPath('userData');

    /**
     *
     * @param picturesStr
     * @returns
     */
    public static pictureUrls(picturesStr: string) {
        const pictures = picturesStr.split(',');
        return pictures.map((picture) => {
            if (picture.includes('http')) {
                return picture;
            } else {
                return 'https://source.48.cn' + picture;
            }
        });
    }

    public static sourceUrl(sourcePath: string) {
        if (sourcePath.includes('http://')) {
            return sourcePath;
        } else {
            return 'https://source.48.cn' + sourcePath;
        }
    }

    public static timeToSecond(time: string): number {
        if (!time) {
            return 0;
        }
        const hours = time.split(':')[0];
        const minutes = time.split(':')[1];
        const seconds = time.split(':')[2];
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    }

    public static lyricsParse(lyrics: string) {
        if (typeof lyrics === 'undefined'){
            console.error('lyrics undefined');
        }
        const barrages: any[] = [];
        const lines = lyrics.split('\n');
        lines.forEach((line: string) => {
            if (typeof line !== 'undefined') {
                const tmp = line.split(']');
                if (typeof tmp !== undefined && tmp.length > 1) {
                    const arr = tmp[1].split('\t');
                    barrages.push({
                        time: tmp[0].replace('[', ''),
                        username: arr[0],
                        content: arr[1],
                    });
                }
            }
        });
        return barrages;
    }

    public static streamPathHandle(streamPath: string, timestamp: number) {
        const date = new Date(timestamp);
        const liveDate = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
        return streamPath.replace(/^(http|https):\/\/([^\/]+)\/(\d+)/, (pathPrefix, protocol, host) => {
            if (host.toLowerCase() !== YI_ZHI_BO_HOST) {
                return pathPrefix;
            }

            return `${protocol}://${host}/${liveDate}`;
        });
    }

    public static download({url = '', filePath = '', onProgress = (progress: string) => {}, onFinish = () => {}, onError = (error: any) => {}}) {
        let totalBytes = 0;
        let currentBytes = 0;
        https.get(url, (res: any) => {
            res.setEncoding('binary');
            let fileData = '';
            totalBytes = parseInt(res.headers['content-length'], 10);
            res.on('data', (chunk: any) => {
                fileData += chunk;
                currentBytes += chunk.length;

                onProgress((currentBytes / totalBytes * 100).toFixed(2));
            });
            res.on('end', () => {
                fs.writeFile(filePath, fileData, 'binary', (error: any) => {
                    if (error) {
                        console.log(error, '');
                        onError(error);
                    } else {
                        onFinish();
                    }
                });
            });
        });
    }

    public static dateFormat(timestamp: number, fmt: string): string {
        const date = new Date(timestamp);
        const o: any = {
            'M+': date.getMonth() + 1,                 // 月份
            'd+': date.getDate(),                    // 日
            'h+': date.getHours(),                   // 小时
            'm+': date.getMinutes(),                 // 分
            's+': date.getSeconds(),                 // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds(),             // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) :
                    (('00' + o[k]).substr(('' + o[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * ffplay路径
     */
    public static ffplayPath(): string {
        return this.ffmpegToolsPath('ffplay');
    }

    /**
     * ffmpeg路径
     */
    public static ffmpegPath(): string {
        return this.ffmpegToolsPath('ffmpeg');
    }

    /**
     * 获取执行文件全称
     * @param filename
     */
    public static ffmpegFullFilename(filename:string): string {
        switch (process.platform) {
            default:
            case 'win32':
                return `${filename}.exe`;
            case 'darwin':
                return filename;
        }
    }

    public static setFfmpegExecutable() {
        try {
            fs.chmodSync(Tools.ffmpegPath(), '777');
            fs.chmodSync(Tools.ffplayPath(), '777');
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * ffmpeg|ffplay路径
     * @param executeFilename
     */
    private static ffmpegToolsPath(executeFilename: string): string {
        return  path.join(Database.instance().getFfmpegDir(), this.ffmpegFullFilename(executeFilename));
    }
}

export default Tools;

import Tools from '@/assets/js/tools';
import path from 'path';
import Constants from '@/assets/js/constants';
import Database from '@/assets/js/database';
import ffmpeg from 'fluent-ffmpeg';
import {remote} from 'electron';

/**
 * 回放下载任务
 */
export default class DownloadTask {
    private _url!: string;
    private _saveDirectory: string = Database.instance().getDownloadDir();
    private _filename!: string;
    private _onProgress: (progress: number) => void = () => {
    };
    private _onEnd: () => void = () => {
    };
    private _ffmpegCommand: any = null;
    private _status: number = Constants.DownloadStatus.Prepared;
    private _liveId!: string;

    public constructor(url: string, filename: string, liveId: string) {
        this._url = url;
        this._filename = filename;
        this._liveId = liveId;
    }

    public getUrl(): string {
        return this._url;
    }

    public setUrl(value: string) {
        this._url = value;
    }

    public getSaveDirectory(): string {
        return this._saveDirectory;
    }

    public setSaveDirectory(value: string) {
        this._saveDirectory = value;
    }

    public getFilename(): string {
        return this._filename;
    }

    public setFilename(value: string) {
        this._filename = value;
    }

    public getLiveId() {
        return this._liveId;
    }

    public setOnProgress(value: (progress: number) => void) {
        this._onProgress = value;
    }

    public setOnEnd(value: () => void) {
        this._onEnd = value;
    }

    public getFilePath() {
        return path.join(this._saveDirectory, this._filename);
    }

    public start(startListener: () => void) {
        ffmpeg.setFfmpegPath(Tools.ffmpegPath());
        this._ffmpegCommand = ffmpeg(this._url)
            .inputOptions([
                '-protocol_whitelist',
                'file,http,https,tcp,tls',
                `-user_agent`,
                ` ${Database.instance().get('userAgent', Constants.DEFAULT_USER_AGENT)}`
            ])
            .audioCodec('copy')
            .videoCodec('copy')
            .format('mp4')
            .on('start', () => {
                this._status = Constants.DownloadStatus.Downloading;
                startListener();
                console.info('download task start');
            })
            .on('progress', (progress: any) => {
                let percent: number = parseFloat(progress.percent.toFixed(2));
                if (percent > 100) {
                    percent = 100;
                }
                this._onProgress(percent);
                console.info('ffmpeg progress event', progress);
            })
            .on('end', () => {
                this._status = Constants.DownloadStatus.Finish;
                this._onEnd();
            })
            .save(path.join(this._saveDirectory, this._filename));
    }

    public isDownloading() {
        return this._status === Constants.DownloadStatus.Downloading;
    }

    public isFinish() {
        return this._status === Constants.DownloadStatus.Finish;
    }

    public stop() {
        if (this._ffmpegCommand === null || this._status !== Constants.DownloadStatus.Downloading) {
            return;
        }
        try {
            this._ffmpegCommand.ffmpegProc.stdin.write('q');
        } finally {
            this._status = Constants.DownloadStatus.Finish;
            console.info('download task stop');
        }
    }

    public openSaveDirectory() {
        remote.shell.showItemInFolder(this.getFilePath());
    }
}

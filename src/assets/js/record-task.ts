import Database from '@/assets/js/database';
import Constants from '@/assets/js/constants';
import path from 'path';
import Tools from '@/assets/js/tools';
import ffmpeg from 'fluent-ffmpeg';
import {remote} from 'electron';

/**
 * 直播录制任务
 */
export default class RecordTask {
    private _url!: string;
    private _saveDirectory: string = Database.instance().getDownloadDir();
    private _filename!: string;
    private _onProgress: (progress: number) => void = () => {
    };
    private _onEnd: () => void = () => {
    };
    private _ffmpegCommand: any = null;
    private _status: number = Constants.RecordStatus.Prepared;
    private _liveId!: string;
    private _duration: number = 0;

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
            .on('start', () => {
                this._status = Constants.RecordStatus.Recording;
                startListener();
                console.info('record task start');
            })
            .on('progress', (progress: any) => {
                console.info('ffmpeg progress event');
                console.log(progress);
                this.setDuration(progress.timemark);
            })
            .on('end', () => {
                this._onEnd();
            })
            .audioCodec('copy')
            .videoCodec('copy')
            .save(this.getFilePath());
    }

    public isRecording() {
        return this._status === Constants.RecordStatus.Recording;
    }

    public isFinish() {
        return this._status === Constants.RecordStatus.Finish;
    }

    public stop() {
        if (this._ffmpegCommand === null || this._status !== Constants.RecordStatus.Recording) return;
        try {
            this._ffmpegCommand.ffmpegProc.stdin.write('q');
        } finally {
            this._status = Constants.RecordStatus.Finish;
            console.info('record task stop');
        }
    }

    public openSaveDirectory() {
        remote.shell.showItemInFolder(this.getFilePath());
    }

    private setDuration(timeMark: string) {
        const timeArray = timeMark.split(':');
        if (timeArray.length === 0) this._duration = 0;
        const hours: number = parseFloat(timeArray[0]);
        const minutes: number = parseFloat(timeArray[1]);
        const seconds: number = parseFloat(timeArray[2]);
        this._duration = hours * 60 * 60 + minutes * 60 + seconds;
        console.log('duration', this._duration);
    }
}

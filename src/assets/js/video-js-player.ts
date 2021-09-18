import IPlayer from '@/assets/js/i-player';

export default class VideoJsPlayer implements IPlayer {
    private player: any;

    constructor(player: any) {
        this.player = player;
    }

    public mute(): void {
        this.player.volume(0);
    }

    public pause(): void {
        this.player.pause();
    }

    public play(): void {
        this.player.play();
    }

    public volume(volume: number): void {
        this.player.volume(volume * 0.01);
    }

    public load(): void {
    }

    public currentTime(currentTime: number): void {
        this.player.currentTime(currentTime);
    }

    public destroy(): void {
        this.player.dispose();
    }

    public onGotDuration(callback: (duration: number) => void): void {
        this.player.on('loadeddata', (event: any) => {
            callback(event.target.player.duration());
        });
    }

    public onTimeUpdate(callback: (currentTime: number) => void): void {
        this.player.on('timeupdate', (event: any) => {
            try {
                callback(event.target.player.currentTime());
            } catch (e) {}
        });
    }

    public requestPictureInPicture(): void {
        this.player.requestPictureInPicture();
    }

    public fullScreen(): void {
        this.player.requestFullscreen();
    }
}


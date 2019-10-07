import IPlayer from '@/assets/js/i-player';

export default class FlvJsPlayer implements IPlayer {
    private player: any;

    constructor(player: any) {
        this.player = player;
    }

    public mute(): void {
        this.player.volume = 0;
    }

    public pause(): void {
        this.player.pause();
    }

    public play(): void {
        this.player.play();
    }

    public load(): void {
        this.player.load();
    }

    public volume(volume: number): void {
        this.player.volume = volume * 0.01;
    }

    public currentTime(currentTime: number): void {
        this.player.currentTime = currentTime;
    }

    public destroy(): void {
        this.player.destroy();
    }

    public onGotDuration(callback: (duration: number) => void): void {
        this.player._mediaElement.addEventListener('loadeddata', (event: any) => {
            callback(event.target.duration);
        });
    }

    public onTimeUpdate(callback: (currentTime: number) => void): void {
        this.player._mediaElement.addEventListener('timeupdate', (event: any) => {
            callback(event.target.currentTime);
        });
    }

    public requestPictureInPicture(): void {
        //
    }

    public fullScreen(): void {

    }
}

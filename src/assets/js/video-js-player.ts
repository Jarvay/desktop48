import IPlayer from '@/assets/js/i-player';

export default class VideoJsPlayer implements IPlayer {
    private player: any;

    constructor(player: any) {
        this.player = player;
    }

    public mute() {
        this.player.volume(0);
    }

    public pause() {
        this.player.pause();
    }

    public  play() {
        this.player.play();
    }

    public volume(volume: number) {
        this.player.volume(volume * 0.01);
    }

    public load() {
    }

    public currentTime(currentTime: number) {
        this.player.currentTime(currentTime);
    }

    public destroy() {
        this.player.dispose();
    }

    public onGotDuration(callback: any) {
        this.player.on('loadeddata', (event: any) => {
            callback(event.target.player.duration());
        });
    }

    public  onTimeUpdate(callback: any) {
        this.player.on('timeupdate', (event: any) => {
            callback(event.target.player.currentTime());
        });
    }

    public requestPictureInPicture() {
        this.player.requestPictureInPicture();
    }

    public fullScreen() {
        this.player.requestFullscreen();
    }
}


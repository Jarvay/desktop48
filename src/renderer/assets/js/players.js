class FlvJsPlayer {
    player;

    constructor(player) {
        this.player = player;
    }

    mute() {
        this.player.volume = 0;
    }

    pause() {
        this.player.pause();
    }

    play() {
        this.player.play();
    }

    load() {
        this.player.load();
    }

    volume(volume) {
        this.player.volume = volume * 0.01;
    }

    currentTime(currentTime) {
        this.player.currentTime = currentTime;
    }

    destroy() {
        this.player.destroy();
    }

    onGotDuration(callback) {
        this.player._mediaElement.addEventListener('loadeddata', event => {
            callback(event.target.duration);
        });
    }

    onTimeUpdate(callback) {
        this.player._mediaElement.addEventListener('timeupdate', event => {
            callback(event.target.currentTime);
        });
    }
}

class VideoJsPlayer {
    player;

    constructor(player) {
        this.player = player;
    }

    mute() {
        this.player.volume(0);
    }

    pause() {
        this.player.pause();
    }

    play() {
        this.player.play();
    }

    volume(volume) {
        this.player.volume(volume * 0.01);
    }

    load() {
    }

    currentTime(currentTime) {
        this.player.currentTime(currentTime);
    }

    destroy() {
        this.player.dispose();
    }

    onGotDuration(callback) {
        this.player.on('loadeddata', event => {
            callback(event.target.player.duration());
        });
    }

    onTimeUpdate(callback) {
        this.player.on('timeupdate', event => {
            callback(event.target.player.currentTime());
        });
    }
}

export {FlvJsPlayer, VideoJsPlayer};
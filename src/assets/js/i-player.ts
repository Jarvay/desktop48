export default interface IPlayer {
    mute(): void;

    pause(): void;

    play(): void;

    load(): void;

    volume(volume: number): void;

    currentTime(currentTime: number): void;

    destroy(): void;

    onGotDuration(callback: any): void;

    onTimeUpdate(callback: any): void;

    requestPictureInPicture(): void;

    fullScreen(): void;
}

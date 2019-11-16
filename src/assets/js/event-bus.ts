import Vue from 'vue';

export default class EventBus {
    private static eventBus = new Vue();

    public static post<T>(event: string, param: T) {
        this.eventBus.$emit(event, param);
        console.info('post event', event);
    }

    public static bind<T>(event: string, listener: (param: T) => any) {
        this.eventBus.$on(event, listener);
        console.info('bind event', event);
    }
}

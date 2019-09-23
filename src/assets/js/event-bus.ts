import Vue from 'vue';
import Debug from '@/assets/js/debug';

export default class EventBus {
    private static eventBus = new Vue();

    public static post<T>(event: string, param: T) {
        this.eventBus.$emit(event, param);
        Debug.info('post event');
    }

    public static bind<T>(event: string, listener: (param: T) => any) {
        this.eventBus.$on(event, listener);
        Debug.info('bind event');
    }
}

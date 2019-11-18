import Lives from '@/components/Lives.vue';
import Reviews from '@/components/Reviews.vue';
import Setting from '@/components/Setting.vue';
import Downloads from '@/components/Downloads.vue';

const routes: any[] = [
    {
        path: '/lives',
        component: Lives
    },
    {
        path: '/reviews',
        component: Reviews
    },
    {
        path: '/setting',
        component: Setting
    },
    {
        path: '/downloads',
        component: Downloads
    },
    {
        path: '/',
        redirect: '/lives'
    }
];
export default routes;

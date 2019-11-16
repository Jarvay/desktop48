const Lives = () => import('@/components/Lives.vue');
const Reviews = () => import('@/components/Reviews.vue');
const Setting = () => import('@/components/Setting.vue');
const Downloads = () => import('@/components/Downloads.vue');

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

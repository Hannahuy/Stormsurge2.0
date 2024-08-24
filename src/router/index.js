
import { createRouter, createWebHashHistory } from "vue-router"
const routes = [
    {
        path: '/',
        name: '青岛澳门路近岸海洋动力灾害数字孪生系统',
        component: () => import('../components/Homepage.vue')
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    mode: "hash",
    routes: routes
})
router.beforeEach((to) => {
    document.title = to.name
})
export default router


import { createRouter, createWebHashHistory } from "vue-router"
const routes = [
    {
        path: '/',
        name: '近岸风暴潮防灾减灾数字孪生系统',
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

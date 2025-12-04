import { createRouter, createWebHistory } from 'vue-router';
import { use_auth_store } from '../stores/auth-store';

const routes = [
    {
        path: '/',
        component: () => import('../components/layout/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('../views/HomeView.vue'),
            },
            {
                path: 'legal/terms',
                name: 'terms',
                component: () => import('../views/legal/TermsView.vue'),
            },
            {
                path: 'legal/privacy',
                name: 'privacy',
                component: () => import('../views/legal/PrivacyView.vue'),
            },
            {
                path: 'auth/register',
                name: 'register',
                component: () => import('../views/auth/RegisterView.vue'),
            },
            {
                path: 'auth/verify',
                name: 'verify',
                component: () => import('../views/auth/VerifyView.vue'),
            },
            {
                path: 'auth/login',
                name: 'login',
                component: () => import('../views/auth/LoginView.vue'),
            },
        ]
    },
    // Rutas Protegidas (Dashboard)
    {
        path: '/app',
        component: () => import('../components/layout/MainLayout.vue'),
        meta: { requires_auth: true },
        children: [
            {
                path: 'dashboard', // /app/dashboard
                name: 'dashboard',
                component: () => import('../views/dashboard/DashboardView.vue'),
            },
            {
                path: 'profile',
                name: 'profile',
                // Placeholder por ahora, puedes crear ProfileView.vue luego
                component: () => import('../views/dashboard/ProfileView.vue'),
            },
            // Agregaremos scholarships, projects, etc. aquí
        ]
    },
    // Selección de Pago (Protegida pero fuera del layout principal o dentro, tú decides. 
    // La pondré fuera para enfocar en la compra)
    {
        path: '/payment-selection',
        name: 'payment-selection',
        component: () => import('../views/payment/PaymentSelectionView.vue'),
        meta: { requires_auth: true }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            console.log(to, from, savedPosition);
            return savedPosition;
        } else {
            return { top: 0, behavior: 'smooth' };
        }
    }
});

router.beforeEach(async (to, from, next) => {
    const auth_store = use_auth_store();

    // Proteger rutas
    if (to.meta.requires_auth && !auth_store.is_authenticated) {
        console.log(from);
        return next({ name: 'login' });
    }

    // Redirigir si ya está logueado
    if (auth_store.is_authenticated && ['login', 'register', 'home'].includes(to.name as string)) {
        // Permitimos visitar home, pero login/register redirigen a dashboard
        if (to.name !== 'home') return next({ name: 'dashboard' });
    }

    next();
});

export default router;
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
            {
                path: 'auth/forgot-password',
                name: 'forgot-password',
                component: () => import('../views/auth/ForgotPasswordView.vue'),
            },
            {
                path: 'auth/reset-password',
                name: 'reset-password',
                component: () => import('../views/auth/ResetPasswordView.vue'),
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
                path: 'payment',
                name: 'payment',
                component: () => import('../views/payment/PaymentSelectionView.vue'),
            },
            {
                path: 'admin',
                name: 'admin-dashboard',
                component: () => import('../views/dashboard/admin/AdminDashboardView.vue'),
                meta: { roles: ['Admin'] }
            },
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
            {
                path: 'appointments', // /app/appointments
                name: 'appointments',
                component: () => import('../views/dashboard/student/appointments/AppointmentsView.vue'),
                // meta: { roles: ['student', 'talent'] } // Opcional
            },
            {
                path: 'scholarships',
                name: 'scholarships',
                component: () => import('../views/scholarships/ScholarshipsView.vue'),
                meta: { roles: ['student', 'talent', 'user'] }
            },
            {
                path: 'projects',
                name: 'projects-list',
                component: () => import('../views/dashboard/student/projects/ProjectsListView.vue'),
                meta: { roles: ['student', 'talent', 'user'] }
            },
            {
                path: 'study-groups',
                name: 'study-groups-list',
                component: () => import('../views/dashboard/student/study-groups/StudyGroupsListView.vue'),
            },
            {
                path: 'study-groups/:id',
                name: 'group-chat',
                component: () => import('../views/dashboard/student/study-groups/GroupChatView.vue'),
                props: true
            },
            {
                path: 'projects/create',
                name: 'create-project',
                component: () => import('../views/dashboard/company/projects/CreateProjectView.vue'),
                meta: { roles: ['company', 'vc'] } // ✅ Protegido
            },
            {
                path: 'company/projects/:id/deliveries',
                name: 'project-deliveries',
                component: () => import('../views/dashboard/company/projects/ProjectDeliveriesView.vue'),
                meta: { roles: ['company', 'vc'] }
            },
            {
                path: 'talent-search',
                name: 'talent-search',
                component: () => import('../views/dashboard/company/TalentSearchView.vue'),
                meta: { roles: ['company', 'vc'] }
            },
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
    if (!auth_store.user && localStorage.getItem('token')) {
        await auth_store.refresh();
    }

    if (to.meta.requires_auth && !auth_store.is_authenticated) {
        console.log(from);
        return next({ name: 'login' });
    }

    if (auth_store.is_authenticated && to.meta.requires_auth) {
        const user = auth_store.user;
        const needs_payment = ['student', 'talent'].includes(user?.role) && user?.payment_status !== 'active';

        if (needs_payment && to.name !== 'payment') {
            return next({ name: 'payment' });
        }
    }

    // Proteger rutas de administrador
    if (to.meta.roles) {
        const required_roles = to.meta.roles as string[];
        const user_role = auth_store.user?.role;

        if (!user_role || !required_roles.includes(user_role)) {
            // Si no tiene permiso, lo mandamos al dashboard general
            return next({ name: 'dashboard' });
        }
    }

    // Redirigir si ya está logueado (Auth pages)
    if (auth_store.is_authenticated && ['login', 'register', 'home'].includes(to.name as string)) {
        if (to.name !== 'home') {
            if (auth_store.user?.role === 'Admin') {
                return next({ name: 'admin-dashboard' })
            }
            return next({ name: 'dashboard' })
        }
    }

    next();
});

export default router;
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';

// Interfaces
interface DashboardStats {
    total_users: number;
    pending_companies: number;
    pending_payments: number;
    pending_projects: number;
    active_members: number;
    pending_scholarship_apps: number;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    account_status: string;
    payment_status: string;
    created_at: string;
    profile?: {
        website?: string;
    };
}

interface Payment {
    _id: string;
    user_id: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    amount: number;
    method: string;
    status: string;
    plan: string;
    offline_reference: string;
    created_at: string;
}

interface Project {
    _id: string;
    title: string;
    description: string;
    status: string;
    company_id: {
        _id: string;
        name: string;
        email: string;
    };
    created_at: string;
}

interface Pagination {
    current_page: number;
    total_pages: number;
    total_users: number;
}

export const use_admin_store = defineStore('admin', () => {
    // ============================================
    // 📊 STATE
    // ============================================
    const stats = ref<DashboardStats>({
        total_users: 0,
        pending_companies: 0,
        pending_payments: 0,
        pending_projects: 0,
        active_members: 0,
        pending_scholarship_apps: 0
    });

    const users = ref<User[]>([]);
    const pagination = ref<Pagination>({
        current_page: 1,
        total_pages: 1,
        total_users: 0
    });

    const pending_payments = ref<Payment[]>([]);
    const pending_projects = ref<Project[]>([]);

    const is_loading = ref(false);
    const current_filter = ref({
        role: '',
        account_status: '',
        payment_status: '',
        search: ''
    });

    const ui_store = use_ui_store();

    // ============================================
    // 🔢 GETTERS
    // ============================================
    const has_pending_items = computed(() =>
        stats.value.pending_companies > 0 ||
        stats.value.pending_payments > 0 ||
        stats.value.pending_projects > 0
    );

    const pending_companies_list = computed(() =>
        users.value.filter(u => u.account_status === 'pending_approval')
    );

    // ============================================
    // 📊 DASHBOARD
    // ============================================
    const fetch_stats = async () => {
        try {
            const { data } = await api_client.get('/api/admin/stats');
            stats.value = data.data;
        } catch (error) {
            console.error('[Admin] Error cargando stats:', error);
        }
    };

    // ============================================
    // 👥 USUARIOS
    // ============================================
    const fetch_users = async (filters: any = {}, page = 1) => {
        is_loading.value = true;
        try {
            const params = new URLSearchParams();

            if (filters.role) params.append('role', filters.role);
            if (filters.account_status) params.append('account_status', filters.account_status);
            if (filters.payment_status) params.append('payment_status', filters.payment_status);
            if (filters.search) params.append('search', filters.search);
            params.append('page', String(page));
            params.append('limit', '20');

            const { data } = await api_client.get(`/api/admin/users?${params.toString()}`);
            users.value = data.data.users;
            pagination.value = data.data.pagination;
            current_filter.value = filters;
        } catch (error) {
            console.error('[Admin] Error cargando usuarios:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const approve_company = async (user_id: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/users/${user_id}/approve`);

            // Actualizar lista local
            const user = users.value.find(u => u._id === user_id);
            if (user) {
                user.account_status = 'active';
                user.payment_status = 'free_trial';
            }

            // Actualizar stats
            stats.value.pending_companies--;

            ui_store.show_toast('Empresa aprobada exitosamente', 'success');
        } catch (error) {
            console.error('[Admin] Error aprobando empresa:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const reject_company = async (user_id: string, reason?: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/users/${user_id}/reject`, { reason });

            // Remover de lista
            users.value = users.value.filter(u => u._id !== user_id);
            stats.value.pending_companies--;

            ui_store.show_toast('Empresa rechazada', 'success');
        } catch (error) {
            console.error('[Admin] Error rechazando empresa:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const suspend_user = async (user_id: string, reason?: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/users/${user_id}/suspend`, { reason });

            const user = users.value.find(u => u._id === user_id);
            if (user) {
                user.account_status = 'suspended';
            }

            ui_store.show_toast('Usuario suspendido', 'success');
        } catch (error) {
            console.error('[Admin] Error suspendiendo usuario:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const reactivate_user = async (user_id: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/users/${user_id}/reactivate`);

            const user = users.value.find(u => u._id === user_id);
            if (user) {
                user.account_status = 'active';
            }

            ui_store.show_toast('Usuario reactivado', 'success');
        } catch (error) {
            console.error('[Admin] Error reactivando usuario:', error);
        } finally {
            is_loading.value = false;
        }
    };

    // ============================================
    // 💳 PAGOS OFFLINE
    // ============================================
    const fetch_pending_payments = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/admin/payments/pending');
            pending_payments.value = data.data;
        } catch (error) {
            console.error('[Admin] Error cargando pagos:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const approve_payment = async (payment_id: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/payments/${payment_id}/approve`);

            // Remover de lista
            pending_payments.value = pending_payments.value.filter(p => p._id !== payment_id);
            stats.value.pending_payments--;

            ui_store.show_toast('Pago aprobado y membresía activada', 'success');
        } catch (error) {
            console.error('[Admin] Error aprobando pago:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const reject_payment = async (payment_id: string, reason?: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/payments/${payment_id}/reject`, { reason });

            pending_payments.value = pending_payments.value.filter(p => p._id !== payment_id);
            stats.value.pending_payments--;

            ui_store.show_toast('Pago rechazado', 'success');
        } catch (error) {
            console.error('[Admin] Error rechazando pago:', error);
        } finally {
            is_loading.value = false;
        }
    };

    // ============================================
    // 🚀 PROYECTOS
    // ============================================
    const fetch_pending_projects = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/admin/projects/pending');
            pending_projects.value = data.data;
        } catch (error) {
            console.error('[Admin] Error cargando proyectos:', error);
        } finally {
            is_loading.value = false;
        }
    };

    const approve_project = async (project_id: string) => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/projects/${project_id}/approve`);

            pending_projects.value = pending_projects.value.filter(p => p._id !== project_id);
            stats.value.pending_projects--;

            ui_store.show_toast('Proyecto aprobado y publicado', 'success');
        } catch (error) {
            console.error('[Admin] Error aprobando proyecto:', error);
        } finally {
            is_loading.value = false;
        }
    };

    // ============================================
    // 🔄 REFRESH ALL
    // ============================================
    const refresh_all = async () => {
        is_loading.value = true;
        try {
            await Promise.all([
                fetch_stats(),
                fetch_users({ account_status: 'pending_approval' }),
                fetch_pending_payments(),
                fetch_pending_projects()
            ]);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        // State
        stats,
        users,
        pagination,
        pending_payments,
        pending_projects,
        is_loading,
        current_filter,

        // Getters
        has_pending_items,
        pending_companies_list,

        // Actions - Dashboard
        fetch_stats,
        refresh_all,

        // Actions - Users
        fetch_users,
        approve_company,
        reject_company,
        suspend_user,
        reactivate_user,

        // Actions - Payments
        fetch_pending_payments,
        approve_payment,
        reject_payment,

        // Actions - Projects
        fetch_pending_projects,
        approve_project
    };
});
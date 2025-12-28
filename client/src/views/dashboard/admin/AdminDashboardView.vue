<template>
    <div class="admin-dashboard">
        <!-- Header -->
        <div class="header-section">
            <div>
                <h2>Panel de Administración</h2>
                <p class="subtitle">Gestión de usuarios, pagos y proyectos</p>
            </div>
            <button class="refresh-btn" @click="refresh_data" :disabled="admin_store.is_loading">
                🔄 Actualizar Todo
            </button>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <span class="label">Total Usuarios</span>
                <span class="value">{{ admin_store.stats.total_users }}</span>
            </div>
            <div class="stat-card" :class="{ 'has-pending': admin_store.stats.pending_companies > 0 }">
                <span class="label">Empresas Pendientes</span>
                <span class="value">{{ admin_store.stats.pending_companies }}</span>
            </div>
            <div class="stat-card" :class="{ 'has-pending': admin_store.stats.pending_payments > 0 }">
                <span class="label">Pagos Pendientes</span>
                <span class="value">{{ admin_store.stats.pending_payments }}</span>
            </div>
            <div class="stat-card" :class="{ 'has-pending': admin_store.stats.pending_projects > 0 }">
                <span class="label">Proyectos por Aprobar</span>
                <span class="value">{{ admin_store.stats.pending_projects }}</span>
            </div>
            <div class="stat-card">
                <span class="label">Miembros Activos</span>
                <span class="value">{{ admin_store.stats.active_members }}</span>
            </div>
            <div class="stat-card">
                <span class="label">Becas Pendientes</span>
                <span class="value">{{ admin_store.stats.pending_scholarship_apps }}</span>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
            <button v-for="tab in tabs" :key="tab.id" :class="['tab', { active: active_tab === tab.id }]"
                @click="active_tab = tab.id">
                {{ tab.label }}
                <span v-if="tab.count > 0" class="badge">{{ tab.count }}</span>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="admin_store.is_loading" class="loading-state">
            Cargando datos...
        </div>

        <!-- Tab Content -->
        <div v-else class="tab-content">
            <!-- Empresas Pendientes -->
            <div v-if="active_tab === 'companies'" class="section">
                <div v-if="admin_store.pending_companies_list.length === 0" class="empty-state">
                    <p>✅ No hay empresas pendientes de aprobación</p>
                </div>

                <div v-else class="cards-list">
                    <div v-for="user in admin_store.pending_companies_list" :key="user._id" class="card">
                        <div class="card-header">
                            <div>
                                <h4>{{ user.name }}</h4>
                                <p class="email">{{ user.email }}</p>
                            </div>
                            <span class="role-badge">{{ user.role }}</span>
                        </div>
                        <div class="card-body">
                            <div class="info-row">
                                <span class="label">Sitio Web:</span>
                                <a v-if="user.profile?.website" :href="user.profile.website" target="_blank">
                                    {{ user.profile.website }}
                                </a>
                                <span v-else class="no-data">No proporcionado</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Registrado:</span>
                                <span>{{ format_date(user.created_at) }}</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-danger" @click="handle_reject_company(user)"
                                :disabled="processing === user._id">
                                Rechazar
                            </button>
                            <button class="btn btn-success" @click="handle_approve_company(user._id)"
                                :disabled="processing === user._id">
                                Aprobar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagos Offline -->
            <div v-if="active_tab === 'payments'" class="section">
                <div v-if="admin_store.pending_payments.length === 0" class="empty-state">
                    <p>✅ No hay pagos pendientes de verificación</p>
                </div>

                <div v-else class="cards-list">
                    <div v-for="payment in admin_store.pending_payments" :key="payment._id" class="card">
                        <div class="card-header">
                            <div>
                                <h4>{{ payment.user_id.name }}</h4>
                                <p class="email">{{ payment.user_id.email }}</p>
                            </div>
                            <span class="plan-badge">{{ payment.plan }}</span>
                        </div>
                        <div class="card-body">
                            <div class="info-row">
                                <span class="label">Monto:</span>
                                <span class="amount">€{{ payment.amount }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Referencia:</span>
                                <code>{{ payment.offline_reference }}</code>
                            </div>
                            <div class="info-row">
                                <span class="label">Fecha:</span>
                                <span>{{ format_date(payment.created_at) }}</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-danger" @click="handle_reject_payment(payment)"
                                :disabled="processing === payment._id">
                                Rechazar
                            </button>
                            <button class="btn btn-success" @click="handle_approve_payment(payment._id)"
                                :disabled="processing === payment._id">
                                Aprobar Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Proyectos Pendientes -->
            <div v-if="active_tab === 'projects'" class="section">
                <div v-if="admin_store.pending_projects.length === 0" class="empty-state">
                    <p>✅ No hay proyectos pendientes de revisión</p>
                </div>

                <div v-else class="cards-list">
                    <div v-for="project in admin_store.pending_projects" :key="project._id" class="card">
                        <div class="card-header">
                            <div>
                                <h4>{{ project.title }}</h4>
                                <p class="email">{{ project.company_id.name }} - {{ project.company_id.email }}</p>
                            </div>
                            <span class="status-badge pending">Pendiente</span>
                        </div>
                        <div class="card-body">
                            <p class="description">{{ project.description }}</p>
                            <div class="info-row">
                                <span class="label">Enviado:</span>
                                <span>{{ format_date(project.created_at) }}</span>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-success" @click="handle_approve_project(project._id)"
                                :disabled="processing === project._id">
                                Aprobar y Publicar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gestión de Usuarios -->
            <div v-if="active_tab === 'users'" class="section">
                <!-- Filtros -->
                <div class="filters">
                    <input type="text" v-model="filters.search" placeholder="Buscar por nombre o email..."
                        class="search-input" @keyup.enter="apply_filters" />
                    <select v-model="filters.role" @change="apply_filters">
                        <option value="">Todos los roles</option>
                        <option value="user">User</option>
                        <option value="student">Student</option>
                        <option value="talent">Talent</option>
                        <option value="company">Company</option>
                        <option value="vc">VC</option>
                    </select>
                    <select v-model="filters.account_status" @change="apply_filters">
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="pending_approval">Pendiente</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                    <button class="btn btn-secondary" @click="apply_filters">
                        Filtrar
                    </button>
                </div>

                <!-- Lista de Usuarios -->
                <div v-if="admin_store.users.length === 0" class="empty-state">
                    <p>No se encontraron usuarios con esos filtros</p>
                </div>

                <div v-else class="users-table-wrapper">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Pago</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in admin_store.users" :key="user._id">
                                <td>{{ user.name }}</td>
                                <td>{{ user.email }}</td>
                                <td><span class="role-badge small">{{ user.role }}</span></td>
                                <td>
                                    <span :class="['status-badge', 'small', user.account_status]">
                                        {{ status_labels[user.account_status] || user.account_status }}
                                    </span>
                                </td>
                                <td>
                                    <span :class="['payment-badge', user.payment_status]">
                                        {{ user.payment_status }}
                                    </span>
                                </td>
                                <td class="actions-cell">
                                    <button v-if="user.account_status === 'suspended'" class="btn btn-small btn-success"
                                        @click="admin_store.reactivate_user(user._id)"
                                        :disabled="processing === user._id">
                                        Reactivar
                                    </button>
                                    <button v-else-if="user.role !== 'Admin'" class="btn btn-small btn-danger"
                                        @click="handle_suspend_user(user)" :disabled="processing === user._id">
                                        Suspender
                                    </button>
                                    <span v-else class="no-action">-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Paginación -->
                    <div v-if="admin_store.pagination.total_pages > 1" class="pagination">
                        <button :disabled="admin_store.pagination.current_page <= 1"
                            @click="change_page(admin_store.pagination.current_page - 1)">
                            ← Anterior
                        </button>
                        <span>
                            Página {{ admin_store.pagination.current_page }}
                            de {{ admin_store.pagination.total_pages }}
                        </span>
                        <button :disabled="admin_store.pagination.current_page >= admin_store.pagination.total_pages"
                            @click="change_page(admin_store.pagination.current_page + 1)">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { use_admin_store } from '../../../stores/admin-store';

const admin_store = use_admin_store();

// State
const active_tab = ref('companies');
const processing = ref<string | null>(null);
const filters = ref({
    search: '',
    role: '',
    account_status: '',
    payment_status: ''
});

// Tabs config
const tabs = computed(() => [
    { id: 'companies', label: 'Empresas', count: admin_store.stats.pending_companies },
    { id: 'payments', label: 'Pagos', count: admin_store.stats.pending_payments },
    { id: 'projects', label: 'Proyectos', count: admin_store.stats.pending_projects },
    { id: 'users', label: 'Usuarios', count: 0 }
]);

const status_labels: Record<string, string> = {
    active: 'Activo',
    pending_approval: 'Pendiente',
    suspended: 'Suspendido'
};

// Helpers
const format_date = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Actions
const refresh_data = async () => {
    await admin_store.refresh_all();
};

const apply_filters = () => {
    admin_store.fetch_users(filters.value);
};

const change_page = (page: number) => {
    admin_store.fetch_users(filters.value, page);
};

// Company handlers
const handle_approve_company = async (user_id: string) => {
    if (!confirm('¿Aprobar esta empresa? Se le enviará un email de bienvenida.')) return;

    processing.value = user_id;
    await admin_store.approve_company(user_id);
    processing.value = null;
};

const handle_reject_company = async (user: any) => {
    const reason = prompt(`¿Razón del rechazo para ${user.name}?`);
    if (reason === null) return;

    processing.value = user._id;
    await admin_store.reject_company(user._id, reason);
    processing.value = null;
};

// Payment handlers
const handle_approve_payment = async (payment_id: string) => {
    if (!confirm('¿Confirmar que el pago fue verificado? Se activará la membresía.')) return;

    processing.value = payment_id;
    await admin_store.approve_payment(payment_id);
    processing.value = null;
};

const handle_reject_payment = async (payment: any) => {
    const reason = prompt('¿Razón del rechazo? (Se notificará al usuario)');
    if (reason === null) return;

    processing.value = payment._id;
    await admin_store.reject_payment(payment._id, reason);
    processing.value = null;
};

// Project handlers
const handle_approve_project = async (project_id: string) => {
    if (!confirm('¿Aprobar y publicar este proyecto? El talento podrá verlo.')) return;

    processing.value = project_id;
    await admin_store.approve_project(project_id);
    processing.value = null;
};

// User handlers
const handle_suspend_user = async (user: any) => {
    const reason = prompt(`¿Razón para suspender a ${user.name}?`);
    if (reason === null) return;

    processing.value = user._id;
    await admin_store.suspend_user(user._id, reason);
    processing.value = null;
};

// Init
onMounted(() => {
    refresh_data();
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;

    .subtitle {
        color: $color-text-light;
        margin: 0;
    }
}

.refresh-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #f9fafb;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

// Stats Grid
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.25rem;
    border-radius: $radius-md;
    border: 1px solid #e5e7eb;

    &.has-pending {
        border-color: #f59e0b;
        background: #fffbeb;
    }

    .label {
        display: block;
        font-size: 0.8rem;
        color: $color-text-light;
        margin-bottom: 0.5rem;
    }

    .value {
        font-size: 1.75rem;
        font-weight: 800;
        color: $color-primary;
    }
}

// Tabs
.tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    overflow-x: auto;
}

.tab {
    padding: 0.75rem 1.25rem;
    background: transparent;
    border: none;
    border-radius: $radius-md $radius-md 0 0;
    cursor: pointer;
    font-weight: 500;
    color: $color-text-light;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: #f9fafb;
    }

    &.active {
        background: white;
        color: $color-primary;
        border: 1px solid #e5e7eb;
        border-bottom-color: white;
        margin-bottom: -1px;
    }

    .badge {
        background: #ef4444;
        color: white;
        font-size: 0.75rem;
        padding: 0.125rem 0.5rem;
        border-radius: 99px;
    }
}

// Loading & Empty States
.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: $radius-md;
    color: $color-text-light;
}

// Cards List
.cards-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: $radius-md;
    padding: 1.5rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;

    h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
    }

    .email {
        color: $color-text-light;
        font-size: 0.9rem;
        margin: 0;
    }
}

.card-body {
    margin-bottom: 1.5rem;

    .description {
        color: #374151;
        line-height: 1.6;
        margin-bottom: 1rem;
    }
}

.info-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    .label {
        color: $color-text-light;
        min-width: 100px;
    }

    .amount {
        font-weight: 700;
        color: #059669;
    }

    code {
        background: #f3f4f6;
        padding: 0.125rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
    }

    .no-data {
        color: $color-text-light;
        font-style: italic;
    }
}

.card-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

// Badges
.role-badge,
.plan-badge {
    background: #eff6ff;
    color: $color-primary;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;

    &.small {
        padding: 0.125rem 0.5rem;
        font-size: 0.75rem;
    }
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;

    &.pending,
    &.pending_approval {
        background: #fef3c7;
        color: #92400e;
    }

    &.active {
        background: #d1fae5;
        color: #065f46;
    }

    &.suspended {
        background: #fee2e2;
        color: #991b1b;
    }

    &.small {
        padding: 0.125rem 0.5rem;
        font-size: 0.7rem;
    }
}

.payment-badge {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;

    &.active,
    &.free_trial {
        background: #d1fae5;
        color: #065f46;
    }

    &.pending {
        background: #fef3c7;
        color: #92400e;
    }

    &.unpaid {
        background: #f3f4f6;
        color: $color-text-light;
    }
}

// Buttons
.btn {
    padding: 0.5rem 1rem;
    border-radius: $radius-md;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &-success {
        background: #059669;
        color: white;

        &:hover:not(:disabled) {
            background: #047857;
        }
    }

    &-danger {
        background: white;
        color: #dc2626;
        border: 1px solid #dc2626;

        &:hover:not(:disabled) {
            background: #fef2f2;
        }
    }

    &-secondary {
        background: $color-primary;
        color: white;

        &:hover:not(:disabled) {
            opacity: 0.9;
        }
    }

    &-small {
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem;
    }
}

// Filters
.filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;

    .search-input {
        flex: 1;
        min-width: 200px;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: $radius-md;
    }

    select {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: $radius-md;
        background: white;
    }
}

// Users Table
.users-table-wrapper {
    overflow-x: auto;
}

.users-table {
    width: 100%;
    background: white;
    border-collapse: collapse;
    border-radius: $radius-md;
    overflow: hidden;
    border: 1px solid #e5e7eb;

    th,
    td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #f3f4f6;
    }

    th {
        background: #f9fafb;
        font-weight: 600;
        font-size: 0.8rem;
        text-transform: uppercase;
        color: $color-text-light;
    }

    td {
        font-size: 0.9rem;
    }

    .actions-cell {
        white-space: nowrap;
    }

    .no-action {
        color: $color-text-light;
    }
}

// Pagination
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;

    button {
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: $radius-md;
        cursor: pointer;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &:hover:not(:disabled) {
            background: #f9fafb;
        }
    }

    span {
        color: $color-text-light;
        font-size: 0.9rem;
    }
}
</style>

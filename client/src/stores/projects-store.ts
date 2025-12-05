import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';
import { useRouter } from 'vue-router';

export const use_projects_store = defineStore('projects', () => {
    // State
    const open_projects = ref<any[]>([]); // Tablón público
    const my_company_projects = ref<any[]>([]); // Dashboard Empresa
    const current_project = ref<any>(null); // Detalle
    const current_deliveries = ref<any[]>([]);
    const is_loading = ref(false);

    const ui_store = use_ui_store();
    const router = useRouter();

    // --- Talento ---
    const get_open_projects = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/projects');
            open_projects.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const apply_to_project = async (project_id: string, application_data: any) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/projects/${project_id}/apply`, application_data);
            ui_store.show_toast('Postulación enviada exitosamente', 'success');
            router.push({ name: 'dashboard' });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const deliver_project = async (project_id: string, delivery_data: any) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/projects/${project_id}/deliver`, delivery_data);
            ui_store.show_toast('¡Proyecto entregado! Esperando evaluación.', 'success');
            router.push({ name: 'dashboard' });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    // --- Empresa ---
    const create_project = async (project_data: any) => {
        is_loading.value = true;
        try {
            await api_client.post('/api/projects', project_data);
            ui_store.show_toast('Proyecto enviado a revisión', 'success');
            router.push({ name: 'dashboard' });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const get_my_company_projects = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/projects/my-company-projects');
            my_company_projects.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const evaluate_delivery = async (delivery_id: string, evaluation_data: any) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/projects/deliveries/${delivery_id}/evaluate`, evaluation_data);
            ui_store.show_toast('Evaluación registrada', 'success');
            // Recargar proyectos para actualizar estado
            await get_my_company_projects();
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const get_project_deliveries = async (project_id: string) => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get(`/api/projects/${project_id}/deliveries`);
            current_deliveries.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        open_projects,
        my_company_projects,
        current_project,
        current_deliveries,
        is_loading,
        get_open_projects,
        apply_to_project,
        deliver_project,
        create_project,
        get_my_company_projects,
        evaluate_delivery,
        get_project_deliveries
    };
});
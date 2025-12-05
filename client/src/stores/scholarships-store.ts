import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';

export const use_scholarships_store = defineStore('scholarships', () => {
    const scholarships = ref<any[]>([]);
    // Admin state
    const pending_applications = ref<any[]>([]);

    const is_loading = ref(false);
    const ui_store = use_ui_store();

    // --- Público / Estudiante ---
    const get_all_scholarships = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/scholarships');
            scholarships.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const apply_to_scholarship = async (id: string, motivation: string) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/scholarships/${id}/apply`, { motivation });
            ui_store.show_toast('¡Te has postulado correctamente!', 'success');
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    // --- Admin Actions ---
    const get_pending_applications = async () => {
        is_loading.value = true;
        try {
            const { data } = await api_client.get('/api/admin/scholarships/applications');
            pending_applications.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const evaluate_application = async (id: string, status: 'approved' | 'rejected') => {
        is_loading.value = true;
        try {
            await api_client.patch(`/api/admin/scholarships/applications/${id}/evaluate`, { status });

            // Remover de la lista local para UI reactiva
            pending_applications.value = pending_applications.value.filter(app => app._id !== id);

            ui_store.show_toast(`Postulación ${status === 'approved' ? 'aprobada' : 'rechazada'}`, 'success');
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        scholarships,
        pending_applications,
        is_loading,
        get_all_scholarships,
        apply_to_scholarship,
        get_pending_applications,
        evaluate_application
    };
});
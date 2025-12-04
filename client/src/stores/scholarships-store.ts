import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';

export const use_scholarships_store = defineStore('scholarships', () => {
    const scholarships = ref<any[]>([]);
    const my_applications = ref<any[]>([]);
    const is_loading = ref(false);
    const ui_store = use_ui_store();

    const fetch_all = async () => {
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

    const apply = async (id: string, motivation: string) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/scholarships/${id}/apply`, { motivation });
            ui_store.show_toast('¡Te has postulado correctamente!', 'success');
            // Refrescar lista de mis postulaciones si es necesario
        } catch (error) {
            // El error lo maneja el interceptor (ej: 403 Forbidden mostrará mensaje)
            throw error; // Relanzar para manejar en la vista si queremos cerrar modal
        } finally {
            is_loading.value = false;
        }
    };

    return {
        scholarships,
        my_applications,
        is_loading,
        fetch_all,
        apply
    };
});
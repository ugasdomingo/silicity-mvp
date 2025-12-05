import { defineStore } from 'pinia';
import { ref } from 'vue';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';

export const use_talent_store = defineStore('talent', () => {
    const talents = ref<any[]>([]); // Resultados de búsqueda
    const is_loading = ref(false);
    const ui_store = use_ui_store();

    const search_talent = async (filters: { skill?: string; role?: string } = {}) => {
        is_loading.value = true;
        try {
            const params = new URLSearchParams(filters as any).toString();
            const { data } = await api_client.get(`/api/talent?${params}`);
            talents.value = data.data;
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const express_interest = async (talent_id: string, message: string) => {
        is_loading.value = true;
        try {
            await api_client.post(`/api/talent/${talent_id}/interest`, { message });
            ui_store.show_toast('Interés enviado. Te avisaremos si acepta.', 'success');
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    return {
        talents,
        is_loading,
        search_talent,
        express_interest
    };
});
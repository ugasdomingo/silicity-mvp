import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import router from '../router';
import api_client from '../api/axios-client';
import { use_ui_store } from './ui-store';

export const use_auth_store = defineStore('auth', () => {
    const ui_store = use_ui_store()
    // Estado
    const user = ref<any | null>(null);
    const access_token = ref<string>('');
    const is_loading = ref(false);

    // Getters
    const is_authenticated = computed(() => !!access_token.value);

    // Acciones
    const register = async (form_data: any) => {
        is_loading.value = true;
        try {
            // POST /api/auth/register
            await api_client.post('/api/auth/register', form_data);
            // Redirigir a verificar
            router.push({ name: 'verify', query: { email: form_data.email } });
        } catch (error) {
            // El interceptor maneja el error UI
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const verify_email = async (email: string, code: string) => {
        is_loading.value = true;
        try {
            const { data } = await api_client.post('/api/auth/verify', { email, code });
            _set_session(data.data);

            //Notify success 
            ui_store.show_toast('Registro confirmado, Bienvenido(a)', 'success')

            //Send to dashboard
            router.push({ name: 'dashboard' });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const login = async (credentials: any) => {
        is_loading.value = true;
        try {
            const { data } = await api_client.post('/api/auth/login', credentials);
            _set_session(data.data);

            //Notify success 
            ui_store.show_toast('Bienvenido(a) de vuelta', 'success')

            //Send to dashboard
            router.push({ name: 'dashboard' });
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const logout = () => {
        user.value = null;
        access_token.value = '';
        localStorage.removeItem('refresh_token');
        router.push({ name: 'login' });
    };

    // Helper interno para guardar sesión
    const _set_session = (auth_data: any) => {
        user.value = auth_data.user;
        access_token.value = auth_data.access_token;

        // Guardamos Refresh Token en LocalStorage (Persistencia a largo plazo)
        if (auth_data.refresh_token) {
            localStorage.setItem('refresh_token', auth_data.refresh_token);
        }
    };

    return {
        user,
        access_token,
        is_loading,
        is_authenticated,
        register,
        verify_email,
        login,
        logout
    };
});
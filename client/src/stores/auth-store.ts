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
    const refresh_timeout = ref<any>(null);
    const show_timeout = computed(() => refresh_timeout.value !== null);

    // Getters
    const is_authenticated = computed(() => !!access_token.value);

    // Helpers
    const _start_refresh_timer = () => {
        // Limpiar timer anterior si existe para evitar duplicados
        _stop_refresh_timer();

        // Configurar para 14 minutos (14 * 60 * 1000 ms)
        const time_until_refresh = 14 * 60 * 1000;

        refresh_timeout.value = setTimeout(async () => {
            await refresh();
        }, time_until_refresh);
    };

    const _stop_refresh_timer = () => {
        if (refresh_timeout.value) {
            clearTimeout(refresh_timeout.value);
            refresh_timeout.value = null;
        }
    };

    // Helper para decidir a dónde ir según el estado
    const _handle_post_auth_redirect = () => {
        // Si es estudiante o talento Y no ha pagado -> A PAGAR
        if (
            ['student', 'talent'].includes(user.value?.role) &&
            user.value?.payment_status !== 'active'
        ) {
            // Asumiendo que la ruta se llama 'payment' o 'plans'
            router.push({ name: 'payment' });
        } else {
            // Flujo normal (Dashboard)
            if (user.value?.role === 'Admin') {
                router.push({ name: 'admin-dashboard' });
            } else {
                router.push({ name: 'dashboard' });
            }
        }
    };

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
            set_session(data.data);

            //Notify success 
            ui_store.show_toast('Registro confirmado, Bienvenido(a)', 'success')

            //Decidir a dónde ir
            _handle_post_auth_redirect();

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
            set_session(data.data);

            //Notify success 
            ui_store.show_toast('Bienvenido(a) de vuelta', 'success')

            //Decidir a dónde ir
            _handle_post_auth_redirect();
        } catch (error) {
            console.error(error);
        } finally {
            is_loading.value = false;
        }
    };

    const logout = () => {
        user.value = null;
        access_token.value = '';
        localStorage.removeItem('token');
        router.push({ name: 'home' });
    };

    // Helper interno para guardar sesión
    const set_session = (auth_data: any) => {
        user.value = auth_data.user_data;
        access_token.value = auth_data.access_token;
        localStorage.setItem('token', auth_data.refresh_token);

        _start_refresh_timer();
    };

    const refresh = async () => {
        is_loading.value = true;
        try {
            const refresh_token = localStorage.getItem('token')
            const { data } = await api_client.post('/api/auth/refresh', { 'refresh_token': refresh_token });

            set_session(data.data);
            console.log(data.data)

        } catch (error) {
            console.error(error);
            logout();
        } finally {
            is_loading.value = false;
        }
    }

    return {
        user,
        access_token,
        is_loading,
        show_timeout,
        is_authenticated,
        register,
        verify_email,
        login,
        logout,
        refresh,
        set_session
    };
});
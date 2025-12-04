<script setup lang="ts">
// Script setup vacío para compatibilidad TS
</script>

<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="brand">
                    <h3>Silicity</h3>
                    <p>Conectando talento de alto nivel validado psicológicamente con empresas y VCs de impacto.</p>
                </div>

                <div class="links">
                    <h4>Legal</h4>
                    <router-link :to="{ name: 'terms' }">Términos y Condiciones</router-link>
                    <router-link :to="{ name: 'privacy' }">Política de Privacidad</router-link>
                </div>

                <div class="links">
                    <h4>Contacto</h4>
                    <a href="mailto:hola@silicity.com">hola@silicity.com</a>
                </div>
            </div>
            <div class="copy">
                &copy; {{ new Date().getFullYear() }} Silicity. Todos los derechos reservados.
            </div>
        </div>
    </footer>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.footer {
    background-color: #1f2937;
    color: white;
    padding: 3rem 0 1rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.brand {
    h3 {
        color: white;
        margin-bottom: 1rem;
    }

    p {
        color: #9ca3af;
        font-size: 0.9rem;
        line-height: 1.6;
    }
}

.links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h4 {
        color: white;
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }

    a {
        color: #9ca3af;
        font-size: 0.9rem;
        text-decoration: none;

        &:hover {
            color: white;
            text-decoration: underline;
        }
    }
}

.copy {
    text-align: center;
    border-top: 1px solid #374151;
    padding-top: 1.5rem;
    color: #6b7280;
    font-size: 0.85rem;
}
</style>
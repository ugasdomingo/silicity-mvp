<script setup lang="ts">
import { Building2, TrendingUp, CheckCircle2 } from 'lucide-vue-next';
</script>

<template>
    <section class="partners-section" id="empresas">
        <div class="container">

            <div class="section-header">
                <h2>¿Buscas talento tech o startups invertibles?</h2>
                <p class="subtitle">
                    Únete como aliado y accede a profesionales pre-evaluados y emprendimientos curados.
                    Sin ruido. Solo talento validado.
                </p>
            </div>

            <div class="b2b-grid">

                <div class="b2b-card company-card">
                    <div class="card-icon">
                        <Building2 class="icon" />
                    </div>
                    <h3>Para Empresas</h3>
                    <p class="desc">
                        Encuentra talento junior y mid-level que ya ha demostrado sus habilidades en proyectos reales.
                    </p>

                    <ul class="benefit-list">
                        <li>
                            <CheckCircle2 class="check" />
                            <span><strong>Ver talento en acción</strong> en proyectos reales</span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Acceso a <strong>evaluación psicológica</strong></span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Formar equipos a medida</span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Reducir riesgo de contratación</span>
                        </li>
                    </ul>

                    <div class="price-tag">
                        <span class="free">Primer año GRATIS</span>
                    </div>

                    <router-link :to="{ name: 'register', query: { role: 'company' } }" class="btn btn-white">
                        Registrar Empresa
                    </router-link>
                </div>

                <div class="b2b-card vc-card">
                    <div class="card-icon">
                        <TrendingUp class="icon" />
                    </div>
                    <h3>Para VCs e Inversores</h3>
                    <p class="desc">
                        Deal flow curado de emprendimientos tecnológicos nacidos en nuestra comunidad.
                    </p>

                    <ul class="benefit-list">
                        <li>
                            <CheckCircle2 class="check" />
                            <span><strong>Deal flow curado</strong> de startups</span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Identificar talento emprendedor temprano</span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Publicar challenges para founders</span>
                        </li>
                        <li>
                            <CheckCircle2 class="check" />
                            <span>Acceso a Pitches verificados</span>
                        </li>
                    </ul>

                    <div class="price-tag">
                        <span class="free">Primer año GRATIS</span>
                    </div>

                    <router-link :to="{ name: 'register', query: { role: 'vc' } }" class="btn btn-outline-white">
                        Unirme como Inversor
                    </router-link>
                </div>

            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
@use "sass:color";
@use '@/assets/scss/abstracts/variables' as *;

.partners-section {
    padding: 6rem 0;
    background-color: #111827; // Fondo oscuro (Gris muy oscuro / casi negro)
    color: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto 4rem;

    h2 {
        font-size: 2.25rem;
        font-weight: 800;
        margin-bottom: 1rem;
        color: white;
    }

    .subtitle {
        font-size: 1.1rem;
        color: #9ca3af; // Gris claro
        line-height: 1.6;
    }
}

.b2b-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 992px) {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
    }
}

.b2b-card {
    background: rgba(255, 255, 255, 0.05); // Transparencia sutil
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 3rem 2rem;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
    }
}

.card-icon {
    width: 60px;
    height: 60px;
    background: rgba($color-primary, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: #818cf8; // Un indigo más claro para modo oscuro

    .icon {
        width: 32px;
        height: 32px;
    }
}

h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.desc {
    color: #d1d5db;
    line-height: 1.6;
    margin-bottom: 2rem;
    font-size: 1rem;
}

.benefit-list {
    list-style: none;
    margin-bottom: 2.5rem;

    li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
        color: #e5e7eb;

        .check {
            color: $color-success;
            width: 20px;
            height: 20px;
            margin-top: 2px;
            flex-shrink: 0;
        }
    }
}

.price-tag {
    margin-bottom: 1.5rem;

    .free {
        background-color: rgba($color-success, 0.2);
        color: #34d399; // Verde claro
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
}

.btn {
    display: inline-block;
    width: 100%;
    padding: 0.875rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;

    &-white {
        background: white;
        color: #111827;

        &:hover {
            background: #f3f4f6;
        }
    }

    &-outline-white {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;

        &:hover {
            border-color: white;
            background: rgba(255, 255, 255, 0.05);
        }
    }
}
</style>
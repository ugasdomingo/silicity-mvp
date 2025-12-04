<script setup lang="ts">
import {
    Search,
    Code2,
    Globe2,
    Megaphone,
    LineChart,
    Rocket,
    Briefcase
} from 'lucide-vue-next';
</script>

<template>
    <section class="growth-path-section">
        <div class="container">

            <div class="section-header">
                <h2>Mucho más que aprender tecnología</h2>
                <p class="subtitle">
                    Pasa de "tener curiosisdad" a ser un profesional en la industria digital.
                    <br /> Dominarás las habilidades para trabajar en remoto a nivel mundial.
                </p>
            </div>

            <div class="evolution-path">

                <div class="phase phase-start">
                    <div class="icon-circle start-icon">
                        <Search class="icon" />
                    </div>
                    <div class="phase-content">
                        <h3>1. El Explorador</h3>
                        <p class="phase-desc">
                            Tienes la curiosidad y las ganas, pero te faltan los recursos económicos para acceder a
                            educación de élite.
                        </p>
                        <span class="status-badge gray">Tu estado actual</span>
                    </div>
                </div>

                <div class="connector">
                    <div class="line"></div>
                    <div class="arrow"></div>
                </div>

                <div class="phase phase-middle">
                    <div class="skills-orbit">
                        <div class="core-circle">
                            <span class="logo-mark">Silicity</span>
                        </div>

                        <div class="satellite sat-1">
                            <Code2 class="s-icon" /> <span>Tech</span>
                        </div>
                        <div class="satellite sat-2">
                            <Globe2 class="s-icon" /> <span>Inglés</span>
                        </div>
                        <div class="satellite sat-3">
                            <Megaphone class="s-icon" /> <span>Marketing</span>
                        </div>
                        <div class="satellite sat-4">
                            <LineChart class="s-icon" /> <span>Negocios</span>
                        </div>
                    </div>

                    <div class="phase-content">
                        <h3>2. El Profesional 360°</h3>
                        <p class="phase-desc">
                            Te formas integralmente. No solo aprendes código; dominas <strong>inglés</strong>,
                            <strong>liderazgo</strong> y <strong>visión de negocio</strong> para trabajar en remoto.
                        </p>
                        <span class="status-badge blue">Membresía Estudiante</span>
                    </div>
                </div>

                <div class="connector">
                    <div class="line"></div>
                    <div class="arrow"></div>
                </div>

                <div class="phase phase-end">
                    <div class="outcome-container">
                        <div class="outcome-card job">
                            <Briefcase class="o-icon" />
                            <span>Empleo Remoto</span>
                        </div>
                        <div class="outcome-card startup">
                            <Rocket class="o-icon" />
                            <span>Tu Startup</span>
                        </div>
                    </div>

                    <div class="phase-content">
                        <h3>3. El Talento Global</h3>
                        <p class="phase-desc">
                            Ya no buscas oportunidades, ellas te buscan a ti. Estás listo para ser contratado por una
                            startup internacional o fundar la tuya.
                        </p>
                        <span class="status-badge purple">Nivel Talento</span>
                    </div>
                </div>

            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;
@use '@/assets/scss/abstracts/mixins' as *;

.growth-path-section {
    padding: 6rem 0;
    background-color: white;
    overflow: hidden; // Para contener elementos flotantes si los hubiera
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-header {
    text-align: center;
    max-width: 800px;
    margin: 0 auto 5rem;

    h2 {
        font-size: 2.5rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
    }

    .subtitle {
        font-size: 1.2rem;
        color: #6b7280;
        line-height: 1.6;
    }
}

/* --- LAYOUT PRINCIPAL --- */
.evolution-path {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;

    @media (min-width: 992px) {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
    }
}

/* --- FASES COMUNES --- */
.phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
    max-width: 350px;
    min-width: 250px;
    position: relative;
    z-index: 2;
}

.phase-content {
    margin-top: 2rem;

    h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.75rem;
    }

    .phase-desc {
        font-size: 1rem;
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }
}

.status-badge {
    display: inline-block;
    padding: 0.35rem 1rem;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &.gray {
        background: #f3f4f6;
        color: #6b7280;
    }

    &.blue {
        background: #e0e7ff;
        color: $color-primary;
    }

    &.purple {
        background: #f3e8ff;
        color: #7c3aed;
    }
}

/* --- FASE 1: INICIO --- */
.icon-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 2px dashed #d1d5db;
    position: relative;

    .icon {
        width: 40px;
        height: 40px;
        color: #9ca3af;
    }
}

/* --- FASE 2: ORBITA DE SKILLS --- */
.skills-orbit {
    width: 140px;
    height: 140px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto; // Centrar en el contenedor de fase
}

.core-circle {
    width: 80px;
    height: 80px;
    background: $color-primary;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba($color-primary, 0.4);
    z-index: 2;

    .logo-mark {
        color: white;
        font-weight: 800;
        font-size: 0.9rem;
    }
}

.satellite {
    position: absolute;
    background: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    border: 1px solid #e5e7eb;
    z-index: 1;

    .s-icon {
        width: 14px;
        height: 14px;
        color: $color-primary;
    }

    // Posicionamiento manual para efecto órbita
    &.sat-1 {
        top: -10px;
        left: -20px;
        transform: rotate(-10deg);
    }

    &.sat-2 {
        top: -10px;
        right: -20px;
        transform: rotate(10deg);
    }

    &.sat-3 {
        bottom: -5px;
        left: -30px;
        transform: rotate(-5deg);
    }

    &.sat-4 {
        bottom: -5px;
        right: -30px;
        transform: rotate(5deg);
    }
}

/* --- FASE 3: OUTCOME --- */
.outcome-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem; // Ajuste visual
}

.outcome-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem;
    width: 90px;
    height: 90px;
    justify-content: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;

    &:hover {
        transform: translateY(-5px);
        border-color: $color-primary;
    }

    .o-icon {
        width: 24px;
        height: 24px;
        margin-bottom: 0.5rem;
    }

    span {
        font-size: 0.75rem;
        font-weight: 600;
        text-align: center;
        line-height: 1.2;
    }

    &.job {
        .o-icon {
            color: #059669;
        }
    }

    &.startup {
        .o-icon {
            color: #7c3aed;
        }
    }
}

/* --- CONECTORES --- */
.connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    height: 60px; // Altura en móvil
    width: 100%;

    @media (min-width: 992px) {
        height: auto; // Altura automática
        width: auto;
        margin-top: 50px; // Alinear con el centro de los círculos superiores
        padding: 0 1rem;
    }

    .line {
        width: 2px;
        height: 100%;
        background: #e5e7eb;

        @media (min-width: 992px) {
            width: 100%;
            height: 2px;
            min-width: 50px;
        }
    }

    .arrow {
        display: none; // Flecha simple opcional
    }
}
</style>
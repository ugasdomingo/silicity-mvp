<script setup lang="ts">
</script>

<template>
    <section class="hero">
        <div class="container hero-content">

            <div class="hero-text">
                <div class="badge-pill">
                    🚀 El Silicon Valley Digital de Latinoamérica
                </div>

                <h1>
                    Tu carrera tech <br>
                    <span class="highlight">comienza aquí</span>
                </h1>

                <p class="subtitle">
                    Accede a educación de calidad, crece con acompañamiento profesional y conecta con oportunidades
                    reales.
                    Desde explorar gratis hasta conseguir empleo o inversión.
                </p>

                <div class="cta-group">
                    <router-link :to="{ name: 'register' }" class="btn btn-primary">
                        Explorar Gratis
                    </router-link>

                    <a href="#planes" class="btn btn-outline">
                        Ver Planes
                    </a>
                </div>

                <div class="trust-badges">
                    <div class="badge-item">
                        <span class="check">✓</span> 10 becas anuales
                    </div>
                    <div class="badge-item">
                        <span class="check">✓</span> Validación psicológica
                    </div>
                    <div class="badge-item">
                        <span class="check">✓</span> Proyectos reales
                    </div>
                </div>
            </div>

            <div class="hero-visual">
                <div class="growth-chart">
                    <svg viewBox="0 0 400 300" class="chart-svg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                            </linearGradient>
                        </defs>

                        <path class="growth-line" d="M 20 280 Q 150 280 200 150 T 380 20" fill="none"
                            stroke="url(#lineGradient)" stroke-width="6" stroke-linecap="round" />

                        <g class="chart-point point-1">
                            <circle cx="20" cy="280" r="8" fill="#fff" stroke="#6366f1" stroke-width="3" />
                            <text x="35" y="275" class="point-label">Curioso</text>
                        </g>

                        <g class="chart-point point-2">
                            <circle cx="200" cy="150" r="8" fill="#fff" stroke="#6366f1" stroke-width="3" />
                            <text x="215" y="155" class="point-label">Estudiante</text>
                        </g>

                        <g class="chart-point point-3">
                            <circle cx="380" cy="20" r="8" fill="#fff" stroke="#8b5cf6" stroke-width="3" />
                            <text x="300" y="40" class="point-label label-final">⭐ Talento</text>
                        </g>
                    </svg>

                    <div class="chart-bg"></div>
                </div>
            </div>

        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.hero {
    position: relative;
    min-height: calc(100vh - 70px);
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f9fafb 0%, #eef2ff 100%);
    overflow: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
}

.hero-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    align-items: center;

    @media (min-width: 992px) {
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
    }
}

.hero-text {
    text-align: center;

    @media (min-width: 992px) {
        text-align: left;
    }
}

.badge-pill {
    display: inline-block;
    background-color: rgba($color-primary, 0.1);
    color: $color-primary;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba($color-primary, 0.2);
}

h1 {
    font-size: 2.5rem;
    line-height: 1.1;
    font-weight: 800;
    color: #111827;
    margin-bottom: 1.5rem;

    .highlight {
        background: linear-gradient(120deg, $color-primary 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    @media (min-width: 768px) {
        font-size: 3.5rem;
    }

    @media (min-width: 1200px) {
        font-size: 4rem;
    }
}

.subtitle {
    font-size: 1.1rem;
    color: #4b5563;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    @media (min-width: 992px) {
        margin-left: 0;
        font-size: 1.25rem;
    }
}

/* --- BUTTONS --- */
.cta-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2.5rem;

    @media (min-width: 480px) {
        flex-direction: row;
    }

    @media (min-width: 992px) {
        justify-content: flex-start;
    }
}

.btn {
    padding: 0.875rem 2rem;
    border-radius: 99px;
    font-weight: 600;
    text-decoration: none;
    font-size: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &-primary {
        background-color: $color-primary;
        color: white;
        border: 2px solid $color-primary;

        &:hover {
            background-color: shade($color-primary, 5%);
        }
    }

    &-outline {
        background-color: transparent;
        color: $color-text;
        border: 2px solid #e5e7eb;

        &:hover {
            border-color: $color-primary;
            color: $color-primary;
        }
    }
}

/* --- BADGES --- */
.trust-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    font-size: 0.9rem;
    color: #6b7280;

    @media (min-width: 992px) {
        justify-content: flex-start;
    }

    .badge-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .check {
        color: $color-success;
        font-weight: bold;
        background: rgba($color-success, 0.1);
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 0.75rem;
    }
}

/* --- ANIMATION / VISUAL CORREGIDO --- */
.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 100%;
}

.growth-chart {
    width: 100%;
    max-width: 500px;
    position: relative;

    .chart-bg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        background: radial-gradient(circle, rgba($color-primary, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
        z-index: 0;
    }
}

.chart-svg {
    width: 100%;
    height: auto;
    overflow: visible;
    position: relative;
    z-index: 1;
}

// Variables Ajustadas para Loop Sincronizado
$total-time: 12s; // Ciclo total más largo

// ANIMACIONES APLICADAS
// Usamos la misma duración para todos para que terminen y reinicien juntos exactamenre

.growth-line {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine $total-time linear infinite;
    animation-delay: 1s;
}

// Puntos con animaciones específicas sin delay, controlados por %
.point-1 {
    animation: showPoint1 $total-time linear infinite;
}

.point-2 {
    animation: showPoint2 $total-time linear infinite;
}

.point-3 {
    animation: showPoint3 $total-time linear infinite;
}

.point-label {
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    fill: #4b5563;
}

.label-final {
    fill: $color-primary;
    font-size: 16px;
    font-weight: 800;
}

// --- KEYFRAMES SINCRONIZADOS ---

// 1. LÍNEA: Se dibuja más lento (40% del tiempo = 4.8 segs)
@keyframes drawLine {
    0% {
        stroke-dashoffset: 1000;
        opacity: 1;
    }

    40% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    // Termina de dibujar aquí
    90% {
        stroke-dashoffset: 0;
        opacity: 1;
    }

    // Se queda quieta
    100% {
        stroke-dashoffset: 0;
        opacity: 0;
    }

    // Desaparece al final
}

// 2. PUNTO 1 (CURIOSO): Aparece de inmediato
@keyframes showPoint1 {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    1% {
        opacity: 1;
        transform: translateY(0);
    }

    // Aparece casi al instante
    90% {
        opacity: 1;
        transform: translateY(0);
    }

    // Se mantiene
    100% {
        opacity: 0;
        transform: translateY(0);
    }

    // Desaparece con la línea
}

// 3. PUNTO 2 (ESTUDIANTE): Aparece al 20% (mitad del dibujo)
@keyframes showPoint2 {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    18% {
        opacity: 1;
        transform: translateY(5px);
    }

    // Espera invisible
    22% {
        opacity: 1;
        transform: translateY(0);
    }

    // Aparece suavemente
    90% {
        opacity: 1;
        transform: translateY(0);
    }

    // Se mantiene
    100% {
        opacity: 0;
        transform: translateY(0);
    }

    // Desaparece con la línea
}

// 4. PUNTO 3 (TALENTO): Aparece al 40% (fin del dibujo)
@keyframes showPoint3 {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    38% {
        opacity: 1;
        transform: translateY(0);
    }

    // Espera invisible
    52% {
        opacity: 1;
        transform: translateY(0);
    }

    // Aparece justo al terminar la línea
    90% {
        opacity: 1;
        transform: translateY(0);
    }

    // Se mantiene (lectura larga)
    100% {
        opacity: 0;
        transform: translateY(0);
    }

    // Desaparece con la línea
}
</style>
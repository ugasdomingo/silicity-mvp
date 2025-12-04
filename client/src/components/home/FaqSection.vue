<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Minus } from 'lucide-vue-next';

// Estado para saber cuál pregunta está abierta (null = ninguna)
const openIndex = ref<number | null>(0);

const faqs = [
    {
        question: "¿Silicity imparte los cursos?",
        answer: "No. Somos un puente que facilita el acceso. Negociamos becas y descuentos con plataformas líderes como Platzi, pero el contenido educativo lo proveen ellos."
    },
    {
        question: "¿Cómo funcionan las becas?",
        answer: "Tenemos 10 becas anuales completas. Postulas contando tu historia y motivación. Es gratis postular (requiere membresía Basic). Nuestro equipo selecciona a los beneficiarios."
    },
    {
        question: "¿Qué incluye el acompañamiento psicológico?",
        answer: "Orientación vocacional y apoyo para lograr objetivos de estudio. Te ayudamos a organizarte, mantener la motivación y superar bloqueos. Es parte de los planes Basic y Premium."
    },
    {
        question: "¿Los proyectos de empresas son pagados?",
        answer: "La mayoría son no remunerados, diseñados para construir portafolio y ganar experiencia real. Si una empresa ofrece compensación económica, se indicará claramente en la publicación."
    },
    {
        question: "¿Puedo cancelar cuando quiera?",
        answer: "Sí, sin penalizaciones. Tu membresía permanece activa hasta el final del período que ya pagaste."
    }
];

const toggle = (index: number) => {
    openIndex.value = openIndex.value === index ? null : index;
};
</script>

<template>
    <section class="faq-section">
        <div class="container">
            <div class="content-wrapper">
                <div class="text-col">
                    <h2>Preguntas Frecuentes</h2>
                    <p>Resolvemos tus dudas para que empieces con confianza.</p>
                    <a href="mailto:hola@silicity.com" class="contact-link">¿Más dudas? Contáctanos</a>
                </div>

                <div class="faq-list">
                    <div v-for="(faq, index) in faqs" :key="index" class="faq-item"
                        :class="{ 'is-open': openIndex === index }">
                        <button class="faq-question" @click="toggle(index)">
                            <span>{{ faq.question }}</span>
                            <component :is="openIndex === index ? Minus : Plus" class="icon" />
                        </button>

                        <div class="faq-answer" v-show="openIndex === index">
                            <p>{{ faq.answer }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/abstracts/variables' as *;

.faq-section {
    padding: 6rem 0;
    background-color: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.content-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;

    @media (min-width: 992px) {
        grid-template-columns: 1fr 2fr;
        /* Columna preguntas más ancha */
    }
}

.text-col {
    h2 {
        font-size: 2rem;
        font-weight: 800;
        color: #111827;
        margin-bottom: 1rem;
    }

    p {
        color: #6b7280;
        margin-bottom: 1.5rem;
    }

    .contact-link {
        color: $color-primary;
        font-weight: 600;
        text-decoration: underline;

        &:hover {
            color: shade($color-primary, 10%);
        }
    }
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.faq-item {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;

    &.is-open {
        border-color: $color-primary;
        background-color: #f9fafb;
    }
}

.faq-question {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 1.1rem;
    font-weight: 600;
    color: #111827;

    .icon {
        color: $color-primary;
        width: 20px;
        height: 20px;
    }
}

.faq-answer {
    padding: 0 1.25rem 1.25rem;
    color: #4b5563;
    line-height: 1.6;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
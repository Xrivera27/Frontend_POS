<template>
    <div class="encabezado">
        <h1 class="header-title">{{ titulo }}</h1>
        <ProfileButton />
    </div>
    <hr style="width: 90%" />
</template>

<script>
import ProfileButton from "../components/ProfileButton.vue";
export default {
    name: 'PageHeader',
    components: {
        ProfileButton,
    },
    props: {
        titulo: {
            type: String,
            required: true
        }
    }
}
</script>

<style scoped>
* {
    font-family: "Montserrat", sans-serif;
    box-sizing: border-box;
}

.encabezado {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0 16px;
    gap: 16px;
}

.header-title {
    font-size: clamp(24px, 4vw, 32px);
    margin: 10px 0;
    color: #333;
}

:deep(.dark) .header-title,
:deep(.dark) h1,
.dark .header-title,
.dark h1 {
    color: #ffffff !important;
}

@media screen and (max-width: 480px) {
    .encabezado {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>
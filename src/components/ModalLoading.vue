<script>
export default {
    name: 'ModalLoading',
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },
        mensaje: {
            type: String,
            default: 'Cargando...'
        }
    }
}
</script>

<template>
    <div v-if="isLoading" class="modal-overlay">
        <div class="spinner-container">
            <div class="spinner"></div>
            <p class="mensaje">{{ mensaje }}</p>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.spinner-container {
    text-align: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #39b378;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

.mensaje {
    color: white;
    margin-top: 15px;
    font-size: 18px;
    font-family: 'Montserrat', sans-serif;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
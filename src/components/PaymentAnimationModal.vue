<script>
export default {
    name: 'PaymentAnimationModal',
    props: {
        isVisible: {
            type: Boolean,
            default: false
        },
        mensaje: {
            type: String,
            default: 'Procesando pago...'
        }
    },
    data() {
        return {
            stage: 0,
            timers: []
        }
    },
    watch: {
        isVisible(newVal) {
            if (newVal) {
                this.stage = 0;
                this.timers = [
                    setTimeout(() => this.stage = 1, 1500),
                    setTimeout(() => this.stage = 2, 3000),
                    setTimeout(() => {
                        this.stage = 3;
                        setTimeout(() => this.$emit('complete'), 1000);
                    }, 4000)
                ];
            }
        }
    },
    beforeUnmount() {
        this.timers.forEach(timer => clearTimeout(timer));
    }
}
</script>

<template>
    <div v-if="isVisible" class="modal-overlay">
        <div class="animation-container">
            <div v-if="stage < 3" class="spinner-container">
                <div class="spinner"></div>
                <div class="dollar-sign">$</div>
            </div>
            <div v-else class="check-container">
                <div class="check-circle">
                    <span class="check-mark">✓</span>
                </div>
            </div>

            <p class="message">
                {{ stage === 0 ? 'Procesando pago...' :
                    stage === 1 ? 'Verificando transacción...' :
                        stage === 2 ? 'Finalizando...' :
                            '¡Pago completado!' }}
            </p>
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

.animation-container {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    text-align: center;
    min-width: 300px;
}

.spinner-container {
    position: relative;
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
}

.spinner {
    width: 100%;
    height: 100%;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.dollar-sign {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: #3498db;
    animation: bounce 0.5s ease infinite alternate;
}

.check-container {
    margin: 0 auto 1rem;
}

.check-circle {
    width: 64px;
    height: 64px;
    background: #2ecc71;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.check-mark {
    color: white;
    font-size: 32px;
}

.message {
    font-size: 18px;
    color: #2c3e50;
    margin: 0;
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

@keyframes bounce {
    from {
        transform: translate(-50%, -60%);
    }

    to {
        transform: translate(-50%, -40%);
    }
}

@keyframes bounceIn {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}
</style>
<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')" @keydown.stop>
        <div class="modal-content" @keydown.stop>
            <h2 class="modal-title">Apertura de Caja</h2>
            <div class="modal-body">
                <div class="input-group">
                    <label for="montoInicial">Monto inicial en efectivo:</label>
                    <div class="amount-input">
                        <span class="currency">L.</span>
                        <input type="number" id="montoInicial" v-model="montoInicial" step="0.01" min="0"
                            @keypress.enter="confirmarApertura" ref="montoInput" @keydown.stop autofocus>
                    </div>
                </div>
                <p v-if="error" class="error-message">{{ error }}</p>
            </div>
            <div class="modal-footer">
                <button class="confirm-button" @click="confirmarApertura"
                    :disabled="!montoInicial || montoInicial <= 0">
                    Confirmar Apertura
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AperturaCajaModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            montoInicial: '',
            error: ''
        }
    },
    watch: {
        isVisible(newValue) {
            if (newValue) {
                this.$nextTick(() => {
                    this.$refs.montoInput?.focus();
                    window.addEventListener('keydown', this.preventDefaultKeyboard);
                });
            } else {
                window.removeEventListener('keydown', this.preventDefaultKeyboard);
            }
        }
    },
    methods: {
        preventDefaultKeyboard(e) {
            e.stopPropagation();
        },
        validarMonto() {
            if (!this.montoInicial) {
                this.error = 'El monto es requerido';
                return false;
            }
            if (this.montoInicial <= 0) {
                this.error = 'El monto debe ser mayor a 0';
                return false;
            }
            this.error = '';
            return true;
        },
        confirmarApertura() {
            if (this.validarMonto()) {
                this.$emit('confirmar', parseFloat(this.montoInicial));
                this.montoInicial = '';
            }
        }
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.preventDefaultKeyboard);
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-title {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.5rem;
    text-align: center;
}

.modal-body {
    margin-bottom: 1.5rem;
}

.input-group {
    margin-bottom: 1rem;
}

.input-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
}

.amount-input {
    position: relative;
    display: flex;
    align-items: center;
}

.currency {
    position: absolute;
    left: 1rem;
    color: #666;
}

input {
    width: 100%;
    padding: 0.75rem;
    padding-left: 2.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.modal-footer {
    display: flex;
    justify-content: center;
}

.confirm-button {
    background-color: #4a90e2;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.confirm-button:hover:not(:disabled) {
    background-color: #357abd;
}

.confirm-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

/* Dark mode styles */
:global(.dark) .modal-content {
    background-color: #2d2d2d;
}

:global(.dark) .modal-title {
    color: #fff;
}

:global(.dark) .input-group label {
    color: #ccc;
}

:global(.dark) input {
    background-color: #383838;
    border-color: #404040;
    color: #fff;
}

:global(.dark) input:focus {
    border-color: #4a90e2;
}

:global(.dark) .currency {
    color: #ccc;
}
</style>
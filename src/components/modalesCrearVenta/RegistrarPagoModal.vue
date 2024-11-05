<!-- RegistrarPagoModal.vue -->
<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content">
                <div class="header-container" tabindex="-1">
                    <h2 class="modal-title">Registrar Pago</h2>
                </div>

                <div class="form-container">
                    <div class="form-group">
                        <label>Monto:</label>
                        <input type="number" v-model="monto" ref="montoInput" />
                    </div>

                    <div class="form-group">
                        <label>Método de Pago:</label>
                        <select v-model="metodoPago">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Notas:</label>
                        <textarea v-model="notas"></textarea>
                    </div>
                </div>

                <div class="button-container">
                    <button @click="confirmarPago">Confirmar Pago</button>
                    <button @click="$emit('close')">Salir</button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script>
export default {
    name: 'RegistrarPagoModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            monto: 0,
            metodoPago: 'Efectivo',
            notas: ''
        }
    },
    watch: {
        isVisible(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.$refs.montoInput?.focus();
                });
            }
        }
    },
    methods: {
        confirmarPago() {
            this.$emit('confirm-payment', {
                monto: this.monto,
                metodoPago: this.metodoPago,
                notas: this.notas
            });
            this.$emit('close');
        }
    }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
    font-family: "Montserrat", sans-serif;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1010;
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.header-container {
    margin-bottom: 20px;
}

.form-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-group label {
    margin-bottom: 5px;
    text-align: left;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 95%;
    background-color: white;
}

.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}

button:hover {
    background-color: #3e8e41;
}

/* Asegurarse que el textarea no sea demasiado grande por defecto */
textarea {
    resize: vertical;
    min-height: 60px;
    max-height: 150px;
}

/* Estilos específicos para los campos numéricos */
input[type="number"] {
    -moz-appearance: textfield;
    /* Firefox */
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
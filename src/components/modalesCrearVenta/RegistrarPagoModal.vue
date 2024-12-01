<!-- RegistrarPagoModal.vue -->
<template>
    <Teleport to="body">
        <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-content">
                <div class="header-container">
                    <h2 class="modal-title">Registrar Pago</h2>
                </div>

                <!-- Resumen de la venta -->
                <div class="resumen-venta">
                    <h3>Resumen de Venta</h3>
                    <div class="resumen-grid">
                        <div class="resumen-item">
                            <span>Subtotal:</span>
                            <span>L. {{ formatPrice(factura.sub_total) }}</span>
                        </div>
                        <div class="resumen-item">
                            <span>Impuesto:</span>
                            <span>L. {{ formatPrice(factura.total_ISV) }}</span>
                        </div>
                        <div class="resumen-item item-descuento">
                            <span>Descuento:</span>
                            <span>L. -{{ formatPrice(factura.descuento) }}</span>
                        </div>
                        <div class="resumen-item total">
                            <span>Total:</span>
                            <span>L. {{ formatPrice(total) }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-container">
                    <!-- Método de Pago -->
                    <div class="form-group">
                        <label>Método de Pago:</label>
                        <select v-model="metodoPago" @change="handleMetodoPagoChange">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Mixto">Pago Mixto</option>
                        </select>
                    </div>

                    <!-- Pago en Efectivo -->
                    <div v-if="metodoPago === 'Efectivo'" class="form-group">
                        <label>Monto a Pagar:</label>
                        <input type="number" v-model.number="montoEfectivo" ref="montoInput" @input="calcularCambio"
                            :min="total" step="0.01" />
                        <div v-if="errorEfectivo" class="error-message">
                            {{ errorEfectivo }}
                        </div>
                    </div>

                    <!-- Pago por Transferencia -->
                    <div v-if="metodoPago === 'Transferencia'" class="form-group">
                        <label>Monto de la transferencia:</label>
                        <input type="number" v-model.number="montoTransferencia" readonly />
                        <label>Número de transferencia:</label>
                        <input type="text" v-model="numeroTransferencia" maxlength="5" pattern="\d{5}"
                            placeholder="12345" />
                        <div v-if="errorTransferencia" class="error-message">
                            {{ errorTransferencia }}
                        </div>
                    </div>

                    <!-- Pago Mixto -->
                    <div v-if="metodoPago === 'Mixto'" class="mixto-section">
                        <div class="form-group">
                            <label>Monto en Efectivo:</label>
                            <input type="number" v-model.number="montoEfectivo" @input="actualizarPagoMixto"
                                :max="total" step="0.01" />
                        </div>
                        <div class="form-group">
                            <label>Monto en Transferencia:</label>
                            <input type="number" v-model.number="montoTransferencia" readonly />
                            <label v-if="montoTransferencia > 0">Número de transferencia:</label>
                            <input v-if="montoTransferencia > 0" type="text" v-model="numeroTransferencia" maxlength="5"
                                pattern="\d{5}" placeholder="12345" />
                        </div>
                        <div v-if="errorMixto" class="error-message">
                            {{ errorMixto }}
                        </div>
                    </div>

                    <!-- Cambio (solo para efectivo o pago mixto) -->
                    <div v-if="mostrarCambio" class="cambio-section">
                        <div class="resumen-item cambio">
                            <span>Cambio:</span>
                            <span>L. {{ formatPrice(cambio) }}</span>
                        </div>
                    </div>

                    <!-- Notas -->
                    <div class="form-group">
                        <label>Notas:</label>
                        <textarea v-model="notas" placeholder="Observaciones adicionales..."></textarea>
                    </div>
                </div>

                <div class="button-container">
                    <button @click="confirmarPago" :disabled="!isPagoValido || isModalLoading" class="btn-confirm">
                        {{ isModalLoading ? 'Procesando...' : 'Confirmar Pago' }}
                    </button>
                    <button @click="$emit('close')" class="btn-cancel">Cancelar</button>
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
        },
        factura: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isModalLoading: false,
            metodoPago: 'Efectivo',
            montoEfectivo: 0,
            montoTransferencia: 0,
            numeroTransferencia: '',
            notas: '',
            cambio: 0,
            errorEfectivo: '',
            errorTransferencia: '',
            errorMixto: ''
        }
    },
    computed: {
        total() {
            return this.factura.total;
        },
        mostrarCambio() {
            return (this.metodoPago === 'Efectivo' || this.metodoPago === 'Mixto') && this.cambio > 0;
        },
        isPagoValido() {
            switch (this.metodoPago) {
                case 'Efectivo':
                    return this.montoEfectivo >= this.total;
                case 'Transferencia':
                    return this.montoTransferencia === this.total &&
                        this.numeroTransferencia?.length === 5;
                case 'Mixto':
                    return this.montoEfectivo + this.montoTransferencia === this.total &&
                        (this.montoTransferencia === 0 || this.numeroTransferencia?.length === 5);
                default:
                    return false;
            }
        }
    },
    methods: {
        formatPrice(value) {
            return Number(value).toFixed(2);
        },
        calcularCambio() {
            if (this.metodoPago === 'Efectivo') {
                this.cambio = Math.max(0, this.montoEfectivo - this.total);
                this.errorEfectivo = this.montoEfectivo < this.total
                    ? `Debe ingresar al menos L. ${this.formatPrice(this.total)}`
                    : '';
            }
        },
        actualizarPagoMixto() {
            // Limitar el monto en efectivo al total
            if (this.montoEfectivo > this.total) {
                this.montoEfectivo = this.total;
            }

            // Calcular monto en transferencia
            this.montoTransferencia = Math.max(0, this.total - this.montoEfectivo);

            // Calcular cambio si aplica
            this.cambio = Math.max(0, this.montoEfectivo - (this.total - this.montoTransferencia));

            // Validar y mostrar errores
            if (this.montoEfectivo + this.montoTransferencia !== this.total) {
                this.errorMixto = 'La suma de los montos debe ser igual al total';
            } else {
                this.errorMixto = '';
            }

            // Limpiar número de transferencia si ya no se necesita
            if (this.montoTransferencia === 0) {
                this.numeroTransferencia = '';
            }
        },
        handleMetodoPagoChange() {
            // Resetear valores
            this.montoEfectivo = 0;
            this.cambio = 0;
            this.numeroTransferencia = '';
            this.errorEfectivo = '';
            this.errorTransferencia = '';
            this.errorMixto = '';

            // Configurar valores iniciales según método
            switch (this.metodoPago) {
                case 'Efectivo':
                    this.montoEfectivo = this.total;
                    this.montoTransferencia = 0;
                    break;
                case 'Transferencia':
                    this.montoTransferencia = this.total; // Aquí establecemos el valor
                    this.montoEfectivo = 0;
                    break;
                case 'Mixto':
                    this.montoEfectivo = 0;
                    this.montoTransferencia = this.total;
                    break;
            }
        },
        async confirmarPago() {
            if (!this.isPagoValido) return;

            this.isModalLoading = true;
            try {
                const datosPago = {
                    metodoPago: this.metodoPago,
                    montoEfectivo: this.montoEfectivo,
                    montoTransferencia: this.montoTransferencia,
                    numeroTransferencia: this.numeroTransferencia,
                    cambio: this.cambio,
                    notas: this.notas
                };

                await this.$emit('confirm-payment', datosPago);
                this.$emit('close');
            } catch (error) {
                console.error('Error al procesar el pago:', error);
            } finally {
                this.isModalLoading = false;
            }
        }
    },
    watch: {
        isVisible(newVal) {
            if (newVal) {
                this.metodoPago = 'Efectivo';
                this.montoEfectivo = this.total;
                this.calcularCambio();
                this.$nextTick(() => {
                    this.$refs.montoInput?.focus();
                });
            } else {
                // Resetear formulario al cerrar
                this.handleMetodoPagoChange();
                this.notas = '';
            }
        }
    }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
    font-family: "Montserrat", sans-serif;
}

.resumen-venta {
    background-color: #f8f9fa;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 20px;
}

.resumen-grid {
    display: grid;
    gap: 10px;
}

.resumen-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
}

.item-descuento {
    color: rgb(194, 30, 30);
}

.resumen-item.total {
    border-top: 2px solid #ddd;
    margin-top: 10px;
    padding-top: 10px;
    font-weight: bold;
    font-size: 1.2em;
}

.tarjeta-detalles {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.cambio-section {
    background-color: #e8f5e9;
    padding: 10px;
    border-radius: 5px;
    margin-top: 10px;
}

.cambio-section .cambio {
    font-size: 1.2em;
    font-weight: bold;
    color: #2e7d32;
}

.btn-confirm {
    background-color: #4CAF50;
}

.btn-confirm:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.btn-cancel {
    background-color: #666;
}

input[type="text"],
input[type="number"],
select,
textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
}

input:focus,
select:focus,
textarea:focus {
    border-color: #4CAF50;
    outline: none;
    box-shadow: 0 0 3px rgba(76, 175, 80, 0.3);
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
    align-items: flex-start;
    /* Cambiado a flex-start para mejor control del scroll */
    padding: 2vh 0;
    /* Añadido padding vertical */
    z-index: 1000;
    overflow-y: auto;
    /* Por si el modal es más alto que la pantalla */
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 700px;
    /* Ancho fijo aumentado */
    max-width: 90vw;
    /* Máximo ancho responsivo */
    max-height: 96vh;
    /* Altura máxima */
    overflow-y: auto;
    /* Scroll vertical cuando sea necesario */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1010;
    margin: auto;
    /* Para centrar cuando hay scroll */
}

.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
    background: #666;
}

/* Mantener los botones siempre visibles */
.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    position: sticky;
    bottom: 0;
    background: white;
    padding-bottom: 5px;
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
    gap: 12px;
    margin-bottom: 20px;
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

.error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

input:read-only {
    background-color: #e9ecef;
    cursor: not-allowed;
}

.mixto-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.btn-confirm {
    min-width: 120px;
}

.btn-confirm:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
}
</style>
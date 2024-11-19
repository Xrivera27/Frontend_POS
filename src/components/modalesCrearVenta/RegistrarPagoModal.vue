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
                            <span>L. {{ mostrarSubtotal }}</span>
                        </div>
                        <div class="resumen-item">
                            <span>Impuesto:</span>
                            <span>L. {{ impuesto }}</span>
                        </div>
                        <div class="resumen-item">
                            <span>Descuento:</span>
                            <span>L. 0</span>
                        </div>
                        <div class="resumen-item total">
                            <span>Total:</span>
                            <span>L. {{ total }}</span>
                        </div>
                    </div>
                </div>

                <div class="form-container">
                    <!-- Monto a pagar -->
                    <div class="form-group">
                        <label>Monto a Pagar:</label>
                        <input type="number" v-model="monto" ref="montoInput" @input="calcularCambio" />
                    </div>

                    <!-- Método de Pago -->
                    <div class="form-group">
                        <label>Método de Pago:</label>
                        <select v-model="metodoPago" @change="handleMetodoPagoChange">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Mixto">Pago Mixto</option>
                        </select>
                    </div>

                    <!-- Sección de Tarjeta (condicional) -->
                    <div v-if="metodoPago === 'Tarjeta' || metodoPago === 'Mixto'" class="tarjeta-section">
                        <div class="form-group">
                            <label>Tipo de Tarjeta:</label>
                            <select v-model="tipoTarjeta">
                                <option value="Visa">Visa</option>
                                <option value="MasterCard">MasterCard</option>
                                <option value="American Express">American Express</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Número de Tarjeta:</label>
                            <input type="text" v-model="numeroTarjeta" maxlength="19" @input="formatearNumeroTarjeta" />
                        </div>
                        <div class="tarjeta-detalles">
                            <div class="form-group">
                                <label>Fecha Exp:</label>
                                <input type="text" v-model="fechaExp" placeholder="MM/YY" maxlength="5"
                                    @input="formatearFechaExp" />
                            </div>
                            <div class="form-group">
                                <label>CVV:</label>
                                <input type="text" v-model="cvv" maxlength="4" />
                            </div>
                            <div class="form-group">
                                <label>Cuotas:</label>
                                <select v-model="cuotas">
                                    <option value="1">1 cuota</option>
                                    <option value="3">3 cuotas</option>
                                    <option value="6">6 cuotas</option>
                                    <option value="12">12 cuotas</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Pago Mixto (condicional) -->
                    <div v-if="metodoPago === 'Mixto'" class="mixto-section">
                        <div class="form-group">
                            <label>Monto en Efectivo:</label>
                            <input type="number" v-model="montoEfectivo" @input="actualizarMontoTarjeta" />
                        </div>
                        <div class="form-group">
                            <label>Monto en Tarjeta:</label>
                            <input type="number" v-model="montoTarjeta" readonly />
                        </div>
                    </div>

                    <!-- Cambio (para efectivo) -->
                    <div v-if="metodoPago === 'Efectivo' || metodoPago === 'Mixto'" class="cambio-section">
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
                    <button @click="confirmarPago" :disabled="!isPagoValido" class="btn-confirm">
                        Confirmar Pago
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
            default: () => ({})
        }
    },
    data() {
        return {
            isModalLoading: false,
            monto: 0,
            metodoPago: 'Efectivo',
            notas: '',
            // Datos de tarjeta
            tipoTarjeta: 'Visa',
            numeroTarjeta: '',
            fechaExp: '',
            cvv: '',
            cuotas: '1',
            // Datos de pago mixto
            montoEfectivo: 0,
            montoTarjeta: 0,
            // Cálculos
            subtotal: 1000, // Esto debería venir de las props
            isv: 150, // 15% del subtotal
            descuento: 0,
            cambio: 0
        }
    },
    computed: {
        total() {
            return this.factura.total;
        },
        mostrarSubtotal() {
            return this.factura.sub_total
        },
        impuesto() {
            return this.factura.total_ISV;
        },
        isPagoValido() {
            if (this.metodoPago === 'Efectivo') {
                return this.monto >= this.total;
            } else if (this.metodoPago === 'Tarjeta') {
                return this.validarDatosTarjeta();
            } else if (this.metodoPago === 'Mixto') {
                return this.montoEfectivo + this.montoTarjeta >= this.total &&
                    this.validarDatosTarjeta();
            }
            return false;
        }
    },
    methods: {
        formatPrice(value) {
            return value.toFixed(2);
        },
        calcularCambio() {
            if (this.metodoPago === 'Efectivo') {
                this.cambio = Math.max(0, this.monto - this.total);
            }
        },
        handleMetodoPagoChange() {
            this.monto = this.total;
            this.cambio = 0;
            if (this.metodoPago === 'Mixto') {
                this.montoEfectivo = 0;
                this.montoTarjeta = this.total;
            }
        },
        formatearNumeroTarjeta() {
            // Eliminar espacios y caracteres no numéricos
            let nums = this.numeroTarjeta.replace(/\D/g, '');
            // Insertar espacio cada 4 números
            this.numeroTarjeta = nums.replace(/(\d{4})/g, '$1 ').trim();
        },
        formatearFechaExp() {
            let fecha = this.fechaExp.replace(/\D/g, '');
            if (fecha.length >= 2) {
                this.fechaExp = fecha.slice(0, 2) + '/' + fecha.slice(2, 4);
            }
        },
        actualizarMontoTarjeta() {
            this.montoTarjeta = Math.max(0, this.total - this.montoEfectivo);
            this.calcularCambio();
        },
        validarDatosTarjeta() {
            if (this.metodoPago === 'Tarjeta' || this.metodoPago === 'Mixto') {
                return this.numeroTarjeta.length >= 19 &&
                    this.fechaExp.length === 5 &&
                    this.cvv.length >= 3;
            }
            return true;
        },
        async confirmarPago() {
            if (!this.isPagoValido) return;

            this.isModalLoading = true;
            try {
                const datosPago = {
                    metodoPago: this.metodoPago,
                    monto: this.monto,
                    cambio: this.cambio,
                    notas: this.notas
                };

                if (this.metodoPago === 'Tarjeta' || this.metodoPago === 'Mixto') {
                    datosPago.datosTarjeta = {
                        tipo: this.tipoTarjeta,
                        numero: this.numeroTarjeta,
                        fechaExp: this.fechaExp,
                        cuotas: this.cuotas
                    };
                }

                if (this.metodoPago === 'Mixto') {
                    datosPago.montoEfectivo = this.montoEfectivo;
                    datosPago.montoTarjeta = this.montoTarjeta;
                }

                await this.$emit('confirm-payment', datosPago);
                this.$emit('close');
            } finally {
                this.isModalLoading = false;
            }
        }
    },
    watch: {
        isVisible(newVal) {
            if (newVal) {
                this.monto = this.total;
                this.$nextTick(() => {
                    this.$refs.montoInput?.focus();
                });
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
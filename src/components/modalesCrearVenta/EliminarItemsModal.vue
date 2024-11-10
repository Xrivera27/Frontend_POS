<template>
    <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick" @keydown.stop>
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h2>Eliminar Item</h2>
                <button @click="$emit('close')" class="close-button">&times;</button>
            </div>

            <!-- Primera vista: Confirmación inicial -->
            <template v-if="!mostrarInputClave">
                <div class="modal-body">
                    <p>¿Está seguro que desea eliminar el siguiente item?</p>
                    <div class="item-details">
                        <p><strong>Código:</strong> {{ item.codigo_producto }}</p>
                        <p><strong>Descripción:</strong> {{ item.nombre }}</p>
                        <p><strong>Cantidad:</strong> {{ item.cantidad }}</p>
                        <p><strong>Precio Unitario:</strong> {{ item.precioImpuesto }}</p>
                        <p><strong>Importe:</strong> {{ item.precioImpuesto * item.cantidad }}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="solicitarClave" class="confirm-button">Confirmar</button>
                    <button @click="$emit('close')" class="cancel-button">Cancelar</button>
                </div>
            </template>

            <!-- Segunda vista: Input de clave -->
            <template v-else>
                <div class="modal-body">
                    <p>Ingrese la clave de administrador:</p>
                    <div class="input-container">
                        <input type="password" v-model="claveIngresada" ref="claveInput" @keyup.enter="validarClave"
                            @keydown.stop :class="{ 'error': error }" placeholder="Ingrese la clave" tabindex="0">
                        <p v-if="error" class="error-message">{{ error }}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="validarClave" class="confirm-button">Validar</button>
                    <button @click="volverConfirmacion" class="cancel-button">Cancelar</button>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

export default {
    name: 'EliminarItemsModal',
    props: {
        isVisible: {
            type: Boolean,
            required: true
        },
        item: {
            type: Object,
            required: true
        }
    },

    emits: ['close', 'confirm-delete', 'modal-focused'],

    setup(props, { emit }) {
        const mostrarInputClave = ref(false);
        const claveIngresada = ref('');
        const error = ref('');
        const claveInput = ref(null);
        const CLAVE_ADMIN = 'admin123';

        // Observar cambios en isVisible
        watch(() => props.isVisible, (newValue) => {
            if (newValue) {
                // Cuando el modal se abre, emitimos el evento para desactivar eventos del teclado principal
                emit('modal-focused', true);
                nextTick(() => {
                    // Asegurarnos que el input reciba el foco cuando se muestre
                    if (mostrarInputClave.value && claveInput.value) {
                        claveInput.value.focus();
                    }
                });
            } else {
                // Cuando el modal se cierra, reactivamos los eventos del teclado principal
                emit('modal-focused', false);
                mostrarInputClave.value = false;
                claveIngresada.value = '';
                error.value = '';
            }
        });

        const handleOverlayClick = (event) => {
            if (event.target.classList.contains('modal-overlay')) {
                volverConfirmacion();
                emit('close');
            }
        };

        const solicitarClave = () => {
            mostrarInputClave.value = true;
            error.value = '';
            claveIngresada.value = '';
            nextTick(() => {
                if (claveInput.value) {
                    claveInput.value.focus();
                }
            });
        };

        const validarClave = () => {
            if (claveIngresada.value === CLAVE_ADMIN) {
                emit('confirm-delete', props.item);
                emit('close');
            } else {
                error.value = 'Clave incorrecta';
                claveIngresada.value = '';
                if (claveInput.value) {
                    claveInput.value.focus();
                }
            }
        };

        const volverConfirmacion = () => {
            mostrarInputClave.value = false;
            error.value = '';
            claveIngresada.value = '';
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape' && props.isVisible) {
                e.preventDefault();
                e.stopPropagation();
                if (mostrarInputClave.value) {
                    volverConfirmacion();
                } else {
                    emit('close');
                }
            }
        };

        onMounted(() => {
            window.addEventListener('keydown', handleEscape);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', handleEscape);
            emit('modal-focused', false);
        });

        return {
            mostrarInputClave,
            claveIngresada,
            error,
            claveInput,
            solicitarClave,
            validarClave,
            volverConfirmacion,
            handleOverlayClick
        };
    }
};
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
    border-radius: 8px;
    padding: 20px;
    width: 400px;
    max-width: 90%;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: auto;
    height: auto;
}

.modal-body {
    margin-bottom: 20px;
}

.item-details {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
}

.item-details p {
    margin: 5px 0;
}

.input-container {
    margin-top: 15px;
}

input[type="password"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    margin-top: 5px;
}

input[type="password"].error {
    border-color: #dc3545;
}

.error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
    margin-bottom: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.confirm-button,
.cancel-button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    width: auto;
}

.confirm-button {
    background-color: #dc3545;
    color: white;
}

.confirm-button:hover {
    background-color: #c82333;
}

.cancel-button {
    background-color: #6c757d;
    color: white;
}

.cancel-button:hover {
    background-color: #5a6268;
}
</style>
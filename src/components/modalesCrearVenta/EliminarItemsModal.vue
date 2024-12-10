<template>
  <div
    v-if="isVisible"
    class="modal-overlay"
    @click="handleOverlayClick"
    @keydown.stop
  >
    <ModalLoading :isLoading="isModalLoading" mensaje="Eliminando item..." />
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Eliminar Item</h2>
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
            <p>
              <strong>Importe:</strong>
              {{ item.precioImpuesto * item.cantidad }}
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="solicitarClave" class="confirm-button">
            Confirmar
          </button>
          <button @click="$emit('close')" class="cancel-button">
            Cancelar
          </button>
        </div>
      </template>

      <div class="modal" v-else>
        <div class="modal-confirm">
          <div class="modal-header">
            <h2>Confirmación</h2>
          </div>
          <div class="modal-body-confirm">
            <p>Ingrese la clave de administrador:</p>
            <input
              type="password"
              autocomplete="off"
              v-model="claveIngresada"
              ref="claveInput"
              @keyup.enter="validarClave"
              @keydown.stop
              :class="{ error: error }"
              placeholder="Ingrese la clave"
              tabindex="0"
            />
            <p v-if="error" class="error-message">{{ error }}</p>
          </div>

          <div class="modal-footer">
            <div class="action-buttons">
              <button @click="validarClave" class="confirm-button">
                Validar
              </button>
              <button @click="volverConfirmacion" class="cancel-button">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import ModalLoading from "@/components/ModalLoading.vue";
//import solicitudes from "../../services/solicitudes";

export default {
  components: {
    ModalLoading,
  },
  name: "EliminarItemsModal",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    tipo: {
      type: String,
      default: "eliminarItem",
    },
  },

  emits: ["close", "confirm-delete", "modal-focused"],

  setup(props, { emit }) {
    const isModalLoading = ref(false);
    const mostrarInputClave = ref(false);
    const claveIngresada = ref("");
    const error = ref("");
    const claveInput = ref(null);

    // Observar cambios en isVisible
    watch(
      () => props.isVisible,
      (newValue) => {
        if (newValue) {
          // Cuando el modal se abre, emitimos el evento para desactivar eventos del teclado principal
          emit("modal-focused", true);
          nextTick(() => {
            // Asegurarnos que el input reciba el foco cuando se muestre
            if (mostrarInputClave.value && claveInput.value) {
              claveInput.value.focus();
            }
          });
        } else {
          // Cuando el modal se cierra, reactivamos los eventos del teclado principal
          emit("modal-focused", false);
          mostrarInputClave.value = false;
          claveIngresada.value = "";
          error.value = "";
        }
      }
    );

    const handleOverlayClick = (event) => {
      if (event.target.classList.contains("modal-overlay")) {
        volverConfirmacion();
        emit("close");
      }
    };

    const solicitarClave = () => {
      mostrarInputClave.value = true;
      error.value = "";
      claveIngresada.value = "";
      nextTick(() => {
        if (claveInput.value) {
          claveInput.value.focus();
        }
      });
    };

    const validarClave = async () => {
      try {
        if (!claveIngresada.value) {
          error.value = "Por favor ingrese una clave";
          return;
        }
        isModalLoading.value = true;
        // Emitimos la clave junto con el item
        emit("confirm-delete", {
          item: props.item,
          clave: claveIngresada.value,
        });
        emit("close");
      } catch (err) {
        error.value = "Error al validar la clave";
        claveIngresada.value = "";
      } finally {
        isModalLoading.value = false;
      }
    };

    const volverConfirmacion = () => {
      mostrarInputClave.value = false;
      error.value = "";
      claveIngresada.value = "";
    };

    const handleEscape = (e) => {
      if (e.key === "Escape" && props.isVisible) {
        e.preventDefault();
        e.stopPropagation();
        if (mostrarInputClave.value) {
          volverConfirmacion();
        } else {
          emit("close");
        }
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleEscape);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEscape);
      emit("modal-focused", false);
    });

    return {
      mostrarInputClave,
      claveIngresada,
      error,
      claveInput,
      solicitarClave,
      validarClave,
      volverConfirmacion,
      handleOverlayClick,
      isModalLoading,
    };
  },
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

.modal {
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
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-confirm {
  background: #1e1e1e; /* Fondo oscuro para el modal */
  border-radius: 8px;
  width: 350px; /* Ancho fijo más pequeño */
  max-width: 90%;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-body-confirm {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido horizontalmente */
}

.dark .modal-body-confirm {
  background-color: #333;
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

input[type="password"] {
  width: 100%;
  max-width: 250px; /* Limita el ancho máximo */
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  margin: 10px 0;
  background-color: #2a2a2a; /* Para modo oscuro */
  color: #fff; /* Para el texto en modo oscuro */
}

input[type="password"].error {
  border-color: #dc3545;
}

input:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
  margin-bottom: 0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 12px;
  border: none;
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

/* Dark Mode */
.dark .modal-content {
  background-color: #1e1e1e;
  color: #e5e5e5;
}

.dark .modal-header {
  background-color: #141414;
  border-color: #2b2b2b;
}

.dark .modal-header h2 {
  color: #e5e5e5;
}

.dark .item-details {
  background-color: #2a2a2a;
  color: #e5e5e5;
}

.dark .modal-footer {
  background-color: #141414;
  border-color: #2b2b2b;
}

.dark input[type="password"] {
  background-color: #141414;
  border-color: #2b2b2b;
  color: #e5e5e5;
}

.dark input[type="password"]:focus {
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
}

.dark input[type="password"].error {
  border-color: #dc3545;
}

.dark .confirm-button {
  background-color: #dc3545;
}

.dark .confirm-button:hover {
  background-color: #c82333;
}

.dark .cancel-button {
  background-color: #2d3238;
}

.dark .cancel-button:hover {
  background-color: #3d4248;
}

/* Para el modal de clave */
.dark .modal-confirm {
  background-color: #1e1e1e;
  border-color: #2b2b2b;
}

.dark .modal-body-confirm {
  background-color: #1e1e1e;
}

.dark .modal-body-confirm p {
  color: #e5e5e5;
}

.dark .error-message {
  color: #ff6b6b;
}
</style>

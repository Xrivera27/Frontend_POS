<template>
  <div
    v-if="isVisible"
    class="modal-overlay"
    @click="handleOverlayClick"
    @keydown.stop
  >
    <ModalLoading :isLoading="isModalLoading" mensaje="Limpiando pantalla..." />
    <div class="modal-content" @click.stop>
      <!-- Primera vista: Confirmación -->
      <template v-if="!mostrarInputClave">
        <div class="modal-header">
          <h2>Limpiar Pantalla</h2>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea limpiar la pantalla?</p>
          <div class="warning-message">
            <p>Esta acción eliminará todos los productos de la venta actual.</p>
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

      <!-- Segunda vista: Input de clave -->
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
import { ref, onBeforeUnmount, nextTick, watch } from "vue";
import ModalLoading from "@/components/ModalLoading.vue";

export default {
  components: { ModalLoading },
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close", "confirm-limpiar", "modal-focused"],

  setup(props, { emit }) {
    const isModalLoading = ref(false);
    const mostrarInputClave = ref(false);
    const claveIngresada = ref("");
    const error = ref("");
    const claveInput = ref(null);

    watch(
      () => props.isVisible,
      (newValue) => {
        if (newValue) {
          emit("modal-focused", true);
          nextTick(() => {
            if (mostrarInputClave.value && claveInput.value) {
              claveInput.value.focus();
            }
          });
        } else {
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
      if (!claveIngresada.value) {
        error.value = "Por favor ingrese una clave";
        return;
      }
      isModalLoading.value = true;
      try {
        emit("confirm-limpiar", { clave: claveIngresada.value });
        emit("close");
      } finally {
        isModalLoading.value = false;
      }
    };

    const volverConfirmacion = () => {
      mostrarInputClave.value = false;
      error.value = "";
      claveIngresada.value = "";
    };

    onBeforeUnmount(() => {
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

input:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
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

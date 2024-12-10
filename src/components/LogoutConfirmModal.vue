<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-confirm">
      <div class="modal-header">
        <h2>Confirmación</h2>
      </div>
      <div class="modal-body-confirm">
        <p>¿Estás seguro de que deseas salir?</p>
      </div>
      <div class="modal-footer">
        <div class="action-buttons">
          <button @click="$emit('confirm')" style="background-color: red">
            Sí, salir
          </button>
          <button @click="$emit('cancel')">No, regresar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogoutConfirmModal",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["confirm", "cancel"],
};
</script>

<style scoped>
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

.modal-confirm {
  background: #1e1e1e;
  border-radius: 8px;
  width: 350px;
  max-width: 90%;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  color: black !important;
}

.modal-body-confirm {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  color: black !important;
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
  width: 100%;
  justify-content: center;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.dark .modal-confirm {
  background: #1e1e1e;
  border-color: #2b2b2b;
}

.dark .modal-header {
  background-color: #141414;
  border-color: #2b2b2b;
}

.dark .modal-header h2 {
  color: #e5e5e5 !important;
}

.dark .modal-body-confirm {
  background-color: #1e1e1e;
}

.dark .modal-body-confirm p {
  color: #e5e5e5 !important;
}

.dark .modal-footer {
  background-color: #141414;
  border-color: #2b2b2b;
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
</style>

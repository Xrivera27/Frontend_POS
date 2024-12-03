<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">Confirmar Cierre de Caja</h2>
      <p class="modal-message">¿Está seguro que desea cerrar la caja?</p>
      <div class="modal-buttons">
        <button 
          class="confirm-button"
          @click="$emit('confirm')"
        >
          <CheckCircle class="icon" /> Confirmar
        </button>
        <button 
          class="cancel-button"
          @click="$emit('close')"
        >
          <XCircle class="icon" /> Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CerrarCajaModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
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
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.modal-message {
  margin-bottom: 1.5rem;
  color: #666;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.confirm-button {
  background-color: #4CAF50;
  color: white;
}

.cancel-button {
  background-color: #f44336;
  color: white;
}

.icon {
  width: 18px;
  height: 18px;
}

/* Dark mode */
.dark .modal-content {
  background-color: #2d2d2d;
  color: white;
}

.dark .modal-title {
  color: #fff;
}

.dark .modal-message {
  color: #ccc;
}
</style>
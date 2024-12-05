<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Confirmar Cancelación de Venta</h3>
        <button class="close-button" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <p class="warning-text">Esta acción cancelará la venta y devolverá el inventario. Esta acción no se puede
          deshacer.</p>

        <div class="form-group">
          <label for="cancelDescription">Motivo de Cancelación:</label>
          <textarea id="cancelDescription" v-model="description" class="form-control" rows="3"
            placeholder="Ingrese el motivo de la cancelación..." :disabled="loading"></textarea>
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close" :disabled="loading">
          Cancelar
        </button>
        <button class="btn btn-danger" @click="handleConfirm" :disabled="loading || !description.trim()">
          {{ loading ? 'Procesando...' : 'Confirmar Cancelación' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'CancelSaleModal',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    venta: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      description: '',
      loading: false,
      error: ''
    };
  },
  methods: {
    async handleConfirm() {
      if (!this.description.trim()) {
        this.error = 'Por favor, ingrese una descripción de la cancelación';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        await this.$emit('confirm', this.venta.id_venta, this.description);
        this.close();
      } catch (error) {
        this.error = 'Error al cancelar la venta: ' + error.message;
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.description = '';
      this.error = '';
      this.$emit('close');
    }
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.warning-text {
  color: #dc3545;
  margin-bottom: 20px;
  font-weight: 500;
  padding: 12px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 8px;
  border-left: 4px solid #dc3545;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group textarea {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group label {
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box; /* Add this */
}

.form-control:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8f9fa;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

/* Dark Mode */
.dark .modal-content {
  background-color: #2d2d2d;
}

.dark .modal-header,
.dark .modal-footer {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .modal-header h3 {
  color: #fff;
}

.dark .close-button {
  color: #aaa;
}

.dark .close-button:hover {
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

.dark .form-control {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .error-message {
  color: #ff6b6b;
}

.dark .warning-text {
  background-color: rgba(220, 53, 69, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
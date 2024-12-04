<template>
    <div class="modal-overlay" v-if="isVisible" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmar Cancelación de Venta</h3>
          <button class="close-button" @click="close">&times;</button>
        </div>
  
        <div class="modal-body">
          <p class="warning-text">Esta acción cancelará la venta y devolverá el inventario. Esta acción no se puede deshacer.</p>
          
          <div class="form-group">
            <label for="cancelDescription">Motivo de Cancelación:</label>
            <textarea 
              id="cancelDescription"
              v-model="description"
              class="form-control"
              rows="3"
              placeholder="Ingrese el motivo de la cancelación..."
              :disabled="loading"
            ></textarea>
            <span class="error-message" v-if="error">{{ error }}</span>
          </div>
        </div>
  
        <div class="modal-footer">
          <button 
            class="btn btn-secondary" 
            @click="close"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            class="btn btn-danger" 
            @click="handleConfirm"
            :disabled="loading || !description.trim()"
          >
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
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    padding: 20px;
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
  }
  
  .warning-text {
    color: #dc3545;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 5px;
    display: block;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  textarea.form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    resize: vertical;
  }
  </style>
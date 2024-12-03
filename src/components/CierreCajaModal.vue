<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">Cerrar Caja</h2>
      
      <div class="form-section">
        <label class="form-label">Ingrese el dinero total en caja:</label>
        <div class="input-container">
          <span class="currency-symbol">L.</span>
          <input 
            ref="montoInput"
            type="text"
            v-model="montoInput"
            class="form-input"
            placeholder="0.00"
            @input="formatInput"
            @keypress="soloNumeros"
            @keydown.stop
          />
        </div>
      </div>

      <div class="modal-buttons">
        <button 
          class="verify-button"
          @click="verificarMonto"
          :disabled="!isValidAmount"
        >
          Verificar
        </button>
        <button 
          class="cancel-button"
          @click="$emit('close')"
        >
          Cancelar
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
    },
    totalEfectivo: {
      type: Number,
      default: 0
    },
    totalTransferencia: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      montoInput: '',
    }
  },
  computed: {
    isValidAmount() {
      const numero = parseFloat(this.montoInput);
      return this.montoInput !== '' && !isNaN(numero) && numero >= 0;
    }
  },
  methods: {
    soloNumeros(e) {
      e.stopPropagation(); // Detener la propagación del evento
      
      const codigoTecla = (e.which) ? e.which : e.keyCode;
      if (codigoTecla === 46) {
        if (this.montoInput.includes('.')) {
          e.preventDefault();
        }
        return;
      }
      if (codigoTecla > 31 && (codigoTecla < 48 || codigoTecla > 57)) {
        e.preventDefault();
      }
    },
    formatInput(e) {
      let valor = e.target.value;
      valor = valor.replace(/[^\d.]/g, '');
      
      const partes = valor.split('.');
      if (partes.length > 2) {
        valor = partes[0] + '.' + partes.slice(1).join('');
      }
      
      if (partes[1]?.length > 2) {
        valor = partes[0] + '.' + partes[1].slice(0, 2);
      }
      
      this.montoInput = valor;
    },
    verificarMonto() {
      if (!this.isValidAmount) return;
      
      const monto = parseFloat(this.montoInput);
      this.$emit('confirm', {
        dineroEnCaja: monto,
        totalSistema: this.totalEfectivo + this.totalTransferencia
      });
    },
    reset() {
      this.montoInput = '';
    },
    focusInput() {
      // Asegurar que el input tome el foco
      this.$nextTick(() => {
        this.$refs.montoInput?.focus();
      });
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.focusInput();
      } else {
        this.reset();
      }
    }
  },
  mounted() {
    if (this.isVisible) {
      this.focusInput();
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
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 1rem;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}


.form-input:focus {
  outline: 2px solid #4CAF50;
  border-color: #4CAF50;
}


.resumen-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.resumen-section h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.resumen-item:last-child {
  border-bottom: none;
  font-weight: 600;
}

.monto {
  font-family: monospace;
  font-size: 1.1rem;
}

.diferencia.faltante {
  color: #dc3545;
}

.diferencia.sobrante {
  color: #28a745;
}

.message-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.text-error {
  color: #dc3545;
  font-weight: 500;
}

.text-success {
  color: #28a745;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.confirm-button, .cancel-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.confirm-button {
  background-color: #28a745;
  color: white;
}

.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #dc3545;
  color: white;
}

/* Dark Mode */
.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .form-input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .resumen-section {
  background-color: #383838;
}

.dark .resumen-item {
  border-bottom-color: #404040;
}

.dark .currency-symbol {
  color: #aaa;
}
</style>
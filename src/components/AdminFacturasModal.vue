<template>
  <div v-if="isVisible" class="modal-backdrop" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Factura #{{ venta?.codigo || 'N/A' }}</h3>
        <button 
          class="close-button" 
          @click="handleClose"
          aria-label="Cerrar modal"
        >
          &times;
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="error" role="alert" class="error-message">
          {{ errorMessage }}
          <button class="btn btn-retry" @click="retryGeneration">
            Intentar nuevamente
          </button>
        </div>
        
        <div v-else class="message-container">
          <div v-if="loading" class="loading-spinner">
            <div class="spinner"></div>
            <span>Generando factura, por favor espere...</span>
          </div>
          
          <div v-else-if="pdfUrl" class="pdf-container">
            <iframe 
              :src="pdfUrl"
              type="application/pdf"
              title="Factura PDF"
              class="pdf-iframe"
              ref="pdfIframe"
              @load="handlePdfLoad"
              @error="handlePdfError"
            ></iframe>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-copia" 
          @click="generarCopia"
          :disabled="loading"
        >
          <i class="bi bi-files"></i>
          {{ esCopia ? 'Facura Original' : 'Factura Copia' }}
        </button>
        <button 
          class="btn btn-descargar" 
          @click="descargarPDF"
          :disabled="!lastResponse || loading"
        >
          <i class="bi bi-download"></i>
          Descargar
        </button>
        <button 
          class="btn btn-imprimir" 
          @click="imprimirPDF"
          :disabled="!pdfUrl || loading"
        >
          <i class="bi bi-printer"></i>
          Imprimir
        </button>
        <button 
          class="btn btn-cerrar" 
          @click="handleClose"
        >
          <i class="bi bi-x-lg"></i>
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { useToast } from "vue-toastification";
import solicitudes from "../../services/Soliadminventa.js";

export default {
  name: 'AdminFacturasModal',
  
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

  setup(props, { emit }) {
    const toast = useToast();
    const error = ref(false);
    const errorMessage = ref('');
    const loading = ref(false);
    const lastResponse = ref(null);
    const pdfUrl = ref(null);
    const pdfIframe = ref(null);
    const retryCount = ref(0);
    const MAX_RETRIES = 3;
    const pdfLoadTimeout = ref(null);
    const esCopia = ref(false);

    const handlePdfLoad = () => {
      if (pdfLoadTimeout.value) {
        clearTimeout(pdfLoadTimeout.value);
      }

      pdfLoadTimeout.value = setTimeout(() => {
        if (pdfIframe.value) {
          try {
            const iframeElement = pdfIframe.value;
            if (iframeElement.clientWidth === 0 || iframeElement.clientHeight === 0) {
              handlePdfError(new Error('PDF no se cargó correctamente'));
            }
          } catch (err) {
            console.log('PDF cargado (con restricciones de seguridad cross-origin)');
          }
        }
      }, 1000);
    };

    const handlePdfError = (err) => {
      console.error('Error al cargar PDF:', err);
      error.value = true;
      errorMessage.value = 'Error al cargar la factura. Por favor, intente nuevamente.';
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = null;
      }
    };

    const retryGeneration = async () => {
      if (retryCount.value >= MAX_RETRIES) {
        toast.error("Se ha excedido el número máximo de intentos");
        return;
      }
      retryCount.value++;
      error.value = false;
      errorMessage.value = '';
      await generarPDF();
    };

    const generarCopia = async () => {
      esCopia.value = !esCopia.value;
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = null;
      }
      await generarPDF();
    };

    const generarPDF = async () => {
      if (!props.venta?.id_venta || !props.venta?.id_usuario) {
        error.value = true;
        errorMessage.value = "Datos de venta no válidos";
        toast.error(errorMessage.value);
        return;
      }
      try {
        loading.value = true;
        error.value = false;
        errorMessage.value = '';
        
        console.log('Generando factura para:', {
          ventaId: props.venta.id_venta,
          userId: props.venta.id_usuario,
          esCopia: esCopia.value
        });
        
        const response = await axios({
          method: 'get',
          url: `${solicitudes.homeUrl}/AdminVentas/ventas/factura/${props.venta.id_venta}/${props.venta.id_usuario}`,
          params: {
            esCopia: esCopia.value
          },
          responseType: 'blob',
          timeout: 30000
        });
        
        if (response.data) {
          if (response.data.type !== 'application/pdf') {
            throw new Error(`Tipo de respuesta inválido: ${response.data.type}`);
          }

          lastResponse.value = response.data;
          if (pdfUrl.value) {
            URL.revokeObjectURL(pdfUrl.value);
          }
          pdfUrl.value = URL.createObjectURL(response.data);
          toast.success(esCopia.value ? "Copia de factura generada" : "Factura generada exitosamente");
          retryCount.value = 0;
        }
      } catch (err) {
        console.error('Error al generar PDF:', err);
        error.value = true;
        errorMessage.value = err.response?.data?.message || 
                         "Error al generar la factura. Por favor, intente nuevamente.";
        toast.error(errorMessage.value);
      } finally {
        loading.value = false;
      }
    };

    const imprimirPDF = () => {
      if (!pdfUrl.value) {
        toast.warning("No hay factura para imprimir");
        return;
      }

      if (pdfIframe.value) {
        pdfIframe.value.contentWindow.print();
      }
    };

    const descargarPDF = () => {
      if (!lastResponse.value) {
        toast.warning("No hay factura para descargar");
        return;
      }
      
      try {
        const url = URL.createObjectURL(lastResponse.value);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Factura_${props.venta.codigo}${esCopia.value ? '_copia' : ''}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Factura descargada exitosamente");
      } catch (err) {
        console.error('Error al descargar PDF:', err);
        toast.error("Error al descargar la factura");
      }
    };

    const handleClose = () => {
      if (loading.value) {
        toast.warning("Espere a que termine de generarse la factura");
        return;
      }
      
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
        pdfUrl.value = null;
      }
      lastResponse.value = null;
      error.value = false;
      errorMessage.value = '';
      retryCount.value = 0;
      esCopia.value = false;
      emit('close');
    };

    watch(() => props.isVisible, (newVal) => {
      if (newVal && props.venta) {
        error.value = false;
        errorMessage.value = '';
        lastResponse.value = null;
        retryCount.value = 0;
        esCopia.value = false;
        if (pdfUrl.value) {
          URL.revokeObjectURL(pdfUrl.value);
          pdfUrl.value = null;
        }
        generarPDF();
      }
    });

    onMounted(() => {
      if (props.isVisible && props.venta) {
        generarPDF();
      }
    });

    onBeforeUnmount(() => {
      if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
      }
      if (pdfLoadTimeout.value) {
        clearTimeout(pdfLoadTimeout.value);
      }
    });

    return {
      error,
      errorMessage,
      loading,
      lastResponse,
      pdfUrl,
      pdfIframe,
      esCopia,
      generarPDF,
      generarCopia,
      imprimirPDF,
      descargarPDF,
      handleClose,
      retryGeneration,
      handlePdfLoad,
      handlePdfError
    };
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 98vw;
  height: 98vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #dc3545;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  padding: 0;
  position: relative;
}

.pdf-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  background: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s, transform 0.2s;
}

.btn i {
  font-size: 1.1rem;
}

.btn-copia {
  background: #6c757d;
  color: white;
}

.btn-descargar {
  background: #28a745;
  color: white;
}

.btn-imprimir {
  background: #007bff;
  color: white;
}

.btn-cerrar {
  background: #dc3545;
  color: white;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
  margin: 1rem;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  background: #6c757d;
  color: white;
  margin-top: 0.5rem;
}

@media print {
  .modal-header,
  .modal-footer {
    display: none;
  }
  
  .modal-content {
    box-shadow: none;
  }

  .pdf-container {
    position: static;
  }
}
</style>
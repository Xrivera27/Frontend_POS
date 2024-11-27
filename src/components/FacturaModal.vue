<template>
    <div v-if="isVisible" class="modal-backdrop" @click.self="handleClose">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Factura</h3>
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
            Error al generar la factura. Por favor, intente nuevamente.
          </div>
          <div v-else class="message-container">
            <div v-if="loading" class="loading-spinner">
              <span>La factura se está generando...</span>
            </div>
            <div v-else-if="pdfUrl" class="pdf-container">
              <iframe 
                :src="pdfUrl + '#toolbar=0&zoom=150'"
                title="Factura PDF"
                class="pdf-iframe"
                ref="pdfIframe"
                frameborder="0"
              ></iframe>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-descargar" 
            @click="descargarPDF"
            :disabled="!lastResponse || loading"
          >
            Descargar
          </button>
          <button 
            class="btn btn-imprimir" 
            @click="imprimirPDF"
            :disabled="!pdfUrl || loading"
          >
            Imprimir
          </button>
          <button 
            class="btn btn-cerrar" 
            @click="handleClose"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch, onBeforeUnmount } from 'vue';
  import axios from 'axios';
  import solicitudes from "../../services/solicitudes.js";
  import { useToast } from "vue-toastification";
  
  export default {
    name: 'FacturaModal',
    
    props: {
      isVisible: {
        type: Boolean,
        required: true
      },
      idVenta: {
        type: [String, Number],
        required: true,
        validator: (value) => value != null && value !== ''
      },
      idUsuario: {
        type: [String, Number],
        required: true,
        validator: (value) => value != null && value !== ''
      }
    },
  
    setup(props, { emit }) {
      const toast = useToast();
      const error = ref(false);
      const loading = ref(false);
      const lastResponse = ref(null);
      const pdfUrl = ref(null);
      const pdfIframe = ref(null);
  
      const generarPDF = async () => {
        if (!props.idVenta || !props.idUsuario) {
          error.value = true;
          toast.error("Datos de venta no válidos");
          return;
        }
  
        try {
          loading.value = true;
          error.value = false;
          
          const response = await axios({
            method: 'get',
            url: `${solicitudes.homeUrl}/ventas/factura/${props.idVenta}/${props.idUsuario}`,
            responseType: 'blob'
          });
          
          if (response.data) {
            lastResponse.value = response.data;
            const blob = new Blob([response.data], { type: 'application/pdf' });
            pdfUrl.value = URL.createObjectURL(blob);
            toast.success("Factura generada exitosamente");
          }
        } catch (err) {
          console.error('Error al generar PDF:', err);
          error.value = true;
          toast.error("Error al generar la factura");
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
          const blob = new Blob([lastResponse.value], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Factura.pdf';
          
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
        emit('close');
      };
  
      watch(() => props.isVisible, (newVal) => {
        if (newVal && props.idVenta && props.idUsuario) {
          error.value = false;
          lastResponse.value = null;
          if (pdfUrl.value) {
            URL.revokeObjectURL(pdfUrl.value);
            pdfUrl.value = null;
          }
          generarPDF();
        }
      });
  
      onBeforeUnmount(() => {
        if (pdfUrl.value) {
          URL.revokeObjectURL(pdfUrl.value);
        }
      });
  
      return {
        error,
        loading,
        lastResponse,
        pdfUrl,
        pdfIframe,
        generarPDF,
        imprimirPDF,
        descargarPDF,
        handleClose
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
  }
  
  .modal-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-button {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
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
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
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
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  
  @media print {
    .modal-header,
    .modal-footer {
      display: none;
    }
    
    .modal-content {
      box-shadow: none;
    }
  }
  </style>
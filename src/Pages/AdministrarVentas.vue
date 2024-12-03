<template>
  <div class="ventas-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <!-- Filtros de fecha -->
      <div class="date-filter">
        <label for="start-date">Desde: </label>
        <input type="date" id="start-date" v-model="startDate">
        <label for="end-date">Hasta: </label>
        <input type="date" id="end-date" v-model="endDate">
      </div>

      <!-- Botón de exportación PDF -->
      <ExportButton :columns="columns" :rows="filteredRows" fileName="Ventas.pdf" class="export-button" />

     

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar venta..." />
      </div>
    </div>

    <!-- Tabla exportable -->
    <div class="table-container" ref="table">
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">
        Cargando ventas...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedVentas.length === 0" class="no-data">
        No se encontraron ventas para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Número Factura</th>
            <th>Empleado</th>
            <th>Cliente</th>
            <th>Subtotal</th>
            <th>Descuento</th>
            <th>Total Impuesto</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha y Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, index) in paginatedVentas" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ venta.codigo }}</td>
            <td>{{ venta.nombre }}</td>
            <td>{{ venta.cliente }}</td>
            <td>{{ formatCurrency(venta.subtotal) }}</td>
            <td>{{ formatCurrency(venta.descuento) }}</td>
            <td>{{ formatCurrency(venta.total_impuesto) }}</td>
            <td>{{ formatCurrency(venta.total) }}</td>
            <td>
              <span 
                :class="{
                  'estado-badge': true,
                  'estado-pagada': venta.estado === 'Pagada',
                  'estado-cancelada': venta.estado === 'Cancelada'
                }"
              >
                {{ venta.estado || 'Pagada' }}
              </span>
            </td>
            <td>{{ formatDateTime(venta.fechaHora) }}</td>
            <td class="actions-column">
              <button id="btnFactura" class="btn btn-primary" @click="showFactura(venta)" title="Ver Factura">
                <i class="bi bi-file-text-fill"></i>
              </button>
              <button 
                class="btn btn-danger ms-2" 
                @click="showCancelModal(venta)"
                :title="venta.estado === 'Cancelada' ? 'Venta ya cancelada' : 'Cancelar Venta'"
                :disabled="venta.estado === 'Cancelada'"
                :style="venta.estado === 'Cancelada' ? { opacity: '0.5', cursor: 'not-allowed' } : {}"
              >
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, filteredVentas.length) }} de {{ filteredVentas.length }} registros
        </div>
        <div class="pagination-container">
          <button 
            class="pagination-button" 
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            Anterior
          </button>
          
          <button 
            class="pagination-button" 
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Factura -->
    <AdminFacturaModal 
      v-if="isFacturaModalOpen"
      :isVisible="isFacturaModalOpen"
      :venta="selectedVenta"
      @close="closeFacturaModal"
    />

    <!-- Modal de Cancelación -->
    <CancelSaleModal 
      v-if="isCancelModalOpen"
      :isVisible="isCancelModalOpen"
      :venta="selectedVentaForCancel"
      @close="closeCancelModal"
      @confirm="handleCancelSale"
    />
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';
import AdminFacturaModal from '../components/AdminFacturasModal.vue';
import CancelSaleModal from '../components/CancelarVentaModal.vue';
import AdminVentas from '../../services/Soliadminventa';

export default {
  name: 'AdministrarVentas',
  components: {
    PageHeader,
    ExportButton,
    AdminFacturaModal,
    CancelSaleModal
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      titulo: 'Administrar Ventas',
      searchQuery: '',
      startDate: '',
      endDate: '',
      selectedVenta: null,
      selectedVentaForCancel: null,
      isFacturaModalOpen: false,
      isCancelModalOpen: false,
      ventas: [],
      currentPage: 1,
      pageSize: 10,
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Número Factura', dataKey: 'codigo' },
        { header: 'Empleado', dataKey: 'nombre' },
        { header: 'Cliente', dataKey: 'cliente' },
        { header: 'Subtotal', dataKey: 'subtotal' },
        { header: 'Descuento', dataKey: 'descuento' },
        { header: 'Total Impuesto', dataKey: 'total_impuesto' },
        { header: 'Total', dataKey: 'total' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Fecha y Hora', dataKey: 'fechaHora' }
      ],
      rows: [],
      loading: false,
      error: null
    };
  },
  computed: {
    filteredVentas() {
      return this.ventas.filter(venta => {
        const ventaFecha = new Date(venta.fechaHora);
        
        const matchesSearchQuery = 
          String(venta.codigo).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          venta.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          venta.cliente.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesDateRange = 
          (!this.startDate || ventaFecha >= new Date(this.startDate + 'T00:00:00')) &&
          (!this.endDate || ventaFecha <= new Date(this.endDate + 'T23:59:59'));

        return matchesSearchQuery && matchesDateRange;
      });
    },
    paginatedVentas() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredVentas.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredVentas.length / this.pageSize);
    },
    filteredRows() {
      return this.paginatedVentas.map((venta, index) => ({
        index: ((this.currentPage - 1) * this.pageSize) + index + 1,
        codigo: venta.codigo,
        nombre: venta.nombre,
        cliente: venta.cliente,
        subtotal: this.formatCurrency(venta.subtotal),
        descuento: this.formatCurrency(venta.descuento),
        total: this.formatCurrency(venta.total),
        total_impuesto: this.formatCurrency(venta.total_impuesto),
        estado: venta.estado || 'Pagada',
        fechaHora: this.formatDateTime(venta.fechaHora)
      }));
    }
  },
  methods: {
    formatCurrency(value) {
      return `L. ${Number(value).toFixed(2)}`;
    },

    formatDateTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('es-HN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).replace(',', '');
    },

    async loadVentas() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Iniciando carga de ventas...');
        const response = await AdminVentas.obtenerVentas();
        console.log('Respuesta del servidor:', response);
        
        const ventasData = response.data || response;
        if (ventasData) {
          this.ventas = ventasData.map(venta => ({
            ...venta,
            id_venta: venta.id_venta || venta.idVenta,
            id_usuario: venta.id_usuario || venta.idUsuario,
            estado: venta.estado || 'Pagada'
          }));
          console.log('Ventas procesadas:', this.ventas);
          this.generateRows();
        } else {
          throw new Error('No se pudieron obtener las ventas');
        }
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        this.error = 'Error al cargar las ventas. Por favor, intente nuevamente.';
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    showFactura(venta) {
      console.log('Mostrando factura para:', venta);
      this.selectedVenta = venta;
      this.isFacturaModalOpen = true;
    },

    closeFacturaModal() {
      this.isFacturaModalOpen = false;
      this.selectedVenta = null;
    },

    showCancelModal(venta) {
      this.selectedVentaForCancel = venta;
      this.isCancelModalOpen = true;
    },

    closeCancelModal() {
      this.isCancelModalOpen = false;
      this.selectedVentaForCancel = null;
    },

    async handleCancelSale(ventaId, description) {
    try {
        const response = await AdminVentas.cancelarVenta(ventaId, description);
        
        if (response.success) {
            this.toast.success('Venta cancelada exitosamente');
            
            try {
                // Usar el nuevo método del servicio
                const blob = await AdminVentas.obtenerReporteCancelacion(ventaId);
                
                // Crear y descargar el PDF
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cancelacion_venta_${ventaId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (reportError) {
                console.error('Error al descargar reporte:', reportError);
                this.toast.error('Error al generar el reporte de cancelación');
            }

            await this.loadVentas();
        } else {
            throw new Error(response.message || 'Error al cancelar la venta');
        }
    } catch (error) {
        console.error('Error:', error);
        this.toast.error('Error al cancelar la venta: ' + error.message);
        throw error;
    }
},
    generateRows() {
      this.rows = this.filteredRows;
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    resetFilters() {
      this.searchQuery = '';
      this.startDate = '';
      this.endDate = '';
      this.currentPage = 1;
    }
  },
  watch: {
    paginatedVentas: {
      handler() {
        this.generateRows();
      },
      deep: true
    },
    searchQuery() {
      this.currentPage = 1;
    },
    startDate() {
      this.currentPage = 1; 
    },
    endDate() {
      this.currentPage = 1;
    }
  },
  async mounted() {
    await this.loadVentas();
    document.title = "Administrar Ventas";
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Estilos globales */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

/* Barra de búsqueda */
.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

/* Botón de exportación */
.export-button {
  margin: 0;
}

/* Botones de acción */
.btn {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #bb2d3b;
}

.btn-primary:hover {
  background-color: #0056b3;
}

/* Nuevo estilo para botones deshabilitados */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn:disabled:hover {
  transform: none !important;
  background-color: #dc3545;
}

/* Estado badges */
.estado-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.estado-pagada {
  background-color: #d1e7dd;
  color: #0f5132;
}

.estado-cancelada {
  background-color: #f8d7da;
  color: #842029;
}

.actions-column {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.ventas-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

/* Ajustar las opciones */
.opciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.bi-file-text-fill,
.bi-x-circle-fill {
  font-size: 20px;
}

/* Contenedor de la tabla */
.table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
}

/* Estilos de la tabla */
.table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 8px;
  text-align: center;
}

.table th {
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

/* Filtro de fechas */
.date-filter {
  display: flex;
  align-items: center;
  margin-right: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.date-filter label {
  margin-right: 10px;
  white-space: nowrap;
}

.date-filter input {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ced4da;
  margin-right: 20px;
  width: auto;
}

/* Scroll personalizado */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Nueva Paginación */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
}

.pagination-info {
  color: #6c757d;
}

.pagination-container {
  display: flex;
  gap: 5px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.pagination-button.active {
  background-color: #17a2b8;
  color: white;
  border-color: #17a2b8;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Loading y No Data */
.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.no-data {
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Modo oscuro */
.dark .table-container {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .table th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark .table td {
  color: #fff;
  border-color: #404040;
}

.dark .loading-indicator,
.dark .no-data {
  color: #aaa;
  background-color: #2d2d2d;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .export-button {
    width: 100%;
    margin: 8px 0;
  }

  .date-filter {
    flex-direction: column;
    align-items: stretch;
    margin-right: 0;
    width: 100%;
  }

  .date-filter input {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }

  .btn {
    width: 40px;
    height: 35px;
    font-size: 14px;
  }

  .bi-file-text-fill,
  .bi-x-circle-fill {
    font-size: 16px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-container {
    justify-content: center;
    flex-wrap: wrap;
  }

  .estado-badge {
    font-size: 0.75rem;
    padding: 2px 6px;
  }
}

@media screen and (max-width: 480px) {
  .table th,
  .table td {
    padding: 6px;
    font-size: 14px;
  }

  .busqueda {
    max-width: 100%;
  }

  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
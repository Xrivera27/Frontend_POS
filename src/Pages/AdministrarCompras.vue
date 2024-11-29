<template>
  <div class="compras-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <!-- Filtros de fecha -->
      <div class="date-filter">
        <label for="start-date">Desde: </label>
        <input type="date" id="start-date" v-model="startDate">
        <label for="end-date">Hasta: </label>
        <input type="date" id="end-date" v-model="endDate">
      </div>

      <!-- Botones de exportación -->
      <ExportButton 
        :columns="columns" 
        :rows="filteredRows" 
        fileName="Compras.pdf" 
        class="export-button" 
      />

      <!-- Botón generar reporte -->
     

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input 
          class="busqueda" 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar compra..." 
        />
      </div>
    </div>

    <!-- Tabla exportable -->
    <div class="table-container" ref="table">
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">
        Cargando compras...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedCompras.length === 0" class="no-data">
        No se encontraron compras para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Empleado</th>
            <th>Proveedor</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Método de Pago</th>
            <th>Fecha y Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(compra, index) in paginatedCompras" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ compra.codigo }}</td>
            <td>{{ compra.nombre }}</td>
            <td>{{ compra.proveedor }}</td>
            <td>{{ compra.cantidad }}</td>
            <td>{{ formatCurrency(compra.total) }}</td>
            <td>
              <span 
                :class="{
                  'estado-badge': true,
                  'estado-completado': compra.estado === 'Completado',
                  'estado-pendiente': compra.estado === 'Pendiente',
                  'estado-cancelado': compra.estado === 'Cancelado'
                }"
              >
                {{ compra.estado }}
              </span>
            </td>
            <td>{{ compra.metodo_pago }}</td>
            <td>{{ formatDateTime(compra.fechaHora) }}</td>
            <td class="actions-column">
              <button 
                id="btnDetalles" 
                class="btn btn-info" 
                @click="showDetalles(compra)" 
                title="Ver Detalles"
              >
                <i class="bi bi-eye-fill"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, filteredCompras.length) }} de {{ filteredCompras.length }} registros
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

    <!-- Modal de Detalles -->
    <div v-if="isDetallesModalOpen" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Detalles de Compra</h2>
          <button class="btn-close" @click="closeDetallesModal">&times;</button>
        </div>

        <div class="detalles-info">
          <div class="info-section">
            <div class="info-item">
              <strong>Proveedor:</strong>
              <span>{{ selectedCompra?.proveedor }}</span>
            </div>
            <div class="info-item">
              <strong>Teléfono:</strong>
              <span>{{ selectedCompra?.telefono_proveedor }}</span>
            </div>
            <div class="info-item">
              <strong>Correo:</strong>
              <span>{{ selectedCompra?.correo_proveedor }}</span>
            </div>
            <div class="info-item">
              <strong>Método de Pago:</strong>
              <span>{{ selectedCompra?.metodo_pago }}</span>
            </div>
            <div class="info-item">
              <strong>Fecha:</strong>
              <span>{{ formatDateTime(selectedCompra?.fechaHora) }}</span>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in selectedCompra?.productos" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.descripcion }}</td>
                <td>{{ producto.cantidad }}</td>
                <td>{{ formatCurrency(producto.precio_unitario) }}</td>
                <td>{{ formatCurrency(producto.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <h3>Total Compra: {{ formatCurrency(selectedCompra?.total) }}</h3>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDetallesModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';
import AdminCompras from '../../services/Soliadminventa';

export default {
  name: 'AdministrarCompras',
  components: {
    PageHeader,
    ExportButton
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      titulo: 'Administrar Compras',
      searchQuery: '',
      startDate: '',
      endDate: '',
      selectedCompra: null,
      isDetallesModalOpen: false,
      compras: [],
      currentPage: 1,
      pageSize: 10,
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Código', dataKey: 'codigo' },
        { header: 'Empleado', dataKey: 'nombre' },
        { header: 'Proveedor', dataKey: 'proveedor' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Total', dataKey: 'total' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Método de Pago', dataKey: 'metodo_pago' },
        { header: 'Fecha y Hora', dataKey: 'fechaHora' }
      ],
      rows: [],
      loading: false,
      error: null
    };
  },
  computed: {
    filteredCompras() {
      return this.compras.filter(compra => {
        const compraFecha = new Date(compra.fechaHora);
        
        const matchesSearchQuery = 
          String(compra.codigo).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          compra.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          compra.proveedor.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesDateRange = 
          (!this.startDate || compraFecha >= new Date(this.startDate + 'T00:00:00')) &&
          (!this.endDate || compraFecha <= new Date(this.endDate + 'T23:59:59'));

        return matchesSearchQuery && matchesDateRange;
      });
    },
    paginatedCompras() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredCompras.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredCompras.length / this.pageSize);
    },
    filteredRows() {
      return this.paginatedCompras.map((compra, index) => ({
        index: ((this.currentPage - 1) * this.pageSize) + index + 1,
        codigo: compra.codigo,
        nombre: compra.nombre,
        proveedor: compra.proveedor,
        cantidad: compra.cantidad,
        total: this.formatCurrency(compra.total),
        estado: compra.estado,
        metodo_pago: compra.metodo_pago,
        fechaHora: this.formatDateTime(compra.fechaHora)
      }));
    }
  },
  methods: {
    formatCurrency(value) {
      return `L. ${Number(value).toFixed(2)}`;
    },

    formatDateTime(dateString) {
      if (!dateString) return '';
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

    async loadCompras() {
      this.loading = true;
      this.error = null;
      try {
        console.log('Iniciando carga de compras...');
        const response = await AdminCompras.obtenerCompras();
        console.log('Respuesta del servidor:', response);
        
        const comprasData = response.data || response;
        if (comprasData) {
          this.compras = comprasData;
          console.log('Compras procesadas:', this.compras);
          this.generateRows();
        } else {
          throw new Error('No se pudieron obtener las compras');
        }
      } catch (error) {
        console.error('Error al cargar compras:', error);
        this.error = 'Error al cargar las compras. Por favor, intente nuevamente.';
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async showDetalles(compra) {
      try {
        console.log('Mostrando detalles para:', compra);
        const detalles = await AdminCompras.obtenerDetalleCompra(compra.id_compra);
        this.selectedCompra = detalles;
        this.isDetallesModalOpen = true;
      } catch (error) {
        console.error('Error al obtener detalles:', error);
        this.toast.error('Error al obtener los detalles de la compra');
      }
    },

    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.selectedCompra = null;
    },

    async generarReporte() {
      if (!this.startDate || !this.endDate) {
        this.toast.warning('Seleccione un rango de fechas');
        return;
      }

      try {
        this.loading = true;
        const blob = await AdminCompras.generarReporteCompras(this.startDate, this.endDate);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-compras-${this.startDate}-${this.endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.toast.success('Reporte generado exitosamente');
      } catch (error) {
        console.error('Error al generar reporte:', error);
        this.toast.error('Error al generar el reporte');
      } finally {
        this.loading = false;
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
    paginatedCompras: {
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
    await this.loadCompras();
    document.title = "Administrar Compras";
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

/* Contenedor principal */
.compras-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
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

/* Opciones y filtros */
.opciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
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

.btn-view {
  background-color: #20B2AA;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.btn-view:hover {
  background-color: #1A958F;
}

.btn-info {
  background-color: #17a2b8;
}

.btn-success {
  background-color: #28a745;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  width: auto;
  padding: 0 16px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Estado badge */
.estado-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  display: inline-block;
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* Contenedor de la tabla */
.table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  vertical-align: middle;
}

.table th {
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

/* Acciones columna */
.actions-column {
  text-align: center;
  vertical-align: middle;
}

.bi-eye-fill {
  font-size: 20px;
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

/* Modal Styles */
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #6c757d;
}

/* Detalles Info */
.detalles-info {
  padding: 1rem;
  background-color: #f8f9fa;
  margin: 1rem;
  border-radius: 4px;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: #495057;
}

.total-section {
  padding: 1rem;
  text-align: right;
  font-size: 1.25rem;
  color: #495057;
}

/* Paginación */
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

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .info-section {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 40px;
    height: 35px;
    font-size: 14px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-container {
    justify-content: center;
    flex-wrap: wrap;
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

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}

/* Modo oscuro para el componente completo */
.dark .compras-wrapper {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

/* Título en modo oscuro */
.dark h1,
.dark .page-header h1,
.dark .page-header .titulo {
  color: #ffffff !important;
}

/* Inputs en modo oscuro */
.dark .busqueda,
.dark .date-filter input {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

/* Tabla en modo oscuro */
.dark .table-container {
  background-color: #2d2d2d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .table th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark .table td {
  border-color: #404040;
  color: #e0e0e0;
}

/* Estado badges en modo oscuro */
.dark .estado-badge {
  opacity: 0.9;
}

.dark .estado-completado {
  background-color: #1b4332;
  color: #95d5b2;
}

.dark .estado-pendiente {
  background-color: #4a4a00;
  color: #ffff99;
}

.dark .estado-cancelado {
  background-color: #4c1d1d;
  color: #ff9999;
}

/* Modal en modo oscuro */
.dark .modal-content {
  background-color: #2d2d2d;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.dark .modal-header,
.dark .modal-footer {
  border-color: #404040;
}

.dark .modal-title {
  color: #e0e0e0;
}

.dark .btn-close {
  color: #e0e0e0;
}

/* Detalles info en modo oscuro */
.dark .detalles-info {
  background-color: #383838;
}

.dark .info-item strong {
  color: #e0e0e0;
}

/* Paginación en modo oscuro */
.dark .pagination-button {
  background-color: #383838;
  border-color: #404040;
  color: #e0e0e0;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #454545;
}

.dark .pagination-button:disabled {
  opacity: 0.5;
  background-color: #2d2d2d;
}

.dark .pagination-info {
  color: #b0b0b0;
}

/* Loading y No Data en modo oscuro */
.dark .loading-indicator,
.dark .no-data {
  color: #b0b0b0;
  background-color: #2d2d2d;
}

/* Scroll personalizado en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #383838;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #606060;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #707070;
}

/* Botones en modo oscuro */
.dark .btn-info {
  background-color: #0f7285;
}

.dark .btn-info:hover {
  background-color: #0d606f;
}

.dark .btn-secondary {
  background-color: #4a4a4a;
}

.dark .btn-secondary:hover {
  background-color: #5a5a5a;
}
</style>
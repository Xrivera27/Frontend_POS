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
            <td>{{ formatDateTime(venta.fechaHora) }}</td>
            <td class="actions-column">
              <button id="btnDetalles" class="btn btn-info me-2" @click="showDetalles(venta)">
                <i class="bi bi-eye-fill"></i>
              </button>
              <button id="btnFactura" class="btn btn-primary" @click="showFactura(venta)">
                <i class="bi bi-file-text-fill"></i>
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

    <!-- Modal para mostrar detalles de venta -->
    <div v-if="isDetallesModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">Detalles de Venta</h2>

        <div class="detalles-lista">
          <p><strong>Número de Factura:</strong> {{ ventaDetalles[0]?.numero_factura }}</p>
          <p><strong>CAI:</strong> {{ ventaDetalles[0]?.cai }}</p>
          <p><strong>Fecha y Hora:</strong> {{ formatDateTime(ventaDetalles[0]?.fechaHora) }}</p>
          <p><strong>Cliente:</strong> {{ ventaDetalles[0]?.cliente }}</p>
          <p><strong>RTN Cliente:</strong> {{ ventaDetalles[0]?.rtnCliente }}</p>
          <p><strong>Atendido por:</strong> {{ ventaDetalles[0]?.nombre }}</p>
        </div>

        <h3>Productos</h3>
        <div class="tabla-productos">
          <table class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="producto in ventaDetalles[0]?.productos" :key="producto.codigo">
                <td>{{ producto.codigo }}</td>
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.cantidad }}</td>
                <td>{{ formatCurrency(producto.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="totales">
          <p><strong>Subtotal:</strong> {{ formatCurrency(ventaDetalles[0]?.subtotal) }}</p>
          <p><strong>ISV:</strong> {{ formatCurrency(ventaDetalles[0]?.total_impuesto) }}</p>
          <p><strong>Total:</strong> {{ formatCurrency(ventaDetalles[0]?.total) }}</p>
        </div>

        <div class="modal-footer">
          <button id="BtnCerrarDetalles" class="btn btn-secondary" @click="closeDetallesModal">
            Cerrar
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
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';
import AdminFacturaModal from '../components/AdminFacturasModal.vue';
import AdminVentas from '../../services/Soliadminventa';


export default {
  name: 'AdministrarVentas',
  components: {
    PageHeader,
    ExportButton,
    AdminFacturaModal
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
      selectedVenta: null, // En lugar de selectedVentaId y currentUserId
      isFacturaModalOpen: false,
      isDetallesModalOpen: false,
      ventaDetalles: [],
      selectedVentaId: null,
      currentUserId: null,
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
        const ventasData = await AdminVentas.obtenerVentas();
        this.ventas = ventasData.map(venta => ({
          ...venta,
          id_venta: venta.id_venta || venta.idVenta,
          id_usuario: venta.id_usuario || venta.idUsuario
        }));
        this.generateRows();
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        this.error = 'Error al cargar las ventas. Por favor, intente nuevamente.';
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async showDetalles(venta) {
      try {
        const idVenta = venta.id_venta;
        console.log('ID de venta a consultar:', idVenta);
        const detalleVenta = await AdminVentas.obtenerDetalleVenta(idVenta);
        
        this.ventaDetalles = [detalleVenta];
        this.isDetallesModalOpen = true;
      } catch (error) {
        console.error('Error al cargar detalles de la venta:', error);
        this.toast.error('Error al cargar los detalles de la venta. Por favor, intente nuevamente.');
      }
    },

    showFactura(venta) {
  console.log('Mostrando factura para:', venta);
  this.selectedVenta = venta; // Guardamos la venta completa
  this.isFacturaModalOpen = true;
},

    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.ventaDetalles = [];
    },

    closeFacturaModal() {
  this.isFacturaModalOpen = false;
  this.selectedVenta = null;
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

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  },
  watch: {
    paginatedVentas: {
      handler() {
        this.generateRows();
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadVentas();
    document.title = "Administrar Ventas";
    this.changeFavicon('/img/spiderman.ico');
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
#btnDetalles,
#btnFactura {
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

#btnDetalles:hover {
  background-color: #17a2b8;
  transform: scale(1.05);
}

#btnFactura:hover {
  background-color: #0056b3;
  transform: scale(1.05);
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

/* Ajustar las opciones igual que en categorías */
.opciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.bi-eye-fill,
.bi-file-text-fill {
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

/* Modal */
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
  padding: 20px;
  border-radius: 4px;
  max-width: 1500px;
  width: 90%;
  margin: 20px;
  overflow-y: auto;
  max-height: 90vh;
}

.h2-modal-content {
  font-size: 24px;
  margin-bottom: 20px;
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
.table-container::-webkit-scrollbar,
.modal-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Detalles de la venta */
.detalles-lista {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.detalles-lista p {
  margin: 8px 0;
}

.tabla-productos {
  margin: 20px 0;
  overflow-x: auto;
}

.totales {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.totales p {
  margin: 8px 0;
  font-size: 1.1em;
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

.dark .modal-content,
.dark .detalles-lista,
.dark .totales {
  background-color: #2d2d2d;
  color: #fff;
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

  #btnDetalles,
  #btnFactura {
    width: 40px;
    height: 35px;
    font-size: 14px;
  }

  .bi-eye-fill,
  .bi-file-text-fill {
    font-size: 16px;
  }

  .modal-content {
    width: 95%;
    padding: 15px;
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
  .h2-modal-content {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .table th,
  .table td {
    padding: 6px;
    font-size: 14px;
  }

  .busqueda {
    max-width: 100%;
  }

  .modal-content {
    margin: 10px;
    padding: 10px;
  }

  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
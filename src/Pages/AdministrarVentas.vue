<template>
  <div class="ventas-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <div class="registros">
        <span>Mostrar
          <select v-model="itemsPerPage" class="custom-select">
            <option value="">Todos</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select> registros
        </span>
      </div>

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
    <div class="table-container" v-pdf-export ref="table">
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
            <th>Código</th>
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
            <td>{{ index + 1 }}</td>
            <td>{{ venta.codigo }}</td>
            <td>{{ venta.nombre }}</td>
            <td>{{ venta.cliente }}</td>
            <td>{{ formatCurrency(venta.subtotal) }}</td>
            <td>{{ formatCurrency(venta.descuento) }}</td>
            <td>{{ formatCurrency(venta.total_impuesto) }}</td>
            <td>{{ formatCurrency(venta.total) }}</td>
            <td>{{ formatDateTime(venta.fechaHora) }}</td>
            <td>
              <button id="btnDetalles" class="btn btn-info" @click="showDetalles(index)">
                <i class="bi bi-eye-fill"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para mostrar detalles de venta -->
    <div v-if="isDetallesModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">Detalles de Venta</h2>

        <div class="detalles-grid">
          <!-- Información Principal -->
          <div class="detalles-seccion">
            <h3>Información de Factura</h3>
            <p><strong>Número de Factura:</strong> {{ ventaDetalles[0]?.numero_factura }}</p>
            <p><strong>CAI:</strong> {{ ventaDetalles[0]?.cai }}</p>
            <p><strong>Fecha y Hora:</strong> {{ ventaDetalles[0]?.fechaHora }}</p>
          </div>

          <!-- Información de Cliente y Empleado -->
          <div class="detalles-seccion">
            <h3>Información de Cliente y Empleado</h3>
            <p><strong>Cliente:</strong> {{ ventaDetalles[0]?.cliente }}</p>
            <p><strong>RTN Cliente:</strong> {{ ventaDetalles[0]?.rtnCliente }}</p>
            <p><strong>Atendido por:</strong> {{ ventaDetalles[0]?.nombre }}</p>
          </div>

          <!-- Productos -->
          <div class="detalles-seccion productos-tabla">
            <h3>Productos</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Descuento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="producto in ventaDetalles[0]?.productos" :key="producto.codigo">
                  <td>{{ producto.codigo }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.cantidad }}</td>
                  <td>{{ formatCurrency(producto.precio_unitario) }}</td>
                  <td>{{ formatCurrency(producto.descuento) }}</td>
                  <td>{{ formatCurrency(producto.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resumen Financiero -->
          <div class="detalles-seccion">
            <h3>Resumen Financiero</h3>
            <p><strong>Subtotal:</strong> {{ formatCurrency(ventaDetalles[0]?.subtotal) }}</p>
            <p><strong>Descuento Total:</strong> {{ formatCurrency(ventaDetalles[0]?.descuento) }}</p>
            <p><strong>ISV:</strong> {{ formatCurrency(ventaDetalles[0]?.total_impuesto) }}</p>
            <p><strong>Total:</strong> {{ formatCurrency(ventaDetalles[0]?.total) }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button id="BtnCerrarDetalles" class="btn btn-secondary" @click="closeDetallesModal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';
import AdminVentas from '../../services/Soliadminventa';

export default {
  components: {
    PageHeader,
    ExportButton
  },
  data() {
    return {
      titulo: 'Administrar Ventas',
      searchQuery: '', 
      itemsPerPage: "", 
      startDate: '', 
      endDate: '', 
      isDetallesModalOpen: false,
      ventaDetalles: [],
      ventas: [],
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Código', dataKey: 'codigo' },
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
      if (!this.itemsPerPage) {
        return this.filteredVentas;
      }
      return this.filteredVentas.slice(0, parseInt(this.itemsPerPage));
    },

    filteredRows() {
      return this.paginatedVentas.map((venta, index) => ({
        index: index + 1,
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
      });
    },

    async loadVentas() {
      this.loading = true;
      this.error = null;
      try {
        const ventasData = await AdminVentas.obtenerVentas();
        this.ventas = ventasData;
        this.generateRows();
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        this.error = 'Error al cargar las ventas. Por favor, intente nuevamente.';
      } finally {
        this.loading = false;
      }
    },

    async showDetalles(index) {
    try {
        console.log('Mostrando detalles de venta:', this.ventas[index]); // Debug
        const idVenta = this.ventas[index].id_venta || this.ventas[index].codigo; // Usar cualquiera que esté disponible
        console.log('ID de venta a consultar:', idVenta); // Debug
        const detalleVenta = await AdminVentas.obtenerDetalleVenta(idVenta);
        
        this.ventaDetalles = [detalleVenta];
        this.isDetallesModalOpen = true;
    } catch (error) {
        console.error('Error al cargar detalles de la venta:', error);
        alert('Error al cargar los detalles de la venta. Por favor, intente nuevamente.');
    }
},

    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.ventaDetalles = [];
    },

    generateRows() {
      this.rows = this.filteredRows;
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

/* Botón de detalles */
#btnDetalles {
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
}

#btnDetalles:hover {
  background-color: #17a2b8;
  transform: scale(1.05);
  transition: all 0.3s ease;
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

.bi-eye-fill {
  font-size: 20px;
}

/* Contenedor de la tabla */
.table-container {
  display: flex;
  justify-content: center;
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

/* Botones */
.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Select personalizado */
.custom-select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ced4da;
  width: auto;
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

.date-filter button {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.date-filter button:hover {
  background-color: #0056b3;
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

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .custom-select,
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

  .date-filter button {
    width: 100%;
  }

  #btnDetalles {
    width: 40px;
    height: 35px;
    font-size: 14px;
  }

  .bi-eye-fill {
    font-size: 16px;
  }

  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .btn {
    width: 100%;
    margin: 5px 0;
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

  .btn {
    padding: 8px 16px;
    font-size: 14px;
  }

  .date-filter label {
    margin-right: 0;
    margin-bottom: 5px;
  }
}
/* =======================================================
   Modo Oscuro
======================================================= */
/* Contenedor principal */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

/* Inputs y búsqueda en modo oscuro */
.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select option {
  background-color: #2d2d2d;
  color: #fff;
}

/* Tabla en modo oscuro */
.dark .table-container {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .table thead {
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

.dark .table tr:hover {
  background-color: #383838;
}

/* Modal en modo oscuro */
.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .modal-content input,
.dark .modal-content textarea {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

/* Scroll personalizado en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Botones en modo oscuro (manteniendo los colores originales) */
.dark .button-promocion {
  background-color: #4cafaf;
  color: white;
}

.dark .button-unidad-medida {
  background-color: #4caf4c;
  color: #000;
}

.dark #btnAdd {
  background-color: #c09d62;
  color: black;
}

.dark #btnAdd:hover {
  background-color: #a38655;
}

.dark #btnEditar {
  background-color: #ffc107;
  color: black;
}

.dark #btnEditar:hover {
  background-color: #e8af06;
}

.dark #btnEliminar {
  background-color: #dc3545;
  color: black;
}

.dark #btnEliminar:hover {
  background-color: #b72433;
}

.dark .modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.dark .modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}

/* Añadir al final del <style> existente */
.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Para el modo oscuro */
.dark .loading-indicator,
.dark .no-data {
  color: #aaa;
  background-color: #2d2d2d;
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.detalles-seccion {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.detalles-seccion h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.detalles-seccion p {
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.detalles-seccion strong {
  color: #555;
  font-weight: 600;
}

.modal-footer {
  margin-top: 20px;
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.loading-indicator {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Modo Oscuro */
.dark .detalles-seccion {
  background-color: #2d2d2d;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.dark .detalles-seccion h3 {
  color: #fff;
}

.dark .detalles-seccion strong {
  color: #ddd;
}

.dark .modal-footer {
  border-top-color: #404040;
}

.dark .loading-indicator,
.dark .no-data {
  color: #aaa;
  background-color: #2d2d2d;
}


/* Añadir estilos específicos para la tabla de productos */
.productos-tabla {
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.productos-tabla .table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

.productos-tabla th,
.productos-tabla td {
  text-align: left;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
}

.productos-tabla th {
  background-color: #f8f9fa;
  font-weight: 600;
}

/* Modo oscuro para la tabla de productos */
.dark .productos-tabla th {
  background-color: #383838;
  color: #fff;
}

.dark .productos-tabla td {
  border-color: #404040;
}
</style>
<template>
  <div class="compras-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <!-- Filtros de fecha -->
      <div class="date-filter">
        <label for="start-date">Desde: </label>
        <input type="date" id="start-date" v-model="startDate" />
        <label for="end-date">Hasta: </label>
        <input type="date" id="end-date" v-model="endDate" />
      </div>

      <!-- Botones de exportación -->
      <ExportButton
        :columns="columns"
        :rows="allFilteredRows"
        fileName="Compras.pdf"
        class="export-button"
      />

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input
          class="busqueda"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar compra..."
        />
      </div>
      <select class="custom-select" v-model="searchSucursal" v-show="esCeo">
        <option
          v-for="(sucursal, index) in this.sucursales"
          :key="index"
          :value="sucursal.id_sucursal"
          @click="obtenesCompras(sucursal.id_sucursal)"
        >
          {{ sucursal.nombre_administrativo }}
        </option>
      </select>
    </div>

    <!-- Tabla exportable -->
    <div class="table-container" ref="table">
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">Cargando compras...</div>

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
            <td>
              {{
                String((currentPage - 1) * pageSize + index + 1).padStart(
                  3,
                  " "
                )
              }}
            </td>
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
                  'estado-cancelado': compra.estado === 'Cancelado',
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
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
          {{ Math.min(currentPage * pageSize, filteredCompras.length) }} de
          {{ filteredCompras.length }} registros
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
              <tr
                v-for="(producto, index) in selectedCompra?.productos"
                :key="index"
              >
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
import ExportButton from "../components/ExportButton.vue";
import solicitudes from "../../services/solicitudes.js";
const { esCeo } = require("../../services/usuariosSolicitudes");
import AdminCompras from "../../services/Soliadminventa";
import { getSucursalesbyEmmpresaSumm } from "../../services/sucursalesSolicitudes.js";
import ModalLoading from "@/components/ModalLoading.vue";
import { setPageTitle } from "@/components/pageMetadata";

export default {
  name: "AdministrarCompras",
  components: {
    PageHeader,
    ExportButton,
    ModalLoading,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      titulo: "Administrar Compras",
      searchQuery: "",
      startDate: "",
      endDate: "",
      id_usuario: "",
      esCeo: "",
      searchSucursal: "",
      sucursales: "",
      selectedCompra: null,
      isDetallesModalOpen: false,
      isLoading: false,
      compras: [],
      currentPage: 1,
      pageSize: 10,
      columns: [
        { header: "#", dataKey: "index" },
        { header: "Código", dataKey: "codigo" },
        { header: "Empleado", dataKey: "nombre" },
        { header: "Proveedor", dataKey: "proveedor" },
        { header: "Cantidad", dataKey: "cantidad" },
        { header: "Total", dataKey: "total" },
        { header: "Estado", dataKey: "estado" },
        { header: "Método de Pago", dataKey: "metodo_pago" },
        { header: "Fecha y Hora", dataKey: "fechaHora" },
      ],
      rows: [],
      loading: false,
      error: null,
    };
  },
  computed: {
    filteredCompras() {
      return this.compras.filter((compra) => {
        const compraFecha = new Date(compra.fechaHora);

        const matchesSearchQuery =
          String(compra.codigo)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          compra.nombre
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          compra.proveedor
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const matchesDateRange =
          (!this.startDate ||
            compraFecha >= new Date(this.startDate + "T00:00:00")) &&
          (!this.endDate ||
            compraFecha <= new Date(this.endDate + "T23:59:59"));

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
    allFilteredRows() {
      return this.filteredCompras.map((compra, index) => ({
        index: index + 1,
        codigo: compra.codigo,
        nombre: compra.nombre,
        proveedor: compra.proveedor,
        cantidad: compra.cantidad,
        total: this.formatCurrency(compra.total),
        estado: compra.estado,
        metodo_pago: compra.metodo_pago,
        fechaHora: this.formatDateTime(compra.fechaHora),
      }));
    },
    filteredRows() {
      return this.paginatedCompras.map((compra, index) => ({
        index: (this.currentPage - 1) * this.pageSize + index + 1, // Aquí estaba el error
        codigo: compra.codigo,
        nombre: compra.nombre,
        proveedor: compra.proveedor,
        cantidad: compra.cantidad,
        total: this.formatCurrency(compra.total),
        estado: compra.estado,
        metodo_pago: compra.metodo_pago,
        fechaHora: this.formatDateTime(compra.fechaHora),
      }));
    },
  },
  methods: {
    formatCurrency(value) {
      return `L. ${Number(value).toFixed(2)}`;
    },

    formatDateTime(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date
        .toLocaleString("es-HN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", "");
    },

    async loadCompras() {
      this.loading = true;
      this.error = null;

      this.isLoading = true;
      try {
        console.log("Iniciando carga de compras...");
        const response = await AdminCompras.obtenerCompras();
        console.log("Respuesta del servidor:", response);

        const comprasData = response.data || response;
        if (comprasData) {
          this.compras = comprasData;
          console.log("Compras procesadas:", this.compras);
          this.generateRows();
        } else {
          throw new Error("No se pudieron obtener las compras");
        }
      } catch (error) {
        console.error("No se encontraron compras para mostrar.", error);
        this.error = "No se encontraron compras para mostrar.";
        this.toast.error(this.error);
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },

    async showDetalles(compra) {
      this.isLoading = true;
      try {
        console.log("Mostrando detalles para:", compra);
        const detalles = await AdminCompras.obtenerDetalleCompra(
          compra.id_compra
        );
        this.selectedCompra = detalles;
        this.isDetallesModalOpen = true;
      } catch (error) {
        console.error("Error al obtener detalles:", error);
        this.toast.error("Error al obtener los detalles de la compra");
      } finally {
        this.isLoading = false;
      }
    },

    async obtenesCompras(id_sucursal) {
      this.isLoading = true;
      try {
        console.log("Iniciando carga de compras...");
        const response = await AdminCompras.obtenerComprasCeo(id_sucursal);
        console.log("Respuesta del servidor:", response);

        const comprasData = response.data || response;
        if (comprasData) {
          this.compras = comprasData;
          console.log("Compras procesadas:", this.compras);
          this.generateRows();
        } else {
          throw new Error("No se pudieron obtener las compras");
        }
      } catch (error) {
        console.error("No se encontraron compras para mostrar.", error);
        this.error = "No se encontraron compras para mostrar.";
        this.toast.error(this.error);
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },

    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.selectedCompra = null;
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
      this.searchQuery = "";
      this.startDate = "";
      this.endDate = "";
      this.currentPage = 1;
    },
  },
  watch: {
    paginatedCompras: {
      handler() {
        this.generateRows();
      },
      deep: true,
    },
    searchQuery() {
      this.currentPage = 1;
    },
    startDate() {
      this.currentPage = 1;
    },
    endDate() {
      this.currentPage = 1;
    },
  },
  async mounted() {
    setPageTitle("Administrar Compras");
    this.isLoading = true;
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
      this.searchSucursal = this.sucursales[0].id_sucursal;
      this.obtenesCompras(this.searchSucursal);
    } catch (error) {
      alert(error);
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
}

.compras-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

.export-button {
  margin: 0;
  z-index: 1000;
}

.opciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

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
  background-color: #20b2aa;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.btn-view:hover {
  background-color: #1a958f;
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

.estado-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  display: inline-block;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
}

.table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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

.actions-column {
  text-align: center;
  vertical-align: middle;
}

.bi-eye-fill {
  font-size: 20px;
}

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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
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

.modal-title {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.btn-close:hover {
  color: #333;
}

.detalles-info {
  padding: 24px;
  background-color: #f8f9fa;
  margin: 0;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item strong {
  color: #333;
  font-weight: 600;
}

.table-responsive {
  padding: 24px;
  overflow-x: auto;
}

.total-section {
  padding: 20px 24px;
  background-color: #f8f9fa;
  text-align: right;
  border-top: 1px solid #e0e0e0;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8f9fa;
}

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

.dark .compras-wrapper {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.dark h1,
.dark .page-header h1,
.dark .page-header .titulo {
  color: #ffffff !important;
}

.dark .busqueda,
.dark .date-filter input {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #e0e0e0;
}

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

.dark .modal-content {
  background-color: #2d2d2d;
}

.dark .modal-header,
.dark .modal-footer,
.dark .detalles-info,
.dark .total-section {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .modal-title,
.dark .info-item strong {
  color: #fff;
}

.dark .btn-close {
  color: #aaa;
}

.dark .btn-close:hover {
  color: #fff;
}

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

.dark .loading-indicator,
.dark .no-data {
  color: #b0b0b0;
  background-color: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-track {
  background: #383838;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #606060;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #707070;
}

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

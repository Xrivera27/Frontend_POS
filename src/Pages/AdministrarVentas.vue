<template>
  <div class="ventas-wrapper">
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

      <!-- Filtro de estado -->
      <div class="status-filter">
        <label for="status-select">Estado: </label>
        <select
          id="status-select"
          v-model="selectedStatus"
          class="status-select"
        >
          <option value="">Todos</option>
          <option value="Pagada">Pagadas</option>
          <option value="Cancelada">Canceladas</option>
        </select>
      </div>

      <!-- Botón de exportación PDF -->
      <ExportButton
        :columns="columns"
        :rows="allFilteredRows"
        fileName="Ventas.pdf"
        class="export-button"
      />

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input
          class="busqueda"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar venta..."
        />
      </div>
    </div>
    <select class="custom-select" v-model="searchSucursal" v-show="esCeo">
      <option
        v-for="(sucursal, index) in this.sucursales"
        :key="index"
        :value="sucursal.id_sucursal"
        @click="obtenerVentas(sucursal.id_sucursal)"
      >
        {{ sucursal.nombre_administrativo }}
      </option>
    </select>

    <!-- Tabla exportable -->
    <div class="table-container" ref="table">
      <!-- Indicador de carga -->
      <div v-if="loading" class="loading-indicator">Cargando ventas...</div>

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
            <td data-label="#">
              {{
                String((currentPage - 1) * pageSize + index + 1).padStart(
                  3,
                  " "
                )
              }}
            </td>
            <td data-label="Número Factura">{{ venta.codigo }}</td>
            <td data-label="Empleado">{{ venta.nombre }}</td>
            <td data-label="Cliente">{{ venta.cliente }}</td>
            <td data-label="Subtotal">{{ formatCurrency(venta.subtotal) }}</td>
            <td data-label="Descuento">
              {{ formatCurrency(venta.descuento) }}
            </td>
            <td data-label="Total Impuesto">
              {{ formatCurrency(venta.total_impuesto) }}
            </td>
            <td data-label="Total">{{ formatCurrency(venta.total) }}</td>
            <td data-label="Estado">
              <span
                :class="{
                  'estado-badge': true,
                  'estado-pagada': venta.estado === 'Pagada',
                  'estado-cancelada': venta.estado === 'Cancelada',
                }"
              >
                {{ venta.estado || "Pagada" }}
              </span>
            </td>
            <td data-label="Fecha y Hora">
              {{ formatDateTime(venta.fechaHora) }}
            </td>
            <td class="actions-column" data-label="Acciones">
              <button
                id="btnFactura"
                class="btn btn-primary"
                @click="showFactura(venta)"
                title="Ver Factura"
              >
                <i class="bi bi-file-text-fill"></i>
              </button>
              <button
                class="btn btn-danger"
                @click="showCancelModal(venta)"
                :title="
                  venta.estado === 'Cancelada'
                    ? 'Venta ya cancelada'
                    : 'Cancelar Venta'
                "
                :disabled="venta.estado === 'Cancelada'"
                :style="
                  venta.estado === 'Cancelada'
                    ? { opacity: '0.5', cursor: 'not-allowed' }
                    : {}
                "
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
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
          {{ Math.min(currentPage * pageSize, filteredVentas.length) }} de
          {{ filteredVentas.length }} registros
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
import ExportButton from "../components/ExportButton.vue";
import AdminFacturaModal from "../components/AdminFacturasModal.vue";
import CancelSaleModal from "../components/CancelarVentaModal.vue";
import solicitudes from "../../services/solicitudes.js";
import AdminVentas from "../../services/Soliadminventa";
import { getSucursalesbyEmmpresaSumm } from "../../services/sucursalesSolicitudes.js";
const { esCeo } = require("../../services/usuariosSolicitudes");
import { setPageTitle } from "@/components/pageMetadata";
import ModalLoading from "@/components/ModalLoading.vue";

export default {
  name: "AdministrarVentas",
  components: {
    PageHeader,
    ExportButton,
    AdminFacturaModal,
    CancelSaleModal,
    ModalLoading,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      titulo: "Administrar Ventas",
      searchQuery: "",
      startDate: "",
      endDate: "",
      id_usuario: "",
      esCeo: "",
      searchSucursal: "",
      sucursales: "",
      selectedStatus: "",
      selectedVenta: null,
      selectedVentaForCancel: null,
      isFacturaModalOpen: false,
      isCancelModalOpen: false,
      isLoading: false,
      ventas: [],
      currentPage: 1,
      pageSize: 10,
      columns: [
        { header: "#", dataKey: "index" },
        { header: "Número Factura", dataKey: "codigo" },
        { header: "Empleado", dataKey: "nombre" },
        { header: "Cliente", dataKey: "cliente" },
        { header: "Subtotal", dataKey: "subtotal" },
        { header: "Descuento", dataKey: "descuento" },
        { header: "Total Impuesto", dataKey: "total_impuesto" },
        { header: "Total", dataKey: "total" },
        { header: "Estado", dataKey: "estado" },
        { header: "Fecha y Hora", dataKey: "fechaHora" },
      ],
      rows: [],
      loading: false,
      error: null,
    };
  },
  computed: {
    filteredVentas() {
      return this.ventas.filter((venta) => {
        const ventaFecha = new Date(venta.fechaHora);

        const matchesSearchQuery =
          String(venta.codigo)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          venta.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          venta.cliente.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesDateRange =
          (!this.startDate ||
            ventaFecha >= new Date(this.startDate + "T00:00:00")) &&
          (!this.endDate || ventaFecha <= new Date(this.endDate + "T23:59:59"));

        const matchesStatus =
          !this.selectedStatus || venta.estado === this.selectedStatus;

        return matchesSearchQuery && matchesDateRange && matchesStatus;
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
    allFilteredRows() {
      return this.filteredVentas.map((venta, index) => ({
        index: index + 1,
        codigo: venta.codigo,
        nombre: venta.nombre,
        cliente: venta.cliente,
        subtotal: this.formatCurrency(venta.subtotal),
        descuento: this.formatCurrency(venta.descuento),
        total: this.formatCurrency(venta.total),
        total_impuesto: this.formatCurrency(venta.total_impuesto),
        estado: venta.estado || "Pagada",
        fechaHora: this.formatDateTime(venta.fechaHora),
      }));
    },
    filteredRows() {
      return this.paginatedVentas.map((venta, index) => ({
        index: (this.currentPage - 1) * this.pageSize + index + 1,
        codigo: venta.codigo,
        nombre: venta.nombre,
        cliente: venta.cliente,
        subtotal: this.formatCurrency(venta.subtotal),
        descuento: this.formatCurrency(venta.descuento),
        total: this.formatCurrency(venta.total),
        total_impuesto: this.formatCurrency(venta.total_impuesto),
        estado: venta.estado || "Pagada",
        fechaHora: this.formatDateTime(venta.fechaHora),
      }));
    },
  },
  methods: {
    formatCurrency(value) {
      return `L. ${Number(value).toFixed(2)}`;
    },

    formatDateTime(dateString) {
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

    async obtenerVentas(id_sucursal) {
      this.loading = true;
      this.error = null;
      try {
        console.log("Iniciando carga de ventas...");
        const response = await AdminVentas.obtenerVentasCeo(id_sucursal);
        console.log("Respuesta del servidor:", response);

        const ventasData = response.data || response;
        if (ventasData) {
          this.ventas = ventasData.map((venta) => ({
            ...venta,
            id_venta: venta.id_venta || venta.idVenta,
            id_usuario: venta.id_usuario || venta.idUsuario,
            estado: venta.estado || "Pagada",
          }));
          console.log("Ventas procesadas:", this.ventas);
          this.generateRows();
        } else {
          throw new Error("No se pudieron obtener las ventas");
        }
      } catch (error) {
        console.error("No se encontraron ventas para mostrar.", error);
        this.error = "No se encontraron ventas para mostrar.";
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async loadVentas() {
      this.loading = true;
      this.error = null;
      try {
        console.log("Iniciando carga de ventas...");
        const response = await AdminVentas.obtenerVentas();
        console.log("Respuesta del servidor:", response);

        const ventasData = response.data || response;
        if (ventasData) {
          this.ventas = ventasData.map((venta) => ({
            ...venta,
            id_venta: venta.id_venta || venta.idVenta,
            id_usuario: venta.id_usuario || venta.idUsuario,
            estado: venta.estado || "Pagada",
          }));
          console.log("Ventas procesadas:", this.ventas);
          this.generateRows();
        } else {
          throw new Error("No se pudieron obtener las ventas");
        }
      } catch (error) {
        console.error("No se encontraron ventas para mostrar.", error);
        this.error = "No se encontraron ventas para mostrar.";
        this.toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    showFactura(venta) {
      console.log("Mostrando factura para:", venta);
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
          this.toast.success("Venta cancelada exitosamente");

          try {
            const blob = await AdminVentas.obtenerReporteCancelacion(ventaId);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cancelacion_venta_${ventaId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } catch (reportError) {
            console.error("Error al descargar reporte:", reportError);
            this.toast.error("Error al generar el reporte de cancelación");
          }

          await this.loadVentas();
        } else {
          throw new Error(response.message || "Error al cancelar la venta");
        }
      } catch (error) {
        console.error("Error:", error);
        this.toast.error("Error al cancelar la venta: " + error.message);
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
      this.searchQuery = "";
      this.startDate = "";
      this.endDate = "";
      this.selectedStatus = "";
      this.currentPage = 1;
    },

    changeFavicon(iconPath) {
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = iconPath;
      document.getElementsByTagName("head")[0].appendChild(link);
    },
  },
  watch: {
    paginatedVentas: {
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
    selectedStatus() {
      this.currentPage = 1;
    },
  },
  async mounted() {
    setPageTitle("Administrar Ventas");
    this.isLoading = true;
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
      this.searchSucursal = this.sucursales[0].id_sucursal;

      this.obtenerVentas(this.searchSucursal);
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

/* Estilos globales */
* {
  font-family: "Montserrat", sans-serif;
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

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}

/* Filtro de estado */
.status-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  margin-bottom: 10px;
}

.status-select {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid #ced4da;
  font-size: 14px;
  min-width: 120px;
  cursor: pointer;
}

/* Botón de exportación */
.export-button {
  margin: 0;
  z-index: 1000;
}

/* Botones de acción */
.btn {
  font-size: 18px;
  width: 35px;
  height: 35px;
  font-size: 16px;
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
  padding: 3px 6px;
  font-size: 0.75rem;
  border-radius: 12px;
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
  font-size: 16px;
}

/* Contenedor de la tabla */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Para mejor scroll en iOS */
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* Estilos de la tabla */
.table {
  width: 100%;
  min-width: auto;
  margin-bottom: 0;
  white-space: nowrap;
}

/* Ajuste específico para la columna # */
.table th:first-child,
.table td:first-child {
  width: 40px;
  min-width: 40px;
  text-align: center;
}

/* Ajuste para la columna de Número Factura */
.table th:nth-child(2),
.table td:nth-child(2) {
  width: 110px;
  min-width: 110px;
}

/* Ajuste para columnas numéricas */
.table td {
  white-space: nowrap;
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 6px 8px;
  font-size: 0.875rem;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table th {
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

/* Ajuste para la columna de estado */
.table th:nth-child(9),
.table td:nth-child(9) {
  width: 90px;
  min-width: 90px;
}

/* Ajuste para la columna de fecha */
.table th:nth-child(10),
.table td:nth-child(10) {
  width: 120px;
  min-width: 120px;
}

/* Columnas de Empleado y Cliente */
.table th:nth-child(3),
.table th:nth-child(4),
.table td:nth-child(3),
.table td:nth-child(4) {
  width: 120px;
  min-width: 120px;
}

/* Columnas de montos */
.table th:nth-child(5),
.table th:nth-child(6),
.table th:nth-child(7),
.table th:nth-child(8),
.table td:nth-child(5),
.table td:nth-child(6),
.table td:nth-child(7),
.table td:nth-child(8) {
  width: 80px;
  min-width: 80px;
}

/* Ajuste para la columna de acciones */
.table th:last-child,
.table td:last-child {
  width: 90px;
  min-width: 90px;
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
/* Media Queries Mejoradas */

/* Pantallas grandes */
@media screen and (max-width: 1366px) {
  .table th,
  .table td {
    padding: 4px 6px;
    font-size: 0.8125rem;
  }
}

@media screen and (max-width: 1024px) {
  .table-container {
    overflow-x: auto;
  }

  .table {
    min-width: 900px;
  }
}

@media screen and (max-width: 1200px) {
  .table {
    min-width: 1000px;
  }

  .date-filter {
    gap: 8px;
  }
}

/* Tablets */
@media screen and (max-width: 768px) {
  .ventas-wrapper {
    padding: 12px;
  }

  /* Layout de opciones */
  .opciones {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  /* Filtros de fecha */
  .date-filter {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    gap: 8px;
  }

  .date-filter label {
    margin: 0;
  }

  .date-filter input {
    width: 100%;
    margin: 0;
    padding: 8px;
  }

  /* Status y búsqueda */
  .status-filter,
  .search-bar {
    width: 100%;
  }

  .status-select,
  .busqueda {
    width: 100%;
    max-width: none;
  }

  /* Botón de exportar */
  .export-button {
    width: 100%;
    padding: 10px;
    justify-content: center;
  }

  /* Select de sucursal */
  .custom-select {
    width: 100%;
    margin-bottom: 12px;
  }

  .table-container {
    margin: 10px -12px; /* Extender el scroll más allá de los bordes */
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .table {
    min-width: 700px; /* Reducir más en tablets */
  }

  /* Ajustar tamaños para tablets */
  .table th,
  .table td {
    padding: 8px 6px;
    font-size: 14px;
  }

  .actions-column {
    gap: 4px;
  }

  /* Badges de estado */
  .estado-badge {
    padding: 4px 6px;
    font-size: 12px;
  }
}

/* Móviles */
@media screen and (max-width: 480px) {
  .ventas-wrapper {
    padding: 10px;
  }

  /* Grid a una columna para filtros de fecha */
  .date-filter {
    grid-template-columns: 1fr;
  }

  /* Convertir tabla en tarjetas */
  .table {
    min-width: 650px; /* Reducir aún más en móviles */
  }

  .table-container {
    margin: 10px -10px;
  }

  /* Reducir tamaños en móvil */
  .table th:first-child,
  .table td:first-child {
    width: 40px;
    min-width: 40px;
  }

  .table th:nth-child(2),
  .table td:nth-child(2) {
    width: 100px;
    min-width: 100px;
  }

  .table thead {
    display: none;
  }

  .table tbody {
    display: block;
  }

  .table tr {
    display: block;
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }

  .table td {
    display: grid;
    grid-template-columns: 40% 60%;
    padding: 8px 4px;
    text-align: left;
    border: none;
    font-size: 14px;
    white-space: normal;
  }

  .table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #666;
  }

  /* Ajustes específicos para la vista de tarjetas */
  .actions-column {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 12px;
    margin-top: 8px;
    border-top: 1px solid #eee;
    grid-column: 1 / -1;
  }

  /* Modo oscuro para tarjetas */
  .dark .table tr {
    background: #2d2d2d;
    border-color: #404040;
  }

  .dark .table td::before {
    color: #aaa;
  }

  .dark .actions-column {
    border-top-color: #404040;
  }

  /* Botones más compactos */
  .btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
    padding: 0;
  }

  .bi-file-text-fill,
  .bi-x-circle-fill {
    font-size: 16px;
  }
}

/* Móviles pequeños */
@media screen and (max-width: 360px) {
  .table td {
    grid-template-columns: 100%;
  }

  .table td::before {
    margin-bottom: 4px;
  }

  .estado-badge {
    display: inline-block;
    margin-top: 4px;
  }

  .btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>

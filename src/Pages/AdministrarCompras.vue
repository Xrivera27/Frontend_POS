<template>
  <div class="compras-wrapper">
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

      <!-- Botón de exportación PDF -->
      <ExportButton :columns="columns" :rows="rows" fileName="Compras.pdf" class="export-button" />

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar compra..." />
      </div>
    </div>

    <!-- Tabla exportable -->
    <div class="table-container" v-pdf-export ref="table">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Codigo</th>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Descuento</th>
            <th>Total</th>
            <th>Fecha y Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(compra, index) in paginatedCompras" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ compra.codigo }}</td>
            <td>{{ compra.nombre }}</td>
            <td>{{ compra.cantidad }}</td>
            <td>{{ compra.preciounitario }}</td>
            <td>{{ compra.descuento }}</td>
            <td>{{ compra.total }}</td>
            <td>{{ compra.fechaHora }}</td>
            <td class="actions-cell">
              <button id="btnDetalles" class="btn btn-info" @click="showDetalles(index)">
                <i class="bi bi-eye-fill"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para mostrar detalles de compra -->
    <div v-if="isDetallesModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">Detalles de Compra</h2>

        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Descuento</th>
              <th>RTN Proveedor</th>
              <th>Subtotal</th>
              <th>Total</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detalle, index) in compraDetalles" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ detalle.codigo }}</td>
              <td>{{ detalle.nombre }}</td>
              <td>{{ detalle.cantidad }}</td>
              <td>{{ detalle.preciounitario }}</td>
              <td>{{ detalle.descuento }}</td>
              <td>{{ detalle.rtnProveedor }}</td>
              <td>{{ detalle.subtotal }}</td>
              <td>{{ detalle.total }}</td>
              <td>{{ detalle.fechaHora }}</td>
            </tr>
          </tbody>
        </table>

        <btnCerrarModal :texto="'Cerrar'" @click="closeDetallesModal"></btnCerrarModal>
      </div>
    </div>

  </div>
</template>

<script>
import ExportButton from '../components/ExportButton.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import PageHeader from "@/components/PageHeader.vue";

export default {
  components: {
    PageHeader,
    ExportButton,
    btnCerrarModal
  },
  data() {
    return {
      titulo: 'Administrar Compras',
      searchQuery: '',
      itemsPerPage: "",
      isDetallesModalOpen: false,
      compraDetalles: [],
      compras: [
        { codigo: '2001', nombre: 'Lápiz', cantidad: 10, preciounitario: 'L. 5.00', descuento: 'L. 1.00', total: 'L. 49.00', fechaHora: '2024-01-15 10:30' },
        { codigo: '2002', nombre: 'Cuaderno', cantidad: 5, preciounitario: 'L. 25.00', descuento: 'L. 5.00', total: 'L. 120.00', fechaHora: '2024-02-20 14:45' },
        { codigo: '2003', nombre: 'Borrador', cantidad: 20, preciounitario: 'L. 3.00', descuento: 'L. 0.50', total: 'L. 49.50', fechaHora: '2024-03-10 09:20' },
        { codigo: '2004', nombre: 'Carpeta', cantidad: 7, preciounitario: 'L. 30.00', descuento: 'L. 2.00', total: 'L. 206.00', fechaHora: '2024-04-05 16:30' },
        // Más datos de compras aquí...
      ],
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Código', dataKey: 'codigo' },
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Precio Unitario', dataKey: 'preciounitario' },
        { header: 'Descuento', dataKey: 'descuento' },
        { header: 'Total', dataKey: 'total' },
        { header: 'Fecha y Hora', dataKey: 'fechaHora' }
      ],
      rows: []
    };
  },
  computed: {
    filteredCompras() {
      return this.compras.filter(compra =>
        compra.codigo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        compra.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedCompras() {
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredCompras;
      } else {
        return this.filteredCompras.slice(0, parseInt(this.itemsPerPage));
      }
    }
  },
  methods: {
    showDetalles(index) {
      // Muestra los detalles de la compra seleccionada
      this.compraDetalles = [
        { codigo: this.compras[index].codigo, nombre: this.compras[index].nombre, cantidad: this.compras[index].cantidad, preciounitario: this.compras[index].preciounitario, descuento: this.compras[index].descuento, rtnProveedor: '98765432109876', subtotal: this.compras[index].cantidad * parseFloat(this.compras[index].preciounitario.replace('L. ', '')), total: this.compras[index].total, fechaHora: this.compras[index].fechaHora }
      ];
      this.isDetallesModalOpen = true;
    },
    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.compraDetalles = [];
    },
    generateRows() {
      // Genera las filas basadas en las compras paginadas
      this.rows = this.paginatedCompras.map((compra, index) => ({
        index: index + 1,
        codigo: compra.codigo,
        nombre: compra.nombre,
        cantidad: compra.cantidad,
        preciounitario: compra.preciounitario,
        descuento: compra.descuento,
        total: compra.total,
        fechaHora: compra.fechaHora
      }));
      console.log('Filas generadas:', this.rows);
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
    // Cuando cambie la paginación o el filtro, actualiza las filas
    paginatedCompras() {
      this.generateRows();
    }
  },
  mounted() {
    // Genera las filas al cargar el componente
    this.generateRows();
    document.title = "Administrar Compras";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

.compras-wrapper {
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
}

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

.bi-eye-fill {
  font-size: 20px;
}

.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
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
}

.table th {
  background-color: none;
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 0;
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

.custom-select {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ced4da;
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
</style>

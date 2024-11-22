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
          <tr v-for="(venta, index) in paginatedVentas" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ venta.codigo }}</td>
            <td>{{ venta.nombre }}</td>
            <td>{{ venta.cantidad }}</td>
            <td>{{ venta.preciounitario }}</td>
            <td>{{ venta.descuento }}</td>
            <td>{{ venta.total }}</td>
            <td>{{ venta.fechaHora }}</td>
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

        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Descuento</th>
              <th>RTN Cliente</th>
              <th>Subtotal</th>
              <th>Total</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(detalle, index) in ventaDetalles" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ detalle.codigo }}</td>
              <td>{{ detalle.nombre }}</td>
              <td>{{ detalle.cantidad }}</td>
              <td>{{ detalle.preciounitario }}</td>
              <td>{{ detalle.descuento }}</td>
              <td>{{ detalle.rtnCliente }}</td>
              <td>{{ detalle.subtotal }}</td>
              <td>{{ detalle.total }}</td>
              <td>{{ detalle.fechaHora }}</td>
            </tr>
          </tbody>
        </table>

        <button id="BtnCerrarDetalles" class="btn btn-secondary" @click="closeDetallesModal">Cerrar</button>
      </div>
    </div>

  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import ExportButton from '../components/ExportButton.vue';

export default {
  components: {
    PageHeader,
    ExportButton
  },
  data() {
    return {
      titulo: 'Administrar Ventas',
      searchQuery: '', // Para la búsqueda de texto
      itemsPerPage: "", // Control de paginación
      startDate: '', // Fecha de inicio para el filtro
      endDate: '', // Fecha de fin para el filtro
      isDetallesModalOpen: false, // Modal de detalles
      ventaDetalles: [], // Detalles de la venta seleccionada
      ventas: [
        { codigo: '1504', nombre: 'Mortal Kombat X', cantidad: 1, preciounitario: 'L. 450.00', descuento: 'L. 50.00', total: 'L. 400.00', fechaHora: '2017-12-11 14:30' },
        { codigo: '1505', nombre: 'Call of Duty: Modern Warfare', cantidad: 2, preciounitario: 'L. 600.00', descuento: 'L. 60.00', total: 'L. 1140.00', fechaHora: '2020-05-21 09:15' },
        { codigo: '1506', nombre: 'God of War', cantidad: 1, preciounitario: 'L. 700.00', descuento: 'L. 70.00', total: 'L. 630.00', fechaHora: '2018-04-15 11:45' },
        { codigo: '1507', nombre: 'The Last of Us Part II', cantidad: 3, preciounitario: 'L. 800.00', descuento: 'L. 80.00', total: 'L. 2240.00', fechaHora: '2020-06-19 16:20' },
        // Más datos de ventas aquí...
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
      rows: [] // Aquí se almacenarán las filas generadas para la tabla
    };
  },
  computed: {
    // Filtro de ventas basado en búsqueda y fechas
    filteredVentas() {
      return this.ventas.filter(venta => {
        const ventaFecha = new Date(venta.fechaHora); // Convierte la fecha de la venta a un objeto Date
        const matchesSearchQuery =
          venta.codigo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          venta.nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDateRange =
          (!this.startDate || ventaFecha >= new Date(this.startDate)) &&
          (!this.endDate || ventaFecha <= new Date(this.endDate));

        return matchesSearchQuery && matchesDateRange;
      });
    },
    // Paginación de ventas
    paginatedVentas() {
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredVentas; // Si no hay paginación, muestra todas las ventas filtradas
      } else {
        return this.filteredVentas.slice(0, parseInt(this.itemsPerPage)); // Limita el número de ventas según la paginación
      }
    },
    // Genera las filas que se mostrarán en la tabla
    filteredRows() {
      return this.paginatedVentas.map((venta, index) => ({
        index: index + 1,
        codigo: venta.codigo,
        nombre: venta.nombre,
        cantidad: venta.cantidad,
        preciounitario: venta.preciounitario,
        descuento: venta.descuento,
        total: venta.total,
        fechaHora: venta.fechaHora
      }));
    }
  },
  methods: {
    // Mostrar detalles de la venta seleccionada
    showDetalles(index) {
      this.ventaDetalles = [
        {
          codigo: this.ventas[index].codigo,
          nombre: this.ventas[index].nombre,
          cantidad: this.ventas[index].cantidad,
          preciounitario: this.ventas[index].preciounitario,
          descuento: this.ventas[index].descuento,
          rtnCliente: '12345678901234',
          subtotal: this.ventas[index].cantidad * parseFloat(this.ventas[index].preciounitario.replace('L. ', '')),
          total: this.ventas[index].total,
          fechaHora: this.ventas[index].fechaHora
        }
      ];
      this.isDetallesModalOpen = true;
    },
    // Cerrar el modal de detalles
    closeDetallesModal() {
      this.isDetallesModalOpen = false;
      this.ventaDetalles = [];
    },
    // Generar las filas para mostrar en la tabla
    generateRows() {
      this.rows = this.paginatedVentas.map((venta, index) => ({
        index: index + 1,
        codigo: venta.codigo,
        nombre: venta.nombre,
        cantidad: venta.cantidad,
        preciounitario: venta.preciounitario,
        descuento: venta.descuento,
        total: venta.total,
        fechaHora: venta.fechaHora
      }));
      console.log('Filas generadas:', this.rows);
    },
    // Aplicar el filtro por fechas y regenerar las filas
    applyDateFilter() {
      this.generateRows(); // Regenerar las filas después de aplicar el filtro de fechas
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
    paginatedVentas() {
      this.generateRows();
    }
  },
  mounted() {
    // Genera las filas al cargar el componente
    this.generateRows();
    document.title = "Administrar Ventas";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
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

/* Opciones */
.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2% 0;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
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
</style>

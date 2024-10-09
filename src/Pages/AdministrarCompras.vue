<template>
  <div class="encabezado">
    <h1>Administrar Compras</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="compras-wrapper">
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
       
        <btnCerrarModal :texto = "'Cerrar'" @click="closeDetallesModal"></btnCerrarModal>
      </div>
    </div>

  </div>
</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';
import ExportButton from '../components/ExportButton.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';

export default {
  components: {
    ProfileButton,
    ExportButton,
    btnCerrarModal
  },
  data() {
    return {
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
}

.encabezado {
  display: flex;
  justify-content: space-between;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2%;
  margin-top: 2%;
}

.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
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
}

.table {
  width: 100%;
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
  width: 100%;
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
}
</style>

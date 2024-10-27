<template>
  <div class="encabezado">
    <h1>Productos</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
    
  </div>
  <hr>

  <div class="productos-wrapper">
    <div class="opciones">
      <div class="action-bar">
        <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">
          Agregar Producto
        </button>
      </div>

    <!-- Botón de exportación PDF -->
    <ExportButton :columns="columns" :rows="rows" fileName="Productos.pdf" class="export-button" />

    <RouterLink
    to="promociones-producto"
    >
    <button class="button-promocion" >Promociones</button>
    </RouterLink>
    
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

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar producto..." />
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
            <th>Stock</th>
            <th>Precio Unitario</th>
            <th>Promocion Activa</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(producto, index) in paginatedProductos" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ producto.codigo_producto }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.stock_actual }}</td>
            <td>{{ producto.precio_unitario }}</td>
            <td>Inactivo</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editProducto(index)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteProducto(index)">
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- Modal para agregar o editar productos -->
     <div v-if="isModalOpen" class="modal">
    <div id="modal-producto" class="modal-content">
      <h2 class="h2-modal-content">
        {{ isEditing ? "Editar Producto" : "Agregar Producto" }}
      </h2>
      <div class="form-group">
            <label>Codigo unico del producto:</label>
            <input v-model="productoForm.codigo_producto" type="text" required />
          </div>
      <div class="contenedor-principal">
        <div class="contenedor contenedor-izquierdo">
          <div class="form-group">
            <label>Nombre Producto:</label>
            <input v-model="productoForm.nombre" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripcion:</label>
            <textarea id="textArea" v-model="productoForm.descripcion" type="text" required />
          </div>

          

          <div class="form-group">
  <label for="impuesto">Impuesto:</label>
  <select class="form-select" id="impuesto" name="impuesto" v-model="productoForm.impuesto">
    <option v-for="(impuesto, index) in cargarImpuestos()" :key="index" :value="impuesto.id">
      {{ impuesto.nombre }}
    </option>
  </select>
</div>

        </div>
        <div class="contenedor contenedor-derecho">
          <div class="form-group">
            <label>Precio por Unidad:</label>
            <input v-model="productoForm.precio_unitario" type="text" required />
          </div>

          <div class="form-group">
            <label>Precio por mayoreo:</label>
            <input v-model="productoForm.precio_mayorista" type="text" required />
          </div>

          <div class="form-group">
  <label for="impuesto">Proveedor:</label>
  <select class="form-select" id="proveedor" name="mediproveedorda" v-model="productoForm.proveedor">
    <option value="default" disabled>Selecciona un proveedor</option>
    <option v-for="(proveedor, index) in proveedoresMostrar" :key="index" :value="proveedor.id">
      {{ proveedor.nombre }}
    </option>
  </select>
</div>

          <div class="form-group">
  <label for="impuesto">Unidad de medida:</label>
  <select class="form-select" id="medida" name="medida" v-model="productoForm.unidad_medida">
    <option value="default" disabled>Selecciona una unidad de medida</option>
    <option v-for="(unidad, index) in unidadesMostrar" :key="index" :value="unidad.id_medida">
      {{ unidad.medida }}
    </option>
  </select>
</div>

        </div>
      </div>
      
      <btnGuardarModal :texto = " isEditing ? 'Guardar Cambios' : 'Agregar Producto' " @click="guardarProducto"></btnGuardarModal>
      <btnCerrarModal :texto = "'Cerrar'" @click="closeModal" ></btnCerrarModal> 
    </div>
  </div>


  </div>
</template>

<script>

//compontentes
import ProfileButton from '../components/ProfileButton.vue';
import ExportButton from '../components/ExportButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

//apis
import { getUnidadMedidaEmpresas } from'../../services/unidadMedidaSolicitud.js';
import { getProveedoresEmpresa } from'../../services/proveedoresSolicitud.js';

//solicitudes a api
import { getInfoExtra, postProducto, patchProducto, desactivarProducto } from'../../services/productosSolicitudes.js';

//recursos
const { impuestos } = require('../resources/impuestos.js');
import validarCamposService from '../../services/validarCampos.js';

export default {
  components: {
    ProfileButton,
    ExportButton,
    btnGuardarModal,
    btnCerrarModal
  },
  data() {
    return {
      searchQuery: '',
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      itemsPerPage: "",
      id_usuario: '',
      unidadesMostrar: [],
      proveedoresMostrar: [],
      productoForm: {
       codigo_producto: '',
       nombre: '',
       descripcion: '',
       unidad_medida: 'default',
       impuesto: impuestos[0]?.id || null,
       proveedor: 'default',
       precio_unitario: 0,
       precio_mayorista: 0,

      },
      productos: [
       
      ],
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Código', dataKey: 'codigo_producto' },
        { header: 'Descripción', dataKey: 'descripcion' },
        { header: 'Categoría', dataKey: 'categoria' },
        { header: 'Stock', dataKey: 'stock' },
        { header: 'Precio Unitario', dataKey: 'preciounitario' },
        { header: 'Precio Mayorista', dataKey: 'preciomayorista' },
        { header: 'Precio Descuento', dataKey: 'preciodescuento' },
        { header: 'Fecha', dataKey: 'fecha' }
      ],
      rows: []
    };
  },
  computed: {
    filteredProductos() {
      return this.productos.filter(producto =>
        producto.codigo_producto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedProductos() {
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredProductos;
      } else {
        return this.filteredProductos.slice(0, parseInt(this.itemsPerPage));
      }
    }
  },
  methods: {
   async openModal() {
      this.isModalOpen = true;
      await this.cargarUnidadMedidaProveedores();

    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    clearForm() {
      this.productoForm = {
        codigo_producto: '',
       nombre: '',
       descripcion: '',
       unidad_medida: 'default',
       impuesto: impuestos[0]?.id || null,
       proveedor: 'default',
       precio_unitario: 0,
       precio_mayorista: 0,
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    cargarImpuestos(){
      return impuestos;
    },

    async cargarUnidadMedidaProveedores(){
      this.unidadesMostrar = await getUnidadMedidaEmpresas(this.id_usuario);
      this.proveedoresMostrar = await getProveedoresEmpresa(this.id_usuario);
    },

    async guardarProducto() {
      if (!validarCamposService.validarSiNumero(this.productoForm.precio_unitario) || 
      !validarCamposService.validarSiNumero(this.productoForm.precio_mayorista)){
        alert('Campo no es un numero.');
        return;
      }
      this.productoForm.id_usuario = this.id_usuario;
      
      if (this.isEditing) {

        try {

          if (this.productoForm.codigo_producto === this.productos[this.editIndex].codigo_producto) this.productoForm.codigo_producto = '';

          const nuevoRegistro = await patchProducto(this.productoForm, this.productos[this.editIndex].id_producto);
          if (nuevoRegistro == true) {
            this.productoForm.codigo_producto = this.productos[this.editIndex].codigo_producto;
            Object.assign(this.productos[this.editIndex], this.productoForm);

          
          }
        } catch (error) {
          alert(error);
        }

      } else {

        try {
          const nuevoRegistro = await postProducto(this.productoForm);
          this.productos.push(nuevoRegistro[0]);
        } catch (error) {
          alert(error);
        }
      
      }
      this.closeModal();
    },
    async editProducto(index) {
      this.productoForm = { ...this.productos[index] };

      try {
        const infoExtra = await getInfoExtra(this.productos[index].id_producto);
        this.productoForm.impuesto  = infoExtra.impuesto;
        this.productoForm.unidad_medida  = infoExtra.id_unidad_medida;
        this.productoForm.precio_mayorista  = infoExtra.precio_mayorista;
        this.productoForm.proveedor  = infoExtra.id_proveedor;

        this.isEditing = true;
        this.editIndex = index;
        this.openModal();

      } catch (error) {
        alert(error);
      }
      
    },
    async deleteProducto(index) {
      try {
        const registroEliminado = await desactivarProducto(this.productos[index].id_producto);

        if (registroEliminado == true) this.productos.splice(index, 1);

        else {alert('Error al eliminar producto');}
        
      } catch (error) {
        console.error(error);
      }
      
    },
    generateRows() {
      // Genera las filas basadas en los productos paginados
      this.rows = this.paginatedProductos.map((producto, index) => ({
        index: index + 1,
        codigo_producto: producto.codigo_producto,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        stock: producto.stock,
        preciounitario: producto.preciounitario,
        preciomayorista: producto.preciomayorista,
        preciodescuento: producto.preciodescuento,
        fecha: producto.fecha
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
    paginatedProductos() {
      this.generateRows();
    }
  },
 async mounted() {
    // Genera las filas al cargar el componente
    this.generateRows();
    document.title = "Productos";
    this.changeFavicon('/img/spiderman.ico');
    
    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");

      this.productos = await solicitudes.fetchRegistros(`/productos/${this.id_usuario}`);

    } catch (error) {
      console.log(error); //modal error pendiente
    }// Usar la ruta correcta
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

.encabezado {
  display: flex;
  justify-content: space-between;
}

.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

/* Formularios */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group-select{
  min-width: 80%;
  display: flexbox;
  flex-direction: row;

}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
}

.button-promocion {
  background-color: #4cafaf;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.button-promocion:hover {
  background-color: #3d8d8d;
}

.export-button {
  margin: 0;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEditar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.productos-wrapper {
  padding: 16px;
}

.table-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 8px;
}

.table thead th {
  background-color: none;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.table tbody td {
  text-align: center;
  border-top: 1px solid #ddd;
}

.table thead th:first-child {
  border-top-left-radius: 10px;
}

.table thead th:last-child {
  border-top-right-radius: 10px;
}

.table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 10px;
}

.table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 10px;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.h2-modal-content {
  margin-top: 0px;
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
  max-width: 500px;
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}



.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group input, textarea {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

#textArea {
  min-height: 80px;
}

.stock-group {

  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.stock-group label {
  margin: 5px;
}

button {
  cursor: pointer;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
  /* Ajusta el ancho a 120px o el valor que prefieras */
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
  /* Ajusta el color del borde al de tu diseño */
}

.custom-select option {
  font-size: 16px;
}

.btn-export {
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  padding: 10px 20px;
  margin-right: 10px;
}

.btn-export:hover {
  background-color: #45a049;
}
</style>
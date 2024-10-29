<template>
  <div class="encabezado">
    <h1>Unidades de Inventario y venta</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="categorias-wrapper">
    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Categoría</button>

      <RouterLink to="categorias">
        <button class="button-categorias">Categorias</button>
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
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar categoría..." />
      </div>
    </div>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre unidad Inventario</th>
            <th>Productos usados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unidad, index) in paginatedUnidades" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ unidad.medida }}</td>
            <td class="totalProductos">{{  unidad.totalProductos  }}
              <button class="btn mostrar-producto" @click="mostrarModalProductos(unidad.id_medida)" >Mostrar Prod.</button>
            </td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editUnidad(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteUnidad(index)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar categorías -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Unidad' : 'Agregar Unidad' }}</h2>

        <div class="form-group">
          <label>Nombre de unidad de inventario:</label>
          <input v-model="unidadForm.medida" type="text" required>
        </div>
        <div class="contenedor-botones" >

        </div>

        <btnGuardarModal
          :texto="isEditing ? 'Guardar Cambios' : 'Agregar Unidad'"
          @click="guardarUnidad"
        ></btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>

      </div>
    </div>


<!-- Modal para mostrar productos con esa id medida -->
    <div v-if="isModalProductosOpen" class="modal">
      <div class="modal-content">
        <h2>Lista de productos</h2>
<div class="table-container table-modal-container">
  <table class="table table-modal">
          <thead>
            <tr>
              <th>Codigo de producto</th>
              <th>Nombre de producto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in mostrarProductosModal" :key="producto.codigo_producto">
              <td>{{ producto.codigo_producto }}</td>
              <td>{{ producto.nombre }}</td>
            </tr>
          </tbody>
        </table>
</div>

        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        <!-- <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button> -->
      </div>
    </div>

  </div>
</template>

<script>

//componentes
import ProfileButton from '../components/ProfileButton.vue';
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";
import { getUnidadMedidaEmpresas, postUnidad, patchUnidad, getProductosUnidad, eliminarUnidad } from "../../services/unidadMedidaSolicitud.js";


export default {
  components:
  {
    ProfileButton,
    btnGuardarModal,
    btnCerrarModal,
  },
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      itemsPerPage: "",
      id_usuario:'', // Valor por defecto para mostrar todos los registros
      unidadesMedida: [],
      mostrarProductos: [],
      isModalOpen: false,
      isModalProductosOpen: false, // Estado para controlar si el modal está abierto o cerrado
      isEditing: false, // Estado para verificar si estamos editando una categoría
      unidadForm: { medida: '' }, // Objeto para el formulario de categorías
    };
  },

  async mounted() {
    document.title = "Presentaciones";
    this.changeFavicon('/img/spiderman.ico');
    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");
      console.log(`Id de usuario ${this.id_usuario}`);

      this.unidadesMedida = await getUnidadMedidaEmpresas(this.id_usuario);

    } catch (error) {
      console.log(error); //modal error pendiente
    }
  },
  computed: {
    filteredUnidades() {
      // Filtra las categorías basados en el texto de búsqueda
      return this.unidadesMedida.filter(unidad =>
      unidad.medida.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedUnidades() {
      // Si itemsPerPage es 0, mostramos todos los registros, de lo contrario aplicamos la paginación
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredUnidades
        : this.filteredUnidades.slice(0, this.itemsPerPage);
    },
    mostrarProductosModal(){
      return this.mostrarProductos;
    },
  },
  methods: {
    openModal() {
      // Resetea el formulario y abre el modal
      this.isModalOpen = true;
      this.isEditing = false;
      this.unidadForm = { medida: '', descripcion: '' }; // Resetea el formulario
    },
    closeModal() {
      // Cierra el modal
      this.isModalOpen = false;
      this.isModalProductosOpen = false;
    },
    editUnidad(index) {
      // Implementa la lógica para editar una categoría
      this.isModalOpen = true;
      this.isEditing = true;
      this.unidadForm = { ...this.unidadesMedida[index] };
      this.editIndex = index;
    },

    async mostrarModalProductos(id_medida){
      try {
        this.mostrarProductos = await getProductosUnidad(id_medida);
        console.log(this.mostrarProductos);
        this.isModalProductosOpen = true;
      } catch (error) {
        console.log(error);
      }
    },

    async deleteUnidad(index) {

      if (this.unidadesMedida[index].totalProductos > 0){
        alert('No se puede eliminar por que hay productos usando esta unidad.');
        return;
      }
      
      try {
        const response = await eliminarUnidad(this.unidadesMedida[index].id_medida);

        if (response.success === false){
          throw response.message;
        }

        if (response === true){
          this.unidadesMedida.splice(index, 1);
        }

      } catch (error) {
        alert(`Ocurrio un error ${error}`)
      }
    
    },
    
    async guardarUnidad() {

      this.unidadForm.id_usuario = this.id_usuario;
      if (this.isEditing) {
        try {

const nuevoRegistro = await patchUnidad(this.unidadForm, this.unidadesMedida[this.editIndex].id_medida);
if (nuevoRegistro == true) {

  Object.assign(this.unidadesMedida[this.editIndex], this.unidadForm);

}
} catch (error) {
alert(error);
}
      } else {

        try {
          const nuevoRegistro = await postUnidad(this.unidadForm);
          this.unidadesMedida.push(nuevoRegistro[0]);
        } catch (error) {
          alert(error);
        }
      
      }
      this.closeModal();
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },

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

.categorias-wrapper {
  padding: 16px;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-categorias {
  background-color: #4caf4c;
  color: #000;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.btn {
  padding: 8px 10px;
  margin: 4px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.mostrar-producto{
  background-color: #2b8cf3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
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

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEditar,
#btnEliminar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar {
  background-color: #ffc107;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#AddUnidadModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
}

#AddUnidadModal {
  background-color: #007bff;
  color: #fff;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
  color: #fff;
}

.export-button {
  margin: 0;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 400px;
  min-height: 250px;
  width: 100%;
}

/* Formulario */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
}

.form-group input,
.descriptionForm {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.descriptionForm {
  resize: vertical;
}

/* Estilos para textarea */
textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #a38655;
  box-shadow: 0 0 5px rgba(163, 134, 85, 0.5);
}

/* Estilos generales */
.container-top {
  width: 100%;
  text-align: right;
}

.rol {
  color: #969696;
  font-size: 14px;
}

select,
.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  margin: 10px 5px;
}

.custom-select {
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
}

.custom-select option {
  font-size: 16px;
}

/* Barra de búsqueda */
.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
}

/* Tabla */
.table-container {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}
.table-modal-container{
  max-height: 400px;
  overflow-y: scroll;
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
</style>

<template>
  <div class="categorias-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Categoría</button>

      <RouterLink to="promociones-categorias">
        <button class="button-promocion">Promociones</button>
      </RouterLink>

      <RouterLink to="unidad-medida">
        <button class="button-unidad-medida">U. Medida</button>
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
            <th class="col-id">#</th>
            <th class="col-nombre">Nombre</th>
            <th class="col-descripcion">Descripción</th>
            <th class="col-productos-usados">Productos Usados</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(categoria, index) in paginatedCategorias" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ categoria.nombre_categoria }}</td>
            <td>{{ categoria.descripcion }}</td>
            <td>{{ categoria.totalProd }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editCategoria(categoria)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteCategoria(categoria)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar esta categoría?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="deleteCategoria()">
            Sí, eliminar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar categorías -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="categoriaForm.nombre_categoria" type="text" required>
        </div>

        <!-- Campo de descripción estilizado como textarea -->
        <div class="form-group">
          <label>Descripción:</label>
          <textarea v-model="categoriaForm.descripcion" class="descriptionForm" required rows="4"></textarea>
        </div>

        <div class="contenedor-botones">
          <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Categoría'" @click="guardarCategoria">
          </btnGuardarModal>
          <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
//componentes
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import validarCamposService from '../../services/validarCampos.js';
import { notificaciones } from '../../services/notificaciones.js';
import { useToast } from "vue-toastification";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

const { deleteCategoria } = require('../../services/categoriaSolicitudes');

export default {
  components:
  {
    btnGuardarModal,
    btnCerrarModal,
    PageHeader
  },
  data() {
    return {
      titulo: 'Categorías',
      showConfirmModal: false, // Agregar esto
      categoriaToDelete: null,
      searchQuery: '', // Almacena el texto de búsqueda
      itemsPerPage: "",
      id_usuario: '', // Valor por defecto para mostrar todos los registros
      categorias: [
      ],
      isModalOpen: false, // Estado para controlar si el modal está abierto o cerrado
      isEditing: false, // Estado para verificar si estamos editando una categoría
      categoriaForm: { nombre_categoria: '', descripcion: '' }, // Objeto para el formulario de categorías
    };
  },

  async mounted() {
    document.title = "Categorías";
    this.changeFavicon('/img/spiderman.ico');


    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();


      this.categorias = await solicitudes.fetchRegistros(
        `/categoria-producto/${this.id_usuario}`
      );

    } catch (error) {
      console.log(error); //modal error pendiente
    }


  },
  computed: {
    filteredCategorias() {
      // Filtra las categorías basados en el texto de búsqueda
      return this.categorias.filter(categoria =>
        categoria.nombre_categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedCategorias() {
      // Si itemsPerPage es 0, mostramos todos los registros, de lo contrario aplicamos la paginación
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredCategorias
        : this.filteredCategorias.slice(0, this.itemsPerPage);
    }
  },
  methods: {
    validarCampos(categoriaForm) {
      const campos = {
        Nombre: categoriaForm.nombre_categoria,
        Descripcion: categoriaForm.descripcion,
      };

      if (!validarCamposService.validarEmpty(campos)) {
        return false;
      }

      return true;
    },

    openModal() {
      // Resetea el formulario y abre el modal
      this.isModalOpen = true;
      this.isEditing = false;
      this.categoriaForm = { nombre_categoria: '', descripcion: '' }; // Resetea el formulario
    },
    closeModal() {
      // Cierra el modal
      this.isModalOpen = false;
    },
    editCategoria(categoria) {
      // Implementa la lógica para editar una categoría
      this.isModalOpen = true;
      this.isEditing = true;
      this.categoriaForm = { ...categoria };
      this.editIndex = this.categorias.findIndex(item => item.id_categoria === categoria.id_categoria);
    },

    async deleteCategoria(categoria) {
      if (!this.showConfirmModal) {
        // Si hay productos, mostrar error directamente sin modal de confirmación
        if (categoria.totalProd > 0) {
          const toast = useToast();
          toast.error('Productos existentes dentro de esta categoría');
          return;
        }
        // Si no hay productos, mostrar modal de confirmación
        this.categoriaToDelete = categoria;
        this.showConfirmModal = true;
        return;
      }

      try {
        const response = await deleteCategoria(this.categoriaToDelete.id_categoria);

        if (response == true) {
          this.categorias = this.categorias.filter(
            item => item.id_categoria !== this.categoriaToDelete.id_categoria
          );
          notificaciones('success', 'Categoría eliminada correctamente');
        }
      } catch (error) {
        notificaciones('error', new Error(error).message);
      } finally {
        this.showConfirmModal = false;
        this.categoriaToDelete = null;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.categoriaToDelete = null;
    },

    async guardarCategoria() {
      if (!this.validarCampos(this.categoriaForm)) {
        return;
      }
      validarCamposService.formSuccess();

      let response;
      let parametros;
      this.categoriaForm.id_usuario = this.id_usuario;
      if (this.isEditing) {
        try {

          parametros = `/categoria-producto/actualizar-categoria/${this.categorias[this.editIndex].id_categoria
            }`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.categoriaForm
          );


          if (response == true) {

            Object.assign(this.categorias[this.editIndex], this.categoriaForm);
          } else notificaciones('error', response.message);
        } catch (error) {
          notificaciones('error', error.message);
        }
      } else {
        parametros = `/categoria-producto/crear-categoria`;
        try {
          response = await solicitudes.postRegistro(
            parametros,
            this.categoriaForm
          );

          if (response.length > 0) {

            this.categorias.push(response[0]);

          } else {
            throw response;
          }
        } catch (error) {
          notificaciones('error', error.message);
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
  box-sizing: border-box;
}

.categorias-wrapper {
  padding: 16px;
}


.button-promocion {
  background-color: #4cafaf;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.button-unidad-medida {
  background-color: #4caf4c;
  color: #000;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

/* Opciones y búsqueda */
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

.registros {
  height: 100%;
  padding-bottom: 1%;
  flex-grow: 1;
  min-width: 200px;
}

/* Botones */
#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: auto;
  min-width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
  white-space: nowrap;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.export-button {
  margin: 0;
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
  color: black;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  color: black;
  background-color: #dc3545;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#AddClienteModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-right: 1rem;
}

#AddClienteModal {
  background-color: #007bff;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
}

.col-id {
  width: 10%;
}

.col-nombre {
  width: 10%;
}

.col-descripcion {
  width: 45%;
}

.col-productos-usados {
  width: 20%;
}

.col-acciones {
  width: 15%;
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

.modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  margin: 20px;
}

.h2-modal-content {
  margin-top: 0px;
}

/* Tabla */
.clientes-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

.table-container {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 16px;
  height: auto;
  max-height: 480px;
  overflow-x: auto;
  overflow-y: auto;
}

.table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 8px;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
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

/* Formulario */
.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  display: flex;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

#form-tel {
  width: 100%;
  max-width: 300px;
}

/* Selección personalizada */
.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
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

/* Estilos generales */
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.rol {
  color: #969696;
  font-size: 14px;
}

#campana {
  margin-right: 10px;
  font-size: 18px;
  color: #a38655;
}

.container-top {
  width: 100%;
  text-align: right;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .registros,
  #btnAdd,
  .export-button {
    width: 100%;
    margin: 8px 0;
  }

  .custom-select {
    width: 100%;
    max-width: none;
  }

  #btnEditar,
  #btnEliminar {
    width: 40px;
    height: 35px;
    font-size: 14px;
    padding: 8px;
  }

  .table-container {
    margin-top: 24px;
  }
}

@media screen and (max-width: 480px) {

  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .table thead th,
  .table tbody td {
    padding: 6px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .h2-modal-content {
    font-size: 20px;
  }

  #form-tel {
    max-width: 100%;
  }

  .busqueda {
    max-width: 100%;
  }
}

/* Estilo para scroll personalizado */
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

<template>
  <div class="categorias-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button v-if="esCeo" id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Categoría</button>

      <RouterLink to="promociones-categorias">
        <button class="button-promocion">Promociones</button>
      </RouterLink>

      <RouterLink to="unidad-medida">
        <button class="button-unidad-medida">U. Medida</button>
      </RouterLink>

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
            <th v-if="esCeo" class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(categoria, index) in paginatedCategorias" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ categoria.nombre_categoria }}</td>
            <td>{{ categoria.descripcion }}</td>
            <td>{{ categoria.totalProd }}</td>
            <td v-if="esCeo">
              <button id="btnEditar" class="btn btn-warning" @click="editCategoria(categoria)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteCategoria(categoria)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->

      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize,
            filteredCategorias.length) }} de {{ filteredCategorias.length }} registros
        </div>
        <div class="pagination-container">
          <button class="pagination-button" :disabled="currentPage === 1" @click="previousPage">
            Anterior
          </button>

          <button class="pagination-button" :disabled="currentPage === totalPages" @click="nextPage">
            Siguiente
          </button>
        </div>
      </div>
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

        <div class="form-group">
          <label>Descripción:</label>
          <textarea v-model="categoriaForm.descripcion" class="descriptionForm" required rows="4"></textarea>
        </div>

        <div class="contenedor-botones">
          <btnGuardarModal id="btnAggC" :texto="isEditing ? 'Guardar Cambios' : 'Agregar Categoría'"
            @click="guardarCategoria">
          </btnGuardarModal>
          <btnCerrarModal id="btnCerrarM" :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import { validacionesCategorias } from '../../services/validarCampos.js';
import { notis } from '../../services/notificaciones.js';
import { useToast } from "vue-toastification";
import solicitudes from "../../services/solicitudes.js";
const { deleteCategoria } = require('../../services/categoriaSolicitudes');
const { esCeo } = require('../../services/usuariosSolicitudes');

export default {
  components: {
    btnGuardarModal,
    btnCerrarModal,
    PageHeader
  },
  data() {
    return {
      titulo: 'Categorías',
      showConfirmModal: false,
      categoriaToDelete: null,
      searchQuery: '',
      currentPage: 1,
      pageSize: 10,
      id_usuario: '',
      categorias: [],
      isModalOpen: false,
      isEditing: false,
      editIndex: -1,
      esCeo: false,
      categoriaForm: {
        nombre_categoria: '',
        descripcion: ''
      },
    };
  },
  computed: {
    filteredCategorias() {
      return this.categorias.filter(categoria =>
        categoria.nombre_categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedCategorias() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredCategorias.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredCategorias.length / this.pageSize);
    },
    pages() {
      const pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {

    openModal() {
      this.isModalOpen = true;
      this.isEditing = false;
      this.categoriaForm = { nombre_categoria: '', descripcion: '' };
    },
    closeModal() {
      this.isModalOpen = false;
    },
    editCategoria(categoria) {
      this.isModalOpen = true;
      this.isEditing = true;
      this.categoriaForm = { ...categoria };
      this.editIndex = this.categorias.findIndex(item => item.id_categoria === categoria.id_categoria);
    },
    async deleteCategoria(categoria) {
      if (!this.showConfirmModal) {
        if (categoria.totalProd > 0) {
          const toast = useToast();
          toast.error('Productos existentes dentro de esta categoría');
          return;
        }
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
          notis('success', 'Categoría eliminada correctamente');
        }
      } catch (error) {
        notis('error', new Error(error).message);
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
      try {
        console.log("Iniciando guardado de categoría");
        console.log("Form antes de validar:", this.categoriaForm);

        if (!validacionesCategorias.validarCampos(this.categoriaForm)) {
          console.log("Falló la validación");
          return false;
        }

        console.log("Pasó validación");

        let response;
        let parametros;
        this.categoriaForm.id_usuario = this.id_usuario;

        if (this.isEditing) {
          parametros = `/categoria-producto/actualizar-categoria/${this.categorias[this.editIndex].id_categoria}`;
          console.log("Actualizando categoría:", parametros);
          response = await solicitudes.patchRegistro(parametros, this.categoriaForm);

          if (response === true) {
            Object.assign(this.categorias[this.editIndex], this.categoriaForm);
            notis("success", "Actualizando datos...");
            this.closeModal();
          } else {
            throw new Error(response.message || 'Error al actualizar la categoría');
          }
        } else {
          parametros = `/categoria-producto/crear-categoria`;
          console.log("Creando nueva categoría");
          response = await solicitudes.postRegistro(parametros, this.categoriaForm);

          if (response && response.length > 0) {
            this.categorias.push(response[0]);
            notis("success", "Procesando guardado...");
            this.closeModal();
          } else {
            throw new Error('Error al crear la categoría');
          }
        }
      } catch (error) {
        console.error("Error en guardarCategoria:", error);
        notis('error', error.message);
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
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
  async mounted() {
    document.title = "Categorías";
    this.changeFavicon('/img/spiderman.ico');

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.categorias = await solicitudes.fetchRegistros(
        `/categoria-producto/${this.id_usuario}`
      );
      this.esCeo = await esCeo(this.id_usuario);
      
    } catch (error) {
      console.log(error);
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
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

/* Botones */
#btnAggC {
  background-color: #a38655;
  border-radius: 8px;
  color: black;
}

#btnCerrarM {
  margin-left: 13.8rem;
  border-radius: 8px;
}

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
.table-container {
  width: 100%;
  margin-top: 16px;
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

/* Formulario */
.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.descriptionForm {
  width: 100%; /* Fijar el ancho a 300px, ajusta según tus necesidades */
  max-height: 150px; /* Limitar la altura a 150px */
  overflow-y: auto; /* Habilitar el scroll vertical si es necesario */
  resize: none; /* Evitar que el usuario cambie el tamaño manualmente */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  #btnAdd {
    width: 100%;
    margin: 8px 0;
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

  .busqueda {
    max-width: 100%;
  }
}

/* Modo Oscuro */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
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

/* Botones en modo oscuro */
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

/* Paginación */
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

/* Paginación en modo oscuro */
.dark .pagination-wrapper {
  border-top-color: #404040;
}

.dark .pagination-info {
  color: #adb5bd;
}

.dark .pagination-button {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #383838;
}

.dark .pagination-button.active {
  background-color: #17a2b8;
}

/* Media Queries para la paginación */
@media screen and (max-width: 768px) {
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
  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
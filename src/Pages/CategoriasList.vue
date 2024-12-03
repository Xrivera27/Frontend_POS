<template>
  <div class="categorias-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button v-if="esCeo" id="btnAdd" class="btn btn-primary" @click="openModal"
        style="width: 200px; white-space: nowrap;">Agregar
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

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando categorias...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedCategorias.length === 0" class="no-data">
        No se encontraron categorias para mostrar.
      </div>


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

    <!-- Modal de confirmación -->
    <div class="modal" v-if="showConfirmModal">
      <div class="modal-confirm">
        <div class="modal-header">
          <h2>Confirmación</h2>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que quieres eliminar esta categoría?</p>
        </div>

        <div class="modal-footer">
          <btnGuardarModal :texto="'Si, eliminar'" style="background-color: red;" @click="deleteCategoria()">
          </btnGuardarModal>
          <btnCerrarModal :texto="'No, regresar'" @click="cancelDelete"></btnCerrarModal>
        </div>
      </div>
    </div>


    <!-- Modal para agregar o editar categorías -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-categoria">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>
        </div>

        <div class="modal-body">
          <div class="form-row full-width">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="categoriaForm.nombre_categoria" type="text"
                placeholder="Ingrese el nombre de la categoría" required>
            </div>
          </div>

          <div class="form-row full-width">
            <div class="form-group">
              <label>Descripción:</label>
              <textarea v-model="categoriaForm.descripcion" placeholder="Ingrese la descripción de la categoría"
                required></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Categoría'" @click="guardarCategoria">
            </btnGuardarModal>
            <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
          </div>
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
import ModalLoading from '@/components/ModalLoading.vue';

export default {
  components: {
    btnGuardarModal,
    btnCerrarModal,
    PageHeader,
    ModalLoading
  },
  data() {
    return {
      titulo: 'Categorías',
      showConfirmModal: false,
      isLoading: false,
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
        this.isLoading = true;
        if (categoria.totalProd > 0) {
          const toast = useToast();
          this.isLoading = false;
          toast.error('Productos existentes dentro de esta categoría');
          return;
        }
        this.isLoading = false;
        this.categoriaToDelete = categoria;
        this.showConfirmModal = true;
        return;
      }

      this.isLoading = true;

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
        this.isLoading = false;
      }
    },
    cancelDelete() {
      this.showConfirmModal = false;
      this.categoriaToDelete = null;
    },

    async guardarCategoria() {
      this.isLoading = true;
      try {
        console.log("Iniciando guardado de categoría");
        console.log("Form antes de validar:", this.categoriaForm);

        if (!validacionesCategorias.validarCampos(this.categoriaForm)) {
          console.log("Falló la validación");
          this.isLoading = false;
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
            notis("success", "Actualizando datos de la categoría...");
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
            notis("success", "Categoría guardada correctamente");
            this.closeModal();
          } else {
            throw new Error('Error al crear la categoría');
          }
        }
      } catch (error) {
        console.error("Error en guardarCategoria:", error);
        notis('error', error.message);
      } finally {
        this.isLoading = false;
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
    this.isLoading = true;
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
    } finally {
      this.isLoading = false;
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
  width: 100%;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.button-promocion {
  background-color: #4cafaf;
  color: black;
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
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  margin-bottom: 20px;
}

.busqueda {
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 350px;
  transition: border-color 0.2s ease;
}

.busqueda:focus {
  outline: none;
  border-color: #a38655;
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
  transform: scale(1.02);
}

#btnEditar,
#btnEliminar {
  width: 36px;
  height: 36px;
  padding: 0;
  margin: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 18px;
}

#btnEditar {
  background-color: #fbbf24;
  color: #000;
}

#btnEditar:hover {
  background-color: #f59e0b;
  transform: translateY(-1px);
}

#btnEliminar {
  background-color: #ef4444;
  color: white;
}

#btnEliminar:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

/* Modal */
.modal {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
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

.modal-categoria {
  background: white;
  border-radius: 12px;
  width: 50%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
  overflow: hidden;
}

.modal-confirm {
  background: white;
  border-radius: 12px;
  width: 25%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

/* Form Layout */
.form-row {
  margin-bottom: 20px;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
}


.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

/* Footer */
.modal-footer {
  justify-content: center;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* Dark Mode */
.dark .modal-categoria {
  background-color: #2d2d2d;
}

.dark .modal-confirm {
  background-color: #2d2d2d;
}

.dark .modal-header,
.dark .modal-footer {
  background-color: #1e1e1e;
  border-color: #404040;
}

.dark .modal-header h2 {
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

.dark .form-group input,
.dark .form-group textarea,
.dark .form-group select {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}


.h2-modal-content {
  margin-top: 0px;
}

/* Tabla */
.table-container {
  width: 100%;
  border-radius: 0;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
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

.table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
}

.table tbody tr:hover {
  background-color: #f8fafc;
  transition: background-color 0.2s ease;
}

.col-id {
  width: 10%;
}

.col-nombre {
  width: 20%;
}

.col-descripcion {
  width: 45%;
}

.col-productos-usados {
  width: 15%;
}

.col-acciones {
  width: 10%;
}

/* Formulario */
.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.descriptionForm {
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  resize: none;
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

/* Paginación */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background-color: white;
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
}

.pagination-container {
  display: flex;
  gap: 8px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #475569;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.dark .table-container {
  background-color: #1e1e1e;
  border-color: #374151;
}

.dark .table {
  background-color: #1e1e1e;
}

.dark .table thead {
  background-color: #111827;
}

.dark .table th {
  background-color: #111827;
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table td {
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table tbody tr:hover {
  background-color: #1f2937;
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

.dark .pagination-wrapper {
  background-color: #1e1e1e;
  border-color: #374151;
}

.dark .pagination-button {
  background-color: #1e1e1e;
  border-color: #374151;
  color: #e5e7eb;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #374151;
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
    max-width: none;
    min-width: 0;
  }

  #btnEditar,
  #btnEliminar {
    width: 32px;
    height: 32px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .pagination-container {
    justify-content: center;
  }

  .form-columns {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}

@media screen and (max-width: 480px) {
  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .table th,
  .table td {
    padding: 8px;
    font-size: 14px;
  }

  .pagination-button {
    padding: 6px 12px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .h2-modal-content {
    font-size: 20px;
  }
}

/* Estilos para la paginación */
.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}
</style>
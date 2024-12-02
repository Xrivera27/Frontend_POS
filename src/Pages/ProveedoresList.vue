<template>
  <div class="proveedores-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button v-if="esCeo" id="btnAdd" class="btn btn-primary" @click="openModal"
        style="width: 200px; white-space: nowrap;">
        Agregar Proveedor
      </button>

      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar proveedor..." />
      </div>
    </div>

    <div class="table-container">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando proveedores...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedProveedores.length === 0" class="no-data">
        No se encontraron proveedores para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th class="col-id">#</th>
            <th class="col-nombre">Nombre</th>
            <th class="col-telefono">Teléfono</th>
            <th class="col-email">Email</th>
            <th class="col-direccion">Dirección</th>
            <th v-if="esCeo" class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(proveedor, index) in paginatedProveedores" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ proveedor.nombre }}</td>
            <td>{{ proveedor.telefono }}</td>
            <td>{{ proveedor.correo }}</td>
            <td>{{ proveedor.direccion }}</td>
            <td v-if="esCeo">
              <button id="btnEditar" class="btn btn-warning" @click="editProveedor(proveedor)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteProveedor(proveedor)">
                <i class="bi bi-x-lg"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ paginatedProveedores.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }} a
          {{ Math.min(currentPage * pageSize, filteredProveedores.length) }}
          de {{ filteredProveedores.length }} registros
        </div>
        <div class="pagination-container">
          <button class="pagination-button" :disabled="currentPage === 1" @click="previousPage">
            Anterior
          </button>
          <button class="pagination-button" :disabled="currentPage === totalPages || totalPages === 0"
            @click="nextPage">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar este proveedor?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="deleteProveedor()">
            Sí, eliminar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar proveedores -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Proveedor' : 'Agregar Proveedor' }}</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="proveedorForm.nombre" type="text" required>
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <div class="phone-input-container">
            <select v-model="selectedCountry" @change="updatePhoneValidation" class="select-phone">
              <option value="">País</option>
              <option v-for="(country, code) in countryData" :key="code" :value="code">
                {{ country.emoji }} {{ country.code }}
              </option>
            </select>
            <input v-model="proveedorForm.telefono" type="text" class="input-phone"
              :placeholder="'Número (' + phoneLength + ' dígitos)'" required />
          </div>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="proveedorForm.correo" type="text" required>
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="proveedorForm.direccion" type="text" required>
        </div>

        <btnGuardarModal id="btnAggProv" :texto="isEditing ? 'Guardar Cambios' : 'Agregar Proveedor'"
          @click="guardarProveedor">
        </btnGuardarModal>
        <btnCerrarModal id="btnCerrarM" :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import { notis } from '../../services/notificaciones.js';
const { esCeo } = require('../../services/usuariosSolicitudes');
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesProveedores } from '../../services/validarCampos.js';
import solicitudes from "../../services/solicitudes.js";
import ModalLoading from '@/components/ModalLoading.vue';

export default {
  name: 'AdministrarProveedores',
  components: {
    PageHeader,
    btnGuardarModal,
    btnCerrarModal,
    ModalLoading
  },
  data() {
    return {
      titulo: 'Proveedores',
      isLoading: false,
      showConfirmModal: false,
      proveedorToDelete: null,
      searchQuery: '',
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      id_usuario: 0,
      currentPage: 1,
      pageSize: 10,
      esCeo: false,
      selectedCountry: 'HN',
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      proveedorForm: {
        nombre: '',
        telefono: '',
        correo: '',
        direccion: '',
      },
      proveedores: []
    };
  },

  computed: {
    filteredProveedores() {
      return this.proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        proveedor.telefono.includes(this.searchQuery)
      );
    },

    paginatedProveedores() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredProveedores.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredProveedores.length / this.pageSize);
    }
  },

  methods: {
    updatePhoneValidation() {
      if (this.selectedCountry && this.countryData[this.selectedCountry]) {
        this.phoneLength = this.countryData[this.selectedCountry].length;
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

    async loadProveedores() {
      this.isLoading = true;
      try {
        this.proveedores = await solicitudes.fetchRegistros(
          `/proveedores/${this.id_usuario}`
        );
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.isLoading = false;
      }
    },

    openModal() {
      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },

    clearForm() {
      this.proveedorForm = {
        nombre: '',
        telefono: '',
        correo: '',
        direccion: '',
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    async guardarProveedor() {
      if (!validacionesProveedores.validarCampos(this.proveedorForm, this.selectedCountry)) {
        return;
      }

      this.isLoading = true;

      this.proveedorForm.id_usuario = this.id_usuario;
      let response;
      let parametros;

      if (this.isEditing) {
        try {
          parametros = `/proveedores/actualizar-proveedor/${this.proveedores[this.editIndex].id}`;
          response = await solicitudes.patchRegistro(parametros, this.proveedorForm);

          if (response === true) {
            this.isLoading = false;
            notis('success', "Actualizando datos del proveedor...");
            Object.assign(this.proveedores[this.editIndex], this.proveedorForm);
          } else {
            notis('error', response.message);
          }
        } catch (error) {
          notis('error', error.message);
        } finally {
          this.isLoading = false;
        }
      } else {
        try {
          parametros = `/proveedores/crear-proveedor/${this.id_usuario}`;
          response = await solicitudes.postRegistro(parametros, this.proveedorForm);

          if (response.length > 0) {
            this.isLoading = false;
            notis('success', "Proveedor guardado correctamente...");
            this.proveedores.push(response[0]);
          } else {
            throw response;
          }
        } catch (error) {
          notis('error', error.message);
        } finally {
          this.isLoading = false;
        }
      }
      this.closeModal();
    },

    editProveedor(proveedor) {
      this.proveedorForm = { ...proveedor };
      this.isEditing = true;
      this.editIndex = this.proveedores.findIndex(item => item.id === proveedor.id);
      this.openModal();
    },

    async deleteProveedor(proveedor) {
      if (!this.showConfirmModal) {
        this.proveedorToDelete = proveedor;
        this.showConfirmModal = true;
        return;
      }
      this.isLoading = true;
      
      try {
        const datosActualizados = {
          estado: false,
          id_usuario: this.id_usuario
        };

        const parametros = `/proveedores/desactivar-proveedor/${this.proveedorToDelete.id}`;
        const response = await solicitudes.desactivarRegistro(parametros, datosActualizados);

        if (response === true) {
          this.proveedores = this.proveedores.filter(item => item.id !== this.proveedorToDelete.id);
          notis('success', 'Proveedor eliminado correctamente');
        }
      } catch (error) {
        notis('error', 'Error al eliminar el proveedor');
      } finally {
        this.showConfirmModal = false;
        this.proveedorToDelete = null;
        this.isLoading = false;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.proveedorToDelete = null;
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
    searchQuery() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    this.isLoading = true;
    document.title = "Proveedores";
    this.changeFavicon('/img/spiderman.ico');

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      await this.loadProveedores();
      this.esCeo = await esCeo(this.id_usuario);
    } catch (error) {
      notis('error', error.message);
    } finally {
      this.isLoading = false;
    }
  }
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Fuentes */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
}

/* Opciones */
.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.registros {
  height: 100%;
  padding-bottom: 1%;
  flex-grow: 1;
  min-width: 200px;
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

/* Botones */

#btnAggProv {
  background-color: #a38655;
  border-radius: 8px;
}

#btnCerrarM {
  border-radius: 8px;
  margin-left: 13.4rem;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 200px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
  transition: all 0.3s ease;
  white-space: nowrap;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
}

/* Botón de edición */
#btnEditar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
}

/* Botón de eliminación */
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
}

/* Estilo de la búsqueda */
.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

/* Selección */
select {
  border: 1px solid #ccc;
  margin: 10px 5px;
  width: 60px;
  height: 35px;
  border-radius: 5px;
}

/* Contenedor de proveedores */
.proveedores-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

/* Contenedor de tabla */
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

/* Estilo de la tabla */
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
  text-align: center;
}

.table thead th {
  border-bottom: 1px solid #ddd;
}

.table tbody td {
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

.col-id {
  width: 10%;
}

.col-nombre {
  width: 10%;
}

.col-telefono {
  width: 10%;
}

.col-email {
  width: 15%;
}

.col-direccion {
  width: 40%;
}

.col-acciones {
  width: 15%;
}

/* Botones generales */
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
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

/* Estilo de formulario */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
  display: flex;
}

.form-group input {
  width: 100%;
  height: 35px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.phone-input-container {
  display: flex;
  gap: 8px;
}

.phone-input-container select {
  width: 110px;
  margin: 0;
  /* Importante: sin márgenes */
  height: 35px;
  padding: 0 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.phone-input-container input {
  flex: 1;
  height: 35px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}


/* Estilos para modo oscuro */
.dark .country-code-select,
.dark .phone-input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}


/* Otros estilos */
.h2-modal-content {
  margin-top: 0px;
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

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .registros,
  #btnAdd {
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

/* Agregar estos estilos en la sección <style> */

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

/* Agregar estos estilos al modo oscuro existente */
.dark .pagination-wrapper {
  border-color: #404040;
}

.dark .pagination-info {
  color: #aaa;
}

.dark .pagination-button {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #383838;
}

/* Media Queries */
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

/* Estilos para la paginación */
.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}


</style>
<template>
  <div class="clientes-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Clientes</button>

      <ExportButton :columns="columns" :rows="rows" fileName="Clientes.pdf" class="export-button" />

      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar cliente..." />
      </div>
    </div>

    <div class="table-container">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando clientes...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedClientes.length === 0" class="no-data">
        No se encontraron clientes para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>RTN</th>
            <th v-if="esCeo">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in paginatedClientes" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ cliente.nombre_completo }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.direccion }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.rtn }}</td>
            <td v-if="esCeo">
              <button id="btnEditar" class="btn btn-warning" @click="editCliente(cliente)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteCliente(cliente)">
                <i class="bi bi-x-lg"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
          {{ Math.min(currentPage * pageSize, filteredClientes.length) }}
          de {{ filteredClientes.length }} registros
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
      <div class="modal-confirm">
        <div class="modal-header">
          <h2>Confirmación</h2>
        </div>
        <div class="modal-body-confirm">
          <p>¿Estás seguro de que quieres eliminar este cliente?</p>
        </div>
        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal texto="Sí, eliminar" style="background-color: red;" @click="deleteCliente()" />
            <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
          </div>
        </div>
      </div>
    </div>


    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="h2-modal-content">{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h2>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="clienteForm.nombre_completo" type="text" required>
          </div>

          <div class="form-group">
            <label>Correo:</label>
            <input v-model="clienteForm.correo" type="email" required>
          </div>

          <div class="form-group">
            <label>Dirección:</label>
            <input v-model="clienteForm.direccion" type="text" required>
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
              <input v-model="clienteForm.telefono" type="text" class="input-phone"
                :placeholder="'Número (' + phoneLength + ' dígitos)'" required />
            </div>
          </div>

          <div class="form-group">
            <label>RTN:</label>
            <input v-model="clienteForm.rtn" type="text" maxlength="14" required>
          </div>
        </div>

        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Cliente'" @click="guardarCliente">
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
import ExportButton from '../components/ExportButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import solicitudes from "../../services/solicitudes";
import { validacionesClientes } from '../../services/validarCampos.js';
import { notis } from '../../services/notificaciones.js';
const { getClientesbyEmpresa, postCliente, patchCliente, desactivarCliente } = require('../../services/clienteSolicitudes.js');
const { esCeo } = require('../../services/usuariosSolicitudes');
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import ModalLoading from '@/components/ModalLoading.vue';
import { setPageTitle } from '@/components/pageMetadata';

export default {
  components: {
    ExportButton,
    btnGuardarModal,
    btnCerrarModal,
    PageHeader,
    ModalLoading
  },
  data() {
    return {
      titulo: 'Clientes',
      isLoading: false,
      showConfirmModal: false,
      clienteToDelete: null,
      searchQuery: '',
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      id_usuario: 0,
      esCeo: false,
      selectedCountry: 'HN',
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      currentPage: 1,
      pageSize: 10,
      clienteForm: {
        id: null,
        nombre_completo: '',
        correo: '',
        direccion: '',
        telefono: '',
        rtn: ''
      },
      clientes: []
    };
  },
  async mounted() {
    this.isLoading = true;
    setPageTitle('Clientes');
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.clientes = await getClientesbyEmpresa(this.id_usuario);
      this.esCeo = await esCeo(this.id_usuario);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  },
  computed: {
    filteredClientes() {
      return this.clientes.filter(cliente =>
        cliente.nombre_completo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cliente.telefono.includes(this.searchQuery)
      );
    },
    paginatedClientes() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredClientes.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredClientes.length / this.pageSize);
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

    openModal() {
      this.isModalOpen = true;
    },

    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },

    clearForm() {
      this.clienteForm = {
        id: null,
        nombre_completo: '',
        correo: '',
        direccion: '',
        telefono: '',
        rtn: ''
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    async guardarCliente() {
      if (!validacionesClientes.validarCampos(this.clienteForm, this.selectedCountry)) {
        return;
      }
      this.isLoading = true;

      this.clienteForm.id_usuario = this.id_usuario;
      let response;

      if (this.isEditing) {
        const nuevoRegistro = await patchCliente(this.clienteForm, this.clientes[this.editIndex].id_cliente);
        if (nuevoRegistro == true) {
          this.isLoading = false;
          notis('success', 'Actualizado datos del cliente...');
          Object.assign(this.clientes[this.editIndex], this.clienteForm);
        }
      } else {
        try {
          response = await postCliente(this.clienteForm, this.id_usuario);
          if (response.length > 0) {
            this.isLoading = false;
            notis('success', 'Cliente guardado correctamente');
            this.clientes.push(response[0]);
          } else {
            throw new Error('Error al crear el cliente.');
          }
        } catch (error) {
          console.log(error);
        }
      }
      this.closeModal();
    },

    editCliente(cliente) {
      this.clienteForm = { ...cliente };
      this.isEditing = true;
      this.editIndex = this.clientes.findIndex(item => item.id_cliente === cliente.id_cliente);
      this.openModal();
    },

    async deleteCliente(cliente) {
      if (!this.showConfirmModal) {
        this.clienteToDelete = cliente;
        this.showConfirmModal = true;
        return;
      }

      this.isLoading = true;
      try {
        const response = await desactivarCliente(this.clienteToDelete.id_cliente);
        if (response === true) {
          this.clientes = this.clientes.filter(item => item.id_cliente !== this.clienteToDelete.id_cliente);
          this.isLoading = false;
          notis('success', 'Cliente eliminado correctamente');
        } else {
          throw response;
        }
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.showConfirmModal = false;
        this.clienteToDelete = null;
        this.isLoading = false;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.clienteToDelete = null;
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
  }
};
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Fuente global */
* {
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
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

#btnAggCli {
  background-color: #a38655;
  border-radius: 8px;
}

#btnCerrarM {
  margin-left: 14rem;
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

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
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

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-body-confirm {
  padding: 24px;
  overflow-y: auto;
  background-color: white
}

.dark .modal-body-confirm {
  background-color: #333;
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

.modal-body {
  margin-top: 15px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  z-index: 0;
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

/* Agregar estos estilos en la sección de estilos */
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

/* Actualizar los Media Queries existentes */
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

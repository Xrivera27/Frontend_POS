<template>
  <div class="sucursales-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button
        id="btnAdd"
        class="btn btn-primary"
        @click="openModal"
        style="width: 200px; white-space: nowrap"
      >
        Agregar sucursales
      </button>
      <ExportButton
        :columns="columns"
        :rows="rows"
        fileName="Sucursales.pdf"
        class="export-button"
      />
      <div class="search-bar">
        <input
          class="busqueda"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar sucursal..."
        />
      </div>
    </div>

    <div class="table-container">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando sucursales...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedSucursales.length === 0" class="no-data">
        No se encontraron sucursales para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th class="col-id">#</th>
            <th class="col-nombre">Nombre</th>
            <th class="col-correo">Correo</th>
            <th class="col-telefono">Telefono</th>
            <th class="col-direccion">Direccion</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sucursal, index) in paginatedSucursales" :key="index">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ sucursal.nombre_administrativo }}</td>
            <td>{{ sucursal.correo }}</td>
            <td>{{ sucursal.telefono }}</td>
            <td>{{ sucursal.direccion }}</td>
            <td>
              <button
                id="btnEditar"
                class="btn btn-warning"
                @click="editSucursal(sucursal)"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button
                id="btnEliminar"
                class="btn btn-danger"
                @click="deleteSucursal(sucursal)"
              >
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
          {{ Math.min(currentPage * pageSize, filteredSucursales.length) }} de
          {{ filteredSucursales.length }} registros
        </div>
        <div class="pagination-container">
          <button
            class="pagination-button"
            :disabled="currentPage === 1"
            @click="previousPage"
          >
            Anterior
          </button>

          <button
            class="pagination-button"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar Sucursales -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-sucursales">
        <div class="modal-header">
          <h2 class="h2-modal-content">
            {{ isEditing ? "Editar Sucursal" : "Agregar Sucursal" }}
          </h2>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nombre:</label>
            <input
              ref="nombreInput"
              v-model="sucursalForm.nombre_administrativo"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Correo:</label>
            <input v-model="sucursalForm.correo" type="text" required />
          </div>

          <div class="form-group">
            <label>Teléfono:</label>
            <div class="phone-input-container">
              <select
                v-model="selectedCountry"
                @change="updatePhoneValidation"
                class="select-phone"
              >
                <option value="">País</option>
                <option
                  v-for="(country, code) in countryData"
                  :key="code"
                  :value="code"
                >
                  {{ country.emoji }} {{ country.code }}
                </option>
              </select>
              <input
                v-model="sucursalForm.telefono"
                type="text"
                class="input-phone"
                :placeholder="'Número (' + phoneLength + ' dígitos)'"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Dirección:</label>
            <input v-model="sucursalForm.direccion" type="text" required />
          </div>
        </div>

        <div class="modal-footer">
          <btnGuardarModal
            :texto="isEditing ? 'Guardar Cambios' : 'Agregar Sucursal'"
            @click="guardarSucursal"
          >
          </btnGuardarModal>
          <btnCerrarModal
            :texto="'Cerrar'"
            @click="closeModal"
          ></btnCerrarModal>
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
          <p>¿Estás seguro de que quieres eliminar esta sucursal?</p>
        </div>
        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal
              texto="Sí, eliminar"
              style="background-color: red"
              @click="deleteSucursal"
            />
            <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExportButton from "../components/ExportButton.vue";
import ModalLoading from "@/components/ModalLoading.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import { notis } from "../../services/notificaciones.js";
import PageHeader from "@/components/PageHeader.vue";
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesSucursal } from "../../services/validarCampos.js";
import solicitudes from "../../services/solicitudes.js";
import { setPageTitle } from "@/components/pageMetadata";

export default {
  components: {
    ExportButton,
    btnGuardarModal,
    btnCerrarModal,
    PageHeader,
    ModalLoading,
  },
  data() {
    return {
      titulo: "Administración de Sucursales",
      id_usuario: 1,
      id_empresa: 11,
      searchQuery: "",
      isModalOpen: false,
      isEditing: false,
      isLoading: false,
      editIndex: null,
      selectedCountry: "HN",
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      sucursalToDelete: null,

      sucursalForm: {
        id_sucursal: 0,
        nombre_administrativo: "",
        correo: "",
        telefono: "",
        direccion: "",
      },
      sucursales: [],
      columns: [
        { header: "#", dataKey: "index" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Correo", dataKey: "correo" },
        { header: "Direccion", dataKey: "direccion" },
        { header: "Teléfono", dataKey: "telefono" },
      ],
      rows: [],
    };
  },
  computed: {
    filteredSucursales() {
      return this.sucursales.filter(
        (sucursal) =>
          sucursal.nombre_administrativo
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          sucursal.direccion
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedSucursales() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredSucursales.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredSucursales.length / this.pageSize);
    },
  },
  methods: {
    updatePhoneValidation() {
      if (this.selectedCountry && this.countryData[this.selectedCountry]) {
        this.phoneLength = this.countryData[this.selectedCountry].length;
      }
    },

    closeModal() {
      this.isModalOpen = false;
      this.isEditing = false;
      this.selectedCountry = "HN";
      this.sucursalForm = {
        id_sucursal: 0,
        nombre_administrativo: "",
        correo: "",
        telefono: "",
        direccion: "",
      };
    },

    openModal() {
      this.isModalOpen = true;
      this.$nextTick(() => {
        this.$refs.nombreInput?.focus();
      });
    },

    async guardarSucursal() {
      this.isLoading = true;
      try {
        if (
          !validacionesSucursal.validarCampos(
            this.sucursalForm,
            this.selectedCountry
          )
        ) {
          return;
        }

        let response;
        let parametros;

        if (this.isEditing) {
          parametros = `/sucursales/actualizar-sucursal/${
            this.sucursales[this.editIndex].id_sucursal
          }`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.sucursalForm
          );

          if (response === true) {
            Object.assign(this.sucursales[this.editIndex], this.sucursalForm);
            notis("success", "Actualizando datos de sucursal...");
          } else {
            throw new Error(
              response.message || "Error al actualizar la sucursal"
            );
          }
        } else {
          parametros = `/sucursales/crear-sucursal/${this.id_usuario}`;
          response = await solicitudes.postRegistro(
            parametros,
            this.sucursalForm
          );

          if (response && response.length > 0) {
            this.sucursales.push(response[0]);
            notis("success", "Sucursal creada correctamente");
          } else {
            throw new Error("Error al crear la sucursal");
          }
        }

        this.closeModal();
        this.generateRows();
      } catch (error) {
        this.isLoading = false;
        notis("error", "Error");
      } finally {
        this.isLoading = false;
      }
    },

    editSucursal(sucursal) {
      this.isModalOpen = true;
      this.isEditing = true;
      this.editIndex = this.sucursales.findIndex(
        (item) => item.id_sucursal === sucursal.id_sucursal
      );
      this.sucursalForm = { ...sucursal };
      this.$nextTick(() => {
        this.$refs.nombreInput?.focus();
      });
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.sucursalToDelete = null;
    },

    async deleteSucursal(sucursal) {
      if (!this.showConfirmModal) {
        this.sucursalToDelete = sucursal;
        this.showConfirmModal = true;
        return;
      }

      this.isLoading = true;
      try {
        const parametros = `/sucursales/desactivar-sucursal/${this.sucursalToDelete.id_sucursal}`;
        const response = await solicitudes.desactivarRegistro(parametros, {
          estado: false,
        });

        if (response === true) {
          this.sucursales = this.sucursales.filter(
            (item) => item.id_sucursal !== this.sucursalToDelete.id_sucursal
          );
          this.generateRows();
          notis("success", "Sucursal eliminada correctamente");
          this.showConfirmModal = false;
          this.sucursalToDelete = null;
        } else {
          throw new Error("Error al eliminar la sucursal");
        }
      } catch (error) {
        notis("error", "Error al eliminar la sucursal");
      } finally {
        this.isLoading = false;
      }
    },

    generateRows() {
      this.rows = this.paginatedSucursales.map((sucursal, index) => ({
        index: index + 1,
        nombre: sucursal.nombre_administrativo,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        correo: sucursal.correo,
      }));
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
      const link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = iconPath;
      document.getElementsByTagName("head")[0].appendChild(link);
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    paginatedSucursales: {
      handler() {
        this.generateRows();
      },
      deep: true,
    },
  },
  async mounted() {
    this.isLoading = true;
    setPageTitle("Sucursales");
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.sucursales = await solicitudes.fetchRegistros(
        `/sucursales/empresa/${this.id_usuario}`
      );
      this.generateRows();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #c09d62;
  box-shadow: 0 0 0 3px rgba(192, 157, 98, 0.2);
  transition: all 0.3s ease;
}

.registros {
  height: 100%;
  padding-bottom: 1%;
  flex-grow: 1;
  min-width: 200px;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
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

.export-button {
  margin: 0;
}

.h2-modal-content {
  margin-top: 0;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
}

#btnEditar,
#btnEliminar {
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
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
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

.rol {
  color: #969696;
  font-size: 14px;
}

.col-id {
  width: 5%;
}

.col-nombre {
  width: 10%;
}

.col-correo {
  width: 10%;
}

.col-telefono {
  width: 5%;
}

.col-direccion {
  width: 20%;
}

.col-acciones {
  width: 15%;
}

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 10px 5px 0 5px;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
}

.sucursales-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

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

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

#AddSucursalModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-right: 1rem;
}

#AddSucursalModal {
  background-color: #007bff;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
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
  padding: 1rem;
}

.modal-sucursales {
  background: white;
  border-radius: 12px;
  width: 35%;
  max-width: 1000px;
  max-height: 90vh;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
  overflow: hidden;
}

.dark .modal-sucursales {
  background-color: #2d2d2d;
}

.modal-confirm {
  background: white;
  border-radius: 12px;
  width: 35%;
  max-width: 400px;
  min-width: 300px;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 20px;
}

.dark .modal-confirm {
  background-color: #2d2d2d;
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

/* Custom scrollbar */
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

  #AddSucursalModal,
  #BtnCerrar {
    width: 100%;
    margin: 8px 0;
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

  #btnAdd {
    font-size: 14px;
    height: 35px;
  }

  .rol {
    text-align: center;
    margin-top: 8px;
  }
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

/* Nueva paginación */
.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.no-data {
  background-color: #f8f9fa;
  border-radius: 4px;
}

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

/* Dark mode para la paginación */
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

.dark .loading-indicator,
.dark .no-data {
  color: #aaa;
  background-color: #2d2d2d;
}
</style>

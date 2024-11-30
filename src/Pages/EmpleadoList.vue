<template>
  <div class="empleados-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">
        Agregar Usuario
      </button>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar empleado..." />
      </div>

      <div class="registros">
        <span>
          <select class="custom-select" v-model="searchSucursal">
            <option value="default" selected>Todas</option>
            <option v-for="(sucursal, index) in this.sucursales" :key="index" :value="sucursal.id_sucursal">
              {{ sucursal.nombre_administrativo }}</option>
          </select>
        </span>
      </div>
    </div>

    <div class="table-container">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando empleados...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedEmpleados.length === 0" class="no-data">
        No se encontraron empleados para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Nombre Usuario</th>
            <th>Telefono</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(empleado, index) in paginatedEmpleados" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.apellido }}</td>
            <td>{{ empleado.nombre_usuario }}</td>
            <td>{{ empleado.telefono }}</td>
            <td>{{ empleado.correo }}</td>
            <td>{{ getRol(empleado.id_rol) }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editEmpleado(empleado)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteUsuariol(empleado)">
                <i class="bi bi-x-lg"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize, filteredEmpleados.length) }} de {{ filteredEmpleados.length }} registros
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
        <p>¿Estás seguro de que quieres eliminar este usuario?</p>
        <div class="modal-actions">{}
          <button class="btn modalShowConfirm-Si" @click="deleteUsuariol(empleado)">
            Sí, eliminar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar empleados -->
    <div v-if="isModalOpen" class="modal">
      <div id="modal-usuario" class="modal-content">
        <h2 class="h2-modal-content">
          {{ isEditing ? "Editar Usuario" : "Agregar Usuario" }}
        </h2>

        <div class="contenedor-principal">
          <div class="contenedor contenedor-izquierdo">
            <div class="form-group">
              <label>Nombre:</label>
              <input v-model="usuarioForm.nombre" type="text" required />
            </div>

            <div class="form-group">
              <label>Apellido:</label>
              <input v-model="usuarioForm.apellido" type="text" required />
            </div>

            <div class="form-group">
              <label>Nombre de Usuario:</label>
              <input v-model="usuarioForm.nombre_usuario" type="text" required />
            </div>
            <div class="form-group">
              <label>Correo:</label>
              <input v-model="usuarioForm.correo" type="text" required />
            </div>

            <div class="form-group">
              <label for="rol">Selecciona rol:</label>
              <select class="form-select" id="rol" name="rol" v-model="usuarioForm.rol" required>
                <option value="default" disabled selected>Selecciona un rol</option>
                <option v-for="(rol, index) in roles" :key="index" :value="rol.id_rol">{{ rol.cargo }}</option>
              </select>
            </div>
          </div>
          <div class="contenedor contenedor-derecho">
            <div class="form-group">
              <label>
                <span class="info-icon" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">ℹ️</span>
                Contraseña:
              </label>
              <input v-model="usuarioForm.password" type="text" required :disabled="!isPassEdit" />
              <div v-if="showTooltip" class="tooltip">
                La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un
                número y un símbolo.
              </div>
            </div>
            <div class="form-group">
              <label>Confirmar contraseña:</label>
              <input v-model="usuarioForm.confirmPassword" type="text" required :disabled="!isPassEdit" />
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
                <input v-model="usuarioForm.telefono" type="text" class="input-phone"
                  :placeholder="'Número (' + phoneLength + ' dígitos)'" required />
              </div>
            </div>

            <div class="form-group">
              <label>Direccion:</label>
              <input v-model="usuarioForm.direccion" type="text" required />
            </div>

            <div class="form-group">
              <label for="sucursal">Selecciona sucursal:</label>
              <select class="form-select" id="sucursal" name="sucursal" value="default" v-model="usuarioForm.sucursal"
                required>
                <option value="" disabled selected>Selecciona una sucursal</option>
                <option v-for="(sucursal, index) in sucursales" :key="index" :value="sucursal.id_sucursal">
                  {{ sucursal.nombre_administrativo }}</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <btnGuardarModal id="btnGuardarM" :texto="isEditing ? 'Guardar Cambios' : 'Agregar Usuario'"
            @click="guardarUsuario" type="submit">
          </btnGuardarModal>

          <button class="btn editar-password" :disabled="!isEditing" @click="editarPassword">Editar Contraseña</button>

          <btnCerrarModal id="btnCerrarM" :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import solicitudes from "../../services/solicitudes.js";
import { notis } from '../../services/notificaciones.js';
const { esCeo } = require('../../services/usuariosSolicitudes');
import PageHeader from "@/components/PageHeader.vue";
import { getSucursalesbyEmmpresaSumm } from '../../services/sucursalesSolicitudes.js';
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesUsuario } from '../../services/validarCampos.js';

export default {
  name: 'AdministrarEmpleados',
  components: {
    btnGuardarModal,
    btnCerrarModal,
    PageHeader
  },
  data() {
    return {
      showConfirmModal: false,
      empleadoToDelete: null,
      titulo: 'Usuarios',
      isLoading: false,
      showTooltip: false,
      searchQuery: '',
      searchSucursal: 'default',
      id_usuario: 0,
      isModalOpen: false,
      isEditing: false,
      isPassEdit: true,
      showPassword: false,
      selectedCountry: 'HN',
      countryData: COUNTRY_CODES,
      phoneLength: 8,
      editIndex: null,
      currentPage: 1,
      pageSize: 10,
      sucursales: [],
      esCeo: false,
      roles: [],
      usuarioForm: {
        id_usuario: 0,
        nombre: '',
        apellido: '',
        nombre_usuario: '',
        correo: '',
        telefono: '',
        direccion: '',
        sucursal: '',
        password: '',
        confirmPassword: '',
        rol: ''
      },
      empleados: []
    };
  },

  computed: {
    filteredEmpleados() {
      return this.empleados
        .filter(empleado => empleado.sucursales == this.searchSucursal || this.searchSucursal === 'default')
        .filter(empleado =>
          empleado.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          empleado.apellido.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          empleado.nombre_usuario.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    },

    paginatedEmpleados() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredEmpleados.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredEmpleados.length / this.pageSize);
    }
  },

  methods: {
    updatePhoneValidation() {
      if (this.selectedCountry && this.countryData[this.selectedCountry]) {
        this.phoneLength = this.countryData[this.selectedCountry].length;
      }
    },

    async loadEmpleados() {
      this.isLoading = true;
      try {
        const id_usuario = await solicitudes.solicitarUsuarioToken();
        this.empleados = await solicitudes.fetchRegistros(`/usuarios/getBy-empresa/${id_usuario}`);
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
      this.usuarioForm = {
        id_usuario: '',
        nombre: '',
        apellido: '',
        nombre_usuario: '',
        correo: '',
        telefono: '',
        direccion: '',
        sucursal: '',
        password: '',
        confirmPassword: '',
        rol: ''
      };
      this.isEditing = false;
      this.editIndex = null;
      this.isPassEdit = true;
    },

    getRol(id_rol) {
      const rol = this.roles.find(rol => rol.id_rol === id_rol);
      return rol ? rol.cargo : 'Desconocido';
    },

    editarPassword() {
      this.isPassEdit = true;
    },

    async guardarUsuario() {
      if (!validacionesUsuario.validarCampos(this.usuarioForm, this.isPassEdit, this.selectedCountry)) {
        return;
      }

      let response;
      let parametros;

      try {
        if (this.isEditing) {
          parametros = `/usuario/actualizar/${this.empleados[this.editIndex].id_usuario}`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response == true) {
            notis('success', "Actualizando datos del usuario...")
            Object.assign(this.empleados[this.editIndex], this.usuarioForm);
          } else {
            notis('error', response);
          }
        } else {
          parametros = `/usuario/crear`;
          response = await solicitudes.postRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response.length > 0) {
            notis('success', "Usuario guardado correctamente...")
            this.empleados.push(response[0]);
          } else {
            throw response;
          }
        }
        this.closeModal();
      } catch (error) {
        notis('error', error.message);
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

    async deleteUsuariol(empleado) {
      if (!this.showConfirmModal) {
        this.empleadoToDelete = empleado;
        this.showConfirmModal = true;
        return;
      }

      try {
        const parametros = `/usuario/desactivar/${this.empleadoToDelete.id_usuario}`;
        const response = await solicitudes.desactivarRegistro(
          parametros,
          { estado: false }
        );

        if (response === true) {
          const index = this.empleados.findIndex(e => e.id_usuario === this.empleadoToDelete.id_usuario);
          if (index !== -1) {
            this.empleados.splice(index, 1);
          }
          notis('success', 'Usuario eliminado correctamente');
        }
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.showConfirmModal = false;
        this.empleadoToDelete = null;
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.empleadoToDelete = null;
    },

    editEmpleado(empleado) {
      this.editIndex = this.empleados.findIndex(item => item.id_usuario === empleado.id_usuario);
      this.usuarioForm = { ...empleado };
      this.usuarioForm.sucursal = empleado.sucursales;
      this.usuarioForm.rol = empleado.id_rol;
      this.isEditing = true;
      this.isPassEdit = false;
      this.openModal();
    },

    limpiarForm(formulario) {
      return {
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        nombre_usuario: formulario.nombre_usuario,
        correo: formulario.correo,
        telefono: formulario.telefono,
        direccion: formulario.direccion,
        id_sucursal: formulario.sucursal,
        contraseña: formulario.password,
        id_rol: formulario.rol,
      };
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    searchSucursal() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    document.title = "Usuarios";
    this.changeFavicon('/img/spiderman.ico');
    await this.loadEmpleados();

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
      this.empleados = await solicitudes.fetchRegistros(`/usuarios/getBy-empresa/${this.id_usuario}`);
      this.roles = await solicitudes.fetchRegistros('/roles');
    } catch (error) {
      notis('error', error.message);
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

.info-icon {
  cursor: pointer;
  margin-right: 5px;
  vertical-align: middle;
  position: relative;
}

.tooltip {
  display: inline-block;
  position: absolute;
  left: 20px;
  top: 0;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  z-index: 1000;
  width: 250px;
  margin-top: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

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
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  margin: 20px;
}

#modal-usuario {
  max-width: 60%;
  min-width: 500px;
  justify-content: center;
  align-items: center;
}

.h2-modal-content {
  margin-top: 0;
}

#AddUsuarioModal,
#BtnCerrar {
  width: 80%;
}

.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

.form-group {
  margin-bottom: 16px;
  position: relative;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group-select {
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

.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

.btn {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-success {
  min-height: 80px;
  max-width: 90px;
}

.btn-primary {
  background-color: #a38655;
  color: black;
}

.btn-primary:hover {
  background-color: #a38655;
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

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 350px;
}

.registros {
  display: flexbox;
  height: 100%;
  align-items: end;
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

.export-button {
  margin: 0;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnCerrarM {
  margin-left: 28rem;
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

.empleados-wrapper {
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

/* Estilos para la paginación */
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

/* Personalización del scroll */
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

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px;
  background-color: #fff;
  cursor: pointer;
  width: 60%;
  min-width: 400px;
}

/* Estilos del teléfono */
.phone-input-container {
  display: flex;
  gap: 8px;
}

.phone-input-container select {
  width: 110px;
  margin: 0;
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

/* Media Queries */
@media screen and (max-width: 768px) {
  .contenedor-principal {
    flex-direction: column;
  }

  .contenedor {
    width: 100%;
    margin-bottom: 20px;
  }

  #modal-usuario {
    min-width: 90%;
    max-width: 95%;
  }

  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  .custom-select,
  #btnAdd,
  .export-button {
    width: 100%;
    max-width: none;
    min-width: 0;
    margin: 8px 0;
  }

  #btnEditar,
  #btnEliminar {
    width: 40px;
    height: 35px;
    font-size: 14px;
    padding: 8px;
  }

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

  .form-group input,
  .password-wrapper input {
    width: 100%;
  }
}

/* Modo Oscuro */
.dark .empleados-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

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

.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .form-group input,
.dark .form-group select {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

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

.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}
</style>
<template>
  <div class="empleados-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">
        Agregar Usuario
      </button>

      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar empleado..." />
      </div>

      <div class="registros" v-if="sucursales.length > 1">
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
      <div v-if="isLoading" class="loading-indicator">
        Cargando empleados...
      </div>

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
            <th>Teléfono</th>
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

      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize,
            filteredEmpleados.length) }} de {{ filteredEmpleados.length }} registros
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
          <p>¿Estás seguro de que quieres eliminar este usuario?</p>
        </div>
        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal texto="Sí, eliminar" style="background-color: red;" @click="deleteUsuariol(empleado)" />
            <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="modal">
      <div class="modal-usuario">
        <div class="modal-header">
          <h2 class="h2-modal-content">
            {{ isEditing ? "Editar Usuario" : "Agregar Usuario" }}
          </h2>
        </div>

        <div class="modal-body">
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
              <select class="form-select" id="rol" name="rol" value="default" v-model="usuarioForm.rol" required>
                <option value="" disabled selected>Selecciona un rol</option>
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
              <div class="password-wrapper">
                <input v-model="usuarioForm.password" :type="showPassword ? 'text' : 'password'" required
                  :disabled="!isPassEdit" />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" :disabled="!isPassEdit">
                  <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                </button>
              </div>
              <div v-if="showTooltip" class="tooltip">
                La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una letra minúscula, un
                número y un símbolo.
              </div>
            </div>

            <div class="form-group">
              <label>Confirmar contraseña:</label>
              <div class="password-wrapper">
                <input v-model="usuarioForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required
                  :disabled="!isPassEdit" />
                <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="!isPassEdit">
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                </button>
              </div>
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
              <label>Dirección:</label>
              <input v-model="usuarioForm.direccion" type="text" required />
            </div>

            <div class="form-group" v-if="sucursales.length > 1">
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
        <div class="modal-footer">
          <div class="action-buttons">
            <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Usuario'" @click="guardarUsuario"
              type="submit">
            </btnGuardarModal>
            <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
          </div>
          <button class="btn editar-password" :disabled="!isEditing" @click="editarPassword">Editar
            Contraseña</button>
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
const { esCeo, getUsuariosEmpresa, getRolesUsuarioPage, getUsuariosSucrusal } = require('../../services/usuariosSolicitudes');
import PageHeader from "@/components/PageHeader.vue";
import { getSucursalesbyEmmpresaSumm } from '../../services/sucursalesSolicitudes.js';
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesUsuario } from '../../services/validarCampos.js';
import ModalLoading from '@/components/ModalLoading.vue';
import { setPageTitle } from '@/components/pageMetadata';

export default {
  name: 'AdministrarEmpleados',
  components: {
    btnGuardarModal,
    btnCerrarModal,
    PageHeader,
    ModalLoading
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
      showConfirmPassword: false,
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
      this.showPassword = false;
      this.showConfirmPassword = false;
    },
    getRol(id_rol) {
      const rol = this.roles.find(rol => rol.id_rol === id_rol);
      return rol ? rol.cargo : 'Desconocido';
    },
    async getUsuarios(sucursales) {
      try {
        if (sucursales.length === 1) {
          this.empleados = await getUsuariosSucrusal(this.id_usuario, sucursales[0].id_sucursal);
          this.searchSucursal = sucursales[0].id_sucursal;
          this.usuarioForm.sucursal = sucursales[0].id_sucursal;
        } else {
          this.empleados = await getUsuariosEmpresa(this.id_usuario);
        }
      } catch (error) {
        notis('error', 'Error al obtener usuarios.');
      }
    },
    editarPassword() {
      this.isPassEdit = true;
    },
    async guardarUsuario() {
      if (!(await validacionesUsuario.validarCampos(
        this.usuarioForm,
        this.isPassEdit,
        this.selectedCountry,
        this.isEditing
      ))) {
        return;
      }

      this.isLoading = true;

      try {
        let response;
        let parametros;

        if (this.isEditing) {
          parametros = `/usuario/actualizar/${this.empleados[this.editIndex].id_usuario}`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response === true) {
            notis('success', "Actualizando datos del usuario...");
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
            notis('success', "Usuario guardado correctamente...");
            this.empleados.push(response[0]);
          } else {
            throw response;
          }
        }
        
        this.closeModal();
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.isLoading = false;
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

      this.isLoading = true;
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
        this.isLoading = false;
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
    this.isLoading = true;
    setPageTitle('Usuarios');

    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
      this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
      await this.getUsuarios(this.sucursales);
      this.roles = await getRolesUsuarioPage();
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
  left: 0;
  top: 100%;
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

.modal-usuario {
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

#AddUsuarioModal,
#BtnCerrar {
  width: 80%;
}

.modal-body {
  display: flex;
  width: 100%;
  justify-content: space-around;
  padding: 24px;
  overflow-y: auto;
}

.form-row {
  margin-bottom: 20px;
}

.form-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.contenedor {
  width: 45%;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 1px;
  color: #333;
  font-weight: 500;
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

.modal-body-confirm {
  padding: 24px;
  overflow-y: auto;
  background-color: white
}

.dark .modal-body-confirm {
  background-color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
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

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
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
  width: 30%;
}

.phone-input-container input {
  width: 70%;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .modal-body {
    flex-direction: column;
  }

  .contenedor {
    width: 100%;
    margin-bottom: 20px;
  }

  .modal-usuario {
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
  .modal-usuario {
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

.dark .modal-usuario {
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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 40px;
  width: 100%;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
  padding: 0;
  display: flex;
  align-items: center;
}

.toggle-password:disabled {
  color: #999;
  cursor: not-allowed;
}

.toggle-password:hover:not(:disabled) {
  color: #333;
}

/* Estilos para modo oscuro */
.dark .toggle-password {
  color: #aaa;
}

.dark .toggle-password:hover:not(:disabled) {
  color: #fff;
}

.dark .toggle-password:disabled {
  color: #666;
}


</style>
<template>
  <div class="empleados-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Usuario</button>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar empleado..." />
      </div>

      <div class="registros">
        <span>
          <select class="custom-select" v-model="searchSucursal">
            <option value="default" selected>Todas</option>
            <option v-for="(sucursal, index) in this.sucursales" :key="index" :value="sucursal.id_sucursal">{{
              sucursal.nombre_administrativo }}</option>
          </select>
        </span>
      </div>

    </div>
    <div class="table-container">
      <table class="table">
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
            <td>{{ index + 1 }}</td>
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.apellido }}</td>
            <td>{{ empleado.nombre_usuario }}</td>
            <td>{{ empleado.telefono }}</td>
            <td>{{ empleado.correo }}</td>
            <td>{{ getRol(empleado.id_rol) }}</td>

            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editEmpleado(empleado)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteUsuariol(empleado)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar este usuario?</p>
        <div class="modal-actions">
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
              <select class="form-select" id="sucursal" name="sucursal" v-model="usuarioForm.sucursal" required>
                <option value="" disabled selected>Selecciona una sucursal</option>
                <option v-for="(sucursal, index) in sucursales" :key="index" :value="sucursal.id_sucursal">{{
                  sucursal.nombre_administrativo }}</option>
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
import { notificaciones } from '../../services/notificaciones.js';
const { esCeo } = require('../../services/usuariosSolicitudes');
import PageHeader from "@/components/PageHeader.vue";
import { getSucursalesbyEmmpresaSumm } from '../../services/sucursalesSolicitudes.js';
import { COUNTRY_CODES } from "../../services/countrySelector.js";
import { validacionesUsuario } from '../../services/validarCampos.js';

export default {
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
      itemsPerPage: "",
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
      notificaciones('error', error.message);
    }
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
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredEmpleados;
      } else {
        return this.filteredEmpleados.slice(0, parseInt(this.itemsPerPage));
      }
    },
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
        notificaciones('error', error.message);
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
            notificaciones('success')
            Object.assign(this.empleados[this.editIndex], this.usuarioForm);
          } else {
            notificaciones('error', response);
          }
        } else {
          parametros = `/usuario/crear`;
          response = await solicitudes.postRegistro(
            parametros,
            this.limpiarForm(this.usuarioForm)
          );

          if (response.length > 0) {
            notificaciones('form-success')
            this.empleados.push(response[0]);
          } else {
            throw response;
          }
        }
        this.closeModal();
      } catch (error) {
        notificaciones('error', error.message);
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
          notificaciones('success', 'Usuario eliminado correctamente');
        }
      } catch (error) {
        notificaciones('error', error.message);
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

.stock-group {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.stock-group label {
  margin: 5px;
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

#registrar-usuario {
  background-color: rgb(253, 253, 56);
  margin-left: 30px;
  height: 50px;
}

#registrar-usuario:hover {
  background-color: rgb(228, 228, 48);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.form-categoria {
  display: flex;
  flex-direction: column;
}

#proveedor-contenedor {
  display: flex;
  align-items: center;
}

.modal-content-categoria {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 30%;
  height: 72%;
  min-height: 500px;
  min-width: 300px;
}

.form-form-categoria {
  padding: 20px;
  padding-top: 0;
  height: 240px;
  overflow-y: scroll;
}

.categoria-botones {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
}

.categoria-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

/* ALTERA LOS BOTONES DE LOS MODALES */
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

.empleados-wrapper {
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

#AddEmpleadoModal {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  margin-right: 1rem;
}

button {
  cursor: pointer;
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

.custom-select:focus {
  outline: none;
  border-color: #a38655;
}

.custom-select option {
  font-size: 16px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.password-wrapper .toggle-password {
  position: absolute;
  right: 1.3rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #aaa;
}

.password-wrapper .toggle-password:hover {
  color: #000;
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

  .table-container {
    margin-top: 24px;
  }

  .modal-content-categoria {
    width: 90%;
    min-width: auto;
  }

  #registrar-usuario {
    margin-left: 0;
    width: 100%;
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

  .h2-modal-content {
    font-size: 20px;
  }

  .busqueda {
    min-width: auto;
  }

  .form-form-categoria {
    padding: 10px;
    height: 200px;
  }

  .categoria-botones {
    flex-direction: column;
    gap: 10px;
  }

  #AddUsuarioModal,
  #BtnCerrar {
    width: 100%;
  }

  .password-wrapper .toggle-password {
    right: 0.5rem;
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
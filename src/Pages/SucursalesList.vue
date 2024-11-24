<template>
  <div class="sucursales-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap">
        Agregar sucursales
      </button>
      <ExportButton :columns="columns" :rows="rows" fileName="Sucursales.pdf" class="export-button" />
      <div class="registros">
        <span>Mostrar
          <select v-model="itemsPerPage" class="custom-select">
            <option value="">Todos</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select>
          registros
        </span>
      </div>
      <!-- Barra de búsqueda -->
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar sucursal..." />
    </div>

    <div class="table-container">
      <table class="table">
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
            <td>{{ index + 1 }}</td>
            <td>{{ sucursal.nombre_administrativo }}</td>
            <td>{{ sucursal.correo }}</td>
            <td>{{ sucursal.telefono }}</td>
            <td>{{ sucursal.direccion }}</td>

            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editSucursal(sucursal)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteSucursal(sucursal)">
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar Sucursales -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">
          {{ isEditing ? "Editar Sucursal" : "Agregar Sucursal" }}
        </h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="sucursalForm.nombre_administrativo" type="text" required />
        </div>

        <div class="form-group">
          <label>Correo:</label>
          <input v-model="sucursalForm.correo" type="text" required />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="sucursalForm.telefono" type="text" required />
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="sucursalForm.direccion" type="text" required />
        </div>

        <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Sucursal'" @click="guardarSucursal">
        </btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
      </div>
    </div>
  </div>
</template>

<script>
import ExportButton from "../components/ExportButton.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import validarCamposService from '../../services/validarCampos.js';
import { notificaciones } from '../../services/notificaciones.js';
import PageHeader from "@/components/PageHeader.vue";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

export default {
  components: {
    ExportButton,
    btnGuardarModal,
    btnCerrarModal,
    PageHeader
  },
  data() {
    return {
      titulo: "Administración de Sucursales",
      id_usuario: 1,
      id_empresa: 11, //esto es provisional, cuando se cree el controller empresa el sistema sera capaz de reconocer automaitcamente a que empresa pertenece cada usuario
      searchQuery: "", // Almacena el texto de búsqueda
      itemsPerPage: "", // Valor por defecto para mostrar todos los registros
      isModalOpen: false,
      isEditing: false,
      editIndex: null,

      sucursalForm: {
        id_sucursal: 0,
        nombre_administrativo: "",
        correo: "",
        telefono: "",
        direccion: "",
      },
      sucursales: [],
      // Define tus columnas para la exportación a PDF
      columns: [
        { header: "#", dataKey: "index" },
        { header: "Nombre", dataKey: "nombre" },
        { header: "Correo", dataKey: "correo" },
        { header: "Direccion", dataKey: "direccion" },
        { header: "Teléfono", dataKey: "telefono" },
      ],
      rows: [], // Inicialmente vacío, se llena después
    };
  },
  computed: {
    filteredSucursales() {
      // Filtra los sucursales basados en el texto de búsqueda
      return this.sucursales.filter(
        (sucursal) =>
          sucursal.nombre_administrativo
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          sucursal.direccion.includes(this.searchQuery)
      );
    },
    paginatedSucursales() {
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredSucursales
        : this.filteredSucursales.slice(0, this.itemsPerPage);
    },
  },
  methods: {

    validarCampos(sucursalForm) {
      const campos = {
        Nombre: sucursalForm.nombre_administrativo,
        Correo: sucursalForm.correo,
        Telefono: sucursalForm.telefono,
        Direccion: sucursalForm.direccion,
      };

      if (!validarCamposService.validarEmpty(campos)) {
        return false;
      }

      if (!validarCamposService.validarEmail(campos.correo)) {
        return false;
      }

      if (!validarCamposService.validarTelefono(campos.telefono)) {
        return false;
      }

      return true;
    },

    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.isEditing = false;
      this.sucursalForm = {
        nombre_administrativo: "",
        correo: "",
        telefono: "",
        direccion: "",
      };
    },

    async guardarSucursal() {
      // Validamos los campos sin importar si es edición o creación
      if (!this.validarCampos(this.sucursalForm)) {
        return;
      }
      validarCamposService.formSuccess();

      let response;
      let parametros;

      try {
        if (this.isEditing) {
          parametros = `/sucursales/actualizar-sucursal/${this.sucursales[this.editIndex].id_sucursal}`;
          response = await solicitudes.patchRegistro(parametros, this.sucursalForm);

          if (response == true) {
            Object.assign(this.sucursales[this.editIndex], this.sucursalForm);
            notificaciones('success', 'Sucursal actualizada correctamente');
          } else {
            notificaciones('error', response.message);
          }
        } else {
          parametros = `/sucursales/crear-sucursal/${this.id_usuario}`;
          response = await solicitudes.postRegistro(parametros, this.sucursalForm);

          if (response.length > 0) {
            this.sucursales.push(response[0]);
            notificaciones('success', 'Sucursal creada correctamente');
          } else {
            throw response;
          }
        }
        this.closeModal();
      } catch (error) {
        notificaciones('error', error.message);
      }
    },

    editSucursal(sucursal) {
      // Primero cargamos los datos en el formulario
      this.isModalOpen = true;
      this.isEditing = true;
      this.editIndex = this.sucursales.findIndex(item => item.id_sucursal === sucursal.id_sucursal);
      this.sucursalForm = { ...sucursal };
      // Quitamos la validación de aquí ya que se hará al guardar
    },

    async deleteSucursal(sucursal) {
      let response;

      const datosActualizados = {
        estado: false,
      };

      const parametros = `/sucursales/desactivar-sucursal/${sucursal.id_sucursal}`;

      try {
        response = await solicitudes.desactivarRegistro(
          parametros,
          datosActualizados
        );

        if (response == true) {
          this.sucursales = this.sucursales.filter(item => item.id_sucursal !== sucursal.id_sucursal);
        }
      } catch (error) {
        notificaciones('error', new Error(response).message);
      }
    },
    generateRows() {
      // Genera las filas basadas en los sucursales paginados
      this.rows = this.paginatedSucursales.map((sucursal, index) => ({
        index: index + 1,
        nombre: sucursal.nombre_administrativo,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        correo: sucursal.correo,
      }));

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
    // Cuando cambie la paginación o el filtro, actualiza las filas
    paginatedSucursales() {
      this.generateRows();
    },
  },
  async mounted() {
    // Genera las filas al cargar el componente
    this.generateRows();
    document.title = "Sucursales";
    this.changeFavicon("/img/spiderman.ico"); // Usar la ruta correcta

    this.id_usuario = await solicitudes.solicitarUsuarioToken();
    console.log(this.id_usuario);

    // this.fetchUsuario();

    // this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");
    try {
      this.sucursales = await solicitudes.fetchRegistros(
        `/sucursales/empresa/${this.id_usuario}`
      );


    } catch (error) {
      console.log(error); //modal error pendiente
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

select {
  border: 1px solid #ccc;
  margin: 10px 5px 0 5px;
  width: 60px;
  height: 35px;
  border-radius: 5px;
}

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

.sucursales-wrapper {
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

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  margin: 20px;
}

.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  margin-bottom: 8px;
  display: block;
}

.form-group input {
  width: 100%;
  height: 35px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
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

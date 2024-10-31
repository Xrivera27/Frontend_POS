<template>
  <div class="encabezado">
    <h1>Administración Sucursales</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr />

  <div class="sucursales-wrapper">
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
      <div class="registros">
        <span
          >Mostrar
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
      <input
        class="busqueda"
        type="text"
        v-model="searchQuery"
        placeholder="Buscar sucursal..."
      />
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Direccion</th>
            <th>Acciones</th>
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
              <button
                id="btnEditar"
                class="btn btn-warning"
                @click="editSucursal(index, sucursal)"
              >
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button
                id="btnEliminar"
                class="btn btn-danger"
                @click="deleteSucursal(index, sucursal)"
              >
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
          <input
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
          <input v-model="sucursalForm.telefono" type="text" required />
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="sucursalForm.direccion" type="text" required />
        </div>

        <btnGuardarModal
          :texto="isEditing ? 'Guardar Cambios' : 'Agregar Sucursal'"
          @click="guardarSucursal"
        ></btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileButton from "../components/ProfileButton.vue";
import ExportButton from "../components/ExportButton.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

export default {
  components: {
    ProfileButton,
    ExportButton,
    btnGuardarModal,
    btnCerrarModal,
  },
  data() {
    return {
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
      let response;
      let parametros;
      if (this.isEditing) {
        try {

          parametros = `/sucursales/actualizar-sucursal/${
            this.sucursales[this.editIndex].id_sucursal
          }`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.sucursalForm
          );
          

          if (response == true) {

            Object.assign(this.sucursales[this.editIndex], this.sucursalForm);
          } else alert(response);
        } catch (error) {
          alert(error);
        }
      } else {
        parametros = `/sucursales/crear-sucursal/${this.id_usuario}`;
        try {
          response = await solicitudes.postRegistro(
            parametros,
            this.sucursalForm
          );

          if (response.length > 0) {
           
           this.sucursales.push( response[0] );
 
           }  else {
            throw response;
          }
        } catch (error) {
          alert(error);
        }
      }
      this.closeModal();
    },
    editSucursal(index, sucursal) {
      this.isModalOpen = true;
      this.isEditing = true;
      this.editIndex = index;
      this.sucursalForm = { ...sucursal };
    },
    async deleteSucursal(index, sucursal) {
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
        alert(new Error(response));
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

    // this.fetchUsuario();
    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");
      try {
        this.sucursales = await solicitudes.fetchRegistros(
          `/sucursales/empresa/${this.id_usuario}`
        );

      } catch (error) {
        console.log(error); //modal error
        throw error;
      }
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
}

.encabezado {
  display: flex;
  justify-content: space-between;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
}

.registros {
  height: 100%;
  padding-bottom: 1%;
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
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
}

.export-button {
  margin: 0;
}

.h2-modal-content {
  margin-top: 0px;
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

select {
  border: 1px solid #ccc;
  margin: 10px 5px 0 5px;
  width: 60px;
  height: 35px;
  border-radius: 5px;
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

.sucursales-wrapper {
  padding: 16px;
}

.table-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>

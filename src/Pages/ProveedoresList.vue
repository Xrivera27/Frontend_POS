<template>
  <div class="proveedores-wrapper">
    <PageHeader :titulo="titulo" />

    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Proveedor</button>

      <div class="registros">
        <span>Mostrar
          <select v-model="itemsPerPage" class="custom-select">
            <option value="">Todos</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
          </select> registros
        </span>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar proveedor..." />
      </div>
    </div>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="col-id">#</th>
            <th class="col-nombre">Nombre</th>
            <th class="col-telefono">Teléfono</th>
            <th class="col-email">Email</th>
            <th class="col-direccion">Direccion</th>
            <th class="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(proveedor, index) in paginatedProveedores" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ proveedor.nombre }}</td>
            <td>{{ proveedor.telefono }}</td>
            <td>{{ proveedor.correo }}</td>
            <td>{{ proveedor.direccion }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editProveedor(proveedor)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteProveedor(proveedor)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar proveedores -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Proveedor' : 'Agregar Proveedor' }}</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="proveedorForm.nombre" type="text" required>
        </div>

        <div id="form-tel" class="form-group">
          <label>Teléfono:</label>
          <input v-model="proveedorForm.telefono" type="text" required>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="proveedorForm.correo" type="text" required>
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="proveedorForm.direccion" type="text" required>
        </div>

        <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Proveedor'" @click="guardarProveedor">
        </btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>

      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
import validarCamposService from '../../services/validarCampos.js';
import { notificaciones } from '../../services/notificaciones.js';

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";
export default {
  components: {
    PageHeader,
    btnGuardarModal,
    btnCerrarModal
  },
  data() {
    return {
      titulo: 'Proveedores',
      searchQuery: '', // Almacena el texto de búsqueda
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      id_usuario: 0,
      itemsPerPage: "",
      proveedorForm: {
        nombre: '',
        telefono: '',
        correo: '',
        direccion: '',
      },
      proveedores: []
    };
  },
  async mounted() {
    document.title = "Proveedores";
    this.changeFavicon('/img/spiderman.ico'); // Usar la ruta correcta
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();

      this.proveedores = await solicitudes.fetchRegistros(
        `/proveedores/${this.id_usuario}`
      );

    } catch (error) {
      console.log(error); //modal error pendiente
    }

  },
  computed: {
    filteredProveedores() {
      // Filtra los proveedores basados en el texto de búsqueda
      return this.proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        proveedor.telefono.includes(this.searchQuery)
      );
    },
    paginatedProveedores() {

      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredProveedores;
      } else {
        return this.filteredProveedores.slice(0, parseInt(this.itemsPerPage));
      }
    }
  },
  methods: {

    validarCampos(proveedorForm) {
      const campos = {
        nombre: proveedorForm.nombre,
        telefono: proveedorForm.telefono,
        correo: proveedorForm.correo, // Cambiado a proveedorForm.correo
        direccion: proveedorForm.direccion
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
      if (!this.validarCampos(this.proveedorForm)) {
        return;
      }
      validarCamposService.formSuccess();

      this.proveedorForm.id_usuario = this.id_usuario;
      let response;
      let parametros;
      if (this.isEditing) {
        try {
          console.log(this.proveedorForm);
          parametros = `/proveedores/actualizar-proveedor/${this.proveedores[this.editIndex].id
            }`;
          console.log(this.proveedores[this.editIndex].id);
          response = await solicitudes.patchRegistro(
            parametros,
            this.proveedorForm
          );

          if (response == true) {

            Object.assign(this.proveedores[this.editIndex], this.proveedorForm);
          } else notificaciones('error', response.message);
        } catch (error) {
          notificaciones('error', error.message);
        }
      } else {
        parametros = `/proveedores/crear-proveedor/${this.id_usuario}`;
        try {
          response = await solicitudes.postRegistro(
            parametros,
            this.proveedorForm
          );

          if (response.length > 0) {

            this.proveedores.push(response[0]);

          } else {
            throw response;
          }
        } catch (error) {
          console.log(error);

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
      let response;

      const datosActualizados = {
        estado: false,
        id_usuario: this.id_usuario
      };

      const parametros = `/proveedores/desactivar-proveedor/${proveedor.id}`;

      try {
        response = await solicitudes.desactivarRegistro(
          parametros,
          datosActualizados
        );

        if (response == true) {
          this.proveedores = this.proveedores.filter(item => item.id !== proveedor.id);
        }
      } catch (error) {
        console.log(new Error(response));
      }
    },
    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
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
</style>

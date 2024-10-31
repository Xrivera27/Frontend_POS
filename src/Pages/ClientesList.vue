<template>
  <div class="encabezado">
    <h1>Clientes</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="clientes-wrapper">
    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar Clientes</button>

      <ExportButton :columns="columns" :rows="rows" fileName="Clientes.pdf" class="export-button" />

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

      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar cliente..." />
      </div>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>RTN</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in paginatedClientes" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ cliente.nombre_completo }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.direccion }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.rtn }}</td>
            <td>
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
    </div>

    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h2>

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

        <div id="form-tel" class="form-group">
          <label>Teléfono:</label>
          <input v-model="clienteForm.telefono" type="text" required>
        </div>

        <div class="form-group">
          <label>RTN:</label>
          <input v-model="clienteForm.rtn" type="text" required>
        </div>

        <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Cliente'" @click="guardarCliente"></btnGuardarModal>
        <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';
import ExportButton from '../components/ExportButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';

import solicitudes from "../../services/solicitudes";
const { getClientesbyEmpresa, postCliente, patchCliente, desactivarCliente } = require('../../services/clienteSolicitudes.js');

export default {
  components: {
    ProfileButton,
    ExportButton,
    btnGuardarModal,
    btnCerrarModal
  },
  data() {
    return {
      searchQuery: '',
      itemsPerPage: "",
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      id_usuario: 0,
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
    document.title = "Clientes";
    this.changeFavicon('/img/spiderman.ico');
    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");
      
      this.clientes = await getClientesbyEmpresa(this.id_usuario);


    } catch (error) {
      console.log(error);
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
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredClientes
        : this.filteredClientes.slice(0, parseInt(this.itemsPerPage));
    }
  },
  methods: {
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
      this.clienteForm.id_usuario = this.id_usuario;
      let response;

      if (this.isEditing) {
        const nuevoRegistro = await patchCliente(this.clienteForm, this.clientes[this.editIndex].id_cliente);
if (nuevoRegistro == true) {

  Object.assign(this.clientes[this.editIndex], this.clienteForm);

}
      } else {
       
        try {
          response = await postCliente(this.clienteForm, this.id_usuario);
          if (response.length > 0) {

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
      this.editIndex= this.clientes.findIndex(item => item.id_cliente === cliente.id_cliente);
      this.openModal();
    },
    async deleteCliente(cliente) {
     try {
      const response = await desactivarCliente(cliente.id_cliente);
      console.log(response);
      if (response === true){
        this.clientes = this.clientes.filter(item => item.id_cliente !== cliente.id_cliente);
      }
      else {
        throw response;
      }
     } catch (error) {
      alert(error.message);
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

/* Fuente global */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Encabezado */
.encabezado {
  display: flex;
  justify-content: space-between;
}

/* Opciones y búsqueda */
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

/* Botones */
#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
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
  max-width: 500px;
  width: 100%;
}

.h2-modal-content {
  margin-top: 0px;
}

/* Tabla */
.clientes-wrapper {
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
}

.form-group label {
  display: flex;
  margin-bottom: 8px;
}

.form-group input {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

#form-tel {
  width: 30%;
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
</style>

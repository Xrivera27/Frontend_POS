<template>
  <div>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="clientes-wrapper">
    <h1> Productos </h1>

    <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
      Productos</button>

    <div class="registros">
      <span>Mostrar <select></select> registros</span>
    </div>

    <!-- Barra de búsqueda -->
    <div class="search-bar">
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar cliente..." />
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Codigo</th>
            <th>Descripcion</th>
            <th>Categoria</th>
            <th>Stock</th>
            <th>Precio Unitarios</th>
            <th>Precio Mayoristas</th>
            <th>Precio Descuento</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in filteredClientes" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ cliente.codigo }}</td>
            <td>{{ cliente.descripcion }}</td>
            <td>{{ cliente.categoria }}</td>
            <td>{{ cliente.stock }}</td>
            <td>{{ cliente.preciounitario }}</td>
            <td>{{ cliente.preciomayorista }}</td>
            <td>{{ cliente.preciodescuento }}</td>
            <td>{{ cliente.fecha }}</td>


            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editCliente(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteCliente(index)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar clientes -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h2>

        <div class="form-group">
          <label>Codigo:</label>
          <input v-model="clienteForm.codigo" type="text" required>
        </div>

        <div class="form-group">
          <label>Descripcion:</label>
          <input v-model="clienteForm.descripcion" type="text" required>
        </div>

        <div class="form-group">
          <label>Categoria:</label>
          <input v-model="clienteForm.categoria" type="text" required>
        </div>

        <div class="form-group">
          <label>Stock:</label>
          <input v-model="clienteForm.stock" type="text" required>
        </div>

        <div class="form-group">
          <label>Precio Unitario:</label>
          <input v-model="clienteForm.preciounitario" type="text" required>
        </div>


        <div class="form-group">
          <label>Precio Mayorista :</label>
          <input v-model="clienteForm.preciomayorista" type="text" required>
        </div>

        <div class="form-group">
          <label>Precio Descuento:</label>
          <input v-model="clienteForm.preciodescuento" type="text" required>
        </div>

        <div class="form-group">
          <label>Fecha:</label>
          <input v-model="clienteForm.fecha" type="date" required>
        </div>



        <button id="AddClienteModal" class="btn btn-primary" @click="guardarCliente">
          {{ isEditing ? 'Guardar Cambios' : 'Agregar Cliente' }}
        </button>
        <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';
export default {
  components: {
    ProfileButton
  },
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      clienteForm: {
        codigo: '',
        descripcion: '',
        categoria: '',
        stock: '',
        preciounitario: '',
        preciomayorista: '',
        preciodescuento: '',
        fecha: '',


      },
      clientes: [
        {
          codigo: '1504',
          descripcion: 'Mortal Kombat X',
          categoria: 'Videojuegos',
          stock: '45',
          preciounitario: 'L. 450.00',
          preciomayorista: 'L. 350.00',
          preciodescuento: 'L. 400.00',
          fecha: '2017-12-11'
        }
        // Más clientes...
      ]
    };
  },
  computed: {
    filteredClientes() {
      // Filtra los clientes basados en el texto de búsqueda
      return this.clientes.filter(cliente =>
        cliente.codigo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cliente.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        cliente.categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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
        codigo: '',
        descripcion: '',
        categoria: '',
        stock: '',
        preciounitario: '',
        preciomayorista: '',
        preciodescuento: '',
        fecha: ''
      };
      this.isEditing = false;
      this.editIndex = null;
    },
    guardarCliente() {
      if (this.isEditing) {
        this.clientes[this.editIndex] = { ...this.clienteForm };
      } else {
        this.clientes.push({ ...this.clienteForm });
      }
      this.closeModal();
    },
    editCliente(index) {
      this.clienteForm = { ...this.clientes[index] };
      this.isEditing = true;
      this.editIndex = index;
      this.openModal();
    },
    deleteCliente(index) {
      this.clientes.splice(index, 1);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
  height: 40px;
  border-radius: 10px;
  margin-bottom: 15px;
  color: black;
  font-weight: bold;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
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

select {
  border: 1px solid #ccc;
  margin-top: 10px;
  margin-left: 5px;
  margin-right: 5px;
  width: 60px;
  height: 35px;
  border-radius: 5px;
}

.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  margin-top: -40px;
  margin-bottom: 20px;
}

.clientes-wrapper {
  padding: 16px;
}

.search-bar {
  margin-bottom: 16px;
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
  background-color: #e7e4e4;
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

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
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
}

#AddClienteModal {
  background: #a38655;
  border-radius: 15px;
  font-size: 16px
}

#BtnCerrar {
  border-radius: 15px;
  background-color: #ebebeb;
  font-size: 16px;
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
  display: block;
  margin-bottom: 8px;
}

.form-group input {
  width: 50%;
  height: 20px;
  border-radius: 5px;
  padding: 5px;
}
</style>
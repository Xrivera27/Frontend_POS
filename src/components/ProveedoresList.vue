<template>
    <div class="proveedores-wrapper">
      <h1>Administrar Proveedores</h1>
  
      <button class="btn btn-primary" @click="openModal">Agregar proveedores</button>
  
      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input type="text" v-model="searchQuery" placeholder="Buscar cliente..." />
      </div>
  
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo Electronico</th>
            <th>Direccion</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in filteredClientes" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.correo }}</td>
            <td>{{ cliente.direccion }}</td>
            <td>
              <button class="btn btn-warning" @click="editCliente(index)"><i class="bi bi-pencil-fill"></i></button>
              <button class="btn btn-danger" @click="deleteCliente(index)"><b><i class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Modal para agregar o editar clientes -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Editar Cliente' : 'Agregar Cliente' }}</h2>
  
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="clienteForm.nombre" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Teléfono:</label>
            <input v-model="clienteForm.telefono" type="text" required>
          </div>

          <div class="form-group">
            <label>correo:</label>
            <input v-model="clienteForm.correo" type="email" required>
          </div>
  
          <div class="form-group">
            <label>Dirección:</label>
            <input v-model="clienteForm.direccion" type="text" required>
          </div>
  
  
          <button class="btn btn-primary" @click="guardarCliente">
            {{ isEditing ? 'Guardar Cambios' : 'Agregar Cliente' }}
          </button>
          <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        searchQuery: '', // Almacena el texto de búsqueda
        isModalOpen: false,
        isEditing: false,
        editIndex: null,
        clienteForm: {
          nombre: '',
          telefono: '',
          correo: '',
          direccion: '',
        },
        clientes: [
          {
            nombre: 'Juan Villegas',
            telefono: '555 57 67',
            correo: 'juan@hotmail.com',
            direccion: 'calle 27 # 40 - 36',
          }
          // Más clientes...
        ]
      };
    },
    computed: {
      filteredClientes() {
        // Filtra los clientes basados en el texto de búsqueda
        return this.clientes.filter(cliente => 
          cliente.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          cliente.documentoId.includes(this.searchQuery)
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
          nombre: '',
          documentoId: '',
          email: '',
          telefono: '',
          direccion: '',
          fechaNacimiento: '',
          totalCompras: 0,
          ultimaCompra: new Date().toISOString().split('T')[0]
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
  .clientes-wrapper {
    padding: 16px;
  }
  
  .search-bar {
    margin-bottom: 16px;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
  }
  
  .table th, .table td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  .table th {
    background-color: #f4f4f4;
    text-align: center;
  }
  
  .table td {
    text-align: center;
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
  </style>
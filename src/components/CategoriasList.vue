<template>
    <section>
      <div class="container-top">
        <i id="campana" class="bi bi-bell-fill"></i>Perdomo y Asociados<br>
        <span class="rol">Gerente</span>
        <hr>
      </div>
    </section>
  
    <div class="clientes-wrapper">
      <h1> Categorías </h1>
  
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar Categorías</button>
  
      <div class="registros">
        <span>Mostrar  <select></select>  registros</span>
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
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cliente, index) in filteredClientes" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.descripcion }}</td>
              <td>
                <button id="btnEditar" class="btn btn-warning" @click="editCliente(index)"><i class="bi bi-pencil-fill"></i></button>
                <button id="btnEliminar" class="btn btn-danger" @click="deleteCliente(index)"><b><i class="bi bi-x-lg"></i></b></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para agregar o editar clientes -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <h2>{{ isEditing ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>
  
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="clienteForm.nombre" type="text" required>
          </div>
  
          <!-- Campo de descripción estilizado como textarea -->
          <div class="form-group">
            <label>Descripción:</label>
            <textarea v-model="clienteForm.descripcion" required rows="4"></textarea>
          </div>
  
          <button id="AddClienteModal" class="btn btn-primary" @click="guardarCategoria">
            {{ isEditing ? 'Guardar Cambios' : 'Agregar Categoría' }}
          </button>
          <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button>
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
          descripcion: '',
        },
        clientes: [
          {
            nombre: 'Videojuegos',
            descripcion: 'Todo tipo de videojuegos tanto de consola como de pc',
          }
          // Más clientes...
        ]
      };
    },
    computed: {
      filteredClientes() {
        // Filtra los clientes basados en el texto de búsqueda
        return this.clientes.filter(cliente => 
          cliente.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
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
          descripcion: '',
        };
        this.isEditing = false;
        this.editIndex = null;
      },
      guardarCategoria() {
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
  *{
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
  
  .table th, .table td {
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
    font-size: 16px;
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
  
  /* Estilos para el textarea */
  textarea {
    width: 100%;
    height: auto;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
    resize: vertical;
  }
  
  textarea:focus {
    outline: none;
    border-color: #a38655;
    box-shadow: 0 0 5px rgba(163, 134, 85, 0.5);
  }
  
  button {
    cursor: pointer;
  }
  </style>
  
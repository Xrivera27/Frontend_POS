<template>
  <div class="encabezado">
    <h1>Categorias</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="categorias-wrapper">

    <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
      Categoría</button>

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
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar categoría..." />
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
          <tr v-for="(categoria, index) in paginatedCategorias" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ categoria.nombre }}</td>
            <td>{{ categoria.descripcion }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editCategoria(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteCategoria(index)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar categorías -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="categoriaForm.nombre" type="text" required>
        </div>

        <!-- Campo de descripción estilizado como textarea -->
        <div class="form-group">
          <label>Descripción:</label>
          <textarea v-model="categoriaForm.descripcion" class="descriptionForm" required rows="4"></textarea>
        </div>

        <button id="AddCategoriaModal" class="btn btn-primary" @click="guardarCategoria">
          {{ isEditing ? 'Guardar Cambios' : 'Agregar Categoría' }}
        </button>
        <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';

export default {
  components:
  {
    ProfileButton,
  },
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      itemsPerPage: "", // Valor por defecto para mostrar todos los registros
      categorias: [
        {
          nombre: 'Videojuegos',
          descripcion: 'Todo tipo de videojuegos tanto de consola como de pc',
        },
        // ... otras categorías
      ],
      isModalOpen: false, // Estado para controlar si el modal está abierto o cerrado
      isEditing: false, // Estado para verificar si estamos editando una categoría
      categoriaForm: { nombre: '', descripcion: '' }, // Objeto para el formulario de categorías
    };
  },
  computed: {
    filteredCategorias() {
      // Filtra las categorías basados en el texto de búsqueda
      return this.categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedCategorias() {
      // Si itemsPerPage es 0, mostramos todos los registros, de lo contrario aplicamos la paginación
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredCategorias
        : this.filteredCategorias.slice(0, this.itemsPerPage);
    }
  },
  methods: {
    openModal() {
      // Resetea el formulario y abre el modal
      this.isModalOpen = true;
      this.isEditing = false;
      this.categoriaForm = { nombre: '', descripcion: '' }; // Resetea el formulario
    },
    closeModal() {
      // Cierra el modal
      this.isModalOpen = false;
    },
    editCategoria(index) {
      // Implementa la lógica para editar una categoría
      this.isModalOpen = true;
      this.isEditing = true;
      this.categoriaForm = { ...this.categorias[index] };
    },
    deleteCategoria(index) {
      // Implementa la lógica para eliminar una categoría
      this.categorias.splice(index, 1);
    },
    guardarCategoria() {
      if (this.isEditing) {
        // Actualiza una categoría existente
        const index = this.categorias.findIndex(c => c.nombre === this.categoriaForm.nombre);
        if (index !== -1) {
          this.$set(this.categorias, index, this.categoriaForm);
        }
      } else {
        // Agrega una nueva categoría
        this.categorias.push(this.categoriaForm);
      }
      this.closeModal();
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
}

.encabezado {
  display: flex;
  justify-content: space-between;
}

.h2-modal-content {
  margin-top: 0px;
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

.categorias-wrapper {
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

.descriptionForm {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  justify-content: center;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

#AddCategoriaModal {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  margin-right: 1rem;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;
  cursor: pointer;
  margin-right: 1rem;
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
  display: flexbox;
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

.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
  /* Ajusta el ancho a 120px o el valor que prefieras */
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
  /* Ajusta el color del borde al de tu diseño */
}

.custom-select option {
  font-size: 16px;
}
</style>

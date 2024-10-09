<template>
  <div class="encabezado">
    <h1>Proveedores</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="proveedores-wrapper">
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
            <th>#</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Direccion</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(proveedor, index) in paginatedProveedores" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ proveedor.nombre }}</td>
            <td>{{ proveedor.telefono }}</td>
            <td>{{ proveedor.email }}</td>
            <td>{{ proveedor.direccion }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editProveedor(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteProveedor(index)"><b><i
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
          <input v-model="proveedorForm.email" type="text" required>
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="proveedorForm.direccion" type="text" required>
        </div>

        <btnGuardarModal :texto = " isEditing ? 'Guardar Cambios' : 'Agregar Proveedor' " @click="guardarProveedor"></btnGuardarModal>
        <btnCerrarModal :texto = "'Cerrar'" @click="closeModal" ></btnCerrarModal> 

      </div>
    </div>
  </div>
</template>

<script>
import ProfileButton from '../components/ProfileButton.vue';
import btnGuardarModal from '../components/botones/modales/btnGuardar.vue';
import btnCerrarModal from '../components/botones/modales/btnCerrar.vue';
export default {
  components: {
    ProfileButton,
    btnGuardarModal,
    btnCerrarModal
  },
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      itemsPerPage: "",
      proveedorForm: {
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
      },
      proveedores: [
        { nombre: 'Juan Villegas', telefono: '555 57 67', email: 'Juanavillega@gmail.com', direccion: 'calle 27 # 40 - 36' },
        { nombre: 'Marta Pérez', telefono: '123 45 67', email: 'martaperez@gmail.com', direccion: 'avenida 15 # 20 - 40' },
        { nombre: 'Carlos Ramírez', telefono: '987 65 43', email: 'carlosramirez@gmail.com', direccion: 'calle 10 # 12 - 50' },
        { nombre: 'Ana Gómez', telefono: '654 32 10', email: 'anagomez@gmail.com', direccion: 'carrera 7 # 8 - 60' },
        { nombre: 'Luis Fernández', telefono: '432 10 98', email: 'luisfernandez@gmail.com', direccion: 'calle 8 # 9 - 70' },
        { nombre: 'Pedro Sánchez', telefono: '789 01 23', email: 'pedrosanchez@gmail.com', direccion: 'calle 5 # 6 - 80' },
        { nombre: 'Claudia Rodríguez', telefono: '567 89 01', email: 'claudiarodriguez@gmail.com', direccion: 'avenida 9 # 10 - 90' },
        { nombre: 'Gabriel López', telefono: '345 67 89', email: 'gabriellopez@gmail.com', direccion: 'calle 3 # 4 - 100' },
        { nombre: 'Julia Castillo', telefono: '234 56 78', email: 'juliacastillo@gmail.com', direccion: 'carrera 5 # 6 - 110' },
        { nombre: 'Andrés Ríos', telefono: '890 12 34', email: 'andresrios@gmail.com', direccion: 'calle 4 # 5 - 120' },
        { nombre: 'Sofía Torres', telefono: '567 89 12', email: 'sofiatorres@gmail.com', direccion: 'carrera 6 # 7 - 130' },
        { nombre: 'Ricardo Morales', telefono: '234 78 90', email: 'ricardomorales@gmail.com', direccion: 'avenida 3 # 4 - 140' },
        { nombre: 'Carolina Vargas', telefono: '890 34 56', email: 'carolinavargas@gmail.com', direccion: 'calle 2 # 3 - 150' },
        { nombre: 'Eduardo Herrera', telefono: '123 56 78', email: 'eduardoherrera@gmail.com', direccion: 'carrera 2 # 3 - 160' },
        { nombre: 'Patricia Medina', telefono: '456 78 90', email: 'patriciamedina@gmail.com', direccion: 'avenida 7 # 8 - 170' },
        { nombre: 'Miguel Ortiz', telefono: '789 23 45', email: 'miguelortiz@gmail.com', direccion: 'calle 1 # 2 - 180' },
        { nombre: 'Diana Ruiz', telefono: '234 90 12', email: 'dianaruiz@gmail.com', direccion: 'carrera 4 # 5 - 190' },
        { nombre: 'Javier Mendoza', telefono: '567 12 34', email: 'javiermendoza@gmail.com', direccion: 'avenida 6 # 7 - 200' },
        { nombre: 'Gloria Peña', telefono: '890 45 67', email: 'gloriapena@gmail.com', direccion: 'calle 7 # 8 - 210' },
        { nombre: 'Fernando Castro', telefono: '123 67 89', email: 'fernandocastro@gmail.com', direccion: 'carrera 3 # 4 - 220' }
      ]
    };
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
        email: '',
        direccion: '',
      };
      this.isEditing = false;
      this.editIndex = null;
    },
    guardarProveedor() {
      if (this.isEditing) {
        this.proveedores[this.editIndex] = { ...this.proveedorForm };
      } else {
        this.proveedores.push({ ...this.proveedorForm });
      }
      this.closeModal();
    },
    editProveedor(index) {
      this.proveedorForm = { ...this.proveedores[index] };
      this.isEditing = true;
      this.editIndex = index;
      this.openModal();
    },
    deleteProveedor(index) {
      this.proveedores.splice(index, 1);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

/* Fuentes */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Encabezado */
.encabezado {
  display: flex;
  justify-content: space-between;
}

/* Opciones */
.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.registros {
  height: 100%;
  padding-bottom: 1%;
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
  /* Ancho ajustado */
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
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
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
}

/* Contenedor de tabla */
.table-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}

/* Estilo de la tabla */
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
  max-width: 500px;
  width: 100%;
}

/* Estilo de formulario */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
}

.form-group input {
  width: 95%;
  height: 35px;
  /* Ajustado para mejor estética */
}

/* Otros estilos */
.h2-modal-content {
  margin-top: 0px;
}
</style>

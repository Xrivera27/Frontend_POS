<template>
  <div class="encabezado">
    <h1>Usuarios</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="empleados-wrapper">

    <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
      Usuario</button>

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
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar empleado..." />
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Nombre Usuario</th>
            <th>Contraseña</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Telefono</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(empleado, index) in paginatedEmpleados" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ empleado.nombre }}</td>
            <td>{{ empleado.apellido }}</td>
            <td>{{ empleado.nombreusuario }}</td>
            <td>{{ empleado.contraseña }}</td>
            <td>{{ empleado.email }}</td>
            <td>{{ empleado.rol }}</td>
            <td>{{ empleado.telefono }}</td>
            <td>{{ empleado.estado }}</td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editEmpleado(index)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteEmpleado(index)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar empleados -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Empleado' : 'Agregar Empleado' }}</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="empleadoForm.nombre" type="text" required>
        </div>

        <div class="form-group">
          <label>Apellido:</label>
          <input v-model="empleadoForm.apellido" type="text" required>
        </div>

        <div class="form-group">
          <label>Usuario:</label>
          <input v-model="empleadoForm.nombreusuario" type="text" required>
        </div>

        <div class="form-group">
          <label>Contraseña:</label>
          <input v-model="empleadoForm.contraseña" type="password" required>
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="empleadoForm.email" type="text" required>
        </div>

        <div class="form-group">
          <label>Rol:</label>
          <select v-model="empleadoForm.rol" required style="width: 30%; height: 35px; font-size: 16px; padding: 5px;">
            <option value="Administrador">Administrador</option>
            <option value="Cajero">Cajero</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>

        <div class="form-group">
          <label>Telefono:</label>
          <input v-model="empleadoForm.telefono" type="text" required>
        </div>

        <div class="form-group">
          <label>Estado:</label>
          <select v-model="empleadoForm.estado" required
            style="width: 30%; height: 35px; font-size: 16px; padding: 5px;">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        <button id="AddEmpleadoModal" class="btn btn-primary" @click="guardarEmpleado">
          {{ isEditing ? 'Guardar Cambios' : 'Agregar Empleado' }}
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
      itemsPerPage: "",
      empleadoForm: {
        nombre: '',
        apellido: '',
        nombreusuario: '',
        contraseña: '',
        email: '',
        rol: '',
        telefono: '',
        estado: '',
      },
      empleados: [
        { nombre: 'Juan', apellido: 'Villegas', nombreusuario: 'Juvil', contraseña: '*****', email: 'junavillega@gmail.com', rol: 'Cajero', telefono: '9875875875', estado: 'Activo' },
        { nombre: 'María', apellido: 'Pérez', nombreusuario: 'Maper', contraseña: '*****', email: 'mariaperez@gmail.com', rol: 'Cajero', telefono: '9876543210', estado: 'Activo' },
        { nombre: 'Carlos', apellido: 'Ramírez', nombreusuario: 'Cram', contraseña: '*****', email: 'carlosramirez@gmail.com', rol: 'Cajero', telefono: '9876543211', estado: 'Activo' },
        { nombre: 'Ana', apellido: 'Gómez', nombreusuario: 'Anago', contraseña: '*****', email: 'anagomez@gmail.com', rol: 'Cajero', telefono: '9876543212', estado: 'Activo' },
        { nombre: 'Luis', apellido: 'Fernández', nombreusuario: 'Lufe', contraseña: '*****', email: 'luisfernandez@gmail.com', rol: 'Cajero', telefono: '9876543213', estado: 'Activo' },
        { nombre: 'Pedro', apellido: 'Sánchez', nombreusuario: 'Pesan', contraseña: '*****', email: 'pedrosanchez@gmail.com', rol: 'Cajero', telefono: '9876543214', estado: 'Activo' },
        { nombre: 'Claudia', apellido: 'Rodríguez', nombreusuario: 'Clrod', contraseña: '*****', email: 'claudiarodriguez@gmail.com', rol: 'Cajero', telefono: '9876543215', estado: 'Activo' },
        { nombre: 'Gabriel', apellido: 'López', nombreusuario: 'Galo', contraseña: '*****', email: 'gabriellopez@gmail.com', rol: 'Cajero', telefono: '9876543216', estado: 'Activo' },
        { nombre: 'Julia', apellido: 'Castillo', nombreusuario: 'Jucas', contraseña: '*****', email: 'juliacastillo@gmail.com', rol: 'Cajero', telefono: '9876543217', estado: 'Activo' },
        { nombre: 'Andrés', apellido: 'Ríos', nombreusuario: 'Andri', contraseña: '*****', email: 'andresrios@gmail.com', rol: 'Cajero', telefono: '9876543218', estado: 'Activo' },
        { nombre: 'Sofía', apellido: 'Torres', nombreusuario: 'Sotor', contraseña: '*****', email: 'sofiatorres@gmail.com', rol: 'Cajero', telefono: '9876543219', estado: 'Activo' },
        { nombre: 'Ricardo', apellido: 'Morales', nombreusuario: 'Rimo', contraseña: '*****', email: 'ricardomorales@gmail.com', rol: 'Cajero', telefono: '9876543220', estado: 'Activo' },
        { nombre: 'Carolina', apellido: 'Vargas', nombreusuario: 'Cav', contraseña: '*****', email: 'carolinavargas@gmail.com', rol: 'Cajero', telefono: '9876543221', estado: 'Activo' },
        { nombre: 'Eduardo', apellido: 'Herrera', nombreusuario: 'Edher', contraseña: '*****', email: 'eduardoherrera@gmail.com', rol: 'Cajero', telefono: '9876543222', estado: 'Activo' },
        { nombre: 'Patricia', apellido: 'Medina', nombreusuario: 'Pamed', contraseña: '*****', email: 'patriciamedina@gmail.com', rol: 'Cajero', telefono: '9876543223', estado: 'Activo' },
        { nombre: 'Miguel', apellido: 'Ortiz', nombreusuario: 'Miort', contraseña: '*****', email: 'miguelortiz@gmail.com', rol: 'Cajero', telefono: '9876543224', estado: 'Activo' },
        { nombre: 'Diana', apellido: 'Ruiz', nombreusuario: 'Dirui', contraseña: '*****', email: 'dianaruiz@gmail.com', rol: 'Cajero', telefono: '9876543225', estado: 'Activo' },
        { nombre: 'Javier', apellido: 'Mendoza', nombreusuario: 'Jame', contraseña: '*****', email: 'javiermendoza@gmail.com', rol: 'Cajero', telefono: '9876543226', estado: 'Activo' },
        { nombre: 'Gloria', apellido: 'Peña', nombreusuario: 'Glpea', contraseña: '*****', email: 'gloriapena@gmail.com', rol: 'Cajero', telefono: '9876543227', estado: 'Activo' },
        { nombre: 'Fernando', apellido: 'Castro', nombreusuario: 'Fecas', contraseña: '*****', email: 'fernandocastro@gmail.com', rol: 'Cajero', telefono: '9876543228', estado: 'Activo' },

        { nombre: 'Lucía', apellido: 'Hernández', nombreusuario: 'Luher', contraseña: '*****', email: 'luciahernandez@gmail.com', rol: 'Gerente', telefono: '9876543229', estado: 'Activo' },
        { nombre: 'Ricardo', apellido: 'Castillo', nombreusuario: 'Ricas', contraseña: '*****', email: 'ricardocastillo@gmail.com', rol: 'Gerente', telefono: '9876543230', estado: 'Activo' },
        { nombre: 'Gabriela', apellido: 'Fuentes', nombreusuario: 'Gafu', contraseña: '*****', email: 'gabriela@gmail.com', rol: 'Gerente', telefono: '9876543231', estado: 'Activo' },
        { nombre: 'José', apellido: 'Maldonado', nombreusuario: 'Jomal', contraseña: '*****', email: 'josemaldonado@gmail.com', rol: 'Gerente', telefono: '9876543232', estado: 'Activo' },
        { nombre: 'Elena', apellido: 'Rivas', nombreusuario: 'Elriv', contraseña: '*****', email: 'elenarivas@gmail.com', rol: 'Gerente', telefono: '9876543233', estado: 'Activo' },

        { nombre: 'Luis', apellido: 'Ortega', nombreusuario: 'Luort', contraseña: '*****', email: 'luisortega@gmail.com', rol: 'Administrador', telefono: '9876543234', estado: 'Activo' },
        { nombre: 'Patricia', apellido: 'Reyes', nombreusuario: 'Parey', contraseña: '*****', email: 'patriciareyes@gmail.com', rol: 'Administrador', telefono: '9876543235', estado: 'Activo' },
        { nombre: 'Sofía', apellido: 'Morales', nombreusuario: 'Somor', contraseña: '*****', email: 'sofimorales@gmail.com', rol: 'Administrador', telefono: '9876543236', estado: 'Activo' },
        { nombre: 'Andrés', apellido: 'Vargas', nombreusuario: 'Andva', contraseña: '*****', email: 'andresvargas@gmail.com', rol: 'Administrador', telefono: '9876543237', estado: 'Activo' },
        { nombre: 'Lorena', apellido: 'Padilla', nombreusuario: 'Lopa', contraseña: '*****', email: 'lorenapadilla@gmail.com', rol: 'Administrador', telefono: '9876543238', estado: 'Activo' },

        { nombre: 'Felipe', apellido: 'Mena', nombreusuario: 'Feme', contraseña: '*****', email: 'felipemena@gmail.com', rol: 'Gerente', telefono: '9876543239', estado: 'Activo' },
        { nombre: 'Marcela', apellido: 'Valdez', nombreusuario: 'Mava', contraseña: '*****', email: 'marcelavaldez@gmail.com', rol: 'Gerente', telefono: '9876543240', estado: 'Activo' },
        { nombre: 'Alberto', apellido: 'López', nombreusuario: 'Alol', contraseña: '*****', email: 'albertolopez@gmail.com', rol: 'Administrador', telefono: '9876543241', estado: 'Activo' },
        { nombre: 'Raquel', apellido: 'Pineda', nombreusuario: 'Rapi', contraseña: '*****', email: 'raquelpineda@gmail.com', rol: 'Administrador', telefono: '9876543242', estado: 'Activo' },
        { nombre: 'Mauricio', apellido: 'Cardona', nombreusuario: 'Maca', contraseña: '*****', email: 'mauriciocardona@gmail.com', rol: 'Cajero', telefono: '9876543243', estado: 'Activo' }
      ]

    };
  },
  computed: {
    filteredEmpleados() {
      // Filtra los empleados basados en el texto de búsqueda
      return this.empleados.filter(empleado =>
        empleado.nombre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        empleado.apellido.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        empleado.nombreusuario.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedEmpleados() {
      // Si itemsPerPage es vacío, mostramos todos los registros, de lo contrario aplicamos la paginación
      if (this.itemsPerPage === "" || this.itemsPerPage === null) {
        return this.filteredEmpleados;
      } else {
        return this.filteredEmpleados.slice(0, parseInt(this.itemsPerPage));
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
      this.empleadoForm = {
        nombre: '',
        apellido: '',
        nombreusuario: '',
        contraseña: '',
        email: '',
        rol: '',
        telefono: '',
        estado: '',
      };
      this.isEditing = false;
      this.editIndex = null;
    },
    guardarEmpleado() {
      if (this.isEditing) {
        this.empleados[this.editIndex] = { ...this.empleadoForm };
      } else {
        this.empleados.push({ ...this.empleadoForm });
      }
      this.closeModal();
    },
    editEmpleado(index) {
      this.empleadoForm = { ...this.empleados[index] };
      this.isEditing = true;
      this.editIndex = index;
      this.openModal();
    },
    deleteEmpleado(index) {
      this.empleados.splice(index, 1);
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
  margin-top: 0px
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

.empleados-wrapper {
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
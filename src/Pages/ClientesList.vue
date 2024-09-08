<template>
  <div>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="clientes-wrapper">
    <h1> Clientes</h1>

    <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
      Clientes</button>

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
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar cliente..." />
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>DNI / RTN</th>
            <th>Teléfono</th>
            <th>Total Compras</th>
            <th>Última Compra</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in paginatedClientes" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.documentoId }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.totalCompras }}</td>
            <td>{{ cliente.ultimaCompra }}</td>
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
          <label>Nombre:</label>
          <input v-model="clienteForm.nombre" type="text" required>
        </div>

        <div class="form-group">
          <label>DNI / RTN:</label>
          <input v-model="clienteForm.documentoId" type="text" required>
        </div>


        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="clienteForm.telefono" type="text" required>
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="clienteForm.direccion" type="text" required>
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
      itemsPerPage: "", // Valor por defecto para mostrar todos los registros
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      clienteForm: {
        nombre: '',
        documentoId: '',
        telefono: '',
        direccion: '',
        totalCompras: 0,
        ultimaCompra: new Date().toISOString().split('T')[0] // Fecha actual
      },
      clientes: [
        {
          nombre: 'Juan Villegas',
          documentoId: '8161123',
          telefono: '555 57 67',
          direccion: 'calle 27 # 40 - 36',
          totalCompras: 35,
          ultimaCompra: '2017-12-11'
        },
        {
          nombre: 'María Gómez',
          documentoId: '1234567',
          telefono: '555 12 34',
          direccion: 'avenida 5 # 20 - 15',
          totalCompras: 20,
          ultimaCompra: '2020-05-15'
        },
        {
          nombre: 'Carlos López',
          documentoId: '7654321',
          telefono: '555 98 76',
          direccion: 'calle 10 # 30 - 45',
          totalCompras: 50,
          ultimaCompra: '2021-07-23'
        },
        {
          nombre: 'Ana Martínez',
          documentoId: '8976543',
          telefono: '555 67 89',
          direccion: 'carrera 15 # 12 - 50',
          totalCompras: 15,
          ultimaCompra: '2019-09-30'
        },
        {
          nombre: 'Luis Hernández',
          documentoId: '2345678',
          telefono: '555 45 23',
          direccion: 'calle 8 # 22 - 40',
          totalCompras: 40,
          ultimaCompra: '2018-11-21'
        },
        {
          nombre: 'Elena Torres',
          documentoId: '3456789',
          telefono: '555 87 65',
          direccion: 'avenida 9 # 17 - 32',
          totalCompras: 25,
          ultimaCompra: '2022-01-12'
        },
        {
          nombre: 'Fernando Rivera',
          documentoId: '4567890',
          telefono: '555 11 22',
          direccion: 'calle 12 # 45 - 60',
          totalCompras: 60,
          ultimaCompra: '2023-03-02'
        },
        {
          nombre: 'Gloria Castro',
          documentoId: '9876543',
          telefono: '555 55 33',
          direccion: 'carrera 20 # 18 - 80',
          totalCompras: 30,
          ultimaCompra: '2016-08-19'
        },
        {
          nombre: 'Miguel Orozco',
          documentoId: '5678901',
          telefono: '555 33 44',
          direccion: 'calle 25 # 36 - 90',
          totalCompras: 45,
          ultimaCompra: '2015-04-05'
        },
        {
          nombre: 'Sandra Pérez',
          documentoId: '6789012',
          telefono: '555 66 77',
          direccion: 'avenida 13 # 10 - 11',
          totalCompras: 55,
          ultimaCompra: '2021-02-25'
        },
        {
          nombre: 'Diego Montoya',
          documentoId: '7890123',
          telefono: '555 77 88',
          direccion: 'carrera 7 # 40 - 21',
          totalCompras: 65,
          ultimaCompra: '2020-09-10'
        },
        {
          nombre: 'Patricia Suárez',
          documentoId: '8901234',
          telefono: '555 44 55',
          direccion: 'calle 30 # 50 - 60',
          totalCompras: 75,
          ultimaCompra: '2022-11-30'
        },
        {
          nombre: 'Roberto Díaz',
          documentoId: '9012345',
          telefono: '555 88 99',
          direccion: 'avenida 2 # 16 - 22',
          totalCompras: 35,
          ultimaCompra: '2020-06-18'
        },
        {
          nombre: 'Lucía Andrade',
          documentoId: '1023456',
          telefono: '555 11 22',
          direccion: 'calle 5 # 10 - 18',
          totalCompras: 20,
          ultimaCompra: '2023-04-14'
        },
        {
          nombre: 'Daniel Vargas',
          documentoId: '1123456',
          telefono: '555 99 88',
          direccion: 'avenida 8 # 25 - 35',
          totalCompras: 40,
          ultimaCompra: '2021-12-22'
        },
        {
          nombre: 'Paola Mejía',
          documentoId: '1223456',
          telefono: '555 44 33',
          direccion: 'carrera 11 # 17 - 29',
          totalCompras: 50,
          ultimaCompra: '2018-03-10'
        },
        {
          nombre: 'Santiago Molina',
          documentoId: '1323456',
          telefono: '555 22 55',
          direccion: 'calle 19 # 21 - 14',
          totalCompras: 60,
          ultimaCompra: '2019-10-07'
        },
        {
          nombre: 'Claudia Ortega',
          documentoId: '1423456',
          telefono: '555 33 22',
          direccion: 'avenida 6 # 15 - 17',
          totalCompras: 25,
          ultimaCompra: '2017-01-28'
        },
        {
          nombre: 'Eduardo Rojas',
          documentoId: '1523456',
          telefono: '555 66 33',
          direccion: 'carrera 14 # 9 - 20',
          totalCompras: 35,
          ultimaCompra: '2016-05-11'
        },
        {
          nombre: 'Verónica Pérez',
          documentoId: '1623456',
          telefono: '555 55 44',
          direccion: 'calle 31 # 50 - 25',
          totalCompras: 45,
          ultimaCompra: '2020-08-03'
        }
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
    },
    paginatedClientes() {
      // Si itemsPerPage es 0, mostramos todos los registros, de lo contrario aplicamos la paginación
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredClientes
        : this.filteredClientes.slice(0, this.itemsPerPage);
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

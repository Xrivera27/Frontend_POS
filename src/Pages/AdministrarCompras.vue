<template>
    <div class="encabezado">
      <h1>Administrar Compras</h1>
      <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
    </div>
    <hr>
  
    <div class="productos-wrapper">
  
      <div class="action-bar">
        <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">
          Agregar Producto
        </button>
      </div>
  
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
  
      <!-- Botón de exportación PDF -->
      <ExportButton :columns="columns" :rows="rows" fileName="Productos.pdf" />
  
      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar producto..." />
      </div>
  
      <!-- Tabla exportable -->
      <div class="table-container" v-pdf-export ref="table">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Codigo</th>
              <th>Descripcion</th>
              <th>Categoria</th>
              <th>Stock</th>
              <th>Precio Unitario</th>
              <th>Precio Mayorista</th>
              <th>Precio Descuento</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(producto, index) in paginatedProductos" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.categoria }}</td>
              <td>{{ producto.stock }}</td>
              <td>{{ producto.preciounitario }}</td>
              <td>{{ producto.preciomayorista }}</td>
              <td>{{ producto.preciodescuento }}</td>
              <td>{{ producto.fecha }}</td>
              <td>
                <button id="btnEditar" class="btn btn-warning" @click="editProducto(index)">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button id="btnEliminar" class="btn btn-danger" @click="deleteProducto(index)">
                  <b><i class="bi bi-x-lg"></i></b>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Modal para agregar o editar productos -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <h2 class="h2-modal-content">{{ isEditing ? 'Editar Producto' : 'Agregar Producto' }}</h2>
  
          <div class="form-group">
            <label>Codigo:</label>
            <input v-model="productoForm.codigo" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Descripcion:</label>
            <input v-model="productoForm.descripcion" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Categoria:</label>
            <input v-model="productoForm.categoria" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Stock:</label>
            <input v-model="productoForm.stock" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Precio Unitario:</label>
            <input v-model="productoForm.preciounitario" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Precio Mayorista:</label>
            <input v-model="productoForm.preciomayorista" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Precio Descuento:</label>
            <input v-model="productoForm.preciodescuento" type="text" required>
          </div>
  
          <div class="form-group">
            <label>Fecha:</label>
            <input v-model="productoForm.fecha" type="date" required>
          </div>
  
          <button id="AddProductoModal" class="btn btn-primary" @click="guardarProducto">
            {{ isEditing ? 'Guardar Cambios' : 'Agregar Producto' }}
          </button>
          <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ProfileButton from '../components/ProfileButton.vue';
  import ExportButton from '../components/ExportButton.vue';
  
  export default {
    components: {
      ProfileButton,
      ExportButton
    },
    data() {
      return {
        searchQuery: '',
        isModalOpen: false,
        isEditing: false,
        editIndex: null,
        itemsPerPage: "",
        productoForm: {
          codigo: '',
          descripcion: '',
          categoria: '',
          stock: '',
          preciounitario: '',
          preciomayorista: '',
          preciodescuento: '',
          fecha: ''
        },
        productos: [
          { codigo: '1504', descripcion: 'Mortal Kombat X', categoria: 'Videojuegos', stock: '45', preciounitario: 'L. 450.00', preciomayorista: 'L. 350.00', preciodescuento: 'L. 400.00', fecha: '2017-12-11' },
          { codigo: '1505', descripcion: 'Call of Duty: Modern Warfare', categoria: 'Videojuegos', stock: '30', preciounitario: 'L. 600.00', preciomayorista: 'L. 500.00', preciodescuento: 'L. 550.00', fecha: '2020-05-21' },
          { codigo: '1506', descripcion: 'God of War', categoria: 'Videojuegos', stock: '25', preciounitario: 'L. 700.00', preciomayorista: 'L. 600.00', preciodescuento: 'L. 650.00', fecha: '2018-04-15' },
          { codigo: '1507', descripcion: 'The Last of Us Part II', categoria: 'Videojuegos', stock: '35', preciounitario: 'L. 800.00', preciomayorista: 'L. 700.00', preciodescuento: 'L. 750.00', fecha: '2020-06-19' },
          { codigo: '1508', descripcion: 'FIFA 21', categoria: 'Videojuegos', stock: '50', preciounitario: 'L. 550.00', preciomayorista: 'L. 450.00', preciodescuento: 'L. 500.00', fecha: '2020-10-09' },
          { codigo: '1509', descripcion: 'Red Dead Redemption 2', categoria: 'Videojuegos', stock: '20', preciounitario: 'L. 900.00', preciomayorista: 'L. 800.00', preciodescuento: 'L. 850.00', fecha: '2018-10-26' },
          { codigo: '1510', descripcion: 'Spider-Man', categoria: 'Videojuegos', stock: '40', preciounitario: 'L. 500.00', preciomayorista: 'L. 400.00', preciodescuento: 'L. 450.00', fecha: '2018-09-07' },
          { codigo: '1511', descripcion: 'Minecraft', categoria: 'Videojuegos', stock: '60', preciounitario: 'L. 350.00', preciomayorista: 'L. 300.00', preciodescuento: 'L. 320.00', fecha: '2019-12-20' },
          { codigo: '1512', descripcion: 'Fortnite (Paquete Deluxe)', categoria: 'Videojuegos', stock: '70', preciounitario: 'L. 200.00', preciomayorista: 'L. 150.00', preciodescuento: 'L. 180.00', fecha: '2021-03-10' },
          { codigo: '1513', descripcion: 'NBA 2K21', categoria: 'Videojuegos', stock: '30', preciounitario: 'L. 600.00', preciomayorista: 'L. 500.00', preciodescuento: 'L. 550.00', fecha: '2020-09-04' },
          { codigo: '1514', descripcion: 'Assassin’s Creed Valhalla', categoria: 'Videojuegos', stock: '28', preciounitario: 'L. 750.00', preciomayorista: 'L. 650.00', preciodescuento: 'L. 700.00', fecha: '2020-11-10' },
          { codigo: '1515', descripcion: 'Cyberpunk 2077', categoria: 'Videojuegos', stock: '22', preciounitario: 'L. 900.00', preciomayorista: 'L. 800.00', preciodescuento: 'L. 850.00', fecha: '2020-12-10' },
          { codigo: '1516', descripcion: 'Gears 5', categoria: 'Videojuegos', stock: '40', preciounitario: 'L. 550.00', preciomayorista: 'L. 450.00', preciodescuento: 'L. 500.00', fecha: '2019-09-06' },
          { codigo: '1517', descripcion: 'Resident Evil Village', categoria: 'Videojuegos', stock: '15', preciounitario: 'L. 800.00', preciomayorista: 'L. 700.00', preciodescuento: 'L. 750.00', fecha: '2021-05-07' },
          { codigo: '1518', descripcion: 'Grand Theft Auto V', categoria: 'Videojuegos', stock: '50', preciounitario: 'L. 650.00', preciomayorista: 'L. 550.00', preciodescuento: 'L. 600.00', fecha: '2013-09-17' },
          { codigo: '1519', descripcion: 'Horizon Zero Dawn', categoria: 'Videojuegos', stock: '25', preciounitario: 'L. 700.00', preciomayorista: 'L. 600.00', preciodescuento: 'L. 650.00', fecha: '2017-02-28' },
          { codigo: '1520', descripcion: 'Dark Souls III', categoria: 'Videojuegos', stock: '20', preciounitario: 'L. 750.00', preciomayorista: 'L. 650.00', preciodescuento: 'L. 700.00', fecha: '2016-04-12' },
          { codigo: '1521', descripcion: 'Sekiro: Shadows Die Twice', categoria: 'Videojuegos', stock: '30', preciounitario: 'L. 850.00', preciomayorista: 'L. 750.00', preciodescuento: 'L. 800.00', fecha: '2019-03-22' },
          { codigo: '1522', descripcion: 'The Witcher 3: Wild Hunt', categoria: 'Videojuegos', stock: '35', preciounitario: 'L. 600.00', preciomayorista: 'L. 500.00', preciodescuento: 'L. 550.00', fecha: '2015-05-19' },
          { codigo: '1523', descripcion: 'Far Cry 5', categoria: 'Videojuegos', stock: '40', preciounitario: 'L. 500.00', preciomayorista: 'L. 400.00', preciodescuento: 'L. 450.00', fecha: '2018-03-27' },
          { codigo: '1524', descripcion: 'Battlefield V', categoria: 'Videojuegos', stock: '18', preciounitario: 'L. 650.00', preciomayorista: 'L. 550.00', preciodescuento: 'L. 600.00', fecha: '2018-11-20' }
        ],
        columns: [
          { header: '#', dataKey: 'index' },
          { header: 'Código', dataKey: 'codigo' },
          { header: 'Descripción', dataKey: 'descripcion' },
          { header: 'Categoría', dataKey: 'categoria' },
          { header: 'Stock', dataKey: 'stock' },
          { header: 'Precio Unitario', dataKey: 'preciounitario' },
          { header: 'Precio Mayorista', dataKey: 'preciomayorista' },
          { header: 'Precio Descuento', dataKey: 'preciodescuento' },
          { header: 'Fecha', dataKey: 'fecha' }
        ],
        rows: []
      };
    },
    computed: {
      filteredProductos() {
        return this.productos.filter(producto =>
          producto.codigo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          producto.descripcion.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      paginatedProductos() {
        if (this.itemsPerPage === "" || this.itemsPerPage === null) {
          return this.filteredProductos;
        } else {
          return this.filteredProductos.slice(0, parseInt(this.itemsPerPage));
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
        this.productoForm = {
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
      guardarProducto() {
        if (this.isEditing) {
          this.productos[this.editIndex] = { ...this.productoForm };
        } else {
          this.productos.push({ ...this.productoForm });
        }
        this.closeModal();
      },
      editProducto(index) {
        this.productoForm = { ...this.productos[index] };
        this.isEditing = true;
        this.editIndex = index;
        this.openModal();
      },
      deleteProducto(index) {
        this.productos.splice(index, 1);
      },
      generateRows() {
        // Genera las filas basadas en los productos paginados
        this.rows = this.paginatedProductos.map((producto, index) => ({
          index: index + 1,
          codigo: producto.codigo,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          stock: producto.stock,
          preciounitario: producto.preciounitario,
          preciomayorista: producto.preciomayorista,
          preciodescuento: producto.preciodescuento,
          fecha: producto.fecha
        }));
        console.log('Filas generadas:', this.rows);
      }
    },
    watch: {
      // Cuando cambie la paginación o el filtro, actualiza las filas
      paginatedProductos() {
        this.generateRows();
      }
    },
    mounted() {
      // Genera las filas al cargar el componente
      this.generateRows();
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
  
  #btnAdd {
    background-color: #c09d62;
    font-size: 16px;
    width: 200px;
    height: 40px;
    border-radius: 10px;
    color: black;
    font-weight: bold;
    margin-bottom: 15px;
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
  
  .busqueda {
    float: right;
    padding: 10px;
    font-size: 14px;
    border-radius: 10px;
    border-width: 0.5px;
    margin-top: -40px;
    margin-bottom: 20px;
  }
  
  
  .productos-wrapper {
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
  
  .h2-modal-content {
    margin-top: 0px;
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
  
  .action-bar {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .btn-export {
    background-color: #4CAF50;
    color: white;
    font-size: 16px;
    border-radius: 5px;
    padding: 10px 20px;
    margin-right: 10px;
  }
  
  .btn-export:hover {
    background-color: #45a049;
  }
  </style>
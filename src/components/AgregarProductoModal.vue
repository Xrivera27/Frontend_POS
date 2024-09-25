<template>
  <button
    id="registrar-producto"
    class="btn btn-success"
    type="button"
    @click="openModal"
  >
    <b>Registrar nuevo Inv.</b>
  </button>

  <div v-if="isModalOpen" class="modal">
    <div id="modal-producto" class="modal-content">
      <h2 class="h2-modal-content">
        {{ isEditing ? "Editar Producto" : "Agregar Producto" }}
      </h2>

      <div class="contenedor-principal">
        <div class="contenedor contenedor-izquierdo">
          <div class="form-group">
            <label>Codigo:</label>
            <input v-model="productoForm.codigo" type="text" required />
          </div>

          <div class="form-group">
            <label>Descripcion:</label>
            <input v-model="productoForm.descripcion" type="text" required />
          </div>

          <div class="form-group">
            <label>Precio Unitario:</label>
            <input v-model="productoForm.preciounitario" type="text" required />
          </div>

          <div class="form-group">
            <label>Precio Mayorista:</label>
            <input
              v-model="productoForm.preciomayorista"
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Cantidad ingresada en esta ocasión:</label>
            <input v-model="productoForm.stock" type="text" />
          </div>
        </div>
        <div class="contenedor contenedor-derecho">
          <div class="form-group">
            <label for="proveedor">Selecciona proveedor del producto:</label>
            <div id="proveedor-contenedor" >
                <select class="form-select" id="proveedor" name="proveedor">
              <option value="impuesto1">Proveedor 1</option>
              <option value="impuesto2">Proveedor 2</option>
              <option value="impuesto3">Proveedor 3</option>
            </select>
            <Proveedor/>
            </div>
            
            

          </div>

          <div class="form-group">
            <label for="proveedor">Selecciona impuesto del producto:</label>
            <select class="form-select" id="isv" name="isv">
              <option value="impuesto1">Impuesto 1</option>
              <option value="impuesto2">Impuesto 2</option>
              <option value="impuesto3">Impuesto 3</option>
            </select>
          </div>

          <div class="form-group">
            <label>Stock max:</label>
            <input v-model="productoForm.stockMax" type="text" required />
          </div>

          <div class="form-group">
            <label>Stock min:</label>
            <input v-model="productoForm.stockMin" type="text" required />
          </div>

          <div class="form-group form-categoria">
            <label>Asignar categorías al producto:</label>
            <button @click="openModalCategoria" class="btn">Seleccionar categorías</button>
          </div>

          <div v-if="isModalCategoriaOpen" class="modal">
            <div class="modal-content modal-content-categoria" >
<div class="categoria-encabezado" >
    <h3>Selecciona categorias del producto</h3>
                <div class="search-bar form-group">
      <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar categoria..." />
    </div>
</div>
                
                    <div class="categoria-contenedor">
                        <form class="form-form-categoria">
                            
                            <label class="label-categoria"
                            v-for="(categoria, index) in filteredCategorias"
                            :key="index"
                            :class="{ 'primer-label': (index+1)%2 == 0 }"
                            ><input 
                            type="checkbox" 
                            name="{{ categoria.nombre }}" 
                            id="{{ categoria.nombre }}"
                            >{{ categoria.nombre }}
                            <br v-if="(index+1)%2 == 0" class="br-label">
                        </label>
                        
                        
                        </form>
                    </div>
                    <div class="categoria-botones" >

                    <button @click="closeModalCategoria" class="btn btn-primary">Guardar</button>
                    <button @click="closeModalCategoria" class="btn btn-secondary">Cerrar</button>
                </div>

            </div>

          </div>

        </div>
      </div>

      <button
        id="AddProductoModal"
        class="btn btn-primary"
        @click="guardarProducto"
      >
        {{ isEditing ? "Guardar Cambios" : "Agregar Producto" }}
      </button>
      <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script>
import Proveedor from "../components/AgregarProveedor.vue"
export default {
    components:{
        Proveedor,
    },
  data() {
    return {
      searchQuery: "",
      isModalOpen: false,
      isModalCategoriaOpen: false,
      isEditing: false,
      editIndex: null,
      itemsPerPage: "",
      salto: false,
      productoForm: {
        codigo: "",
        descripcion: "",
        categoria: "",
        stockMax: "",
        stockMin: "",
        stock: "",
        preciounitario: "",
        preciomayorista: "",
        preciodescuento: "",
        fecha: "",
      },
    categorias: [
    { nombre: 'Videojuegos' },
    { nombre: 'Electrónica' },
    { nombre: 'Ropa' },
    { nombre: 'Calzado' },
    { nombre: 'Juguetes' },
    { nombre: 'Libros' },
    { nombre: 'Muebles' },
    { nombre: 'Hogar y Cocina' },
    { nombre: 'Herramientas' },
    { nombre: 'Deportes' },
    { nombre: 'Accesorios' },
    { nombre: 'Instrumentos Musicales' },
    { nombre: 'Salud y Belleza' },
    { nombre: 'Jardinería' },
    { nombre: 'Automóviles' },
    { nombre: 'Mascotas' },
    { nombre: 'Fotografía' },
    { nombre: 'Alimentos y Bebidas' },
    { nombre: 'Papelería' },
    { nombre: 'Relojes' },
    { nombre: 'Teléfonos Móviles' },
    { nombre: 'Bicicletas' },
    { nombre: 'Equipos de Camping' },
    { nombre: 'Arte y Manualidades' },
    { nombre: 'Viajes' },
    { nombre: 'Películas' },
    { nombre: 'Cómics' },
    { nombre: 'Coleccionables' },
    { nombre: 'Joyería' },
    { nombre: 'Vinos y Licores' }
]

    };
  },

  computed: {
    filteredCategorias() {
      return this.categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

 

  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    openModalCategoria() {
      this.isModalCategoriaOpen = true;
    },
    closeModalCategoria() {
      this.isModalCategoriaOpen = false;
      this.clearForm();
    },
    clearForm() {
      this.productoForm = {
        codigo: "",
        descripcion: "",
        categoria: "",
        stock: "",
        preciounitario: "",
        preciomayorista: "",
        preciodescuento: "",
        fecha: "",
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
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
}

#modal-producto{
    max-width: 60%;
    min-width: 500px;
    justify-content: center;
    align-items: center;
}

.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

.form-categoria {
  display: flex;
  flex-direction: column;
}

#proveedor-contenedor{
    display: flex;
    align-items: center
}

.primer-label{
    margin-left: 10px;
}

.br-label{
margin-bottom: 10px;
}

.modal-content-categoria{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 30%;
    height: 72%;
    min-height: 500px;
    min-width: 300px;
}

.form-form-categoria{
    padding: 20px;
    padding-top: 0;
    height: 240px;
    overflow-y: scroll;
}

.categoria-botones{
    width: 100%;
    margin-top: 20px;
    display: flex;
    justify-content: space-evenly;
}

.btn {
  padding: 8px 16px;
  margin-bottom: 4px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

#AddProductoModal, #BtnCerrar{
    width: 80%;
}

.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #066bd8;
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
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
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

.stock-group {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.stock-group label {
  margin: 5px;
}

button {
  cursor: pointer;
}

#registrar-producto {
  background-color: rgb(253, 253, 56);
  margin-left: 30px;
}

#registrar-producto:hover {
  background-color: rgb(228, 228, 48);
  transform: scale(1.05);
  transition: all 0.3s ease;
}
</style>

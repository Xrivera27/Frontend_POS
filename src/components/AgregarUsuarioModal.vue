<template>
  <button id="registrar-usuario" class="btn btn-success" type="button" @click="openModal">
    <b>Registrar nuevo Inv.</b>
  </button>

  <div v-if="isModalOpen" class="modal">
    <div id="modal-usuario" class="modal-content">
      <h2 class="h2-modal-content">
        {{ isEditing ? "Editar Usuario" : "Agregar Usuario" }}
      </h2>

      <div class="contenedor-principal">
        <div class="contenedor contenedor-izquierdo">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="usuarioForm.nombre" type="text" required />
          </div>

          <div class="form-group">
            <label>Apellido:</label>
            <input v-model="usuarioForm.apellido" type="text" required />
          </div>

          <div class="form-group">
            <label>Nombre de Usuario:</label>
            <input v-model="usuarioForm.nombreUsuario" type="text" required />
          </div>
          <div class="form-group">
            <label>Correo:</label>
            <input v-model="usuarioForm.correo" type="text" required />
          </div>

          
        </div>
        <div class="contenedor contenedor-derecho">
          <div class="form-group">
            <label>Telefono:</label>
            <input v-model="usuarioForm.telefono" type="text" />
          </div>
          <div class="form-group">
            <label>Direccion:</label>
            <input v-model="usuarioForm.direccion" type="text" required />
          </div>
          <div class="form-group">
            <label>Contraseña:</label>
            <input v-model="usuarioForm.contra" type="password" required />
          </div>

          <div class="form-group">
            <label>Confirmar Contraseña:</label>
            <input v-model="usuarioForm.confirmContra" type="password" />
          </div>

        </div>
      </div>
      <div class="form-group form-group-select">
            <label for="sucursal">Selecciona sucursal:</label>
            <select class="form-select" id="sucursal" name="sucursal">
            </select>
          </div>
      <button id="AddUsuarioModal" class="btn btn-primary" @click="guardarUsuario">
        {{ isEditing ? "Guardar Cambios" : "Agregar Usuario" }}
      </button>
      <button id="BtnCerrar" class="btn btn-secondary" @click="closeModal">
        Cerrar
      </button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      searchQuery: "",
      isModalOpen: false,
      isModalCategoriaOpen: false,
      isEditing: false,
      editIndex: null,
      itemsPerPage: "",
      salto: false,
      usuarioForm: {
        nombre: "",
        apellido: "",
        nombreUsuario: "",
        correo: "",
        telefono: "",
        direccion: "",
        contra: "",
        confirmContra: "",
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
      console.log(this.datosUsuario);
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
      this.usuarioForm = {
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
    guardarUsuario() {

      if (this.isEditing) {
        this.usuarios[this.editIndex] = { ...this.usuarioForm };
      } else {
        this.usuarios.push({ ...this.usuarioForm });
      }
      this.closeModal();

    },
    editUsuario(index) {
      this.usuarioForm = { ...this.usuarios[index] };
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

/* Modal general */
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

#modal-usuario {
  max-width: 60%;
  min-width: 500px;
  justify-content: center;
  align-items: center;
}

.h2-modal-content {
  margin-top: 0;
}

#AddUsuarioModal,
#BtnCerrar {
  width: 80%;
}

/* Contenedores */
.contenedor-principal {
  display: flex;
  width: 100%;
  justify-content: space-around;
}

.contenedor {
  width: 45%;
}

/* Formularios */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flexbox;
  margin-bottom: 8px;
}

.form-group-select{
  min-width: 80%;
  display: flexbox;
  flex-direction: row;
  margin-bottom: 5px;
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

/* Selectores */
.form-select {
  width: 100%;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 16px;
}

/* Botones */
.btn {
  padding: 8px 16px;
  margin-bottom: 4px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-success{
  min-height: 80px;
  max-width: 90px;
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

/* Botón registrar usuario */
#registrar-usuario {
  background-color: rgb(253, 253, 56);
  margin-left: 30px;
  height: 50px;
}

#registrar-usuario:hover {
  background-color: rgb(228, 228, 48);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

/* Categorías */
.form-categoria {
  display: flex;
  flex-direction: column;
}

#proveedor-contenedor {
  display: flex;
  align-items: center;
}

/* Modal de categorías */
.modal-content-categoria {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 30%;
  height: 72%;
  min-height: 500px;
  min-width: 300px;
}

.form-form-categoria {
  padding: 20px;
  padding-top: 0;
  height: 240px;
  overflow-y: scroll;
}

.categoria-botones {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-evenly;
}

.categoria-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.label-categoria {
  display: inline-block;
  margin-right: 20px;
  margin-bottom: 10px;
}

.primer-label {
  margin-left: 10px;
}

.br-label {
  margin-bottom: 10px;
}
</style>

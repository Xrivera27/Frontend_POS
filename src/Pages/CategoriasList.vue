<template>
  <div class="encabezado">
    <h1>Categorias</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr>

  <div class="categorias-wrapper">
    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Categoría</button>

      <RouterLink to="promociones-categorias">
        <button class="button-promocion">Promociones</button>
      </RouterLink>

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
            <td>{{ categoria.nombre_categoria }}</td>
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
          <input v-model="categoriaForm.nombre_categoria" type="text" required>
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

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";

export default {
  components:
  {
    ProfileButton,
  },
  data() {
    return {
      searchQuery: '', // Almacena el texto de búsqueda
      itemsPerPage: "",
      id_usuario:'', // Valor por defecto para mostrar todos los registros
      categorias: [
      ],
      isModalOpen: false, // Estado para controlar si el modal está abierto o cerrado
      isEditing: false, // Estado para verificar si estamos editando una categoría
      categoriaForm: { nombre_categoria: '', descripcion: '' }, // Objeto para el formulario de categorías
    };
  },

  async mounted() {
    document.title = "Categorías";
    this.changeFavicon('/img/spiderman.ico');


    try {
      this.id_usuario = await solicitudes.solicitarUsuario("/sesion-user");
      console.log(`Id de usuario ${this.id_usuario}`);

      this.categorias = await solicitudes.fetchRegistros(
        `/categoria-producto/${this.id_usuario}`
      );

    } catch (error) {
      console.log(error); //modal error pendiente
    }

    
  },
  computed: {
    filteredCategorias() {
      // Filtra las categorías basados en el texto de búsqueda
      return this.categorias.filter(categoria =>
        categoria.nombre_categoria.toLowerCase().includes(this.searchQuery.toLowerCase())
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
      this.categoriaForm = { nombre_categoria: '', descripcion: '' }; // Resetea el formulario
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
      this.editIndex = index;
    },
    // deleteCategoria(index) {
    //   // Implementa la lógica para eliminar una categoría
    //   this.categorias.splice(index, 1);
    // },
    async deleteCategoria(index) {
      let response;

      const datosActualizados = {
        estado: false,
      };

      const parametros = `/categoria-producto/desactivar-categoria/${this.categorias[index].id_categoria}`;

      try {
        response = await solicitudes.desactivarRegistro(
          parametros,
          datosActualizados
        );

        if (response == true) {
          this.categorias.splice(index, 1);
        }
      } catch (error) {
        alert(new Error(response));
      }
    },

    // guardarCategoria() {
    //   if (this.isEditing) {
    //     // Actualiza una categoría existente
    //     const index = this.categorias.findIndex(c => c.nombre_categoria === this.categoriaForm.nombre_categoria);
    //     if (index !== -1) {
    //       this.$set(this.categorias, index, this.categoriaForm);
    //     }
    //   } else {
    //     // Agrega una nueva categoría
    //     this.categorias.push(this.categoriaForm);
    //   }
    //   this.closeModal();
    // },
    
    async guardarCategoria() {
      let response;
      let parametros;
      this.categoriaForm.id_usuario = this.id_usuario;
      if (this.isEditing) {
        try {
          
          parametros = `/categoria-producto/actualizar-categoria/${
            this.categorias[this.editIndex].id_categoria
          }`;
          response = await solicitudes.patchRegistro(
            parametros,
            this.categoriaForm
          );
          

          if (response == true) {

            Object.assign(this.categorias[this.editIndex], this.categoriaForm);
          } else alert(response);
        } catch (error) {
          alert(error);
        }
      } else {
        parametros = `/categoria-producto/crear-categoria`;
        try {
          response = await solicitudes.postRegistro(
            parametros,
            this.categoriaForm
          );

          if (response.length > 0) {
           
           this.categorias.push( response[0] );
 
           }  else {
            throw response;
          }
        } catch (error) {
          alert(error);
        }
      }
      this.closeModal();
    },


    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },

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

.categorias-wrapper {
  padding: 16px;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-promocion {
  background-color: #4cafaf;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

#btnAdd {
  background-color: #c09d62;
  font-size: 16px;
  width: 170px;
  height: 40px;
  border-radius: 10px;
  color: black;
  font-weight: bold;
}

#btnAdd:hover {
  background-color: #a38655;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEditar,
#btnEliminar {
  font-size: 18px;
  width: 50px;
  height: 40px;
  border-radius: 10px;
}

#btnEditar {
  background-color: #ffc107;
}

#btnEditar:hover {
  background-color: #e8af06;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#btnEliminar {
  color: black;
}

#btnEliminar:hover {
  background-color: #b72433;
  transform: scale(1.05);
  transition: all 0.3s ease;
}

#AddCategoriaModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
}

#AddCategoriaModal {
  background-color: #007bff;
  color: #fff;
}

#BtnCerrar {
  background-color: rgb(93, 100, 104);
  color: #fff;
}

.export-button {
  margin: 0;
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

/* Formulario */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  margin-bottom: 8px;
}

.form-group input,
.descriptionForm {
  width: 95%;
  height: 25%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.descriptionForm {
  resize: vertical;
}

/* Estilos para textarea */
textarea {
  width: 100%;
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

/* Estilos generales */
.container-top {
  width: 100%;
  text-align: right;
}

.rol {
  color: #969696;
  font-size: 14px;
}

select,
.custom-select {
  border: 1px solid #ccc;
  border-radius: 5px;
  height: 35px;
  font-size: 16px;
  margin: 10px 5px;
}

.custom-select {
  padding: 5px;
  background-color: #fff;
  cursor: pointer;
  width: 80px;
}

.custom-select:focus {
  outline: none;
  border-color: #a38655;
}

.custom-select option {
  font-size: 16px;
}

/* Barra de búsqueda */
.busqueda {
  float: right;
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
}

/* Tabla */
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
</style>

<template>

  <div class="categorias-wrapper">
    <PageHeader :titulo="titulo" />
    <div class="opciones">
      <button id="btnAdd" class="btn btn-primary" @click="openModal" style="width: 200px; white-space: nowrap;">Agregar
        Unidad</button>

      <RouterLink to="categorias">
        <button class="button-categorias">Categorias</button>
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
            <th>Nombre unidad Inventario</th>
            <th>Productos usados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unidad, index) in paginatedUnidades" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ unidad.medida }}</td>
            <td class="totalProductos">{{ unidad.totalProductos }}
              <button class="btn mostrar-producto" @click="mostrarModalProductos(unidad.id_medida)">Mostrar
                Prod.</button>
            </td>
            <td>
              <button id="btnEditar" class="btn btn-warning" @click="editUnidad(unidad)"><i
                  class="bi bi-pencil-fill"></i></button>
              <button id="btnEliminar" class="btn btn-danger" @click="deleteUnidad(unidad)"><b><i
                    class="bi bi-x-lg"></i></b></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar o editar categorías -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Unidad' : 'Agregar Unidad' }}</h2>

        <div class="form-group">
          <label>Nombre de unidad de inventario:</label>
          <input v-model="unidadForm.medida" type="text" required>
        </div>
        <div class="contenedor-botones">
          <btnGuardarModal :texto="isEditing ? 'Guardar Cambios' : 'Agregar Unidad'" @click="guardarUnidad">
          </btnGuardarModal>
          <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>



      </div>
    </div>


    <!-- Modal para mostrar productos con esa id medida -->
    <div v-if="isModalProductosOpen" class="modal">
      <div class="modal-content">
        <h2>Lista de productos</h2>
        <div class="table-container table-modal-container">
          <table class="table table-modal">
            <thead>
              <tr>
                <th>Codigo de producto</th>
                <th>Nombre de producto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="producto in mostrarProductosModal" :key="producto.codigo_producto">
                <td>{{ producto.codigo_producto }}</td>
                <td>{{ producto.nombre }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="contenedor-botones">
          <btnCerrarModal :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>

      </div>
    </div>

  </div>
</template>

<script>

//componentes
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import validarCamposService from '../../services/validarCampos.js';
import { notificaciones } from '../../services/notificaciones.js';
import { useToast } from "vue-toastification";

// importando solicitudes
import solicitudes from "../../services/solicitudes.js";
import { getUnidadMedidaEmpresas, postUnidad, patchUnidad, getProductosUnidad, eliminarUnidad } from "../../services/unidadMedidaSolicitud.js";


export default {
  components:
  {
    PageHeader,
    btnGuardarModal,
    btnCerrarModal,
  },
  data() {
    return {
      titulo: 'Unidades de Inventario y Venta',
      searchQuery: '', // Almacena el texto de búsqueda
      itemsPerPage: "",
      id_usuario: '', // Valor por defecto para mostrar todos los registros
      unidadesMedida: [],
      mostrarProductos: [],
      isModalOpen: false,
      isModalProductosOpen: false, // Estado para controlar si el modal está abierto o cerrado
      isEditing: false, // Estado para verificar si estamos editando una categoría
      unidadForm: { medida: '' }, // Objeto para el formulario de categorías
    };
  },

  async mounted() {
    document.title = "Presentaciones";
    this.changeFavicon('/img/spiderman.ico');
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();


      this.unidadesMedida = await getUnidadMedidaEmpresas(this.id_usuario);

    } catch (error) {
      console.log(error); //modal error pendiente
    }
  },
  computed: {
    filteredUnidades() {
      // Filtra las categorías basados en el texto de búsqueda
      return this.unidadesMedida.filter(unidad =>
        unidad.medida.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedUnidades() {
      // Si itemsPerPage es 0, mostramos todos los registros, de lo contrario aplicamos la paginación
      return this.itemsPerPage === "" || this.itemsPerPage === null
        ? this.filteredUnidades
        : this.filteredUnidades.slice(0, this.itemsPerPage);
    },
    mostrarProductosModal() {
      return this.mostrarProductos;
    },
  },
  methods: {
    validarCampos(unidadForm) {
      const campos = {
        Medida: unidadForm.medida,
      };

      if (!validarCamposService.validarEmpty(campos)) {
        return false;
      }

      return true;
    },

    openModal() {
      // Resetea el formulario y abre el modal
      this.isModalOpen = true;
      this.isEditing = false;
      this.unidadForm = { medida: '', descripcion: '' }; // Resetea el formulario
    },
    closeModal() {
      // Cierra el modal
      this.isModalOpen = false;
      this.isModalProductosOpen = false;
    },
    editUnidad(unidad) {
      // Implementa la lógica para editar una categoría
      this.isModalOpen = true;
      this.isEditing = true;
      this.unidadForm = { ...unidad };
      this.editIndex = this.unidadesMedida.findIndex(item => item.id_medida === unidad.id_medida);
    },

    async mostrarModalProductos(id_medida) {
      try {
        this.mostrarProductos = await getProductosUnidad(id_medida);
        console.log(this.mostrarProductos);
        this.isModalProductosOpen = true;
      } catch (error) {
        console.log(error);
      }
    },

    async deleteUnidad(unidad) {
      const toast = useToast();
      if (unidad.totalProductos > 0) {
        toast.error('Productos existentes dentro de esta unidad');
        return;
      }

      try {
        const response = await eliminarUnidad(unidad.id_medida);

        if (response.success === false) {
          throw response.message;
        }

        if (response === true) {
          this.unidadesMedida = this.unidadesMedida.filter(item => item.id_medida !== unidad.id_medida);
        }

      } catch (error) {
        notificaciones('error', error);
      }

    },

    async guardarUnidad() {
      if (!this.validarCampos(this.unidadForm)) {
        return;
      }

      validarCamposService.formSuccess();
      this.unidadForm.id_usuario = this.id_usuario;
      if (this.isEditing) {
        try {

          const nuevoRegistro = await patchUnidad(this.unidadForm, this.unidadesMedida[this.editIndex].id_medida);
          if (nuevoRegistro == true) {

            Object.assign(this.unidadesMedida[this.editIndex], this.unidadForm);

          }
        } catch (error) {
          notificaciones('error', error.message);
        }
      } else {

        try {
          const nuevoRegistro = await postUnidad(this.unidadForm);
          this.unidadesMedida.push(nuevoRegistro[0]);
        } catch (error) {
          notificaciones('error', error.message);
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
  box-sizing: border-box;
}

.categorias-wrapper {
  padding: 16px;
  width: 100%;
  overflow-x: hidden;
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.button-categorias {
  background-color: #4caf4c;
  color: #000;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  font-size: clamp(14px, 2vw, 16px);
}

.btn {
  padding: 8px 10px;
  margin: 4px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: clamp(14px, 2vw, 16px);
}

.mostrar-producto {
  background-color: #2b8cf3;
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
  white-space: nowrap;
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

#AddUnidadModal,
#BtnCerrar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
}

#AddUnidadModal {
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
  padding: 1rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  width: 90%;
  max-width: 400px;
  min-height: 250px;
  margin: 20px;
}

/* Formulario */
.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  margin-bottom: 8px;
  display: block;
}

.form-group input,
.descriptionForm {
  width: 100%;
  height: 35px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.descriptionForm {
  resize: vertical;
  min-height: 100px;
}

/* Estilos para textarea */
textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
  min-height: 100px;
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
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
}

/* Tabla */
.table-container {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 16px;
  height: auto;
  max-height: 480px;
  overflow-x: auto;
  overflow-y: auto;
}

.table-modal-container {
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
}

.table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
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

/* Custom scrollbar */
.table-container::-webkit-scrollbar,
.table-modal-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track,
.table-modal-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb,
.table-modal-container::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover,
.table-modal-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Media Queries */
@media screen and (max-width: 768px) {
  .opciones {
    flex-direction: column;
    align-items: stretch;
  }

  .busqueda,
  #btnAdd {
    width: 100%;
    margin: 8px 0;
  }

  .custom-select {
    width: 100%;
    max-width: none;
  }

  #btnEditar,
  #btnEliminar {
    width: 40px;
    height: 35px;
    font-size: 14px;
    padding: 8px;
  }

  .table-container {
    margin-top: 24px;
  }

  #AddUnidadModal,
  #BtnCerrar {
    width: 100%;
    margin: 8px 0;
  }

  .button-categorias {
    width: 100%;
  }
}

@media screen and (max-width: 480px) {

  .modal-content {
    width: 95%;
    padding: 15px;
    margin: 10px;
  }

  .table thead th,
  .table tbody td {
    padding: 6px;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  #btnAdd {
    font-size: 14px;
    height: 35px;
  }

  .rol {
    text-align: center;
    margin-top: 8px;
  }

  textarea,
  .descriptionForm {
    min-height: 80px;
  }
}

/* =======================================================
   Modo Oscuro
======================================================= */
/* Contenedor principal */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

/* Inputs y búsqueda en modo oscuro */
.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .custom-select option {
  background-color: #2d2d2d;
  color: #fff;
}

/* Tabla en modo oscuro */
.dark .table-container {
  border-color: #404040;
  background-color: #2d2d2d;
}

.dark .table thead {
  background-color: #2d2d2d;
}

.dark .table th {
  background-color: #383838;
  color: #fff;
  border-color: #404040;
}

.dark .table td {
  color: #fff;
  border-color: #404040;
}

.dark .table tr:hover {
  background-color: #383838;
}

/* Modal en modo oscuro */
.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .modal-content input,
.dark .modal-content textarea {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .form-group label {
  color: #fff;
}

/* Scroll personalizado en modo oscuro */
.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Botones en modo oscuro (manteniendo los colores originales) */
.dark .button-promocion {
  background-color: #4cafaf;
  color: white;
}

.dark .button-unidad-medida {
  background-color: #4caf4c;
  color: #000;
}

.dark #btnAdd {
  background-color: #c09d62;
  color: black;
}

.dark #btnAdd:hover {
  background-color: #a38655;
}

.dark #btnEditar {
  background-color: #ffc107;
  color: black;
}

.dark #btnEditar:hover {
  background-color: #e8af06;
}

.dark #btnEliminar {
  background-color: #dc3545;
  color: black;
}

.dark #btnEliminar:hover {
  background-color: #b72433;
}

.dark .modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.dark .modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}
</style>

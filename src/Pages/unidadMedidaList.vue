<template>
  <div class="categorias-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />
    <div class="opciones">
      <button v-if="esCeo" id="btnAdd" class="btn btn-primary" @click="openModal">
        Agregar Unidad
      </button>

      <RouterLink to="categorias">
        <button class="button-categorias">Categorias</button>
      </RouterLink>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar unidad..." />
      </div>
    </div>

    <div class="table-container">
      <!-- Indicador de carga -->
      <div v-if="isLoading" class="loading-indicator">
        Cargando unidades...
      </div>

      <!-- Mensaje si no hay datos -->
      <div v-else-if="paginatedUnidades.length === 0" class="no-data">
        No se encontraron unidades para mostrar.
      </div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre unidad Inventario</th>
            <th>Productos usados</th>
            <th v-if="esCeo">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(unidad, index) in paginatedUnidades" :key="index">
            <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
            <td>{{ unidad.medida }}</td>
            <td class="totalProductos">
              {{ unidad.totalProductos }}
              <button class="btn mostrar-producto" @click="mostrarModalProductos(unidad.id_medida)">
                Mostrar Prod.
              </button>
            </td>
            <td v-if="esCeo">
              <button id="btnEditar" class="btn btn-warning" @click="editUnidad(unidad)">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button id="btnEliminar" class="btn btn-danger" @click="confirmDelete(unidad)">
                <b><i class="bi bi-x-lg"></i></b>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal de confirmación de eliminación -->
      <div class="modal" v-if="showConfirmModal">
        <div class="modal-confirm">

          <div class="modal-header">
            <h2>Confirmación</h2>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que quieres eliminar esta unidad de medida?</p>
          </div>
          <div class="modal-footer">
            <div class="action-buttons">
              <btnGuardarModal texto="Sí, eliminar" style="background-color: red;" @click="deleteUnidad" />
              <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="pagination-wrapper">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize,
            filteredUnidades.length) }} de {{ filteredUnidades.length }} registros
        </div>
        <div class="pagination-container">
          <button class="pagination-button" :disabled="currentPage === 1" @click="previousPage">
            Anterior
          </button>
          <button class="pagination-button" :disabled="currentPage === totalPages" @click="nextPage">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para agregar o editar unidades -->
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h2 class="h2-modal-content">{{ isEditing ? 'Editar Unidad' : 'Agregar Unidad' }}</h2>

        <div class="form-group">
          <label>Nombre de unidad de inventario:</label>
          <input v-model="unidadForm.medida" type="text" required>
        </div>
        <div class="contenedor-botones">
          <btnGuardarModal id="AggUnid" :texto="isEditing ? 'Guardar Cambios' : 'Agregar Unidad'"
            @click="guardarUnidad">
          </btnGuardarModal>
          <btnCerrarModal id="btnCerrarM" :texto="'Cerrar'" @click="closeModal"></btnCerrarModal>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar productos con esa id medida -->
    <div v-if="isModalProductosOpen" class="modal product-list">
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
import PageHeader from "@/components/PageHeader.vue";
import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
import { notis } from '../../services/notificaciones.js';
import { useToast } from "vue-toastification";
const { esCeo } = require('../../services/usuariosSolicitudes');
import { validacionesComunes } from '../../services/validarCampos.js';
import solicitudes from "../../services/solicitudes.js";
import {
  getUnidadMedidaEmpresas,
  postUnidad,
  patchUnidad,
  getProductosUnidad,
  eliminarUnidad
} from "../../services/unidadMedidaSolicitud.js";

export default {
  name: 'UnidadesInventario',
  components: {
    PageHeader,
    btnGuardarModal,
    btnCerrarModal,
  },

  data() {
    return {
      titulo: 'Unidades de Inventario y Venta',
      searchQuery: '',
      isLoading: false,
      currentPage: 1,
      pageSize: 10,
      id_usuario: '',
      unidadesMedida: [],
      mostrarProductos: [],
      showConfirmModal: false,
      isModalOpen: false,
      esCeo: false,
      isModalProductosOpen: false,
      isEditing: false,
      unidadForm: {
        medida: ''
      },
      editIndex: null
    };
  },

  computed: {
    filteredUnidades() {
      return this.unidadesMedida.filter(unidad =>
        unidad.medida.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    paginatedUnidades() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredUnidades.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filteredUnidades.length / this.pageSize);
    },

    mostrarProductosModal() {
      return this.mostrarProductos;
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    this.isLoading = true;
    document.title = "Presentaciones";
    this.changeFavicon('/img/spiderman.ico');
    try {
      this.id_usuario = await solicitudes.solicitarUsuarioToken();
      this.esCeo = await esCeo(this.id_usuario);
      this.unidadesMedida = await getUnidadMedidaEmpresas(this.id_usuario);
    } catch (error) {
      console.error(error);
      notis('error', 'Error al cargar los datos');
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    confirmDelete(unidad) {
      this.editIndex = this.unidadesMedida.findIndex(u => u.id_medida === unidad.id_medida) ;
      this.showConfirmModal = true;
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.editIndex = null;
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    openModal() {
      this.isModalOpen = true;
      this.isEditing = false;
      this.unidadForm = { medida: '' };
    },

    closeModal() {
      this.isModalOpen = false;
      this.isModalProductosOpen = false;
      this.isEditing = false;
      this.editIndex = null;
    },

    editUnidad(unidad) {
      this.isModalOpen = true;
      this.isEditing = true;
      this.unidadForm = { ...unidad };
      this.editIndex = this.unidadesMedida.findIndex(item => item.id_medida === unidad.id_medida);
    },

    async mostrarModalProductos(id_medida) {
      this.isLoading = true;
      try {
        this.mostrarProductos = await getProductosUnidad(id_medida);
        this.isModalProductosOpen = true;
      } catch (error) {
        console.error(error);
        notis('error', 'Error al cargar los productos');
      } finally {
        this.isLoading = false;
      }
    },

    async deleteUnidad() {
      const toast = useToast();
      const unidadEliminar = this.unidadesMedida[this.editIndex];
      if (unidadEliminar.totalProductos > 0) {
        toast.error('Productos existentes dentro de esta unidad');
        return;
      }

      this.isLoading = true;
      try {
        const response = await eliminarUnidad(unidadEliminar.id_medida);
        if (response === true) {
          this.unidadesMedida = this.unidadesMedida.filter(item => item.id_medida !== unidadEliminar.id_medida);
          notis('success', 'Unidad eliminada correctamente');
          this.showConfirmModal = false;
      this.editIndex = null;
        } else {
          throw new Error('Error al eliminar la unidad');
        }
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.isLoading = false;
      }
    },

    async guardarUnidad() {
      if (!validacionesComunes.validarEmpty(this.unidadForm) ||
        !validacionesComunes.validarNombre(this.unidadForm.medida)) {
        return;
      }

      this.unidadForm.id_usuario = this.id_usuario;
      this.isLoading = true;
      try {
        if (this.isEditing) {
          const response = await patchUnidad(
            this.unidadForm,
            this.unidadesMedida[this.editIndex].id_medida
          );

          if (response === true) {
            this.isLoading = false;
            notis("success", "Procesando guardado...");
            Object.assign(this.unidadesMedida[this.editIndex], this.unidadForm);
          }
        } else {
          const nuevoRegistro = await postUnidad(this.unidadForm);
          this.unidadesMedida.push(nuevoRegistro[0]);
          this.isLoading = false;
          notis('success', 'Unidad agregada correctamente');
        }
        this.closeModal();
      } catch (error) {
        notis('error', error.message);
      } finally {
        this.isLoading = false;
      }
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
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
  max-height: calc(100vh - 100px);
}

.opciones {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.loading-indicator,
.no-data {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.no-data {
  background-color: #f8f9fa;
  border-radius: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
}

.pagination-info {
  color: #6c757d;
}

.pagination-container {
  display: flex;
  gap: 5px;
}

.pagination-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e9ecef;
}

.pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

#AggUnid {
  background-color: #a38655;
  border-radius: 8px;
}

#btnCerrarM {
  border-radius: 8px;
  margin-left: 8rem;
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

.busqueda {
  padding: 10px;
  font-size: 14px;
  border-radius: 10px;
  border-width: 0.5px;
  width: 100%;
  max-width: 300px;
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

.form-group {
  margin-bottom: 16px;
  width: 100%;
}

.form-group label {
  margin-bottom: 8px;
  display: block;
}

.form-group input {
  width: 100%;
  height: 35px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Scroll personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
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

  #btnEditar,
  #btnEliminar {
    width: 40px;
    height: 35px;
    font-size: 14px;
    padding: 8px;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-container {
    justify-content: center;
    width: 100%;
  }

  .pagination-button {
    flex: 1;
    max-width: 120px;
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
}

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

.table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 8px;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 0;
  background-color: white;
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

.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

.dark .table-container {
  background-color: #1e1e1e;
  border-color: #374151;
}

.dark .table {
  background-color: #1e1e1e;
}

.dark .table thead {
  background-color: #111827;
}

.dark .table th {
  background-color: #111827;
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table td {
  color: #e5e7eb;
  border-bottom-color: #374151;
}

.dark .table tbody tr:hover {
  background-color: #1f2937;
}

.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}

/* Estilos específicos para el modal de productos */
.product-list .modal-content {
  max-width: 800px;
  /* Aumentado de 400px */
  width: 90%;
  max-height: 80vh;
  /* Altura máxima del 80% del viewport */
}

/* Media query para pantallas más pequeñas */
@media screen and (max-width: 768px) {
  .product-list .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .table-modal-container {
    max-height: 70vh;
  }
}

/* Modo Oscuro */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .mostrar-producto {
  background-color: #2b8cf3;
  color: white;
}

.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .modal-content {
  background-color: #2d2d2d;
  color: #fff;
}

.dark .form-group input {
  background-color: #383838;
  border-color: #404040;
  color: #fff;
}

.dark .pagination-wrapper {
  border-color: #404040;
}

.dark .pagination-info {
  color: #aaa;
}

.dark .pagination-button {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

.dark .pagination-button:hover:not(:disabled) {
  background-color: #383838;
}

.dark .loading-indicator,
.dark .no-data {
  color: #aaa;
  background-color: #2d2d2d;
}

.dark #btnAdd {
  background-color: #c09d62;
  color: black;
}

.dark #btnEditar {
  background-color: #ffc107;
  color: black;
}

.dark #btnEliminar {
  background-color: #dc3545;
  color: black;
}
</style>
<template>
  <div class="categorias-wrapper">
    <ModalLoading :isLoading="isLoading" />
    <PageHeader :titulo="titulo" />
    <!-- Formulario principal -->
    <form @submit.prevent="agregarPromocion" autocomplete="off" v-show="activeForm" class="promocion-form">
      <div class="contenedor-titulo">
        <h2 class="titulo-form">Registro de promociones</h2>
      </div>

      <div class="contenedor-principal">
        <div class="contenedor-interno contenedor-izquierdo">
          <label for="categoria">Categoría:</label>
          <input type="text" id="input-codigo-categoria" name="categoria" v-model="promForm.categoria"
            list="categorias-list" @change="handleCategoriaSelect(promForm)" required />
          <datalist id="categorias-list">
            <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.nombre_categoria">
              {{ categoria.nombre_categoria }}
            </option>
          </datalist>

          <label for="nombre_promocion">Nombre de la promoción:</label>
          <input type="text" id="nombre_promocion" v-model="promForm.nombre_promocion" name="nombre_promocion"
            required />

          <label for="porcentaje_descuento">Porcentaje de descuento:</label>
          <input type="number" id="porcentaje_descuento" name="porcentaje_descuento"
            v-model="promForm.porcentaje_descuento" min="0" max="100" step="0.01" required />
        </div>
        <div class="contenedor-interno contenedor-derecho">
          <label for="fecha_inicio">Fecha de inicio:</label>
          <input type="date" id="fecha_inicio" name="fecha_inicio" v-model="promForm.fecha_inicio"
            :min="getFechaMinima()" required />

          <label for="fecha_final">Fecha final:</label>
          <input type="date" id="fecha_final" name="fecha_final" v-model="promForm.fecha_final"
            :min="promForm.fecha_inicio || getFechaMinima()" required />
        </div>
      </div>
      <div class="contenedor-boton">
        <button type="submit" class="btn registrar-categoria">
          Registrar promoción
        </button>
        <button type="button" class="btn cerrar" @click="activarForm">
          Cancelar
        </button>
      </div>
    </form>

    <!-- Vista de tabla con paginación -->
    <div class="tabla-busqueda" v-if="!activeForm">
      <div>
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar promoción..." />
        <button v-if="esCeo" class="btn activar-form" @click="activarForm">
          Nueva promoción
        </button>
      </div>
      <div class="table-container" v-pdf-export ref="table">
        <!-- Indicador de carga -->
        <div v-if="isLoading" class="loading-indicator">
          Cargando promociones...
        </div>

        <!-- Mensaje si no hay datos -->
        <div v-else-if="paginatedPromociones.length === 0" class="no-data">
          No se encontraron promociones para mostrar.
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th id="numero-promocion">#</th>
              <th>Categoría</th>
              <th>Nombre Promoción</th>
              <th id="porcentaje">%</th>
              <th>Fecha inicio</th>
              <th>Fecha final</th>
              <th>Estado</th>
              <th v-if="esCeo" id="opciones">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in paginatedPromociones" :key="index">
              <td>{{ ((currentPage - 1) * pageSize) + index + 1 }}</td>
              <td>{{ p.categoria?.nombre_categoria || p.categoria }}</td>
              <td>{{ p.nombre_promocion }}</td>
              <td>{{ p.porcentaje_descuento }}</td>
              <td>{{ formatDate(p.fecha_inicio) }}</td>
              <td>{{ formatDate(p.fecha_final) }}</td>
              <td>{{ p.manejo_automatico ? 'Se aplicará' : 'No se aplicará' }}</td>
              <td v-if="esCeo" class="td-botones">
                <button id="btnEditar" class="btn btn-warning" @click="editarPromocion(index)">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button v-if="p.manejo_automatico" id="btnDesactivar" class="btn btn-success"
                  @click="desactivarProm(index)">
                  <b><i class="bi bi-check"></i></b>
                </button>
                <button v-if="!p.manejo_automatico" id="btnActivar" class="btn btn-secondary"
                  @click="activarProm(p.id)">
                  <b><i class="bi bi-x"></i></b>
                </button>
                <button id="btnEliminar" class="btn btn-danger" @click="confirmDelete(index)">
                  <b><i class="bi bi-trash-fill"></i></b>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} a {{ Math.min(currentPage * pageSize,
              filterPromociones.length) }} de {{ filterPromociones.length }} registros
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
    </div>

    <!-- Modal de edición -->
    <div v-if="isShowModal" class="modal">
      <div class="modal-content">
        <form @submit.prevent="agregarPromocion" autocomplete="off">
          <div class="contenedor-principal">
            <div class="contenedor-interno contenedor-izquierdo">
              <label for="categoria">Categoría:</label>
              <input type="text" id="input-codigo-categoria-modal" name="categoria" v-model="promFormModal.categoria"
                list="categorias-list-modal" @change="handleCategoriaSelect(promFormModal)" required />
              <datalist id="categorias-list-modal">
                <option v-for="categoria in categorias" :key="categoria.id_categoria"
                  :value="categoria.nombre_categoria">
                  {{ categoria.nombre_categoria }}
                </option>
              </datalist>

              <label for="nombre_promocion">Nombre de la promoción:</label>
              <input type="text" id="nombre_promocion" v-model="promFormModal.nombre_promocion" name="nombre_promocion"
                required />

              <label for="porcentaje_descuento">Porcentaje de descuento:</label>
              <input type="number" id="porcentaje_descuento" name="porcentaje_descuento"
                v-model="promFormModal.porcentaje_descuento" min="0" max="100" step="0.01" required />
            </div>
            <div class="contenedor-interno contenedor-derecho">
              <label for="fecha_inicio">Fecha de inicio:</label>
              <input type="date" id="fecha_inicio" name="fecha_inicio" v-model="promFormModal.fecha_inicio"
                :min="getFechaMinima()" required />

              <label for="fecha_final">Fecha final:</label>
              <input type="date" id="fecha_final" name="fecha_final" v-model="promFormModal.fecha_final"
                :min="promFormModal.fecha_inicio || getFechaMinima()" required />
            </div>
          </div>
          <div class="contenedor-boton">
            <button type="submit" class="btn registrar-categoria">
              Guardar cambios
            </button>
            <button type="button" @click="closeModal" class="btn cerrar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar esta promoción?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="eliminarProm">
            Sí, borrar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de conflicto de fechas -->
    <div class="modal" v-if="showConflictModal">
      <div class="modal-content">
        <h2>Conflicto de Fechas</h2>
        <div class="conflict-explanation">
          <p>Existe una promoción activa para la categoría <strong>"{{ tempPromocionData?.categoria?.nombre_categoria ||
            tempPromocionData?.categoria }}"</strong>
            que coincide con las fechas seleccionadas:</p>

          <div class="promocion-details existing">
            <h3>Promoción Existente:</h3>
            <p><strong>Nombre:</strong> {{ conflictingPromocion?.nombre_promocion }}</p>
            <p><strong>Descuento:</strong> {{ conflictingPromocion?.porcentaje_descuento }}%</p>
            <p><strong>Período:</strong> {{ formatDate(conflictingPromocion?.fecha_inicio) }} al {{
              formatDate(conflictingPromocion?.fecha_final) }}</p>
          </div>

          <div class="promocion-details new">
            <h3>Nueva Promoción:</h3>
            <p><strong>Nombre:</strong> {{ tempPromocionData?.nombre_promocion }}</p>
            <p><strong>Descuento:</strong> {{ tempPromocionData?.porcentaje_descuento }}%</p>
            <p><strong>Período:</strong> {{ formatDate(tempPromocionData?.fecha_inicio) }} al {{
              formatDate(tempPromocionData?.fecha_final) }}</p>
          </div>

          <p class="warning-text">¿Qué deseas hacer?</p>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeConflictModal">
            <i class="bi bi-pencil"></i> Modificar fechas
          </button>
          <button class="btn btn-warning" @click="createAnywayPromocion">
            <i class="bi bi-check2-circle"></i> Activar nueva y desactivar anterior
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from "@/components/PageHeader.vue";
import solicitudes from "../../services/soli";
const { esCeo } = require('../../services/usuariosSolicitudes');
import ModalLoading from '@/components/ModalLoading.vue';
import { notis } from '../../services/notificaciones.js';

export default {
  name: 'PromocionesCategoria',
  components: {
    PageHeader,
    ModalLoading
  },
  data() {
    return {
      id_usuario: "",
      titulo: 'Promociones: Categorías',
      searchQuery: "",
      activeForm: false,
      isEditing: false,
      editIndex: null,
      isShowModal: false,
      showConfirmModal: false,
      showConflictModal: false,
      conflictingPromocion: null,
      tempPromocionData: null,
      isLoading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      categorias: [],
      esCeo: false,
      promForm: {
        categoria_id: "",
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,

      },
      promFormModal: {
        id: "",
        categoria_id: "",
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,
      },
      promociones: [],
    };
  },

  computed: {
    filterPromociones() {
      return this.promociones.filter(
        (promocion) =>
          promocion.nombre_promocion?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (promocion.categoria?.nombre_categoria || promocion.categoria)?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },

    paginatedPromociones() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filterPromociones.slice(startIndex, endIndex);
    },

    totalPages() {
      return Math.ceil(this.filterPromociones.length / this.pageSize);
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  },

  created() {
    document.title = "Promociones Categorías";
  },

  async mounted() {
    this.isLoading = true;
    try {
      this.changeFavicon('/img/spiderman.ico');
      const result = await Promise.all([
        this.cargarPromociones(),
        this.cargarCategorias(),
        solicitudes.solicitarUsuarioToken()
      ]);
      this.id_usuario = result[2];

      this.esCeo = await esCeo(this.id_usuario);

    } catch (error) {
      alert(error);
    } finally {
      this.isLoading = false;
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return '';
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return dateString;
      }
    },

    getFechaMinima() {
      const hoy = new Date();
      return hoy.toISOString().split('T')[0];
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

    async cargarCategorias() {
      this.isLoading = true;
      try {
        const categoriasResponse = await solicitudes.fetchRegistros('/promocionesC/categorias/empresa');
        this.categorias = categoriasResponse;
        console.log('Categorías cargadas:', this.categorias);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        notis("error", 'Error al cargar las categorías');
        if (error.message.includes('No hay token')) {
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    handleCategoriaSelect(form) {
      const categoriaSeleccionada = this.categorias.find(
        c => c.nombre_categoria === form.categoria
      );
      if (categoriaSeleccionada) {
        form.categoria_id = categoriaSeleccionada.id_categoria;
      } else {
        form.categoria_id = "";
      }
    },

    async cargarPromociones() {
      this.isLoading = true;
      this.error = null;
      try {
        const promocionesResponse = await solicitudes.fetchRegistros('/promocionesC/empresa');
        this.promociones = promocionesResponse.map(promocion => ({
          ...promocion,
          fecha_inicio: new Date(promocion.fecha_inicio + 'T00:00:00').toISOString().split('T')[0],
          fecha_final: new Date(promocion.fecha_final + 'T00:00:00').toISOString().split('T')[0]
        }));
        console.log('Promociones cargadas:', this.promociones);
      } catch (error) {
        console.error('Error al cargar promociones:', error);
        this.error = 'Error al cargar las promociones. Por favor, intente más tarde.';
        if (error.message.includes('No hay token')) {
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    activarForm() {
      this.activeForm = !this.activeForm;
      if (this.activeForm) {
        this.clearForm();
      }
    },

    clearForm() {
      this.promForm = {
        categoria_id: "",
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,
      };
      this.promFormModal = {
        id: "",
        categoria_id: "",
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    validarFormulario() {
      console.log('Iniciando validación del formulario');
      const form = this.isEditing ? this.promFormModal : this.promForm;

      if (!form.categoria_id || !form.nombre_promocion ||
        !form.porcentaje_descuento || !form.fecha_inicio ||
        !form.fecha_final) {
        notis("warning", 'Todos los campos son obligatorios');
        return false;
      }

      if (form.porcentaje_descuento < 0 || form.porcentaje_descuento > 100) {
        notis("warning", 'El porcentaje de descuento debe estar entre 0 y 100');
        return false;
      }

      const fechaInicio = new Date(form.fecha_inicio + 'T00:00:00');
      const fechaFinal = new Date(form.fecha_final + 'T00:00:00');
      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFinal.setHours(0, 0, 0, 0);

      if (fechaInicio < hoy) {
        notis("warning", 'La fecha de inicio no puede ser anterior a hoy');
        return false;
      }

      if (fechaInicio > fechaFinal) {
        notis("warning", 'La fecha final debe ser posterior a la fecha inicial');
        return false;
      }

      return true;
    },

    async agregarPromocion() {
      this.isLoading = true;
      try {
        if (!this.validarFormulario()) return;

        const formData = this.isEditing ? this.promFormModal : this.promForm;

        if (!this.isEditing) {
          try {
            const datos = {
              categoria_id: formData.categoria_id,
              nombre_promocion: formData.nombre_promocion,
              porcentaje_descuento: formData.porcentaje_descuento,
              fecha_inicio: new Date(formData.fecha_inicio + 'T00:00:00').toISOString().split('T')[0],
              fecha_final: new Date(formData.fecha_final + 'T00:00:00').toISOString().split('T')[0]
            };

            const response = await solicitudes.postRegistro(
              '/promocionesC/crear-promocion',
              datos
            );

            if (response.length > 0) {
              await this.cargarPromociones();
              notis("success", 'Promocion creada exitosamente');
              this.clearForm();
              this.isShowModal = false;
              this.activeForm = false;
            }
          } catch (error) {
            if (error.response?.status === 409) {
              this.tempPromocionData = { ...formData };
              this.conflictingPromocion = error.response.data.promocion_existente;

              notis("warning", 'Hay una promoción activa que coincide con las fechas indicadas');

              this.showConflictModal = true;
              return;
            }
            throw error;
          } finally {
            this.isLoading = false;
          }
        } else {
          const datos = {
            nombre_promocion: this.promFormModal.nombre_promocion,
            porcentaje_descuento: this.promFormModal.porcentaje_descuento,
            fecha_inicio: new Date(this.promFormModal.fecha_inicio + 'T00:00:00').toISOString().split('T')[0],
            fecha_final: new Date(this.promFormModal.fecha_final + 'T00:00:00').toISOString().split('T')[0]
          };

          const response = await solicitudes.patchRegistro(
            `/promocionesC/actualizar-promocion/${this.promFormModal.id}`,
            datos
          );

          if (response) {
            await this.cargarPromociones();
            notis("success", 'Promoción actualizada exitosamente');
            this.clearForm();
            this.isShowModal = false;
          }
        }
      } catch (error) {
        console.error('Error en agregarPromocion:', error);
        notis("error", 'Error al procesar la promoción');
      } finally {
        this.isLoading = false;
      }
    },

    async desactivarProm(index) {
      this.isLoading = true;
      try {
        const promocion = this.paginatedPromociones[index];
        if (!promocion || !promocion.id) {
          throw new Error('Promoción no válida');
        }

        const response = await solicitudes.patchRegistro(
          `/promocionesC/cambiar-estado-promocion/${promocion.id}`,
          { manejo_automatico: false }
        );

        if (response) {
          await this.cargarPromociones();
          notis("success", 'Promoción desactivada exitosamente');
        }
      } catch (error) {
        console.error('Error al desactivar promoción:', error);
        notis("error", 'Error al desactivar promoción');
      } finally {
        this.isLoading = false;
      }
    },

    async activarProm(promocionId) {
      this.isLoading = true;
      try {
        const response = await solicitudes.patchRegistro(
          `/promocionesC/cambiar-estado-promocion/${promocionId}`,
          { manejo_automatico: true }
        );

        if (response) {
          await this.cargarPromociones();
          notis("success", 'Promoción activada exitosamente');
        }
      } catch (error) {
        console.error('Error al activar promoción:', error);
        notis("error", 'Error al activar promoción');
      } finally {
        this.isLoading = false;
      }
    },

    editarPromocion(index) {
      const promocion = this.paginatedPromociones[index];

      this.promFormModal = {
        id: promocion.id,
        categoria_id: promocion.categoria_producto_Id,
        categoria: promocion.categoria?.nombre_categoria || promocion.categoria,
        nombre_promocion: promocion.nombre_promocion,
        porcentaje_descuento: promocion.porcentaje_descuento,
        fecha_inicio: promocion.fecha_inicio,
        fecha_final: promocion.fecha_final,
        estado: promocion.estado
      };

      this.editIndex = this.promociones.findIndex(p => p.id === promocion.id);
      this.isEditing = true;
      this.showModal();
    },

    async eliminarProm() {
      this.isLoading = true;
      try {
        const promocion = this.promociones[this.editIndex];
        if (!promocion || !promocion.id) {
          throw new Error('Promoción no válida');
        }

        const response = await solicitudes.deleteRegistro(
          `/promocionesC/eliminar-promocion/${promocion.id}`
        );

        if (response === true) {
          await this.cargarPromociones();
          notis("success", 'Promoción eliminada exitosamente');
          this.showConfirmModal = false;
        }
      } catch (error) {
        console.error('Error al eliminar promoción:', error);
        notis("error", 'Error al eliminar promoción');
      } finally {
        this.isLoading = false;
        this.editIndex = null;
      }
    },

    showModal() {
      this.isShowModal = true;
    },

    closeModal() {
      this.isShowModal = false;
      if (this.isEditing) {
        this.isEditing = false;
        this.editIndex = null;
      }
    },

    confirmDelete(index) {
      this.editIndex = index;
      this.showConfirmModal = true;
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.editIndex = null;
    },

    closeConflictModal() {
      this.showConflictModal = false;
      this.conflictingPromocion = null;
      this.tempPromocionData = null;
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
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
  box-sizing: border-box;
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

.contenedor-principal {
  display: flex;
  justify-content: space-around;
}

.promocion-details {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 10px 0;
}

.promocion-details.existing {
  border-left: 4px solid #ffc107;
}

.promocion-details.new {
  border-left: 4px solid #28a745;
}

.promocion-details h3 {
  margin-top: 0;
  color: #495057;
  font-size: 1.1em;
  margin-bottom: 10px;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin: 20px 0;
  text-align: center;
}

form {
  border: 1px solid rgb(110, 109, 109);
  padding: 3% 0 2% 0;
  border-radius: 10px;
  min-width: 800px;
  min-height: 200px;
  position: relative;
}

.titulo-form {
  position: absolute;
  top: -11.5%;
  background-color: #f5f5f5;
  padding: 0 10px;
  color: #858585;
}

.contenedor-titulo {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.contenedor-boton {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.contenedor-principal input {
  width: 95%;
  height: 25%;
  justify-content: center;
  margin-bottom: 4%;
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

#btnDesactivar {
  background-color: rgb(24, 233, 24);
  color: white;
}

#btnActivar {
  color: white;
  background-color: #6c757d;
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

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-container {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-top: 16px;
  height: 480px;
  overflow-y: auto;
}

.table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}

.registrar-producto,
.cerrar {
  background-color: #c9c7c7;
}

.registrar-producto:hover,
.cerrar:hover {
  background-color: #aaa9a9;
  transition: all 0.3s ease;
}

.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

#opciones {
  width: 160px;
}

#btnEliminar {
  background-color: #dc3545;
  color: white;
}

.td-botones {
  display: flex;
  align-items: center;
  justify-content: center;
}

#btnDesactivar,
#btnActivar {
  font-size: 25px;
  padding: 0px 10.5px;
}

.contenedor-interno {
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: 0 2%;
}

.activar-form {
  background-color: rgb(101, 217, 221);
  margin-left: 20px;
}

.activar-form:hover {
  background-color: rgb(79, 185, 189);
  transition: all 0.3s ease;
}

.categorias-wrapper {
  padding: 16px;
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-actions .btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  min-width: 180px;
  justify-content: center;
}

.modalShowConfirm-Si {
  background-color: #dc3545;
  color: white;
}

.modalShowConfirm-no {
  background-color: #6c757d;
  color: white;
}

.busqueda {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.modal-content .btn {
  min-width: 100px;
}

.modal-content form {
  width: 100%;
  margin: 0;
  padding: 20px;
}

.conflict-explanation {
  text-align: left;
  width: 100%;
  margin: 15px 0;
  padding: 0 20px;
}

.conflict-explanation p {
  margin: 10px 0;
}

/* Estilos del scroll personalizado */
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

/* Media Queries */
@media screen and (max-width: 1024px) {
  .contenedor-principal {
    flex-direction: column;
  }

  .contenedor-interno {
    width: 100%;
    padding: 0;
  }

  form {
    min-width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .categorias-wrapper {
    padding: 8px;
  }

  .modal-content {
    padding: 15px;
  }

  .btn {
    width: 100%;
    margin: 4px 0;
  }

  .busqueda {
    width: 100%;
  }

  #btnDesactivar,
  #btnActivar {
    font-size: 20px;
    padding: 5px 10px;
  }

  .td-botones {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .btn {
    min-width: 100%;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-container {
    justify-content: center;
  }
}

@media screen and (max-width: 480px) {
  .titulo-form {
    font-size: 12px;
    top: -8%;
  }

  .promocion-details {
    padding: 10px;
  }

  .modal-content {
    padding: 10px;
  }

  .btn {
    font-size: 14px;
    padding: 6px 12px;
  }
}

/* Modo Oscuro */
.dark .categorias-wrapper {
  background-color: #1e1e1e;
  color: #fff;
}

.dark .busqueda {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #fff;
}

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

.dark .modal-content {
  background-color: #2d2d2d;
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

.dark .table-container::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark .table-container::-webkit-scrollbar-thumb {
  background: #c09d62;
}

.dark .table-container::-webkit-scrollbar-thumb:hover {
  background: #a38655;
}
</style>
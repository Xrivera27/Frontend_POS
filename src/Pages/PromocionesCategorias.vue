<template>
  <div class="encabezado">
    <h1>Promociones de Categorías</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr />

  <div class="categorias-wrapper">
    <form @submit.prevent="agregarPromocion" autocomplete="off" v-show="activeForm">
      <div class="contenedor-titulo">
        <h2 class="titulo-form">Registro de promociones</h2>
      </div>

      <div class="contenedor-principal">
        <div class="contenedor-interno contenedor-izquierdo">
          <label for="categoria">Categoría:</label>
          <input 
            type="text" 
            id="input-codigo-categoria" 
            name="categoria" 
            v-model="promForm.categoria" 
            list="categorias-list"
            @change="handleCategoriaSelect(promForm)"
            required 
          />
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
          <input type="date" id="fecha_inicio" name="fecha_inicio" v-model="promForm.fecha_inicio" required />

          <label for="fecha_final">Fecha final:</label>
          <input type="date" id="fecha_final" name="fecha_final" v-model="promForm.fecha_final" required />
        </div>
      </div>
      <div class="contenedor-boton">
        <button type="submit" class="btn registrar-categoria">
          Registrar promoción
        </button>
        <button type="button" class="btn cerrar" @click="activarForm">Cancelar</button>
      </div>
    </form>

    <div class="tabla-busqueda" v-if="!activeForm">
      <div>
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar promoción..." />
        <button class="btn activar-form" @click="activarForm">Nueva promoción</button>
      </div>
      <div class="table-container" v-pdf-export ref="table">
        <table class="table">
          <thead>
            <tr>
              <th id="numero-promocion">#</th>
              <th>Categoría</th>
              <th>Nombre Promoción</th>
              <th id="porcentaje">%</th>
              <th>Fecha inicio</th>
              <th>Fecha final</th>
              <th>Estado</th>
              <th id="opciones">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in filterPromociones" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ p.categoria?.nombre_categoria || p.categoria }}</td>
              <td>{{ p.nombre_promocion }}</td>
              <td>{{ p.porcentaje_descuento }}</td>
              <td>{{ formatDate(p.fecha_inicio) }}</td>
              <td>{{ formatDate(p.fecha_final) }}</td>
              <td>{{ p.estado ? 'Activo' : 'Inactivo' }}</td>
              <td class="td-botones">
                <button id="btnEditar" class="btn btn-warning" @click="editarPromocion(index)">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button v-if="p.estado" id="btnDesactivar" class="btn btn-success"
                  @click="desactivarProm(index)">
                  <b><i class="bi bi-check"></i></b>
                </button>
                <button v-if="!p.estado" id="btnActivar" class="btn btn-secondary"
                  @click="activarProm(index)">
                  <b><i class="bi bi-x"></i></b>
                </button>
                <button id="btnEliminar" class="btn btn-danger" @click="confirmDelete(index)">
                  <b><i class="bi bi-trash-fill"></i></b>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="isShowModal" class="modal">
      <div class="modal-content">
        <form @submit.prevent="agregarPromocion" autocomplete="off">
          <div class="contenedor-principal">
            <div class="contenedor-interno contenedor-izquierdo">
              <label for="categoria">Categoría:</label>
              <input 
                type="text" 
                id="input-codigo-categoria-modal" 
                name="categoria" 
                v-model="promFormModal.categoria" 
                list="categorias-list-modal"
                @change="handleCategoriaSelect(promFormModal)"
                required 
              />
              <datalist id="categorias-list-modal">
                <option v-for="categoria in categorias" :key="categoria.id_categoria" :value="categoria.nombre_categoria">
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
              <input type="date" id="fecha_inicio" name="fecha_inicio" v-model="promFormModal.fecha_inicio" required />

              <label for="fecha_final">Fecha final:</label>
              <input type="date" id="fecha_final" name="fecha_final" v-model="promFormModal.fecha_final" required />
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
          <p>Existe una promoción activa para la categoría "{{ tempPromocionData?.categoria }}" 
             que coincide con las fechas seleccionadas:</p>
          
          <div class="promocion-details existing">
            <h3>Promoción Existente:</h3>
            <p><strong>Nombre:</strong> {{ conflictingPromocion?.nombre_promocion }}</p>
            <p><strong>Descuento:</strong> {{ conflictingPromocion?.porcentaje_descuento }}%</p>
            <p><strong>Período:</strong> {{ formatDate(conflictingPromocion?.fecha_inicio) }} al {{ formatDate(conflictingPromocion?.fecha_final) }}</p>
          </div>

          <div class="promocion-details new">
            <h3>Nueva Promoción:</h3>
            <p><strong>Nombre:</strong> {{ tempPromocionData?.nombre_promocion }}</p>
            <p><strong>Descuento:</strong> {{ tempPromocionData?.porcentaje_descuento }}%</p>
            <p><strong>Período:</strong> {{ formatDate(tempPromocionData?.fecha_inicio) }} al {{ formatDate(tempPromocionData?.fecha_final) }}</p>
          </div>

          <p class="warning-text">¿Qué deseas hacer?</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeConflictModal">
            <i class="bi bi-arrow-left"></i> Modificar fechas
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
import ProfileButton from "../components/ProfileButton.vue";
import solicitudes from "../../services/soli";

export default {
  components: {
    ProfileButton,
  },
  data() {
    return {
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
      categorias: [],

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

  async mounted() {
    document.title = "Promociones Categorías";
    this.changeFavicon('/img/spiderman.ico');
    await Promise.all([
      this.cargarPromociones(),
      this.cargarCategorias()
    ]);
  },

  computed: {
    filterPromociones() {
      return this.promociones.filter(
        (promocion) =>
          promocion.nombre_promocion?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (promocion.categoria?.nombre_categoria || promocion.categoria)?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date);
    },

    async cargarCategorias() {
      try {
        const categoriasResponse = await solicitudes.fetchRegistros('/promocionesC/categorias/empresa');
        this.categorias = categoriasResponse;
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al cargar las categorías',
          tipo: 'error'
        });
        if (error.message.includes('No hay token')) {
          this.$router.push('/login');
        }
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
        this.promociones = promocionesResponse;
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

    async agregarPromocion() {
      try {
        if (!this.validarFormulario()) {
          return;
        }

        const formData = this.isEditing ? this.promFormModal : this.promForm;

        if (!this.isEditing) {
          try {
            await solicitudes.postRegistro(
              '/promocionesC/crear-promocion',
              {
                categoria_id: formData.categoria_id,
                nombre_promocion: formData.nombre_promocion,
                porcentaje_descuento: formData.porcentaje_descuento,
                fecha_inicio: formData.fecha_inicio,
                fecha_final: formData.fecha_final
              }
            );

            await this.cargarPromociones();
            this.$emit('mostrar-notificacion', {
              mensaje: 'Promoción creada exitosamente',
              tipo: 'success'
            });
            this.clearForm();
            this.isShowModal = false;
            this.activeForm = false;
          } catch (error) {
            if (error.response?.status === 409) {
              // Guarda los datos temporalmente
              this.tempPromocionData = { ...formData };
              this.conflictingPromocion = error.response.data.promocion_existente;
              
              this.$emit('mostrar-notificacion', {
                mensaje: 'Hay una promoción activa que coincide con las fechas indicadas',
                tipo: 'warning'
              });
              
              // Muestra el modal de conflicto
              this.showConflictModal = true;
              return;
            }
            throw error;
          }
        } else {
          const response = await solicitudes.patchRegistro(
            `/promocionesC/actualizar-promocion/${this.promFormModal.id}`,
            {
              nombre_promocion: this.promFormModal.nombre_promocion,
              porcentaje_descuento: this.promFormModal.porcentaje_descuento,
              fecha_inicio: this.promFormModal.fecha_inicio,
              fecha_final: this.promFormModal.fecha_final
            }
          );

          if (response) {
            await this.cargarPromociones();
            this.$emit('mostrar-notificacion', {
              mensaje: 'Promoción actualizada exitosamente',
              tipo: 'success'
            });
            this.clearForm();
            this.isShowModal = false;
          }
        }
      } catch (error) {
        console.error('Error en agregarPromocion:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al procesar la promoción',
          tipo: 'error'
        });
      }
    },

    async createAnywayPromocion() {
      try {
        if (this.tempPromocionData) {
          const response = await solicitudes.postRegistro(
            '/promocionesC/crear-promocion',
            {
              categoria_id: this.tempPromocionData.categoria_id,
              nombre_promocion: this.tempPromocionData.nombre_promocion,
              porcentaje_descuento: this.tempPromocionData.porcentaje_descuento,
              fecha_inicio: this.tempPromocionData.fecha_inicio,
              fecha_final: this.tempPromocionData.fecha_final,
              force_create: true
            }
          );

          if (response.length > 0) {
            await this.cargarPromociones();
            this.$emit('mostrar-notificacion', {
              mensaje: 'Nueva promoción activada y promoción anterior desactivada exitosamente',
              tipo: 'success'
            });
            this.clearForm();
            this.isShowModal = false;
            this.activeForm = false;
            this.closeConflictModal();
          }
        }
      } catch (error) {
        console.error('Error al crear promoción forzada:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al procesar las promociones',
          tipo: 'error'
        });
      }
    },

    validarFormulario() {
      const form = this.isEditing ? this.promFormModal : this.promForm;
      if (!form.categoria_id || !form.nombre_promocion || 
          !form.porcentaje_descuento || !form.fecha_inicio || 
          !form.fecha_final) {
        this.$emit('mostrar-notificacion', {
          mensaje: 'Todos los campos son obligatorios',
          tipo: 'error'
        });
        return false;
      }
      
      if (form.porcentaje_descuento < 0 || form.porcentaje_descuento > 100) {
        this.$emit('mostrar-notificacion', {
          mensaje: 'El porcentaje de descuento debe estar entre 0 y 100',
          tipo: 'error'
        });
        return false;
      }

      const fechaInicio = new Date(form.fecha_inicio);
      const fechaFinal = new Date(form.fecha_final);
      if (fechaInicio > fechaFinal) {
        this.$emit('mostrar-notificacion', {
          mensaje: 'La fecha final debe ser posterior a la fecha inicial',
          tipo: 'error'
        });
        return false;
      }

      return true;
    },

    editarPromocion(index) {
      const promocion = this.promociones[index];
      
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
      
      this.editIndex = index;
      this.isEditing = true;
      this.showModal();
    },

    async activarProm(index) {
      try {
        const promocion = this.promociones[index];
        const response = await solicitudes.patchRegistro(
          `/promocionesC/cambiar-estado-promocion/${promocion.id}`,
          { estado: true }
        );

        if (response) {
          await this.cargarPromociones();
          this.$emit('mostrar-notificacion', {
            mensaje: 'Promoción activada exitosamente',
            tipo: 'success'
          });
        }
      } catch (error) {
        if (error.response?.status === 409) {
          this.$emit('mostrar-notificacion', {
            mensaje: 'No se puede activar la promoción porque hay otra promoción activa en las mismas fechas',
            tipo: 'error'
          });
          return;
        }
        console.error('Error al activar promoción:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al activar la promoción',
          tipo: 'error'
        });
      }
    },

    async desactivarProm(index) {
      try {
        const promocion = this.promociones[index];
        const response = await solicitudes.patchRegistro(
          `/promocionesC/cambiar-estado-promocion/${promocion.id}`,
          { estado: false }
        );

        if (response) {
          await this.cargarPromociones();
          this.$emit('mostrar-notificacion', {
            mensaje: 'Promoción desactivada exitosamente',
            tipo: 'success'
          });
        }
      } catch (error) {
        console.error('Error al desactivar promoción:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al desactivar la promoción',
          tipo: 'error'
        });
      }
    },

    async eliminarProm() {
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
          this.$emit('mostrar-notificacion', {
            mensaje: 'Promoción eliminada exitosamente',
            tipo: 'success'
          });
          this.showConfirmModal = false;
        }
      } catch (error) {
        console.error('Error al eliminar promoción:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al eliminar la promoción',
          tipo: 'error'
        });
      } finally {
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
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
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

.encabezado {
  display: flex;
  justify-content: space-between;
}

.encabezado h1 {
  white-space: nowrap;
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

.btn-warning.modal-action {
  background-color: #28a745;
  color: white;
}

.btn-warning.modal-action:hover {
  background-color: #218838;
}

/* Estilos adicionales para el modal de conflicto */
.modal-content h2 {
  color: #343a40;
  margin-bottom: 15px;
}

.promocion-details {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 15px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.promocion-details strong {
  color: #495057;
}

.promocion-details p {
  margin: 8px 0;
}

input[type="date"]:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

input[type="date"] {
  color: #495057;
  cursor: pointer;
}


</style>
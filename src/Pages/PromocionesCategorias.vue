<template>
  <div class="categorias-wrapper">
    <PageHeader :titulo="titulo" />
    <!-- Formulario principal con las correcciones -->
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

    <!-- Vista de tabla -->
    <div class="tabla-busqueda" v-if="!activeForm">
      <div>
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar promoción..." />
        <button class="btn activar-form" @click="activarForm">
          Nueva promoción
        </button>
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
              <td>{{ p.manejo_automatico ? 'Se aplicará' : 'No se aplicará' }}</td>
              <td class="td-botones">
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

export default {
  name: 'PromocionesCategoria',
  components: {
    PageHeader
  },
  data() {
    return {
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

  created() {
    document.title = "Promociones Categorías";
  },

  async mounted() {
    try {
      this.changeFavicon('/img/spiderman.ico');
      await Promise.all([
        this.cargarPromociones(),
        this.cargarCategorias()
      ]);
    } catch (error) {
      console.error('Error en mounted:', error);
    }
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

    async cargarCategorias() {
      try {
        const categoriasResponse = await solicitudes.fetchRegistros('/promocionesC/categorias/empresa');
        this.categorias = categoriasResponse;
        console.log('Categorías cargadas:', this.categorias);
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

      const fechaInicio = new Date(form.fecha_inicio + 'T00:00:00');
      const fechaFinal = new Date(form.fecha_final + 'T00:00:00');
      const hoy = new Date();

      hoy.setHours(0, 0, 0, 0);
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFinal.setHours(0, 0, 0, 0);

      if (fechaInicio < hoy) {
        this.$emit('mostrar-notificacion', {
          mensaje: 'La fecha de inicio no puede ser anterior a hoy',
          tipo: 'error'
        });
        return false;
      }

      if (fechaInicio > fechaFinal) {
        this.$emit('mostrar-notificacion', {
          mensaje: 'La fecha final debe ser posterior a la fecha inicial',
          tipo: 'error'
        });
        return false;
      }

      return true;
    },

    async agregarPromocion() {
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
              this.$emit('mostrar-notificacion', {
                mensaje: 'Promoción creada exitosamente',
                tipo: 'success'
              });
              this.clearForm();
              this.isShowModal = false;
              this.activeForm = false;
            }
          } catch (error) {
            if (error.response?.status === 409) {
              this.tempPromocionData = { ...formData };
              this.conflictingPromocion = error.response.data.promocion_existente;

              this.$emit('mostrar-notificacion', {
                mensaje: 'Hay una promoción activa que coincide con las fechas indicadas',
                tipo: 'warning'
              });

              this.showConflictModal = true;
              return;
            }
            throw error;
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

    async activarProm(promocionId) {
  try {
    // Usar filterPromociones para encontrar la promoción correcta
    const promocionAActivar = this.filterPromociones.find(p => p.id === promocionId);
    if (!promocionAActivar) {
      throw new Error('Promoción no encontrada');
    }

    console.log('Promoción a activar:', {
      id: promocionAActivar.id,
      categoria: promocionAActivar.categoria?.nombre_categoria,
      categoria_id: promocionAActivar.categoria_id,
      categoria_producto_Id: promocionAActivar.categoria_producto_Id
    });
    
    // Verificar si ya existe una promoción activa para la misma categoría
    const promocionesActivas = this.promociones.filter(p => {
      // Verificar si es la misma categoría usando cualquiera de los IDs disponibles
      const mismaCategoria = 
        (promocionAActivar.categoria_producto_Id && p.categoria_producto_Id === promocionAActivar.categoria_producto_Id) ||
        (promocionAActivar.categoria_id && p.categoria_id === promocionAActivar.categoria_id);

      const estaActiva = p.manejo_automatico;
      const esDistinta = p.id !== promocionId;

      console.log('Comparando con promoción:', {
        id: p.id,
        categoria: p.categoria?.nombre_categoria,
        categoria_id: p.categoria_id,
        categoria_producto_Id: p.categoria_producto_Id,
        activa: estaActiva,
        mismaCategoria: mismaCategoria,
        esDistinta: esDistinta
      });

      return estaActiva && esDistinta && mismaCategoria;
    });

    console.log('Promociones activas encontradas:', promocionesActivas.length);

    // Si no hay promociones activas para esta categoría, activar directamente
    if (promocionesActivas.length === 0) {
      const response = await solicitudes.patchRegistro(
        `/promocionesC/cambiar-estado-promocion/${promocionId}`,
        { manejo_automatico: true }
      );

      if (response) {
        await this.cargarPromociones();
        this.$emit('mostrar-notificacion', {
          mensaje: 'Promoción activada exitosamente',
          tipo: 'success'
        });
      }
      return;
    }

    // Verificar conflictos de fecha con las promociones activas
    const fechaInicioActual = new Date(promocionAActivar.fecha_inicio);
    const fechaFinalActual = new Date(promocionAActivar.fecha_final);

    const promocionConflicto = promocionesActivas.find(p => {
      const fechaInicioExistente = new Date(p.fecha_inicio);
      const fechaFinalExistente = new Date(p.fecha_final);

      const hayConflicto = fechaInicioActual <= fechaFinalExistente && 
                          fechaFinalActual >= fechaInicioExistente;

      console.log('Verificando conflicto de fechas:', {
        promocionId: p.id,
        fechaInicioActual: fechaInicioActual.toISOString(),
        fechaFinalActual: fechaFinalActual.toISOString(),
        fechaInicioExistente: fechaInicioExistente.toISOString(),
        fechaFinalExistente: fechaFinalExistente.toISOString(),
        hayConflicto
      });

      return hayConflicto;
    });

    if (promocionConflicto) {
      // Si hay conflicto, mostrar el modal de conflicto
      this.tempPromocionData = promocionAActivar;
      this.conflictingPromocion = promocionConflicto;
      this.showConflictModal = true;
      
      this.$emit('mostrar-notificacion', {
        mensaje: 'Ya existe una promoción activa para esta categoría en las fechas seleccionadas',
        tipo: 'warning'
      });
    } else {
      // Si no hay conflicto de fechas, activar la promoción
      const response = await solicitudes.patchRegistro(
        `/promocionesC/cambiar-estado-promocion/${promocionId}`,
        { manejo_automatico: true }
      );

      if (response) {
        await this.cargarPromociones();
        this.$emit('mostrar-notificacion', {
          mensaje: 'Promoción activada exitosamente',
          tipo: 'success'
        });
      }
    }
  } catch (error) {
    console.error('Error al activar promoción:', error);
    this.$emit('mostrar-notificacion', {
      mensaje: 'Error al activar la promoción',
      tipo: 'error'
    });
  }
},

// También actualizar el método createAnywayPromocion para mantener la consistencia
async createAnywayPromocion() {
  try {
    console.log('Procesando promoción con conflicto');
    if (this.tempPromocionData) {
      // Primero desactivar la promoción existente
      const desactivarResponse = await solicitudes.patchRegistro(
        `/promocionesC/cambiar-estado-promocion/${this.conflictingPromocion.id}`,
        { manejo_automatico: false }
      );

      if (desactivarResponse) {
        // Luego activar la nueva promoción
        const activarResponse = await solicitudes.patchRegistro(
          `/promocionesC/cambiar-estado-promocion/${this.tempPromocionData.id}`,
          { manejo_automatico: true }
        );

        if (activarResponse) {
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
    }
  } catch (error) {
    console.error('Error al procesar la promoción:', error);
    this.$emit('mostrar-notificacion', {
      mensaje: 'Error al procesar las promociones',
      tipo: 'error'
    });
  }
},

   

 // Método desactivarProm actualizado
async desactivarProm(index) {
  try {
    // Usar filterPromociones en lugar de promociones
    const promocion = this.filterPromociones[index];
    if (!promocion || !promocion.id) {
      throw new Error('Promoción no válida');
    }

    console.log('Desactivando promoción:', promocion.id);
    const response = await solicitudes.patchRegistro(
      `/promocionesC/cambiar-estado-promocion/${promocion.id}`,
      { manejo_automatico: false }
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


    editarPromocion(index) {
  // Usar filterPromociones en lugar de promociones
  const promocion = this.filterPromociones[index];
  
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
  
  // Encontrar el índice real en la lista completa
  this.editIndex = this.promociones.findIndex(p => p.id === promocion.id);
  this.isEditing = true;
  this.showModal();
},

   // Método eliminarProm actualizado
async eliminarProm() {
  try {
    const promocion = this.promociones[this.editIndex];
    console.log('Intentando eliminar promoción:', promocion);
    
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
      if (this.tempPromocionData && this.tempPromocionData.id) {
        // Abrir el modal de edición con los datos de la promoción
        this.promFormModal = {
          id: this.tempPromocionData.id,
          categoria_id: this.tempPromocionData.categoria_id,
          categoria: this.tempPromocionData.categoria?.nombre_categoria || this.tempPromocionData.categoria,
          nombre_promocion: this.tempPromocionData.nombre_promocion,
          porcentaje_descuento: this.tempPromocionData.porcentaje_descuento,
          fecha_inicio: this.tempPromocionData.fecha_inicio,
          fecha_final: this.tempPromocionData.fecha_final,
          estado: this.tempPromocionData.estado
        };
        this.isEditing = true;
        this.showModal();
      }
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

/* Scroll personalizado */
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
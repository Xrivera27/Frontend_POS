<template>
  <div class="encabezado">
    <h1>Promociones de Productos</h1>
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
          <label for="producto">Producto:</label>
          <input 
            type="text" 
            id="input-codigo-producto" 
            name="producto" 
            v-model="promForm.producto" 
            list="productos-list"
            @change="handleProductoSelect(promForm)"
            required 
          />
          <datalist id="productos-list">
            <option v-for="producto in productos" :key="producto.id_producto" :value="producto.nombre">
              {{ producto.nombre }}
            </option>
          </datalist>

          <label for="nombre_promocion">Nombre de la promoción:</label>
          <input type="text" id="nombre_promocion" v-model="promForm.promocion_nombre" name="nombre_promocion"
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
        <button type="submit" class="btn registrar-producto">
          Registrar promoción
        </button>
        <button type="button" class="btn cerrar" @click="activarForm">Cancelar</button>
      </div>
    </form>

    <div class="tabla-busqueda" v-if="!activeForm">
      <div>
        <input class="busqueda" type="text" v-model="searchQuery" placeholder="Buscar promoción..." />
        <button class="btn activar-form" @click="activarForm">Nueva promocion</button>
      </div>
      <div class="table-container" v-pdf-export ref="table">
        <table class="table">
          <thead>
            <tr>
              <th id="numero-promocion">#</th>
              <th>Producto</th>
              <th>Nombre Promocion</th>
              <th id="porcentaje">%</th>
              <th>Fechas inicio</th>
              <th>Fecha final</th>
              <th>Estado</th>
              <th id="opciones">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in filterPromociones" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ p.producto?.nombre || p.producto }}</td>
              <td>{{ p.promocion_nombre }}</td>
              <td>{{ p.porcentaje_descuento }}</td>
              <td>{{ p.fecha_inicio }}</td>
              <td>{{ p.fecha_final }}</td>
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

    <div v-if="isShowModal" class="modal">
      <div class="modal-content">
        <form @submit.prevent="agregarPromocion" autocomplete="off">
          <div class="contenedor-principal">
            <div class="contenedor-interno contenedor-izquierdo">
              <label for="producto">Producto:</label>
              <input 
                type="text" 
                id="input-codigo-producto-modal" 
                name="producto" 
                v-model="promFormModal.producto" 
                list="productos-list-modal"
                @change="handleProductoSelect(promFormModal)"
                required 
              />
              <datalist id="productos-list-modal">
                <option v-for="producto in productos" :key="producto.id_producto" :value="producto.nombre">
                  {{ producto.nombre }}
                </option>
              </datalist>

              <label for="nombre_promocion">Nombre de la promoción:</label>
              <input type="text" id="nombre_promocion" v-model="promFormModal.promocion_nombre" name="nombre_promocion"
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
            <button type="submit" class="btn registrar-producto">
              Guardar cambios
            </button>
            <button type="button" @click="closeModal" class="btn cerrar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar esta promoción?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="eliminarProm(editIndex)">
            Sí, borrar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelDelete">
            No, regresar
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
      isLoading: false,
      error: null,
      productos: [],

      promForm: {
        producto_id: "",
        producto: "",
        promocion_nombre: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,
      },

      promFormModal: {
        producto_id: "",
        producto: "",
        promocion_nombre: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: true,
      },

      promociones: [],
    };
  },

  async mounted() {
    document.title = "Promociones Productos";
    this.changeFavicon('/img/spiderman.ico');
    await Promise.all([
      this.cargarPromociones(),
      this.cargarProductos()
    ]);
  },

  computed: {
    filterPromociones() {
      return this.promociones.filter(
        (promocion) =>
          promocion.promocion_nombre?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (promocion.producto?.nombre || promocion.producto)?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async cargarProductos() {
      try {
        const productosResponse = await solicitudes.fetchRegistros('/promocionesP/productos/empresa');
        this.productos = productosResponse;
        console.log('Productos cargados:', this.productos);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al cargar los productos',
          tipo: 'error'
        });
        if (error.message.includes('No hay token')) {
          this.$router.push('/login');
        }
      }
    },

    handleProductoSelect(form) {
      const productoSeleccionado = this.productos.find(
        p => p.nombre === form.producto
      );
      if (productoSeleccionado) {
        form.producto_id = productoSeleccionado.id_producto;
      } else {
        form.producto_id = "";
      }
    },

    async cargarPromociones() {
      this.isLoading = true;
      this.error = null;
      try {
        const promocionesResponse = await solicitudes.fetchRegistros('/promocionesP/empresa');
        this.promociones = promocionesResponse;
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
        producto_id: "",
        producto: "",
        promocion_nombre: "",
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

        if (!this.isEditing) {
          const response = await solicitudes.postRegistro(
            '/promocionesP/crear-promocion',
            this.promForm
          );

          if (response.length > 0) {
            await this.cargarPromociones();
            this.$emit('mostrar-notificacion', {
              mensaje: 'Promoción creada exitosamente',
              tipo: 'success'
            });
          }
        } else {
          const promocion = this.promociones[this.editIndex];
          const response = await solicitudes.patchRegistro(
            `/promocionesP/actualizar-promocion/${promocion.id_promocion}`,
            this.promFormModal
          );

          if (response) {
            await this.cargarPromociones();
            this.$emit('mostrar-notificacion', {
              mensaje: 'Promoción actualizada exitosamente',
              tipo: 'success'
            });
          }
        }

        this.clearForm();
        this.isShowModal = false;
        this.activeForm = false;
      } catch (error) {
        console.error('Error en agregarPromocion:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al procesar la promoción',
          tipo: 'error'
        });
      }
    },

    validarFormulario() {
      const form = this.isEditing ? this.promFormModal : this.promForm;
      if (!form.producto_id || !form.promocion_nombre || 
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
        ...promocion,
        producto: promocion.producto?.nombre || promocion.producto,
      };
      this.editIndex = index;
      this.isEditing = true;
      this.showModal();
    },

    async desactivarProm(index) {
      try {
        const promocion = this.promociones[index];
        const response = await solicitudes.patchRegistro(
          `/promocionesP/desactivar-promocion/${promocion.id_promocion}`,
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

    async activarProm(index) {
      try {
        const promocion = this.promociones[index];
        const response = await solicitudes.patchRegistro(
          `/promocionesP/desactivar-promocion/${promocion.id_promocion}`,
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
        console.error('Error al activar promoción:', error);
        this.$emit('mostrar-notificacion', {
          mensaje: 'Error al activar la promoción',
          tipo: 'error'
        });
      }
    },

    async eliminarProm(index) {
      try {
        const promocion = this.promociones[index];
        const response = await solicitudes.deleteRegistro(
          `/promocionesP/eliminar-promocion/${promocion.id_promocion}`
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

#btnDesactivar {
  background-color: #198754;  /* Verde para activo */
  color: white;
}

#btnActivar {
  color: white;
  background-color: #6c757d;  /* Gris para inactivo */
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
  background-color: #dc3545;  /* Rojo para eliminar */
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
}

.modalShowConfirm-Si {
  background-color: #dc3545;  /* Rojo para confirmar eliminación */
  color: white;
}

.modalShowConfirm-no {
  background-color: #6c757d;  /* Gris para cancelar */
  color: white;
}

.busqueda {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

/* Estilos para los botones del modal */
.modal-content .btn {
  min-width: 100px;
}

/* Ajustes para el formulario en el modal */
.modal-content form {
  width: 100%;
  margin: 0;
  padding: 20px;
}
</style>
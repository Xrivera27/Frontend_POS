<template>
  <div class="encabezado">
    <h1>Promociones de Categorias</h1>
    <ProfileButton :companyName="'Perdomo y Asociados'" :role="'Gerente'" />
  </div>
  <hr />

  <div class="categorias-wrapper">
    <form @submit.prevent="agregarPromocion" autocomplete="off" v-show="activeForm" >
      <div class="contenedor-titulo">
        <h2 class="titulo-form">Registro de promociones</h2>
      </div>

      <div class="contenedor-principal">
        <div class="contenedor-interno contenedor-izquierdo">
          <label for="categoria">Categoria:</label>
          <input
            type="text"
            id="input-codigo-categoria"
            name="categoria"
            v-model="promForm.categoria"
            required
          />

          <!-- Nombre de la promoción -->
          <label for="nombre_promocion">Nombre de la promoción:</label>
          <input
            type="text"
            id="nombre_promocion"
            v-model="promForm.nombre_promocion"
            name="nombre_promocion"
            required
          />

          <!-- Porcentaje de descuento -->
          <label for="porcentaje_descuento">Porcentaje de descuento:</label>
          <input
            type="number"
            id="porcentaje_descuento"
            name="porcentaje_descuento"
            v-model="promForm.porcentaje_descuento"
            min="0"
            max="100"
            step="0.01"
            required
          />
        </div>
        <!-- Categoria ID -->
        <div class="contenedor-interno contenedor-derecho">
          <label for="fecha_inicio">Fecha de inicio:</label>
          <input
            type="date"
            id="fecha_inicio"
            name="fecha_inicio"
            v-model="promForm.fecha_inicio"
            required
          />

          <!-- Fecha final -->
          <label for="fecha_final">Fecha final:</label>
          <input
            type="date"
            id="fecha_final"
            name="fecha_final"
            v-model="promForm.fecha_final"
            required
          />

          <!-- Enviar el formulario -->
        </div>
      </div>
      <div class="contenedor-boton">
        <button type="submit" class="btn registrar-categoria" @click="activarForm">
          Registrar promoción
        </button>
        <button type="button" class="btn cerrar" @click="activarForm" >Cancelar</button>
      </div>

      <!-- Fecha de inicio -->
    </form>

    <div class="tabla-busqueda" v-if="!activeForm">
      <div>
        <input
          class="busqueda"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar promoción..."
        />
        <button class="btn activar-form" @click="activarForm" >Nueva promocion</button>
      </div>
      <div class="table-container" v-pdf-export ref="table" >
        <table class="table">
          <thead>
            <tr>
              <th id="numero-promocion">#</th>
              <th>Categoria</th>
              <th>Nombre Promocion</th>
              <th id="porcentaje" >%</th>
              <th>Fechas inicio</th>
              <th>Fecha final</th>
              <th>Estado</th>
              <th id="opciones" >Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, index) in filterPromociones" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ p.categoria }}</td>
              <td>{{ p.nombre_promocion }}</td>
              <td>{{ p.porcentaje_descuento }}</td>
              <td>{{ p.fecha_inicio }}</td>
              <td>{{ p.fecha_final }}</td>
              <td>{{ p.estado }}</td>
              <td class="td-botones" >
                <button
                  id="btnEditar"
                  class="btn btn-warning"
                  @click="editarPromocion(index)"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                v-if="p.estado === 'active'"
                  id="btnDesactivar"
                  class="btn btn-danger"
                  @click="desactivarProm(index)"
                >
                  <b><i class="bi bi-check"></i></b>
                </button>
                <button
                  v-if="p.estado === 'inactive'"
                  id="btnActivar"
                  class="btn btn-danger"
                  @click="activarProm(index)"
                >
                  <b><i class="bi bi-x"></i></b>
                </button>
                <button
                  id="btnEliminar"
                  class="btn btn-danger"
                  @click="eliminarProm(index)"
                >
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
              <label for="categoria">Categoria:</label>
              <input
                type="text"
                id="input-codigo-categoria"
                name="categoria"
                v-model="promFormModal.categoria"
                required
              />

              <!-- Nombre de la promoción -->
              <label for="nombre_promocion">Nombre de la promoción:</label>
              <input
                type="text"
                id="nombre_promocion"
                v-model="promFormModal.nombre_promocion"
                name="nombre_promocion"
                required
              />

              <!-- Porcentaje de descuento -->
              <label for="porcentaje_descuento">Porcentaje de descuento:</label>
              <input
                type="number"
                id="porcentaje_descuento"
                name="porcentaje_descuento"
                v-model="promFormModal.porcentaje_descuento"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
            <!-- Categoria ID -->
            <div class="contenedor-interno contenedor-derecho">
              <label for="fecha_inicio">Fecha de inicio:</label>
              <input
                type="date"
                id="fecha_inicio"
                name="fecha_inicio"
                v-model="promFormModal.fecha_inicio"
                required
              />

              <!-- Fecha final -->
              <label for="fecha_final">Fecha final:</label>
              <input
                type="date"
                id="fecha_final"
                name="fecha_final"
                v-model="promFormModal.fecha_final"
                required
              />

              <!-- Enviar el formulario -->
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

          <!-- Fecha de inicio -->
        </form>
      </div>
    </div>
    <div class="modal" v-if="showConfirmModal">
      <div class="modal-content">
        <h2>Confirmación</h2>
        <p>¿Estás seguro de que quieres eliminar esta promoción?</p>
        <div class="modal-actions">
          <button class="btn modalShowConfirm-Si" @click="confirmCancel">
            Sí, borrar
          </button>
          <button class="btn modalShowConfirm-no" @click="cancelCancel">
            No, regresar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import ProfileButton from "../components/ProfileButton.vue";
//import ExportButton from '../components/ExportButton.vue';

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

      promForm: {
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: "active",
      },

      promFormModal: {
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
        estado: "active",
      },

      promociones: [
      {
    categoria: "Camisetas",
    nombre_promocion: "Descuento de Verano",
    porcentaje_descuento: 15,
    fecha_inicio: "2024-06-01",
    fecha_final: "2024-06-30",
    estado: "active"
  },
  {
    categoria: "Pantalones",
    nombre_promocion: "Ofertas de Primavera",
    porcentaje_descuento: 10,
    fecha_inicio: "2024-03-15",
    fecha_final: "2024-04-15",
    estado: "inactive"
  },
  {
    categoria: "Zapatillas",
    nombre_promocion: "Descuento de Fin de Año",
    porcentaje_descuento: 20,
    fecha_inicio: "2024-12-01",
    fecha_final: "2024-12-31",
    estado: "active"
  },
  {
    categoria: "Chaquetas",
    nombre_promocion: "Promoción de Otoño",
    porcentaje_descuento: 25,
    fecha_inicio: "2024-09-01",
    fecha_final: "2024-10-15",
    estado: "inactive"
  },
  {
    categoria: "Gafas",
    nombre_promocion: "Descuento de Black Friday",
    porcentaje_descuento: 30,
    fecha_inicio: "2024-11-25",
    fecha_final: "2024-11-29",
    estado: "active"
  },
  {
    categoria: "Relojes",
    nombre_promocion: "Ofertas de Navidad",
    porcentaje_descuento: 20,
    fecha_inicio: "2024-12-15",
    fecha_final: "2024-12-25",
    estado: "inactive"
  },
  {
    categoria: "Bolsos",
    nombre_promocion: "Descuento de Año Nuevo",
    porcentaje_descuento: 15,
    fecha_inicio: "2024-12-26",
    fecha_final: "2025-01-10",
    estado: "active"
  },
  {
    categoria: "Camisas",
    nombre_promocion: "Promoción de Rebajas",
    porcentaje_descuento: 10,
    fecha_inicio: "2024-01-10",
    fecha_final: "2024-02-10",
    estado: "inactive"
  },
  {
    categoria: "PantalonesCortos",
    nombre_promocion: "Descuento de Primavera",
    porcentaje_descuento: 20,
    fecha_inicio: "2024-03-01",
    fecha_final: "2024-03-31",
    estado: "active"
  },
  {
    categoria: "Bufandas",
    nombre_promocion: "Ofertas de Verano",
    porcentaje_descuento: 18,
    fecha_inicio: "2024-07-01",
    fecha_final: "2024-08-15",
    estado: "inactive"
  },
      ],
    };
  },
  computed: {
    filterPromociones() {
      return this.promociones.filter(
        (promocion) =>
          promocion.nombre_promocion
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          promocion.categoria
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    activarForm(){
      
      if ( this.activeForm ){ this.activeForm = false; }
      else { this.activeForm = true; }
      
    },
    clearForm() {
      this.promForm = {
        categoria: "",
        nombre_promocion: "",
        porcentaje_descuento: "",
        fecha_inicio: "",
        fecha_final: "",
      };
      this.isEditing = false;
      this.editIndex = null;
    },

    agregarPromocion() {
      if (!this.isEditing) {
        this.promForm.estado = 'active';
        this.promociones.push(this.promForm);
      } else {
        this.promociones[this.editIndex] = { ...this.promFormModal };
        this.isShowModal = false;
      }
      this.clearForm();
      this.isShowModal = false;
    },

    editarPromocion(index) {
      this.promFormModal = {
        ...this.promociones[index],
      };
      this.editIndex = index;
      this.isEditing = true;
      this.showModal();
    },

    desactivarProm(index){
      if ( this.promociones[index].estado === 'active' ){
        this.promociones[index].estado = 'inactive';
      }
    },
    activarProm(index){
      if ( this.promociones[index].estado === 'inactive' ){
        this.promociones[index].estado = 'active';
      }
    },

    eliminarProm(index){
      this.editIndex = index;
        this.showConfirmModal = true;
    },

    showModal() {
      this.isShowModal = true;
    },

    closeModal() {
      this.isShowModal = false;
    },
    confirmCancel() {
      this.promociones.splice(this.editIndex, 1);
      this.showConfirmModal = false;
    },
    cancelCancel() {
      this.showConfirmModal = false;
    },
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
}

.btn-warning {
  background-color: #ffc107;
  color: black;
}



#btnDesactivar {
  background-color: #7e7e7e;
  color: white;
}

.contenedor-principal input {
  margin-bottom: 4%;
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
  overflow: hidden;
  border: 1px solid #ddd;
  margin-top: 16px;
}

.registrar-categoria,
.cerrar {
  background-color: #c9c7c7;
}

.registrar-categoria:hover,
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

#btnActivar{
  color: white;
  background-color: rgb(141, 141, 141);
}

#opciones{
  width: 160px;
}

#btnDesactivar{
  
  background-color: rgb(24, 233, 24);
  color: white;
}

#btnEliminar{
  background-color: rgb(235, 23, 23);
  color: white;
}

.td-botones{
  display: flex;
  align-items: center;
  justify-content: center;
}

#btnDesactivar, #btnActivar{
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
</style>

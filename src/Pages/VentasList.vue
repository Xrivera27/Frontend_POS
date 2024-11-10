<template>
  <div class="wrapper">
    <div class="main-container">
      <div class="header-container">
        <!-- Aquí estaba el error, había un div y template anidados innecesariamente -->
        <div class="tipo-cliente">
          <label for="tipo-cliente">Cliente:</label>
          <div class="input-button-container">
            <div class="inputs-container">
              <!-- Si no hay cliente seleccionado, muestra solo "Consumidor final" -->
              <template v-if="!clienteSeleccionado">
                <input type="text" value="Consumidor final" readonly class="cliente-input single">
              </template>
              <!-- Si hay cliente seleccionado, muestra nombre y RTN -->
              <template v-else>
                <input type="text" :value="clienteSeleccionado.nombre" readonly class="cliente-input">
                <input type="text" :value="clienteSeleccionado.rtn" readonly class="rtn-input">
              </template>
            </div>
            <button class="search-button" @click="openModal">
              Buscar
            </button>
            <ClienteModal :isVisible="isModalVisible" @close="closeModal" @client-selected="handleClientSelected" />
          </div>
        </div>

        <div class="informacion-1">
          <label for="sucursal">Sucursal: {{  info.nombreSucursal  }}</label>
          <br />
          <label for="usuario">Usuario: {{  info.nombre_usuario  }}</label>
        </div>

        <div class="informacion-2">
          <label for="numTicket">Ticket No: <span>{{ numTicket }}</span></label>
          <br />
          <label>Fecha: <span>{{ info.fecha }}</span></label>
        </div>
      </div>

      <div class="column-container">
        <div class="table-container">
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th class="col-item">Item</th>
                  <th class="col-codigo">Código</th>
                  <th class="col-descripcion">Descripción</th>
                  <th class="col-cantidad">Cantidad</th>
                  <th class="col-precio">Precio</th>
                  <th class="col-importe">Importe</th>
                </tr>
              </thead>
              <tbody>
                <!-- Productos reales -->
                <tr v-for="(producto, index) in productosLista" :key="index" @dblclick="handleRowDoubleClick(producto)"
                  :class="{ 'selected': selectedItem === producto }">
                  <td class="col-item">{{ index + 1 }}</td>
                  <td class="col-codigo">{{ producto.codigo_producto }}</td>
                  <td class="col-descripcion">{{ producto.nombre }}</td>
                  <td class="col-cantidad">{{ producto.cantidad }}</td>
                  <td class="col-precio">{{ producto.precioImpuesto }}</td>
                  <td class="col-importe">{{ producto.precioImpuesto * producto.cantidad }}</td>
                </tr>
                <!-- Filas vacías para llenar el espacio -->
                <tr v-for="n in remainingRows" :key="`empty-${n}`" class="empty-row">
                  <td class="col-item">&nbsp;</td>
                  <td class="col-codigo">&nbsp;</td>
                  <td class="col-descripcion">&nbsp;</td>
                  <td class="col-cantidad">&nbsp;</td>
                  <td class="col-precio">&nbsp;</td>
                  <td class="col-importe">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total-container">
            <div class="cantidad-input">
              <label for="cantidad">Cant:</label>
              <input id="cantidad" type="number" v-model="totalCantidad" readonly />
            </div>
            <div class="total-input">
              <label for="total">S/:</label>
              <label class="subTotal" id="total">{{ calcularTotal }}</label>
            </div>
          </div>
        </div>

        <!-- Teclado numérico -->
        <div class="numeric-keypad">
          <div class="scanner-input">
            <input name="codigo-producto" ref="codigoRef" type="text" class="campo" v-model="addQuery" tabindex="1"
              :disabled="isModalFocused || isModalVisible" required />
          </div>
          <div class="keypad">
            <button @click="agregarNumero(1)">1</button>
            <button @click="agregarNumero(2)">2</button>
            <button @click="agregarNumero(3)">3</button>
            <button @click="agregarNumero(4)">4</button>
            <button @click="agregarNumero(5)">5</button>
            <button @click="agregarNumero(6)">6</button>
            <button @click="agregarNumero(7)">7</button>
            <button @click="agregarNumero(8)">8</button>
            <button @click="agregarNumero(9)">9</button>
            <button @click="agregarNumero(0)">0</button>
            <button @click="agregarNumero('.')">.</button>
            <button @click="agregarNumero('*')">*</button>
            <button class="borrar" @click="borrarUltimo">←</button>
            <button class="limpiar" @click="limpiar">Limpiar</button>
            <button class="enter" @click="procesarEnter">Enter</button>
          </div>
        </div>
      </div>

      <div class="footer-container">
        <button @click="buscarProducto">Buscar producto [F2]</button>
        <button @click="openModal">Buscar cliente [F3]</button>
        <button @click="consultarAnular">Consultar anular [F4]</button>
        <button @click="eliminarItem">Eliminar item [F5]</button>
        <EliminarItemsModal :isVisible="isEliminarModalVisible" :item="selectedItem" @close="closeEliminarModal"
          @confirm-delete="handleItemDelete" @modal-focused="handleModalFocus" />
        <button @click="limpiarPantalla">Limpiar pantalla [F6]</button>
        <button @click="guardarVenta">Guardar venta [F8]</button>
        <button @click="recVenta">Rec. Venta [F9]</button>
        <button @click="descuentoGeneral">Dscto. Gen. [F10]</button>
        <button @click="descuentoIndividual">Dscto. Ind. [F11]</button>
        <button @click="openPagoModal">Registrar Pago [F12]</button>
        <RegistrarPagoModal :isVisible="isPagoModalVisible" @close="closePagoModal" @modal-focused="handleModalFocus" />
        <button @click="nuevoCliente">Nuevo Cliente [ALT] + [C]</button>
        <button @click="salir">Salir [ALT] + [S]</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ClienteModal from '../components/modalesCrearVenta/ClienteModal.vue';
import RegistrarPagoModal from '../components/modalesCrearVenta/RegistrarPagoModal.vue';
import EliminarItemsModal from '../components/modalesCrearVenta/EliminarItemsModal.vue';
import { useToast } from "vue-toastification";
import { notificaciones } from '../../services/notificaciones.js';

import solicitudes from "../../services/solicitudes.js";
import { getInfoBasic, getProductos, agregarProductoCodigo } from '../../services/ventasSolicitudes.js';

export default {
  components: {
    ClienteModal,
    RegistrarPagoModal,
    EliminarItemsModal
  },
  data() {
    return {
      minRows: 15,
      numTicket: '000-001-01-00000001',
      fecha: new Date().toLocaleDateString(),
      addQuery: "",
      id_usuario: 0,
      info: '',
      isEditing: false,
      isModalVisible: false,
      isPagoModalVisible: false,
      isAnyModalOpen: false,
      clienteSeleccionado: null,
      selectedItem: null,
      isEliminarModalVisible: false,
      isModalFocused: false,
      productos: [],
      productosLista: [],
    };
  },

  watch: {
    // Observadores para mantener sincronizado el estado de los modales
    isModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isPagoModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    },
    isPagoModalVisible(newVal) {
      this.isAnyModalOpen = newVal;
      if (newVal) {
        this.isModalVisible = false;
        this.pauseMainKeyboardEvents();
      } else {
        this.resumeMainKeyboardEvents();
      }
    }
  },

  computed: {
    calcularTotal() {
      return this.productosLista.reduce((total, p) => total + (p.precioImpuesto * p.cantidad), 0);
    }
  },

  remainingRows() {
    return Math.max(0, this.minRows - this.productosLista.length);
  },

  methods: {
    async salir() {
      this.logout();
    },

    handleModalFocus(isFocused) {
      this.isModalFocused = isFocused;
    },

    handleRowDoubleClick(item) {
      this.selectedItem = item;
    },

    eliminarItem() {
      if (!this.selectedItem) {
        const toast = useToast();
        toast.warning("Seleccione un item para eliminar");
        return;
      }
      this.isEliminarModalVisible = true;
    },

    handleItemDelete(item) {
      const index = this.productosLista.findIndex(p => p === item);
      if (index !== -1) {
        this.productosLista.splice(index, 1);
        this.selectedItem = null;
        const toast = useToast();
        toast.success("Item eliminado correctamente");
      }
    },

    closeEliminarModal() {
      this.isEliminarModalVisible = false;
    },

    async logout() {
      try {
        await axios.post('/api/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth')}`
          }
        });

        localStorage.clear();
        this.$router.push('/login');
      } catch (error) {
        console.error("Error al cerrar sesión", error);
        localStorage.clear();
        this.$router.push('/login');
      }
    },

    handleClientSelected(client) {
      this.clienteSeleccionado = client;
      this.closeModal();
    },

    openModal() {
      // const toast = useToast();
      // toast.info("Modal abierto");
      this.isModalVisible = true;
      this.$nextTick(() => {
        const modalElement = document.querySelector('.modal-content');
        if (modalElement) {
          modalElement.focus();
        }
      });
    },

    closeModal() {
      // const toast = useToast();
      // toast.info("Modal cerrado");
      this.isModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    openPagoModal() {
      this.isPagoModalVisible = true;
      this.$nextTick(() => {
        const pagoModalElement = document.querySelector('.modal-content');
        if (pagoModalElement) {
          pagoModalElement.focus();
        }
      });
      // const toast = useToast();
      // toast.info("Modal abierto");
    },

    closePagoModal() {
      // const toast = useToast();
      // toast.info("Modal cerrado");
      this.isPagoModalVisible = false;
      this.$nextTick(() => {
        this.$refs.codigoRef?.focus();
      });
    },

    pauseMainKeyboardEvents() {
      window.removeEventListener("keydown", this.handleKeyPress);
    },

    resumeMainKeyboardEvents() {
      if (!this.isAnyModalOpen) {
        window.addEventListener("keydown", this.handleKeyPress);
      }
    },

    handleKeyPress(event) {
      if (this.isAnyModalOpen || this.isModalFocused) {
        return;
      }

      const key = event.key;

      // Cancela la acción predeterminada si se presiona una tecla específica
      if (key === "F3" || key === "F12" || key === "F4" || key === "F5" || key === "F6" || key === "F8" || key === "F9" || key === "F10" || key === "F11") {
        event.preventDefault();
      }

      // const toast = useToast();

      if (!isNaN(key) || key === '.') {
        event.preventDefault();
        this.agregarNumero(key);
      } else if (key === "Backspace") {
        event.preventDefault();
        this.borrarUltimo();
      } else if (key === "Enter") {
        event.preventDefault();
        this.procesarEnter();
      } else if (event.altKey && key === "s") {
        event.preventDefault();
        this.logout();
      } else if (key === "F3") {
        event.preventDefault();
        this.openModal();
      } else if (key === "F12") {
        event.preventDefault();
        this.openPagoModal();
      } else if (key === "F5") {
        event.preventDefault();
        this.eliminarItem();
      }
    },

    agregarNumero(num) {
      this.addQuery += num.toString();
    },

    borrarUltimo() {
      if (this.addQuery.length > 0) {
        this.addQuery = this.addQuery.slice(0, -1);
      }
    },

    limpiar() {
      this.addQuery = "";
    },

    procesarEnter() {
      this.agregarProducto();
    },

   async agregarProducto() {
    let nuevaCantidad;
    let reducirInventario;
    const codigoValidar = this.addQuery;
      if (!codigoValidar) {
        const toast = useToast();
        toast.warning("Ingresa un código");
        return;
      }

      try {
        this.limpiar();
      const newProduct = this.productos.find((p) => p.codigo_producto === codigoValidar);
      if (!newProduct) {
        const toast = useToast();
        toast.warning("No existe el producto");

        return;
      }

      const existingProduct = this.productosLista.find((p) => p.codigo_producto === codigoValidar);
      if (existingProduct) {
        existingProduct.cantidad += 1;
        nuevaCantidad = 1;

         reducirInventario = await agregarProductoCodigo(nuevaCantidad, existingProduct.codigo_producto, this.id_usuario);
         
      } else {
        newProduct.cantidad = 1;
        nuevaCantidad = 1;
        this.productosLista.push({ ...newProduct });

         reducirInventario = await agregarProductoCodigo(nuevaCantidad, newProduct.codigo_producto, this.id_usuario);
      }
      console.log(reducirInventario);
      
      } catch (error) {
        console.log(error);
        notificaciones('error', error.message);
      }

      
    },

    

    pushEsc(event) {
      if (event.key === "Esc" || event.key === "Escape") {
        if (this.isEditing) {
          this.isEditing = false;
          this.reiniciarInputs();
          return;
        }
        this.cancelarVenta();
      }
    },
    pushDelete(event) {
      const target = event.target;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (!isInputField && event.key === "Backspace") {
        this.deleteUltimo();
      }
    },

    handleInputChange(event) {
      this.addQuery = event.target.value;
    },

    changeFavicon(iconPath) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = iconPath;
      document.getElementsByTagName('head')[0].appendChild(link);
    },

    toggleEditingMode() {
      this.isEditing = !this.isEditing;
    },

    showInfo() {
      console.log("Información o estadísticas mostradas.");
    }
  },

 async mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
    document.title = "Crear Ventas";
    this.changeFavicon('/img/spiderman.ico');

    try {
    this.id_usuario = await solicitudes.solicitarUsuarioToken();
    this.info = await getInfoBasic(this.id_usuario);
    this.productos = await getProductos(this.id_usuario);
    } catch (error) {
      notificaciones('error', error.message);
    }

  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");

* {
  font-family: "Montserrat", sans-serif;
}

/* Layout Principal */
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  z-index: 1;
}

.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  z-index: 1;
  margin: 0;
}

/* Header */
.header-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  gap: 150px;
  z-index: 1;
}

/* Cliente Input Section */
.tipo-cliente {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-button-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.inputs-container {
  display: flex;
  flex-direction: row;
  gap: 5px;
  width: 100%;
}

.cliente-input,
.rtn-input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  height: 30px;
  font-size: 14px;
}

.cliente-input {
  flex: 2;
}

.rtn-input {
  flex: 1;
  font-size: 0.9em;
  color: #666;
}

.cliente-input.single {
  flex: 1;
  width: 100%;
}

.search-button {
  height: 30px;
  width: 100%;
  padding: 0 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 14px;
}

.search-button:hover {
  background-color: #e0e0e0;
}

/* Información Section */
.informacion-1,
.informacion-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}

/* Column Container y Tabla */
.column-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 250px);
  margin-bottom: 10px;
  z-index: 1;
}

.table-container {
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Updated table styles for fixed header */
.table-wrapper {
  flex-grow: 1;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  /* Prevent wrapper scroll */
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

/* Fixed header styles */
.table thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table thead tr {
  width: 100%;
}

.table tbody {
  display: block;
  overflow-y: scroll;
  /* Cambiado de auto a scroll para forzar la barra */
  width: 100%;
  /* Altura fija para garantizar el scroll */
  height: 400px;
  /* Puedes ajustar este valor según necesites */
  max-height: calc(100vh - 350px);
  /* Altura máxima relativa a la ventana */
}

.table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

/* Columnas de la tabla */
.col-item {
  width: 10%;
}

.col-codigo {
  width: 20%;
}

.col-descripcion {
  width: 40%;
}

.col-cantidad {
  width: 10%;
}

.col-precio {
  width: 10%;
}

.col-importe {
  width: 10%;
}

/* Estilos de la tabla */
th {
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  padding: 10px;
  text-align: left;
  font-weight: 600;
}


td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.empty-row td {
  border-bottom: none;
  height: 41px;
  /* Match the height of regular rows */
}

.table tbody tr:not(.empty-row):hover {
  background-color: #f8f9fa;
}

/* Updated Total Container styles */
.total-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-top: none;
}

.cantidad-input,
.total-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cantidad-input input {
  width: 120px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Teclado Numérico */
.numeric-keypad {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-left: 1px solid #ccc;
  z-index: 1;
}

.scanner-input {
  margin-bottom: 10px;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* Botones Generales */
button {
  width: 100%;
  height: 40px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
  align-self: flex-end;
}

button:hover {
  background-color: #ccc;
}

/* Footer */
.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 5px;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  z-index: 2;
}

.footer-container button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subTotal {
  font-size: 250%;
  font-weight: bold;
  margin-top: 0%;
  margin-bottom: 0%;
}

.selected {
  background-color: #63b4ff !important;
}

.table tbody tr.selected:hover {
  background-color: #d1e8ff !important;
}
</style>
